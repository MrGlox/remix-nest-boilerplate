import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaService } from '../database/prisma.service';
import { TokenModule } from '../token/token.module';

import { EventController } from './event.controller';
import { EventService } from './event.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    // Custom modules
    TokenModule,
  ],
  providers: [EventService, PrismaService],
  controllers: [EventController],
  exports: [EventService],
})
export class EventModule {}
