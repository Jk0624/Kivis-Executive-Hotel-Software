import {
  BadRequestException,
} from '@nestjs/common';

import {
  BookingStatus,
  Room,
  RoomStatus,
} from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

// ==========================================
// VALIDATE BOOKING DATES
// ==========================================
export function validateBookingDates(
  checkIn: Date,
  checkOut: Date,
) {
  const now = new Date();

  // ==========================================
  // CHECK CHECK-IN DATE
  // ==========================================
  // Bookings are only rejected if the
  // check-in date is before today.
  //
  // Same-day bookings are allowed regardless
  // of the current time.
  // ==========================================
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const checkInDate = new Date(checkIn);
  checkInDate.setHours(0, 0, 0, 0);

  if (checkInDate < today) {
    throw new BadRequestException(
      'Check-in date cannot be in the past.',
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

// ==========================================
// VALIDATE ROOM OPERATIONAL STATUS
// ==========================================
//
// Room.status represents the room's physical
// operational state only.
//
// Booking availability is handled separately by
// validateRoomAvailability().
//
export function validateRoomStatus(
  room: Room,
) {
  if (room.status === RoomStatus.MAINTENANCE) {
    throw new BadRequestException(
      'This room is currently under maintenance.',
    );
  }
}

/**
 * @deprecated
 *
 * This helper was designed for the original
 * "one room = one active booking" architecture.
 *
 * The system now supports date-based room availability.
 *
 * Use validateRoomAvailability() from:
 *
 * src/common/utils/booking/validate-room-availability.ts
 *
 * instead.
 */
// ==========================================
// CHECK ROOM AVAILABILITY
// ==========================================
export async function checkRoomAvailability(
  prisma: PrismaService,
  roomId: string,
) {
  const existingBooking =
    await prisma.booking.findFirst({
      where: {
        roomId,

        status: {
          in: [
            BookingStatus.PENDING,
            BookingStatus.PAID,
            BookingStatus.CHECKED_IN,
          ],
        },
      },
    });

  if (existingBooking) {
    throw new BadRequestException(
      'This room already has an active booking.',
    );
  }
}