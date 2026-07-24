import { Module } from '@nestjs/common';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

import { PrismaModule } from '../prisma/prisma.module';
import { BookingModule } from '../booking/booking.module';
import { SecurityAuditModule } from '../security-audit/security-audit.module';
import { AccessDeviceModule } from '../access-device/access-device.module';
import { RoomModule } from '../room/room.module';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [
    PrismaModule,
    BookingModule,
    SecurityAuditModule,
    AccessDeviceModule,
    RoomModule,
    NotificationModule,
  ],
  controllers: [
    AdminController,
  ],
  providers: [
    AdminService,
  ],
})
export class AdminModule {}