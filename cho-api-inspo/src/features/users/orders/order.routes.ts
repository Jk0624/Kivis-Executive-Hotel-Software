import { Router } from "express";
import {
  createOrder,
  getAllOrders,
  getSingleOrder,
  updateOrderStatus,
  cancelOrder,
  getUserOrders,
} from "./order.controller.js";

const router = Router();

router.post("/", createOrder);
router.get("/", getAllOrders);
router.get("/users/:userId", getUserOrders); // Must come before /:id route
router.get("/:id", getSingleOrder);
router.put("/:id/status", updateOrderStatus);
router.delete("/:id", cancelOrder);

export default router;

