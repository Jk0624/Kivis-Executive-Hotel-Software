import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";
import { AuthProvider, Gender, OrderStatus } from "../../../generated/prisma/enums.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../../utils/tokens.js";
import {
  RiderRegisterBody,
  RiderLoginBody,
  RiderRefreshTokenBody,
  RiderUpdateProfileBody,
  RiderChangePasswordBody,
  RiderUpdateStatusBody,
  RiderDeleteAccountBody,
  RIDER_SELECT,
} from "./auth.types.js";
import {
  isValidEmail,
  isValidPhone,
  isValidPassword,
  normalizePhone,
  parseDob,
} from "../../../utils/validators.js";
import { hashPassword, comparePassword } from "../../../utils/password.js";
import { checkRiderAvailability } from "../../../utils/rider.utils.js";
import { createRiderNotification } from "../notification/notification.service.js";
import { RiderAuthRequest } from "../../../middleware/riders/riderAuth.middleware.js";
import {
  sendEmailVerificationCode,
  sendPhoneVerificationCode,
  validateVerificationCode,
  type OtpChannel,
} from "../../../utils/verification.service.js";
import {
  trackVerificationAttempt,
  resetVerificationAttempts,
} from "../../../utils/verificationAttempts.js";
import { sendPasswordResetCode, validateAndConsumeResetCode } from "../../../utils/password-reset.service.js";

const RIDER_DELETION_MESSAGE =
  "Your account will be deleted soon. Please contact support if this was a mistake.";

function formatRiderResponse(rider: any) {
  return {
    ...rider,
    id: rider.id.toString(),
    vehicleInfo: rider.vehicleInfo
      ? (() => {
          const { idFrontKey, idBackKey, ...rest } = rider.vehicleInfo;
          return {
            ...rest,
            id: rider.vehicleInfo.id.toString(),
            hasIdFront: !!idFrontKey,
            hasIdBack: !!idBackKey,
          };
        })()
      : null,
    paymentDetails: rider.paymentDetails?.map((p: any) => ({
      ...p,
      id: p.id.toString(),
    })),
  };
}

export const registerRider = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      gender,
      nationality,
      dob,
    }: RiderRegisterBody = req.body;

    if (!firstName || !lastName || !email || !phone || !password || !dob) {
      res.status(400).json({
        success: false,
        message:
          "Missing required fields: firstName, lastName, email, phone, password, and dob are required",
      });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ success: false, message: "Invalid email format" });
      return;
    }

    if (!isValidPhone(phone)) {
      res.status(400).json({ success: false, message: "Invalid phone format" });
      return;
    }

    if (!isValidPassword(password)) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
      return;
    }

    const dobDate = dob ? parseDob(dob) : undefined;
    if (dob && !dobDate) {
      res
        .status(400)
        .json({ success: false, message: "Invalid date of birth format" });
      return;
    }

    try {
      const availability = await checkRiderAvailability({ email, phone });
      if (!availability.available) {
        res.status(409).json({
          success: false,
          message: availability.message,
        });
        return;
      }
    } catch (error: any) {
      console.error("Database query error:", error.message);
      res.status(500).json({
        success: false,
        message:
          "An error occurred while processing your request. Please try again.",
      });
      return;
    }

    try {
      const hashedPassword = await hashPassword(password);

      const rider = await prisma.rider.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          password: hashedPassword,
          authProvider: AuthProvider.EMAIL,
          gender: (gender as Gender) || null,
          nationality: nationality || null,
          dob: dobDate || null,
          isPersonalInfoComplete: false,
        },
        select: RIDER_SELECT,
      });

      const accessToken = generateAccessToken(rider.id, "rider");
      const refreshToken = generateRefreshToken(rider.id, "rider");

      res.status(201).json({
        success: true,
        message: "Rider registered successfully",
        data: {
          rider: formatRiderResponse(rider),
          tokens: { accessToken, refreshToken },
        },
      });
    } catch (error: any) {
      console.error("Database error creating rider:", error.message);
      res.status(500).json({
        success: false,
        message: "An internal server error occurred. Please try again.",
      });
      return;
    }
  },
);

