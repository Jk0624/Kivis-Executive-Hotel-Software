import "dotenv/config";

export const DEFAULT_ORDER_EXPIRY_MINUTES = 15;

function readExpiryMinutes(): number {
  const raw = Number(process.env.ORDER_EXPIRY_MINUTES);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_ORDER_EXPIRY_MINUTES;
}

// Resolved once at module load so the cron sweep and the API's `expiresAt`
// always agree on the same window. Restart the server to pick up env changes.
export const ORDER_EXPIRY_MINUTES = readExpiryMinutes();
export const ORDER_EXPIRY_MS = ORDER_EXPIRY_MINUTES * 60 * 1000;

export const DEFAULT_ORDER_DELAY_MINUTES = 60;

function readDelayMinutes(): number {
  const raw = Number(process.env.ORDER_DELAY_MINUTES);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_ORDER_DELAY_MINUTES;
}

export const ORDER_DELAY_MINUTES = readDelayMinutes();
export const ORDER_DELAY_MS = ORDER_DELAY_MINUTES * 60 * 1000;
