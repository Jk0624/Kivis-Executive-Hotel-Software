import { Router } from "express";
import {
  adminLogin,
  refreshAdminToken,
  getAdminProfile,
  setupAdminPassword,
} from "./auth.controller.js";
import { adminAuthenticate } from "../../../middleware/admin/adminAuth.middleware.js";
import { loginLimiter } from "../../../middleware/common/rateLimiter.middleware.js";

const router = Router();

router.post("/login", loginLimiter, adminLogin);
router.post("/refresh-token", loginLimiter, refreshAdminToken);
router.post("/setup-password", loginLimiter, setupAdminPassword);
router.get("/me", adminAuthenticate, getAdminProfile);

export default router;
