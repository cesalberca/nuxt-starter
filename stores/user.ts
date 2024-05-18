import type { inferRouterOutputs } from "@trpc/server";
import { useNuxtApp } from "nuxt/app";
import { defineStore } from "pinia";
import { ref } from "vue";

import type { AppRouter } from "~/server/trpc/routers";

type RouterInput = inferRouterOutputs<AppRouter>;

export const useUserStore = defineStore("user", () => {
  const { $client } = useNuxtApp();

  const user = ref<RouterInput["user"]["get"]>(null);

  const fetchUser = async () => {
    user.value = await $client.user.get.query();
  };

  const saveUser = async () => {
    if (user.value) {
      await $client.user.update.mutate(user.value);
    }
  };

  return { user, fetchUser, saveUser };
});
