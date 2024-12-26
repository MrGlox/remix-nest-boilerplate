import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { render } from '@react-email/render';
import nodemailer from 'nodemailer';

import { AllConfigType } from '../core/config/config.type';

import { I18nService } from 'nestjs-i18n';
import { kebabize } from 'src/core/utils/kebabize';
import { TemplateType, Templates } from './templates';

interface SendMailConfiguration {
  from?: string;
  template: any;
  to: string;
  lang?: string;
  text?: string;
  data?: any;
}

@Injectable()
export class MailerService {
  private readonly transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly i18n: I18nService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: configService.get('mailer.host', { infer: true }),
      port: configService.get('mailer.port', { infer: true }),
      ignoreTLS: configService.get('mailer.ignoreTLS', { infer: true }),
      secure: configService.get('mailer.secure', { infer: true }),
      requireTLS: configService.get('mailer.requireTLS', { infer: true }),
      auth: {
        user: configService.get('mailer.user', { infer: true }),
        pass: configService.get('mailer.password', { infer: true }),
      },
    });
  }

  async generateEmail(template: TemplateType, data: any) {
    return await render(
      Templates[kebabize(`${template}`) as keyof typeof Templates](data),
    );
  }

  async sendMail({ from, to, template, data, lang }: SendMailConfiguration) {
    const translations: { subject: string; [key: string]: any } =
      await this.i18n.translate(template, {
        lang: lang || 'en',
        args: data,
      });

    const html = await this.generateEmail(template, {
      ...(typeof translations === 'object' ? translations : {}),
      ...data,
    });

    await this.transporter.sendMail({
      to: to,
      from: from
        ? from
        : `"${this.configService.get('mailer.defaultName', {
            infer: true,
          })}" <${this.configService.get('mailer.defaultEmail', {
            infer: true,
          })}>`,
      subject: translations?.subject,
      html,
    });
  }
}
