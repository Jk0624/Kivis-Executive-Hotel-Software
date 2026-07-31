/**
 * Parity check: rider total earnings computed two ways must match.
 *   1. Live computation — re-running the band logic on every delivered order
 *      in chronological order, exactly like earnings.controller.ts does.
 *   2. Snapshot — deliveryFee × rider_earning_percent (the new column).
 *
 * For each rider, the two must agree to 2dp. Any drift = the mobile app
 * would show a different number than CHO's books. We need zero drift.
 */

import "dotenv/config";
import { prisma } from "../../src/prisma.js";
import { getBandPercent, getWeekStart } from "../../src/utils/earningBands.js";

(async () => {
  const riders = await prisma.order.findMany({
    where: {
      status: "DELIVERED",
      riderId: { not: null },
      adminDispatchedById: null,
    },
    select: { riderId: true },
    distinct: ["riderId"],
  });

  let allMatch = true;
  console.log(`Checking ${riders.length} riders…\n`);

  for (const { riderId } of riders) {
    if (!riderId) continue;

    const orders = await prisma.order.findMany({
      where: { riderId, status: "DELIVERED", adminDispatchedById: null },
      select: {
        id: true,
        deliveryFee: true,
        deliveredAt: true,
        createdAt: true,
        riderEarningPercent: true,
      },
      orderBy: [{ deliveredAt: "asc" }, { createdAt: "asc" }],
    });

    let liveTotal = 0;
    let snapshotTotal = 0;
    const weekCounter = new Map<number, number>();

    for (const o of orders) {
      const weekKey = getWeekStart(o.deliveredAt ?? o.createdAt).getTime();
      const count = (weekCounter.get(weekKey) ?? 0) + 1;
      weekCounter.set(weekKey, count);

      const fee = Number(o.deliveryFee);
      const livePct = getBandPercent(count);
      const snapPct = Number(o.riderEarningPercent ?? 0);

      liveTotal += fee * livePct;
      snapshotTotal += fee * snapPct;
    }

    const diff = Math.abs(liveTotal - snapshotTotal);
    const match = diff < 0.01;
    const tag = match ? "✓" : "✗ DRIFT";

    console.log(
      `${tag} rider ${riderId.toString().padEnd(4)}  orders: ${orders.length.toString().padStart(3)}` +
      `  live: GH₵ ${liveTotal.toFixed(2).padStart(10)}  snapshot: GH₵ ${snapshotTotal.toFixed(2).padStart(10)}`
    );

    if (!match) allMatch = false;
  }

  console.log("");
  console.log(allMatch ? "✓ All riders match. No drift." : "✗ Drift detected — investigate.");

  await prisma.$disconnect();
})();
