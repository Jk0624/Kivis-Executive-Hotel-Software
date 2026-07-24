import { Module } from '@nestjs/common';

import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaystackService } from './paystack/paystack.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../notifications/notification.module';
import { BookingModule } from '../booking/booking.module';

@Module({
  imports: [PrismaModule, NotificationModule,BookingModule],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PaystackService,
  ],
  exports: [
    PaymentService,
  ],
})

export class PaymentModule {}