import { Router } from "express";
import { requireRole } from "../../../middleware/admin/adminAuth.middleware.js";
import { AdminRole } from "../../../generated/prisma/enums.js";
import {
  listVendorWithdrawals,
  reviewVendorWithdrawal,
  processVendorWithdrawal,
  completeVendorWithdrawal,
  listRiderWithdrawals,
  reviewRiderWithdrawal,
  processRiderWithdrawal,
  completeRiderWithdrawal,
} from "./payouts.controller.js";

const router = Router();

const financeOrSuper = requireRole(AdminRole.FINANCE, AdminRole.SUPER_ADMIN);

// Vendor withdrawals
router.get("/vendors", financeOrSuper, listVendorWithdrawals);
router.post("/vendors/:id/review", financeOrSuper, reviewVendorWithdrawal);
router.patch("/vendors/:id/process", financeOrSuper, processVendorWithdrawal);
router.patch("/vendors/:id/complete", financeOrSuper, completeVendorWithdrawal);

// Rider withdrawals
router.get("/riders", financeOrSuper, listRiderWithdrawals);
router.post("/riders/:id/review", financeOrSuper, reviewRiderWithdrawal);
router.patch("/riders/:id/process", financeOrSuper, processRiderWithdrawal);
router.patch("/riders/:id/complete", financeOrSuper, completeRiderWithdrawal);

export default router;
