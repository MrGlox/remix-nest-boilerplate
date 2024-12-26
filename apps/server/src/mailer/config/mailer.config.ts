import { registerAs } from '@nestjs/config';

import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import validateConfig from '../../core/utils/validate-config';

import { MailerConfig } from './mailer-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  APP_DOMAIN!: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  MAIL_PORT!: number;

  @IsString()
  MAIL_HOST!: string;

  @IsString()
  @IsOptional()
  MAIL_USER!: string;

  @IsString()
  @IsOptional()
  MAIL_PASSWORD!: string;

  @IsEmail()
  MAIL_DEFAULT_EMAIL!: string;

  @IsString()
  MAIL_DEFAULT_NAME!: string;

  @IsBoolean()
  MAIL_IGNORE_TLS!: boolean;

  @IsBoolean()
  MAIL_SECURE!: boolean;

  @IsBoolean()
  MAIL_REQUIRE_TLS!: boolean;
}

export default registerAs<MailerConfig>('mailer', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    port: process.env.MAIL_PORT
      ? Number.parseInt(process.env.MAIL_PORT, 10)
      : 587,
    host: process.env.MAIL_HOST,
    user: process.env.MAIL_USER,
    domain: process.env.APP_DOMAIN,
    password: process.env.MAIL_PASSWORD,
    defaultEmail: process.env.MAIL_DEFAULT_EMAIL,
    defaultName: process.env.MAIL_DEFAULT_NAME,
    ignoreTLS: process.env.MAIL_IGNORE_TLS === 'true',
    secure: process.env.MAIL_SECURE === 'true',
    requireTLS: process.env.MAIL_REQUIRE_TLS === 'true',
  };
});
