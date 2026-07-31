import { Response } from "express";
import asyncHandler from "express-async-handler";
import crypto from "crypto";
import { prisma } from "../../../prisma.js";
import { CouponSource, CouponType } from "../../../generated/prisma/enums.js";
import { AdminAuthRequest } from "../../../middleware/admin/adminAuth.middleware.js";
import { logAdminAction } from "../audit.service.js";

function generateCode(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

function serializeCoupon(coupon: any, redemptionCount?: number) {
  return {
    id: coupon.id.toString(),
    code: coupon.code,
    type: coupon.type,
    source: coupon.source,
    value: coupon.value.toString(),
    maxDiscount: coupon.maxDiscount?.toString() ?? null,
    minOrderAmount: coupon.minOrderAmount?.toString() ?? null,
    balance: coupon.balance?.toString() ?? null,
    isOneTimePerUser: coupon.isOneTimePerUser,
    maxTotalUses: coupon.maxTotalUses ?? null,
    userId: coupon.userId?.toString() ?? null,
    user: coupon.user
      ? {
          id: coupon.user.id.toString(),
          firstName: coupon.user.firstName,
          lastName: coupon.user.lastName,
          email: coupon.user.email,
        }
      : null,
    isActive: coupon.isActive,
    expiresAt: coupon.expiresAt.toISOString(),
    createdAt: coupon.createdAt.toISOString(),
    redemptionCount: redemptionCount ?? coupon._count?.redemptions ?? 0,
  };
}

export const listCoupons = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const { page = "1", limit = "20", source, type, status, search } =
    req.query as Record<string, string>;

  const take = Math.min(Number(limit) || 20, 100);
  const skip = (Math.max(Number(page), 1) - 1) * take;
  const now = new Date();

  const where: any = {};
  if (source && ["ADMIN", "REFUND"].includes(source)) where.source = source;
  if (type && ["FIXED", "PERCENTAGE"].includes(type)) where.type = type;
  if (status === "active") {
    where.isActive = true;
    where.expiresAt = { gt: now };
  } else if (status === "expired") {
    where.expiresAt = { lte: now };
  } else if (status === "inactive") {
    where.isActive = false;
    where.expiresAt = { gt: now };
  }
  if (search) {
    where.code = { contains: search.trim().toUpperCase() };
  }

  const [coupons, total] = await Promise.all([
    prisma.coupon.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        _count: { select: { redemptions: true } },
      },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.coupon.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: coupons.map((c) => serializeCoupon(c, c._count.redemptions)),
    meta: {
      total,
      page: Math.max(Number(page), 1),
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  });
});

export const createCoupon = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const {
    code,
    type,
    source = "ADMIN",
    value,
    maxDiscount,
    minOrderAmount,
    isOneTimePerUser = true,
    maxTotalUses,
    userIdentifier,
    expiresAt,
  } = req.body;

  if (!["ADMIN", "REFUND"].includes(source)) {
    res.status(400).json({ success: false, message: "Source must be ADMIN or REFUND." });
    return;
  }

  // REFUND coupons must be FIXED and require a userIdentifier
  if (source === "REFUND") {
    if (!userIdentifier) {
      res.status(400).json({ success: false, message: "User email or phone is required for REFUND coupons." });
      return;
    }
    if (type && type !== "FIXED") {
      res.status(400).json({ success: false, message: "REFUND coupons must be FIXED type." });
      return;
    }
  }

  const couponType: CouponType = source === "REFUND" ? CouponType.FIXED : type;
  if (!couponType || !["FIXED", "PERCENTAGE"].includes(couponType)) {
    res.status(400).json({ success: false, message: "Type must be FIXED or PERCENTAGE." });
    return;
  }

  const numValue = Number(value);
  if (!value || isNaN(numValue) || numValue <= 0) {
    res.status(400).json({ success: false, message: "Value must be a positive number." });
    return;
  }
  if (couponType === CouponType.PERCENTAGE && numValue > 100) {
    res.status(400).json({ success: false, message: "Percentage value cannot exceed 100." });
    return;
  }

  if (!expiresAt) {
    res.status(400).json({ success: false, message: "Expiry date is required." });
    return;
  }
  const expiryDate = new Date(expiresAt);
  if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
    res.status(400).json({ success: false, message: "Expiry date must be in the future." });
    return;
  }

  let resolvedUserId: bigint | undefined;
  if (userIdentifier) {
    const identifier = String(userIdentifier).trim();
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { phone: identifier }] },
    });
    if (!user) {
      res.status(404).json({ success: false, message: "No user found with that email or phone number." });
      return;
    }
    resolvedUserId = user.id;
  }

  const finalCode = code ? String(code).trim().toUpperCase() : generateCode();

  const existing = await prisma.coupon.findUnique({ where: { code: finalCode } });
  if (existing) {
    res.status(409).json({ success: false, message: "A coupon with this code already exists." });
    return;
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: finalCode,
      type: couponType,
      source: source as CouponSource,
      value: numValue,
      maxDiscount: maxDiscount != null && maxDiscount !== "" ? Number(maxDiscount) : null,
      minOrderAmount: minOrderAmount != null && minOrderAmount !== "" ? Number(minOrderAmount) : null,
      balance: source === "REFUND" ? numValue : null,
      isOneTimePerUser: Boolean(isOneTimePerUser),
      maxTotalUses: maxTotalUses != null && maxTotalUses !== "" ? Number(maxTotalUses) : null,
      userId: resolvedUserId ?? null,
      expiresAt: expiryDate,
      isActive: true,
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  await logAdminAction({
    adminId: req.adminId!,
    action: "CREATE_COUPON",
    targetType: "coupon",
    targetId: coupon.id.toString(),
    meta: { code: finalCode, type: couponType, source, value: numValue },
  });

  res.status(201).json({ success: true, data: serializeCoupon(coupon, 0) });
});

