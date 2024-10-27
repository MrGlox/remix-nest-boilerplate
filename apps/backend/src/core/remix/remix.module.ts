import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '../../auth/auth.module';
import { PrismaService } from '../database/prisma.service';
import { RemixController } from './remix.controller';
import { RemixService } from './remix.service';

@Module({
  imports: [ConfigModule, AuthModule],
  providers: [RemixService, PrismaService],
  controllers: [RemixController],
  exports: [RemixService],
})
export class RemixModule {}
