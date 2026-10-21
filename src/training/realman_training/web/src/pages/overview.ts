import { api, type DatasetRow, type Gpus, type JobRow, type LinkcheckPayload, type ModelRow, type RunRow, type ServeStatus } from "../api";
import type { Ctx } from "../ctx";
import { DATASET_KIND, errorText, fmtCount, fmtMae, fmtTime, h, isActive } from "../dom";
import { chip, gpuList, jobChip, jobLabel, kv, panel } from "../widgets";

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

function serveCard(status: ServeStatus | null): HTMLElement {
  if (!status) return card("card-serve", "推理服务", h("p", { class: "muted" }, "状态未知"));
  if (status.error) return card("card-serve", "推理服务", h("p", { class: "notice" }, status.error));
  const record = status.record || {};
  const running = Boolean(status.serve?.running);
  const bridge = status.bridge || {};
  return card("card-serve", "推理服务",
    h("p", { class: "big" }, running ? "运行中" : "已停止"),
    kv([
      ["模型", record.model ? `${record.model} @ ${record.step}` : "–"],
      ["GPU · 端口", record.gpu !== undefined ? `GPU ${record.gpu} · :${record.port}` : "–"],
      ["任务", record.task ?? "–"],
      ["桥接", bridge.error ? "不可达" : bridge.running ? (Number(bridge.allow_publish) ? "发布中" : "空闲（未激活）") : "已停止"],
    ]));
}

function linkCard(link: LinkcheckPayload | null): HTMLElement {
  const latest = link?.latest;
  if (!latest) return card("card-link", "数据链路", h("p", { class: "muted" }, "还没有链路检测"));
  const failed = latest.checks.filter((c) => !c.ok);
  return card("card-link", "数据链路",
    h("p", { class: "big" }, latest.ok ? "全部通过" : "未通过"),
    h("p", { class: "muted" }, fmtTime(latest.at)),
    failed.length ? h("p", {}, failed.map((c) => `${c.name} ${c.value}`).join("；")) : null);
}

function trainCard(trainJobs: JobRow[] | null, runs: RunRow[] | null): HTMLElement {
  const running = trainJobs?.find((job) => isActive(job.state));
  if (running) {
    const p = running.progress;
    const share = p?.total ? Math.min(100, (100 * p.done) / p.total) : 0;
    return card("card-train", "当前训练",
      h("p", { class: "big" }, `${running.params.config_name}/${running.params.exp}`),
      h("div", { class: "bar" }, h("i", { style: `width:${share.toFixed(1)}%` })),
      h("p", { class: "muted" }, p?.text || "启动中"));
  }
  const live = runs?.find((run) => run.started && !run.ended);
  if (live) {
    return card("card-train", "当前训练",
      h("p", { class: "big" }, live.name),
      h("p", { class: "muted" }, `step ${live.last_step ?? "–"} / ${live.num_train_steps ?? "–"} · loss ${fmtMae(live.last_loss)}`),
      h("p", { class: "muted" }, "没有跟随它的任务：在 server5090 上用 realman-train train … --attach 接管（见文档）"));
  }
  return card("card-train", "当前训练", h("p", { class: "muted" }, "没有运行中的训练"));
}

function recentDatasets(rows: DatasetRow[] | null, ctx: Ctx): HTMLElement {
  const recent = (rows ?? []).filter((r) => r.kind !== "error")
    .sort((a, b) => (b.last_file_time ?? "").localeCompare(a.last_file_time ?? "")).slice(0, 5);
  const body = h("tbody", {}, recent.map((row) => {
    const tr = h("tr", { class: "clickable" },
      h("td", {}, row.name, h("div", { class: "muted" }, row.path)), h("td", {}, DATASET_KIND[row.kind]),
      h("td", { class: "num" }, row.episodes ?? "–"), h("td", { class: "num" }, fmtCount(row.frames)),
      h("td", {}, fmtTime(row.last_file_time)));
    tr.addEventListener("click", () => ctx.navigate("data", { path: row.path }));
    return tr;
  }));
  return panel("最近数据集", h("div", { class: "table-wrap" }, h("table", { id: "recent-datasets" },
    h("thead", {}, h("tr", {}, ["数据集", "类型", "条数", "帧数", "更新"].map((t, i) => h("th", { class: i === 2 || i === 3 ? "num" : null }, t)))),
    body)));
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
  const list = h("div", { class: "list", id: "recent-jobs" }, (jobs ?? []).map((job) => {
    const item = h("button", { class: "item", type: "button" },
      h("strong", {}, jobLabel(job), " ", jobChip(job)),
      h("small", {}, `${fmtTime(job.created)}${job.progress?.text ? ` · ${job.progress.text}` : ""}${job.error ? ` · ${job.error}` : ""}`));
    item.addEventListener("click", () => ctx.openDrawer(job.id));
    return item;
  }));
  if (!jobs?.length) list.append(h("p", { class: "muted" }, "还没有任务"));
  return panel("最近任务", list);
}

export async function renderOverview(root: HTMLElement, ctx: Ctx): Promise<void> {
  const results = await Promise.allSettled([
    api.serve(), api.linkcheck(), api.gpus(), api.jobs(8), api.jobs(5, "train"), api.datasets(), api.models(), api.runs(),
  ]);
  const [serve, link, gpus, jobs, trainJobs, datasets, models, runs] = results;
  const gpuCard = card("card-gpus", "GPU", gpuList(settled(gpus) as Gpus | null));
  root.replaceChildren(
    h("section", { class: "cards" },
      serveCard(settled(serve)), linkCard(settled(link)), gpuCard,
      trainCard(settled(trainJobs)?.jobs ?? null, settled(runs)?.runs ?? null)),
    ...results.map(failure).filter((e): e is HTMLElement => e !== null),
    h("section", { class: "two" },
      recentDatasets(settled(datasets)?.datasets ?? null, ctx), latestModels(settled(models)?.models ?? null, ctx)),
    recentJobs(settled(jobs)?.jobs ?? null, ctx));
}
