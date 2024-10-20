import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";

import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Google } from "~/assets/logos";
import { Link } from "~/components/atoms/link";
import { Badge } from "~/components/ui/badge";
import { Button, buttonVariants } from "~/components/ui/button";
import { Field } from "~/containers/forms";
import { cn } from "~/lib/utils";
import i18next from "~/modules/i18n.server";
import { getOptionalUser } from "~/server/auth.server";

export const handle = { i18n: "auth" };

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const t = await i18next.getFixedT(request, "auth");
  const user = await getOptionalUser({ context });

  if (user) {
    return redirect("/");
  }

  return json({
    // Translated meta tags
    title: t("signin.title"),
    description: t("signin.description"),
  } as const);
};

export { meta } from "~/config/meta";

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function SigninPage() {
  const { t } = useTranslation("auth");

  const actionData = useActionData<typeof action>();

  const [form, fields] = useForm({
    constraint: getZodConstraint(signinSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: signinSchema,
      });
    },
    lastResult: actionData?.result,
  });

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 max-w-[350px]">
      <header className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("signin.title")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("signin.description")}
        </p>
      </header>
      <main className={cn("grid gap-6")}>
        <Link
          to="/google/redirect"
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
          <div className="grid gap-2">
            <div className="grid gap-1">
              {/* <Alert>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Doloribus facere molestiae optio porro ipsum asperiores, alias
                dolorum eveniet perferendis sunt officiis veritatis magni
                consectetur sit? Fugit magni ea mollitia nulla?
              </Alert> */}
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
            </div>
            <div className="grid gap-1">
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
            </div>
            <Button disabled={false} className="mt-3">
              {t("signin.action")}
            </Button>
          </div>
          <Link
            to="/forgot-password"
            className="w-full text-right text-sm mt-2"
          >
            {t("forgot.title")}
          </Link>
        </Form>
      </main>
      <footer>
        <p className="text-muted-foreground -mb-10 mt-10 px-8 text-center text-sm">
          {t("agree")}{" "}
          <Button asChild variant="link">
            <Link
              to="/terms"
              className="variant underline-offset-4 hover:underline"
            >
              {t("terms")}
            </Link>
          </Button>{" "}
          {t("and")}{" "}
          <Button asChild variant="link">
            <Link
              to="/privacy"
              className="variant underline-offset-4 hover:underline"
            >
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
    schema: signinSchema.superRefine(async (data, ctx) => {
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

export default SigninPage;
