import { prisma } from "../../../prisma.js";
import {
  CouponSource,
  CouponType,
  PaymentStatus,
} from "../../../generated/prisma/enums.js";

export interface CouponValidationResult {
  valid: boolean;
  discount: number;
  couponId: bigint | null;
  source: string | null;
  message: string;
}

/**
 * Validate a coupon code and calculate the discount amount.
 * Read-only — does NOT create redemptions or deduct balance.
 */
export async function validateCoupon(
  code: string,
  userId: bigint,
  orderTotal: number,
): Promise<CouponValidationResult> {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase().trim() },
    include: { redemptions: true },
  });

  if (!coupon) {
    return {
      valid: false,
      discount: 0,
      couponId: null,
      source: null,
      message: "Invalid coupon code.",
    };
  }

  if (!coupon.isActive) {
    return {
      valid: false,
      discount: 0,
      couponId: null,
      source: coupon.source,
      message: "This coupon is no longer active.",
    };
  }

  if (new Date() > coupon.expiresAt) {
    return {
      valid: false,
      discount: 0,
      couponId: null,
      source: coupon.source,
      message: "This coupon has expired.",
    };
  }

  // If coupon is assigned to a specific user, verify ownership
  if (coupon.userId !== null && coupon.userId !== userId) {
    return {
      valid: false,
      discount: 0,
      couponId: null,
      source: coupon.source,
      message: "This coupon is not available to you.",
    };
  }

  // For REFUND coupons, check balance is > 0
  if (coupon.source === CouponSource.REFUND) {
    const balance = Number(coupon.balance ?? 0);
    if (balance <= 0) {
      return {
        valid: false,
        discount: 0,
        couponId: null,
        source: coupon.source,
        message: "This coupon has no remaining balance.",
      };
    }
  }

  // One-time-per-user check
  if (coupon.isOneTimePerUser) {
    const existingRedemption = coupon.redemptions.find(
      (r) => r.userId === userId,
    );
    if (existingRedemption) {
      return {
        valid: false,
        discount: 0,
        couponId: null,
        source: coupon.source,
        message: "You have already used this coupon.",
      };
    }
  }

  // Max total uses check
  if (
    coupon.maxTotalUses !== null &&
    coupon.redemptions.length >= coupon.maxTotalUses
  ) {
    return {
      valid: false,
      discount: 0,
      couponId: null,
      source: coupon.source,
      message: "This coupon has reached its usage limit.",
    };
  }

  // Min order amount check
  if (
    coupon.minOrderAmount !== null &&
    orderTotal < Number(coupon.minOrderAmount)
  ) {
    return {
      valid: false,
      discount: 0,
      couponId: null,
      source: coupon.source,
      message: `Minimum order of GHS ${Number(coupon.minOrderAmount).toFixed(2)} required to use this coupon.`,
    };
  }

  const discount = calculateDiscount(coupon, orderTotal);

  if (discount <= 0) {
    return {
      valid: false,
      discount: 0,
      couponId: null,
      source: coupon.source,
      message: "This coupon does not apply to this order.",
    };
  }

  return {
    valid: true,
    discount,
    couponId: coupon.id,
    source: coupon.source,
    message: `Coupon applied! You save GHS ${discount.toFixed(2)}.`,
  };
}

/**
 * Calculate the discount amount for a coupon.
 * REFUND coupons use balance, capped at the amount passed in (can be full order total).
 * ADMIN coupons use value, capped at the amount passed in.
 */
export function calculateDiscount(coupon: any, capAmount: number): number {
  let discount = 0;

  if (coupon.source === CouponSource.REFUND) {
    // Balance-based: use remaining balance, capped at capAmount
    const balance = Number(coupon.balance ?? 0);
    discount = Math.min(balance, capAmount);
  } else if (coupon.type === CouponType.FIXED) {
    discount = Math.min(Number(coupon.value), capAmount);
  } else {
    // PERCENTAGE
    discount = capAmount * (Number(coupon.value) / 100);
    if (coupon.maxDiscount !== null) {
      discount = Math.min(discount, Number(coupon.maxDiscount));
    }
    discount = Math.min(discount, capAmount);
  }

  return Math.round(discount * 100) / 100;
}

/**
 * Re-validate a coupon inside a database transaction to prevent race conditions.
 * This locks the coupon row and re-checks usage limits that could have changed
 * between the initial validation and the transaction commit.
 */
