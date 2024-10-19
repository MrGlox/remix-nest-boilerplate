import { getInputProps } from "@conform-to/react";
import React from "react";
import { useTranslation } from "react-i18next";

import { Input as InputComponent } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
// import { browseByKeyString } from "~/lib/utils";

export interface InputProps<TForm>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  name: string;
  errors: TForm;
  data: TForm;
  setData: SetDataByKeyValuePair<TForm>;
}

type SetDataByKeyValuePair<TForm> = <K extends keyof TForm>(
  key: K,
  value: TForm[K],
) => void;

type TForm = any;

const Field = React.forwardRef<HTMLInputElement, InputProps<TForm>>(
  ({ fields, className, name, type = "text", label, ...props }, ref) => {
    const { t } = useTranslation("validations");

    return (
      <fieldset className={cn("", className)}>
        <Label htmlFor={name}>{t(`fields.${name}`, label)}</Label>
        <InputComponent
          ref={ref}
          {...props}
          {...getInputProps(fields[name], {
            type,
          })}
        />
        {fields[name]?.errors && (
          <p className="text-red-700 text-sm">{t(fields[name].errors[0])}</p>
        )}
      </fieldset>
    );
  },
);
Field.displayName = "Field";

export { Field };
