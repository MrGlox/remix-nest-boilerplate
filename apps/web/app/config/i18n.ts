import { serverOnly$ } from "vite-env-only/macros";

import alertsEN from "~/locales/en/alerts.json";
import authEN from "~/locales/en/auth.json";
import commonEN from "~/locales/en/common.json";
import dashboardEN from "~/locales/en/dashboard.json";
import validationsEN from "~/locales/en/validations.json";

import alertsFR from "~/locales/fr/alerts.json";
import authFR from "~/locales/fr/auth.json";
import commonFR from "~/locales/fr/common.json";
import dashboardFR from "~/locales/fr/dashboard.json";
import validationsFR from "~/locales/fr/validations.json";

// This is the list of languages your application supports, the last one is your
// fallback language
export const supportedLngs = ["en", "fr"];

// This is the language you want to use in case
// the user language is not in the supportedLngs
export const fallbackLng = "en";

// The default namespace of i18next is "translation", but you can customize it
export const defaultNS = "common";

export const resources = serverOnly$({
  en: {
    alerts: alertsEN,
    auth: authEN,
    common: commonEN,
    dashboard: dashboardEN,
    validations: validationsEN,
  },
  fr: {
    alerts: alertsFR,
    auth: authFR,
    common: commonFR,
    dashboard: dashboardFR,
    validations: validationsFR,
  },
});

export const resourcesList = [
  "alerts",
  "auth",
  "common",
  "dashboard",
  "notifications",
  "validations",
];
