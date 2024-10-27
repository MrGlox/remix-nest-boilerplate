import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import nodemailer from 'nodemailer';

import { AllConfigType } from '../core/config/config.type';

import { EmailTemplate, TemplateService } from './core/template.service';
import { Email } from './mailer.interface';

@Injectable()
export class MailerService {
  private readonly transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly templateService: TemplateService,
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

  async sendMailFromTemplate<T>(
    template: EmailTemplate<T>,
    emailInfo: Partial<Email> & { to: string },
    // settings: sg.MailDataRequired['mailSettings'] = {},
  ) {
    if (!emailInfo.to.length) {
      throw new Error('No recipient found');
    }

    const { html, metadata } = await this.templateService.getTemplate(template);

    return this.transporter.sendMail({
      ...emailInfo,
      ...metadata,
      from: emailInfo.from
        ? emailInfo.from
        : `"${this.configService.get('mailer.defaultName', {
            infer: true,
          })}" <${this.configService.get('mailer.defaultEmail', {
            infer: true,
          })}>`,
      html: emailInfo.html ? emailInfo.html : html,
    });
  }
}
