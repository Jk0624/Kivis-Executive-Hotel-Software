import { Response } from "express";
import asyncHandler from "express-async-handler";
import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../../prisma.js";
import { AdminAuthRequest } from "../../../middleware/admin/adminAuth.middleware.js";
import { OrderStatus, PaymentStatus } from "../../../generated/prisma/enums.js";
import { RIDER_EARNING_SQL, CHO_DELIVERY_SHARE_SQL } from "../../../utils/riderEarnings.js";
import { startOfDayUTC, endOfDayUTC } from "../../../utils/dateRange.js";

const parseDateRange = (query: any): { from: Date; to: Date } => {
  const { preset, dateFrom, dateTo } = query;
  const now = new Date();

  if (dateFrom && dateTo) {
    return { from: startOfDayUTC(dateFrom), to: endOfDayUTC(dateTo) };
  }

  switch (preset) {
    case "today": {
      const from = new Date(now); from.setHours(0, 0, 0, 0);
      const to = new Date(now); to.setHours(23, 59, 59, 999);
      return { from, to };
    }
    case "yesterday": {
      const from = new Date(now); from.setDate(from.getDate() - 1); from.setHours(0, 0, 0, 0);
      const to = new Date(from); to.setHours(23, 59, 59, 999);
      return { from, to };
    }
    case "this_week": {
      const from = new Date(now); from.setDate(from.getDate() - from.getDay()); from.setHours(0, 0, 0, 0);
      const to = new Date(now); to.setHours(23, 59, 59, 999);
      return { from, to };
    }
    case "last_week": {
      const from = new Date(now); from.setDate(from.getDate() - from.getDay() - 7); from.setHours(0, 0, 0, 0);
      const to = new Date(from); to.setDate(to.getDate() + 6); to.setHours(23, 59, 59, 999);
      return { from, to };
    }
    case "this_month": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      const to = new Date(now); to.setHours(23, 59, 59, 999);
      return { from, to };
    }
    case "last_month": {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { from, to };
    }
    case "this_year": {
      const from = new Date(now.getFullYear(), 0, 1);
      const to = new Date(now); to.setHours(23, 59, 59, 999);
      return { from, to };
    }
    default: {
      // Last 30 days
      const from = new Date(now); from.setDate(from.getDate() - 30); from.setHours(0, 0, 0, 0);
      const to = new Date(now); to.setHours(23, 59, 59, 999);
      return { from, to };
    }
  }
};