export const loginRider = asyncHandler(async (req: Request, res: Response) => {
  const { identifier, password }: RiderLoginBody = req.body;

  if (!identifier || !password) {
    res.status(400).json({
      success: false,
      message: "Email/phone and password are required",
    });
    return;
  }

  const isEmail = isValidEmail(identifier);
  const isPhone = isValidPhone(identifier);

  if (!isEmail && !isPhone) {
    res.status(400).json({
      success: false,
      message: "Please provide a valid email or phone number",
    });
    return;
  }

  try {
    const rider = await prisma.rider.findUnique({
      where: isEmail
        ? { email: identifier }
        : { phone: normalizePhone(identifier) },
      select: { ...RIDER_SELECT, password: true },
    });

    if (!rider) {
      res.status(404).json({
        success: false,
        message:
          "We couldn't find an account with this " +
          (isEmail ? "email" : "phone number") +
          ". Would you like to create one?",
      });
      return;
    }

    if (!rider.password) {
      res.status(400).json({
        success: false,
        message:
          "This account was created with social login. Please use Google to sign in.",
      });
      return;
    }

    const isPasswordValid = await comparePassword(password, rider.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid password. Please try again.",
      });
      return;
    }

    if (rider.deletionRequestedAt) {
      res.status(403).json({
        success: false,
        message: RIDER_DELETION_MESSAGE,
      });
      return;
    }

    if (!rider.isActive) {
      res.status(403).json({
        success: false,
        message: "Your account has been suspended. Please contact support.",
      });
      return;
    }

    const accessToken = generateAccessToken(rider.id, "rider");
    const refreshToken = generateRefreshToken(rider.id, "rider");

    const { password: _, ...riderWithoutPassword } = rider;

    // Send welcome-back notification (fire-and-forget)
    createRiderNotification({
      riderId: rider.id.toString(),
      title: "Welcome Back!",
      message: `Hi ${rider.firstName}, you've successfully logged in.`,
      type: "login",
    }).catch((err) => console.error("Failed to create login notification:", err));

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        rider: formatRiderResponse(riderWithoutPassword),
        tokens: { accessToken, refreshToken },
      },
    });
  } catch (error: any) {
    console.error("Login error:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred during login. Please try again.",
    });
    return;
  }
});

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken: token }: RiderRefreshTokenBody = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
      return;
    }

    try {
      const decoded = verifyRefreshToken(token) as {
        id: string;
        type?: string;
      };

      if (decoded.type !== "rider") {
        res.status(401).json({
          success: false,
          message: "Invalid token type. Please login again.",
        });
        return;
      }

      const riderId = BigInt(decoded.id);

      const rider = await prisma.rider.findUnique({
        where: { id: riderId },
      });

      if (!rider) {
        res.status(401).json({
          success: false,
          message: "Rider not found. Please login again.",
        });
        return;
      }

      if (rider.deletionRequestedAt) {
        res.status(401).json({
          success: false,
          message: RIDER_DELETION_MESSAGE,
        });
        return;
      }

      if (!rider.isActive) {
        res.status(401).json({
          success: false,
          message: "Your account has been suspended. Please contact support.",
        });
        return;
      }

      const newAccessToken = generateAccessToken(rider.id, "rider");
      const newRefreshToken = generateRefreshToken(rider.id, "rider");

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          tokens: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          },
        },
      });
    } catch (error: any) {
      console.error("Token refresh error:", error.message);
      res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token. Please login again.",
      });
      return;
    }
  },
);

export const updateProfile = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const rider = req.rider;
    if (!rider) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const {
      firstName,
      lastName,
      gender,
      nationality,
      dob,
    }: RiderUpdateProfileBody = req.body;

    if (!dob) {
      res.status(400).json({ success: false, message: "Date of birth is required" });
      return;
    }

    const dobDate = parseDob(dob);
    if (!dobDate) {
      res
        .status(400)
        .json({ success: false, message: "Invalid date of birth format" });
      return;
    }

    try {
      const updateData: Record<string, unknown> = {};
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (gender) updateData.gender = gender as Gender;
      if (nationality) updateData.nationality = nationality;
      if (dobDate) updateData.dob = dobDate;

      const mergedFirstName = firstName || rider.firstName;
      const mergedLastName = lastName || rider.lastName;
      const mergedGender = gender || rider.gender;
      const mergedNationality = nationality || rider.nationality;
      const mergedDob = dobDate || rider.dob;

      const isPersonalComplete =
        !!mergedFirstName &&
        !!mergedLastName &&
        !!mergedGender &&
        !!mergedNationality &&
        !!mergedDob &&
        !!rider.phone &&
        !!rider.email &&
        !!rider.emailVerifiedAt;

      if (isPersonalComplete) {
        updateData.isPersonalInfoComplete = true;
      }

      const updatedRider = await prisma.rider.update({
        where: { id: rider.id },
        data: updateData,
        select: RIDER_SELECT,
      });

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: formatRiderResponse(updatedRider),
      });
    } catch (error: any) {
      console.error("Profile update error:", error.message);
      res.status(500).json({
        success: false,
        message: "An error occurred while updating your profile.",
      });
    }
  },
);

