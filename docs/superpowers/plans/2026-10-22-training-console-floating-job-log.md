# Floating Job-Log Window Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the :8780 training console's bottom job-log drawer into a floating window that can be dragged, switched between two sizes, resized from its corner, and hidden behind a corner button, remembering all of it per browser.

**Architecture:** Keep `JobDrawer` (`drawer.ts`) and its job list / log socket / cancel logic; swap its shell. Position and size state lives in a new small module `job-window-state.ts` (load/save/fit, no DOM). `main.ts` mounts the corner button, feeds it the active-job count it already polls, and reopens the window on boot when it was open.

**Tech Stack:** TypeScript + Vite (no framework, `h()` helper from `dom.ts`), Pointer Events, `localStorage`, Playwright e2e (`npm run test:training`).

Spec: `docs/superpowers/specs/2026-10-22-training-console-floating-job-log-design.md`.

## Global Constraints

- Two sizes: small default 360×260 (job list only), large default 760×460 (list + log). Minimums: small 280×180, large 480×300. Max = viewport minus a 16px margin.
- Window always fully inside the viewport; re-clamped on viewport resize.
- `localStorage` key `training-console.job-log` holding `{x, y, size, dims: {small, large}, hidden}`; every read/write in try/catch; fallback = bottom-right, hidden, small.
- Narrow screens (`max-width: 719px`): no drag, no corner resize; docked full-width at the bottom (large 55vh, small 35vh).
- Polling (5 s) and the log WebSocket run only while the window is visible. The corner button's count comes from `main.ts`'s existing 15 s status refresh — no new polling.
- Keep the element ids the existing e2e uses: `#drawer`, `#drawer-jobs`, `#drawer-log`, `#drawer-job-head`, `#drawer-close`, `#jobs-button`.
- No new dependencies.

---

### Task 1: Floating window, size switch, corner button, memory

**Files:**
- Create: `src/training/realman_training/web/src/job-window-state.ts`
- Modify: `src/training/realman_training/web/src/drawer.ts` (whole file)
- Modify: `src/training/realman_training/web/src/main.ts` (mount + count + reopen)
- Modify: `src/training/realman_training/web/src/style.css` (drawer block, 860px block, drop `drawer-open` padding)
- Test: `website/tests/training-console/console.spec.ts`
- Rebuild: `src/training/realman_training/static/` via `npm run build:training`
- Docs: `website/docs/development/training-console-web.md`

**Interfaces:**
- Produces `job-window-state.ts`: `type JobWindowSize = "small" | "large"`, `interface JobWindowState { x: number | null; y: number | null; size: JobWindowSize; dims: Record<JobWindowSize, {w: number; h: number}>; hidden: boolean }`, `loadState(): JobWindowState`, `saveState(s): void`, `fit(s, viewW, viewH): {x, y, w, h}`.
- Produces on `JobDrawer`: `readonly fab: HTMLButtonElement`, `get wantsOpen(): boolean`, `setActive(count: number): void`; `open(jobId?)` switches to large when given a job.

- [ ] **Step 1: Write the failing e2e tests** — append to `console.spec.ts`:

