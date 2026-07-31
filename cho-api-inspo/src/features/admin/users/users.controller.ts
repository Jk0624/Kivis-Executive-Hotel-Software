import { Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";
import { AdminAuthRequest } from "../../../middleware/admin/adminAuth.middleware.js";
import { logAdminAction } from "../audit.service.js";

export const lookupUser = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const { identifier } = req.query as { identifier?: string };

  if (!identifier?.trim()) {
    res.status(400).json({ success: false, message: "identifier query param is required." });
    return;
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier.trim() }, { phone: identifier.trim() }],
      deletedAt: null,
    },
    select: { id: true, firstName: true, lastName: true, email: true, phone: true, isActive: true },
  });

  if (!user) {
    res.status(404).json({ success: false, message: "No user found with that email or phone." });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      id: user.id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
    },
  });
});

export const listUsers = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const { search, isActive, page = "1", limit = "20" } = req.query as any;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const where: any = { deletedAt: null };
  if (isActive !== undefined) where.isActive = isActive === "true";
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, firstName: true, lastName: true, email: true,
        phone: true, isActive: true, createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: users.map((u) => ({
      ...u,
      id: u.id.toString(),
      orderCount: u._count.orders,
      _count: undefined,
    })),
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
});

export const getUser = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const id = req.params.id as string;

  const user = await prisma.user.findUnique({
    where: { id: BigInt(id) },
    select: {
      id: true, firstName: true, lastName: true, email: true,
      phone: true, gender: true, dob: true, isActive: true, createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  if (!user) {
    res.status(404).json({ success: false, message: "User not found." });
    return;
  }

  res.status(200).json({
    success: true,
    data: { ...user, id: user.id.toString(), orderCount: user._count.orders, _count: undefined },
  });
});

export const toggleUserActive = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const id = req.params.id as string;

  const user = await prisma.user.findUnique({ where: { id: BigInt(id) } });
  if (!user) {
    res.status(404).json({ success: false, message: "User not found." });
    return;
  }

  const updated = await prisma.user.update({
    where: { id: BigInt(id) },
    data: { isActive: !user.isActive },
    select: { id: true, isActive: true },
  });

  await logAdminAction({
    adminId: req.adminId!,
    action: updated.isActive ? "UNBLOCK_USER" : "BLOCK_USER",
    targetType: "user",
    targetId: id,
  });

  res.status(200).json({
    success: true,
    message: updated.isActive ? "User unblocked." : "User blocked.",
    data: { id: updated.id.toString(), isActive: updated.isActive },
  });
});
