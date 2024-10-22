import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";

import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
  json,
  redirect,
} from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Field } from "~/containers/forms";
import { getOptionalUser } from "~/server/auth.server";

export const handle = { i18n: "auth" };

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const user = await getOptionalUser({ context });

  if (user) {
    return redirect("/dashboard");
  }

  return null;
};

export const meta: MetaFunction = () => {
  return [{ title: `` }, { name: "description", content: "Welcome to Remix!" }];
};

const forgotSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function ForgotPasswordPage() {
  const { t } = useTranslation("auth");

  const actionData = useActionData<typeof action>();

  const [form, fields] = useForm({
    constraint: getZodConstraint(forgotSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: forgotSchema,
      });
    },
    lastResult: actionData?.result,
  });

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 max-w-[350px]">
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
          method="post"
          // action='/auth/login'
          reloadDocument
          className="flex flex-col"
        >
          <div className="grid gap-2">
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
            <Button disabled={false} className="mt-3">
              {t("forgot.confirm")}
            </Button>
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

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const submission = await parseWithZod(formData, {
    async: true,
    schema: forgotSchema.superRefine(async (data, ctx) => {
      const { email, password } = data;

      const existingUser = await context.remixService.auth.checkIfUserExists({
        email,
        withPassword: true,
        password,
      });

      if (existingUser.error) {
        ctx.addIssue({
          code: "custom",
          path: ["email"],
          message: existingUser.message,
        });
      }
    }),
  });

  if (submission.status !== "success") {
    console.log("submission", submission);

    return json(
      { result: submission.reply() },
      {
        status: 400,
      },
    );
  }

  // l'email et le mot de passe sont valides, et un compte utilisateur existe.
  // connecter l'utilisateur.
  const { email } = submission.value;
  const { sessionToken } = await context.remixService.auth.authenticateUser({
    email,
  });

  const urlParams = new URL(request.url).searchParams;
  const redirectTo = urlParams.get("redirectTo") || "/";

  // Connecter l'utilisateur associé à l'email
  return redirect(
    `/authenticate?token=${sessionToken}&redirectTo=${redirectTo}`,
  );
};

export default ForgotPasswordPage;
