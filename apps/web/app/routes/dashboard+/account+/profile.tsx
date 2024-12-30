import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { ActionFunctionArgs, LoaderFunctionArgs, data } from "react-router";
import { useActionData, useLoaderData } from "react-router";
import z from "zod";

import { useEffect, useState } from "react";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { Container } from "~/components/layout/container";
import { Grid } from "~/components/layout/grid";
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
import LocationSelector from "~/components/ui/location-input";
import { Separator } from "~/components/ui/separator";
import { alertMessageHelper } from "~/server/cookies.server";

import { DatePicker } from "~/components/ui/date-picker";
import i18next from "~/modules/i18n.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const t = await i18next.getFixedT(request, "dashboard");
  const { message, headers } = await alertMessageHelper(request);

  return data(
    {
      message,
      // Translated meta tags
      title: t("profile.title_meta", { website: process.env.APP_NAME }),
      description: t("profile.description"),
    },
    {
      headers,
    },
  );
};

export { meta } from "~/config/meta";

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const {
    errors,
    data: formData,
    receivedValues: defaultValues,
  } = await getValidatedFormData<FormData>(request, resolver);

  console.log("formData", formData);

  if (errors)
    return {
      errors,
      defaultValues,
    };

  await context.remixService.profile.updateProfile(formData);

  return data({ result: formData });
};

const schema = z.object({
  firstName: z.string(),
  lastame: z.string(),
  birthdate: z.coerce.date(),
  street: z.string(),
  city: z.string(),
  state: z.string().optional(),
  country: z.tuple([z.string(), z.string().optional()]),
});

type FormData = z.infer<typeof schema>;
const resolver = zodResolver(schema);

const ProfileHome = () => {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { t } = useTranslation("dashboard");
  const [countryName, setCountryName] = useState<string>("");
  const [stateName, setStateName] = useState<string>("");

  const form = useRemixForm({
    resolver,
  });

  useEffect(() => {
    if (!loaderData.message) return;
    form.trigger();
  }, []);

  return (
    <Container className="px-0">
      <header className="flex-1 space-y-2">
        <h3 className="text-xl font-bold tracking-tight">
          {t("profile.title", "Profile")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t(
            "profile.update_profile_settings",
            "Update your profile settings. Set your preferred language and timezone.",
          )}
        </p>
        <Separator className="mt-2" />
      </header>
      <main className="max-w-[500px]">
        <Form
          {...{ ...form, actionData, loaderData }}
          className="space-y-2 max-w-3xl mx-auto pb-10"
        >
          <header className="flex flex-col">
            <h4 className="text-lg font-bold tracking-tight">
              {t("profile.personal_information", "Personal Information")}
            </h4>
            <p className="text-muted-foreground text-sm">
              {t(
                "profile.personal_description",
                "Update your personal information.",
              )}
            </p>
          </header>
          <Grid className="!mb-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="col-span-full md:col-span-3 lg:col-span-6">
                  <FormLabel>{t("profile.firstName", "First name")}</FormLabel>
                  <FormControl>
                    <Input placeholder="" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastame"
              render={({ field }) => (
                <FormItem className="col-span-full md:col-span-3 lg:col-span-6">
                  <FormLabel>{t("profile.lastame", "Last name")}</FormLabel>
                  <FormControl>
                    <Input placeholder="" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Grid>
          <FormField
            control={form.control}
            name="birthdate"
            render={({ field, fieldState: { error } }) => (
              <FormItem className="w-full">
                <FormLabel>{t("profile.birthdate", "Birthdate")}</FormLabel>
                <FormControl>
                  <DatePicker
                    {...{ error }}
                    date={field.value ? new Date(field.value) : undefined}
                    setDate={(date) => {
                      if (date) {
                        field.onChange(date);
                      }
                    }}
                    endYear={2024}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator className="!my-6" />
          <header className="flex flex-col">
            <h4 className="text-lg font-bold tracking-tight">
              {t("profile.address", "Address")}
            </h4>
            <p className="text-muted-foreground text-sm">
              {t(
                "profile.address_description",
                "Update your address information.",
              )}
            </p>
          </header>
          <Grid>
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem className="col-span-full md:col-span-4 lg:col-span-8">
                  <FormLabel>{t("profile.street", "Street")}</FormLabel>
                  <FormControl>
                    <Input placeholder="" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem className="col-span-full md:col-span-2 lg:col-span-4">
                  <FormLabel>{t("profile.city", "City")}</FormLabel>
                  <FormControl>
                    <Input placeholder="" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Grid>
          {/* <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("profile.postal_code", "Postal code")}</FormLabel>
                <FormControl>
                  <Input placeholder="" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}
          <FormField
            control={form.control}
            name="country"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel>{t("profile.country", "Country")}</FormLabel>
                <FormControl>
                  <LocationSelector
                    {...{ error }}
                    onCountryChange={(country) => {
                      setCountryName(country?.name || "");
                      form.setValue(field.name, [
                        country?.name || "",
                        stateName || "",
                      ]);
                    }}
                    onStateChange={(state) => {
                      setStateName(state?.name || "");
                      form.setValue(field.name, [
                        countryName || "",
                        state?.name || "",
                      ]);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  {t(
                    "profile.country_description",
                    "If your country has states, they will appear after selecting the country.",
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button className="mt-3 self-end min-w-[120px]">
              {t("submit", { ns: "common", defaultValue: "Submit" })}
            </Button>
          </div>
        </Form>
      </main>
    </Container>
  );
};

export default ProfileHome;
