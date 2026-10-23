import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import URDFLoader from "urdf-loader";
import "./theme.css";
import "./style.css";
import { AXIS_COLORS, VelocityTrace } from "./velocity_trace";
import { activeRouterBranch, ancestors, buildBtTree, findInputRouter, renderBreadcrumb, renderBtNode, type BtRuntime } from "./bt_tree";

type ArmId = "l" | "m" | "r";
type KeyboardArmId = "l" | "r";
type Frame = { type: number; name: string; frame_id: string };
type Joint = { name: string; lower_rad: number; upper_rad: number; lower_deg: number; upper_deg: number };
type FrameState = {
  type: number;
  name: string;
  frame_id?: string;
  controller_name?: string;
  xyz_m?: number[];
  quaternion_wxyz?: number[];
  payload_kg?: number | null;
  center_of_mass_m?: number[] | null;
};
type CoordinateState = {
  arm: ArmId;
  motion_allowed: boolean;
  preferred_reference_type: number;
  preferred_reference_name: string;
  preferred_reference: FrameState;
  tool: FrameState | null;
  work: FrameState | null;
  current_tool: string;
  current_work: string;
  expected_tool: string;
  expected_work: string;
  matched: boolean;
  tool_matched: boolean;
  work_matched: boolean;
  api2_status: number;
  message: string;
};
type Robot = {
  id: ArmId;
  model: string;
  transform: { x: number; y: number; z: number; roll: number; pitch: number; yaw: number };
  urdf_url: string;
  package_root_url: string;
  joints: Joint[];
  frames: Record<string, Frame>;
  motion: Record<string, number>;
};
// Gripper mounted on an arm flange (config/ros/end_effectors.yaml). gripper_name links the model to the
// gripper_manager name whose live position drives the opening.
type EndEffector = {
  gripper: string;
  gripper_name: string;
  urdf_url: string;
  parent_link: string;
  xyz: [number, number, number];
  rpy: [number, number, number];
  driving_joint: string;
  closed_rad: number;
  open_rad: number;
};
// Shared pedestal under the three bases (config/ros/three_robots.yaml `pedestal`), world frame, visual only.
type Pedestal = {
  frame: string;
  center_xy: [number, number];
  size_xy: [number, number];
  top_z: number;
  bottom_z: number;
  color: string;
};
type Manifest = {
  end_effectors?: Partial<Record<ArmId, EndEffector>>;
  pedestal?: Pedestal | null;
  root_frame: string;
  default_joint_position_rad: number;
  robots: Robot[];
  keyboard_control: {
    heartbeat_period_ms: number;
    input_timeout_ms: number;
    grippers: Record<KeyboardArmId, { open: string; close: string }>;
    arms: Record<KeyboardArmId, {
      bindings: Record<string, { positive: string; negative: string }>;
      linear_speed_mps: number;
      angular_speed_radps: number;
      work_reference_name: string;
      work_frame_id: string;
    }>;
  };
};
type MotionCommand = 0 | 1 | 2;
type Message = Record<string, any> & { type: string };
type RobotScene = { live: any | null; shadow: any | null };
type JointRecord = {
  id: string;
  label: string;
  created_at: string;
  updated_at: string;
  joint_degrees: number[];
};
type InputModeOption = { id: string; label: string; selectable: boolean };
type InputModeState = {
  requested_mode: string;
  selected_mode: string;
  active_mode: string;
  phase: string;
  request_id: number;
  epoch: number;
  detail: string;
};
type InputModeResult = {
  request_id: string;
  executor_request_id: number;
  accepted: boolean;
  message: string;
};
type CartesianVelocityTelemetry = {
  session_active: boolean;
  reference_type: number;
  reference_name: string;
  command_frame_id: string;
  commanded_linear_velocity_mps: number[];
  commanded_angular_velocity_radps: number[];
  limited_linear_velocity_mps: number[];
  limited_angular_velocity_radps: number[];
  measured_frame_id: string;
  measured_linear_velocity_mps: number[];
  measured_angular_velocity_radps: number[];
  measured_valid: boolean;
  command_age_ms: number;
  measured_age_ms: number;
};

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <header class="topbar">
    <div class="brand"><span class="brand-mark">RM</span><div><strong>RealMan Web Control</strong><small>ROS 2 action console</small></div></div>
    <label class="arm-picker">ARM <select id="arm-select"><option value="l">LEFT / 123</option><option value="m">MIDDLE / 125</option><option value="r">RIGHT / 124</option></select></label>
    <span id="connection" class="status-pill offline">OFFLINE</span>
    <span id="mode" class="status-pill ready">CONTROL READY</span>
    <span id="auth-button" class="status-pill ready">CONTROL OPEN</span>
    <a href="/calibration.html" class="button ghost">相机标定</a>
    <span id="docker-restart-state" class="status-pill" hidden></span>
    <button id="docker-restart" class="button ghost" type="button" hidden>重启 Docker</button>
    <button id="cancel-motion" class="button ghost" type="button" disabled>取消 Action</button>
    <button id="recover-motion" class="button secondary" type="button" disabled>恢复机械臂</button>
    <button id="stop-button" class="button danger" type="button" disabled>■ 软件停止</button>
  </header>
  <main class="workspace">
    <div class="visualization-column">
      <section class="viewer-panel panel">
        <div class="panel-heading"><div><span class="eyebrow">LIVE / TARGET</span><h1>三维姿态</h1></div><div id="model-label" class="muted">loading model</div></div>
        <div class="viewer-layout">
          <div id="fleet-strip" class="fleet-strip"></div>
          <div class="viewer-column">
            <div id="viewer" class="viewer"><canvas id="canvas" aria-label="RealMan URDF 三维模型"></canvas><div id="viewer-hover" class="viewer-hover" hidden></div><div id="viewer-state" class="viewer-state">加载 URDF…</div><div id="keyboard-frame-legend" class="keyboard-frame-legend" hidden><strong>L WORK</strong><strong>R WORK</strong><span class="axis-x">X</span><span class="axis-y">Y</span><span class="axis-z">Z</span></div><div class="legend"><span class="legend-live"></span>实体姿态 <span class="legend-shadow"></span>目标影子</div></div>
            <div class="viewer-footer"><span id="joint-stamp">等待 joint_states</span><span id="root-frame"></span></div>
          </div>
        </div>
      </section>
      <div class="status-row">
        <section id="coordinate-panel" class="panel panel-section"><div class="panel-heading compact"><div><span class="eyebrow">COORDINATES</span><h2>当前坐标</h2></div><div class="coordinate-actions"><button id="copy-current-joints" class="button ghost" type="button" disabled>复制当前角度</button><span id="coordinate-state" class="mini-state">WAIT</span></div></div><div id="coordinate-summary" class="coordinate-summary"></div><div id="joint-copy-status" class="joint-copy-status" aria-live="polite">等待有效 joint_states</div></section>
        <section id="action-monitor-panel" class="panel panel-section"><div class="panel-heading compact"><div><span class="eyebrow">ACTION MONITOR</span><h2>运行反馈</h2></div><span id="action-state" class="mini-state">IDLE</span></div><div class="progress-track"><div id="progress" class="progress-bar"></div></div><div id="feedback" class="feedback">尚未发送 Action</div><pre id="result" class="result" aria-live="polite">等待结果…</pre></section>
      </div>
      <section id="velocity-telemetry-panel" class="panel panel-section"><div class="panel-heading compact"><div><span class="eyebrow">VELOCITY TELEMETRY</span><h2>命令与实际末端速度</h2></div><span class="mini-state">L + R</span></div><div class="telemetry-legend" id="velocity-telemetry-legend">${["X", "Y", "Z"].map((axis, index) => `<span class="legend-axis"><i style="background: ${AXIS_COLORS[index]}"></i>${axis}</span>`).join("")}<span class="legend-line solid"><i></i>实际</span><span class="legend-line dashed"><i></i>命令（限速后）</span><span class="legend-hint">最近 10 s · 纵轴按数据自动缩放</span></div><div id="velocity-telemetry-grid" class="velocity-telemetry-grid"></div></section>
    </div>
    <aside class="controls">
      <section id="input-mode-card" class="panel panel-section input-mode-card" hidden>
        <div class="panel-heading compact"><div><span class="eyebrow">GLOBAL INPUT</span><h2>输入模式</h2></div><span id="input-mode-active" class="mini-state">WAIT</span></div>
        <div class="input-mode-body"><div class="input-mode-row"><label>当前选择<select id="input-mode-select" aria-label="输入模式"></select></label><button id="input-mode-restart" class="button ghost" type="button" title="先切到无输入分支，再切回当前分支，重新开始该分支" disabled>重启此分支</button></div><div id="input-mode-detail" class="input-mode-detail" aria-live="polite">等待输入模式状态</div></div>
      </section>
      <section id="bt-panel" class="panel panel-section bt-panel" aria-label="行为树" hidden>
        <div class="panel-heading compact"><div><span class="eyebrow">BEHAVIOR TREE</span><h2>行为树<span id="bt-dot" class="tab-dot"></span></h2></div><div class="panel-actions"><span id="bt-root-status" class="bt-status bt-idle">未运行</span><button id="bt-stop" class="button danger" type="button" hidden>终止行为树</button><button id="bt-collapse" class="bt-collapse" type="button" aria-expanded="true" aria-controls="bt-body" title="收起">▾</button></div></div>
        <div id="bt-body">
        <div id="bt-launcher" class="bt-launcher" hidden>
          <div class="bt-launcher-row">
            <div class="bt-picker">
              <button id="bt-picker-button" class="bt-picker-button" type="button" aria-haspopup="listbox" aria-expanded="false"><span id="bt-picker-label" class="bt-picker-label">选择行为树</span><span id="bt-picker-meta" class="bt-picker-meta"></span><span class="bt-picker-caret">▾</span></button>
              <div id="bt-picker-list" class="bt-picker-list" role="listbox" aria-label="行为树文件" hidden></div>
            </div>
            <label class="bt-real-motion" title="不勾选则 dry-run：行为树运行但不发送真实运动"><input id="bt-real-motion" type="checkbox" checked /> 真实运动</label>
            <button id="bt-start" class="button primary" type="button" disabled>启动</button>
          </div>
          <div id="bt-start-status" class="bt-stop-status" role="status" aria-live="polite" hidden></div>
          <pre id="bt-start-log" class="bt-start-log" hidden></pre>
        </div>
        <div id="bt-running" hidden>
          <div id="bt-stop-status" class="bt-stop-status" role="status" aria-live="polite" hidden></div>
          <div class="bt-meta"><span id="bt-tree-id"></span><button id="bt-scope-toggle" class="text-button" type="button" hidden>显示整棵树</button></div>
          <div id="bt-mode-reason" class="bt-mode-reason" role="status" aria-live="polite" hidden></div>
          <div id="bt-breadcrumb" class="bt-breadcrumb" hidden></div>
          <div id="bt-failure" class="bt-reason bt-root-reason" hidden></div>
          <ul id="bt-tree" class="bt-tree" aria-live="off"></ul>
        </div>
        </div>
      </section>
      <div id="control-tabs" class="control-tabs" role="tablist" aria-label="操作面板">
        <button type="button" role="tab" id="control-tab-motion" data-control-tab="motion" aria-controls="motion-panel">运动</button>
        <button type="button" role="tab" id="control-tab-velocity" data-control-tab="velocity" aria-controls="velocity-panel">速度</button>
        <button type="button" role="tab" id="control-tab-gripper" data-control-tab="gripper" aria-controls="gripper-panel">夹爪</button>
        <button type="button" role="tab" id="control-tab-keyboard" data-control-tab="keyboard" aria-controls="keyboard-control-card" hidden>键盘</button>
      </div>
      <section id="keyboard-control-card" class="panel panel-section keyboard-control-card" role="tabpanel" aria-labelledby="control-tab-keyboard" data-control-panel="keyboard" hidden>
        <div class="panel-heading compact"><div><span class="eyebrow">KEYBOARD / L + R</span><h2>双臂键盘速度与夹爪</h2></div><span id="keyboard-control-state" class="mini-state">RELEASED</span></div>
        <p class="keyboard-help">切换到“Web / 键盘速度控制”后：机械臂按住运动，松键、失焦或通信超时停止；夹爪按一次全开／全闭，松键不撤销已提交目标。仅在在线且无报警时接收新夹爪指令。</p>
        <div class="keyboard-arm-grid">
          <div id="keyboard-left" class="keyboard-arm" data-arm="l"></div>
          <div id="keyboard-right" class="keyboard-arm" data-arm="r"></div>
        </div>
      </section>
      <section id="motion-panel" class="panel panel-section motion-panel" role="tabpanel" aria-labelledby="control-tab-motion" data-control-panel="motion">
        <div class="panel-heading compact"><div><span class="eyebrow">MOTION TARGET</span><h2>一次性运动</h2></div><div class="panel-actions"><span id="selected-arm-label" class="mini-state">L</span><button id="reset-preview" class="text-button" type="button">重置目标</button></div></div>
        <div id="motion-mode" class="segmented-control" aria-label="运动类型">
          <button type="button" class="selected" data-motion-command="0" aria-pressed="true">MOVEJ</button>
          <button type="button" data-motion-command="1" aria-pressed="false">MOVEL</button>
          <button type="button" data-motion-command="2" aria-pressed="false">MOVEP</button>
        </div>
        <div id="joint-target">
          <div class="joint-toolbar"><span class="target-field-label">关节目标 (degree)</span></div>
          <div id="joint-controls" class="joint-controls"></div>
        </div>
        <div id="pose-target" class="pose-target" hidden>
          <div class="target-field-label">位置 (m)</div>
          <div class="pose-inputs position-inputs">
            <label>X<input id="pose-x" type="number" step="0.001" inputmode="decimal" /></label>
            <label>Y<input id="pose-y" type="number" step="0.001" inputmode="decimal" /></label>
            <label>Z<input id="pose-z" type="number" step="0.001" inputmode="decimal" /></label>
          </div>
          <div class="pose-reference-picker">
            <label>参考坐标系<select id="pose-reference-frame"></select></label>
          </div>
          <div id="pose-sliders" class="pose-sliders" aria-label="XYZ position sliders"></div>
          <div class="target-field-label">四元数 WXYZ</div>
          <div class="pose-inputs quaternion-inputs">
            <label>W<input id="pose-qw" type="number" step="0.001" inputmode="decimal" /></label>
            <label>X<input id="pose-qx" type="number" step="0.001" inputmode="decimal" /></label>
            <label>Y<input id="pose-qy" type="number" step="0.001" inputmode="decimal" /></label>
            <label>Z<input id="pose-qz" type="number" step="0.001" inputmode="decimal" /></label>
          </div>
          <div id="pose-kinematics-actions" class="pose-kinematics-actions" hidden>
            <button id="fill-current-pose" class="button secondary" type="button">填入当前位置</button>
            <button id="solve-ik" class="button ghost" type="button">计算逆解</button>
          </div>
          <div id="kinematics-status" class="kinematics-status" aria-live="polite">MOVEL 逆解仅更新影子预览</div>
        </div>
        <div class="joint-records">
          <div class="target-field-label">关节记录</div>
          <div class="record-save-row">
            <input id="record-name" type="text" maxlength="64" placeholder="record name" />
            <button id="save-record" class="button secondary" type="button" disabled>记录当前</button>
          </div>
          <div class="record-apply-row">
            <select id="record-select"></select>
            <button id="apply-record" class="button ghost" type="button" disabled>填入</button>
            <button id="delete-record" class="button danger" type="button" disabled>删除</button>
          </div>
          <div id="record-status" class="record-status" aria-live="polite">等待记录列表</div>
        </div>
        <div class="motion-parameters">
          <label>激活参考系<output id="motion-reference">BASE / base</output></label>
          <label>速度 (%)<input id="motion-velocity" type="number" min="1" max="100" step="1" value="30" /></label>
          <label>超时 (s)<input id="motion-timeout" type="number" min="0.1" step="0.1" /></label>
        </div>
        <button id="execute-motion" class="button primary full" type="button" disabled>发送 MOVEJ</button>
      </section>
      <section id="velocity-panel" class="panel panel-section" role="tabpanel" aria-labelledby="control-tab-velocity" data-control-panel="velocity"><div class="panel-heading compact"><div><span class="eyebrow">CARTESIAN</span><h2>末端速度</h2></div><span id="velocity-state" class="mini-state">IDLE</span></div><div class="form-grid"><label>参考系<select id="velocity-frame"></select></label><label>周期 (ms)<input id="velocity-period" type="number" min="1" step="1" /></label><label>看门狗 (ms)<input id="velocity-watchdog" type="number" min="1" step="1" /></label><label>线加速度<input id="linear-accel" type="number" min="0.001" step="0.01" /></label><label>角加速度<input id="angular-accel" type="number" min="0.001" step="0.01" /></label></div><div id="velocity-inputs" class="velocity-inputs"></div><div class="inline-actions"><button id="start-velocity" class="button secondary" type="button" disabled>启动速度 Action</button><button id="cancel-velocity" class="button ghost" type="button" disabled>取消</button></div></section>
      <section id="gripper-panel" class="panel panel-section" role="tabpanel" aria-labelledby="control-tab-gripper" data-control-panel="gripper"><div class="panel-heading compact"><div><span class="eyebrow">GRIPPER</span><h2>夹爪控制</h2></div><span id="gripper-state" class="mini-state">WAIT</span></div><div class="form-grid"><label>设备<select id="gripper-select"></select></label><label>开合度 (0=闭合)<input id="gripper-percentage" type="range" min="0" max="1" step="0.01" value="1" /></label></div><div class="inline-actions"><button id="gripper-open" class="button secondary" type="button">打开</button><button id="gripper-close" class="button secondary" type="button">闭合</button><button id="gripper-enable" class="button ghost" type="button">使能</button><button id="gripper-reset" class="button danger" type="button">复位</button></div><div id="gripper-feedback" class="feedback">等待夹爪状态</div><details id="gripper-limits" class="gripper-limits"><summary>行程设置</summary><div class="gripper-limits-body"><div class="form-grid"><label>开位<input id="gripper-open-position" type="number" step="1" /></label><label>闭位<input id="gripper-close-position" type="number" step="1" /></label></div><div class="inline-actions"><button id="gripper-teach-open" class="button ghost" type="button">开位=当前位置</button><button id="gripper-teach-close" class="button ghost" type="button">闭位=当前位置</button></div><label class="gripper-raw">原始位置 <output id="gripper-raw-value">0</output><input id="gripper-raw-position" type="range" min="0" max="1" step="1" value="0" /></label><button id="gripper-limits-apply" class="button primary full" type="button">应用行程</button><div id="gripper-limits-range" class="feedback"></div><div id="gripper-limits-status" class="feedback" role="status" aria-live="polite"></div></div></details></section>
    </aside>
  </main>
