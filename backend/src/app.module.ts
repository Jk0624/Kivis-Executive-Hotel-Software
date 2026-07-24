import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BookingModule } from './booking/booking.module';
import { PaymentModule } from './payment/payment.module';
import { ReceptionModule } from './reception/reception.module';
import { SmsModule } from './sms/sms.module';
import { AccessDeviceModule } from './access-device/access-device.module';
import { AccessModule } from './access/access.module';
import { AdminModule } from './admin/admin.module';
import { SecurityAuditModule } from './security-audit/security-audit.module';
import { RoomModule } from './room/room.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { NotificationModule } from './notifications/notification.module';
import { GuestModule } from './guest/guest.module';
import { ContactModule } from './contact/contact.module';
import { AccountModule } from './account/account.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    BookingModule,
    PaymentModule,
    ReceptionModule,
    SmsModule,
    AccessDeviceModule,
    AccessModule,
    AdminModule,
    SecurityAuditModule,
    RoomModule,
    CloudinaryModule,
    NotificationModule,
    GuestModule,
    ContactModule,
    AccountModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}