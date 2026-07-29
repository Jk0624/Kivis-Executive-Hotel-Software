import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";
import { AuthProvider, OrderStatus } from "../../../generated/prisma/enums.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../../utils/tokens.js";
import {
  VendorRegisterBody,
  VendorLoginBody,
  VendorRefreshTokenBody,
  VendorUpdateProfileBody,
  VendorChangePasswordBody,
  VendorDeleteAccountBody,
  VENDOR_SELECT,
} from "./auth.types.js";
import {
  isValidEmail,
  isValidPhone,
  isValidPassword,
  normalizePhone,
  parseDob,
} from "../../../utils/validators.js";
import { hashPassword, comparePassword } from "../../../utils/password.js";
import { checkVendorAvailability } from "../../../utils/vendor.utils.js";
import { VendorAuthRequest } from "../../../middleware/vendors/vendorAuth.middleware.js";
import { createVendorNotification } from "../notification/notification.service.js";
import { sendEmailVerificationCode, sendPhoneVerificationCode, validateVerificationCode, type OtpChannel } from "../../../utils/verification.service.js";
import { trackVerificationAttempt, resetVerificationAttempts } from "../../../utils/verificationAttempts.js";
import { sendPasswordResetCode, validateAndConsumeResetCode } from "../../../utils/password-reset.service.js";

const VENDOR_DELETION_MESSAGE =
  "Your account will be deleted soon. Please contact support if this was a mistake.";

export const registerVendor = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
    }: VendorRegisterBody = req.body;

    if (!firstName || !lastName || !email || !phone || !password) {
      res.status(400).json({
        success: false,
        message:
          "Missing required fields: firstName, lastName, email, phone, and password are required",
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


    try {
      const availability = await checkVendorAvailability({ email, phone });
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

      const vendor = await prisma.vendor.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          password: hashedPassword,
          authProvider: AuthProvider.EMAIL,
          isPersonalInfoComplete: false,
        },
        select: VENDOR_SELECT,
      });

      const accessToken = generateAccessToken(vendor.id, "vendor");
      const refreshToken = generateRefreshToken(vendor.id, "vendor");

      const vendorResponse = {
        ...vendor,
        id: vendor.id.toString(),
        restaurants: vendor.restaurants?.map((r: any) => ({
          ...r,
          id: r.id.toString(),
        })),
      };

      res.status(201).json({
        success: true,
        message: "Vendor registered successfully",
        data: {
          vendor: vendorResponse,
          tokens: { accessToken, refreshToken },
        },
      });
    } catch (error: any) {
      console.error("Database error creating vendor:", error.message);
      res.status(500).json({
        success: false,
        message: "An internal server error occurred. Please try again.",
      });
      return;
    }
  },
);