export const updateStatus = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const rider = req.rider;
    if (!rider) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { isOnline }: RiderUpdateStatusBody = req.body;

    if (typeof isOnline !== "boolean") {
      res.status(400).json({
        success: false,
        message: "isOnline must be a boolean",
      });
      return;
    }

    try {
      const updatedRider = await prisma.rider.update({
        where: { id: rider.id },
        data: { isOnline },
        select: RIDER_SELECT,
      });

      res.status(200).json({
        success: true,
        message: "Status updated successfully",
        data: formatRiderResponse(updatedRider),
      });
    } catch (error: any) {
      console.error("Status update error:", error.message);
      res.status(500).json({
        success: false,
        message: "An error occurred while updating your status.",
      });
    }
  },
);

export const changePassword = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const rider = req.rider;
    if (!rider) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { currentPassword, newPassword }: RiderChangePasswordBody = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
      return;
    }

    if (!isValidPassword(newPassword)) {
      res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
      return;
    }

    try {
      const riderWithPassword = await prisma.rider.findUnique({
        where: { id: rider.id },
        select: { password: true },
      });

      if (!riderWithPassword?.password) {
        res.status(400).json({
          success: false,
          message:
            "This account was created with social login. Password change is not available.",
        });
        return;
      }

      const isCurrentValid = await comparePassword(
        currentPassword,
        riderWithPassword.password,
      );
      if (!isCurrentValid) {
        res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
        return;
      }

      const hashedNew = await hashPassword(newPassword);
      await prisma.rider.update({
        where: { id: rider.id },
        data: { password: hashedNew },
      });

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
        data: { message: "Password changed successfully" },
      });
    } catch (error: any) {
      console.error("Change password error:", error.message);
      res.status(500).json({
        success: false,
        message: "An error occurred while changing your password.",
      });
    }
  },
);

export const getProfile = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const rider = req.rider;
    if (!rider) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    try {
      const currentRider = await prisma.rider.findUnique({
        where: { id: rider.id },
        select: RIDER_SELECT,
      });

      if (!currentRider) {
        res.status(404).json({ success: false, message: "Rider not found" });
        return;
      }

      res.status(200).json({
        success: true,
        data: formatRiderResponse(currentRider),
      });
    } catch (error: any) {
      console.error("Get profile error:", error.message);
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching your profile.",
      });
    }
  },
);

export const sendRiderEmailCode = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const rider = req.rider;
    if (!rider) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (!rider.email) {
      res
        .status(400)
        .json({ success: false, message: "No email address on file" });
      return;
    }

    try {
      await sendEmailVerificationCode(rider.email, {
        userName: rider.firstName,
      });

      res.status(200).json({
        success: true,
        message: "Verification code sent to your email",
      });
    } catch (error: any) {
      console.error("Error in sendRiderEmailCode:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send verification code. Please try again.",
      });
    }
  },
);

export const verifyRiderEmailCode = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const rider = req.rider;
    if (!rider) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (!rider.email) {
      res
        .status(400)
        .json({ success: false, message: "No email address on file" });
      return;
    }

    const { code } = req.body;
    const result = await validateVerificationCode(rider.email, code);

    if (!result.valid) {
      res.status(400).json({ success: false, message: result.message });
      return;
    }

    try {
      const isPersonalComplete =
        !!rider.firstName &&
        !!rider.lastName &&
        !!rider.gender &&
        !!rider.nationality &&
        !!rider.dob &&
        !!rider.phone &&
        !!rider.email;

      const updatedRider = await prisma.rider.update({
        where: { id: rider.id },
        data: {
          emailVerifiedAt: new Date(),
          ...(isPersonalComplete && { isPersonalInfoComplete: true }),
        },
        select: RIDER_SELECT,
      });

      res.status(200).json({
        success: true,
        message: "Email verified successfully",
        data: formatRiderResponse(updatedRider),
      });
    } catch (error: any) {
      console.error("Error in verifyRiderEmailCode:", error);
      res.status(500).json({
        success: false,
        message: "An internal server error occurred. Please try again.",
      });
    }
  },
);

export const sendRiderPhoneCode = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const rider = req.rider;
    if (!rider) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (!rider.phone) {
      res
        .status(400)
        .json({ success: false, message: "No phone number on file" });
      return;
    }

    const channel: OtpChannel = (req.body?.channel as OtpChannel) || "both";

    try {
      await sendPhoneVerificationCode(rider.phone, { channel });

      res.status(200).json({
        success: true,
        message: "Verification code sent to your phone",
      });
    } catch (error: any) {
      console.error("Error in sendRiderPhoneCode:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send verification code. Please try again.",
      });
    }
  },
);

