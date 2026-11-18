import type { Check, Gpus, HostResources, JobRow, Pace, ResourceSample } from "./api";
import { sparkline } from "./charts";
import { fmtMae, fmtMiB, fmtRate, fmtRemaining, fmtTime, h, KIND_LABEL, STATE_LABEL, stateClass, type Child } from "./dom";

export function panel(title: string | null, ...children: (Child | Child[])[]): HTMLElement {
  return h("section", { class: "panel" }, title ? h("h2", {}, title) : null, ...children);
}

export function panelHead(title: string, ...actions: Child[]): HTMLElement {
  return h("div", { class: "panel-head" }, h("h2", {}, title), h("div", { class: "actions" }, ...actions));
}

/** The title row of a page: what the page is for, and its main actions. */
export function pageHead(title: string, description: string, ...actions: Child[]): HTMLElement {
  return h("header", { class: "page-head" },
    h("div", {}, h("h1", {}, title), h("p", {}, description)),
    h("div", { class: "actions" }, ...actions));
}

/** Pass/fail rows for link checks: one line per item, the failing ones first. */
export function checkList(checks: Check[]): HTMLElement {
  const ordered = [...checks].sort((a, b) => Number(a.ok) - Number(b.ok));
  return h("ul", { class: "check-list" }, ordered.map((c) =>
    h("li", { class: c.ok ? "ok" : "bad" }, h("span", { class: "mark", "aria-label": c.ok ? "通过" : "未通过" }, c.ok ? "✓" : "✕"),
      h("span", {}, c.name), h("span", { class: "mono" }, c.value || "–"))));
}

export function stat(label: string, value: Child): HTMLElement {
  return h("div", { class: "stat" }, h("span", {}, label), h("b", {}, value));
}

export function kv(pairs: [string, Child][]): HTMLElement {
  return h("dl", { class: "kv" }, pairs.flatMap(([key, value]) => [h("dt", {}, key), h("dd", {}, value ?? "–")]));
}

/** "config/exp" as the run name with its config underneath, so the long name breaks where it should. */
export function modelName(model: string, step: unknown): HTMLElement {
  const cut = model.lastIndexOf("/");
  return h("span", { class: "run-name mono" }, `${model.slice(cut + 1)} @ ${step ?? "最新"}`,
    cut > 0 ? h("small", {}, model.slice(0, cut)) : null);
}

export function chip(text: string, tone: "" | "ok" | "warn" | "bad" | "run" = ""): HTMLElement {
  return h("span", { class: `chip${tone ? ` ${tone}` : ""}` }, text);
}

export function jobChip(job: JobRow): HTMLElement {
  return chip(STATE_LABEL[job.state] ?? job.state, stateClass(job.state) as "ok");
}

export function jobLabel(job: JobRow): string {
  return KIND_LABEL[job.kind] ?? job.kind;
}

export function table(headers: string[], rows: Child[][], opts: { id?: string; numeric?: number[] } = {}): HTMLElement {
  const numeric = new Set(opts.numeric ?? []);
  return h("div", { class: "table-wrap" },
    h("table", { id: opts.id },
      h("thead", {}, h("tr", {}, headers.map((header, i) => h("th", { class: numeric.has(i) ? "num" : null }, header)))),
      h("tbody", {}, rows.map((row) => h("tr", {}, row.map((cell, i) => h("td", { class: numeric.has(i) ? "num" : null }, cell)))))));
}

export function gpuList(gpus: Gpus | null, only?: number[]): HTMLElement {
  if (!gpus) return h("p", { class: "muted" }, "GPU 状态未知");
  if (!gpus.available) return h("p", { class: "notice" }, `nvidia-smi 不可用：${gpus.error ?? ""}`);
  const rows = gpus.gpus.filter((gpu) => !only || only.includes(gpu.index));
  return h("div", { class: "gpu-list" }, rows.map((gpu) => {
    const share = gpu.used_mib && gpu.total_mib ? Math.min(100, (100 * gpu.used_mib) / gpu.total_mib) : 0;
    const users = gpu.users.length ? gpu.users.map((u) => `${u.who} · ${fmtMiB(u.used_mib)}`).join("；") : "空闲";
    return h("div", { class: "gpu-row", "data-gpu": gpu.index },
      h("header", {}, h("strong", {}, `GPU ${gpu.index}`), h("span", {}, `${fmtMiB(gpu.used_mib)} / ${fmtMiB(gpu.total_mib)}`,
        gpu.util_pct === null ? "" : ` · ${gpu.util_pct}%`)),
      h("div", { class: `bar${gpu.busy ? " busy" : ""}` }, h("i", { style: `width:${share.toFixed(1)}%` })),
      trendRow(gpus.history, (sample) => sample.gpu_used_mib[gpus.gpus.indexOf(gpu)] ?? null, gpu.total_mib, fmtDeltaMiB),
      h("div", { class: "gpu-users" }, users));
  }));
}

