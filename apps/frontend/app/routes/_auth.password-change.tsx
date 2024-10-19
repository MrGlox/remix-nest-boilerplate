import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
// import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

import { Google } from "~/assets/logos";
import { Badge } from "~/components/ui/badge";
import { Button, buttonVariants } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
// import { Loader } from "~/components/ui/loader";

import { Field } from "~/containers/forms";
import { cn } from "~/lib/utils";
// import { Alert, AlertDescription } from "~/components/ui/alert";

export default function SignupPage() {
  const { t } = useTranslation("auth");

  // const { register } = useForm({
  //   email: "",
  //   password: "",
  //   remember: false,
  // });

  function handleSubmit(ev: FormEvent) {}

  return (
    <>
      {/* <Head>
        <title>{t("signup.title")}</title>
        <meta
          head-key="description"
          name="description"
          content={t("signup.description")}
        />
      </Head> */}
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:max-w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("signup.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("signup.description")}
          </p>
        </div>
        <div className={cn("grid gap-6")}>
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
          <form method="POST" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <div className="grid gap-1">
                {/* {!!alert && (
                  <Alert variant="destructive" className="mb-4">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <AlertDescription>
                      {t(
                        `alerts.${
                          (alert as { code: string | undefined })?.code
                        }`,
                        {
                          defaultValue: (alert as { message: string })?.message,
                        }
                      )}
                    </AlertDescription>
                  </Alert>
                )} */}
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
                {t("signup")}
              </Button>
            </div>
          </form>
        </div>
        <div>
          <p className="mt-10 -mb-10 px-8 text-center text-sm text-muted-foreground">
            {t("agree")}{" "}
            <Link to="/terms" className="variant underline-offset-4">
              {t("terms")}
            </Link>{" "}
            {t("and")}{" "}
            <Link to="/privacy" className="variant underline-offset-4">
              {t("privacy")}
            </Link>
            .
          </p>
        </div>
      </div>
    </>
  );
}
