// export type EmailData = string | { name?: string; email: string };

export interface Email {
  to: string;
  address: string;
  cc?: string;
  from: string;
  subject: string;
  html: string;
}
