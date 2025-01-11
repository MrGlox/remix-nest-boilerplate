import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LoaderFunctionArgs,
  data,
  redirect,
  useLoaderData,
  useOutletContext,
} from "react-router";

import { Button } from "~/components/ui/button";
import {
  alertMessageGenerator,
  alertMessageHelper,
} from "~/server/cookies.server";

import { Stripe as StripeIcon } from "~/assets/logos";
import { Loader } from "~/components/ui/loader";
import { generateAlert } from "~/lib/alerts";
import { getUserAddress } from "~/server/user.server";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const { message, headers } = await alertMessageHelper(request);

  const address = await getUserAddress({ context });
  if (!address)
    return redirect("/dashboard/account/profile", {
      headers: [
        await alertMessageGenerator("missing_billing_address", "warning"),
      ],
    });

  return data(
    {
      message,
      ENV: {
        APP_DOMAIN: process.env.APP_DOMAIN,
      },
    },
    {
      headers,
    },
  );
};

export default function Payment() {
  const { ENV } = useLoaderData<{ ENV: { APP_DOMAIN: string | undefined } }>();

  const { t, i18n } = useTranslation("dashboard");

  const [isSending, setIsSending] = useState(false);
  const [hasError, setError] = useState<string | undefined>();

  const { amount, annual, currency, paymentIntent } = useOutletContext<{
    annual: boolean;
    amount: number;
    currency: string;
    paymentIntent: any;
  }>();

  const elements = useElements();
  const stripe = useStripe();

  const [isStripeLoading, setIsStripeLoading] = useState(true);

  useEffect(() => {
    if (elements) {
      const element = elements.getElement("payment");

      element?.on("ready", () => {
        setIsStripeLoading(false);
      });
    }
  }, [elements]);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setIsSending(true);
    setError(undefined);

    const submit = await elements?.submit();

    if (submit?.error) {
      return setIsSending(false);
    }

    // await stripe?.paymentRequest.attach(paymentMethodId as string, { customer: customerId as string })

    const confirmPayment = await stripe?.confirmPayment({
      elements: elements || undefined,
      clientSecret: paymentIntent.clientSecret,
      confirmParams: {
        return_url: `${ENV.APP_DOMAIN}/dashboard/account/subscription/payment/success`,
      },
    });

    if (confirmPayment?.error) {
      setError(confirmPayment.error.type);
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {hasError &&
        generateAlert({
          t,
          actionData: {
            error: true,
            path: ["alert", "destructive"],
            message: hasError,
          },
        })}
      <PaymentElement
        options={{
          business: { name: "WatchOver Comments" },
          fields: {},
          layout: {
            type: "accordion",
            defaultCollapsed: false,
            radios: false,
            spacedAccordionItems: true,
          },
        }}
      />

      <div className="flex items-center justify-end">
        <strong className="inline-flex items-center whitespace-nowrap mr-2 -mb-3">
          {t("subscription.secured", "Secured by")}{" "}
          <StripeIcon className="min-w-[80px] -mx-2" />
        </strong>
        <Button
          type="submit"
          className="mt-3 self-end min-w-[160px]"
          disabled={isStripeLoading || !elements || isSending}
        >
          {isSending ? (
            <Loader />
          ) : amount ? (
            `${t("pay", { ns: "common", defaultValue: "Pay" })} ${(
              amount / 100
            )?.toLocaleString(i18n.language, {
              style: "currency",
              currency: currency || "eur",
            })} / ${annual ? t("annual", "Annual") : t("monthly", "Monthly")}`
          ) : (
            t("free", "Free")
          )}
        </Button>
      </div>
    </form>
  );
}
