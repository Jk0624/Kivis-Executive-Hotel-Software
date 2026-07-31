import { prisma } from "../../prisma.js";
import { Prisma } from "../../generated/prisma/client.js";

export const logAdminAction = async (params: {
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  meta?: Record<string, unknown>;
}) => {
  await prisma.adminAuditLog.create({
    data: {
      adminId: BigInt(params.adminId),
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      meta: params.meta ? (params.meta as Prisma.InputJsonValue) : Prisma.DbNull,
    },
  });
};