export const loginVendor = asyncHandler(async (req: Request, res: Response) => {
  const { identifier, password }: VendorLoginBody = req.body;

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
    const vendor = await prisma.vendor.findUnique({
      where: isEmail
        ? { email: identifier }
        : { phone: normalizePhone(identifier) },
      select: { ...VENDOR_SELECT, password: true },
    });

    if (!vendor) {
      res.status(404).json({
        success: false,
        message:
          "We couldn't find an account with this " +
          (isEmail ? "email" : "phone number") +
          ". Would you like to create one?",
      });
      return;
    }

    if (!vendor.password) {
      res.status(400).json({
        success: false,
        message:
          "This account was created with social login. Please use Google to sign in.",
      });
      return;
    }

    const isPasswordValid = await comparePassword(password, vendor.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid password. Please try again.",
      });
      return;
    }

    if (vendor.deletionRequestedAt) {
      res.status(403).json({
        success: false,
        message: VENDOR_DELETION_MESSAGE,
      });
      return;
    }

    if (!vendor.isActive) {
      res.status(403).json({
        success: false,
        message: "Your account has been suspended. Please contact support.",
      });
      return;
    }

    const accessToken = generateAccessToken(vendor.id, "vendor");
    const refreshToken = generateRefreshToken(vendor.id, "vendor");

    const { password: _, ...vendorWithoutPassword } = vendor;
    const vendorResponse = {
      ...vendorWithoutPassword,
      id: vendor.id.toString(),
      restaurants: vendor.restaurants?.map((r) => ({
        ...r,
        id: r.id.toString(),
      })),
    };
 
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        vendor: vendorResponse,
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
    const { refreshToken: token }: VendorRefreshTokenBody = req.body;

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

      if (decoded.type !== "vendor") {
        res.status(401).json({
          success: false,
          message: "Invalid token type. Please login again.",
        });
        return;
      }

      const vendorId = BigInt(decoded.id);

      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
      });

      if (!vendor) {
        res.status(401).json({
          success: false,
          message: "Vendor not found. Please login again.",
        });
        return;
      }

      if (vendor.deletionRequestedAt) {
        res.status(401).json({
          success: false,
          message: VENDOR_DELETION_MESSAGE,
        });
        return;
      }

      if (!vendor.isActive) {
        res.status(401).json({
          success: false,
          message: "Your account has been suspended. Please contact support.",
        });
        return;
      }

      const newAccessToken = generateAccessToken(vendor.id, "vendor");
      const newRefreshToken = generateRefreshToken(vendor.id, "vendor");

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
  async (req: VendorAuthRequest, res: Response) => {
    const vendor = req.vendor;
    if (!vendor) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const {
      firstName,
      lastName,
    }: VendorUpdateProfileBody = req.body;


    try {
      const updateData: Record<string, unknown> = {};
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;

      // Check if personal info will be complete after this update
      const mergedFirstName = firstName || vendor.firstName;
      const mergedLastName = lastName || vendor.lastName;

      const isPersonalComplete =
        !!mergedFirstName &&
        !!mergedLastName &&
        !!vendor.phone &&
        !!vendor.email &&
        !!vendor.emailVerifiedAt;

      if (isPersonalComplete) {
        updateData.isPersonalInfoComplete = true;
      }

      const updatedVendor = await prisma.vendor.update({
        where: { id: vendor.id },
        data: updateData,
        select: VENDOR_SELECT,
      });

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: {
          ...updatedVendor,
          id: updatedVendor.id.toString(),
          restaurants: updatedVendor.restaurants?.map((r: any) => ({
            ...r,
            id: r.id.toString(),
          })),
        },
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

export const changePassword = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendor = req.vendor;
    if (!vendor) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { currentPassword, newPassword }: VendorChangePasswordBody = req.body;

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
      const vendorWithPassword = await prisma.vendor.findUnique({
        where: { id: vendor.id },
        select: { password: true },
      });

      if (!vendorWithPassword?.password) {
        res.status(400).json({
          success: false,
          message:
            "This account was created with social login. Password change is not available.",
        });
        return;
      }

      const isCurrentValid = await comparePassword(
        currentPassword,
        vendorWithPassword.password,
      );
      if (!isCurrentValid) {
        res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
        return;
      }

      const hashedNew = await hashPassword(newPassword);
      await prisma.vendor.update({
        where: { id: vendor.id },
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

export const sendVendorEmailCode = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendor = req.vendor;
    if (!vendor) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (!vendor.email) {
      res.status(400).json({ success: false, message: "No email address on file" });
      return;
    }

    try {
      await sendEmailVerificationCode(vendor.email, { userName: vendor.firstName });

      res.status(200).json({
        success: true,
        message: "Verification code sent to your email",
      });
    } catch (error: any) {
      console.error("Error in sendVendorEmailCode:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send verification code. Please try again.",
      });
    }
  },
);

export const verifyVendorEmailCode = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendor = req.vendor;
    if (!vendor) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (!vendor.email) {
      res.status(400).json({ success: false, message: "No email address on file" });
      return;
    }

    const { code } = req.body;
    const result = await validateVerificationCode(vendor.email, code);

    if (!result.valid) {
      res.status(400).json({ success: false, message: result.message });
      return;
    }

    try {
      const isPersonalComplete =
        !!vendor.firstName &&
        !!vendor.lastName &&
        !!vendor.phone &&
        !!vendor.email;

      const updatedVendor = await prisma.vendor.update({
        where: { id: vendor.id },
        data: {
          emailVerifiedAt: new Date(),
          ...(isPersonalComplete && { isPersonalInfoComplete: true }),
        },
        select: VENDOR_SELECT,
      });

      const vendorResponse = {
        ...updatedVendor,
        id: updatedVendor.id.toString(),
        restaurants: updatedVendor.restaurants?.map((r: any) => ({
          ...r,
          id: r.id.toString(),
        })),
      };

      res.status(200).json({
        success: true,
        message: "Email verified successfully",
        data: vendorResponse,
      });
    } catch (error: any) {
      console.error("Error in verifyVendorEmailCode:", error);
      res.status(500).json({
        success: false,
        message: "An internal server error occurred. Please try again.",
      });
    }
  },
);