`;

const $ = <T extends Element>(selector: string) => document.querySelector<T>(selector)!;
const ARM_COLORS: Record<ArmId, number> = { l: 0x2d9b9d, m: 0xd47746, r: 0x84949a };
const armSelect = $("#arm-select") as HTMLSelectElement;
const connection = $("#connection");
const mode = $("#mode");
const stopButton = $("#stop-button") as HTMLButtonElement;
const cancelMotionButton = $("#cancel-motion") as HTMLButtonElement;
const recoverMotionButton = $("#recover-motion") as HTMLButtonElement;
const executeMotionButton = $("#execute-motion") as HTMLButtonElement;
const startVelocityButton = $("#start-velocity") as HTMLButtonElement;
const cancelVelocityButton = $("#cancel-velocity") as HTMLButtonElement;
const actionState = $("#action-state");
const velocityState = $("#velocity-state");
const coordinateStateLabel = $("#coordinate-state");
const coordinateSummary = $("#coordinate-summary");
const feedback = $("#feedback");
const result = $("#result");
const progress = $("#progress") as HTMLElement;
const viewerState = $("#viewer-state");
const canvas = $("#canvas") as HTMLCanvasElement;
const viewer = $("#viewer");
const fleetStrip = $("#fleet-strip");
const selectedArmLabel = $("#selected-arm-label");
const inputModeCard = $("#input-mode-card") as HTMLElement;
const inputModeSelect = $("#input-mode-select") as HTMLSelectElement;
const inputModeActive = $("#input-mode-active");
const inputModeDetail = $("#input-mode-detail");
const inputModeRestart = $("#input-mode-restart") as HTMLButtonElement;
const keyboardControlCard = $("#keyboard-control-card") as HTMLElement;
const keyboardControlState = $("#keyboard-control-state");
const keyboardFrameLegend = $("#keyboard-frame-legend") as HTMLElement;
const keyboardControlTab = $("#control-tab-keyboard") as HTMLButtonElement;
type ControlTab = "motion" | "velocity" | "gripper" | "keyboard";
const controlTabStorageKey = "realman-web-control.tab";
let activeControlTab: ControlTab = "motion";
try {
  const stored = window.localStorage.getItem(controlTabStorageKey);
  if (stored === "motion" || stored === "velocity" || stored === "gripper" || stored === "keyboard") activeControlTab = stored;
} catch {
  // Storage can be blocked; the motion tab is a safe default.
}
function selectControlTab(tab: ControlTab, remember = true) {
  activeControlTab = tab;
  if (remember) {
    try { window.localStorage.setItem(controlTabStorageKey, tab); } catch { /* per-viewer convenience only */ }
  }
  renderControlTabs();
}
function renderControlTabs() {
  // Keyboard and behavior-tree tabs only exist while their source is live; until then the
  // remembered choice falls back to motion.
  const activeButton = document.querySelector<HTMLButtonElement>(`[data-control-tab="${activeControlTab}"]`);
  const shown = activeButton?.hidden ? "motion" : activeControlTab;
  document.querySelectorAll<HTMLButtonElement>("[data-control-tab]").forEach((button) => {
    const selected = button.dataset.controlTab === shown;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  document.querySelectorAll<HTMLElement>("[data-control-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.controlPanel !== shown;
  });
}
$("#control-tabs").addEventListener("click", (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-control-tab]");
  if (!button || button.hidden) return;
  const reopenedMotion = button.dataset.controlTab === "motion" && activeControlTab !== "motion";
  selectControlTab(button.dataset.controlTab as ControlTab);
  // Sliders do not follow live joint_states, so opening the motion tab starts from the real pose.
  if (reopenedMotion) resetMotionTarget();
});
renderControlTabs();
const velocityTelemetryGrid = $("#velocity-telemetry-grid") as HTMLElement;
const motionMode = $("#motion-mode");
const jointTarget = $("#joint-target") as HTMLElement;
const poseTarget = $("#pose-target") as HTMLElement;
const poseReferenceFrame = $("#pose-reference-frame") as HTMLSelectElement;
const poseSliders = $("#pose-sliders") as HTMLElement;
const poseKinematicsActions = $("#pose-kinematics-actions") as HTMLElement;
const fillCurrentPoseButton = $("#fill-current-pose") as HTMLButtonElement;
const solveIkButton = $("#solve-ik") as HTMLButtonElement;
const kinematicsStatus = $("#kinematics-status");
const resetPreviewButton = $("#reset-preview") as HTMLButtonElement;
const motionReference = $("#motion-reference");
const motionVelocityInput = $("#motion-velocity") as HTMLInputElement;
const motionTimeoutInput = $("#motion-timeout") as HTMLInputElement;
const copyCurrentJointsButton = $("#copy-current-joints") as HTMLButtonElement;
const jointCopyStatus = $("#joint-copy-status");
const recordNameInput = $("#record-name") as HTMLInputElement;
const saveRecordButton = $("#save-record") as HTMLButtonElement;
const recordSelect = $("#record-select") as HTMLSelectElement;
const applyRecordButton = $("#apply-record") as HTMLButtonElement;
const deleteRecordButton = $("#delete-record") as HTMLButtonElement;
const recordStatus = $("#record-status");
const POSE_INPUT_IDS = ["pose-x", "pose-y", "pose-z", "pose-qw", "pose-qx", "pose-qy", "pose-qz"] as const;
const MOTION_LABELS: Record<MotionCommand, string> = { 0: "MOVEJ", 1: "MOVEL", 2: "MOVEP" };
const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#39;",
};

let manifest: Manifest | undefined;
let selectedArm: ArmId = "l";
let selectedMotionCommand: MotionCommand = 0;
let targetJoints: number[] = [];
let currentJoints: number[] = [];
let socket: WebSocket | undefined;
const gripperStates: Record<string, any> = {};
// Static gripper config (open/close endpoints in device units) from the gripper_list event.
const gripperConfigs: Record<string, any> = {};
const gripperModels: Partial<Record<ArmId, any>> = {};
let selectedGripper = "";
// Unapplied edits in the travel-limit inputs must survive gripper_list broadcasts.
let gripperLimitsDirty = false;
let readOnly = false;
let inputModeCatalog: InputModeOption[] | undefined;
let inputModeState: InputModeState | undefined;
let inputModeResultDetail = "";
let activeInputModeRequest = "";
let activeInputModeExecutorRequest: number | undefined;
let pendingInputModeId = "";
// Set while "重启此分支" waits for the router to settle on none; the branch to select again then.
let restartInputModeTarget = "";
let activeMotionRequest = "";
let motionFeedbackTimer = 0;
let activeVelocityRequest = "";
let velocityTimer = 0;
const keyboardPressed: Record<KeyboardArmId, Set<string>> = { l: new Set(), r: new Set() };
const keyboardSequence: Record<KeyboardArmId, number> = { l: 0, r: 0 };
let keyboardHeartbeat = 0;
let keyboardLeaseOwned = false;
let keyboardGuideEpoch: number | undefined;
let keyboardGuideTimer = 0;
const coordinateStates: Partial<Record<ArmId, CoordinateState>> = {};
const connectionStates: Partial<Record<ArmId, boolean>> = {};
const currentJointsByArm: Partial<Record<ArmId, number[]>> = {};
const lastJointStampByArm: Partial<Record<ArmId, number>> = {};
const nonZeroJointStateByArm: Partial<Record<ArmId, boolean>> = {};
const targetJointsByArm: Partial<Record<ArmId, number[]>> = {};
const targetEditedByArm: Partial<Record<ArmId, boolean>> = {};
const poseTargetsByArm: Partial<Record<ArmId, string[]>> = {};
const poseReferenceByArm: Partial<Record<ArmId, FrameState>> = {};
const tfFramesByArm: Partial<Record<ArmId, FrameState[]>> = {};
const poseSliderCentersByArm: Partial<Record<ArmId, number[]>> = {};
const kinematicsStatusByArm: Partial<Record<ArmId, string>> = {};
const cartesianVelocityStates: Partial<Record<ArmId, CartesianVelocityTelemetry>> = {};
const activeKinematicsRequestByArm: Partial<Record<ArmId, string>> = {};
const ikPreviewValidByArm: Partial<Record<ArmId, boolean>> = {};
const motionSettingsByArm: Partial<Record<ArmId, { velocity: string; timeout: string }>> = {};
const jointRecordsByArm: Partial<Record<ArmId, JointRecord[]>> = {};
const recordStatusByArm: Partial<Record<ArmId, string>> = {};
const activeRecordRequestByArm: Partial<Record<ArmId, string>> = {};
const recordRequestTimerByArm: Partial<Record<ArmId, number>> = {};
const activeRecoveryRequestByArm: Partial<Record<ArmId, string>> = {};
const robotScenes: Partial<Record<ArmId, RobotScene>> = {};
const keyboardWorkFrames: Partial<Record<KeyboardArmId, THREE.AxesHelper>> = {};
let renderer: THREE.WebGLRenderer | undefined;
let scene: THREE.Scene | undefined;
let camera: THREE.PerspectiveCamera | undefined;
let controls: OrbitControls | undefined;
let selectedShadowArm: ArmId | null = null;
let loadGeneration = 0;

function robot() {
  if (!manifest) throw new Error("manifest not loaded");
  return manifest.robots.find((item) => item.id === selectedArm)!;
}
function robotConfig(arm: ArmId) {
  if (!manifest) throw new Error("manifest not loaded");
  return manifest.robots.find((item) => item.id === arm)!;
}
function requestId(prefix: string) { return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`; }
function canWrite() { return !readOnly && socket?.readyState === WebSocket.OPEN; }
function inputModeLabel(modeId: string) {
  return inputModeCatalog?.find((option) => option.id === modeId)?.label ?? modeId;
}
function keyboardModeDiscovered() {
  return Boolean(inputModeCatalog?.some((option) => option.id === "keyboard" && option.selectable));
}
function keyboardModeActive() {
  return keyboardLeaseOwned && keyboardModeDiscovered() && inputModeState?.phase === "ACTIVE" && inputModeState.active_mode === "keyboard";
}
function keyboardModeGloballyActive() {
  return keyboardModeDiscovered() && inputModeState?.phase === "ACTIVE" && inputModeState.active_mode === "keyboard";
}
function keyboardWorkAvailable(arm: KeyboardArmId) {
  const settings = manifest?.keyboard_control?.arms[arm];
  const state = coordinateStates[arm];
  return Boolean(settings && state?.motion_allowed === true && state.work_matched === true &&
    state.current_work === settings.work_reference_name && state.expected_work === settings.work_reference_name &&
    state.work?.name === settings.work_reference_name && state.work?.frame_id === settings.work_frame_id);
}
function keyboardGripperAvailable(arm: KeyboardArmId) {
  const state = gripperStates[arm === "l" ? "gripper_left" : "gripper_right"];
  return state?.connected === true && state.alarm === 0;
}
function keyboardVelocityCodes(arm: KeyboardArmId) {
  const bindings = manifest?.keyboard_control?.arms[arm]?.bindings ?? {};
  return new Set(Object.values(bindings).flatMap((binding) => [binding.positive, binding.negative]));
}
function keyboardGripperCodes(arm: KeyboardArmId) {
  return new Set(Object.values(manifest?.keyboard_control?.grippers?.[arm] ?? {}));
}
function keyboardCodeReady(arm: KeyboardArmId, code: string) {
  return keyboardModeActive() && canWrite() && !document.hidden &&
    (keyboardGripperCodes(arm).has(code) ? keyboardGripperAvailable(arm) : keyboardWorkAvailable(arm));
}
function keyboardArmForCode(code: string): KeyboardArmId | undefined {
  for (const arm of ["l", "r"] as const) {
    if (keyboardVelocityCodes(arm).has(code) || keyboardGripperCodes(arm).has(code)) return arm;
  }
  return undefined;
}
function sendKeyboardState(arm: KeyboardArmId) {
  send({ type: "keyboard_state", arm, keys: [...keyboardPressed[arm]].sort(), sequence: ++keyboardSequence[arm] });
}
function sendKeyboardStates() {
  for (const arm of ["l", "r"] as const) sendKeyboardState(arm);
}
function stopKeyboardHeartbeat() {
  if (keyboardHeartbeat) window.clearInterval(keyboardHeartbeat);
  keyboardHeartbeat = 0;
}
function releaseKeyboardInput() {
  const shouldSend = keyboardLeaseOwned && socket?.readyState === WebSocket.OPEN;
  keyboardPressed.l.clear();
  keyboardPressed.r.clear();
  stopKeyboardHeartbeat();
  if (shouldSend) sendKeyboardStates();
  renderKeyboardControl();
}
function reconcileKeyboardControl() {
  if (!keyboardModeActive() || !canWrite()) {
    releaseKeyboardInput();
    return;
  }
  for (const arm of ["l", "r"] as const) {
    let changed = false;
    for (const code of keyboardPressed[arm]) {
      if (!keyboardCodeReady(arm, code)) {
        keyboardPressed[arm].delete(code);
        changed = true;
      }
    }
    if (changed) sendKeyboardState(arm);
  }
  if (!keyboardHeartbeat) {
    sendKeyboardStates();
    keyboardHeartbeat = window.setInterval(sendKeyboardStates, manifest!.keyboard_control.heartbeat_period_ms);
  }
  renderKeyboardControl();
}
function renderKeyboardArm(arm: KeyboardArmId) {
  const host = $(arm === "l" ? "#keyboard-left" : "#keyboard-right");
  const settings = manifest?.keyboard_control?.arms[arm];
  if (!settings) { host.replaceChildren(); return; }
  const axisLabels: Record<string, string> = { vx: "X", vy: "Y", vz: "Z", wx: "RX", wy: "RY", wz: "RZ" };
  const keyLabel = (code: string) => escapeHtml(code.replace(/^(Key|Digit)/, ""));
  const gripper = manifest?.keyboard_control?.grippers?.[arm];
  const health = gripperStates[arm === "l" ? "gripper_left" : "gripper_right"];
  const gripperStatus = health?.connected !== true ? "OFFLINE" : health.alarm !== 0 ? "ALARM" : "READY";
  host.innerHTML = `<div class="keyboard-arm-heading"><strong>${arm === "l" ? "LEFT / L" : "RIGHT / R"}</strong><span>${escapeHtml(settings.work_frame_id)}</span></div><div class="keyboard-bindings ${keyboardWorkAvailable(arm) ? "" : "unavailable"}">${Object.entries(settings.bindings).map(([axis, binding]) => `
    <div class="keyboard-binding"><span>${axisLabels[axis] ?? axis}</span><kbd data-code="${escapeHtml(binding.positive)}">${keyLabel(binding.positive)}</kbd><em>+</em><kbd data-code="${escapeHtml(binding.negative)}">${keyLabel(binding.negative)}</kbd><em>−</em></div>`).join("")}</div>
    ${gripper ? `<div class="keyboard-gripper ${keyboardGripperAvailable(arm) ? "" : "unavailable"}"><div class="keyboard-arm-heading"><strong>夹爪 / 单次目标</strong><span>${gripperStatus}</span></div><div class="keyboard-binding gripper-binding"><kbd data-code="${escapeHtml(gripper.open)}">${keyLabel(gripper.open)}</kbd><span>全开</span><kbd data-code="${escapeHtml(gripper.close)}">${keyLabel(gripper.close)}</kbd><span>全闭</span></div></div>` : ""}`;
  host.querySelectorAll<HTMLElement>("kbd[data-code]").forEach((key) => key.classList.toggle("pressed", keyboardPressed[arm].has(key.dataset.code ?? "")));
}
function renderKeyboardControl() {
  const keyboardAvailable = keyboardModeDiscovered() && Boolean(manifest?.keyboard_control);
  if (keyboardControlTab.hidden !== !keyboardAvailable) {
    keyboardControlTab.hidden = !keyboardAvailable;
    renderControlTabs();
  }
  if (!keyboardAvailable) return;
  renderKeyboardArm("l");
  renderKeyboardArm("r");
  const moving = (["l", "r"] as const).some((arm) => [...keyboardPressed[arm]].some((code) => keyboardVelocityCodes(arm).has(code)));
  const anyAvailable = keyboardWorkAvailable("l") || keyboardWorkAvailable("r");
  const gripperAvailable = keyboardGripperAvailable("l") || keyboardGripperAvailable("r");
  const label = !keyboardModeGloballyActive() ? "RELEASED" : !keyboardLeaseOwned ? "REMOTE" : !anyAvailable ? (gripperAvailable ? "GRIPPER ONLY" : "WORK UNAVAILABLE") : moving ? "MOVING" : "READY";
  keyboardControlState.textContent = label;
  keyboardControlState.className = `mini-state keyboard-${label.toLowerCase().replaceAll(" ", "-")}`;
}
function keyboardWorkFramePose(arm: KeyboardArmId) {
  const work = coordinateStates[arm]?.work;
  const position = work?.xyz_m?.map(Number);
  const quaternion = work?.quaternion_wxyz?.map(Number);
  if (!keyboardWorkAvailable(arm) || position?.length !== 3 || quaternion?.length !== 4 ||
      ![...position, ...quaternion].every(Number.isFinite) || Math.hypot(...quaternion) < 1e-9) return undefined;
  return { position, quaternion };
}
function updateKeyboardWorkFrames() {
  const visibleArms: KeyboardArmId[] = [];
  for (const arm of ["l", "r"] as const) {
    const robotScene = robotScenes[arm];
    let axes = keyboardWorkFrames[arm];
    if (robotScene?.live && axes?.parent !== robotScene.live) {
      axes?.removeFromParent();
      axes = new THREE.AxesHelper(0.18);
      axes.name = `${arm}-keyboard-work-frame`;
      axes.renderOrder = 20;
      axes.traverse((object: any) => {
        if (object.material) {
          object.material.depthTest = false;
          object.material.transparent = true;
        }
      });
      robotScene.live.add(axes);
      keyboardWorkFrames[arm] = axes;
    }
    const pose = keyboardWorkFramePose(arm);
    const visible = Boolean(axes && keyboardModeGloballyActive() && pose);
    if (axes) {
      axes.visible = visible;
      if (pose) {
        axes.position.fromArray(pose.position);
        axes.quaternion.set(
          pose.quaternion[1], pose.quaternion[2], pose.quaternion[3], pose.quaternion[0],
        ).normalize();
        axes.updateMatrixWorld(true);
      }
    }
    if (visible) visibleArms.push(arm);
  }
  viewer.dataset.keyboardWorkFrames = visibleArms.join(",");
  keyboardFrameLegend.hidden = visibleArms.length === 0;
}
function guideToKeyboardControl() {
  if (!keyboardModeActive() || inputModeState?.epoch === keyboardGuideEpoch || keyboardControlTab.hidden) return;
  keyboardGuideEpoch = inputModeState!.epoch;
  // This page now owns the keyboard lease, so bring its tab forward without
  // scrolling; the 3D viewer and status panels stay where they are.
  selectControlTab("keyboard", false);
  keyboardControlCard.classList.add("keyboard-guide-active");
  if (keyboardGuideTimer) window.clearTimeout(keyboardGuideTimer);
  keyboardGuideTimer = window.setTimeout(() => {
    keyboardControlCard.classList.remove("keyboard-guide-active");
    keyboardGuideTimer = 0;
  }, 1800);
}
function selectableInputMode(modeId: string) {
  return inputModeCatalog?.find((option) => option.id === modeId && option.id !== "web" && option.selectable);
}
// The branch "重启此分支" would restart: the active one, when it is a real branch and none can be selected.
function restartableInputMode() {
  const state = inputModeState;
  if (state?.phase !== "ACTIVE" || state.active_mode === "none" || !selectableInputMode("none")) return undefined;
  return selectableInputMode(state.active_mode);
}
function updateInputModeSelectionDisabled() {
  inputModeSelect.disabled = !canWrite() || Boolean(activeInputModeRequest) || inputModeState?.phase === "SWITCHING" ||
    !(inputModeCatalog?.some((option) => option.id !== "web" && option.selectable));
  inputModeRestart.disabled = !canWrite() || Boolean(activeInputModeRequest) || !restartableInputMode();
}
function clearInputModeRequest() {
  activeInputModeRequest = "";
  activeInputModeExecutorRequest = undefined;
  pendingInputModeId = "";
  restartInputModeTarget = "";
}
function requestInputMode(option: InputModeOption, detail: string) {
  activeInputModeRequest = requestId("input-mode");
  activeInputModeExecutorRequest = undefined;
  pendingInputModeId = option.id;
  inputModeResultDetail = detail;
  renderInputModeCard();
  send({ type: "select_input_mode", request_id: activeInputModeRequest, mode_id: option.id });
}
function renderInputModeCard() {
  inputModeCard.hidden = !inputModeCatalog;
  if (!inputModeCatalog) {
    reconcileKeyboardControl();
    updateKeyboardWorkFrames();
    return;
  }
  const remoteKeyboard = inputModeState?.phase === "ACTIVE" &&
    inputModeState.active_mode === "keyboard" && !keyboardLeaseOwned;
  const selectedMode = remoteKeyboard && !pendingInputModeId
    ? ""
    : pendingInputModeId || inputModeState?.selected_mode;
  inputModeSelect.replaceChildren(...inputModeCatalog
    .filter((option) => option.id !== "web")
    .map((option) => {
      const element = document.createElement("option");
      element.value = option.id;
      element.textContent = option.label;
      element.disabled = !option.selectable;
      return element;
    }));
  if (selectedMode && Array.from(inputModeSelect.options).some((option) => option.value === selectedMode)) {
    inputModeSelect.value = selectedMode;
  } else {
    inputModeSelect.selectedIndex = -1;
  }
  const state = inputModeState;
  inputModeActive.textContent = state ? `${inputModeLabel(state.active_mode)} / ${state.phase}` : "WAIT";
  inputModeActive.className = `mini-state ${state?.phase.toLowerCase() ?? ""}`;
  // The BT often reports an empty detail; describe the phase rather than looking like no state arrived.
  const phaseDetail = !state ? "等待输入模式状态"
    : state.phase === "ACTIVE" ? `行为树已切换到 ${inputModeLabel(state.active_mode)}（epoch ${state.epoch}）`
    : state.phase === "SWITCHING" ? `正在切换到 ${inputModeLabel(state.requested_mode)}…`
    : state.phase === "FAILED" ? `切换到 ${inputModeLabel(state.requested_mode)} 失败`
    : state.phase;
  inputModeDetail.textContent = state?.detail || inputModeResultDetail || phaseDetail;
  updateInputModeSelectionDisabled();
  reconcileKeyboardControl();
  guideToKeyboardControl();
  updateKeyboardWorkFrames();
}
function finishInputModeRequestIfTerminal() {
  if (!activeInputModeRequest || activeInputModeExecutorRequest === undefined || !inputModeState ||
      inputModeState.request_id !== activeInputModeExecutorRequest ||
      !["ACTIVE", "FAILED"].includes(inputModeState.phase)) return;
  inputModeSelect.blur();
  const restartTarget = restartInputModeTarget;
  clearInputModeRequest();
  if (!restartTarget) return;
  // Second half of "重启此分支": the router has halted the branch and ticked none, so select it again.
  const option = selectableInputMode(restartTarget);
  if (inputModeState.phase === "ACTIVE" && inputModeState.active_mode === "none" && option && canWrite()) {
    requestInputMode(option, `重启 ${option.label}：正在切回…`);
  }
}
function displayNumber(value: number, digits = 2) {
  return Number.isFinite(value) ? value.toFixed(digits) : "";
}
function displayValue(value: unknown, digits = 2) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(digits) : String(value ?? "");
}
function formatJointDegrees(values: number[]) {
  return `[${values.map((value) => (value * 180 / Math.PI).toFixed(3)).join(", ")}]`;
}
async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const fallback = document.createElement("textarea");
  fallback.value = value;
  fallback.setAttribute("readonly", "");
  fallback.style.position = "fixed";
  fallback.style.opacity = "0";
  document.body.append(fallback);
  fallback.select();
  const copied = document.execCommand("copy");
  fallback.remove();
  if (!copied) throw new Error("clipboard copy failed");
}
function referenceLabel(frame?: FrameState | null) {
  if (!frame) return "BASE / base";
  const prefix = frame.type === 1 ? "WORK" : frame.type === 2 ? "TOOL" : frame.type === 3 ? "TF" : "BASE";
  return `${prefix} / ${frame.name}`;
}
function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => HTML_ENTITIES[character] ?? character);
}
function currentCoordinateState() {
  return coordinateStates[selectedArm];
}
function selectedRobotScene() {
  return robotScenes[selectedArm];
}
function armJointSnapshot(arm: ArmId) {
  const config = robotConfig(arm);
  return currentJointsByArm[arm] ?? config.joints.map(() => manifest!.default_joint_position_rad);
}
function armTargetSnapshot(arm: ArmId) {
  return targetJointsByArm[arm] ?? armJointSnapshot(arm);
}
function poseTargetEditedStatus(command = selectedMotionCommand) {
  if (command === 1) return "位姿已修改：影子等待“计算逆解”成功后更新";
  if (command === 2) return "MOVEP 位姿目标已修改：MOVEP 不提供逆解/影子预览，影子不会跟随滑轨；可直接发送 MOVEP";
  return "位姿已修改";
}
function updateSelectedArmFromState() {
  currentJoints = [...armJointSnapshot(selectedArm)];
  targetJoints = [...armTargetSnapshot(selectedArm)];
  setJointInputs(targetJoints, true);
  renderMotionEditor();
  if (selectedRobotScene()?.shadow) setRobotJoints(selectedRobotScene()!.shadow, targetJoints);
  selectedArmLabel.textContent = selectedArm.toUpperCase();
  selectedArmLabel.className = "mini-state active-arm";
  renderCoordinateState();
  kinematicsStatus.textContent = kinematicsStatusByArm[selectedArm] ?? "MOVEL 逆解仅更新影子预览";
  configureVelocity();
  renderFleetStrip();
  jointCopyStatus.textContent = lastJointStampByArm[selectedArm] === undefined ? "等待有效 joint_states" : "可复制当前关节角";
  setSelectedConnection();
  updateButtons();
}
function renderCoordinateState() {
  const state = currentCoordinateState();
  motionReference.textContent = referenceLabel(state?.preferred_reference);
  coordinateStateLabel.textContent = state ? (state.motion_allowed ? "READY" : "BLOCKED") : "WAIT";
  coordinateStateLabel.className = state ? `mini-state ${state.motion_allowed ? "accepted" : "stopping"}` : "mini-state";
  if (!state) {
    coordinateSummary.innerHTML = `<div class="coordinate-empty">等待坐标状态</div>`;
    return;
  }
  coordinateSummary.innerHTML = `
    <div class="coordinate-row"><span>MOVE</span><strong>${referenceLabel(state.preferred_reference)}</strong></div>
    <div class="coordinate-row"><span>TOOL</span><strong>${referenceLabel(state.tool)}</strong></div>
    <div class="coordinate-meta">${state.tool?.controller_name ?? state.current_tool} ${state.tool?.payload_kg != null ? ` / ${displayNumber(state.tool.payload_kg)} kg` : ""}</div>
    <div class="coordinate-meta">${state.tool?.xyz_m ? `xyz ${state.tool.xyz_m.map((value) => displayNumber(value)).join(", ")}` : ""}</div>
    <div class="coordinate-row"><span>WORK</span><strong>${referenceLabel(state.work)}</strong></div>
    <div class="coordinate-meta">${state.work?.controller_name ?? state.current_work}</div>
    <div class="coordinate-meta">${state.work?.xyz_m ? `xyz ${state.work.xyz_m.map((value) => displayNumber(value)).join(", ")}` : ""}</div>
  `;
}
function telemetryReferenceLabel(state: CartesianVelocityTelemetry) {
  const kind = state.reference_type === 1 ? "WORK" : state.reference_type === 2 ? "TOOL" : "BASE";
  return `${kind} / ${state.reference_name || "unknown"}`;
}
function rotateByQuaternion(vector: number[], [w, x, y, z]: number[]) {
  // v' = q v q*, written out for a unit quaternion.
  const [vx, vy, vz] = vector;
  const tx = 2 * (y * vz - z * vy);
  const ty = 2 * (z * vx - x * vz);
  const tz = 2 * (x * vy - y * vx);
  return [vx + w * tx + (y * tz - z * ty), vy + w * ty + (z * tx - x * tz), vz + w * tz + (x * ty - y * tx)];
}
// The driver reports the command in its control frame but the measurement in <arm>/base_link.
// Express the limited command in the measured frame so both lines are directly comparable.
function commandInMeasuredFrame(arm: KeyboardArmId, state: CartesianVelocityTelemetry):
  { linear: number[]; angular: number[] } | { reason: string } {
  const linear = state.limited_linear_velocity_mps;
  const angular = state.limited_angular_velocity_radps;
  if (state.reference_type === 0) return { linear, angular };
  if (state.reference_type === 2) return { reason: "TOOL 坐标系命令随末端旋转，未叠加命令" };
  const work = coordinateStates[arm]?.work;
  const quaternion = work?.quaternion_wxyz?.map(Number);
  if (!work || work.name !== state.reference_name || quaternion?.length !== 4 ||
      !quaternion.every(Number.isFinite) || Math.hypot(...quaternion) < 1e-9) {
    return { reason: `缺少 WORK / ${state.reference_name || "unknown"} 的姿态，未叠加命令` };
  }
  const norm = Math.hypot(...quaternion);
  const unit = quaternion.map((value) => value / norm);
  return { linear: rotateByQuaternion(linear, unit), angular: rotateByQuaternion(angular, unit) };
}
type TraceKind = "linear" | "angular";
const velocityTraces: Partial<Record<`${KeyboardArmId}-${TraceKind}`, VelocityTrace>> = {};
function ensureVelocityTelemetrySkeleton() {
  if (velocityTelemetryGrid.childElementCount) return;
  velocityTelemetryGrid.innerHTML = (["l", "r"] as const).map((arm) => `<article class="velocity-telemetry-arm" id="velocity-telemetry-${arm}" data-arm="${arm}">
      <div class="velocity-telemetry-heading"><strong>${arm === "l" ? "LEFT / L" : "RIGHT / R"}</strong><span class="telemetry-pills"><span class="telemetry-status" data-field="session">WAIT</span><span class="telemetry-status" data-field="measured-status">WAIT</span></span></div>
      <div class="telemetry-frames"><span>实测 <strong data-field="measured-frame">${arm}/base_link</strong></span><span>命令 <strong data-field="command-frame">--</strong></span></div>
      <div class="telemetry-note" data-field="overlay-note">等待 /${arm}/cartesian_velocity/state</div>
      ${(["linear", "angular"] as const).map((kind) => `<figure class="velocity-trace" data-trace="${kind}"><figcaption>${kind === "linear" ? "线速度" : "角速度"}<span>${kind === "linear" ? "m/s" : "rad/s"}</span></figcaption><canvas data-field="${kind}-trace" aria-label="${arm.toUpperCase()} ${kind === "linear" ? "线速度" : "角速度"}：最近 10 秒命令（虚线）与实际（实线）"></canvas></figure>`).join("")}
    </article>`).join("");
  for (const arm of ["l", "r"] as const) {
    for (const kind of ["linear", "angular"] as const) {
      const canvasElement = velocityTelemetryGrid.querySelector<HTMLCanvasElement>(`#velocity-telemetry-${arm} [data-field="${kind}-trace"]`)!;
      // Floors keep encoder noise around zero from filling the whole axis.
      velocityTraces[`${arm}-${kind}`] = new VelocityTrace(canvasElement, kind === "linear" ? 0.01 : 0.02);
    }
  }
  let lastDraw = 0;
  const frame = (now: number) => {
    requestAnimationFrame(frame);
    if (document.hidden || now - lastDraw < 33) return;
    lastDraw = now;
    for (const trace of Object.values(velocityTraces)) trace?.draw(now);
  };
  requestAnimationFrame(frame);
}
function recordCartesianVelocitySample(arm: KeyboardArmId, state: CartesianVelocityTelemetry) {
  ensureVelocityTelemetrySkeleton();
  const now = performance.now();
  const command = commandInMeasuredFrame(arm, state);
  const hasCommand = "linear" in command;
  velocityTraces[`${arm}-linear`]?.push(now, state.measured_valid ? state.measured_linear_velocity_mps : null, hasCommand ? command.linear : null);
  velocityTraces[`${arm}-angular`]?.push(now, state.measured_valid ? state.measured_angular_velocity_radps : null, hasCommand ? command.angular : null);
}
function renderCartesianVelocityTelemetry() {
  ensureVelocityTelemetrySkeleton();
  for (const arm of ["l", "r"] as const) {
    const state = cartesianVelocityStates[arm];
    if (!state) continue;
    const card = $(`#velocity-telemetry-${arm}`) as HTMLElement;
    const field = (name: string) => card.querySelector<HTMLElement>(`[data-field="${name}"]`)!;
    const session = field("session");
    session.textContent = state.session_active ? "ACTIVE" : "IDLE";
    session.className = `telemetry-status ${state.session_active ? "active" : ""}`;
    const measuredStatus = field("measured-status");
    measuredStatus.textContent = state.measured_valid ? "VALID" : "STALE / NO DATA";
    measuredStatus.className = `telemetry-status ${state.measured_valid ? "valid" : "stale"}`;
    field("measured-frame").textContent = state.measured_frame_id || `${arm}/base_link`;
    field("command-frame").textContent = state.command_frame_id || telemetryReferenceLabel(state);
    const command = commandInMeasuredFrame(arm, state);
    const note = field("overlay-note");
    note.textContent = "reason" in command ? command.reason
      : state.reference_type === 0 ? "命令与实测同为 base 坐标系" : `命令已从 ${telemetryReferenceLabel(state)} 旋转到实测坐标系`;
    note.classList.toggle("warn", "reason" in command);
  }
}
function renderFleetStrip() {
  if (!manifest) return;
  const configuredArms = new Set(manifest.robots.map((robotInfo) => robotInfo.id));
  for (const robotInfo of manifest.robots) {
    const arm = robotInfo.id;
    const selected = arm === selectedArm;
    const coordinate = coordinateStates[arm];
    const connected = connectionStates[arm];
    const label = connected === undefined ? "WAIT" : connected ? "ONLINE" : "OFFLINE";
    const motion = coordinate ? (coordinate.motion_allowed ? "READY" : "BLOCKED") : "WAIT";
    const jointCount = currentJointsByArm[arm]?.length || 0;
    let button = fleetStrip.querySelector<HTMLButtonElement>(`button[data-arm="${arm}"]`);
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "fleet-chip";
      button.dataset.arm = arm;
      button.innerHTML = `
        <span class="fleet-chip-arm">${arm.toUpperCase()}</span>
        <span class="fleet-chip-state"></span>
        <span class="fleet-chip-motion"></span>
        <span class="fleet-chip-meta"></span>
      `;
      button.addEventListener("click", (event) => {
        const clickedButton = event.currentTarget as HTMLButtonElement;
        armSelect.value = clickedButton.dataset.arm as ArmId;
        armSelect.dispatchEvent(new Event("change"));
      });
      fleetStrip.append(button);
    }
    button.classList.toggle("selected", selected);
    button.querySelector<HTMLElement>(".fleet-chip-state")!.textContent = label;
    button.querySelector<HTMLElement>(".fleet-chip-motion")!.textContent = motion;
    button.querySelector<HTMLElement>(".fleet-chip-meta")!.textContent = jointCount ? `${jointCount} joints` : robotInfo.model;
  }
  fleetStrip.querySelectorAll<HTMLButtonElement>("button[data-arm]").forEach((button) => {
    if (!configuredArms.has(button.dataset.arm as ArmId)) button.remove();
  });
}
function preferredReference() {
  const state = currentCoordinateState();
  if (state?.preferred_reference) return state.preferred_reference;
  return { type: 0, name: "base", frame_id: `${selectedArm}/base_link` };
}
function poseReference(arm: ArmId = selectedArm): FrameState {
  if (poseReferenceByArm[arm]) return poseReferenceByArm[arm]!;
  const state = coordinateStates[arm];
  if (state?.preferred_reference) return state.preferred_reference;
  return { type: 0, name: "base", frame_id: `${arm}/base_link` };
}
function configuredPoseReferences(arm: ArmId): FrameState[] {
  const frames = robotConfig(arm).frames;
  return Object.values(frames).map((frame) => ({
    type: frame.type,
    name: frame.name,
    frame_id: frame.frame_id,
  }));
}
function availablePoseReferences(arm: ArmId): FrameState[] {
  const configured = configuredPoseReferences(arm);
  const configuredIds = new Set(configured.map((frame) => frame.frame_id));
  const tfFrames = (tfFramesByArm[arm] ?? []).filter((frame) => !configuredIds.has(frame.frame_id));
  return [...configured, ...tfFrames];
}
function configurePoseReference() {
  const references = availablePoseReferences(selectedArm);
  const selected = poseReference(selectedArm);
  poseReferenceFrame.innerHTML = references.map((frame) =>
    `<option value="${escapeHtml(frame.frame_id ?? frame.name)}">${escapeHtml(referenceLabel(frame))}</option>`
  ).join("");
  const selectedId = selected.frame_id ?? selected.name;
  if (references.some((frame) => (frame.frame_id ?? frame.name) === selectedId)) {
    poseReferenceFrame.value = selectedId;
  } else if (references[0]) {
    poseReferenceFrame.value = references[0].frame_id ?? references[0].name;
    poseReferenceByArm[selectedArm] = references[0];
  }
}
function renderPoseSliders() {
  const values = poseTargetsByArm[selectedArm]?.slice(0, 3).map(Number) ?? [];
  if (values.length !== 3 || !values.every(Number.isFinite)) {
    poseSliders.innerHTML = "";
    return;
  }
  const centers = poseSliderCentersByArm[selectedArm] ?? values;
  poseSliderCentersByArm[selectedArm] = [...centers];
  const labels = ["X", "Y", "Z"];
  poseSliders.innerHTML = labels.map((label, index) => {
    const center = centers[index];
    const min = center - 0.2;
    const max = center + 0.2;
    return `<label>${label}<input data-pose-slider-index="${index}" type="range" min="${min.toFixed(2)}" max="${max.toFixed(2)}" step="0.001" value="${displayNumber(values[index])}" /></label>`;
  }).join("");
  poseSliders.querySelectorAll<HTMLInputElement>("input[data-pose-slider-index]").forEach((slider) => {
    slider.addEventListener("input", () => {
      const index = Number(slider.dataset.poseSliderIndex);
      const input = poseInputElements()[index];
      input.value = slider.value;
      poseTargetsByArm[selectedArm] = poseInputElements().map((item) => item.value);
      ikPreviewValidByArm[selectedArm] = false;
      setKinematicsStatus(selectedArm, poseTargetEditedStatus());
      setShadowVisibility(selectedArm);
      updateButtons();
    });
  });
}
function syncPoseSlidersFromInputs() {
  poseSliders.querySelectorAll<HTMLInputElement>("input[data-pose-slider-index]").forEach((slider) => {
    const value = Number(poseInputElements()[Number(slider.dataset.poseSliderIndex)].value);
    if (Number.isFinite(value)) slider.value = String(value);
  });
}
function poseInputElements() {
  return POSE_INPUT_IDS.map((id) => $(`#${id}`) as HTMLInputElement);
}
function renderPoseInputs() {
  const values = poseTargetsByArm[selectedArm] ?? ["", "", "", "1", "0", "0", "0"];
  poseInputElements().forEach((input, index) => {
    const value = values[index] ?? "";
    input.value = value === "" ? "" : displayValue(value);
  });
  configurePoseReference();
  renderPoseSliders();
}
function readPoseGoal() {
  const raw = poseInputElements().map((input) => input.value.trim());
  if (raw.some((value) => value === "")) return null;
  const values = raw.map(Number);
  if (!values.every(Number.isFinite)) return null;
  const quaternion = values.slice(3);
  if (Math.hypot(...quaternion) < 1.0e-9) return null;
  return { position: values.slice(0, 3), quaternion };
}
function readMotionSettings() {
  const velocity = Number(motionVelocityInput.value);
  const timeout = Number(motionTimeoutInput.value);
  if (!Number.isInteger(velocity) || velocity < 1 || velocity > 100) return null;
  if (!Number.isFinite(timeout) || timeout <= 0) return null;
  return { velocity, timeout };
}
function setMotionMode(command: MotionCommand) {
  const previousCommand = selectedMotionCommand;
  selectedMotionCommand = command;
  motionMode.querySelectorAll<HTMLButtonElement>("button[data-motion-command]").forEach((button) => {
    const selected = Number(button.dataset.motionCommand) === command;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  jointTarget.hidden = command !== 0;
  poseTarget.hidden = command === 0;
  resetPreviewButton.hidden = command !== 0;
  // Both Cartesian target modes can read the live pose; only MOVEL exposes IK preview.
  poseKinematicsActions.hidden = command === 0;
  solveIkButton.hidden = command !== 1;
  deleteRecordButton.hidden = command !== 0;
  executeMotionButton.textContent = `发送 ${MOTION_LABELS[command]}`;
  setShadowVisibility(selectedArm);
  if (command !== 0 && (previousCommand === 0 || previousCommand !== command)) {
    requestCurrentPose(selectedArm);
  }
  updateButtons();
}
function renderMotionEditor() {
  renderPoseInputs();
  renderRecordControls();
  const settings = motionSettingsByArm[selectedArm];
  if (settings) {
    motionVelocityInput.value = displayValue(settings.velocity);
    motionTimeoutInput.value = displayValue(settings.timeout);
  }
  motionReference.textContent = referenceLabel(currentCoordinateState()?.preferred_reference);
  if (selectedMotionCommand !== 0) {
    configurePoseReference();
    motionReference.textContent = referenceLabel(poseReference());
  }
  kinematicsStatus.textContent = kinematicsStatusByArm[selectedArm] ?? "MOVEL 逆解仅更新影子预览";
  setMotionMode(selectedMotionCommand);
}
function requestCurrentPose(arm: ArmId, force = false) {
  if (!canWrite() || (!force && activeKinematicsRequestByArm[arm])) return;
  const requestIdValue = requestId("current-pose");
  const reference = poseReference(arm);
  activeKinematicsRequestByArm[arm] = requestIdValue;
  setKinematicsStatus(arm, `读取 ${referenceLabel(reference)} 当前位姿…`);
  send({
    type: "get_current_pose",
    request_id: requestIdValue,
    arm,
    reference: {
      reference_type: reference.type,
      reference_name: reference.name,
    },
  });
  updateButtons();
}
function send(message: Message) {
  if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
}

document.querySelectorAll<HTMLInputElement>('input[type="number"]').forEach((input) => {
  input.addEventListener("blur", () => {
    if (input.value.trim() !== "") input.value = displayValue(input.value);
  });
});

function renderRecordControls() {
  const records = jointRecordsByArm[selectedArm] ?? [];
  const selectedValue = recordSelect.value;
  recordSelect.innerHTML = records.length
    ? records.map((record) => `<option value="${escapeHtml(record.id)}">${escapeHtml(record.label)}</option>`).join("")
    : `<option value="">无记录</option>`;
  if (records.some((record) => record.id === selectedValue)) recordSelect.value = selectedValue;
  recordStatus.textContent = recordStatusByArm[selectedArm] ?? (records.length ? `${records.length} 条记录` : "无记录");
}

function setKinematicsStatus(arm: ArmId, message: string) {
  kinematicsStatusByArm[arm] = message;
  if (arm === selectedArm) kinematicsStatus.textContent = message;
}

function setRecordStatus(arm: ArmId, message: string) {
  recordStatusByArm[arm] = message;
  if (arm === selectedArm) recordStatus.textContent = message;
}

function beginRecordRequest(arm: ArmId, requestIdValue: string, message: string) {
  const existingTimer = recordRequestTimerByArm[arm];
  if (existingTimer) window.clearTimeout(existingTimer);
  activeRecordRequestByArm[arm] = requestIdValue;
  setRecordStatus(arm, message);
  recordRequestTimerByArm[arm] = window.setTimeout(() => {
    if (activeRecordRequestByArm[arm] !== requestIdValue) return;
    delete activeRecordRequestByArm[arm];
    delete recordRequestTimerByArm[arm];
    setRecordStatus(arm, "记录请求超时：请确认网页连接后重试");
    updateButtons();
  }, 8000);
}

function finishRecordRequest(arm: ArmId, requestIdValue: string) {
  if (activeRecordRequestByArm[arm] !== requestIdValue) return false;
  delete activeRecordRequestByArm[arm];
  const timer = recordRequestTimerByArm[arm];
  if (timer) window.clearTimeout(timer);
  delete recordRequestTimerByArm[arm];
  return true;
}

function setConnection(online: boolean) {
  connection.textContent = online ? "ROS ONLINE" : "OFFLINE";
  connection.classList.toggle("offline", !online);
}
function setSelectedConnection() {
  const online = Boolean(connectionStates[selectedArm]);
  setConnection(online);
}

function renderJointControls() {
  const controlsHost = $("#joint-controls");
  controlsHost.innerHTML = robot().joints.map((joint, index) => `
    <label class="joint-row"><span>J${index + 1}<output id="joint-value-${index}">${displayNumber(targetJoints[index] * 180 / Math.PI)}°</output></span>
    <input data-joint-index="${index}" type="range" min="${joint.lower_deg}" max="${joint.upper_deg}" step="0.1" value="${targetJoints[index] * 180 / Math.PI}" /></label>
  `).join("");
  controlsHost.querySelectorAll<HTMLInputElement>("input[data-joint-index]").forEach((input) => input.addEventListener("input", () => {
    const index = Number(input.dataset.jointIndex);
    targetJoints[index] = Number(input.value) * Math.PI / 180;
    targetJointsByArm[selectedArm] = [...targetJoints];
    targetEditedByArm[selectedArm] = true;
    $(`#joint-value-${index}`).textContent = `${displayNumber(Number(input.value))}°`;
    selectedRobotScene()?.shadow?.setJointValues(Object.fromEntries(targetJoints.map((value, i) => [`joint_${i + 1}`, value])));
  }));
}

function setJointInputs(values: number[], target = false) {
  values.forEach((value, index) => {
    const input = $(`input[data-joint-index="${index}"]`) as HTMLInputElement | null;
    const output = $(`#joint-value-${index}`);
    if (!input || !output) return;
    const degrees = value * 180 / Math.PI;
    if (target) { targetJoints[index] = value; input.value = String(degrees); }
    output.textContent = `${displayNumber(degrees)}°`;
  });
}

function setRobotJoints(target: any, values: number[]) {
  target?.setJointValues(Object.fromEntries(values.map((value, index) => [`joint_${index + 1}`, value])));
  target?.updateMatrixWorld(true);
}

function applyJointRecordToJoints(arm: ArmId, jointDegrees: number[], message: string) {
  const config = manifest?.robots.find((item) => item.id === arm);
  const valid = jointDegrees.length === 6 && config?.joints.every(
    (joint, index) => Number.isFinite(Number(jointDegrees[index])) &&
      Number(jointDegrees[index]) >= joint.lower_deg && Number(jointDegrees[index]) <= joint.upper_deg,
  );
  if (!valid) {
    setRecordStatus(arm, "记录关节角超出限制");
    return false;
  }
  const radians = jointDegrees.map((value) => Number(value) * Math.PI / 180);
  targetJointsByArm[arm] = [...radians];
  targetEditedByArm[arm] = true;
  ikPreviewValidByArm[arm] = true;
  if (arm === selectedArm) {
    targetJoints = [...radians];
    setJointInputs(radians, true);
  }
  setRobotJoints(robotScenes[arm]?.shadow, radians);
  setRecordStatus(arm, message);
  if (arm === selectedArm) {
    setShadowVisibility(arm);
    frameScene(true);
  }
  return true;
}

function applyMaterials(target: any, shadow: boolean, arm: ArmId) {
  target?.traverse((object: any) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.material = shadow
      ? new THREE.MeshBasicMaterial({
        color: 0xe08a52,
        transparent: true,
        opacity: arm === selectedArm ? 0.28 : 0,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide,
      })
      : new THREE.MeshStandardMaterial({
        color: ARM_COLORS[arm],
        metalness: 0.25,
        roughness: 0.56,
        depthWrite: true,
        depthTest: true,
      });
    object.castShadow = !shadow;
    object.receiveShadow = !shadow;
    object.renderOrder = shadow ? 10 : 0;
    object.frustumCulled = !shadow;
  });
}
// Neutral dark finish so the gripper reads as a separate tool from the colored arm links.
function applyGripperMaterial(target: any) {
  target?.traverse((object: any) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.material = new THREE.MeshStandardMaterial({ color: 0x2b3438, metalness: 0.35, roughness: 0.5 });
    object.castShadow = true;
    object.receiveShadow = true;
  });
}
function setShadowVisibility(arm: ArmId) {
  const previous = selectedShadowArm ? robotScenes[selectedShadowArm]?.shadow : null;
  previous?.traverse((object: any) => {
    if (object instanceof THREE.Mesh && "opacity" in object.material) object.material.opacity = 0;
  });
  const next = robotScenes[arm]?.shadow;
  next?.traverse((object: any) => {
    if (object instanceof THREE.Mesh && "opacity" in object.material) {
      const opacity = selectedMotionCommand === 0 || (selectedMotionCommand === 1 && ikPreviewValidByArm[arm]) ? 0.28 : 0;
      object.material.opacity = opacity;
    }
  });
  selectedShadowArm = arm;
}