```ts
test("the job log is a floating window that moves, switches size, hides and remembers", async ({ page }) => {
  await page.goto("/");
  const win = page.locator("#drawer");
  const fab = page.locator("#jobs-fab");
  await expect(win).toBeHidden();
  await expect(fab).toBeVisible();
  await fab.click();
  await expect(win).toBeVisible();
  await expect(fab).toBeHidden();
  await expect(win).toHaveAttribute("data-size", "small");
  await expect(page.locator("#drawer-log")).toBeHidden();
  await expect(page.locator("body")).not.toHaveClass(/drawer-open/);
  const start = (await win.boundingBox())!;
  expect(start.width).toBeLessThan(500);

  const drag = async (from: { x: number; y: number }, to: { x: number; y: number }) => {
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(to.x, to.y, { steps: 6 });
    await page.mouse.up();
  };
  const title = (await page.locator("#drawer-head h2").boundingBox())!;
  await drag({ x: title.x + 5, y: title.y + 5 }, { x: title.x - 300, y: title.y - 200 });
  const moved = (await win.boundingBox())!;
  expect(moved.x).toBeLessThan(start.x - 250);
  expect(moved.y).toBeLessThan(start.y - 150);
  const title2 = (await page.locator("#drawer-head h2").boundingBox())!;
  await drag({ x: title2.x + 5, y: title2.y + 5 }, { x: -400, y: -400 });
  const clamped = (await win.boundingBox())!;
  expect(clamped.x).toBeGreaterThanOrEqual(0);
  expect(clamped.y).toBeGreaterThanOrEqual(0);

  await page.locator("#drawer-size").click();
  await expect(win).toHaveAttribute("data-size", "large");
  await expect(page.locator("#drawer-log")).toBeVisible();
  const large = (await win.boundingBox())!;
  expect(large.width).toBeGreaterThan(700);
  const grip = (await page.locator("#drawer-grip").boundingBox())!;
  await drag({ x: grip.x + 8, y: grip.y + 8 }, { x: grip.x + 108, y: grip.y + 58 });
  const resized = (await win.boundingBox())!;
  expect(resized.width).toBeGreaterThan(large.width + 80);
  expect(resized.height).toBeGreaterThan(large.height + 30);

  await page.locator("#drawer-close").click();
  await expect(win).toBeHidden();
  await fab.click();
  expect(await win.boundingBox()).toEqual(resized);

  await page.reload();
  await expect(win).toBeVisible();
  await expect(win).toHaveAttribute("data-size", "large");
  expect(await win.boundingBox()).toEqual(resized);
  await page.keyboard.press("Escape");
  await expect(win).toBeHidden();
  await page.reload();
  await expect(fab).toBeVisible();
  await expect(win).toBeHidden();
});

test("the job log docks to the bottom on phones @mobile", async ({ page }) => {
  await page.goto("/");
  await page.locator("#jobs-fab").click();
  await page.locator("#drawer-size").click();
  const box = (await page.locator("#drawer").boundingBox())!;
  const view = page.viewportSize()!;
  expect(box.x).toBe(0);
  expect(Math.round(box.width)).toBe(view.width);
  expect(Math.round(box.y + box.height)).toBe(view.height);
  await expect(page.locator("#drawer-grip")).toBeHidden();
  await noHorizontalScroll(page);
});
```

And in the clean-flow test, right after `await expect(page.locator("#drawer")).toBeVisible();` (the one before `fake clean done`), add:

```ts
  await expect(page.locator("#drawer")).toHaveAttribute("data-size", "large");
```

- [ ] **Step 2: Run them, expect failure** (`#jobs-fab` does not exist)

Run (from `website/`): `PLAYWRIGHT_CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" REALMAN_TRAINING_PYTHON=<venv python> npx playwright test --config ../config/training/playwright.config.mjs -g "job log"`
Expected: FAIL, `#jobs-fab` not found.

- [ ] **Step 3: Create `job-window-state.ts`**

```ts
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
```

- [ ] **Step 4: Rewrite `drawer.ts`**

