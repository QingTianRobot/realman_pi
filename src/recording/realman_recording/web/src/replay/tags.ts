// Episode tags are edited outside the polling sidebar so unsaved input survives refresh.
type TagValue = string | boolean | number | null;
type TagMap = Record<string, TagValue>;
type TagDocument = { tags: TagMap; tag_sources?: Record<string, string>; tag_types?: Record<string, string>; revision?: number; default_snapshot?: TagMap; removed?: string[]; meta_synced?: boolean; meta_error?: string };
type TagEditor = { openEpisode(sessionId: string): Promise<void>; openDefaults(): Promise<void> };

const core = ["success", "arm", "date", "lighting_level"];
const $ = <T extends HTMLElement>(selector: string) => document.querySelector(selector) as T;

function option(value: string, label: string): HTMLOptionElement {
  const item = document.createElement("option"); item.value = value; item.textContent = label; return item;
}
function select(items: Array<[string, string]>, selected: string): HTMLSelectElement {
  const el = document.createElement("select");
  for (const [value, label] of items) el.append(option(value, label));
  el.value = selected; return el;
}
function valueType(value: TagValue, declared?: string): string {
  if (declared) return declared;
  if (value === null) return "null";
  if (typeof value === "boolean") return "bool";
  if (typeof value === "number") return Number.isInteger(value) ? "int" : "float";
  return "string";
}
function parseValue(type: string, value: string): TagValue {
  if (type === "null") return null;
  if (type === "bool") { if (value !== "true" && value !== "false") throw new Error("布尔值须为 true 或 false"); return value === "true"; }
  if (type === "int") { if (!/^-?\d+$/.test(value)) throw new Error("整数值无效"); return Number(value); }
  if (type === "float") { const number = Number(value); if (!Number.isFinite(number) || !value.trim()) throw new Error("数值无效"); return number; }
  return value;
}
async function request(url: string, method = "GET", payload?: object): Promise<TagDocument & Record<string, unknown>> {
  const response = await fetch(url, { method, headers: payload ? { "Content-Type": "application/json" } : undefined,
    body: payload ? JSON.stringify(payload) : undefined });
  if (!response.ok) throw new Error((await response.text()) || `HTTP ${response.status}`);
  return response.json();
}

