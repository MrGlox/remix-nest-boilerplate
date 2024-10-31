import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '../../auth/auth.module';
import { PrismaService } from '../database/prisma.service';
import { TokenModule } from '../token/token.module';

import { RemixController } from './remix.controller';
import { RemixService } from './remix.service';

@Module({
  imports: [ConfigModule, AuthModule, TokenModule],
  providers: [RemixService, PrismaService],
  controllers: [RemixController],
  exports: [RemixService],
})
export class RemixModule {}
