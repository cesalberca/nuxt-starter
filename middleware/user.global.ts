import { defineNuxtRouteMiddleware } from "nuxt/app";

import { isHydrated, onHydrated } from "~/composables/vue";
import { useUserStore } from "~/stores/user";

const handleMiddleware = () => {
  const userStore = useUserStore();
  return userStore.fetchUser();
};

export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) {
    return;
  }

  if (isHydrated.value) {
    return handleMiddleware();
  }

  onHydrated(() => handleMiddleware());
});
