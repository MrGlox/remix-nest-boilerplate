import { AppConfig } from './app-config.type';

import { GoogleConfig } from '../../auth/google/config/google-config.type';
import { MailerConfig } from '../../mailer/config/mailer-config.type';
import { StripeConfig } from '../../payment/config/stripe-config.type';

export type AllConfigType = {
  app: AppConfig;
  google: GoogleConfig;
  mailer: MailerConfig;
  stripe: StripeConfig;
};
