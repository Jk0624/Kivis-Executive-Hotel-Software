export interface EarningsQuery {
  period?: "today" | "this-week" | "this-month" | "all-time" | "custom";
  dateFrom?: string;
  dateTo?: string;
}

export interface EarningsChartQuery extends EarningsQuery {
  granularity?: "daily" | "weekly" | "monthly";
}

export interface EarningsTransactionsQuery extends EarningsQuery {
  page?: string;
  limit?: string;
}

export interface RequestWithdrawalBody {
  amount: number;
  paymentDetailId?: string;
}

export interface WithdrawalRequestQuery {
  page?: string;
  limit?: string;
}
