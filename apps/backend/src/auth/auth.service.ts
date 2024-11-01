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
        url: `${process.env.APP_DOMAIN}/confirm-email?token=${token}`,
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

  public readonly confirmEmail = async ({ token }: { token: string }) => {
    const retrivedUser = await this.prisma.token
      .findFirst({
        where: {
          token,
        },
      })
      .user();

    if (!retrivedUser) {
      return {
        message: 'invalid_email_token',
        error: true,
      };
    }

    await this.tokenService.expireToken({
      token,
    });

    await this.prisma.user.update({
      where: {
        id: retrivedUser.id,
      },
      data: {
        active: true,
      },
    });

    return {
      message: 'email_confirmed',
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
        password: true,
        preferredLocale: true,
      },
    });

    // return early success if user does not exist to prevent email enumeration
    if (!user) {
      return {
        message: 'if_user_exists_mail_recieved',
      };
    }

    const [salt] = user.password.replace('user_', '').split('.');

    const { token } = await this.tokenService.generatePasswordResetToken({
      userId: user.id,
      salt,
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
    const retrivedUser = await this.prisma.token
      .findFirst({
        where: {
          token,
        },
      })
      .user();

    if (!retrivedUser) {
      return {
        message: 'invalid_token',
        error: false,
      };
    }

    await this.tokenService.expireToken({
      token,
    });

    const { hash, salt } = await hashWithSalt(password);

    await this.prisma.user.update({
      where: {
        id: retrivedUser.id,
      },
      data: {
        password: `user_${salt}.${hash}`,
      },
    });

    await this.mailerService.sendMailFromTemplate('change-password', {
      to: retrivedUser.email,
      lang: retrivedUser.preferredLocale || 'en',
    });

    return {
      message: 'password_changed',
    };
  };
}
