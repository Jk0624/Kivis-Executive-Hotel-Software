import { BadRequestException, Logger, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWalkInBookingDto } from './dto/create-walkin-booking.dto';
import { BookingService } from '../booking/booking.service';
import {
  validateBookingDates,
  validateRoomStatus,
} from '../booking/helpers/booking-validation.helper';
import { validateRoomAvailability } from '../common/utils/booking/validate-room-availability';
import { Prisma } from '@prisma/client';
import { PaymentService } from '../payment/payment.service';
import { validatePaymentAmount } from '../payment/helpers/payment-validation.helper';
import { CheckInDto } from './dto/check-in.dto';
import { BookingStatus, RoomStatus, SecurityAction } from '@prisma/client';
import { generateAccessPin } from './utils/access-pin.util';
import { SmsService } from '../sms/sms.service';
import { ResendAccessPinDto } from './dto/resend-access-pin.dto';
import {
  calculateBookingAmount,
} from '../booking/helpers/booking-pricing.helper';
import { PreviewBookingExtensionDto } from './dto/preview-booking-extension.dto';
import { ConfirmBookingExtensionDto } from './dto/confirm-booking-extension.dto';
import { RevealAccessPinDto } from './dto/reveal-access-pin.dto';
import { SecurityAuditService } from '../security-audit/security-audit.service';
import { RoomService } from '../room/room.service';
import { FilterGuestsDto } from './dto/filter-guests.dto';
import { NotificationService } from '../notifications/notification.service';
import { BookingHousekeepingService } from '../booking/booking-housekeeping.service';
import { applyHotelBookingTimes } from '../common/utils/booking/apply-hotel-booking-dates';


@Injectable()
export class ReceptionService {
    private readonly logger =
    new Logger(ReceptionService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly bookingService: BookingService,
        private readonly paymentService: PaymentService,
        private readonly smsService: SmsService,
        private readonly securityAuditService: SecurityAuditService,
        private readonly roomService: RoomService,
        private readonly notificationService: NotificationService,
        private readonly bookingHousekeepingService: BookingHousekeepingService,
    ) {}

    // ==========================================
    // FIND OR CREATE GUEST
    // ==========================================
    private async findOrCreateGuest(
    createWalkInBookingDto: CreateWalkInBookingDto,
    ) {

    // ==========================================
    // FIND GUEST
    // ==========================================
    const existingGuest =
        await this.prisma.user.findUnique({
        where: {
            phone: createWalkInBookingDto.phone,
        },
        });

    if (existingGuest) {
        return existingGuest;
    }

    // ==========================================
    // CREATE GUEST
    // ==========================================
    const guest =
    await this.prisma.user.create({
        data: {
        phone: createWalkInBookingDto.phone,
        name: createWalkInBookingDto.name,
        email: createWalkInBookingDto.email,
        },
    });

    return guest;
    }

    // ==========================================
    // FIND ROOM BY NUMBER
    // ==========================================
    private async findRoomByNumber(
    roomNo: string,
    ) {
    const room =
        await this.prisma.room.findUnique({
        where: {
            roomNo,
        },
        });

    if (!room) {
        throw new NotFoundException(
        'Room not found.',
        );
    }

    return room;
    }

