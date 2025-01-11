import { Separator } from "@radix-ui/react-select";
import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Link,
  LoaderFunctionArgs,
  data,
  redirect,
  useLoaderData,
} from "react-router";
import { Button } from "~/components/ui/button";
import { getOptionalUser } from "~/server/auth.server";
import {
  alertMessageGenerator,
  alertMessageHelper,
} from "~/server/cookies.server";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const { message } = await alertMessageHelper(request);
  const user = await getOptionalUser({ context });

  const subscription = await context.remixService.payment.retrieveSubscription(
    user?.id || "",
  );

  if (!subscription) {
    return redirect("/dashboard/account/subscription/payment");
  }

  return data(
    {
      message,
      userId: user?.id,
      subscription,
    },
    {
      headers: [await alertMessageGenerator("payment_intent", "success")],
    },
  );
};

export { meta } from "~/config/meta";

export default function AccountSubscriptionPage() {
  const loaderData = useLoaderData<typeof loader>();

  const { t, i18n } = useTranslation("dashboard");

  const { price, features, cancelAtPeriodEnd, currentPeriodEnd } =
    loaderData?.subscription || {};

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold">Current Subscription</h4>
              <p className="text-sm text-muted-foreground">
                Your subscription renews on{" "}
                {new Date(
                  loaderData.subscription.currentPeriodEnd,
                ).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {price.unitAmount
                  ? (price.unitAmount / 100)?.toLocaleString(i18n.language, {
                      style: "currency",
                      currency: price.currency || "eur",
                    })
                  : t("free", "Free")}
                <span className="text-sm text-muted-foreground ml-0.5">
                  / {price.interval}
                </span>
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h5 className="font-medium">Your Plan Includes:</h5>
            <ul className="space-y-2">
              {features?.length !== 0
                ? features?.map((feature: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))
                : "-"}
            </ul>
          </div>

          {cancelAtPeriodEnd && (
            <div className="mt-6 rounded-md bg-destructive/10 p-4">
              <p className="text-sm text-destructive">
                Your subscription will end on{" "}
                {new Date(currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between gap-4">
          <Button variant="outline" asChild>
            <Link to="billing">Manage Billing</Link>
          </Button>
          <Button variant="destructive" asChild>
            <Link to="cancel">Cancel Subscription</Link>
          </Button>
        </div>
      </div>
      {/* <pre>{JSON.stringify(loaderData, null, 2)}</pre> */}
    </>
  );
}
