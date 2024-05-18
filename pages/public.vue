<script setup lang="ts">
import { definePageMeta } from "#imports";

definePageMeta({
  title: "pages.public.title",
});
</script>

<template>
  <div>
    <h2>{{ $t("pages.public.title") }}</h2>
    <p>{{ $t("pages.public.description") }}</p>
  </div>
</template>

<style scoped lang="scss"></style>
