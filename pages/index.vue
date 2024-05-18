<script setup lang="ts">
import { definePageMeta } from "#imports";

definePageMeta({
  title: "pages.home.title",
});
</script>

<template>
  <div>
    <h2>{{ $t("pages.home.title") }}</h2>
    <p>{{ $t("pages.home.description") }}</p>
  </div>
</template>

<style scoped lang="scss"></style>
