import "./theme.css";
import "./params.css";

// Parameter page: catalog rows from /api/params, staged in this browser, written to config/ros/*.yaml after a
// dry-run diff, with runtime values read back from the running ROS nodes.

type Kind = "int" | "float" | "bool";
type Value = number | boolean;
type Ref = { key: string; id: string | null; value: number; strict: boolean } | null;
type Row = {
  id: string; key: string; element: number | null; label: string; kind: Kind;
  min: number | null; max: number | null; special: number[]; unit: string; note: string;
  applies: "bt_start" | "bringup_restart"; file: string; value: Value; baseline: Value;
  readback: { node: string; param: string; element: number | null } | null; max_ref: Ref; min_ref: Ref;
};
type Group = { id: string; title: string; file: string; applies: string; rows: Row[] };
type Snapshot = {
  applies: Record<string, string>; groups: Group[];
  files: Record<string, { sha: string; baseline: boolean; external_change: boolean }>;
  writable: boolean; writable_error: string; errors: string[]; pending_restart: string[];
};
type RuntimeState = { state: "applied" | "pending" | "offline" | "undeclared"; value: unknown };
type Change = { id: string; label: string; file: string; applies: string; before: Value; after: Value };
type WriteResult = { id?: string; time?: string; reverts?: string | null; changes: Change[]; diff: string;
  applies?: string[]; changed_since?: string[] };
type Reply = { ok: boolean; status: number; data: any };
type RowCells = {
  tr: HTMLTableRowElement; baseline: HTMLElement; value: HTMLElement; runtime: HTMLElement; staged: HTMLElement;
  input: HTMLInputElement | HTMLSelectElement; min: HTMLElement; max: HTMLElement; applies: HTMLElement;
  unstage: HTMLButtonElement;
};

const STAGED_KEY = "realman.params.staged.v1";
const READBACK_PERIOD_MS = 2000;
const BT_PERIOD_MS = 5000;
const ARM_MS = 4000;
const COLUMNS = ["#", "参数", "备注", "文件", "基线值", "文件值", "运行值", "暂存", "新值", "最小", "最大", "单位", "生效"];
const APPLIES_SHORT: Record<string, string> = { bt_start: "下次启动行为树", bringup_restart: "重启 bringup" };

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <header class="topbar">
    <div><span class="eyebrow">REALMAN / PARAMETERS</span><h1>参数调试</h1><p>白名单参数 · 暂存后写入配置 · 运行值读回</p></div>
    <div class="top-actions"><a href="/" class="button ghost">运动控制</a><a href="/calibration.html" class="button ghost">相机标定</a></div>
  </header>
  <main class="params-main">
    <section class="panel sheet-panel">
      <div class="panel-title">
        <div><span class="eyebrow">CATALOG / CONFIG</span><h2>参数表</h2></div>
        <div class="sheet-tools">
          <input id="param-filter" type="search" placeholder="筛选参数 / 备注 / 文件 / 单位" autocomplete="off" />
          <span id="param-count" class="muted"></span>
          <span id="staged-count" class="status">暂存 0 项</span>
          <button id="write-config" class="button primary" type="button" disabled>写入配置</button>
          <button id="clear-staged" class="button ghost" type="button" disabled>清空暂存</button>
          <a id="export-patch" class="button ghost" href="/api/params/export" download="param-tuning.patch">导出补丁</a>
          <button id="reset-baseline" class="button ghost" type="button">重置基线</button>
        </div>
      </div>
      <div id="notices" class="notices"></div>
      <p id="param-message" class="message" hidden></p>
      <p id="param-error" class="error" hidden></p>
      <div id="sheet" class="sheet-wrap"><p class="hint">读取参数清单…</p></div>
    </section>
    <section class="panel history-panel">
      <div class="panel-title"><div><span class="eyebrow">HISTORY</span><h2>修改历史</h2></div><span id="history-count" class="status">—</span></div>
      <div id="history" class="history-list"><p class="hint">还没有修改记录。</p></div>
    </section>
  </main>
  <dialog id="confirm-dialog" class="confirm-dialog">
    <form method="dialog">
      <h2 id="confirm-title">写入配置</h2>
      <div id="confirm-body"></div>
      <div class="dialog-actions">
        <button value="cancel" class="button ghost">取消</button>
        <button id="confirm-ok" value="ok" class="button primary">确认写入</button>
      </div>
    </form>
  </dialog>
