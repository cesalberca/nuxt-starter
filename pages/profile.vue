<script setup lang="ts">
import { storeToRefs } from "pinia";

import { definePageMeta } from "#imports";

import Button from "primevue/button";
import InputText from "primevue/inputtext";

import { faSave } from "@fortawesome/free-solid-svg-icons";
import Fa from "vue-fa";

import { useUserStore } from "~/stores/user";

definePageMeta({
  title: "pages.profile.title",
  middleware: ["auth"],
});

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
</script>

<template>
  <div v-if="user">
    <h2>{{ $t("pages.profile.title", { name: user.name }) }}</h2>
    <form class="flex flex-col gap-4" @submit.prevent="userStore.saveUser">
      <div class="flex flex-col gap-2">
        <label for="email">{{ $t("pages.profile.email") }}</label>
        <InputText id="email" v-model="user.email" type="email" disabled />
      </div>
      <div class="flex flex-col gap-2">
        <label for="name">{{ $t("pages.profile.name") }}</label>
        <InputText id="name" v-model="user.name" type="text" />
      </div>
      <div>
        <Button type="submit">
          <Fa :icon="faSave" fw class="mr-2" />
          <span>{{ $t("pages.profile.save") }}</span>
        </Button>
      </div>
    </form>
  </div>
</template>

<style scoped lang="scss"></style>
