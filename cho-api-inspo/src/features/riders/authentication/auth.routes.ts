import { Router } from "express";
import {
  registerRider,
  loginRider,
  refreshToken,
  updateProfile,
  updateStatus,
  getProfile,
  changePassword,
  sendRiderEmailCode,
  verifyRiderEmailCode,
  sendRiderPhoneCode,
  verifyRiderPhoneCode,
  sendRiderPasswordReset,
  resetRiderPassword,
  deleteRiderAccount,
} from "./auth.controller.js";
import { riderAuthenticate } from "../../../middleware/riders/riderAuth.middleware.js";
import {
  registerLimiter,
  loginLimiter,
} from "../../../middleware/common/rateLimiter.middleware.js";

const router = Router();

router.post("/register", registerLimiter, registerRider);
router.post("/login", loginLimiter, loginRider);
router.post("/forgot-password", loginLimiter, sendRiderPasswordReset);
router.post("/reset-password", loginLimiter, resetRiderPassword);
router.post("/refresh-token", loginLimiter, refreshToken);
router.get("/profile", riderAuthenticate, getProfile);
router.patch("/profile", riderAuthenticate, updateProfile);
router.patch("/status", riderAuthenticate, updateStatus);
router.patch("/change-password", riderAuthenticate, changePassword);
router.post("/send-verification-email", riderAuthenticate, sendRiderEmailCode);
router.post("/verify-email", riderAuthenticate, verifyRiderEmailCode);
router.post("/send-verification-sms", riderAuthenticate, sendRiderPhoneCode);
router.post("/verify-phone", riderAuthenticate, verifyRiderPhoneCode);
router.delete("/account", riderAuthenticate, deleteRiderAccount);

export default router;
