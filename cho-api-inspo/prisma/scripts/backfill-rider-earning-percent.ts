/**
 * Backfill `orders.rider_earning_percent` for historical DELIVERED orders.
 *
 * Idempotent: only updates rows where rider_earning_percent IS NULL.
 * Batched: processes orders per-rider and commits in small chunks.
 *
 * Logic:
 *   - Admin-dispatched orders (no rider)            → 0
 *   - Rider-delivered orders                        → band % based on the
 *     rider's running weekly delivered count
 *     (Mon→Sun, resets every Monday). The k-th
 *     delivery in a given week uses getBandPercent(k).
 *
 * Run:  npx tsx prisma/scripts/backfill-rider-earning-percent.ts
 */

import "dotenv/config";
import { prisma } from "../../src/prisma.js";
import { getBandPercent, getWeekStart } from "../../src/utils/earningBands.js";

const BATCH_SIZE = 500;

async function backfillAdminDispatched(): Promise<number> {
  const result = await prisma.order.updateMany({
    where: {
      status: "DELIVERED",
      riderEarningPercent: null,
      adminDispatchedById: { not: null },
    },
    data: { riderEarningPercent: 0 },
  });
  return result.count;
}

async function backfillRiderDelivered(): Promise<number> {
  // Distinct rider IDs with at least one delivered order needing backfill.
  const ridersToProcess = await prisma.order.findMany({
    where: {
      status: "DELIVERED",
      riderEarningPercent: null,
      adminDispatchedById: null,
      riderId: { not: null },
    },
    select: { riderId: true },
    distinct: ["riderId"],
  });

  let totalUpdated = 0;

  for (const { riderId } of ridersToProcess) {
    if (!riderId) continue;

    // All delivered orders for this rider, oldest first.
    const orders = await prisma.order.findMany({
      where: {
        riderId,
        status: "DELIVERED",
        adminDispatchedById: null,
      },
      select: {
        id: true,
        deliveredAt: true,
        createdAt: true,
        riderEarningPercent: true,
      },
      orderBy: [{ deliveredAt: "asc" }, { createdAt: "asc" }],
    });

    // Replay band logic per-week; collect updates for rows still NULL.
    const weekCounter = new Map<number, number>();
    const updates: Array<{ id: bigint; percent: number }> = [];

    for (const o of orders) {
      const weekKey = getWeekStart(o.deliveredAt ?? o.createdAt).getTime();
      const count = (weekCounter.get(weekKey) ?? 0) + 1;
      weekCounter.set(weekKey, count);

      if (o.riderEarningPercent === null) {
        updates.push({ id: o.id, percent: getBandPercent(count) });
      }
    }

    // Apply sequentially — each update commits on its own, no transaction
    // window to time out. Slower per-row but safe over a remote DB.
    for (const u of updates) {
      await prisma.order.update({
        where: { id: u.id },
        data: { riderEarningPercent: u.percent },
      });
      totalUpdated++;
    }

    if (updates.length > 0) {
      console.log(`  rider ${riderId.toString()}: ${updates.length} orders backfilled`);
    }
  }

  return totalUpdated;
}

async function main() {
  console.log("Backfilling rider_earning_percent…\n");

  console.log("1. Admin-dispatched orders → 0");
  const adminCount = await backfillAdminDispatched();
  console.log(`   ✓ ${adminCount} orders updated\n`);

  console.log("2. Rider-delivered orders → band %");
  const riderCount = await backfillRiderDelivered();
  console.log(`   ✓ ${riderCount} orders updated\n`);

  console.log(`Done. Total: ${adminCount + riderCount} orders backfilled.`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("Backfill failed:", err);
  await prisma.$disconnect();
  process.exit(1);
});
