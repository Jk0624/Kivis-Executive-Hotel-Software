import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SendSmsOptions } from './interfaces/send-sms.interface';
import { SendAccessPinOptions } from './interfaces/send-access-pin.interface';
import { SendOtpOptions } from './interfaces/send-otp.interface';


@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  private readonly apiUrl =
    'https://sms.arkesel.com/api/v2/sms/send';

  private readonly apiKey: string;

  private readonly senderId: string;

  private readonly sandbox: boolean;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.apiKey =
      this.configService.get<string>(
        'ARKASEL_API_KEY',
      ) ?? '';

    this.senderId =
      this.configService.get<string>(
        'ARKASEL_SENDER',
      ) ?? '';

    this.sandbox =
      this.configService.get<string>(
        'ARKASEL_SANDBOX',
      ) === 'true';
  }

  // ==========================
  // SEND SMS
  // ==========================

  async sendSms({
    recipient,
    message,
    sender,
  }: SendSmsOptions) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          sender: sender ?? this.senderId,

          recipients: [recipient],

          message,

          sandbox: this.sandbox,
        },
        {
          headers: {
            'api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error: any) {
      this.logger.error(
        error.response?.data || error.message,
      );

      throw new InternalServerErrorException(
        'Failed to send SMS.',
      );
    }
  }

  // ==========================================
  // SEND OTP
  // ==========================================
  async sendOtp({
    recipient,
    otp,
  }: SendOtpOptions) {

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
    }: SendAccessPinOptions) {
    const message =
    `Kiviz Executive Lodge

    Hello ${guestName},

    Your check-in is complete.

    Booking Ref: ${bookingReference}
    Room: ${roomNumber}

    Room Access PIN:
    ${accessPin}

    This PIN is required to unlock your room.

    Keep it confidential.

    Enjoy your stay!`;

    return this.sendSms({
        recipient,
        message,
    });
    }

}