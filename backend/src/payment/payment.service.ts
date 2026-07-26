import { BadRequestException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import {
  BookingStatus,
  PaymentMethod,
  PaymentProvider,
  PaymentPurpose,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import { generatePaymentReference } from './utils/payment-reference.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaystackService } from './paystack/paystack.service';
import {
  calculateBookingAmount,
} from '../booking/helpers/booking-pricing.helper';
import { NotificationService } from '../notifications/notification.service';
import { formatPaymentStatus } from '../common/utils/payment-status.util';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { BookingHousekeepingService } from '../booking/booking-housekeeping.service';


@Injectable()
export class PaymentService {
    private readonly logger = new Logger(
    PaymentService.name,
    );
  constructor(
    private readonly prisma: PrismaService,
    private readonly paystackService: PaystackService,
    private readonly notificationService: NotificationService,
    private readonly bookingHousekeepingService: BookingHousekeepingService,
  ) {}

  // ==========================================
  // CREATE PAYMENT
  // ==========================================
  async createPayment(
    user: AuthenticatedUser,
    createPaymentDto: CreatePaymentDto,
  ) {

    // ==========================================
    // RELEASE EXPIRED BOOKINGS
    // ==========================================
    await this.bookingHousekeepingService.cleanupExpiredBookings();

      // ==========================================
      // FIND BOOKING
      // ==========================================
      const booking =
      await this.prisma.booking.findFirst({
          where: {
          bookingId:
              createPaymentDto.bookingId,
          userId: user.id,
          },
          include: {
          room: true,
          user: true,
          },
      });

      if (!booking) {
      throw new NotFoundException(
          'Booking not found or you are not authorized to access it.',
      );
      }

    // ==========================================
    // VALIDATE BOOKING STATUS
    // ==========================================
    if (
      booking.status !== BookingStatus.PENDING
    ) {
      throw new BadRequestException(
        'Only pending bookings can be paid for.',
      );
    }

    // ==========================================
    // VALIDATE USER PROFILE
    // ==========================================
    if (
      !booking.user.name ||
      !booking.user.email
    ) {
      throw new BadRequestException(
        'Please complete your profile before making payment.',
      );
    }

    // ==========================================
    // CALCULATE PAYMENT AMOUNT
    // ==========================================
    const pricing =
      calculateBookingAmount(
        booking.room.price,
        booking.checkIn,
        booking.checkOut,
      );

    // ==========================================
    // GENERATE PAYMENT REFERENCE
    // ==========================================
    const paymentReference =
      generatePaymentReference();

    // ==========================================
    // INITIALIZE PAYSTACK PAYMENT
    // ==========================================
    const paystackResponse =
      await this.paystackService.initializePayment(
        booking.user.email,
        pricing.totalAmount,
        paymentReference,
        booking.id,
      );

    return {
      message:
        'Payment initialized successfully.',
      bookingReference:
        booking.bookingId,
      paymentReference,
      amount: pricing.totalAmount,
      paystack:
        paystackResponse.data,
    };
  }

  // ==========================================
  // VERIFY PAYMENT
  // ==========================================
  async verifyPayment(
    reference: string,
  ) {
    // ==========================================
    // VERIFY WITH PAYSTACK
    // ==========================================
    const paystackResponse =
      await this.paystackService.verifyPayment(
        reference,
      );

    // ==========================================
    // EXTRACT PAYMENT DATA
    // ==========================================
    const paymentData =
      paystackResponse.data;

    // ==========================================
    // PROCESS VERIFIED PAYMENT
    // ==========================================
    return this.processVerifiedPayment(
      reference,
      paymentData,
    );
  }

  // ==========================================
  // HANDLE PAYSTACK WEBHOOK
  // ==========================================
  async handleWebhook(
    rawBody: Buffer,
    signature: string,
    payload: any,
  ) {
    console.log('🔥 PAYSTACK WEBHOOK RECEIVED');
    const isValidSignature =
      this.paystackService.verifyWebhookSignature(
        rawBody,
        signature,
      );

    if (!isValidSignature) {
      throw new BadRequestException(
        'Invalid webhook signature.',
      );
    }

    if (payload.event !== 'charge.success') {
      return {
        received: true,
      };
    }

    await this.verifyPayment(
      payload.data.reference,
    );

    return {
      received: true,
    };
  }

  // ==========================================
  // PROCESS VERIFIED PAYMENT
  // ==========================================
  private async processVerifiedPayment(
    reference: string,
    paymentData: any,
  ) {
    // ==========================================
    // VALIDATE PAYMENT STATUS
    // ==========================================
    if (paymentData.status !== 'success') {
      throw new BadRequestException(
        'Payment was not successful.',
      );
    }

    // ==========================================
    // VALIDATE PAYMENT METADATA
    // ==========================================
    if (!paymentData.metadata?.bookingId) {
      throw new BadRequestException(
        'Invalid payment metadata.',
      );
    }

    // ==========================================
    // VALIDATE PAYMENT REFERENCE
    // ==========================================
    if (paymentData.reference !== reference) {
      throw new BadRequestException(
        'Payment reference mismatch.',
      );
    }

    const bookingId =
      paymentData.metadata.bookingId;

    // ==========================================
    // FIND BOOKING
    // ==========================================
    const booking =
      await this.prisma.booking.findUnique({
        where: {
          id: bookingId,
        },
        include: {
          room: true,
        },
      });

    if (!booking) {
      throw new NotFoundException(
        'Booking not found.',
      );
    }

    // ==========================================
    // VALIDATE BOOKING STATUS
    // ==========================================
    if (
      booking.status !==
      BookingStatus.PENDING
    ) {
      throw new BadRequestException(
        'This booking cannot be verified.',
      );
    }

    // ==========================================
    // VALIDATE PAYMENT AMOUNT
    // ==========================================
    const pricing =
      calculateBookingAmount(
        booking.room.price,
        booking.checkIn,
        booking.checkOut,
      );

    if (
      paymentData.amount / 100 !==
      pricing.totalAmount
    ) {
      throw new BadRequestException(
        'Payment amount mismatch.',
      );
    }

  // ==========================================
  // CREATE PAYMENT, UPDATE BOOKING & ROOM
  // ==========================================
  let payment;

  try {
    const [, createdPayment] =
    await this.prisma.$transaction([
      this.prisma.booking.update({
        where: {
          id: booking.id,
        },
        data: {
          status: BookingStatus.PAID,
        },
      }),

      this.prisma.payment.create({
        data: {
          reference,
          bookingId: booking.id,
          amount: paymentData.amount / 100,
          provider: PaymentProvider.PAYSTACK,
          method: PaymentMethod.ONLINE,
          status: PaymentStatus.SUCCESS,
          purpose: PaymentPurpose.INITIAL_BOOKING,
          paidAt: new Date(paymentData.paid_at),
        },
      }),
    ]);

    payment = createdPayment;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const existingPayment =
        await this.prisma.payment.findUnique({
          where: {
            reference,
          },
        });

      return {
        message:
          'Payment has already been verified.',
        bookingReference:
          booking.bookingId,
        paymentReference:
          existingPayment?.reference,
        paymentStatus:
          'Successful',
      };
    }

    throw error;
  }

  // ==========================================
  // CREATE PAYMENT NOTIFICATIONS
  // ==========================================
  try {
    // Receptionist & Admin notification
    const staffNotification =
      await this.notificationService.createNotification(
        'Payment Received',
        `Payment for booking ${booking.bookingId} was successfully verified.`,
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
        'Payment Successful',
        `Your payment has been received successfully.\n\nYour booking (${booking.bookingId}) has been secured.\n\nWe look forward to welcoming you to Kiviz Executive Lodge.`,
        booking.id,
      );

    await this.notificationService.notifyGuest(
      guestNotification.id,
      booking.userId,
    );
  } catch (error) {
    this.logger.error(
      'Failed to create payment notification.',
      error instanceof Error
        ? error.stack
        : String(error),
    );
  }

    return {
      message:
        'Payment verified successfully.',
      bookingReference:
        booking.bookingId,
      paymentReference:
        payment.reference,
      paymentStatus:
        'Successful',
    };
  }


    // ==========================================
  // GET PAYMENT VERIFICATION STATUS
  // ==========================================
  async getPaymentVerificationStatus(
    reference: string,
  ) {
    // ==========================================
    // CHECK IF PAYMENT HAS ALREADY BEEN PROCESSED
    // ==========================================
    const payment =
      await this.prisma.payment.findUnique({
        where: {
          reference,
        },
        include: {
          booking: true,
        },
      });

    // ==========================================
    // PAYMENT ALREADY VERIFIED
    // ==========================================
    if (payment) {
      return {
        message:
          'Payment verified successfully.',
        bookingReference:
          payment.booking.bookingId,
        paymentReference:
          payment.reference,
        paymentStatus:
          'Successful',
      };
    }

    // ==========================================
    // FALLBACK TO PAYSTACK VERIFICATION
    // ==========================================
    try {
      return await this.verifyPayment(
        reference,
      );
    } catch {
      return {
        paymentStatus:
          'Pending',
      };
    }
  }

    // ==========================================
    // RECORD CASH PAYMENT
    // ==========================================
    async recordCashPayment(
    bookingId: string,
    amount: number,
    ) {
    // ==========================================
    // FIND BOOKING
    // ==========================================
    const booking =
        await this.prisma.booking.findUnique({
        where: {
            id: bookingId,
        },
        });

    if (!booking) {
        throw new NotFoundException(
        'Booking not found.',
        );
    }

    // ==========================================
    // RECORD PAYMENT, UPDATE BOOKING & RESERVE ROOM
    // ==========================================
    const [payment] =
      await this.prisma.$transaction([
        this.prisma.payment.create({
          data: {
            reference: generatePaymentReference(),
            provider: PaymentProvider.MANUAL,
            method: PaymentMethod.CASH,
            amount,
            status: PaymentStatus.SUCCESS,
            purpose: PaymentPurpose.INITIAL_BOOKING,
            currency: 'GHS',
            paidAt: new Date(),
            bookingId,
          },
        }),

        this.prisma.booking.update({
          where: {
            id: bookingId,
          },
          data: {
            status: BookingStatus.PAID,
          },
        }),
      ]);

    return payment;
    }

    // ==========================================
    // RECORD BOOKING EXTENSION PAYMENT
    // ==========================================
    async recordExtensionPayment(
    bookingId: string,
    amount: number,
    ) {
    const payment =
        await this.prisma.payment.create({
        data: {
            reference:
            generatePaymentReference(),
            provider:
            PaymentProvider.MANUAL,
            method:
            PaymentMethod.CASH,
            amount,
            status:
            PaymentStatus.SUCCESS,
            purpose:
            PaymentPurpose.BOOKING_EXTENSION,
            currency: 'GHS',
            paidAt: new Date(),
            bookingId,
        },
        });

    return payment;
    }

    // ==========================================
// GET PAYMENT HISTORY FOR GUEST
// ==========================================
async getPaymentHistory(
  user: AuthenticatedUser,
) {
  const payments =
    await this.prisma.payment.findMany({
      where: {
        booking: {
          userId: user.id,
        },
      },
      select: {
        reference: true,
        provider: true,
        amount: true,
        status: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

  return {
    message:
      'Payment history retrieved successfully.',
    payments: payments.map(
      (payment) => ({
        paymentId: payment.reference,

        paymentMethod:
          payment.provider,

        purpose:
          'Room Booking',

        paymentStatus:
          formatPaymentStatus(
            payment.status,
          ),

        amount:
          payment.amount,
      }),
    ),
  };
}
}