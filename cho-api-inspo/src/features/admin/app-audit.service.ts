import { prisma } from "../../prisma.js";
import { AppActorType, Prisma } from "../../generated/prisma/client.js";

export const logAppAction = async (params: {
  actorType: AppActorType;
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  method: string;
  path: string;
  statusCode: number;
  meta?: Record<string, unknown>;
}) => {
  await prisma.appAuditLog.create({
    data: {
      actorType: params.actorType,
      actorId: BigInt(params.actorId),
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId ?? null,
      method: params.method,
      path: params.path.slice(0, 500),
      statusCode: params.statusCode,
      meta: params.meta ? (params.meta as Prisma.InputJsonValue) : Prisma.DbNull,
    },
  });
};
