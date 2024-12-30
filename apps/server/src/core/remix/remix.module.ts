import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '../../auth/auth.module';
import { PrismaService } from '../database/prisma.service';
import { TokenModule } from '../token/token.module';

import { RemixController } from './remix.controller';
import { RemixService } from './remix.service';

import { OfferModule } from '../../offer/offer.module';
import { PaymentModule } from '../../payment/payment.module';
import { ProfileModule } from '../../profile/profile.module';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    AuthModule,
    PaymentModule,
    ProfileModule,
    OfferModule,
    TokenModule,
  ],
  providers: [RemixService, PrismaService],
  controllers: [RemixController],
  exports: [RemixService],
})
export class RemixModule {}
