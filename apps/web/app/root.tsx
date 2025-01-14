import {
  ActionFunctionArgs,
  type LinksFunction,
  type LoaderFunctionArgs,
  replace,
} from "react-router";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "react-router";

import { useTranslation } from "react-i18next";
import { z } from "zod";

import { type RemixService } from "../../server";

import { resourcesList } from "~/config/i18n";
import { customErrorMap } from "~/config/zod";
import { CookieBanner } from "~/containers/cookie-banner";
import i18next, { i18nCookie } from "~/modules/i18n.server";
import { getOptionalUser } from "~/server/auth.server";
import { cookieConsent } from "~/server/cookies.server";
import fontStylesheetUrl from "~/styles/fonts.css?url";
import globalsStylesheetUrl from "~/styles/globals.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: fontStylesheetUrl },
  { rel: "stylesheet", href: globalsStylesheetUrl },
];

export const handle = {
  // In the handle export, we can add a i18n key with namespaces our route
  // will need to load. This key can be a single string or an array of strings.
  i18n: resourcesList,
};

export { meta } from "~/config/meta";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const t = await i18next.getFixedT(request, "common");

  const locale = await i18next.getLocale(request);
  const user = await getOptionalUser({ context });

  const cookieHeader = request.headers.get("Cookie");
  const { showBanner, cookieConsent: cookieConsentValue } =
    (await cookieConsent.parse(cookieHeader)) || {
      showBanner: true,
    };

  return {
    // Global
    locale,
    user,
    showBanner,
    cookieConsent: cookieConsentValue,
    // Translated meta tags
    title: t("title", { website: process.env.APP_NAME }),
    description: t("description"),
  };
};

export async function action({ request }: ActionFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");

  const locale = await i18next.getLocale(request);
  const cookie = (await cookieConsent.parse(cookieHeader)) || {};

  const bodyParams = await request.formData();

  if (bodyParams.get("cookieConsent") === "rejected") {
    cookie.cookieConsent = false;
    cookie.showBanner = false;

    return replace((bodyParams.get("currentRoute") as string) || "/", {
      headers: {
        "Set-Cookie": await cookieConsent.serialize(cookie),
      },
    });
  }

  cookie.cookieConsent = true;
  cookie.showBanner = false;

  return replace((bodyParams.get("currentRoute") as string) || "/", {
    headers: [
      ["Set-Cookie", await cookieConsent.serialize(cookie)],
      ["Set-Cookie", await i18nCookie.serialize(locale)],
    ],
  });
}

declare module "react-router" {
  interface AppLoadContext {
    remixService: RemixService;
    user: unknown;
  }
}

export default function Root() {
  // Get the locale from the loader
  const { showBanner } = useLoaderData<typeof loader>();
  const { i18n } = useTranslation();

  z.setErrorMap(customErrorMap);

  return (
    <html lang={i18n.language} dir={i18n.dir()} className="min-h-screen">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen flex flex-col">
        <Outlet />
        {showBanner && <CookieBanner />}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
