// Live deviation marking while the recorder records a policy attempt (偏离打点). Marks go to the
// recorder as realman_recording_msgs/QualityMark through the quality_mark WebSocket command; the
// deviating state shown here is the recorder's own, from /recording/status.
//
//   D      normal: start a deviation; deviating: recover
//   1..9   normal: start a deviation with that reason; deviating: set the reason
// Keys do nothing while typing in a field, while keyboard teleoperation is active, while the page
// cannot write, or while the strip is hidden. Every key has a button.

export type QualityReason = { id: string; label: string };
export type RecordingView = {
  state: string;
  session_id: string;
  elapsed_sec: number;
  profile: string;
  attempt_id: string;
  deviating: boolean;
  deviation_start_ns: string;
  reason: string;
  rejected_marks: number;
  dropped_marks: number;
  last_error: string;
};
type MarkKind = "deviate_start" | "recover" | "reason";
type SentMark = { kind: MarkKind; reason: string; at: Date };

export type QualityStripCallbacks = {
  send(message: { type: string } & Record<string, unknown>): void;
  canWrite(): boolean;
  keyboardActive(): boolean;
};

export type QualityStripApi = {
  setReasons(reasons: QualityReason[]): void;
  setRecording(view: RecordingView | null): void;
  setPolicyRunning(running: boolean): void;
  onResult(message: Record<string, unknown>): void;
  onError(message: Record<string, unknown>): boolean;
};

// Only sessions the recorder opened for a policy attempt get the strip.
const POLICY_PROFILE = "policy_rollout";
const KIND_TEXT: Record<MarkKind, string> = { deviate_start: "开始偏离", recover: "恢复正常", reason: "原因" };

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

export function initQualityStrip(callbacks: QualityStripCallbacks): QualityStripApi {
  const strip = document.querySelector<HTMLElement>("#quality-strip")!;
  const warning = document.querySelector<HTMLElement>("#quality-warning")!;
  const live = document.querySelector<HTMLElement>("#quality-live")!;
  const recordingEl = document.querySelector<HTMLElement>("#quality-recording")!;
  const stateEl = document.querySelector<HTMLElement>("#quality-state")!;
  const toggle = document.querySelector<HTMLButtonElement>("#quality-toggle")!;
  const reasonsEl = document.querySelector<HTMLElement>("#quality-reasons")!;
  const messageEl = document.querySelector<HTMLElement>("#quality-message")!;
  const marksEl = document.querySelector<HTMLOListElement>("#quality-marks")!;

  let reasons: QualityReason[] = [];
  let view: RecordingView | null = null;
  let viewAt = 0;
  let policyRunning = false;
  let attemptId = "";
  let marks: SentMark[] = [];
  let requestCounter = 0;
  const pending = new Map<string, SentMark>();

  function recording(): boolean {
    return view?.state === "RECORDING" && view.profile === POLICY_PROFILE;
  }

  function renderClock(): void {
    if (!view) return;
    const elapsed = view.elapsed_sec + (performance.now() - viewAt) / 1000;
    recordingEl.textContent = `录制中 · ${view.attempt_id || view.session_id} · ${elapsed.toFixed(0)} s`;
    let deviation = "";
    if (view.deviating && view.deviation_start_ns) {
      const nowNs = BigInt(Date.now()) * BigInt(1000000);
      deviation = ` ${Math.max(0, Number(nowNs - BigInt(view.deviation_start_ns)) / 1e9).toFixed(0)}s`;
    }
    stateEl.textContent = view.deviating ? `偏离中${deviation}` : "正常";
  }

  function render(): void {
    const showLive = recording();
    const showWarning = policyRunning && !showLive;
    strip.hidden = !(showLive || showWarning);
    live.hidden = !showLive;
    warning.hidden = !showWarning;
    warning.textContent = showWarning
      ? `本次尝试未录制${view?.last_error ? `：${view.last_error}` : "（录制服务没有在录）"}`
      : "";
    if (!showLive || !view) return;
    const writable = callbacks.canWrite();
    renderClock();
    stateEl.classList.toggle("deviating", view.deviating);
    toggle.textContent = view.deviating ? "恢复正常 (D)" : "开始偏离 (D)";
    toggle.disabled = !writable;
    reasonsEl.innerHTML = reasons.map((reason, index) =>
      `<button type="button" class="quality-reason${view!.reason === reason.id ? " active" : ""}" data-index="${index}"${writable ? "" : " disabled"} title="快捷键 ${index + 1}">${index + 1} ${escapeHtml(reason.label)}</button>`).join("");
    marksEl.innerHTML = marks.map((mark) => {
      const label = reasons.find((reason) => reason.id === mark.reason)?.label;
      return `<li>${mark.at.toLocaleTimeString()} ${KIND_TEXT[mark.kind]}${label ? ` · ${escapeHtml(label)}` : ""}</li>`;
    }).join("");
  }

  function send(kind: MarkKind, reason: string): void {
    if (!recording() || !callbacks.canWrite()) return;
    const requestId = `quality-${++requestCounter}`;
    pending.set(requestId, { kind, reason, at: new Date() });
    callbacks.send({ type: "quality_mark", request_id: requestId, kind, reason });
  }

  function toggleDeviation(): void {
    send(view?.deviating ? "recover" : "deviate_start", "");
  }

  function chooseReason(index: number): void {
    const reason = reasons[index];
    if (reason) send(view?.deviating ? "reason" : "deviate_start", reason.id);
  }

  toggle.addEventListener("click", toggleDeviation);
  reasonsEl.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-index]");
    if (button) chooseReason(Number(button.dataset.index));
  });
  window.addEventListener("keydown", (event) => {
    if (!recording() || event.repeat || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey || event.isComposing) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest("input, textarea, select") || target?.isContentEditable) return;
    if (callbacks.keyboardActive() || !callbacks.canWrite()) return;
    if (event.code === "KeyD") {
      event.preventDefault();
      toggleDeviation();
      return;
    }
    const digit = /^Digit([1-9])$/.exec(event.code);
    if (digit) {
      event.preventDefault();
      chooseReason(Number(digit[1]) - 1);
    }
  });
  window.setInterval(() => {
    if (recording()) renderClock();
  }, 500);

  return {
    setReasons(next) {
      reasons = next.slice(0, 9);
      render();
    },
    setRecording(next) {
      view = next;
      viewAt = performance.now();
      const nextAttempt = next?.attempt_id ?? "";
      if (nextAttempt !== attemptId) {
        attemptId = nextAttempt;
        marks = [];
        messageEl.textContent = "";
      }
      render();
    },
    setPolicyRunning(running) {
      policyRunning = running;
      render();
    },
    onResult(message) {
      const requestId = String(message.request_id ?? "");
      const sent = pending.get(requestId);
      if (!sent) return;
      pending.delete(requestId);
      marks = [sent, ...marks].slice(0, 5);
      messageEl.textContent = "";
      render();
    },
    onError(message) {
      const requestId = String(message.request_id ?? "");
      if (!pending.has(requestId)) return false;
      pending.delete(requestId);
      messageEl.textContent = `打点失败：${String(message.message ?? message.code ?? "未知错误")}`;
      return true;
    },
  };
}
