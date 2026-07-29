import { Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";
import { RiderAuthRequest } from "../../../middleware/riders/riderAuth.middleware.js";
import { getBandPercent, getWeekStart } from "../../../utils/earningBands.js";
import { earningOnOrder, RIDER_EARNING_SQL } from "../../../utils/riderEarnings.js";
import {
  EarningsQuery,
  EarningsChartQuery,
  EarningsTransactionsQuery,
  RequestWithdrawalBody,
  WithdrawalRequestQuery,
} from "./earnings.types.js";

// Helper: compute date range from period preset or custom dates
const getDateRange = (
  period?: string,
  dateFrom?: string,
  dateTo?: string,
): { start: Date; end: Date } => {
  const now = new Date();
  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23, 59, 59, 999,
  );

  if (period === "custom" && dateFrom && dateTo) {
    return { start: new Date(dateFrom), end: new Date(dateTo) };
  }

  switch (period) {
    case "today":
      return {
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        end: endOfToday,
      };
    case "this-week": {
      const day = now.getDay();
      const diff = day === 0 ? 6 : day - 1;
      return {
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff),
        end: endOfToday,
      };
    }
    case "this-month":
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: endOfToday,
      };
    case "all-time":
      return { start: new Date(2020, 0, 1), end: endOfToday };
    default:
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: endOfToday,
      };
  }
};

const getPreviousDateRange = (
  _period: string | undefined,
  start: Date,
  end: Date,
): { start: Date; end: Date } => {
  const durationMs = end.getTime() - start.getTime();
  return {
    start: new Date(start.getTime() - durationMs),
    end: new Date(start.getTime() - 1),
  };
};

const buildRiderWhere = (riderId: string, start: Date, end: Date) => ({
  riderId: BigInt(riderId),
  status: "DELIVERED" as const,
  paymentStatus: "PAID" as const,
  OR: [
    { deliveredAt: { gte: start, lte: end } },
    { deliveredAt: null, createdAt: { gte: start, lte: end } },
  ],
});

// 1. GET /earnings/summary
export const getEarningsSummary = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const riderId = req.riderId!;
    const { period, dateFrom, dateTo } = req.query as EarningsQuery;

    const { start, end } = getDateRange(period, dateFrom, dateTo);

    // Fetch orders for this period — earnings come from the per-order
    // rider_earning_percent snapshot (set at delivery time). Fallback 0.80
    // for the rare NULL row (orphan/legacy data) keeps math going safely.
    const periodRows: Array<{
      delivered_at: Date | null;
      created_at: Date;
      delivery_fee: string;
      rider_earning_percent: string | null;
    }> = await prisma.$queryRawUnsafe(
      `SELECT delivered_at, created_at, delivery_fee::text, rider_earning_percent::text
      FROM orders
      WHERE rider_id = $1
        AND status = 'DELIVERED'
        AND payment_status = 'PAID'
        AND COALESCE(delivered_at, created_at) >= $2
        AND COALESCE(delivered_at, created_at) <= $3
      ORDER BY COALESCE(delivered_at, created_at) ASC`,
      Number(riderId),
      start,
      end,
    );

    let totalEarnings = 0;
    let totalDeliveryFees = 0;

    for (const row of periodRows) {
      totalDeliveryFees += Number(row.delivery_fee);
      totalEarnings += earningOnOrder(row.delivery_fee, row.rider_earning_percent);
    }

    const totalOrders = periodRows.length;
    const averageOrderValue = totalOrders > 0 ? totalEarnings / totalOrders : 0;

    // Completion rate
    const cancelledCount = await prisma.order.count({
      where: {
        riderId: BigInt(riderId),
        status: "CANCELLED",
        createdAt: { gte: start, lte: end },
      },
    });
    const totalAttempted = totalOrders + cancelledCount;
    const completionRate =
      totalAttempted > 0 ? Math.round((totalOrders / totalAttempted) * 100) : 0;

    // Comparison with previous period — same snapshot-based formula.
    let comparisonPercent: number | null = null;
    const prev = getPreviousDateRange(period, start, end);

    const prevRows: Array<{
      delivery_fee: string;
      rider_earning_percent: string | null;
    }> = await prisma.$queryRawUnsafe(
      `SELECT delivery_fee::text, rider_earning_percent::text
      FROM orders
      WHERE rider_id = $1
        AND status = 'DELIVERED'
        AND payment_status = 'PAID'
        AND COALESCE(delivered_at, created_at) >= $2
        AND COALESCE(delivered_at, created_at) <= $3`,
      Number(riderId),
      prev.start,
      prev.end,
    );

    let prevEarnings = 0;
    for (const row of prevRows) {
      prevEarnings += earningOnOrder(row.delivery_fee, row.rider_earning_percent);
    }

    if (prevEarnings > 0) {
      comparisonPercent = Math.round(
        ((totalEarnings - prevEarnings) / prevEarnings) * 100,
      );
    }

    const completedPayouts = await prisma.riderWithdrawalRequest.aggregate({
      where: {
        riderId: BigInt(riderId),
        status: "COMPLETED",
        processedAt: { gte: start, lte: end },
      },
      _sum: { amount: true },
    });
    const totalPayouts = Number(completedPayouts._sum.amount ?? 0);

    res.status(200).json({
      success: true,
      data: {
        totalEarnings: totalEarnings.toFixed(2),
        totalOrders,
        averageOrderValue: averageOrderValue.toFixed(2),
        totalDeliveryFees: totalDeliveryFees.toFixed(2),
        totalPayouts: totalPayouts.toFixed(2),
        completionRate,
        comparisonPercent,
      },
    });
  },
);

