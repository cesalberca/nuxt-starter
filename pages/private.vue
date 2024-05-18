<script setup lang="ts">
import { definePageMeta } from "#imports";

definePageMeta({
  title: "pages.private.title",
  middleware: ["auth"],
});
</script>

<template>
  <div>
    <h2>{{ $t("pages.private.title") }}</h2>
    <p>{{ $t("pages.private.description") }}</p>
  </div>
</template>

<style scoped lang="scss"></style>
