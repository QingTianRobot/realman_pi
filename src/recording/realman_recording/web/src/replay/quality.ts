// Deviation intervals on the replay timeline (偏离标注). The manifest's quality block is the
// authority and stores nanosecond bounds; this editor works in frames of the exported episode and
// converts with the exporter's integer grid, first_walltime_ns + i * round(1e9 / fps), in BigInt
// so epoch nanoseconds keep their precision. The server decides each saved interval's source (an
// unchanged live interval stays "live").
//
// Keys, only while the 偏离 editor is on and never while typing in a field:
//   D       outside an interval: start one on this frame (it runs to the next interval, or stays
//           open to the end); inside an interval: end it on this frame
//   [ / ]   move the start / end of the interval under the cursor to this frame; outside any
//           interval, [ moves the next interval's start and ] the previous interval's end
//   Delete  remove the interval under the cursor

export type QualityReason = { id: string; label: string };
type ServerInterval = {
  start_ns: string;
  end_ns: string | null;
  reason: string | null;
  source: string;
  start_frame: number | null;
  end_frame: number | null;
};
type QualityDocument = {
  session_id: string;
  revision: number;
  attempt: { attempt_id?: string; outcome?: string | null; succeeded?: boolean | null } | null;
  intervals: ServerInterval[];
  frames: { fps: number; first_walltime_ns: string; frame_count: number } | null;
  reasons: QualityReason[];
};
type EditInterval = {
  start: number | null; // null: the interval lies outside the exported frames
  end: number | null; // null with a start: open to the last frame
  reason: string | null;
  source: string;
  startNs: string;
  endNs: string | null;
  boundsChanged: boolean;
};
type SavedInterval = { start_ns: string; end_ns: string | null; reason: string | null; source: string };

export type QualityCallbacks = {
  getCurrentFrame(): number;
  getRepoId(): string | null;
  notify(message: string, error?: boolean): void;
};

