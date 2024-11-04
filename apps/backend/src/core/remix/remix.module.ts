import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '../../auth/auth.module';
import { PrismaService } from '../database/prisma.service';
import { TokenModule } from '../token/token.module';

import { RemixController } from './remix.controller';
import { RemixService } from './remix.service';

import { OfferModule } from '../../offer/offer.module';
import { OfferService } from '../../offer/offer.service';

@Module({
  imports: [ConfigModule, HttpModule, AuthModule, OfferModule, TokenModule],
  providers: [RemixService, PrismaService, OfferService],
  controllers: [RemixController],
  exports: [RemixService],
})
export class RemixModule {}
