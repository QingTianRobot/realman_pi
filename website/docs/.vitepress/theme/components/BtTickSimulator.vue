<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from "vue";
import { nodeDocs, nodeLabel } from "../bt/node-docs";
import { PolicyTaskSim, findNode, scenarios, type Scenario, type XmlNode } from "../bt/sim";

// Steps the policy task subtree of control.xml one behavior-tree tick at a time. The subtree comes from the
// generated docs-data.json (the real XML); the control and decorator semantics mirror the C++ nodes; each scenario
// only scripts how the leaves end (theme/bt/sim.ts).
const subtree = ref<XmlNode | null>(null);
const production = ref<{ cycles: number; attempts: number } | null>(null);
const scenario = ref<Scenario>(scenarios[0]);
const sim = shallowRef<PolicyTaskSim | null>(null);
const version = ref(0); // bumped after every step so the template re-reads the simulator

const statusLabel = { idle: "未运行", running: "RUNNING", success: "SUCCESS", failure: "FAILURE" } as const;

onMounted(async () => {
  const data = await (await fetch(`${import.meta.env.BASE_URL}docs-data.json`)).json();
  const tree = data.bt.trees.find((entry: { id: string }) => entry.id === data.bt.mainTree);
  subtree.value = findNode(tree.root, (node) => node.tag === "Sequence" && node.attrs.name === "policy_entry");
  production.value = { cycles: data.policyTask.cycles, attempts: data.policyTask.attempts };
  reset();
});

// The pick scenarios run the same subtree with PolicyRun's task port set to pick.
function withTask(node: XmlNode, task: string): XmlNode {
  const attrs = node.tag === "PolicyRun" ? { ...node.attrs, task } : node.attrs;
  return { ...node, attrs, children: node.children.map((child) => withTask(child, task)) };
}

function reset() {
  if (!subtree.value) return;
  sim.value = new PolicyTaskSim(withTask(subtree.value, scenario.value.task), scenario.value);
  version.value += 1;
}

function choose(next: Scenario) {
  scenario.value = next;
  reset();
}

function step() {
  sim.value?.step();
  version.value += 1;
}

function runToEnd() {
  for (let i = 0; i < 200 && sim.value && !sim.value.finished; i += 1) sim.value.step();
  version.value += 1;
}

const rows = computed(() => {
  void version.value;
  const current = sim.value;
  if (!current) return [];
  const out: { id: string; node: XmlNode; depth: number; status: string; detail: string }[] = [];
  const walk = (node: XmlNode, depth: number) => {
    const state = current.state(node);
    out.push({ id: current.ids.get(node) ?? "", node, depth, status: state.status, detail: state.detail });
    node.children.forEach((child) => walk(child, depth + 1));
  };
  walk(current.root, 0);
  return out;
});

const facts = computed(() => {
  void version.value;
  const current = sim.value;
  if (!current) return [];
  return [
    { name: "tick", value: String(current.tick) },
    { name: "输入模式", value: current.mode },
    { name: "PolicyRun 尝试", value: String(current.attempt) },
    { name: "周期 × 尝试", value: `${scenario.value.cycles} × ${scenario.value.attempts}` },
  ];
});

const blackboard = computed(() => {
  void version.value;
  return Object.entries(sim.value?.blackboard ?? {});
});
const log = computed(() => {
  void version.value;
  return sim.value?.log ?? [];
});
const finished = computed(() => {
  void version.value;
  return sim.value?.finished ?? false;
});
</script>

<template>
  <div
    v-reveal
    class="bt-sim"
    :data-state="sim ? 'ready' : 'loading'"
    :data-scenario="scenario.id"
    :data-tick="sim?.tick ?? 0"
    :data-finished="finished"
  >
    <div class="mode-explorer-chips" role="tablist" aria-label="场景">
      <button
        v-for="item in scenarios"
        :key="item.id"
        type="button"
        role="tab"
        :aria-selected="item.id === scenario.id"
        :class="['mode-chip', { active: item.id === scenario.id }]"
        @click="choose(item)"
      >{{ item.label }}</button>
    </div>
    <div class="bt-sim-controls">
      <button type="button" class="bt-sim-button primary" :disabled="finished" @click="step">下一拍</button>
      <button type="button" class="bt-sim-button" :disabled="finished" @click="runToEnd">运行到结束</button>
      <button type="button" class="bt-sim-button" @click="reset">重置</button>
      <span v-if="production" class="bt-sim-production">
        生产配置 policy_task.yaml：cycles {{ production.cycles }}，attempts {{ production.attempts }}
      </span>
    </div>

    <div class="bt-explorer-grid">
      <div class="bt-tree" aria-label="policy 任务子树的节点状态">
        <p class="bt-panel-kicker">control.xml · policy_entry</p>
        <div
          v-for="row in rows"
          :key="row.id"
          :class="['bt-row', `bt-depth-${Math.min(row.depth, 9)}`, `is-${row.status}`]"
          :data-node="row.node.tag"
          :data-status="row.status"
        >
          <span class="bt-row-toggle bt-row-leaf" aria-hidden="true"></span>
          <span class="bt-row-main">
            <span :class="['bt-row-tag', `bt-cat-${nodeDocs[row.node.tag]?.category ?? 'action'}`]">{{ row.node.tag }}</span>
            <span class="bt-row-label">{{ nodeLabel(row.node.attrs) }}</span>
          </span>
          <span class="bt-row-status">{{ statusLabel[row.status as keyof typeof statusLabel] }}</span>
          <span v-if="row.detail" class="bt-row-detail">{{ row.detail }}</span>
        </div>
      </div>

      <div class="bt-card">
        <dl class="mode-explorer-stats">
          <div v-for="fact in facts" :key="fact.name">
            <dt>{{ fact.name }}</dt>
            <dd>{{ fact.value }}</dd>
          </div>
        </dl>
        <p class="bt-panel-kicker bt-sim-heading">黑板</p>
        <dl v-if="blackboard.length" class="bt-card-returns">
          <div v-for="[key, value] in blackboard" :key="key"><dt>{{ key }}</dt><dd>{{ value }}</dd></div>
        </dl>
        <p v-else class="bt-port-none">还没有写入。</p>
        <p class="bt-panel-kicker bt-sim-heading">事件（最新在上）</p>
        <ol v-if="log.length" class="bt-sim-log">
          <li v-for="(line, index) in log" :key="index">{{ line }}</li>
        </ol>
        <p v-else class="bt-port-none">点“下一拍”开始：每一拍从根节点走一遍子树。</p>
      </div>
    </div>
  </div>
</template>