export type QualityApi = {
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

export function initQuality(callbacks: QualityCallbacks): QualityApi {
  const toggleBtn = $<HTMLButtonElement>("#quality-toggle");
  const exportBtn = $<HTMLButtonElement>("#quality-export");
  const statusEl = $("#quality-status");
  const track = $("#quality-track");
  const panel = $("#quality-panel");
  const attemptEl = $("#quality-attempt");
  const listEl = $("#quality-list");

  let sessionId: string | null = null;
  let doc: QualityDocument | null = null;
  let intervals: EditInterval[] = [];
  let enabled = false;
  // Bumped on every local change so a save's response never replaces a newer local edit.
  let editVersion = 0;
  // Saves are serialized; each one sends the newest local list with the newest revision.
  let saveChain: Promise<void> = Promise.resolve();

  function frameCount(): number {
    return doc?.frames?.frame_count ?? 0;
  }
  function endOf(item: EditInterval): number {
    return item.end ?? frameCount() - 1;
  }
  function frameNs(frame: number): string {
    const frames = doc!.frames!;
    const step = BigInt(Math.round(1e9 / frames.fps));
    return (BigInt(frames.first_walltime_ns) + BigInt(frame) * step).toString();
  }
  function startKey(item: EditInterval): bigint {
    return BigInt(item.boundsChanged && item.start !== null ? frameNs(item.start) : item.startNs);
  }
  function active(): boolean {
    return enabled && sessionId !== null && doc?.frames != null;
  }
  function editable(): EditInterval[] {
    return intervals.filter((item) => item.start !== null);
  }
  function containing(frame: number): EditInterval | undefined {
    return editable().find((item) => item.start! <= frame && frame <= endOf(item));
  }

  function fromDocument(next: QualityDocument): void {
    doc = next;
    intervals = next.intervals.map((item) => ({
      start: item.start_frame,
      end: item.end_ns === null ? null : item.end_frame,
      reason: item.reason,
      source: item.source,
      startNs: item.start_ns,
      endNs: item.end_ns,
      boundsChanged: false,
    }));
  }

  function renderTrack(): void {
    const count = frameCount();
    track.innerHTML = count > 0
      ? editable().map((item) => {
        const left = (item.start! / count) * 100;
        const width = ((endOf(item) - item.start! + 1) / count) * 100;
        return `<span class="quality-band${item.end === null ? " open" : ""}" style="left:${left}%;width:${width}%"></span>`;
      }).join("")
      : "";
  }

  function renderStatus(): void {
    if (!sessionId || !doc) {
      statusEl.textContent = "";
      return;
    }
    if (!doc.frames) {
      statusEl.textContent = "该 Episode 还没有导出，不能按帧标注";
      return;
    }
    if (!enabled) {
      statusEl.textContent = `${intervals.length} 段偏离`;
      return;
    }
    const frame = callbacks.getCurrentFrame();
    statusEl.innerHTML = containing(frame)
      ? `第 ${frame} 帧在偏离区间内 · <b>D</b> 结束于此帧 · <b>[</b> <b>]</b> 改起止 · <b>Delete</b> 删除`
      : `第 ${frame} 帧 · <b>D</b> 从此帧开始偏离 · <b>[</b> <b>]</b> 延伸最近一段`;
  }

  function renderList(): void {
    const attempt = doc?.attempt;
    attemptEl.textContent = attempt
      ? `尝试 ${attempt.attempt_id ?? "—"} · ${attempt.outcome ?? "进行中"}${attempt.succeeded === true ? " · 成功" : attempt.succeeded === false ? " · 失败" : ""}`
      : "非策略录制";
    const reasons = doc?.reasons ?? [];
    listEl.innerHTML = intervals.length
      ? intervals.map((item, index) => {
        const range = item.start === null ? "超出回放范围" : `${item.start} – ${item.end === null ? "结尾" : item.end}`;
        const options = [
          '<option value="">未填原因</option>',
          ...reasons.map((reason) =>
            `<option value="${escapeHtml(reason.id)}"${reason.id === item.reason ? " selected" : ""}>${escapeHtml(reason.label)}</option>`),
        ].join("");
        return `<div class="quality-row"><span class="quality-range">${range}</span><select class="quality-reason" data-index="${index}" aria-label="偏离原因">${options}</select><span class="quality-source">${item.source === "live" ? "现场" : "回放"}</span><button class="quality-remove" data-index="${index}" title="删除该段">×</button></div>`;
      }).join("")
      : '<div class="annotation-empty">暂无偏离区间</div>';
  }

  function render(): void {
    toggleBtn.textContent = enabled ? "退出偏离标注" : "偏离";
    toggleBtn.classList.toggle("active", enabled);
    panel.hidden = !(enabled && sessionId !== null && doc !== null);
    renderTrack();
    renderStatus();
    if (!panel.hidden) renderList();
  }

  function payload(): SavedInterval[] {
    return intervals.map((item) => {
      if (!item.boundsChanged || item.start === null) {
        return { start_ns: item.startNs, end_ns: item.endNs, reason: item.reason, source: item.source };
      }
      return {
        start_ns: frameNs(item.start),
        end_ns: item.end === null ? null : frameNs(item.end + 1),
        reason: item.reason,
        source: "replay",
      };
    });
  }

  async function doSave(): Promise<void> {
    if (!sessionId || !doc) return;
    const owner = sessionId;
    const versionAtStart = editVersion;
    const response = await fetch(`/api/recording/${encodeURIComponent(owner)}/quality_events`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revision: doc.revision, intervals: payload() }),
    });
    if (response.status === 409) {
      callbacks.notify("偏离区间已在别处修改，已重新加载", true);
      if (sessionId === owner) await load(owner);
      return;
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    const next = (await response.json()) as QualityDocument;
    if (sessionId !== owner) return;
    if (editVersion === versionAtStart) fromDocument(next);
    else if (doc) doc.revision = next.revision;
    render();
    callbacks.notify("偏离区间已保存");
  }

  function save(): void {
    saveChain = saveChain
      .then(() => doSave())
      .catch((error) => {
        callbacks.notify(`保存偏离区间失败: ${String(error)}`, true);
        if (sessionId) void load(sessionId);
      });
  }

  function changed(): void {
    intervals.sort((a, b) => (startKey(a) < startKey(b) ? -1 : startKey(a) > startKey(b) ? 1 : 0));
    editVersion += 1;
    render();
    save();
  }

  function toggleAt(frame: number): void {
    const inside = containing(frame);
    if (inside) {
      inside.end = frame;
      inside.boundsChanged = true;
      changed();
      return;
    }
    const next = editable().filter((item) => item.start! > frame).sort((a, b) => a.start! - b.start!)[0];
    intervals.push({
      start: frame, end: next ? next.start! - 1 : null, reason: null, source: "replay",
      startNs: "", endNs: null, boundsChanged: true,
    });
    changed();
  }

  function setStart(frame: number): void {
    const target = containing(frame) ?? editable().filter((item) => item.start! > frame).sort((a, b) => a.start! - b.start!)[0];
    if (!target) {
      callbacks.notify("后面没有偏离区间可改起点", true);
      return;
    }
    const previous = editable().filter((item) => item !== target && item.start! < target.start!).sort((a, b) => b.start! - a.start!)[0];
    if (previous && endOf(previous) >= frame) {
      callbacks.notify("起点不能落进前一段偏离", true);
      return;
    }
    if (frame > endOf(target)) {
      callbacks.notify("起点不能晚于终点", true);
      return;
    }
    target.start = frame;
    target.boundsChanged = true;
    changed();
  }

  function setEnd(frame: number): void {
    const target = containing(frame) ?? editable().filter((item) => endOf(item) < frame).sort((a, b) => b.start! - a.start!)[0];
    if (!target) {
      callbacks.notify("前面没有偏离区间可改终点", true);
      return;
    }
    const following = editable().filter((item) => item !== target && item.start! > target.start!).sort((a, b) => a.start! - b.start!)[0];
    if (following && following.start! <= frame) {
      callbacks.notify("终点不能落进后一段偏离", true);
      return;
    }
    if (frame < target.start!) {
      callbacks.notify("终点不能早于起点", true);
      return;
    }
    target.end = frame;
    target.boundsChanged = true;
    changed();
  }

  function removeAt(index: number): void {
    if (index < 0 || index >= intervals.length) return;
    intervals.splice(index, 1);
    changed();
  }

  async function load(nextSessionId: string): Promise<void> {
    sessionId = nextSessionId;
    doc = null;
    intervals = [];
    editVersion += 1;
    const versionAtLoad = editVersion;
    render();
    try {
      const response = await fetch(`/api/recording/${encodeURIComponent(nextSessionId)}/quality_events`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const next = (await response.json()) as QualityDocument;
      if (sessionId !== nextSessionId || editVersion !== versionAtLoad) return;
      fromDocument(next);
    } catch (error) {
      if (sessionId !== nextSessionId) return;
      callbacks.notify(`加载偏离区间失败: ${String(error)}`, true);
    }
    render();
  }

  function clear(): void {
    sessionId = null;
    doc = null;
    intervals = [];
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
  exportBtn.addEventListener("click", () => {
    const repoId = callbacks.getRepoId();
    if (!repoId) {
      callbacks.notify("请先选择一个已导出的 Episode", true);
      return;
    }
    const link = document.createElement("a");
    link.href = `/api/lerobot/quality_events?repo_id=${encodeURIComponent(repoId)}`;
    link.download = "episode_quality_events.json";
    link.click();
  });
  listEl.addEventListener("change", (event) => {
    const target = event.target as HTMLSelectElement;
    if (!target.matches(".quality-reason")) return;
    const item = intervals[Number(target.dataset.index)];
    if (!item) return;
    item.reason = target.value || null;
    editVersion += 1;
    save();
  });
  listEl.addEventListener("click", (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>(".quality-remove");
    if (target) removeAt(Number(target.dataset.index));
  });
  // D, [, ] and Delete are disjoint from video.ts (arrows, space) and annotation.ts (Q/R).
  document.addEventListener("keydown", (event) => {
    if (!active() || event.ctrlKey || event.metaKey || event.altKey) return;
    if ((event.target as HTMLElement | null)?.matches("input,select,textarea")) return;
    const frame = callbacks.getCurrentFrame();
    if (event.key === "d" || event.key === "D") {
      event.preventDefault();
      toggleAt(frame);
    } else if (event.key === "[") {
      event.preventDefault();
      setStart(frame);
    } else if (event.key === "]") {
      event.preventDefault();
      setEnd(frame);
    } else if (event.key === "Delete") {
      const inside = containing(frame);
      if (inside) {
        event.preventDefault();
        removeAt(intervals.indexOf(inside));
      }
    }
  });

  render();

  return {
    load: (nextSessionId) => {
      void load(nextSessionId);
    },
    clear,
    onFrameChange: () => {
      renderStatus();
    },
  };
}
