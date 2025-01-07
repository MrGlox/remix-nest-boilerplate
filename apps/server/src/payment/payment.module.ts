import { HttpModule } from "@nestjs/axios";
import { Logger, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import Stripe from "stripe";

import { PrismaModule } from "../core/database/prisma.module";

import { CustomerService } from "./customer/customer.service";
import { WebhookController } from "./events/webhook.controller";
import { WebhookService } from "./events/webhook.service";
import { PaymentService } from "./payment.service";
import { ProductService } from "./product/product.service";
import { SubscriptionService } from "./subscription/subscription.service";

@Module({
  imports: [HttpModule, ConfigModule, PrismaModule],
  providers: [
    Logger,
    {
      provide: "STRIPE",
      useFactory: (configService: ConfigService) =>
        new Stripe(configService.get<string>("stripe.secretKey") || "", {
          apiVersion: "2024-11-20.acacia", // Use the latest API version
        }),
      inject: [ConfigService],
    },
    CustomerService,
    PaymentService,
    ProductService,
    SubscriptionService,
    WebhookService,
  ],
  controllers: [
    WebhookController,
  ],
  exports: [
    "STRIPE",
    PaymentService,
    ProductService,
    CustomerService,
    SubscriptionService,
    WebhookService
  ],
})
export class PaymentModule {}
