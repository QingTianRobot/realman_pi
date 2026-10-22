import { api, getToken, setToken, type JobRow } from "./api";
import type { Ctx } from "./ctx";
import { errorText, h } from "./dom";

export interface JobRequest {
  title: string;
  lines: string[];
  kind: string;
  params: Record<string, unknown>;
  danger?: boolean;
  confirmLabel?: string;
}

export function confirmJob(ctx: Ctx, request: JobRequest): Promise<JobRow | null> {
  return new Promise((resolve) => {
    const readOnly = ctx.health.read_only;
    const needToken = !readOnly && !getToken();
    const tokenInput = h("input", { type: "password", id: "confirm-token", autocomplete: "off", placeholder: "REALMAN_TRAINING_TOKEN" });
    const error = h("p", { class: "error", hidden: true });
    const start = h("button", { class: `button ${request.danger ? "danger" : "primary"}`, id: "confirm-start", type: "button",
      disabled: readOnly }, request.confirmLabel ?? "确认启动");
    const cancel = h("button", { class: "button ghost", id: "confirm-cancel", type: "button" }, "取消");
    const dialog = h("dialog", { class: "confirm", id: "confirm-dialog" },
      h("h2", {}, request.title),
      h("ul", {}, request.lines.map((line) => h("li", {}, line))),
      readOnly ? h("p", { class: "notice" }, "只读模式：服务器没有设置 REALMAN_TRAINING_TOKEN，不能启动任务。") : null,
      needToken ? h("label", { class: "token-line" }, "令牌（只保存在本页会话里）", tokenInput) : null,
      error,
      h("div", { class: "actions" }, cancel, start));
    let done = false;
    const finish = (job: JobRow | null) => {
      if (done) return;
      done = true;
      dialog.close();
      dialog.remove();
      resolve(job);
    };
    cancel.addEventListener("click", () => finish(null));
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      finish(null);
    });
    start.addEventListener("click", async () => {
      if (needToken && tokenInput.value.trim()) setToken(tokenInput.value.trim());
      start.disabled = true;
      error.hidden = true;
      try {
        const { job } = await api.startJob(request.kind, request.params);
        finish(job);
        ctx.openDrawer(job.id);
        ctx.refreshStatus();
      } catch (failure) {
        error.textContent = errorText(failure);
        error.hidden = false;
        start.disabled = false;
      }
    });
    document.body.append(dialog);
    dialog.showModal();
  });
}
