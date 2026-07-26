import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { SendSmsOptions } from '../interfaces/send-sms.interface';
import { SmsProvider } from './interfaces/sms-provider.interface';

@Injectable()
export class ArkeselProvider implements SmsProvider {
  private readonly logger = new Logger(ArkeselProvider.name);

  private readonly apiKey: string;

  private readonly senderId: string;

  private readonly apiUrl =
    'https://sms.arkesel.com/api/v2/sms/send';

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.apiKey =
      this.configService.get<string>('ARKASEL_API_KEY') ?? '';

    this.senderId =
      this.configService.get<string>('ARKASEL_SENDER') ?? '';
  }

  async sendSms({
    recipient,
    message,
    sender,
  }: SendSmsOptions): Promise<void> {
    try {
      await axios.post(
        this.apiUrl,
        {
          sender: sender ?? this.senderId,
          message,
          recipients: [recipient],
        },
        {
          headers: {
            'api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

    } catch (error: any) {
      this.logger.error(
        'Failed to send SMS via Arkesel',
        error?.response?.data ?? error.message,
      );

      throw new InternalServerErrorException(
        'Unable to send SMS.',
      );
    }
  }
}