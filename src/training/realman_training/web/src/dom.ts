import type { JobState } from "./api";

export type Child = Node | string | number | null | undefined | false;
type Attrs = Record<string, unknown>;

function apply(el: Element, attrs: Attrs): void {
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === "class") el.setAttribute("class", String(value));
    else if (key.startsWith("on") && typeof value === "function") el.addEventListener(key.slice(2), value as EventListener);
    else if (key === "value" && "value" in el) (el as HTMLInputElement).value = String(value);
    else if ((key === "checked" || key === "disabled" || key === "hidden" || key === "selected") && key in el) (el as any)[key] = Boolean(value);
    else el.setAttribute(key, value === true ? "" : String(value));
  }
}

function append(el: Element, children: (Child | Child[])[]): void {
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child instanceof Node ? child : String(child));
  }
}

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs = {}, ...children: (Child | Child[])[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  apply(el, attrs);
  append(el, children);
  return el;
}

export function svg<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Attrs = {}, ...children: (Child | Child[])[]): SVGElementTagNameMap[K] {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  apply(el, attrs);
  append(el, children);
  return el;
}

export const KIND_LABEL: Record<string, string> = {
  pull: "拉取", clean: "清洗", view: "训练视图", norm: "Norm", train: "训练", eval: "评估", register: "登记",
  serve: "推理服务", linkcheck: "链路检测",
};
export const STATE_LABEL: Record<JobState, string> = {
  starting: "启动中", running: "运行中", succeeded: "成功", failed: "失败", cancelled: "已取消", interrupted: "中断",
};
export const DATASET_KIND: Record<string, string> = { raw: "原始", clean: "清洗版", view: "训练视图", error: "错误" };

export function isActive(state: JobState): boolean {
  return state === "starting" || state === "running";
}

export function stateClass(state: JobState): string {
  if (state === "succeeded") return "ok";
  if (state === "failed" || state === "interrupted") return "bad";
  if (state === "cancelled") return "warn";
  return "run";
}

export function fmtBytes(n: number | null | undefined): string {
  if (n === null || n === undefined) return "–";
  const units: [string, number][] = [["TB", 2 ** 40], ["GB", 2 ** 30], ["MB", 2 ** 20], ["KB", 2 ** 10]];
  for (const [unit, scale] of units) if (n >= scale) return `${(n / scale).toFixed(1)} ${unit}`;
  return `${n} B`;
}

export function fmtCount(n: number | null | undefined): string {
  if (n === null || n === undefined) return "–";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function fmtDuration(sec: number | null | undefined): string {
  if (sec === null || sec === undefined) return "–";
  if (sec < 120) return `${Math.round(sec)} s`;
  if (sec < 7200) return `${Math.round(sec / 60)} min`;
  return `${(sec / 3600).toFixed(1)} h`;
}

function parts(iso: string | null | undefined): string[] | null {
  const match = iso ? /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso) : null;
  return match ? match.slice(1) : null;
}

export function fmtTime(iso: string | null | undefined): string {
  const p = parts(iso);
  return p ? `${p[1]}-${p[2]} ${p[3]}:${p[4]}` : "–";
}

export function fmtDay(iso: string | null | undefined): string {
  const p = parts(iso);
  return p ? `${p[1]}-${p[2]}` : "–";
}

/** Episode ranges come as [first, last] pairs from model cards. */
export function fmtEpisodes(value: unknown): string {
  if (Array.isArray(value) && value.length === 2) return `${value[0]}–${value[1]}`;
  if (Array.isArray(value)) return value.join(", ");
  return value === null || value === undefined ? "–" : String(value);
}

export function fmtMae(n: number | null | undefined): string {
  return n === null || n === undefined ? "–" : n.toFixed(3);
}

export function fmtMiB(n: number | null | undefined): string {
  return n === null || n === undefined ? "–" : `${(n / 1024).toFixed(1)} GiB`;
}

export function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
