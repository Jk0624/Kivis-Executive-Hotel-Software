import { Router } from "express";
import {
  initializePayment,
  handlePaystackWebhook,
  verifyPayment,
  checkPaymentStatus,
  getPayForMeLink,
  regeneratePayForMeLinkEndpoint,
} from "./payment.controller.js";
import { authenticate } from "../../../middleware/users/auth.middleware.js";

const router = Router();

router.post("/initialize", authenticate, initializePayment);

router.get("/verify/:reference", authenticate, verifyPayment);

router.get("/check-status/:orderId", authenticate, checkPaymentStatus);

router.get("/pay-for-me/:orderId", authenticate, getPayForMeLink);

router.post(
  "/pay-for-me/:orderId/regenerate",
  authenticate,
  regeneratePayForMeLinkEndpoint,
);

//webhook endpoint (no auth, but raw body parsing)
router.post("/paystack/webhook", handlePaystackWebhook);

export default router;