// 2. GET /earnings/chart
export const getEarningsChart = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const riderId = req.riderId!;
    const {
      period,
      dateFrom,
      dateTo,
      granularity = "daily",
    } = req.query as EarningsChartQuery;

    const { start, end } = getDateRange(period, dateFrom, dateTo);

    const truncUnit =
      granularity === "monthly"
        ? "month"
        : granularity === "weekly"
          ? "week"
          : "day";

    // Period orders only — earnings come from the snapshot.
    const periodRows: Array<{
      delivered_at: Date | null;
      created_at: Date;
      delivery_fee: string;
      rider_earning_percent: string | null;
    }> = await prisma.$queryRawUnsafe(
      `SELECT delivered_at, created_at, delivery_fee::text, rider_earning_percent::text
      FROM orders
      WHERE rider_id = $1
        AND status = 'DELIVERED'
        AND payment_status = 'PAID'
        AND COALESCE(delivered_at, created_at) >= $2
        AND COALESCE(delivered_at, created_at) <= $3
      ORDER BY COALESCE(delivered_at, created_at) ASC`,
      Number(riderId),
      start,
      end,
    );

    const formatLabel = (date: Date): string => {
      const d = new Date(date);
      if (granularity === "monthly") {
        return d.toLocaleDateString("en-US", { month: "short" });
      }
      if (granularity === "weekly") {
        return `Week ${Math.ceil(d.getDate() / 7)}`;
      }
      return d.toLocaleDateString("en-US", { weekday: "short" });
    };

    const truncToKey = (date: Date): number => {
      const d = new Date(date);
      if (granularity === "monthly") {
        return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      }
      if (granularity === "weekly") {
        return getWeekStart(d).getTime();
      }
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    };

    // Bucket per-order earnings (from snapshot) into chart periods.
    const bucketEarnings = new Map<number, number>();
    const bucketOrders = new Map<number, number>();
    const bucketDates = new Map<number, Date>();

    for (const row of periodRows) {
      const orderDate = row.delivered_at ?? row.created_at;
      const earnings = earningOnOrder(row.delivery_fee, row.rider_earning_percent);
      const bucketKey = truncToKey(orderDate);

      bucketEarnings.set(bucketKey, (bucketEarnings.get(bucketKey) ?? 0) + earnings);
      bucketOrders.set(bucketKey, (bucketOrders.get(bucketKey) ?? 0) + 1);
      if (!bucketDates.has(bucketKey)) bucketDates.set(bucketKey, orderDate);
    }

    let grandTotal = 0;
    const data = Array.from(bucketEarnings.entries())
      .sort(([a], [b]) => a - b)
      .map(([key, earnings]) => {
        grandTotal += earnings;
        return {
          label: formatLabel(bucketDates.get(key)!),
          value: earnings.toFixed(2),
          orders: bucketOrders.get(key) ?? 0,
        };
      });

    res.status(200).json({
      success: true,
      data: {
        data,
        granularity,
        total: grandTotal.toFixed(2),
      },
    });
  },
);

