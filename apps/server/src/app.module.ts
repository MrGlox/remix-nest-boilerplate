import path, { join } from 'node:path';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';

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
import { ProfileModule } from './profile/profile.module';
// import { CmsModule } from './cms/cms.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, googleConfig, mailerConfig, stripeConfig],
      envFilePath: path.resolve(__dirname, '../../../.env'),
    }),
    I18nModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.getOrThrow('app.fallbackLanguage'),
        loaderOptions: {
          path: join(__dirname, '/core/locales/'),
          watch: true,
        },
      }),
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
    }),
    AuthModule,
    // CmsModule,
    HealthModule,
    PaymentModule,
    PrismaModule,
    ProfileModule,
    RemixModule,
    MailerModule,
  ],
  providers: [],
})
export class AppModule {}
