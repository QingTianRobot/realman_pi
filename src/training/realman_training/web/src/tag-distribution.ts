import type { ServeDataset } from "./api";
import { fmtTime, h } from "./dom";

const LIGHTING: Record<string, string> = { "1": "1 较暗", "2": "2 正常", "3": "3 较亮" };
const TAG_TITLE: Record<string, string> = { lighting_level: "光照", date: "录制日期" };

function tagValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return "未标注";
  return key === "lighting_level" ? LIGHTING[String(value)] ?? String(value) : String(value);
}

/** Lighting and date tags of a model's training view (GET /api/serve/dataset `tags`): one bar per value, split by task. */
export function tagDistribution(data: ServeDataset, id: string): HTMLElement {
  const tags = data.tags;
  const head = h("h3", {}, "标签分布（录制平台的 Episode 标签）");
  if (data.error) return h("div", { class: "sub", id }, head, h("p", { class: "notice" }, data.error));
  if (!tags || tags.state === "missing") {
    return h("div", { class: "sub", id }, head, h("p", { class: "muted" },
      `这个训练视图还没有标签文件 ${tags?.state === "missing" ? tags.file : "episode_tags.json"}。`,
      "标签从 realman_ts 录制平台同步过来（realman-train tags refresh），同步后这里显示光照和日期分布。"));
  }
  if (tags.state === "mismatch") return h("div", { class: "sub", id }, head, h("p", { class: "notice" }, tags.error));
  const tasks = data.tasks!.map((t) => t.task);
  const total = Math.max(1, data.totals!.episodes);
  return h("div", { class: "sub", id }, head,
    h("p", { class: "muted" }, `训练视图 ${data.view} · 标签快照 ${fmtTime(tags.snapshot_at)}；条形按任务着色。`),
    h("p", { class: "legend" }, tasks.map((task, i) => h("span", {}, h("i", { class: `s${i % 4}` }), task))),
    h("div", { class: "facets" }, Object.entries(tags.keys).map(([key, slots]) => h("div", { "data-tag": key },
      h("h3", {}, TAG_TITLE[key] ?? key),
      h("div", { class: "task-bars" }, slots.map((slot) => h("div", { class: "task-bar" },
        h("span", {}, h("strong", {}, tagValue(key, slot.value))),
        h("span", { class: "mono" }, `${slot.episodes} 条 · ${((100 * slot.episodes) / total).toFixed(0)}%`),
        h("div", { class: "split-bar", title: Object.entries(slot.by_task).map(([t, n]) => `${t} ${n}`).join(" · ") },
          tasks.map((task, i) => slot.by_task[task]
            ? h("i", { class: `legend-dot-bar s${i % 4}`, style: `width:${((100 * slot.by_task[task]) / total).toFixed(1)}%` }) : null)),
        h("small", { class: "muted wide" }, Object.entries(slot.by_task).map(([t, n]) => `${t} ${n}`).join(" · "),
          ` · 留出 ${slot.holdout} · 人工标注 ${slot.manual}`))))))));
}