function frameScene(includeSelectedShadow = false) {
  if (!manifest || !camera || !controls || !scene) return;
  const bounds = new THREE.Box3();
  manifest.robots.forEach(({ id }) => {
    const robotScene = robotScenes[id];
    if (!robotScene) return;
    bounds.expandByObject(robotScene.live);
    if (includeSelectedShadow && id === selectedArm) bounds.expandByObject(robotScene.shadow);
  });
  if (bounds.isEmpty()) return;
  const size = bounds.getSize(new THREE.Vector3());
  const dimension = Math.max(size.x, size.y, size.z, 0.5);
  // Keep the base and full arm silhouette visually centered after the compact
  // viewer height change; this only changes the camera framing, not TF poses.
  const focusHeight = bounds.min.z + size.z * 0.36;
  // The browser scene is intentionally expressed relative to the middle arm.
  // This is display-only: manifest transforms remain the calibrated world/TF poses.
  controls.target.set(0, 0, focusHeight);
  camera.position.set(
    dimension * 1.18,
    -dimension * 1.65,
    focusHeight + dimension * 0.82,
  );
  camera.lookAt(controls.target);
  controls.update();
}

function meshCount(target: any) {
  let count = 0;
  target?.traverse((object: any) => { if (object instanceof THREE.Mesh) count += 1; });
  return count;
}

