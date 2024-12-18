import { createHash, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';

import { TokenType } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TokenService {
  constructor(public readonly prisma: PrismaService) {}

  public readonly expireUserTokens = async ({
    userId,
    type,
  }: {
    userId: string;
    type?: TokenType;
  }) =>
    await this.prisma.token.updateMany({
      where: {
        expiresAt: {
          gt: new Date(Date.now()),
        },
        userId,
        ...(type ? { type } : {}),
      },
      data: {
        expiresAt: new Date(Date.now() - 1),
      },
    });

  public readonly expireToken = async ({ token }: { token: string }) =>
    await this.prisma.token.updateMany({
      where: {
        token: token,
      },
      data: {
        expiresAt: new Date(Date.now() - 1),
      },
    });

  public readonly generateVerifyEmailToken = async ({
    userId,
    salt,
  }: {
    userId: string;
    salt: string;
  }) => {
    await this.expireUserTokens({ userId, type: 'VERIFY_EMAIL' });

    const hash = createHash('sha256');
    return await this.prisma.token.create({
      data: {
        userId,
        token: `${hash.update(randomBytes(4).toString('hex') + userId + salt).digest('hex')}`,
        type: 'VERIFY_EMAIL',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });
  };

  public readonly generatePasswordResetToken = async ({
    userId,
    salt,
  }: {
    userId: string;
    salt: string;
  }) => {
    await this.expireUserTokens({ userId, type: 'PASSWORD_RESET' });

    const hash = createHash('sha256');
    return await this.prisma.token.create({
      data: {
        userId,
        token: `${hash.update(randomBytes(4).toString('hex') + userId + salt).digest('hex')}`,
        type: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });
  };

  public readonly getUserToken = async ({
    userId,
    type,
  }: {
    userId: string;
    type: TokenType;
  }) =>
    await this.prisma.token.findFirst({
      where: {
        expiresAt: {
          gt: new Date(Date.now()),
        },
        userId,
        type,
      },
    });

  public readonly verify = async ({
    token,
    type,
  }: {
    token: string;
    type: TokenType;
  }) =>
    !!(await this.prisma.token.findFirst({
      where: {
        expiresAt: {
          gt: new Date(Date.now()),
        },
        token,
        type,
      },
    }));
}
