import { Logger, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { SchedulerService } from './scheduler.service';

import { PrismaModule } from '../database/prisma.module';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, PaymentModule],
  providers: [Logger,  SchedulerService],
})
export class SchedulerModule {}
