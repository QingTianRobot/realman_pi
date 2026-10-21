import { api, type DatasetDetail, type DatasetRow, type EpisodeQuality, type Options } from "../api";
import { sparkline } from "../charts";
import type { Ctx } from "../ctx";
import { confirmJob } from "../dialog";
import { DATASET_KIND, errorText, fmtBytes, fmtCount, fmtDay, fmtDuration, fmtTime, h } from "../dom";
import { chip, kv, panel, panelHead, stat } from "../widgets";

const VERDICT: Record<EpisodeQuality["verdict"], [string, "ok" | "warn" | "bad"]> = {
  ok: ["正常", "ok"], warn: ["提示", "warn"], suggest_drop: ["建议剔除", "bad"],
};

/** Several pulls share the recording's name: title those by their folder so they can be told apart. */
export function datasetTitle(row: DatasetRow, rows: DatasetRow[]): string {
  const clash = rows.filter((r) => r.name === row.name).length > 1;
  const parent = row.path.includes("/") ? row.path.slice(0, row.path.lastIndexOf("/")) : "";
  return clash && parent ? parent : row.name;
}

function datasetItem(row: DatasetRow, rows: DatasetRow[], selected: boolean, newest: boolean, ctx: Ctx): HTMLElement {
  const quality = row.quality_counts;
  const title = datasetTitle(row, rows);
  const item = h("button", { class: `item${selected ? " selected" : ""}`, type: "button", "data-path": row.path },
    h("strong", {}, title, " ", chip(DATASET_KIND[row.kind] ?? row.kind, row.kind === "error" ? "bad" : ""),
      newest ? [" ", chip("最新", "ok")] : null),
    row.kind === "error"
      ? h("small", {}, row.error ?? "")
      : h("small", {}, `${row.episodes} 条 · ${fmtCount(row.frames)} 帧 · ${fmtTime(row.last_file_time)}`),
    quality?.suggest_drop ? h("small", {}, `建议剔除 ${quality.suggest_drop} 条`) : null,
    row.kind === "clean" && row.removed_episodes ? h("small", {}, `已剔除 ${row.removed_episodes} 条`) : null,
    row.path !== title ? h("small", {}, row.path) : null);
  item.addEventListener("click", () => ctx.navigate("data", { path: row.path }));
  return item;
}

function taskBars(detail: DatasetDetail): HTMLElement {
  const s = detail.summary;
  const total = Math.max(1, s.episodes);
  return h("div", { class: "task-bars", id: "task-bars" }, Object.entries(s.tasks).map(([task, count]) =>
    h("div", { class: "task-bar" }, h("span", {}, task), h("span", {}, `${count} 条 · ${fmtCount(s.task_frames[task])} 帧`),
      h("div", { class: "bar" }, h("i", { style: `width:${((100 * count) / total).toFixed(1)}%` })))));
}

function features(detail: DatasetDetail): HTMLElement {
  const s = detail.summary;
  return h("div", { id: "features" },
    kv(Object.entries(s.features).map(([name, f]) => [name, `${f.dtype} [${(f.shape ?? []).join(", ")}]`])),
    h("h3", {}, "相机"),
    kv(s.cameras.map((c) => [c.key, `${c.codec ?? "?"} · ${c.height ?? "?"}×${c.width ?? "?"}`])));
}

function reasonFor(q: EpisodeQuality | undefined): string {
  const drops = (q?.findings ?? []).filter((f) => f.severity === "drop").map((f) => f.message);
  return drops.length ? drops.join("; ") : "人工剔除";
}

