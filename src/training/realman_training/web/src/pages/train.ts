import { api, type Gpus, type Options, type RunDetail, type RunRow } from "../api";
import { lineChart } from "../charts";
import type { Ctx } from "../ctx";
import { confirmJob } from "../dialog";
import { errorText, fmtMae, fmtMiB, fmtTime, h } from "../dom";
import { chip, evalTable, gpuList, kv, panel, panelHead, swapTable } from "../widgets";

function runState(run: RunRow): HTMLElement {
  if (run.started && !run.ended) return chip("训练中", "run");
  if (run.exit_code === 0) return chip(run.registered ? "已登记" : "完成", "ok");
  if (run.exit_code) return chip(`失败 ${run.exit_code}`, "bad");
  return chip(run.registered ? "已登记" : "—");
}

function newRunForm(options: Options, gpus: Gpus | null, ctx: Ctx): HTMLElement {
  const configs = h("datalist", { id: "train-configs" }, options.configs.map((c) => h("option", { value: c })));
  const configName = h("input", { type: "text", name: "config_name", list: "train-configs", placeholder: "openpi 配置名" });
  const view = h("select", { name: "view" }, h("option", { value: "" }, "选择训练视图"),
    options.views.map((v) => h("option", { value: v }, v)));
  const exp = h("input", { type: "text", name: "exp", placeholder: "实验名，例如 m_multitask_b16_2gpu" });
  const indices = gpus?.gpus.map((g) => g.index) ?? [0, 1, 2, 3];
  const gpuBoxes = indices.map((i) => {
    const info = gpus?.gpus.find((g) => g.index === i);
    const box = h("input", { type: "checkbox", class: "gpu", "data-gpu": i });
    return h("label", {}, box, `GPU ${i}`, info ? ` · ${fmtMiB(info.used_mib)}${info.busy ? " 占用" : ""}` : "");
  });
  const batch = h("input", { type: "number", name: "batch", min: 1, placeholder: "默认 = 配置" });
  const steps = h("input", { type: "number", name: "steps", min: 1, placeholder: "默认 = 配置" });
  const dryRun = h("input", { type: "checkbox", name: "dry_run" });
  const error = h("p", { class: "error", id: "train-error", hidden: true });
  const start = h("button", { class: "button primary", id: "start-train", type: "button" }, "开始训练");
  start.addEventListener("click", () => {
    const chosen = gpuBoxes.map((l) => l.querySelector("input")!).filter((b) => b.checked).map((b) => b.dataset.gpu!);
    const missing = [!configName.value.trim() && "配置名", !view.value && "训练视图", !exp.value.trim() && "实验名", !chosen.length && "GPU"]
      .filter(Boolean);
    if (missing.length) {
      error.textContent = `还缺：${missing.join("、")}`;
      error.hidden = false;
      return;
    }
    error.hidden = true;
    const params: Record<string, unknown> = { config_name: configName.value.trim(), view: view.value, exp: exp.value.trim(),
      gpus: chosen.join(","), dry_run: dryRun.checked };
    if (batch.value) params.batch = Number(batch.value);
    if (steps.value) params.steps = Number(steps.value);
    void confirmJob(ctx, {
      title: "开始训练", kind: "train", params,
      lines: [`配置：${params.config_name}`, `训练视图：${params.view}`, `实验名：${params.exp}`, `GPU ${chosen.join(",")}`,
        `batch ${batch.value || "默认"} · steps ${steps.value || "默认"}`, "缺 norm 时先自动计算；同一时间只允许一个训练",
        "训练会占用所选 GPU 数小时；GPU 被他人占用时会被拒绝", ...(dryRun.checked ? ["试运行：只打印命令"] : [])],
    });
  });
  return h("section", { class: "panel" }, h("h2", {}, "新建训练"),
    h("div", { class: "form", id: "train-form" },
      h("label", {}, "openpi 配置", configName, configs), h("label", {}, "训练视图", view), h("label", {}, "实验名", exp),
      h("div", { class: "wide checks" }, gpuBoxes), h("label", {}, "batch", batch), h("label", {}, "steps", steps),
      h("label", { class: "check" }, dryRun, "试运行")),
    error, h("div", { class: "actions" }, start));
}

function evalForm(run: RunDetail, gpus: Gpus | null, ctx: Ctx): HTMLElement {
  const indices = gpus?.gpus.map((g) => g.index) ?? [0, 1, 2, 3];
  const gpu = h("select", { name: "gpu" }, indices.map((i) => h("option", { value: i }, `GPU ${i}`)));
  const latest = run.checkpoints[run.checkpoints.length - 1];
  const boxes = run.checkpoints.map((step) => h("label", {}, h("input", { type: "checkbox", class: "ckpt", value: step, checked: step === latest }), String(step)));
  const swap = h("input", { type: "checkbox", name: "prompt_swap", checked: true });
  const start = h("button", { class: "button secondary", id: "start-eval", type: "button", disabled: !run.view || !run.checkpoints.length }, "评估");
  start.addEventListener("click", () => {
    const checkpoints = boxes.map((l) => l.querySelector("input")!).filter((b) => b.checked).map((b) => Number(b.value));
    void confirmJob(ctx, {
      title: "按任务开环评估", kind: "eval",
      params: { config_name: run.config, exp: run.exp, view: run.view, gpu: Number(gpu.value), checkpoints, prompt_swap: swap.checked },
      lines: [`${run.name}`, `checkpoint ${checkpoints.join(", ") || "最新"}`, `GPU ${gpu.value}`, `留出集来自 ${run.view}`,
        swap.checked ? "含 prompt 交换测试" : "不做 prompt 交换"],
    });
  });
  return h("div", { id: "eval-form" }, h("h3", {}, "评估"),
    h("div", { class: "form" }, h("label", {}, "GPU", gpu), h("div", { class: "wide checks" }, boxes),
      h("label", { class: "check" }, swap, "prompt 交换")),
    h("div", { class: "actions" }, start));
}

