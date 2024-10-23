import {
  CheckCircledIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import { HTMLAttributes, forwardRef } from "react";
import { useTranslation } from "react-i18next";

import {
  Alert as AlertComponent,
  AlertDescription,
  AlertTitle,
} from "~/components/ui/alert";
import { cn } from "~/lib/utils";

export enum AlertVariant {
  default = "default",
  destructive = "destructive",
  success = "success",
  warning = "warning",
  info = "info",
}

const IconVariants = {
  default: <InfoCircledIcon className="size-4 !text-current" />,
  destructive: <CrossCircledIcon className="size-4 !text-current" />,
  success: <CheckCircledIcon className="size-4 !text-current" />,
  warning: <ExclamationTriangleIcon className="size-4 !text-current" />,
  info: <InfoCircledIcon className="size-4 !text-current" />,
};

const Alert = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { variant?: keyof typeof AlertVariant }
>(
  (
    { className, variant = "default", children, title = false, ...props },
    ref,
  ) => {
    const { t } = useTranslation();

    return (
      <AlertComponent
        {...{ ...props, ref, variant }}
        className={cn("mb-4", className)}
      >
        {IconVariants[variant]}
        {title && (
          <AlertTitle>
            {t(
              variant as
                | "default"
                | "destructive"
                | "success"
                | "warning"
                | "info",
              typeof title === "string" ? title : "",
            )}
          </AlertTitle>
        )}
        <AlertDescription>{children}</AlertDescription>
      </AlertComponent>
    );
  },
);
Alert.displayName = "Alert";

export { Alert };
