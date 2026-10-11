<script setup lang="ts">
import { computed, ref } from "vue";
import { withBase } from "vitepress";

// Clickable layer map of the system. Hover or focus a block to light up the blocks it talks to and read what it
// owns; click to open its page. The relations mirror the data flow described on the architecture overview.
type Block = { id: string; layer: number; title: string; owns: string; href: string; links: string[] };

const layers = ["输入", "路由", "运动", "硬件"];
const blocks: Block[] = [
  { id: "web", layer: 0, title: "Web 控制页", owns: "浏览器里的手动运动、键盘、夹爪与 URDF 影子；只发 ROS 消息，不直连 SDK。", href: "/development/realman-web-control", links: ["bt", "driver", "gm"] },
  { id: "kbd", layer: 0, title: "键盘", owns: "l/r 的 12 个速度键与 4 个夹爪键，浏览器每 50 ms 上报按键集合。", href: "/development/behavior-tree-control", links: ["web", "bt"] },
  { id: "pika", layer: 0, title: "Pika 手持设备", owns: "位姿 / 速度 / 夹爪百分比，标称 20 Hz，经 Wi‑Fi 到生产机。", href: "/development/pika-teleop", links: ["bt"] },
  { id: "policy", layer: 0, title: "VLA 策略桥", owns: "OpenPI WebSocket 与 ROS 2 的纯协议转换，只在对应输入模式 ACTIVE 时发布。", href: "/development/policy-bridge", links: ["bt"] },
  { id: "bt", layer: 1, title: "行为树 · 输入模式", owns: "决定当前哪一个输入拥有控制权（web / keyboard / policy / pika* / none），并建立对应的 Action session。", href: "/development/behavior-tree-control", links: ["web", "kbd", "pika", "policy", "driver", "gm"] },
  { id: "driver", layer: 2, title: "realman_driver ×3", owns: "每臂唯一的运动 owner：限速限加速度、watchdog、取消/停止、坐标 motion gate、断线重连。", href: "/development/realman-driver-scaffold", links: ["bt", "web", "sdk"] },
  { id: "gm", layer: 2, title: "gripper_manager", owns: "独占串口；percentage / 行程设置 / 告警；连续目标限频 4 Hz。", href: "/development/gripper-control", links: ["bt", "web", "serial"] },
  { id: "sdk", layer: 3, title: "RealMan SDK → 控制器", owns: "以太网到三台控制器；驱动是唯一的 SDK 调用方。", href: "/development/realman-python-driver", links: ["driver"] },
  { id: "serial", layer: 3, title: "夹爪串口 (RS-485)", owns: "Changingtek Modbus RTU，稳定别名 /dev/realman/gripper_*。", href: "/development/gripper-control", links: ["gm"] },
];

const active = ref<string>("");
const selected = computed(() => blocks.find((block) => block.id === active.value) ?? null);
const related = computed(() => new Set(selected.value ? [selected.value.id, ...selected.value.links] : []));
const open = (href: string) => withBase(href);
</script>

<template>
  <div v-reveal class="arch-map">
    <div v-for="(layer, index) in layers" :key="layer" class="arch-layer">
      <span class="arch-layer-name">{{ layer }}</span>
      <div class="arch-layer-blocks">
        <a
          v-for="block in blocks.filter((item) => item.layer === index)"
          :key="block.id"
          :href="open(block.href)"
          :class="['arch-block', { active: active === block.id, related: active !== '' && related.has(block.id) && active !== block.id, dim: active !== '' && !related.has(block.id) }]"
          @mouseenter="active = block.id"
          @mouseleave="active = ''"
          @focus="active = block.id"
          @blur="active = ''"
        >{{ block.title }}</a>
      </div>
      <span v-if="index < layers.length - 1" class="arch-flow" aria-hidden="true"></span>
    </div>
    <p class="arch-note" aria-live="polite">
      <template v-if="selected"><strong>{{ selected.title }}</strong>：{{ selected.owns }}</template>
      <template v-else>悬停任意一块，查看它拥有什么、和哪些块相连；点击进入对应页面。越靠下越接近硬件，越有最终否决权。</template>
    </p>
  </div>
</template>
