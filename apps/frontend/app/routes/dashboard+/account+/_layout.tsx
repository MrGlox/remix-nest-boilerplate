// import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

import { Container } from "~/components/layout/container";
import { Separator } from "~/components/ui/separator";
import { Breadcrumb } from "~/containers/breadcrumb";
import { SidebarNav } from "~/containers/dashboard/sidebar-nav";

// import i18next from "~/modules/i18n.server";
// import { getOptionalUser } from "~/server/auth.server";

// export const loader = async ({ context, request }: LoaderFunctionArgs) => {
//   const t = await i18next.getFixedT(request, "dashboard");
//   const user = await getOptionalUser({ context });

//   if (!user) {
//     return redirect("/signin");
//   }

//   return json({
//     // Global
//     user,
//     // Translated meta tags
//     title: t("title", { website: process.env.APP_NAME }),
//     description: t("description"),
//   });
// };

// export { meta } from "~/config/meta";

const sidebarNavItems = [
  {
    title: "Account",
    to: "/dashboard/account",
  },
  {
    title: "Profile",
    to: "/dashboard/account/profile",
  },
  {
    title: "Appearance",
    to: "/dashboard/account/appearance",
  },
  {
    title: "Notifications",
    to: "/dashboard/account/notifications",
  },
  {
    title: "Display",
    to: "/dashboard/account/display",
  },
];

const AccountLayout = () => {
  return (
    <Container className="hidden space-y-6 p-10 pb-16 md:block">
      <div className="space-y-0.5">
        <Breadcrumb />
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1 lg:max-w-2xl">
          <Outlet />
        </div>
      </div>
    </Container>
  );
};

export default AccountLayout;
