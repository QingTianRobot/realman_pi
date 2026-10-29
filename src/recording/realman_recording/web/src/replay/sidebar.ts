// Episode sidebar: search + task filter + episode list with hide/restore.
// Owns the `/api/lerobot` dataset list that main.ts previously rendered inline.
import { initTags } from "./tags";

export type EpisodeQuality = {
  valid_frames?: number;
  invalid_frames?: number;
  max_sync_error_ns?: number;
};

export type EpisodeMeta = {
  session_id: string;
  repo_id?: string;
  episode_index?: number;
  frames: number;
  fps: number;
  task?: string;
  session_number?: number;
  quality?: EpisodeQuality;
  tags?: Record<string, string | boolean | number | null>;
  complete?: boolean;
};

export type PendingMeta = {
  session_id: string;
  session_number?: number;
  task?: string;
  state?: string;
  tags?: Record<string, string | boolean | number | null>;
  complete?: boolean;
};

export type SidebarCallbacks = {
  onSelect(sessionId: string): void;
  onSelectPending?(sessionId: string): void;
  onChanged(): void;
  onRefreshed?(episodes: EpisodeMeta[]): void;
};

export type SidebarApi = {
  refresh(): Promise<void>;
  getSession(sessionId: string): EpisodeMeta | undefined;
  getEpisodes(): EpisodeMeta[];
  setActive(sessionId: string | null): void;
};

// Hidden episodes come from the backend `/api/lerobot/trash` listing, which
// returns DELETED sessions that `/api/lerobot` drops. Restore is therefore a
// server round-trip rather than a browser-local registry.

const $ = <T extends HTMLElement>(selector: string) => document.querySelector(selector) as T;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function toast(message: string, error = false): void {
  const el = $("#toast");
  if (!el) return;
  el.textContent = message;
  el.className = `toast show${error ? " error" : ""}`;
  window.setTimeout(() => { el.className = "toast"; }, 4200);
}

