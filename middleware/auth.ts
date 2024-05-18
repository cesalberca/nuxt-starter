import { defineNuxtRouteMiddleware, navigateTo, useRequestFetch } from "nuxt/app";

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) {
    return;
  }

  if (await useRequestFetch()("/api/user")) {
    return;
  }

  return navigateTo(
    {
      path: "/login",
      query: { redirect: to.fullPath },
    },
    {
      external: true,
    },
  );
});
