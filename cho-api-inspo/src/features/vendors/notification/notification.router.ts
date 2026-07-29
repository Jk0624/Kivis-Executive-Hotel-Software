import { Router } from "express";
import {
  getVendorNotifications,
  registerToken,
  sendTestNotification,
  markAsRead,
  markAllAsRead,
} from "./notification.controller.js";

const router = Router();

router.post("/send-test", sendTestNotification);
router.post("/push-token", registerToken);
router.get("/", getVendorNotifications);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);

export default router;
