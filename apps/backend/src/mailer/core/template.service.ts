import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { Injectable } from '@nestjs/common';

import * as Handlebars from 'handlebars';
import mjml from 'mjml';
import { I18nService } from 'nestjs-i18n';

export enum TemplateTypeEnum {
  activation = 'activation',
  emailConfirmation = 'email-confirmation',
  resetPassword = 'reset-password',
}

export type EmailMetadata = {
  subject: string;
};

export abstract class EmailTemplate<T> {
  constructor(public context: T) {}

  public name!: TemplateTypeEnum;

  get data(): T | unknown {
    return this.context;
  }
}

export interface BuiltTemplate {
  html: string;
  metadata: {
    subject: string;
  };
}

// service code
@Injectable()
export class TemplateService {
  constructor(private readonly i18n: I18nService) {}

  async getTemplate<T>({
    name,
    data,
  }: EmailTemplate<T>): Promise<BuiltTemplate> {
    try {
      // pass the template name to produce html template
      const result = await this.getEmailTemplate(name);

      // compile handlebars template
      const template = Handlebars.compile<typeof data>(result.html);

      // build final output with data passed i.e eg : firstname, lastname, etc
      const html = template(data);

      // extract extra info (eg. subject) from the template
      // const metadata = await this.getEmailData(name);

      return { html, metadata: { subject: 'subject' } };
    } catch (error) {
      console.error(`Error reading email template: ${error}`);

      throw new Error(String(error));
    }
  }

  async getEmailTemplate(
    templateName: TemplateTypeEnum,
  ): Promise<ReturnType<typeof mjml>> {
    try {
      const file = await readFile(
        path.resolve(
          __dirname,
          '..',
          '..',
          'mailer',
          'templates',
          `${templateName}.mjml`,
        ),
        'utf8',
      );

      return mjml(file);
    } catch (error) {
      console.error(`Error reading email template: ${error}`);

      throw new Error(String(error));
    }
  }

  async getEmailData(templateName: string): Promise<EmailMetadata> {
    try {
      const contents = await readFile(
        path.resolve(
          __dirname,
          '..',
          '..',
          'mailer',
          'templates',
          `${templateName}.json`,
        ),
        'utf8',
      );

      return JSON.parse(contents);
    } catch (error) {
      console.error(`Error reading email template: ${error}`);

      throw new Error(String(error));
    }
  }
}
