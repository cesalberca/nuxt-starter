<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import Dropdown from "primevue/dropdown";

const i18n = useI18n();

const locale = computed({
  get: () => i18n.locale.value,
  set: (code) => i18n.setLocale(code),
});
</script>

<template>
  <Dropdown v-model="locale" :options="i18n.locales.value" option-label="name" option-value="code"></Dropdown>
</template>

<style scoped lang="scss"></style>
