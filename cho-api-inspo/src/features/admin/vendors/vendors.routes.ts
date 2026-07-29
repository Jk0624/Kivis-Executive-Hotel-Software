import { Router } from "express";
import {
  listVendors,
  getVendor,
  toggleVendorActive,
  listPendingVerifications,
  reviewRestaurantVerification,
} from "./vendors.controller.js";
import { requireRole } from "../../../middleware/admin/adminAuth.middleware.js";
import { AdminRole } from "../../../generated/prisma/enums.js";

const router = Router();

const supportOrSuper = requireRole(AdminRole.SUPPORT, AdminRole.SUPER_ADMIN);

// Specific paths must come before /:id to avoid being swallowed by the param route
router.get("/", supportOrSuper, listVendors);
router.get("/verifications/pending", supportOrSuper, listPendingVerifications);
router.post("/verifications/:id/review", supportOrSuper, reviewRestaurantVerification);
router.get("/:id", supportOrSuper, getVendor);
router.patch("/:id/toggle-active", supportOrSuper, toggleVendorActive);

export default router;
