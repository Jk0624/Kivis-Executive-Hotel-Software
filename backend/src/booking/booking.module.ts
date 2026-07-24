import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SecurityAuditModule } from '../security-audit/security-audit.module';
import { NotificationModule } from '../notifications/notification.module';
import { BookingHousekeepingService } from './booking-housekeeping.service';

@Module({
  imports: [
    PrismaModule,
    SecurityAuditModule,
    NotificationModule,
  ],
  controllers: [
    BookingController,
  ],
  providers: [
    BookingService,
    BookingHousekeepingService,
  ],
  exports: [
    BookingService,
    BookingHousekeepingService,
  ],
})
export class BookingModule {}
