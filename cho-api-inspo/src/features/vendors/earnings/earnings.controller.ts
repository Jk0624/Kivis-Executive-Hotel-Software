import { Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../../prisma.js";
import { VendorAuthRequest } from "../../../middleware/vendors/vendorAuth.middleware.js";
import {
  EarningsQuery,
  EarningsChartQuery,
  EarningsTransactionsQuery,
  WithdrawalRequestQuery,
  RequestWithdrawalBody,
} from "./earnings.types.js";

// Helper: get all restaurant IDs owned by vendor
const getVendorRestaurantIds = async (vendorId: string): Promise<bigint[]> => {
  const restaurants = await prisma.restaurant.findMany({
    where: { vendorId: BigInt(vendorId) },
    select: { id: true },
  });
  return restaurants.map((r) => r.id);
};

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
    23,
    59,
    59,
    999,
  );

  if (period === "custom" && dateFrom && dateTo) {
    return { start: new Date(dateFrom), end: new Date(dateTo) };
  }

  switch (period) {
    case "today":
      return {
        start: new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        ),
        end: endOfToday,
      };
    case "this-week": {
      const day = now.getDay();
      const diff = day === 0 ? 6 : day - 1; // Monday as start of week
      return {
        start: new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - diff,
        ),
        end: endOfToday,
      };
    }
    case "this-month":
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: endOfToday,
      };
    case "all-time":
      return {
        start: new Date(2020, 0, 1), // Far enough back to capture all data
        end: endOfToday,
      };
    default:
      // Default to this month
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: endOfToday,
      };
  }
};

// Helper: get the equivalent previous date range for comparison
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

// Helper: build the base where clause for earnings queries
const buildEarningsWhere = (
  restaurantIds: bigint[],
  start: Date,
  end: Date,
  restaurantId?: string,
) => {
  const where: any = {
    restaurantId: { in: restaurantIds },
    status: { in: ["PICKED_UP", "DELIVERED"] },
    createdAt: { gte: start, lte: end },
  };

  if (restaurantId) {
    where.restaurantId = BigInt(restaurantId);
  }

  return where;
};

