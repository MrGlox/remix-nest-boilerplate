import { zodResolver } from "@hookform/resolvers/zod";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  Outlet,
  data,
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

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const { message, headers } = await alertMessageHelper(request);
  const user = await getOptionalUser({ context });

  const products = await context.remixService.payment.listProducts();

  const currentSubscription =
    await context.remixService.payment.retrieveSubscription(
      user?.stripeCustomerId || null,
    );

  return data(
    {
      currentSubscription,
      ENV: {
        STRIPE_API_KEY: process.env.STRIPE_API_KEY,
      },
      message,
      products,
      user,
    },
    {
      headers,
    },
  );
};

export const action = async ({ context, request }: ActionFunctionArgs) => {
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

  const { products, selectedOffer } = data;
  const selectedProduct = products.find(({ id }) => id === selectedOffer);
  console.log("selectedProduct", selectedProduct, selectedProduct?.price);

  const paymentIntent = await context.remixService.payment.createPaymentIntent(
    1000,
    "EUR",
  );

  return {
    paymentIntent,
  };
};

const schema = z.object({
  products: z.array(
    z.object({ id: z.string(), name: z.string(), price: z.number() }),
  ),
  annual: z.boolean().optional(),
  selectedOffer: z.string(),
});

type FormData = z.infer<typeof schema>;
const resolver = zodResolver(schema);

const AccountSubscription = () => {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { t } = useTranslation("dashboard");
  const formRef = useRef<HTMLFormElement>(null);

  const { products, ENV } = loaderData;
  const stripeConfig = loadStripe(ENV.STRIPE_API_KEY || "");

  const form = useRemixForm<FormData>({
    defaultValues: {
      products,
      annual: true,
    },
    resolver,
  });

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
        <Form ref={formRef} {...{ ...form, actionData, loaderData }}>
          <header className="flex justify-between mb-3">
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

                          form.handleSubmit();
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
                  form.handleSubmit();
                }}
                defaultValue={field.value}
                className="flex"
              >
                {products
                  .sort(
                    (a, b) =>
                      Number(a.metadata.order) - Number(b.metadata.order),
                  )
                  .map(({ id, name, active, ...product }) => {
                    console.log("product", { id, name, active, ...product });

                    if (!active) return null;

                    return (
                      <FormItem
                        key={id}
                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                      >
                        <FormControl>
                          <RadioGroupItem
                            {...field}
                            value={id}
                            id={`product-${id}`}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel
                            className="cursor-pointer"
                            htmlFor={`product-${id}`}
                          >
                            {String(
                              t(
                                `product.${name.toLocaleLowerCase()}.title`,
                                name,
                              ),
                            )}
                          </FormLabel>
                          <FormDescription>
                            {t(
                              `product.${name.toLocaleLowerCase()}.description`,
                              name,
                            ) + " "}
                            - You can manage your mobile notifications in the{" "}
                            <Link to="/examples/forms">mobile settings</Link>{" "}
                            page.
                          </FormDescription>
                        </div>
                      </FormItem>
                    );
                  })}
              </RadioGroup>
            )}
          />
        </Form>

        {/* <RadioGroup defaultValue="comfortable">
          {products.map(({ id, ...product }) => {
            console.log("product", product);

            return (
              <div
                key={id}
                className="flex items-center space-x-3 space-y-0"
                //  className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
              >
                <RadioGroupItem value="all" />
                <Label className="font-normal">All new messages</Label>
              </div>
            );
          })}
        </RadioGroup> */}

        <h4 className="text-lg font-bold tracking-tight mb-2">
          {t("payment_methods", "Payment methods")}
        </h4>

        {form.formState.isValid && actionData?.paymentIntent ? (
          <Elements
            stripe={stripeConfig}
            options={{
              clientSecret: actionData?.paymentIntent.client_secret || "",
              appearance: {
                theme: "stripe",
              },
            }}
          >
            <Outlet />
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
      </main>
    </Container>
  );
};

export default AccountSubscription;
