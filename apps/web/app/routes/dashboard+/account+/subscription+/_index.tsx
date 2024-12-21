import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActionFunctionArgs, LoaderFunctionArgs, data } from "react-router";
import { useActionData, useLoaderData } from "react-router";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { Button } from "~/components/ui/button";
import { Loader } from "~/components/ui/loader";
import { getOptionalUser } from "~/server/auth.server";
import { alertMessageHelper } from "~/server/cookies.server";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const { message, headers } = await alertMessageHelper(request);
  const user = await getOptionalUser({ context });

  const paymentIntent = await context.remixService.payment.createPaymentIntent(
    1000,
    "EUR",
  );

  return data(
    {
      message,
      paymentIntent,
    },
    {
      headers,
    },
  );
};

const paymentSchema = z.object({
  password: z.string().min(8),
  token: z.string(),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const {
    errors,
    data: formData,
    receivedValues: defaultValues,
  } = await getValidatedFormData<FormData>(request, resolver);

  if (errors)
    return {
      errors,
      defaultValues,
    };

  return data(
    { result: formData },
    {
      status: 400,
    },
  );
};

const schema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  birthdate: z.coerce.date(),
  language: z.string(),
});

type FormData = z.infer<typeof schema>;
const resolver = zodResolver(schema);

export default function Payment() {
  const { t } = useTranslation("dashboard");

  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const form = useRemixForm({
    resolver,
  });

  const elements = useElements();
  const stripe = useStripe();

  const [isStripeLoading, setIsStripeLoading] = useState(true);

  useEffect(() => {
    if (elements) {
      const element = elements.getElement("payment");

      element.on("ready", () => {
        setIsStripeLoading(false);
      });
    }
  }, [elements]);

  // function onSubmit(data: z.infer<typeof FormSchema>) {
  //   // toast({
  //   //   title: "You submitted the following values:",
  //   //   description: (
  //   //     <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
  //   //       <code className="text-white">{JSON.stringify(data, null, 2)}</code>
  //   //     </pre>
  //   //   ),
  //   // });
  // }

  const handleSubmit = async (e) => {
    e.preventDefault();

    await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: "http://localhost:3000/pay/success",
      },
    });
  };

  return (
    <form>
      {isStripeLoading && <Loader />}
      <PaymentElement
        options={{
          layout: {
            type: "accordion",
            defaultCollapsed: false,
            radios: false,
            spacedAccordionItems: true,
          },
        }}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          className="mt-3 self-end min-w-[120px]"
          disabled={isStripeLoading || !elements}
        >
          {t("submit", { ns: "common" })}
        </Button>
      </div>
    </form>
  );
}