```ts
import { api, logSocket, type JobRow } from "./api";
import { errorText, fmtTime, h, isActive } from "./dom";
import { fit, loadState, saveState, type JobWindowSize } from "./job-window-state";
import { jobChip, jobLabel } from "./widgets";

const MAX_LOG_CHARS = 400_000;
// Phones get a bottom sheet instead of a free window (no drag, no corner resize); matches the CSS breakpoint.
const NARROW = window.matchMedia("(max-width: 719px)");

/** The job log: a floating window (drag the title bar, switch small/large, resize from the corner) that hides
 * behind a corner button. Where it sits, its sizes and whether it is open are remembered per browser. */
export class JobDrawer {
  readonly el: HTMLElement;
  readonly fab: HTMLButtonElement;
  private readonly jobs: HTMLElement;
  private readonly log: HTMLPreElement;
  private readonly head: HTMLElement;
  private readonly cancelButton: HTMLButtonElement;
  private readonly sizeButton: HTMLButtonElement;
  private readonly count: HTMLElement;
  private readonly fabCount: HTMLElement;
  private readonly state = loadState();
  private socket: WebSocket | null = null;
  private selected: string | null = null;
  private timer = 0;

  constructor(private readonly readOnly: () => boolean) {
    this.jobs = h("div", { class: "drawer-jobs", id: "drawer-jobs" });
    this.log = h("pre", { class: "log", id: "drawer-log" });
    this.head = h("div", { class: "drawer-job-head", id: "drawer-job-head" });
    this.cancelButton = h("button", { class: "button danger", id: "drawer-cancel", type: "button", hidden: true }, "取消任务");
    this.cancelButton.addEventListener("click", () => void this.cancel());
    this.sizeButton = h("button", { class: "button ghost", id: "drawer-size", type: "button" });
    this.sizeButton.addEventListener("click", () => this.setSize(this.state.size === "small" ? "large" : "small"));
    const close = h("button", { class: "button ghost", id: "drawer-close", type: "button", title: "隐藏任务日志（Esc）" }, "隐藏");
    close.addEventListener("click", () => this.close());
    this.count = h("span", { class: "chip run", id: "drawer-count", hidden: true });
    const title = h("div", { class: "drawer-head", id: "drawer-head" },
      h("div", { class: "drawer-title" }, h("h2", {}, "任务日志"), this.count), this.cancelButton, this.sizeButton, close);
    const grip = h("div", { class: "drawer-grip", id: "drawer-grip", title: "拖动调整大小", "aria-hidden": "true" });
    this.el = h("aside", { class: "drawer", id: "drawer", role: "dialog", "aria-modal": "false", "aria-label": "任务日志", hidden: true },
      title, h("div", { class: "drawer-body" }, this.jobs, h("div", { class: "drawer-log" }, this.head, this.log)), grip);
    this.fabCount = h("span", { class: "jobs-fab-count", id: "jobs-fab-count", hidden: true });
    this.fab = h("button", { class: "jobs-fab", id: "jobs-fab", type: "button", title: "打开任务日志", "aria-label": "打开任务日志" },
      "任务日志", this.fabCount);
    this.fab.addEventListener("click", () => void this.open());

    this.drag(title, (dx, dy, start) => {
      this.state.x = start.left + dx;
      this.state.y = start.top + dy;
      const box = this.place();
      if (box) [this.state.x, this.state.y] = [box.x, box.y];
    });
    this.drag(grip, (dx, dy, start) => {
      this.state.dims[this.state.size] = { w: start.width + dx, h: start.height + dy };
      const box = this.place();
      if (box) this.state.dims[this.state.size] = { w: box.w, h: box.h };
    });
    window.addEventListener("resize", () => void this.place());
    NARROW.addEventListener("change", () => void this.place());
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.isOpen && !document.querySelector("dialog[open]")) this.close();
    });
    this.showSize();
  }

  get isOpen(): boolean {
    return !this.el.hidden;
  }

  /** It was open when the page was last left. */
  get wantsOpen(): boolean {
    return !this.state.hidden;
  }

  /** Active-job count on the title bar and the corner button. */
  setActive(count: number): void {
    this.count.hidden = this.fabCount.hidden = !count;
    this.count.textContent = `${count} 进行中`;
    this.fabCount.textContent = String(count);
    this.fab.classList.toggle("busy", count > 0);
  }

  async open(jobId?: string): Promise<void> {
    if (jobId && this.state.size === "small") this.setSize("large");
    this.el.hidden = false;
    this.fab.hidden = true;
    this.state.hidden = false;
    saveState(this.state);
    this.place();
    await this.refresh(jobId);
    window.clearInterval(this.timer);
    this.timer = window.setInterval(() => void this.refresh(), 5000);
  }

  close(): void {
    this.el.hidden = true;
    this.fab.hidden = false;
    this.state.hidden = true;
    saveState(this.state);
    window.clearInterval(this.timer);
    this.socket?.close();
    this.socket = null;
    this.selected = null;
  }

  private setSize(size: JobWindowSize): void {
    this.state.size = size;
    this.showSize();
    this.place();
    saveState(this.state);
  }

  private showSize(): void {
    this.el.dataset.size = this.state.size;
    const small = this.state.size === "small";
    this.sizeButton.textContent = small ? "放大" : "缩小";
    this.sizeButton.title = small ? "显示日志" : "只看任务列表";
  }

  /** Apply the remembered box (clamped to the viewport); phones dock it with CSS instead. */
  private place(): { x: number; y: number; w: number; h: number } | null {
    if (NARROW.matches) {
      for (const property of ["left", "top", "width", "height"]) this.el.style.removeProperty(property);
      return null;
    }
    const box = fit(this.state, window.innerWidth, window.innerHeight);
    Object.assign(this.el.style, { left: `${box.x}px`, top: `${box.y}px`, width: `${box.w}px`, height: `${box.h}px` });
    return box;
  }

  /** Pointer drag on a handle: move(dx, dy, boxAtStart) on every move, remember the result on release. */
  private drag(handle: HTMLElement, move: (dx: number, dy: number, start: DOMRect) => void): void {
    handle.addEventListener("pointerdown", (event) => {
      if (NARROW.matches || event.button !== 0 || (event.target as Element).closest("button")) return;
      event.preventDefault();
      const start = this.el.getBoundingClientRect();
      const [x0, y0] = [event.clientX, event.clientY];
      handle.setPointerCapture(event.pointerId);
      this.el.classList.add("moving");
      const onMove = (e: PointerEvent) => move(e.clientX - x0, e.clientY - y0, start);
      const onUp = () => {
        handle.removeEventListener("pointermove", onMove);
        handle.removeEventListener("pointerup", onUp);
        handle.removeEventListener("pointercancel", onUp);
        this.el.classList.remove("moving");
        saveState(this.state);
      };
      handle.addEventListener("pointermove", onMove);
      handle.addEventListener("pointerup", onUp);
      handle.addEventListener("pointercancel", onUp);
    });
  }

  private async refresh(select?: string): Promise<void> {
    let rows: JobRow[];
    try {
      rows = (await api.jobs(30)).jobs;
    } catch (error) {
      this.jobs.replaceChildren(h("p", { class: "error" }, errorText(error)));
      return;
    }
    this.setActive(rows.filter((job) => isActive(job.state)).length);
    const current = select ?? this.selected;
    this.jobs.replaceChildren(...rows.map((job) => {
      const button = h("button", { class: `item${job.id === current ? " selected" : ""}`, type: "button", "data-job": job.id },
        h("strong", {}, jobLabel(job), " ", jobChip(job)),
        h("small", {}, fmtTime(job.created), job.progress?.text ? ` · ${job.progress.text}` : "", job.error ? ` · ${job.error}` : ""));
      button.addEventListener("click", () => {
        if (this.state.size === "small") this.setSize("large");
        this.select(job);
      });
      return button;
    }));
    if (!rows.length) this.jobs.append(h("p", { class: "muted" }, "还没有任务"));
    const target = select ? rows.find((job) => job.id === select)
      : !this.selected ? rows.find((job) => isActive(job.state)) ?? rows[0] : undefined;
    if (target) this.select(target);
  }
```

