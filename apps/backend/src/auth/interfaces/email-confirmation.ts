import {
  EmailTemplate,
  TemplateTypeEnum,
} from '../../mailer/core/template.service';

export class EmailConfirmation extends EmailTemplate<any> {
  name = TemplateTypeEnum.emailConfirmation;
}