export const sendVendorPhoneCode = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendor = req.vendor;
    if (!vendor) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (!vendor.phone) {
      res.status(400).json({ success: false, message: "No phone number on file" });
      return;
    }

    const channel: OtpChannel = (req.body?.channel as OtpChannel) || "both";

    try {
      await sendPhoneVerificationCode(vendor.phone, { channel });

      res.status(200).json({
        success: true,
        message: "Verification code sent to your phone",
      });
    } catch (error: any) {
      console.error("Error in sendVendorPhoneCode:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send verification code. Please try again.",
      });
    }
  },
);

export const verifyVendorPhoneCode = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendor = req.vendor;
    if (!vendor) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (!vendor.phone) {
      res.status(400).json({ success: false, message: "No phone number on file" });
      return;
    }

    const { code } = req.body;

    const ipAddress = (req.ip || req.socket.remoteAddress || "unknown").replace(
      "::ffff:",
      "",
    );
    const attemptCheck = await trackVerificationAttempt(vendor.phone, ipAddress);

    if (!attemptCheck.allowed) {
      res.status(429).json({
        success: false,
        message: "Too many verification attempts. Please try again later.",
      });
      return;
    }

    const result = await validateVerificationCode(vendor.phone, code);

    if (!result.valid) {
      res.status(400).json({ success: false, message: result.message });
      return;
    }

    try {
      await resetVerificationAttempts(vendor.phone, ipAddress);

      const updatedVendor = await prisma.vendor.update({
        where: { id: vendor.id },
        data: { phoneVerifiedAt: new Date() },
        select: VENDOR_SELECT,
      });

      const vendorResponse = {
        ...updatedVendor,
        id: updatedVendor.id.toString(),
        restaurants: updatedVendor.restaurants?.map((r: any) => ({
          ...r,
          id: r.id.toString(),
        })),
      };

      res.status(200).json({
        success: true,
        message: "Phone verified successfully",
        data: vendorResponse,
      });
    } catch (error: any) {
      console.error("Error in verifyVendorPhoneCode:", error);
      res.status(500).json({
        success: false,
        message: "An internal server error occurred. Please try again.",
      });
    }
  },
);

export const sendVendorPasswordReset = asyncHandler(
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
      const vendor = await prisma.vendor.findUnique({
        where: isEmail ? { email: identifier } : { phone: normalizePhone(identifier) },
        select: { firstName: true },
      });

      // Always return 200 to prevent user enumeration
      if (!vendor) {
        res.status(200).json({ success: true, message: "If an account exists, a reset code has been sent." });
        return;
      }

      await sendPasswordResetCode(isEmail ? identifier : normalizePhone(identifier), {
        firstName: vendor.firstName,
      });

      res.status(200).json({ success: true, message: "A password reset code has been sent." });
    } catch (error: any) {
      console.error("Error in sendVendorPasswordReset:", error);
      res.status(500).json({ success: false, message: "Failed to send reset code. Please try again." });
    }
  },
);

export const resetVendorPassword = asyncHandler(
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

      await prisma.vendor.update({
        where: isEmail ? { email: identifier } : { phone: normalizedIdentifier },
        data: { password: hashedPassword },
      });

      res.status(200).json({ success: true, message: "Password reset successfully." });
    } catch (error: any) {
      console.error("Error in resetVendorPassword:", error);
      res.status(500).json({ success: false, message: "Failed to reset password. Please try again." });
    }
  },
);

export const deleteVendorAccount = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendor = req.vendor;
    if (!vendor) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { confirmation }: VendorDeleteAccountBody = req.body;
    if (confirmation !== "delete") {
      res.status(400).json({
        success: false,
        message: 'Please type "delete" to confirm account deletion.',
      });
      return;
    }

    const activeOrders = await prisma.order.count({
      where: {
        restaurant: { vendorId: vendor.id },
        status: {
          notIn: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
        },
      },
    });

    if (activeOrders > 0) {
      res.status(400).json({
        success: false,
        message:
          "Please ensure all your restaurant orders are completed before deleting your account.",
      });
      return;
    }

    try {
      await prisma.$transaction([
        prisma.vendor.update({
          where: { id: vendor.id },
          data: {
            isActive: false,
            deletionRequestedAt: new Date(),
          },
        }),
        prisma.deviceToken.deleteMany({ where: { vendorId: vendor.id } }),
      ]);

      res.status(200).json({
        success: true,
        message:
          "Your account deletion request has been submitted. Your account will be permanently deleted after 30 days.",
      });
    } catch (error: any) {
      console.error("Vendor account deletion error:", error);
      res.status(500).json({
        success: false,
        message:
          "An error occurred while requesting account deletion. Please try again.",
      });
    }
  },
);
