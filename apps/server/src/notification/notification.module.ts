import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { PrismaModule } from '../core/database/prisma.module';

import { NotificationService } from './notification.service';

@Module({
  imports: [ConfigModule, PrismaModule, EventEmitterModule.forRoot()],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