export async function validateCouponInsideTransaction(
  tx: any,
  couponId: bigint,
  userId: bigint,
  capAmount: number,
): Promise<CouponValidationResult> {
  // Re-fetch coupon with redemptions inside the transaction
  const coupon = await tx.coupon.findUnique({
    where: { id: couponId },
    include: { redemptions: true },
  });

  if (!coupon) {
    return {
      valid: false,
      discount: 0,
      couponId: null,
      source: null,
      message: "Coupon no longer exists.",
    };
  }

  if (!coupon.isActive) {
    return {
      valid: false,
      discount: 0,
      couponId: null,
      source: coupon.source,
      message: "This coupon is no longer active.",
    };
  }

  // Re-check REFUND balance (may have been decremented by a concurrent transaction)
  if (coupon.source === CouponSource.REFUND) {
    const balance = Number(coupon.balance ?? 0);
    if (balance <= 0) {
      return {
        valid: false,
        discount: 0,
        couponId: null,
        source: coupon.source,
        message: "This coupon has no remaining balance.",
      };
    }
  }

  // Re-check one-time-per-user
  if (coupon.isOneTimePerUser) {
    const existingRedemption = coupon.redemptions.find(
      (r: any) => r.userId === userId,
    );
    if (existingRedemption) {
      return {
        valid: false,
        discount: 0,
        couponId: null,
        source: coupon.source,
        message: "You have already used this coupon.",
      };
    }
  }

  // Re-check max total uses
  if (
    coupon.maxTotalUses !== null &&
    coupon.redemptions.length >= coupon.maxTotalUses
  ) {
    return {
      valid: false,
      discount: 0,
      couponId: null,
      source: coupon.source,
      message: "This coupon has reached its usage limit.",
    };
  }

  // Recalculate discount (balance may have changed)
  const discount = calculateDiscount(coupon, capAmount);

  if (discount <= 0) {
    return {
      valid: false,
      discount: 0,
      couponId: null,
      source: coupon.source,
      message: "This coupon does not apply to this order.",
    };
  }

  return {
    valid: true,
    discount,
    couponId: coupon.id,
    source: coupon.source,
    message: `Coupon applied! You save GHS ${discount.toFixed(2)}.`,
  };
}

/**
 * Reverse a coupon redemption when an order is cancelled/rejected.
 * Restores REFUND coupon balance and deletes the redemption record.
 *
 * If `client` is provided, the work runs on that transaction client so the
 * caller can compose this into a larger atomic operation. Otherwise an
 * internal transaction is opened.
 */
export async function reverseCouponRedemption(
  orderId: bigint,
  client?: any,
): Promise<void> {
  const reader = client ?? prisma;
  const redemption = await reader.couponRedemption.findUnique({
    where: { orderId },
    include: { coupon: true },
  });

  if (!redemption) return;

  const work = async (tx: any) => {
    if (
      redemption.coupon.source === CouponSource.REFUND &&
      redemption.coupon.balance !== null
    ) {
      await tx.coupon.update({
        where: { id: redemption.couponId },
        data: {
          balance: { increment: Number(redemption.discountAmount) },
        },
      });
    }

    await tx.couponRedemption.delete({
      where: { id: redemption.id },
    });

    await tx.order.update({
      where: { id: orderId },
      data: { couponId: null, discount: 0 },
    });
  };

  if (client) {
    await work(client);
  } else {
    await (prisma as any).$transaction(work);
  }
}

/**
 * Create a REFUND coupon when a paid order is rejected/cancelled.
 * The coupon value = order.totalAmount (the post-discount amount actually charged).
 */
export async function createRefundCoupon(
  orderId: bigint,
  userId: bigint,
  totalAmount: number,
  orderNumber: string | null,
  client?: any,
): Promise<string> {
  const code = `REF-${orderNumber || orderId.toString()}`;

  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  const run = async (db: any) => {
    await db.coupon.create({
      data: {
        code,
        type: CouponType.FIXED,
        source: CouponSource.REFUND,
        value: totalAmount,
        balance: totalAmount,
        isOneTimePerUser: false,
        userId,
        sourceOrderId: orderId,
        expiresAt: oneYearFromNow,
        isActive: true,
      },
    });

    await db.order.update({
      where: { id: orderId },
      data: { paymentStatus: PaymentStatus.REFUNDED },
    });
  };

  if (client) {
    await run(client);
  } else {
    await (prisma as any).$transaction(run);
  }

  return code;
}
