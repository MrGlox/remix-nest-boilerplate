import {
  type LinksFunction,
  type LoaderFunctionArgs,
  json,
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

import { customErrorMap } from "~/config/zod";
import i18next, { i18nCookie } from "~/modules/i18n.server";
import { getOptionalUser } from "~/server/auth.server";
import fontStylesheetUrl from "~/styles/fonts.css?url";
import globalsStylesheetUrl from "~/styles/globals.css?url";
import { resourcesList } from "./config/i18n";

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

  return json(
    {
      // Global
      locale,
      user,
      // Translated meta tags
      title: t("title"),
      description: t("description"),
    } as const,
    {
      headers: {
        "Set-Cookie": await i18nCookie.serialize(locale),
      },
    },
  );
};

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
  const { locale } = useLoaderData<typeof loader>();
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
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
