import { Module } from '@nestjs/common';

import { RoomModule } from '../room/room.module';

import { GuestController } from './guest.controller';
import { GuestService } from './guest.service';
import { BookingModule } from '../booking/booking.module';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [
    RoomModule,
    BookingModule,
    NotificationModule,
  ],
  controllers: [
    GuestController,
  ],
  providers: [
    GuestService,
  ],
})
export class GuestModule {}