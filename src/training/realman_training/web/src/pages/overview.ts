import { api, type DatasetRow, type Gpus, type JobRow, type LinkcheckPayload, type ModelRow, type RunRow, type ServeStatus } from "../api";
import type { Ctx } from "../ctx";
import { DATASET_KIND, errorText, fmtCount, fmtMae, fmtTime, h, isActive } from "../dom";
import { checkList, chip, gpuList, jobChip, jobLabel, kv, modelName, pageHead, paceRows, panel } from "../widgets";

function settled<T>(result: PromiseSettledResult<T>): T | null {
  return result.status === "fulfilled" ? result.value : null;
}

function failure(result: PromiseSettledResult<unknown>): HTMLElement | null {
  return result.status === "rejected" ? h("p", { class: "error" }, errorText(result.reason)) : null;
}

function card(id: string, title: string, ...children: (Node | string | null)[]): HTMLElement {
  const el = panel(title, ...children);
  el.id = id;
  return el;
}

/** Status of the bridge on realman_ts, as one word. */
function bridgeState(bridge: ServeStatus["bridge"]): string {
  if (!bridge) return "–";
  if (bridge.error) return "不可达";
  if (!bridge.running) return "已停止";
  return Number(bridge.allow_publish) ? "发布中" : "空闲（未激活）";
}

/** The latest link check, inside the inference card: failing items listed, the passing ones counted. */
function linkBlock(link: LinkcheckPayload | null): HTMLElement {
  const latest = link?.latest;
  const block = h("div", { class: "sub", id: "card-link" });
  if (!latest) {
    block.append(h("h3", {}, "数据链路"), h("p", { class: "muted" }, "还没有链路检测"));
    return block;
  }
  const failing = latest.checks.filter((c) => !c.ok);
  const passed = latest.checks.length - failing.length;
  block.append(
    h("h3", {}, "数据链路", chip(latest.ok ? "全部通过" : "未通过", latest.ok ? "ok" : "bad"),
      h("span", { class: "muted" }, fmtTime(latest.at))),
    ...(failing.length ? [checkList(failing)] : []),
    h("p", { class: "muted" }, failing.length ? `其余 ${passed} 项通过` : `${passed} 项全部通过`));
  return block;
}

function serveCard(status: ServeStatus | null, link: LinkcheckPayload | null): HTMLElement {
  if (!status) return card("card-serve", "推理链路", h("p", { class: "muted" }, "状态未知"), linkBlock(link));
  if (status.error) return card("card-serve", "推理链路", h("p", { class: "notice" }, status.error), linkBlock(link));
  const record = status.record || {};
  const running = Boolean(status.serve?.running);
  return card("card-serve", "推理链路",
    h("p", { class: `big state ${running ? "ok" : "off"}` }, running ? "运行中" : "已停止"),
    kv([
      ["模型", record.model ? modelName(record.model, record.step) : "–"],
      ["GPU · 端口", record.gpu !== undefined ? `GPU ${record.gpu} · :${record.port}` : "–"],
      ["任务", record.task ?? "–"],
      ["桥接", bridgeState(status.bridge)],
    ]),
    linkBlock(link));
}

function trainCard(trainJobs: JobRow[] | null, runs: RunRow[] | null): HTMLElement {
  const running = trainJobs?.find((job) => isActive(job.state));
  if (running) {
    const p = running.progress;
    const share = p?.total ? Math.min(100, (100 * p.done) / p.total) : 0;
    const row = runs?.find((run) => run.exp === running.params.exp && run.config === running.params.config_name);
    return card("card-train", "当前训练",
      h("p", { class: "big state run" }, p?.total ? `${share.toFixed(0)}%` : "启动中"),
      h("p", { class: "run-name mono" }, running.params.exp, h("small", {}, running.params.config_name)),
      h("div", { class: "bar" }, h("i", { style: `width:${share.toFixed(1)}%` })),
      h("p", { class: "muted mono" }, p ? `step ${p.done} / ${p.total ?? "?"}` : "等待第一步"),
      p ? kv(paceRows(row?.pace, true)) : null);
  }
  const live = runs?.find((run) => run.started && !run.ended);
  if (live) {
    const share = live.last_step && live.num_train_steps ? Math.min(100, (100 * live.last_step) / live.num_train_steps) : 0;
    return card("card-train", "当前训练",
      h("p", { class: "big state run" }, share ? `训练中 · ${share.toFixed(0)}%` : "训练中"),
      h("p", { class: "run-name mono" }, live.exp, h("small", {}, live.config)),
      h("div", { class: "bar" }, h("i", { style: `width:${share.toFixed(1)}%` })),
      h("p", { class: "muted mono" }, `step ${live.last_step ?? "–"} / ${live.num_train_steps ?? "–"} · loss ${fmtMae(live.last_loss)}`),
      kv(paceRows(live.pace, true)),
      h("p", { class: "muted foot" }, "没有跟随它的任务：在 server5090 上用 realman-train train … --attach 接管（见文档）"));
  }
  return card("card-train", "当前训练", h("p", { class: "big state off" }, "空闲"), h("p", { class: "muted" }, "没有运行中的训练"));
}

