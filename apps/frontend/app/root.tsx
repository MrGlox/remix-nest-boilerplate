import { type RemixService } from "../../backend";

import {
  json,
  MetaFunction,
  type LinksFunction,
  type LoaderFunctionArgs,
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

import i18next from "~/modules/i18n.server";
import fontStylesheetUrl from "~/styles/fonts.css?url";
import globalsStylesheetUrl from "~/styles/globals.css?url";

import { getOptionalUser } from "~/server/auth.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: fontStylesheetUrl },
  { rel: "stylesheet", href: globalsStylesheetUrl },
];

export const meta: MetaFunction = () => [
  { charset: "utf-8" },
  { title: "Remix watch-over Stack" },
  { viewport: "width=device-width,initial-scale=1" },
];

export const handle = {
  // In the handle export, we can add a i18n key with namespaces our route
  // will need to load. This key can be a single string or an array of strings.
  // TIP: In most cases, you should set this to your defaultNS from your i18n config
  // or if you did not set one, set it to the i18next default namespace "translation"
  i18n: "common",
};

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const locale = await i18next.getLocale(request);
  const user = await getOptionalUser({ context });

  return json({
    locale,
    user,
  });
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

  return (
    <html lang={locale} dir={i18n.dir()} className="h-full">
      <head>
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
