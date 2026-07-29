import { prisma } from "../../../prisma.js";
import {
  OrderStatus,
  PaymentStatus,
} from "../../../generated/prisma/enums.js";
import {
  reverseCouponRedemption,
  createRefundCoupon,
} from "../../users/coupons/coupon.service.js";
import { createUserNotification } from "../../users/notification/notification.service.js";
import { createVendorNotification } from "../notification/notification.service.js";

export type CancelReason = "vendor" | "auto-expiry";

export async function cancelPendingOrder(
  orderId: bigint,
  reason: CancelReason,
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      restaurant: { select: { name: true, vendorId: true } },
    },
  });

  if (!order || order.status !== OrderStatus.PENDING) return null;

  // Cancellation, coupon reversal, and refund-coupon issuance must succeed or
  // fail together. Notifications run after the commit so a push outage can't
  // roll back the cancellation.
  const cancelled = await (prisma as any).$transaction(async (tx: any) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
    });

    await reverseCouponRedemption(orderId, tx);

    if (updated.paymentStatus === PaymentStatus.PAID) {
      await createRefundCoupon(
        updated.id,
        updated.userId,
        Number(updated.totalAmount),
        updated.orderNumber,
        tx,
      );
    }

    return updated;
  });

  const wasPaid =
    cancelled.paymentStatus === PaymentStatus.PAID ||
    cancelled.paymentStatus === PaymentStatus.REFUNDED;
  const refundSuffix = wasPaid
    ? " A refund coupon has been issued to your account."
    : "";

  const customerMessage =
    reason === "auto-expiry"
      ? `Your order #${order.orderNumber} from ${order.restaurant.name} was cancelled because the restaurant did not accept it in time.${refundSuffix}`
      : `Your order #${order.orderNumber} from ${order.restaurant.name} has been cancelled by the restaurant.${refundSuffix}`;

  await createUserNotification({
    userId: order.userId.toString(),
    title: "Order Cancelled",
    message: customerMessage,
    type: "order",
    metadata: {
      orderId: order.id.toString(),
      status: OrderStatus.CANCELLED,
      reason,
      ...(wasPaid && {
        link: "/profile/coupons",
        linkLabel: "Go to coupons",
      }),
    },
  });

  if (reason === "auto-expiry") {
    if (order.restaurant.vendorId) {
      await createVendorNotification({
        vendorId: order.restaurant.vendorId.toString(),
        title: "Order Auto-Cancelled",
        message: `Order #${order.orderNumber} was auto-cancelled because it wasn't accepted in time.`,
        type: "order",
        metadata: {
          orderId: order.id.toString(),
          status: OrderStatus.CANCELLED,
          reason,
        },
      });
    } else {
      console.warn(
        `[cancelPendingOrder] order ${orderId} auto-cancelled but restaurant ${order.restaurantId} has no vendorId — vendor not notified`,
      );
    }
  }

  return cancelled;
}
