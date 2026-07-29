import { Router } from "express";
import {
  getVendorOrders,
  getVendorOrder,
  acceptOrder,
  rejectOrder,
  markOrderReady,
  startPreparingOrder,
} from "./order.controller.js";

const router = Router();

router.get("/", getVendorOrders);
router.get("/:id", getVendorOrder);
router.put("/:id/accept", acceptOrder);
router.put("/:id/reject", rejectOrder);
router.put("/:id/prepare", startPreparingOrder);
router.put("/:id/ready", markOrderReady);

export default router;
