import { Router } from "express";
import {
  listCoupons,
  createCoupon,
  getCoupon,
  toggleCoupon,
  deleteCoupon,
} from "./coupons.controller.js";

const router = Router();

router.get("/", listCoupons);
router.post("/", createCoupon);
router.get("/:id", getCoupon);
router.patch("/:id/toggle", toggleCoupon);
router.delete("/:id", deleteCoupon);

export default router;
