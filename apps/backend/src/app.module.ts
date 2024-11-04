import path from 'node:path';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import googleConfig from './auth/google/config/google-config';
import appConfig from './core/config/app.config';
import mailerConfig from './mailer/config/mailer.config';

import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './core/database/prisma.module';
import { HealthModule } from './core/health/health.module';
import { RemixModule } from './core/remix/remix.module';
import { MailerModule } from './mailer/mailer.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, googleConfig, mailerConfig],
      envFilePath: path.resolve(__dirname, '../../../.env'),
    }),
    AuthModule,
    HealthModule,
    PaymentModule,
    PrismaModule,
    RemixModule,
    MailerModule,
  ],
  providers: [],
})
export class AppModule {}
