import { createCookie } from "@remix-run/node"; // or cloudflare/deno

export const cookieConsent = createCookie("_cookie-consent", {
  path: "/",
  sameSite: "lax",
  maxAge: 604_800, // one week
});

export const persistToken = createCookie("_persist-token", {
  path: "/",
  sameSite: "lax",
  maxAge: 3600, // one hour
});

export const alertMessage = createCookie("alertMessage", {
  maxAge: 60, // Durée de vie courte pour garantir qu'il est effacé rapidement
});
