<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { CHAPTERS, DURATION, captionAt, chapterAt } from "../handeye/timeline";
import type { ArmId, Calibration, FrameInfo, HandEyeScene, Layout, Pose } from "../handeye/scene";

// A scripted, scrubbable explainer for three-arm eye-in-hand calibration. It plays like a video but is rendered
// live from the same URDF and configs as the rest of the site: the scene is a pure function of the playhead time,
// so the in-page player and the offline mp4 export (website/scripts) draw identical frames.
const host = ref<HTMLElement | null>(null);
const stage = ref<HTMLElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const overlay = ref<HTMLCanvasElement | null>(null);
const state = ref<"idle" | "loading" | "ready" | "error">("idle");
const t = ref(0);
const playing = ref(false);
const full = ref(false);
const renderMode = ref(false);
const pipArm = ref<ArmId>("l");
const info = ref<FrameInfo>({ chapter: 0, samples: 0, total: 30, corners: null, spreadCm: null, relative: null });
const calibration = ref<Calibration | null>(null);

const chapter = computed(() => CHAPTERS[chapterAt(t.value)]);
const caption = computed(() => captionAt(t.value));
const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
const degrees = (rad: number) => ((rad * 180) / Math.PI).toFixed(1);
const meters = (value: number) => value.toFixed(3);
const poseText = (pose: Pose) => `xyz ${meters(pose.x)}, ${meters(pose.y)}, ${meters(pose.z)} m · rpy ${degrees(pose.roll)}, ${degrees(pose.pitch)}, ${degrees(pose.yaw)}°`;

const readout = computed(() => {
  const data = calibration.value;
  if (!data) return [] as { name: string; value: string }[];
  const board = data.board;
  switch (info.value.chapter) {
    case 0:
      return [{ name: "基座坐标系", value: data.arms.map((arm) => arm.baseFrame).join(" · ") }];
    case 1:
      return [
        { name: "标定板", value: `ChArUco ${board.squaresX}×${board.squaresY} · ${board.dictionary}` },
        { name: "格长 / marker", value: `${board.squareLengthM * 1000} / ${board.markerLengthM * 1000} mm` },
        { name: "末端帧", value: data.arms.map((arm) => arm.endEffectorFrame).join(" · ") },
      ];
    case 2:
      return [
        { name: "有效样本", value: `${info.value.samples} / ${info.value.total}（每臂最少）` },
        { name: "角点（所选相机）", value: info.value.corners ? `${info.value.corners.seen} / ${info.value.corners.total}（至少 ${board.minimumCorners}）` : "—" },
      ];
    case 3:
      return [
        { name: "推算板位置离散度", value: info.value.spreadCm === null ? "—" : `${info.value.spreadCm.toFixed(1)} cm` },
        { name: "求解方法", value: data.handEyeMethod },
      ];
    case 4:
      return [
        { name: "手眼残差上限", value: data.maximumHandEyeResidual.toFixed(3) },
        { name: "相对位姿离散度上限", value: `${(data.maximumRelativeTranslationSpreadM * 100).toFixed(1)} cm · ${data.maximumRelativeRotationSpreadRad.toFixed(3)} rad` },
      ];
    default:
      return info.value.relative
        ? [
            { name: "l → m（生产布局）", value: poseText(info.value.relative.m) },
            { name: "l → r（生产布局）", value: poseText(info.value.relative.r) },
          ]
        : [];
  }
});

let scene: HandEyeScene | null = null;
let started = false;
let visible = false;
let dirty = true;
let raf = 0;
let last = 0;
let disposed = false;
let observer: IntersectionObserver | undefined;
let resizeObserver: ResizeObserver | undefined;
let themeObserver: MutationObserver | undefined;

const draw = () => {
  if (!scene) return;
  info.value = scene.apply(t.value, pipArm.value);
  dirty = false;
};
const seek = (seconds: number) => {
  t.value = Math.min(DURATION, Math.max(0, seconds));
  dirty = true;
  if (!playing.value) draw();
};
const toggle = () => {
  if (t.value >= DURATION) seek(0);
  playing.value = !playing.value;
  last = 0;
};
const jump = (index: number) => seek(CHAPTERS[index].start + 0.01);
const onScrub = (event: Event) => seek(Number((event.target as HTMLInputElement).value));
const pickArm = (id: ArmId) => {
  pipArm.value = id;
  dirty = true;
  if (!playing.value) draw();
};
const exitFull = (event: KeyboardEvent) => {
  if (event.key === "Escape" && full.value) full.value = false;
};
watch(full, () => window.requestAnimationFrame(() => scene?.resize() ?? undefined));

const tick = (now: number) => {
  raf = window.requestAnimationFrame(tick);
  if (!scene) return;
  const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
  last = now;
  if (playing.value && visible) {
    t.value = Math.min(DURATION, t.value + dt);
    if (t.value >= DURATION) playing.value = false;
    dirty = true;
  }
  if (dirty && (visible || full.value)) draw();
};

