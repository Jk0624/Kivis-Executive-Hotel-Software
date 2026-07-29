import { Router } from "express";
import {
  listRiders,
  getRider,
  getRiderIdDoc,
  toggleRiderActive,
  listPendingRiderVerifications,
  reviewRiderVerification,
} from "./riders.controller.js";
import { requireRole } from "../../../middleware/admin/adminAuth.middleware.js";
import { AdminRole } from "../../../generated/prisma/enums.js";

const router = Router();

const supportOrSuper = requireRole(AdminRole.SUPPORT, AdminRole.SUPER_ADMIN);
// Single source of truth: who can view rider ID documents. To grant SUPPORT
// access in future, add AdminRole.SUPPORT to this list — nothing else changes.
const canViewIdDocs = requireRole(AdminRole.SUPER_ADMIN);

router.get("/", supportOrSuper, listRiders);
router.get("/verifications/pending", supportOrSuper, listPendingRiderVerifications);
router.get("/:id", supportOrSuper, getRider);
router.get("/:id/id-doc", canViewIdDocs, getRiderIdDoc);
router.patch("/:id/toggle-active", supportOrSuper, toggleRiderActive);
router.post("/verifications/:id/review", supportOrSuper, reviewRiderVerification);

export default router;
