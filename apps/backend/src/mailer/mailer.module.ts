import { Module } from '@nestjs/common';

import { TemplateService } from './core/template.service';
import { MailerService } from './mailer.service';

@Module({
  providers: [MailerService, TemplateService],
  exports: [MailerService, TemplateService],
})
export class MailerModule {}
