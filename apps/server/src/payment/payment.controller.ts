import { Controller, Get, Query } from '@nestjs/common';

import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('methods')
  async listPaymentMethods(@Query('customerId') customerId: string) {
    return await this.paymentService.listPaymentMethods(customerId);
  }
}
