import { useTranslation } from "react-i18next";

import { Alert } from "~/components/molecules";

export type ErrorsData = {
  errors: string;
};

export const extractErrors = (actionData): ErrorsData => {
  const hasError = actionData?.result.error;
  return { errors: !!hasError && actionData?.result.error };
};

export const generateAlert = (actionData) => {
  if (!actionData) return null;

  const { t } = useTranslation("errors");

  const hasError = actionData?.result.error;
  const alert = {
    type: hasError ? Object.keys(actionData?.result?.error)[0] : "",
    message: hasError ? Object.values(actionData?.result?.error)[0] : "",
  };

  if (hasError && alert?.type?.split(".")[0] === "alert")
    return (
      <Alert
        variant={
          (alert?.type.split(".")[1] || "info") as
            | "default"
            | "destructive"
            | "success"
            | "warning"
            | "info"
        }
      >
        {t(alert.message as string, alert.message as string)}
      </Alert>
    );

  return null;
};
