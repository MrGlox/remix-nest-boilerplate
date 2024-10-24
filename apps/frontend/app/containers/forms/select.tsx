import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import {
  Select as SelectComponent,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { browseByKeyString, cn } from "~/lib/utils";

type Option = {
  label: string | ReactNode;
  value?: string;
};

export interface SelectProps<TForm>
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  placeholder?: string;
  className: string;
  options: Option[];
  errors: TForm;
  hideSelected?: boolean;
  noCheck?: boolean;
  data: TForm;
  setData: SetDataByKeyValuePair<TForm>;
  ref?: React.RefObject<HTMLSelectElement>;
}

type SetDataByKeyValuePair<TForm> = <K extends keyof TForm>(
  key: K,
  value: TForm[K],
) => void;

type TForm = any;

const Select = React.forwardRef<HTMLSelectElement, SelectProps<TForm>>(
  (
    {
      className,
      fields,
      value,
      data,
      setData,
      errors,
      placeholder,
      hideSelected = false,
      noCheck = false,
      options = [],
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation("validations");
    const hasError = !!fields[name]?.errors;
    const currentValue = `${browseByKeyString(data, props?.name) || ""}`;

    return (
      <fieldset className={cn("", className)}>
        <SelectComponent
          ref={ref}
          id={props.name}
          value={value ? `${value}` : currentValue || ""}
          onValueChange={(value) => setData(props?.name, value)}
          className={hasError ? "border-red-700 border-2" : ""}
          {...props}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {options.map(({ label, value }, index) =>
                !value ? (
                  <SelectLabel>{label}</SelectLabel>
                ) : (
                  <SelectItem
                    check={!hideSelected}
                    key={`${value}_${index}`}
                    className={cn(
                      "cursor-pointer",
                      hideSelected && currentValue === value ? "hidden" : "",
                    )}
                    value={value || ""}
                  >
                    {label}
                  </SelectItem>
                ),
              )}
            </SelectGroup>
          </SelectContent>
        </SelectComponent>
        {hasError && (
          <p className="relative -z-10 text-red-700 text-sm bg-destructive/50 pt-3 -mt-2 px-2 pb-2 rounded-b">
            {t(fields[name].errors[0])}
          </p>
        )}
      </fieldset>
    );
  },
);
Select.displayName = "Select";

export { Select };
