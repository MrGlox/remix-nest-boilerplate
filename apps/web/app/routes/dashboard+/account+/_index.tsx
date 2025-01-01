import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ActionFunctionArgs, LoaderFunctionArgs, data } from "react-router";
import { useActionData, useLoaderData } from "react-router";
import z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { Container } from "~/components/layout/container";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { langs } from "~/containers/language-switcher";
import { alertMessageHelper } from "~/server/cookies.server";

import i18next from "~/modules/i18n.server";
import { getOptionalUser } from "~/server/auth.server";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const t = await i18next.getFixedT(request, "dashboard");
  const { message, headers } = await alertMessageHelper(request);

  const user = await getOptionalUser({ context });

  return data(
    {
      message,
      user,
      // Translated meta tags
      title: t("account.title_meta", { website: process.env.APP_NAME }),
      description: t("account.description"),
    },
    {
      headers,
    },
  );
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const {
    errors,
    data: formData,
    receivedValues: defaultValues,
  } = await getValidatedFormData<FormData>(request, resolver);

  if (errors)
    return {
      errors,
      defaultValues,
    };

  return data(
    { result: formData },
    {
      status: 400,
    },
  );
};

const schema = z.object({
  pseudo: z.string(),
  language: z.string(),
});

type FormData = z.infer<typeof schema>;
const resolver = zodResolver(schema);

const AccountHome = () => {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { t } = useTranslation("dashboard");
  const { i18n } = useTranslation();

  const { currentLanguage } = useMemo(() => {
    return {
      currentLanguage: langs.filter(
        ({ value }) => value === i18n.resolvedLanguage,
      )[0],
    };
  }, [i18n.resolvedLanguage]);

  const form = useRemixForm<FormData>({
    resolver,
  });

  return (
    <Container className="px-0">
      <header className="flex-1 space-y-2 pb-4">
        <h3 className="text-xl font-bold tracking-tight">
          {t("my_account.title", "My Account")}
        </h3>
        <p className="text-sm text-muted-foreground">
          Update your account settings. Set your preferred language and
          timezone.
        </p>
        <Separator className="mt-2" />
      </header>
      <main className="max-w-[500px]">
        <Form {...{ ...form, actionData, loaderData }}>
          <FormField
            control={form.control}
            name="pseudo"
            disabled
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.pseudo")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={loaderData.user?.pseudo || t("no_pseudo")}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  If you want to change your username, please contact support.
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.language")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={currentLanguage.label} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {langs.map(({ label, value }) => (
                      <SelectItem
                        key={`${field.name}_${value}_${label}`}
                        value={value}
                      >
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button className="mt-3 self-end min-w-[120px]">
              {t("submit", { ns: "common" })}
            </Button>
          </div>
        </Form>
      </main>
    </Container>
  );
};

export default AccountHome;
