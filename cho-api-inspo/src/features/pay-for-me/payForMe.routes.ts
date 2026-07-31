import { Router } from "express";
import { payForMeInitLimiter } from "../../middleware/common/rateLimiter.middleware.js";
import {
  renderPayForMePage,
  initializePayForMePayment,
  payForMeCallback,
  getPayForMeStatus,
} from "./payForMe.controller.js";

const router = Router();

// Public payment page
router.get("/:token", renderPayForMePage);

// Initialize payment (rate limited more strictly)
router.post("/:token/initialize", payForMeInitLimiter, initializePayForMePayment);

// Paystack callback after payment
router.get("/:token/callback", payForMeCallback);

// Payment status check (JSON)
router.get("/:token/status", getPayForMeStatus);

export default router;
