<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { withBase } from "vitepress";

// A documentation figure: a screenshot (or any image) with a caption, click-to-zoom, and optional numbered
// marks. Marks are positioned in percent of the image; hovering a mark or its legend entry highlights both.
type Mark = { x: number; y: number; label: string };

const props = defineProps<{ src: string; alt: string; caption?: string; marks?: Mark[] }>();
const url = computed(() => withBase(props.src));
const active = ref(-1);
const open = ref(false);
const close = () => { open.value = false; };
const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
watch(open, (isOpen) => {
  if (typeof document === "undefined") return;
  document.body.style.overflow = isOpen ? "hidden" : "";
  if (isOpen) document.addEventListener("keydown", onKey);
  else document.removeEventListener("keydown", onKey);
});
onBeforeUnmount(() => {
  if (typeof document === "undefined") return;
  document.body.style.overflow = "";
  document.removeEventListener("keydown", onKey);
});
</script>

<template>
  <figure v-reveal class="doc-figure">
    <div class="doc-figure-frame">
      <button type="button" class="doc-figure-zoom" :aria-label="`放大：${alt}`" @click="open = true">
        <img :src="url" :alt="alt" loading="lazy" />
      </button>
      <button
        v-for="(mark, index) in marks ?? []"
        :key="index"
        type="button"
        :class="['doc-figure-mark', { active: active === index }]"
        :style="{ left: `${mark.x}%`, top: `${mark.y}%` }"
        :aria-label="mark.label"
        @mouseenter="active = index"
        @mouseleave="active = -1"
        @focus="active = index"
        @blur="active = -1"
      >{{ index + 1 }}</button>
    </div>
    <figcaption v-if="caption">{{ caption }}</figcaption>
    <ol v-if="marks?.length" class="doc-figure-legend">
      <li
        v-for="(mark, index) in marks"
        :key="index"
        :class="{ active: active === index }"
        @mouseenter="active = index"
        @mouseleave="active = -1"
      >{{ mark.label }}</li>
    </ol>
    <Teleport to="body">
      <div v-if="open" class="doc-figure-lightbox" role="dialog" aria-label="图片查看器" @click="close">
        <img :src="url" :alt="alt" />
        <button type="button" class="doc-figure-close" @click.stop="close">关闭 ✕</button>
      </div>
    </Teleport>
  </figure>
</template>
