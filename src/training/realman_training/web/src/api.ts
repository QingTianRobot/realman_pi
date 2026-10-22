// The Plan 4 API (docs/superpowers/plans/2026-10-21-training-console-4-web-api-container.md, "API contract").
export type JobState = "starting" | "running" | "succeeded" | "failed" | "cancelled" | "interrupted";
export interface Progress { done: number; total: number | null; text: string; at: string }
export interface JobRow {
  id: string; kind: string; state: JobState; created?: string | null; started?: string | null; ended?: string | null;
  error?: string | null; progress?: Progress | null; params: Record<string, any>; result?: any;
}
export interface Health { ok: boolean; read_only: boolean; data_root: string; console_dir: string; time: string }
export interface QualityCounts { ok: number; suggest_drop: number; warn: number }
export interface DatasetRow {
  path: string; name: string; kind: "raw" | "clean" | "view" | "error"; episodes?: number; frames?: number;
  duration_sec?: number; fps?: number; first_file_time?: string | null; last_file_time?: string | null;
  disk_bytes?: number; tasks?: Record<string, number>; source?: string | null; removed_episodes?: number | null;
  prompts?: Record<string, string>; quality_counts?: QualityCounts | null; error?: string;
}
export interface Finding { code: string; severity: "drop" | "warn"; message: string }
export interface EpisodeQuality { episode: number; task: string; frames: number; verdict: "ok" | "suggest_drop" | "warn"; findings: Finding[] }
export interface Camera { key: string; codec: string | null; height: number | null; width: number | null }
export interface Summary {
  path: string; name: string; kind: string; codebase_version: string; robot_type: string; fps: number; episodes: number;
  frames: number; duration_sec: number; tasks: Record<string, number>; task_frames: Record<string, number>;
  features: Record<string, { dtype: string; shape: number[] }>; cameras: Camera[]; disk_bytes: number;
  first_file_time: string | null; last_file_time: string | null; source: string | null; removed_episodes: number | null;
  prompts: Record<string, string>;
}
export interface DatasetDetail {
  path: string; built: string; summary: Summary; quality: EpisodeQuality[] | null; quality_unavailable: string | null;
  suggested_drops: number[]; quality_counts: QualityCounts | null; traces: Record<string, number[]>;
}
export interface EvalLatest { step: number; tasks: Record<string, number> }
export interface RunRow {
  name: string; config: string; exp: string; checkpoints: number[]; view: string | null; gpus: number[] | null;
  batch_size: number | null; num_train_steps: number | null; last_step: number | null; started: string | null;
  ended: string | null; exit_code: number | null; registered: boolean; status: string | null; last_loss: number | null;
  eval_latest: EvalLatest | null; pace: Pace | null;
}
/** steps/s; while a run trains also the time left and the finish time (from the log's last tqdm line). */
export interface Pace {
  source: "tqdm" | "average"; rate: number | null; remaining_sec: number | null; eta: string | null;
  updated: string | null; stale: boolean;
}
export interface RunDetail extends RunRow {
  record: Record<string, any> | null; metrics: Record<string, (number | null)[]>;
  eval: Record<string, Record<string, any>> | null; card: Record<string, any> | null; card_markdown: string | null;
  job: JobRow | null;
}
export interface ModelRow {
  name: string; config: string; exp: string; method: string | null; trained_start: string | null; trained_end: string | null;
  dataset: string | null; dataset_dir: string | null; tasks: Record<string, { prompt?: string; episodes?: number }>;
  episodes: number | null; holdout_episodes: number[]; checkpoints: number[];
  open_loop: { step: number; tasks: Record<string, number>; zero_baseline: Record<string, number> } | null;
  status: string | null; serving: boolean;
}
export interface GpuUser { pid: number; who: string; container: string | null; user: string | null; command: string | null; used_mib: number | null }
export interface Gpu { index: number; name: string; used_mib: number | null; total_mib: number | null; util_pct: number | null; busy: boolean; users: GpuUser[] }
export interface Gpus { available: boolean; busy_mib: number; gpus: Gpu[]; error?: string; at?: string }
export interface ServeStatus {
  serve?: Record<string, any>; gpu?: Record<string, any>; bridge?: Record<string, any>; bt_mode?: Record<string, any> | null;
  record?: Record<string, any>; error?: string; at: string; job: JobRow | null;
}
export interface Settings { model: string; checkpoint: string; gpu: number; port: number; task: string | null }
export interface ServeModel { name: string; checkpoints: number[]; prompts: Record<string, string> }
export interface SettingsPayload { defaults: Settings; saved: Partial<Settings>; effective: Settings; models: ServeModel[] }
export interface Check { item: string; name: string; ok: boolean; value: string; threshold: string; detail: string }
export interface LinkRun { at: string; ok: boolean; checks: Check[] }
export interface LinkcheckPayload { latest: LinkRun | null; history: LinkRun[]; job: JobRow | null }
export interface Options {
  prompts: Record<string, string>; arms: string[]; default_arm: string; views: string[]; sources: string[];
  configs: string[]; linkcheck_items: string[]; read_only: boolean;
}

const TOKEN_KEY = "realman-training-token";

export function getToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function setToken(value: string): void {
  try {
    if (value) sessionStorage.setItem(TOKEN_KEY, value);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // private mode: the token lives for this page only
  }
  window.dispatchEvent(new Event("token-changed"));
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token && method !== "GET") headers["X-Training-Token"] = token;
  const response = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!response.ok) throw new ApiError(response.status, data?.error || text || response.statusText);
  return data as T;
}

const q = encodeURIComponent;

export const api = {
  health: () => request<Health>("GET", "/api/health"),
  datasets: () => request<{ root: string; datasets: DatasetRow[] }>("GET", "/api/datasets"),
  dataset: (path: string) => request<DatasetDetail>("GET", `/api/dataset?path=${q(path)}`),
  jobs: (limit = 30, kind?: string) =>
    request<{ jobs: JobRow[] }>("GET", `/api/jobs?limit=${limit}${kind ? `&kind=${q(kind)}` : ""}`),
  job: (id: string) => request<{ job: JobRow; log: string }>("GET", `/api/jobs/${q(id)}`),
  startJob: (kind: string, params: Record<string, unknown>) =>
    request<{ job: JobRow }>("POST", "/api/jobs", { kind, params, confirm: true }),
  cancelJob: (id: string) => request<{ cancelled: boolean }>("POST", `/api/jobs/${q(id)}/cancel`, {}),
  runs: () => request<{ runs: RunRow[] }>("GET", "/api/runs"),
  run: (config: string, exp: string) => request<RunDetail>("GET", `/api/runs/${q(config)}/${q(exp)}`),
  models: () => request<{ models: ModelRow[]; registry_markdown: string | null }>("GET", "/api/models"),
  gpus: () => request<Gpus>("GET", "/api/gpus"),
  serve: (refresh = false) => request<ServeStatus>("GET", `/api/serve${refresh ? "?refresh=1" : ""}`),
  settings: () => request<SettingsPayload>("GET", "/api/serve/settings"),
  saveSettings: (settings: Partial<Settings>) => request<SettingsPayload>("PUT", "/api/serve/settings", settings),
  linkcheck: () => request<LinkcheckPayload>("GET", "/api/linkcheck"),
  options: () => request<Options>("GET", "/api/options"),
};

export function logSocket(id: string): WebSocket {
  const scheme = location.protocol === "https:" ? "wss" : "ws";
  return new WebSocket(`${scheme}://${location.host}/api/jobs/${q(id)}/log`);
}
