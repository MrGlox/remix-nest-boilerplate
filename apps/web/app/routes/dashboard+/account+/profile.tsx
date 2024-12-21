import { ActionFunctionArgs, LoaderFunctionArgs, data } from "react-router";
import { useActionData, useLoaderData } from "react-router";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

import { Container } from "~/components/layout/container";
import { Grid } from "~/components/layout/grid";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { alertMessageHelper } from "~/server/cookies.server";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Input } from "~/components/ui/input";

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
  firstname: z.string(),
  lastname: z.string(),
  birthdate: z.coerce.date(),
  language: z.string(),
});

type FormData = z.infer<typeof schema>;
const resolver = zodResolver(schema);

const ProfileHome = () => {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { t } = useTranslation("dashboard");

  const form = useRemixForm({
    resolver,
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
        <Form {...{ ...form, actionData, loaderData }}>
          <Grid>
            <FormField
              control={form.control}
              name="firstname"
              render={({ field }) => (
                <FormItem className="col-span-full md:col-span-3 lg:col-span-6">
                  <FormLabel>Firstname</FormLabel>
                  <FormControl>
                    <Input placeholder="" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastname"
              render={({ field }) => (
                <FormItem className="col-span-full md:col-span-3 lg:col-span-6">
                  <FormLabel>Lastname</FormLabel>
                  <FormControl>
                    <Input placeholder="" type="text" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <Field
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
            /> */}
          </Grid>
          <FormField
            control={form.control}
            name="birthdate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Birthdate</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      className="w-[280px]"
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

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

export default ProfileHome;
