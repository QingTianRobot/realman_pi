<script setup lang="ts">
// "At a glance" strip for the top of a long page: three or four facts a reader should know before the details.
defineProps<{ items: { label: string; value: string }[] }>();
</script>

<template>
  <div v-reveal class="doc-glance">
    <div v-for="item in items" :key="item.label" class="doc-glance-item">
      <span class="doc-glance-label">{{ item.label }}</span>
      <span class="doc-glance-value">{{ item.value }}</span>
    </div>
  </div>
</template>
