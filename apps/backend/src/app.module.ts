import path from 'node:path';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import appConfig from './core/config/app.config';
import mailerConfig from './mailer/config/mailer.config';

import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './core/database/prisma.module';
import { HealthModule } from './core/health/health.module';
import { RemixModule } from './core/remix/remix.module';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, mailerConfig],
      envFilePath: path.resolve(__dirname, '../../../.env'),
    }),
    AuthModule,
    HealthModule,
    PrismaModule,
    RemixModule,
    MailerModule,
  ],
  providers: [],
})
export class AppModule {}
