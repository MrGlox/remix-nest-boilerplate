import {
  EmailTemplate,
  TemplateTypeEnum,
} from '../../mailer/core/template.service';

export class EmailConfirmation extends EmailTemplate<{
  firstname: string;
  lastname: string;
}> {
  name = TemplateTypeEnum.emailConfirmation;
}
