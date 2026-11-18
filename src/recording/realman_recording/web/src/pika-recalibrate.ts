import type { PikaSnapshot } from "./pika-view";

// One-click lighthouse recalibration: POST, then watch every side's pose state turn live.
const WATCH_MS = 60_000;
// The helper does not stream progress; these labels follow the usual timing (stop grace ≤ 15 s).
const STEPS: [number, string][] = [[0, "停止中…"], [15_000, "清除标定…"], [17_000, "启动中…"]];
const CONFIRM = "将重启 Pika 栈并清除基站标定；请把两个 Pika 静置在两个基站都能看到的位置。继续？";
const SIDE_NAMES: Record<string, string> = { l: "左", r: "右" };

type RecalibrateResult = { ok?: boolean; error?: string; backup?: string | null; output_tail?: string[] };

export function initPikaRecalibrate(button: HTMLButtonElement, line: HTMLElement) {
  let running = false;
  let watchUntil = 0;
  let backup: string | null = null;
  let timers: number[] = [];

  function show(text: string, tone: "info" | "ok" | "warn" = "info") {
    line.hidden = false;
    line.dataset.tone = tone;
    line.textContent = text;
  }

  function backupNote(): string {
    return backup ? `（旧标定已备份为 ${backup}）` : "";
  }

  async function run() {
    if (running || !window.confirm(CONFIRM)) return;
    running = true;
    button.disabled = true;
    watchUntil = 0;
    backup = null;
    timers = STEPS.map(([delay, text]) => window.setTimeout(() => show(text), delay));
    let status = 0;
    let result: RecalibrateResult = {};
    try {
      const response = await fetch("/api/pika/recalibrate", { method: "POST" });
      status = response.status;
      result = await response.json().catch(() => ({}));
    } catch (error) {
      result = { error: `请求失败：${String(error)}` };
    }
    timers.forEach((id) => window.clearTimeout(id));
    timers = [];
    running = false;
    button.disabled = false;
    if (status === 200 && result.ok) {
      backup = result.backup ?? null;
      watchUntil = Date.now() + WATCH_MS;
      show(`等待定位…${backupNote()}`);
    } else {
      const tail = result.output_tail?.length ? ` · ${result.output_tail.at(-1)}` : "";
      show(`重标定失败：${result.error ?? `HTTP ${status}`}${tail}`, "warn");
    }
  }

  function observe(snapshot: PikaSnapshot | undefined) {
    if (!watchUntil) return;
    const sides = snapshot?.sides ?? {};
    const names = Object.keys(sides);
    const notLive = names.filter((side) => sides[side].state !== "live");
    if (names.length && !notLive.length) {
      watchUntil = 0;
      show(`已重新定位${backupNote()}`, "ok");
    } else if (Date.now() > watchUntil) {
      watchUntil = 0;
      const which = notLive.map((side) => SIDE_NAMES[side] ?? side).join("、") || "无快照";
      show(`未重新定位（${which}）：请重新插拔两个 Pika 后再点一次重标定`, "warn");
    }
  }

  button.addEventListener("click", () => { void run(); });
  return {
    enable(on: boolean) { button.hidden = !on; },
    observe,
  };
}
