<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

// Speed-limit calculator. Pick an arm and a client, drag the requested speed, and see which limit applies and
// how long the acceleration ramp takes. Limits are read from docs-data.json (copied from realman_motion.yaml,
// pika_config.yaml and keyboard_control.yaml at build time).
const data = ref<any>(null);
const arm = ref<"l" | "m" | "r">("l");
const client = ref<"keyboard" | "web" | "pika">("pika");
const requested = ref(0.4);

onMounted(async () => {
  data.value = await (await fetch(`${import.meta.env.BASE_URL}docs-data.json`)).json();
});

const motion = computed(() => data.value?.motion?.[arm.value]);
const available = computed(() => ({
  keyboard: arm.value !== "m",
  web: true,
  pika: arm.value !== "m",
}));

const limits = computed(() => {
  const m = motion.value;
  if (!m) return null;
  const normal = m.max_linear_speed_mps as number;
  const hard = m.hard_max_linear_speed_mps as number;
  let limit = normal;
  let accel = m.max_linear_accel_mps2 as number;
  let source = "realman_motion.yaml · max_linear_speed_mps";
  if (client.value === "keyboard") {
    limit = data.value.keyboard.linearSpeedFraction * normal;
    source = "keyboard_control.yaml · linear_speed_fraction × max_linear_speed_mps";
  } else if (client.value === "pika") {
    limit = Math.min(data.value.pika.velocity.max_linear_speed_mps, hard);
    accel = Math.min(data.value.pika.velocity.max_linear_accel_mps2, m.hard_max_linear_accel_mps2 ?? accel);
    source = "pika_config.yaml · pika_velocity（不超过 hard_max_*）";
  }
  return { normal, hard, limit, accel, source };
});

const scaleMax = computed(() => Math.max(1.2, (limits.value?.hard ?? 1) * 1.05));
const percent = (value: number) => `${Math.min(100, (value / scaleMax.value) * 100)}%`;
const effective = computed(() => (limits.value ? Math.min(requested.value, limits.value.limit) : 0));
const rampSeconds = computed(() => (limits.value && limits.value.accel > 0 ? effective.value / limits.value.accel : 0));
const rampMetres = computed(() => (limits.value && limits.value.accel > 0 ? (effective.value ** 2) / (2 * limits.value.accel) : 0));
const clamped = computed(() => limits.value !== null && requested.value > limits.value.limit + 1e-9);
</script>

<template>
  <div v-reveal class="limit-explorer">
    <div class="limit-explorer-controls">
      <div class="limit-explorer-group" role="tablist" aria-label="机械臂">
        <button v-for="id in ['l', 'm', 'r']" :key="id" type="button" role="tab" :aria-selected="arm === id" :class="['mode-chip', { active: arm === id }]" @click="arm = id as 'l' | 'm' | 'r'">{{ id.toUpperCase() }}</button>
      </div>
      <div class="limit-explorer-group" role="tablist" aria-label="客户端">
        <button
          v-for="item in [['keyboard', '键盘'], ['web', 'Web / 行为树'], ['pika', 'Pika 速度']]"
          :key="item[0]"
          type="button"
          role="tab"
          :disabled="!available[item[0] as 'keyboard' | 'web' | 'pika']"
          :aria-selected="client === item[0]"
          :class="['mode-chip', { active: client === item[0] }]"
          @click="client = item[0] as 'keyboard' | 'web' | 'pika'"
        >{{ item[1] }}</button>
      </div>
    </div>
    <label class="limit-explorer-slider">
      <span>请求线速度</span>
      <input v-model.number="requested" type="range" min="0" max="1.2" step="0.01" aria-label="请求线速度" />
      <strong>{{ requested.toFixed(2) }} m/s</strong>
    </label>
    <div v-if="limits" class="limit-ladder" aria-hidden="true">
      <span class="limit-ladder-track"></span>
      <span class="limit-ladder-fill" :style="{ width: percent(effective) }"></span>
      <span class="limit-ladder-tick limit" :style="{ left: percent(limits.limit) }"><em>本客户端上限 {{ limits.limit.toFixed(3) }}</em></span>
      <span class="limit-ladder-tick hard" :style="{ left: percent(limits.hard) }"><em>driver 硬上限 {{ limits.hard }}</em></span>
      <span class="limit-ladder-tick request" :style="{ left: percent(requested) }"></span>
    </div>
    <dl v-if="limits" class="mode-explorer-stats">
      <div><dt>实际生效速度</dt><dd>{{ effective.toFixed(3) }} m/s<span v-if="clamped">（已被限幅）</span></dd></div>
      <div><dt>加速度上限</dt><dd>{{ limits.accel }} m/s²</dd></div>
      <div><dt>加速到该速度</dt><dd>{{ rampSeconds.toFixed(2) }} s · {{ (rampMetres * 100).toFixed(1) }} cm</dd></div>
      <div><dt>限值来源</dt><dd class="limit-source">{{ limits.source }}</dd></div>
    </dl>
    <p class="mode-explorer-note">m 臂没有键盘或 Pika 通道，所以只能选 Web / 行为树。数值是构建时从配置文件复制的，改配置后重新构建文档站即可同步。</p>
  </div>
</template>
