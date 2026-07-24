import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class PaystackService {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  // ==========================================
  // INITIALIZE PAYMENT
  // ==========================================
  async initializePayment(
    email: string,
    amount: number,
    paymentReference: string,
    bookingId: string,
  ) {
    const secretKey = this.configService.get<string>(
      'PAYSTACK_SECRET_KEY',
    );

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100,
        reference: paymentReference,
        metadata: {
          bookingId,
        },
        callback_url: this.configService.get<string>(
          'PAYSTACK_CALLBACK_URL',
        ),
      },
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  }

  // ==========================================
  // VERIFY PAYMENT
  // ==========================================
  async verifyPayment(
    reference: string,
  ) {
    const secretKey = this.configService.get<string>(
      'PAYSTACK_SECRET_KEY',
    );

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      },
    );

    return response.data;
  }

  // ==========================================
  // VERIFY WEBHOOK SIGNATURE
  // ==========================================
  verifyWebhookSignature(
    rawBody: Buffer,
    signature: string,
  ): boolean {
    const secretKey = this.configService.get<string>(
      'PAYSTACK_SECRET_KEY',
    );

    if (!secretKey || !signature) {
      return false;
    }

    const hash = crypto
      .createHmac('sha512', secretKey)
      .update(rawBody)
      .digest('hex');

    return hash === signature;
  }
}