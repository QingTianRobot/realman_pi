import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import URDFLoader from "urdf-loader";
import "./style.css";

type ArmId = "l" | "m" | "r";
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
type Manifest = {
  root_frame: string;
  default_joint_position_rad: number;
  robots: Robot[];
};
type MotionCommand = 0 | 1 | 2;
type Message = Record<string, any> & { type: string };
type RobotScene = { live: any | null; shadow: any | null };

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <header class="topbar">
    <div class="brand"><span class="brand-mark">RM</span><div><strong>RealMan Web Control</strong><small>ROS 2 action console</small></div></div>
    <label class="arm-picker">ARM <select id="arm-select"><option value="l">LEFT / 123</option><option value="m">MIDDLE / 125</option><option value="r">RIGHT / 124</option></select></label>
    <span id="connection" class="status-pill offline">OFFLINE</span>
    <span id="mode" class="status-pill ready">CONTROL READY</span>
    <span id="auth-button" class="status-pill ready">CONTROL OPEN</span>
    <button id="cancel-motion" class="button ghost" type="button" disabled>取消 Action</button>
    <button id="stop-button" class="button danger" type="button" disabled>■ 软件停止</button>
  </header>
  <main class="workspace">
    <section class="viewer-panel panel">
      <div class="panel-heading"><div><span class="eyebrow">LIVE / TARGET</span><h1>三维姿态</h1></div><div id="model-label" class="muted">loading model</div></div>
      <div class="viewer-layout">
        <div id="fleet-strip" class="fleet-strip"></div>
        <div class="viewer-column">
          <div id="viewer" class="viewer"><canvas id="canvas" aria-label="RealMan URDF 三维模型"></canvas><div id="viewer-state" class="viewer-state">加载 URDF…</div><div class="legend"><span class="legend-live"></span>实体姿态 <span class="legend-shadow"></span>目标影子</div></div>
          <div class="viewer-footer"><span id="joint-stamp">等待 joint_states</span><span id="root-frame"></span></div>
        </div>
      </div>
    </section>
    <aside class="controls">
      <section class="panel panel-section"><div class="panel-heading compact"><div><span class="eyebrow">COORDINATES</span><h2>当前坐标</h2></div><span id="coordinate-state" class="mini-state">WAIT</span></div><div id="coordinate-summary" class="coordinate-summary"></div></section>
      <section class="panel panel-section motion-panel">
        <div class="panel-heading compact"><div><span class="eyebrow">MOTION TARGET</span><h2>一次性运动</h2></div><div class="panel-actions"><span id="selected-arm-label" class="mini-state">L</span><button id="reset-preview" class="text-button" type="button">重置目标</button></div></div>
        <div id="motion-mode" class="segmented-control" aria-label="运动类型">
          <button type="button" class="selected" data-motion-command="0" aria-pressed="true">MOVEJ</button>
          <button type="button" data-motion-command="1" aria-pressed="false">MOVEL</button>
          <button type="button" data-motion-command="2" aria-pressed="false">MOVEP</button>
        </div>
        <div id="joint-target"><div id="joint-controls" class="joint-controls"></div></div>
        <div id="pose-target" class="pose-target" hidden>
          <div class="target-field-label">位置 (m)</div>
          <div class="pose-inputs position-inputs">
            <label>X<input id="pose-x" type="number" step="0.001" inputmode="decimal" /></label>
            <label>Y<input id="pose-y" type="number" step="0.001" inputmode="decimal" /></label>
            <label>Z<input id="pose-z" type="number" step="0.001" inputmode="decimal" /></label>
          </div>
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
        <div class="motion-parameters">
          <label>激活参考系<output id="motion-reference">BASE / base</output></label>
          <label>速度 (%)<input id="motion-velocity" type="number" min="1" max="100" step="1" value="30" /></label>
          <label>超时 (s)<input id="motion-timeout" type="number" min="0.1" step="0.1" /></label>
        </div>
        <button id="execute-motion" class="button primary full" type="button" disabled>发送 MOVEJ</button>
      </section>
      <section class="panel panel-section"><div class="panel-heading compact"><div><span class="eyebrow">CARTESIAN</span><h2>末端速度</h2></div><span id="velocity-state" class="mini-state">IDLE</span></div><div class="form-grid"><label>参考系<select id="velocity-frame"></select></label><label>周期 (ms)<input id="velocity-period" type="number" min="1" step="1" /></label><label>看门狗 (ms)<input id="velocity-watchdog" type="number" min="1" step="1" /></label><label>线加速度<input id="linear-accel" type="number" min="0.001" step="0.01" /></label><label>角加速度<input id="angular-accel" type="number" min="0.001" step="0.01" /></label></div><div id="velocity-inputs" class="velocity-inputs"></div><div class="inline-actions"><button id="start-velocity" class="button secondary" type="button" disabled>启动速度 Action</button><button id="cancel-velocity" class="button ghost" type="button" disabled>取消</button></div></section>
      <section class="panel panel-section"><div class="panel-heading compact"><div><span class="eyebrow">ACTION MONITOR</span><h2>运行反馈</h2></div><span id="action-state" class="mini-state">IDLE</span></div><div class="progress-track"><div id="progress" class="progress-bar"></div></div><div id="feedback" class="feedback">尚未发送 Action</div><pre id="result" class="result" aria-live="polite">等待结果…</pre></section>
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
const motionMode = $("#motion-mode");
const jointTarget = $("#joint-target") as HTMLElement;
const poseTarget = $("#pose-target") as HTMLElement;
const poseKinematicsActions = $("#pose-kinematics-actions") as HTMLElement;
const fillCurrentPoseButton = $("#fill-current-pose") as HTMLButtonElement;
const solveIkButton = $("#solve-ik") as HTMLButtonElement;
const kinematicsStatus = $("#kinematics-status");
const resetPreviewButton = $("#reset-preview") as HTMLButtonElement;
const motionReference = $("#motion-reference");
const motionVelocityInput = $("#motion-velocity") as HTMLInputElement;
const motionTimeoutInput = $("#motion-timeout") as HTMLInputElement;
const POSE_INPUT_IDS = ["pose-x", "pose-y", "pose-z", "pose-qw", "pose-qx", "pose-qy", "pose-qz"] as const;
const MOTION_LABELS: Record<MotionCommand, string> = { 0: "MOVEJ", 1: "MOVEL", 2: "MOVEP" };

