<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import DocCrumb from "./components/DocCrumb.vue";

const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <template #doc-before><DocCrumb /></template>
  </Layout>
</template>
