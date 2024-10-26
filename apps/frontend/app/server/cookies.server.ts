import { createCookie } from "@remix-run/node"; // or cloudflare/deno

export const cookieConsent = createCookie("_cookie-consent", {
  path: "/",
  sameSite: "lax",
  maxAge: 604_800, // one week
});
