// ==========================================
// GENERATE PAYMENT REFERENCE
// ==========================================
export function generatePaymentReference(): string {
  const now = new Date();

  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const random = Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase();

  return `PAY-${year}${month}${day}-${random}`;
}