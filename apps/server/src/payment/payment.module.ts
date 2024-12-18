import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import { PrismaService } from '../core/database/prisma.service';
import { CustomerService } from './customer/customer.service';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [PaymentController],
  providers: [
    CustomerService,
    PaymentService,
    PrismaService,
    {
      provide: 'STRIPE',
      useFactory: (configService: ConfigService) =>
        new Stripe(configService.get<string>('stripe.secretKey') || '', {
          apiVersion: '2024-11-20.acacia', // Use the latest API version
        }),
      inject: [ConfigService],
    },
  ],
  exports: ['STRIPE', PaymentService, CustomerService],
})
export class PaymentModule {}
