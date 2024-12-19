import { zodResolver } from "@hookform/resolvers/zod";
import { ActionFunctionArgs, LoaderFunctionArgs, data } from "react-router";
import { useActionData, useLoaderData } from "react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Link } from "~/components/atoms/link";
import { Container } from "~/components/layout/container";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
// import { getOptionalUser } from "~/server/auth.server";
import { alertMessageHelper } from "~/server/cookies.server";
import { Button } from "~/components/ui/button";
import { useRemixForm } from "remix-hook-form";

type FormData = z.infer<typeof schema>;

const schema = z.object({
  selectedOffer: z.string().min(1),
});

const resolver = zodResolver(schema);

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const { message, headers } = await alertMessageHelper(request);
  // const user = await getOptionalUser({ context });

  const products = await context.remixService.payment.listProducts();

  return data(
    {
      message,
      products,
      ENV: {
        STRIPE_API_KEY: process.env.STRIPE_API_KEY,
      },
    },
    {
      headers,
    },
  );
};

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const paymentIntent = await context.remixService.payment.createPaymentIntent(
    1000,
    "EUR",
  );

  return {
    paymentIntent,
  };
};

const AccountSubscription = () => {
  const { t } = useTranslation("dashboard");
  const { products, ENV } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  console.log(products, ENV);

  console.log("actionData", actionData);

  // const stripeConfig = loadStripe(ENV.STRIPE_API_KEY || "");

  // const form = useRemixForm<z.infer<typeof FormSchema>>({
  //   resolver: zodResolver(FormSchema),
  // });

  const form = useRemixForm<FormData>({
    mode: "onSubmit",
    resolver,
  });

  const {
    handleSubmit,
    formState: { errors },
    register,
  } = form;

  console.log("form", form);
  // const onSubmit = async (data: z.infer<typeof FormSchema>) => {
  //   console.log("Selected Offer:", data.selectedOffer);
  //   // You can add additional logic here to handle the form submission
  // };

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
        <header className="flex justify-between mb-3">
          <h4 className="text-lg font-bold tracking-tight">
            {t("select_offer", "Select an offer")}
          </h4>
          <div className="flex items-center space-x-2">
            <Switch id="airplane-mode" />
            <Label htmlFor="airplane-mode">{t("annual", "Annual")}</Label>
          </div>
        </header>
        <Form {...form}>
          <form
            onSubmit={handleSubmit}
            className="space-y-6 mb-10"
            method="POST"
          >
            <FormField
              control={form.control}
              name="selectedOffer"
              render={({ field }) => (
                <RadioGroup className="flex">
                  {products
                    .sort(
                      (a, b) =>
                        Number(a.metadata.order) - Number(b.metadata.order),
                    )
                    .map(({ id, name, ...product }) => {
                      console.log("product", { id, name, ...product });

                      return (
                        <FormItem
                          key={id}
                          className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                        >
                          <FormControl>
                            <RadioGroupItem
                              {...field}
                              value={name}
                              id={`product-${name}`}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel htmlFor={`product-${name}`}>
                              {t(
                                `product.${name.toLocaleLowerCase()}.title`,
                                name,
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
            <Button>Submit</Button>
          </form>
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

        {/* {form.formState.isValid && actionData ? (
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
          "Awaiting offer selection"
        )} */}
      </main>
    </Container>
  );
};

export default AccountSubscription;
