import { Response } from "express";
import asyncHandler from "express-async-handler";
import { AppActorType, Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../../prisma.js";
import { AdminAuthRequest } from "../../../middleware/admin/adminAuth.middleware.js";
import { startOfDayUTC, endOfDayUTC } from "../../../utils/dateRange.js";

function parsePage(value: unknown): number {
  const parsed = Number(value ?? 1);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

function parseLimit(value: unknown): number {
  const parsed = Number(value ?? 20);
  if (!Number.isFinite(parsed)) return 20;
  return Math.min(100, Math.max(1, Math.floor(parsed)));
}

export const listAuditLogs = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const {
    search,
    action,
    targetType,
    adminId,
    dateFrom,
    dateTo,
    page,
    limit,
  } = req.query as Record<string, string | undefined>;

  const pageNum = parsePage(page);
  const limitNum = parseLimit(limit);
  const skip = (pageNum - 1) * limitNum;

  const where: Prisma.AdminAuditLogWhereInput = {};

  if (action) where.action = action;
  if (targetType) where.targetType = targetType;
  if (adminId) where.adminId = BigInt(adminId);
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = startOfDayUTC(dateFrom);
    if (dateTo) where.createdAt.lte = endOfDayUTC(dateTo);
  }

  const cleanSearch = search?.trim();
  if (cleanSearch) {
    where.OR = [
      { action: { contains: cleanSearch, mode: "insensitive" } },
      { targetType: { contains: cleanSearch, mode: "insensitive" } },
      { targetId: { contains: cleanSearch, mode: "insensitive" } },
      { admin: { firstName: { contains: cleanSearch, mode: "insensitive" } } },
      { admin: { lastName: { contains: cleanSearch, mode: "insensitive" } } },
      { admin: { email: { contains: cleanSearch, mode: "insensitive" } } },
    ];
  }

  const [logs, total] = await Promise.all([
    prisma.adminAuditLog.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
      include: {
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    }),
    prisma.adminAuditLog.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: logs.map((log) => ({
      id: log.id.toString(),
      action: log.action,
      targetType: log.targetType,
      targetId: log.targetId,
      meta: log.meta ?? null,
      createdAt: log.createdAt.toISOString(),
      admin: {
        id: log.admin.id.toString(),
        firstName: log.admin.firstName,
        lastName: log.admin.lastName,
        email: log.admin.email,
        role: log.admin.role,
      },
    })),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

export const listAppAuditLogs = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const {
    search,
    action,
    targetType,
    actorType,
    actorId,
    dateFrom,
    dateTo,
    page,
    limit,
  } = req.query as Record<string, string | undefined>;

  const pageNum = parsePage(page);
  const limitNum = parseLimit(limit);
  const skip = (pageNum - 1) * limitNum;

  const where: Prisma.AppAuditLogWhereInput = {};

  if (action) where.action = action;
  if (targetType) where.targetType = targetType;
  if (actorId) where.actorId = BigInt(actorId);
  if (
    actorType === AppActorType.USER ||
    actorType === AppActorType.VENDOR ||
    actorType === AppActorType.RIDER
  ) {
    where.actorType = actorType;
  }
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = startOfDayUTC(dateFrom);
    if (dateTo) where.createdAt.lte = endOfDayUTC(dateTo);
  }

  const cleanSearch = search?.trim();
  if (cleanSearch) {
    where.OR = [
      { action: { contains: cleanSearch, mode: "insensitive" } },
      { targetType: { contains: cleanSearch, mode: "insensitive" } },
      { targetId: { contains: cleanSearch, mode: "insensitive" } },
      { path: { contains: cleanSearch, mode: "insensitive" } },
    ];
  }

  const [logs, total] = await Promise.all([
    prisma.appAuditLog.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
    }),
    prisma.appAuditLog.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: logs.map((log) => ({
      id: log.id.toString(),
      actorType: log.actorType,
      actorId: log.actorId.toString(),
      action: log.action,
      targetType: log.targetType,
      targetId: log.targetId,
      method: log.method,
      path: log.path,
      statusCode: log.statusCode,
      meta: log.meta ?? null,
      createdAt: log.createdAt.toISOString(),
    })),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});
