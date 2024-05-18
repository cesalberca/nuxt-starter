import { defineNuxtPlugin } from "nuxt/app";

import PrimeVue from "primevue/config";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue);
});
