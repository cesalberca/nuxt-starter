import { watchOnce } from "@vueuse/core";
import { ref } from "vue";

export const isHydrated = ref(false);

export const onHydrated = async (cb: () => unknown) => {
  watchOnce(isHydrated, () => cb(), { immediate: isHydrated.value });
};
