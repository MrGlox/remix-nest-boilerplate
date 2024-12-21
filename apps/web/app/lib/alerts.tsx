import { Alert } from "~/components/molecules";

export type ErrorsData = {
  errors: string;
};

export const extractErrors = (actionData): ErrorsData => {
  const hasError = actionData?.error;
  return { errors: !!hasError && actionData?.error };
};

export const generateAlert = ({
  t,
  actionData,
  namespace = "alerts",
}: {
  t: (key: string, options?: { ns; defaultValue: string }) => string;
  actionData: { error?: boolean; path?: string; message?: string };
  namespace?: string;
}) => {
  if (!t) return null;

  const hasError = actionData?.error;

  const alert = {
    type: actionData?.path || "",
    message: actionData?.message || "",
  };

  if (hasError || alert?.type?.[0] === "alert")
    return (
      <Alert
        variant={
          (alert?.type?.[1] || "info") as
            | "default"
            | "destructive"
            | "success"
            | "warning"
            | "info"
        }
      >
        {t(alert.message as string, {
          ns: namespace,
          defaultValue: alert.message || "",
        })}
      </Alert>
    );

  return null;
};

export const generateFlash = ({
  t,
  loaderData,
  namespace = "alerts",
}: {
  t: (key: string, options?: { ns; defaultValue: string }) => string;
  loaderData: { message?: string; type?: string };
  namespace?: string;
}) => {
  if (!t) return null;

  if (loaderData.message)
    return (
      <Alert
        variant={
          (loaderData.message[1] || "info") as
            | "default"
            | "destructive"
            | "success"
            | "warning"
            | "info"
        }
      >
        {t(loaderData.message as string, {
          ns: namespace,
          defaultValue: loaderData.message[0] || "",
        })}
      </Alert>
    );

  return null;
};
