import { reactRouter } from "@react-router/dev/vite";

import { defineConfig } from "vite";
import { envOnlyMacros } from "vite-env-only";
import tsconfigPaths from "vite-tsconfig-paths";

const MODE = process.env.NODE_ENV;

declare module "react-router" {
  interface Future {
    v3_singleFetch: true;
    v3_fetcherPersist: true;
    v3_lazyRouteDiscovery: true;
    v3_relativeSplatPath: true;
    // v3_routeConfig: true;
    v3_throwAbortReason: true;
    // unstable_optimizeDeps: true;
  }
}

export default defineConfig({
  resolve: {
    preserveSymlinks: true,
  },
  build: {
    cssMinify: MODE === "production",
    sourcemap: true,
    commonjsOptions: {
      include: [/web/, /server/, /node_modules/],
    },
  },
  plugins: [
    envOnlyMacros(),
    tsconfigPaths({}),
    reactRouter(),
    // remix({
    //   ignoredRouteFiles: ["**/*"],
    //   future: {
    //     v3_fetcherPersist: true,
    //     v3_lazyRouteDiscovery: true,
    //     v3_relativeSplatPath: true,
    //     v3_singleFetch: true,
    //     // v3_routeConfig: true,
    //     v3_throwAbortReason: true,
    //     unstable_optimizeDeps: true,
    //   },

    //   // When running locally in development mode, we use the built in remix
    //   // server. This does not understand the vercel lambda module format,
    //   // so we default back to the standard build output.
    //   // ignoredRouteFiles: ['**/.*', '**/*.test.{js,jsx,ts,tsx}'],
    //   serverModuleFormat: "esm",

    //   routes: async (defineRoutes) => {
    //     return flatRoutes("routes", defineRoutes, {
    //       ignoredRouteFiles: [
    //         ".*",
    //         "**/*.css",
    //         "**/*.test.{js,jsx,ts,tsx}",
    //         "**/__*.*",

    //         // This is for server-side utilities you want to colocate next to
    //         // your routes without making an additional directory.
    //         // If you need a route that includes "server" or "client" in the
    //         // filename, use the escape brackets like: my-route.[server].tsx
    //         "**/*.server.*",
    //         "**/*.client.*",
    //       ],

    //       // Since process.cwd() is the server directory, we need to resolve the path to remix project
    //       appDir: resolve(__dirname, "app"),
    //     });
    //   },
    // }),
  ],
  optimizeDeps: { esbuildOptions: { target: "esnext" } },
});
