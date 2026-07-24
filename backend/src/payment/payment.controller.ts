import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';


@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
  ) {}

  // ==========================================
  // CREATE PAYMENT
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Post()
  createPayment(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentService.createPayment(
      user,
      createPaymentDto,
    );
  }

  // ==========================================
  // PAYSTACK WEBHOOK
  // ==========================================
  @Post('webhook')
  handleWebhook(
    @Req() request: any,
    @Headers('x-paystack-signature')
    signature: string,
    @Body() payload: any,
  ) {
    return this.paymentService.handleWebhook(
      request.rawBody,
      signature,
      payload,
    );
  }

  // ==========================================
  // GET PAYMENT VERIFICATION STATUS
  // ==========================================
  @Get('verify/:reference')
  getPaymentVerificationStatus(
    @Param('reference') reference: string,
  ) {
    return this.paymentService.getPaymentVerificationStatus(
      reference,
    );
  }
  
  // ==========================================
  // GET PAYMENT HISTORY FOR GUEST
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Get('history')
  getPaymentHistory(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.paymentService.getPaymentHistory(
      user,
    );
  }

}