// 3. GET /earnings/transactions
export const getRecentTransactions = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const riderId = req.riderId!;
    const {
      period,
      dateFrom,
      dateTo,
      page = "1",
      limit = "10",
    } = req.query as EarningsTransactionsQuery;

    const { start, end } = getDateRange(period, dateFrom, dateTo);
    const where = buildRiderWhere(riderId, start, end);

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true } },
          orderItems: { include: { food: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ]);

    const data = orders.map((order) => {
      const items = order.orderItems;
      const firstName = items[0]?.food?.name ?? "Order";
      const remaining = items.length - 1;
      const itemsSummary =
        remaining > 0
          ? `${firstName} + ${remaining} other${remaining > 1 ? "s" : ""}`
          : firstName;

      const deliveryFee = Number(order.deliveryFee);
      const riderEarnings = earningOnOrder(deliveryFee, order.riderEarningPercent);

      return {
        id: order.id.toString(),
        orderId: order.id.toString(),
        customerName: `${order.user.firstName} ${order.user.lastName}`,
        itemsSummary,
        mealAmount: riderEarnings.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        status: order.status,
        createdAt: order.createdAt.toISOString(),
      };
    });

    res.status(200).json({
      success: true,
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  },
);

// 4. GET /earnings/top-items (not applicable to riders)
export const getTopSellingItems = asyncHandler(
  async (_req: RiderAuthRequest, res: Response) => {
    res.status(200).json({ success: true, data: [] });
  },
);

// Helper: compute band-weighted rider earnings using order-by-order logic.
// Each order earns its delivery fee × the band % for its position in that week's running count.
// No weekly freeze — current week earnings are immediately available.
const calcRiderAvailableEarnings = async (riderId: string) => {
  // Total earned from snapshot. One SUM aggregate, no per-order loop needed.
  const sumResult = await prisma.$queryRawUnsafe<Array<{ total_earned: string }>>(
    `SELECT COALESCE(SUM(${RIDER_EARNING_SQL}), 0)::text AS total_earned
    FROM orders
    WHERE rider_id = $1
      AND status = 'DELIVERED'
      AND payment_status = 'PAID'`,
    Number(riderId),
  );
  const totalEarned = Number(sumResult[0]?.total_earned ?? 0);

  // Sum withdrawals by status
  const withdrawals = await prisma.riderWithdrawalRequest.groupBy({
    by: ["status"],
    where: {
      riderId: BigInt(riderId),
      status: { in: ["PENDING", "APPROVED", "PROCESSING", "COMPLETED"] },
    },
    _sum: { amount: true },
  });

  let pendingWithdrawals = 0;
  let completedWithdrawals = 0;

  for (const row of withdrawals) {
    const sum = Number(row._sum.amount ?? 0);
    if (row.status === "COMPLETED") {
      completedWithdrawals += sum;
    } else {
      pendingWithdrawals += sum;
    }
  }

  const availableEarnings = totalEarned - completedWithdrawals - pendingWithdrawals;

  return {
    totalEarned: totalEarned.toFixed(2),
    availableEarnings: Math.max(0, availableEarnings).toFixed(2),
    pendingWithdrawals: pendingWithdrawals.toFixed(2),
    completedWithdrawals: completedWithdrawals.toFixed(2),
  };
};

