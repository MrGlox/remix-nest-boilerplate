import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import * as React from "react";

import { useTranslation } from "react-i18next";
import {
  Alert as AlertComponent,
  AlertTitle,
  AlertDescription,
} from "~/components/ui/alert";
import { cn } from "~/lib/utils";

enum AlertVariant {
  default,
  destructive,
  success,
  warning,
  info,
}

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: keyof typeof AlertVariant }
>(({ className, variant = "info", children, ...props }, ref) => {
  const { t } = useTranslation("common");

  return (
    <AlertComponent
      {...{ ...props, ref, variant }}
      className={cn("mb-4", className)}
    >
      {variant === "destructive" && (
        <>
          <ExclamationTriangleIcon className="size-4 text-current" />
          <AlertTitle>{t("error")}</AlertTitle>
        </>
      )}
      <AlertDescription>{children}</AlertDescription>
    </AlertComponent>
  );
});
Alert.displayName = "Alert";

export { Alert };