`;

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const filterInput = $<HTMLInputElement>("#param-filter");
const countLabel = $("#param-count");
const stagedLabel = $("#staged-count");
const writeButton = $<HTMLButtonElement>("#write-config");
const clearButton = $<HTMLButtonElement>("#clear-staged");
const resetButton = $<HTMLButtonElement>("#reset-baseline");
const noticesBox = $("#notices");
const messageBox = $("#param-message");
const errorBox = $("#param-error");
const sheetBox = $("#sheet");
const historyBox = $("#history");
const historyCount = $("#history-count");
const dialog = $<HTMLDialogElement>("#confirm-dialog");
const dialogTitle = $("#confirm-title");
const dialogBody = $("#confirm-body");
const dialogOk = $<HTMLButtonElement>("#confirm-ok");

let snapshot: Snapshot | null = null;
let rowsById = new Map<string, Row>();
let cellsById = new Map<string, RowCells>();
let signature = "";
let runtime: Record<string, RuntimeState> = {};
let launcher: { running?: boolean; tree?: string } = {};
let restartAvailable = false;
let rowErrors = new Map<string, string>();
let armed: { action: string; until: number } | null = null;
let busy = false;
let noticeKey = "";
const staged = loadStaged();

function el<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string, className?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function loadStaged(): Map<string, Value> {
  try {
    const raw = JSON.parse(localStorage.getItem(STAGED_KEY) || "{}");
    return new Map(Object.entries(raw).filter(([, value]) => typeof value === "number" || typeof value === "boolean") as [string, Value][]);
  } catch {
    return new Map();
  }
}

function saveStaged(): void {
  try {
    localStorage.setItem(STAGED_KEY, JSON.stringify(Object.fromEntries(staged)));
  } catch {
    // Private windows may refuse storage; staging still works for this tab.
  }
}

function same(left: unknown, right: unknown): boolean {
  if (typeof left === "number" && typeof right === "number") {
    return Math.abs(left - right) <= 1e-9 * Math.max(1, Math.abs(left), Math.abs(right));
  }
  return left === right;
}

function fmt(row: Row | null, value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") {
    const text = String(Number(value.toPrecision(12)));
    return row?.kind === "float" && Number.isInteger(value) ? `${text}.0` : text;
  }
  return String(value);
}

function refValue(ref: NonNullable<Ref>): number {
  const value = ref.id ? staged.get(ref.id) : undefined;
  return typeof value === "number" ? value : ref.value;
}

function problem(row: Row, value: Value): string {
  if (row.kind === "bool") return typeof value === "boolean" ? "" : "必须是 true 或 false";
  if (typeof value !== "number" || !Number.isFinite(value)) return "必须是数字";
  if (row.kind === "int" && !Number.isInteger(value)) return "必须是整数";
  if (row.special.some((item) => same(item, value))) return "";
  if (row.min !== null && value < row.min) return `低于最小值 ${fmt(row, row.min)}`;
  if (row.max !== null && value > row.max) return `高于最大值 ${fmt(row, row.max)}`;
  for (const [ref, upper] of [[row.max_ref, true], [row.min_ref, false]] as const) {
    if (!ref) continue;
    const other = refValue(ref);
    const bad = upper ? (ref.strict ? value >= other : value > other) : (ref.strict ? value <= other : value < other);
    const sign = upper ? (ref.strict ? "<" : "≤") : (ref.strict ? ">" : "≥");
    if (bad) return `必须 ${sign} ${ref.key}（${fmt(row, other)}）`;
  }
  return "";
}

function setMessage(text: string): void {
  messageBox.textContent = text;
  messageBox.hidden = !text;
}

function setError(text: string): void {
  errorBox.textContent = text;
  errorBox.hidden = !text;
}

async function request(url: string, body?: unknown): Promise<Reply> {
  const response = await fetch(url, body === undefined
    ? { cache: "no-store" }
    : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const text = await response.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    data = { error: text };
  }
  return { ok: response.ok, status: response.status, data };
}

function expectedSha(): Record<string, string> {
  return Object.fromEntries(Object.entries(snapshot?.files ?? {}).map(([file, info]) => [file, info.sha]));
}

// ------------------------------------------------------------------------------------------------ table

function moveFocus(from: HTMLElement, step: number): void {
  const inputs = Array.from(sheetBox.querySelectorAll<HTMLElement>("tr:not(.hidden) .edit input, tr:not(.hidden) .edit select"));
  const next = inputs[inputs.indexOf(from) + step];
  if (next) {
    next.focus();
    if (next instanceof HTMLInputElement) next.select();
  }
}

function stage(row: Row, value: Value): void {
  if (same(value, row.value)) staged.delete(row.id);
  else staged.set(row.id, value);
  rowErrors.delete(row.id);
  saveStaged();
  refresh();
}

function unstage(id: string): void {
  staged.delete(id);
  rowErrors.delete(id);
  saveStaged();
  refresh();
}

function markInput(input: HTMLInputElement, reason: string): void {
  input.classList.toggle("invalid", Boolean(reason));
  input.title = reason || "回车暂存并跳到下一行；Shift+回车上一行；Esc 清空；↑/↓ 换行；空格内按 Delete 取消暂存";
}

function buildRow(row: Row, index: number): RowCells {
  const tr = el("tr");
  tr.dataset.id = row.id;
  tr.append(el("td", String(index), "rownum"));
  const name = el("td", undefined, "name");
  name.append(el("b", row.label));
  tr.append(name, el("td", row.note, "note"), el("td", row.file.replace(/^ros\//, ""), "file mono"));
  const baseline = el("td", undefined, "num");
  const value = el("td", undefined, "num");
  const runtimeCell = el("td", undefined, "num");
  const stagedCell = el("td", undefined, "num staged-cell");
  const edit = el("td", undefined, "edit");
  let input: HTMLInputElement | HTMLSelectElement;
  if (row.kind === "bool") {
    const select = el("select");
    select.append(new Option("—", ""), new Option("true", "true"), new Option("false", "false"));
    select.addEventListener("change", () => {
      if (select.value) stage(row, select.value === "true");
      select.value = "";
    });
    select.addEventListener("keydown", (event) => {
      if (event.key === "Delete" || event.key === "Backspace") unstage(row.id);
    });
    input = select;
  } else {
    const field = el("input");
    field.type = "number";
    field.step = row.kind === "int" ? "1" : "any";
    if (row.min !== null) field.min = String(row.min);
    if (row.max !== null) field.max = String(row.max);
    markInput(field, "");
    // Stage a valid typed value; a bad one stays in the cell, marked. False when it was refused.
    const commit = (): boolean => {
      if (field.value === "") return true;
      const reason = problem(row, Number(field.value));
      markInput(field, reason);
      if (reason) return false;
      stage(row, Number(field.value));
      field.value = "";
      return true;
    };
    field.addEventListener("input", () => markInput(field, field.value === "" ? "" : problem(row, Number(field.value))));
    // Leaving the cell (Tab, a click elsewhere, the 写入配置 button) stages too, not only Enter.
    field.addEventListener("change", () => void commit());
    field.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        if (commit()) moveFocus(field, event.shiftKey ? -1 : 1);
      } else if (event.key === "Escape") {
        field.value = "";
        markInput(field, "");
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        moveFocus(field, event.key === "ArrowDown" ? 1 : -1);
      } else if ((event.key === "Delete" || event.key === "Backspace") && field.value === "" && staged.has(row.id)) {
        unstage(row.id);
      }
    });
    input = field;
  }
  edit.append(input);
  const unstageButton = el("button", "×", "unstage");
  unstageButton.type = "button";
  unstageButton.title = "取消暂存";
  unstageButton.addEventListener("click", () => unstage(row.id));
  const min = el("td", undefined, "num muted");
  const max = el("td", undefined, "num muted");
  const applies = el("td", undefined, "applies");
  tr.append(baseline, value, runtimeCell, stagedCell, edit, min, max, el("td", row.unit, "muted"), applies);
  return { tr, baseline, value, runtime: runtimeCell, staged: stagedCell, input, min, max, applies, unstage: unstageButton };
}

function updateRow(row: Row, cells: RowCells): void {
  cells.baseline.textContent = fmt(row, row.baseline);
  const differs = !same(row.value, row.baseline);
  cells.value.textContent = fmt(row, row.value);
  cells.value.classList.toggle("differs", differs);
  cells.value.title = differs ? "与基线不同" : "";
  const live = runtime[row.id];
  cells.runtime.classList.remove("runtime-pending");
  if (!row.readback) {
    cells.runtime.textContent = "—";
    cells.runtime.title = "这个参数没有运行值（节点不把它声明成 ROS 参数）";
  } else if (!live) {
    cells.runtime.textContent = "…";
    cells.runtime.title = "";
  } else if (live.state === "offline") {
    cells.runtime.textContent = "未运行";
    cells.runtime.title = `${row.readback.node} 没有运行或没有应答`;
  } else if (live.state === "undeclared") {
    cells.runtime.textContent = "未声明";
    cells.runtime.title = `${row.readback.node} 在运行，但没有声明 ${row.readback.param}（版本较旧或键名改过）`;
  } else {
    cells.runtime.textContent = fmt(row, live.value);
    cells.runtime.title = `${row.readback.node} ${row.readback.param}`;
    cells.runtime.classList.toggle("runtime-pending", live.state === "pending");
  }
  const stagedValue = staged.get(row.id);
  cells.staged.textContent = stagedValue === undefined ? "—" : fmt(row, stagedValue);
  if (stagedValue !== undefined) cells.staged.append(cells.unstage);
  cells.tr.classList.toggle("is-staged", stagedValue !== undefined);
  if (cells.input instanceof HTMLInputElement) cells.input.placeholder = stagedValue === undefined ? "" : fmt(row, stagedValue);
  let minimum: number | null = row.min;
  let maximum: number | null = row.max;
  const titles: string[] = [];
  if (row.min_ref) {
    const other = refValue(row.min_ref);
    minimum = minimum === null ? other : Math.max(minimum, other);
    titles.push(`${row.min_ref.strict ? ">" : "≥"} ${row.min_ref.key} = ${fmt(row, other)}`);
  }
  if (row.max_ref) {
    const other = refValue(row.max_ref);
    maximum = maximum === null ? other : Math.min(maximum, other);
    titles.push(`${row.max_ref.strict ? "<" : "≤"} ${row.max_ref.key} = ${fmt(row, other)}`);
  }
  cells.min.textContent = row.kind === "bool" ? "" : fmt(row, minimum);
  cells.max.textContent = row.kind === "bool" ? "" : fmt(row, maximum);
  cells.min.title = cells.max.title = titles.join("；");
  cells.applies.textContent = APPLIES_SHORT[row.applies] ?? row.applies;
  cells.applies.title = snapshot?.applies[row.applies] ?? "";
  let badge: [string, string] | null = null;
  if (live?.state === "applied") badge = ["已生效", "ok"];
  else if (live?.state === "pending") badge = ["待生效", "warn"];
  else if (live?.state === "offline") badge = ["未运行", ""];
  else if (live?.state === "undeclared") badge = ["未声明", "warn"];
  if (snapshot?.pending_restart.includes(row.id)) badge = ["待重启", "warn"];
  if (badge) cells.applies.append(el("span", badge[0], `badge ${badge[1]}`.trim()));
  const error = rowErrors.get(row.id);
  cells.tr.classList.toggle("row-error", Boolean(error));
  cells.tr.title = error ?? "";
}

function buildSheet(groups: Group[]): void {
  cellsById = new Map();
  const table = el("table", undefined, "sheet");
  const head = el("thead");
  const headRow = el("tr");
  COLUMNS.forEach((title) => headRow.append(el("th", title)));
  head.append(headRow);
  const body = el("tbody");
  let index = 0;
  for (const group of groups) {
    const band = el("tr", undefined, "group-band");
    const bandCell = el("td", `${group.title}（${group.rows.length}）`);
    bandCell.colSpan = COLUMNS.length;
    band.append(bandCell);
    body.append(band);
    for (const row of group.rows) {
      index += 1;
      const cells = buildRow(row, index);
      cellsById.set(row.id, cells);
      body.append(cells.tr);
    }
  }
  table.append(head, body);
  sheetBox.replaceChildren(table);
}

function applyFilter(): void {
  const query = filterInput.value.trim().toLowerCase();
  let shown = 0;
  for (const [id, cells] of cellsById) {
    const row = rowsById.get(id)!;
    const hit = !query || `${row.label} ${row.key} ${row.note} ${row.file} ${row.unit}`.toLowerCase().includes(query);
    cells.tr.classList.toggle("hidden", !hit);
    if (hit) shown += 1;
  }
  sheetBox.querySelectorAll<HTMLTableRowElement>("tr.group-band").forEach((band) => {
    let next = band.nextElementSibling;
    let any = false;
    while (next && !next.classList.contains("group-band")) {
      if (!next.classList.contains("hidden")) any = true;
      next = next.nextElementSibling;
    }
    band.classList.toggle("hidden", !any);
  });
  countLabel.textContent = query ? `${shown} / ${cellsById.size} 项` : `共 ${cellsById.size} 项`;
}

// ------------------------------------------------------------------------------------------------ notices

function armButton(button: HTMLButtonElement, action: string, idle: string, confirmText: string): boolean {
  if (armed?.action === action && armed.until > Date.now()) {
    armed = null;
    button.textContent = idle;
    button.classList.remove("danger");
    return true;
  }
  armed = { action, until: Date.now() + ARM_MS };
  button.textContent = confirmText;
  button.classList.add("danger");
  window.setTimeout(() => {
    if (armed?.action === action && armed.until <= Date.now()) {
      armed = null;
      button.textContent = idle;
      button.classList.remove("danger");
    }
  }, ARM_MS + 50);
  return false;
}

function notice(kind: string, text: string, ...actions: HTMLElement[]): HTMLElement {
  const box = el("div", undefined, `notice ${kind}`.trim());
  box.append(el("span", text), ...actions);
  return box;
}

function renderNotices(): void {
  if (!snapshot) return;
  const items: HTMLElement[] = [];
  const restartArmed = armed?.action === "restart" && armed.until > Date.now();
  if (!snapshot.writable) items.push(notice("danger", `只读：${snapshot.writable_error}`));
  if (snapshot.errors.length) {
    items.push(notice("warn", `清单里有 ${snapshot.errors.length} 项在配置文件里对不上，未显示：\n${snapshot.errors.join("\n")}`));
  }
  const external = Object.entries(snapshot.files).filter(([, info]) => info.external_change).map(([file]) => file);
  if (external.length) {
    items.push(notice("warn", `这些文件在页面外改过：${external.join("、")}。导出补丁仍以基线为准；要从现在的内容重新开始，点「重置基线」。`));
  }
  const pending = snapshot.pending_restart.filter((id) => rowsById.has(id));
  if (pending.length) {
    const labels = pending.map((id) => rowsById.get(id)!.label);
    const restart = el("button", restartArmed ? "确认重启？" : "重启 bringup", restartArmed ? "button danger" : "button ghost");
    restart.type = "button";
    restart.disabled = !restartAvailable;
    restart.title = restartAvailable ? "重启 realman_bringup_remote 容器（行为树会随之停止）" : "宿主机重启助手不可用";
    restart.addEventListener("click", () => void restartBringup(restart));
    const dismiss = el("button", "知道了", "button ghost");
    dismiss.type = "button";
    dismiss.addEventListener("click", () => void clearPending());
    items.push(notice("warn", `有 ${pending.length} 项改动需要重启 bringup 才生效：${labels.join("、")}`, restart, dismiss));
  }
  const btStaged = [...staged.keys()].some((id) => rowsById.get(id)?.applies === "bt_start");
  const btPending = Object.values(runtime).some((item) => item.state === "pending");
  if (launcher.running && (btStaged || btPending)) {
    items.push(notice("warn", `行为树 ${launcher.tree || ""} 正在运行，它不会使用新写入的值；停止后重新启动生效。`));
  }
  // Rebuild only on change: the readback tick refreshes every 2 s and must not swallow a click on these buttons.
  const key = `${restartArmed}|${restartAvailable}|${items.map((item) => item.textContent).join("|")}`;
  if (key === noticeKey) return;
  noticeKey = key;
  noticesBox.replaceChildren(...items);
}

function refresh(): void {
  if (!snapshot) return;
  for (const [id, cells] of cellsById) updateRow(rowsById.get(id)!, cells);
  const count = [...staged.keys()].filter((id) => rowsById.has(id)).length;
  stagedLabel.textContent = `暂存 ${count} 项`;
  stagedLabel.classList.toggle("warn", count > 0);
  writeButton.disabled = busy || count === 0 || !snapshot.writable;
  clearButton.disabled = count === 0;
  resetButton.disabled = busy || !Object.values(snapshot.files).some((info) => info.baseline);
  renderNotices();
}

// ------------------------------------------------------------------------------------------------ data

async function loadSnapshot(): Promise<void> {
  let reply: Reply;
  try {
    reply = await request("/api/params");
  } catch (error) {
    setError(`参数接口不可用：${(error as Error).message}`);
    return;
  }
  if (reply.status === 404) {
    snapshot = null;
    sheetBox.replaceChildren(el("p", "参数调试已关闭（realman_web_control.yaml 的 param_tuning.catalog_file 为空），或者服务端版本还没有这一页。", "hint"));
    writeButton.disabled = clearButton.disabled = resetButton.disabled = true;
    return;
  }
  if (!reply.ok || !Array.isArray(reply.data?.groups)) {
    setError(`参数清单不可用：${reply.data?.error || reply.status}`);
    return;
  }
  snapshot = reply.data as Snapshot;
  rowsById = new Map(snapshot.groups.flatMap((group) => group.rows.map((row) => [row.id, row] as [string, Row])));
  for (const [id, value] of [...staged]) {
    const row = rowsById.get(id);
    if (row && same(row.value, value)) staged.delete(id);
  }
  saveStaged();
  const next = snapshot.groups.map((group) => `${group.id}:${group.rows.map((row) => row.id).join(",")}`).join("|");
  if (next !== signature) {
    signature = next;
    buildSheet(snapshot.groups);
    applyFilter();
  }
  refresh();
}

async function readbackTick(): Promise<void> {
  if (!snapshot || document.hidden) return;
  try {
    const reply = await request("/api/params/readback");
    if (reply.ok) {
      runtime = reply.data.rows ?? {};
      refresh();
    }
  } catch {
    // The next tick retries; the column keeps its last values.
  }
}

async function launcherTick(): Promise<void> {
  if (document.hidden) return;
  try {
    const reply = await request("/api/bt/trees");
    launcher = reply.ok && reply.data.available ? (reply.data.launcher ?? {}) : {};
    renderNotices();
  } catch {
    launcher = {};
  }
}

async function loadRestartStatus(): Promise<void> {
  try {
    const reply = await request("/api/docker/restart");
    restartAvailable = reply.ok && Boolean(reply.data.available) && !reply.data.helper?.restarting;
  } catch {
    restartAvailable = false;
  }
  renderNotices();
}

// ------------------------------------------------------------------------------------------------ writes

function diffBlock(diff: string): HTMLElement {
  const pre = el("pre", undefined, "diff");
  for (const line of diff.split("\n")) {
    const kind = line.startsWith("@@") ? "hunk" : line.startsWith("+") && !line.startsWith("+++") ? "add"
      : line.startsWith("-") && !line.startsWith("---") ? "del" : "";
    pre.append(el("span", `${line}\n`, kind));
  }
  return pre;
}

function changesTable(changes: Change[]): HTMLTableElement {
  const table = el("table", undefined, "confirm-changes");
  const head = el("tr");
  ["参数", "文件", "旧值", "新值", "生效"].forEach((title) => head.append(el("th", title)));
  table.append(head);
  for (const change of changes) {
    const row = rowsById.get(change.id) ?? null;
    const tr = el("tr");
    tr.append(
      el("td", change.label), el("td", change.file.replace(/^ros\//, ""), "mono"),
      el("td", fmt(row, change.before)), el("td", fmt(row, change.after)),
      el("td", APPLIES_SHORT[change.applies] ?? change.applies),
    );
    table.append(tr);
  }
  return table;
}

function confirmWrite(title: string, okText: string, result: WriteResult): Promise<boolean> {
  dialogTitle.textContent = title;
  dialogOk.textContent = okText;
  const summary = el("ul", undefined, "confirm-summary");
  const applies = new Set(result.changes.map((change) => change.applies));
  if (applies.has("bringup_restart")) summary.append(el("li", `重启 bringup 才生效的有 ${result.changes.filter((c) => c.applies === "bringup_restart").length} 项（重启时行为树也会停止）。`));
  if (applies.has("bt_start")) summary.append(el("li", `下次启动行为树生效的有 ${result.changes.filter((c) => c.applies === "bt_start").length} 项。`));
  if (launcher.running && applies.has("bt_start")) summary.append(el("li", `行为树 ${launcher.tree || ""} 正在运行，它不会使用新值。`));
  if (result.changed_since?.length) {
    summary.append(el("li", `这些参数在那次修改之后又被改过，也会被改回：${result.changed_since.map((id) => rowsById.get(id)?.label ?? id).join("、")}`));
  }
  dialogBody.replaceChildren(changesTable(result.changes), summary, diffBlock(result.diff));
  dialog.returnValue = "";
  return new Promise((resolve) => {
    dialog.addEventListener("close", () => resolve(dialog.returnValue === "ok"), { once: true });
    dialog.showModal();
  });
}

function reportFailure(action: string, reply: Reply): void {
  if (reply.status === 409) {
    setError(`${action}没有执行：${reply.data.error || "文件已被修改"}。已重新读取配置，暂存保留，请再确认一次。`);
    void loadSnapshot();
  } else if (reply.status === 400 && Array.isArray(reply.data.errors) && reply.data.errors.length) {
    rowErrors = new Map(reply.data.errors.map((item: { id: string; error: string }) => [item.id, item.error]));
    setError(`${action}没有执行，有 ${rowErrors.size} 项不能写入：\n${reply.data.errors
      .map((item: { id: string; error: string }) => `${rowsById.get(item.id)?.label ?? item.id}：${item.error}`).join("\n")}`);
    refresh();
  } else {
    setError(`${action}失败：${reply.data.error || reply.status}`);
  }
}

async function runWrite(action: string, url: string, body: Record<string, unknown>, title: string, okText: string): Promise<WriteResult | null> {
  setError("");
  setMessage("");
  busy = true;
  refresh();
  try {
    const preview = await request(url, { ...body, expected_sha: expectedSha(), dry_run: true });
    if (!preview.ok) {
      reportFailure(action, preview);
      return null;
    }
    if (!(await confirmWrite(title, okText, preview.data as WriteResult))) return null;
    const reply = await request(url, { ...body, expected_sha: expectedSha(), dry_run: false });
    if (!reply.ok) {
      reportFailure(action, reply);
      return null;
    }
    return reply.data as WriteResult;
  } catch (error) {
    setError(`${action}失败：${(error as Error).message}`);
    return null;
  } finally {
    busy = false;
    refresh();
  }
}

async function writeConfig(): Promise<void> {
  const changes = [...staged].filter(([id]) => rowsById.has(id)).map(([id, value]) => ({ id, value }));
  if (!changes.length) return;
  const result = await runWrite("写入", "/api/params/apply", { changes }, "写入配置", "确认写入");
  if (!result) return;
  for (const change of result.changes) staged.delete(change.id);
  rowErrors = new Map();
  saveStaged();
  setMessage(`已写入 ${result.changes.length} 项（记录 ${result.id}）。`);
  await Promise.all([loadSnapshot(), loadHistory()]);
  void readbackTick();
}

async function revertEntry(id: string): Promise<void> {
  const result = await runWrite("撤回", "/api/params/revert", { entry: id }, "撤回这次修改", "确认撤回");
  if (!result) return;
  setMessage(`已撤回 ${id}（新记录 ${result.id}）。`);
  await Promise.all([loadSnapshot(), loadHistory()]);
  void readbackTick();
}

async function restartBringup(button: HTMLButtonElement): Promise<void> {
  if (!armButton(button, "restart", "重启 bringup", "确认重启？")) return;
  button.disabled = true;
  const reply = await request("/api/docker/restart", {}).catch((error) => ({ ok: false, status: 0, data: { error: String(error) } }));
  if (reply.ok) setMessage("已请求重启 bringup；行为树随之停止，重启完成后需要重新启动。");
  else setError(`重启没有执行：${reply.data.error || reply.status}`);
  await Promise.all([loadSnapshot(), loadRestartStatus()]);
}

async function clearPending(): Promise<void> {
  const reply = await request("/api/params/pending/clear", {});
  if (!reply.ok) setError(`没有清除：${reply.data.error || reply.status}`);
  await loadSnapshot();
}

async function resetBaseline(): Promise<void> {
  if (!armButton(resetButton, "baseline", "重置基线", "确认重置基线？")) return;
  const reply = await request("/api/params/baseline/reset", {});
  if (reply.ok) setMessage(reply.data.archived ? `基线已归档到 ${reply.data.archived}，以后从当前文件重新开始。` : "没有基线需要重置。");
  else setError(`没有重置：${reply.data.error || reply.status}`);
  await loadSnapshot();
}

// ------------------------------------------------------------------------------------------------ history

async function loadHistory(): Promise<void> {
  let reply: Reply;
  try {
    reply = await request("/api/params/history");
  } catch {
    return;
  }
  if (!reply.ok) return;
  const entries = (reply.data.entries ?? []) as (WriteResult & { id: string; time: string })[];
  historyCount.textContent = `${entries.length} 条`;
  if (!entries.length) {
    historyBox.replaceChildren(el("p", "还没有修改记录。", "hint"));
    return;
  }
  historyBox.replaceChildren(...entries.map((entry) => {
    const details = el("details", undefined, "history-entry");
    const summary = el("summary");
    summary.append(
      el("strong", new Date(entry.time).toLocaleString("zh-CN", { hour12: false })),
      el("span", `改了 ${entry.changes.length} 项：${entry.changes.map((change) => change.label).join("、")}`),
    );
    if (entry.reverts) summary.append(el("span", `撤回 ${entry.reverts}`, "badge"));
    const revert = el("button", "撤回", "button ghost");
    revert.type = "button";
    revert.addEventListener("click", (event) => {
      event.preventDefault();
      void revertEntry(entry.id);
    });
    summary.append(revert);
    details.append(summary, changesTable(entry.changes), diffBlock(entry.diff));
    return details;
  }));
}

// ------------------------------------------------------------------------------------------------ start

filterInput.addEventListener("input", applyFilter);
writeButton.addEventListener("click", () => void writeConfig());
clearButton.addEventListener("click", () => {
  staged.clear();
  rowErrors = new Map();
  saveStaged();
  refresh();
});
resetButton.addEventListener("click", () => void resetBaseline());
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) void readbackTick();
});

void (async () => {
  await loadSnapshot();
  await Promise.all([loadHistory(), readbackTick(), launcherTick(), loadRestartStatus()]);
})();
window.setInterval(() => void readbackTick(), READBACK_PERIOD_MS);
window.setInterval(() => void launcherTick(), BT_PERIOD_MS);
