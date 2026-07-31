import { Router } from "express";
import {
  addPaymentDetails,
  getPaymentDetails,
  updatePaymentDetails,
} from "./payment.controller.js";

const router = Router();

router.post("/", addPaymentDetails);
router.get("/", getPaymentDetails);
router.patch("/:id", updatePaymentDetails);

export default router;
