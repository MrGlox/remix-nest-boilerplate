import { LoaderFunctionArgs, data } from "react-router";
import { useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";

import { Container } from "~/components/layout/container";
import { Separator } from "~/components/ui/separator";
import { getOptionalUser } from "~/server/auth.server";
import { alertMessageHelper } from "~/server/cookies.server";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const { message, headers } = await alertMessageHelper(request);
  const user = await getOptionalUser({ context });

  const [plans, invoices] = await Promise.all([
    context.remixService.payment.listProducts(),
    context.remixService.payment.listInvoices(user?.id || ""),
  ]);

  // If there are no plans, sync them from Lemon Squeezy
  // if (!allPlans.length) {
  //   allPlans = await context.remixService.payment.syncPlans();
  // }

  // console.log("allPlans", allPlans);

  return data(
    {
      plans,
      invoices,
      message,
    },
    {
      headers,
    },
  );
};

const AccountBilling = () => {
  const { t } = useTranslation("dashboard");
  const { plans, invoices } = useLoaderData<typeof loader>();

  console.log("plans", plans, invoices);

  return (
    <Container className="px-0">
      <header className="flex-1 space-y-2 pb-4">
        <h3 className="text-xl font-bold tracking-tight">
          {t("billings.title")}
        </h3>
        <p className="text-sm text-muted-foreground">
          Update your profile settings. Set your preferred language and
          timezone.
        </p>
        <Separator className="mt-2" />
      </header>
      <main className="max-w-[500px]">
        <h4 className="text-lg font-bold tracking-tight">
          {t("invoices", "Invoices")}
        </h4>

        <h4 className="text-lg font-bold tracking-tight">
          {t("payment_methods", "Payment methods")}
        </h4>

        {/* <Form
          {...getFormProps(form)}
          method="post"
          reloadDocument
          className="flex flex-col"
        >
          {generateAlert(actionData) || generateFlash(message)}
          <Grid>
            <Field
              name="firstname"
              className="col-span-full md:col-span-3 lg:col-span-6"
              placeholder={t("fields.firstname_placeholder", "John")}
              type="firstname"
              label={t("fields.firstname")}
              autoComplete="firstname"
              {...{ fields }}
            />
            <Field
              name="lastname"
              className="col-span-full md:col-span-3 lg:col-span-6"
              placeholder={t("fields.lastname_placeholder", "Smith")}
              type="lastname"
              label={t("fields.lastname")}
              autoComplete="lastname"
              {...{ fields }}
            />
          </Grid>
          <Datepicker
            className="self-start"
            name="birthdate"
            placeholder={t("fields.birthdate_placeholder", "John")}
            label={t("fields.birthdate")}
            autoComplete="birthdate"
            description="Your date of birth is used to calculate your age."
            {...{ fields }}
          />
          <Button className="mt-3 self-end min-w-[120px]">
            {t("submit", { ns: "common" })}
          </Button>
        </Form> */}
      </main>
    </Container>
  );
};

export default AccountBilling;
