import React from "react";

import { Input as InputComponent } from "~/components/input";
import { browseByKeyString } from "~/lib/utils";

export interface InputProps<TForm>
  extends React.InputHTMLAttributes<HTMLInputElement> {
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

const Input = React.forwardRef<HTMLInputElement, InputProps<TForm>>(
  ({ data, setData, errors, ...props }, ref) => {
    const error = `${browseByKeyString(errors, props?.name) || ""}`;
    const value = `${browseByKeyString(data, props?.name) || ""}`;

    return (
      <div>
        <InputComponent
          id={props.name}
          value={value}
          onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
            setData(props?.name, e.target.value)
          }
          ref={ref}
          {...props}
        />
        {error && <p className="text-red-700 text-sm">{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
