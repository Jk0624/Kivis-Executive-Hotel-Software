import { BadRequestException } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

interface ValidateRoomAvailabilityOptions {
  prisma: PrismaService;
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  excludeBookingId?: string;
}

// ==========================================
// VALIDATE ROOM AVAILABILITY
// ==========================================
export async function validateRoomAvailability({
  prisma,
  roomId,
  checkIn,
  checkOut,
  excludeBookingId,
}: ValidateRoomAvailabilityOptions) {
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      roomId,

      status: {
        in: [
          BookingStatus.PENDING,
          BookingStatus.PAID,
          BookingStatus.CHECKED_IN,
        ],
      },

      // Existing booking starts before the requested booking ends
      checkIn: {
        lt: checkOut,
      },

      // Existing booking ends after the requested booking starts
      checkOut: {
        gt: checkIn,
      },

      ...(excludeBookingId && {
        id: {
          not: excludeBookingId,
        },
      }),
    },
  });

  if (conflictingBooking) {
    throw new BadRequestException(
      'This room is unavailable for the selected dates.',
    );
  }
}