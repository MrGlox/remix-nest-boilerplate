import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  data,
} from "react-router";
import { useActionData, useLoaderData } from "react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import i18next from "~/modules/i18n.server";
import { alertMessageHelper } from "~/server/cookies.server";
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
      title: t("forgot.title"),
      description: t("forgot.description"),
    },
    {
      headers,
    },
  );
};

const schema = z.object({
  email: z.string().email(),
});

type FormData = z.infer<typeof schema>;
const resolver = zodResolver(schema);

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const {
    errors,
    data,
    receivedValues: defaultValues,
  } = await getValidatedFormData<FormData>(request, resolver);

  if (errors) return { errors, defaultValues };

  const { email } = data;
  const existingUser = await context.remixService.auth.forgotPassword({
    email,
  });

  return {
    code: "custom",
    path: ["alert", "success"],
    message: existingUser.message,
    defaultValues,
  };
};

function ForgotPasswordPage() {
  const { t } = useTranslation("auth");

  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const form = useRemixForm({
    resolver,
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
          <div className="flex flex-row-reverse justify-between items-center">
            <Button>{t("forgot.confirm", "Confirm email")}</Button>
          </div>
        </Form>
      </main>
    </div>
  );
}

export default ForgotPasswordPage;
