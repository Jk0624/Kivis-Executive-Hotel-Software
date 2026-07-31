export const EARNING_BANDS = [
  { min: 0,  max: 29,   percent: 0.70 },
  { min: 30, max: 59,   percent: 0.75 },
  { min: 60, max: null, percent: 0.80 },
] as const;

/** Returns the Monday (00:00:00) of the week containing the given date. */
export const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

/** Returns the rider's percentage share of the delivery fee for a given weekly order count. */
export const getBandPercent = (orders: number): number =>
  EARNING_BANDS.find((b) => orders >= b.min && (b.max === null || orders <= b.max))!.percent;

/**
 * Calculates total rider earnings from a list of orders using order-by-order band logic.
 *
 * The band resets every week (Monday). Within each week, each order is assigned
 * the band % based on its position in the running weekly order count:
 *   Orders 1–29  → 70%
 *   Orders 30–59 → 75%
 *   Orders 60+   → 80%
 *
 * @param orders - Array of { weekKey: number (ms timestamp of week Monday), deliveryFee: number }
 *                 sorted in delivery order within each week.
 */
export const calcOrderByOrderEarnings = (
  orders: Array<{ weekKey: number; deliveryFee: number }>,
): number => {
  // running count per week: weekKey → number of orders seen so far
  const weekCounter = new Map<number, number>();
  let total = 0;

  for (const order of orders) {
    const count = (weekCounter.get(order.weekKey) ?? 0) + 1;
    weekCounter.set(order.weekKey, count);
    const pct = getBandPercent(count);
    total += order.deliveryFee * pct;
  }

  return total;
};
