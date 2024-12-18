import path from 'node:path';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import googleConfig from './auth/google/config/google.config';
import appConfig from './core/config/app.config';
import mailerConfig from './mailer/config/mailer.config';
import stripeConfig from './payment/config/stripe.config';

import { PrismaModule } from './core/database/prisma.module';
import { HealthModule } from './core/health/health.module';
import { RemixModule } from './core/remix/remix.module';

import { AuthModule } from './auth/auth.module';
import { MailerModule } from './mailer/mailer.module';
import { PaymentModule } from './payment/payment.module';
// import { CmsModule } from './cms/cms.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, googleConfig, mailerConfig, stripeConfig],
      envFilePath: path.resolve(__dirname, '../../../.env'),
    }),
    AuthModule,
    // CmsModule,
    HealthModule,
    PaymentModule,
    PrismaModule,
    RemixModule,
    MailerModule,
  ],
  providers: [],
})
export class AppModule {}
