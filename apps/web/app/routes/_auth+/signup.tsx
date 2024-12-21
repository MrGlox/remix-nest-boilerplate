import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  data,
  redirect,
} from "react-router";
import { useActionData, useLoaderData } from "react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Google } from "~/assets/logos";
import { Link } from "~/components/atoms/link";
import { Badge } from "~/components/ui/badge";
import { Button, buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import i18next, { i18nCookie } from "~/modules/i18n.server";
import {
  alertMessageGenerator,
  alertMessageHelper,
} from "~/server/cookies.server";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

export { meta } from "~/config/meta";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const t = await i18next.getFixedT(request, "auth");
  const { message, headers } = await alertMessageHelper(request);

  return data(
    {
      message,
      // Translated meta tags
      title: t("signup.title"),
      description: t("signup.description"),
    },
    {
      headers,
    },
  );
};

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const lang = await i18nCookie.parse(request.headers.get("Cookie"));
  const {
    errors,
    data,
    receivedValues: defaultValues,
  } = await getValidatedFormData<FormData>(request, resolver);

  if (errors) return { errors, defaultValues };

  const existingUser = await context.remixService.auth.checkIfUserExists({
    ...data,
    withPassword: false,
  });

  if (existingUser.error === false) {
    return {
      error: true,
      code: "custom",
      path: ["alert", "destructive"],
      message: "invalid_email",
      defaultValues,
    };
  }

  const { email, password } = data;

  await context.remixService.auth.createUser({
    email,
    password,
    lang,
  });

  return redirect(`/signin`, {
    headers: [await alertMessageGenerator("user_created", "success")],
  });
};

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;
const resolver = zodResolver(schema);

function SignupPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { t } = useTranslation("auth");
  const form = useRemixForm<FormData>({
    resolver,
  });

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 max-w-[420px]">
      <header className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("signup.title")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("signup.description")}
        </p>
      </header>
      <main className={cn("grid gap-6")}>
        <a
          href="/auth/google"
          className={cn(
            "group relative inline-flex ",
            buttonVariants({ variant: "outline" }),
          )}
        >
          <span className="inline-flex items-center">
            <Google className="mr-2 size-4" />
            Google
          </span>
          <Badge
            variant="info"
            className="group-hover:animate-bounce-rotated absolute -right-[12px] -top-[6px] rotate-12"
          >
            {t("recommended", { ns: "common" })}
          </Badge>
        </a>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background text-muted-foreground px-2">
              {t("or_continue")}
            </span>
          </div>
        </div>

        <Form {...{ ...form, actionData, loaderData }}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.email")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t(
                      "fields.email_placeholder",
                      "name@example.com",
                    )}
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
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
          <div className="flex flex-row-reverse justify-between items-center">
            <Button>{t("signup.action", "Signup with email")}</Button>
          </div>
        </Form>
      </main>
      <footer>
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
      </footer>
    </div>
  );
}

export default SignupPage;
