import { useTranslation } from "react-i18next";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  data,
  redirectDocument,
} from "react-router";
import { useActionData, useLoaderData } from "react-router";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { Google } from "~/assets/logos";
import { Link } from "~/components/atoms/link";
import { Badge } from "~/components/ui/badge";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import i18next from "~/modules/i18n.server";
import { alertMessageHelper } from "~/server/cookies.server";

export { meta } from "~/config/meta";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const t = await i18next.getFixedT(request, "auth");

  const params = new URL(request.url).searchParams;
  const error = params.get("error");
  
  const { message, headers } = await alertMessageHelper(request);

  return data(
    {
      message: error ? [error, 'destructive'] : message,
      error: !!error,
      // Translated meta tags
      title: t("signin.title"),
      description: t("signin.description"),
    },
    {
      headers,
    },
  );
};

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const {
    errors,
    data,
    receivedValues: defaultValues,
  } = await getValidatedFormData<FormData>(request, resolver);

  if (errors) {
    return { errors, defaultValues };
  }

  const existingUser = await context.remixService.auth.checkIfUserExists({
    ...data,
    withPassword: true,
  });

  if (errors || existingUser.error) {
    return {
      ...existingUser,
      code: "custom",
      path: ["alert", "destructive"],
      defaultValues,
    };
  }

  const { email } = data;
  const { sessionToken } = await context.remixService.auth.authenticateUser({
    email,
  });

  const urlParams = new URL(request.url).searchParams;
  const redirectTo = urlParams.get("redirectTo") || "/dashboard";

  return redirectDocument(
    `/auth?token=${sessionToken}&redirectTo=${redirectTo}`,
  );
};

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
});

type FormData = z.infer<typeof schema>;
const resolver = zodResolver(schema);

function SigninPage() {
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
          {t("signin.title")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("signin.description")}
        </p>
      </header>
      <main className={cn("grid gap-6")}>
        <a
          href="/auth/google"
          className={cn(
            "group relative inline-flex",
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
            <Button>{t("signin.action", "Connect with Email")}</Button>
            <Link to="/forgot-password" className="text-sm">
              {t("forgot.link", "Forgot password ?")}
            </Link>
          </div>
        </Form>
      </main>
      <footer>
        <p className="text-muted-foreground -mb-10 mt-10 px-8 text-center text-sm">
          {t("agree", "By clicking continue, you agree to our")}{" "}
          <Button asChild variant="link">
            <Link
              to="/terms"
              className="variant underline-offset-4 hover:underline"
            >
              {t("terms", "Terms of Service")}
            </Link>
          </Button>{" "}
          {t("and", "and")}{" "}
          <Button asChild variant="link">
            <Link
              to="/privacy"
              className="variant underline-offset-4 hover:underline"
            >
              {t("privacy", "Privacy Policy")}
            </Link>
          </Button>
          .
        </p>
      </footer>
    </div>
  );
}

export default SigninPage;
