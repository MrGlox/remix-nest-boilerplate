import React, { ReactNode } from "react";
import {
  Select as SelectComponent,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/select";
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
    const error = `${browseByKeyString(errors, props?.name) || ""}`;
    const currentValue = `${browseByKeyString(data, props?.name) || ""}`;

    return (
      <div className={className}>
        <SelectComponent
          ref={ref}
          id={props.name}
          value={value ? `${value}` : currentValue || ""}
          onValueChange={(value) => setData(props?.name, value)}
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
        {error && <p className="text-red-700 text-sm">{error}</p>}
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select };
