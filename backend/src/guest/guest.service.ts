import { Injectable } from '@nestjs/common';

import { RoomService } from '../room/room.service';
import { FilterGuestRoomsDto } from './dto/filter-guest-rooms.dto';
import { BookingService } from '../booking/booking.service';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateBookingDto } from '../booking/dto/create-booking.dto';

@Injectable()
export class GuestService {
  constructor(
    private readonly roomService: RoomService,
     private readonly bookingService: BookingService,
  ) {}

  async getRooms() {
    return this.roomService.getAllRooms();
  }

    // ==========================================
    // FILTER AVAILABLE ROOMS FOR GUEST
    // ==========================================
    async filterRooms(
    query: FilterGuestRoomsDto,
    ) {
    return this.roomService.filterRoomsForGuest(
        query,
    );
    }

    // ==========================================
    // GET ROOM
    // ==========================================
    async getRoom(
    roomId: string,
    ) {
    return this.roomService.getRoomForGuest(
        roomId,
    );
    }

  // ==========================================
  // CREATE BOOKING
  // ==========================================
  async createBooking(
    user: AuthenticatedUser,
    createBookingDto: CreateBookingDto,
  ) {
    return this.bookingService.createBooking(
      user,
      createBookingDto,
    );
  }

// ==========================================
// CANCEL BOOKING
// ==========================================
async cancelBooking(
  user: AuthenticatedUser,
  bookingId: string,
) {
  return this.bookingService.cancelBooking(
    user,
    bookingId,
  );
}

// ==========================================
// GET GUEST BOOKINGS
// ==========================================
async getBookings(
  user: AuthenticatedUser,
) {
  return this.bookingService.getGuestBookings(
    user,
  );
}

// ==========================================
// GET GUEST BOOKING HISTORY
// ==========================================
async getBookingHistory(
  user: AuthenticatedUser,
) {
  return this.bookingService.getGuestBookingHistory(
    user,
  );
}
}