export const getCoupon = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const id = req.params.id as string;

  let coupon: any;
  try {
    coupon = await prisma.coupon.findUnique({
      where: { id: BigInt(id) },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        redemptions: {
          orderBy: { createdAt: "desc" },
          take: 50,
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            order: { select: { id: true, orderNumber: true, totalAmount: true } },
          },
        },
        _count: { select: { redemptions: true } },
      },
    });
  } catch {
    res.status(400).json({ success: false, message: "Invalid coupon ID." });
    return;
  }

  if (!coupon) {
    res.status(404).json({ success: false, message: "Coupon not found." });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      ...serializeCoupon(coupon),
      redemptions: coupon.redemptions.map((r: any) => ({
        id: r.id.toString(),
        userId: r.userId.toString(),
        user: r.user
          ? {
              id: r.user.id.toString(),
              name: `${r.user.firstName} ${r.user.lastName}`,
              email: r.user.email,
            }
          : null,
        orderId: r.orderId.toString(),
        orderNumber: r.order?.orderNumber ?? null,
        discountAmount: r.discountAmount.toString(),
        createdAt: r.createdAt.toISOString(),
      })),
    },
  });
});

export const toggleCoupon = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const id = req.params.id as string;

  let coupon: any;
  try {
    coupon = await prisma.coupon.findUnique({ where: { id: BigInt(id) } });
  } catch {
    res.status(400).json({ success: false, message: "Invalid coupon ID." });
    return;
  }

  if (!coupon) {
    res.status(404).json({ success: false, message: "Coupon not found." });
    return;
  }

  const updated = await prisma.coupon.update({
    where: { id: coupon.id },
    data: { isActive: !coupon.isActive },
  });

  await logAdminAction({
    adminId: req.adminId!,
    action: coupon.isActive ? "DEACTIVATE_COUPON" : "ACTIVATE_COUPON",
    targetType: "coupon",
    targetId: id,
    meta: { code: coupon.code },
  });

  res.status(200).json({ success: true, data: serializeCoupon(updated) });
});

export const deleteCoupon = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const id = req.params.id as string;

  let coupon: any;
  try {
    coupon = await prisma.coupon.findUnique({
      where: { id: BigInt(id) },
      include: { _count: { select: { redemptions: true } } },
    });
  } catch {
    res.status(400).json({ success: false, message: "Invalid coupon ID." });
    return;
  }

  if (!coupon) {
    res.status(404).json({ success: false, message: "Coupon not found." });
    return;
  }

  if (coupon._count.redemptions > 0) {
    res.status(400).json({
      success: false,
      message: "Cannot delete a coupon that has been redeemed. Deactivate it instead.",
    });
    return;
  }

  await prisma.coupon.delete({ where: { id: coupon.id } });

  await logAdminAction({
    adminId: req.adminId!,
    action: "DELETE_COUPON",
    targetType: "coupon",
    targetId: id,
    meta: { code: coupon.code },
  });

  res.status(200).json({ success: true, message: "Coupon deleted." });
});
