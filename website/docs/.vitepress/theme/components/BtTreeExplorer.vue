<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { categoryLabels, nodeDocs, nodeLabel, type NodeCategory } from "../bt/node-docs";
import type { XmlNode } from "../bt/sim";

// The production behavior tree (config/behavior-trees/control.xml) and every registered node. The tree, the XML
// comments and each node's ports come from the generated docs-data.json (website/scripts/bt-catalog.mjs reads
// control.xml and the C++ providedPorts()); only the prose about what a node does lives in theme/bt/node-docs.ts.
type Port = { kind: string; type: string; name: string; default?: string; description: string };
type Catalog = {
  mainTree: string;
  trees: { id: string; root: XmlNode }[];
  nodes: Record<string, { className: string; ports: Port[]; source: string | null }>;
};
type Row = { id: string; node: XmlNode; depth: number; hasChildren: boolean };

const repository = "https://github.com/QingTianRobot/realman_pi/blob/main/";
const catalog = ref<Catalog | null>(null);
const collapsed = ref(new Set<string>());
const selectedId = ref("");
const selectedTag = ref("");

onMounted(async () => {
  const response = await fetch(`${import.meta.env.BASE_URL}docs-data.json`);
  catalog.value = (await response.json()).bt;
  // Open on the policy task: collapse every other mode branch so the outline fits on one screen.
  for (const row of allRows.value) {
    const name = row.node.attrs.name ?? "";
    if (row.node.tag === "ReactiveSequence" && name.endsWith("_branch") && name !== "policy_branch") {
      collapsed.value.add(row.id);
    }
  }
  const policyRun = allRows.value.find((row) => row.node.tag === "PolicyRun");
  if (policyRun) select(policyRun);
});

const tree = computed(() => catalog.value?.trees.find((entry) => entry.id === catalog.value?.mainTree) ?? null);

const allRows = computed<Row[]>(() => {
  const rows: Row[] = [];
  const walk = (node: XmlNode, id: string, depth: number) => {
    rows.push({ id, node, depth, hasChildren: node.children.length > 0 });
    node.children.forEach((child, index) => walk(child, `${id}.${index}`, depth + 1));
  };
  if (tree.value) walk(tree.value.root, "0", 0);
  return rows;
});

const rows = computed(() =>
  allRows.value.filter((row) => ![...collapsed.value].some((id) => row.id.startsWith(`${id}.`))),
);

function toggle(row: Row) {
  const next = new Set(collapsed.value);
  next.has(row.id) ? next.delete(row.id) : next.add(row.id);
  collapsed.value = next;
}

function select(row: Row) {
  selectedId.value = row.id;
  selectedTag.value = row.node.tag;
}

function selectTag(tag: string) {
  const first = allRows.value.find((row) => row.node.tag === tag);
  selectedId.value = first?.id ?? "";
  selectedTag.value = tag;
}

const selectedRow = computed(() => allRows.value.find((row) => row.id === selectedId.value) ?? null);
const doc = computed(() => nodeDocs[selectedTag.value]);
const info = computed(() => catalog.value?.nodes[selectedTag.value]);
const usage = computed(() => allRows.value.filter((row) => row.node.tag === selectedTag.value).length);

// Source ports plus what this XML instance passes; attributes no port declares (e.g. `name`) stay out.
const ports = computed(() =>
  (info.value?.ports ?? []).map((port) => ({ ...port, value: selectedRow.value?.node.attrs[port.name] })),
);

const groups = computed(() => {
  const order: NodeCategory[] = ["control", "decorator", "condition", "action"];
  const tags = Object.keys(catalog.value?.nodes ?? {});
  return order.map((category) => ({
    category,
    label: categoryLabels[category],
    tags: tags.filter((tag) => (nodeDocs[tag]?.category ?? "action") === category),
  }));
});

const kindLabel: Record<string, string> = { input: "输入", output: "输出", bidirectional: "双向" };
</script>

