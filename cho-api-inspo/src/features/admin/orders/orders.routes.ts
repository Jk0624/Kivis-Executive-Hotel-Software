import { Router } from "express";
import {
  listOrders,
  getOrder,
  adminAcceptOrder,
  adminPrepareOrder,
  adminMarkReady,
  adminCancelOrder,
  adminDispatchOrder,
  adminPickupOrder,
  adminDeliverOrder,
  listEligibleRiders,
  assignRider,
  adminMarkOrderPaid,
  adminOverrideOrderStatus,
} from "./orders.controller.js";
import { requireRole } from "../../../middleware/admin/adminAuth.middleware.js";
import { AdminRole } from "../../../generated/prisma/enums.js";

const router = Router();

const supportOrSuper = requireRole(AdminRole.SUPPORT, AdminRole.SUPER_ADMIN);
// Override status is a deliberate deviation from the documented state
// machine — restrict to SUPER_ADMIN. To widen later, add roles here AND
// double-check the audit-log retention story.
const superOnly = requireRole(AdminRole.SUPER_ADMIN);

router.get("/", supportOrSuper, listOrders);
// Static path must come before "/:id" or Express treats "eligible-riders" as an id.
router.get("/eligible-riders", supportOrSuper, listEligibleRiders);
router.get("/:id", supportOrSuper, getOrder);

// Act as restaurant
router.put("/:id/accept", supportOrSuper, adminAcceptOrder);
router.put("/:id/prepare", supportOrSuper, adminPrepareOrder);
router.put("/:id/ready", supportOrSuper, adminMarkReady);

// Cancel at any non-terminal stage (replaces the old PENDING-only /reject)
router.put("/:id/cancel", supportOrSuper, adminCancelOrder);

// Act as rider (admin dispatch)
router.put("/:id/dispatch", supportOrSuper, adminDispatchOrder);
router.put("/:id/pickup", supportOrSuper, adminPickupOrder);
router.put("/:id/deliver", supportOrSuper, adminDeliverOrder);

// Assign / reassign a real rider
router.put("/:id/assign-rider", supportOrSuper, assignRider);

// Dispute resolution
router.put("/:id/mark-paid", supportOrSuper, adminMarkOrderPaid);
router.put("/:id/override-status", superOnly, adminOverrideOrderStatus);

export default router;