// 1. GET /earnings/summary
export const getEarningsSummary = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendorId = req.vendorId!;
    const { period, dateFrom, dateTo, restaurantId } =
      req.query as EarningsQuery;

    const restaurantIds = await getVendorRestaurantIds(vendorId);

    if (restaurantIds.length === 0) {
      res.status(200).json({
        success: true,
        data: {
          totalEarnings: "0.00",
          totalOrders: 0,
          averageOrderValue: "0.00",
          totalDeliveryFees: "0.00",
          completionRate: 0,
          comparisonPercent: null,
        },
      });
      return;
    }

    const { start, end } = getDateRange(period, dateFrom, dateTo);

    // Aggregate picked-up/delivered orders with commission. At pickup,
    // the platform assumes the customer will complete payment.
    const ids = restaurantIds.map((id) => Number(id));
    const summaryRows: Array<{
      vendor_earnings: string;
      total_delivery_fees: string;
      total_orders: bigint;
      avg_order_value: string;
    }> = await prisma.$queryRawUnsafe(
      `SELECT
        COALESCE(SUM(o.food_total * (1 - o.vendor_commission_rate)), 0)::text as vendor_earnings,
        COALESCE(SUM(o.delivery_fee), 0)::text as total_delivery_fees,
        COUNT(o.id) as total_orders,
        COALESCE(AVG(o.food_total * (1 - o.vendor_commission_rate)), 0)::text as avg_order_value
      FROM orders o
      WHERE o.restaurant_id = ANY($1::bigint[])
        AND o.status IN ('PICKED_UP', 'DELIVERED')
        AND o.created_at >= $2
        AND o.created_at <= $3`,
      ids,
      start,
      end,
    );

    const row = summaryRows[0];
    const totalEarnings = Number(row?.vendor_earnings ?? 0);
    const totalDeliveryFees = Number(row?.total_delivery_fees ?? 0);
    const totalOrders = Number(row?.total_orders ?? 0);
    const averageOrderValue = Number(row?.avg_order_value ?? 0);

    // Count cancelled orders for completion rate
    const cancelledCount = await prisma.order.count({
      where: {
        restaurantId: { in: restaurantIds },
        status: "CANCELLED",
        createdAt: { gte: start, lte: end },
        ...(restaurantId ? { restaurantId: BigInt(restaurantId) } : {}),
      },
    });

    const totalAttempted = totalOrders + cancelledCount;
    const completionRate =
      totalAttempted > 0
        ? Math.round((totalOrders / totalAttempted) * 100)
        : 0;

    // Comparison with previous period
    let comparisonPercent: number | null = null;
    const prev = getPreviousDateRange(period, start, end);

    const prevRows: Array<{ vendor_earnings: string }> = await prisma.$queryRawUnsafe(
      `SELECT
        COALESCE(SUM(o.food_total * (1 - o.vendor_commission_rate)), 0)::text as vendor_earnings
      FROM orders o
      WHERE o.restaurant_id = ANY($1::bigint[])
        AND o.status IN ('PICKED_UP', 'DELIVERED')
        AND o.created_at >= $2
        AND o.created_at <= $3`,
      ids,
      prev.start,
      prev.end,
    );

    const prevEarnings = Number(prevRows[0]?.vendor_earnings ?? 0);

    if (prevEarnings > 0) {
      comparisonPercent = Math.round(
        ((totalEarnings - prevEarnings) / prevEarnings) * 100,
      );
    }

    const completedPayouts = await prisma.vendorWithdrawalRequest.aggregate({
      where: {
        restaurantId: { in: restaurantIds },
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
  async (req: VendorAuthRequest, res: Response) => {
    const vendorId = req.vendorId!;
    const {
      period,
      dateFrom,
      dateTo,
      granularity = "daily",
    } = req.query as EarningsChartQuery;

    const restaurantIds = await getVendorRestaurantIds(vendorId);

    if (restaurantIds.length === 0) {
      res.status(200).json({
        success: true,
        data: { data: [], granularity, total: "0.00" },
      });
      return;
    }

    const { start, end } = getDateRange(period, dateFrom, dateTo);

    // Convert bigint IDs to numbers for SQL
    const ids = restaurantIds.map((id) => Number(id));

    const truncUnit =
      granularity === "monthly"
        ? "month"
        : granularity === "weekly"
          ? "week"
          : "day";

    const rows: Array<{
      period: Date;
      earnings: string;
      order_count: bigint;
    }> = await prisma.$queryRawUnsafe(
      `SELECT
        date_trunc($1, o.created_at) as period,
        COALESCE(SUM(o.food_total * (1 - o.vendor_commission_rate)), 0)::text as earnings,
        COUNT(o.id) as order_count
      FROM orders o
      WHERE o.restaurant_id = ANY($2::bigint[])
        AND o.status IN ('PICKED_UP', 'DELIVERED')
        AND o.created_at >= $3
        AND o.created_at <= $4
      GROUP BY date_trunc($1, o.created_at)
      ORDER BY period ASC`,
      truncUnit,
      ids,
      start,
      end,
    );

    // Build label formatter based on granularity
    const formatLabel = (date: Date): string => {
      const d = new Date(date);
      if (granularity === "monthly") {
        return d.toLocaleDateString("en-US", { month: "short" });
      }
      if (granularity === "weekly") {
        return `Week ${Math.ceil(d.getDate() / 7)}`;
      }
      // daily
      return d.toLocaleDateString("en-US", {
        weekday: "short",
      });
    };

    let grandTotal = 0;
    const data = rows.map((row) => {
      const earnings = Number(row.earnings);
      grandTotal += earnings;
      return {
        label: formatLabel(row.period),
        value: earnings.toFixed(2),
        orders: Number(row.order_count),
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
  async (req: VendorAuthRequest, res: Response) => {
    const vendorId = req.vendorId!;
    const {
      period,
      dateFrom,
      dateTo,
      restaurantId,
      page = "1",
      limit = "10",
    } = req.query as EarningsTransactionsQuery;

    const restaurantIds = await getVendorRestaurantIds(vendorId);

    if (restaurantIds.length === 0) {
      res.status(200).json({
        success: true,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });
      return;
    }

    const { start, end } = getDateRange(period, dateFrom, dateTo);
    const where = buildEarningsWhere(restaurantIds, start, end, restaurantId);

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: { firstName: true, lastName: true },
          },
          orderItems: {
            include: {
              food: { select: { name: true } },
            },
          },
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
        remaining > 0 ? `${firstName} + ${remaining} other${remaining > 1 ? "s" : ""}` : firstName;

      const foodTotal = Number(order.foodTotal ?? 0);
      const commission = Number(order.vendorCommissionRate ?? 0);
      const mealAmount = foodTotal * (1 - commission);

      return {
        id: order.id.toString(),
        orderId: order.id.toString(),
        customerName: `${order.user.firstName} ${order.user.lastName}`,
        itemsSummary,
        mealAmount: mealAmount.toFixed(2),
        deliveryFee: Number(order.deliveryFee).toFixed(2),
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

// 4. GET /earnings/top-items
export const getTopSellingItems = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendorId = req.vendorId!;
    const { period, dateFrom, dateTo } =
      req.query as EarningsQuery;

    const restaurantIds = await getVendorRestaurantIds(vendorId);

    if (restaurantIds.length === 0) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    const { start, end } = getDateRange(period, dateFrom, dateTo);
    const ids = restaurantIds.map((id) => Number(id));

    const rows: Array<{
      food_id: bigint;
      food_name: string;
      image_url: string | null;
      total_quantity: bigint;
      total_revenue: string;
      order_count: bigint;
    }> = await prisma.$queryRawUnsafe(
      `SELECT
        oi.food_id,
        f.name as food_name,
        f.image_url,
        SUM(oi.quantity)::bigint as total_quantity,
        SUM(oi.price * oi.quantity)::text as total_revenue,
        COUNT(DISTINCT oi.order_id)::bigint as order_count
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN foods f ON oi.food_id = f.id
      WHERE o.restaurant_id = ANY($1::bigint[])
        AND o.status IN ('PICKED_UP', 'DELIVERED')
        AND o.created_at >= $2
        AND o.created_at <= $3
      GROUP BY oi.food_id, f.name, f.image_url
      ORDER BY total_revenue DESC
      LIMIT 5`,
      ids,
      start,
      end,
    );

    const data = rows.map((row) => ({
      foodId: row.food_id.toString(),
      foodName: row.food_name,
      imageUrl: row.image_url,
      totalQuantity: Number(row.total_quantity),
      totalRevenue: Number(row.total_revenue).toFixed(2),
      orderCount: Number(row.order_count),
    }));

    res.status(200).json({ success: true, data });
  },
);

// Helper: calculate available earnings for a vendor's restaurants
const calcAvailableEarnings = async (restaurantIds: bigint[]) => {
  const ids = restaurantIds.map((id) => Number(id));

  const earnedRows: Array<{ total: string }> = await prisma.$queryRawUnsafe(
    `SELECT COALESCE(SUM(o.food_total * (1 - o.vendor_commission_rate)), 0)::text as total
     FROM orders o
     WHERE o.restaurant_id = ANY($1::bigint[])
       AND o.status IN ('PICKED_UP', 'DELIVERED')
    `,
    ids,
  );

  const totalEarned = Number(earnedRows[0]?.total ?? 0);

  const withdrawals = await prisma.vendorWithdrawalRequest.groupBy({
    by: ["status"],
    where: {
      restaurantId: { in: restaurantIds },
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

// 5. GET /earnings/balance
export const getEarningsBalance = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendorId = req.vendorId!;
    const restaurantIds = await getVendorRestaurantIds(vendorId);

    if (restaurantIds.length === 0) {
      res.status(200).json({
        success: true,
        data: {
          totalEarned: "0.00",
          availableEarnings: "0.00",
          pendingWithdrawals: "0.00",
          completedWithdrawals: "0.00",
        },
      });
      return;
    }

    const balance = await calcAvailableEarnings(restaurantIds);
    res.status(200).json({ success: true, data: balance });
  },
);

// 6. POST /earnings/withdraw
export const requestWithdrawal = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendorId = req.vendorId!;
    const { amount, paymentDetailId }: RequestWithdrawalBody = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      res.status(400).json({ success: false, message: "Invalid withdrawal amount." });
      return;
    }

    const minAmount = Number(process.env.WITHDRAWAL_MIN_AMOUNT) || 100;
    if (Number(amount) < minAmount) {
      res.status(400).json({
        success: false,
        message: `Minimum withdrawal amount is GH₵ ${minAmount}.`,
      });
      return;
    }

    const restaurantIds = await getVendorRestaurantIds(vendorId);
    if (restaurantIds.length === 0) {
      res.status(404).json({ success: false, message: "No restaurant found." });
      return;
    }

    const { availableEarnings } = await calcAvailableEarnings(restaurantIds);
    if (Number(amount) > Number(availableEarnings)) {
      res.status(400).json({
        success: false,
        message: `Insufficient earnings. Available: GH₵ ${availableEarnings}.`,
      });
      return;
    }

    // Get payment detail — specific or default
    const restaurantId = restaurantIds[0];
    const paymentDetail = paymentDetailId
      ? await prisma.restaurantPaymentDetail.findFirst({
          where: { id: BigInt(paymentDetailId), restaurantId },
        })
      : await prisma.restaurantPaymentDetail.findFirst({
          where: { restaurantId, isDefault: true },
        });

    if (!paymentDetail) {
      res.status(400).json({
        success: false,
        message: "No payment method on file. Please add one in your profile before withdrawing.",
      });
      return;
    }

    const withdrawal = await prisma.vendorWithdrawalRequest.create({
      data: {
        restaurantId,
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

// 7. GET /earnings/withdrawals
export const getWithdrawalRequests = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendorId = req.vendorId!;
    const { page = "1", limit = "20" } = req.query as WithdrawalRequestQuery;

    const restaurantIds = await getVendorRestaurantIds(vendorId);
    if (restaurantIds.length === 0) {
      res.status(200).json({
        success: true,
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });
      return;
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [requests, total] = await Promise.all([
      prisma.vendorWithdrawalRequest.findMany({
        where: { restaurantId: { in: restaurantIds } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.vendorWithdrawalRequest.count({
        where: { restaurantId: { in: restaurantIds } },
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

// 8. GET /earnings/activity — unified feed of earnings + withdrawals
export const getActivity = asyncHandler(
  async (req: VendorAuthRequest, res: Response) => {
    const vendorId = req.vendorId!;
    const {
      period,
      dateFrom,
      dateTo,
      page = "1",
      limit = "20",
    } = req.query as EarningsTransactionsQuery;

    const restaurantIds = await getVendorRestaurantIds(vendorId);

    if (restaurantIds.length === 0) {
      res.status(200).json({
        success: true,
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
      });
      return;
    }

    const { start, end } = getDateRange(period, dateFrom, dateTo);
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const [orders, withdrawals] = await Promise.all([
      prisma.order.findMany({
        where: buildEarningsWhere(restaurantIds, start, end),
        include: {
          user: { select: { firstName: true, lastName: true } },
          orderItems: { include: { food: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.vendorWithdrawalRequest.findMany({
        where: {
          restaurantId: { in: restaurantIds },
          createdAt: { gte: start, lte: end },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const earningItems = orders.map((order) => {
      const items = order.orderItems;
      const firstName = items[0]?.food?.name ?? "Order";
      const remaining = items.length - 1;
      const itemsSummary =
        remaining > 0
          ? `${firstName} + ${remaining} other${remaining > 1 ? "s" : ""}`
          : firstName;

      const foodTotal = Number(order.foodTotal ?? 0);
      const commission = Number(order.vendorCommissionRate ?? 0);
      const mealAmount = foodTotal * (1 - commission);

      return {
        type: "earning" as const,
        id: order.id.toString(),
        orderId: order.id.toString(),
        customerName: `${order.user.firstName} ${order.user.lastName}`,
        itemsSummary,
        mealAmount: mealAmount.toFixed(2),
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
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const total = merged.length;
    const data = merged.slice((pageNum - 1) * limitNum, pageNum * limitNum);

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
