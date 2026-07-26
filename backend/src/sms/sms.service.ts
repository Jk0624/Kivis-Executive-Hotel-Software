import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { SendSmsOptions } from './interfaces/send-sms.interface';
import { SendOtpOptions } from './interfaces/send-otp.interface';
import { SendAccessPinOptions } from './interfaces/send-access-pin.interface';

import { ArkeselProvider } from './providers/arkesel.provider';
import { SmsOnlineGhProvider } from './providers/smsonlinegh.provider';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  private readonly provider: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly arkeselProvider: ArkeselProvider,
    private readonly smsOnlineGhProvider: SmsOnlineGhProvider,
  ) {
    this.provider = (
      this.configService.get<string>('SMS_PROVIDER') ??
      'ARKASEL'
    ).toUpperCase();

    this.logger.log(
      `SMS Provider: ${this.provider}`,
    );
  }

  // ==========================================
  // SEND SMS
  // ==========================================
  async sendSms(options: SendSmsOptions): Promise<void> {
    if (this.provider === 'SMSONLINEGH') {
      return this.smsOnlineGhProvider.sendSms(options);
    }

    return this.arkeselProvider.sendSms(options);
  }

  // ==========================================
  // SEND OTP
  // ==========================================
  async sendOtp({
    recipient,
    otp,
  }: SendOtpOptions): Promise<void> {
    const message = `Kiviz Executive Lodge

Your verification code is:

${otp}

This code expires in 5 mins.

Do not share this code with anyone.`;

    return this.sendSms({
      recipient,
      message,
    });
  }

  // ==========================================
  // SEND ACCESS PIN
  // ==========================================
  async sendAccessPin({
    recipient,
    guestName,
    bookingReference,
    roomNumber,
    accessPin,
  }: SendAccessPinOptions): Promise<void> {
    const message = `Kiviz Lodge

Hello ${guestName},

Booking Ref: ${bookingReference}
Room: ${roomNumber}

Access PIN:
${accessPin}

Use this PIN to unlock your room.

Do not share it.`;

    return this.sendSms({
      recipient,
      message,
    });
  }
}