The rest of the class (`select`, `append`, `showHead`, `cancel`) stays exactly as it is today.

- [ ] **Step 5: Wire it in `main.ts`**

Replace `page, drawer.el);` with `page, drawer.el, drawer.fab);`. In `refreshStatus`, after `jobsButton.textContent = ...` add `drawer.setActive(active);`. After `await route();` add `if (drawer.wantsOpen) void drawer.open();`.

- [ ] **Step 6: CSS** — in `style.css` replace the eight `.drawer…` lines with:

```css
.drawer { position: fixed; z-index: 30; display: grid; grid-template-rows: auto minmax(0, 1fr); overflow: hidden; border: 1px solid var(--line-strong); border-radius: var(--radius-card); background: var(--card-bg); box-shadow: var(--shadow-card-hover); }
.drawer.moving { user-select: none; }
.drawer-head { display: flex; align-items: center; gap: 8px; padding: 8px 10px 8px 14px; border-bottom: 1px solid var(--line); cursor: move; touch-action: none; user-select: none; }
.drawer-title { display: flex; align-items: center; gap: 8px; min-width: 0; margin-right: auto; }
.drawer-title h2 { margin: 0; font-size: 14px; white-space: nowrap; }
.drawer-head .button { cursor: pointer; }
.drawer-body { display: grid; grid-template-columns: minmax(200px, 260px) minmax(0, 1fr); min-height: 0; }
.drawer-jobs { display: grid; align-content: start; gap: 6px; min-width: 0; padding: 8px; overflow-y: auto; border-right: 1px solid var(--line); }
.drawer-log { display: grid; grid-template-rows: auto minmax(0, 1fr); gap: 6px; min-width: 0; min-height: 0; padding: 8px 12px 14px; }
.drawer-job-head { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: 12px; }
.drawer-log pre { height: 100%; }
.drawer[data-size="small"] .drawer-body { grid-template-columns: minmax(0, 1fr); }
.drawer[data-size="small"] .drawer-jobs { border-right: 0; }
.drawer[data-size="small"] .drawer-log { display: none; }
.drawer-grip { position: absolute; right: 2px; bottom: 2px; width: 14px; height: 14px; cursor: nwse-resize; touch-action: none; background: linear-gradient(135deg, transparent 0 50%, var(--line-strong) 50% 58%, transparent 58% 70%, var(--line-strong) 70% 78%, transparent 78%); }
.jobs-fab { position: fixed; right: 16px; bottom: 16px; z-index: 30; display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 16px; border: 1px solid var(--line-strong); border-radius: 999px; background: var(--card-bg); color: var(--text); font: inherit; font-size: 13px; font-weight: 700; box-shadow: var(--shadow-card-hover); cursor: pointer; }
.jobs-fab:hover { border-color: var(--primary); }
.jobs-fab-count { min-width: 20px; padding: 1px 6px; border-radius: 999px; background: var(--primary); color: #fff; font-size: 11px; text-align: center; }
.jobs-fab.busy { animation: jobs-fab-pulse 1.8s ease-in-out infinite; }
@keyframes jobs-fab-pulse { 0%, 100% { box-shadow: var(--shadow-card-hover), 0 0 0 0 var(--primary); } 60% { box-shadow: var(--shadow-card-hover), 0 0 0 7px transparent; } }
@media (prefers-reduced-motion: reduce) { .jobs-fab.busy { animation: none; } }
```