export function checksTable(checks: Check[], id?: string): HTMLElement {
  return table(["项目", "结果", "数值", "阈值", "说明"], checks.map((c) => [
    c.name, chip(c.ok ? "PASS" : "FAIL", c.ok ? "ok" : "bad"), c.value, c.threshold, c.detail || "",
  ]), { id });
}

type Evals = Record<string, Record<string, any>> | null | undefined;

function evalSteps(evals: Evals): string[] {
  return Object.keys(evals ?? {}).filter((s) => /^\d+$/.test(s)).sort((a, b) => Number(a) - Number(b));
}

export function evalTable(evals: Evals, id = "eval-table"): HTMLElement {
  const steps = evalSteps(evals);
  if (!steps.length) return h("p", { class: "muted" }, "还没有评估结果");
  const tasks = [...new Set(steps.flatMap((s) => Object.keys(evals![s]).filter((t) => t !== "prompt_swap")))].sort();
  const rows: Child[][] = steps.map((s) => [s, ...tasks.map((t) => fmtMae(evals![s][t]?.mae))]);
  const baseline = steps.map((s) => evals![s]).find((block) => tasks.some((t) => block[t]?.zero_baseline !== undefined));
  if (baseline) rows.push(["零动作基线", ...tasks.map((t) => fmtMae(baseline[t]?.zero_baseline))]);
  return table(["checkpoint", ...tasks.map((t) => `${t} MAE`)], rows, { id, numeric: tasks.map((_, i) => i + 1) });
}

export function swapTable(evals: Evals, id = "swap-table"): HTMLElement | null {
  const step = evalSteps(evals).reverse().find((s) => evals![s].prompt_swap);
  if (!step) return null;
  const swap: Record<string, Record<string, number>> = evals![step].prompt_swap;
  const tasks = Object.keys(swap).sort();
  const prompts = [...new Set(tasks.flatMap((t) => Object.keys(swap[t])))].sort();
  return h("div", {},
    h("h3", {}, `prompt 交换（checkpoint ${step}）：行 = 数据任务，列 = 给模型的 prompt`),
    table(["任务", ...prompts], tasks.map((t) => [t, ...prompts.map((p) => {
      const value = fmtMae(swap[t][p]);
      return p === t ? h("strong", {}, value) : value;
    })]), { id, numeric: prompts.map((_, i) => i + 1) }));
}

function minutesSince(iso: string | null): number | null {
  const t = iso ? Date.parse(iso) : NaN;
  return Number.isNaN(t) ? null : Math.max(0, Math.round((Date.now() - t) / 60000));
}

/** Speed, time left and finish time of a run, for a kv list; a finished run shows its average speed. */
export function paceRows(pace: Pace | null | undefined, live: boolean): [string, Child][] {
  if (!pace) return live ? [["速度", "等待第一步"]] : [];
  if (!live) return [["平均速度", fmtRate(pace.rate)]];
  const rows: [string, Child][] = [["速度", fmtRate(pace.rate)], ["剩余", fmtRemaining(pace.remaining_sec)],
    ["预计完成", pace.eta ? fmtTime(pace.eta) : "–"]];
  if (pace.stale) rows.push(["日志", chip(`${minutesSince(pace.updated) ?? "?"} min 没更新，训练可能已停`, "warn")]);
  return rows;
}