let manifest: Manifest | undefined;
let selectedArm: ArmId = "l";
let selectedMotionCommand: MotionCommand = 0;
let targetJoints: number[] = [];
let currentJoints: number[] = [];
let socket: WebSocket | undefined;
let readOnly = false;
let activeMotionRequest = "";
let activeVelocityRequest = "";
let velocityTimer = 0;
const coordinateStates: Partial<Record<ArmId, CoordinateState>> = {};
const connectionStates: Partial<Record<ArmId, boolean>> = {};
const currentJointsByArm: Partial<Record<ArmId, number[]>> = {};
const targetJointsByArm: Partial<Record<ArmId, number[]>> = {};
const targetEditedByArm: Partial<Record<ArmId, boolean>> = {};
const poseTargetsByArm: Partial<Record<ArmId, string[]>> = {};
const kinematicsStatusByArm: Partial<Record<ArmId, string>> = {};
const activeKinematicsRequestByArm: Partial<Record<ArmId, string>> = {};
const ikPreviewValidByArm: Partial<Record<ArmId, boolean>> = {};
const motionSettingsByArm: Partial<Record<ArmId, { velocity: string; timeout: string }>> = {};
const robotScenes: Partial<Record<ArmId, RobotScene>> = {};
let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let controls: OrbitControls;
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
function referenceLabel(frame?: FrameState | null) {
  if (!frame) return "BASE / base";
  const prefix = frame.type === 1 ? "WORK" : frame.type === 2 ? "TOOL" : "BASE";
  return `${prefix} / ${frame.name}`;
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
    <div class="coordinate-meta">${state.tool?.controller_name ?? state.current_tool} ${state.tool?.payload_kg != null ? ` / ${state.tool.payload_kg.toFixed(3)} kg` : ""}</div>
    <div class="coordinate-meta">${state.tool?.xyz_m ? `xyz ${state.tool.xyz_m.map((value) => value.toFixed(4)).join(", ")}` : ""}</div>
    <div class="coordinate-row"><span>WORK</span><strong>${referenceLabel(state.work)}</strong></div>
    <div class="coordinate-meta">${state.work?.controller_name ?? state.current_work}</div>
    <div class="coordinate-meta">${state.work?.xyz_m ? `xyz ${state.work.xyz_m.map((value) => value.toFixed(4)).join(", ")}` : ""}</div>
  `;
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
function poseInputElements() {
  return POSE_INPUT_IDS.map((id) => $(`#${id}`) as HTMLInputElement);
}
function renderPoseInputs() {
  const values = poseTargetsByArm[selectedArm] ?? ["", "", "", "1", "0", "0", "0"];
  poseInputElements().forEach((input, index) => { input.value = values[index] ?? ""; });
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
  selectedMotionCommand = command;
  motionMode.querySelectorAll<HTMLButtonElement>("button[data-motion-command]").forEach((button) => {
    const selected = Number(button.dataset.motionCommand) === command;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  jointTarget.hidden = command !== 0;
  poseTarget.hidden = command === 0;
  resetPreviewButton.hidden = command !== 0;
  poseKinematicsActions.hidden = command !== 1;
  executeMotionButton.textContent = `发送 ${MOTION_LABELS[command]}`;
  setShadowVisibility(selectedArm);
  updateButtons();
}
function renderMotionEditor() {
  renderPoseInputs();
  const settings = motionSettingsByArm[selectedArm];
  if (settings) {
    motionVelocityInput.value = settings.velocity;
    motionTimeoutInput.value = settings.timeout;
  }
  motionReference.textContent = referenceLabel(currentCoordinateState()?.preferred_reference);
  kinematicsStatus.textContent = kinematicsStatusByArm[selectedArm] ?? "MOVEL 逆解仅更新影子预览";
  setMotionMode(selectedMotionCommand);
}
function send(message: Message) {
  if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
}

function setKinematicsStatus(arm: ArmId, message: string) {
  kinematicsStatusByArm[arm] = message;
  if (arm === selectedArm) kinematicsStatus.textContent = message;
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
    <label class="joint-row"><span>J${index + 1}<output id="joint-value-${index}">${(targetJoints[index] * 180 / Math.PI).toFixed(1)}°</output></span>
    <input data-joint-index="${index}" type="range" min="${joint.lower_deg}" max="${joint.upper_deg}" step="0.1" value="${targetJoints[index] * 180 / Math.PI}" /></label>
  `).join("");
  controlsHost.querySelectorAll<HTMLInputElement>("input[data-joint-index]").forEach((input) => input.addEventListener("input", () => {
    const index = Number(input.dataset.jointIndex);
    targetJoints[index] = Number(input.value) * Math.PI / 180;
    targetJointsByArm[selectedArm] = [...targetJoints];
    targetEditedByArm[selectedArm] = true;
    $(`#joint-value-${index}`).textContent = `${Number(input.value).toFixed(1)}°`;
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
    output.textContent = `${degrees.toFixed(1)}°`;
  });
}

