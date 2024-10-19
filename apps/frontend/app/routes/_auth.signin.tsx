import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { getFormProps, useForm } from "@conform-to/react";

import { useTranslation } from "react-i18next";
import { Form, Link, useActionData } from "@remix-run/react";
import {
  ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
  MetaFunction,
  redirect,
} from "@remix-run/node";
// import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { z } from "zod";

import { Label } from "~/components/ui/label";
import { Button, buttonVariants } from "~/components/ui/button";
// import { Loader } from "~/components/ui/loader";

import { Input } from "~/containers/forms";

import { Google } from "~/assets/logos";
import { cn } from "~/lib/utils";
// import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { getOptionalUser } from "~/server/auth.server";

export const handle = { i18n: "auth" };

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const user = await getOptionalUser({ context });

  if (user) {
    return redirect("/");
  }

  return null;
};

export const meta: MetaFunction = () => {
  return [{ title: `` }, { name: "description", content: "Welcome to Remix!" }];
};

export const signinSchema = z.object({
  email: z
    .string({
      required_error: "L'email est obligatoire.",
    })
    .email({
      message: "Cet email est invalide.",
    }),
  password: z.string({ required_error: "Le mot de passe est obligatoire." }),
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
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:max-w-[350px]">
      <header className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("signin.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("signin.description")}
        </p>
      </header>
      <main className={cn("grid gap-6")}>
        <a
          href="/google/redirect"
          className={cn(
            "group relative inline-flex ",
            buttonVariants({ variant: "outline" }),
          )}
        >
          {/* {processing ? (
              <Loader className="mr-2 h-4 w-4" />
            ) : ( */}
          <>
            <span className="inline-flex items-center">
              <Google className="mr-2 h-4 w-4" />
              Google
            </span>
            <Badge
              variant="info"
              className="absolute -top-[6px] -right-[12px] rotate-12 group-hover:animate-bounce-rotated"
            >
              {t("common.recommended")}
            </Badge>
          </>
          {/* )} */}
        </a>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Form
          {...getFormProps(form)}
          method="post"
          // action='/auth/login'
          reloadDocument
        >
          <div className="grid gap-2">
            <div className="grid gap-1">
              <Label htmlFor="email">{t("fields.email")}</Label>
              <Input
                name="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                // disabled={processing}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="password">{t("fields.password")}</Label>
              <Input
                name="password"
                placeholder="********"
                type="password"
                autoCapitalize="none"
                autoComplete="password"
                autoCorrect="off"
                // disabled={processing}
              />
            </div>
            <Button disabled={false} className="mt-3">
              {/* {processing ? <Loader /> :  */}
              {t("signin.action")}
            </Button>
          </div>
        </Form>
      </main>
      <footer>
        <p className="mt-10 -mb-10 px-8 text-center text-sm text-muted-foreground">
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
