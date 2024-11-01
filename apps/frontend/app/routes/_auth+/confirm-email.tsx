import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { alertMessageGenerator } from "~/server/cookies.server";

export { meta } from "~/config/meta";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const tokenParam = url.searchParams.get("token");

  const { message, error } = await context.remixService.auth.confirmEmail({
    token: tokenParam || "",
  });

  return redirect("/signin", {
    headers: [
      await alertMessageGenerator(message, error ? "destructive" : "success"),
    ],
  });

  // if (tokenParam) {
  //   return json({ token: tokenParam });
  // }

  // return json({ token: "" });
};

export default function ConfirmEmail() {
  return (
    <div>
      <h1>Confirmation en cours...</h1>
      <p>Veuillez patienter, nous vérifions votre email.</p>
    </div>
  );
}
