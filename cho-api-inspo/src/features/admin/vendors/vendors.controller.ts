import { Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";
import { AdminAuthRequest } from "../../../middleware/admin/adminAuth.middleware.js";
import { logAdminAction } from "../audit.service.js";
import { VerificationStatus } from "../../../generated/prisma/enums.js";
import { sendTemplateEmail } from "../../../utils/emails/email.service.js";

export const listVendors = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const { search, isActive, page = "1", limit = "20" } = req.query as any;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (isActive !== undefined) where.isActive = isActive === "true";
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { restaurants: { some: { name: { contains: search, mode: "insensitive" } } } },
    ];
  }

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, firstName: true, lastName: true, email: true,
        phone: true, isActive: true, createdAt: true,
        restaurants: {
          select: { id: true, name: true },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { restaurants: true } },
      },
    }),
    prisma.vendor.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: vendors.map((v) => ({
      ...v,
      id: v.id.toString(),
      restaurants: v.restaurants.map((r) => ({ id: r.id.toString(), name: r.name })),
      restaurantCount: v._count.restaurants,
      _count: undefined,
    })),
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
});

export const getVendor = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const id = req.params.id as string;

  if (!/^\d+$/.test(id)) {
    res.status(404).json({ success: false, message: "Vendor not found." });
    return;
  }

  const vendor = await prisma.vendor.findUnique({
    where: { id: BigInt(id) },
    select: {
      id: true, firstName: true, lastName: true, email: true, phone: true,
      isActive: true,
      isPersonalInfoComplete: true, createdAt: true,
      restaurants: {
        select: {
          id: true, name: true, addressLine: true, status: true,
          verificationStatus: true, createdAt: true,
        },
      },
    },
  });

  if (!vendor) {
    res.status(404).json({ success: false, message: "Vendor not found." });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      ...vendor,
      id: vendor.id.toString(),
      restaurants: vendor.restaurants.map((r) => ({ ...r, id: r.id.toString() })),
    },
  });
});

export const toggleVendorActive = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const id = req.params.id as string;

  const vendor = await prisma.vendor.findUnique({ where: { id: BigInt(id) } });
  if (!vendor) {
    res.status(404).json({ success: false, message: "Vendor not found." });
    return;
  }

  const updated = await prisma.vendor.update({
    where: { id: BigInt(id) },
    data: {
      isActive: !vendor.isActive,
      ...(!vendor.isActive && { deletionRequestedAt: null }),
    },
    select: { id: true, isActive: true, firstName: true, email: true },
  });

  await logAdminAction({
    adminId: req.adminId!,
    action: updated.isActive ? "UNBLOCK_VENDOR" : "BLOCK_VENDOR",
    targetType: "vendor",
    targetId: id,
  });

  if (!updated.isActive && updated.email) {
    sendTemplateEmail(updated.email, "Admin_Account_Blocked", {
      name: updated.firstName,
      reason: "Your account has been suspended by an administrator.",
    }).catch(() => {});
  }

  res.status(200).json({
    success: true,
    message: updated.isActive ? "Vendor unblocked." : "Vendor blocked.",
    data: { id: updated.id.toString(), isActive: updated.isActive },
  });
});

// ─── Restaurant Verification ──────────────────────────────────────────────────

export const listPendingVerifications = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const { page = "1", limit = "20" } = req.query as any;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const where = { verificationStatus: VerificationStatus.UNDER_REVIEW };

  const [restaurants, total] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { updatedAt: "asc" },
      select: {
        id: true, name: true, addressLine: true, verificationStatus: true,
        isInfoComplete: true, isPaymentInfoComplete: true, updatedAt: true,
        vendor: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      },
    }),
    prisma.restaurant.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: restaurants.map((r) => ({
      ...r,
      id: r.id.toString(),
      vendor: r.vendor ? { ...r.vendor, id: r.vendor.id.toString() } : null,
    })),
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
});

export const reviewRestaurantVerification = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { action, reason } = req.body as { action: "approve" | "reject"; reason?: string };

  if (!action || !["approve", "reject"].includes(action)) {
    res.status(400).json({ success: false, message: "Action must be 'approve' or 'reject'." });
    return;
  }

  if (action === "reject" && !reason?.trim()) {
    res.status(400).json({ success: false, message: "A reason is required when rejecting." });
    return;
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: BigInt(id) },
    include: { vendor: { select: { firstName: true, email: true } } },
  });

  if (!restaurant) {
    res.status(404).json({ success: false, message: "Restaurant not found." });
    return;
  }

  if (restaurant.verificationStatus !== VerificationStatus.UNDER_REVIEW) {
    res.status(400).json({
      success: false,
      message: `Restaurant is not under review (current status: ${restaurant.verificationStatus}).`,
    });
    return;
  }

  const newStatus = action === "approve" ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED;

  const updated = await prisma.restaurant.update({
    where: { id: BigInt(id) },
    data: {
      verificationStatus: newStatus,
      ...(action === "approve" && { status: "ACTIVE" }),
    },
    select: { id: true, name: true, verificationStatus: true },
  });

  await logAdminAction({
    adminId: req.adminId!,
    action: action === "approve" ? "APPROVE_RESTAURANT" : "REJECT_RESTAURANT",
    targetType: "restaurant",
    targetId: id,
    meta: reason ? { reason } : undefined,
  });

  if (restaurant.vendor?.email) {
    const templateName = action === "approve" ? "Admin_Verification_Approved" : "Admin_Verification_Rejected";
    sendTemplateEmail(restaurant.vendor.email, templateName, {
      name: restaurant.vendor.firstName,
      reason: reason ?? "",
    }).catch(() => {});
  }

  res.status(200).json({
    success: true,
    message: action === "approve" ? "Restaurant verified." : "Restaurant rejected.",
    data: { id: updated.id.toString(), name: updated.name, verificationStatus: updated.verificationStatus },
  });
});
