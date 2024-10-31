import { getInputProps } from "@conform-to/react";
import { InputHTMLAttributes, Ref, forwardRef } from "react";
import { useTranslation } from "react-i18next";

import { Input as InputComponent } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  name: string;
  type?: string;
  fields: Record<string, any>;
}

const Field = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      name,
      type = "text",
      label = "",
      fields,
      ...props
    }: InputProps,
    ref,
  ) => {
    const { t } = useTranslation("validations");

    const fieldProps = getInputProps(fields[name], {
      type,
    });

    const { minLength, maxLength } = fieldProps;

    return (
      <fieldset className={cn("mb-2", className)}>
        <Label htmlFor={name}>{t(`fields.${name}`, label)}</Label>
        <InputComponent
          className={!fields[name]?.valid ? "border-red-700 border-2" : ""}
          ref={ref as Ref<HTMLInputElement>}
          {...{ ...props, name }}
          {...fieldProps}
        />
        {!fields[name]?.valid && (
          <p className="relative -z-10 text-red-700 text-sm bg-destructive/50 pt-3 -mt-2 px-2 pb-2 rounded-b">
            {t(fields[name].errors[0], {
              value: minLength || maxLength || null,
            })}
          </p>
        )}
      </fieldset>
    );
  },
);
Field.displayName = "Field";

export { Field };
