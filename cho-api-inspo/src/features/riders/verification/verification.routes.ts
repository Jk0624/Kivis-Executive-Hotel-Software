import { Router } from "express";
import {
  requestVerification,
  getVerificationStatus,
} from "./verification.controller.js";

const router = Router();

router.post("/request", requestVerification);
router.get("/status", getVerificationStatus);

export default router;
