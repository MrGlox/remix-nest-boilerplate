import { useTranslation } from "react-i18next";
import { LoaderFunctionArgs, data } from "react-router";

import { Container } from "~/components/layout/container";
import { Separator } from "~/components/ui/separator";
import { alertMessageHelper } from "~/server/cookies.server";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const { message, headers } = await alertMessageHelper(request);
  // const user = await getOptionalUser({ context });

  // const

  const [plans] = await Promise.all([
    context.remixService.payment.listProducts(),
    // context.remixService.payment.listInvoices(user?.id || ""),
  ]);

  // If there are no plans, sync them from Lemon Squeezy
  // if (!allPlans.length) {
  //   allPlans = await context.remixService.payment.syncPlans();
  // }

  // console.log("allPlans", allPlans);

  return data(
    {
      plans,
      // invoices,
      message,
    },
    {
      headers,
    },
  );
};

const AccountBilling = () => {
  const { t } = useTranslation("dashboard");
  // const { plans } = useLoaderData<typeof loader>();

  // console.log("plans", plans, invoices);

  return (
    <Container className="px-0">
      <header className="flex-1 space-y-2 pb-4">
        <h3 className="text-xl font-bold tracking-tight">
          {t("billings.title")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t(
            "billings.description",
            "Manage your billing information and invoices with history.",
          )}
        </p>
        <Separator className="mt-2" />
      </header>
      <main className="max-w-[500px]">
        <h4 className="text-lg font-bold tracking-tight">
          {t("invoices", "Invoices")}
        </h4>
      </main>
    </Container>
  );
};

export default AccountBilling;
