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
  useRouteLoaderData,
} from "@remix-run/react";

import { getOptionalUser } from "./server/auth.server";
import fontStylesheetUrl from "./styles/fonts.css?url";
import globalsStylesheetUrl from "./styles/globals.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: fontStylesheetUrl },
  { rel: "stylesheet", href: globalsStylesheetUrl },
];

export const meta: MetaFunction = () => [
  { charset: "utf-8" },
  { title: "Remix watch-over Stack" },
  { viewport: "width=device-width,initial-scale=1" },
];

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const user = await getOptionalUser({ context });
  return json({
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
  return (
    <html lang="en" className="h-full">
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
