// Subtask annotation on the replay timeline, following LeRobot Studio's Q/R
// flow: Q marks the current frame as a segment start, R marks the end, then a
// required text label is collected. Segments are saved as a whole to the
// backend (POST /subtasks replaces the manifest list) and re-loaded whenever an
// episode is selected (GET /subtasks).
//
// The local list is authoritative while editing: the POST always sends the full
// current list, so a successful save makes the server state match exactly what
// is displayed. A GET refresh after save is therefore only informational and is
// guarded so a stale response can never clobber a newer local edit.

export type SubtaskSegment = {
  index: number;
  label: string;
  start_frame: number;
  end_frame: number;
};

export type AnnotationCallbacks = {
  getSessionId(): string | null;
  getCurrentFrame(): number;
  notify(message: string, error?: boolean): void;
};

export type AnnotationApi = {
  load(sessionId: string): void;
  clear(): void;
  onFrameChange(frameIndex: number): void;
};

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

export function initAnnotation(callbacks: AnnotationCallbacks): AnnotationApi {
  const toggleBtn = $<HTMLButtonElement>("#annotation-toggle");
  const panel = $("#annotation-panel");
  const statusEl = $("#annotation-status");
  const frameEl = $("#annotation-frame");
  const listEl = $("#annotation-list");
  const saveBtn = $<HTMLButtonElement>("#annotation-save");
  const cancelBtn = $<HTMLButtonElement>("#annotation-cancel");

  let sessionId: string | null = null;
  let segments: SubtaskSegment[] = [];
  let enabled = false;
  let pendingStart: number | null = null;
  // Bumped on every local mutation so an in-flight save's refresh (below) can
  // detect that the list changed while the request was on the wire.
  let editVersion = 0;
  // Saves are serialized so concurrent auto-saves can never interleave their
  // POST/GET pairs; the queued save always snapshots the newest local state.
  let saveChain: Promise<void> = Promise.resolve();

  function active(): boolean {
    return enabled && sessionId !== null;
  }

  function renderStatus(): void {
    if (!active()) {
      statusEl.textContent = "";
      frameEl.textContent = "";
      return;
    }
    statusEl.innerHTML = pendingStart !== null
      ? `起点帧 <b>${pendingStart}</b> · 按 <b>R</b> 标记终点`
      : `按 <b>Q</b> 标记起点`;
    frameEl.textContent = `当前帧 ${callbacks.getCurrentFrame()}`;
  }

  function renderList(): void {
    listEl.innerHTML = segments.length
      ? segments.map((segment) =>
        `<div class="annotation-segment"><span class="annotation-label">${escapeHtml(segment.label)}</span><span class="annotation-range">${segment.start_frame} – ${segment.end_frame}</span><button class="annotation-remove" data-index="${segment.index}" title="删除该段">×</button></div>`
      ).join("")
      : '<div class="annotation-empty">暂无已标注段</div>';
  }

  function render(): void {
    const show = active();
    panel.hidden = !show;
    toggleBtn.textContent = enabled ? "退出标注" : "标注";
    toggleBtn.classList.toggle("active", enabled);
    renderStatus();
    if (show) renderList();
  }

  function normalize(): void {
    segments.sort((a, b) => a.start_frame - b.start_frame);
    segments = segments.map((segment, index) => ({ ...segment, index }));
  }

  function markStart(): void {
    if (!active()) return;
    pendingStart = callbacks.getCurrentFrame();
    renderStatus();
  }

  function markEnd(): void {
    if (!active() || pendingStart === null) return;
    const start = pendingStart;
    const end = callbacks.getCurrentFrame();
    if (end < start) {
      callbacks.notify("终点帧不能早于起点帧", true);
      renderStatus();
      return;
    }
    const label = window.prompt("段标签（必填）", "");
    if (label === null) {
      // Keep the start so the user can retry ending the same segment.
      renderStatus();
      return;
    }
    const trimmed = label.trim();
    if (!trimmed) {
      callbacks.notify("标签不能为空", true);
      renderStatus();
      return;
    }
    pendingStart = null;
    segments.push({ index: segments.length, label: trimmed, start_frame: start, end_frame: end });
    normalize();
    editVersion += 1;
    render();
    save();
  }

  function removeSegment(index: number): void {
    segments = segments.filter((segment) => segment.index !== index);
    normalize();
    editVersion += 1;
    render();
    save();
  }

  async function doSave(): Promise<void> {
    if (!sessionId) return;
    const owner = sessionId;
    const snapshot = segments.map((segment) => ({ ...segment }));
    const versionAtStart = editVersion;
    const response = await fetch(`/api/lerobot/${encodeURIComponent(owner)}/subtasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subtasks: snapshot }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    // Refresh from the server only when the list is still the one we just
    // saved; a concurrent local edit keeps the newer local state authoritative.
    if (sessionId !== owner) return;
    if (editVersion === versionAtStart) {
      try {
        const getResponse = await fetch(`/api/lerobot/${encodeURIComponent(owner)}/subtasks`);
        if (!getResponse.ok) throw new Error(`HTTP ${getResponse.status}`);
        const payload = (await getResponse.json()) as { subtasks?: unknown };
        if (sessionId === owner && editVersion === versionAtStart) {
          segments = Array.isArray(payload.subtasks) ? (payload.subtasks as SubtaskSegment[]) : [];
          render();
        }
      } catch {
        /* keep the local list; it already matches what was just saved */
      }
    }
    callbacks.notify("标注已保存");
  }

  function save(): void {
    saveChain = saveChain
      .then(() => doSave())
      .catch((error) => callbacks.notify(`保存失败: ${String(error)}`, true));
  }

  async function load(nextSessionId: string): Promise<void> {
    sessionId = nextSessionId;
    pendingStart = null;
    // Clear the previous episode's list synchronously, before the GET resolves.
    // selectReplaySession renders frame 0 right after load(), so a fast R (or a
    // click on a stale remove ×) must never see or edit the old episode's
    // segments. The editVersion bump also voids any in-flight save refresh from
    // the previous session so its stale GET cannot re-populate the list.
    segments = [];
    editVersion += 1;
    const versionAtLoad = editVersion;
    render();
    try {
      const response = await fetch(`/api/lerobot/${encodeURIComponent(nextSessionId)}/subtasks`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = (await response.json()) as { subtasks?: unknown };
      if (sessionId !== nextSessionId || editVersion !== versionAtLoad) return;
      segments = Array.isArray(payload.subtasks) ? (payload.subtasks as SubtaskSegment[]) : [];
    } catch (error) {
      if (sessionId !== nextSessionId) return;
      // A local edit made while the GET was in flight is authoritative and must
      // not be wiped by the (now stale) server list.
      if (editVersion === versionAtLoad) segments = [];
      callbacks.notify(`加载标注失败: ${String(error)}`, true);
    }
    render();
  }

  function clear(): void {
    sessionId = null;
    segments = [];
    pendingStart = null;
    editVersion += 1;
    render();
  }

  toggleBtn.addEventListener("click", () => {
    if (!sessionId) {
      callbacks.notify("请先选择一个 Episode", true);
      return;
    }
    enabled = !enabled;
    render();
  });
  saveBtn.addEventListener("click", save);
  cancelBtn.addEventListener("click", () => {
    if (pendingStart === null) return;
    pendingStart = null;
    renderStatus();
  });
  listEl.addEventListener("click", (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-index]");
    if (!target) return;
    removeSegment(Number(target.dataset.index));
  });

  // Q/R only act inside annotation mode with an episode loaded, and never when
  // the user is typing in a field. Arrow/space shortcuts live in video.ts and
  // are unaffected since they are disjoint keys.
  document.addEventListener("keydown", (event) => {
    if (!active()) return;
    if ((event.target as HTMLElement | null)?.matches("input,select,textarea")) return;
    if (event.key === "q" || event.key === "Q") {
      event.preventDefault();
      markStart();
    } else if (event.key === "r" || event.key === "R") {
      event.preventDefault();
      markEnd();
    }
  });

  render();

  return {
    load,
    clear,
    onFrameChange: () => {
      if (active()) renderStatus();
    },
  };
}
