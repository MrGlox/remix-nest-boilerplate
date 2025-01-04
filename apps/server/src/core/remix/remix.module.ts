import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '../../auth/auth.module';
import { PrismaService } from '../database/prisma.service';
import { EventModule } from '../event/event.module';
import { TokenModule } from '../token/token.module';

import { RemixController } from './remix.controller';
import { RemixService } from './remix.service';

import { NotificationModule } from '../../notification/notification.module';
import { PaymentModule } from '../../payment/payment.module';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    // Custom modules
    AuthModule,
    EventModule,
    PaymentModule,
    NotificationModule,
    TokenModule,
  ],
  providers: [RemixService, PrismaService],
  controllers: [RemixController],
  exports: [RemixService],
})
export class RemixModule {}