    // ==========================================
    // FIND BOOKING BY REFERENCE
    // ==========================================
    private async findBookingByReference(
    bookingReference: string,
    ) {
    const booking =
        await this.prisma.booking.findUnique({
        where: {
            bookingId: bookingReference,
        },
        include: {
            room: true,
            user: true,
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
    // VALIDATE CHECK-IN DATE
    // ==========================================
    private validateCheckInDate(
    booking: {
        checkIn: Date;
        checkOut: Date;
    },
    ) {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const checkIn = new Date(booking.checkIn);
    checkIn.setHours(0, 0, 0, 0);

    const checkOut = new Date(booking.checkOut);
    checkOut.setHours(0, 0, 0, 0);

    if (today < checkIn) {
        throw new BadRequestException(
        'Guest cannot check in before the check-in date.',
        );
    }

    if (today >= checkOut) {
        throw new BadRequestException(
        'This booking has already expired.',
        );
    }
    }

// ==========================================
// DASHBOARD HEADER
// ==========================================
async getDashboardHeader(
  receptionistId: string,
) {

  // ==========================================
  // FIND RECEPTIONIST
  // ==========================================
  const receptionist =
    await this.prisma.user.findUnique({
        where: {
        id: receptionistId,
        },
        select: {
        name: true,
        role: true,
        },
    });

    return {
    message:
        'Dashboard header retrieved successfully.',

    user: receptionist,
    };
}

// ==========================================
// DASHBOARD STATISTICS
// ==========================================
async getDashboardStatistics() {

  // ==========================================
  // TODAY
  // ==========================================
  const today = new Date();

  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  // ==========================================
  // DASHBOARD STATISTICS
  // ==========================================
  const [
    totalRooms,
    totalBookings,
    checkedInToday,
    checkedOutToday,
    availableRooms,
  ] = await Promise.all([

    this.prisma.room.count(),

    this.prisma.booking.count(),

    this.prisma.booking.count({
    where: {
        checkedInAt: {
        gte: startOfDay,
        lte: endOfDay,
        },
      },
    }),

    this.prisma.booking.count({
    where: {
        checkedOutAt: {
        gte: startOfDay,
        lte: endOfDay,
        },
      },
    }),

    this.prisma.room.count({
      where: {
        status: RoomStatus.AVAILABLE,
      },
    }),

  ]);

  return {
    message:
      'Dashboard statistics retrieved successfully.',

    statistics: {
      totalRooms,
      totalBookings,
      checkedInToday,
      checkedOutToday,
      availableRooms,
    },
  };
}

// ==========================================
// DASHBOARD PENDING CHECK-INS
// ==========================================
async getDashboardPendingCheckIns() {

  // ==========================================
  // TODAY
  // ==========================================
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // ==========================================
  // GET PENDING CHECK-INS
  // ==========================================
  const bookings =
    await this.prisma.booking.findMany({
      where: {
        status: BookingStatus.PAID,

        checkIn: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },

      orderBy: {
        checkIn: 'asc',
      },

      select: {
        id: true,

        bookingId: true,

        status: true,

        user: {
          select: {
            name: true,
          },
        },

        room: {
          select: {
            roomNo: true,
          },
        },
      },
    });

  // ==========================================
  // RETURN RESPONSE
  // ==========================================
  return {
    message:
      'Pending check-ins retrieved successfully.',

    pendingCheckIns:
      bookings.map((booking) => ({
        bookingId: booking.id,

        bookingReference:
          booking.bookingId,

        guestName:
          booking.user.name,

        roomNumber:
          booking.room.roomNo,

        status:
          booking.status,
      })),
  };
}

// ==========================================
// GET ALL BOOKINGS
// ==========================================
async getAllBookings() {
  return this.bookingService.getAllBookings();
}

// ==========================================
// GET BOOKING
// ==========================================
async getBooking(
  bookingReference: string,
) {
  return this.bookingService.getBookingForReception(
    bookingReference,
  );
}

// ==========================================
// SEARCH BOOKINGS
// ==========================================
async searchBookings(
  search: string,
) {
  return this.bookingService.searchBookings(
    search,
  );
}

    // ==========================================
    // CREATE WALK-IN BOOKING
    // ==========================================
    async createWalkInBooking(
    createWalkInBookingDto: CreateWalkInBookingDto,
    ) {


    // ==========================================
    // FIND OR CREATE GUEST
    // ==========================================
    const guest =
        await this.findOrCreateGuest(
        createWalkInBookingDto,
        );
    
    // ==========================================
    // RELEASE EXPIRED BOOKINGS
    // ==========================================
    await this.bookingHousekeepingService.cleanupExpiredBookings();

    // ==========================================
    // FIND ROOM
    // ==========================================
    const room =
    await this.findRoomByNumber(
        createWalkInBookingDto.roomNo,
    );

    // ==========================================
    // VALIDATE BOOKING
    // ==========================================
    const rawCheckIn = new Date(
    createWalkInBookingDto.checkInDate,
    );

    const rawCheckOut = new Date(
    createWalkInBookingDto.checkOutDate,
    );

    const {
    checkIn,
    checkOut,
    } = applyHotelBookingTimes(
    rawCheckIn,
    rawCheckOut,
    );

    validateBookingDates(
    checkIn,
    checkOut,
    );

    validateRoomStatus(room);

    await validateRoomAvailability({
        prisma: this.prisma,
        roomId: room.id,
        checkIn,
        checkOut,
    });

    
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
    // VALIDATE PAYMENT AMOUNT
    // ==========================================
    validatePaymentAmount(
    pricing.totalAmount,
    createWalkInBookingDto.amount,
    );

    // ==========================================
    // CREATE BOOKING
    // ==========================================
    const booking =
    await this.bookingService.createWalkInBooking(
        guest.id,
        room.id,
        checkIn,
        checkOut,
    );

    const payment =
    await this.paymentService.recordCashPayment(
        booking.id,
        createWalkInBookingDto.amount,
    );

    // ==========================================
    // I WILL UPDATE ROOM STATUS HERE ANYMORE V2
    // ==========================================
    // Walk-in bookings no longer change the room's
    // operational status.
    //
    // The room remains AVAILABLE until the guest
    // physically checks in.
    //
    // Availability is determined by booking dates,
    // not by Room.status.

    // ==========================================
    // FETCH UPDATED BOOKING
    // ==========================================
    const updatedBooking =
    await this.prisma.booking.findUnique({
        where: {
        id: booking.id,
        },
    });

    // ==========================================
    // CREATE RECEPTIONIST NOTIFICATION
    // ==========================================
    try {
        const notification =
            await this.notificationService.createNotification(
                'Walk-in Booking Created',
                `${guest.name} booked Room ${room.roomNo}. Booking Reference: ${updatedBooking!.bookingId}.`,
            );

        await this.notificationService.notifyReceptionists(
            notification.id,
        );

        await this.notificationService.notifyAdmins(
            notification.id,
        );
    } catch (error) {
        this.logger.error(
            'Failed to create walk-in booking notification.',
            error instanceof Error
                ? error.stack
                : String(error),
        );
    }

    // ==========================
    // RETURN
    // ==========================
    return {
    message: 'Walk-in booking created successfully.',

    booking: {
        bookingReference:
        updatedBooking!.bookingId,

        status:
        updatedBooking!.status,
    },

    payment: {
        amount:
        payment.amount,

        method:
        payment.method,

        status:
        payment.status,
    },
    };
    } //WALK- IN BOOKING ENDS HER ============

    // ==========================================
    // FIND CHECK-IN BOOKING BY PHONE
    // ==========================================
    async findCheckInBookingByPhone(
    phone: string,
    ) {
    return this.bookingService.findCheckInBookingByPhone(
        phone,
    );
    }

    // ==========================================
    // CHECK IN GUEST
    // ==========================================
    async checkIn(
    checkInDto: CheckInDto,
    ) {
        const booking =
    await this.findBookingByReference(
        checkInDto.bookingReference,
    );

    // ==========================================
    // VALIDATE BOOKING STATUS
    // ==========================================
    switch (booking.status) {
    case BookingStatus.PAID:
        break;

    case BookingStatus.CHECKED_IN:
        throw new BadRequestException(
        'Guest is already checked in.',
        );

    default:
        throw new BadRequestException(
        'Only paid bookings can be checked in.',
        );
    }

    // ==========================================
    // VALIDATE CHECK-IN DATE
    // ==========================================
    this.validateCheckInDate(
    booking,
    );

    // ==========================================
    // GENERATE ACCESS PIN
    // ==========================================
    const accessPin =
    generateAccessPin();

    // =============================================================
    // UPDATE BOOKING, UPDATE ROOM AND SAVE ACCESS PIN TO DATABASE
    // ==============================================================
    await this.prisma.$transaction([
        this.prisma.booking.update({
            where: {
                id: booking.id,
            },
            data: {
                status: BookingStatus.CHECKED_IN,
                checkedInAt: new Date(),
                accessPin,
            },
        }),

        this.prisma.room.update({
            where: {
                id: booking.room.id,
            },
            data: {
                status: RoomStatus.OCCUPIED,
            },
        }),
    ]);

    // ==========================================
    // FETCH UPDATED BOOKING
    // ==========================================
    const updatedBooking =
    await this.findBookingByReference(
        booking.bookingId,
    );

    // ==========================================
    // VALIDATE GUEST PROFILE
    // ==========================================
    if (!updatedBooking.user.name) {
    throw new BadRequestException(
        'Guest profile is incomplete.',
    );
    }

    // ==========================================
    // SEND ACCESS PIN
    // ==========================================
    let smsSent = true;

    try {
    await this.smsService.sendAccessPin({
        recipient: updatedBooking.user.phone,
        guestName: updatedBooking.user.name!,
        bookingReference: updatedBooking.bookingId!,
        roomNumber: updatedBooking.room.roomNo,
        accessPin: updatedBooking.accessPin!,
    });
    } catch (error) {
    smsSent = false;

    this.logger.error(
        'Failed to send access PIN SMS.',
        error instanceof Error
        ? error.stack
        : String(error),
    );
    }

    // ==========================================
    // CREATE CHECK-IN NOTIFICATIONS
    // ==========================================
    try {
        // Staff notification
        const staffNotification =
            await this.notificationService.createNotification(
                'Guest Checked In',
                `${updatedBooking.user.name} checked into Room ${updatedBooking.room.roomNo}.`,
                updatedBooking.id,
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
                'Room Access PIN',
                `Welcome to Kiviz Executive Lodge!\n\nYour room access PIN is:\n\n${updatedBooking.accessPin}\n\nKeep this PIN confidential.\nThis PIN will remain valid until your checkout.`,
                updatedBooking.id,
            );

        await this.notificationService.notifyGuest(
            guestNotification.id,
            updatedBooking.userId,
        );
    } catch (error) {
        this.logger.error(
            'Failed to create check-in notification.',
            error instanceof Error
                ? error.stack
                : String(error),
        );
    }

    // ==========================================
    // RETURN RESPONSE
    // ==========================================
    return {
    message: smsSent
        ? 'Guest checked in successfully.'
        : 'Guest checked in successfully, but the access PIN SMS could not be sent. Please resend it from the receptionist dashboard.',
    };

    } // CHECK-IN ENDS HERE =============


    // ==========================================
    // FIND CHECK-OUT BOOKING BY PHONE
    // ==========================================
    async findCheckOutBookingByPhone(
    phone: string,
    ) {
    return this.bookingService.findCheckOutBookingByPhone(
        phone,
    );
    }

    // ==========================================
    // CHECK OUT GUEST
    // ==========================================
    async checkOut(
    bookingId: string,
    ) {
    // ==========================================
    // FIND BOOKING
    // ==========================================
    const booking =
        await this.prisma.booking.findUnique({
        where: {
            bookingId,
        },
        include: {
            room: true,
            user: true,
        },
        });

    if (!booking) {
        throw new NotFoundException(
        'Booking not found.',
        );
    }

    if (
        booking.status !== BookingStatus.CHECKED_IN
    ) {
        throw new BadRequestException(
        'Guest is not checked in.',
        );
    }

    // ==========================================
    // UPDATE BOOKING & ROOM
    // ==========================================
    await this.prisma.$transaction([
       this.prisma.booking.update({
        where: {
            id: booking.id,
        },
        data: {
            status: BookingStatus.CHECKED_OUT,
            checkedOutAt: new Date(),
            accessPin: null,
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

    // ==========================================
    // HIDE ACCESS PIN NOTIFICATION
    // ==========================================
    try {
        await this.notificationService.hideAccessPinNotification(
            booking.id,
        );
    } catch (error) {
        this.logger.error(
            'Failed to hide access PIN notification.',
            error instanceof Error
                ? error.stack
                : String(error),
        );
    }

    // ==========================================
    // CREATE CHECK-OUT NOTIFICATIONS
    // ==========================================
    try {
        // Staff notification
        const staffNotification =
            await this.notificationService.createNotification(
                'Guest Checked Out',
                `${booking.user.name} checked out of Room ${booking.room.roomNo}.`,
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
                'Check-Out Complete',
                `You have successfully checked out of Room ${booking.room.roomNo}.\n\nThank you for staying at Kiviz Executive Lodge. We hope to welcome you again soon!`,
                booking.id,
            );

        await this.notificationService.notifyGuest(
            guestNotification.id,
            booking.userId,
        );
    } catch (error) {
        this.logger.error(
            'Failed to create check-out notification.',
            error instanceof Error
                ? error.stack
                : String(error),
        );
    }

    // ==========================================
    // RETURN RESPONSE
    // ==========================================
    return {
        message:
        'Guest checked out successfully.',
    };
    }  // CHECK OUT GUEST ENDS HERE

    // ==========================================
    // FIND BOOKING FOR EXTENSION BY PHONE
    // ==========================================
    async findBookingForExtensionByPhone(
    phone: string,
    ) {
    return this.bookingService.findCheckOutBookingByPhone(
        phone,
    );
    }

    // ==========================================
    // PREVIEW BOOKING EXTENSION
    // ==========================================
    async previewBookingExtension(
    previewBookingExtensionDto: PreviewBookingExtensionDto,
    ) {
    // ==========================================
    // FIND BOOKING
    // ==========================================
    const booking =
        await this.findBookingByReference(
        previewBookingExtensionDto.bookingReference,
        );

    // ==========================================
    // VALIDATE BOOKING STATUS
    // ==========================================
    switch (booking.status) {
        case BookingStatus.CHECKED_IN:
        break;

        case BookingStatus.CHECKED_OUT:
        throw new BadRequestException(
            'Checked-out bookings cannot be extended.',
        );

        case BookingStatus.CANCELLED:
        throw new BadRequestException(
            'Cancelled bookings cannot be extended.',
        );

        default:
        throw new BadRequestException(
            'Only checked-in bookings can be extended.',
        );
    }

    // ==========================================
    // VALIDATE NEW CHECK-OUT DATE
    // ==========================================
    const currentCheckOut =
    new Date(booking.checkOut);

    const newCheckOut =
    new Date(
        previewBookingExtensionDto.newCheckOutDate,
    );

    if (
    newCheckOut <= currentCheckOut
    ) {
    throw new BadRequestException(
        'New check-out date must be after the current check-out date.',
    );
    }

    // ==========================================
    // CALCULATE EXTENSION COST
    // ==========================================
    const pricing =
    calculateBookingAmount(
        booking.room.price,
        currentCheckOut,
        newCheckOut,
    );

    return {
    message:
        'Booking extension preview generated successfully.',

    preview: {
        nightlyRate: pricing.nightlyRate,

        additionalNights: pricing.nights,

        additionalAmount: pricing.totalAmount,
    },
    };
    }

    // ==========================================
    // CONFIRM BOOKING EXTENSION
    // ==========================================
    async confirmBookingExtension(
    confirmBookingExtensionDto: ConfirmBookingExtensionDto,
    ) {

    // ==========================================
    // FIND BOOKING
    // ==========================================
    const booking =
        await this.findBookingByReference(
        confirmBookingExtensionDto.bookingReference,
        );

    // ==========================================
    // VALIDATE BOOKING STATUS
    // ==========================================
    switch (booking.status) {

        case BookingStatus.CHECKED_IN:
        break;

        case BookingStatus.CHECKED_OUT:
        throw new BadRequestException(
            'Checked-out bookings cannot be extended.',
        );

        case BookingStatus.CANCELLED:
        throw new BadRequestException(
            'Cancelled bookings cannot be extended.',
        );

        default:
        throw new BadRequestException(
            'Only checked-in bookings can be extended.',
        );
    }

    // ==========================================
    // VALIDATE NEW CHECK-OUT DATE
    // ==========================================
    const currentCheckOut =
        new Date(booking.checkOut);

    const newCheckOut =
        new Date(
        confirmBookingExtensionDto.newCheckOutDate,
        );

    if (newCheckOut <= currentCheckOut) {
        throw new BadRequestException(
        'New check-out date must be after the current check-out date.',
        );
    }

    // ==========================================
    // VALIDATE ROOM AVAILABILITY
    // ==========================================
    await validateRoomAvailability({
        prisma: this.prisma,
        roomId: booking.roomId,
        checkIn: booking.checkIn,
        checkOut: newCheckOut,
        excludeBookingId: booking.id,
    });

    // ==========================================
    // CALCULATE EXTENSION COST
    // ==========================================
    const pricing =
        calculateBookingAmount(
        booking.room.price,
        currentCheckOut,
        newCheckOut,
        );

    // ==========================================
    // VALIDATE PAYMENT AMOUNT
    // ==========================================
    validatePaymentAmount(
        pricing.totalAmount,
        confirmBookingExtensionDto.amount,
    );

    // ==========================================
    // RECORD EXTENSION PAYMENT
    // ==========================================
    await this.paymentService.recordExtensionPayment(
        booking.id,
        pricing.totalAmount,
    );

    // ==========================================
    // UPDATE BOOKING
    // ==========================================
    const updatedBooking =
        await this.prisma.booking.update({
        where: {
            id: booking.id,
        },
        data: {
            checkOut: newCheckOut,
        },
        include: {
            room: true,
            user: true,
        },
        });

    // ==========================================
    // CREATE BOOKING EXTENSION NOTIFICATIONS
    // ==========================================
    try {
        // Staff notification
        const staffNotification =
            await this.notificationService.createNotification(
                'Booking Extended',
                `${updatedBooking.user.name} extended their stay in Room ${updatedBooking.room.roomNo} until ${updatedBooking.checkOut.toLocaleDateString()}.`,
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
                'Booking Extension Confirmed',
                `Your stay has been successfully extended.\n\nYour new check-out date is ${updatedBooking.checkOut.toLocaleDateString()}.\n\nWe hope you continue to enjoy your stay at Kiviz Executive Lodge.`,
                booking.id,
            );

        await this.notificationService.notifyGuest(
            guestNotification.id,
            booking.userId,
        );
    } catch (error) {
        this.logger.error(
            'Failed to create booking extension notification.',
            error instanceof Error
                ? error.stack
                : String(error),
        );
    }

    // ==========================================
    // RETURN RESPONSE
    // ==========================================
    return {
    message:
        'Booking extended successfully.',
    };
    }

    // ==========================================
    // GET ALL ROOMS
    // ==========================================
    async getAllRooms() {
    return this.roomService.getAllRooms();
    }

    // ==========================================
    // GET ROOM
    // ==========================================
    async getRoom(
    roomId: string,
    ) {
    return this.roomService.getRoomForReception(
        roomId,
    );
    }

    // ==========================================
    // GET ALL GUESTS
    // here==========================================
    async getGuests(
    filterGuestsDto: FilterGuestsDto,
    ) {

    // ==========================================
    // GET BOOKINGS
    // ==========================================
    const bookings =
        await this.prisma.booking.findMany({
        where: {
            AND: [

            ...(filterGuestsDto.name
                ? [
                    {
                    user: {
                        name: {
                        contains:
                            filterGuestsDto.name,
                        mode: Prisma.QueryMode.insensitive,
                        },
                    },
                    },
                ]
                : []),

            ...(filterGuestsDto.phone
                ? [
                    {
                    user: {
                        phone: {
                        contains:
                            filterGuestsDto.phone,
                        },
                    },
                    },
                ]
                : []),

            ...(filterGuestsDto.bookingId
                ? [
                    {
                    bookingId: {
                        contains:
                        filterGuestsDto.bookingId,
                        mode: Prisma.QueryMode.insensitive,
                    },
                    },
                ]
                : []),

            ...(filterGuestsDto.date
                ? [
                    {
                    checkIn: {
                        gte: new Date(
                        filterGuestsDto.date,
                        ),
                        lt: new Date(
                        new Date(
                            filterGuestsDto.date,
                        ).getTime() +
                            24 *
                            60 *
                            60 *
                            1000,
                        ),
                    },
                    },
                ]
                : []),
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
            take: 1,
            },
        },
        });

    // ==========================================
    // CHECK RESULTS
    // ==========================================
    if (bookings.length === 0) {
    return {
        message:
        filterGuestsDto.name ||
        filterGuestsDto.phone ||
        filterGuestsDto.bookingId ||
        filterGuestsDto.date
            ? 'No guests match the selected search criteria.'
            : 'No guests found.',
        guests: [],
    };
    }

    // ==========================================
    // RETURN RESPONSE
    // ==========================================
    return {
        message:
        'Guests retrieved successfully.',

        guests: bookings.map(
        (booking) => ({
            roomNumber:
            booking.room.roomNo,

            phoneNumber:
            booking.user.phone,

            guestName:
            booking.user.name,

            bookingId:
            booking.bookingId,

            paymentStatus:
            booking.payments[0]?.status ??
            'UNPAID',

            bookingStatus:
            booking.status,

            checkedIn:
            booking.checkIn,

            checkedOut:
            booking.checkOut,

            hasAccessPin:
            !!booking.accessPin,
        }),
        ),
    };
    }


    // ==========================================
    // RESEND ACCESS PIN
    // ==========================================
    async resendAccessPin(
        employeeUserId: string,
        resendAccessPinDto: ResendAccessPinDto,
    ) {

    // ==========================================
    // FIND BOOKING
    // ==========================================
    const booking =
        await this.findBookingByReference(
        resendAccessPinDto.bookingId
        );

    // ==========================================
    // VALIDATE BOOKING STATUS
    // ==========================================
    if (
        booking.status !==
        BookingStatus.CHECKED_IN
    ) {
        throw new BadRequestException(
        'Only checked-in guests can receive an access PIN.',
        );
    }

    // ==========================================
    // VALIDATE ACCESS PIN
    // ==========================================
    if (!booking.accessPin) {
        throw new BadRequestException(
        'Access PIN has not been generated.',
        );
    }

    // ==========================================
    // VALIDATE GUEST PHONE NUMBER
    // ==========================================
    if (!booking.user.phone) {
    throw new BadRequestException(
        'Guest phone number is not available.',
    );
    }

    // ==========================================
    // CREATE SECURITY AUDIT
    // ==========================================
    await this.securityAuditService.log({
    employeeUserId,
    bookingId: booking.id,
    action: SecurityAction.PIN_RESENT,
    details: `Access PIN SMS sent for booking ${booking.bookingId} (Room ${booking.room.roomNo}).`,
    });

    // ==========================================
    // RESEND ACCESS PIN
    // ==========================================
    let smsSent = true;

    try {
        await this.smsService.sendAccessPin({
        recipient: booking.user.phone,
        guestName:
        booking.user.name ?? 'Guest',
        bookingReference: booking.bookingId!,
        roomNumber: booking.room.roomNo,
        accessPin: booking.accessPin,
        });
    } catch (error) {
        smsSent = false;
        this.logger.error(
        'Failed to send access PIN SMS.',
        error instanceof Error
            ? error.stack
            : String(error),
        );
    }

    // ==========================================
    // RETURN RESPONSE (TERNARY OPERATOR)
    // ==========================================
    return {
    message: smsSent
        ? 'Access PIN sent successfully.'
        : 'Guest is checked in, but the access PIN SMS could not be sent. Please try again.',
    };

    }


    // ==========================================
    // REVEAL ACCESS PIN
    // ==========================================
    async revealAccessPin(
    employeeUserId: string,
    revealAccessPinDto: RevealAccessPinDto,
    ) {

    // ==========================================
    // FIND BOOKING
    // ==========================================
    const booking =
    await this.findBookingByReference(
        revealAccessPinDto.bookingId,
    );

    // ==========================================
    // VALIDATE BOOKING STATUS
    // ==========================================
    if (
        booking.status !==
        BookingStatus.CHECKED_IN
    ) {
        throw new BadRequestException(
        'Only checked-in guests have an access PIN.',
        );
    }

    // ==========================================
    // VALIDATE ACCESS PIN
    // ==========================================
    if (!booking.accessPin) {
        throw new BadRequestException(
        'Access PIN has not been generated.',
        );
    }

    // ==========================================
    // CREATE SECURITY AUDIT
    // ==========================================
    await this.securityAuditService.log({
        employeeUserId,
        bookingId: booking.id,
        action: SecurityAction.PIN_REVEALED,
        details: `Guest access PIN was revealed for booking ${booking.bookingId} (Room ${booking.room.roomNo}).`,
    });

    // ==========================================
    // RETURN RESPONSE
    // ==========================================
    return {
    message: 'Access PIN revealed successfully.',
    accessPin: booking.accessPin,
    };
    }

    // ==========================================
    // CANCEL BOOKING
    // ==========================================
    async cancelBooking(
    receptionistId: string,
    bookingId: string,
    reason: string,
    ){
    return this.bookingService.cancelBookingByReceptionist(
        receptionistId,
        bookingId,
        reason,
    );
    }
}