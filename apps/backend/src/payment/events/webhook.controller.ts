import { Body, Controller, HttpCode, Post } from '@nestjs/common';

@Controller('webhook')
export class WebhookController {
  @Post()
  @HttpCode(200)
  handleWebhook(
    @Body() payload: any,
    // @Headers('x-signature') signature: string,
  ) {
    console.log(payload);

    return { received: true };
  }
}
