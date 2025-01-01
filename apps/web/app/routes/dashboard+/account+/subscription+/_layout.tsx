import { zodResolver } from "@hookform/resolvers/zod";
import { Elements } from "@stripe/react-stripe-js";
import {
  PaymentIntent,
  StripeElementLocale,
  loadStripe,
} from "@stripe/stripe-js";
import { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  Outlet,
  data,
  useLocation,
} from "react-router";
import { useActionData, useLoaderData } from "react-router";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { z } from "zod";

import { Link } from "~/components/atoms/link";
import { Container } from "~/components/layout/container";
import { Alert } from "~/components/molecules";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { getOptionalUser } from "~/server/auth.server";
import { alertMessageHelper } from "~/server/cookies.server";

import i18next from "~/modules/i18n.server";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const t = await i18next.getFixedT(request, "dashboard");

  const { message, headers } = await alertMessageHelper(request);
  const user = await getOptionalUser({ context });

  const products = await context.remixService.payment.listProducts();

  const currentSubscription =
    await context.remixService.payment.retrieveSubscription(user?.id || "");

  return data(
    {
      currentSubscription,
      ENV: {
        STRIPE_API_KEY: process.env.STRIPE_API_KEY,
      },
      message,
      products,
      user,
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

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const user = await getOptionalUser({ context });

  const {
    errors,
    data,
    receivedValues: defaultValues,
  } = await getValidatedFormData<FormData>(request, resolver);

  if (errors)
    return {
      errors,
      defaultValues,
    };

  const products = await context.remixService.payment.listProducts();

  const { paymentIntentId, annual, selectedOffer } = data;
  const selectedProduct = products?.find(({ id }) => id === selectedOffer);
  const price =
    selectedProduct?.prices[annual ? "year" : "month"][0].unit_amount;

  if (!price)
    return {
      errors: {
        selectedOffer: "invalid_product",
      },
      defaultValues,
    };

  let paymentIntent: PaymentIntent;

  if (paymentIntentId) {
    paymentIntent = (await context.remixService.payment.updatePaymentIntent(
      paymentIntentId,
      {
        amount: price,
      },
    )) as PaymentIntent;
  } else {
    paymentIntent = (await context.remixService.payment.createPaymentIntent(
      user?.stripeCustomerId || "",
      price,
    )) as PaymentIntent;
  }

  return {
    paymentIntent,
  };
};

const schema = z.object({
  paymentIntentId: z.string().optional(),
  annual: z.boolean().optional(),
  selectedOffer: z.string(),
});

type FormData = z.infer<typeof schema>;
const resolver = zodResolver(schema);

const AccountSubscription = () => {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const location = useLocation();
  const { t, i18n } = useTranslation("dashboard");
  const formRef = useRef<HTMLFormElement>(null);

  const { products, ENV } = loaderData;
  const stripeConfig = loadStripe(ENV.STRIPE_API_KEY || "");

  const form = useRemixForm<FormData>({
    defaultValues: {
      selectedOffer: loaderData.currentSubscription?.id,
      annual: true,
    },
    resolver,
  });

  console.log("currentSubscription", loaderData.currentSubscription);

  // Retrieve/persit the payment intent
  const paymentIntent = useMemo(() => {
    if (typeof window === "undefined") return {};

    if (!form.getValues("selectedOffer"))
      localStorage.removeItem("paymentIntent");

    if (!actionData) {
      const paymentIntent = JSON.parse(
        localStorage.getItem("paymentIntent") || "{}",
      );

      form.setValue("paymentIntentId", paymentIntent?.id || undefined);

      return paymentIntent;
    }

    localStorage.setItem(
      "paymentIntent",
      JSON.stringify(actionData?.paymentIntent),
    );

    form.setValue(
      "paymentIntentId",
      actionData?.paymentIntent?.id || undefined,
    );

    return actionData?.paymentIntent;
  }, [actionData?.paymentIntent]);

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
      {location.pathname === "/dashboard/account/subscription" ? (
        <main className="max-w-[680px]">
          <Form ref={formRef} {...{ ...form, actionData, loaderData }}>
            <header className="flex justify-between mb-2">
              <h4 className="text-lg font-bold tracking-tight">
                {t("select_offer", "Select an offer")}
              </h4>
              <div className="flex items-center space-x-2">
                <FormField
                  control={form.control}
                  name="annual"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-x-3">
                      <div className="space-y-0.5">
                        <FormLabel>{t("annual", "Annual")}</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(ev) => {
                            if (!form.getValues("selectedOffer"))
                              return field.onChange(ev);

                            formRef.current?.dispatchEvent(new Event("submit"));
                            return field.onChange(ev);
                          }}
                          aria-readonly
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </header>
            <FormField
              control={form.control}
              name="selectedOffer"
              render={({ field }) => (
                <RadioGroup
                  onValueChange={(ev) => {
                    field.onChange(ev);
                    formRef.current?.requestSubmit();
                  }}
                  defaultValue={field.value}
                  className="flex"
                >
                  {products
                    .sort(
                      (a, b) =>
                        Number(a.metadata.order) - Number(b.metadata.order),
                    )
                    .map(({ id, name, active, prices }) => {
                      if (!active) return null;

                      const { unit_amount, currency } =
                        prices[form.getValues("annual") ? "year" : "month"][0];

                      return (
                        <FormItem
                          key={id}
                          className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 flex-1"
                        >
                          <FormControl>
                            <RadioGroupItem
                              className="cursor-pointer mb-1"
                              {...field}
                              value={id}
                              id={`product-${id}`}
                            />
                          </FormControl>
                          <div className="flex flex-col items-stretch space-y-2 leading-none w-full">
                            <FormLabel
                              className="cursor-pointer flex justify-between"
                              htmlFor={`product-${id}`}
                            >
                              <span>
                                {String(
                                  t(
                                    `product.${name.toLocaleLowerCase()}.title`,
                                    name,
                                  ),
                                )}
                              </span>
                              <span className="font-bold">
                                {unit_amount
                                  ? (unit_amount / 100)?.toLocaleString(
                                      i18n.language,
                                      {
                                        style: "currency",
                                        currency: currency || "eur",
                                      },
                                    )
                                  : t("free", "Free")}
                              </span>
                            </FormLabel>
                            <FormDescription className="flex flex-col">
                              {t(
                                `product.${name.toLocaleLowerCase()}.description`,
                                name,
                              )}
                            </FormDescription>
                            <Link
                              to={`/#${name.toLocaleLowerCase()}`}
                              className="inline-flex text-sm text-info-foreground underline hover:no-underline self-stretch text-left"
                            >
                              {t("see_offer")}
                            </Link>
                          </div>
                        </FormItem>
                      );
                    })}
                </RadioGroup>
              )}
            />
          </Form>

          <>
            <h4 className="text-lg font-bold tracking-tight">
              {t("payment_methods", "Payment methods")}
            </h4>

            {paymentIntent.client_secret && form.getValues("selectedOffer") ? (
              <Elements
                stripe={stripeConfig}
                options={{
                  // mode: "subscription",
                  // currency: "eur",
                  // amount:
                  //   loaderData.products?.find(
                  //     ({ id }) => id === form.getValues("selectedOffer"),
                  //   )?.prices[form.getValues("annual") ? "year" : "month"][0]
                  //     .unit_amount || undefined,
                  locale: (i18n.language as StripeElementLocale) || "en",
                  clientSecret: paymentIntent.client_secret || "",
                  appearance: {
                    theme: "stripe",
                  },
                }}
              >
                <p className="inline-flex flex-col items-start justify-center w-full text-sm text-gray-600 mb-4">
                  {t(
                    "subscription.payment",
                    "Your payment information is encrypted and protected.",
                  )}
                </p>
                <Outlet
                  context={{
                    annual: form.getValues("annual"),
                    amount:
                      loaderData.products?.find(
                        ({ id }) => id === form.getValues("selectedOffer"),
                      )?.prices[form.getValues("annual") ? "year" : "month"][0]
                        .unit_amount || undefined,
                    paymentIntent,
                    currency: "eur",
                  }}
                />
              </Elements>
            ) : (
              <Alert
                variant="info"
                title={t("subscription.no_current", "No current subscription")}
              >
                {t(
                  "subscription.select_offer",
                  "Please select an offer to display the payment form.",
                )}
              </Alert>
            )}
          </>
        </main>
      ) : (
        <main className="max-w-[680px]">
          <Outlet />
        </main>
      )}
    </Container>
  );
};

export default AccountSubscription;
