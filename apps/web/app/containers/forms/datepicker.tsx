import { getInputProps } from "@conform-to/react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { InputHTMLAttributes, Ref, forwardRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

export interface SelectProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  name: string;
  description?: string;
  type?: string;
  fields: Record<string, any>;
}

const Datepicker = forwardRef<HTMLInputElement, SelectProps>(
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
    const [date, setDate] = useState<Date>();

    const fieldProps = getInputProps(fields[name], {
      type,
    });

    const { minLength, maxLength } = fieldProps;

    return (
      <fieldset className={cn("flex flex-col mb-4 min-w-[280px]", className)}>
        <Label className="mb-2" htmlFor={name}>
          {t(`fields.${name}`, label)}
        </Label>
        <Popover {...{ ...props, name }} {...fieldProps}>
          <PopoverTrigger asChild>
            <Button
              ref={ref as Ref<HTMLInputElement>}
              variant="outline"
              onClick={(e) => {
                props.disabled && e.preventDefault();
              }}
              tabIndex={props.disabled ? -1 : 0}
              className={cn(
                "flex-row-reverse justify-between text-left font-normal ",
                !date && "text-muted-foreground",
                !fields[name]?.valid ? "border-red-700 border-2" : "",

                props.disabled &&
                  "cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted hover:text-muted-foreground ",
              )}
            >
              <CalendarIcon className="h-5 w-5" />
              {date ? (
                format(date, "PPP")
              ) : (
                <span>{t(["pick_date", "Pick a date"], { ns: "common" })}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
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
Datepicker.displayName = "Datepicker";

export { Datepicker };
