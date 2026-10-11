<script setup lang="ts">
import { computed } from "vue";
import { withBase } from "vitepress";

// A link card for hub pages: mono kicker, title and one short line of text.
const props = defineProps<{ title: string; href: string; kicker?: string }>();
// External URLs and same-page anchors stay as written; site paths get the base prefix.
const target = computed(() => (/^((https?:)?\/\/|#)/.test(props.href) ? props.href : withBase(props.href)));
</script>

<template>
  <a v-reveal class="doc-card" :href="target">
    <span v-if="kicker" class="doc-card-kicker">{{ kicker }}</span>
    <span class="doc-card-title">{{ title }}</span>
    <span class="doc-card-body"><slot /></span>
    <span class="doc-card-arrow" aria-hidden="true">→</span>
  </a>
</template>
