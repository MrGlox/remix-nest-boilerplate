export interface Email {
  to: string;
  address: string;
  cc?: string;
  from: string;
  subject: string;
  data: any;
}
