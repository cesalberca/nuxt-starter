import eslintConfigUnocss from "@unocss/eslint-config/flat";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(eslintConfigUnocss, eslintConfigPrettier, {
  languageOptions: {
    ecmaVersion: 2024,
    sourceType: "module",
    globals: {
      ...globals.browser,
      ...globals.node,
    },
  },
  rules: {
    "no-console": ["error", { allow: ["trace", "debug", "info", "warn", "error"] }],
    // TODO: remove when primefaces/primevue#4175 is fixed
    "@typescript-eslint/no-explicit-any": ["off"],
  },
  ignores: ["node_modules/**", ".nitro/**", ".nuxt/**", ".output/**", "dist/**"],
});
