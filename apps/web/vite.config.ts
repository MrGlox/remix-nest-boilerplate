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
  plugins: [envOnlyMacros(), tsconfigPaths({}), reactRouter()],
  optimizeDeps: { esbuildOptions: { target: "esnext" } },
});