export function initTags(onSaved: (scope: "defaults" | "episode", tags: TagMap) => void): TagEditor {
  const dialog = $<HTMLDialogElement>("#tags-dialog");
  const title = $("#tags-title"); const fields = $("#tags-fields"); const message = $("#tags-message");
  const addButton = $<HTMLButtonElement>("#tags-add"); const backfillButton = $<HTMLButtonElement>("#tags-backfill");
  let sessionId: string | null = null;
  let loaded: TagDocument = { tags: {} };
  let busy = false;

  function showError(error: unknown): void { message.textContent = error instanceof Error ? error.message : "请求失败"; message.classList.add("error"); }
  function makeRow(key: string, value: TagValue, source: string, custom: boolean, isNew = false, declaredType?: string): void {
    const row = document.createElement("div"); row.className = "tag-row";
    row.dataset.originalKey = isNew ? "" : key;
    const label = document.createElement("label"); label.textContent = custom ? "自定义 Key" : key;
    if (custom) {
      const keyInput = document.createElement("input"); keyInput.className = "tag-key"; keyInput.value = key;
      keyInput.maxLength = 64; keyInput.placeholder = "Key"; keyInput.disabled = !isNew;
      label.append(keyInput);
    }
    row.append(label);
    let input: HTMLInputElement | HTMLSelectElement;
    if (key === "success") input = select([["true", "成功 true"], ["false", "失败 false"]], String(value));
    else if (key === "arm") input = select([["", "未知"], ["left", "左臂"], ["right", "右臂"], ["both", "双臂"]], value === null ? "" : String(value));
    else if (key === "lighting_level") input = select([["", "未知"], ["1", "较暗 1"], ["2", "正常 2"], ["3", "较亮 3"]], value === null ? "" : String(value));
    else if (key === "date") { input = document.createElement("input"); input.type = "date"; input.value = value === null ? "" : String(value); }
    else {
      const kind = select([["string", "文本"], ["bool", "布尔"], ["int", "整数"], ["float", "小数"], ["null", "空值"]], valueType(value, declaredType));
      kind.className = "tag-type"; row.append(kind);
      input = document.createElement("input"); input.value = value === null ? "" : String(value);
      input.placeholder = "Value"; row.append(input);
      kind.addEventListener("change", () => { if (kind.value === "bool") input.value = "true"; if (kind.value === "null") input.value = ""; });
    }
    input.classList.add("tag-value"); if (!input.isConnected) row.append(input);
    const origin = document.createElement("small"); origin.textContent = source === "manual" ? "人工" : source === "derived" ? "自动日期" : "默认";
    row.append(origin);
    if (sessionId) {
      const reset = document.createElement("label"); reset.className = "tag-reset";
      const checkbox = document.createElement("input"); checkbox.type = "checkbox"; checkbox.className = "tag-reset-check";
      checkbox.addEventListener("change", () => { input.disabled = checkbox.checked; });
      reset.append(checkbox, document.createTextNode(custom ? "删除标签" : "恢复默认")); row.append(reset);
    } else if (custom) {
      const remove = document.createElement("button"); remove.type = "button"; remove.textContent = "删除";
      remove.addEventListener("click", () => row.remove()); row.append(remove);
    }
    fields.append(row);
  }
  function render(): void {
    fields.replaceChildren(); message.textContent = ""; message.classList.remove("error");
    title.textContent = sessionId ? `Episode 标签 · ${sessionId}` : "默认标签";
    backfillButton.hidden = Boolean(sessionId);
    const values = loaded.tags;
    for (const key of core) {
      if (!sessionId && key === "date") {
        const note = document.createElement("p"); note.textContent = "date 根据录制时间自动计算（Asia/Shanghai）"; fields.append(note); continue;
      }
      makeRow(key, values[key] ?? (key === "success" ? true : null), loaded.tag_sources?.[key] ?? "default", false);
    }
    for (const [key, value] of Object.entries(values)) if (!core.includes(key)) makeRow(key, value, loaded.tag_sources?.[key] ?? "default", true, false, loaded.tag_types?.[key]);
    for (const key of loaded.removed ?? []) {
      if (!core.includes(key) && !(key in values)) {
        makeRow(key, loaded.default_snapshot?.[key] ?? null, "deleted", true);
        const row = fields.lastElementChild as HTMLElement;
        row.dataset.removed = "true";
        const value = row.querySelector<HTMLInputElement>(".tag-value"); if (value) value.disabled = true;
        const reset = row.querySelector<HTMLElement>(".tag-reset"); if (reset) reset.lastChild!.textContent = "恢复默认";
      }
    }
  }
  function collect(): { set: TagMap; reset: string[]; deleteKeys: string[]; setTypes: Record<string, string> } {
    const set: TagMap = {}; const reset: string[] = []; const deleteKeys: string[] = []; const setTypes: Record<string, string> = {}; const seen = new Set<string>();
    for (const row of fields.querySelectorAll<HTMLElement>(".tag-row")) {
      const keyInput = row.querySelector<HTMLInputElement>(".tag-key");
      const key = keyInput ? keyInput.value.trim() : row.querySelector("label")?.firstChild?.textContent || "";
      if (!key || seen.has(key)) throw new Error(`重复或空 Key: ${key}`);
      seen.add(key);
      const original = row.dataset.originalKey ?? key;
      const checkbox = row.querySelector<HTMLInputElement>(".tag-reset-check");
      if (row.dataset.removed === "true") { if (checkbox?.checked) reset.push(original); continue; }
      if (checkbox?.checked) { if (original) (core.includes(original) ? reset : deleteKeys).push(original); continue; }
      const input = row.querySelector<HTMLInputElement | HTMLSelectElement>(".tag-value");
      if (!input) continue;
      let value: TagValue;
      if (key === "success") value = input.value === "true";
      else if (key === "arm" || key === "date") value = input.value || null;
      else if (key === "lighting_level") value = input.value ? Number(input.value) : null;
      else value = parseValue(row.querySelector<HTMLSelectElement>(".tag-type")?.value || "string", input.value);
      const kind = row.querySelector<HTMLSelectElement>(".tag-type")?.value;
      if (!sessionId || !(key in loaded.tags) || JSON.stringify(loaded.tags[key]) !== JSON.stringify(value)
          || (kind && kind !== valueType(loaded.tags[key], loaded.tag_types?.[key]))) {
        set[key] = value;
        if (kind) setTypes[key] = kind;
      }
    }
    if (!sessionId && set.success === undefined) set.success = loaded.tags.success ?? true;
    return { set, reset, deleteKeys, setTypes };
  }
  async function openDefaults(): Promise<void> {
    sessionId = null; loaded = await request("/api/recording/tag-defaults"); render(); dialog.showModal();
  }
  async function openEpisode(id: string): Promise<void> {
    sessionId = id; loaded = await request(`/api/recording/${encodeURIComponent(id)}/tags`); render(); dialog.showModal();
  }
  $("#tags-close").addEventListener("click", () => dialog.close());
  addButton.addEventListener("click", () => makeRow("", "", "manual", true, true));
  $<HTMLFormElement>("#tags-form").addEventListener("submit", async (event) => {
    event.preventDefault(); if (busy) return; busy = true;
    try {
      const { set, reset, deleteKeys, setTypes } = collect();
      const result = sessionId
        ? await request(`/api/recording/${encodeURIComponent(sessionId)}/tags`, "PUT", { revision: loaded.revision, set, reset, delete: deleteKeys, set_types: setTypes })
        : await request("/api/recording/tag-defaults", "PUT", { tags: set, set_types: setTypes });
      loaded = result;
      if (sessionId) loaded = await request(`/api/recording/${encodeURIComponent(sessionId)}/tags`);
      else loaded = await request("/api/recording/tag-defaults");
      render(); onSaved(sessionId ? "episode" : "defaults", loaded.tags);
      message.textContent = result.meta_synced === false ? `标签已保存，索引待修复：${result.meta_error}` : "已保存";
    } catch (error) { showError(error); } finally { busy = false; }
  });
  backfillButton.addEventListener("click", async () => {
    try {
      const preview = await request("/api/recording/tags/backfill", "POST", { dry_run: true });
      const changes = preview.changes as Array<{ session_id: string; fields: Record<string, { from: unknown; to: unknown }> }>;
      const summary = changes.filter((item) => item.fields).slice(0, 12).map((item) =>
        `${item.session_id}: ${Object.entries(item.fields).map(([key, value]) => `${key} ${JSON.stringify(value.from)} → ${JSON.stringify(value.to)}`).join(", ")}`).join("\n");
      if (!window.confirm(`将更新 ${preview.affected} 条历史 Session 的非人工字段。\n${summary}\n确认应用？`)) return;
      const result = await request("/api/recording/tags/backfill", "POST", { dry_run: false, confirm: true });
      message.textContent = `已更新 ${result.affected} 条；${result.meta_synced === false ? "索引待修复" : "索引已同步"}`;
      onSaved();
    } catch (error) { showError(error); }
  });
  return { openEpisode, openDefaults };
}
