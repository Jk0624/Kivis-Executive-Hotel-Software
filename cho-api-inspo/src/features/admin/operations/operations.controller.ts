import { Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";
import { AdminAuthRequest } from "../../../middleware/admin/adminAuth.middleware.js";
import { OrderStatus, VerificationStatus } from "../../../generated/prisma/enums.js";

export const getOperationsSnapshot = asyncHandler(
  async (_req: AdminAuthRequest, res: Response) => {
    const [
      pendingVendorVerifications,
      pendingRiderVerifications,
      awaitingAcceptance,
      inPreparation,
      awaitingDispatch,
      outForDelivery,
      blockedUsers,
      blockedVendors,
      blockedRiders,
    ] = await Promise.all([
      prisma.restaurant.count({
        where: { verificationStatus: VerificationStatus.UNDER_REVIEW },
      }),
      prisma.rider.count({
        where: { verificationStatus: VerificationStatus.UNDER_REVIEW },
      }),
      prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      prisma.order.count({
        where: { status: { in: [OrderStatus.CONFIRMED, OrderStatus.PREPARING] } },
      }),
      prisma.order.count({ where: { status: OrderStatus.READY } }),
      prisma.order.count({
        where: { status: { in: [OrderStatus.RIDER_ASSIGNED, OrderStatus.PICKED_UP] } },
      }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.vendor.count({ where: { isActive: false } }),
      prisma.rider.count({ where: { isActive: false } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        pendingVerifications: {
          vendors: pendingVendorVerifications,
          riders: pendingRiderVerifications,
        },
        orders: {
          awaitingAcceptance,
          inPreparation,
          awaitingDispatch,
          outForDelivery,
        },
        blocked: {
          users: blockedUsers,
          vendors: blockedVendors,
          riders: blockedRiders,
        },
      },
    });
  }
);
