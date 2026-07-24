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
  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0,
  );

  checkIn.setHours(
    0,
    0,
    0,
    0,
  );

  checkOut.setHours(
    0,
    0,
    0,
    0,
  );

  // ==========================================
  // CHECK CHECK-IN DATE
  // ==========================================
  if (checkIn < today) {
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
// VALIDATE ROOM STATUS
// ==========================================
export function validateRoomStatus(
  room: Room,
) {
  if (room.status !== RoomStatus.AVAILABLE) {
    throw new BadRequestException(
      'Room is currently unavailable.',
    );
  }
}

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