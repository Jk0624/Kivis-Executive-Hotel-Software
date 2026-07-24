import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { AccessDeviceController } from './access-device.controller';
import { AccessDeviceService } from './access-device.service';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [PrismaModule, NotificationModule,],
  controllers: [AccessDeviceController],
  providers: [AccessDeviceService],
  exports: [AccessDeviceService],
})
export class AccessDeviceModule {}