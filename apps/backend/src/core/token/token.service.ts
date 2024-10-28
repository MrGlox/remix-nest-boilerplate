import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TokenService {
  constructor(public readonly prisma: PrismaService) {}

  generateVerifyEmailToken = async ({ userId }: { userId: string }) => {
    const hash = createHash('sha256');

    return await this.prisma.token.create({
      data: {
        userId,
        token: hash.update(userId).digest('hex'),
        type: 'VERIFY_EMAIL', // or any appropriate type
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // example: 24 hours from now
      },
    });
  };

  getToken = async ({ token }: { token: string }) => {
    return await this.prisma.token.findUnique({
      where: {
        token,
      },
    });
  };

  deleteToken = async ({ token }: { token: string }) => {
    return await this.prisma.token.delete({
      where: {
        token,
      },
    });
  };
}
