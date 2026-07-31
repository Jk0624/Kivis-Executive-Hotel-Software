import { Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";
import { AdminAuthRequest } from "../../../middleware/admin/adminAuth.middleware.js";
import { logAdminAction } from "../audit.service.js";
import { WithdrawalStatus } from "../../../generated/prisma/enums.js";

// ─── Vendor withdrawal requests ───────────────────────────────────────────────

export const listVendorWithdrawals = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const { status, page = "1", limit = "20" } = req.query as any;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (status) where.status = status;

  const [requests, total] = await Promise.all([
    prisma.vendorWithdrawalRequest.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
      include: {
        restaurant: { select: { id: true, name: true, vendor: { select: { id: true, firstName: true, lastName: true, email: true } } } },
      },
    }),
    prisma.vendorWithdrawalRequest.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: requests.map((r) => ({
      ...r,
      id: r.id.toString(),
      restaurantId: r.restaurantId.toString(),
      amount: Number(r.amount).toFixed(2),
      restaurant: {
        id: r.restaurant.id.toString(),
        name: r.restaurant.name,
        vendor: r.restaurant.vendor
          ? { ...r.restaurant.vendor, id: r.restaurant.vendor.id.toString() }
          : null,
      },
    })),
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
});

export const reviewVendorWithdrawal = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { action, adminNote } = req.body as { action: "approve" | "reject"; adminNote?: string };

  if (!action || !["approve", "reject"].includes(action)) {
    res.status(400).json({ success: false, message: "Action must be 'approve' or 'reject'." });
    return;
  }

  const request = await prisma.vendorWithdrawalRequest.findUnique({ where: { id: BigInt(id) } });
  if (!request) { res.status(404).json({ success: false, message: "Withdrawal request not found." }); return; }

  if (request.status !== WithdrawalStatus.PENDING) {
    res.status(400).json({ success: false, message: `Request is already ${request.status}.` });
    return;
  }

  const newStatus = action === "approve" ? WithdrawalStatus.APPROVED : WithdrawalStatus.REJECTED;

  const updated = await prisma.vendorWithdrawalRequest.update({
    where: { id: BigInt(id) },
    data: { status: newStatus, adminNote: adminNote ?? null },
    select: { id: true, status: true },
  });

  await logAdminAction({
    adminId: req.adminId!,
    action: action === "approve" ? "APPROVE_VENDOR_WITHDRAWAL" : "REJECT_VENDOR_WITHDRAWAL",
    targetType: "vendor_withdrawal",
    targetId: id,
    meta: adminNote ? { adminNote } : undefined,
  });

  res.status(200).json({
    success: true,
    message: action === "approve" ? "Withdrawal approved." : "Withdrawal rejected.",
    data: { id: updated.id.toString(), status: updated.status },
  });
});

export const processVendorWithdrawal = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const id = req.params.id as string;

  const request = await prisma.vendorWithdrawalRequest.findUnique({ where: { id: BigInt(id) } });
  if (!request) { res.status(404).json({ success: false, message: "Withdrawal request not found." }); return; }

  if (request.status !== WithdrawalStatus.APPROVED) {
    res.status(400).json({ success: false, message: `Request must be APPROVED before processing (current: ${request.status}).` });
    return;
  }

  const updated = await prisma.vendorWithdrawalRequest.update({
    where: { id: BigInt(id) },
    data: { status: WithdrawalStatus.PROCESSING, processedAt: new Date() },
    select: { id: true, status: true },
  });

  await logAdminAction({ adminId: req.adminId!, action: "PROCESS_VENDOR_WITHDRAWAL", targetType: "vendor_withdrawal", targetId: id });

  res.status(200).json({ success: true, message: "Withdrawal marked as processing.", data: { id: updated.id.toString(), status: updated.status } });
});

export const completeVendorWithdrawal = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const id = req.params.id as string;

  const request = await prisma.vendorWithdrawalRequest.findUnique({ where: { id: BigInt(id) } });
  if (!request) { res.status(404).json({ success: false, message: "Withdrawal request not found." }); return; }

  if (request.status !== WithdrawalStatus.PROCESSING) {
    res.status(400).json({ success: false, message: `Request must be PROCESSING before completing (current: ${request.status}).` });
    return;
  }

  const updated = await prisma.vendorWithdrawalRequest.update({
    where: { id: BigInt(id) },
    data: { status: WithdrawalStatus.COMPLETED },
    select: { id: true, status: true },
  });

  await logAdminAction({ adminId: req.adminId!, action: "COMPLETE_VENDOR_WITHDRAWAL", targetType: "vendor_withdrawal", targetId: id });

  res.status(200).json({ success: true, message: "Withdrawal completed.", data: { id: updated.id.toString(), status: updated.status } });
});

