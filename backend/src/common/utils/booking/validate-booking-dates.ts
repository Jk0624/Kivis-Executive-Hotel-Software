import { BadRequestException } from '@nestjs/common';

// ==========================================
// VALIDATE BOOKING DATES
// ==========================================
export function validateBookingDates(
  checkIn: Date,
  checkOut: Date,
) {
  // ==========================================
  // GET CURRENT DATE/TIME
  // ==========================================
  const now = new Date();

  // ==========================================
  // CHECK CHECK-IN DATE
  // ==========================================
  if (checkIn < now) {
    throw new BadRequestException(
      'The scheduled check-in time has already passed. Please select another check-in date.',
    );
  }

  // ==========================================
  // CHECK CHECK-OUT DATE
  // ==========================================
  if (checkOut <= checkIn) {
    throw new BadRequestException(
      'Check-out date must be after check-in date.',
    );
  }
}