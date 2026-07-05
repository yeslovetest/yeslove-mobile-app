// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const eslintConfigPrettier = require("eslint-config-prettier");

module.exports = defineConfig([
  expoConfig,
  {
    rules: {
      // Enforce a consistent, readable import order. Kept at "warn" so it does
      // not block work on the existing codebase; lint-staged auto-fixes it on
      // commit, so ordering converges file-by-file as code is touched.
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
            "object",
            "type",
          ],
          pathGroups: [{ pattern: "@/**", group: "internal", position: "after" }],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },
  // Disable ESLint rules that conflict with Prettier. Must come last so it wins.
  eslintConfigPrettier,
  {
    // Generated / vendored code is not hand-maintained — don't lint it.
    ignores: ["dist/*", "generated-api/*", "node_modules/*"],
  },
]);
