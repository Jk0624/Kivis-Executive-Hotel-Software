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
export class SmsOnlineGhProvider implements SmsProvider {
  private readonly logger = new Logger(
    SmsOnlineGhProvider.name,
  );

  private readonly apiUrl =
    'https://api.smsonlinegh.com/v5/message/sms/send';

  private readonly apiKey: string;

  private readonly senderId: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.apiKey =
      this.configService.get<string>(
        'SMSONLINEGH_API_KEY',
      ) ?? '';

    this.senderId =
      this.configService.get<string>(
        'SMSONLINEGH_SENDER',
      ) ?? '';
  }

  async sendSms({
    recipient,
    message,
    sender,
  }: SendSmsOptions): Promise<void> {
    try {
      const formData = new URLSearchParams();

      formData.append('key', this.apiKey);
      formData.append(
        'sender',
        sender ?? this.senderId,
      );
      formData.append('text', message);
      formData.append('to', recipient);
      formData.append('type', '0');

      const response = await axios.post(
        this.apiUrl,
        formData.toString(),
        {
          headers: {
            'Content-Type':
              'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
        },
      );

      if (response.data?.handshake?.id !== 0) {
        this.logger.error(
          `SMSOnlineGH rejected the request (${response.data.handshake?.label})`,
          response.data,
        );

        throw new InternalServerErrorException(
          'Unable to send SMS.',
        );
      }

      this.logger.log(
        `SMS sent successfully via SMSOnlineGH to ${recipient}`,
      );
    } catch (error: any) {
      this.logger.error(
        'Failed to send SMS via SMSOnlineGH',
        error?.response?.data ?? error.message,
      );

      throw new InternalServerErrorException(
        'Unable to send SMS.',
      );
    }
  }
}