/** One line for a run list: "1.40 步/s · 剩 5 h 46 min · 21:21 完成". */
export function paceLine(pace: Pace | null | undefined): string {
  if (!pace?.rate) return "";
  const rate = pace.rate >= 1 ? `${pace.rate.toFixed(2)} 步/s` : `${(1 / pace.rate).toFixed(1)} s/步`;
  if (pace.remaining_sec === null) return rate;
  return `${rate} · 剩 ${fmtRemaining(pace.remaining_sec)}${pace.eta ? ` · ${fmtTime(pace.eta).slice(-5)} 完成` : ""}${pace.stale ? " · 日志停了" : ""}`;
}

/** "+1.2 GiB" / "−300 MiB" / "±0": the change since the previous sample. */
function fmtDeltaMiB(delta: number): string {
  if (Math.abs(delta) < 1) return "±0";
  const sign = delta > 0 ? "+" : "−";
  const size = Math.abs(delta);
  return size >= 1024 ? `${sign}${(size / 1024).toFixed(1)} GiB` : `${sign}${Math.round(size)} MiB`;
}

function fmtDeltaLoad(delta: number): string {
  return Math.abs(delta) < 0.05 ? "±0" : `${delta > 0 ? "+" : "−"}${Math.abs(delta).toFixed(2)}`;
}

/** The change since the previous sample and a sparkline of the kept history (scaled to `full`, or to its own max). */
function trendRow(history: ResourceSample[] | undefined, pick: (sample: ResourceSample) => number | null,
  full: number | null | undefined, fmt: (delta: number) => string): HTMLElement | null {
  const values = (history ?? []).map(pick).filter((v): v is number => v !== null && v !== undefined);
  if (values.length < 2) return null;
  const delta = values[values.length - 1] - values[values.length - 2];
  const top = full || Math.max(...values) || 1;
  const tone = Math.abs(delta) < 1e-9 ? "" : delta > 0 ? " up" : " down";
  return h("div", { class: "trend" }, h("span", { class: `delta${tone}`, title: "与上一次刷新相比" }, fmt(delta)),
    sparkline(values.map((v) => Math.max(0, Math.min(1, v / top)))));
}

/** Memory, the work dir's disk and load of the compute host, each with its change and a short trend. */
export function hostResources(gpus: Gpus | null): HTMLElement | null {
  const host: HostResources | null | undefined = gpus?.host;
  if (!gpus || !host) return null;
  const rows: HTMLElement[] = [];
  if (host.mem_total_mib) {
    const used = host.mem_used_mib ?? 0;
    rows.push(resourceRow("内存", `${fmtMiB(used)} / ${fmtMiB(host.mem_total_mib)}（可用 ${fmtMiB(host.mem_available_mib)}）`,
      used / host.mem_total_mib, "",
      trendRow(gpus.history, (s) => s.mem_used_mib, host.mem_total_mib, fmtDeltaMiB)));
  }
  if (host.disk_total_kib) {
    const avail = host.disk_avail_kib ?? 0;
    const freePct = (100 * avail) / host.disk_total_kib;
    const tone = freePct < 5 ? "bad" : freePct < 10 ? "warn" : "";
    rows.push(resourceRow("磁盘（工作目录）", `剩 ${fmtMiB(avail / 1024)}（${freePct.toFixed(1)}%）/ ${fmtMiB(host.disk_total_kib / 1024)}`,
      1 - avail / host.disk_total_kib, tone,
      trendRow(gpus.history, (s) => (s.disk_avail_kib === null ? null : s.disk_avail_kib / 1024), host.disk_total_kib / 1024, fmtDeltaMiB)));
  }
  if (host.load1 !== null && host.load1 !== undefined && host.cores) {
    rows.push(resourceRow("负载（1 分钟）", `${host.load1.toFixed(2)} / ${host.cores} 核`, host.load1 / host.cores, "",
      trendRow(gpus.history, (s) => s.load1, null, fmtDeltaLoad)));
  }
  return rows.length ? h("div", { class: "host-resources" }, rows) : null;
}

function resourceRow(label: string, value: string, share: number, tone: "" | "warn" | "bad", trend: HTMLElement | null): HTMLElement {
  const width = Math.max(0, Math.min(100, 100 * share));
  return h("div", { class: "host-row", "data-resource": label },
    h("header", {}, h("strong", {}, label), h("span", {}, value)),
    h("div", { class: `bar${tone ? ` ${tone}` : ""}` }, h("i", { style: `width:${width.toFixed(1)}%` })),
    trend);
}
