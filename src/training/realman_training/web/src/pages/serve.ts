import { api, type Gpus, type LinkcheckPayload, type LinkRun, type ServeDataset, type ServeStatus, type Settings, type SettingsPayload } from "../api";
import { histogram, rangeRows } from "../charts";
import type { Ctx } from "../ctx";
import { confirmJob } from "../dialog";
import { DATASET_KIND, errorText, fmtCount, fmtDuration, fmtTime, h } from "../dom";
import { checksTable, chip, kv, modelName, pageHead, panel, panelHead, stat, table } from "../widgets";

function serveEnd(status: ServeStatus): HTMLElement {
  const serve = status.serve || {};
  const record = status.record || {};
  const gpu = status.gpu || {};
  const el = panel("server5090 · openpi-serve",
    status.error ? h("p", { class: "notice" }, status.error) : null,
    h("p", { class: `big state ${serve.running ? "ok" : "off"}` }, serve.running ? "运行中" : "已停止"),
    kv([["启动于", fmtTime(serve.started)], ["镜像", `${serve.image ?? "–"} ${serve.image_id ?? ""}`],
      ["模型", record.model ? modelName(record.model, record.step) : "–"], ["端口", record.port ? `:${record.port}` : "–"],
      ["GPU", gpu.used_mib !== undefined ? `GPU ${gpu.index}: ${gpu.used_mib} / ${gpu.total_mib} MiB` : `GPU ${gpu.index ?? "–"}`],
      ["状态时间", fmtTime(status.at)]]));
  el.id = "serve-end";
  return el;
}

function bridgeEnd(status: ServeStatus): HTMLElement {
  const bridge = status.bridge || {};
  const mode = status.bt_mode;
  const state = bridge.error ? "不可达" : !bridge.running ? "已停止" : Number(bridge.allow_publish) ? "发布中" : "空闲（未激活）";
  const el = panel("realman_ts · policy_bridge",
    bridge.error ? h("p", { class: "notice" }, bridge.error) : null,
    h("p", { class: `big state ${bridge.error ? "bad" : bridge.running ? "ok" : "off"}` }, state),
    kv([["启动于", fmtTime(bridge.started)], ["镜像", bridge.image ?? "–"], ["服务地址", bridge.server ? "已设置" : "–"],
      ["行为树模式", mode ? mode.active_mode ?? "–" : "没有 input_mode_state（行为树未运行？）"]]),
    h("p", { class: "muted foot" }, "平台只启停桥接，不激活；机械臂运动仍由行为树和 /policy/activate 决定。"));
  el.id = "bridge-end";
  return el;
}

function bridgeStats(status: ServeStatus): HTMLElement {
  const bridge = status.bridge || {};
  const record = status.record || {};
  const el = panel("桥接统计",
    kv([["prompt", bridge.prompt ?? "–"], ["paused", bridge.paused ?? "–"], ["allow_publish", bridge.allow_publish ?? "–"],
      ["mode_active", bridge.mode_active ?? "–"], ["服务任务", record.task ?? "–"],
      ["预热耗时", (record.warmup_ms ?? []).map((ms: number) => `${Math.round(ms)} ms`).join(" · ") || "–"]]));
  el.id = "bridge-stats";
  return el;
}


const sec = (n: number) => `${n.toFixed(1)} s`;

function taskSplit(data: ServeDataset): HTMLElement {
  const total = Math.max(1, data.totals!.episodes);
  return h("div", { class: "task-bars", id: "serve-dataset-tasks" }, data.tasks!.map((t, i) => h("div", { class: "task-bar" },
    h("span", {}, h("i", { class: `legend-dot s${i % 4}` }), h("strong", {}, t.task), " ", h("span", { class: "muted" }, `ep ${t.first}–${t.last}`)),
    h("span", { class: "mono" }, `${t.episodes} 条 · ${((100 * t.episodes) / total).toFixed(0)}%`),
    h("div", { class: "split-bar", title: `训练 ${t.train} · 留出 ${t.holdout}` },
      h("i", { class: "train", style: `width:${((100 * t.train) / total).toFixed(1)}%` }),
      h("i", { class: "holdout", style: `width:${((100 * t.holdout) / total).toFixed(1)}%` })),
    h("small", { class: "muted wide" }, `${fmtCount(t.frames)} 帧 · ${fmtDuration(t.duration_sec)} · 训练 ${t.train} / 留出 ${t.holdout} · `,
      `单条 ${sec(t.length_sec.min)} – ${sec(t.length_sec.max)}，中位 ${sec(t.length_sec.median)}`),
    h("small", { class: "muted wide" }, "prompt：", h("span", { class: "mono" }, t.prompt)))));
}

