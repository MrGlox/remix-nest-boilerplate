import { LoaderFunctionArgs } from "react-router";
import { Outlet } from "@remix-run/react";
import { useTranslation } from "react-i18next";

import { Container } from "~/components/layout/container";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Breadcrumb } from "~/containers/breadcrumb";
import { SidebarNav } from "~/containers/dashboard/sidebar-nav";

import i18next from "~/modules/i18n.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const t = await i18next.getFixedT(request, "dashboard");

  return {
    // Translated meta tags
    title: t("account.title_meta", { website: process.env.APP_NAME }),
    description: t("account.description"),
  };
};

export { meta } from "~/config/meta";

const AccountLayout = () => {
  const { t } = useTranslation("dashboard");

  const sidebarNavItems = [
    {
      title: t("my_account.title", "My Account"),
      to: "/dashboard/account",
    },
    {
      title: t("profile.title", "Profile"),
      to: "/dashboard/account/profile",
    },
    {
      title: t("notifications.title", "Notifications"),
      to: "/dashboard/account/notifications",
    },
    {
      title: t("billings.title", "Billings"),
      to: "/dashboard/account/billings",
    },
    {
      title: t("subscription.title", "Subscription"),
      to: "/dashboard/account/subscription",
    },
  ];

  return (
    <Container className="flex flex-col justify-stretch space-y-6 flex-1">
      <Breadcrumb className="ml-0.5" />
      <Card className="flex flex-1 flex-col !mt-2">
        <CardHeader className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">
            {t("settings", "Settings")}
          </h2>
          <p className="text-muted-foreground">
            {t(
              "settings_desc",
              "Manage your account settings and set e-mail preferences.",
            )}
          </p>
          <Separator className="!mt-4" />
        </CardHeader>
        <CardContent className="flex flex-col flex-1 space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="flex flex-col lg:flex-row -mx-4 lg:mx-0 lg:w-1/5 gap-x-2 overflow-auto no-scrollbar">
            <SidebarNav className="flex-1" items={sidebarNavItems} />
            <Separator
              orientation="vertical"
              className="hidden lg:flex h-full"
            />
          </aside>
          <main className="flex-1">
            <Outlet />
          </main>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AccountLayout;
