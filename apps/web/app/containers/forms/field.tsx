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
  description?: string;
  fields: Record<string, any>;
}

const Field = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      name,
      type = "text",
      label = "",
      description,
      fields,
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation("validations");

    const fieldProps = getInputProps(fields[name], {
      type,
    });

    const { minLength, maxLength } = fieldProps;

    return (
      <fieldset className={cn("mb-4", className)}>
        <Label className="mb-2" htmlFor={name}>
          {t(`fields.${name}`, label)}
        </Label>
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
        {description && (
          <p
            className={cn(
              "text-sm text-muted-foreground mt-2",
              !fields[name]?.valid ? "mt-2" : "",
            )}
          >
            {description}
          </p>
        )}
      </fieldset>
    );
  },
);
Field.displayName = "Field";

export { Field };
