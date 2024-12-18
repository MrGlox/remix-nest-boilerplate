import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TemplateService } from './template.service';

@Module({
  imports: [ConfigModule],
  providers: [TemplateService],
})
export class MailModule {}