async function waitForMeshes(targets: any[], minimumPerRobot = 7) {
  for (let attempt = 0; attempt < 160; attempt += 1) {
    if (targets.every((target) => meshCount(target) >= minimumPerRobot)) return;
    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }
  throw new Error("URDF mesh loading timed out");
}

async function loadFleet() {
  const generation = ++loadGeneration;
  viewerState.textContent = "加载 URDF…";
  viewerState.removeAttribute("hidden");
  const loader = new URDFLoader();
  loader.packages = { rm65_description: `${location.origin}/models` };
  for (const arm of Object.keys(gripperModels) as ArmId[]) delete gripperModels[arm];
  try {
    const snapshots = await Promise.all(manifest!.robots.map(async (config) => {
      const live = await loader.loadAsync(`${location.origin}${config.urdf_url}`);
      const shadow = await loader.loadAsync(`${location.origin}${config.urdf_url}`);
      const mount = manifest!.end_effectors?.[config.id];
      const gripper = mount ? await loader.loadAsync(`${location.origin}${mount.urdf_url}`) : null;
      return { config, live, shadow, mount, gripper };
    }));
    if (generation !== loadGeneration) return;
    if (!scene) throw new Error("WebGL scene was not initialized");
    scene.clear();
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd3dbe5, 2.4));
    const key = new THREE.DirectionalLight(0xffffff, 4);
    key.position.set(2, -3, 4);
    key.castShadow = true;
    scene.add(key);
    const grid = new THREE.GridHelper(3.5, 22, 0xb3c1d1, 0xdde4ec);
    grid.rotation.x = Math.PI / 2;
    scene.add(grid);
    const allMeshes: any[] = [];
    const middleTransform = manifest!.robots.find((robot) => robot.id === "m")?.transform;
    if (!middleTransform) throw new Error("middle-arm transform is missing from the layout manifest");
    // Same middle-arm-relative display offset as the arms. With a pedestal the floor grid moves down to
    // its bottom (the work-table plane) so the grid does not cut through it.
    const pedestal = manifest!.pedestal;
    if (pedestal) {
      const pedestalMesh = new THREE.Mesh(
        new THREE.BoxGeometry(pedestal.size_xy[0], pedestal.size_xy[1], pedestal.top_z - pedestal.bottom_z),
        new THREE.MeshStandardMaterial({ color: pedestal.color, metalness: 0.1, roughness: 0.8 }),
      );
      pedestalMesh.name = "pedestal";
      pedestalMesh.position.set(
        pedestal.center_xy[0] - middleTransform.x,
        pedestal.center_xy[1] - middleTransform.y,
        (pedestal.top_z + pedestal.bottom_z) / 2 - middleTransform.z,
      );
      pedestalMesh.castShadow = true;
      pedestalMesh.receiveShadow = true;
      scene.add(pedestalMesh);
      grid.position.z = pedestal.bottom_z - middleTransform.z - 0.002;
      viewer.dataset.pedestal = "1";
    } else {
      delete viewer.dataset.pedestal;
    }
    snapshots.forEach(({ config, live, shadow, mount, gripper }) => {
      // Center the visualization on m without mutating calibrated TF/world coordinates.
      live.position.set(
        config.transform.x - middleTransform.x,
        config.transform.y - middleTransform.y,
        config.transform.z - middleTransform.z,
      );
      live.rotation.set(config.transform.roll, config.transform.pitch, config.transform.yaw, "ZYX");
      shadow.position.set(
        config.transform.x - middleTransform.x,
        config.transform.y - middleTransform.y,
        config.transform.z - middleTransform.z,
      );
      shadow.rotation.set(config.transform.roll, config.transform.pitch, config.transform.yaw, "ZYX");
      // The gripper is a child of the flange link, so it follows the live arm; the target shadow stays bare.
      const parent = mount && gripper ? live.links?.[mount.parent_link] : null;
      if (mount && gripper && parent) {
        gripper.position.set(...mount.xyz);
        gripper.rotation.set(mount.rpy[0], mount.rpy[1], mount.rpy[2], "ZYX");
        parent.add(gripper);
        gripperModels[config.id] = gripper;
        // Start fully open until the first position feedback arrives.
        gripper.setJointValue(mount.driving_joint, mount.open_rad);
      }
      scene.add(live);
      scene.add(shadow);
      robotScenes[config.id] = { live, shadow };
      allMeshes.push(live, shadow);
    });
    await waitForMeshes(allMeshes);
    await waitForMeshes(Object.values(gripperModels), 9);
    snapshots.forEach(({ config, live, shadow }) => {
      applyMaterials(live, false, config.id);
      applyGripperMaterial(gripperModels[config.id]);
      applyMaterials(shadow, true, config.id);
      setRobotJoints(live, armJointSnapshot(config.id));
      setRobotJoints(shadow, armTargetSnapshot(config.id));
      live.updateMatrixWorld(true);
    });
    updateKeyboardWorkFrames();
    const selectedConfig = robotConfig(selectedArm);
    setShadowVisibility(selectedArm);
    frameScene(false);
    viewer.dataset.liveMeshes = String(snapshots.reduce((count, { live }) => count + meshCount(live), 0));
    viewer.dataset.shadowMeshes = String(snapshots.reduce((count, { shadow }) => count + meshCount(shadow), 0));
    viewer.dataset.gripperMeshes = String(Object.values(gripperModels).reduce((count, model) => count + meshCount(model), 0));
    updateGripperModels();
    viewer.dataset.visualizationReferenceArm = "m";
    viewerState.setAttribute("hidden", "");
    $("#model-label").textContent = `${selectedConfig.model} / ${selectedArm.toUpperCase()} + 3 arms`;
  } catch (error) {
    viewerState.textContent = `URDF 加载失败: ${String(error)}`;
    viewerState.removeAttribute("hidden");
  }
}

