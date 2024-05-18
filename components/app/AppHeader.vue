<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { NuxtLink } from "#components";

import Menubar from "primevue/menubar";

import { faAngleDown, faEye, faHouse, faKey } from "@fortawesome/free-solid-svg-icons";
import Fa from "vue-fa";

import { useUserStore } from "~/stores/user";

import AuthButton from "~/components/AuthButton.vue";
import LangSwitcher from "~/components/LangSwitcher.vue";

const i18n = useI18n();

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const menu = computed(() => [
  {
    label: i18n.t("menu.home.label"),
    icon: faHouse as any,
    route: "/",
  },
  {
    label: i18n.t("menu.public.label"),
    icon: faKey as any,
    route: "/public",
  },
  {
    label: i18n.t("menu.private.label"),
    icon: faEye as any,
    route: "/private",
    visible: !!user.value,
  },
]);
</script>

<template>
  <Menubar :model="menu">
    <template #item="{ item, props, hasSubmenu }">
      <NuxtLink v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
        <a :href="href" v-bind="props.action" @click="navigate">
          <Fa v-if="item.icon" :icon="item.icon" fw class="mr-2" />
          <span>{{ item.label }}</span>
        </a>
      </NuxtLink>
      <a v-else :href="item.url" :target="item.target" v-bind="props.action">
        <Fa v-if="item.icon" :icon="item.icon" fw class="mr-2" />
        <span>{{ item.label }}</span>
        <Fa v-if="hasSubmenu" :icon="faAngleDown" fw class="ml-2" />
      </a>
    </template>
    <template #end>
      <div class="ml-2 flex flex-row flex-wrap gap-2 flex-justify-end">
        <LangSwitcher />
        <AuthButton />
      </div>
    </template>
  </Menubar>
</template>

<style scoped lang="scss"></style>
