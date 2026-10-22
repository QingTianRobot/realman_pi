// Where the floating job-log window sits and how big it is, remembered per browser. Storage can be missing or throw
// (private window, blocked site data), so every read and write falls back to the defaults.
export type JobWindowSize = "small" | "large";
export interface Dims { w: number; h: number }
export interface JobWindowState { x: number | null; y: number | null; size: JobWindowSize; dims: Record<JobWindowSize, Dims>; hidden: boolean }

export const STORAGE_KEY = "training-console.job-log";
export const MARGIN = 16;
const DEFAULT_DIMS: Record<JobWindowSize, Dims> = { small: { w: 360, h: 260 }, large: { w: 760, h: 460 } };
const MIN_DIMS: Record<JobWindowSize, Dims> = { small: { w: 280, h: 180 }, large: { w: 480, h: 300 } };

function dims(value: unknown, fallback: Dims): Dims {
  const v = value as Partial<Dims> | null | undefined;
  return Number.isFinite(v?.w) && Number.isFinite(v?.h) ? { w: Number(v!.w), h: Number(v!.h) } : { ...fallback };
}

export function loadState(): JobWindowState {
  let raw: any = null;
  try {
    raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    raw = null;
  }
  const data = raw && typeof raw === "object" ? raw : {};
  return {
    x: Number.isFinite(data.x) ? data.x : null,
    y: Number.isFinite(data.y) ? data.y : null,
    size: data.size === "large" ? "large" : "small",
    dims: { small: dims(data.dims?.small, DEFAULT_DIMS.small), large: dims(data.dims?.large, DEFAULT_DIMS.large) },
    hidden: data.hidden !== false,
  };
}

export function saveState(state: JobWindowState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Not remembered this time; the window still works.
  }
}

/** The window's box for this viewport: the current size's dims within [min, viewport - margins], kept fully on
 * screen; no position yet = the bottom-right corner. */
export function fit(state: JobWindowState, viewW: number, viewH: number): { x: number; y: number; w: number; h: number } {
  const want = state.dims[state.size];
  const min = MIN_DIMS[state.size];
  const w = Math.max(0, Math.min(Math.max(want.w, min.w), viewW - 2 * MARGIN));
  const h = Math.max(0, Math.min(Math.max(want.h, min.h), viewH - 2 * MARGIN));
  const x = Math.min(Math.max(state.x ?? viewW - w - MARGIN, 0), viewW - w);
  const y = Math.min(Math.max(state.y ?? viewH - h - MARGIN, 0), viewH - h);
  return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
}
