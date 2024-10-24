import { getInputProps } from "@conform-to/react";
import { InputHTMLAttributes, Ref, forwardRef } from "react";
import { useTranslation } from "react-i18next";

import { Input as InputComponent } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  name: string;
  errors?: string[];
}

const Field = forwardRef<InputProps>(
  ({ fields, className, name, type = "text", label = "", ...props }, ref) => {
    const { t } = useTranslation("validations");
    const hasError = !!fields[name]?.errors;

    return (
      <fieldset className={cn("", className)}>
        <Label htmlFor={name}>{t(`fields.${name}`, label)}</Label>
        <InputComponent
          ref={ref as Ref<HTMLInputElement>}
          {...{ ...props, name }}
          {...getInputProps(fields[name], {
            type,
          })}
        />
        {hasError && (
          <p className="text-red-700 text-sm">{t(fields[name].errors[0])}</p>
        )}
      </fieldset>
    );
  },
);
Field.displayName = "Field";

export { Field };
