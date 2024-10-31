import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';

import { TokenType } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TokenService {
  constructor(public readonly prisma: PrismaService) {}

  public readonly expireTokens = async ({
    userId,
    type,
  }: {
    userId: string;
    type?: TokenType;
  }) =>
    await this.prisma.token.updateMany({
      where: {
        userId,
        ...(type ? { type } : {}),
      },
      data: {
        expiresAt: new Date(Date.now()),
      },
    });

  public readonly generateVerifyEmailToken = async ({
    userId,
    salt,
  }: {
    userId: string;
    salt: string;
  }) => {
    this.expireTokens({ userId, type: 'VERIFY_EMAIL' });

    const hash = createHash('sha256');
    return await this.prisma.token.create({
      data: {
        userId,
        token: hash.update(userId + salt).digest('hex'),
        type: 'VERIFY_EMAIL', // or any appropriate type
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // example: 24 hours from now
      },
    });
  };

  public readonly generatePasswordResetToken = async ({
    userId,
  }: {
    userId: string;
  }) => {
    this.expireTokens({ userId, type: 'PASSWORD_RESET' });

    const hash = createHash('sha256');
    return await this.prisma.token.create({
      data: {
        userId,
        token: hash.update(userId).digest('hex'),
        type: 'PASSWORD_RESET', // or any appropriate type
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // example: 24 hours from now
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