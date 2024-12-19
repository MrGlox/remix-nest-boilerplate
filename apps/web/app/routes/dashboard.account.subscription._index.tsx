import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  data,
  replace,
} from "react-router";
import { Form, useActionData, useLoaderData } from "react-router";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Loader } from "~/components/ui/loader";
import { getOptionalUser } from "~/server/auth.server";
import {
  alertMessageGenerator,
  alertMessageHelper,
  persistToken,
} from "~/server/cookies.server";

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

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const submission = await parseWithZod(formData, {
    async: true,
    schema: paymentSchema,
  });

  await context.remixService.auth.changePassword(
    submission.payload as {
      token: string;
      password: string;
    },
  );

  return replace("/signin", {
    headers: [
      [
        "Set-Cookie",
        await persistToken.serialize("", {
          expires: new Date(-1),
        }),
      ],
      await alertMessageGenerator("password_changed", "success"),
    ],
  });
};

export default function Payment() {
  const { t } = useTranslation("dashboard");

  const actionData = useActionData<typeof action>();
  const { message } = useLoaderData<typeof loader>();

  const [form, fields] = useForm({
    constraint: getZodConstraint(paymentSchema),
    onValidate: ({ formData }) =>
      parseWithZod(formData, {
        schema: paymentSchema,
      }),
    lastResult: actionData?.result,
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
    <Form
      {...getFormProps(form)}
      onSubmit={handleSubmit}
      method="post"
      reloadDocument
      className="flex flex-col"
    >
      {isStripeLoading && <Loader />}
      {/* {generateAlert(actionData) || generateFlash(message)} */}
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
      <Button
        type="submit"
        className="mt-3 self-end min-w-[120px]"
        disabled={isStripeLoading || !elements}
      >
        {t("submit", { ns: "common" })}
      </Button>
    </Form>
  );
}
