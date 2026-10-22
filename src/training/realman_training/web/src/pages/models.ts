import { api, type ModelRow } from "../api";
import type { Ctx } from "../ctx";
import { markdown } from "../markdown";
import { errorText, fmtEpisodes, fmtMae, fmtTime, h } from "../dom";
import { chip, kv, pageHead, panel, panelHead, table } from "../widgets";

function maeText(model: ModelRow): string {
  if (!model.open_loop) return "未评估";
  return Object.entries(model.open_loop.tasks).map(([task, mae]) => `${task} ${fmtMae(mae)}`).join(" · ");
}

async function renderCard(el: HTMLElement, model: ModelRow, ctx: Ctx): Promise<void> {
  const deploy = h("button", { class: "button primary", id: "deploy", type: "button" }, "部署到推理服务");
  deploy.addEventListener("click", () => ctx.navigate("serve", { model: model.name }));
  const tasks = Object.entries(model.tasks);
  const loop = model.open_loop;
  const cardBody = h("div", { id: "model-card-markdown" }, h("p", { class: "loading" }, "加载中…"));
  el.replaceChildren(h("section", { class: "panel", id: "model-card" },
    panelHead(model.name, model.serving ? chip("服务中", "ok") : null, deploy),
    kv([["方法", model.method ?? "–"], ["训练时间", `${fmtTime(model.trained_start)} → ${fmtTime(model.trained_end)}`],
      ["数据集", model.dataset ?? model.dataset_dir ?? "–"], ["条数", model.episodes ?? "–"],
      ["留出集", model.holdout_episodes.join(", ") || "–"], ["checkpoints", model.checkpoints.join(", ") || "–"],
      ["状态", model.status ?? "–"]]),
    h("h3", {}, "任务与 prompt"),
    table(["任务", "prompt", "条数", "episode"], tasks.map(([task, info]) => [task, info.prompt ?? "–",
      (info as { count?: number }).count ?? (typeof info.episodes === "number" ? info.episodes : "–"),
      h("span", { class: "mono" }, Array.isArray(info.episodes) ? fmtEpisodes(info.episodes) : "–")]), { numeric: [2] }),
    loop ? h("h3", {}, `开环评估（checkpoint ${loop.step}）`) : null,
    loop ? table(["任务", "MAE", "零动作基线"], Object.keys(loop.tasks).map((t) => [t, fmtMae(loop.tasks[t]), fmtMae(loop.zero_baseline[t])]),
      { numeric: [1, 2] }) : null,
    h("details", { class: "card-details" }, h("summary", {}, "MODEL_CARD.md 全文"), cardBody)));
  try {
    const run = await api.run(model.config, model.exp);
    cardBody.replaceChildren(run.card_markdown ? markdown(run.card_markdown) : h("p", { class: "muted" }, "没有 MODEL_CARD.md"));
  } catch (error) {
    cardBody.replaceChildren(h("p", { class: "error" }, errorText(error)));
  }
}

export async function renderModels(root: HTMLElement, ctx: Ctx): Promise<void> {
  const { models, registry_markdown } = await api.models();
  const selected = models.find((m) => m.name === ctx.query.get("model")) ?? models[0] ?? null;
  const card = h("div", { class: "stack" });
  const body = h("tbody", {}, models.map((model) => {
    const tr = h("tr", { class: `clickable${model === selected ? " selected" : ""}`, "data-model": model.name },
      h("td", {}, h("strong", { class: "mono" }, model.exp), " ", model.serving ? chip("服务中", "ok") : null,
        h("div", { class: "muted mono" }, model.config)),
      h("td", { class: "mono nowrap" }, fmtTime(model.trained_start), h("br"), fmtTime(model.trained_end)),
      h("td", { class: "mono" }, model.dataset ?? "–"), h("td", { class: "mono" }, maeText(model)),
      h("td", { class: "note" }, model.status ?? "–"));
    tr.addEventListener("click", () => {
      for (const row of body.querySelectorAll("tr")) row.classList.toggle("selected", row === tr);
      void renderCard(card, model, ctx);
    });
    return tr;
  }));
  root.replaceChildren(
    pageHead("模型", "登记过的模型：方法、数据、开环评估和状态；选一个可部署到推理服务。"),
    panel("模型登记表",
      models.length ? h("div", { class: "table-wrap" }, h("table", { id: "model-table" },
        h("thead", {}, h("tr", {}, ["run", "训练时间", "数据集", "开环 MAE", "状态"].map((t) => h("th", {}, t)))), body))
        : h("p", { class: "muted" }, "还没有登记的模型（训练页的“登记”会写模型卡）"),
      registry_markdown ? h("details", {}, h("summary", {}, "checkpoints/MODELS.md"),
        markdown(registry_markdown, { id: "registry-markdown" })) : null),
    card);
  if (selected) await renderCard(card, selected, ctx);
}