function recentDatasets(rows: DatasetRow[] | null, ctx: Ctx): HTMLElement {
  const recent = (rows ?? []).filter((r) => r.kind !== "error")
    .sort((a, b) => (b.last_file_time ?? "").localeCompare(a.last_file_time ?? "")).slice(0, 5);
  const body = h("tbody", {}, recent.map((row) => {
    const tr = h("tr", { class: "clickable" },
      h("td", {}, h("span", { class: "mono" }, row.name), h("div", { class: "muted" }, row.path)), h("td", {}, chip(DATASET_KIND[row.kind])),
      h("td", { class: "num" }, row.episodes ?? "–"), h("td", { class: "num" }, fmtCount(row.frames)),
      h("td", {}, fmtTime(row.last_file_time)));
    tr.addEventListener("click", () => ctx.navigate("data", { path: row.path }));
    return tr;
  }));
  const el = panel("最近数据集", h("div", { class: "table-wrap" }, h("table", { id: "recent-datasets" },
    h("thead", {}, h("tr", {}, ["数据集", "类型", "条数", "帧数", "更新"].map((t, i) => h("th", { class: i === 2 || i === 3 ? "num" : null }, t)))),
    body)));
  el.classList.add("span2");
  return el;
}

function latestModels(models: ModelRow[] | null, ctx: Ctx): HTMLElement {
  const list = h("div", { class: "list", id: "latest-models" }, (models ?? []).slice(0, 3).map((model) => {
    const mae = model.open_loop ? Object.entries(model.open_loop.tasks).map(([t, v]) => `${t} ${fmtMae(v)}`).join(" · ") : "未评估";
    const item = h("button", { class: "item", type: "button" },
      h("strong", {}, model.name, " ", model.serving ? chip("服务中", "ok") : null),
      h("small", {}, `${model.method ?? ""} · ${fmtTime(model.trained_end)}`), h("small", {}, mae));
    item.addEventListener("click", () => ctx.navigate("models", { model: model.name }));
    return item;
  }));
  if (!models?.length) list.append(h("p", { class: "muted" }, "还没有登记的模型"));
  return panel("最新模型", list);
}

function recentJobs(jobs: JobRow[] | null, ctx: Ctx): HTMLElement {
  if (!jobs?.length) return panel("最近任务", h("p", { class: "muted" }, "还没有任务"));
  const body = h("tbody", { id: "recent-jobs" }, jobs.map((job) => {
    const note = job.error ?? job.progress?.text ?? "";
    const tr = h("tr", { class: "clickable", "data-job": job.id },
      h("td", {}, h("strong", {}, jobLabel(job))), h("td", {}, jobChip(job)),
      h("td", { class: "mono nowrap" }, fmtTime(job.created)), h("td", { class: "muted note" }, note));
    tr.addEventListener("click", () => ctx.openDrawer(job.id));
    return tr;
  }));
  return panel("最近任务", h("div", { class: "table-wrap" }, h("table", { class: "jobs" },
    h("thead", {}, h("tr", {}, ["任务", "状态", "创建", "进度 / 说明"].map((t) => h("th", {}, t)))), body)));
}

export async function renderOverview(root: HTMLElement, ctx: Ctx): Promise<void> {
  const results = await Promise.allSettled([
    api.serve(), api.linkcheck(), api.gpus(), api.jobs(8), api.jobs(5, "train"), api.datasets(), api.models(), api.runs(),
  ]);
  const [serve, link, gpus, jobs, trainJobs, datasets, models, runs] = results;
  const gpuData = settled(gpus) as Gpus | null;
  const free = gpuData?.available ? gpuData.gpus.filter((g) => !g.busy && !g.users.length).map((g) => g.index) : null;
  const gpuCard = card("card-gpus", "GPU", gpuList(gpuData),
    free ? h("p", { class: "muted foot" }, free.length ? `空闲：GPU ${free.join(", ")}（可用于训练或评估）` : "没有空闲的 GPU") : null);
  root.replaceChildren(
    pageHead("总览", "推理链路、GPU、当前训练，以及最近的数据、模型和任务。"),
    ...results.map(failure).filter((e): e is HTMLElement => e !== null),
    h("section", { class: "grid3" },
      serveCard(settled(serve), settled(link)), gpuCard,
      trainCard(settled(trainJobs)?.jobs ?? null, settled(runs)?.runs ?? null)),
    h("section", { class: "grid3" },
      recentDatasets(settled(datasets)?.datasets ?? null, ctx), latestModels(settled(models)?.models ?? null, ctx)),
    recentJobs(settled(jobs)?.jobs ?? null, ctx));
}
