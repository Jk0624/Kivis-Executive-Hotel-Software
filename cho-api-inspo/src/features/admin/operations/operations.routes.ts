import { Router } from "express";
import { requireRole } from "../../../middleware/admin/adminAuth.middleware.js";
import { AdminRole } from "../../../generated/prisma/enums.js";
import { getOperationsSnapshot } from "./operations.controller.js";

const router = Router();

const supportOrSuper = requireRole(AdminRole.SUPPORT, AdminRole.SUPER_ADMIN);

router.get("/snapshot", supportOrSuper, getOperationsSnapshot);

export default router;
