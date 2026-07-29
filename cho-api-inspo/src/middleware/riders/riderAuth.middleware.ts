import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../../utils/tokens.js";
import { prisma } from "../../prisma.js";
import { Rider } from "../../generated/prisma/client.js";

export interface RiderAuthRequest extends Request {
  riderId?: string;
  rider?: Rider;
}

export const riderAuthenticate = async (
  req: RiderAuthRequest,
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

    if (decoded.type !== "rider") {
      res.status(401).json({
        success: false,
        message: "Invalid token for this resource.",
      });
      return;
    }

    const riderId = decoded.id;

    const rider = await prisma.rider.findUnique({
      where: { id: BigInt(riderId) },
    });

    if (!rider) {
      res.status(401).json({
        success: false,
        message: "Rider account not found.",
      });
      return;
    }

    if (rider.deletionRequestedAt) {
      res.status(401).json({
        success: false,
        message:
          "Your account deletion request is pending. Please contact support if this was a mistake.",
      });
      return;
    }

    if (!rider.isActive) {
      res.status(401).json({
        success: false,
        message: "This account has been deactivated. Please contact support.",
      });
      return;
    }

    req.riderId = riderId;
    req.rider = rider;
    next();
  } catch (error: any) {
    if (error.name !== "TokenExpiredError") {
      console.error("Rider token verification error:", {
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
