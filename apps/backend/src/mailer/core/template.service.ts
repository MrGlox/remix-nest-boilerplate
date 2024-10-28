import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { Injectable } from '@nestjs/common';

import * as Handlebars from 'handlebars';
import mjml from 'mjml';

export type TemplateType =
  | 'activation'
  | 'email-confirmation'
  | 'reset-password';

export type EmailMetadata = {
  subject: string;
};

export abstract class EmailTemplate<T> {
  constructor(public context: T) {}

  public name!: TemplateType;

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

@Injectable()
export class TemplateService {
  async getTemplate<T>({
    name,
    data = {},
  }: EmailTemplate<T>): Promise<BuiltTemplate> {
    try {
      const result = await this.getEmailTemplate(name);
      const template = Handlebars.compile<typeof data>(result.html);

      const metadata = await this.getEmailData(
        name,
        (data as { lang: string }).lang || 'en',
      );

      const html = template({ ...metadata, ...(data || {}) });

      return { html, metadata };
    } catch (error) {
      console.error(`Error reading email template: ${error}`);
      throw new Error(String(error));
    }
  }

  async getEmailTemplate(
    templateName: TemplateType,
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

  async getEmailData(
    templateName: TemplateType,
    lang: string,
  ): Promise<EmailMetadata> {
    try {
      const contents = await readFile(
        path.resolve(
          __dirname,
          '..',
          '..',
          'core',
          'locales',
          lang,
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
