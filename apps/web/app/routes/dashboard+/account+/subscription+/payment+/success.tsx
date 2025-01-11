import { t } from "i18next";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useEffect } from "react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  data,
  replace,
  useActionData,
  useLoaderData,
  useNavigate,
} from "react-router";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { z } from "zod";
import { Link } from "~/components/atoms/link";
import { Alert } from "~/components/molecules";
import { getOptionalUser } from "~/server/auth.server";
import {
  alertMessageGenerator,
  alertMessageHelper,
} from "~/server/cookies.server";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "~/components/ui/loader";
import i18next from "~/modules/i18n.server";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const t = await i18next.getFixedT(request, "dashboard");

  const { message } = await alertMessageHelper(request);
  const user = await getOptionalUser({ context });

  const url = new URL(request.url);

  const redirectStatus = url.searchParams.get("redirect_status");
  const paymentIntentId = url.searchParams.get("payment_intent");

  if (!paymentIntentId && !message) {
    return replace("/dashboard/account/subscription", {
      headers: [
        await alertMessageGenerator("payment_intent_missing", "warning"),
      ],
    });
  }

  return data(
    {
      userId: user?.id,
      paymentIntentId,
      redirectStatus,
      // Translated meta tags
      title: t("subscription.title_meta", { website: process.env.APP_NAME }),
      description: t("subscription.description"),
    },
    {
      headers: [await alertMessageGenerator("payment_intent", "success")],
    },
  );
};

export { meta } from "~/config/meta";

const schema = z.object({
  paymentIntentId: z.string(),
  userId: z.string(),
});

type FormData = z.infer<typeof schema>;
const resolver = zodResolver(schema);

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

  const { paymentIntentId, userId } = data;
  const subscriptionData =
    await context.remixService.payment.createSubscription(
      paymentIntentId,
      userId,
    );

  return {
    paymentIntentId,
    subscription: subscriptionData,
    userId,
  };
};

export default function SubscriptionSuccess() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const navigate = useNavigate();

  const form = useRemixForm({
    submitConfig: {
      replace: true,
      method: "POST",
    },
    defaultValues: {
      userId: loaderData?.userId || "",
      paymentIntentId: loaderData?.paymentIntentId || "",
    },
  });

  useEffect(() => {
    localStorage.removeItem("paymentIntent");
    if (loaderData?.paymentIntentId) form.handleSubmit();
  }, []);

  useEffect(() => {
    if (!actionData) return;

    if (form.formState.isSubmitted && !form.formState.isSubmitting) {
      navigate("/dashboard/account/subscription/success", {
        replace: true,
      });
    }
  }, [form.formState.isSubmitted, form.formState.isSubmitting]);

  return (
    <>
      {!form.formState.isSubmitted || form.formState.isSubmitting ? (
        <div className="flex justify-center items-center min-h-[60px] bg-slate-50 rounded-md border border-slate-200 mb-4">
          <Loader />
        </div>
      ) : (
        <Alert
          variant="success"
          title={t("payment_success.title", "Payment success")}
        >
          {t(
            "payment_success.description",
            "Your payment was successful. You can now access all premium features.",
          )}
        </Alert>
      )}
      <div className="flex flex-row justify-between gap-4">
        <Link to="/dashboard" className="inline-flex items-center text-sm">
          <ArrowLeftIcon size={16} className="mr-2" />
          {t("payment_success.back", "Back to dashboard")}
        </Link>
        <Link
          to="/dashboard/account/subscription"
          className="inline-flex items-center text-sm"
        >
          {t("payment_success.go_subscription", "See your subscription")}
          <ArrowRightIcon size={16} className="ml-2" />
        </Link>
      </div>
      {/* <pre>{JSON.stringify(actionData, null, 2)}</pre> */}
    </>
  );
}
