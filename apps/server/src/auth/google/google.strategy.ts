import crypto from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { IStrategyOptions } from 'passport-local';

import { AllConfigType } from '../../core/config/config.type';
import { PrismaService } from '../../core/database/prisma.service';
import { hashWithSalt } from '../../core/utils/crypt';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService<AllConfigType>,
    private readonly prisma: PrismaService,
  ) {
    super({
      clientID: configService.get('google.clientID', { infer: true }),
      clientSecret: configService.get('google.clientSecret', { infer: true }),
      callbackURL: configService.get('google.callbackURL', { infer: true }),
      accessType: 'offline',
      display: 'page',
      prompt: 'consent',
      scope: ['email', 'profile'],
    } as IStrategyOptions);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, emails } = profile;
    const email = emails[0].value;

    let user = await this.prisma.user.findUnique({ where: { email } });

    const { hash, salt } = await hashWithSalt(
      crypto.randomBytes(16).toString('hex'),
    );

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          password: `user_${salt}.${hash}`, // Google users don't have a password so we generate a random one
          googleId: id,
        },
      });
    }

    await this.prisma.token.create({
      data: {
        userId: user.id,
        token: accessToken,
        type: 'ACCESS',
        expiresAt: new Date(Date.now() + 2),
      },
    });

    done(null, user);
  }
}
