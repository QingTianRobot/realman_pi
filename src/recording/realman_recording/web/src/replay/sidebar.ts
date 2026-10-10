// Episode sidebar: search + task filter + episode list with hide/restore.
// Owns the `/api/lerobot` dataset list that main.ts previously rendered inline.

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
  quality?: EpisodeQuality;
};

export type SidebarCallbacks = {
  onSelect(sessionId: string): void;
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
  const episodesEl = $("#replay-episodes");
  const hiddenEl = $("#replay-hidden");
  const countEl = $("#replay-count");

  let episodes: EpisodeMeta[] = [];
  let hidden: EpisodeMeta[] = [];
  let activeId: string | null = null;

  function visibleEpisodes(): EpisodeMeta[] {
    const query = searchEl.value.trim().toLowerCase();
    const task = filterEl.value;
    return episodes.filter((episode) => {
      if (task && (episode.task ?? "") !== task) return false;
      if (query) {
        const haystack = `${episode.session_id} ${episode.task ?? ""}`.toLowerCase();
        if (!haystack.includes(query)) return false;
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
  }

  function row(episode: EpisodeMeta, kind: "visible" | "hidden"): string {
    const task = episode.task ? `<small>${escapeHtml(episode.task)}</small>` : "";
    const active = kind === "visible" && activeId === episode.session_id ? " active" : "";
    const buttons = kind === "visible"
      ? `<div class="episode-actions"><button class="episode-action" data-action="edit" data-session="${escapeHtml(episode.session_id)}" title="编辑 task 标签">编辑</button><button class="episode-action" data-action="hide" data-session="${escapeHtml(episode.session_id)}" title="隐藏该 episode">隐藏</button></div>`
      : `<button class="episode-action" data-action="restore" data-session="${escapeHtml(episode.session_id)}" title="恢复该 episode">恢复</button>`;
    return `<div class="episode-item${active}" data-session="${escapeHtml(episode.session_id)}"><div class="episode-main"><strong>${escapeHtml(episode.session_id)}</strong>${task}<small>${episode.frames} 帧 · ${episode.fps} Hz</small></div>${buttons}</div>`;
  }

  function render(): void {
    const list = visibleEpisodes();
    countEl.textContent = episodes.length ? `${episodes.length} 个数据集` : "暂无";
    episodesEl.innerHTML = list.length
      ? list.map((episode) => row(episode, "visible")).join("")
      : '<div class="empty">暂无已导出 episode</div>';

    hiddenEl.innerHTML = hidden.length
      ? `<div class="hidden-heading">已隐藏</div>` + hidden.map((episode) => row(episode, "hidden")).join("")
      : "";
    hiddenEl.style.display = hidden.length ? "" : "none";
  }

  async function refresh(): Promise<void> {
    try {
      const [visibleResponse, trashResponse] = await Promise.all([
        fetch("/api/lerobot"),
        fetch("/api/lerobot/trash"),
      ]);
      if (!visibleResponse.ok) throw new Error(`HTTP ${visibleResponse.status}`);
      if (!trashResponse.ok) throw new Error(`HTTP ${trashResponse.status}`);
      const [visibleData, trashData] = await Promise.all([
        visibleResponse.json(),
        trashResponse.json(),
      ]);
      episodes = (visibleData.sessions ?? []) as EpisodeMeta[];
      hidden = (trashData.sessions ?? []) as EpisodeMeta[];
    } catch {
      countEl.textContent = "回放不可用";
      // keep the last known lists on a transient failure
    }
    renderFilter();
    render();
    callbacks.onRefreshed?.(episodes);
  }

  async function postAction(sessionId: string, action: "delete" | "restore"): Promise<boolean> {
    try {
      const response = await fetch(`/api/lerobot/${encodeURIComponent(sessionId)}/${action}`, { method: "POST" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return true;
    } catch {
      return false;
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

  async function handleAction(sessionId: string, action: "delete" | "restore"): Promise<void> {
    const verb = action === "delete" ? "隐藏" : "恢复";
    const episode = (action === "delete" ? episodes : hidden).find((item) => item.session_id === sessionId);
    const label = episode?.session_id ?? sessionId;
    if (!window.confirm(`确定要${verb} episode ${label} 吗？`)) return;
    const ok = await postAction(sessionId, action);
    if (!ok) {
      toast(`${verb}失败`, true);
      return;
    }
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

  function onContainerClick(event: Event): void {
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-session]");
    if (!target) return;
    const sessionId = target.dataset.session ?? "";
    const actionEl = (event.target as HTMLElement).closest<HTMLElement>("[data-action]");
    if (actionEl) {
      const action = actionEl.getAttribute("data-action");
      if (action === "hide") void handleAction(sessionId, "delete");
      else if (action === "restore") void handleAction(sessionId, "restore");
      else if (action === "edit") void handleEdit(sessionId);
      return;
    }
    callbacks.onSelect(sessionId);
  }

  episodesEl.addEventListener("click", onContainerClick);
  hiddenEl.addEventListener("click", onContainerClick);
  searchEl.addEventListener("input", render);
  filterEl.addEventListener("change", render);

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
