import { Response } from "express";
import asyncHandler from "express-async-handler";
import { RiderAuthRequest } from "../../../middleware/riders/riderAuth.middleware.js";
import { prisma } from "../../../prisma.js";
import {
  RegisterDeviceTokenRequestBody,
  SendNotificationRequestBody,
} from "./notification.types.js";
import {
  registerDeviceToken,
  sendNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createRiderNotification,
} from "./notification.service.js";

export const registerToken = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const riderId = req.riderId;
    const { pushToken, platform }: RegisterDeviceTokenRequestBody = req.body;

    if (!riderId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (!pushToken || !platform) {
      res.status(400).json({
        success: false,
        message: "pushToken and platform are required",
      });
      return;
    }

    const saved = await registerDeviceToken({ riderId, pushToken, platform });

    res.status(200).json({
      success: true,
      message: "Device token registered",
      data: {
        id: saved.id.toString(),
        riderId: saved.riderId?.toString() || null,
        pushToken: saved.pushToken,
        platform: saved.platform,
      },
    });
  },
);

export const sendTestNotification = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const riderId = req.riderId;
    const { title, body, metadata }: SendNotificationRequestBody = req.body;

    if (!riderId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (!title || !body) {
      res.status(400).json({
        success: false,
        message: "title and body are required",
      });
      return;
    }

    const result = await createRiderNotification({
      riderId,
      title,
      message: body,
      metadata,
    });

    res.status(200).json({
      success: true,
      message: "Notification sent",
      data: result,
    });
  },
);

export const getRiderNotifications = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const riderId = req.riderId;

    if (!riderId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { riderId: BigInt(riderId) },
          {
            riderId: null,
            userId: null,
            vendorId: null,
            targetAudience: { in: ["RIDER", "ALL"] },
            createdAt: { gte: twoWeeksAgo },
          },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: notifications.map((n) => ({
        ...n,
        id: n.id.toString(),
        userId: n.userId?.toString() || null,
        vendorId: n.vendorId?.toString() || null,
        riderId: n.riderId?.toString() || null,
      })),
    });
  },
);

export const markAsRead = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const riderId = req.riderId;
    const { id } = req.params;

    if (!riderId) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    await markNotificationAsRead(id as string, riderId);

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  },
);

export const markAllAsRead = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const riderId = req.riderId;

    if (!riderId) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    await markAllNotificationsAsRead(riderId);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  },
);
