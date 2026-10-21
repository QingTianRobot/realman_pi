import { h } from "./dom";

export class JobDrawer {
  readonly el = h("aside", { class: "drawer", id: "drawer", hidden: true });
  constructor(_readOnly: () => boolean) {}
  get isOpen(): boolean { return !this.el.hidden; }
  async open(_jobId?: string): Promise<void> { this.el.hidden = false; }
  close(): void { this.el.hidden = true; }
}