function setRobotJoints(target: any, values: number[]) {
  target?.setJointValues(Object.fromEntries(values.map((value, index) => [`joint_${index + 1}`, value])));
  target?.updateMatrixWorld(true);
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
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const dimension = Math.max(size.x, size.y, size.z, 0.5);
  const focusHeight = bounds.min.z + size.z * 0.46;
  controls.target.set(center.x, center.y, focusHeight);
  camera.position.set(
    center.x + dimension * 1.18,
    center.y - dimension * 1.65,
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
  try {
    const snapshots = await Promise.all(manifest!.robots.map(async (config) => {
      const live = await loader.loadAsync(`${location.origin}${config.urdf_url}`);
      const shadow = await loader.loadAsync(`${location.origin}${config.urdf_url}`);
      return { config, live, shadow };
    }));
    if (generation !== loadGeneration) return;
    scene.clear();
    scene.add(new THREE.HemisphereLight(0xe7f0ed, 0x263438, 2.5));
    const key = new THREE.DirectionalLight(0xffffff, 4);
    key.position.set(2, -3, 4);
    key.castShadow = true;
    scene.add(key);
    const grid = new THREE.GridHelper(3.5, 22, 0x567078, 0x263b40);
    grid.rotation.x = Math.PI / 2;
    scene.add(grid);
    const allMeshes: any[] = [];
    snapshots.forEach(({ config, live, shadow }) => {
      live.position.set(config.transform.x, config.transform.y, config.transform.z);
      live.rotation.set(config.transform.roll, config.transform.pitch, config.transform.yaw, "ZYX");
      shadow.position.set(config.transform.x, config.transform.y, config.transform.z);
      shadow.rotation.set(config.transform.roll, config.transform.pitch, config.transform.yaw, "ZYX");
      scene.add(live);
      scene.add(shadow);
      robotScenes[config.id] = { live, shadow };
      allMeshes.push(live, shadow);
    });
    await waitForMeshes(allMeshes);
    snapshots.forEach(({ config, live, shadow }) => {
      applyMaterials(live, false, config.id);
      applyMaterials(shadow, true, config.id);
      setRobotJoints(live, armJointSnapshot(config.id));
      setRobotJoints(shadow, armTargetSnapshot(config.id));
      live.updateMatrixWorld(true);
    });
    const selectedConfig = robotConfig(selectedArm);
    setShadowVisibility(selectedArm);
    frameScene(false);
    viewer.dataset.liveMeshes = String(snapshots.reduce((count, { live }) => count + meshCount(live), 0));
    viewer.dataset.shadowMeshes = String(snapshots.reduce((count, { shadow }) => count + meshCount(shadow), 0));
    viewerState.setAttribute("hidden", "");
    $("#model-label").textContent = `${selectedConfig.model} / ${selectedArm.toUpperCase()} + 3 arms`;
  } catch (error) {
    viewerState.textContent = `URDF 加载失败: ${String(error)}`;
  }
}

function initScene() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x091114, 1);
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
    if (!box.width || !box.height) return;
    renderer.setSize(box.width, box.height, false);
    camera.aspect = box.width / box.height;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(viewer);
  resize();
  const frame = () => { requestAnimationFrame(frame); controls.update(); renderer.render(scene, camera); };
  frame();
}

