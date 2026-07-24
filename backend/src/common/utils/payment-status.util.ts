// ==========================================
// FORMAT PAYMENT STATUS
// ==========================================
import { PaymentStatus } from '@prisma/client';

export function formatPaymentStatus(
  status: PaymentStatus,
): string {
  switch (status) {
    case PaymentStatus.PENDING:
      return 'Pending';

    case PaymentStatus.SUCCESS:
      return 'Successful';

    case PaymentStatus.FAILED:
      return 'Failed';

    default:
      return status;
  }
}