export const getFinancialSummary = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const { from, to } = parseDateRange(req.query);

  const dateFilter = { gte: from, lte: to };

  const [
    orderStats,
    platformRevenue,
    riderEarnings,
    vendorEarnings,
    newUsers,
    newVendors,
    newRiders,
    totalUsers,
    totalVendors,
    totalRiders,
    pendingWithdrawals,
  ] = await Promise.all([
    // Order counts by status
    prisma.order.groupBy({
      by: ["status"],
      where: { createdAt: dateFilter },
      _count: { id: true },
      _sum: { totalAmount: true },
    }),

    // Platform revenue on PAID orders, broken down by source:
    //   - Service fees     → 100% CHO
    //   - Delivery fees    → split by rider_earning_percent (snapshot at delivery)
    //   - Food total       → split by vendor_commission_rate (snapshot at order)
    // Defensive defaults for missing snapshots: rider 80/20, vendor 0/100 (full to vendor).
    prisma.$queryRaw<Array<{
      paid_count: bigint;
      service_fees: string;
      delivery_fees_gross: string;
      cho_delivery_share: string;
      rider_delivery_share: string;
      food_total_gross: string;
      cho_vendor_commission: string;
      vendor_food_share: string;
    }>>`
      SELECT
        COUNT(*)::bigint                                                                            AS paid_count,
        COALESCE(SUM(service_fee), 0)::text                                                          AS service_fees,
        COALESCE(SUM(delivery_fee), 0)::text                                                          AS delivery_fees_gross,
        COALESCE(SUM(${Prisma.raw(CHO_DELIVERY_SHARE_SQL)}), 0)::text                                 AS cho_delivery_share,
        COALESCE(SUM(${Prisma.raw(RIDER_EARNING_SQL)}), 0)::text                                       AS rider_delivery_share,
        COALESCE(SUM(food_total), 0)::text                                                            AS food_total_gross,
        COALESCE(SUM(food_total * COALESCE(vendor_commission_rate, 0)), 0)::text                      AS cho_vendor_commission,
        COALESCE(SUM(food_total * (1 - COALESCE(vendor_commission_rate, 0))), 0)::text                AS vendor_food_share
      FROM orders
      WHERE created_at >= ${from} AND created_at <= ${to} AND payment_status = 'PAID'
    `,

    // Total rider earnings paid out
    prisma.riderWithdrawalRequest.aggregate({
      where: { createdAt: dateFilter, status: "COMPLETED" },
      _sum: { amount: true },
      _count: { id: true },
    }),

    // Total vendor earnings paid out
    prisma.vendorWithdrawalRequest.aggregate({
      where: { createdAt: dateFilter, status: "COMPLETED" },
      _sum: { amount: true },
      _count: { id: true },
    }),

    prisma.user.count({ where: { createdAt: dateFilter } }),
    prisma.vendor.count({ where: { createdAt: dateFilter } }),
    prisma.rider.count({ where: { createdAt: dateFilter } }),
    prisma.user.count(),
    prisma.vendor.count(),
    prisma.rider.count(),

    // Pending payout requests
    Promise.all([
      prisma.vendorWithdrawalRequest.count({ where: { status: "PENDING" } }),
      prisma.riderWithdrawalRequest.count({ where: { status: "PENDING" } }),
    ]),
  ]);

  const deliveredOrders = orderStats.find((s) => s.status === OrderStatus.DELIVERED);
  const cancelledOrders = orderStats.find((s) => s.status === OrderStatus.CANCELLED);
  const totalOrders = orderStats.reduce((sum, s) => sum + s._count.id, 0);
  const gmv = Number(deliveredOrders?._sum?.totalAmount ?? 0).toFixed(2);

  res.status(200).json({
    success: true,
    data: {
      period: { from: from.toISOString(), to: to.toISOString() },
      orders: {
        total: totalOrders,
        delivered: deliveredOrders?._count.id ?? 0,
        cancelled: cancelledOrders?._count.id ?? 0,
        gmv,
      },
      revenue: {
        serviceFees:         Number(platformRevenue[0]?.service_fees ?? 0).toFixed(2),
        deliveryFeesGross:   Number(platformRevenue[0]?.delivery_fees_gross ?? 0).toFixed(2),
        choDeliveryShare:    Number(platformRevenue[0]?.cho_delivery_share ?? 0).toFixed(2),
        riderDeliveryShare:  Number(platformRevenue[0]?.rider_delivery_share ?? 0).toFixed(2),
        foodTotalGross:      Number(platformRevenue[0]?.food_total_gross ?? 0).toFixed(2),
        choVendorCommission: Number(platformRevenue[0]?.cho_vendor_commission ?? 0).toFixed(2),
        vendorFoodShare:     Number(platformRevenue[0]?.vendor_food_share ?? 0).toFixed(2),
      },
      payouts: {
        riderPayoutsCompleted: Number(riderEarnings._sum.amount ?? 0).toFixed(2),
        riderPayoutsCount: riderEarnings._count.id,
        vendorPayoutsCompleted: Number(vendorEarnings._sum.amount ?? 0).toFixed(2),
        vendorPayoutsCount: vendorEarnings._count.id,
      },
      newSignups: { users: newUsers, vendors: newVendors, riders: newRiders },
      totals: { users: totalUsers, vendors: totalVendors, riders: totalRiders },
      pendingWithdrawals: {
        vendors: pendingWithdrawals[0],
        riders: pendingWithdrawals[1],
      },
    },
  });
});

export const getOrderTrend = asyncHandler(async (req: AdminAuthRequest, res: Response) => {
  const { from, to } = parseDateRange(req.query);

  // Daily order counts grouped by date
  const orders = await prisma.$queryRaw<Array<{ date: string; count: bigint; total: string }>>`
    SELECT
      DATE(created_at)::text AS date,
      COUNT(*)::bigint AS count,
      COALESCE(SUM(total_amount), 0)::text AS total
    FROM orders
    WHERE created_at >= ${from} AND created_at <= ${to}
      AND status = 'DELIVERED'
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;

  res.status(200).json({
    success: true,
    data: orders.map((row) => ({
      date: row.date,
      count: Number(row.count),
      total: row.total,
    })),
  });
});
