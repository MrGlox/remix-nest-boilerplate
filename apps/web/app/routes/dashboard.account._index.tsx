import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, LoaderFunctionArgs, data } from "react-router";
import { Form, useActionData, useLoaderData } from "react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import z from "zod";

import { Container } from "~/components/layout/container";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Field, Select } from "~/containers/forms";
import { langs } from "~/containers/language-switcher";
import { generateAlert, generateFlash } from "~/lib/alerts";
import { alertMessageHelper } from "~/server/cookies.server";

const accountSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  birthdate: z.coerce.date(),
  language: z.string(),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { message, headers } = await alertMessageHelper(request);

  return data(
    {
      message,
    },
    {
      headers,
    },
  );
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const submission = await parseWithZod(formData, {
    async: true,
    schema: accountSchema.superRefine(async (data, ctx) => {
      const {} = data;

      // const existingUser = await context.remixService.auth.checkIfUserExists({
      //   firstname,
      //   withPassword: true,
      //   password,
      // });

      // if (existingUser.error) {
      //   ctx.addIssue({
      //     code: "custom",
      //     path: ["alert", "destructive"],
      //     message: existingUser.message,
      //   });
      // }
    }),
  });

  if (submission.status !== "success") {
    return data(
      { result: submission.reply() },
      {
        status: 400,
      },
    );
  }
};

const AccountHome = () => {
  const { t } = useTranslation("dashboard");
  const { i18n } = useTranslation();

  const { currentLanguage } = useMemo(() => {
    return {
      currentLanguage: langs.filter(
        ({ value }) => value === i18n.resolvedLanguage,
      )[0],
    };
  }, [i18n.resolvedLanguage]);

  const { message } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [form, fields] = useForm({
    id: "signin-form",
    constraint: getZodConstraint(accountSchema),
    onValidate: ({ formData }) =>
      parseWithZod(formData, {
        schema: accountSchema,
      }),
    lastResult: actionData?.result,
  });

  return (
    <Container className="px-0">
      <header className="flex-1 space-y-2 pb-4">
        <h3 className="text-xl font-bold tracking-tight">
          {t("my_account.title")}
        </h3>
        <p className="text-sm text-muted-foreground">
          Update your account settings. Set your preferred language and
          timezone.
        </p>
        <Separator className="mt-2" />
      </header>
      <main className="max-w-[500px]">
        <Form
          {...getFormProps(form)}
          method="post"
          reloadDocument
          className="flex flex-col"
        >
          {generateAlert(actionData) || generateFlash(message)}
          <Field
            disabled
            name="pseudo"
            placeholder={t("fields.pseudo_placeholder", "JohnSmith")}
            type="pseudo"
            label={t("fields.pseudo")}
            description="If you want to change your username, please contact support."
            {...{ fields }}
          />
          <Select
            options={langs}
            className="self-start min-w-[200px]"
            name="language"
            placeholder={currentLanguage.label}
            label={t("fields.language")}
            autoComplete="language"
            {...{ fields }}
          />
          <Button className="mt-3 self-end min-w-[120px]">
            {t("submit", { ns: "common" })}
          </Button>
        </Form>
      </main>
    </Container>
  );
};

export default AccountHome;
