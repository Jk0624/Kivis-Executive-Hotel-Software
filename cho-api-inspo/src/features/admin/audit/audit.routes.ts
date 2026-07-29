import { Router } from "express";
import { requireRole } from "../../../middleware/admin/adminAuth.middleware.js";
import { AdminRole } from "../../../generated/prisma/enums.js";
import { listAppAuditLogs, listAuditLogs } from "./audit.controller.js";

const router = Router();
const adminOnly = requireRole(AdminRole.SUPER_ADMIN);

router.get("/", adminOnly, listAuditLogs);
router.get("/apps", adminOnly, listAppAuditLogs);

export default router;
