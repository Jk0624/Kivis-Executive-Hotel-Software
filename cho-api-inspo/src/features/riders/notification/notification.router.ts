import { Router } from "express";
import {
  getRiderNotifications,
  registerToken,
  sendTestNotification,
  markAsRead,
  markAllAsRead,
} from "./notification.controller.js";

const router = Router();

router.post("/send-test", sendTestNotification);
router.post("/push-token", registerToken);
router.get("/", getRiderNotifications);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);

export default router;