function lineageList(data: ServeDataset): HTMLElement {
  return h("ol", { class: "lineage", id: "serve-dataset-lineage" }, data.lineage!.map((row) => h("li", {},
    h("span", {}, chip(DATASET_KIND[row.kind] ?? row.kind, row.kind === "view" ? "ok" : ""), " ", h("span", { class: "mono" }, row.path)),
    h("small", {}, row.episodes !== null ? `${row.episodes} 条 · ${fmtCount(row.frames)} 帧` : "条数未记录",
      row.created ? ` · ${fmtTime(row.created)}` : ""),
    row.removed ? h("small", {}, `从上一级剔除 ${row.removed} 条`,
      row.removed_tasks ? `（${Object.entries(row.removed_tasks).map(([t, n]) => `${t} ${n}`).join("，")}）` : "") : null,
    row.reasons && row.removed ? h("small", {}, "原因：", Object.entries(row.reasons).map(([r, n]) => `${r} ×${n}`).join("；")) : null)));
}

const LIGHTING: Record<string, string> = { "1": "1 较暗", "2": "2 正常", "3": "3 较亮" };
const TAG_TITLE: Record<string, string> = { lighting_level: "光照", date: "录制日期" };

function tagValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return "未标注";
  return key === "lighting_level" ? LIGHTING[String(value)] ?? String(value) : String(value);
}

