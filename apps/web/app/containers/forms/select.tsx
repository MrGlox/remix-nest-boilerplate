import React, { ReactNode, Ref } from "react";
import { useTranslation } from "react-i18next";
import { Label } from "~/components/ui/label";

import {
  Select as SelectComponent,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";

type Option = {
  label: string | ReactNode;
  value?: string;
};

export interface SelectProps<TForm>
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  placeholder?: string;
  description?: string;
  className: string;
  options: Option[];
  errors: TForm;
  hideSelected?: boolean;
  noCheck?: boolean;
  fields: Record<string, any>;
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
      label,
      description,
      fields,
      value,
      errors,
      placeholder,
      hideSelected = false,
      noCheck = false,
      options = [],
      currentValue,
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const { name } = props;

    return (
      <fieldset className={cn("mb-4", className)}>
        <Label className="mb-2" htmlFor={name}>
          {t(`fields.${name}`, label)}
        </Label>
        <SelectComponent
          ref={ref as Ref<HTMLSelectElement>}
          id={props.name}
          value={value ? `${value}` : currentValue || ""}
          className={!fields[name]?.valid ? "border-red-700 border-2" : ""}
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
Select.displayName = "Select";

export { Select };