function viewForm(detail: DatasetDetail, options: Options, ctx: Ctx): HTMLElement {
  const s = detail.summary;
  const arm = h("select", { name: "arm" }, options.arms.map((a) => h("option", { value: a, selected: a === options.default_arm }, a)));
  const prompts = Object.keys(s.tasks).map((task) =>
    h("label", { class: "wide" }, `${task} 的 prompt`,
      h("input", { type: "text", "data-task": task, value: options.prompts[task] ?? "" })));
  const dst = h("input", { type: "text", name: "dst", placeholder: `${s.name}_view` });
  const dryRun = h("input", { type: "checkbox", name: "dry_run" });
  const error = h("p", { class: "error", hidden: true });
  const start = h("button", { class: "button primary", id: "view-start", type: "button" }, "生成训练视图");
  start.addEventListener("click", () => {
    const taskPrompts: Record<string, string> = {};
    for (const input of prompts.map((label) => label.querySelector("input")!)) taskPrompts[input.dataset.task!] = input.value.trim();
    const empty = Object.entries(taskPrompts).filter(([, p]) => !p).map(([t]) => t);
    if (empty.length) {
      error.textContent = `这些任务没有 prompt：${empty.join(", ")}`;
      error.hidden = false;
      return;
    }
    error.hidden = true;
    const params: Record<string, unknown> = { src: detail.path, arm: arm.value, task_prompts: taskPrompts, dry_run: dryRun.checked };
    if (dst.value.trim()) params.dst = dst.value.trim();
    void confirmJob(ctx, {
      title: "生成训练视图", kind: "view", params,
      lines: [`来源：${detail.path}`, `手臂：${arm.value}`, ...Object.entries(taskPrompts).map(([t, p]) => `${t} → "${p}"`),
        `新目录：${dst.value.trim() || `${s.name}_view`}（已存在会被拒绝）`, "生成后自动检查每条的夹爪标签",
        ...(dryRun.checked ? ["试运行：只打印命令"] : [])],
    });
  });
  return h("div", { id: "view-form", hidden: true },
    h("h3", {}, "训练视图"),
    h("div", { class: "form" }, h("label", {}, "手臂", arm), ...prompts, h("label", {}, "目录名（可选）", dst),
      h("label", { class: "check" }, dryRun, "试运行")),
    h("p", { class: "muted" }, "prompt 必须和机器人 policy_bridge 的 prompt 完全一致。"),
    error, h("div", { class: "actions" }, start));
}

function qualitySection(detail: DatasetDetail, options: Options, ctx: Ctx): HTMLElement {
  if (!detail.quality) {
    return panel("逐条质检", h("p", { class: "notice quality-unavailable" }, detail.quality_unavailable ?? "没有质检结果"));
  }
  const byEpisode = new Map(detail.quality.map((q) => [q.episode, q]));
  const suggested = new Set(detail.suggested_drops);
  const count = h("span", { id: "drop-count", class: "muted" });
  const makeClean = h("button", { class: "button primary", id: "make-clean", type: "button" });
  const makeView = h("button", { class: "button secondary", id: "make-view", type: "button" }, "生成训练视图…");
  const form = viewForm(detail, options, ctx);
  makeView.addEventListener("click", () => { form.hidden = !form.hidden; });
  const fps = detail.summary.fps || 1;
  const body = h("tbody", {}, detail.quality.map((q) => {
    const [label, tone] = VERDICT[q.verdict];
    const box = h("input", { type: "checkbox", class: "drop", checked: suggested.has(q.episode), "aria-label": `剔除 ${q.episode}` });
    box.addEventListener("change", update);
    return h("tr", { "data-episode": q.episode },
      h("td", {}, box), h("td", { class: "num" }, q.episode), h("td", {}, q.task),
      h("td", { class: "num" }, `${q.frames} · ${fmtDuration(q.frames / fps)}`),
      h("td", {}, sparkline(detail.traces[String(q.episode)])), h("td", {}, chip(label, tone)),
      h("td", {}, q.findings.map((f) => f.message).join("；")));
  }));
  function checked(): number[] {
    return [...body.querySelectorAll<HTMLInputElement>("input.drop")].filter((b) => b.checked)
      .map((b) => Number(b.closest("tr")!.dataset.episode)).sort((a, b) => a - b);
  }
  function update(): void {
    const n = checked().length;
    count.textContent = `已选 ${n} 条`;
    makeClean.textContent = `生成清洗版（剔除 ${n} 条）`;
    makeClean.disabled = n === 0;
  }
  makeClean.addEventListener("click", () => {
    const drop = checked();
    const reasons = Object.fromEntries(drop.map((ep) => [String(ep), reasonFor(byEpisode.get(ep))]));
    void confirmJob(ctx, {
      title: "生成清洗版", kind: "clean", params: { src: detail.path, drop, reasons },
      lines: [`来源：${detail.path}`, `剔除 ${drop.length} 条：${drop.join(", ")}`,
        `新目录：${detail.summary.name}_clean_<日期时间>（原数据不动，视频用硬链接）`, "剔除清单和原因写进新目录的 clean_manifest.json"],
    });
  });
  update();
  return h("section", { class: "panel" },
    panelHead("逐条质检", count, makeClean, makeView),
    h("p", { class: "muted" }, "建议剔除的条目已预勾选；勾选可增减，确认后才生成清洗版。夹爪缩略图：上 = 闭合，下 = 张开。"),
    h("div", { class: "table-wrap" }, h("table", { id: "quality-table" },
      h("thead", {}, h("tr", {}, ["剔除", "#", "任务", "帧数 · 时长", "夹爪", "结论", "原因"].map((t) => h("th", {}, t)))), body)),
    form);
}

