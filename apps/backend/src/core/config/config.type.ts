import { MailerConfig } from '../../mailer/config/mailer-config.type';

import { AppConfig } from './app-config.type';

export type AllConfigType = {
  app: AppConfig;
  mailer: MailerConfig;
};