function registerForm(run: RunDetail, ctx: Ctx): HTMLElement {
  const status = h("input", { type: "text", name: "status", placeholder: "状态，例如 待真机验证" });
  const method = h("input", { type: "text", name: "method", placeholder: "方法（默认 pi0.5 action-only 微调）" });
  const start = h("button", { class: "button secondary", id: "start-register", type: "button", disabled: !run.record }, "登记");
  start.addEventListener("click", () => {
    void confirmJob(ctx, {
      title: "登记模型", kind: "register",
      params: { config_name: run.config, exp: run.exp, status: status.value.trim() || null, method: method.value.trim() || null },
      lines: [run.name, "写 MODEL_CARD.md + model_card.json，并更新 checkpoints/MODELS.md", "手写的模型卡不会被覆盖"],
    });
  });
  return h("div", { id: "register-form" }, h("h3", {}, "登记"),
    h("div", { class: "form" }, h("label", {}, "状态", status), h("label", {}, "方法", method)), h("div", { class: "actions" }, start));
}

async function renderRun(el: HTMLElement, name: string, gpus: Gpus | null, ctx: Ctx): Promise<void> {
  const [config, exp] = name.split("/");
  let run: RunDetail;
  try {
    run = await api.run(config, exp);
  } catch (error) {
    el.replaceChildren(h("p", { class: "error" }, errorText(error)));
    return;
  }
  const m = run.metrics;
  const progress = run.job?.progress;
  el.replaceChildren(
    h("section", { class: "two" },
      h("section", { class: "panel" },
        panelHead(run.name, runState(run), run.job ? (() => {
          const b = h("button", { class: "button ghost", type: "button" }, "打开日志");
          b.addEventListener("click", () => ctx.openDrawer(run.job!.id));
          return b;
        })() : null),
        progress ? h("p", { class: "muted" }, progress.text) : null,
        kv([["训练视图", run.view ?? "–"], ["GPU", run.gpus?.join(",") ?? "–"], ["batch · steps", `${run.batch_size ?? "–"} · ${run.num_train_steps ?? "–"}`],
          ["时间", `${fmtTime(run.started)} → ${fmtTime(run.ended)}`], ["最后 step · loss", `${run.last_step ?? "–"} · ${fmtMae(run.last_loss)}`],
          ["checkpoints", run.checkpoints.join(", ") || "–"]])),
      panel("GPU", gpuList(gpus, run.gpus ?? []), evalForm(run, gpus, ctx), registerForm(run, ctx))),
    h("section", { class: "two" },
      panel("loss", lineChart(m.step ?? [], m.loss ?? [], { label: "loss", id: "chart-loss" })),
      panel("grad norm", lineChart(m.step ?? [], m.grad_norm ?? [], { label: "grad_norm", id: "chart-grad" }))),
    panel("各 checkpoint 按任务评估", evalTable(run.eval), swapTable(run.eval)));
}

export async function renderTrain(root: HTMLElement, ctx: Ctx): Promise<() => void> {
  const [{ runs }, options, gpus] = await Promise.all([api.runs(), api.options(), api.gpus().catch(() => null)]);
  const selected = ctx.query.get("run") ?? runs[0]?.name ?? null;
  const list = h("div", { class: "list", id: "run-list" }, runs.map((run) => {
    const item = h("button", { class: `item${run.name === selected ? " selected" : ""}`, type: "button", "data-run": run.name },
      h("strong", {}, run.name, " ", runState(run)),
      h("small", {}, `${fmtTime(run.started)} · step ${run.last_step ?? "–"} · loss ${fmtMae(run.last_loss)}`),
      run.eval_latest ? h("small", {}, Object.entries(run.eval_latest.tasks).map(([t, v]) => `${t} ${fmtMae(v)}`).join(" · ")) : null);
    item.addEventListener("click", () => ctx.navigate("train", { run: run.name }));
    return item;
  }));
  if (!runs.length) list.append(h("p", { class: "muted" }, "还没有训练"));
  const detail = h("div", { class: "stack", id: "run-detail" });
  root.replaceChildren(newRunForm(options, gpus, ctx),
    h("section", { class: "split" }, h("section", { class: "panel" }, h("h2", {}, "训练列表"), list), detail));
  if (selected) await renderRun(detail, selected, gpus, ctx);
  const onEnded = (event: Event) => {
    const job = (event as CustomEvent).detail;
    if (["train", "eval", "register"].includes(job.kind) && job.state === "succeeded") ctx.reload();
  };
  window.addEventListener("job-ended", onEnded);
  return () => window.removeEventListener("job-ended", onEnded);
}
