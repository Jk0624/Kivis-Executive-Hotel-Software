import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  generateAdminAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../../utils/tokens.js";
import { AdminAuthRequest } from "../../../middleware/admin/adminAuth.middleware.js";
import { hashPassword } from "../../../utils/password.js";
import { isValidPassword } from "../../../utils/validators.js";

function hashInviteToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export const adminLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: "Email and password are required." });
    return;
  }

  const admin = await prisma.admin.findUnique({ where: { email } });

  if (!admin || !admin.isActive) {
    res.status(401).json({ success: false, message: "Invalid credentials." });
    return;
  }

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) {
    res.status(401).json({ success: false, message: "Invalid credentials." });
    return;
  }

  const accessToken = generateAdminAccessToken(admin);
  const refreshToken = generateRefreshToken(admin.id, "admin");

  res.status(200).json({
    success: true,
    message: "Login successful.",
    data: {
      tokens: { accessToken, refreshToken },
      admin: {
        id: admin.id.toString(),
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
      },
    },
  });
});

export const refreshAdminToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    res.status(400).json({ success: false, message: "Refresh token is required." });
    return;
  }

  try {
    const decoded = verifyRefreshToken(token) as { id: string; type?: string };

    if (decoded.type !== "admin") {
      res.status(401).json({
        success: false,
        message: "Invalid token type. Please login again.",
      });
      return;
    }

    // Freshness check on every refresh: re-read isActive and current role from DB.
    const admin = await prisma.admin.findUnique({ where: { id: BigInt(decoded.id) } });

    if (!admin || !admin.isActive) {
      res.status(401).json({
        success: false,
        message: "Admin account not found or deactivated. Please login again.",
      });
      return;
    }

    const accessToken = generateAdminAccessToken(admin);
    const newRefreshToken = generateRefreshToken(admin.id, "admin");

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully.",
      data: {
        tokens: { accessToken, refreshToken: newRefreshToken },
      },
    });
  } catch (error: any) {
    if (error.name !== "TokenExpiredError") {
      console.error("Admin token refresh error:", error.message);
    }
    res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token. Please login again.",
    });
  }
});

export const setupAdminPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body as { token?: string; password?: string };

  if (!token || !password) {
    res.status(400).json({ success: false, message: "Token and password are required." });
    return;
  }

  if (!isValidPassword(password)) {
    res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
    return;
  }

  const tokenHash = hashInviteToken(token);
  const invite = await prisma.adminInviteToken.findUnique({
    where: { tokenHash },
    include: { admin: true },
  });

  if (!invite || invite.usedAt || invite.expiresAt.getTime() <= Date.now()) {
    res.status(400).json({ success: false, message: "Invite link is invalid or expired." });
    return;
  }

  const hashedPassword = await hashPassword(password);

  await prisma.$transaction([
    prisma.admin.update({
      where: { id: invite.adminId },
      data: { password: hashedPassword, isActive: true },
    }),
    prisma.adminInviteToken.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    }),
    prisma.adminInviteToken.updateMany({
      where: {
        adminId: invite.adminId,
        usedAt: null,
        id: { not: invite.id },
      },
      data: { usedAt: new Date() },
    }),
  ]);

  res.status(200).json({
    success: true,
    message: "Password set successfully. You can now sign in.",
  });
});

/**
 * Profile endpoint — explicitly fetches the freshest row from DB so the user's
 * profile page reflects updates even within an access-token window.
 */
export const getAdminProfile = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const adminId = req.adminId!;
  const admin = await prisma.admin.findUnique({ where: { id: BigInt(adminId) } });

  if (!admin) {
    res.status(404).json({ success: false, message: "Admin not found." });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      id: admin.id.toString(),
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt,
    },
  });
});
