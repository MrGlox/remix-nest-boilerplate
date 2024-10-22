// ../frontend/vite.config.ts
import { resolve } from "node:path";
import { vitePlugin as remix } from "file:///Users/mleroux/Web/remix-nest-boilerplate/node_modules/@remix-run/dev/dist/index.js";
import { installGlobals } from "file:///Users/mleroux/Web/remix-nest-boilerplate/node_modules/@remix-run/node/dist/index.js";
import { flatRoutes } from "file:///Users/mleroux/Web/remix-nest-boilerplate/node_modules/remix-flat-routes/dist/index.js";
import { defineConfig } from "file:///Users/mleroux/Web/remix-nest-boilerplate/node_modules/vite/dist/node/index.js";
import {
  envOnlyMacros
} from "file:///Users/mleroux/Web/remix-nest-boilerplate/node_modules/vite-env-only/dist/index.js";
import tsconfigPaths from "file:///Users/mleroux/Web/remix-nest-boilerplate/node_modules/vite-tsconfig-paths/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/mleroux/Web/remix-nest-boilerplate/apps/frontend";
var MODE = process.env.NODE_ENV;
installGlobals();
var vite_config_default = defineConfig({
  resolve: {
    preserveSymlinks: true
  },
  build: {
    cssMinify: MODE === "production",
    sourcemap: true,
    commonjsOptions: {
      include: [/frontend/, /backend/, /node_modules/]
    }
  },
  plugins: [
    envOnlyMacros(),
    // cjsInterop({
    // 	dependencies: ['remix-utils', 'is-ip', '@markdoc/markdoc'],
    // }),
    tsconfigPaths({}),
    remix({
      ignoredRouteFiles: ["**/*"],
      future: {
        v3_fetcherPersist: true
      },
      // When running locally in development mode, we use the built in remix
      // server. This does not understand the vercel lambda module format,
      // so we default back to the standard build output.
      // ignoredRouteFiles: ['**/.*', '**/*.test.{js,jsx,ts,tsx}'],
      serverModuleFormat: "esm",
      routes: async (defineRoutes) => {
        return flatRoutes("routes", defineRoutes, {
          ignoredRouteFiles: [
            ".*",
            "**/*.css",
            "**/*.test.{js,jsx,ts,tsx}",
            "**/__*.*"
            // This is for server-side utilities you want to colocate next to
            // your routes without making an additional directory.
            // If you need a route that includes "server" or "client" in the
            // filename, use the escape brackets like: my-route.[server].tsx
            // 	'**/*.server.*',
            // 	'**/*.client.*',
          ],
          // Since process.cwd() is the server directory, we need to resolve the path to remix project
          appDir: resolve(__vite_injected_original_dirname, "app")
        });
      }
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vZnJvbnRlbmQvdml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvbWxlcm91eC9XZWIvcmVtaXgtbmVzdC1ib2lsZXJwbGF0ZS9hcHBzL2Zyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvbWxlcm91eC9XZWIvcmVtaXgtbmVzdC1ib2lsZXJwbGF0ZS9hcHBzL2Zyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9tbGVyb3V4L1dlYi9yZW1peC1uZXN0LWJvaWxlcnBsYXRlL2FwcHMvZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyByZXNvbHZlIH0gZnJvbSBcIm5vZGU6cGF0aFwiO1xuXG5pbXBvcnQgeyB2aXRlUGx1Z2luIGFzIHJlbWl4IH0gZnJvbSBcIkByZW1peC1ydW4vZGV2XCI7XG5pbXBvcnQgeyBpbnN0YWxsR2xvYmFscyB9IGZyb20gXCJAcmVtaXgtcnVuL25vZGVcIjtcblxuaW1wb3J0IHsgZmxhdFJvdXRlcyB9IGZyb20gXCJyZW1peC1mbGF0LXJvdXRlc1wiO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCB7XG4gIGVudk9ubHlNYWNyb3MsXG4gIC8vIGRlbnlJbXBvcnRzXG59IGZyb20gXCJ2aXRlLWVudi1vbmx5XCI7XG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tIFwidml0ZS10c2NvbmZpZy1wYXRoc1wiO1xuXG5jb25zdCBNT0RFID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlY7XG5pbnN0YWxsR2xvYmFscygpO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICByZXNvbHZlOiB7XG4gICAgcHJlc2VydmVTeW1saW5rczogdHJ1ZSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBjc3NNaW5pZnk6IE1PREUgPT09IFwicHJvZHVjdGlvblwiLFxuICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgICBjb21tb25qc09wdGlvbnM6IHtcbiAgICAgIGluY2x1ZGU6IFsvZnJvbnRlbmQvLCAvYmFja2VuZC8sIC9ub2RlX21vZHVsZXMvXSxcbiAgICB9LFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgZW52T25seU1hY3JvcygpLFxuICAgIC8vIGNqc0ludGVyb3Aoe1xuICAgIC8vIFx0ZGVwZW5kZW5jaWVzOiBbJ3JlbWl4LXV0aWxzJywgJ2lzLWlwJywgJ0BtYXJrZG9jL21hcmtkb2MnXSxcbiAgICAvLyB9KSxcbiAgICB0c2NvbmZpZ1BhdGhzKHt9KSxcbiAgICByZW1peCh7XG4gICAgICBpZ25vcmVkUm91dGVGaWxlczogW1wiKiovKlwiXSxcbiAgICAgIGZ1dHVyZToge1xuICAgICAgICB2M19mZXRjaGVyUGVyc2lzdDogdHJ1ZSxcbiAgICAgIH0sXG5cbiAgICAgIC8vIFdoZW4gcnVubmluZyBsb2NhbGx5IGluIGRldmVsb3BtZW50IG1vZGUsIHdlIHVzZSB0aGUgYnVpbHQgaW4gcmVtaXhcbiAgICAgIC8vIHNlcnZlci4gVGhpcyBkb2VzIG5vdCB1bmRlcnN0YW5kIHRoZSB2ZXJjZWwgbGFtYmRhIG1vZHVsZSBmb3JtYXQsXG4gICAgICAvLyBzbyB3ZSBkZWZhdWx0IGJhY2sgdG8gdGhlIHN0YW5kYXJkIGJ1aWxkIG91dHB1dC5cbiAgICAgIC8vIGlnbm9yZWRSb3V0ZUZpbGVzOiBbJyoqLy4qJywgJyoqLyoudGVzdC57anMsanN4LHRzLHRzeH0nXSxcbiAgICAgIHNlcnZlck1vZHVsZUZvcm1hdDogXCJlc21cIixcblxuICAgICAgcm91dGVzOiBhc3luYyAoZGVmaW5lUm91dGVzKSA9PiB7XG4gICAgICAgIHJldHVybiBmbGF0Um91dGVzKFwicm91dGVzXCIsIGRlZmluZVJvdXRlcywge1xuICAgICAgICAgIGlnbm9yZWRSb3V0ZUZpbGVzOiBbXG4gICAgICAgICAgICBcIi4qXCIsXG4gICAgICAgICAgICBcIioqLyouY3NzXCIsXG4gICAgICAgICAgICBcIioqLyoudGVzdC57anMsanN4LHRzLHRzeH1cIixcbiAgICAgICAgICAgIFwiKiovX18qLipcIixcbiAgICAgICAgICAgIC8vIFRoaXMgaXMgZm9yIHNlcnZlci1zaWRlIHV0aWxpdGllcyB5b3Ugd2FudCB0byBjb2xvY2F0ZSBuZXh0IHRvXG4gICAgICAgICAgICAvLyB5b3VyIHJvdXRlcyB3aXRob3V0IG1ha2luZyBhbiBhZGRpdGlvbmFsIGRpcmVjdG9yeS5cbiAgICAgICAgICAgIC8vIElmIHlvdSBuZWVkIGEgcm91dGUgdGhhdCBpbmNsdWRlcyBcInNlcnZlclwiIG9yIFwiY2xpZW50XCIgaW4gdGhlXG4gICAgICAgICAgICAvLyBmaWxlbmFtZSwgdXNlIHRoZSBlc2NhcGUgYnJhY2tldHMgbGlrZTogbXktcm91dGUuW3NlcnZlcl0udHN4XG4gICAgICAgICAgICAvLyBcdCcqKi8qLnNlcnZlci4qJyxcbiAgICAgICAgICAgIC8vIFx0JyoqLyouY2xpZW50LionLFxuICAgICAgICAgIF0sXG4gICAgICAgICAgLy8gU2luY2UgcHJvY2Vzcy5jd2QoKSBpcyB0aGUgc2VydmVyIGRpcmVjdG9yeSwgd2UgbmVlZCB0byByZXNvbHZlIHRoZSBwYXRoIHRvIHJlbWl4IHByb2plY3RcbiAgICAgICAgICBhcHBEaXI6IHJlc29sdmUoX19kaXJuYW1lLCBcImFwcFwiKSxcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgIH0pLFxuICBdLFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXVWLFNBQVMsZUFBZTtBQUUvVyxTQUFTLGNBQWMsYUFBYTtBQUNwQyxTQUFTLHNCQUFzQjtBQUUvQixTQUFTLGtCQUFrQjtBQUMzQixTQUFTLG9CQUFvQjtBQUM3QjtBQUFBLEVBQ0U7QUFBQSxPQUVLO0FBQ1AsT0FBTyxtQkFBbUI7QUFYMUIsSUFBTSxtQ0FBbUM7QUFhekMsSUFBTSxPQUFPLFFBQVEsSUFBSTtBQUN6QixlQUFlO0FBRWYsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1Asa0JBQWtCO0FBQUEsRUFDcEI7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFdBQVcsU0FBUztBQUFBLElBQ3BCLFdBQVc7QUFBQSxJQUNYLGlCQUFpQjtBQUFBLE1BQ2YsU0FBUyxDQUFDLFlBQVksV0FBVyxjQUFjO0FBQUEsSUFDakQ7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxjQUFjO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFJZCxjQUFjLENBQUMsQ0FBQztBQUFBLElBQ2hCLE1BQU07QUFBQSxNQUNKLG1CQUFtQixDQUFDLE1BQU07QUFBQSxNQUMxQixRQUFRO0FBQUEsUUFDTixtQkFBbUI7QUFBQSxNQUNyQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFNQSxvQkFBb0I7QUFBQSxNQUVwQixRQUFRLE9BQU8saUJBQWlCO0FBQzlCLGVBQU8sV0FBVyxVQUFVLGNBQWM7QUFBQSxVQUN4QyxtQkFBbUI7QUFBQSxZQUNqQjtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFVBT0Y7QUFBQTtBQUFBLFVBRUEsUUFBUSxRQUFRLGtDQUFXLEtBQUs7QUFBQSxRQUNsQyxDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
