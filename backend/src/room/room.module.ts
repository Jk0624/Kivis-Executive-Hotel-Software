import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { RoomService } from './room.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [
    PrismaModule,
    CloudinaryModule,
    NotificationModule,
  ],
  providers: [
    RoomService,
  ],
  exports: [
    RoomService,
  ],
})
export class RoomModule {}