export const verifyRiderPhoneCode = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const rider = req.rider;
    if (!rider) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (!rider.phone) {
      res
        .status(400)
        .json({ success: false, message: "No phone number on file" });
      return;
    }

    const { code } = req.body;

    const ipAddress = (req.ip || req.socket.remoteAddress || "unknown").replace(
      "::ffff:",
      "",
    );
    const attemptCheck = await trackVerificationAttempt(rider.phone, ipAddress);

    if (!attemptCheck.allowed) {
      res.status(429).json({
        success: false,
        message: "Too many verification attempts. Please try again later.",
      });
      return;
    }

    const result = await validateVerificationCode(rider.phone, code);

    if (!result.valid) {
      res.status(400).json({ success: false, message: result.message });
      return;
    }

    try {
      await resetVerificationAttempts(rider.phone, ipAddress);

      const updatedRider = await prisma.rider.update({
        where: { id: rider.id },
        data: { phoneVerifiedAt: new Date() },
        select: RIDER_SELECT,
      });

      res.status(200).json({
        success: true,
        message: "Phone verified successfully",
        data: formatRiderResponse(updatedRider),
      });
    } catch (error: any) {
      console.error("Error in verifyRiderPhoneCode:", error);
      res.status(500).json({
        success: false,
        message: "An internal server error occurred. Please try again.",
      });
    }
  },
);

export const sendRiderPasswordReset = asyncHandler(
  async (req: Request, res: Response) => {
    const { identifier } = req.body;

    if (!identifier) {
      res.status(400).json({ success: false, message: "Email or phone number is required." });
      return;
    }

    const isEmail = isValidEmail(identifier);
    const isPhone = isValidPhone(identifier);

    if (!isEmail && !isPhone) {
      res.status(400).json({ success: false, message: "Please provide a valid email or phone number." });
      return;
    }

    try {
      const rider = await prisma.rider.findUnique({
        where: isEmail ? { email: identifier } : { phone: normalizePhone(identifier) },
        select: { firstName: true },
      });

      // Always return 200 to prevent user enumeration
      if (!rider) {
        res.status(200).json({ success: true, message: "If an account exists, a reset code has been sent." });
        return;
      }

      await sendPasswordResetCode(isEmail ? identifier : normalizePhone(identifier), {
        firstName: rider.firstName,
      });

      res.status(200).json({ success: true, message: "A password reset code has been sent." });
    } catch (error: any) {
      console.error("Error in sendRiderPasswordReset:", error);
      res.status(500).json({ success: false, message: "Failed to send reset code. Please try again." });
    }
  },
);

export const resetRiderPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { identifier, code, newPassword } = req.body;

    if (!identifier || !code || !newPassword) {
      res.status(400).json({ success: false, message: "Identifier, code, and new password are required." });
      return;
    }

    if (!isValidPassword(newPassword)) {
      res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
      return;
    }

    const isEmail = isValidEmail(identifier);
    const isPhone = isValidPhone(identifier);

    if (!isEmail && !isPhone) {
      res.status(400).json({ success: false, message: "Please provide a valid email or phone number." });
      return;
    }

    const normalizedIdentifier = isEmail ? identifier : normalizePhone(identifier);

    const result = await validateAndConsumeResetCode(normalizedIdentifier, code);
    if (!result.valid) {
      res.status(400).json({ success: false, message: result.message });
      return;
    }

    try {
      const hashedPassword = await hashPassword(newPassword);

      await prisma.rider.update({
        where: isEmail ? { email: identifier } : { phone: normalizedIdentifier },
        data: { password: hashedPassword },
      });

      res.status(200).json({ success: true, message: "Password reset successfully." });
    } catch (error: any) {
      console.error("Error in resetRiderPassword:", error);
      res.status(500).json({ success: false, message: "Failed to reset password. Please try again." });
    }
  },
);

export const deleteRiderAccount = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const rider = req.rider;
    if (!rider) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { confirmation }: RiderDeleteAccountBody = req.body;
    if (confirmation !== "delete") {
      res.status(400).json({
        success: false,
        message: 'Please type "delete" to confirm account deletion.',
      });
      return;
    }

    const activeAssignedOrders = await prisma.order.count({
      where: {
        riderId: rider.id,
        status: {
          notIn: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
        },
      },
    });

    if (activeAssignedOrders > 0) {
      res.status(400).json({
        success: false,
        message:
          "Please complete your assigned orders before deleting your account.",
      });
      return;
    }

    try {
      await prisma.$transaction([
        prisma.rider.update({
          where: { id: rider.id },
          data: {
            isActive: false,
            isOnline: false,
            deletionRequestedAt: new Date(),
          },
        }),
        prisma.deviceToken.deleteMany({ where: { riderId: rider.id } }),
      ]);

      res.status(200).json({
        success: true,
        message:
          "Your account deletion request has been submitted. Your account will be permanently deleted after 30 days.",
      });
    } catch (error: any) {
      console.error("Rider account deletion error:", error);
      res.status(500).json({
        success: false,
        message:
          "An error occurred while requesting account deletion. Please try again.",
      });
    }
  },
);
