<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { NuxtLink } from "#components";

import Button from "primevue/button";
import SplitButton from "primevue/splitbutton";

import { faSignIn, faSignOut, faUser } from "@fortawesome/free-solid-svg-icons";
import Fa from "vue-fa";

import { useUserStore } from "~/stores/user";

const i18n = useI18n();

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const actions = computed(() => [
  {
    label: i18n.t("components.authButton.signOut"),
    icon: faSignOut as any,
    url: "/logout",
  },
]);
</script>

<template>
  <div v-if="user">
    <NuxtLink to="/profile">
      <SplitButton :model="actions">
        <Fa :icon="faUser" fw class="mr-2" />
        <span>{{ user.name }}</span>
        <template #item="{ item, props }">
          <NuxtLink v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
            <a :href="href" v-bind="props.action" @click="navigate">
              <Fa v-if="item.icon" :icon="item.icon" fw class="mr-2" />
              <span>{{ item.label }}</span>
            </a>
          </NuxtLink>
          <a v-else :href="item.url" :target="item.target" v-bind="props.action">
            <Fa v-if="item.icon" :icon="item.icon" fw class="mr-2" />
            <span>{{ item.label }}</span>
          </a>
        </template>
      </SplitButton>
    </NuxtLink>
  </div>
  <div v-else>
    <a :href="`/login?redirect=${encodeURIComponent($nuxt.$router.currentRoute.value.fullPath)}`">
      <Button>
        <Fa :icon="faSignIn" fw class="mr-2" />
        <span>{{ $t("components.authButton.signIn") }}</span>
      </Button>
    </a>
  </div>
</template>

<style scoped lang="scss"></style>
