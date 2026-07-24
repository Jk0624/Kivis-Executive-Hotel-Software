import { BookingStatus } from '@prisma/client';

// ==========================================
// FORMAT BOOKING STATUS
// ==========================================
export function formatBookingStatus(
  status: BookingStatus,
): string {
  switch (status) {
    case BookingStatus.PENDING:
      return 'Pending';

    case BookingStatus.PAID:
      return 'Paid';

    case BookingStatus.CHECKED_IN:
      return 'Checked In';

    case BookingStatus.CHECKED_OUT:
      return 'Checked Out';

    case BookingStatus.CANCELLED:
      return 'Cancelled';

    default:
      return status;
  }
}