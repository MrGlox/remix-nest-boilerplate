import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from '../core/database/prisma.module';
import { EventModule } from '../core/event/event.module';

import { NotificationService } from './notification.service';

@Module({
  imports: [ConfigModule, PrismaModule, EventModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
