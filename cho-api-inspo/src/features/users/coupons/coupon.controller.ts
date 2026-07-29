import { Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";
import { CouponSource } from "../../../generated/prisma/enums.js";
import { AuthRequest } from "../../../middleware/users/auth.middleware.js";
import { validateCoupon } from "./coupon.service.js";

/**
 * POST /validate
 * Validate a coupon code for a given order subtotal. Read-only, no writes.
 */
export const validateCouponCode = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) {
      res
        .status(401)
        .json({ success: false, message: "Authentication required." });
      return;
    }

    const { code, orderTotal } = req.body;

    if (!code || typeof code !== "string") {
      res
        .status(400)
        .json({ success: false, message: "Coupon code is required." });
      return;
    }

    if (
      orderTotal == null ||
      isNaN(Number(orderTotal)) ||
      Number(orderTotal) <= 0
    ) {
      res.status(400).json({
        success: false,
        message: "A valid order total is required.",
      });
      return;
    }

    const result = await validateCoupon(
      code,
      BigInt(userId),
      Number(orderTotal),
    );

    res.status(result.valid ? 200 : 400).json({
      success: result.valid,
      message: result.message,
      data: {
        valid: result.valid,
        discount: result.discount.toFixed(2),
        couponId: result.couponId?.toString() || null,
        source: result.source,
      },
    });
  },
);

/**
 * GET /my
 * List the authenticated user's available coupons.
 * Returns refund credits, gifted coupons. Filters out expired/inactive/depleted.
 */
export const getMyCoupons = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) {
      res
        .status(401)
        .json({ success: false, message: "Authentication required." });
      return;
    }

    const userIdBigInt = BigInt(userId);
    const now = new Date();
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Fetch all user coupons that are either active, or recently expired/used
    const coupons = await prisma.coupon.findMany({
      where: {
        userId: userIdBigInt,
        OR: [
          { isActive: true, expiresAt: { gt: now } }, // Active
          { expiresAt: { gte: threeDaysAgo } }, // Expired recently
          { updatedAt: { gte: threeDaysAgo } }, // Updated/used recently
        ],
      },
      include: {
        redemptions: {
          where: { userId: userIdBigInt },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { redemptions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const available = coupons
      .map((coupon) => {
        let status: "ACTIVE" | "USED" | "EXPIRED" = "ACTIVE";
        let statusDate = coupon.updatedAt;

        // Determine status
        if (!coupon.isActive || coupon.expiresAt < now) {
          status = "EXPIRED";
          statusDate = coupon.expiresAt;
        } else if (
          coupon.source === CouponSource.REFUND &&
          Number(coupon.balance ?? 0) <= 0
        ) {
          status = "USED";
          statusDate = coupon.updatedAt;
        } else if (coupon.isOneTimePerUser && coupon.redemptions.length > 0) {
          status = "USED";
          statusDate = coupon.redemptions[0].createdAt;
        } else if (
          coupon.maxTotalUses !== null &&
          coupon._count.redemptions >= coupon.maxTotalUses
        ) {
          status = "USED";
          statusDate = coupon.updatedAt;
        }

        return {
          id: coupon.id.toString(),
          code: coupon.code,
          type: coupon.type,
          source: coupon.source,
          value: coupon.value.toString(),
          maxDiscount: coupon.maxDiscount?.toString() || null,
          minOrderAmount: coupon.minOrderAmount?.toString() || null,
          balance: coupon.balance?.toString() || null,
          isOneTimePerUser: coupon.isOneTimePerUser,
          expiresAt: coupon.expiresAt.toISOString(),
          createdAt: coupon.createdAt.toISOString(),
          status,
          statusDate, // Keep temporarily for filtering
        };
      })
      .filter((coupon) => {
        // Exclude USED/EXPIRED coupons that transitioned more than 3 days ago
        if (coupon.status !== "ACTIVE") {
          return coupon.statusDate >= threeDaysAgo;
        }
        return true;
      })
      .map(({ statusDate, ...coupon }) => coupon); // Remove temporary statusDate

    res.status(200).json({
      success: true,
      message: "Coupons retrieved successfully",
      data: available,
    });
  },
);
