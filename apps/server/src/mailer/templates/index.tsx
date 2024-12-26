import React from 'react';

import { ConfirmEmail } from './confirm-email';
import { ForgotPassword } from './forgot-password';
import { PasswordChanged } from './password-changed';

export type TemplateType =
  | 'confirm-email'
  | 'forgot-password'
  | 'password-changed';

export const Templates: {
  [key in TemplateType]: (...args: any[]) => React.JSX.Element;
} = {
  'confirm-email': (props) => <ConfirmEmail {...props} />,
  'forgot-password': (props) => <ForgotPassword {...props} />,
  'password-changed': (props) => <PasswordChanged {...props} />,
};