function initScene() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  viewer.dataset.renderer = "webgl";
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0xf6f8fb, 1);
  renderer.shadowMap.enabled = true;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);
  camera.up.set(0, 0, 1);
  camera.position.set(1.2, -1.8, 1.25);
  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.target.set(0, 0, 0.55);
  const resize = () => {
    const box = viewer.getBoundingClientRect();
    if (!box.width || !box.height || !renderer || !camera) return;
    renderer.setSize(box.width, box.height, false);
    camera.aspect = box.width / box.height;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(viewer);
  resize();
  initViewerHover();
  const frame = () => {
    requestAnimationFrame(frame);
    if (!renderer || !scene || !camera || !controls) return;
    controls.update();
    renderer.render(scene, camera);
  };
  frame();
}

// Hovering an arm tints its live links and names the link under the pointer;
// a click (not a drag) selects that arm, like its fleet chip.
const viewerHover = $("#viewer-hover") as HTMLElement;
const raycaster = new THREE.Raycaster();
let hoveredArm: ArmId | undefined;
function setArmHighlight(arm: ArmId | undefined) {
  if (arm === hoveredArm) return;
  for (const [id, robotScene] of Object.entries(robotScenes) as [ArmId, RobotScene][]) {
    robotScene.live?.traverse((object: any) => {
      if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshStandardMaterial) {
        object.material.emissive.set(id === arm ? 0x3e63dd : 0x000000);
        object.material.emissiveIntensity = id === arm ? 0.28 : 0;
      }
    });
  }
  hoveredArm = arm;
  viewer.classList.toggle("hovering-arm", Boolean(arm));
}
function pickArm(event: PointerEvent): { arm: ArmId; link: string } | undefined {
  if (!camera) return undefined;
  const box = canvas.getBoundingClientRect();
  raycaster.setFromCamera(new THREE.Vector2(
    ((event.clientX - box.left) / box.width) * 2 - 1,
    -((event.clientY - box.top) / box.height) * 2 + 1,
  ), camera);
  let best: { arm: ArmId; link: string; distance: number } | undefined;
  for (const [arm, robotScene] of Object.entries(robotScenes) as [ArmId, RobotScene][]) {
    if (!robotScene.live) continue;
    const hit = raycaster.intersectObject(robotScene.live, true)[0];
    if (!hit || (best && best.distance <= hit.distance)) continue;
    let node: any = hit.object;
    let onGripper = false;
    while (node && !node.isURDFLink) node = node.parent;
    for (let parent: any = node; parent; parent = parent.parent) onGripper ||= parent === gripperModels[arm];
    best = { arm, link: onGripper ? "夹爪" : node?.name ?? "", distance: hit.distance };
  }
  return best && { arm: best.arm, link: best.link };
}
function initViewerHover() {
  let frameRequest = 0;
  let pressed: { x: number; y: number } | undefined;
  canvas.addEventListener("pointermove", (event) => {
    if (event.buttons) {
      viewerHover.hidden = true;
      return;
    }
    if (frameRequest) return;
    frameRequest = requestAnimationFrame(() => {
      frameRequest = 0;
      const picked = pickArm(event);
      setArmHighlight(picked?.arm);
      viewerHover.hidden = !picked;
      if (!picked) return;
      const label = armSelect.querySelector<HTMLOptionElement>(`option[value="${picked.arm}"]`)?.textContent ?? picked.arm.toUpperCase();
      viewerHover.innerHTML = `${escapeHtml(label)}<span>${escapeHtml(picked.link)}${picked.arm === selectedArm ? "" : " · 点击选中"}</span>`;
      const box = viewer.getBoundingClientRect();
      viewerHover.style.left = `${event.clientX - box.left}px`;
      viewerHover.style.top = `${event.clientY - box.top}px`;
    });
  });
  canvas.addEventListener("pointerleave", () => {
    setArmHighlight(undefined);
    viewerHover.hidden = true;
  });
  canvas.addEventListener("pointerdown", (event) => { pressed = { x: event.clientX, y: event.clientY }; });
  canvas.addEventListener("pointerup", (event) => {
    const click = pressed && Math.hypot(event.clientX - pressed.x, event.clientY - pressed.y) < 4;
    pressed = undefined;
    if (!click) return;
    const picked = pickArm(event);
    if (!picked || picked.arm === selectedArm) return;
    armSelect.value = picked.arm;
    armSelect.dispatchEvent(new Event("change"));
    viewerHover.hidden = true;
  });
}

function configureVelocity() {
  const settings = robot().motion;
  $("#velocity-frame").innerHTML = Object.entries(robot().frames).map(([key, frame]) => `<option value="${key}">${key.toUpperCase()} / ${frame.name}</option>`).join("");
  $("#velocity-period").setAttribute("value", displayValue(settings.velocity_control_period_ms));
  $("#velocity-watchdog").setAttribute("value", displayValue(settings.velocity_watchdog_ms));
  $("#linear-accel").setAttribute("value", displayValue(settings.max_linear_accel_mps2));
  $("#angular-accel").setAttribute("value", displayValue(settings.max_angular_accel_radps2));
  const names = ["vx", "vy", "vz", "wx", "wy", "wz"];
  $("#velocity-inputs").innerHTML = names.map((name, index) => `<label>${name}<input id="velocity-${index}" type="number" step="0.01" value="0.00" /></label>`).join("");
  const state = currentCoordinateState();
  if (state?.preferred_reference) {
    const frameKey = state.preferred_reference.type === 1 ? "work" : state.preferred_reference.type === 2 ? "tool" : "base";
    ($("#velocity-frame") as HTMLSelectElement).value = frameKey;
  }
}

function sendGripper(command: string, extra: Record<string, unknown> = {}) {
  if (!selectedGripper || !canWrite()) return;
  send({ type: "gripper_command", request_id: requestId("gripper"), name: selectedGripper, command, ...extra });
}
// Opening of a gripper in 0..1 (0 closed, 1 fully open) from its live position and configured endpoints.
function gripperOpening(name: string): number | null {
  const position = Number(gripperStates[name]?.position);
  const open = Number(gripperConfigs[name]?.open_position);
  const close = Number(gripperConfigs[name]?.close_position);
  if (!Number.isFinite(position) || !Number.isFinite(open) || !Number.isFinite(close) || open === close) return null;
  return Math.min(Math.max((position - close) / (open - close), 0), 1);
}
// Move each mounted gripper model to its latest feedback. Models keep their last pose while the
// gripper is offline or its configuration is unknown.
function updateGripperModels() {
  for (const arm of ["l", "m", "r"] as ArmId[]) {
    const model = gripperModels[arm];
    const mount = manifest?.end_effectors?.[arm];
    if (!model || !mount) continue;
    const opening = gripperOpening(mount.gripper_name);
    if (opening === null) continue;
    model.setJointValue(mount.driving_joint, mount.closed_rad + (mount.open_rad - mount.closed_rad) * opening);
    viewer.dataset[`gripper${arm.toUpperCase()}`] = opening.toFixed(2);
  }
}
function renderGripperState() {
  const state = gripperStates[selectedGripper];
  if (!state) return;
  $("#gripper-state").textContent = state.connected ? "ONLINE" : "OFFLINE";
  renderGripperLimits();
  const opening = gripperOpening(selectedGripper);
  const openingText = opening === null ? "" : `开合 ${Math.round(opening * 100)}% / `;
  $("#gripper-feedback").textContent = `${openingText}位置 ${state.position ?? 0} / 速度 ${state.speed ?? 0} / 电流 ${state.current ?? 0} / 力矩 ${state.torque_reached ? "到达" : "未到达"} / 报警 0x${Number(state.alarm ?? 0).toString(16)}`;
}
// Messages about the travel-limit editor (validation, set_limits/move_raw results) go to a line that
// only the editor writes to, so the 20 Hz telemetry in #gripper-feedback cannot overwrite them.
function setGripperLimitsStatus(text: string) {
  $("#gripper-limits-status").textContent = text;
}
function gripperLimitsElements() {
  return {
    open: $("#gripper-open-position") as HTMLInputElement,
    close: $("#gripper-close-position") as HTMLInputElement,
    raw: $("#gripper-raw-position") as HTMLInputElement,
    rawValue: $("#gripper-raw-value"),
    apply: $("#gripper-limits-apply") as HTMLButtonElement,
    teachOpen: $("#gripper-teach-open") as HTMLButtonElement,
    teachClose: $("#gripper-teach-close") as HTMLButtonElement,
  };
}
// Travel-limit editor. The inputs follow the configuration only while they are clean and unfocused.
function renderGripperLimits() {
  const config = gripperConfigs[selectedGripper];
  const state = gripperStates[selectedGripper];
  const elements = gripperLimitsElements();
  const writable = canWrite() && Boolean(config);
  const teachable = writable && state?.connected === true && Number(state.speed) === 0;
  if (config) {
    const minimum = Number(config.min_position ?? 0);
    const maximum = Number(config.max_position ?? 0);
    elements.raw.min = String(minimum);
    elements.raw.max = String(maximum);
    $("#gripper-limits-range").textContent = `允许范围 ${minimum}..${maximum}（min/max 只能在 gripper.yaml 中修改）`;
    const editing = document.activeElement === elements.open || document.activeElement === elements.close;
    if (!gripperLimitsDirty && !editing) {
      elements.open.value = String(config.open_position);
      elements.close.value = String(config.close_position);
    }
  }
  if (state && document.activeElement !== elements.raw) {
    elements.raw.value = String(Math.round(Number(state.position) || 0));
    elements.rawValue.textContent = elements.raw.value;
  }
  for (const input of [elements.open, elements.close, elements.raw, elements.apply]) input.disabled = !writable;
  elements.teachOpen.disabled = !teachable;
  elements.teachClose.disabled = !teachable;
}
function teachGripperLimit(field: "open" | "close") {
  const position = Number(gripperStates[selectedGripper]?.position);
  if (!Number.isFinite(position)) return;
  gripperLimitsElements()[field].value = String(Math.round(position));
  gripperLimitsDirty = true;
  setGripperLimitsStatus("");
}
function applyGripperLimits() {
  const config = gripperConfigs[selectedGripper];
  if (!config || !canWrite()) return;
  const { open, close } = gripperLimitsElements();
  const openPosition = Number(open.value);
  const closePosition = Number(close.value);
  if (open.value === "" || close.value === "" || !Number.isInteger(openPosition) || !Number.isInteger(closePosition)) {
    setGripperLimitsStatus("开位和闭位必须是整数");
    return;
  }
  const confirmed = window.confirm(
    `确认修改 ${selectedGripper} 的行程？\n开位 ${config.open_position} → ${openPosition}\n闭位 ${config.close_position} → ${closePosition}`,
  );
  if (!confirmed) return;
  sendGripper("set_limits", { open_position: openPosition, close_position: closePosition });
}
function updateGripperList(list: any[]) {
  const select = $("#gripper-select") as HTMLSelectElement;
  select.innerHTML = list.map((item) => `<option value="${String(item.name)}">${String(item.name)}</option>`).join("");
  for (const item of list) gripperConfigs[String(item.name)] = item;
  updateGripperModels();
  if (!selectedGripper && list.length) selectedGripper = String(list[0].name);
  select.value = selectedGripper;
  renderGripperState();
  renderGripperLimits();
}