In the `@media (max-width: 860px)` block keep the two `.drawer-body` / `.drawer-jobs` lines but scope them to large: `.drawer[data-size="large"] .drawer-body …`, `.drawer[data-size="large"] .drawer-jobs …`. Add a new block after the 560px block:

```css
@media (max-width: 719px) {
  .drawer { left: 0; right: 0; bottom: 0; height: 55vh; border-width: 1px 0 0; border-radius: 14px 14px 0 0; }
  .drawer[data-size="small"] { height: 35vh; }
  .drawer-head { cursor: default; }
  .drawer-grip { display: none; }
}
```

Delete the two `body.drawer-open` / `html:has(body.drawer-open)` lines.

- [ ] **Step 7: Build, run the whole training e2e (desktop + mobile), expect PASS**

Run (from `website/`): `npm run build:training` then the Step 2 command without `-g`.
Expected: all tests pass (existing drawer tests unchanged: clicking a job in the small window switches to large).

- [ ] **Step 8: Screenshots** at 1440×900 (small, large, hidden+fab) and at Pixel 7 width; check light/dark.

- [ ] **Step 9: Docs** — in `website/docs/development/training-console-web.md` replace "任务日志在顶栏"任务"打开的底部抽屉里实时显示。" with "任务日志在一个浮动小窗里实时显示：拖标题栏移动，"放大/缩小"在任务列表和列表+日志两档间切换，右下角可拖动调整大小，"隐藏"或 Esc 收成右下角的"任务日志"按钮（进行中的任务数显示在按钮上）；位置、大小和是否打开记在本浏览器里。手机上它固定在底部。"

- [ ] **Step 10: Commit**

```bash
git add src/training/realman_training/web/src website/tests/training-console/console.spec.ts src/training/realman_training/realman_training/static website/docs/development/training-console-web.md docs/superpowers/plans/2026-10-22-training-console-floating-job-log.md
git commit -m "feat(training): floating job-log window with sizes, corner resize and a hide button"
```

### Task 2: Deploy to :8780 (after the user OKs it)

Same flow as the 10-22 redeploys: git bundle of the new commits → fetch + ff in `~/organization/realman_pi-console` (branch `deploy/training-console-20261022`) → rebuild/up the `realman_training` service with `-p realman-training --env-file .env --env-file ~/.config/realman-training/console.env --profile training` → read-only check that `/` serves the new bundle and `/api/health` is ok.
