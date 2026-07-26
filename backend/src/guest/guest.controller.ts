import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { GuestService } from './guest.service';
import { FilterGuestRoomsDto } from './dto/filter-guest-rooms.dto';
import { CreateBookingDto } from '../booking/dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { NotificationService } from '../notifications/notification.service';

@Controller('guest')
export class GuestController {
  constructor(
    private readonly guestService: GuestService,
    private readonly notificationService: NotificationService,
  ) {}

  // ==========================================
  // GET ALL ROOMS FOR GUESTS
  // ==========================================
  @Get('rooms')
  getRooms() {
    return this.guestService.getRooms();
  }

  // ==========================================
  // FILTER ROOMS FOR GUESTS
  // ==========================================
  @Get('rooms/filter')
  filterRooms(
    @Query() query: FilterGuestRoomsDto,
  ) {
    return this.guestService.filterRooms(query);
  }

    // ==========================================
    // GET ROOM
    // ==========================================
    @Get('rooms/:roomId')
    getRoom(
    @Param('roomId') roomId: string,
    ) {
    return this.guestService.getRoom(roomId);
    }

  // ==========================================
  // CREATE BOOKING
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Post('bookings')
  createBooking(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.guestService.createBooking(
      user,
      createBookingDto,
    );
  }

  // ==========================================
  // CANCEL BOOKING
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Patch('bookings/:bookingId/cancel')
  cancelBooking(
    @CurrentUser() user: AuthenticatedUser,
    @Param('bookingId') bookingId: string,
  ) {
    return this.guestService.cancelBooking(
      user,
      bookingId,
    );
  }

  // ==========================================
  // GET GUEST BOOKINGS
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Get('bookings')
  getBookings(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.guestService.getBookings(
      user,
    );
  }

  // ==========================================
  // GET GUEST BOOKING HISTORY
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Get('bookings/history')
  getBookingHistory(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.guestService.getBookingHistory(
      user,
    );
  }

  // ==========================================
  // GET GUEST NOTIFICATIONS
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Get('notifications')
  getNotifications(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.notificationService.getGuestNotifications(
      user,
    );
  }

  // ==========================================
  // GET RECENT GUEST NOTIFICATIONS
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Get('notifications/recent')
  getRecentNotifications(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.notificationService.getRecentGuestNotifications(
      user,
    );
  }

  // ==========================================
  // HIDE GUEST NOTIFICATION
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Patch('notifications/:notificationId/hide')
  hideNotification(
    @CurrentUser() user: AuthenticatedUser,
    @Param('notificationId') notificationId: string,
  ) {
    return this.notificationService.hideGuestNotification(
      notificationId,
      user,
    );
  }
}