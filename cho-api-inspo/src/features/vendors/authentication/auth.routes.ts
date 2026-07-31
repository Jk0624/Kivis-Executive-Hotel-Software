import { Router } from "express";
import {
  registerVendor,
  loginVendor,
  refreshToken,
  updateProfile,
  changePassword,
  sendVendorEmailCode,
  verifyVendorEmailCode,
  sendVendorPhoneCode,
  verifyVendorPhoneCode,
  sendVendorPasswordReset,
  resetVendorPassword,
  deleteVendorAccount,
} from "./auth.controller.js";
import { vendorAuthenticate } from "../../../middleware/vendors/vendorAuth.middleware.js";
import {
  registerLimiter,
  loginLimiter,
} from "../../../middleware/common/rateLimiter.middleware.js";

const router = Router();

router.post("/register", registerLimiter, registerVendor);
router.post("/login", loginLimiter, loginVendor);
router.post("/forgot-password", loginLimiter, sendVendorPasswordReset);
router.post("/reset-password", loginLimiter, resetVendorPassword);
router.post("/refresh-token", loginLimiter, refreshToken);
router.patch("/profile", vendorAuthenticate, updateProfile);
router.patch("/change-password", vendorAuthenticate, changePassword);
router.post("/send-verification-email", vendorAuthenticate, sendVendorEmailCode);
router.post("/verify-email", vendorAuthenticate, verifyVendorEmailCode);
router.post("/send-verification-sms", vendorAuthenticate, sendVendorPhoneCode);
router.post("/verify-phone", vendorAuthenticate, verifyVendorPhoneCode);
router.delete("/account", vendorAuthenticate, deleteVendorAccount);

export default router;
