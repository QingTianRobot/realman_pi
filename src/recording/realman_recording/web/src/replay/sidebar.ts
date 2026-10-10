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
};

export type SidebarApi = {
  refresh(): Promise<void>;
  getSession(sessionId: string): EpisodeMeta | undefined;
  getEpisodes(): EpisodeMeta[];
  setActive(sessionId: string | null): void;
};

// Hidden episodes are only known locally: `/api/lerobot` drops non-ADOPTED
// sessions, so the restore affordance must come from the browser's memory of
// what it hid. Persisting them keeps "restore" usable across a page reload.
const HIDDEN_KEY = "recording-hidden-episodes-v1";

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
  let hidden: EpisodeMeta[] = loadHidden();
  let activeId: string | null = null;

  function loadHidden(): EpisodeMeta[] {
    try {
      const parsed = JSON.parse(localStorage.getItem(HIDDEN_KEY) ?? "[]");
      return Array.isArray(parsed) ? (parsed as EpisodeMeta[]) : [];
    } catch {
      return [];
    }
  }

  function saveHidden(): void {
    try {
      localStorage.setItem(HIDDEN_KEY, JSON.stringify(hidden));
    } catch {
      /* storage unavailable is not fatal */
    }
  }

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
    const button = kind === "visible"
      ? `<button class="episode-action" data-action="hide" data-session="${escapeHtml(episode.session_id)}" title="隐藏该 episode">隐藏</button>`
      : `<button class="episode-action" data-action="restore" data-session="${escapeHtml(episode.session_id)}" title="恢复该 episode">恢复</button>`;
    return `<div class="episode-item${active}" data-session="${escapeHtml(episode.session_id)}"><div class="episode-main"><strong>${escapeHtml(episode.session_id)}</strong>${task}<small>${episode.frames} 帧 · ${episode.fps} Hz</small></div>${button}</div>`;
  }

  function render(): void {
    const list = visibleEpisodes();
    countEl.textContent = episodes.length ? `${episodes.length} 个数据集` : "暂无";
    episodesEl.innerHTML = list.length
      ? list.map((episode) => row(episode, "visible")).join("")
      : '<div class="empty">暂无已导出 episode</div>';

    // Drop any "hidden" entry that the backend reports as visible again
    // (e.g. restored from another tab or an earlier session).
    const visibleIds = new Set(episodes.map((episode) => episode.session_id));
    hidden = hidden.filter((episode) => !visibleIds.has(episode.session_id));
    saveHidden();
    hiddenEl.innerHTML = hidden.length
      ? `<div class="hidden-heading">已隐藏</div>` + hidden.map((episode) => row(episode, "hidden")).join("")
      : "";
    hiddenEl.style.display = hidden.length ? "" : "none";
  }

  async function refresh(): Promise<void> {
    try {
      const response = await fetch("/api/lerobot");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      episodes = (data.sessions ?? []) as EpisodeMeta[];
    } catch {
      countEl.textContent = "回放不可用";
      // keep the last known list on a transient failure
    }
    renderFilter();
    render();
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
    if (action === "delete") {
      const removed = episodes.find((item) => item.session_id === sessionId);
      if (removed) hidden.push(removed);
      episodes = episodes.filter((item) => item.session_id !== sessionId);
    } else {
      hidden = hidden.filter((item) => item.session_id !== sessionId);
    }
    saveHidden();
    render();
    callbacks.onChanged();
  }

  function onContainerClick(event: Event): void {
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-session]");
    if (!target) return;
    const sessionId = target.dataset.session ?? "";
    const action = (event.target as HTMLElement).closest<HTMLElement>("[data-action]");
    if (action) {
      void handleAction(sessionId, action.getAttribute("data-action") === "hide" ? "delete" : "restore");
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
