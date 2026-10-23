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

  private select(job: JobRow): void {
    if (this.selected === job.id && this.socket !== null) return;
    this.selected = job.id;
    this.socket?.close();
    this.log.textContent = "";
    this.showHead(job);
    for (const item of this.jobs.querySelectorAll<HTMLElement>(".item")) item.classList.toggle("selected", item.dataset.job === job.id);
    const socket = logSocket(job.id);
    this.socket = socket;
    let wasActive = false;
    socket.addEventListener("message", (event) => {
      if (this.socket !== socket) return;
      const data = JSON.parse(String(event.data));
      if (data.type === "lines") this.append(data.lines);
      if (data.type === "status") {
        const row = data.job as JobRow;
        this.showHead(row);
        if (isActive(row.state)) wasActive = true;
        else if (wasActive) {
          wasActive = false;
          window.dispatchEvent(new CustomEvent("job-ended", { detail: row }));
        }
      }
    });
    socket.addEventListener("close", () => {
      if (this.socket === socket) this.socket = null;
    });
  }

  private append(lines: string[]): void {
    const atBottom = this.log.scrollTop + this.log.clientHeight >= this.log.scrollHeight - 8;
    this.log.append(`${lines.join("\n")}\n`);
    if ((this.log.textContent?.length ?? 0) > MAX_LOG_CHARS) this.log.textContent = this.log.textContent!.slice(-MAX_LOG_CHARS);
    if (atBottom) this.log.scrollTop = this.log.scrollHeight;
  }

  private showHead(job: JobRow): void {
    const progress = job.progress
      ? `${job.progress.text || ""}${job.progress.total ? ` (${job.progress.done}/${job.progress.total})` : ""}` : "";
    // Through h(): replaceChildren itself would print a null child as the text "null".
    this.head.replaceChildren(...h("div", {}, h("strong", {}, `${jobLabel(job)} · ${job.id}`), jobChip(job),
      progress ? h("span", { class: "muted" }, progress) : null,
      job.error ? h("span", { class: "error" }, job.error) : null).childNodes);
    this.cancelButton.hidden = !isActive(job.state) || this.readOnly();
    this.cancelButton.dataset.job = job.id;
  }

  private async cancel(): Promise<void> {
    const id = this.cancelButton.dataset.job;
    if (!id || !window.confirm("取消这个任务？训练会停止它的容器。")) return;
    try {
      await api.cancelJob(id);
    } catch (error) {
      window.alert(`取消失败：${errorText(error)}`);
    }
  }
}
