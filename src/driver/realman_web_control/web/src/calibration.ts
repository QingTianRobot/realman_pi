import "./calibration.css";

type EventMessage = Record<string, any> & { type: string };

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <header class="topbar">
    <div><span class="eyebrow">REALMAN / CALIBRATION</span><h1>ChArUco 手眼标定</h1><p>三臂原子采样 · 手眼求解 · 相对位姿</p></div>
    <div class="top-actions"><a href="/" class="button ghost">返回控制界面</a><span id="connection" class="status offline">OFFLINE</span></div>
  </header>
  <main class="grid">
    <section class="panel"><div class="panel-title"><div><span class="eyebrow">BOARD CONFIG</span><h2>标定板配置</h2></div><span id="config-state" class="status">LOADING</span></div><div id="config" class="config-list">读取 config/ros/camera_calibration.yaml…</div></section>
    <section class="panel health-panel"><div class="panel-title"><div><span class="eyebrow">CAMERA INPUT HEALTH</span><h2>三路相机输入状态</h2></div><span id="health-state" class="status">WAITING</span></div><div id="camera-health" class="camera-health"><p class="hint">等待标定节点上报图像与 CameraInfo 状态…</p></div></section>
    <section class="panel"><div class="panel-title"><div><span class="eyebrow">CAPTURE SESSION</span><h2>保存样本</h2></div><span id="session-state" class="status">NO SESSION</span></div><label>Session ID<input id="session" placeholder="留空则自动新建" /></label><label>历史会话<select id="session-history" disabled><option value="">读取历史会话…</option></select></label><label class="check"><input id="delete-empty-sessions" type="checkbox" checked /> 刷新时清理 0/30 空会话</label><div class="session-actions"><button id="refresh-sessions" class="button ghost" type="button">刷新历史会话</button><button id="load-session" class="button ghost" type="button" disabled>加载所选会话</button><button id="delete-session" class="button danger" type="button" disabled>删除所选会话</button></div><label class="check"><input id="new-session" type="checkbox" checked /> 新建会话</label><div class="arm-list"><label><input type="checkbox" checked disabled /> LEFT / l / camera_left</label><label><input type="checkbox" checked disabled /> MIDDLE / m / camera_middle</label><label><input type="checkbox" checked disabled /> RIGHT / r / camera_right</label></div><button id="capture" class="button primary" disabled>检测 ChArUco 并保存三臂样本</button><p class="hint">刷新默认只清理三臂均无已接受样本的 0/30 会话；“删除所选会话”会删除其全部图片、JSON 和求解结果，需确认后执行。</p></section>
    <section class="panel"><div class="panel-title"><div><span class="eyebrow">SOLVE</span><h2>执行标定</h2></div><span id="solve-state" class="status">WAITING</span></div><button id="solve" class="button secondary" disabled>执行三臂手眼标定</button><p class="hint">求解要求 l/m/r 都达到配置的最少样本数和残差阈值，然后计算三台机械臂的相对位姿。</p><pre id="result">等待结果…</pre></section>
    <section class="panel preview-panel"><div class="panel-title"><div><span class="eyebrow">DETECTION PREVIEW</span><h2>最近一次检测画面</h2></div><span id="preview-state" class="status">WAITING</span></div><div id="previews" class="preview-grid"><p class="hint">点击检测后显示左、中、右三路最近画面，并标注每路 ChArUco 检测结果。</p></div></section>
    <section class="panel log-panel"><div class="panel-title"><div><span class="eyebrow">SERVICE LOG</span><h2>实时反馈</h2></div></div><pre id="log"></pre></section>
  </main>