// ─── Rider withdrawal requests ────────────────────────────────────────────────

export const listRiderWithdrawals = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const { status, page = "1", limit = "20" } = req.query as any;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (status) where.status = status;

  const [requests, total] = await Promise.all([
    prisma.riderWithdrawalRequest.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
      include: {
        rider: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      },
    }),
    prisma.riderWithdrawalRequest.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: requests.map((r) => ({
      ...r,
      id: r.id.toString(),
      riderId: r.riderId.toString(),
      amount: Number(r.amount).toFixed(2),
      rider: r.rider ? { ...r.rider, id: r.rider.id.toString() } : null,
    })),
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
});

export const reviewRiderWithdrawal = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { action, adminNote } = req.body as { action: "approve" | "reject"; adminNote?: string };

  if (!action || !["approve", "reject"].includes(action)) {
    res.status(400).json({ success: false, message: "Action must be 'approve' or 'reject'." });
    return;
  }

  const request = await prisma.riderWithdrawalRequest.findUnique({ where: { id: BigInt(id) } });
  if (!request) { res.status(404).json({ success: false, message: "Withdrawal request not found." }); return; }

  if (request.status !== WithdrawalStatus.PENDING) {
    res.status(400).json({ success: false, message: `Request is already ${request.status}.` });
    return;
  }

  const newStatus = action === "approve" ? WithdrawalStatus.APPROVED : WithdrawalStatus.REJECTED;

  const updated = await prisma.riderWithdrawalRequest.update({
    where: { id: BigInt(id) },
    data: { status: newStatus, adminNote: adminNote ?? null },
    select: { id: true, status: true },
  });

  await logAdminAction({
    adminId: req.adminId!,
    action: action === "approve" ? "APPROVE_RIDER_WITHDRAWAL" : "REJECT_RIDER_WITHDRAWAL",
    targetType: "rider_withdrawal",
    targetId: id,
    meta: adminNote ? { adminNote } : undefined,
  });

  res.status(200).json({
    success: true,
    message: action === "approve" ? "Withdrawal approved." : "Withdrawal rejected.",
    data: { id: updated.id.toString(), status: updated.status },
  });
});

export const processRiderWithdrawal = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const id = req.params.id as string;

  const request = await prisma.riderWithdrawalRequest.findUnique({ where: { id: BigInt(id) } });
  if (!request) { res.status(404).json({ success: false, message: "Withdrawal request not found." }); return; }

  if (request.status !== WithdrawalStatus.APPROVED) {
    res.status(400).json({ success: false, message: `Request must be APPROVED before processing (current: ${request.status}).` });
    return;
  }

  const updated = await prisma.riderWithdrawalRequest.update({
    where: { id: BigInt(id) },
    data: { status: WithdrawalStatus.PROCESSING, processedAt: new Date() },
    select: { id: true, status: true },
  });

  await logAdminAction({ adminId: req.adminId!, action: "PROCESS_RIDER_WITHDRAWAL", targetType: "rider_withdrawal", targetId: id });

  res.status(200).json({ success: true, message: "Withdrawal marked as processing.", data: { id: updated.id.toString(), status: updated.status } });
});

export const completeRiderWithdrawal = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const id = req.params.id as string;

  const request = await prisma.riderWithdrawalRequest.findUnique({ where: { id: BigInt(id) } });
  if (!request) { res.status(404).json({ success: false, message: "Withdrawal request not found." }); return; }

  if (request.status !== WithdrawalStatus.PROCESSING) {
    res.status(400).json({ success: false, message: `Request must be PROCESSING before completing (current: ${request.status}).` });
    return;
  }

  const updated = await prisma.riderWithdrawalRequest.update({
    where: { id: BigInt(id) },
    data: { status: WithdrawalStatus.COMPLETED },
    select: { id: true, status: true },
  });

  await logAdminAction({ adminId: req.adminId!, action: "COMPLETE_RIDER_WITHDRAWAL", targetType: "rider_withdrawal", targetId: id });

  res.status(200).json({ success: true, message: "Withdrawal completed.", data: { id: updated.id.toString(), status: updated.status } });
});
