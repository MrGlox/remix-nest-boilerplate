import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import {
  ActionFunctionArgs,
  data,
  LoaderFunctionArgs,
  useActionData,
  useLoaderData,
} from "react-router";
import { useRemixForm } from "remix-hook-form";
import { z } from "zod";
import { Container } from "~/components/layout/container";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { alertMessageHelper } from "~/server/cookies.server";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const { message, headers } = await alertMessageHelper(request);
  // const user = await getOptionalUser({ context });

  return data(
    {
      message,
    },
    {
      headers,
    },
  );
};

export const action = async ({ context, request }: ActionFunctionArgs) => {
  return {};
};

const schema = z.object({
  notifications: z.boolean(),
  informations: z.boolean(),
  marketing: z.boolean(),
});

type FormData = z.infer<typeof schema>;
const resolver = zodResolver(schema);

const AccountNotifications = () => {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { t } = useTranslation("dashboard");

  const form = useRemixForm<FormData>({
    resolver,
    defaultValues: {
      notifications: true,
      informations: true,
      marketing: false,
    },
  });

  return (
    <Container className="px-0">
      <header className="flex-1 space-y-4 pt-6 pb-4">
        <h2 className="text-3xl font-bold tracking-tight">
          {t("notifications.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("subscription.description", "Subscription")}
        </p>
        <Separator className="mt-2" />
      </header>
      <main className="max-w-[500px]">
        <Form {...{ ...form, actionData, loaderData }}>
          <FormField
            control={form.control}
            name="notifications"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Notifications emails</FormLabel>
                  <FormDescription>
                    Receive emails about new products, features, and more.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled
                    aria-readonly
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="informations"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Informational emails</FormLabel>
                  <FormDescription>
                    Receive emails about new products, features, and more.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-readonly
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="marketing"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Marketing emails</FormLabel>
                  <FormDescription>
                    Receive emails about new products, features, and more.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-readonly
                  />
                </FormControl>
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

export default AccountNotifications;
