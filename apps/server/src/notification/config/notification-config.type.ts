export type NotificationConfig = {
  port: number;
  host?: string;
  user?: string;
  domain?: string;
  password?: string;
  defaultEmail?: string;
  defaultName?: string;
  ignoreTLS: boolean;
  secure: boolean;
  requireTLS: boolean;
};
