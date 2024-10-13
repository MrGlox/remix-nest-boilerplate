// import { serverOnly$ } from "vite-env-only/macros";

// import { createCookie } from "@remix-run/node";
// import Backend from "i18next-fs-backend";
// import { RemixI18Next } from "remix-i18next/server";

// import * as i18n from "@repo/translations/config";

// export const localeCookie = createCookie("lng", {
//   path: "/",
//   sameSite: "lax",
//   secure: process.env.NODE_ENV === "production",
//   httpOnly: true,
// });

// export default new RemixI18Next({
//   detection: {
//     supportedLanguages: i18n.supportedLngs,
//     fallbackLanguage: i18n.fallbackLng,
//     cookie: localeCookie,
//   },

//   // This is the configuration for i18next used
//   // when translating messages server-side only
//   i18next: {
//     ...i18n,
//   },

//   // The i18next plugins you want RemixI18next to use for `i18n.getFixedT` inside loaders and actions.
//   // E.g. The Backend plugin for loading translations from the file system
//   // Tip: You could pass `resources` to the `i18next` configuration and avoid a backend here
//   plugins: [Backend],
// });
