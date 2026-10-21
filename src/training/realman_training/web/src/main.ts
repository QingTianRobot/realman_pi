import "./theme.css";
import "./style.css";
import { api, getToken, setToken, type Health, type ServeStatus } from "./api";
import type { Ctx, Page } from "./ctx";
import { errorText, h, isActive } from "./dom";
import { JobDrawer } from "./drawer";
import { renderData } from "./pages/data";
import { renderModels } from "./pages/models";
import { renderOverview } from "./pages/overview";
import { renderServe } from "./pages/serve";
import { renderTrain } from "./pages/train";

const PAGES: { id: string; label: string; render: Page }[] = [
  { id: "overview", label: "总览", render: renderOverview },
  { id: "serve", label: "服务", render: renderServe },
  { id: "data", label: "数据", render: renderData },
  { id: "train", label: "训练", render: renderTrain },
  { id: "models", label: "模型", render: renderModels },
];

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
  const tabs = h("nav", { class: "tabs", "aria-label": "页面" },
    PAGES.map((page) => h("a", { href: `#/${page.id}`, "data-page": page.id }, page.label)));
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
        h("div", {}, h("strong", {}, "Training Console"), h("small", {}, "数据 → 训练 → 评估 → 部署"))),
      tabs,
      h("div", { class: "top-status" }, servePill, bridgePill, jobsButton,
        h("label", { class: "token-field" },
          health.read_only ? h("span", { class: "chip warn", id: "read-only" }, "只读") : null, token))),
    page, drawer.el);

  let dispose: void | (() => void);
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
    const [path, search = ""] = location.hash.replace(/^#\/?/, "").split("?");
    const current = PAGES.find((p) => p.id === path) ?? PAGES[0];
    for (const a of tabs.querySelectorAll<HTMLElement>("a")) a.classList.toggle("selected", a.dataset.page === current.id);
    if (typeof dispose === "function") dispose();
    dispose = undefined;
    ctx.query = new URLSearchParams(search);
    page.dataset.page = current.id;
    page.replaceChildren(h("p", { class: "loading" }, "加载中…"));
    try {
      dispose = await current.render(page, ctx);
    } catch (error) {
      page.replaceChildren(h("p", { class: "error" }, `页面加载失败：${errorText(error)}`));
    }
  }

  async function refreshStatus(): Promise<void> {
    try {
      showServePills(await api.serve(), servePill, bridgePill);
    } catch {
      showServePills(null, servePill, bridgePill);
    }
    try {
      const active = (await api.jobs(20)).jobs.filter((job) => isActive(job.state)).length;
      jobsButton.textContent = active ? `任务 (${active})` : "任务";
    } catch {
      jobsButton.textContent = "任务";
    }
  }

  window.addEventListener("hashchange", () => void route());
  await route();
  void refreshStatus();
  window.setInterval(() => void refreshStatus(), 15000);
}

void boot();
