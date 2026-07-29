import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../../utils/tokens.js";
import { prisma } from "../../prisma.js";
import { Vendor } from "../../generated/prisma/client.js";

export interface VendorAuthRequest extends Request {
  vendorId?: string;
  vendor?: Vendor;
}

export const vendorAuthenticate = async (
  req: VendorAuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authentication required. Please provide a valid token.",
    });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = verifyAccessToken(token) as { id: string; type?: string };

    if (decoded.type !== "vendor") {
      res.status(401).json({
        success: false,
        message: "Invalid token for this resource.",
      });
      return;
    }

    const vendorId = decoded.id;

    const vendor = await prisma.vendor.findUnique({
      where: { id: BigInt(vendorId) },
    });

    if (!vendor) {
      res.status(401).json({
        success: false,
        message: "Vendor account not found.",
      });
      return;
    }

    if (vendor.deletionRequestedAt) {
      res.status(401).json({
        success: false,
        message:
          "Your account deletion request is pending. Please contact support if this was a mistake.",
      });
      return;
    }

    if (!vendor.isActive) {
      res.status(401).json({
        success: false,
        message: "This account has been deactivated. Please contact support.",
      });
      return;
    }

    req.vendorId = vendorId;
    req.vendor = vendor;
    next();
  } catch (error: any) {
    if (error.name !== "TokenExpiredError") {
      console.error("Vendor token verification error:", {
        message: error.message,
        name: error.name,
      });
    }

    res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please login again.",
    });
    return;
  }
};
