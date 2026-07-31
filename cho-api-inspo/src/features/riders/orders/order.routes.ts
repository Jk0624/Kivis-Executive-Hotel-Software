import { Router } from "express";
import {
  getAvailableOrders,
  getMyOrders,
  getOrderDetail,
  acceptOrder,
  pickupOrder,
  deliverOrder,
} from "./order.controller.js";

const router = Router();

router.get("/", getAvailableOrders);
router.get("/my-orders", getMyOrders);
router.get("/:id", getOrderDetail);
router.put("/:id/accept", acceptOrder);
router.put("/:id/pickup", pickupOrder);
router.put("/:id/deliver", deliverOrder);

export default router;
