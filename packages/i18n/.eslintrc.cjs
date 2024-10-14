/**
 * Specific eslint rules for this app/package, extends the base rules
 * @see https://github.com/belgattitude/nextjs-monorepo-example/blob/main/docs/about-linters.md
 */

const {
  getDefaultIgnorePatterns,
} = require("@repo/eslint-config-bases/helpers");

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: "tsconfig.json",
  },
  ignorePatterns: [...getDefaultIgnorePatterns()],
  extends: [
    "@repo/eslint-config-bases/typescript",
    // Apply prettier and disable incompatible rules
    "@repo/eslint-config-bases/prettier-plugin",
  ],
  rules: {
    // optional overrides per project
  },
  overrides: [
    // optional overrides per project file match
  ],
};
