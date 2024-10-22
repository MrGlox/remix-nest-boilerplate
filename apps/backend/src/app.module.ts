import path from "node:path";
import { Module } from "@nestjs/common";

import authConfig from "./auth/config/auth.config";
import googleConfig from "./auth/google/config/google.config";
import appConfig from "./config/app.config";
import fileConfig from "./files/config/file.config";
import { FilesModule } from "./files/files.module";
import mailConfig from "./mail/config/mail.config";
import { UsersModule } from "./users/users.module";

import { ConfigModule, ConfigService } from "@nestjs/config";
import { HeaderResolver } from "nestjs-i18n";
import { I18nModule } from "nestjs-i18n/dist/i18n.module";

import { AuthController } from "./auth/auth.controller";
import { AuthModule } from "./auth/auth.module";
import { AuthGoogleModule } from "./auth/google/auth-google.module";
import { AllConfigType } from "./config/config.type";
import { PrismaService } from "./database/prisma.service";
import { MailModule } from "./mail/mail.module";
import { MailerModule } from "./mailer/mailer.module";
import { RemixController } from "./remix/remix.controller";
import { RemixService } from "./remix/remix.service";
import { SessionModule } from "./session/session.module";

@Module({
  providers: [PrismaService, RemixService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig, appConfig, mailConfig, fileConfig, googleConfig],
      envFilePath: [".env"],
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        fallbackLanguage: configService.getOrThrow("app.fallbackLanguage", {
          infer: true,
        }),
        loaderOptions: { path: path.join(__dirname, "/i18n/"), watch: true },
      }),
      resolvers: [
        {
          use: HeaderResolver,
          useFactory: (configService: ConfigService<AllConfigType>) => {
            return [
              configService.get("app.headerLanguage", {
                infer: true,
              }),
            ];
          },
          inject: [ConfigService],
        },
      ],
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    UsersModule,
    FilesModule,
    AuthModule,
    AuthGoogleModule,
    SessionModule,
    MailModule,
    MailerModule,
  ],
  controllers: [AuthController, RemixController],
})
export class AppModule {}
