import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import nodemailer from 'nodemailer';

import { AllConfigType } from '../core/config/config.type';

import {
  EmailTemplate,
  TemplateService,
  TemplateType,
} from './core/template.service';
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

  public readonly sendMailFromTemplate = async (
    template: TemplateType,
    emailInfo: Partial<Email> & { to: string; lang?: string },
    // settings: sg.MailDataRequired['mailSettings'] = {},
  ) => {
    if (!emailInfo.to.length) {
      throw new Error('No recipient found');
    }

    const { data, ...rest } = emailInfo;
    const { html, metadata } = await this.templateService.getTemplate({
      name: template,
      data: { ...data, ...rest },
    } as EmailTemplate<any>);

    return this.transporter.sendMail({
      ...metadata,
      to: emailInfo.to,
      from: emailInfo.from
        ? emailInfo.from
        : `"${this.configService.get('mailer.defaultName', {
            infer: true,
          })}" <${this.configService.get('mailer.defaultEmail', {
            infer: true,
          })}>`,
      html,
    });
  };
}
