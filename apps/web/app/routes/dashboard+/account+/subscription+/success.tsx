import { t } from "i18next";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { data, replace, useLoaderData } from "react-router";
import { Link } from "~/components/atoms/link";
import { Alert } from "~/components/molecules";
import {
  alertMessageGenerator,
  alertMessageHelper,
} from "~/server/cookies.server";

export const loader = async ({ context, request }) => {
  const { message } = await alertMessageHelper(request);

  const url = new URL(request.url);

  const redirectStatus = url.searchParams.get("redirect_status");
  const paymentIntentId = url.searchParams.get("payment_intent");

  console.log("paymentIntentClientSecret", redirectStatus);

  if (!paymentIntentId && !message) {
    return replace("/dashboard/account/subscription", {
      headers: [
        await alertMessageGenerator("payment_intent_missing", "warning"),
      ],
    });
  }

  await context.remixService.payment.createSubscription(paymentIntentId);

  return data(
    { paymentIntentId, redirectStatus },
    {
      headers: [await alertMessageGenerator("payment_intent", "success")],
    },
  );
};

export default function SubscriptionSuccess() {
  const { redirectStatus } = useLoaderData<typeof loader>();
  // const navigate = useNavigate();

  // useEffect(() => {
  //   localStorage.removeItem("paymentIntent");

  //   if (paymentIntentId)
  //     navigate("/dashboard/account/subscription/success", { replace: true });
  // }, []);

  return (
    <>
      {redirectStatus === "succeeded" && (
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
      {/* <pre>
        {JSON.stringify(paymentIntent, null, 2)}
      </pre> */}
    </>
  );
}
