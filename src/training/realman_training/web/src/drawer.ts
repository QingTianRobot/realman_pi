import { api, logSocket, type JobRow } from "./api";
import { errorText, fmtTime, h, isActive } from "./dom";
import { jobChip, jobLabel } from "./widgets";

const MAX_LOG_CHARS = 400_000;

export class JobDrawer {
  readonly el: HTMLElement;
  private readonly jobs: HTMLElement;
  private readonly log: HTMLPreElement;
  private readonly head: HTMLElement;
  private readonly cancelButton: HTMLButtonElement;
  private socket: WebSocket | null = null;
  private selected: string | null = null;
  private timer = 0;

  constructor(private readonly readOnly: () => boolean) {
    this.jobs = h("div", { class: "drawer-jobs", id: "drawer-jobs" });
    this.log = h("pre", { class: "log", id: "drawer-log" });
    this.head = h("div", { class: "drawer-job-head", id: "drawer-job-head" });
    this.cancelButton = h("button", { class: "button danger", id: "drawer-cancel", type: "button", hidden: true }, "取消任务");
    this.cancelButton.addEventListener("click", () => void this.cancel());
    const close = h("button", { class: "button ghost", id: "drawer-close", type: "button" }, "关闭");
    close.addEventListener("click", () => this.close());
    this.el = h("aside", { class: "drawer", id: "drawer", hidden: true, "aria-label": "任务日志" },
      h("div", { class: "drawer-head" }, h("h2", {}, "任务日志"), this.cancelButton, close),
      h("div", { class: "drawer-body" }, this.jobs, h("div", { class: "drawer-log" }, this.head, this.log)));
  }

  get isOpen(): boolean {
    return !this.el.hidden;
  }

  async open(jobId?: string): Promise<void> {
    this.el.hidden = false;
    await this.refresh(jobId);
    window.clearInterval(this.timer);
    this.timer = window.setInterval(() => void this.refresh(), 5000);
  }

  close(): void {
    this.el.hidden = true;
    window.clearInterval(this.timer);
    this.socket?.close();
    this.socket = null;
    this.selected = null;
  }

  private async refresh(select?: string): Promise<void> {
    let rows: JobRow[];
    try {
      rows = (await api.jobs(30)).jobs;
    } catch (error) {
      this.jobs.replaceChildren(h("p", { class: "error" }, errorText(error)));
      return;
    }
    const current = select ?? this.selected;
    this.jobs.replaceChildren(...rows.map((job) => {
      const button = h("button", { class: `item${job.id === current ? " selected" : ""}`, type: "button", "data-job": job.id },
        h("strong", {}, jobLabel(job), " ", jobChip(job)),
        h("small", {}, fmtTime(job.created), job.progress?.text ? ` · ${job.progress.text}` : "", job.error ? ` · ${job.error}` : ""));
      button.addEventListener("click", () => this.select(job));
      return button;
    }));
    if (!rows.length) this.jobs.append(h("p", { class: "muted" }, "还没有任务"));
    const target = select ? rows.find((job) => job.id === select)
      : !this.selected ? rows.find((job) => isActive(job.state)) ?? rows[0] : undefined;
    if (target) this.select(target);
  }

  private select(job: JobRow): void {
    if (this.selected === job.id && this.socket) return;
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
        else if (wasActive) window.dispatchEvent(new CustomEvent("job-ended", { detail: row }));
      }
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
    this.head.replaceChildren(h("strong", {}, `${jobLabel(job)} · ${job.id}`), jobChip(job),
      progress ? h("span", { class: "muted" }, progress) : null,
      job.error ? h("span", { class: "error" }, job.error) : null);
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
