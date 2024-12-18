import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-intent')
  async createPaymentIntent(
    @Body() createIntentDto: { amount: number; currency: string },
  ) {
    const { amount, currency } = createIntentDto;
    return await this.paymentService.createPaymentIntent(amount, currency);
  }

  @Get('methods')
  async listPaymentMethods(@Query('customerId') customerId: string) {
    return await this.paymentService.listPaymentMethods(customerId);
  }
}
