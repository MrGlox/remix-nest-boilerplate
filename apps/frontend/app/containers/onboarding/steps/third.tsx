import { useTranslation } from "react-i18next";

import { useStepper } from "~/components/stepper";
import { Loader } from "~/components/loader";
import GoogleIcon from "#resources/assets/logo/google.svg";

import { buttonVariants } from "~/components/button";
import { cn } from "~/lib/utils";

export function FirstStep({ ...stepProps }) {
  const { t } = useTranslation();
  const { id, description } = stepProps;

  const { nextStep } = useStepper();

  return (
    <div
      key={id}
      className="flex items-center justify-center my-2 border bg-muted rounded-md p-4 min-h-[75vh]"
    >
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:max-w-[350px]">
        <div className="flex flex-col">
          <header className="flex flex-col mb-10">
            <h1 className="text-2xl font-semibold tracking-tight text-center mb-2">
              {description}
            </h1>
            <p className="text-sm text-muted-foreground text-center">
              {t("dashboard.onboarding.step1.subtitle")}
            </p>
          </header>
          <a
            href="/google/redirect"
            className={cn(
              "relative inline-flex ",
              buttonVariants({ variant: "outline" }),
            )}
          >
            <span className="inline-flex items-center">
              <img src={GoogleIcon} className="mr-2 h-4 w-4" />
              Google
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