function tagSection(data: ServeDataset): HTMLElement {
  const tags = data.tags;
  const head = h("h3", {}, "标签分布（录制平台的 Episode 标签）");
  if (!tags || tags.state === "missing") {
    return h("div", { class: "sub", id: "serve-dataset-tags" }, head, h("p", { class: "muted" },
      `这个训练视图还没有标签文件 ${tags?.state === "missing" ? tags.file : "episode_tags.json"}。`,
      "标签从 realman_ts 录制平台同步过来（realman-train tags refresh），同步后这里显示光照和日期分布。"));
  }
  if (tags.state === "mismatch") return h("div", { class: "sub", id: "serve-dataset-tags" }, head, h("p", { class: "notice" }, tags.error));
  const tasks = data.tasks!.map((t) => t.task);
  const total = Math.max(1, data.totals!.episodes);
  return h("div", { class: "sub", id: "serve-dataset-tags" }, head,
    h("p", { class: "muted" }, `标签快照 ${fmtTime(tags.snapshot_at)}；条形按任务着色，颜色同上方任务分布。`),
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

function normSection(data: ServeDataset): HTMLElement | null {
  const norm = data.norm_stats;
  if (!norm || (!norm.state && !norm.actions)) return null;
  const blocks = ([["state", "状态 observation.state", data.description?.state], ["actions", "动作 action", data.description?.action]] as const)
    .filter(([key]) => norm[key]);
  return h("div", { class: "sub", id: "serve-dataset-norm" },
    h("h3", {}, `状态 / 动作分布（checkpoint ${data.step} 的 norm_stats）`),
    h("p", { class: "muted" }, "细线 = q01–q99，色块 = 均值 ± 标准差，竖线 = 均值；openpi 推理时按这组统计量归一化输入、反归一化输出。悬停看数值。"),
    h("div", { class: "norm-blocks" }, blocks.map(([key, title, text]) => {
      const block = norm[key]!;
      return h("div", {}, rangeRows(block.labels, block, { label: title, id: `norm-${key}` }),
        text ? h("p", { class: "muted" }, text) : null,
        h("details", {}, h("summary", {}, "数值表"),
          table(["维度", "均值", "标准差", "q01", "q99"], block.labels.map((label, i) =>
            [label, block.mean[i].toFixed(3), block.std[i].toFixed(3), block.q01[i].toFixed(3), block.q99[i].toFixed(3)]),
          { numeric: [1, 2, 3, 4] })));
    })),
    h("p", { class: "muted mono" }, norm.file));
}

function datasetBody(data: ServeDataset, ctx: Ctx): HTMLElement[] {
  if (data.error) return [h("p", { class: "notice" }, data.error), ...[normSection(data)].filter((x): x is HTMLElement => !!x)];
  const d = data.description!;
  const totals = data.totals!;
  const tasks = data.tasks!;
  const lengths = data.lengths!;
  const unit = lengths.unit === "s" ? "s" : "帧";
  const open = h("button", { class: "button ghost", type: "button", id: "serve-dataset-open" }, "在数据页打开");
  open.addEventListener("click", () => ctx.navigate("data", { path: data.view }));
  const params = Object.entries(d.params).map(([k, v]) => `${k}=${v}`).join(" · ");
  return [
    h("div", { class: "stats", id: "serve-dataset-stats" },
      stat("条数", `${totals.episodes}（训练 ${totals.train} / 留出 ${totals.holdout}）`),
      stat("帧数 / 时长", `${fmtCount(totals.frames)} · ${fmtDuration(totals.duration_sec)}`),
      stat("任务", `${tasks.length} 个`),
      stat("手臂 / 相机", `${d.arm ?? "–"} · ${d.cameras.join(" + ") || "–"}`),
      stat("训练", `${data.batch_size ?? "–"} × ${fmtCount(data.num_train_steps)} 步`)),
    h("div", { class: "facets" },
      h("div", { class: "sub" }, h("h3", {}, "数据集描述"), kv([
        ["训练视图", h("span", { class: "mono" }, data.view)], ["生成于", fmtTime(d.created)],
        ["采样率", d.fps ? `${d.fps} fps` : "–"], ["状态", d.state ?? "–"], ["动作", d.action ?? "–"],
        ["夹爪目标", d.gripper_target ?? "–"], ["转换参数", params || "–"], ["方法", data.method ?? "–"],
        ["留出集", h("span", { class: "mono" }, (data.holdout_episodes ?? []).join(", ") || "–")]]),
      h("div", { class: "actions" }, open)),
      h("div", { class: "sub" }, h("h3", {}, "任务分布（深色 = 训练，浅色 = 留出评估）"), taskSplit(data)),
      h("div", { class: "sub" }, h("h3", {}, "数据来源（自下而上）"), lineageList(data))),
    tagSection(data),
    h("div", { class: "sub" }, h("h3", {}, "单条时长分布"),
      histogram(lengths.edges, lengths.counts, { label: `条数 / 时长（${unit}）`, unit, id: "serve-dataset-lengths" }),
      h("p", { class: "legend" }, tasks.map((t, i) => h("span", {}, h("i", { class: `s${i % 4}` }), t.task)))),
    ...[normSection(data)].filter((x): x is HTMLElement => !!x),
  ];
}

/** The training data of the model being served, or of the model chosen in the settings when nothing is served. */
function datasetPanel(ctx: Ctx): { el: HTMLElement; show: (model: string | null, step: unknown, served: boolean) => void } {
  const body = h("div", { id: "serve-dataset-body" }, h("p", { class: "loading" }, "加载中…"));
  const title = h("span", { class: "muted", id: "serve-dataset-model" });
  const el = h("section", { class: "panel", id: "serve-dataset" }, h("div", { class: "panel-head" }, h("h2", {}, "训练数据集"), title), body);
  let seq = 0;
  const show = (model: string | null, step: unknown, served: boolean) => {
    const mine = ++seq;
    if (!model) {
      title.replaceChildren();
      body.replaceChildren(h("p", { class: "muted" }, "没有选中的模型"));
      return;
    }
    title.replaceChildren(served ? chip("服务中", "ok") : chip("设置里选中（未服务）"), " ", modelName(model, step || null));
    body.replaceChildren(h("p", { class: "loading" }, "加载中…"));
    void (async () => {
      let content: HTMLElement[];
      try {
        content = datasetBody(await api.serveDataset(model, step ? String(step) : null), ctx);
      } catch (error) {
        content = [h("p", { class: "error" }, errorText(error))];
      }
      if (mine === seq) body.replaceChildren(...content);
    })();
  };
  return { el, show };
}

function settingsForm(payload: SettingsPayload, gpus: Gpus | null, prefill: string | null, ctx: Ctx,
  onPick?: (model: string, checkpoint: string) => void): HTMLElement {
  const effective: Settings = { ...payload.effective };
  if (prefill && prefill !== effective.model) Object.assign(effective, { model: prefill, checkpoint: "", task: null });
  const names = payload.models.map((m) => m.name);
  if (!names.includes(effective.model)) names.unshift(effective.model);
  const model = h("select", { name: "model" }, names.map((n) => h("option", { value: n, selected: n === effective.model }, n)));
  const checkpoint = h("select", { name: "checkpoint" });
  const task = h("select", { name: "task" });
  const indices = gpus?.gpus.map((g) => g.index) ?? [0, 1, 2, 3];
  const gpu = h("select", { name: "gpu" }, indices.map((i) => {
    const info = gpus?.gpus.find((g) => g.index === i);
    const who = info?.users.map((u) => u.who).join(", ");
    return h("option", { value: i, selected: i === effective.gpu }, `GPU ${i}${who ? ` · ${who}` : ""}`);
  }));
  const port = h("input", { type: "number", name: "port", min: 1, max: 65535, value: effective.port });
  const message = h("p", { class: "muted", id: "settings-message" });
  function fillModel(keep: boolean): void {
    const info = payload.models.find((m) => m.name === model.value);
    checkpoint.replaceChildren(h("option", { value: "" }, "最新"),
      ...(info?.checkpoints ?? []).map((s) => h("option", { value: s, selected: keep && String(s) === String(effective.checkpoint) }, String(s))));
    const prompts = info?.prompts ?? {};
    task.replaceChildren(...Object.entries(prompts).map(([t, p]) =>
      h("option", { value: t, selected: keep && t === effective.task }, `${t} · ${p}`)));
  }
  fillModel(true);
  model.addEventListener("change", () => {
    fillModel(false);
    onPick?.(model.value, checkpoint.value);
  });
  checkpoint.addEventListener("change", () => onPick?.(model.value, checkpoint.value));
  const values = (): Settings => ({ model: model.value, checkpoint: checkpoint.value, gpu: Number(gpu.value),
    port: Number(port.value), task: task.value || null });
  const promptOf = (s: Settings) => payload.models.find((m) => m.name === s.model)?.prompts[s.task ?? ""] ?? "（模型的第一个任务）";
  const save = h("button", { class: "button secondary", id: "save-settings", type: "button" }, "保存设置");
  save.addEventListener("click", async () => {
    try {
      await api.saveSettings(values());
      message.textContent = `已保存 · ${fmtTime(new Date().toISOString())}`;
      message.className = "muted";
    } catch (error) {
      message.textContent = errorText(error);
      message.className = "error";
    }
  });
  const start = h("button", { class: "button primary", id: "serve-start", type: "button" }, "启动");
  start.addEventListener("click", () => {
    const s = values();
    void confirmJob(ctx, {
      title: "启动推理链路", kind: "serve", params: { action: "start", ...s, checkpoint: s.checkpoint ? Number(s.checkpoint) : null },
      lines: [`模型 ${s.model} @ ${s.checkpoint || "最新"}`, `GPU ${s.gpu} · 端口 ${s.port}`, `prompt：${promptOf(s)}`,
        "启动 openpi-serve → 预热 → 在 realman_ts 重建 policy_bridge（不激活）→ 链路检测",
        "行为树在 policy 模式、GPU 被他人占用或端口与机器人配置不符时会被拒绝"],
    });
  });
  const stop = h("button", { class: "button danger", id: "serve-stop", type: "button" }, "关闭");
  stop.addEventListener("click", () => void confirmJob(ctx, {
    title: "关闭推理链路", kind: "serve", params: { action: "stop" }, danger: true, confirmLabel: "确认关闭",
    lines: ["先停桥接，再停 openpi-serve", "行为树在 policy 模式时会拒绝；平台从不切换行为树模式"],
  }));
  const check = h("button", { class: "button secondary", id: "run-linkcheck", type: "button" }, "链路检测");
  check.addEventListener("click", () => void confirmJob(ctx, {
    title: "数据链路检测", kind: "linkcheck", params: {},
    lines: ["Pika 节点与 Wi-Fi 负载", "realman_ts → server5090 吞吐与 ping", "桥接镜像里的端到端推理（真实尺寸）", "桥接 /policy/stats"],
  }));
  return panel("设置",
    h("div", { class: "form", id: "serve-form" }, h("label", { class: "wide" }, "模型", model), h("label", {}, "checkpoint", checkpoint),
      h("label", { class: "wide" }, "任务 · prompt", task), h("label", {}, "GPU", gpu), h("label", {}, "端口", port)),
    h("p", { class: "muted" }, "prompt 只能从模型的任务里选；保存的设置存在平台状态目录，不改仓库配置。"),
    message, h("div", { class: "actions" }, save, start, stop, check));
}

function linkcheckPanel(link: LinkcheckPayload): HTMLElement {
  const latest = h("div", { id: "linkcheck-latest" });
  const show = (run: LinkRun | null) => latest.replaceChildren(run
    ? h("div", {}, h("p", { class: "muted" }, `${fmtTime(run.at)} · `, chip(run.ok ? "全部通过" : "未通过", run.ok ? "ok" : "bad")),
      checksTable(run.checks))
    : h("p", { class: "muted" }, "还没有链路检测"));
  show(link.latest);
  const history = h("div", { class: "list", id: "linkcheck-history" }, link.history.map((run) => {
    const item = h("button", { class: "item", type: "button" },
      h("strong", {}, fmtTime(run.at), " ", chip(run.ok ? "通过" : "未通过", run.ok ? "ok" : "bad")),
      h("small", {}, run.checks.filter((c) => !c.ok).map((c) => c.name).join(", ") || "全部通过"));
    item.addEventListener("click", () => show(run));
    return item;
  }));
  return panel("链路检测", latest, h("div", { class: "sub" }, h("h3", {}, "历史"), history));
}

function errorPanel(reason: unknown): HTMLElement {
  return h("p", { class: "error" }, errorText(reason));
}

export async function renderServe(root: HTMLElement, ctx: Ctx): Promise<() => void> {
  const [statusResult, settingsResult, linkResult, gpusResult] = await Promise.allSettled([
    api.serve(), api.settings(), api.linkcheck(), api.gpus(),
  ]);
  const status = statusResult.status === "fulfilled" ? statusResult.value : null;
  const settings = settingsResult.status === "fulfilled" ? settingsResult.value : null;
  const link = linkResult.status === "fulfilled" ? linkResult.value : null;
  const gpus = gpusResult.status === "fulfilled" ? gpusResult.value : null;
  const errors = [statusResult, settingsResult, linkResult, gpusResult]
    .filter((r) => r.status === "rejected")
    .map((r) => errorPanel((r as PromiseRejectedResult).reason));
  const refresh = h("button", { class: "button ghost", id: "serve-refresh", type: "button" }, "刷新状态");
  refresh.addEventListener("click", async () => {
    refresh.disabled = true;
    try {
      await api.serve(true);
    } finally {
      ctx.reload();
    }
  });
  const dataset = datasetPanel(ctx);
  const record = status?.record || {};
  const served = Boolean(status?.serve?.running && record.model);
  const prefill = ctx.query.get("model");
  root.replaceChildren(
    pageHead("推理服务", "server5090 的 openpi-serve 和 realman_ts 的 policy_bridge；不碰 bringup 和行为树。", refresh),
    ...errors,
    ...(status ? [h("section", { class: "grid3" }, serveEnd(status), bridgeEnd(status), bridgeStats(status))] : []),
    h("section", { class: "two" }, ...(settings ? [settingsForm(settings, gpus, prefill, ctx,
      (model, checkpoint) => dataset.show(model, checkpoint, false))] : []),
      ...(link ? [linkcheckPanel(link)] : [])),
    dataset.el);
  if (prefill && prefill !== record.model) dataset.show(prefill, null, false);
  else if (served) dataset.show(record.model, record.step, true);
  else if (settings) dataset.show(settings.effective.model, settings.effective.checkpoint, false);
  else dataset.show(null, null, false);
  const onEnded = (event: Event) => {
    const job = (event as CustomEvent).detail;
    if (["serve", "linkcheck"].includes(job.kind)) ctx.reload();
  };
  window.addEventListener("job-ended", onEnded);
  return () => window.removeEventListener("job-ended", onEnded);
}