async function renderDetail(el: HTMLElement, path: string, options: Options, ctx: Ctx): Promise<void> {
  let detail: DatasetDetail;
  try {
    detail = await api.dataset(path);
  } catch (error) {
    el.replaceChildren(h("p", { class: "error" }, errorText(error)));
    return;
  }
  const s = detail.summary;
  const codecs = [...new Set(s.cameras.map((c) => c.codec ?? "?"))].join(", ") || "–";
  const provenance: [string, string][] = [["类型", DATASET_KIND[s.kind] ?? s.kind], ["路径", detail.path], ["机器人", s.robot_type || "–"]];
  if (s.source) provenance.push(["来源", s.source]);
  if (s.removed_episodes) provenance.push(["已剔除", `${s.removed_episodes} 条`]);
  for (const [task, prompt] of Object.entries(s.prompts)) provenance.push([`prompt ${task}`, prompt]);
  const trainButton = s.kind === "view" ? h("button", { class: "button primary", id: "train-from-view", type: "button" }, "用这个视图新建训练") : null;
  trainButton?.addEventListener("click", () => ctx.navigate("train", { view: detail.path }));
  el.replaceChildren(
    h("section", { class: "panel" },
      panelHead(s.name, trainButton),
      h("div", { class: "stats", id: "dataset-stats" },
        stat("条数", String(s.episodes)),
        stat("帧数 / 时长", `${fmtCount(s.frames)} · ${fmtDuration(s.duration_sec)}`),
        stat("时间范围", `${fmtDay(s.first_file_time)} → ${fmtDay(s.last_file_time)}`),
        stat("格式", `LeRobot ${s.codebase_version} · ${s.fps} fps`),
        stat("磁盘 / 编码", `${fmtBytes(s.disk_bytes)} · ${codecs}`)),
      h("h3", {}, "来源"), kv(provenance)),
    h("section", { class: "two" }, panel("任务分布", taskBars(detail)), panel("特征与相机", features(detail))),
    qualitySection(detail, options, ctx));
}

export async function renderData(root: HTMLElement, ctx: Ctx): Promise<() => void> {
  const [{ datasets }, options] = await Promise.all([api.datasets(), api.options()]);
  const selected = ctx.query.get("path") ?? datasets.find((d) => d.kind !== "error")?.path ?? null;
  const pull = h("button", { class: "button secondary", id: "pull", type: "button" }, "从 realman_ts 拉取");
  pull.addEventListener("click", () => void confirmJob(ctx, {
    title: "从 realman_ts 拉取录制", kind: "pull", params: {},
    lines: ["通过 ssh realman_local 从录制容器打包当前录制", `写入 ${ctx.health.data_root}/raw_realman_ts_<日期时间>（新目录，不覆盖）`,
      "录制可以继续；拉取期间占用 realman_ts 的上行带宽"],
  }));
  // The API lists newest first: mark the newest of each kind.
  const newest = new Set(["raw", "clean", "view"].map((kind) => datasets.find((d) => d.kind === kind)?.path));
  const list = h("div", { class: "list", id: "dataset-list" },
    datasets.map((row) => datasetItem(row, datasets, row.path === selected, newest.has(row.path), ctx)));
  if (!datasets.length) list.append(h("p", { class: "muted" }, `${ctx.health.data_root} 下还没有数据集`));
  const detail = h("div", { class: "stack", id: "dataset-detail" }, h("p", { class: "loading" }, "加载中…"));
  root.replaceChildren(h("section", { class: "split" },
    h("section", { class: "panel" }, panelHead("数据集", pull), list), detail));
  if (selected) await renderDetail(detail, selected, options, ctx);
  else detail.replaceChildren();
  const onEnded = (event: Event) => {
    const job = (event as CustomEvent).detail;
    if (["pull", "clean", "view"].includes(job.kind) && job.state === "succeeded") ctx.reload();
  };
  window.addEventListener("job-ended", onEnded);
  return () => window.removeEventListener("job-ended", onEnded);
}
