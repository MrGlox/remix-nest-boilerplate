import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { PrismaHealthIndicator } from '../database/prisma.health';
import { PrismaService } from '../database/prisma.service';

import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule, HttpModule], // http module is needed for the HttpHealthIndicator
  controllers: [HealthController],
  providers: [PrismaHealthIndicator, PrismaService],
})
export class HealthModule {}
