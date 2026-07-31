import crypto from "crypto";
import { prisma } from "../../prisma.js";

const PAY_FOR_ME_LINK_EXPIRY_HOURS = 24;

/**
 * Generate a secure 64-char hex token
 */
export function generatePayForMeToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Build the full pay-for-me URL from a token
 */
export function buildPayForMeUrl(token: string): string {
  const baseUrl = (process.env.PAY_APP_URL || "").trim();
  if (!baseUrl) {
    console.warn("PAY_APP_URL is not set — pay-for-me links will be relative");
  }
  return `${baseUrl}/pay/${token}`;
}

/**
 * Create a PayForMeLink for an order
 */
export async function createPayForMeLink(orderId: bigint) {
  const token = generatePayForMeToken();
  const expiresAt = new Date(
    Date.now() + PAY_FOR_ME_LINK_EXPIRY_HOURS * 60 * 60 * 1000,
  );

  const link = await (prisma as any).payForMeLink.create({
    data: {
      orderId,
      token,
      expiresAt,
    },
  });

  return {
    id: link.id.toString(),
    token: link.token,
    url: buildPayForMeUrl(link.token),
    expiresAt: link.expiresAt.toISOString(),
    isUsed: link.isUsed,
  };
}

/**
 * Regenerate token and expiry for an existing PayForMeLink
 */
export async function regeneratePayForMeLinkToken(orderId: bigint) {
  const token = generatePayForMeToken();
  const expiresAt = new Date(
    Date.now() + PAY_FOR_ME_LINK_EXPIRY_HOURS * 60 * 60 * 1000,
  );

  const link = await (prisma as any).payForMeLink.update({
    where: { orderId },
    data: {
      token,
      expiresAt,
      isUsed: false,
    },
  });

  return {
    id: link.id.toString(),
    token: link.token,
    url: buildPayForMeUrl(link.token),
    expiresAt: link.expiresAt.toISOString(),
    isUsed: link.isUsed,
  };
}

/**
 * Find a PayForMeLink by token with order details for the payment page
 */
export async function findPayForMeLinkByToken(token: string) {
  return (prisma as any).payForMeLink.findUnique({
    where: { token },
    include: {
      order: {
        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
            },
          },
          orderItems: {
            include: {
              food: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
              foodPack: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
              orderItemAddons: {
                include: {
                  addon: {
                    select: {
                      id: true,
                      name: true,
                      price: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

/**
 * Find a PayForMeLink by orderId
 */
export async function findPayForMeLinkByOrderId(orderId: bigint) {
  return (prisma as any).payForMeLink.findUnique({
    where: { orderId },
  });
}

/**
 * Mark a PayForMeLink as used
 */
export async function markPayForMeLinkUsed(orderId: bigint) {
  return (prisma as any).payForMeLink.updateMany({
    where: { orderId },
    data: { isUsed: true },
  });
}

/**
 * Validate a pay-for-me link is usable (not expired, not used, order not cancelled/paid)
 */
export function validatePayForMeLink(
  link: any,
): { valid: true } | { valid: false; reason: string; title: string } {
  if (!link) {
    return {
      valid: false,
      title: "Link Not Found",
      reason: "This payment link does not exist or has been removed.",
    };
  }

  if (link.isUsed) {
    return {
      valid: false,
      title: "Already Paid",
      reason: "This order has already been paid for. Thank you!",
    };
  }

  if (new Date() > new Date(link.expiresAt)) {
    return {
      valid: false,
      title: "Link Expired",
      reason:
        "This payment link has expired. Please ask the order owner for a new link.",
    };
  }

  if (link.order.status === "CANCELLED") {
    return {
      valid: false,
      title: "Order Cancelled",
      reason: "This order has been cancelled and can no longer be paid for.",
    };
  }

  if (link.order.paymentStatus === "PAID") {
    return {
      valid: false,
      title: "Already Paid",
      reason: "This order has already been paid for. Thank you!",
    };
  }

  return { valid: true };
}
