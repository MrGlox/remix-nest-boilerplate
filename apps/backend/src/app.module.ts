import path from 'node:path';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';

import { AuthModule } from './auth/auth.module';
import appConfig from './core/config/app.config';
import { PrismaModule } from './core/database/prisma.module';
import { HealthModule } from './core/health/health.module';
import { RemixModule } from './core/remix/remix.module';
import mailerConfig from './mailer/config/mailer.config';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, mailerConfig],
      envFilePath: path.resolve(__dirname, '../../../.env'),
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.getOrThrow('APP_FALLBACK_LANGUAGE'),
        fallbacks: {
          'en-*': 'en',
          'fr-*': 'fr',
        },
        loaderOptions: {
          path: path.join(__dirname, 'core', 'locales'),
          watch: true,
        },
      }),
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['_i18n']),
      ],
      inject: [ConfigService],
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
