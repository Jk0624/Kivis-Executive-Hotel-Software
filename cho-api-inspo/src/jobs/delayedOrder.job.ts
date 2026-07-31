import cron from "node-cron";
import { prisma } from "../prisma.js";
import {
  OrderPaymentMethod,
  OrderStatus,
} from "../generated/prisma/enums.js";
import { createUserNotification } from "../features/users/notification/notification.service.js";
import {
  createVendorNotification,
  sendNotification as sendVendorPush,
} from "../features/vendors/notification/notification.service.js";
import { ORDER_DELAY_MINUTES, ORDER_DELAY_MS } from "../config/order.js";

const NOTIFICATION_TYPE = "order-delayed";

function getCronSchedule(): string {
  const raw = process.env.ORDER_DELAY_CRON?.trim();
  if (raw && cron.validate(raw)) return raw;
  if (raw) {
    console.warn(
      `[orderDelay] invalid ORDER_DELAY_CRON="${raw}", falling back to "* * * * *"`,
    );
  }
  return "* * * * *";
}

type PendingVendorOrder = { orderId: bigint; orderNumber: string | null };

export function startDelayedOrderNotifyJob() {
  const schedule = getCronSchedule();

  cron.schedule(schedule, async () => {
    try {
      const cutoff = new Date(Date.now() - ORDER_DELAY_MS);

      const delayed = await prisma.order.findMany({
        where: {
          status: { in: [OrderStatus.CONFIRMED, OrderStatus.PREPARING] },
          delayNotifiedAt: null,
          OR: [
            {
              orderPaymentMethod: OrderPaymentMethod.CASH_ON_DELIVERY,
              createdAt: { lte: cutoff },
            },
            {
              orderPaymentMethod: { not: OrderPaymentMethod.CASH_ON_DELIVERY },
              paidAt: { lte: cutoff },
            },
          ],
        },
        select: {
          id: true,
          orderNumber: true,
          userId: true,
          restaurantId: true,
          restaurant: { select: { name: true, vendorId: true } },
        },
        take: 100,
      });

      if (delayed.length === 0) return;

      let userOk = 0;
      const vendorBatches = new Map<string, PendingVendorOrder[]>();
      const recordedOrderIds: bigint[] = [];

      for (const order of delayed) {
        let recorded = false;

        try {
          await createUserNotification({
            userId: order.userId.toString(),
            title: "Your order is delayed",
            message: `Your order #${order.orderNumber} from ${order.restaurant.name} is taking unusually long. Please contact customer support.`,
            type: NOTIFICATION_TYPE,
            metadata: {
              orderId: order.id.toString(),
              status: OrderStatus.CONFIRMED,
            },
          });
          userOk += 1;
          recorded = true;
        } catch (err) {
          console.error(
            `[orderDelay] failed user notify for order ${order.id}:`,
            err,
          );
        }

        const vendorId = order.restaurant.vendorId;
        if (vendorId) {
          const key = vendorId.toString();
          const list = vendorBatches.get(key) ?? [];
          list.push({ orderId: order.id, orderNumber: order.orderNumber });
          vendorBatches.set(key, list);
          recorded = true;
        } else {
          console.warn(
            `[orderDelay] order ${order.id} delayed but restaurant ${order.restaurantId} has no vendorId — vendor not notified`,
          );
        }

        if (recorded) recordedOrderIds.push(order.id);
      }

      let vendorOk = 0;
      for (const [vendorId, orders] of vendorBatches.entries()) {
        try {
          if (orders.length === 1) {
            const { orderId, orderNumber } = orders[0];
            await createVendorNotification({
              vendorId,
              title: "Order Delayed — Action Required",
              message: `Order #${orderNumber} has been waiting over ${ORDER_DELAY_MINUTES} min. Update its status now.`,
              type: NOTIFICATION_TYPE,
              metadata: {
                eventType: "ORDER_DELAYED",
                orderId: orderId.toString(),
                occurredAt: new Date().toISOString(),
              },
            });
            vendorOk += 1;
            continue;
          }

          // ≥2 newly-delayed orders for this vendor in this tick.
          // Persist per-order DB rows (so the in-app feed stays granular),
          // then send ONE aggregate push to avoid back-to-back loud alarms.
          await prisma.notification.createMany({
            data: orders.map(({ orderId, orderNumber }) => ({
              vendorId: BigInt(vendorId),
              targetAudience: "VENDOR" as const,
              title: "Order Delayed — Action Required",
              message: `Order #${orderNumber} has been waiting over ${ORDER_DELAY_MINUTES} min. Update its status now.`,
              type: NOTIFICATION_TYPE,
              metadata: {
                eventType: "ORDER_DELAYED",
                orderId: orderId.toString(),
                occurredAt: new Date().toISOString(),
              },
            })),
          });

          const orderList = orders.map((o) => `#${o.orderNumber}`).join(", ");
          await sendVendorPush({
            vendorId,
            title: "Multiple orders delayed",
            body: `${orders.length} orders are delayed: ${orderList}. Tap to review.`,
            metadata: {
              eventType: "ORDER_DELAYED",
              orderIds: orders.map((o) => o.orderId.toString()),
              occurredAt: new Date().toISOString(),
            },
          });
          vendorOk += 1;
        } catch (err) {
          console.error(
            `[orderDelay] failed vendor notify for vendor ${vendorId}:`,
            err,
          );
        }
      }

      if (recordedOrderIds.length > 0) {
        await prisma.order.updateMany({
          where: { id: { in: recordedOrderIds } },
          data: { delayNotifiedAt: new Date() },
        });
      }

      console.log(
        `[orderDelay] notified ${userOk}/${delayed.length} user(s), ${vendorOk}/${vendorBatches.size} vendor(s); marked ${recordedOrderIds.length} order(s)`,
      );
    } catch (err) {
      console.error("[orderDelay] sweep failed:", err);
    }
  });

  console.log(
    `[orderDelay] scheduled "${schedule}" — delay window ${ORDER_DELAY_MINUTES} min`,
  );
}
