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

function normalizeDateFilter(value: string): string | null {
  const match = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/.exec(value.trim());
  if (!match) return null;
  const canonical = `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
  const date = new Date(`${canonical}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === canonical ? canonical : null;
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
  const tagRowsEl = $("#tag-filter-rows");
  const filterCountEl = $("#replay-filter-count");
  type TagFilter = { row: HTMLElement; key: HTMLSelectElement; value: HTMLInputElement; options: HTMLDivElement; toggle: HTMLButtonElement; edited: boolean };
  const tagFilters: TagFilter[] = [];
  let nextFilterId = 0;
  const closeOptions = () => { for (const filter of tagFilters) if (filter.options.matches(":popover-open")) filter.options.hidePopover(); };
  window.addEventListener("resize", closeOptions);
  document.addEventListener("scroll", (event) => { if (!tagFilters.some((filter) => filter.options.contains(event.target as Node))) closeOptions(); }, true);
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
  let defaultsRequestId = 0;
  const tagEditor = initTags((scope, tags) => {
    if (scope === "defaults") {
      defaultsRequestId++;
      defaultTags = tags;
      renderFilter();
      for (const filter of tagFilters) if (!filter.edited) applyDefault(filter);
      render();
    }
    void refresh();
  });

  function applyDefault(filter: TagFilter): void {
    const value = defaultTags[filter.key.value];
    filter.value.value = value == null ? "" : String(value);
  }

  function updateTagOptions(filter: TagFilter): void {
    const core = ["success", "arm", "date", "lighting_level", "material", "retry"];
    const keys = [...new Set([...core, ...episodes.flatMap((episode) => Object.keys(episode.tags ?? {})), ...Object.keys(defaultTags)])];
    const selected = filter.key.value;
    if (selected && !keys.includes(selected)) keys.push(selected);
    filter.key.innerHTML = '<option value="">全部标签</option>' + keys.map((key) => `<option value="${escapeHtml(key)}">${escapeHtml(key)}</option>`).join("");
    filter.key.value = selected;
    updateValueOptions(filter);
  }

  function positionOptions(filter: TagFilter): void {
    const rect = filter.row.getBoundingClientRect();
    const width = Math.min(Math.max(rect.width, 240), 360, window.innerWidth - 24);
    filter.options.style.width = `${width}px`;
    filter.options.style.left = `${Math.max(12, Math.min(rect.left, window.innerWidth - width - 12))}px`;
    const bottom = filter.value.getBoundingClientRect().bottom + 6;
    const height = Math.min(filter.options.scrollHeight, 220);
    filter.options.style.top = `${bottom + height <= window.innerHeight - 12 ? bottom : Math.max(12, rect.top - height - 6)}px`;
  }

  function showOptions(filter: TagFilter): void {
    if (filter.value.disabled || !filter.options.children.length) return;
    if (!filter.options.matches(":popover-open")) filter.options.showPopover();
    positionOptions(filter);
    filter.value.setAttribute("aria-expanded", "true");
  }

  function markSelectedOption(filter: TagFilter): void {
    const value = filter.key.value === "date" ? normalizeDateFilter(filter.value.value) : filter.value.value;
    for (const option of filter.options.querySelectorAll<HTMLButtonElement>("button")) option.setAttribute("aria-selected", String(option.dataset.value === value));
  }

  function updateValueOptions(filter: TagFilter): void {
    const key = filter.key.value;
    const enums: Record<string, string[]> = { success: ["true", "false"], retry: ["false", "true"], arm: ["left", "right", "both"], lighting_level: ["1", "2", "3"], material: ["adapter", "plug", "cable", "mix-adapter", "mix-cable", "mix-plug"] };
    const observed = episodes.filter((episode) => !filterEl.value || episode.task === filterEl.value)
      .map((episode) => episode.tags?.[key]).filter((value) => value != null).map(String);
    const values = [...new Set([...(enums[key] ?? []), ...observed])];
    if (key === "date") values.sort().reverse();
    const signature = JSON.stringify(values);
    if (filter.options.dataset.values !== signature) {
      filter.options.dataset.values = signature;
      filter.options.replaceChildren(...values.map((value, index) => {
        const option = document.createElement("button"); option.type = "button"; option.className = "tag-value-option"; option.tabIndex = -1;
        option.setAttribute("role", "option"); option.dataset.value = value; option.textContent = value;
        option.addEventListener("click", () => { filter.value.value = value; filter.value.dispatchEvent(new Event("input", { bubbles: true })); filter.value.focus(); filter.options.hidePopover(); });
        option.addEventListener("keydown", (event) => {
          const delta = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0;
          if (delta) { event.preventDefault(); const buttons = filter.options.querySelectorAll<HTMLButtonElement>("button"); buttons[(index + delta + buttons.length) % buttons.length]?.focus(); }
          if (event.key === "Escape") { event.preventDefault(); filter.value.focus(); filter.options.hidePopover(); }
        });
        return option;
      }));
    }
    markSelectedOption(filter);
    filter.value.disabled = !key; filter.toggle.disabled = !key || !values.length;
    if (!key && filter.options.matches(":popover-open")) filter.options.hidePopover();
    filter.value.placeholder = !key ? "选择标签字段" : key === "date" ? "选择日期或输入 YYYY-MM-DD" : "选择或输入；空=未标注";
  }

  function addTagFilter(): void {
    const row = document.createElement("div"); row.className = "tag-filter-row";
    const key = document.createElement("select"); key.className = "studio-select tag-filter-key"; key.setAttribute("aria-label", "标签筛选字段");
    const value = document.createElement("input"); value.className = "studio-search tag-filter-value"; value.setAttribute("aria-label", "标签筛选值"); value.autocomplete = "off";
    const control = document.createElement("div"); control.className = "tag-value-control";
    const toggle = document.createElement("button"); toggle.type = "button"; toggle.className = "tag-value-toggle"; toggle.textContent = "⌄"; toggle.setAttribute("aria-label", "展开全部标签选项");
    const options = document.createElement("div"); options.id = `tag-value-options-${++nextFilterId}`; options.className = "tag-value-options"; options.popover = "auto"; options.setAttribute("role", "listbox"); options.setAttribute("aria-label", "全部标签值");
    value.setAttribute("role", "combobox"); value.setAttribute("aria-controls", options.id); value.setAttribute("aria-expanded", "false"); value.setAttribute("aria-haspopup", "listbox"); value.setAttribute("aria-autocomplete", "none");
    const remove = document.createElement("button"); remove.type = "button"; remove.className = "episode-action tag-filter-remove"; remove.textContent = "×"; remove.setAttribute("aria-label", "移除标签条件");
    const filter: TagFilter = { row, key, value, options, toggle, edited: false };
    control.append(value, toggle); row.append(key, control, remove, options); tagRowsEl.append(row); tagFilters.push(filter);
    key.addEventListener("change", () => { filter.edited = false; applyDefault(filter); updateValueOptions(filter); render(); });
    value.addEventListener("input", () => { filter.edited = true; markSelectedOption(filter); render(); });
    value.addEventListener("focus", () => showOptions(filter));
    value.addEventListener("click", () => showOptions(filter));
    value.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") { event.preventDefault(); showOptions(filter); filter.options.querySelector<HTMLButtonElement>("button")?.focus(); }
      if (event.key === "Escape" && filter.options.matches(":popover-open")) { event.preventDefault(); filter.options.hidePopover(); }
    });
    toggle.addEventListener("mousedown", (event) => event.preventDefault());
    toggle.addEventListener("click", () => { if (options.matches(":popover-open")) options.hidePopover(); else { value.focus(); showOptions(filter); } });
    options.addEventListener("toggle", () => value.setAttribute("aria-expanded", String(options.matches(":popover-open"))));
    row.addEventListener("focusout", (event) => { if (!row.contains(event.relatedTarget as Node | null) && options.matches(":popover-open")) options.hidePopover(); });
    remove.addEventListener("click", () => { tagFilters.splice(tagFilters.indexOf(filter), 1); row.remove(); if (!tagFilters.length) addTagFilter(); render(); });
    updateTagOptions(filter);
    render();
  }

  function matchesTagFilters(episode: EpisodeMeta): boolean {
    return tagFilters.every((filter) => {
      const key = filter.key.value;
      if (!key) return true;
      const actual = episode.tags?.[key] ?? null;
      const raw = filter.value.value.trim();
      const wanted = key === "date" && raw ? normalizeDateFilter(raw) ?? raw : raw;
      return wanted === "" ? actual === null : actual !== null && String(actual) === wanted;
    });
  }

  async function loadDefaults(): Promise<void> {
    const requestId = ++defaultsRequestId;
    try {
      const response = await fetch("/api/recording/tag-defaults");
      if (!response.ok) return;
      const data = await response.json() as { tags?: typeof defaultTags };
      if (requestId !== defaultsRequestId) return;
      defaultTags = data.tags ?? {};
      renderFilter();
      for (const filter of tagFilters) if (!filter.edited) applyDefault(filter);
      render();
    } catch { /* A missing defaults endpoint must not block the episode list. */ }
  }

  function visibleEpisodes(): EpisodeMeta[] {
    const query = searchEl.value.trim().toLowerCase();
    const task = filterEl.value;
    const minSec = durationMinEl.value ? Number(durationMinEl.value) : null;
    const maxSec = durationMaxEl.value ? Number(durationMaxEl.value) : null;
    return episodes.filter((episode) => {
      if (task && (episode.task ?? "") !== task) return false;
      if (!matchesTagFilters(episode)) return false;
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
    for (const filter of tagFilters) updateTagOptions(filter);
  }

  function row(episode: EpisodeMeta, kind: "visible" | "hidden"): string {
    const label = episode.episode_index !== undefined
      ? String(episode.episode_index + 1).padStart(6, "0")
      : episode.session_id;
    const task = episode.task ? `<small>${escapeHtml(episode.task)}</small>` : "";
    const badges = episode.tags ? `<small class="tag-badges">${episode.complete ? "已标注" : "待补齐"} · success=${episode.tags.success === true ? "true" : "false"} · arm=${escapeHtml(String(episode.tags.arm ?? "—"))} · light=${escapeHtml(String(episode.tags.lighting_level ?? "—"))} · material=${escapeHtml(String(episode.tags.material ?? "—"))} · retry=${escapeHtml(String(episode.tags.retry ?? "—"))}</small>` : "";
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
    filterCountEl.textContent = `筛选结果：${list.length} / ${episodes.length} Episodes`;
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
      if (!pendingResponse.ok) throw new Error(`HTTP ${pendingResponse.status}`);
      if (!trashResponse.ok) throw new Error(`HTTP ${trashResponse.status}`);
      const [visibleData, pendingData, trashData] = await Promise.all([
        visibleResponse.json(),
        pendingResponse.json(),
        trashResponse.json(),
      ]);
      episodes = (visibleData.sessions ?? []) as EpisodeMeta[];
      pending = (pendingData.sessions ?? []) as PendingMeta[];
      hidden = (trashData.sessions ?? []) as EpisodeMeta[];
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
  filterEl.addEventListener("change", () => { for (const filter of tagFilters) updateValueOptions(filter); render(); });
  $("#tag-filter-add").addEventListener("click", addTagFilter);
  $("#tag-filter-clear").addEventListener("click", () => { tagFilters.splice(0); tagRowsEl.replaceChildren(); addTagFilter(); });
  durationMinEl.addEventListener("input", render);
  durationMaxEl.addEventListener("input", render);

  addTagFilter();
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
