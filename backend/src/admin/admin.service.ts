import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReceptionistDto } from './dto/create-receptionist.dto';
import { Role } from '@prisma/client';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomStatus, BookingStatus, } from '@prisma/client';
import { UpdateRoomDto } from './dto/update-room.dto';
import { MarkRoomMaintenanceDto } from './dto/mark-room-maintenance.dto';
import { UpdateReceptionistDto } from './dto/update-receptionist.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { SecurityAction } from '@prisma/client';
import { BookingService } from '../booking/booking.service';
import { SecurityAuditService } from '../security-audit/security-audit.service';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { AccessDeviceService } from '../access-device/access-device.service';
import { RegisterAccessDeviceDto } from '../access-device/dto/register-access-device.dto';
import { UpdateAccessDeviceDto } from '../access-device/dto/update-access-device.dto';
import * as fs from 'fs/promises';
import { RoomService } from '../room/room.service';
import { NotificationService } from '../notifications/notification.service';


@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  constructor(
    protected readonly prisma: PrismaService,
    private readonly bookingService: BookingService,
    private readonly securityAuditService: SecurityAuditService,
    private readonly accessDeviceService: AccessDeviceService,
    private readonly roomService: RoomService,
    private readonly notificationService: NotificationService,
  ) {}

  // ==========================================
  // DASHBOARD HEADER
  // ==========================================
  async getDashboardHeader(
    adminId: string,
  ) {
    // ==========================================
    // FIND ADMIN
    // ==========================================
    const admin =
      await this.prisma.user.findUnique({
        where: {
          id: adminId,
        },
        select: {
          name: true,
          role: true,
        },
      });

    return {
      message:
        'Dashboard header retrieved successfully.',

      user: admin,
    };
  }

// ==========================================
// DASHBOARD SUMMARY
// ==========================================
async getDashboardSummary() {

  const [
    totalRooms,
    totalBookings,
    totalGuests,
    totalReceptionists,
    totalDevices,
  ] = await Promise.all([

    this.prisma.room.count(),

    this.prisma.booking.count(),

    this.prisma.user.count({
      where: {
        role: Role.GUEST,
      },
    }),

    this.prisma.user.count({
      where: {
        role: Role.RECEPTIONIST,
      },
    }),

    this.prisma.accessDevice.count(),
  ]);

  return {
    totalRooms,
    totalBookings,
    totalGuests,
    totalReceptionists,
    totalDevices,
  };
}

// ==========================================
// RECENT ACTIVITY
// ==========================================
async getRecentActivity() {

  const bookings =
    await this.prisma.booking.findMany({
      take: 5,
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        room: true,
        user: true,
      },
    });

  return bookings.map((booking) => ({
    bookingReference: booking.bookingId,
    guestName: booking.user.name,
    roomNumber: booking.room.roomNo,
    status: booking.status,
    updatedAt: booking.updatedAt,
  }));
}

// ==========================================
// OCCUPANCY SUMMARY
// ==========================================
async getOccupancySummary() {

  const [
    available,
    occupied,
    reserved,
    maintenance,
  ] = await Promise.all([

    this.prisma.room.count({
      where: {
        status: 'AVAILABLE',
      },
    }),

    this.prisma.room.count({
      where: {
        status: 'OCCUPIED',
      },
    }),

    this.prisma.room.count({
      where: {
        status: 'RESERVED',
      },
    }),

    this.prisma.room.count({
      where: {
        status: 'MAINTENANCE',
      },
    }),
  ]);

  return {
    available,
    occupied,
    reserved,
    maintenance,
  };
}


// ==========================================
// FIND USER BY PHONE
// ==========================================
private async findUserByPhone(
  phone: string,
) {
  return this.prisma.user.findUnique({
    where: {
      phone,
    },
  });
}

// ==========================================
// UPLOAD ROOM IMAGES
// ==========================================
async uploadRoomImages(
  files: Express.Multer.File[],
) {

  const result =
    await this.roomService.uploadRoomImages(
      files.map(
        (file) => file.path,
      ),
    );

  await Promise.all(
    files.map(
      (file) => fs.unlink(file.path),
    ),
  );

  return result;
}

