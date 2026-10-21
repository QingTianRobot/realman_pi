import { api, type Gpus, type LinkcheckPayload, type LinkRun, type ServeStatus, type Settings, type SettingsPayload } from "../api";
import type { Ctx } from "../ctx";
import { confirmJob } from "../dialog";
import { errorText, fmtTime, h } from "../dom";
import { checksTable, chip, kv, panel, panelHead } from "../widgets";

function serveEnd(status: ServeStatus): HTMLElement {
  const serve = status.serve || {};
  const record = status.record || {};
  const gpu = status.gpu || {};
  const el = panel("server5090 · openpi-serve",
    status.error ? h("p", { class: "notice" }, status.error) : null,
    h("p", { class: "big" }, serve.running ? "运行中" : "已停止"),
    kv([["启动于", fmtTime(serve.started)], ["镜像", `${serve.image ?? "–"} ${serve.image_id ?? ""}`],
      ["模型", record.model ? `${record.model} @ ${record.step}` : "–"], ["端口", record.port ? `:${record.port}` : "–"],
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
    h("p", { class: "big" }, state),
    kv([["启动于", fmtTime(bridge.started)], ["镜像", bridge.image ?? "–"], ["服务地址", bridge.server ? "已设置" : "–"],
      ["行为树模式", mode ? mode.active_mode ?? "–" : "没有 input_mode_state（行为树未运行？）"]]),
    h("p", { class: "muted" }, "平台只启停桥接，不激活；机械臂运动仍由行为树和 /policy/activate 决定。"));
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

function settingsForm(payload: SettingsPayload, gpus: Gpus | null, prefill: string | null, ctx: Ctx): HTMLElement {
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
  model.addEventListener("change", () => fillModel(false));
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
  return h("section", { class: "two" }, panel("链路检测", latest), panel("历史", history));
}

export async function renderServe(root: HTMLElement, ctx: Ctx): Promise<() => void> {
  const [status, settings, link, gpus] = await Promise.all([api.serve(), api.settings(), api.linkcheck(), api.gpus().catch(() => null)]);
  const refresh = h("button", { class: "button ghost", id: "serve-refresh", type: "button" }, "刷新状态");
  refresh.addEventListener("click", async () => {
    refresh.disabled = true;
    try {
      await api.serve(true);
    } finally {
      ctx.reload();
    }
  });
  root.replaceChildren(
    h("section", { class: "panel" }, panelHead("推理链路", refresh),
      h("p", { class: "muted" }, "server5090 的 openpi-serve 和 realman_ts 的 policy_bridge；不碰 bringup 和行为树。")),
    h("section", { class: "two" }, serveEnd(status), bridgeEnd(status)),
    h("section", { class: "two" }, settingsForm(settings, gpus, ctx.query.get("model"), ctx), bridgeStats(status)),
    linkcheckPanel(link));
  const onEnded = (event: Event) => {
    const job = (event as CustomEvent).detail;
    if (["serve", "linkcheck"].includes(job.kind)) ctx.reload();
  };
  window.addEventListener("job-ended", onEnded);
  return () => window.removeEventListener("job-ended", onEnded);
}
