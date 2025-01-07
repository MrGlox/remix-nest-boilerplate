import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { createId } from "@paralleldrive/cuid2";
import { AllConfigType } from "../core/config/config.type";
import { PrismaService } from "../core/database/prisma.service";
import { TokenService } from "../core/token/token.service";
import { hashWithSalt, verifyPassword } from "../core/utils/crypt";
import { MailerService } from "../mailer/mailer.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private config: ConfigService<AllConfigType>,
    private mailer: MailerService,
    private token: TokenService,
  ) {}

  public readonly checkIfUserExists = async ({
    email,
    password,
    withPassword = false,
  }: {
    email: string;
    withPassword: boolean;
    password?: string;
  }): Promise<{ message: string; error: boolean }> => {
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
        message: "invalid_credentials",
        error: true,
      };
    }

    if (withPassword && password) {
      const [salt, hash] = existingUser.password
        .replace("user_", "")
        .split(".");

      // Rajouter une logique de validation par mot de passez
      const isPasswordValid = await verifyPassword(hash, salt, password);

      if (!isPasswordValid) {
        return {
          message: "invalid_credentials",
          error: true,
        };
      }
    }

    return {
      message: "invalid_credentials",
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
    lang?: string;
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
        preferredLocale: true,
      },
    });

    const { token } = await this.token.generateVerifyEmailToken({
      userId: user.id,
      salt,
    });

    await this.mailer.sendMail({
      template: "confirm-email",
      lang: lang || user.preferredLocale,
      to: email,
      data: {
        url: `${process.env.APP_DOMAIN}/confirm-email?token=${token}`,
      },
    });

    return user;
  };

  public readonly authenticateUser = async ({ email }: { email: string }) => {
    // Clear all existing sessions
    await this.prisma.session.deleteMany({
      where: {
        user: {
          email,
        },
      },
    })

    const session = await this.prisma.session.create({
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

    return session;
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
        message: "invalid_email_token",
        error: true,
      };
    }

    await this.token.expireToken({
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
      message: "email_confirmed",
    };
  };

  public readonly forgotPassword = async ({
    email,
    lang,
  }: {
    email: string;
    lang?: string;
  }) => {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        password: true,
        preferredLocale: true,
        pseudo: true,
        profile: true,
      },
    });

    // return early success if user does not exist to prevent email enumeration
    if (!user) {
      return {
        message: "if_user_exists_mail_received",
      };
    }

    const [salt] = user.password.replace("user_", "").split(".");

    const { token } = await this.token.generatePasswordResetToken({
      userId: user.id,
      salt,
    });

    const formattedDate = new Intl.DateTimeFormat(lang, {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date());

    await this.mailer.sendMail({
      template: "forgot-password",
      to: email,
      lang: lang || user.preferredLocale,
      data: {
        formattedDate,
        pseudo: user.pseudo || user.profile?.firstName,
        url: `${process.env.APP_DOMAIN}/change-password?token=${token}`,
      },
    });

    return {
      message: "if_user_exists_mail_recieved",
    };
  };

  public readonly changePassword = async ({
    token,
    password,
    lang,
  }: {
    token: string;
    password: string;
    lang?: string;
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
        message: "invalid_token",
        error: false,
      };
    }

    await this.token.expireToken({
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

    await this.mailer.sendMail({
      template: "password-changed",
      to: retrivedUser.email,
      data: {
        url: `${process.env.APP_DOMAIN}/login`,
      },
      lang: lang || retrivedUser.preferredLocale,
    });

    return {
      message: "password_changed",
    };
  };

  public readonly refreshAccessToken = async (
    userId: string,
  ): Promise<void> => {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    const refreshToken = await this.prisma.token.findFirst({
      where: {
        userId: userId,
        type: "REFRESH",
      },
    });

    if (!user || refreshToken) {
      throw new Error("Refresh token not found");
    }

    const response = await this.httpService.post(
      "https://oauth2.googleapis.com/token",
      {
        client_id: this.config.get("google.clientID", { infer: true }),
        client_secret: this.config.get("google.clientSecret", {
          infer: true,
        }),
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      },
    );

    // const newAccessToken = response?.data?.access_token ;
    // const newAccessToken = response;
    // console.log('response', response);

    // await this.prisma.token.create({
    //   data: {
    //     userId,
    //     type: 'ACCESS',
    //     token: newAccessToken || '',
    //     expiresAt: new Date(),
    //   },
    // });

    // return newAccessToken;
  };

  public readonly getSessionToken = async (userId: string): Promise<string> => {
    const session = await this.prisma.session.findFirst({
      where: {
        userId,
      },
      select: {
        sessionToken: true,
      },
    });

    return session?.sessionToken || "";
  }
}