// ==========================================
// CREATE ROOM
// ==========================================
async createRoom(
  createRoomDto: CreateRoomDto,
) {
  return this.roomService.createRoom(
    createRoomDto,
  );
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
  return this.roomService.getRoomForAdmin(
    roomId,
  );
}

// ==========================================
// DELETE ROOM IMAGE
// ==========================================
async deleteRoomImage(
  publicId: string,
) {
  return this.roomService.deleteRoomImage(
    publicId,
  );
}

// ==========================================
// UPDATE ROOM
// ==========================================
async updateRoom(
  roomId: string,
  updateRoomDto: UpdateRoomDto,
) {
  return this.roomService.updateRoom(
    roomId,
    updateRoomDto,
  );
}

// ==========================================
// MARK ROOM UNDER MAINTENANCE
// ==========================================
async markRoomUnderMaintenance(
  roomId: string,
  markRoomMaintenanceDto: MarkRoomMaintenanceDto,
) {

  // ==========================================
  // FIND ROOM
  // ==========================================
  const room =
    await this.prisma.room.findUnique({
      where: {
        id: roomId,
      },
    });

  if (!room) {
    throw new NotFoundException(
      'Room not found.',
    );
  }

  // ==========================================
  // VALIDATE ROOM STATUS
  // ==========================================
  if (
    room.status !==
    RoomStatus.AVAILABLE
  ) {
    throw new BadRequestException(
      'Only available rooms can be placed under maintenance.',
    );
  }

  // ==========================================
  // UPDATE ROOM
  // ==========================================
  const updatedRoom =
    await this.prisma.room.update({
      where: {
        id: roomId,
      },
      data: {
        status: RoomStatus.MAINTENANCE,
      },
    });

    // ==========================================
    // CREATE NOTIFICATION
    // ==========================================
    const notification =
      await this.notificationService.createNotification(
        'Room Under Maintenance',
        `Room ${updatedRoom.roomNo} has been marked under maintenance.`,
      );

    await this.notificationService.notifyAdmins(
      notification.id,
    );

  // ==========================================
  // RETURN RESPONSE
  // ==========================================
  return {
    message:
      'Room marked under maintenance.',
    reason:
      markRoomMaintenanceDto.reason,
    room: updatedRoom,
  };
}

// ==========================================
// COMPLETE MAINTENANCE
// ==========================================
async completeMaintenance(
  roomId: string,
) {

  // ==========================================
  // FIND ROOM
  // ==========================================
  const room =
    await this.prisma.room.findUnique({
      where: {
        id: roomId,
      },
    });

  if (!room) {
    throw new NotFoundException(
      'Room not found.',
    );
  }

  // ==========================================
  // VALIDATE STATUS
  // ==========================================
  if (
    room.status !==
    RoomStatus.MAINTENANCE
  ) {
    throw new BadRequestException(
      'Room is not under maintenance.',
    );
  }

  // ==========================================
  // UPDATE ROOM
  // ==========================================
  const updatedRoom =
    await this.prisma.room.update({
      where: {
        id: roomId,
      },
      data: {
        status: RoomStatus.AVAILABLE,
      },
    });

    // ==========================================
    // CREATE NOTIFICATION
    // ==========================================
    const notification =
      await this.notificationService.createNotification(
        'Maintenance Completed',
        `Room ${updatedRoom.roomNo} is now available for booking.`,
      );

    await this.notificationService.notifyAdmins(
        notification.id,
    );

  // ==========================================
  // RETURN RESPONSE
  // ==========================================
  return {
    message:
      'Maintenance completed successfully.',
    room: updatedRoom,
  };
}