function handleMessage(message: Message) {
  if (message.type === "hello") {
    readOnly = Boolean(message.read_only);
    mode.textContent = readOnly ? "READ ONLY" : "CONTROL READY";
    mode.classList.toggle("ready", !readOnly);
    if (message.layout) loadManifest(message.layout);
    else updateButtons();
  } else if (message.type === "input_mode_list") {
    if (message.available) {
      inputModeCatalog = Array.isArray(message.modes) ? message.modes.reduce<InputModeOption[]>((modes, option) => {
        if (typeof option?.id === "string" && typeof option?.label === "string" && typeof option?.selectable === "boolean") {
          modes.push({ id: option.id, label: option.label, selectable: option.selectable });
        }
        return modes;
      }, []) : [];
    } else {
      inputModeCatalog = undefined;
      inputModeState = undefined;
      inputModeResultDetail = "";
      clearInputModeRequest();
    }
    renderInputModeCard();
  } else if (message.type === "keyboard_lease") {
    keyboardLeaseOwned = Boolean(message.active);
    if (!keyboardLeaseOwned) releaseKeyboardInput();
    renderInputModeCard();
  } else if (message.type === "input_mode_result") {
    const modeResult: InputModeResult = {
      request_id: String(message.request_id ?? ""),
      executor_request_id: Number(message.executor_request_id),
      accepted: Boolean(message.accepted),
      message: String(message.message ?? ""),
    };
    if (modeResult.request_id === activeInputModeRequest) {
      inputModeResultDetail = modeResult.message;
      if (modeResult.accepted && Number.isFinite(modeResult.executor_request_id)) {
        activeInputModeExecutorRequest = modeResult.executor_request_id;
        finishInputModeRequestIfTerminal();
      } else {
        clearInputModeRequest();
      }
      renderInputModeCard();
    }
  } else if (message.type === "input_mode_state") {
    const nextPhase = String(message.phase ?? "");
    const nextActiveMode = String(message.active_mode ?? "");
    const modeLost = (inputModeState !== undefined && inputModeState.epoch !== Number(message.epoch)) ||
      nextPhase !== "ACTIVE" || nextActiveMode !== "keyboard";
    if (modeLost) releaseKeyboardInput();
    inputModeState = {
      requested_mode: String(message.requested_mode ?? ""),
      selected_mode: String(message.selected_mode ?? ""),
      active_mode: String(message.active_mode ?? ""),
      phase: String(message.phase ?? ""),
      request_id: Number(message.request_id),
      epoch: Number(message.epoch),
      detail: String(message.detail ?? ""),
    };
    if (modeLost) keyboardLeaseOwned = false;
    finishInputModeRequestIfTerminal();
    renderInputModeCard();
    renderBehaviorTree();
  } else if (message.type === "gripper_list") {
    updateGripperList(Array.isArray(message.grippers) ? message.grippers : []);
  } else if (message.type === "gripper_state") {
    gripperStates[String(message.name)] = message;
    renderGripperState();
    updateGripperModels();
    reconcileKeyboardControl();
  } else if (message.type === "gripper_result") {
    if (message.command === "set_limits" || message.command === "move_raw") {
      if (message.message) {
        const prefix = message.success === false ? "失败：" : message.command === "set_limits" && message.success === true ? "已应用：" : "";
        setGripperLimitsStatus(`${prefix}${String(message.message)}`);
      }
    } else if (message.message) {
      $("#gripper-feedback").textContent = String(message.message);
    }
    if (message.command === "set_limits" && message.state === "completed" && message.success === true) {
      gripperLimitsDirty = false;
      renderGripperLimits();
    }
  } else if (message.type === "coordinate_state") {
    coordinateStates[message.arm] = message as CoordinateState;
    reconcileKeyboardControl();
    updateKeyboardWorkFrames();
    renderFleetStrip();
    if (message.arm === selectedArm) {
      renderCoordinateState();
      if (manifest) configureVelocity();
    }
  } else if (message.type === "cartesian_velocity_state") {
    const arm = message.arm as ArmId;
    if (!( ["l", "m", "r"] as ArmId[]).includes(arm)) return;
    const state = message.state as CartesianVelocityTelemetry | undefined;
    if (!state) return;
    cartesianVelocityStates[arm] = state;
    if (arm !== "m") recordCartesianVelocitySample(arm, state);
    renderCartesianVelocityTelemetry();
  } else if (message.type === "tf_frames") {
    const arm = message.arm as ArmId;
    tfFramesByArm[arm] = Array.isArray(message.frames) ? message.frames : [];
    if (arm === selectedArm && manifest) {
      const selected = poseReference(arm);
      if (selected.type === 3 && !tfFramesByArm[arm]?.some((frame) => frame.frame_id === selected.frame_id)) {
        delete poseReferenceByArm[arm];
      }
      configurePoseReference();
      renderPoseInputs();
      updateButtons();
    }
  } else if (message.type === "connection") {
    connectionStates[message.arm] = Boolean(message.connected);
    renderFleetStrip();
    if (message.arm === selectedArm) setSelectedConnection();
  } else if (message.type === "joint_state") {
    const arm = message.arm as ArmId;
    const positions = Array.isArray(message.positions_rad) ? message.positions_rad.map(Number) : [];
    const stamp = Number(message.stamp_ns);
    if (!(["l", "m", "r"] as ArmId[]).includes(arm) || positions.length !== 6 ||
        !positions.every(Number.isFinite) || !Number.isFinite(stamp) || stamp <= 0 ||
        (lastJointStampByArm[arm] !== undefined && stamp <= lastJointStampByArm[arm]!)) return;
    // A second ROS publisher can emit its default all-zero pose while the real
    // driver is still publishing the unchanged robot pose. Keep the last
    // known-good visual state instead of making the model jump to zero.
    const allZero = positions.every((value) => value === 0);
    if (allZero && nonZeroJointStateByArm[arm]) return;
    const firstSample = lastJointStampByArm[arm] === undefined || (!allZero && !nonZeroJointStateByArm[arm]);
    lastJointStampByArm[arm] = stamp;
    if (!allZero) nonZeroJointStateByArm[arm] = true;
    currentJointsByArm[arm] = positions;
    if (!targetEditedByArm[arm]) targetJointsByArm[arm] = [...positions];
    setRobotJoints(robotScenes[arm]?.live, positions);
    if (arm === selectedArm) {
      currentJoints = positions;
      $("#joint-stamp").textContent = `joint_states / ${stamp}`;
      jointCopyStatus.textContent = "可复制当前关节角";
      // The first live pose after page load replaces the placeholder target.
      if (firstSample) resetMotionTarget();
    }
    renderFleetStrip();
  } else if (message.type === "joint_records") {
    jointRecordsByArm[message.arm as ArmId] = Array.isArray(message.records) ? message.records : [];
    if (!recordStatusByArm[message.arm as ArmId]) {
      setRecordStatus(message.arm as ArmId, `${jointRecordsByArm[message.arm as ArmId]?.length ?? 0} 条记录`);
    }
    if (message.arm === selectedArm) renderRecordControls();
    updateButtons();
  } else if (message.type === "joint_record_saved") {
    const arm = message.arm as ArmId;
    if (!finishRecordRequest(arm, message.request_id)) return;
    setRecordStatus(arm, `已记录 ${message.record?.label ?? ""}`);
    recordNameInput.value = "";
    if (arm === selectedArm) renderRecordControls();
    updateButtons();
  } else if (message.type === "joint_record_deleted") {
    const arm = message.arm as ArmId;
    if (!finishRecordRequest(arm, message.request_id)) return;
    const recordId = String(message.record?.id ?? "");
    jointRecordsByArm[arm] = (jointRecordsByArm[arm] ?? []).filter((record) => record.id !== recordId);
    setRecordStatus(arm, `已删除 ${message.record?.label ?? "记录"}`);
    if (arm === selectedArm) renderRecordControls();
    updateButtons();
  } else if (message.type === "joint_record_applied") {
    const arm = message.arm as ArmId;
    if (!finishRecordRequest(arm, message.request_id)) return;
    const jointDegrees = Array.isArray(message.joint_degrees) ? message.joint_degrees : [];
    const command = Number(message.command) as MotionCommand;
    if (command === 0) {
      applyJointRecordToJoints(arm, jointDegrees, `已填入 ${message.record?.label ?? "记录"} / MOVEJ`);
    } else {
      const position = Array.isArray(message.pose_position_m) ? message.pose_position_m : [];
      const quaternion = Array.isArray(message.pose_quaternion_wxyz) ? message.pose_quaternion_wxyz : [];
      if (message.success && position.length === 3 && quaternion.length === 4 && applyJointRecordToJoints(arm, jointDegrees, `已填入 ${message.record?.label ?? "记录"} / ${MOTION_LABELS[command]}`)) {
        poseTargetsByArm[arm] = [...position, ...quaternion].map((value) => String(value));
        const reference = message.reference as FrameState | undefined;
        if (reference?.type === 3) poseReferenceByArm[arm] = reference;
        poseSliderCentersByArm[arm] = [...position];
        setKinematicsStatus(arm, `记录正解已填入 / ${referenceLabel(reference ?? poseReference(arm))}`);
        if (arm === selectedArm) renderPoseInputs();
      } else {
        setRecordStatus(arm, `记录正解失败 / ${message.message || "forward kinematics failed"}`);
      }
    }
    updateButtons();
  } else if (message.type === "kinematics_result") {
    const arm = message.arm as ArmId;
    if (activeKinematicsRequestByArm[arm] !== message.request_id) return;
    delete activeKinematicsRequestByArm[arm];
    if (message.operation === "get_current_pose") {
      const position = Array.isArray(message.pose_position_m) ? message.pose_position_m : [];
      const quaternion = Array.isArray(message.pose_quaternion_wxyz) ? message.pose_quaternion_wxyz : [];
      if (message.success && position.length === 3 && quaternion.length === 4) {
        poseTargetsByArm[arm] = [...position, ...quaternion].map((value) => String(value));
        const reference = message.reference as FrameState | undefined;
        if (reference?.type === 3) poseReferenceByArm[arm] = reference;
        poseSliderCentersByArm[arm] = [...position];
        ikPreviewValidByArm[arm] = false;
        setKinematicsStatus(arm, `当前位置已填入 / ${referenceLabel(reference ?? poseReference(arm))}`);
        if (arm === selectedArm) renderPoseInputs();
        if (arm === selectedArm) setShadowVisibility(arm);
      } else {
        setKinematicsStatus(arm, `当前位置读取失败 / ${message.message || "unknown error"}`);
      }
    } else if (message.operation === "solve_ik") {
      const degrees = Array.isArray(message.joint_degrees) ? message.joint_degrees : [];
      const config = manifest?.robots.find((item) => item.id === arm);
      const valid = Boolean(message.success) && degrees.length === 6 && config?.joints.every(
        (joint, index) => Number.isFinite(Number(degrees[index])) &&
          Number(degrees[index]) >= joint.lower_deg && Number(degrees[index]) <= joint.upper_deg,
      );
      if (valid) {
        const radians = degrees.map((value: number) => Number(value) * Math.PI / 180);
        targetJointsByArm[arm] = [...radians];
        targetEditedByArm[arm] = true;
        ikPreviewValidByArm[arm] = true;
        if (arm === selectedArm) {
          targetJoints = [...radians];
          setJointInputs(radians, true);
        }
        setRobotJoints(robotScenes[arm]?.shadow, radians);
        setKinematicsStatus(arm, `逆解成功 / 影子已更新 / ${degrees.map((value: number) => Number(value).toFixed(2)).join(", ")}°`);
        if (arm === selectedArm) {
          setShadowVisibility(arm);
          frameScene(true);
        }
      } else {
        ikPreviewValidByArm[arm] = false;
        setKinematicsStatus(arm, `逆解失败 / ${message.message || "target is unreachable"}`);
        if (arm === selectedArm) setShadowVisibility(arm);
      }
    }
    updateButtons();
  } else if (message.type === "action_state") {
    if (message.arm !== selectedArm) {
      renderFleetStrip();
      return;
    }
    if (message.action === "execute_motion" && activeMotionRequest && message.request_id && message.request_id !== activeMotionRequest) return;
    actionState.textContent = String(message.state).toUpperCase();
    actionState.className = `mini-state ${message.state}`;
    if (message.action === "cartesian_velocity") velocityState.textContent = String(message.state).toUpperCase();
    if (["rejected", "error", "stopped"].includes(message.state)) {
      if (message.action === "execute_motion") {
        window.clearTimeout(motionFeedbackTimer);
        motionFeedbackTimer = 0;
        feedback.textContent = `${message.action} / ${message.message || `action ${message.state}`}`;
        progress.style.width = "0%";
        activeMotionRequest = "";
      }
      if (message.action === "cartesian_velocity") { activeVelocityRequest = ""; window.clearInterval(velocityTimer); velocityTimer = 0; }
      updateButtons();
    }
  } else if (message.type === "action_feedback") {
    if (message.arm !== selectedArm) return;
    if (message.action === "execute_motion") {
      if (activeMotionRequest && message.request_id && message.request_id !== activeMotionRequest) return;
      window.clearTimeout(motionFeedbackTimer);
      motionFeedbackTimer = 0;
    }
    const item = message.feedback || {};
    feedback.textContent = `${message.action} / ${item.detail || "executing"} / progress ${item.progress ?? "-"}`;
    // The action starts with a validating feedback frame whose joint field is
    // intentionally empty (serialized as six zeroes).  Only /joint_states is
    // authoritative for the live URDF, otherwise that frame causes a visible
    // jump before the next state sample restores the actual pose.
    if (Array.isArray(item.commanded_linear_velocity_mps)) feedback.textContent = `velocity / ${item.commanded_linear_velocity_mps.map((value: number) => displayNumber(value)).join(", ")}`;
    progress.style.width = `${Math.max(0, Math.min(100, Number(item.progress || 0) * 100))}%`;
  } else if (message.type === "action_result") {
    if (message.arm !== selectedArm) return;
    if (message.action === "execute_motion") {
      if (activeMotionRequest && message.request_id && message.request_id !== activeMotionRequest) return;
      window.clearTimeout(motionFeedbackTimer);
      motionFeedbackTimer = 0;
      if (feedback.textContent.includes("等待 feedback") || feedback.textContent.includes("尚未收到")) {
        feedback.textContent = `${message.action} / ${message.result?.message || "已收到运行结果"}`;
      }
    }
    result.textContent = JSON.stringify(message.result, null, 2);
    actionState.textContent = "RESULT";
    activeMotionRequest = message.action === "execute_motion" ? "" : activeMotionRequest;
    activeVelocityRequest = message.action === "cartesian_velocity" ? "" : activeVelocityRequest;
    updateButtons();
  } else if (message.type === "software_stop_result") {
    result.textContent = `软件停止: ${message.success ? "成功" : "失败"} / ${message.message}`;
  } else if (message.type === "motion_recovery_state") {
    const arm = message.arm as ArmId;
    if (activeRecoveryRequestByArm[arm] !== message.request_id) return;
    result.textContent = `${arm.toUpperCase()} 恢复请求中 / ${message.state}`;
    updateButtons();
  } else if (message.type === "motion_recovery_result") {
    const arm = message.arm as ArmId;
    if (activeRecoveryRequestByArm[arm] !== message.request_id) return;
    delete activeRecoveryRequestByArm[arm];
    const status = message.success
      ? (message.recovered ? "已恢复" : "无需恢复")
      : "恢复失败";
    result.textContent = `${arm.toUpperCase()} ${status} / ${message.message || "unknown error"}`;
    if (arm === selectedArm) actionState.textContent = status.toUpperCase();
    updateButtons();
  } else if (message.type === "bt_runtime") {
    // Pushed by the server on every visible change of the executor's snapshot, and once after hello.
    btRuntime = message.runtime?.available === true ? message.runtime as BtRuntime : { available: false };
    renderBehaviorTree();
  } else if (message.type === "behavior_tree_stop_result") {
    if (message.request_id !== btStopRequest) return;
    setBtStopStatus(message.success
      ? `已请求终止（${message.message}），等待行为树取消动作并退出…`
      : `终止失败：${message.message}`, !message.success);
    if (!message.success) btStopRequest = "";
    renderBtStopButton();
  } else if (message.type === "error" && message.request_id && message.request_id === btStopRequest) {
    btStopRequest = "";
    setBtStopStatus(`终止失败：${message.message}`, true);
    renderBtStopButton();
  } else if (message.type === "error") {
    if (message.code === "keyboard_lease" || message.code === "keyboard_inactive") {
      keyboardLeaseOwned = false;
      releaseKeyboardInput();
      inputModeResultDetail = `${message.code}: ${message.message}`;
      renderInputModeCard();
      return;
    }
    result.textContent = `${message.code}: ${message.message}`;
    if (message.request_id === activeInputModeRequest) {
      inputModeResultDetail = `${message.code}: ${message.message}`;
      clearInputModeRequest();
      renderInputModeCard();
    }
    if (activeMotionRequest && message.request_id === activeMotionRequest) {
      window.clearTimeout(motionFeedbackTimer);
      motionFeedbackTimer = 0;
      feedback.textContent = `execute_motion / ${message.code}: ${message.message}`;
      progress.style.width = "0%";
      activeMotionRequest = "";
    }
    if (message.request_id === activeVelocityRequest) { activeVelocityRequest = ""; window.clearInterval(velocityTimer); velocityTimer = 0; }
    for (const arm of ["l", "m", "r"] as ArmId[]) {
      if (message.request_id === activeKinematicsRequestByArm[arm]) {
        delete activeKinematicsRequestByArm[arm];
        setKinematicsStatus(arm, `${message.code}: ${message.message}`);
      }
      if (message.request_id === activeRecordRequestByArm[arm]) {
        finishRecordRequest(arm, message.request_id);
        setRecordStatus(arm, `${message.code}: ${message.message}`);
      }
      if (message.request_id === activeRecoveryRequestByArm[arm]) {
        delete activeRecoveryRequestByArm[arm];
        result.textContent = `${arm.toUpperCase()} 恢复失败 / ${message.code}: ${message.message}`;
      }
    }
    updateButtons();
  }
}

function connect() {
  keyboardLeaseOwned = false;
  releaseKeyboardInput();
  socket?.close();
  const protocol = location.protocol === "https:" ? "wss" : "ws";
  socket = new WebSocket(`${protocol}://${location.host}/ws`);
  socket.addEventListener("open", () => {
    setConnection(true);
    updateButtons();
  });
  socket.addEventListener("close", () => {
    releaseKeyboardInput();
    setConnection(false);
    clearInputModeRequest();
    // Tree states only arrive over this socket; do not keep showing a frozen tree.
    btRuntime = { available: false };
    renderBehaviorTree();
    updateButtons();
    window.setTimeout(connect, 2000);
  });
  socket.addEventListener("message", (event) => { try { handleMessage(JSON.parse(event.data)); } catch { result.textContent = "收到无法解析的服务器消息"; } });
}

