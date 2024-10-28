import { Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';

import { PrismaService } from '../core/database/prisma.service';
import { TokenService } from '../core/token/token.service';
import { hashWithSalt, verifyPassword } from '../core/utils/crypt';
import { MailerService } from '../mailer/mailer.service';

// const translationKeys = ['title', 'description', 'cta'];

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private mailerService: MailerService,
    private tokenService: TokenService,
  ) {}

  public readonly checkIfUserExists = async ({
    email,
    password,
    withPassword,
  }: {
    email: string;
    withPassword: boolean;
    password: string;
  }) => {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!existingUser) {
      return {
        message: 'invalid_credentials',
        error: true,
      };
    }

    if (withPassword) {
      const [salt, hash] = existingUser.password
        .replace('user_', '')
        .split('.');

      // Rajouter une logique de validation par mot de passez
      const isPasswordValid = await verifyPassword(hash, salt, password);

      if (!isPasswordValid) {
        return {
          message: 'invalid_credentials',
          error: true,
        };
      }
    }

    return {
      message: 'invalid_credentials',
      error: false,
    };
  };

  public readonly createUser = async ({
    email,
    password,
    lang,
  }: {
    email: string;
    password: string;
    lang: string;
  }) => {
    const { hash, salt } = await hashWithSalt(password);

    const user = await this.prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: `user_${salt}.${hash}`,
      },
      select: {
        id: true,
        email: true,
      },
    });

    const { token, ...rest } = await this.tokenService.generateVerifyEmailToken(
      {
        userId: user.id,
      },
    );

    console.log('token', token, rest);

    const url = `${process.env.APP_DOMAIN}/auth/confirm-email?token=${token}`;

    await this.mailerService.sendMailFromTemplate('email-confirmation', {
      to: email,
      data: {
        url,
      },
      lang,
    });

    return user;
  };

  public readonly authenticateUser = async ({ email }: { email: string }) => {
    return await this.prisma.session.create({
      data: {
        user: {
          connect: {
            email,
          },
        },
        sessionToken: createId(),
      },
      select: {
        sessionToken: true,
      },
    });
  };
}
