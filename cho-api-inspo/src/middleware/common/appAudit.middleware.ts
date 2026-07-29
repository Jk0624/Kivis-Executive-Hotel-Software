import { NextFunction, Request, Response } from "express";
import { AppActorType } from "../../generated/prisma/client.js";
import { logAppAction } from "../../features/admin/app-audit.service.js";

type AppAuditRequest = Request & {
  userId?: string;
  vendorId?: string;
  riderId?: string;
};

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const TARGET_MAP: Record<string, string> = {
  addresses: "address",
  addons: "addon",
  auth: "auth",
  banners: "banner",
  categories: "category",
  coupons: "coupon",
  earnings: "earnings",
  foods: "food",
  notifications: "notification",
  orders: "order",
  packs: "pack",
  payments: "payment",
  "payment-details": "payment_detail",
  restaurants: "restaurant",
  verification: "verification",
  vehicle: "vehicle",
};

function actorIdFor(req: AppAuditRequest, actorType: AppActorType): string | undefined {
  if (actorType === AppActorType.USER) return req.userId;
  if (actorType === AppActorType.VENDOR) return req.vendorId;
  return req.riderId;
}

function cleanPath(path: string): string {
  return path.split("?")[0] || path;
}

function targetSegment(path: string): string {
  const parts = cleanPath(path).split("/").filter(Boolean);
  const apiIndex = parts.findIndex((part) => part === "v1");
  return parts[apiIndex + 1] ?? parts[0] ?? "unknown";
}

function targetTypeFor(path: string): string {
  const segment = targetSegment(path);
  return TARGET_MAP[segment] ?? segment.replace(/-/g, "_") ?? "unknown";
}

function targetIdFor(path: string): string | null {
  const parts = cleanPath(path).split("/").filter(Boolean);
  return [...parts].reverse().find((part) => /^\d+$/.test(part)) ?? null;
}

function actionFor(actorType: AppActorType, method: string, path: string): string {
  const verb =
    method === "POST"
      ? "CREATE"
      : method === "PUT" || method === "PATCH"
        ? "UPDATE"
        : "DELETE";
  return `${actorType}_${verb}_${targetTypeFor(path).toUpperCase()}`;
}

function shouldSkip(path: string): boolean {
  const lowered = path.toLowerCase();
  return (
    lowered.includes("/auth/login") ||
    lowered.includes("/auth/refresh") ||
    lowered.includes("/forgot-password") ||
    lowered.includes("/reset-password") ||
    lowered.includes("/change-password")
  );
}

export function auditAppActivity(actorType: AppActorType) {
  return (req: AppAuditRequest, res: Response, next: NextFunction) => {
    const method = req.method.toUpperCase();
    if (!MUTATING_METHODS.has(method) || shouldSkip(req.originalUrl)) {
      next();
      return;
    }

    res.on("finish", () => {
      if (res.statusCode < 200 || res.statusCode >= 400) return;

      const actorId = actorIdFor(req, actorType);
      if (!actorId) return;

      const path = cleanPath(req.originalUrl);
      logAppAction({
        actorType,
        actorId,
        action: actionFor(actorType, method, path),
        targetType: targetTypeFor(path),
        targetId: targetIdFor(path),
        method,
        path,
        statusCode: res.statusCode,
        meta: { query: req.query },
      }).catch((error) => {
        console.error("[app-audit] failed to write log", error);
      });
    });

    next();
  };
}