function updateButtons() {
  const writable = canWrite();
  const motionTargetValid = Boolean(readMotionSettings()) && (selectedMotionCommand === 0 || Boolean(readPoseGoal()));
  executeMotionButton.disabled = !writable || Boolean(activeMotionRequest) || !motionTargetValid;
  startVelocityButton.disabled = !writable || Boolean(activeVelocityRequest);
  cancelVelocityButton.disabled = !writable || !Boolean(activeVelocityRequest);
  cancelMotionButton.disabled = !writable || !Boolean(activeMotionRequest);
  recoverMotionButton.disabled = !writable || Boolean(activeRecoveryRequestByArm[selectedArm]);
  stopButton.disabled = !writable;
  const activeKinematicsRequest = Boolean(activeKinematicsRequestByArm[selectedArm]);
  fillCurrentPoseButton.disabled = !writable || selectedMotionCommand === 0;
  solveIkButton.disabled = !writable || selectedMotionCommand !== 1 || activeKinematicsRequest || !Boolean(readPoseGoal());
  const activeRecordRequest = Boolean(activeRecordRequestByArm[selectedArm]);
  copyCurrentJointsButton.disabled = !writable || lastJointStampByArm[selectedArm] === undefined;
  saveRecordButton.disabled = !writable || activeRecordRequest || recordNameInput.value.trim() === "" || (currentJointsByArm[selectedArm]?.length ?? 0) !== 6;
  applyRecordButton.disabled = !writable || activeRecordRequest || !recordSelect.value;
  deleteRecordButton.disabled = !writable || selectedMotionCommand !== 0 || activeRecordRequest || !recordSelect.value;
  updateInputModeSelectionDisabled();
  // canWrite() changes on socket open/close and hello; all of those paths end in updateButtons().
  renderGripperLimits();
}

function loadManifest(next: Manifest) {
  manifest = next;
  renderKeyboardControl();
  selectedArm = armSelect.value as ArmId;
  next.robots.forEach((item) => {
    const initial = item.joints.map(() => next.default_joint_position_rad);
    currentJointsByArm[item.id] = currentJointsByArm[item.id] ?? [...initial];
    targetJointsByArm[item.id] = targetJointsByArm[item.id] ?? [...initial];
    poseTargetsByArm[item.id] = poseTargetsByArm[item.id] ?? ["", "", "", "1", "0", "0", "0"];
    jointRecordsByArm[item.id] = jointRecordsByArm[item.id] ?? [];
    motionSettingsByArm[item.id] = motionSettingsByArm[item.id] ?? {
      velocity: displayValue(30),
      timeout: displayValue(item.motion.default_timeout_sec),
    };
  });
  currentJoints = [...armJointSnapshot(selectedArm)];
  targetJoints = [...armTargetSnapshot(selectedArm)];
  $("#root-frame").textContent = `TF / ${next.root_frame}`;
  selectedArmLabel.textContent = selectedArm.toUpperCase();
  selectedArmLabel.className = "mini-state active-arm";
  renderJointControls();
  renderRecordControls();
  renderMotionEditor();
  configureVelocity();
  renderCoordinateState();
  renderCartesianVelocityTelemetry();
  renderFleetStrip();
  setSelectedConnection();
  if (!renderer) initScene();
  loadFleet();
  updateButtons();
}

window.addEventListener("keydown", (event) => {
  const target = event.target as HTMLElement | null;
  if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey || event.isComposing) return;
  if (target?.closest("input, textarea, select") || target?.isContentEditable) return;
  const arm = keyboardArmForCode(event.code);
  if (!arm || !keyboardCodeReady(arm, event.code)) return;
  event.preventDefault();
  if (!keyboardPressed[arm].has(event.code)) {
    keyboardPressed[arm].add(event.code);
    reconcileKeyboardControl();
    sendKeyboardStates();
    renderKeyboardControl();
  }
});
window.addEventListener("keyup", (event) => {
  const arm = keyboardArmForCode(event.code);
  if (!arm || !keyboardPressed[arm].delete(event.code)) return;
  event.preventDefault();
  sendKeyboardStates();
  renderKeyboardControl();
});
window.addEventListener("blur", releaseKeyboardInput);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) releaseKeyboardInput();
});

// Same as pressing 重置目标: snap the joint target and its shadow to the live pose.
function resetMotionTarget() {
  if (lastJointStampByArm[selectedArm] === undefined) return;
  targetJoints = [...currentJoints];
  targetJointsByArm[selectedArm] = [...targetJoints];
  targetEditedByArm[selectedArm] = true;
  setJointInputs(targetJoints, true);
  setRobotJoints(selectedRobotScene()?.shadow, targetJoints);
}
resetPreviewButton.addEventListener("click", resetMotionTarget);
armSelect.addEventListener("change", () => {
  selectedArm = armSelect.value as ArmId;
  activeMotionRequest = "";
  activeVelocityRequest = "";
  window.clearInterval(velocityTimer);
  velocityTimer = 0;
  renderJointControls();
  setShadowVisibility(selectedArm);
  updateSelectedArmFromState();
  const config = robotConfig(selectedArm);
  $("#model-label").textContent = `${config.model} / ${selectedArm.toUpperCase()} + 3 arms`;
});
inputModeSelect.addEventListener("change", () => {
  const selected = inputModeCatalog?.find((option) => option.id === inputModeSelect.value);
  if (!selected || !selected.selectable || selected.id === "web" || !canWrite()) return;
  requestInputMode(selected, `请求切换到 ${selected.label}…`);
});
// "重启此分支": select none, then (in finishInputModeRequestIfTerminal) the branch that was active.
inputModeRestart.addEventListener("click", () => {
  const target = restartableInputMode();
  const none = selectableInputMode("none");
  if (!target || !none || activeInputModeRequest || !canWrite()) return;
  requestInputMode(none, `重启 ${target.label}：先切换到 ${none.label}…`);
  restartInputModeTarget = target.id;
});
motionMode.querySelectorAll<HTMLButtonElement>("button[data-motion-command]").forEach((button) => {
  button.addEventListener("click", () => {
    const command = Number(button.dataset.motionCommand);
    if (command === 0 || command === 1 || command === 2) setMotionMode(command);
  });
});
poseInputElements().forEach((input) => {
  input.addEventListener("input", () => {
    poseTargetsByArm[selectedArm] = poseInputElements().map((item) => item.value);
    syncPoseSlidersFromInputs();
    ikPreviewValidByArm[selectedArm] = false;
    setKinematicsStatus(selectedArm, poseTargetEditedStatus());
    setShadowVisibility(selectedArm);
    updateButtons();
  });
});
[motionVelocityInput, motionTimeoutInput].forEach((input) => {
  input.addEventListener("input", () => {
    motionSettingsByArm[selectedArm] = {
      velocity: motionVelocityInput.value,
      timeout: motionTimeoutInput.value,
    };
    updateButtons();
  });
});
recordNameInput.addEventListener("input", updateButtons);
recordSelect.addEventListener("change", updateButtons);
copyCurrentJointsButton.addEventListener("click", async () => {
  const values = currentJointsByArm[selectedArm];
  if (!values || values.length !== 6 || lastJointStampByArm[selectedArm] === undefined) return;
  try {
    await copyText(formatJointDegrees(values));
    jointCopyStatus.textContent = "已复制当前关节角";
  } catch {
    jointCopyStatus.textContent = "复制失败，请检查浏览器剪贴板权限";
  }
});
saveRecordButton.addEventListener("click", () => {
  if (!canWrite()) return;
  const label = recordNameInput.value.trim();
  if (!label) return;
  const requestIdValue = requestId("save-record");
  beginRecordRequest(selectedArm, requestIdValue, "保存当前关节角…");
  send({ type: "save_joint_record", request_id: requestIdValue, arm: selectedArm, label });
  updateButtons();
});
applyRecordButton.addEventListener("click", () => {
  if (!canWrite() || !recordSelect.value) return;
  const requestIdValue = requestId("apply-record");
  const reference = selectedMotionCommand === 0 ? preferredReference() : poseReference();
  beginRecordRequest(selectedArm, requestIdValue, "读取记录…");
  send({
    type: "apply_joint_record",
    request_id: requestIdValue,
    arm: selectedArm,
    record_id: recordSelect.value,
    command: selectedMotionCommand,
    reference: {
      reference_type: reference.type,
      reference_name: reference.name,
    },
  });
  updateButtons();
});
deleteRecordButton.addEventListener("click", () => {
  if (!canWrite() || selectedMotionCommand !== 0 || !recordSelect.value) return;
  const record = jointRecordsByArm[selectedArm]?.find((item) => item.id === recordSelect.value);
  if (!window.confirm(`删除关节记录“${record?.label ?? recordSelect.value}”？此操作不可撤销。`)) return;
  const requestIdValue = requestId("delete-record");
  beginRecordRequest(selectedArm, requestIdValue, "删除关节记录…");
  send({ type: "delete_joint_record", request_id: requestIdValue, arm: selectedArm, record_id: recordSelect.value });
  updateButtons();
});
executeMotionButton.addEventListener("click", () => {
  const settings = readMotionSettings();
  const pose = selectedMotionCommand === 0 ? null : readPoseGoal();
  if (!canWrite() || !settings || (selectedMotionCommand !== 0 && !pose)) return;
  const commandLabel = MOTION_LABELS[selectedMotionCommand];
  activeMotionRequest = requestId(commandLabel.toLowerCase());
  const reference = selectedMotionCommand === 0 ? preferredReference() : poseReference();
  send({
    type: "execute_motion",
    request_id: activeMotionRequest,
    arm: selectedArm,
    goal: {
      command: selectedMotionCommand,
      reference_type: reference.type,
      reference_name: reference.name,
      joint_degrees: selectedMotionCommand === 0 ? targetJoints.map((value) => value * 180 / Math.PI) : [0, 0, 0, 0, 0, 0],
      pose_position_m: pose?.position ?? [0, 0, 0],
      pose_quaternion_wxyz: pose?.quaternion ?? [1, 0, 0, 0],
      velocity_percent: settings.velocity,
      blend_radius_percent: 0,
      timeout_sec: settings.timeout,
    },
  });
  feedback.textContent = `${commandLabel} / ${referenceLabel(reference)} / 等待 feedback…`;
  window.clearTimeout(motionFeedbackTimer);
  const pendingRequestId = activeMotionRequest;
  const pendingArm = selectedArm;
  motionFeedbackTimer = window.setTimeout(() => {
    motionFeedbackTimer = 0;
    if (activeMotionRequest !== pendingRequestId || selectedArm !== pendingArm) return;
    feedback.textContent = `${commandLabel} / 尚未收到 Action feedback；运行状态未知，请勿重复发送。检查 /${pendingArm}/execute_motion 和驱动日志，必要时使用软件停止。`;
  }, 8_000);
  updateButtons();
});
fillCurrentPoseButton.addEventListener("click", () => {
  if (selectedMotionCommand === 0) return;
  requestCurrentPose(selectedArm, true);
});
solveIkButton.addEventListener("click", () => {
  const pose = readPoseGoal();
  const reference = poseReference();
  const joints = armJointSnapshot(selectedArm);
  if (!canWrite() || selectedMotionCommand !== 1 || !pose || joints.length !== 6) return;
  const requestIdValue = requestId("solve-ik");
  activeKinematicsRequestByArm[selectedArm] = requestIdValue;
  setKinematicsStatus(selectedArm, "计算逆解…");
  send({
    type: "solve_ik",
    request_id: requestIdValue,
    arm: selectedArm,
    goal: {
      reference_type: reference.type,
      reference_name: reference.name,
      seed_joint_degrees: joints.map((value) => value * 180 / Math.PI),
      pose_position_m: pose.position,
      pose_quaternion_wxyz: pose.quaternion,
    },
  });
  updateButtons();
});
startVelocityButton.addEventListener("click", () => {
  if (!canWrite()) return;
  const frame = robot().frames[($("#velocity-frame") as HTMLSelectElement).value];
  activeVelocityRequest = requestId("velocity");
  send({ type: "start_cartesian_velocity", request_id: activeVelocityRequest, arm: selectedArm, goal: { reference_type: frame.type, reference_name: frame.name, control_period_ms: Number(( $("#velocity-period") as HTMLInputElement).value), watchdog_ms: Number(( $("#velocity-watchdog") as HTMLInputElement).value), max_linear_accel_mps2: Number(( $("#linear-accel") as HTMLInputElement).value), max_angular_accel_radps2: Number(( $("#angular-accel") as HTMLInputElement).value), follow: false, trajectory_mode: 0, radio: 0 } });
  updateButtons();
  velocityTimer = window.setInterval(() => {
    const values = Array.from({ length: 6 }, (_, index) => Number(($(`#velocity-${index}`) as HTMLInputElement).value));
    send({ type: "velocity_command", arm: selectedArm, linear: values.slice(0, 3), angular: values.slice(3) });
  }, 20);
});
poseReferenceFrame.addEventListener("change", () => {
  const selected = availablePoseReferences(selectedArm).find(
    (frame) => (frame.frame_id ?? frame.name) === poseReferenceFrame.value,
  );
  if (!selected) return;
  poseReferenceByArm[selectedArm] = selected;
  motionReference.textContent = referenceLabel(selected);
  poseSliderCentersByArm[selectedArm] = undefined;
  requestCurrentPose(selectedArm, true);
});
cancelVelocityButton.addEventListener("click", () => { send({ type: "cancel_action", arm: selectedArm, action: "cartesian_velocity" }); window.clearInterval(velocityTimer); velocityTimer = 0; });
cancelMotionButton.addEventListener("click", () => { send({ type: "cancel_action", arm: selectedArm, action: "execute_motion" }); });
stopButton.addEventListener("click", () => { send({ type: "software_stop", request_id: requestId("stop"), arm: selectedArm }); });
recoverMotionButton.addEventListener("click", () => {
  if (!canWrite() || activeRecoveryRequestByArm[selectedArm]) return;
  const requestIdValue = requestId("recover");
  activeRecoveryRequestByArm[selectedArm] = requestIdValue;
  result.textContent = `${selectedArm.toUpperCase()} 恢复请求中…`;
  send({ type: "recover_motion", request_id: requestIdValue, arm: selectedArm });
  updateButtons();
});
fetch("/api/layout").then((response) => response.json()).then(loadManifest).catch((error) => {
  const message = String(error);
  viewerState.textContent = message.includes("WebGL")
    ? `WebGL 渲染失败: ${message}`
    : `布局加载失败: ${message}`;
  viewerState.removeAttribute("hidden");
});
($("#gripper-select") as HTMLSelectElement).addEventListener("change", (event) => {
  selectedGripper = (event.target as HTMLSelectElement).value;
  gripperLimitsDirty = false;
  setGripperLimitsStatus("");
  renderGripperState();
  renderGripperLimits();
});
$("#gripper-open").addEventListener("click", () => sendGripper("open"));
$("#gripper-close").addEventListener("click", () => sendGripper("close"));
$("#gripper-enable").addEventListener("click", () => sendGripper("enable"));
$("#gripper-reset").addEventListener("click", () => sendGripper("reset"));
$("#gripper-percentage").addEventListener("change", (event) => sendGripper("percentage", { percentage: Number((event.target as HTMLInputElement).value) }));
for (const id of ["#gripper-open-position", "#gripper-close-position"]) {
  ($(id) as HTMLInputElement).addEventListener("input", () => {
    gripperLimitsDirty = true;
    setGripperLimitsStatus("");
  });
}
$("#gripper-teach-open").addEventListener("click", () => teachGripperLimit("open"));
$("#gripper-teach-close").addEventListener("click", () => teachGripperLimit("close"));
$("#gripper-limits-apply").addEventListener("click", applyGripperLimits);
const gripperRaw = $("#gripper-raw-position") as HTMLInputElement;
gripperRaw.addEventListener("input", () => { $("#gripper-raw-value").textContent = gripperRaw.value; });
gripperRaw.addEventListener("change", () => sendGripper("move_raw", { position: Number(gripperRaw.value) }));
connect();

