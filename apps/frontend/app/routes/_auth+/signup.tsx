import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";

import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Google } from "~/assets/logos";
import { Link } from "~/components/atoms/link";
import { Badge } from "~/components/ui/badge";
import { Button, buttonVariants } from "~/components/ui/button";
import { Field } from "~/containers/forms";
import { cn, generateAlert, generateFlash } from "~/lib/utils";
import i18next, { i18nCookie } from "~/modules/i18n.server";
import {
  alertMessageGenerator,
  alertMessageHelper,
} from "~/server/cookies.server";

export { meta } from "~/config/meta";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const t = await i18next.getFixedT(request, "auth");
  const { message, headers } = await alertMessageHelper(request);

  return json(
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

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const lang = await i18nCookie.parse(request.headers.get("Cookie"));

  const submission = await parseWithZod(formData, {
    async: true,
    schema: signupSchema.superRefine(async (data, ctx) => {
      const { email } = data;

      const existingUser = await context.remixService.auth.checkIfUserExists({
        email,
        withPassword: false,
        password: "",
      });

      if (existingUser.error === false) {
        ctx.addIssue({
          code: "custom",
          path: ["alert", "destructive"],
          message: "invalid_email",
        });
      }
    }),
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      {
        status: 400,
      },
    );
  }

  const { email, password } = submission.value;

  await context.remixService.auth.createUser({
    email,
    password,
    lang,
  });

  return redirect(`/signin`, {
    headers: [await alertMessageGenerator("user_created", "success")],
  });
};

function SignupPage() {
  const { t } = useTranslation("auth");

  const { message } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [form, fields] = useForm({
    constraint: getZodConstraint(signupSchema),
    onValidate: ({ formData }) =>
      parseWithZod(formData, {
        schema: signupSchema,
      }),
    lastResult: actionData?.result,
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
        <Link
          to="/google/redirect"
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
        </Link>
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
        <Form
          {...getFormProps(form)}
          method="post"
          // action='/auth/login'
          reloadDocument
          className="flex flex-col"
        >
          {generateAlert(actionData) || generateFlash(message)}
          <Field
            name="email"
            placeholder={t("fields.email_placeholder", "name@example.com")}
            type="email"
            label={t("fields.email")}
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            {...{ ...actionData, fields }}
          />
          <Field
            name="password"
            placeholder="********"
            type="password"
            label={t("fields.password")}
            autoCapitalize="none"
            autoComplete="password"
            autoCorrect="off"
            {...{ ...actionData, fields }}
          />
          <Button className="mt-3">{t("signup.action")}</Button>
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