`;

const connection = document.querySelector<HTMLElement>("#connection")!;
const sessionInput = document.querySelector<HTMLInputElement>("#session")!;
const sessionHistory = document.querySelector<HTMLSelectElement>("#session-history")!;
const refreshSessionsButton = document.querySelector<HTMLButtonElement>("#refresh-sessions")!;
const loadSessionButton = document.querySelector<HTMLButtonElement>("#load-session")!;
const deleteSessionButton = document.querySelector<HTMLButtonElement>("#delete-session")!;
const deleteEmptySessions = document.querySelector<HTMLInputElement>("#delete-empty-sessions")!;
const newSession = document.querySelector<HTMLInputElement>("#new-session")!;
const captureButton = document.querySelector<HTMLButtonElement>("#capture")!;
const solveButton = document.querySelector<HTMLButtonElement>("#solve")!;
const sessionState = document.querySelector<HTMLElement>("#session-state")!;
const solveState = document.querySelector<HTMLElement>("#solve-state")!;
const result = document.querySelector<HTMLElement>("#result")!;
const log = document.querySelector<HTMLElement>("#log")!;
const previews = document.querySelector<HTMLElement>("#previews")!;
const previewState = document.querySelector<HTMLElement>("#preview-state")!;
const cameraHealth = document.querySelector<HTMLElement>("#camera-health")!;
const healthState = document.querySelector<HTMLElement>("#health-state")!;
let socket: WebSocket | undefined;
let captureRequest = "";
let solveRequest = "";
let sessionId = "";
let minimumSamplesPerArm = 0;
type CalibrationSession = {
  session_id: string;
  created_at: string;
  sample_counts: Record<string, number>;
  solved: boolean;
};
let calibrationSessions: CalibrationSession[] = [];

function requestId(prefix: string) { return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`; }
function writeLog(message: string) { log.textContent = `${new Date().toLocaleTimeString()} ${message}\n${log.textContent}`.slice(0, 12000); }
function canWrite() { return socket?.readyState === WebSocket.OPEN; }
function updateButtons() {
  captureButton.disabled = !canWrite() || Boolean(captureRequest);
  solveButton.disabled = !canWrite() || Boolean(solveRequest) || !sessionId;
}
function send(message: Record<string, any>) { socket?.send(JSON.stringify(message)); }

function sessionCountText(sampleCounts: Record<string, number>) {
  return ["l", "m", "r"].map((arm) => `${arm.toUpperCase()} ${Number(sampleCounts[arm] || 0)}/${minimumSamplesPerArm || "?"}`).join(" · ");
}

function renderSessionHistory() {
  const selected = sessionId || sessionHistory.value;
  sessionHistory.replaceChildren();
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = calibrationSessions.length ? "选择一个历史会话" : "没有历史会话";
  sessionHistory.append(placeholder);
  calibrationSessions.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.session_id;
    option.textContent = `${item.session_id} · ${sessionCountText(item.sample_counts)} · ${item.solved ? "已求解" : "未求解"}`;
    sessionHistory.append(option);
  });
  sessionHistory.disabled = calibrationSessions.length === 0;
  if (calibrationSessions.some((item) => item.session_id === selected)) sessionHistory.value = selected;
  loadSessionButton.disabled = !sessionHistory.value;
  deleteSessionButton.disabled = !sessionHistory.value;
}

