import * as React from "react";

import { cn } from "~/lib/utils";
import { useFormField } from "./form";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const { error } = useFormField();

    return (
      <input
        {...props}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground",
          error && "border-[2px] border-destructive",
          className,
        )}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