// ==========================================
// CREATE RECEPTIONIST
// ==========================================
async createReceptionist(
  createReceptionistDto: CreateReceptionistDto,
) {

  // ==========================================
  // CHECK PHONE
  // ==========================================
  const existingPhone =
    await this.findUserByPhone(
      createReceptionistDto.phone,
    );

  if (existingPhone) {
    throw new BadRequestException(
      'Phone number already exists.',
    );
  }

  // ==========================================
  // CHECK EMPLOYEE ID
  // ==========================================
  const existingEmployee =
    await this.prisma.user.findUnique({
      where: {
        employeeId:
          createReceptionistDto.employeeId,
      },
    });

  if (existingEmployee) {
    throw new BadRequestException(
      'Employee ID already exists.',
    );
  }

  // ==========================================
  // CREATE RECEPTIONIST
  // ==========================================
  const receptionist =
    await this.prisma.user.create({
      data: {
        name: createReceptionistDto.name,
        phone: createReceptionistDto.phone,
        email: createReceptionistDto.email,
        employeeId:
          createReceptionistDto.employeeId,
        role: Role.RECEPTIONIST,
        isVerified: true,
        isActive: true,
      },
    });

  // ==========================================
  // CREATE ADMIN NOTIFICATION
  // ==========================================
  try {
    const notification =
      await this.notificationService.createNotification(
        'Receptionist Created',
        `${receptionist.name} has been added as a receptionist.`,
      );

    await this.notificationService.notifyAdmins(
      notification.id,
    );
  } catch (error) {
    this.logger.error(
      'Failed to create receptionist notification.',
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
      'Receptionist created successfully.',
    receptionist,
  };
}

// ==========================================
// GET ALL RECEPTIONISTS
// ==========================================
async getAllReceptionists() {

  const receptionists =
    await this.prisma.user.findMany({
      where: {
        role: Role.RECEPTIONIST,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        employeeId: true,
        name: true,
        phone: true,
        email: true,
        isActive: true,
        createdAt: true,
      },
    });

  return {
    message:
      'Receptionists retrieved successfully.',
    receptionists,
  };
}

// ==========================================
// GET RECEPTIONIST
// ==========================================
async getReceptionist(
  receptionistId: string,
) {

  const receptionist =
    await this.prisma.user.findFirst({
      where: {
        id: receptionistId,
        role: Role.RECEPTIONIST,
      },
      select: {
        id: true,
        employeeId: true,
        name: true,
        phone: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

  if (!receptionist) {
    throw new NotFoundException(
      'Receptionist not found.',
    );
  }

  return {
    message:
      'Receptionist retrieved successfully.',
    receptionist,
  };
}

// ==========================================
// UPDATE RECEPTIONIST
// ==========================================
async updateReceptionist(
  receptionistId: string,
  updateReceptionistDto: UpdateReceptionistDto,
) {

  // ==========================================
  // FIND RECEPTIONIST
  // ==========================================
  const receptionist =
    await this.prisma.user.findFirst({
      where: {
        id: receptionistId,
        role: Role.RECEPTIONIST,
      },
    });

  if (!receptionist) {
    throw new NotFoundException(
      'Receptionist not found.',
    );
  }

  // ==========================================
  // CHECK PHONE
  // ==========================================
  if (updateReceptionistDto.phone) {
    const existingPhone =
      await this.findUserByPhone(
        updateReceptionistDto.phone,
      );

    if (
      existingPhone &&
      existingPhone.id !== receptionistId
    ) {
      throw new BadRequestException(
        'Phone number already exists.',
      );
    }
  }

  // ==========================================
  // CHECK EMAIL
  // ==========================================
  if (updateReceptionistDto.email) {
    const existingEmail =
      await this.prisma.user.findUnique({
        where: {
          email: updateReceptionistDto.email,
        },
      });

    if (
      existingEmail &&
      existingEmail.id !== receptionistId
    ) {
      throw new BadRequestException(
        'Email already exists.',
      );
    }
  }

  // ==========================================
  // PREPARE UPDATE DATA
  // ==========================================
  const updateData: {
    name?: string;
    phone?: string;
    email?: string;
  } = {};

  if (updateReceptionistDto.name !== undefined) {
    updateData.name = updateReceptionistDto.name;
  }

  if (updateReceptionistDto.phone !== undefined) {
    updateData.phone = updateReceptionistDto.phone;
  }

  if (updateReceptionistDto.email !== undefined) {
    updateData.email = updateReceptionistDto.email;
  }

  // ==========================================
  // UPDATE RECEPTIONIST
  // ==========================================
  const updatedReceptionist =
    await this.prisma.user.update({
      where: {
        id: receptionistId,
      },
      data: updateData,
      select: {
        id: true,
        employeeId: true,
        name: true,
        phone: true,
        email: true,
        isActive: true,
        updatedAt: true,
      },
    });

    // ==========================================
    // CREATE ADMIN NOTIFICATION
    // ==========================================
    try {
      const notification =
        await this.notificationService.createNotification(
          'Receptionist Updated',
          `${updatedReceptionist.name}'s profile was updated.`,
        );

      await this.notificationService.notifyAdmins(
        notification.id,
      );
    } catch (error) {
      this.logger.error(
        'Failed to create receptionist update notification.',
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
      'Receptionist updated successfully.',
    receptionist: updatedReceptionist,
  };
}

// ==========================================
// TOGGLE RECEPTIONIST STATUS
// ==========================================
async toggleReceptionistStatus(
  receptionistId: string,
) {

  // ==========================================
  // FIND RECEPTIONIST
  // ==========================================
  const receptionist =
    await this.prisma.user.findFirst({
      where: {
        id: receptionistId,
        role: Role.RECEPTIONIST,
      },
    });

  if (!receptionist) {
    throw new NotFoundException(
      'Receptionist not found.',
    );
  }

  // ==========================================
  // UPDATE STATUS
  // ==========================================
  const updatedReceptionist =
    await this.prisma.user.update({
      where: {
        id: receptionistId,
      },
      data: {
        isActive: !receptionist.isActive,
      },
      select: {
        id: true,
        employeeId: true,
        name: true,
        isActive: true,
      },
    });

  // ==========================================
  // CREATE NOTIFICATION
  // ==========================================
  const title = updatedReceptionist.isActive
    ? 'Receptionist Enabled'
    : 'Receptionist Disabled';

  const message = updatedReceptionist.isActive
    ? `${updatedReceptionist.name} has been enabled and can now access the system.`
    : `${updatedReceptionist.name} has been disabled and can no longer access the system.`;

  const notification =
    await this.notificationService.createNotification(
      title,
      message,
    );

  await this.notificationService.notifyAdmins(
    notification.id,
  );

  // ==========================================
  // RETURN RESPONSE
  // ==========================================
  return {
    message: updatedReceptionist.isActive
      ? 'Receptionist activated successfully.'
      : 'Receptionist deactivated successfully.',
    receptionist: updatedReceptionist,
  };
}

// ==========================================
// GET ALL GUESTS
// ==========================================
async getAllGuests() {

  const guests =
    await this.prisma.user.findMany({
      where: {
        role: Role.GUEST,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

  return {
    message:
      'Guests retrieved successfully.',
    guests,
  };
}

// ==========================================
// GET GUEST
// ==========================================
async getGuest(
  guestId: string,
) {

  const guest =
    await this.prisma.user.findFirst({
      where: {
        id: guestId,
        role: Role.GUEST,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

  if (!guest) {
    throw new NotFoundException(
      'Guest not found.',
    );
  }

  return {
    message:
      'Guest retrieved successfully.',
    guest,
  };
}

// ==========================================
// GET GUEST BOOKING HISTORY
// ==========================================
async getGuestBookingHistory(
  guestId: string,
) {

  // ==========================================
  // FIND GUEST
  // ==========================================
  const guest =
    await this.prisma.user.findFirst({
      where: {
        id: guestId,
        role: Role.GUEST,
      },
    });

  if (!guest) {
    throw new NotFoundException(
      'Guest not found.',
    );
  }

  // ==========================================
  // GET BOOKING HISTORY
  // ==========================================
  const bookings =
    await this.prisma.booking.findMany({
      where: {
        userId: guestId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        room: true,
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

  // ==========================================
  // RETURN RESPONSE
  // ==========================================
  return {
    message:
      'Guest booking history retrieved successfully.',
    guest: {
      id: guest.id,
      name: guest.name,
      phone: guest.phone,
      email: guest.email,
    },
    bookings,
  };
}

// ==========================================
// BOOKING STATISTICS
// ==========================================
async getBookingStatistics() {

  const [
    totalBookings,
    pendingBookings,
    paidBookings,
    checkedInBookings,
    checkedOutBookings,
    cancelledBookings,
  ] = await Promise.all([

    this.prisma.booking.count(),

    this.prisma.booking.count({
      where: {
        status: 'PENDING',
      },
    }),

    this.prisma.booking.count({
      where: {
        status: 'PAID',
      },
    }),

    this.prisma.booking.count({
      where: {
        status: 'CHECKED_IN',
      },
    }),

    this.prisma.booking.count({
      where: {
        status: 'CHECKED_OUT',
      },
    }),

    this.prisma.booking.count({
      where: {
        status: 'CANCELLED',
      },
    }),
  ]);

  return {
    totalBookings,
    pendingBookings,
    paidBookings,
    checkedInBookings,
    checkedOutBookings,
    cancelledBookings,
  };
}

// ==========================================
// GET ALL BOOKINGS
// ==========================================
async getAllBookings() {
  return this.bookingService.getAllBookings();
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
// GET BOOKING
// ==========================================
async getBooking(
  bookingReference: string,
) {
  return this.bookingService.getBookingForAdmin(
    bookingReference,
  );
}

// ==========================================
// GET BOOKING TIMELINE
// ==========================================
async getBookingTimeline(
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
        payments: true,
        accessLogs: true,
        securityAuditLogs: {
          include: {
            employee: true,
          },
        },
      },
    });

  if (!booking) {
    throw new NotFoundException(
      'Booking not found.',
    );
  }

  // ==========================================
  // BUILD TIMELINE
  // ==========================================
  const timeline = [

    {
      type: 'BOOKING_CREATED',
      date: booking.createdAt,
      details: 'Booking created.',
    },

    ...booking.payments.map(payment => ({
      type: 'PAYMENT',
      date: payment.createdAt,
      details: `${payment.purpose} (${payment.status})`,
    })),

    ...booking.accessLogs.map(log => ({
      type: 'ACCESS',
      date: log.createdAt,
      details: `${log.method} (${log.status})`,
    })),

    ...booking.securityAuditLogs.map(log => ({
      type: 'SECURITY',
      date: log.createdAt,
      details: log.details,
      employee: log.employee.name,
    })),
  ].sort(
    (a, b) =>
      new Date(a.date).getTime() -
      new Date(b.date).getTime(),
  );

  // ==========================================
  // RETURN RESPONSE
  // ==========================================
  return {
    message:
      'Booking timeline retrieved successfully.',
    bookingReference:
      booking.bookingId,
    timeline,
  };
}

// ==========================================
// CANCEL BOOKING
// ==========================================
async cancelBooking(
  adminUserId: string,
  bookingId: string,
  cancelBookingDto: CancelBookingDto,
) {

  // ==========================================
  // CANCEL BOOKING
  // ==========================================
  const booking =
    await this.bookingService.cancelBookingAsStaff(
      bookingId,
    );

  // ==========================================
  // SECURITY AUDIT
  // ==========================================
  await this.securityAuditService.log({
    employeeUserId: adminUserId,
    bookingId: booking.id,
    action: SecurityAction.BOOKING_CANCELLED,
    details:
      cancelBookingDto.reason ??
      `Booking ${booking.bookingId} was cancelled by an administrator.`,
  });

  // ==========================================
  // CREATE BOOKING CANCELLATION NOTIFICATIONS
  // ==========================================
  try {
    const staffMessage =
      cancelBookingDto.reason
        ? `Booking ${booking.bookingId} was cancelled by an administrator. Reason: ${cancelBookingDto.reason}`
        : `Booking ${booking.bookingId} was cancelled by an administrator.`;

    const staffNotification =
      await this.notificationService.createNotification(
        'Booking Cancelled',
        staffMessage,
        booking.id,
      );

    await this.notificationService.notifyReceptionists(
      staffNotification.id,
    );

    await this.notificationService.notifyAdmins(
      staffNotification.id,
    );

    const guestMessage =
      cancelBookingDto.reason
        ? `Your booking (${booking.bookingId}) has been cancelled by an administrator.\n\nReason: ${cancelBookingDto.reason}\n\nIf you have any questions, please contact Kiviz Executive Lodge.`
        : `Your booking (${booking.bookingId}) has been cancelled by an administrator.\n\nIf you have any questions, please contact Kiviz Executive Lodge.`;

    const guestNotification =
      await this.notificationService.createNotification(
        'Booking Cancelled',
        guestMessage,
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

  // ==========================================
  // RETURN RESPONSE
  // ==========================================
  return {
    message:
      'Booking cancelled successfully.',
  };
}

// ==========================================
// REVENUE SUMMARY
// ==========================================
async revenueSummary() {

  const today = new Date();

  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1,
  );

  const [
    totalRevenue,
    todayRevenue,
    monthRevenue,
    onlinePayments,
    cashPayments,
    totalTransactions,
  ] = await Promise.all([

    this.prisma.payment.aggregate({
      where: {
        status: PaymentStatus.SUCCESS,
      },
      _sum: {
        amount: true,
      },
    }),

    this.prisma.payment.aggregate({
      where: {
        status: PaymentStatus.SUCCESS,
        paidAt: {
          gte: startOfToday,
        },
      },
      _sum: {
        amount: true,
      },
    }),

    this.prisma.payment.aggregate({
      where: {
        status: PaymentStatus.SUCCESS,
        paidAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    }),

    this.prisma.payment.count({
      where: {
        status: PaymentStatus.SUCCESS,
        method: PaymentMethod.ONLINE,
      },
    }),

    this.prisma.payment.count({
      where: {
        status: PaymentStatus.SUCCESS,
        method: PaymentMethod.CASH,
      },
    }),

    this.prisma.payment.count({
      where: {
        status: PaymentStatus.SUCCESS,
      },
    }),

  ]);

  return {
    totalRevenue:
      totalRevenue._sum.amount ?? 0,

    todayRevenue:
      todayRevenue._sum.amount ?? 0,

    monthRevenue:
      monthRevenue._sum.amount ?? 0,

    onlinePayments,

    cashPayments,

    totalTransactions,
  };
}

// ==========================================
// LIST PAYMENTS
// ==========================================
async listPayments() {

  const payments =
    await this.prisma.payment.findMany({
      include: {
        booking: {
          include: {
            user: true,
            room: true,
          },
        },
      },
      orderBy: {
        paidAt: 'desc',
      },
    });

  return payments.map(
    (payment) => ({
      id: payment.id,
      reference: payment.reference,
      bookingId:
        payment.booking.bookingId,
      guestName:
        payment.booking.user.name ??
        'Guest',
      guestPhone:
        payment.booking.user.phone,
      roomNo:
        payment.booking.room.roomNo,
      purpose:
        payment.purpose,
      method:
        payment.method,
      provider:
        payment.provider,
      amount:
        payment.amount,
      status:
        payment.status,
      paidAt:
        payment.paidAt,
    }),
  );
}

// ==========================================
// PAYMENT DETAILS
// ==========================================
async getPayment(
  paymentId: string,
) {

  const payment =
    await this.prisma.payment.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        booking: {
          include: {
            user: true,
            room: true,
          },
        },
      },
    });

  if (!payment) {
    throw new NotFoundException(
      'Payment not found.',
    );
  }

  return {
    id: payment.id,
    reference: payment.reference,
    amount: payment.amount,
    status: payment.status,
    provider: payment.provider,
    method: payment.method,
    purpose: payment.purpose,
    paidAt: payment.paidAt,

    guest: {
      name:
        payment.booking.user.name ??
        'Guest',
      phone:
        payment.booking.user.phone,
    },

    booking: {
      bookingId:
        payment.booking.bookingId,
      status:
        payment.booking.status,
      checkIn:
        payment.booking.checkIn,
      checkOut:
        payment.booking.checkOut,
    },

    room: {
      roomNo:
        payment.booking.room.roomNo,
      type:
        payment.booking.room.type,
      price:
        payment.booking.room.price,
    },
  };
}

// ==========================================
// LIST ACCESS DEVICES
// ==========================================
async listAccessDevices() {
  return this.accessDeviceService.getAllAccessDevices();
}

// ==========================================
// ACCESS DEVICE DETAILS
// ==========================================
async getAccessDevice(
  id: string,
) {
  return this.accessDeviceService.getAccessDevice(
    id,
  );
}

// ==========================================
// REGISTER ACCESS DEVICE
// ==========================================
async registerAccessDevice(
  registerAccessDeviceDto: RegisterAccessDeviceDto,
) {
  return this.accessDeviceService.registerAccessDevice(
    registerAccessDeviceDto,
  );
}

// ==========================================
// UPDATE ACCESS DEVICE
// ==========================================
async updateAccessDevice(
  id: string,
  updateAccessDeviceDto: UpdateAccessDeviceDto,
) {
  return this.accessDeviceService.updateAccessDevice(
    id,
    updateAccessDeviceDto,
  );
}

// ==========================================
// DISABLE ACCESS DEVICE
// ==========================================
async disableAccessDevice(
  id: string,
) {
  return this.accessDeviceService.disableAccessDevice(
    id,
  );
}

// ==========================================
// ENABLE ACCESS DEVICE
// ==========================================
async enableAccessDevice(
  id: string,
) {
  return this.accessDeviceService.enableAccessDevice(
    id,
  );
}

// ==========================================
// OPERATIONAL REPORT
// ==========================================
async operationalReport() {

  const [
    totalRooms,
    available,
    occupied,
    maintenance,
  ] = await Promise.all([

    this.prisma.room.count(),

    this.prisma.room.count({
      where: {
        status: RoomStatus.AVAILABLE,
      },
    }),

    this.prisma.room.count({
      where: {
        status: RoomStatus.OCCUPIED,
      },
    }),

    this.prisma.room.count({
      where: {
        status: RoomStatus.MAINTENANCE,
      },
    }),

  ]);

  return {
    totalRooms,
    available,
    occupied,
    maintenance,
  };
}

// ==========================================
// BOOKING REPORT
// ==========================================
async bookingReport() {

  const [
    pendingBookings,
    paidBookings,
    checkedInBookings,
    checkedOutBookings,
    cancelledBookings,
  ] = await Promise.all([

    this.prisma.booking.count({
      where: {
        status: BookingStatus.PENDING,
      },
    }),

    this.prisma.booking.count({
      where: {
        status: BookingStatus.PAID,
      },
    }),

    this.prisma.booking.count({
      where: {
        status: BookingStatus.CHECKED_IN,
      },
    }),

    this.prisma.booking.count({
      where: {
        status: BookingStatus.CHECKED_OUT,
      },
    }),

    this.prisma.booking.count({
      where: {
        status: BookingStatus.CANCELLED,
      },
    }),

  ]);

  return {
    pendingBookings,
    paidBookings,
    checkedInBookings,
    checkedOutBookings,
    cancelledBookings,
  };
}

// ==========================================
// REVENUE REPORT
// ==========================================
async revenueReport() {
  return this.listPayments();
}

// ==========================================
// ACCESS LOG REPORT
// ==========================================
async accessLogReport() {

  const accessLogs =
  await this.prisma.accessLog.findMany({
    where: {
      booking: {
        isNot: null,
      },
    },
      select: {
        id: true,
        method: true,
        status: true,
        reason: true,
        createdAt: true,

        booking: {
          select: {
            bookingId: true,
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },

        accessDevice: {
          select: {
            deviceId: true,
            room: {
              select: {
                roomNo: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

  return {
    message:
      'Access logs retrieved successfully.',
    accessLogs,
  };
}

// ==========================================
// SECURITY AUDIT REPORT
// ==========================================
async securityAuditReport() {
  return this.securityAuditService.getSecurityAuditLogs();
}

// ==========================================
// GET RECENT ADMIN NOTIFICATIONS
// ==========================================
async getRecentNotifications(
  adminId: string,
) {
  return this.notificationService.getRecentAdminNotifications(
    adminId,
  );
}

// ==========================================
// HIDE ADMIN NOTIFICATION
// ==========================================
async hideNotification(
  notificationId: string,
  adminId: string,
) {
  return this.notificationService.hideAdminNotification(
    notificationId,
    adminId,
  );
}
}
