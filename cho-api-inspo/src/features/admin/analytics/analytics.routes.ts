import { Router } from "express";
import { requireRole } from "../../../middleware/admin/adminAuth.middleware.js";
import { AdminRole } from "../../../generated/prisma/enums.js";
import { getFinancialSummary, getOrderTrend } from "./analytics.controller.js";

const router = Router();

const financeOrSuper = requireRole(AdminRole.FINANCE, AdminRole.SUPER_ADMIN);

router.get("/summary", financeOrSuper, getFinancialSummary);
router.get("/order-trend", financeOrSuper, getOrderTrend);

export default router;
