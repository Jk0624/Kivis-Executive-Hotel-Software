import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateBookingDto } from './dto/create-booking.dto';
import { PrismaService } from '../prisma/prisma.service';
import { checkRoomAvailability, 
  validateRoomStatus, 
} from './helpers/booking-validation.helper';
import { validateBookingDates } from '../common/utils/booking/validate-booking-dates';
import { generateBookingReference } from './utils/booking-reference.util';
import {
  calculateBookingAmount,
} from './helpers/booking-pricing.helper';
import { SecurityAuditService } from '../security-audit/security-audit.service';
import { SecurityAction, BookingStatus, RoomStatus, PaymentStatus } from '@prisma/client';
import { NotificationService } from '../notifications/notification.service';
import { formatRoomType } from '../common/utils/room-type.util';
import { formatBookingStatus } from '../common/utils/booking-status.util';
import { BookingHousekeepingService } from './booking-housekeeping.service';
import { applyHotelBookingTimes } from '../common/utils/booking/apply-hotel-booking-dates';
import { validateRoomAvailability } from '../common/utils/booking/validate-room-availability';


@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly securityAuditService: SecurityAuditService,
    private readonly notificationService: NotificationService,
    private readonly bookingHousekeepingService: BookingHousekeepingService,
  ) {}

  // ==========================================
  // FIND ROOM
  // ==========================================
  private async findRoom(roomId: string) {
    const room = await this.prisma.room.findUnique({
      where: {
        id: roomId,
      },
    });

    if (!room) {
      throw new NotFoundException(
        'Room not found.',
      );
    }

    return room;
  }

async createBookingRecord(
  userId: string,
  roomId: string,
  checkIn: Date,
  checkOut: Date,
) {
  const bookingReference =
    generateBookingReference();

  return this.prisma.$transaction(
    async (tx) => {

      const booking =
        await tx.booking.create({
          data: {
            bookingId: bookingReference,
            userId,
            roomId,
            checkIn,
            checkOut,
          },
        });

      // ======================================================
      // I WILL NOT UPDATE ROOM STATUS HERE ANYMORE V2
      // ======================================================
      // A room remains AVAILABLE until the guest physically
      // checks in.

      return booking;
    },
  );
}

  // ==========================================
  // CREATE WALK-IN BOOKING
  // ==========================================
  async createWalkInBooking(
    guestId: string,
    roomId: string,
    checkIn: Date,
    checkOut: Date,
  ) {
    return this.createBookingRecord(
      guestId,
      roomId,
      checkIn,
      checkOut,
    );
  }

  // ==========================================
  // CREATE BOOKING
  // ==========================================
  async createBooking(
    user: AuthenticatedUser,
    createBookingDto: CreateBookingDto,
  ) {
    
    // ==========================================
    // FIND ROOM
    // ==========================================
    const room = await this.findRoom(
      createBookingDto.roomId,
    );

    // ==========================================
    // FIND USER
    // ==========================================
    const bookingUser = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!bookingUser) {
      throw new NotFoundException(
        'User not found.',
      );
    }

  // ==========================================
  // NORMALIZE HOTEL BOOKING DATES
  // ==========================================
  const {
    checkIn,
    checkOut,
  } = applyHotelBookingTimes(
    new Date(createBookingDto.checkInDate),
    new Date(createBookingDto.checkOutDate),
  );

  // ==========================================
  // VALIDATE BOOKING DATES
  // ==========================================
  validateBookingDates(
    checkIn,
    checkOut,
  );

  // ==========================================
  // CALCULATE BOOKING AMOUNT
  // ==========================================
  const pricing =
    calculateBookingAmount(
      room.price,
      checkIn,
      checkOut,
    );

  // ==========================================
  // RELEASE EXPIRED BOOKINGS
  // ==========================================
  await this.bookingHousekeepingService.cleanupExpiredBookings();

    // ==========================================
    // VALIDATE ROOM STATUS
    // ==========================================
    validateRoomStatus(room);

    // ==========================================
    // VALIDATE ROOM AVAILABILITY
    // ==========================================
    await validateRoomAvailability({
      prisma: this.prisma,
      roomId: room.id,
      checkIn,
      checkOut,
    });

   // ==========================================
  // CREATE BOOKING
  // ==========================================
  const booking =
    await this.createBookingRecord(
      user.id,
      room.id,
      checkIn,
      checkOut,
    );

  // ==========================================
  // CALCULATE PAYMENT DUE TIME
  // ==========================================
  const paymentDue = new Date(
    booking.createdAt,
  );

  paymentDue.setHours(
    paymentDue.getHours() + 24,
  );

  const formattedPaymentDue =
    paymentDue.toLocaleString();

  // ==========================================
  // CREATE PAYMENT REQUIRED NOTIFICATION
  // ==========================================
  try {
    const guestNotification =
      await this.notificationService.createNotification(
        'Payment Required',
        `Your booking has been created.

  Booking Reference:
  ${booking.bookingId}

  Payment Due:
  ${formattedPaymentDue}

  Complete payment before the due time to confirm your booking.`,
        booking.id,
      );

    await this.notificationService.notifyGuest(
      guestNotification.id,
      booking.userId,
    );
  } catch (error) {
    this.logger.error(
      'Failed to create payment required notification.',
      error instanceof Error
        ? error.stack
        : String(error),
    );
  }

  // ============================
  // RESPONSE
  // ============================
    return {
    message: 'Booking created successfully.',
    booking,
    pricing,
  };
  }

