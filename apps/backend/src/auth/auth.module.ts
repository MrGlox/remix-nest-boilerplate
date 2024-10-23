import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { CookieSerializer } from '../core/cookie-serializer';
import { PrismaService } from '../core/database/prisma.service';

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
  controllers: [],
  providers: [
    LocalStrategy,
    LocalAuthGuard,
    CookieSerializer,
    PrismaService,
    AuthService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
