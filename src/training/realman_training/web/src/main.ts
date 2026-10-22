import "./theme.css";
import "./style.css";
import { api, getToken, setToken, type Health, type ServeStatus } from "./api";
import type { Ctx, Page } from "./ctx";
import { errorText, fmtDay, h, isActive } from "./dom";
import { JobDrawer } from "./drawer";
import { renderData } from "./pages/data";
import { renderModels } from "./pages/models";
import { renderOverview } from "./pages/overview";
import { renderServe } from "./pages/serve";
import { renderTrain } from "./pages/train";

// 总览 first, then the pipeline in the order the work flows: data → training → registered models → serving.
const PAGES: { id: string; label: string; render: Page }[] = [
  { id: "overview", label: "总览", render: renderOverview },
  { id: "data", label: "数据", render: renderData },
  { id: "train", label: "训练", render: renderTrain },
  { id: "models", label: "模型", render: renderModels },
  { id: "serve", label: "服务", render: renderServe },
];
const PIPELINE = new Set(["data", "train", "models", "serve"]);

function setPill(el: HTMLElement, text: string, tone: "" | "ok" | "warn" | "bad"): void {
  el.textContent = text;
  el.className = `status-pill${tone ? ` ${tone}` : ""}`;
}

export function showServePills(status: ServeStatus | null, servePill: HTMLElement, bridgePill: HTMLElement): void {
  if (!status || status.error) {
    setPill(servePill, "推理 ? 未知", "warn");
    setPill(bridgePill, "桥接 ? 未知", "warn");
    return;
  }
  const running = Boolean(status.serve?.running);
  setPill(servePill, running ? "推理 ● 运行中" : "推理 ○ 停止", running ? "ok" : "");
  const bridge = status.bridge || {};
  if (bridge.error) setPill(bridgePill, "桥接 ? 不可达", "warn");
  else if (!bridge.running) setPill(bridgePill, "桥接 ○ 停止", "");
  else if (Number(bridge.allow_publish)) setPill(bridgePill, "桥接 ● 发布中", "warn");
  else setPill(bridgePill, "桥接 ● 空闲", "ok");
}

