import { Response } from "express";
import asyncHandler from "express-async-handler";
import crypto from "crypto";
import { prisma } from "../../../prisma.js";
import { AdminRole } from "../../../generated/prisma/enums.js";
import { AdminAuthRequest } from "../../../middleware/admin/adminAuth.middleware.js";
import { hashPassword } from "../../../utils/password.js";
import { logAdminAction } from "../audit.service.js";
import { sendTemplateEmail } from "../../../utils/emails/email.service.js";

const DELETE_AFTER_DAYS = 30;
const CREATABLE_ADMIN_ROLES: AdminRole[] = [AdminRole.SUPER_ADMIN, AdminRole.SUPPORT];
const INVITE_EXPIRES_HOURS = 24;

function normalizeEmail(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function configuredManagerEmail(): string {
  return normalizeEmail(process.env.SUPER_ADMIN_EMAIL || process.env.SUPERADMIN_EMAIL);
}

function isManager(req: AdminAuthRequest): boolean {
  return normalizeEmail(req.admin?.email) === configuredManagerEmail();
}

function isProtectedEmail(email: string): boolean {
  const managerEmail = configuredManagerEmail();
  return !!managerEmail && normalizeEmail(email) === managerEmail;
}

function canDeleteAt(updatedAt: Date): Date {
  return new Date(updatedAt.getTime() + DELETE_AFTER_DAYS * 24 * 60 * 60 * 1000);
}

function serializeAdmin(admin: {
  id: bigint;
  firstName: string;
  lastName: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  inviteTokens?: Array<{ expiresAt: Date; usedAt: Date | null }>;
}) {
  const deleteAt = admin.isActive ? null : canDeleteAt(admin.updatedAt);
  const now = Date.now();
  const invite = admin.inviteTokens?.[0];
  const invitePending = !admin.isActive && !!invite && !invite.usedAt && invite.expiresAt.getTime() > now;

  return {
    id: admin.id.toString(),
    firstName: admin.firstName,
    lastName: admin.lastName,
    email: admin.email,
    role: admin.role,
    isActive: admin.isActive,
    invitePending,
    inviteExpiresAt: invitePending ? invite.expiresAt.toISOString() : null,
    isProtected: isProtectedEmail(admin.email),
    canDeleteNow:
      !isProtectedEmail(admin.email) &&
      (invitePending || (!!deleteAt && deleteAt.getTime() <= now)),
    canDeleteAt: deleteAt?.toISOString() ?? null,
    createdAt: admin.createdAt.toISOString(),
    updatedAt: admin.updatedAt.toISOString(),
  };
}

function requireManager(req: AdminAuthRequest, res: Response): boolean {
  if (!isManager(req)) {
    res.status(403).json({
      success: false,
      message: "Only the configured admin manager can manage admins.",
    });
    return false;
  }
  return true;
}

function generateInviteToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

function hashInviteToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function setupBaseUrl(): string {
  return (
    process.env.ADMIN_FRONTEND_URL ||
    process.env.ADMIN_DASHBOARD_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:3100"
  ).replace(/\/$/, "");
}

export const listAdmins = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const admins = await prisma.admin.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      inviteTokens: {
        where: { usedAt: null },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  res.status(200).json({
    success: true,
    data: admins.map(serializeAdmin),
    meta: {
      canManageAdmins: isManager(req),
      managerEmail: configuredManagerEmail(),
      deleteAfterDays: DELETE_AFTER_DAYS,
    },
  });
});

export const createAdmin = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  if (!requireManager(req, res)) return;

  const { firstName, lastName, email, role } = req.body as {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: AdminRole;
  };

  const cleanFirstName = firstName?.trim();
  const cleanLastName = lastName?.trim();
  const cleanEmail = normalizeEmail(email);

  if (!cleanFirstName || !cleanLastName || !cleanEmail || !role) {
    res.status(400).json({
      success: false,
      message: "First name, last name, email, and role are required.",
    });
    return;
  }

  if (!CREATABLE_ADMIN_ROLES.includes(role)) {
    res.status(400).json({ success: false, message: "Role must be Admin or Support." });
    return;
  }

  const existing = await prisma.admin.findUnique({ where: { email: cleanEmail } });
  if (existing) {
    res.status(409).json({ success: false, message: "An admin with this email already exists." });
    return;
  }

  const inviteToken = generateInviteToken();
  const tokenHash = hashInviteToken(inviteToken);
  const expiresAt = new Date(Date.now() + INVITE_EXPIRES_HOURS * 60 * 60 * 1000);
  const unusablePassword = await hashPassword(crypto.randomBytes(32).toString("base64url"));

  const admin = await prisma.$transaction(async (tx) => {
    const created = await tx.admin.create({
      data: {
        firstName: cleanFirstName,
        lastName: cleanLastName,
        email: cleanEmail,
        role,
        password: unusablePassword,
        isActive: false,
      },
    });

    await tx.adminInviteToken.create({
      data: {
        adminId: created.id,
        tokenHash,
        expiresAt,
      },
    });

    return created;
  });

  const setupLink = `${setupBaseUrl()}/internal-9k2x/setup-password?token=${encodeURIComponent(inviteToken)}`;

  try {
    await sendTemplateEmail(cleanEmail, "Admin_Invite", {
      name: cleanFirstName,
      setupLink,
      expiresInHours: INVITE_EXPIRES_HOURS,
    });
  } catch (error) {
    await prisma.admin.delete({ where: { id: admin.id } }).catch(() => undefined);
    throw error;
  }

  await logAdminAction({
    adminId: req.adminId!,
    action: "CREATE_ADMIN",
    targetType: "admin",
    targetId: admin.id.toString(),
    meta: { email: cleanEmail, role, inviteExpiresAt: expiresAt.toISOString() },
  });

  res.status(201).json({
    success: true,
    message: "Admin invitation sent.",
    data: {
      admin: serializeAdmin({
        ...admin,
        inviteTokens: [{ expiresAt, usedAt: null }],
      }),
    },
  });
});

