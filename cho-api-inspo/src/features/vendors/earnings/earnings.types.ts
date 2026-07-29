export interface EarningsQuery {
  period?: "today" | "this-week" | "this-month" | "all-time" | "custom";
  dateFrom?: string;
  dateTo?: string;
  restaurantId?: string;
}

export interface EarningsChartQuery extends EarningsQuery {
  granularity?: "daily" | "weekly" | "monthly";
}

export interface EarningsTransactionsQuery extends EarningsQuery {
  page?: string;
  limit?: string;
}

export interface EarningsSummaryResponse {
  totalEarnings: string;
  totalOrders: number;
  averageOrderValue: string;
  totalDeliveryFees: string;
  completionRate: number;
  comparisonPercent: number | null;
}

export interface ChartDataPoint {
  label: string;
  value: string;
  orders: number;
}

export interface EarningsChartResponse {
  data: ChartDataPoint[];
  granularity: "daily" | "weekly" | "monthly";
  total: string;
}

export interface EarningsTransactionItem {
  id: string;
  orderId: string;
  customerName: string;
  itemsSummary: string;
  mealAmount: string;
  deliveryFee: string;
  status: string;
  createdAt: string;
}

export interface TopSellingItemResponse {
  foodId: string;
  foodName: string;
  imageUrl: string | null;
  totalQuantity: number;
  totalRevenue: string;
  orderCount: number;
}

export interface WithdrawalRequestQuery {
  page?: string;
  limit?: string;
}

export interface RequestWithdrawalBody {
  amount: number;
  paymentDetailId?: string;
}
