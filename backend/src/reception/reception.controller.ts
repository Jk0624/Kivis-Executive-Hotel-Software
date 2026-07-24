import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateWalkInBookingDto } from './dto/create-walkin-booking.dto';
import { ReceptionService } from './reception.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CheckInDto } from './dto/check-in.dto';
import { ResendAccessPinDto } from './dto/resend-access-pin.dto';
import { PreviewBookingExtensionDto } from './dto/preview-booking-extension.dto';
import { ConfirmBookingExtensionDto } from './dto/confirm-booking-extension.dto';
import { RevealAccessPinDto } from './dto/reveal-access-pin.dto';
import { Request } from 'express';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { FilterGuestsDto } from './dto/filter-guests.dto';


@Controller('reception')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(
  'RECEPTIONIST',
  'ADMIN',
)
export class ReceptionController {
  constructor(
    private readonly receptionService: ReceptionService,
  ) {}

  // ==========================================
  // DASHBOARD HEADER
  // ==========================================
  @Get('dashboard/header')
  getDashboardHeader(
    @Req()
    request: Request & {
      user: AuthenticatedUser;
    },
  ) {
    return this.receptionService.getDashboardHeader(
      request.user.id,
    );
  }

  // ==========================================
  // DASHBOARD STATISTICS
  // ==========================================
  @Get('dashboard/statistics')
  getDashboardStatistics() {
    return this.receptionService.getDashboardStatistics();
  }

// ==========================================
// DASHBOARD PENDING CHECK-INS
// ==========================================
@Get('dashboard/pending-checkins')
getDashboardPendingCheckIns() {
  return this.receptionService.getDashboardPendingCheckIns();
}

// ==========================================
// GET ALL BOOKINGS
// ==========================================
@Get('bookings')
getAllBookings() {
  return this.receptionService.getAllBookings();
}

// ==========================================
// SEARCH BOOKINGS
// ==========================================
@Get('bookings/search')
searchBookings(
  @Query('search')
  search: string,
) {
  return this.receptionService.searchBookings(
    search,
  );
}

// ==========================================
// GET BOOKING
// ==========================================
@Get('bookings/:bookingReference')
getBooking(
  @Param('bookingReference')
  bookingReference: string,
) {
  return this.receptionService.getBooking(
    bookingReference,
  );
}


    // ==========================================
    // CREATE WALK-IN BOOKING
    // ==========================================
    @Post('walk-in')
    createWalkInBooking(
    @Body()
    createWalkInBookingDto: CreateWalkInBookingDto,
    ) {
    return this.receptionService.createWalkInBooking(
        createWalkInBookingDto,
    );
    }

    // ==========================================
// FIND CHECK-IN BOOKING BY PHONE
// ==========================================
@Get('check-in/search')
findCheckInBookingByPhone(
  @Query('phone')
  phone: string,
) {
  return this.receptionService.findCheckInBookingByPhone(
    phone,
  );
}

    // ==========================================
    // CHECK IN GUEST
    // ==========================================
    @Post('check-in')
    checkIn(
      @Body() checkInDto: CheckInDto,
    ) {
      return this.receptionService.checkIn(
        checkInDto,
      );
    }

    // ==========================================
    // FIND CHECK-OUT BOOKING BY PHONE
    // ==========================================
    @Get('check-out/search')
    findCheckOutBookingByPhone(
      @Query('phone')
      phone: string,
    ) {
      return this.receptionService.findCheckOutBookingByPhone(
        phone,
      );
    }

    // ==========================================
    // CHECK OUT GUEST
    // ==========================================
    @Post('check-out')
    checkOut(
      @Body('bookingId') bookingId: string,
    ) {
      return this.receptionService.checkOut(
        bookingId,
      );
    }
    
    // ==========================================
    // CANCEL BOOKING
    // ==========================================
    @Patch('bookings/:bookingId/cancel')
    cancelBooking(
      @Req()
      request: Request & {
        user: AuthenticatedUser;
      },

      @Param('bookingId')
      bookingId: string,

      @Body()
      cancelBookingDto: CancelBookingDto,
    ) {
      return this.receptionService.cancelBooking(
        request.user.id,
        bookingId,
        cancelBookingDto.reason,
      );
    }

    // ==========================================
    // RESEND ACCESS PIN
    // ==========================================
    @Post('resend-access-pin')
    resendAccessPin(
      @Req()
      request: Request & {
        user: AuthenticatedUser;
      },

      @Body()
      resendAccessPinDto: ResendAccessPinDto,
    ) {
      return this.receptionService.resendAccessPin(
        request.user.id,
        resendAccessPinDto,
      );
    }

    // ==========================================
    // REVEAL ACCESS PIN
    // ==========================================
    @Post('reveal-access-pin')
    revealAccessPin(
      @Req()
      request: Request & {
        user: AuthenticatedUser;
      },

      @Body()
      revealAccessPinDto: RevealAccessPinDto,
    ) {
      return this.receptionService.revealAccessPin(
        request.user.id,
        revealAccessPinDto,
      );
    }

  // ==========================================
  // FIND BOOKING FOR EXTENSION BY PHONE
  // ==========================================
  @Get('booking-extension/search')
  findBookingForExtensionByPhone(
    @Query('phone')
    phone: string,
  ) {
    return this.receptionService.findBookingForExtensionByPhone(
      phone,
    );
  }

    // ==========================================
    // PREVIEW BOOKING EXTENSION
    // ==========================================
    @Post('booking-extension/preview')
    previewBookingExtension(
      @Body()
      previewBookingExtensionDto: PreviewBookingExtensionDto,
    ) {
      return this.receptionService.previewBookingExtension(
        previewBookingExtensionDto,
      );
    }

    // ==========================================
    // CONFIRM BOOKING EXTENSION
    // ==========================================
    @Post('booking-extension/confirm')
    confirmBookingExtension(
      @Body()
      confirmBookingExtensionDto: ConfirmBookingExtensionDto,
    ) {
      return this.receptionService.confirmBookingExtension(
        confirmBookingExtensionDto,
      );
    }

    // ==========================================
    // GET ALL ROOMS
    // ==========================================
    @Get('rooms')
    getAllRooms() {
      return this.receptionService.getAllRooms();
    }

    // ==========================================
    // GET ROOM
    // ==========================================
    @Get('rooms/:roomId')
    getRoom(
      @Param('roomId')
      roomId: string,
    ) {
      return this.receptionService.getRoom(
        roomId,
      );
    }

    // ==========================================
    // GET ALL GUESTS
    // ==========================================
    @Get('guests')
    getGuests(
      @Query()
      filterGuestsDto: FilterGuestsDto,
    ) {
      return this.receptionService.getGuests(
        filterGuestsDto,
      );
    }

}

