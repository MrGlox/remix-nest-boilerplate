import { useTranslation } from "react-i18next";

import { Alert } from "~/components/molecules";

export type ErrorsData = {
  errors: string;
};

export const extractErrors = (actionData): ErrorsData => {
  const hasError = actionData?.result.error;
  return { errors: !!hasError && actionData?.result.error };
};

export const generateAlert = (actionData, namespace = "alerts") => {
  const { t } = useTranslation(namespace);

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
        {t(alert.message as string, {
          defaultValue: alert.message,
        })}
      </Alert>
    );

  return null;
};

export const generateFlash = (
  loaderData: { message?: string; type?: string },
  namespace = "alerts",
) => {
  const { t } = useTranslation(namespace);

  if (loaderData)
    return (
      <Alert
        variant={
          (loaderData.type || "info") as
            | "default"
            | "destructive"
            | "success"
            | "warning"
            | "info"
        }
      >
        {t(loaderData.message as string, {
          defaultValue: loaderData.message,
        })}
      </Alert>
    );

  return null;
};
