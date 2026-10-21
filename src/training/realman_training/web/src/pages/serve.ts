import type { Ctx } from "../ctx";
import { h } from "../dom";

export async function renderServe(root: HTMLElement, _ctx: Ctx): Promise<void> {
  root.replaceChildren(h("section", { class: "panel" }, h("h2", {}, "服务")));
}
