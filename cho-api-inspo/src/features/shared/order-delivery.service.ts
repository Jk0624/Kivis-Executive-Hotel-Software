import { Prisma } from "../../generated/prisma/client.js";
import { OrderStatus, PaymentStatus } from "../../generated/prisma/enums.js";
import { prisma } from "../../prisma.js";
import { getBandPercent, getWeekStart } from "../../utils/earningBands.js";

type Tx = Prisma.TransactionClient | typeof prisma;

/**
 * Compute the rider's earning percentage snapshot for an order at delivery time.
 *
 * - Admin-dispatched order → 0 (CHO keeps 100% of the delivery fee).
 * - Rider-delivered order → band % based on the rider's running weekly count
 *   (resets every Monday). The current delivery is the (count + 1)th.
 * - No rider and no admin dispatcher → null (defensive; shouldn't happen in practice).
 */
export async function computeRiderEarningPercent(
  order: { id: bigint; riderId: bigint | null; adminDispatchedById: bigint | null },
  client: Tx = prisma,
): Promise<number | null> {
  if (order.adminDispatchedById) return 0;
  if (!order.riderId) return null;

  const weekStart = getWeekStart(new Date());
  const priorCount = await client.order.count({
    where: {
      riderId: order.riderId,
      status: OrderStatus.DELIVERED,
      deliveredAt: { gte: weekStart },
    },
  });

  return getBandPercent(priorCount + 1);
}

/**
 * Transition a PICKED_UP order into DELIVERED, writing the snapshot fields:
 *  - status = DELIVERED
 *  - deliveredAt = now
 *  - deliveryPin = null (clears it once consumed)
 *  - riderEarningPercent = computed snapshot
 *  - paymentStatus/paidAt = PAID/now (only for COD)
 *
 * Callers (rider deliverOrder, admin adminDeliverOrder) own their own
 * authorization, ownership, status, and PIN checks. This service only owns
 * the transition + snapshot.
 */
export async function markOrderDelivered(
  orderId: bigint,
  client: Tx = prisma,
) {
  const order = await client.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      riderId: true,
      adminDispatchedById: true,
      orderPaymentMethod: true,
    },
  });

  if (!order) throw new Error(`Order ${orderId} not found`);

  const riderEarningPercent = await computeRiderEarningPercent(order, client);

  return client.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.DELIVERED,
      deliveredAt: new Date(),
      deliveryPin: null,
      riderEarningPercent,
      ...(order.orderPaymentMethod === "CASH_ON_DELIVERY" && {
        paymentStatus: PaymentStatus.PAID,
        paidAt: new Date(),
      }),
    },
  });
}
