import {
  ActionFunctionArgs,
  type LinksFunction,
  type LoaderFunctionArgs,
  json,
  replace,
} from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteLoaderData,
} from "@remix-run/react";

import { useTranslation } from "react-i18next";
import { useChangeLanguage } from "remix-i18next/react";
import { z } from "zod";

import { type RemixService } from "../../backend";

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

  return json({
    // Global
    locale,
    user,
    showBanner,
    cookieConsent: cookieConsentValue,
    // Translated meta tags
    title: t("title", { website: process.env.APP_NAME }),
    description: t("description"),
  } as const);
};

export async function action({ request }: ActionFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");

  const locale = await i18next.getLocale(request);
  const cookie = (await cookieConsent.parse(cookieHeader)) || {};

  const bodyParams = await request.formData();
  console.log("cookieHeader", locale);

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

export const useOptionalUser = () => {
  const data = useRouteLoaderData<typeof loader>("root");

  if (!data) {
    return null;
    // throw new Error('Root Loader did not return anything')
  }

  return data.user;
};

export const useUser = () => {
  const user = useOptionalUser();
  if (!user) {
    // return null;
    throw new Error("L'utilisateur n'est pas connecté");
  }
  return user;
};

declare module "@remix-run/node" {
  interface AppLoadContext {
    remixService: RemixService;
    user: unknown;
  }
}

export default function Root() {
  // Get the locale from the loader
  const { locale, showBanner } = useLoaderData<typeof loader>();
  const { i18n } = useTranslation();

  // This hook will change the i18n instance language to the current locale
  // detected by the loader, this way, when we do something to change the
  // language, this locale will change and i18next will load the correct
  // translation files
  useChangeLanguage(locale);
  z.setErrorMap(customErrorMap);

  return (
    <html lang={i18n.language} dir={i18n.dir()} className="h-full">
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
