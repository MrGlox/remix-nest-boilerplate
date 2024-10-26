import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import appConfig from './core/config/app.config';
import mailConfig from './mail/config/mail.config';

import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './core/database/prisma.service';
import { RemixController } from './core/remix/remix.controller';
import { RemixService } from './core/remix/remix.service';
import { MailModule } from './mail/mail.module';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, mailConfig],
      envFilePath: ['.env'],
    }),
    AuthModule,
    MailModule,
    MailerModule,
  ],
  controllers: [AuthController, RemixController],
  providers: [ConfigService, PrismaService, RemixService],
})
export class AppModule {}
