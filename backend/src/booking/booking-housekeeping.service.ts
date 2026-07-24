import {
  Injectable,
  Logger,
} from '@nestjs/common';

import {
  BookingStatus,
  RoomStatus,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notifications/notification.service';

@Injectable()
export class BookingHousekeepingService {
  private readonly logger =
    new Logger(
      BookingHousekeepingService.name,
    );

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  // ==========================================
// RELEASE EXPIRED BOOKINGS
// ==========================================
async cleanupExpiredBookings() {
  const expiryTime = new Date();

  expiryTime.setHours(
    expiryTime.getHours() - 24,
  );

  const expiredBookings =
    await this.prisma.booking.findMany({
      where: {
        status: BookingStatus.PENDING,
        createdAt: {
          lt: expiryTime,
        },
      },
      include: {
        user: true,
        room: true,
      },
    });

  for (const booking of expiredBookings) {
    await this.prisma.$transaction([
      this.prisma.booking.update({
        where: {
          id: booking.id,
        },
        data: {
          status: BookingStatus.CANCELLED,
        },
      }),

      this.prisma.room.update({
        where: {
          id: booking.roomId,
        },
        data: {
          status: RoomStatus.AVAILABLE,
        },
      }),
    ]);

    try {
    // ==========================================
    // STAFF NOTIFICATION
    // ==========================================
    const staffNotification =
        await this.notificationService.createNotification(
        'Booking Cancelled',
        `Booking ${booking.bookingId} was cancelled automatically because payment was not received within 24 hours.`,
        booking.id,
        );

    await this.notificationService.notifyReceptionists(
        staffNotification.id,
    );

    await this.notificationService.notifyAdmins(
        staffNotification.id,
    );

    // ==========================================
    // GUEST NOTIFICATION
    // ==========================================
    const guestNotification =
        await this.notificationService.createNotification(
        'Booking Cancelled',
        `Your booking was cancelled because payment was not received before the payment due time.\n\nYou can create a new booking at any time if the room is still available.`,
        booking.id,
        );

    await this.notificationService.notifyGuest(
        guestNotification.id,
        booking.userId,
    );
    } catch (error) {
    this.logger.error(
        `Failed to create expired booking notifications for booking ${booking.bookingId}.`,
        error instanceof Error
        ? error.stack
        : String(error),
    );
    }
  }
}

}