<template>
  <div
    v-reveal
    class="bt-explorer"
    :data-state="catalog ? 'ready' : 'loading'"
    :data-node-count="allRows.length"
    :data-selected="selectedTag"
  >
    <div class="bt-explorer-grid">
      <div class="bt-tree" role="tree" aria-label="control.xml 行为树">
        <p class="bt-panel-kicker">control.xml · {{ tree?.id }}</p>
        <div
          v-for="row in rows"
          :key="row.id"
          :class="['bt-row', `bt-depth-${Math.min(row.depth, 9)}`, { selected: row.id === selectedId }]"
          role="treeitem"
          :aria-expanded="row.hasChildren ? !collapsed.has(row.id) : undefined"
          :aria-selected="row.id === selectedId"
          :data-node="row.node.tag"
        >
          <button
            v-if="row.hasChildren"
            type="button"
            class="bt-row-toggle"
            :aria-label="collapsed.has(row.id) ? '展开' : '收起'"
            @click="toggle(row)"
          >{{ collapsed.has(row.id) ? "+" : "−" }}</button>
          <span v-else class="bt-row-toggle bt-row-leaf" aria-hidden="true"></span>
          <button type="button" class="bt-row-main" @click="select(row)">
            <span :class="['bt-row-tag', `bt-cat-${nodeDocs[row.node.tag]?.category ?? 'action'}`]">{{ row.node.tag }}</span>
            <span class="bt-row-label">{{ nodeLabel(row.node.attrs) }}</span>
          </button>
        </div>
      </div>

      <div v-if="doc && info" class="bt-card" aria-live="polite">
        <p class="bt-panel-kicker">{{ categoryLabels[doc.category] }} · {{ info.className }}</p>
        <h4 class="bt-card-title">
          {{ selectedTag }}<span v-if="selectedRow && nodeLabel(selectedRow.node.attrs)"> · {{ nodeLabel(selectedRow.node.attrs) }}</span>
        </h4>
        <p class="bt-card-summary">{{ doc.summary }}</p>
        <p v-if="selectedRow?.node.note" class="bt-card-note">
          <span class="mode-flow-kicker">control.xml 注释</span>{{ selectedRow.node.note }}
        </p>
        <dl class="bt-card-returns">
          <div><dt>SUCCESS</dt><dd>{{ doc.success }}</dd></div>
          <div><dt>FAILURE</dt><dd>{{ doc.failure }}</dd></div>
          <div><dt>RUNNING</dt><dd>{{ doc.running }}</dd></div>
          <div><dt>halt()</dt><dd>{{ doc.halt }}</dd></div>
          <div v-if="doc.blackboard"><dt>黑板</dt><dd>{{ doc.blackboard }}</dd></div>
        </dl>
        <table v-if="ports.length" class="bt-ports">
          <colgroup>
            <col class="bt-col-port" />
            <col class="bt-col-value" />
            <col class="bt-col-value" />
            <col />
          </colgroup>
          <thead>
            <tr><th>端口</th><th>本处取值</th><th>默认值</th><th>说明</th></tr>
          </thead>
          <tbody>
            <tr v-for="port in ports" :key="port.name">
              <td data-label="端口"><code>{{ port.name }}</code><span class="bt-port-kind">{{ kindLabel[port.kind] }} · {{ port.type }}</span></td>
              <td data-label="本处取值"><code v-if="port.value !== undefined">{{ port.value }}</code><span v-else class="bt-port-none">—</span></td>
              <td data-label="默认值"><code v-if="port.default">{{ port.default }}</code><span v-else class="bt-port-none">—</span></td>
              <td data-label="说明">{{ port.description }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="bt-port-none">没有端口。</p>
        <p class="bt-card-links">
          <span>{{ usage ? `control.xml 中出现 ${usage} 处` : "control.xml 中未使用" }}</span>
          <a v-if="info.source" :href="repository + info.source" target="_blank" rel="noreferrer">源码</a>
          <a v-if="doc.page" :href="doc.page">详细说明</a>
        </p>
      </div>
    </div>

    <div class="bt-registry">
      <p class="bt-panel-kicker">全部注册节点（realman_bt_executor_node.cpp）</p>
      <div v-for="group in groups" :key="group.category" class="bt-registry-group">
        <span class="bt-registry-label">{{ group.label }}</span>
        <button
          v-for="tag in group.tags"
          :key="tag"
          type="button"
          :class="['mode-chip', { active: tag === selectedTag }]"
          @click="selectTag(tag)"
        >{{ tag }}</button>
      </div>
    </div>
  </div>
</template>
