import { Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";
import { VerificationStatus } from "../../../generated/prisma/enums.js";
import { RiderAuthRequest } from "../../../middleware/riders/riderAuth.middleware.js";

export const requestVerification = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const rider = req.rider;
    if (!rider) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (rider.verificationStatus === VerificationStatus.UNDER_REVIEW) {
      res.status(400).json({
        success: false,
        message: "Your verification request is already under review.",
      });
      return;
    }

    if (rider.verificationStatus === VerificationStatus.VERIFIED) {
      res.status(400).json({
        success: false,
        message: "Your account is already verified.",
      });
      return;
    }

    // Check completeness
    const vehicleInfo = await prisma.riderVehicleInfo.findUnique({
      where: { riderId: rider.id },
    });

    const hasPaymentDetails = await prisma.riderPaymentDetail.count({
      where: { riderId: rider.id },
    });

    const incomplete: string[] = [];
    if (!rider.isPersonalInfoComplete) incomplete.push("Personal Details");
    if (!vehicleInfo?.isInfoComplete) incomplete.push("Vehicle Information");
    if (hasPaymentDetails === 0) incomplete.push("Payment Information");

    if (incomplete.length > 0) {
      res.status(400).json({
        success: false,
        message: `Please complete the following before requesting verification: ${incomplete.join(", ")}`,
      });
      return;
    }

    try {
      const updatedRider = await prisma.rider.update({
        where: { id: rider.id },
        data: { verificationStatus: VerificationStatus.UNDER_REVIEW },
      });

      res.status(200).json({
        success: true,
        message: "Verification request submitted successfully",
        data: {
          riderId: updatedRider.id.toString(),
          verificationStatus: updatedRider.verificationStatus,
        },
      });
    } catch (error: any) {
      console.error("Error requesting verification:", error.message);
      res.status(500).json({
        success: false,
        message:
          "An error occurred while submitting your verification request.",
      });
    }
  },
);

export const getVerificationStatus = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const rider = req.rider;
    if (!rider) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const vehicleInfo = await prisma.riderVehicleInfo.findUnique({
      where: { riderId: rider.id },
    });

    const hasPaymentDetails = await prisma.riderPaymentDetail.count({
      where: { riderId: rider.id },
    });

    res.status(200).json({
      success: true,
      data: {
        isPersonalInfoComplete: rider.isPersonalInfoComplete,
        isVehicleInfoComplete: vehicleInfo?.isInfoComplete ?? false,
        isPaymentInfoComplete: hasPaymentDetails > 0,
        verificationStatus: rider.verificationStatus,
      },
    });
  },
);
