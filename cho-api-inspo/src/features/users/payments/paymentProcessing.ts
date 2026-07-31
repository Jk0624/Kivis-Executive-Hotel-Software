import { prisma } from "../../../prisma.js";
import {
  PaymentStatus,
  TransactionStatus,
  OrderPaymentMethod,
} from "../../../generated/prisma/enums.js";
import { paystackService } from "../../../services/paystack/paystack.service.js";
import { createUserNotification } from "../notification/notification.service.js";
import { createVendorNotification } from "../../vendors/notification/notification.service.js";
import {
  markPayForMeLinkUsed,
  findPayForMeLinkByOrderId,
} from "../../pay-for-me/payForMe.service.js";

export type ProcessResult =
  | { status: "success" }
  | { status: "failed" }
  | { status: "processing" }
  | { status: "already_paid" };

interface ProviderData {
  status: string;
  amount: number;
  channel: string;
  paid_at: string | null;
}

/**
 * Core payment processing — updates transaction, order, link, and sends notification.
 * Used by: webhook, verifyPayment, payForMeCallback.
 */
export async function processPaymentSuccess(
  transaction: any,
  providerData: ProviderData,
): Promise<void> {
  // Update transaction → SUCCESS
  await (prisma as any).transaction.update({
    where: { id: transaction.id },
    data: {
      status: TransactionStatus.SUCCESS,
      providerResponse: {
        status: providerData.status,
        amount: providerData.amount,
        channel: providerData.channel,
        paid_at: providerData.paid_at,
      },
    },
  });

  // Update order → PAID
  await (prisma as any).order.update({
    where: { id: transaction.orderId },
    data: { paymentStatus: PaymentStatus.PAID, paidAt: new Date() },
  });

  const paidOrder = await (prisma as any).order.findUnique({
    where: { id: transaction.orderId },
    include: {
      restaurant: {
        select: { vendorId: true },
      },
    },
  });

  if (
    paidOrder &&
    paidOrder.orderPaymentMethod !== OrderPaymentMethod.CASH_ON_DELIVERY &&
    paidOrder.restaurant?.vendorId
  ) {
    try {
      await createVendorNotification({
        vendorId: paidOrder.restaurant.vendorId.toString(),
        title: "New Order Received",
        message: `New paid order #${paidOrder.orderNumber || paidOrder.id.toString()}. Accept or reject now.`,
        type: "order",
        metadata: {
          eventType: "NEW_ORDER",
          orderId: paidOrder.id.toString(),
          restaurantId: paidOrder.restaurantId.toString(),
          occurredAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Failed to notify vendor for paid order:", error);
    }
  }

  // Pay-for-me specific: mark link used + custom notification
  if (
    transaction.order.orderPaymentMethod === OrderPaymentMethod.PAY_FOR_ME
  ) {
    await markPayForMeLinkUsed(transaction.orderId);

    const pfmLink = await findPayForMeLinkByOrderId(transaction.orderId);
    const payerName = pfmLink?.payerName || "Someone";

    await createUserNotification({
      userId: transaction.order.userId.toString(),
      title: "Someone Paid for Your Order!",
      message: `${payerName} paid GHS ${transaction.amount} for your order #${transaction.order.orderNumber || transaction.orderId}.`,
      type: "payment",
      metadata: {
        orderId: transaction.orderId.toString(),
        transactionId: transaction.id.toString(),
        reference: transaction.providerReference,
      },
    });
  } else {
    // Regular payment notification
    await createUserNotification({
      userId: transaction.order.userId.toString(),
      title: "Payment Successful",
      message: `Your payment of GHS ${transaction.amount} for order #${transaction.order.orderNumber || transaction.orderId} was successful.`,
      type: "payment",
      metadata: {
        orderId: transaction.orderId.toString(),
        transactionId: transaction.id.toString(),
        reference: transaction.providerReference,
      },
    });
  }
}

export async function processPaymentFailure(
  transaction: any,
  providerData: ProviderData,
): Promise<void> {
  await (prisma as any).transaction.update({
    where: { id: transaction.id },
    data: {
      status: TransactionStatus.FAILED,
      providerResponse: {
        status: providerData.status,
        amount: providerData.amount,
        channel: providerData.channel,
        paid_at: providerData.paid_at,
      },
    },
  });

  await (prisma as any).order.update({
    where: { id: transaction.orderId },
    data: { paymentStatus: PaymentStatus.FAILED },
  });
}

/**
 * Verify a transaction with Paystack and process the result.
 * Handles idempotency — safe to call multiple times with same reference.
 * Used by: verifyPayment endpoint, payForMeCallback endpoint.
 */
export async function verifyAndProcessPayment(
  reference: string,
): Promise<ProcessResult> {
  // Find transaction by Paystack reference
  const transaction = await (prisma as any).transaction.findUnique({
    where: { providerReference: reference },
    include: { order: true },
  });

  if (!transaction) {
    return { status: "processing" };
  }

  // Idempotency: already processed
  if (transaction.status === TransactionStatus.SUCCESS) {
    return { status: "success" };
  }
  if (transaction.status === TransactionStatus.FAILED) {
    return { status: "failed" };
  }

  // Verify with Paystack
  try {
    const paystackResponse =
      await paystackService.verifyTransaction(reference);
    const providerData: ProviderData = {
      status: paystackResponse.data.status,
      amount: paystackResponse.data.amount,
      channel: paystackResponse.data.channel,
      paid_at: paystackResponse.data.paid_at,
    };

    if (paystackResponse.data.status === "success") {
      await processPaymentSuccess(transaction, providerData);
      return { status: "success" };
    }

    if (paystackResponse.data.status === "failed") {
      await processPaymentFailure(transaction, providerData);
      return { status: "failed" };
    }
  } catch {
    // Paystack API error — treat as still processing
  }

  return { status: "processing" };
}

/**
 * Check for existing transactions on an order before creating a new one.
 * Returns the existing authorization URL if there's a usable pending transaction,
 * or "already_paid" if the order is already paid.
 * Returns null if a new transaction should be created.
 */
export async function checkExistingTransaction(
  orderId: bigint,
): Promise<
  | { action: "already_paid" }
  | { action: "reuse"; authorizationUrl: string; reference: string }
  | { action: "create_new" }
> {
  const order = await (prisma as any).order.findUnique({
    where: { id: orderId },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!order) return { action: "create_new" };

  // Order already paid
  if (order.paymentStatus === PaymentStatus.PAID) {
    return { action: "already_paid" };
  }

  const latest = order.transactions?.[0];
  if (!latest) return { action: "create_new" };

  // Transaction already succeeded but order not updated (edge case)
  if (latest.status === TransactionStatus.SUCCESS) {
    await (prisma as any).order.update({
      where: { id: orderId },
      data: { paymentStatus: PaymentStatus.PAID, paidAt: new Date() },
    });
    return { action: "already_paid" };
  }

  // Pending transaction — verify with Paystack to check if it went through
  if (latest.status === TransactionStatus.PENDING) {
    try {
      const result = await verifyAndProcessPayment(latest.providerReference);
      if (result.status === "success") {
        return { action: "already_paid" };
      }
      if (result.status === "processing") {
        // Still pending — reuse existing Paystack URL
        const response = latest.providerResponse as any;
        if (response?.authorization_url) {
          return {
            action: "reuse",
            authorizationUrl: response.authorization_url,
            reference: latest.providerReference,
          };
        }
      }
      // If failed, fall through to create new
    } catch {
      // Verification failed, create new transaction
    }
  }

  return { action: "create_new" };
}
