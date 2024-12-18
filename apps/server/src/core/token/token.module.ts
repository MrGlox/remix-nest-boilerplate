import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '../../auth/auth.module';
import { PrismaService } from '../database/prisma.service';

import { TokenController } from './token.controller';
import { TokenService } from './token.service';

@Module({
  imports: [ConfigModule, AuthModule],
  providers: [TokenService, PrismaService],
  controllers: [TokenController],
  exports: [TokenService],
})
export class TokenModule {}
