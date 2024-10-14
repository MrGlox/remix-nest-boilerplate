import type admin from "./locales/en/alerts.json";
import type auth from "./locales/en/auth.json";
import type common from "./locales/en/common.json";
import type demo from "./locales/en/dashboard.json";
import type home from "./locales/en/errors.json";
import type navigation from "./locales/en/messages.json";
import type system from "./locales/en/validator.json";

export interface I18nResources {
  admin: typeof admin;
  auth: typeof auth;
  common: typeof common;
  demo: typeof demo;
  home: typeof home;
  navigation: typeof navigation;
  system: typeof system;
}
