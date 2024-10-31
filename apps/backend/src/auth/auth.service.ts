import { Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';

import { PrismaService } from '../core/database/prisma.service';
import { TokenService } from '../core/token/token.service';
import { hashWithSalt, verifyPassword } from '../core/utils/crypt';
import { MailerService } from '../mailer/mailer.service';

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

  public readonly forgotPassword = async ({ email }: { email: string }) => {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        preferredLocale: true,
      },
    });

    // return early success if user does not exist to prevent email enumeration
    if (!user) {
      return {
        message: 'if_user_exists_mail_recieved',
      };
    }

    const { token } = await this.tokenService.generatePasswordResetToken({
      userId: user.id,
    });

    await this.mailerService.sendMailFromTemplate('forgot-password', {
      to: email,
      data: {
        url: `${process.env.APP_DOMAIN}/change-password?token=${token}`,
      },
      lang: user.preferredLocale || 'en',
    });

    return {
      message: 'if_user_exists_mail_recieved',
    };
  };

  public readonly changePassword = async ({
    token,
    password,
  }: {
    token: string;
    password: string;
  }) => {
    const retrivedToken = await this.prisma.token.findFirst({
      where: {
        token,
      },
      select: {
        userId: true,
      },
    });

    if (!retrivedToken) {
      return {
        message: 'invalid_token',
        error: false,
      };
    }

    const existingUser = await this.prisma.user.findUnique({
      where: {
        id: retrivedToken.userId,
      },
    });

    if (!existingUser) {
      return {
        message: 'invalid_credentials',
        error: true,
      };
    }

    const { hash, salt } = await hashWithSalt(password);

    await this.prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        password: `user_${salt}.${hash}`,
      },
    });

    await this.mailerService.sendMailFromTemplate('change-password', {
      to: existingUser.email,
      lang: existingUser.preferredLocale || 'en',
    });

    await this.tokenService.expireTokens({
      userId: existingUser.id,
      type: 'PASSWORD_RESET',
    });

    return {
      message: 'password_changed',
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

    const { token } = await this.tokenService.generateVerifyEmailToken({
      userId: user.id,
      salt,
    });

    await this.mailerService.sendMailFromTemplate('email-confirmation', {
      to: email,
      data: {
        url: `${process.env.APP_DOMAIN}/auth/confirm-email?token=${token}`,
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
