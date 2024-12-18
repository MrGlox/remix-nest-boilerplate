// import { serverOnly$ } from "vite-env-only/macros";
// import { resolve } from "node:path";

import { createCookie } from "react-router";
import Backend from "i18next-fs-backend";
import { RemixI18Next } from "remix-i18next/server";

import * as i18n from "~/config/i18n";

export const i18nCookie = createCookie("_i18n", {
  path: "/",
  sameSite: "lax",
  httpOnly: true,
  maxAge: 604_800,
  secrets: [process.env.SESSION_SECRET || "SESSION_SECRET"],
  secure: process.env.NODE_ENV === "production",
});

export default new RemixI18Next({
  detection: {
    cookie: i18nCookie,
    supportedLanguages: i18n.supportedLngs,
    fallbackLanguage: i18n.fallbackLng,
  },

  // This is the configuration for i18next used
  // when translating messages server-side only
  i18next: {
    ...i18n,
    // backend: {
    //   loadPath: serverOnly$(resolve("@repo/i18n/locales/{{lng}}/{{ns}}.json")),
    // },
  },

  // The i18next plugins you want RemixI18next to use for `i18n.getFixedT` inside loaders and actions.
  // E.g. The Backend plugin for loading translations from the file system
  // Tip: You could pass `resources` to the `i18next` configuration and avoid a backend here
  plugins: [Backend],
});
