import { Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";
import { VerificationStatus } from "../../../generated/prisma/enums.js";
import { VendorAuthRequest } from "../../../middleware/vendors/vendorAuth.middleware.js";

export const requestVerification = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendor = req.vendor;
    if (!vendor) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    // Get vendor's first restaurant (primary)
    const restaurant = await prisma.restaurant.findFirst({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: "asc" },
    });

    if (!restaurant) {
      res.status(400).json({
        success: false,
        message: "Please create a restaurant before requesting verification.",
      });
      return;
    }

    if (restaurant.verificationStatus === VerificationStatus.UNDER_REVIEW) {
      res.status(400).json({
        success: false,
        message: "Your verification request is already under review.",
      });
      return;
    }

    if (restaurant.verificationStatus === VerificationStatus.VERIFIED) {
      res.status(400).json({
        success: false,
        message: "Your restaurant is already verified.",
      });
      return;
    }

    const incomplete: string[] = [];
    if (!vendor.isPersonalInfoComplete) incomplete.push("Personal Details");
    if (!restaurant.isInfoComplete) incomplete.push("Restaurant Information");
    if (!restaurant.isPaymentInfoComplete) incomplete.push("Payment Information");

    if (incomplete.length > 0) {
      res.status(400).json({
        success: false,
        message: `Please complete the following before requesting verification: ${incomplete.join(", ")}`,
      });
      return;
    }

    try {
      const updatedRestaurant = await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: { verificationStatus: VerificationStatus.UNDER_REVIEW },
      });

      res.status(200).json({
        success: true,
        message: "Verification request submitted successfully",
        data: {
          restaurantId: updatedRestaurant.id.toString(),
          verificationStatus: updatedRestaurant.verificationStatus,
        },
      });
    } catch (error: any) {
      console.error("Error requesting verification:", error.message);
      res.status(500).json({
        success: false,
        message: "An error occurred while submitting your verification request.",
      });
    }
  }
);

export const getVerificationStatus = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendor = req.vendor;
    if (!vendor) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const restaurant = await prisma.restaurant.findFirst({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json({
      success: true,
      data: {
        isPersonalInfoComplete: vendor.isPersonalInfoComplete,
        isRestaurantInfoComplete: restaurant?.isInfoComplete ?? false,
        isPaymentInfoComplete: restaurant?.isPaymentInfoComplete ?? false,
        verificationStatus: restaurant?.verificationStatus ?? VerificationStatus.PENDING,
      },
    });
  }
);
