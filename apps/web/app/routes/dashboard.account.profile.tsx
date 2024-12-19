import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, LoaderFunctionArgs, data } from "react-router";
import { Form, useActionData, useLoaderData } from "react-router";
import { useTranslation } from "react-i18next";
import z from "zod";

import { Container } from "~/components/layout/container";
import { Grid } from "~/components/layout/grid";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Field } from "~/containers/forms";
import { Datepicker } from "~/containers/forms/datepicker";
import { generateAlert, generateFlash } from "~/lib/alerts";
import { alertMessageHelper } from "~/server/cookies.server";

const profileSchema = z.object({
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
    schema: profileSchema.superRefine(async (data, ctx) => {
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

const ProfileHome = () => {
  const { t } = useTranslation("dashboard");

  const { message } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [form, fields] = useForm({
    id: "signin-form",
    constraint: getZodConstraint(profileSchema),
    onValidate: ({ formData }) =>
      parseWithZod(formData, {
        schema: profileSchema,
      }),
    lastResult: actionData?.result,
  });

  return (
    <Container className="px-0">
      <header className="flex-1 space-y-2 pb-4">
        <h3 className="text-xl font-bold tracking-tight">
          {t("profile.title")}
        </h3>
        <p className="text-sm text-muted-foreground">
          Update your profile settings. Set your preferred language and
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
          <Grid>
            <Field
              name="firstname"
              className="col-span-full md:col-span-3 lg:col-span-6"
              placeholder={t("fields.firstname_placeholder", "John")}
              type="firstname"
              label={t("fields.firstname")}
              autoComplete="firstname"
              {...{ fields }}
            />
            <Field
              name="lastname"
              className="col-span-full md:col-span-3 lg:col-span-6"
              placeholder={t("fields.lastname_placeholder", "Smith")}
              type="lastname"
              label={t("fields.lastname")}
              autoComplete="lastname"
              {...{ fields }}
            />
          </Grid>
          <Datepicker
            className="self-start"
            name="birthdate"
            placeholder={t("fields.birthdate_placeholder", "John")}
            label={t("fields.birthdate")}
            autoComplete="birthdate"
            description="Your date of birth is used to calculate your age."
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

export default ProfileHome;
