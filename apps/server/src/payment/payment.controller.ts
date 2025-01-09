import { Controller } from '@nestjs/common';

import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  // @Get('methods')
  // async listPaymentMethods(@Query('customerId') customerId: string) {
  //   return await this.paymentService.listPaymentMethods(customerId);
  // }
}