// 5. GET /earnings/weekly-summary
export const getWeeklyEarningsSummary = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const riderId = req.riderId!;

    // All delivered+paid orders with their snapshot.
    const allRows: Array<{
      delivered_at: Date | null;
      created_at: Date;
      delivery_fee: string;
      rider_earning_percent: string | null;
    }> = await prisma.$queryRawUnsafe(
      `SELECT delivered_at, created_at, delivery_fee::text, rider_earning_percent::text
      FROM orders
      WHERE rider_id = $1
        AND status = 'DELIVERED'
        AND payment_status = 'PAID'
      ORDER BY COALESCE(delivered_at, created_at) ASC`,
      Number(riderId),
    );

    // Per-week accumulators: earnings from snapshot, plus order count for
    // the "dominant band" display badge.
    const weekEarnings = new Map<number, number>();
    const weekDeliveryFees = new Map<number, number>();
    const weekOrders = new Map<number, number>();
    const weekStartDates = new Map<number, Date>();

    for (const row of allRows) {
      const orderDate = row.delivered_at ?? row.created_at;
      const weekStart = getWeekStart(orderDate);
      const weekKey = weekStart.getTime();

      const fee = Number(row.delivery_fee);
      const earnings = earningOnOrder(fee, row.rider_earning_percent);

      weekEarnings.set(weekKey, (weekEarnings.get(weekKey) ?? 0) + earnings);
      weekDeliveryFees.set(weekKey, (weekDeliveryFees.get(weekKey) ?? 0) + fee);
      weekOrders.set(weekKey, (weekOrders.get(weekKey) ?? 0) + 1);
      if (!weekStartDates.has(weekKey)) weekStartDates.set(weekKey, weekStart);
    }

    const data = Array.from(weekEarnings.entries())
      .sort(([a], [b]) => b - a) // most recent first
      .map(([weekKey, riderEarnings]) => {
        const weekStart = weekStartDates.get(weekKey)!;
        const weekEnd = new Date(weekKey + 6 * 24 * 60 * 60 * 1000 + 23 * 3600 * 1000 + 59 * 60 * 1000 + 59 * 1000);
        const orders = weekOrders.get(weekKey) ?? 0;
        const deliveryFees = weekDeliveryFees.get(weekKey) ?? 0;
        // Dominant band: the band for the final order count of the week
        const bandPercent = Math.round(getBandPercent(orders) * 100) as 70 | 75 | 80;

        return {
          weekStart: weekStart.toISOString(),
          weekEnd: weekEnd.toISOString(),
          orders,
          deliveryFees: deliveryFees.toFixed(2),
          bandPercent,
          riderEarnings: riderEarnings.toFixed(2),
          isEligible: true, // all orders are immediately eligible — no freeze
        };
      });

    res.status(200).json({ success: true, data });
  },
);

// 6. GET /earnings/balance
export const getEarningsBalance = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const riderId = req.riderId!;
    const balance = await calcRiderAvailableEarnings(riderId);
    res.status(200).json({ success: true, data: balance });
  },
);

// 7. POST /earnings/withdraw
export const requestWithdrawal = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const riderId = req.riderId!;
    const { amount, paymentDetailId }: RequestWithdrawalBody = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      res.status(400).json({ success: false, message: "Invalid withdrawal amount." });
      return;
    }

    const minAmount = Number(process.env.WITHDRAWAL_MIN_AMOUNT) || 10;
    if (Number(amount) < minAmount) {
      res.status(400).json({
        success: false,
        message: `Minimum withdrawal amount is GH₵ ${minAmount}.`,
      });
      return;
    }

    const { availableEarnings } = await calcRiderAvailableEarnings(riderId);
    if (Number(amount) > Number(availableEarnings)) {
      res.status(400).json({
        success: false,
        message: `Insufficient earnings. Available: GH₵ ${availableEarnings}.`,
      });
      return;
    }

    const paymentDetail = paymentDetailId
      ? await prisma.riderPaymentDetail.findFirst({
          where: { id: BigInt(paymentDetailId), riderId: BigInt(riderId) },
        })
      : await prisma.riderPaymentDetail.findFirst({
          where: { riderId: BigInt(riderId), isDefault: true },
        });

    if (!paymentDetail) {
      res.status(400).json({
        success: false,
        message: "No payment method on file. Please add one in your profile before withdrawing.",
      });
      return;
    }

    const withdrawal = await prisma.riderWithdrawalRequest.create({
      data: {
        riderId: BigInt(riderId),
        amount,
        method: paymentDetail.method,
        accountName: paymentDetail.accountName,
        accountNumber: paymentDetail.accountNumber ?? null,
        bankName: paymentDetail.bankName ?? null,
        network: paymentDetail.network ?? null,
        phone: paymentDetail.phone ?? null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Withdrawal request submitted successfully.",
      data: {
        id: withdrawal.id.toString(),
        amount: Number(withdrawal.amount).toFixed(2),
        status: withdrawal.status,
        method: withdrawal.method,
        accountName: withdrawal.accountName,
        createdAt: withdrawal.createdAt.toISOString(),
        processedAt: null,
      },
    });
  },
);

