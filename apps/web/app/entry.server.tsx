/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import { PassThrough } from "node:stream";

import {
  ServerRouter,
  type AppLoadContext,
  type EntryContext,
} from "react-router";
import { createInstance, type i18n as i18next } from "i18next";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { I18nextProvider, initReactI18next } from "react-i18next";

import * as i18n from "./config/i18n";
import i18nServer from "./modules/i18n.server";
import { createReadableStreamFromReadable } from "@react-router/node";

const ABORT_DELAY = 5_000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  // This is ignored so we can keep it in the template for visibility.  Feel
  // free to delete this parameter in your app if you're not using it!
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadContext: AppLoadContext,
) {
  const instance = createInstance();

  const lng = await i18nServer.getLocale(request);
  const ns = i18nServer.getRouteNamespaces(remixContext);

  await instance.use(initReactI18next).init({ ...i18n, lng, ns });

  return isbot(request.headers.get("user-agent") || "")
    ? handleBotRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext,
        loadContext,
        instance,
      )
    : handleBrowserRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext,
        loadContext,
        instance,
      );
}

async function handleBotRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  _loadContext: AppLoadContext,
  i18next: i18next,
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;

    const { pipe, abort } = renderToPipeableStream(
      <I18nextProvider i18n={i18next}>
        <ServerRouter
          context={remixContext}
          url={request.url}
          abortDelay={ABORT_DELAY}
        />
      </I18nextProvider>,
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;

          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error);
          }
        },
      },
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

async function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  _loadContext: AppLoadContext,
  i18next: i18next,
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;

    const { pipe, abort } = renderToPipeableStream(
      <I18nextProvider i18n={i18next}>
        <ServerRouter
          context={reactRouterContext}
          url={request.url}
          abortDelay={ABORT_DELAY}
        />
      </I18nextProvider>,
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error);
          }
        },
      },
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

// import { resolve } from "node:path";
// import { createInstance } from "i18next";
// import Backend from "i18next-fs-backend";
// import { isbot } from "isbot";

// import { I18nextProvider, initReactI18next } from "react-i18next";
// import type { EntryContext } from "react-router";
// import { ServerRouter } from "react-router";

// import * as i18n from "./config/i18n";
// import i18next from "./modules/i18n.server";

// import ReactDOMServer from "react-dom/server";

// export default async function handleRequest(
//   request: Request,
//   responseStatusCode: number,
//   responseHeaders: Headers,
//   reactRouterContext: EntryContext,
// ) {
//   const instance = createInstance();
//   // i18next.server.tsにあるRemixI18Nextを使い、言語を取得する
//   const lng = await i18next.getLocale(request);
//   const ns = i18next.getRouteNamespaces(reactRouterContext);

//   await instance
//     .use(initReactI18next)
//     .use(Backend)
//     .init({
//       ...i18n,
//       lng,
//       ns,
//       backend: { loadPath: resolve("./public/locales/{{lng}}/{{ns}}.json") },
//     });

//   const { pipe } = await ReactDOMServer.renderToPipeableStream(
//     <I18nextProvider i18n={instance}>
//       <ServerRouter context={reactRouterContext} url={request.url} />
//     </I18nextProvider>,
//     {
//       onError(error: unknown) {
//         console.error(error);
//         responseStatusCode = 500;
//       },
//     },
//   );

//   if (isbot(request.headers.get("user-agent") || "")) {
//     await new Promise((resolve) => {
//       pipe(resolve);
//     });
//   }

//   responseHeaders.set("Content-Type", "text/html");
//   const stream = new ReadableStream({
//     start(controller) {
//       pipe(controller);
//     },
//   });

//   return new Response(stream, {
//     headers: responseHeaders,
//     status: responseStatusCode,
//   });
// }
