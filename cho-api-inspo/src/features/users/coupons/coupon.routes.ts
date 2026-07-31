import { Router } from "express";
import { validateCouponCode, getMyCoupons } from "./coupon.controller.js";

const router = Router();

router.post("/validate", validateCouponCode);
router.get("/my", getMyCoupons);

export default router;
