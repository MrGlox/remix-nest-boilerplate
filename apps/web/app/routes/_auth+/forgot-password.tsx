import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";

import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  data,
} from "react-router";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Field } from "~/containers/forms";
import { generateAlert, generateFlash } from "~/lib/alerts";
import i18next from "~/modules/i18n.server";
import { alertMessageHelper } from "~/server/cookies.server";

export { meta } from "~/config/meta";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const t = await i18next.getFixedT(request, "auth");
  const { message, headers } = await alertMessageHelper(request);

  return data(
    {
      message,
      // Translated meta tags
      title: t("forgot.title"),
      description: t("forgot.description"),
    },
    {
      headers,
    },
  );
};

const forgotSchema = z.object({
  email: z.string().email(),
});

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const submission = await parseWithZod(formData, {
    async: true,
    schema: forgotSchema.superRefine(async (data, ctx) => {
      const { email } = data;

      const existingUser = await context.remixService.auth.forgotPassword({
        email,
      });

      ctx.addIssue({
        code: "custom",
        path: ["alert", "success"],
        message: existingUser.message,
      });
    }),
  });

  return { result: submission.reply() };
};

function ForgotPasswordPage() {
  const { t } = useTranslation("auth");

  const { message } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [form, fields] = useForm({
    constraint: getZodConstraint(forgotSchema),
    onValidate: ({ formData }) =>
      parseWithZod(formData, {
        schema: forgotSchema,
      }),
    lastResult: actionData?.result,
  });

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 max-w-[420px]">
      <header className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("forgot.title")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("forgot.description")}
        </p>
      </header>
      <main className="grid gap-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
        </div>
        <Form
          {...getFormProps(form)}
          reloadDocument
          method="post"
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
          <Button className="mt-3">{t("forgot.confirm")}</Button>
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

export default ForgotPasswordPage;
