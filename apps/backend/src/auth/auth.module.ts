import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { CookieSerializer } from '../core/cookie-serializer';
import { PrismaService } from '../core/database/prisma.service';
import { MailerService } from '../mailer/mailer.service';

import { TokenService } from 'src/core/token/token.service';
import { TemplateService } from '../mailer/core/template.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local/local.guard';
import { LocalStrategy } from './local/local.strategy';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'local',
      property: 'user',
      session: true,
    }),
  ],
  controllers: [AuthController],
  providers: [
    LocalStrategy,
    LocalAuthGuard,
    CookieSerializer,
    PrismaService,
    AuthService,
    MailerService,
    TemplateService,
    TokenService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
