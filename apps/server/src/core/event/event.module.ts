import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaService } from '../database/prisma.service';
import { TokenModule } from '../token/token.module';

import { EventController } from './event.controller';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    // Custom modules
    TokenModule,
  ],
  providers: [PrismaService],
  controllers: [EventController],
  exports: [],
})
export class EventModule {}
