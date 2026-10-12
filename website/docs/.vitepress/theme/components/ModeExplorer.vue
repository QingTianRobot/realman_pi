<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

// Interactive walkthrough of the input modes. The mode list (order, labels, selectable) and every number come from
// the generated docs-data.json, which is copied from control.xml and the YAML configs at build time.
type Mode = { id: string; label: string; selectable: boolean };
type Detail = { input: string; router: string; session: string; frame: string; note: string };

const data = ref<any>(null);
const modes = ref<Mode[]>([]);
const current = ref("keyboard");

onMounted(async () => {
  const response = await fetch(`${import.meta.env.BASE_URL}docs-data.json`);
  data.value = await response.json();
  modes.value = data.value.modes;
});

const details: Record<string, Detail> = {
  web: { input: "Web 控制页的手动按钮与滑块", router: "无：粘性、最高优先级的覆盖，不出现在选择器里", session: "ExecuteMotion / 速度 Action，直连 driver", frame: "页面当前激活的参考系", note: "浏览器选择其它模式时，先取消自己持有的 Action，再切换。" },
  keyboard: { input: "浏览器按键集合 → /keyboard/<arm>/cartesian_velocity", router: "keyboard_control_router（只管 l/r）", session: "CartesianVelocity，高跟随，10 ms 周期，整个激活期只开一个 session", frame: "WORK cell（l/work/cell、r/work/cell）", note: "激活前先校验默认 WORK 坐标；按键松开只让命令归零，session 保留。" },
  policy: { input: "策略桥 /pi05_policy/<arm>/*", router: "PolicyInputStub：只记录控制权", session: "目前没有 router 把策略输出转成 Action session", frame: "—", note: "策略桥在该模式 ACTIVE 且被 /policy/activate 之后才发布。" },
  pikaposition: { input: "/pika/<arm>/cartesian_pose（base 帧）", router: "pika_control_router（只管 l/r）", session: "CartesianPose：IK + CANFD 关节透传", frame: "BASE（l/base_link、r/base_link）", note: "进入前先用 ThreeArmMoveJ 把三臂移到 pika_default_pose。" },
  pikavelocity: { input: "/pika/<arm>/cartesian_velocity", router: "pika_control_router", session: "CartesianVelocity，低跟随（follow=false），10 ms 周期", frame: "WORK pikabase（identity WORK）", note: "输入晚于 stale_ms 即刷新零速度，session 保留。" },
  pikamixed: { input: "速度（XYZ）+ 位姿（姿态）两路 topic", router: "pika_control_router", session: "单个 CartesianPose：XYZ 积分速度，姿态跟随相对转动", frame: "BASE", note: "发送端必须同时发布两个 topic；有位置/姿态牵引约束。" },
  none: { input: "无", router: "无", session: "释放所有 session", frame: "—", note: "切换时的中性分支，也是失败后的安全回退模式。" },
};

const detail = computed(() => details[current.value] ?? details.none);
const label = computed(() => modes.value.find((mode) => mode.id === current.value));

// Numbers shown for the selected mode, read from the config copies.
const stats = computed(() => {
  const d = data.value;
  if (!d) return [];
  const l = d.motion?.l;
  const velocity = d.pika?.velocity;
  const mixed = d.pika?.mixed;
  switch (current.value) {
    case "keyboard":
      return [
        { name: "按键线速度", value: `${(d.keyboard.linearSpeedFraction * l.max_linear_speed_mps).toFixed(3)} m/s` },
        { name: "按键角速度", value: `${(d.keyboard.angularSpeedFraction * l.max_angular_speed_radps).toFixed(3)} rad/s` },
        { name: "控制周期", value: `${l.velocity_control_period_ms} ms` },
        { name: "driver watchdog", value: `${l.velocity_watchdog_ms} ms` },
      ];
    case "pikavelocity":
      return [
        { name: "线速度上限", value: `${velocity.max_linear_speed_mps} m/s` },
        { name: "角速度上限", value: `${velocity.max_angular_speed_radps} rad/s` },
        { name: "线 / 角加速度", value: `${velocity.max_linear_accel_mps2} m/s² · ${velocity.max_angular_accel_radps2} rad/s²` },
        { name: "stale / 释放", value: `${velocity.stale_ms} ms / ${velocity.input_timeout_ms} ms` },
      ];
    case "pikamixed":
      return [
        { name: "XYZ 速度上限", value: `${mixed.max_linear_speed_mps} m/s` },
        { name: "姿态角速度上限", value: `${mixed.max_angular_speed_radps} rad/s` },
        { name: "位置领先上限", value: `${mixed.max_position_lead_m} m` },
        { name: "姿态领先上限", value: `${mixed.max_orientation_lead_rad} rad` },
      ];
    case "pikaposition":
      return [
        { name: "单关节逼近速度", value: `${l.pose_max_joint_speed_dps} °/s` },
        { name: "driver watchdog", value: `${l.velocity_watchdog_ms} ms` },
      ];
    case "web":
      return [
        { name: "普通线速度上限 (l)", value: `${l.max_linear_speed_mps} m/s` },
        { name: "普通角速度上限", value: `${l.max_angular_speed_radps} rad/s` },
      ];
    default:
      return [];
  }
});
</script>

<template>
  <div v-reveal class="mode-explorer">
    <div class="mode-explorer-chips" role="tablist" aria-label="输入模式">
      <button
        v-for="mode in modes"
        :key="mode.id"
        type="button"
        role="tab"
        :aria-selected="current === mode.id"
        :class="['mode-chip', { active: current === mode.id, hidden: !mode.selectable }]"
        @click="current = mode.id"
      >{{ mode.id }}</button>
    </div>
    <p v-if="label" class="mode-explorer-label">
      {{ label.label }}<span v-if="!label.selectable">（不可由浏览器选择）</span>
    </p>
    <ol class="mode-explorer-flow">
      <li><span class="mode-flow-kicker">输入</span>{{ detail.input }}</li>
      <li><span class="mode-flow-kicker">路由</span>{{ detail.router }}</li>
      <li><span class="mode-flow-kicker">driver session</span>{{ detail.session }}</li>
      <li><span class="mode-flow-kicker">参考系</span>{{ detail.frame }}</li>
    </ol>
    <dl v-if="stats.length" class="mode-explorer-stats">
      <div v-for="item in stats" :key="item.name">
        <dt>{{ item.name }}</dt>
        <dd>{{ item.value }}</dd>
      </div>
    </dl>
    <p class="mode-explorer-note">{{ detail.note }}</p>
  </div>
</template>