// Behavior tree: shown only while bt-start's monitor serves a live snapshot.
const btPanel = $("#bt-panel") as HTMLElement;
const btTabDot = $("#bt-dot") as HTMLElement;
const btCollapse = $("#bt-collapse") as HTMLButtonElement;
const btBody = $("#bt-body") as HTMLElement;
const btCollapsedStorageKey = "realman-web-control.bt-collapsed";
let btCollapsed = false;
try { btCollapsed = window.localStorage.getItem(btCollapsedStorageKey) === "true"; } catch { /* per-viewer convenience only */ }
function renderBtCollapse() {
  btBody.hidden = btCollapsed;
  btCollapse.textContent = btCollapsed ? "▸" : "▾";
  btCollapse.title = btCollapsed ? "展开" : "收起";
  btCollapse.setAttribute("aria-expanded", String(!btCollapsed));
}
btCollapse.addEventListener("click", () => {
  btCollapsed = !btCollapsed;
  try { window.localStorage.setItem(btCollapsedStorageKey, String(btCollapsed)); } catch { /* per-viewer convenience only */ }
  renderBtCollapse();
});
renderBtCollapse();
const btRootStatus = $("#bt-root-status") as HTMLElement;
const btTreeId = $("#bt-tree-id") as HTMLElement;
const btScopeToggle = $("#bt-scope-toggle") as HTMLButtonElement;
const btBreadcrumb = $("#bt-breadcrumb") as HTMLElement;
const btFailure = $("#bt-failure") as HTMLElement;
const btModeReason = $("#bt-mode-reason") as HTMLElement;
const btTreeHost = $("#bt-tree") as HTMLElement;
const btToggled = new Map<string, boolean>();
let btRuntime: BtRuntime = { available: false };
let btShowWholeTree = false;
let btLastMarkup = "";
let btWasRunning = false;
// Why the router is (or is going) to the none branch: a branch failure ("policy failed: ...") or a
// request ("requested by ..."). The executor keeps that reason on the none state until the next
// switch, so it stays here after the failed branch has been halted and its nodes reset.
function renderBtModeReason() {
  const state = inputModeState;
  const failed = state?.phase === "FAILED";
  const toNone = state !== undefined && (state.requested_mode === "none" ||
    (state.phase === "ACTIVE" && state.active_mode === "none"));
  const shown = Boolean(state?.detail) && (failed || toNone);
  btModeReason.hidden = !shown;
  btModeReason.classList.toggle("bt-mode-reason-failure", shown && (failed || / failed: /.test(state!.detail)));
  btModeReason.textContent = !shown ? "" : failed
    ? `${inputModeLabel(state!.requested_mode)} 失败：${state!.detail}`
    : `切换到 ${inputModeLabel("none")} 分支的原因：${state!.detail}`;
}
function renderBehaviorTree() {
  // The card stays while trees can be started from here, and always while one runs.
  btPanel.hidden = !btRuntime.available && !btLibrary.available;
  if (btRuntime.available && !btWasRunning) {
    // A tree that just started is announced by a short highlight, even when the card is folded.
    btPanel.classList.add("bt-attention");
    window.setTimeout(() => btPanel.classList.remove("bt-attention"), 4000);
  }
  btWasRunning = btRuntime.available;
  btRunningSection.hidden = !btRuntime.available;
  btStopButton.hidden = !btRuntime.available;
  renderBtLauncher();
  if (!btRuntime.available) {
    btRootStatus.textContent = "未运行";
    btRootStatus.className = "bt-status bt-idle";
    btTabDot.className = "tab-dot";
    btLastMarkup = "";
    // The tree is gone (stopped from here, Ctrl-C or a terminal exit): forget any stop in flight.
    if (btStopRequest) setBtStopStatus("", false);
    btStopRequest = "";
    btStopArmedUntil = 0;
    renderBtStopButton();
    return;
  }
  renderBtStopButton();
  const root = buildBtTree(btRuntime.nodes);
  btRootStatus.textContent = btRuntime.root_status;
  btRootStatus.className = `bt-status bt-${btRuntime.root_status.toLowerCase()}`;
  btTabDot.className = `tab-dot bt-dot-${btRuntime.root_status.toLowerCase()}`;
  btFailure.hidden = !btRuntime.failure_reason;
  btFailure.textContent = btRuntime.failure_reason;
  renderBtModeReason();
  if (!root) return;
  const router = findInputRouter(root);
  const branch = router && activeRouterBranch(router, inputModeState?.active_mode);
  const focused = router && !btShowWholeTree ? branch : undefined;
  btScopeToggle.hidden = !router;
  btScopeToggle.textContent = btShowWholeTree ? "只看当前分支" : "显示整棵树";
  btTreeId.textContent = router
    ? `${btRuntime.tree_id || "tree"} · 输入路由 ${branch ? branch.name : "（无活动分支）"}`
    : `${btRuntime.tree_id || "tree"} · 整棵树`;
  btBreadcrumb.hidden = !focused;
  const markup = focused ? renderBtNode(focused, btToggled) : router && !btShowWholeTree
    ? `<li class="bt-empty">没有处于活动状态的输入分支</li>`
    : renderBtNode(root, btToggled, new Set(router?.children.filter((child) => child !== branch).map((child) => child.path)));
  const crumbs = focused ? renderBreadcrumb(ancestors(root, focused.path)) : "";
  // The executor rewrites the snapshot every tick; skip DOM work when nothing visible changed.
  if (markup + crumbs === btLastMarkup) return;
  btLastMarkup = markup + crumbs;
  btBreadcrumb.innerHTML = crumbs;
  btTreeHost.innerHTML = markup;
  btTreeHost.dataset.scope = focused ? focused.name : "tree";
}
btTreeHost.addEventListener("click", (event) => {
  const toggle = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-bt-toggle]");
  if (!toggle) return;
  btToggled.set(toggle.dataset.btToggle!, toggle.getAttribute("aria-expanded") === "true");
  renderBehaviorTree();
});
// Stopping the tree is the Web equivalent of Ctrl-C on `./rm65 bt`: a first click arms the
// button, a second click within a few seconds sends it.
const btStopButton = $("#bt-stop") as HTMLButtonElement;
const btStopStatus = $("#bt-stop-status") as HTMLElement;
let btStopRequest = "";
let btStopArmedUntil = 0;
function setBtStopStatus(text: string, error: boolean) {
  btStopStatus.hidden = !text;
  btStopStatus.textContent = text;
  btStopStatus.classList.toggle("error", error);
}
function renderBtStopButton() {
  const armed = btStopArmedUntil > Date.now();
  btStopButton.disabled = !canWrite() || Boolean(btStopRequest);
  btStopButton.textContent = btStopRequest ? "正在终止…" : armed ? "确认终止？" : "终止行为树";
  btStopButton.classList.toggle("armed", armed && !btStopRequest);
}
btStopButton.addEventListener("click", () => {
  if (!canWrite() || btStopRequest) return;
  if (btStopArmedUntil <= Date.now()) {
    btStopArmedUntil = Date.now() + 4000;
    renderBtStopButton();
    window.setTimeout(renderBtStopButton, 4100);
    return;
  }
  btStopArmedUntil = 0;
  btStopRequest = requestId("bt-stop");
  send({ type: "stop_behavior_tree", request_id: btStopRequest });
  setBtStopStatus("已发送终止请求…", false);
  renderBtStopButton();
});
btScopeToggle.addEventListener("click", () => {
  btShowWholeTree = !btShowWholeTree;
  renderBehaviorTree();
});
// Start menu: tree files from config/behavior-trees, shared favorites pinned first.
type BtLibraryTree = { name: string; main_tree: string; launch: string; arms: string[]; valid: boolean; favorite: boolean };
type BtLibrary = { available: boolean; trees?: BtLibraryTree[]; launcher?: Record<string, any> };
const btLauncherSection = $("#bt-launcher") as HTMLElement;
const btPickerButton = $("#bt-picker-button") as HTMLButtonElement;
const btPickerLabel = $("#bt-picker-label") as HTMLElement;
const btPickerMeta = $("#bt-picker-meta") as HTMLElement;
const btPickerList = $("#bt-picker-list") as HTMLElement;
const btRealMotion = $("#bt-real-motion") as HTMLInputElement;
const btStartButton = $("#bt-start") as HTMLButtonElement;
const btStartStatus = $("#bt-start-status") as HTMLElement;
const btStartLog = $("#bt-start-log") as HTMLElement;
const btRunningSection = $("#bt-running") as HTMLElement;
const btSelectedStorageKey = "realman-web-control.bt-tree";
let btLibrary: BtLibrary = { available: false };
let btSelectedTree = "";
try { btSelectedTree = window.localStorage.getItem(btSelectedStorageKey) ?? ""; } catch { /* per-viewer convenience only */ }
let btStartArmedUntil = 0;
let btStartPending: { tree: string; dryRun: boolean; since: number; startedAt?: number } | undefined;
function treeMeta(tree: BtLibraryTree) {
  if (!tree.valid) return "XML 无法解析";
  return [tree.launch || "launch?", tree.arms.length ? tree.arms.join(",") : ""].filter(Boolean).join(" · ");
}
function setBtStartStatus(text: string, error = false, log: string[] = []) {
  btStartStatus.hidden = !text;
  btStartStatus.textContent = text;
  btStartStatus.classList.toggle("error", error);
  btStartLog.hidden = !log.length;
  btStartLog.textContent = log.join("\n");
}
function renderBtPickerList() {
  const trees = btLibrary.trees ?? [];
  const row = (tree: BtLibraryTree) => `<div class="bt-option${tree.name === btSelectedTree ? " selected" : ""}${tree.valid ? "" : " invalid"}" role="option" aria-selected="${tree.name === btSelectedTree}" data-tree="${escapeHtml(tree.name)}">
      <button type="button" class="bt-star${tree.favorite ? " on" : ""}" data-favorite-toggle="${escapeHtml(tree.name)}" aria-pressed="${tree.favorite}" title="${tree.favorite ? "取消收藏" : "收藏置顶"}">${tree.favorite ? "★" : "☆"}</button>
      <span class="bt-option-name">${escapeHtml(tree.name.replace(/\.xml$/, ""))}</span><span class="bt-option-meta">${escapeHtml(treeMeta(tree))}</span></div>`;
  const favorites = trees.filter((tree) => tree.favorite);
  const others = trees.filter((tree) => !tree.favorite);
  btPickerList.innerHTML = (favorites.length ? `<div class="bt-option-group">收藏</div>${favorites.map(row).join("")}` : "")
    + `<div class="bt-option-group">${favorites.length ? "其它" : "全部"}</div>${others.map(row).join("") || `<div class="bt-option-empty">没有行为树文件</div>`}`;
}
function renderBtLauncher() {
  btLauncherSection.hidden = btRuntime.available || !btLibrary.available;
  const trees = btLibrary.trees ?? [];
  if (!trees.some((tree) => tree.name === btSelectedTree)) btSelectedTree = trees.find((tree) => tree.valid)?.name ?? "";
  const selected = trees.find((tree) => tree.name === btSelectedTree);
  btPickerLabel.textContent = selected ? `${selected.favorite ? "★ " : ""}${selected.name.replace(/\.xml$/, "")}` : "选择行为树";
  btPickerMeta.textContent = selected ? treeMeta(selected) : "";
  if (!btPickerList.hidden) renderBtPickerList();
  const launcher = btLibrary.launcher ?? {};
  const busy = Boolean(launcher.running) || Boolean(btStartPending);
  const armed = btStartArmedUntil > Date.now();
  btStartButton.disabled = !btLibrary.available || !selected?.valid || busy;
  btStartButton.classList.toggle("armed", armed && !busy);
  btStartButton.classList.toggle("danger", armed && btRealMotion.checked);
  btStartButton.textContent = btStartPending ? "正在启动…" : armed
    ? (btRealMotion.checked ? "确认启动（真实运动）？" : "确认启动（dry-run）？") : "启动";
  if (btRuntime.available && btStartPending) {
    btStartPending = undefined;
    setBtStartStatus("");
  } else if (btStartPending) {
    // bt-start exits on its own when it cannot start (e.g. an arm Action is not ready).
    const exited = launcher.tree === btStartPending.tree && launcher.started_at_ms === btStartPending.startedAt &&
      typeof launcher.exit_code === "number";
    if (exited) {
      setBtStartStatus(`启动失败：bt-start 退出码 ${launcher.exit_code}（日志 ${launcher.log ?? ""}）`, true, launcher.log_tail ?? []);
      btStartPending = undefined;
    } else if (Date.now() - btStartPending.since > 60_000) {
      setBtStartStatus(`${btStartPending.tree} 60 s 内仍未运行，请查看日志 ${launcher.log ?? ""}`, true);
      btStartPending = undefined;
    }
  } else if (!btRuntime.available && launcher.running && !launcher.launched_here) {
    setBtStartStatus("已有行为树进程在运行（例如终端里的 ./rm65 bt），等待其监视器…");
  }
}
function closeBtPicker() {
  btPickerList.hidden = true;
  btPickerButton.setAttribute("aria-expanded", "false");
}
btPickerButton.addEventListener("click", () => {
  const opening = btPickerList.hidden;
  btPickerList.hidden = !opening;
  btPickerButton.setAttribute("aria-expanded", String(opening));
  if (opening) renderBtPickerList();
});
document.addEventListener("click", (event) => {
  if (!btPickerList.hidden && !(event.target as HTMLElement).closest(".bt-picker")) closeBtPicker();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !btPickerList.hidden) closeBtPicker();
});
btPickerList.addEventListener("click", async (event) => {
  const target = event.target as HTMLElement;
  const star = target.closest<HTMLButtonElement>("[data-favorite-toggle]");
  if (star) {
    const name = star.dataset.favoriteToggle!;
    const response = await fetch("/api/bt/favorites", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, favorite: star.getAttribute("aria-pressed") !== "true" }),
    }).catch(() => undefined);
    const payload = response && await response.json().catch(() => undefined);
    if (payload?.ok) btLibrary = { ...btLibrary, trees: payload.trees };
    else setBtStartStatus(`收藏失败：${payload?.error ?? "网络错误"}`, true);
    renderBtLauncher();
    renderBtPickerList();
    return;
  }
  const option = target.closest<HTMLElement>("[data-tree]");
  if (!option || option.classList.contains("invalid")) return;
  btSelectedTree = option.dataset.tree!;
  try { window.localStorage.setItem(btSelectedStorageKey, btSelectedTree); } catch { /* per-viewer convenience only */ }
  btStartArmedUntil = 0;
  closeBtPicker();
  renderBtLauncher();
});
btRealMotion.addEventListener("change", () => {
  btStartArmedUntil = 0;
  renderBtLauncher();
});
btStartButton.addEventListener("click", async () => {
  if (btStartButton.disabled) return;
  if (btStartArmedUntil <= Date.now()) {
    btStartArmedUntil = Date.now() + 4000;
    renderBtLauncher();
    window.setTimeout(renderBtLauncher, 4100);
    return;
  }
  btStartArmedUntil = 0;
  const tree = btSelectedTree;
  const dryRun = !btRealMotion.checked;
  btStartPending = { tree, dryRun, since: Date.now() };
  setBtStartStatus(`正在启动 ${tree}（${dryRun ? "dry-run" : "真实运动"}），等待机械臂 Action 就绪…`);
  renderBtLauncher();
  const response = await fetch("/api/bt/start", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tree, dry_run: dryRun }),
  }).catch(() => undefined);
  const payload = response && await response.json().catch(() => undefined);
  if (!response?.ok || !payload?.ok) {
    btStartPending = undefined;
    setBtStartStatus(`启动失败：${payload?.error ?? "网络错误"}`, true);
  } else if (btStartPending) {
    btStartPending.startedAt = payload.started_at_ms;
  }
  renderBtLauncher();
  pollBehaviorTreeLibrary();
});
let btLibraryPollInFlight = false;
async function pollBehaviorTreeLibrary() {
  if (btLibraryPollInFlight || document.hidden) return;
  btLibraryPollInFlight = true;
  try {
    const response = await fetch("/api/bt/trees", { cache: "no-store" });
    btLibrary = response.ok ? await response.json() as BtLibrary : { available: false };
  } catch {
    btLibrary = { available: false };
  } finally {
    btLibraryPollInFlight = false;
  }
  renderBehaviorTree();
}
window.setInterval(pollBehaviorTreeLibrary, 2000);
pollBehaviorTreeLibrary();
// "重启 Docker": the host restart helper restarts realman_bringup_remote (drivers, grippers,
// bt_launcher). This page lives in realman_web_control, so it stays up and shows the result.
type DockerRestartHelper = { restarting: boolean; service?: string; started_at_ms?: number; finished_at_ms?: number; exit_code?: number; output_tail?: string[] };
type DockerRestart = { available: boolean; service?: string; error?: string; helper?: DockerRestartHelper };
const dockerRestartButton = $("#docker-restart") as HTMLButtonElement;
const dockerRestartState = $("#docker-restart-state") as HTMLElement;
let dockerRestart: DockerRestart = { available: false };
let dockerRestartArmedUntil = 0;
let dockerRestartPosting = false;
function renderDockerRestart() {
  const configured = dockerRestart.available || Boolean(dockerRestart.error);
  dockerRestartButton.hidden = !configured;
  const helper = dockerRestart.helper;
  const busy = dockerRestartPosting || Boolean(helper?.restarting);
  const armed = dockerRestartArmedUntil > Date.now() && !busy;
  const service = dockerRestart.service ?? "realman_bringup_remote";
  dockerRestartButton.disabled = !dockerRestart.available || busy;
  dockerRestartButton.classList.toggle("danger", armed);
  dockerRestartButton.classList.toggle("ghost", !armed);
  dockerRestartButton.textContent = busy ? "重启中…" : armed ? "确认重启？" : "重启 Docker";
  dockerRestartButton.title = dockerRestart.error
    ? dockerRestart.error
    : `docker compose restart ${service}：机械臂驱动、夹爪和行为树启动器会断开约 10–30 s，运行中的 Action 和行为树会中断`;
  let text = "";
  let tone = "";
  let detail = "";
  if (busy) {
    const seconds = helper?.started_at_ms ? Math.max(0, Math.round((Date.now() - helper.started_at_ms) / 1000)) : 0;
    text = `RESTARTING ${seconds}s`;
  } else if (helper && typeof helper.exit_code === "number" && helper.finished_at_ms) {
    const at = new Date(helper.finished_at_ms).toLocaleTimeString("zh-CN", { hour12: false });
    text = helper.exit_code === 0 ? `RESTARTED ${at}` : `RESTART FAILED ${helper.exit_code}`;
    tone = helper.exit_code === 0 ? "ready" : "offline";
    detail = (helper.output_tail ?? []).join("\n");
  }
  dockerRestartState.hidden = !text;
  dockerRestartState.textContent = text;
  dockerRestartState.className = `status-pill${tone ? ` ${tone}` : ""}`;
  dockerRestartState.title = detail;
}
let dockerRestartPollInFlight = false;
async function pollDockerRestart() {
  if (dockerRestartPollInFlight || document.hidden) return;
  dockerRestartPollInFlight = true;
  try {
    const response = await fetch("/api/docker/restart", { cache: "no-store" });
    dockerRestart = response.ok ? await response.json() as DockerRestart : { available: false };
  } catch {
    dockerRestart = { available: false };
  } finally {
    dockerRestartPollInFlight = false;
  }
  renderDockerRestart();
}
dockerRestartButton.addEventListener("click", async () => {
  if (dockerRestartButton.disabled) return;
  if (dockerRestartArmedUntil <= Date.now()) {
    dockerRestartArmedUntil = Date.now() + 4000;
    renderDockerRestart();
    window.setTimeout(renderDockerRestart, 4100);
    return;
  }
  dockerRestartArmedUntil = 0;
  dockerRestartPosting = true;
  renderDockerRestart();
  const response = await fetch("/api/docker/restart", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })
    .catch(() => undefined);
  const payload = response && await response.json().catch(() => undefined);
  dockerRestartPosting = false;
  if (!response?.ok || !payload?.ok) window.alert(`重启失败：${payload?.error ?? "网络错误"}`);
  await pollDockerRestart();
});
window.setInterval(pollDockerRestart, 1000);
pollDockerRestart();