// ==========================================
// GET ALL BOOKINGS
// ==========================================
async getAllBookings() {

  const bookings =
    await this.prisma.booking.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: true,
        room: true,
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

  return {
    message:
      'Bookings retrieved successfully.',
    bookings,
  };
}

// ==========================================
// GET BOOKING FOR ADMIN
// ==========================================
async getBookingForAdmin(
  bookingReference: string,
) {

  // ==========================================
  // VERIFY BOOKING EXISTS
  // ==========================================
  await this.findBooking(
    bookingReference,
  );

  // ==========================================
  // GET BOOKING DETAILS
  // ==========================================
  const booking =
    await this.prisma.booking.findUnique({
      where: {
        bookingId: bookingReference,
      },
      include: {
        user: true,
        room: true,
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        accessLogs: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        securityAuditLogs: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

  return {
    message:
      'Booking retrieved successfully.',
    booking,
  };
}

// ==========================================
// GET BOOKING FOR RECEPTION
// ==========================================
async getBookingForReception(
  bookingReference: string,
) {

  // ==========================================
  // VERIFY BOOKING EXISTS
  // ==========================================
  await this.findBooking(
    bookingReference,
  );

  // ==========================================
  // GET BOOKING DETAILS
  // ==========================================
  const booking =
    await this.prisma.booking.findUnique({
      where: {
        bookingId: bookingReference,
      },
      select: {
        bookingId: true,
        status: true,
        checkIn: true,
        checkOut: true,

        user: {
          select: {
            name: true,
            phone: true,
          },
        },

        room: {
          select: {
            roomNo: true,
            type: true,
            price: true,
          },
        },

        payments: {
          where: {
            status: PaymentStatus.SUCCESS,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            status: true,
            method: true,
            amount: true,
          },
        },
      },
    });

  return {
    message:
      'Booking retrieved successfully.',

    booking: {
      bookingReference:
        booking!.bookingId,

      status:
        booking!.status,

      guest:
        booking!.user,

      room:
        booking!.room,

      checkIn:
        booking!.checkIn,

      checkOut:
        booking!.checkOut,

      payment:
        booking!.payments[0] ?? null,
    },
  };
}

// ==========================================
// SEARCH BOOKINGS
// ==========================================
async searchBookings(
  search: string,
) {
  const bookings =
    await this.prisma.booking.findMany({
      where: {
        OR: [
          {
            bookingId: search,
          },
          {
            user: {
              phone: {
                contains: search,
              },
            },
          },
        ],
      },

      orderBy: {
        createdAt: 'desc',
      },

      include: {
        user: true,
        room: true,
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

  return {
    message:
      'Bookings retrieved successfully.',
    bookings,
  };
}

// ==========================================
// FIND CHECK-IN BOOKING BY PHONE
// ==========================================
async findCheckInBookingByPhone(
  phone: string,
) {

  const bookings =
  await this.prisma.booking.findMany({
      where: {
        status: BookingStatus.PAID,

        user: {
          phone,
        },
      },

      orderBy: {
        checkIn: 'asc',
      },

      select: {
        bookingId: true,

        checkIn: true,

        checkOut: true,

        user: {
          select: {
            name: true,
            phone: true,
          },
        },

        room: {
          select: {
            roomNo: true,
            type: true,
          },
        },

        payments: {
          where: {
            status: PaymentStatus.SUCCESS,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            status: true,
          },
        },
      },
    });

  if (bookings.length === 0) {
  throw new NotFoundException(
    'No paid booking found for this phone number.',
  );
}

return {
  message: 'Bookings found.',

  bookings: bookings.map((booking) => ({
    bookingReference: booking.bookingId,

    guest: booking.user,

    paymentStatus:
      booking.payments[0]?.status ??
      'UNPAID',

    room: booking.room,

    checkIn: booking.checkIn,

    checkOut: booking.checkOut,
  })),
};
}

// ==========================================
// FIND CHECK-OUT BOOKING BY PHONE
// ==========================================
async findCheckOutBookingByPhone(
  phone: string,
) {

  const booking =
    await this.prisma.booking.findFirst({
      where: {
        status: BookingStatus.CHECKED_IN,

        user: {
          phone,
        },
      },

      orderBy: {
        checkIn: 'asc',
      },

      select: {
        bookingId: true,

        checkIn: true,

        checkOut: true,

        user: {
          select: {
            name: true,
            phone: true,
          },
        },

        room: {
          select: {
            roomNo: true,
            type: true,
          },
        },

        payments: {
          where: {
            status: PaymentStatus.SUCCESS,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            status: true,
          },
        },
      },
    });

  if (!booking) {
    throw new NotFoundException(
      'No checked-in booking found for this phone number.',
    );
  }

  return {
    message: 'Booking found.',

    booking: {
      bookingReference: booking.bookingId,

      guest: booking.user,

      paymentStatus:
        booking.payments[0]?.status ??
        'UNPAID',

      room: booking.room,

      checkIn: booking.checkIn,

      checkOut: booking.checkOut,
    },
  };
}

// ==========================================
// FIND BOOKING OR THROW JUST FOR VALIDATION
// ==========================================
protected async findBooking(
  bookingId: string,
) {
  const booking =
    await this.prisma.booking.findUnique({
      where: {
        bookingId,
      },
      include: {
        user: true,
        room: true,
      },
    });

  if (!booking) {
    throw new NotFoundException(
      'Booking not found.',
    );
  }

  return booking;
}

// ==========================================
// VALIDATE BOOKING CANCELLATION
// ==========================================
protected validateBookingCanBeCancelled(
  status: BookingStatus,
) {
  if (
    status !== BookingStatus.PENDING &&
    status !== BookingStatus.PAID
  ) {
    throw new BadRequestException(
      'This booking cannot be cancelled.',
    );
  }
}

// ==========================================
// CANCEL BOOKING
// ==========================================
async cancelBookingRecord(
  booking: {
    id: string;
    roomId: string;
  },
) {
  await this.prisma.booking.update({
    where: {
      id: booking.id,
    },
    data: {
      status: BookingStatus.CANCELLED,
    },
  });

  // ======================================================
  // DO NOT UPDATE ROOM STATUS HERE
  // ======================================================
  // Cancelling a booking only affects the reservation.
  //
  // The room's operational status is managed independently
  // by operational workflows such as:
  // • Check-in
  // • Check-out
  // • Maintenance
  //
  // Availability is determined by booking dates, not by
  // Room.status.
  // ======================================================
}

// ==========================================
// STAFF CANCEL BOOKING
// ==========================================
async cancelBookingAsStaff(
  bookingId: string,
) {

  // ==========================================
  // FIND BOOKING
  // ==========================================
  const booking =
    await this.findBooking(
      bookingId,
    );

  // ==========================================
  // VALIDATE STATUS
  // ==========================================
  this.validateBookingCanBeCancelled(
    booking.status,
  );

  // ==========================================
  // CANCEL BOOKING BY GUEST
  // ==========================================
  await this.cancelBookingRecord(
  booking,
  );

  return booking;
}

// ==========================================
// GUEST CANCEL BOOKING
// ==========================================
async cancelBooking(
  user: AuthenticatedUser,
  bookingId: string,
) {

  // ==========================================
  // FIND BOOKING
  // ==========================================
  const booking =
    await this.findBooking(
      bookingId,
    );

  // ==========================================
  // VERIFY OWNER
  // ==========================================
  if (booking.userId !== user.id) {
    throw new ForbiddenException(
      'You can only cancel your own booking.',
    );
  }

  // ==========================================
  // VALIDATE STATUS
  // ==========================================
  this.validateBookingCanBeCancelled(
    booking.status,
  );

  // ==========================================
  // CANCEL BOOKING
  // ==========================================
  await this.cancelBookingRecord(
    booking,
  );

  // ==========================================
  // CREATE BOOKING CANCELLATION NOTIFICATIONS
  // ==========================================
  try {
    // Staff notification
    const staffNotification =
      await this.notificationService.createNotification(
        'Booking Cancelled',
        `Booking ${booking.bookingId} has been cancelled by the guest.`,
        booking.id,
      );

    await this.notificationService.notifyReceptionists(
      staffNotification.id,
    );

    await this.notificationService.notifyAdmins(
      staffNotification.id,
    );

    // Guest notification
    const guestNotification =
      await this.notificationService.createNotification(
        'Booking Cancelled',
        `Your booking (${booking.bookingId}) has been cancelled successfully.\n\nWe hope to welcome you to Kiviz Executive Lodge again.`,
        booking.id,
      );

    await this.notificationService.notifyGuest(
      guestNotification.id,
      booking.userId,
    );
  } catch (error) {
    this.logger.error(
      'Failed to create booking cancellation notification.',
      error instanceof Error
        ? error.stack
        : String(error),
    );
  }

  return {
    message:
      'Booking cancelled successfully.',
  };
}

// ==========================================
// RECEPTIONIST CANCEL BOOKING
// ==========================================
async cancelBookingByReceptionist(
  receptionistId: string,
  bookingId: string,
  reason?: string,
) {

  // ==========================================
  // CANCEL BOOKING
  // ==========================================
  const booking =
    await this.cancelBookingAsStaff(
      bookingId,
    );

  // ==========================================
  // SECURITY AUDIT
  // ==========================================
  await this.securityAuditService.log({
    employeeUserId: receptionistId,
    bookingId: booking.id,
    action: SecurityAction.BOOKING_CANCELLED,
    details:
      reason ??
      `Booking ${booking.bookingId} was cancelled by the receptionist.`,
  });

  // ==========================================
  // CREATE BOOKING CANCELLATION NOTIFICATIONS
  // ==========================================
  try {
    // Staff notification
    const staffNotification =
      await this.notificationService.createNotification(
        'Booking Cancelled',
        `${booking.user.name} booking for Room ${booking.room.roomNo} was cancelled by the receptionist.`,
        booking.id,
      );

    await this.notificationService.notifyReceptionists(
      staffNotification.id,
    );

    await this.notificationService.notifyAdmins(
      staffNotification.id,
    );

    // Guest notification
    const guestNotification =
      await this.notificationService.createNotification(
        'Booking Cancelled',
        `Your booking (${booking.bookingId}) has been cancelled by the receptionist.${
          reason
            ? `\n\nReason: ${reason}`
            : ''
        }\n\nIf you have any questions, please contact Kiviz Executive Lodge.`,
        booking.id,
      );

    await this.notificationService.notifyGuest(
      guestNotification.id,
      booking.userId,
    );
  } catch (error) {
    this.logger.error(
      'Failed to create booking cancellation notification.',
      error instanceof Error
        ? error.stack
        : String(error),
    );
  }

  return {
    message:
      'Booking cancelled successfully.',
  };

}

// ==========================================
// GET GUEST BOOKINGS
// ==========================================
async getGuestBookings(
  user: AuthenticatedUser,
) {
  const bookings =
    await this.prisma.booking.findMany({
      where: {
        userId: user.id,
        status: {
          in: [
            BookingStatus.PENDING,
            BookingStatus.PAID,
            BookingStatus.CHECKED_IN,
          ],
        },
      },
      include: {
        room: {
          select: {
            roomNo: true,
            type: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

  return {
    message:
      'Bookings retrieved successfully.',
    bookings: bookings.map(
      (booking) => ({
        bookingId: booking.bookingId,

        roomNumber:
          booking.room.roomNo,

        roomType: formatRoomType(
          booking.room.type,
        ),

        checkInDate:
          booking.checkIn,

        checkOutDate:
          booking.checkOut,

        price:
          calculateBookingAmount(
            booking.room.price,
            booking.checkIn,
            booking.checkOut,
          ),

        status:
          formatBookingStatus(
            booking.status,
          ),
      }),
    ),
  };
}

// ==========================================
// GET GUEST BOOKING HISTORY
// ==========================================
async getGuestBookingHistory(
  user: AuthenticatedUser,
) {
  const bookings =
    await this.prisma.booking.findMany({
      where: {
        userId: user.id,
        status: {
          in: [
            BookingStatus.CHECKED_OUT,
            BookingStatus.CANCELLED,
          ],
        },
      },
      include: {
        room: {
          select: {
            roomNo: true,
            type: true,
            price: true,
          },
        },
      },
      orderBy: {
        checkOut: 'desc',
      },
    });

  return {
    message:
      'Booking history retrieved successfully.',
    bookings: bookings.map(
      (booking) => ({
        bookingId: booking.bookingId,

        roomNumber:
          booking.room.roomNo,

        roomType: formatRoomType(
          booking.room.type,
        ),

        checkInDate:
          booking.checkIn,

        checkOutDate:
          booking.checkOut,

        price:
          calculateBookingAmount(
            booking.room.price,
            booking.checkIn,
            booking.checkOut,
          ),

        status:
          formatBookingStatus(
            booking.status,
          ),
      }),
    ),
  };
}
}