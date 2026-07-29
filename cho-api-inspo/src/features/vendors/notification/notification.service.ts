import { Expo } from "expo-server-sdk";
import { prisma } from "../../../prisma.js";

interface RegisterDeviceTokenParams {
  vendorId: string;
  pushToken: string;
  platform: string;
}

interface SendNotificationParams {
  vendorId: string;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export type VendorNotificationEventType =
  | "NEW_ORDER"
  | "ORDER_CANCELLED"
  | "ORDER_DELAYED";

interface VendorNotificationMetadata extends Record<string, unknown> {
  eventType?: VendorNotificationEventType;
  orderId?: string;
  restaurantId?: string;
  occurredAt?: string;
}

interface DeleteDeadTokensParams {
  vendorId: string;
  receiptIdToToken: Map<string, string>;
}

const expo = new Expo();

const deleteDeadTokens = async ({
  vendorId,
  receiptIdToToken,
}: DeleteDeadTokensParams) => {
  const receiptIds = Array.from(receiptIdToToken.keys()).filter(
    (id) => !id.startsWith("immediate:"),
  );
  const removedTokens: string[] = [];

  const receiptChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  for (const chunk of receiptChunks) {
    const receipts = await expo.getPushNotificationReceiptsAsync(chunk);

    for (const [receiptId, receipt] of Object.entries(receipts)) {
      if (
        receipt.status === "error" &&
        receipt.details?.error === "DeviceNotRegistered"
      ) {
        const token = receiptIdToToken.get(receiptId);
        if (token) removedTokens.push(token);
      }
    }
  }

  for (const [key, token] of receiptIdToToken.entries()) {
    if (key.startsWith("immediate:")) {
      removedTokens.push(token);
    }
  }

  const uniqueRemoved = Array.from(new Set(removedTokens));
  if (uniqueRemoved.length > 0) {
    await prisma.deviceToken.deleteMany({
      where: {
        vendorId: BigInt(vendorId),
        pushToken: { in: uniqueRemoved },
      },
    });
  }

  return uniqueRemoved;
};

export const registerDeviceToken = async ({
  vendorId,
  pushToken,
  platform,
}: RegisterDeviceTokenParams) => {
  const existing = await prisma.deviceToken.findFirst({
    where: {
      vendorId: BigInt(vendorId),
      pushToken,
      platform,
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.deviceToken.create({
    data: {
      vendorId: BigInt(vendorId),
      pushToken,
      platform,
    },
  });
};

type PushChannelConfig = {
  sound: string;
  channelId: string;
  priority: "high" | "default";
};

const resolvePushChannel = (
  eventType: VendorNotificationEventType | undefined,
): PushChannelConfig => {
  switch (eventType) {
    case "NEW_ORDER":
      return {
        sound: "cho_order_sound.wav",
        channelId: "order-alerts",
        priority: "high",
      };
    case "ORDER_CANCELLED":
      return {
        sound: "cho_cancel_sound.wav",
        channelId: "order-updates",
        priority: "high",
      };
    case "ORDER_DELAYED":
      return {
        sound: "cho_delay_sound.wav",
        channelId: "order-delayed",
        priority: "high",
      };
    default:
      return {
        sound: "default",
        channelId: "default",
        priority: "default",
      };
  }
};

export const sendNotification = async ({
  vendorId,
  title,
  body,
  metadata,
}: SendNotificationParams) => {
  const tokenRows = await prisma.deviceToken.findMany({
    where: { vendorId: BigInt(vendorId) },
    select: { pushToken: true },
  });

  const tokens = Array.from(new Set(tokenRows.map((row) => row.pushToken)));
  const invalidTokens: string[] = [];
  const messages = [];

  const eventType = (metadata as VendorNotificationMetadata | undefined)
    ?.eventType;
  const { sound, channelId, priority } = resolvePushChannel(eventType);

  for (const token of tokens) {
    if (!Expo.isExpoPushToken(token)) {
      invalidTokens.push(token);
      continue;
    }

    messages.push({
      to: token,
      sound,
      channelId,
      priority,
      title,
      body,
      data: metadata || {},
    });
  }

  if (messages.length === 0) {
    return { tickets: [], invalidTokens, removedTokens: [] };
  }

  const tickets = [];
  const receiptIdToToken = new Map<string, string>();

  for (const message of messages) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync([message]);
      tickets.push(...ticketChunk);

      for (let i = 0; i < ticketChunk.length; i += 1) {
        const ticket = ticketChunk[i];
        const token = typeof message.to === "string" ? message.to : undefined;

        if (
          ticket.status === "error" &&
          ticket.details?.error === "DeviceNotRegistered" &&
          token
        ) {
          receiptIdToToken.set(`immediate:${token}`, token);
        } else if ("id" in ticket && ticket.id && token) {
          receiptIdToToken.set(ticket.id, token);
        }
      }
    } catch (error) {
      console.error(
        `Failed to send push notification to token ${message.to}:`,
        error,
      );
    }
  }

  const removedTokens = await deleteDeadTokens({ vendorId, receiptIdToToken });

  return { tickets, invalidTokens, removedTokens };
};

export const markNotificationAsRead = async (
  id: string,
  vendorId: string,
) => {
  return prisma.notification.updateMany({
    where: {
      id: BigInt(id),
      vendorId: BigInt(vendorId),
    },
    data: { readAt: new Date() },
  });
};

export const markAllNotificationsAsRead = async (vendorId: string) => {
  return prisma.notification.updateMany({
    where: {
      vendorId: BigInt(vendorId),
      readAt: null,
    },
    data: { readAt: new Date() },
  });
};

export const createVendorNotification = async (params: {
  vendorId: string;
  title: string;
  message: string;
  type?: string;
  metadata?: VendorNotificationMetadata;
}) => {
  const notification = await prisma.notification.create({
    data: {
      vendorId: BigInt(params.vendorId),
      targetAudience: "VENDOR",
      title: params.title,
      message: params.message,
      type: params.type || "general",
      metadata: (params.metadata as any) || {},
    },
  });

  try {
    await sendNotification({
      vendorId: params.vendorId,
      title: params.title,
      body: params.message,
      metadata: params.metadata,
    });
  } catch (error) {
    console.error("Failed to send vendor push notification:", error);
  }

  return {
    ...notification,
    id: notification.id.toString(),
    vendorId: notification.vendorId?.toString() || null,
  };
};
