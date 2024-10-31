import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";

import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
  replace,
} from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Field } from "~/containers/forms";
import { generateAlert } from "~/lib/alerts";
import { alertMessage, persistToken } from "~/server/cookies.server";

export { meta } from "~/config/meta";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const tokenParam = url.searchParams.get("token");

  // console.log("tokenParam", tokenParam);

  // const isTokenValid = await context.remixService.token.verify(tokenParam || "");

  // if(!isTokenValid) {
  //   return replace("/forgot-password");
  // }

  const cookieHeader = request.headers.get("Cookie");
  const persistedToken = (await persistToken.parse(cookieHeader)) || false;

  if (tokenParam)
    return replace(`${url.pathname}`, {
      headers: [["Set-Cookie", await persistToken.serialize(tokenParam)]],
    });

  if (!persistedToken) return replace("/forgot-password");

  return json({ token: persistedToken });
};

const forgotSchema = z.object({
  password: z.string().min(8),
  token: z.string(),
});

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const submission = await parseWithZod(formData, {
    async: true,
    schema: forgotSchema.superRefine(async (data, ctx) => {
      const { token } = data;

      const isTokenValid = await context.remixService.token.verify(
        token,
        "PASSWORD_RESET",
      );

      if (!isTokenValid) {
        return ctx.addIssue({
          code: "custom",
          path: ["alert", "destructive"],
          message: "invalid_token",
        });
      }
    }),
  });

  if (submission.status !== "success") {
    return replace(
      "/signin",
      {
        status: 401,
        headers: [
          [
            "Set-Cookie",
            await persistToken.serialize("", {
              expires: new Date(-1),
            }),
          ],
          [
            "Set-Cookie",
            await alertMessage.serialize({
              message: "invalid_token",
              type: "destructive",
            }),
          ],
        ],
      },
    );
  }

  await context.remixService.auth.changePassword({
    ...submission.value
  });

  return replace("/signin", {
    headers: [
      [
        "Set-Cookie",
        await persistToken.serialize("", {
          expires: new Date(-1),
        }),
      ],
      [
        "Set-Cookie",
        await alertMessage.serialize({
          message: "password_changed",
          type: "success",
        }),
      ],
    ],
  });
};

function ChangePasswordPage() {
  const { t } = useTranslation("auth");

  const { token } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [form, fields] = useForm({
    constraint: getZodConstraint(forgotSchema),
    onValidate: ({ formData }) => {
      const result = parseWithZod(formData, {
        schema: forgotSchema,
      });

      console.log("result", result);

      return result;
    },
    lastResult: actionData?.result,
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
        <Form
          {...getFormProps(form)}
          reloadDocument
          method="post"
          className="flex flex-col"
        >
          {generateAlert(actionData)}
          <input type="hidden" name="token" value={token as string} />
          <Field
            name="password"
            placeholder="********"
            type="password"
            label={t("fields.password_new")}
            autoCapitalize="none"
            autoComplete="password"
            autoCorrect="off"
            {...{ fields }}
          />
          <Button className="mt-3">{t("change_password.update")}</Button>
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

export default ChangePasswordPage;
