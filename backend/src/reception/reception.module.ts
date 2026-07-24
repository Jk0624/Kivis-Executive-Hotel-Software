import { Module } from '@nestjs/common';
import { ReceptionController } from './reception.controller';
import { ReceptionService } from './reception.service';
import { BookingModule } from '../booking/booking.module';
import { PaymentModule } from '../payment/payment.module';
import { SmsModule } from '../sms/sms.module';
import { SecurityAuditModule } from '../security-audit/security-audit.module';
import { RoomModule } from '../room/room.module';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [
    BookingModule,
    PaymentModule,
    SmsModule,
    SecurityAuditModule,
    RoomModule,
    NotificationModule,
  ],
  controllers: [ReceptionController],
  providers: [ReceptionService],
})

export class ReceptionModule {}
