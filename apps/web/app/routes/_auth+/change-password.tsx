import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  replace,
} from "react-router";
import { useActionData, useLoaderData } from "react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import i18next from "~/modules/i18n.server";
import { alertMessageGenerator, persistToken } from "~/server/cookies.server";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export { meta } from "~/config/meta";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const t = await i18next.getFixedT(request, "auth");

  const url = new URL(request.url);
  const tokenParam = url.searchParams.get("token");

  const cookieHeader = request.headers.get("Cookie");
  const persistedToken = (await persistToken.parse(cookieHeader)) || "";

  if (tokenParam)
    return replace(`${url.pathname}`, {
      headers: [["Set-Cookie", await persistToken.serialize(tokenParam)]],
    });

  const isTokenValid = await context.remixService.token.verify({
    token: persistedToken || "",
    type: "PASSWORD_RESET",
  });

  if (!isTokenValid)
    return replace("/forgot-password", {
      headers: [await alertMessageGenerator("invalid_token", "destructive")],
    });

  return {
    token: persistedToken,
    // Translated meta tags
    title: t("change_password.title"),
    description: t("change_password.description"),
  };
};

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const {
    errors,
    data,
    receivedValues: defaultValues,
  } = await getValidatedFormData<FormData>(request, resolver);

  console.log("data", data, errors);

  if (errors) {
    return { errors, defaultValues };
  }

  // await context.remixService.auth.changePassword(data);

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

const schema = z.object({
  password: z.string().min(8),
  token: z.string(),
});

type FormData = z.infer<typeof schema>;
const resolver = zodResolver(schema);

function ChangePasswordPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { t } = useTranslation("auth");

  const token = "token" in loaderData ? loaderData.token : "";

  const form = useRemixForm<FormData>({
    defaultValues: {
      token,
    },
    resolver,
  });

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 max-w-[420px]">
      <header className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("change_password.title")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("change_password.description")}
        </p>
      </header>
      <main className="grid gap-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
        </div>
        <Form {...{ ...form, actionData }}>
          <FormField
            control={form.control}
            name="token"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="hidden" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="********"
                    type="password"
                    autoCapitalize="none"
                    autoComplete="password"
                    autoCorrect="off"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button className="mt-3">{t("change_password.update")}</Button>
          </div>
        </Form>
      </main>
      {/* <footer>
        <p className="text-muted-foreground -mb-10 mt-10 px-8 text-center text-sm">
          {t("agree")}{" "}
          <Button asChild variant="link">
            <Link to="/terms" className="variant underline-offset-4">
              {t("terms")}
            </Link>
          </Button>{" "}
          {t("and")}{" "}
          <Button asChild variant="link">
            <Link to="/privacy" className="variant underline-offset-4">
              {t("privacy")}
            </Link>
          </Button>
          .
        </p>
      </footer> */}
    </div>
  );
}

export default ChangePasswordPage;