function configureVelocity() {
  const settings = robot().motion;
  $("#velocity-frame").innerHTML = Object.entries(robot().frames).map(([key, frame]) => `<option value="${key}">${key.toUpperCase()} / ${frame.name}</option>`).join("");
  $("#velocity-period").setAttribute("value", String(settings.velocity_control_period_ms));
  $("#velocity-watchdog").setAttribute("value", String(settings.velocity_watchdog_ms));
  $("#linear-accel").setAttribute("value", String(settings.max_linear_accel_mps2));
  $("#angular-accel").setAttribute("value", String(settings.max_angular_accel_radps2));
  const names = ["vx", "vy", "vz", "wx", "wy", "wz"];
  $("#velocity-inputs").innerHTML = names.map((name, index) => `<label>${name}<input id="velocity-${index}" type="number" step="0.01" value="0" /></label>`).join("");
  const state = currentCoordinateState();
  if (state?.preferred_reference) {
    const frameKey = state.preferred_reference.type === 1 ? "work" : state.preferred_reference.type === 2 ? "tool" : "base";
    ($("#velocity-frame") as HTMLSelectElement).value = frameKey;
  }
}

function handleMessage(message: Message) {
  if (message.type === "hello") {
    readOnly = Boolean(message.read_only);
    mode.textContent = readOnly ? "READ ONLY" : "CONTROL READY";
    mode.classList.toggle("ready", !readOnly);
    if (message.layout) loadManifest(message.layout);
  } else if (message.type === "coordinate_state") {
    coordinateStates[message.arm] = message as CoordinateState;
    renderFleetStrip();
    if (message.arm === selectedArm) {
      renderCoordinateState();
      if (manifest) configureVelocity();
    }
  } else if (message.type === "connection") {
    connectionStates[message.arm] = Boolean(message.connected);
    renderFleetStrip();
    if (message.arm === selectedArm) setSelectedConnection();
  } else if (message.type === "joint_state") {
    currentJointsByArm[message.arm] = message.positions_rad;
    if (!targetEditedByArm[message.arm]) targetJointsByArm[message.arm] = [...message.positions_rad];
    setRobotJoints(robotScenes[message.arm]?.live, message.positions_rad);
    if (message.arm === selectedArm) {
      currentJoints = message.positions_rad;
      $("#joint-stamp").textContent = `joint_states / ${message.stamp_ns || 0}`;
    }
    renderFleetStrip();
  } else if (message.type === "kinematics_result") {
    const arm = message.arm as ArmId;
    if (activeKinematicsRequestByArm[arm] !== message.request_id) return;
    delete activeKinematicsRequestByArm[arm];
    if (message.operation === "get_current_pose") {
      const position = Array.isArray(message.pose_position_m) ? message.pose_position_m : [];
      const quaternion = Array.isArray(message.pose_quaternion_wxyz) ? message.pose_quaternion_wxyz : [];
      if (message.success && position.length === 3 && quaternion.length === 4) {
        poseTargetsByArm[arm] = [...position, ...quaternion].map((value) => String(value));
        ikPreviewValidByArm[arm] = false;
        setKinematicsStatus(arm, `当前位置已填入 / ${referenceLabel(coordinateStates[arm]?.preferred_reference)}`);
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
    actionState.textContent = String(message.state).toUpperCase();
    actionState.className = `mini-state ${message.state}`;
    if (message.action === "cartesian_velocity") velocityState.textContent = String(message.state).toUpperCase();
    if (["rejected", "error"].includes(message.state)) {
      if (message.action === "execute_motion") activeMotionRequest = "";
      if (message.action === "cartesian_velocity") { activeVelocityRequest = ""; window.clearInterval(velocityTimer); velocityTimer = 0; }
      updateButtons();
    }
  } else if (message.type === "action_feedback") {
    if (message.arm !== selectedArm) return;
    const item = message.feedback || {};
    feedback.textContent = `${message.action} / ${item.detail || "executing"} / progress ${item.progress ?? "-"}`;
    if (Array.isArray(item.current_joint_degrees)) {
      const radians = item.current_joint_degrees.map((value: number) => value * Math.PI / 180);
      currentJointsByArm[message.arm] = radians;
      currentJoints = radians;
      setRobotJoints(robotScenes[message.arm]?.live, radians);
    }
    if (Array.isArray(item.commanded_linear_velocity_mps)) feedback.textContent = `velocity / ${item.commanded_linear_velocity_mps.map((value: number) => value.toFixed(3)).join(", ")}`;
    progress.style.width = `${Math.max(0, Math.min(100, Number(item.progress || 0) * 100))}%`;
  } else if (message.type === "action_result") {
    if (message.arm !== selectedArm) return;
    result.textContent = JSON.stringify(message.result, null, 2);
    actionState.textContent = "RESULT";
    activeMotionRequest = message.action === "execute_motion" ? "" : activeMotionRequest;
    activeVelocityRequest = message.action === "cartesian_velocity" ? "" : activeVelocityRequest;
    updateButtons();
  } else if (message.type === "software_stop_result") {
    result.textContent = `软件停止: ${message.success ? "成功" : "失败"} / ${message.message}`;
  } else if (message.type === "error") {
    result.textContent = `${message.code}: ${message.message}`;
    if (message.request_id === activeMotionRequest) activeMotionRequest = "";
    if (message.request_id === activeVelocityRequest) { activeVelocityRequest = ""; window.clearInterval(velocityTimer); velocityTimer = 0; }
    for (const arm of ["l", "m", "r"] as ArmId[]) {
      if (message.request_id === activeKinematicsRequestByArm[arm]) {
        delete activeKinematicsRequestByArm[arm];
        setKinematicsStatus(arm, `${message.code}: ${message.message}`);
      }
    }
    updateButtons();
  }
}

function connect() {
  socket?.close();
  const protocol = location.protocol === "https:" ? "wss" : "ws";
  socket = new WebSocket(`${protocol}://${location.host}/ws`);
  socket.addEventListener("open", () => setConnection(true));
  socket.addEventListener("close", () => { setConnection(false); updateButtons(); window.setTimeout(connect, 2000); });
  socket.addEventListener("message", (event) => { try { handleMessage(JSON.parse(event.data)); } catch { result.textContent = "收到无法解析的服务器消息"; } });
}

function updateButtons() {
  const writable = canWrite();
  const motionTargetValid = Boolean(readMotionSettings()) && (selectedMotionCommand === 0 || Boolean(readPoseGoal()));
  executeMotionButton.disabled = !writable || Boolean(activeMotionRequest) || !motionTargetValid;
  startVelocityButton.disabled = !writable || Boolean(activeVelocityRequest);
  cancelVelocityButton.disabled = !writable || !Boolean(activeVelocityRequest);
  cancelMotionButton.disabled = !writable || !Boolean(activeMotionRequest);
  stopButton.disabled = !writable;
  const activeKinematicsRequest = Boolean(activeKinematicsRequestByArm[selectedArm]);
  fillCurrentPoseButton.disabled = !writable || selectedMotionCommand !== 1 || activeKinematicsRequest;
  solveIkButton.disabled = !writable || selectedMotionCommand !== 1 || activeKinematicsRequest || !Boolean(readPoseGoal());
}

function loadManifest(next: Manifest) {
  manifest = next;
  selectedArm = armSelect.value as ArmId;
  next.robots.forEach((item) => {
    const initial = item.joints.map(() => next.default_joint_position_rad);
    currentJointsByArm[item.id] = currentJointsByArm[item.id] ?? [...initial];
    targetJointsByArm[item.id] = targetJointsByArm[item.id] ?? [...initial];
    poseTargetsByArm[item.id] = poseTargetsByArm[item.id] ?? ["", "", "", "1", "0", "0", "0"];
    motionSettingsByArm[item.id] = motionSettingsByArm[item.id] ?? {
      velocity: "30",
      timeout: String(item.motion.default_timeout_sec),
    };
  });
  currentJoints = [...armJointSnapshot(selectedArm)];
  targetJoints = [...armTargetSnapshot(selectedArm)];
  $("#root-frame").textContent = `TF / ${next.root_frame}`;
  selectedArmLabel.textContent = selectedArm.toUpperCase();
  selectedArmLabel.className = "mini-state active-arm";
  renderJointControls();
  renderMotionEditor();
  configureVelocity();
  renderCoordinateState();
  renderFleetStrip();
  setSelectedConnection();
  if (!renderer) initScene();
  loadFleet();
  updateButtons();
}

resetPreviewButton.addEventListener("click", () => {
  targetJoints = [...currentJoints];
  targetJointsByArm[selectedArm] = [...targetJoints];
  targetEditedByArm[selectedArm] = true;
  setJointInputs(targetJoints, true);
  setRobotJoints(selectedRobotScene()?.shadow, targetJoints);
});
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
motionMode.querySelectorAll<HTMLButtonElement>("button[data-motion-command]").forEach((button) => {
  button.addEventListener("click", () => {
    const command = Number(button.dataset.motionCommand);
    if (command === 0 || command === 1 || command === 2) setMotionMode(command);
  });
});
poseInputElements().forEach((input) => {
  input.addEventListener("input", () => {
    poseTargetsByArm[selectedArm] = poseInputElements().map((item) => item.value);
    ikPreviewValidByArm[selectedArm] = false;
    setKinematicsStatus(selectedArm, "位姿已修改，请重新计算逆解");
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
executeMotionButton.addEventListener("click", () => {
  const settings = readMotionSettings();
  const pose = selectedMotionCommand === 0 ? null : readPoseGoal();
  if (!canWrite() || !settings || (selectedMotionCommand !== 0 && !pose)) return;
  const commandLabel = MOTION_LABELS[selectedMotionCommand];
  activeMotionRequest = requestId(commandLabel.toLowerCase());
  const reference = preferredReference();
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
  updateButtons();
});
fillCurrentPoseButton.addEventListener("click", () => {
  if (!canWrite() || selectedMotionCommand !== 1) return;
  const requestIdValue = requestId("current-pose");
  activeKinematicsRequestByArm[selectedArm] = requestIdValue;
  setKinematicsStatus(selectedArm, "读取当前末端位姿…");
  send({ type: "get_current_pose", request_id: requestIdValue, arm: selectedArm });
  updateButtons();
});
solveIkButton.addEventListener("click", () => {
  const pose = readPoseGoal();
  const reference = preferredReference();
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
cancelVelocityButton.addEventListener("click", () => { send({ type: "cancel_action", arm: selectedArm, action: "cartesian_velocity" }); window.clearInterval(velocityTimer); velocityTimer = 0; });
cancelMotionButton.addEventListener("click", () => { send({ type: "cancel_action", arm: selectedArm, action: "execute_motion" }); });
stopButton.addEventListener("click", () => { send({ type: "software_stop", request_id: requestId("stop"), arm: selectedArm }); });
fetch("/api/layout").then((response) => response.json()).then(loadManifest).catch((error) => { viewerState.textContent = `布局加载失败: ${String(error)}`; });
connect();
