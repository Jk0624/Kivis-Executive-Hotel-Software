import { Expo } from "expo-server-sdk";
import { prisma } from "../../../prisma.js";

interface RegisterDeviceTokenParams {
  riderId: string;
  pushToken: string;
  platform: string;
}

interface SendNotificationParams {
  riderId: string;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
}

interface DeleteDeadTokensParams {
  riderId: string;
  receiptIdToToken: Map<string, string>;
}

const expo = new Expo();

const deleteDeadTokens = async ({
  riderId,
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
        riderId: BigInt(riderId),
        pushToken: { in: uniqueRemoved },
      },
    });
  }

  return uniqueRemoved;
};

export const registerDeviceToken = async ({
  riderId,
  pushToken,
  platform,
}: RegisterDeviceTokenParams) => {
  const existing = await prisma.deviceToken.findFirst({
    where: {
      riderId: BigInt(riderId),
      pushToken,
      platform,
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.deviceToken.create({
    data: {
      riderId: BigInt(riderId),
      pushToken,
      platform,
    },
  });
};

export const sendNotification = async ({
  riderId,
  title,
  body,
  metadata,
}: SendNotificationParams) => {
  const tokenRows = await prisma.deviceToken.findMany({
    where: { riderId: BigInt(riderId) },
    select: { pushToken: true },
  });

  const tokens = Array.from(new Set(tokenRows.map((row) => row.pushToken)));
  const invalidTokens: string[] = [];
  const messages = [];

  for (const token of tokens) {
    if (!Expo.isExpoPushToken(token)) {
      invalidTokens.push(token);
      continue;
    }

    messages.push({
      to: token,
      sound: "default",
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

  const removedTokens = await deleteDeadTokens({ riderId, receiptIdToToken });

  return { tickets, invalidTokens, removedTokens };
};

export const markNotificationAsRead = async (
  id: string,
  riderId: string,
) => {
  return prisma.notification.updateMany({
    where: {
      id: BigInt(id),
      riderId: BigInt(riderId),
    },
    data: { readAt: new Date() },
  });
};

export const markAllNotificationsAsRead = async (riderId: string) => {
  return prisma.notification.updateMany({
    where: {
      riderId: BigInt(riderId),
      readAt: null,
    },
    data: { readAt: new Date() },
  });
};

export const createRiderNotification = async (params: {
  riderId: string;
  title: string;
  message: string;
  type?: string;
  metadata?: Record<string, unknown>;
}) => {
  const notification = await prisma.notification.create({
    data: {
      riderId: BigInt(params.riderId),
      targetAudience: "RIDER",
      title: params.title,
      message: params.message,
      type: params.type || "general",
      metadata: (params.metadata as any) || {},
    },
  });

  try {
    await sendNotification({
      riderId: params.riderId,
      title: params.title,
      body: params.message,
      metadata: params.metadata,
    });
  } catch (error) {
    console.error("Failed to send rider push notification:", error);
  }

  return {
    ...notification,
    id: notification.id.toString(),
    riderId: notification.riderId?.toString() || null,
  };
};
