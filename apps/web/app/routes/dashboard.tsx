import { LoaderFunctionArgs, redirect } from "react-router";
import { Outlet, useLoaderData } from "react-router";

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

  return {
    // Global
    user,
    // Translated meta tags
    title: t("title", { website: process.env.APP_NAME }),
    description: t("description"),
  };
};

export { meta } from "~/config/meta";

const DashboardLayout = () => {
  const { user } = useLoaderData<typeof loader>();

  return (
    <>
      <DashboardHeader {...{ user }} />
      <main className="flex flex-col min-h-[calc(100vh-64px)] py-10">
        <Outlet />
      </main>
      <DashboardFooter />
    </>
  );
};

export default DashboardLayout;