// 9. GET /earnings/activity — unified feed of earnings + withdrawals
export const getActivity = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const riderId = req.riderId!;
    const {
      period,
      dateFrom,
      dateTo,
      page = "1",
      limit = "20",
    } = req.query as EarningsTransactionsQuery;

    const { start, end } = getDateRange(period, dateFrom, dateTo);
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const [periodOrders, withdrawals] = await Promise.all([
      prisma.order.findMany({
        where: buildRiderWhere(riderId, start, end),
        include: {
          user: { select: { firstName: true, lastName: true } },
          orderItems: { include: { food: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.riderWithdrawalRequest.findMany({
        where: {
          riderId: BigInt(riderId),
          createdAt: { gte: start, lte: end },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const earningItems = periodOrders.map((order) => {
      const items = order.orderItems;
      const firstName = items[0]?.food?.name ?? "Order";
      const remaining = items.length - 1;
      const itemsSummary =
        remaining > 0
          ? `${firstName} + ${remaining} other${remaining > 1 ? "s" : ""}`
          : firstName;

      const deliveryFee = Number(order.deliveryFee);
      const riderEarnings = earningOnOrder(deliveryFee, order.riderEarningPercent);

      return {
        type: "earning" as const,
        id: order.id.toString(),
        orderId: order.id.toString(),
        customerName: `${order.user.firstName} ${order.user.lastName}`,
        itemsSummary,
        mealAmount: riderEarnings.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        status: order.status,
        createdAt: order.createdAt.toISOString(),
      };
    });

    const withdrawalItems = withdrawals.map((w) => ({
      type: "withdrawal" as const,
      id: w.id.toString(),
      amount: Number(w.amount).toFixed(2),
      status: w.status,
      method: w.method,
      accountName: w.accountName,
      accountNumber: w.accountNumber,
      bankName: w.bankName,
      network: w.network,
      phone: w.phone,
      adminNote: w.adminNote,
      createdAt: w.createdAt.toISOString(),
      processedAt: w.processedAt?.toISOString() ?? null,
    }));

    const merged = [...earningItems, ...withdrawalItems].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const total = merged.length;
    const skip = (pageNum - 1) * limitNum;
    const data = merged.slice(skip, skip + limitNum);

    res.status(200).json({
      success: true,
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  },
);

// 8. GET /earnings/withdrawals
export const getWithdrawalRequests = asyncHandler(
  async (req: RiderAuthRequest, res: Response) => {
    const riderId = req.riderId!;
    const { page = "1", limit = "20" } = req.query as WithdrawalRequestQuery;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [requests, total] = await Promise.all([
      prisma.riderWithdrawalRequest.findMany({
        where: { riderId: BigInt(riderId) },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.riderWithdrawalRequest.count({
        where: { riderId: BigInt(riderId) },
      }),
    ]);

    const data = requests.map((r) => ({
      id: r.id.toString(),
      amount: Number(r.amount).toFixed(2),
      status: r.status,
      method: r.method,
      accountName: r.accountName,
      createdAt: r.createdAt.toISOString(),
      processedAt: r.processedAt?.toISOString() ?? null,
    }));

    res.status(200).json({
      success: true,
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  },
);
