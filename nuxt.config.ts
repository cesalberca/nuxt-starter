import fs from "node:fs/promises";
import path from "node:path";

import { defineNuxtConfig } from "nuxt/config";

import pkg from "./package.json";

export default defineNuxtConfig({
  modules: ["@unocss/nuxt", "@vueuse/nuxt", "@pinia/nuxt", "@nuxtjs/i18n", "@nuxt/devtools", "@nuxt/eslint"],
  runtimeConfig: {
    public: {
      appName: pkg.name,
      appVersion: pkg.version,
    },
    auth: {
      session: {
        cookieName: "auth_session",
        maxAge: "2592000", // 30 days
      },
      oidc: {
        rootUrl: "http://localhost:3000",
        clientId: undefined,
        clientSecret: undefined,
        codeVerifierCookieName: "oidc_code_verifier",
        stateCookieName: "oidc_state",
        nonceCookieName: "oidc_nonce",
        issuer: undefined,
        authorizationEndpoint: undefined,
        tokenEndpoint: undefined,
        userInfoEndpoint: undefined,
        endSessionEndpoint: undefined,
        jwksUri: undefined,
        scopes: "openid profile email roles",
        nameAttributePath: "name || preferred_username",
        emailAttributePath: "email",
        roleAttributePath:
          "contains(roles[*], 'admin') && 'admin' || contains(roles[*], 'editor') && 'editor' || 'viewer'",
      },
    },
    logLevel: "info",
  },
  routeRules: {
    "/private": { ssr: false },
    "/profile": { ssr: false },
    "/api/trpc/**": { prerender: false },
  },
  nitro: {
    experimental: {
      tasks: true,
    },
    scheduledTasks: {
      "0 * * * *": ["auth:session-reaper"],
    },
  },
  imports: {
    autoImport: false,
    dirs: [],
  },
  components: {
    dirs: [],
  },
  typescript: {
    shim: false,
  },
  build: {
    transpile: ["primevue", "trpc-nuxt"],
  },
  hooks: {
    "nitro:build:public-assets": async (nitro) => {
      // Copy bin directory to the output directory
      const binInDir = path.join(__dirname, "bin");
      const binOutDir = path.join(nitro.options.output.dir, "bin");
      await fs.cp(binInDir, binOutDir, { recursive: true });

      // Copy Prisma schema and migrations to the output directory
      const prismaInDir = path.join(__dirname, "prisma");
      const prismaOutDir = path.join(nitro.options.output.dir, "prisma");
      await fs.cp(prismaInDir, prismaOutDir, { recursive: true });

      // Copy Prisma schema engine to the output directory
      const prismaEnginesInDir = path.join(__dirname, "node_modules", "@prisma", "engines");
      const prismaEnginesOutDir = path.join(nitro.options.output.serverDir, "node_modules", "@prisma", "engines");
      const prismaEnginesFiles = await fs.readdir(prismaEnginesInDir);
      for (const file of prismaEnginesFiles) {
        if (/^schema-engine-.+$/.test(file)) {
          await fs.cp(path.join(prismaEnginesInDir, file), path.join(prismaEnginesOutDir, file));
        }
      }
    },
  },
  unocss: {
    components: false,
  },
  vueuse: {
    autoImports: false,
  },
  i18n: {
    lazy: true,
    langDir: "locales",
    defaultLocale: "en",
    locales: [
      {
        name: "English",
        code: "en",
        iso: "en-US",
        file: "en-US.ts",
        dir: "ltr",
      },
      {
        name: "Español",
        code: "es",
        iso: "es-ES",
        file: "es-ES.ts",
        dir: "ltr",
      },
    ],
    strategy: "no_prefix",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_locale",
      alwaysRedirect: true,
      fallbackLocale: "en",
    },
  },
  devtools: {
    enabled: true,
  },
  telemetry: false,
});
