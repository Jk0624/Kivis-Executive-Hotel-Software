import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import {
  VerifyAccessDto,
} from './dto/verify-access.dto';

@Injectable()
export class AccessService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}
  // ==========================================
    // AUTHENTICATE ACCESS DEVICE
    // ==========================================
    private async authenticateDevice(
    deviceKey: string,
    ) {
    const accessDevice =
        await this.prisma.accessDevice.findUnique({
        where: {
            apiKey: deviceKey,
        },
        include: {
            room: true,
        },
        });

    if (!accessDevice) {
        throw new UnauthorizedException(
        'Invalid device credentials.',
        );
    }

    if (!accessDevice.isActive) {
        throw new UnauthorizedException(
            'This access device has been disabled.',
        );
    }

    return accessDevice;
    }


    // ==========================================
    // VERIFY ACTIVE BOOKING
    // ==========================================
    private async verifyActiveBooking(
    roomId: string,
    ) {
    return this.prisma.booking.findFirst({
        where: {
        roomId,
        status: 'CHECKED_IN',
        },
        include: {
        user: true,
        },
    });
    }

    // ==========================================
    // VERIFY BOOKING DATES
    // ==========================================
    private verifyBookingDates(
    booking: {
        checkIn: Date;
        checkOut: Date;
    },
    ) {
    const now = new Date();

    return (
        now >= booking.checkIn &&
        now <= booking.checkOut
    );
    }


// ==========================================
// CREATE ACCESS LOG
// ==========================================
private async createAccessLog({
  bookingId,
  accessDeviceId,
  method = 'PIN',
  status,
  reason,
}: {
  bookingId?: string;
  accessDeviceId: string;
  method?: 'PIN';
  status: 'SUCCESS' | 'FAILED';
  reason?: string;
}) {
  await this.prisma.accessLog.create({
    data: {
      bookingId,
      accessDeviceId,
      method,
      status,
      reason,
    },
  });
}

    // ==========================================
    // VERIFY PIN
    // ==========================================
    private async verifyPin(
    accessDevice: {
        id: string;
        roomId: string;
    },
    verifyAccessDto: VerifyAccessDto,
    ) {
    // ==========================================
    // VALIDATE PIN REQUEST
    // ==========================================
    if (!verifyAccessDto.pin) {
        throw new UnauthorizedException(
        'Access PIN is required.',
        );
    }

    // ==========================================
    // FIND ACTIVE BOOKING
    // ==========================================
    const booking =
        await this.verifyActiveBooking(
        accessDevice.roomId,
        );

    if (!booking) {
        await this.createAccessLog({
        accessDeviceId: accessDevice.id,
        method: 'PIN',
        status: 'FAILED',
        reason: 'NO_ACTIVE_BOOKING',
        });

        throw new UnauthorizedException(
        'No checked-in guest found for this room.',
        );
    }

    // ==========================================
    // VERIFY PIN
    // ==========================================
    if (booking.accessPin !== verifyAccessDto.pin) {
    await this.createAccessLog({
        bookingId: booking.id,
        accessDeviceId: accessDevice.id,
        method: 'PIN',
        status: 'FAILED',
        reason: 'INVALID_PIN',
    });

    throw new UnauthorizedException(
        'Invalid access PIN.',
    );
    }

    // ==========================================
    // VERIFY BOOKING DATES
    // ==========================================
    if (!this.verifyBookingDates(booking)) {
    await this.createAccessLog({
        bookingId: booking.id,
        accessDeviceId: accessDevice.id,
        method: 'PIN',
        status: 'FAILED',
        reason: 'BOOKING_NOT_CURRENTLY_VALID',
    });

    throw new UnauthorizedException(
        'Booking is not currently valid.',
    );
    }

    // ==========================================
    // CREATE ACCESS LOG
    // ==========================================
    await this.createAccessLog({
    bookingId: booking.id,
    accessDeviceId: accessDevice.id,
    method: 'PIN',
    status: 'SUCCESS',
    });

    // ==========================================
    // RETURN RESPONSE
    // ==========================================
    return {
    granted: true,
    method: 'PIN',
    code: 'ACCESS_GRANTED',
    message: 'Access granted.',
    };

    }

    // ==========================================
    // VERIFY ACCESS
    // ==========================================
    async verifyAccess(
    deviceKey: string,
    verifyAccessDto: VerifyAccessDto,
    ) {

    // ==========================================
    // AUTHENTICATE DEVICE
    // ==========================================
    const accessDevice =
        await this.authenticateDevice(
        deviceKey,
        );

    return this.verifyPin(
        accessDevice,
        verifyAccessDto,
    );
    }
}