import { LoaderFunctionArgs, Outlet, data } from "react-router";
import { useLoaderData } from "react-router";

import { Container } from "~/components/layout/container";
import { Separator } from "~/components/ui/separator";
import { alertMessageHelper } from "~/server/cookies.server";

import { useTranslation } from "react-i18next";
import i18next from "~/modules/i18n.server";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const t = await i18next.getFixedT(request, "dashboard");

  const { message, headers } = await alertMessageHelper(request);

  const products = await context.remixService.payment.listProducts();

  return data(
    {
      products,
      message,
      // Translated meta tags
      title: t("subscription.title_meta", { website: process.env.APP_NAME }),
      description: t("subscription.description"),
    },
    {
      headers,
    },
  );
};

export { meta } from "~/config/meta";

const AccountSubscriptionLayout = () => {
  const loaderData = useLoaderData<typeof loader>();

  const { t } = useTranslation("dashboard");

  return (
    <Container className="px-0">
      <header className="flex-1 space-y-2 pb-4">
        <h3 className="text-xl font-bold tracking-tight">
          {t("subscription.title", "Subscription")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("subscription.description", "Subscription")}
        </p>
        <Separator className="mt-2" />
      </header>
      <main className="max-w-[680px]">
        <Outlet />
      </main>
    </Container>
  );
};

export default AccountSubscriptionLayout;
