import { ComponentType } from "react";
import { useTranslation } from "react-i18next";

import {
  Step,
  type StepItem,
  Stepper,
  useStepper,
} from "~/components/ui/stepper";
import { Button } from "~/components/ui/button";

import { FirstStep } from "./steps/first";
import { SecondStep } from "./steps/second";
import { ThirdStep } from "./steps/third";

interface StepItemComponent extends StepItem {
  component?: ComponentType;
}

export function OnboardingStepper() {
  const { t } = useTranslation();

  const steps: StepItemComponent[] = [
    {
      id: "step1",
      label: t("dashboard.onboarding.step1.title"),
      description: t("dashboard.onboarding.step1.description"),
      component: (step) => <FirstStep {...step} />,
    },
    {
      id: "step2",
      label: t("dashboard.onboarding.step2.title"),
      description: t("dashboard.onboarding.step2.description"),
      component: (step) => <SecondStep {...step} />,
    },
    {
      id: "step3",
      label: t("dashboard.onboarding.step3.title"),
      description: t("dashboard.onboarding.step3.description"),
      component: (step) => <ThirdStep {...step} />,
    },
  ];

  return (
    <div className="flex w-full justify-start flex-col gap-4 py-10 min-h-[calc(100vh-270px)]">
      <Stepper variant="line" initialStep={0} steps={steps}>
        {steps.map(({ component, ...step }) => (
          <Step key={step.id} {...step}>
            {(component as Function)(step)}
          </Step>
        ))}
        <Footer />
      </Stepper>
    </div>
  );
}

const Footer = () => {
  const { t } = useTranslation();

  const {
    prevStep,
    isDisabledStep,
    hasCompletedAllSteps,
    // nextStep, isLastStep, isOptionalStep
  } = useStepper();

  return (
    <>
      {hasCompletedAllSteps && (
        <div className="flex items-center justify-center my-2 border bg-muted text-primary rounded-md">
          <h1 className="text-xl">Woohoo! All steps completed! 🎉</h1>
        </div>
      )}
      <div className="w-full flex justify-between gap-2 mt-auto">
        <Button
          disabled={isDisabledStep}
          onClick={prevStep}
          size="sm"
          variant="secondary"
        >
          {t("common.prev")}
        </Button>
        {/* <Button size="sm" onClick={nextStep}>
          {isLastStep ? t('common.finish') : isOptionalStep ? t('common.skip') : t('common.next')}
        </Button> */}
      </div>
    </>
  );
};
