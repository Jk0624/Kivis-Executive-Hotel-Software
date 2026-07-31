import { Router } from "express";
import {
  getPlatformConfig,
  getDeliveryFeeEstimate,
  testBestDistance,
  getAppVersion,
} from "./config.controller.js";
import { authenticate } from "../../middleware/users/auth.middleware.js";
import { deliveryFeeLimiter } from "../../middleware/common/rateLimiter.middleware.js";

const router = Router();

router.get("/", getPlatformConfig);
router.get("/delivery-fee", deliveryFeeLimiter, authenticate, getDeliveryFeeEstimate);
router.get("/app-version", getAppVersion);

export default router;

//router.get("/test-distance", testBestDistance);
