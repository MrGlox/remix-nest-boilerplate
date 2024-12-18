import { useLoaderData } from "@remix-run/react";

export const loader = async ({ context, request }) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("payment_intent");

  return await context.remixService.payment.retrievePaymentIntent(id);
};

export default function Success() {
  const paymentIntent = useLoaderData();

  return (
    <>
      <h3>Thank you for your payment!</h3>
      <pre>{JSON.stringify(paymentIntent, null, 2)}</pre>
    </>
  );
}
