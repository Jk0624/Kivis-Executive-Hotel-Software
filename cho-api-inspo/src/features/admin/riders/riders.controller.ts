import { Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";
import { AdminAuthRequest } from "../../../middleware/admin/adminAuth.middleware.js";
import { logAdminAction } from "../audit.service.js";
import { VerificationStatus } from "../../../generated/prisma/enums.js";
import { sendTemplateEmail } from "../../../utils/emails/email.service.js";
import { generateSignedUrl } from "../../../utils/s3.js";

export const listRiders = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const { search, isActive, verificationStatus, page = "1", limit = "20" } = req.query as any;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (isActive !== undefined) where.isActive = isActive === "true";
  if (verificationStatus) where.verificationStatus = verificationStatus;
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  const [riders, total] = await Promise.all([
    prisma.rider.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, firstName: true, lastName: true, email: true,
        phone: true, isActive: true, verificationStatus: true, createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.rider.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: riders.map((r) => ({
      ...r, id: r.id.toString(), orderCount: r._count.orders, _count: undefined,
    })),
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
});

export const getRider = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const id = req.params.id as string;

  const rider = await prisma.rider.findUnique({
    where: { id: BigInt(id) },
    select: {
      id: true, firstName: true, lastName: true, email: true, phone: true,
      gender: true, nationality: true, dob: true, isActive: true,
      isPersonalInfoComplete: true, isPaymentInfoComplete: true,
      verificationStatus: true, createdAt: true,
      vehicleInfo: {
        select: {
          vehicleType: true, vehicleBrand: true, numberPlate: true,
          idFrontKey: true, idBackKey: true, isInfoComplete: true,
        },
      },
      paymentDetails: {
        select: {
          id: true, method: true, bankName: true, network: true,
          phone: true, accountName: true, accountNumber: true, isDefault: true,
        },
        orderBy: { isDefault: "desc" },
      },
      _count: { select: { orders: true } },
    },
  });

  if (!rider) {
    res.status(404).json({ success: false, message: "Rider not found." });
    return;
  }

  // Strip raw object keys — never expose them to the client. Replace with
  // boolean indicators; signed image URLs are fetched via getRiderIdDoc.
  const { idFrontKey, idBackKey, ...vehicleRest } = rider.vehicleInfo ?? {} as any;
  const vehicleInfo = rider.vehicleInfo
    ? { ...vehicleRest, hasIdFront: !!idFrontKey, hasIdBack: !!idBackKey }
    : null;

  res.status(200).json({
    success: true,
    data: {
      ...rider,
      id: rider.id.toString(),
      orderCount: rider._count.orders,
      _count: undefined,
      vehicleInfo,
      paymentDetails: rider.paymentDetails.map((p) => ({ ...p, id: p.id.toString() })),
    },
  });
});

/**
 * Returns a short-lived signed URL for one of the rider's ID document images.
 * SUPER_ADMIN only — restricted at the route layer. Every successful grant is
 * audit-logged so we always know which admin viewed which document and when.
 *
 * To open this to SUPPORT later, change the role list on the route — no
 * controller changes needed.
 */
export const getRiderIdDoc = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const id = req.params.id as string;
  const side = (req.query.side as string)?.toLowerCase();

  if (side !== "front" && side !== "back") {
    res.status(400).json({ success: false, message: "Query 'side' must be 'front' or 'back'." });
    return;
  }

  const vehicle = await prisma.riderVehicleInfo.findUnique({
    where: { riderId: BigInt(id) },
    select: { idFrontKey: true, idBackKey: true },
  });

  const key = side === "front" ? vehicle?.idFrontKey : vehicle?.idBackKey;
  if (!key) {
    res.status(404).json({ success: false, message: "Document not uploaded." });
    return;
  }

  const expiresIn = 900; // 15 min
  const url = await generateSignedUrl(key, expiresIn);

  await logAdminAction({
    adminId: req.adminId!,
    action: "VIEW_RIDER_ID_DOC",
    targetType: "rider",
    targetId: id,
    meta: { side },
  });

  res.status(200).json({
    success: true,
    data: { url, expiresIn },
  });
});

export const toggleRiderActive = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const id = req.params.id as string;

  const rider = await prisma.rider.findUnique({ where: { id: BigInt(id) } });
  if (!rider) {
    res.status(404).json({ success: false, message: "Rider not found." });
    return;
  }

  const updated = await prisma.rider.update({
    where: { id: BigInt(id) },
    data: {
      isActive: !rider.isActive,
      ...(!rider.isActive && { deletionRequestedAt: null }),
    },
    select: { id: true, isActive: true, firstName: true, email: true },
  });

  await logAdminAction({
    adminId: req.adminId!,
    action: updated.isActive ? "UNBLOCK_RIDER" : "BLOCK_RIDER",
    targetType: "rider",
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
    message: updated.isActive ? "Rider unblocked." : "Rider blocked.",
    data: { id: updated.id.toString(), isActive: updated.isActive },
  });
});

export const listPendingRiderVerifications = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const { page = "1", limit = "20" } = req.query as any;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const where = { verificationStatus: VerificationStatus.UNDER_REVIEW };

  const [riders, total] = await Promise.all([
    prisma.rider.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { updatedAt: "asc" },
      select: {
        id: true, firstName: true, lastName: true, email: true, phone: true,
        verificationStatus: true, isPersonalInfoComplete: true,
        isPaymentInfoComplete: true, updatedAt: true,
        vehicleInfo: {
          select: { vehicleType: true, vehicleBrand: true, isInfoComplete: true },
        },
      },
    }),
    prisma.rider.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: riders.map((r) => ({ ...r, id: r.id.toString() })),
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
});

export const reviewRiderVerification = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
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

  const rider = await prisma.rider.findUnique({ where: { id: BigInt(id) } });
  if (!rider) {
    res.status(404).json({ success: false, message: "Rider not found." });
    return;
  }

  if (rider.verificationStatus !== VerificationStatus.UNDER_REVIEW) {
    res.status(400).json({
      success: false,
      message: `Rider is not under review (current status: ${rider.verificationStatus}).`,
    });
    return;
  }

  const newStatus = action === "approve" ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED;

  const updated = await prisma.rider.update({
    where: { id: BigInt(id) },
    data: { verificationStatus: newStatus },
    select: { id: true, firstName: true, email: true, verificationStatus: true },
  });

  await logAdminAction({
    adminId: req.adminId!,
    action: action === "approve" ? "APPROVE_RIDER" : "REJECT_RIDER",
    targetType: "rider",
    targetId: id,
    meta: reason ? { reason } : undefined,
  });

  if (updated.email) {
    const templateName = action === "approve" ? "Admin_Verification_Approved" : "Admin_Verification_Rejected";
    sendTemplateEmail(updated.email, templateName, {
      name: updated.firstName,
      reason: reason ?? "",
    }).catch(() => {});
  }

  res.status(200).json({
    success: true,
    message: action === "approve" ? "Rider verified." : "Rider rejected.",
    data: { id: updated.id.toString(), verificationStatus: updated.verificationStatus },
  });
});