async function refreshSessionHistory(deleteEmpty = false) {
  refreshSessionsButton.disabled = true;
  try {
    const response = await fetch(`/api/calibration/sessions${deleteEmpty ? "?delete_empty=true" : ""}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const body = await response.json();
    calibrationSessions = Array.isArray(body.sessions) ? body.sessions : [];
    renderSessionHistory();
    const deleted = Array.isArray(body.deleted_session_ids) ? body.deleted_session_ids : [];
    writeLog(`已读取 ${calibrationSessions.length} 个历史标定会话${deleted.length ? `；已清理 ${deleted.length} 个 0/30 空会话` : ""}`);
  } catch (error) {
    calibrationSessions = [];
    renderSessionHistory();
    writeLog(`读取历史会话失败：${String(error)}`);
  } finally {
    refreshSessionsButton.disabled = false;
  }
}

function loadSelectedSession() {
  const selected = calibrationSessions.find((item) => item.session_id === sessionHistory.value);
  if (!selected) return;
  sessionId = selected.session_id;
  sessionInput.value = sessionId;
  newSession.checked = false;
  sessionState.textContent = `LOADED ${sessionCountText(selected.sample_counts)}`;
  solveState.textContent = selected.solved ? "SOLVED" : "READY";
  writeLog(`已加载历史会话 ${sessionId}${selected.solved ? "（已有求解结果）" : ""}`);
  updateButtons();
}

async function deleteSelectedSession() {
  const selected = calibrationSessions.find((item) => item.session_id === sessionHistory.value);
  if (!selected) return;
  if (!window.confirm(`删除 ${selected.session_id}？\n这会永久删除该会话的图片、样本 JSON 和求解结果。`)) return;
  deleteSessionButton.disabled = true;
  try {
    const response = await fetch(`/api/calibration/sessions/${encodeURIComponent(selected.session_id)}`, { method: "DELETE" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (sessionId === selected.session_id) {
      sessionId = "";
      sessionInput.value = "";
      sessionState.textContent = "NO SESSION";
      solveState.textContent = "WAITING";
    }
    writeLog(`已删除历史会话 ${selected.session_id}`);
    await refreshSessionHistory(false);
    updateButtons();
  } catch (error) {
    writeLog(`删除历史会话失败：${String(error)}`);
  } finally {
    deleteSessionButton.disabled = !sessionHistory.value;
  }
}

function showPreviews(arms: string[], paths: string[], statuses: string[] = [], messages: string[] = []) {
  previews.replaceChildren();
  const labels: Record<string, string> = { l: "LEFT / l", m: "MIDDLE / m", r: "RIGHT / r" };
  arms.forEach((arm, index) => {
    const figure = document.createElement("figure");
    const path = paths[index];
    if (path) {
      const image = document.createElement("img");
      image.src = path;
      image.alt = `${labels[arm] || arm} 最近一次 ChArUco 检测画面`;
      image.loading = "lazy";
      figure.append(image);
    } else {
      const missing = document.createElement("div");
      missing.className = "preview-missing";
      missing.textContent = "没有可用画面";
      figure.append(missing);
    }
    const caption = document.createElement("figcaption");
    const status = statuses[index] || "unknown";
    caption.innerHTML = `<strong>${labels[arm] || arm} · ${status === "detected" ? "已检测到 ChArUco" : "未检测到 ChArUco"}</strong><span>${messages[index] || ""}</span>`;
    figure.append(caption);
    previews.append(figure);
  });
  const detected = statuses.filter((status) => status === "detected").length;
  previewState.textContent = `${detected}/3 DETECTED`;
  previewState.className = `status ${detected === 3 ? "ready" : "offline"}`;
}

function formatSeconds(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? `${(value * 1000).toFixed(0)} ms` : "—";
}

function renderCameraHealth(inputs: any[]) {
  cameraHealth.replaceChildren();
  const labels: Record<string, string> = { l: "LEFT", m: "MIDDLE", r: "RIGHT" };
  const rank: Record<string, number> = { healthy: 0, delayed: 1, unsynchronized: 1, stale: 2, missing: 3 };
  let worst = "healthy";
  inputs.forEach((input) => {
    if ((rank[input.status] ?? 3) > (rank[worst] ?? 3)) worst = input.status;
    const card = document.createElement("article");
    card.className = `camera-card ${input.status || "missing"}`;
    card.innerHTML = `<div class="camera-card-title"><strong>${labels[input.arm_id] || input.camera_id}</strong><span>${String(input.status || "missing").toUpperCase()}</span></div><p>${input.message || "unknown camera state"}</p><dl><div><dt>Image</dt><dd>${input.image_received ? "received" : "missing"}</dd></div><div><dt>Info</dt><dd>${input.camera_info_received ? "received" : "missing"}</dd></div><div><dt>帧新鲜度</dt><dd>${formatSeconds(input.image_age_sec)}</dd></div><div><dt>时间戳延迟</dt><dd>${formatSeconds(input.image_timestamp_delay_sec)}</dd></div><div><dt>Image/Info 偏差</dt><dd>${formatSeconds(input.image_camera_info_skew_sec)}</dd></div><div><dt>分辨率</dt><dd>${input.image_width && input.image_height ? `${input.image_width} × ${input.image_height}` : "—"}</dd></div></dl>`;
    cameraHealth.append(card);
  });
  if (!inputs.length) worst = "missing";
  healthState.textContent = worst.toUpperCase();
  healthState.className = `status ${worst === "healthy" ? "ready" : "offline"}`;
}

async function loadConfig() {
  try {
    const config = await fetch("/api/calibration").then((response) => response.json());
    const board = config.board;
    minimumSamplesPerArm = Number(config.sampling.minimum_samples_per_arm);
    document.querySelector("#config")!.innerHTML = `<div><strong>${board.type.toUpperCase()}</strong> / ${board.dictionary}</div><div>网格：${board.squares_x} × ${board.squares_y}</div><div>方格：${board.square_length_m} m / Marker：${board.marker_length_m} m</div><div>最少角点：${board.minimum_corners}</div><div>每臂最少样本：${config.sampling.minimum_samples_per_arm}</div><div>手眼算法：${config.solver.hand_eye_method}</div>`;
    document.querySelector("#config")!.innerHTML += `<div>外形：${(Number(board.outer_width_m) * 1000).toFixed(0)} × ${(Number(board.outer_height_m) * 1000).toFixed(0)} mm</div><div>图案：${(Number(board.pattern_width_m) * 1000).toFixed(0)} × ${(Number(board.pattern_height_m) * 1000).toFixed(0)} mm</div>`;
    document.querySelector("#config-state")!.textContent = "CONFIG LOADED";
  } catch (error) { writeLog(`读取标定配置失败：${String(error)}`); }
}

function handle(message: EventMessage) {
  if (message.type === "hello") {
    connection.textContent = "CONNECTED"; connection.className = "status ready"; updateButtons();
  } else if (message.type === "camera_health") {
    renderCameraHealth(Array.isArray(message.inputs) ? message.inputs : []);
  } else if (message.type === "calibration_capture_result") {
    captureRequest = "";
    if (message.success) {
      sessionId = message.session_id; sessionInput.value = sessionId; newSession.checked = false;
      sessionState.textContent = `SAMPLES ${message.sample_counts.map((count: number) => `${count}/${minimumSamplesPerArm}`).join(" · ")}`;
      showPreviews(message.captured_arm_ids || ["l", "m", "r"], message.preview_image_paths || [], message.detection_statuses || [], message.detection_messages || []);
      writeLog(`采样成功 ${message.batch_id}：${message.message}`);
      void refreshSessionHistory();
    } else {
      showPreviews(["l", "m", "r"], message.latest_image_paths || [], message.detection_statuses || [], message.detection_messages || []);
      writeLog(`采样拒绝：${message.message}`);
    }
    updateButtons();
  } else if (message.type === "calibration_solve_result") {
    solveRequest = "";
    solveState.textContent = message.success ? "SOLVED" : "FAILED";
    result.textContent = message.result_json ? JSON.stringify(JSON.parse(message.result_json), null, 2) : message.message;
    if (message.success && message.layout_updated) {
      writeLog(`标定完成，机械臂相对位置已写回配置；备份：${message.layout_backup_file || "无"}`);
    } else {
      writeLog(message.success ? `标定完成：${message.message}` : `标定失败：${message.message}`);
    }
    updateButtons();
  } else if (message.type === "error") {
    if (message.request_id === captureRequest) captureRequest = "";
    if (message.request_id === solveRequest) solveRequest = "";
    writeLog(`${message.code}: ${message.message}`); updateButtons();
  }
}

function connect() {
  const protocol = location.protocol === "https:" ? "wss" : "ws";
  socket = new WebSocket(`${protocol}://${location.host}/ws`);
  socket.addEventListener("open", () => { connection.textContent = "CONNECTED"; connection.className = "status ready"; updateButtons(); });
  socket.addEventListener("close", () => { connection.textContent = "OFFLINE"; connection.className = "status offline"; updateButtons(); window.setTimeout(connect, 2000); });
  socket.addEventListener("message", (event) => { try { handle(JSON.parse(event.data)); } catch { writeLog("收到无法解析的服务器消息"); } });
}

captureButton.addEventListener("click", () => {
  captureRequest = requestId("capture");
  send({ type: "capture_calibration_sample", request_id: captureRequest, session_id: sessionInput.value.trim(), start_new_session: newSession.checked, arm_ids: ["l", "m", "r"] });
  writeLog("正在等待三臂同时检测 ChArUco…"); updateButtons();
});
solveButton.addEventListener("click", () => {
  solveRequest = requestId("solve");
  send({ type: "solve_calibration", request_id: solveRequest, session_id: sessionId });
  solveState.textContent = "SOLVING"; writeLog("正在执行三臂手眼和相对位姿求解…"); updateButtons();
});
sessionInput.addEventListener("input", () => { sessionId = sessionInput.value.trim(); updateButtons(); });
sessionHistory.addEventListener("change", () => {
  loadSessionButton.disabled = !sessionHistory.value;
  deleteSessionButton.disabled = !sessionHistory.value;
});
refreshSessionsButton.addEventListener("click", () => { void refreshSessionHistory(deleteEmptySessions.checked); });
loadSessionButton.addEventListener("click", loadSelectedSession);
deleteSessionButton.addEventListener("click", () => { void deleteSelectedSession(); });
loadConfig(); void refreshSessionHistory(); connect();
