<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

import { useHeadSafe } from "#imports";

import AppContainer from "~/components/app/AppContainer.vue";
import AppFooter from "~/components/app/AppFooter.vue";
import AppHeader from "~/components/app/AppHeader.vue";

const route = useRoute();

const i18n = useI18n();

useHeadSafe(
  computed(() => ({
    htmlAttrs: {
      lang: i18n.localeProperties.value.iso,
      dir: i18n.localeProperties.value.dir ?? i18n.defaultDirection,
    },
    title: i18n.t("layouts.default.title", { page: i18n.t(route.meta.title as string) }),
    meta: [{ name: "description", content: i18n.t("layouts.default.description") }],
  })),
);
</script>

<template>
  <div>
    <AppHeader />
    <AppContainer>
      <slot />
      <AppFooter />
    </AppContainer>
  </div>
</template>

<style scoped lang="scss"></style>