async function start() {
  if (started || !canvas.value || !overlay.value || !stage.value) return;
  started = true;
  state.value = "loading";
  try {
    const base = import.meta.env.BASE_URL;
    const [layout, data] = await Promise.all([
      fetch(`${base}three-robots.json`).then((response) => response.json() as Promise<Layout>),
      fetch(`${base}docs-data.json`).then((response) => response.json() as Promise<{ calibration: Calibration }>),
    ]);
    calibration.value = data.calibration;
    const THREE = await import("three");
    const { default: URDFLoader } = await import("urdf-loader");
    scene = await (await import("../handeye/scene")).createHandEyeScene({
      THREE,
      URDFLoader,
      canvas: canvas.value,
      overlay: overlay.value,
      host: stage.value,
      base,
      layout,
      calibration: data.calibration,
    });
    if (disposed) {
      scene.dispose();
      return;
    }
    resizeObserver = new ResizeObserver(() => { scene?.resize(); dirty = true; });
    resizeObserver.observe(stage.value);
    themeObserver = new MutationObserver(() => { scene?.refreshTheme(); dirty = true; });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    state.value = "ready";
    draw();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) playing.value = true;
    raf = window.requestAnimationFrame(tick);
  } catch {
    state.value = "error";
  }
}

onMounted(() => {
  if (!host.value) return;
  observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (entry.isIntersecting) void start();
    },
    { rootMargin: "200px" },
  );
  observer.observe(host.value);
  window.addEventListener("keydown", exitFull);
  // Hooks for the offline video export and the e2e suite.
  (window as any).__handEye = {
    duration: DURATION,
    get ready() { return state.value === "ready"; },
    seek: async (seconds: number) => {
      playing.value = false;
      seek(seconds);
      draw();
      await new Promise((resolve) => window.requestAnimationFrame(() => resolve(undefined)));
    },
    events: () => scene?.events() ?? [],
    stats: () => scene?.stats ?? {},
    setFull: (value: boolean) => { full.value = value; },
    setRender: (value: boolean) => { renderMode.value = value; },
    setArm: (id: ArmId) => pickArm(id),
  };
});
onBeforeUnmount(() => {
  disposed = true;
  observer?.disconnect();
  resizeObserver?.disconnect();
  themeObserver?.disconnect();
  window.cancelAnimationFrame(raf);
  window.removeEventListener("keydown", exitFull);
  scene?.dispose();
  delete (window as any).__handEye;
});
</script>

<template>
  <section
    ref="host"
    v-reveal
    class="handeye"
    :class="{ 'is-full': full, 'is-render': renderMode }"
    :data-state="state"
    :data-chapter="chapter.id"
    aria-label="三臂手眼标定动画"
  >
    <div ref="stage" class="handeye-stage">
      <canvas ref="canvas" class="handeye-canvas" role="img" aria-label="三条 RM65 机械臂与 ChArUco 板的三维动画" />
      <canvas ref="overlay" class="handeye-overlay" aria-hidden="true" />
      <div class="handeye-title">
        <span>{{ chapter.kicker }}</span>
        <strong>{{ chapter.title }}</strong>
      </div>
      <p class="handeye-badge">示意动画 · 非真实标定数据</p>
      <button v-if="state === 'ready' && !playing && t === 0" type="button" class="handeye-start" @click="toggle">播放</button>
      <p v-if="state === 'idle' || state === 'loading'" class="viewer-state">正在加载三臂模型并求解姿态</p>
      <p v-else-if="state === 'error'" class="viewer-state viewer-error">动画暂不可用，请阅读下方文字说明</p>
    </div>

    <div class="handeye-panel">
      <p class="handeye-caption" aria-live="off">{{ caption }}</p>
      <pre class="handeye-formula">{{ chapter.formulas.join("\n") }}</pre>
      <dl v-if="readout.length" class="handeye-readout">
        <template v-for="item in readout" :key="item.name">
          <dt>{{ item.name }}</dt>
          <dd>{{ item.value }}</dd>
        </template>
      </dl>
    </div>

    <div class="handeye-bar">
      <button type="button" class="handeye-play" :disabled="state !== 'ready'" :aria-label="playing ? '暂停' : t >= DURATION ? '重播' : '播放'" @click="toggle">
        {{ playing ? "暂停" : t >= DURATION ? "重播" : "播放" }}
      </button>
      <input
        class="handeye-scrub"
        type="range"
        min="0"
        :max="DURATION"
        step="0.05"
        :value="t"
        :disabled="state !== 'ready'"
        aria-label="播放进度"
        @input="onScrub"
      />
      <span class="handeye-time">{{ clock(t) }} / {{ clock(DURATION) }}</span>
      <span class="handeye-cams" role="group" aria-label="相机画面">
        <button v-for="id in ['l', 'm', 'r']" :key="id" type="button" :class="['mode-chip', { active: pipArm === id }]" :disabled="state !== 'ready'" @click="pickArm(id as ArmId)">{{ id }}</button>
      </span>
      <button type="button" class="handeye-full" :disabled="state !== 'ready'" @click="full = !full">{{ full ? "退出全屏" : "全屏" }}</button>
    </div>

    <div class="handeye-chapters" role="group" aria-label="章节">
      <button v-for="(item, index) in CHAPTERS" :key="item.id" type="button" :class="['mode-chip', { active: chapter.id === item.id }]" :disabled="state !== 'ready'" @click="jump(index)">{{ item.kicker }}</button>
    </div>
  </section>
</template>
