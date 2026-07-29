import cron from "node-cron";
import { prisma } from "../prisma.js";
import {
  OrderPaymentMethod,
  OrderStatus,
} from "../generated/prisma/enums.js";
import { cancelPendingOrder } from "../features/vendors/orders/order.service.js";
import { ORDER_EXPIRY_MINUTES, ORDER_EXPIRY_MS } from "../config/order.js";

function getCronSchedule(): string {
  const raw = process.env.ORDER_EXPIRY_CRON?.trim();
  if (raw && cron.validate(raw)) return raw;
  if (raw) {
    console.warn(
      `[orderExpiry] invalid ORDER_EXPIRY_CRON="${raw}", falling back to "* * * * *"`,
    );
  }
  return "* * * * *";
}

export function startOrderExpiryJob() {
  const schedule = getCronSchedule();

  cron.schedule(schedule, async () => {
    try {
      const cutoff = new Date(Date.now() - ORDER_EXPIRY_MS);

      const expired = await prisma.order.findMany({
        where: {
          status: OrderStatus.PENDING,
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
        select: { id: true },
        take: 100,
      });

      if (expired.length === 0) return;

      let ok = 0;
      for (const { id } of expired) {
        try {
          const result = await cancelPendingOrder(id, "auto-expiry");
          if (result) ok += 1;
        } catch (err) {
          console.error(`[orderExpiry] failed to cancel order ${id}:`, err);
        }
      }
      console.log(
        `[orderExpiry] auto-cancelled ${ok}/${expired.length} order(s)`,
      );
    } catch (err) {
      console.error("[orderExpiry] sweep failed:", err);
    }
  });

  console.log(
    `[orderExpiry] scheduled "${schedule}" — expiry window ${ORDER_EXPIRY_MINUTES} min`,
  );
}
