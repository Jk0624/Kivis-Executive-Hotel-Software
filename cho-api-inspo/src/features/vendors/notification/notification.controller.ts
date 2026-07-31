import { Response } from "express";
import asyncHandler from "express-async-handler";
import { VendorAuthRequest } from "../../../middleware/vendors/vendorAuth.middleware.js";
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
  createVendorNotification,
} from "./notification.service.js";

export const registerToken = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendorId = req.vendorId;
    const { pushToken, platform }: RegisterDeviceTokenRequestBody = req.body;

    if (!vendorId) {
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

    const saved = await registerDeviceToken({ vendorId, pushToken, platform });

    res.status(200).json({
      success: true,
      message: "Device token registered",
      data: {
        id: saved.id.toString(),
        vendorId: saved.vendorId?.toString(),
        pushToken: saved.pushToken,
        platform: saved.platform,
      },
    });
  },
);

export const sendTestNotification = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendorId = req.vendorId ?? "1";
    const { title, body, metadata }: SendNotificationRequestBody = req.body;

    if (!title || !body) {
      res.status(400).json({
        success: false,
        message: "title and body are required",
      });
      return;
    }

    const result = await createVendorNotification({
      vendorId,
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

export const getVendorNotifications = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendorId = req.vendorId;

    if (!vendorId) {
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
          { vendorId: BigInt(vendorId) },
          {
            vendorId: null,
            userId: null,
            riderId: null,
            targetAudience: { in: ["VENDOR", "ALL"] },
            createdAt: { gte: twoWeeksAgo },
          },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: notifications.map(({ id, userId, vendorId, riderId, ...rest }) => ({
        ...rest,
        id: id.toString(),
        userId: userId?.toString() || null,
        vendorId: vendorId?.toString() || null,
        riderId: riderId?.toString() || null,
      })),
    });
  },
);

export const markAsRead = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendorId = req.vendorId;
    const { id } = req.params;

    if (!vendorId) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    await markNotificationAsRead(id as string, vendorId);

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  },
);

export const markAllAsRead = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendorId = req.vendorId;

    if (!vendorId) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    await markAllNotificationsAsRead(vendorId);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  },
);
