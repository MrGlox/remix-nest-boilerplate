// import path from 'node:path';

// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';

// import { MailData } from './interfaces/mail-data.interface';
// import { TemplateService } from './template.service';

// import { AllConfigType } from '../core/config/config.type';
// import { MailerService } from '../mailer/mailer.service';

// @Injectable()
// export class MailNotificationService {
//   constructor(
//     private readonly mailerService: MailerService,
//     private readonly configService: ConfigService<AllConfigType>,
//     private readonly templateService: TemplateService,
//   ) {}

//   async userSignUp(mailData: MailData<{ hash: string }>): Promise<void> {
//     // const url = new URL(
//     //   this.configService.getOrThrow('app.frontendDomain', {
//     //     infer: true,
//     //   }) + '/confirm-email',
//     // );
//     // url.searchParams.set('hash', mailData.data.hash);

//     await this.mailerService.sendMailFromTemplate({
//       to: mailData.to,
//       subject: 'test',
//       text: `test`,
//       // text: `${url.toString()} test`,
//       templatePath: await this.templateService.getTemplate('emailConfirmation'), // template name
//       context: {
//         title: 'test',
//         // url: url.toString(),
//         actionTitle: 'test',
//         app_name: this.configService.get('app.name', { infer: true }),
//       },
//     });
//   }

//   async forgotPassword(
//     mailData: MailData<{ hash: string; tokenExpires: number }>,
//   ): Promise<void> {
//     const url = new URL(
//       this.configService.getOrThrow('app.frontendDomain', {
//         infer: true,
//       }) + '/password-change',
//     );
//     url.searchParams.set('hash', mailData.data.hash);
//     url.searchParams.set('expires', mailData.data.tokenExpires.toString());

//     await this.mailerService.sendMailFromTemplate({
//       to: mailData.to,
//       subject: 'test',
//       text: `${url.toString()} test`,
//       templatePath: path.join(
//         this.configService.getOrThrow('app.workingDirectory', {
//           infer: true,
//         }),
//         'src',
//         'mail',
//         'mail-templates',
//         'reset-password.hbs',
//       ),
//       context: {
//         title: 'test',
//         url: url.toString(),
//         actionTitle: 'test',
//         app_name: this.configService.get('app.name', {
//           infer: true,
//         }),
//       },
//     });
//   }

//   async confirmNewEmail(mailData: MailData<{ hash: string }>): Promise<void> {
//     const url = new URL(
//       this.configService.getOrThrow('app.frontendDomain', {
//         infer: true,
//       }) + '/confirm-new-email',
//     );
//     url.searchParams.set('hash', mailData.data.hash);

//     await this.mailerService.sendMailFromTemplate({
//       to: mailData.to,
//       subject: 'test',
//       text: `${url.toString()} test`,
//       templatePath: path.join(
//         this.configService.getOrThrow('app.workingDirectory', {
//           infer: true,
//         }),
//         'src',
//         'mail',
//         'mail-templates',
//         'confirm-new-email.hbs',
//       ),
//       context: {
//         title: 'test',
//         url: url.toString(),
//         actionTitle: 'test',
//         app_name: this.configService.get('app.name', { infer: true }),
//       },
//     });
//   }
// }
