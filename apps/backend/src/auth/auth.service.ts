import { Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { compare, hash } from 'bcryptjs';

import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '../core/database/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import { EmailConfirmation } from './interfaces/email-confirmation';

const PASSWORD_SALT = 10;

const translationKeys = ['title', 'description', 'cta'];

@Injectable()
export class AuthService {
  constructor(
    private readonly i18n: I18nService,
    private readonly prisma: PrismaService,
    private mailerService: MailerService,
  ) {}

  public async sendEmailConfirmation(email: string) {
    const emailTemplate = new EmailConfirmation(null);

    // const translations = translationKeys.map((key) =>
    //   this.i18n.t('test.HELLO', { lang }),
    // );

    return await this.mailerService.sendMailFromTemplate(emailTemplate, {
      to: email,
    });
  }

  public readonly checkIfUserExists = async ({
    email,
    password,
    withPassword,
  }: {
    email: string;
    withPassword: boolean;
    password: string;
  }) => {
    // Renvoie true si l'utilisateur n'existe pas
    // Renvoie false si l'utilisateur existe

    // 1. Vérifier que l'utilisateur existe sur l'email
    // 2. Si withPassword est activé, on vérifie que son mot de passe est bien défini.
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
      // Rajouter une logique de validation par mot de passez
      const isPasswordValid = await compare(password, existingUser.password);

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
  }: {
    email: string;
    password: string;
  }) => {
    const hashedPassword = await hash(password, PASSWORD_SALT);

    // const languageCookie = this.i18n.();
    const translations = this.i18n.getTranslations();
    // console.log('languageCookie', languageCookie);
    console.log('translations', translations);

    await this.sendEmailConfirmation(email);

    return await this.prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
      },
    });
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
