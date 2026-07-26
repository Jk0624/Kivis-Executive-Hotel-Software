import { SendSmsOptions } from '../../interfaces/send-sms.interface';

export interface SmsProvider {
  sendSms(
    options: SendSmsOptions,
  ): Promise<void>;
}