<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vitepress";

// Small section chip above every page title, derived from the route.
const route = useRoute();
const groups: Record<string, string> = {
  guide: "指南",
  architecture: "架构",
  development: "开发者手册",
  reference: "参考",
  models: "型号",
  troubleshooting: "故障排查",
};
const label = computed(() => {
  const first = route.path.replace(/^\/realman_pi\//, "/").split("/").filter(Boolean)[0]?.replace(/\.html$/, "") ?? "";
  return groups[first] ?? "";
});
</script>

<template>
  <p v-if="label" class="doc-crumb">{{ label }}</p>
</template>
