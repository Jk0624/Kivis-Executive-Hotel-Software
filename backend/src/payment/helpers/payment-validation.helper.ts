import { BadRequestException } from '@nestjs/common';

// ==========================================
// VALIDATE PAYMENT AMOUNT
// ==========================================
export function validatePaymentAmount(
  expectedAmount: number,
  receivedAmount: number,
) {
  if (expectedAmount !== receivedAmount) {
    throw new BadRequestException(
      'Payment amount does not match the booking total.',
    );
  }
}