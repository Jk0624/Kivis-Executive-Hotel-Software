/**
 * Single source of truth for rider-earnings math.
 *
 * Every read site that converts an order into "what the rider earned" must
 * go through here. `markOrderDelivered` is the only WRITE site (it sets the
 * snapshot column at delivery time) and does not use these helpers.
 *
 *  Per-order earning = deliveryFee × COALESCE(rider_earning_percent, FALLBACK)
 *
 * The fallback applies only to legacy / orphan rows that don't have the
 * snapshot set. Newly-delivered orders always have it (set by
 * markOrderDelivered). 80% matches the policy used across both the rider
 * mobile API and the admin analytics endpoint.
 */

export const RIDER_EARNING_FALLBACK_PCT = 0.80;

/**
 * Accepted at the boundary because callers feed us:
 *   - number   (already-converted)
 *   - string   (raw SQL ::text column)
 *   - Decimal  (Prisma's @db.Decimal field returns a Decimal instance)
 *   - null     (snapshot missing — apply fallback)
 *
 * Number() handles the first three via valueOf/toString. Null/undefined
 * is the only branch we have to handle explicitly.
 */
type NumberLike = number | string | { toString(): string } | null | undefined;

/** Returns the effective rider earning % (number in [0, 1]) for an order. */
export function effectivePercent(snapshot: NumberLike): number {
  if (snapshot === null || snapshot === undefined) return RIDER_EARNING_FALLBACK_PCT;
  return Number(snapshot);
}

/** Returns the rider's earnings (currency amount) on a single order. */
export function earningOnOrder(deliveryFee: NumberLike, snapshot: NumberLike): number {
  return Number(deliveryFee) * effectivePercent(snapshot);
}

/**
 * SQL fragment: per-row rider earning expression.
 *
 * Safe to template into a raw query — this is a code constant with no user
 * input. Wrap with Prisma.raw() inside a tagged $queryRaw template literal,
 * or template directly inside $queryRawUnsafe.
 */
export const RIDER_EARNING_SQL =
  `delivery_fee * COALESCE(rider_earning_percent, ${RIDER_EARNING_FALLBACK_PCT})`;

/** SQL fragment: per-row CHO delivery share = deliveryFee − rider earning. */
export const CHO_DELIVERY_SHARE_SQL =
  `delivery_fee * (1 - COALESCE(rider_earning_percent, ${RIDER_EARNING_FALLBACK_PCT}))`;
