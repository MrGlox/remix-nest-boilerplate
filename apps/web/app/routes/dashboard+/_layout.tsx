import { useEffect } from "react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
  useActionData,
} from "react-router";
import { Outlet, useLoaderData } from "react-router";
import { useRemixForm } from "remix-hook-form";
import { useEventSource } from "remix-utils/sse/react";

import { DashboardFooter } from "~/containers/dashboard/footer";
import { DashboardHeader } from "~/containers/dashboard/header";
import i18next from "~/modules/i18n.server";
import { getOptionalUser } from "~/server/auth.server";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const t = await i18next.getFixedT(request, "dashboard");
  const user = await getOptionalUser({ context });

  if (!user) {
    return redirect("/signin");
  }

  const notifications =
    await context.remixService.notification.getNotifications(user?.id || "");

  // const sessionToken = await context.remixService.auth.getSessionToken(user?.id);

  return {
    user,
    notifications: [...notifications],
    // sessionToken,
    // Translated meta tags
    title: t("title", { website: process.env.APP_NAME }),
    description: t("description"),
  };
};

export { meta } from "~/config/meta";

export const action = async ({ context }: ActionFunctionArgs) => {
  const user = await getOptionalUser({ context });
  const notifications =
    await context.remixService.notification.getNotifications(user?.id || "");

  return {
    notifications: [...notifications],
    newNotifications: true,
  };
};

const DashboardLayout = () => {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  // Listen to notifications events
  const form = useRemixForm({});
  const notificationEvent = useEventSource(
    `/events/notifications?authorization=${loaderData.sessionToken}`,
    { event: "message" },
  );

  useEffect(() => {
    if (!notificationEvent) return;

    form.handleSubmit();
  }, [notificationEvent]);

  return (
    <>
      <DashboardHeader
        {...{
          notifications: loaderData?.notifications || actionData?.notifications,
          newNotifications: actionData?.newNotifications,
        }}
      />
      <main className="flex flex-col min-h-[calc(100vh-64px)] py-10">
        <Outlet />
      </main>
      <DashboardFooter />
    </>
  );
};

export default DashboardLayout;