async function boot(): Promise<void> {
  const app = document.getElementById("app")!;
  let health: Health;
  try {
    health = await api.health();
  } catch (error) {
    app.replaceChildren(h("p", { class: "error" }, `无法连接训练平台后端：${errorText(error)}`));
    return;
  }
  const meta: Record<string, HTMLElement> = {};
  const tabs = h("nav", { class: "tabs", "aria-label": "页面" }, PAGES.flatMap((page) => {
    meta[page.id] = h("span", { class: "tab-meta", id: `meta-${page.id}` });
    const link = h("a", { href: `#/${page.id}`, "data-page": page.id, class: PIPELINE.has(page.id) ? "step" : "home" },
      h("span", { class: "tab-label" }, page.label), PIPELINE.has(page.id) ? meta[page.id] : null);
    return page.id === "data" || !PIPELINE.has(page.id) ? [link] : [h("span", { class: "tab-arrow", "aria-hidden": "true" }, "→"), link];
  }));
  const servePill = h("span", { class: "status-pill", id: "pill-serve" }, "推理 …");
  const bridgePill = h("span", { class: "status-pill", id: "pill-bridge" }, "桥接 …");
  const jobsButton = h("button", { class: "button secondary", id: "jobs-button", type: "button" }, "任务");
  const token = h("input", { type: "password", id: "token", autocomplete: "off", "aria-label": "令牌",
    placeholder: health.read_only ? "只读" : "令牌", value: getToken(), disabled: health.read_only });
  token.addEventListener("change", () => setToken(token.value.trim()));
  window.addEventListener("token-changed", () => { token.value = getToken(); });
  const drawer = new JobDrawer(() => health.read_only);
  jobsButton.addEventListener("click", () => (drawer.isOpen ? drawer.close() : void drawer.open()));
  const page = h("main", { class: "page", id: "page" });
  app.replaceChildren(
    h("header", { class: "topbar" },
      h("div", { class: "brand" }, h("span", { class: "brand-mark" }, "RM"),
        h("div", {}, h("strong", {}, "Training Console"), h("small", {}, "pi0.5 · server5090"))),
      tabs,
      h("div", { class: "top-status" }, servePill, bridgePill, jobsButton,
        h("label", { class: "token-field" },
          health.read_only ? h("span", { class: "chip warn", id: "read-only" }, "只读") : null, token))),
    page, drawer.el, drawer.fab);

  let dispose: void | (() => void);
  let navCounter = 0;
  const ctx: Ctx = {
    health,
    query: new URLSearchParams(),
    navigate: (id, query) => {
      location.hash = `#/${id}${query ? `?${new URLSearchParams(query)}` : ""}`;
    },
    reload: () => void route(),
    openDrawer: (id) => void drawer.open(id),
    refreshStatus: () => void refreshStatus(),
  };

  async function route(): Promise<void> {
    const nav = ++navCounter;
    const [path, search = ""] = location.hash.replace(/^#\/?/, "").split("?");
    const current = PAGES.find((p) => p.id === path) ?? PAGES[0];
    for (const a of tabs.querySelectorAll<HTMLElement>("a")) a.classList.toggle("selected", a.dataset.page === current.id);
    if (typeof dispose === "function") dispose();
    dispose = undefined;
    ctx.query = new URLSearchParams(search);
    page.dataset.page = current.id;
    page.replaceChildren(h("p", { class: "loading" }, "加载中…"));
    let result: void | (() => void);
    try {
      result = await current.render(page, ctx);
    } catch (error) {
      if (nav !== navCounter) return;
      page.replaceChildren(h("p", { class: "error" }, `页面加载失败：${errorText(error)}`));
      return;
    }
    if (nav !== navCounter) {
      if (typeof result === "function") result();
      return;
    }
    dispose = result;
  }

  // One short live line under each pipeline step, so the nav doubles as a status strip.
  async function refreshCounts(): Promise<void> {
    const [datasets, runs, models] = await Promise.allSettled([api.datasets(), api.runs(), api.models()]);
    if (datasets.status === "fulfilled") {
      const newest = datasets.value.datasets.find((d) => d.kind !== "error");
      meta.data.textContent = newest ? `${newest.episodes} 条 · ${fmtDay(newest.last_file_time)}` : "无数据";
    }
    if (runs.status === "fulfilled" && !meta.train.dataset.live) meta.train.textContent = `${runs.value.runs.length} 次训练`;
    if (models.status === "fulfilled") meta.models.textContent = `${models.value.models.length} 个已登记`;
  }

  async function refreshStatus(): Promise<void> {
    try {
      const status = await api.serve();
      showServePills(status, servePill, bridgePill);
      meta.serve.textContent = status.error ? "状态未知" : status.serve?.running ? "运行中" : "已停止";
      meta.serve.dataset.tone = status.serve?.running ? "ok" : "";
    } catch {
      showServePills(null, servePill, bridgePill);
      meta.serve.textContent = "状态未知";
    }
    try {
      const jobs = (await api.jobs(20)).jobs;
      const active = jobs.filter((job) => isActive(job.state)).length;
      jobsButton.textContent = active ? `任务 (${active})` : "任务";
      drawer.setActive(active);
      const training = jobs.find((job) => job.kind === "train" && isActive(job.state));
      const p = training?.progress;
      if (training) {
        meta.train.dataset.live = "1";
        meta.train.dataset.tone = "run";
        meta.train.textContent = p?.total ? `训练中 ${Math.floor((100 * p.done) / p.total)}%` : "训练中";
      } else if (meta.train.dataset.live) {
        delete meta.train.dataset.live;
        meta.train.dataset.tone = "";
        void refreshCounts();
      }
    } catch {
      jobsButton.textContent = "任务";
    }
  }
  window.addEventListener("job-ended", () => void refreshCounts());

  window.addEventListener("hashchange", () => void route());
  await route();
  if (drawer.wantsOpen) void drawer.open();
  void refreshCounts();
  void refreshStatus();
  window.setInterval(() => void refreshStatus(), 15000);
}

void boot();