export function initSidebar(callbacks: SidebarCallbacks): SidebarApi {
  const searchEl = $<HTMLInputElement>("#replay-search");
  const filterEl = $<HTMLSelectElement>("#replay-filter");
  const tagKeyEl = $<HTMLSelectElement>("#tag-filter-key");
  const tagValueEl = $<HTMLInputElement>("#tag-filter-value");
  const durationMinEl = $<HTMLInputElement>("#replay-duration-min");
  const durationMaxEl = $<HTMLInputElement>("#replay-duration-max");
  const episodesEl = $("#replay-episodes");
  const pendingEl = $("#replay-pending");
  const pendingCount = $("#pending-count");
  const hiddenEl = $("#replay-hidden");
  const countEl = $("#replay-count");
  const reindexButton = $("#reindex-button");

  let episodes: EpisodeMeta[] = [];
  let pending: PendingMeta[] = [];
  let hidden: EpisodeMeta[] = [];
  let activeId: string | null = null;
  let defaultTags: Record<string, string | boolean | number | null> = {};
  let defaultsLoaded = false;
  let filterValueEdited = false;
  let defaultsRequestId = 0;
  const tagEditor = initTags((scope, tags) => {
    if (scope === "defaults") {
      defaultsRequestId++;
      defaultTags = tags;
      defaultsLoaded = true;
      filterValueEdited = false;
      renderFilter();
      setFilterToDefault();
    }
    void refresh();
  });

  function setFilterToDefault(): void {
    const value = tagKeyEl.value ? defaultTags[tagKeyEl.value] : null;
    tagValueEl.value = value == null ? "" : String(value);
    render();
  }

  async function loadDefaults(): Promise<void> {
    const requestId = ++defaultsRequestId;
    try {
      const response = await fetch("/api/recording/tag-defaults");
      if (!response.ok) return;
      const data = await response.json() as { tags?: typeof defaultTags };
      if (requestId !== defaultsRequestId) return;
      defaultTags = data.tags ?? {};
      defaultsLoaded = true;
      renderFilter();
      if (!filterValueEdited) setFilterToDefault();
    } catch { /* A missing defaults endpoint must not block the episode list. */ }
  }

  function visibleEpisodes(): EpisodeMeta[] {
    const query = searchEl.value.trim().toLowerCase();
    const task = filterEl.value;
    const minSec = durationMinEl.value ? Number(durationMinEl.value) : null;
    const maxSec = durationMaxEl.value ? Number(durationMaxEl.value) : null;
    return episodes.filter((episode) => {
      if (task && (episode.task ?? "") !== task) return false;
      if (tagKeyEl.value) {
        const actual = episode.tags?.[tagKeyEl.value] ?? null;
        const wanted = tagValueEl.value.trim();
        if (wanted === "" ? actual !== null : String(actual) !== wanted) return false;
      }
      if (query) {
        const number = episode.episode_index !== undefined ? String(episode.episode_index + 1).padStart(6, "0") : "";
        const haystack = `${episode.session_id} ${episode.task ?? ""} ${number}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if ((minSec !== null || maxSec !== null) && (episode.fps ?? 0) > 0) {
        const seconds = (episode.frames || 0) / (episode.fps || 1);
        if (minSec !== null && seconds < minSec) return false;
        if (maxSec !== null && seconds > maxSec) return false;
      }
      return true;
    });
  }

  function renderFilter(): void {
    const tasks = [...new Set(episodes.map((episode) => episode.task).filter((task): task is string => Boolean(task)))];
    const current = filterEl.value;
    filterEl.innerHTML =
      '<option value="">全部 task</option>' +
      tasks.map((task) => `<option value="${escapeHtml(task)}">${escapeHtml(task)}</option>`).join("");
    if (tasks.includes(current)) filterEl.value = current;
    const currentKey = tagKeyEl.value;
    const custom = [...new Set([...episodes.flatMap((episode) => Object.keys(episode.tags ?? {})), ...Object.keys(defaultTags)])].filter((key) => !["success", "arm", "date", "lighting_level"].includes(key));
    tagKeyEl.innerHTML = '<option value="">全部标签</option>' +
      ["success", "arm", "date", "lighting_level", ...custom].map((key) => `<option value="${escapeHtml(key)}">${escapeHtml(key)}</option>`).join("");
    tagKeyEl.value = currentKey;
  }

  function row(episode: EpisodeMeta, kind: "visible" | "hidden"): string {
    const label = episode.episode_index !== undefined
      ? String(episode.episode_index + 1).padStart(6, "0")
      : episode.session_id;
    const task = episode.task ? `<small>${escapeHtml(episode.task)}</small>` : "";
    const badges = episode.tags ? `<small class="tag-badges">${episode.complete ? "已标注" : "待补齐"} · success=${episode.tags.success === true ? "true" : "false"} · arm=${escapeHtml(String(episode.tags.arm ?? "—"))} · light=${escapeHtml(String(episode.tags.lighting_level ?? "—"))}</small>` : "";
    const active = kind === "visible" && activeId === episode.session_id ? " active" : "";
    const buttons = kind === "visible"
      ? `<div class="episode-actions"><button class="episode-action" data-action="tags" data-session="${escapeHtml(episode.session_id)}">标签</button><button class="episode-action" data-action="edit" data-session="${escapeHtml(episode.session_id)}" title="编辑 task 标签">编辑</button><button class="episode-action" data-action="remove" data-session="${escapeHtml(episode.session_id)}" title="永久删除该 episode（不可恢复）">删除</button><button class="episode-action" data-action="hide" data-session="${escapeHtml(episode.session_id)}" title="隐藏该 episode">隐藏</button></div>`
      : `<button class="episode-action" data-action="restore" data-session="${escapeHtml(episode.session_id)}" title="恢复该 episode">恢复</button>`;
    return `<div class="episode-item${active}" data-session="${escapeHtml(episode.session_id)}" title="${escapeHtml(episode.session_id)}"><div class="episode-main"><strong>${escapeHtml(label)}</strong>${task}<small>${episode.frames} 帧 · ${episode.fps} Hz</small>${badges}</div>${buttons}</div>`;
  }

  function pendingRow(item: PendingMeta, number: number): string {
    const label = String(number).padStart(6, "0");
    const task = item.task ? `<small>${escapeHtml(item.task)}</small>` : "";
    return `<div class="episode-item" data-session="${escapeHtml(item.session_id)}" title="${escapeHtml(item.session_id)}"><div class="episode-main"><strong>${escapeHtml(label)}</strong>${task}<small>待转换 · ${item.complete ? "已标注" : "待补齐"}</small></div><div class="episode-actions"><button class="episode-action" data-action="tags" data-session="${escapeHtml(item.session_id)}">标签</button><button class="episode-action" data-action="remove-pending" data-session="${escapeHtml(item.session_id)}" title="删除该 session（永久删除，不可恢复）">删除</button></div></div>`;
  }

  function render(): void {
    const list = visibleEpisodes();
    countEl.textContent = episodes.length ? `${episodes.length} 个已转换` : "暂无";
    episodesEl.innerHTML = list.length
      ? list.map((episode) => row(episode, "visible")).join("")
      : '<div class="empty">暂无已转换数据</div>';

    pendingCount.textContent = pending.length ? `${pending.length} 个` : "0 个";
    const exportAllButton = `<button class="episode-action export-all" type="button" data-action="export-all" title="将全部待转换 session 一起转换">批量转换</button>`;
    pendingEl.innerHTML = exportAllButton + (pending.length
      ? pending.map((item, index) => pendingRow(item, index + 1)).join("")
      : '<div class="empty">暂无待转换数据</div>');

    // Preserve the hidden fold's open state across the 5s poll re-render.
    const hiddenOpen = hiddenEl.querySelector<HTMLDetailsElement>("details")?.open ?? false;
    hiddenEl.innerHTML = hidden.length
      ? `<details class="hidden-fold"${hiddenOpen ? " open" : ""}><summary>已隐藏 (${hidden.length})</summary><button class="episode-action remove-all" type="button" data-action="remove-all-hidden" title="永久删除全部已隐藏数据">删除全部隐藏数据</button>` + hidden.map((episode) => row(episode, "hidden")).join("") + `</details>`
      : "";
    hiddenEl.style.display = hidden.length ? "" : "none";
  }

  async function refresh(): Promise<void> {
    try {
      const [visibleResponse, pendingResponse, trashResponse] = await Promise.all([
        fetch("/api/lerobot"),
        fetch("/api/lerobot/pending"),
        fetch("/api/lerobot/trash"),
      ]);
      if (!visibleResponse.ok) throw new Error(`HTTP ${visibleResponse.status}`);
      const visibleData = await visibleResponse.json();
      episodes = (visibleData.sessions ?? []) as EpisodeMeta[];
      // pending and trash are supplementary; a 404 (e.g. in the Vite dev server) is not fatal.
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        pending = (pendingData.sessions ?? []) as PendingMeta[];
      }
      if (trashResponse.ok) {
        const trashData = await trashResponse.json();
        hidden = (trashData.sessions ?? []) as EpisodeMeta[];
      }
    } catch {
      countEl.textContent = "转换不可用";
      // keep the last known lists on a transient failure
    }
    renderFilter();
    render();
    callbacks.onRefreshed?.(episodes);
  }

  async function postAction(sessionId: string, action: "delete" | "restore" | "remove"): Promise<{ ok: boolean; metaSynced: boolean }> {
    try {
      const response = await fetch(`/api/lerobot/${encodeURIComponent(sessionId)}/${action}`, { method: "POST" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      return { ok: true, metaSynced: result.meta_synced !== false };
    } catch {
      return { ok: false, metaSynced: false };
    }
  }

  async function postTask(sessionId: string, task: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/lerobot/${encodeURIComponent(sessionId)}/task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return true;
    } catch {
      return false;
    }
  }

  async function handleAction(sessionId: string, action: "delete" | "restore" | "remove"): Promise<void> {
    const verb = action === "delete" ? "隐藏" : action === "remove" ? "删除" : "恢复";
    const episode = (action === "delete" || action === "remove" ? episodes : hidden).find((item) => item.session_id === sessionId);
    const label = episode?.session_id ?? sessionId;
    const warning = action === "remove" ? "（永久删除，不可恢复！）" : "";
    if (!window.confirm(`确定要${verb} episode ${label}${warning} 吗？`)) return;
    const result = await postAction(sessionId, action);
    if (!result.ok) {
      toast(`${verb}失败`, true);
      return;
    }
    if (!result.metaSynced) toast(`${verb}已完成，但索引待修复`, true);
    await refresh();
    callbacks.onChanged();
  }

  async function handleEdit(sessionId: string): Promise<void> {
    const episode = episodes.find((item) => item.session_id === sessionId);
    const task = window.prompt("编辑 task 标签", episode?.task ?? "");
    if (task === null) return;
    const trimmed = task.trim();
    if (!trimmed) {
      toast("task 不能为空", true);
      return;
    }
    const ok = await postTask(sessionId, trimmed);
    if (!ok) {
      toast("编辑失败", true);
      return;
    }
    await refresh();
  }

  async function handleRemoveAllHidden(): Promise<void> {
    if (!hidden.length) return;
    if (!window.confirm(`确定要永久删除全部 ${hidden.length} 条已隐藏数据吗？（不可恢复！）`)) return;
    try {
      const response = await fetch("/api/lerobot/trash/remove-all", { method: "POST" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch {
      toast("删除全部失败", true);
      return;
    }
    await refresh();
    callbacks.onChanged();
  }

  async function handleRemovePending(sessionId: string): Promise<void> {
    const item = pending.find((entry) => entry.session_id === sessionId);
    const label = item?.session_number ? String(item.session_number).padStart(6, "0") : sessionId;
    if (!window.confirm(`确定要删除待转换的 ${label} 吗？（永久删除，不可恢复）`)) return;
    try {
      const response = await fetch(`/api/lerobot/${encodeURIComponent(sessionId)}/remove`, { method: "POST" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      if (result.meta_synced === false) toast("删除已完成，但索引待修复", true);
    } catch {
      toast("删除失败", true);
      return;
    }
    await refresh();
    callbacks.onChanged();
  }

  async function handleExportAll(): Promise<void> {
    if (!pending.length) {
      toast("没有待转换的数据", true);
      return;
    }
    if (!window.confirm(`确定要批量转换全部 ${pending.length} 条待转换 session 吗？`)) return;
    try {
      const response = await fetch("/api/lerobot/export-all", { method: "POST" });
      if (!response.ok) {
        const message = await response.text().catch(() => "");
        throw new Error(message || `HTTP ${response.status}`);
      }
    } catch (error) {
      toast(`批量转换失败：${error instanceof Error ? error.message : "未知错误"}`, true);
      return;
    }
    toast(`已开始批量转换 ${pending.length} 条 session`);
    await refresh();
    callbacks.onChanged();
  }

  async function handleReindex(): Promise<void> {
    if (!window.confirm("确定要重新编排全部 episode_index 索引吗？（会清理孤儿 episode，编号重排为连续）")) return;
    reindexButton.disabled = true;
    toast("正在更新索引…");
    try {
      const response = await fetch("/api/lerobot/reindex", { method: "POST" });
      if (!response.ok) {
        const message = await response.text().catch(() => "");
        throw new Error(message || `HTTP ${response.status}`);
      }
      const result = await response.json();
      toast(result.meta_synced === false ? "数据集已重新编排，但标签索引待修复" : `索引已更新：${result.total_episodes_before} → ${result.total_episodes_after} 个（清理 ${result.orphans_removed} 个孤儿）`, result.meta_synced === false);
    } catch (error) {
      toast(`更新索引失败：${error instanceof Error ? error.message : "未知错误"}`, true);
    } finally {
      reindexButton.disabled = false;
    }
    await refresh();
    callbacks.onChanged();
  }

  function onContainerClick(event: Event): void {
    const removeAllEl = (event.target as HTMLElement).closest<HTMLElement>("[data-action='remove-all-hidden']");
    if (removeAllEl) {
      void handleRemoveAllHidden();
      return;
    }
    const exportAllEl = (event.target as HTMLElement).closest<HTMLElement>("[data-action='export-all']");
    if (exportAllEl) {
      void handleExportAll();
      return;
    }
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-session]");
    if (!target) return;
    const sessionId = target.dataset.session ?? "";
    const actionEl = (event.target as HTMLElement).closest<HTMLElement>("[data-action]");
    if (actionEl) {
      const action = actionEl.getAttribute("data-action");
      if (action === "hide") void handleAction(sessionId, "delete");
      else if (action === "restore") void handleAction(sessionId, "restore");
      else if (action === "remove") void handleAction(sessionId, "remove");
      else if (action === "remove-pending") void handleRemovePending(sessionId);
      else if (action === "edit") void handleEdit(sessionId);
      else if (action === "tags") void tagEditor.openEpisode(sessionId).catch((error) => toast(String(error), true));
      return;
    }
    // A 待转换 row has no LeRobot export yet, so it opens the raw preview
    // instead of the episode replay.
    if (pending.some((item) => item.session_id === sessionId)) {
      callbacks.onSelectPending?.(sessionId);
      return;
    }
    callbacks.onSelect(sessionId);
  }

  episodesEl.addEventListener("click", onContainerClick);
  pendingEl.addEventListener("click", onContainerClick);
  hiddenEl.addEventListener("click", onContainerClick);
  reindexButton.addEventListener("click", () => void handleReindex());
  $("#tag-defaults-button").addEventListener("click", () => void tagEditor.openDefaults().catch((error) => toast(String(error), true)));
  searchEl.addEventListener("input", render);
  filterEl.addEventListener("change", render);
  tagKeyEl.addEventListener("change", () => {
    filterValueEdited = false;
    if (defaultsLoaded) setFilterToDefault();
    else void loadDefaults();
    render();
  });
  tagValueEl.addEventListener("input", () => { filterValueEdited = true; render(); });
  durationMinEl.addEventListener("input", render);
  durationMaxEl.addEventListener("input", render);

  void loadDefaults();
  void refresh();

  return {
    refresh,
    getSession: (sessionId) => episodes.find((episode) => episode.session_id === sessionId),
    getEpisodes: () => episodes,
    setActive: (sessionId) => {
      activeId = sessionId;
      render();
    },
  };
}
