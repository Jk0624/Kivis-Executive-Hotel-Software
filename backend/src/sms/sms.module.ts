import { Module } from '@nestjs/common';

import { SmsService } from './sms.service';

import { ArkeselProvider } from './providers/arkesel.provider';
import { SmsOnlineGhProvider } from './providers/smsonlinegh.provider';

@Module({
  providers: [
    SmsService,
    ArkeselProvider,
    SmsOnlineGhProvider,
  ],
  exports: [SmsService],
})
export class SmsModule {}