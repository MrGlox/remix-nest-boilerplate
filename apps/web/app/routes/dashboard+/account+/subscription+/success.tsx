import { t } from "i18next";
import { ArrowLeftIcon } from "lucide-react";
import { useEffect } from "react";
import { data, replace, useLoaderData, useNavigate } from "react-router";
import { Link } from "~/components/atoms/link";
import { Alert } from "~/components/molecules";
import {
  alertMessageGenerator,
  alertMessageHelper,
} from "~/server/cookies.server";

export const loader = async ({ request }) => {
  const { message } = await alertMessageHelper(request);

  const url = new URL(request.url);
  const paymentIntentId = url.searchParams.get("payment_intent");

  if (!paymentIntentId && !message) {
    return replace("/dashboard/account/subscription", {
      headers: [
        await alertMessageGenerator("payment_intent_missing", "warning"),
      ],
    });
  }

  return data(
    { paymentIntentId },
    {
      headers: [await alertMessageGenerator("payment_intent", "success")],
    },
  );
};

export default function SubscriptionSuccess() {
  const { paymentIntentId } = useLoaderData();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("paymentIntent");

    if (paymentIntentId)
      navigate("/dashboard/account/subscription/success", { replace: true });
  }, []);

  return (
    <>
      <Alert
        variant="success"
        title={t("payment_success.title", "Payment success")}
      >
        {t(
          "payment_success.description",
          "Your payment was successful. You can now access all premium features.",
        )}
      </Alert>
      <Link to="/dashboard" className="inline-flex items-center text-sm">
        <ArrowLeftIcon size={16} className="mr-2" />
        {t("payment_success.back", "Back to dashboard")}
      </Link>
    </>
  );
}
