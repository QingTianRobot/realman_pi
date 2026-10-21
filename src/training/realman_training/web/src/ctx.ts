import type { Health } from "./api";

export interface Ctx {
  health: Health;
  query: URLSearchParams;
  navigate(page: string, query?: Record<string, string>): void;
  reload(): void;
  openDrawer(jobId?: string): void;
  refreshStatus(): void;
}

export type Page = (root: HTMLElement, ctx: Ctx) => Promise<void | (() => void)>;