export const disableAdmin = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  if (!requireManager(req, res)) return;

  const id = req.params.id as string;
  if (id === req.adminId) {
    res.status(400).json({ success: false, message: "You cannot disable your own admin account." });
    return;
  }

  const admin = await prisma.admin.findUnique({ where: { id: BigInt(id) } });
  if (!admin) {
    res.status(404).json({ success: false, message: "Admin not found." });
    return;
  }

  if (isProtectedEmail(admin.email)) {
    res.status(400).json({ success: false, message: "This admin account is protected." });
    return;
  }

  if (!admin.isActive) {
    res.status(400).json({ success: false, message: "Admin is already disabled." });
    return;
  }

  const updated = await prisma.admin.update({
    where: { id: BigInt(id) },
    data: { isActive: false },
  });

  await logAdminAction({
    adminId: req.adminId!,
    action: "DISABLE_ADMIN",
    targetType: "admin",
    targetId: id,
    meta: { email: admin.email },
  });

  res.status(200).json({ success: true, message: "Admin disabled.", data: serializeAdmin(updated) });
});

export const enableAdmin = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  if (!requireManager(req, res)) return;

  const id = req.params.id as string;
  const admin = await prisma.admin.findUnique({ where: { id: BigInt(id) } });
  if (!admin) {
    res.status(404).json({ success: false, message: "Admin not found." });
    return;
  }

  if (admin.isActive) {
    res.status(400).json({ success: false, message: "Admin is already active." });
    return;
  }

  const updated = await prisma.admin.update({
    where: { id: BigInt(id) },
    data: { isActive: true },
  });

  await logAdminAction({
    adminId: req.adminId!,
    action: "ENABLE_ADMIN",
    targetType: "admin",
    targetId: id,
    meta: { email: admin.email },
  });

  res.status(200).json({ success: true, message: "Admin enabled.", data: serializeAdmin(updated) });
});

export const updateAdminRole = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  if (!requireManager(req, res)) return;

  const id = req.params.id as string;
  const { role } = req.body as { role?: AdminRole };

  if (!role || !CREATABLE_ADMIN_ROLES.includes(role)) {
    res.status(400).json({ success: false, message: "Role must be Admin or Support." });
    return;
  }

  const admin = await prisma.admin.findUnique({ where: { id: BigInt(id) } });
  if (!admin) {
    res.status(404).json({ success: false, message: "Admin not found." });
    return;
  }

  if (isProtectedEmail(admin.email)) {
    res.status(400).json({ success: false, message: "This admin account is protected." });
    return;
  }

  const updated = await prisma.admin.update({
    where: { id: BigInt(id) },
    data: { role },
  });

  await logAdminAction({
    adminId: req.adminId!,
    action: "UPDATE_ADMIN_ROLE",
    targetType: "admin",
    targetId: id,
    meta: { email: admin.email, oldRole: admin.role, newRole: role },
  });

  res.status(200).json({ success: true, message: "Admin role updated.", data: serializeAdmin(updated) });
});

export const deleteAdmin = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  if (!requireManager(req, res)) return;

  const id = req.params.id as string;
  if (id === req.adminId) {
    res.status(400).json({ success: false, message: "You cannot delete your own admin account." });
    return;
  }

  const admin = await prisma.admin.findUnique({ where: { id: BigInt(id) } });
  if (!admin) {
    res.status(404).json({ success: false, message: "Admin not found." });
    return;
  }

  if (isProtectedEmail(admin.email)) {
    res.status(400).json({ success: false, message: "This admin account is protected." });
    return;
  }

  if (admin.isActive) {
    res.status(400).json({ success: false, message: "Disable this admin before deleting it." });
    return;
  }

  const pendingInvite = await prisma.adminInviteToken.findFirst({
    where: { adminId: admin.id, usedAt: null, expiresAt: { gt: new Date() } },
  });

  if (!pendingInvite) {
    const deleteAt = canDeleteAt(admin.updatedAt);
    if (deleteAt.getTime() > Date.now()) {
      res.status(400).json({
        success: false,
        message: `Admin can be deleted after ${deleteAt.toISOString()}.`,
      });
      return;
    }
  }

  await prisma.$transaction([
    prisma.adminInviteToken.deleteMany({ where: { adminId: BigInt(id) } }),
    prisma.adminAuditLog.deleteMany({ where: { adminId: BigInt(id) } }),
    prisma.admin.delete({ where: { id: BigInt(id) } }),
  ]);

  await logAdminAction({
    adminId: req.adminId!,
    action: "DELETE_ADMIN",
    targetType: "admin",
    targetId: id,
    meta: { email: admin.email },
  });

  res.status(200).json({ success: true, message: "Admin deleted.", data: { id } });
});
