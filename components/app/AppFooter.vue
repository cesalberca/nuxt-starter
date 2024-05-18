<script setup lang="ts">
import { useRuntimeConfig } from "nuxt/app";

const config = useRuntimeConfig();
</script>

<template>
  <div class="my-6 font-medium">
    <hr class="b-1" />
    <span>{{ config.public.appName }} - {{ config.public.appVersion }}</span>
  </div>
</template>

<style scoped lang="scss"></style>
