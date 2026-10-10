import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import URDFLoader from "urdf-loader";
import { GridStack } from "gridstack";
import "gridstack/dist/gridstack.min.css";
import "./styles.css";
import { initSidebar } from "./replay/sidebar";
import { renderAnalysis } from "./replay/analysis";
import { initVideo, type VideoContext } from "./replay/video";
import { initCharts, renderHealth } from "./replay/charts";
import { initAnnotation } from "./replay/annotation";

type ArmId = "l" | "m" | "r";
type Robot = {
  id: ArmId;
  model: string;
  transform: { x: number; y: number; z: number; roll: number; pitch: number; yaw: number };
  urdf_url: string;
  package_root_url: string;
};
type Manifest = { version: number; default_joint_position_rad: number; robots: Robot[] };
type CartesianVelocity = {
  commanded_linear_velocity_mps?: number[];
  commanded_angular_velocity_radps?: number[];
  measured_frame_id?: string;
  measured_linear_velocity_mps?: number[];
  measured_angular_velocity_radps?: number[];
  measured_valid?: boolean;
  measured_age_ms?: number;
};
type Snapshot = {
  type: "recording_snapshot";
  recording: Record<string, any>;
  arms: Partial<Record<ArmId, {
    positions_rad?: number[]; connected?: boolean; coordinate_state?: Record<string, unknown>;
    cartesian_velocity?: CartesianVelocity;
  }>>;
  preview_cameras: Record<string, number>;
  grippers?: Record<string, Record<string, number | boolean>>;
};

const $ = <T extends HTMLElement>(selector: string) => document.querySelector(selector) as T;
function escapeHtml(value: string): string {
  return value.replace(/[&<>\"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}
const statusEl = $("#recording");
const connection = $("#connection");
const armsEl = $("#arms");
const previewsEl = $("#previews");
const toast = $("#toast");
const viewerState = $("#viewer-state");
const jointStamp = $("#joint-stamp");
const canvas = $<HTMLCanvasElement>("#canvas");
const viewer = $("#viewer");
const motionCanvas = $<HTMLCanvasElement>("#motion-canvas");
const motionViewer = $("#motion-viewer");
const motionCards = $("#motion-cards");
const motion3dStatus = $("#motion-3d-status");

let manifest: Manifest | null = null;
let socket: WebSocket | null = null;
let toastTimer: number | undefined;
let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let controls: OrbitControls;
let motionRenderer: THREE.WebGLRenderer;
let motionScene: THREE.Scene;
let motionCamera: THREE.PerspectiveCamera;
let motionControls: OrbitControls;
const robotScenes: Partial<Record<ArmId, any>> = {};
const jointStampByArm: Partial<Record<ArmId, string>> = {};
type EndEffectorPose = {
  basePosition: THREE.Vector3;
  baseQuaternion: THREE.Quaternion;
  worldPosition: THREE.Vector3;
};
type MotionState = {
  pose: EndEffectorPose | null;
  commandedLinearMps: THREE.Vector3 | null;
  commandedAngularRadps: THREE.Vector3 | null;
  measuredLinearMps: THREE.Vector3 | null;
  measuredAngularRadps: THREE.Vector3 | null;
  measuredAgeMs: number | null;
  measuredFrameMatchesBase: boolean;
  history: MotionSample[];
};
type MotionSample = { commandLinear: number; measuredLinear: number | null; commandAngular: number; measuredAngular: number | null };
type MotionVisual = {
  trail: THREE.Line;
  marker: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  actualArrow: THREE.ArrowHelper;
  commandedArrow: THREE.ArrowHelper;
  points: THREE.Vector3[];
};
const motionByArm: Partial<Record<ArmId, MotionState>> = {};
const motionVisuals: Partial<Record<ArmId, MotionVisual>> = {};
let latestLiveSnapshot: Snapshot | null = null;
const MOTION_MAX_POINTS = 80;
const MOTION_CHART_POINTS = 60;
const grippersEl = $("#grippers");
const exportPanel = $("#export-panel");
const exportState = $("#export-state");
const exportProgressEl = $("#export-progress");
const exportDirEl = $("#export-dir");
const queuePanel = $("#queue-panel");
const queueCount = $("#queue-count");
const queueList = $("#lerobot-queue");
const replayExit = $<HTMLButtonElement>("#replay-exit");
const replayFrameLabel = $("#replay-frame-label");
const replayTask = $("#replay-task");
const replayDatasetMeta = $("#replay-dataset-meta");
const replayTimeLabel = $("#replay-time-label");
const poseCount = $("#pose-count");
const gripperCount = $("#gripper-count");

function notify(message: string, error = false) {
  toast.textContent = message;
  toast.className = `toast show${error ? " error" : ""}`;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => (toast.className = "toast"), 4200);
}

function setRobotJoints(arm: ArmId, values: number[]) {
  const target = robotScenes[arm];
  target?.setJointValues(Object.fromEntries(values.map((value, index) => [`joint_${index + 1}`, value])));
  target?.updateMatrixWorld(true);
}

function getEndEffectorPose(arm: ArmId): EndEffectorPose | null {
  const robot = robotScenes[arm] as any;
  if (!robot) return null;
  try {
    const links = robot.links ?? {};
    const base = links["base_link"];
    const ee = links["link_6"];
    if (!base || !ee) return null;
    const relative = base.matrixWorld.clone().invert().multiply(ee.matrixWorld);
    return {
      basePosition: new THREE.Vector3().setFromMatrixPosition(relative),
      baseQuaternion: new THREE.Quaternion().setFromRotationMatrix(relative),
      worldPosition: new THREE.Vector3().setFromMatrixPosition(ee.matrixWorld),
    };
  } catch {
    return null;
  }
}

function vectorText(vector: THREE.Vector3 | null, digits = 3): string {
  return vector ? `[${vector.x.toFixed(digits)}, ${vector.y.toFixed(digits)}, ${vector.z.toFixed(digits)}]` : "—";
}

function vectorFrom(values: unknown): THREE.Vector3 | null {
  if (!Array.isArray(values) || values.length !== 3 || !values.every(Number.isFinite)) return null;
  return new THREE.Vector3(Number(values[0]), Number(values[1]), Number(values[2]));
}

function createMotionVisuals() {
  const colors: Record<ArmId, number> = { l: 0x55a6ff, m: 0x67d391, r: 0xf4bb63 };
  (Object.keys(colors) as ArmId[]).forEach((arm) => {
    if (motionVisuals[arm]) return;
    const trail = new THREE.Line(
      new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: colors[arm], transparent: true, opacity: 0.82 }),
    );
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.026, 16, 12),
      new THREE.MeshBasicMaterial({ color: colors[arm], transparent: true, opacity: 0.95 }),
    );
    marker.visible = false;
    // Green is the measured physical velocity; blue is the controller input.
    // They share the FK end-effector origin, so direction and relative magnitude
    // make tracking error visible without any recorder-side computation.
    const actualArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 0.001, 0x67d391, 0.035, 0.018);
    const commandedArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 0.001, 0x55a6ff, 0.028, 0.014);
    actualArrow.visible = false;
    commandedArrow.visible = false;
    motionScene.add(trail, marker, actualArrow, commandedArrow);
    motionVisuals[arm] = { trail, marker, actualArrow, commandedArrow, points: [] };
  });
}

function updateMotionVisual(arm: ArmId, state: MotionState) {
  const visual = motionVisuals[arm];
  if (!visual || !state.pose) return;
  visual.marker.visible = true;
  visual.marker.position.copy(state.pose.worldPosition);
  const lastPoint = visual.points.at(-1);
  if (!lastPoint || lastPoint.distanceToSquared(state.pose.worldPosition) > 1e-10) {
    visual.points.push(state.pose.worldPosition.clone());
    if (visual.points.length > MOTION_MAX_POINTS) visual.points.shift();
    visual.trail.geometry.setFromPoints(visual.points);
  }
  const updateArrow = (arrow: THREE.ArrowHelper, velocity: THREE.Vector3 | null, headLength: number, headWidth: number) => {
    const speed = velocity?.length() ?? 0;
    arrow.visible = speed > 1e-5;
    if (!velocity || speed <= 1e-5) return;
    const base = (robotScenes[arm] as any)?.links?.["base_link"];
    // Driver velocity is in measured_frame_id == <arm>/base_link. Transform only
    // the direction into the assembled three-arm scene; position remains FK in that
    // same base frame and never enters recording.
    const worldDirection = base ? velocity.clone().transformDirection(base.matrixWorld) : velocity.clone().normalize();
    arrow.position.copy(state.pose!.worldPosition);
    arrow.setDirection(worldDirection);
    // Scene scale is bounded; exact magnitudes remain in the 2D plot and cards.
    arrow.setLength(Math.min(0.35, Math.max(0.04, speed * 0.35)), headLength, headWidth);
  };
  updateArrow(visual.actualArrow, state.measuredLinearMps, 0.035, 0.018);
  updateArrow(visual.commandedArrow, state.commandedLinearMps, 0.028, 0.014);
}

function updateMotion(arm: ArmId, source: CartesianVelocity | undefined): MotionState | null {
  const pose = getEndEffectorPose(arm);
  const previous = motionByArm[arm];
  const commandedLinearMps = vectorFrom(source?.commanded_linear_velocity_mps);
  const commandedAngularRadps = vectorFrom(source?.commanded_angular_velocity_radps);
  const measuredFrameMatchesBase = source?.measured_frame_id === `${arm}/base_link`;
  const measuredLinearMps = source?.measured_valid && measuredFrameMatchesBase
    ? vectorFrom(source.measured_linear_velocity_mps) : null;
  const measuredAngularRadps = source?.measured_valid && measuredFrameMatchesBase
    ? vectorFrom(source.measured_angular_velocity_radps) : null;
  const history = [...(previous?.history ?? []), {
    commandLinear: commandedLinearMps?.length() ?? 0,
    measuredLinear: measuredLinearMps?.length() ?? null,
    commandAngular: commandedAngularRadps?.length() ?? 0,
    measuredAngular: measuredAngularRadps?.length() ?? null,
  }].slice(-MOTION_CHART_POINTS);
  const state = {
    pose, commandedLinearMps, commandedAngularRadps, measuredLinearMps, measuredAngularRadps,
    measuredAgeMs: Number.isFinite(source?.measured_age_ms) ? Number(source?.measured_age_ms) : null,
    measuredFrameMatchesBase, history,
  };
  motionByArm[arm] = state;
  updateMotionVisual(arm, state);
  return state;
}

function chartPath(samples: MotionSample[], field: keyof MotionSample, maximum: number): string {
  const width = 240;
  const height = 46;
  return samples.map((sample, index) => {
    const value = sample[field];
    const x = samples.length > 1 ? index * width / (samples.length - 1) : width;
    const y = value === null ? height : height - (Number(value) / maximum) * height;
    return `${index ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

function speedChart(samples: MotionSample[], unit: string, commandKey: keyof MotionSample, measuredKey: keyof MotionSample): string {
  const values = samples.flatMap((sample) => [sample[commandKey], sample[measuredKey]]).filter((value): value is number => value !== null);
  const maximum = Math.max(0.001, ...values);
  return `<svg viewBox="0 0 240 62" role="img" aria-label="控制与实际${unit}速度曲线"><path class="motion-gridline" d="M0 46H240"/><path class="motion-command" d="${chartPath(samples, commandKey, maximum)}"/><path class="motion-measured" d="${chartPath(samples, measuredKey, maximum)}"/><text x="0" y="60">0</text><text x="238" y="60" text-anchor="end">${maximum.toFixed(2)} ${unit}</text></svg>`;
}

function renderMotionCards() {
  const arms: ArmId[] = ["l", "m", "r"];
  const available = arms.filter((arm) => motionByArm[arm]?.pose).length;
  const hasActual = arms.some((arm) => Boolean(motionByArm[arm]?.measuredLinearMps));
  const hasCommanded = arms.some((arm) => Boolean(motionByArm[arm]?.commandedLinearMps));
  motion3dStatus.textContent = available ? `${available} / 3 末端可视化` : "等待末端数据";
  viewer.dataset.motionVisualization = available ? "active" : "waiting";
  motionViewer.dataset.endEffectorMarkers = available ? "active" : "waiting";
  motionViewer.dataset.velocityVectors = hasActual && hasCommanded ? "actual+commanded" : hasActual ? "actual" : hasCommanded ? "commanded" : "waiting";
  motionCards.innerHTML = arms.map((arm) => {
    const state = motionByArm[arm];
    const commandLinear = state?.commandedLinearMps;
    const commandAngular = state?.commandedAngularRadps;
    const measuredLinear = state?.measuredLinearMps;
    const measuredAngular = state?.measuredAngularRadps;
    const measurement = !state ? "等待驱动状态" : !state.measuredFrameMatchesBase ? "测量坐标系不匹配" : !measuredLinear ? "驱动测量无效" : `驱动测量 · ${state.measuredAgeMs ?? "—"} ms`;
    const charts = state ? `<div class="motion-charts"><div><small>线速度 · 控制 / 实际</small>${speedChart(state.history, "m/s", "commandLinear", "measuredLinear")}</div><div><small>角速度 · 控制 / 实际</small>${speedChart(state.history, "rad/s", "commandAngular", "measuredAngular")}</div></div>` : "";
    return `<article id="motion-${arm}" class="motion-card"><h4>${arm.toUpperCase()} 末端 <span>FK · base_link</span></h4><div class="motion-values"><span>位置 <b>${state?.pose ? vectorText(state.pose.basePosition) : "等待 URDF FK"} ${state?.pose ? "m" : ""}</b></span><span>控制线速度 <b>${commandLinear ? `${commandLinear.length().toFixed(3)} m/s` : "—"}</b></span><span>驱动线速度 <b class="${measuredLinear ? "speed" : "unavailable"}">${measuredLinear ? `${measuredLinear.length().toFixed(3)} m/s` : "—"}</b></span><span>控制角速度 <b>${commandAngular ? `${commandAngular.length().toFixed(3)} rad/s` : "—"}</b></span><span>驱动角速度 <b class="${measuredAngular ? "speed" : "unavailable"}">${measuredAngular ? `${measuredAngular.length().toFixed(3)} rad/s` : "—"}</b></span><span>实际 XYZ <b>${vectorText(measuredLinear)}</b></span><span class="motion-source"><b>${measurement}</b></span></div>${charts}</article>`;
  }).join("");
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

  const viewer = document.querySelector<HTMLElement>("#viewer")!;
  const resize = () => {
    const box = viewer.getBoundingClientRect();
    if (!box.width || !box.height) return;
    renderer.setSize(box.width, box.height, false);
    camera.aspect = box.width / box.height;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(viewer);
  resize();

  const frame = () => {
    requestAnimationFrame(frame);
    controls.update();
    renderer.render(scene, camera);
  };
  frame();
}

function initMotionScene() {
  motionRenderer = new THREE.WebGLRenderer({ canvas: motionCanvas, antialias: true, alpha: true });
  motionRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  motionRenderer.outputColorSpace = THREE.SRGBColorSpace;
  motionRenderer.setClearColor(0x091114, 1);
  motionScene = new THREE.Scene();
  motionCamera = new THREE.PerspectiveCamera(38, 1, 0.01, 100);
  motionCamera.up.set(0, 0, 1);
  motionCamera.position.set(1.2, -1.8, 1.25);
  motionControls = new OrbitControls(motionCamera, motionCanvas);
  motionControls.enableDamping = true;
  motionControls.target.set(0, 0, 0.55);
  motionScene.add(new THREE.HemisphereLight(0xe7f0ed, 0x263438, 2.5));
  const grid = new THREE.GridHelper(3.5, 22, 0x567078, 0x263b40);
  grid.rotation.x = Math.PI / 2;
  motionScene.add(grid, new THREE.AxesHelper(0.25));

  const resize = () => {
    const box = motionViewer.getBoundingClientRect();
    if (!box.width || !box.height) return;
    motionRenderer.setSize(box.width, box.height, false);
    motionCamera.aspect = box.width / box.height;
    motionCamera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(motionViewer);
  resize();
  const frame = () => {
    requestAnimationFrame(frame);
    motionControls.update();
    motionRenderer.render(motionScene, motionCamera);
  };
  frame();
}

async function loadFleet() {
  if (!manifest) return;
  viewerState.textContent = "加载 URDF…";
  viewerState.removeAttribute("hidden");
  const loader = new URDFLoader();
  loader.packages = { rm65_description: `${location.origin}/models` };
  try {
    scene.add(new THREE.HemisphereLight(0xe7f0ed, 0x263438, 2.5));
    const key = new THREE.DirectionalLight(0xffffff, 4);
    key.position.set(2, -3, 4);
    key.castShadow = true;
  scene.add(key);
  const grid = new THREE.GridHelper(3.5, 22, 0x567078, 0x263b40);
  grid.rotation.x = Math.PI / 2;
  scene.add(grid);
  createMotionVisuals();

    const middle = manifest.robots.find((robot) => robot.id === "m")?.transform;
    if (!middle) throw new Error("middle-arm transform is missing from the layout manifest");

    for (const config of manifest.robots) {
      const urdf = await loader.loadAsync(`${location.origin}${config.urdf_url}`);
      urdf.position.set(config.transform.x - middle.x, config.transform.y - middle.y, config.transform.z - middle.z);
      urdf.rotation.set(config.transform.roll, config.transform.pitch, config.transform.yaw, "ZYX");
      scene.add(urdf);
      robotScenes[config.id] = urdf;
      setRobotJoints(config.id, Array(6).fill(manifest!.default_joint_position_rad));
    }
    viewerState.setAttribute("hidden", "");
    if (latestLiveSnapshot) renderLiveRobot(latestLiveSnapshot);
  } catch (error) {
    viewerState.textContent = `URDF 加载失败: ${String(error)}`;
  }
}

function renderArms(arms: Snapshot["arms"]) {
  const names = Object.keys(arms) as ArmId[];
  const online = names.filter((name) => arms[name]?.connected).length;
  $("#arm-count").textContent = `${online} / ${names.length || 3} online`;
  if (!names.length) return;
  armsEl.innerHTML = names
    .map((name) => {
      const arm = arms[name] ?? {};
      const positions = arm.positions_rad ?? [];
      const pose = getEndEffectorPose(name);
      const poseHtml = pose
        ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--line);font:11px ui-monospace,Menlo,monospace;color:var(--muted)">位置 <b style="color:var(--text)">${vectorText(pose.basePosition)}</b> m<br>姿态 <b style="color:var(--text)">[${pose.baseQuaternion.w.toFixed(3)}, ${pose.baseQuaternion.x.toFixed(3)}, ${pose.baseQuaternion.y.toFixed(3)}, ${pose.baseQuaternion.z.toFixed(3)}]</b></div>`
        : "";
      return `<article class="arm-card ${arm.connected ? "connected" : ""}"><h4>${name.toUpperCase()} <span>${arm.connected ? "CONNECTED" : "OFFLINE"}</span></h4><div class="joint-list">${
        positions.length
          ? positions.map((value, index) => `<span>J${index + 1} <b>${(value * 180 / Math.PI).toFixed(1)}°</b></span>`).join("")
          : "<span>暂无关节数据</span>"
      }</div>${poseHtml}</article>`;
    })
    .join("");
}

const previewTimes: Record<string, number> = {};
function renderCameras(cameras: Record<string, number>) {
  const names = Object.keys(cameras);
  $("#camera-count").textContent = names.length ? `${names.length} 路 · 低清预览` : "等待视频流";
  if (!names.length) return;
  previewsEl.querySelector(".empty")?.remove();
  names.forEach((cameraName) => {
    let card = previewsEl.querySelector(`[data-camera="${CSS.escape(cameraName)}"]`);
    if (!card) {
      card = document.createElement("div");
      card.className = "camera-card";
      card.setAttribute("data-camera", cameraName);
      card.innerHTML = `<img class="preview-img" alt="${cameraName}" style="display:none"><div class="no-feed">等待视频帧…</div><span class="camera-label">${cameraName}</span><span class="camera-health">NO SIGNAL</span>`;
      previewsEl.append(card);
    }
    (card as HTMLElement).style.display = "block";
    const health = card.querySelector(".camera-health") as HTMLElement | null;
    const ageSec = cameras[cameraName] ? (Date.now() * 1e6 - cameras[cameraName]) / 1e9 : Infinity;
    if (health) health.textContent = ageSec < 3 ? `LIVE · ${ageSec.toFixed(1)}s` : "NO SIGNAL";
    if (!cameras[cameraName]) return;
    // Throttle the preview refresh: re-sourcing the image faster than it can
    // load (over a tunnel) keeps naturalWidth at 0, so the frame never appears.
    const now = Date.now();
    const last = previewTimes[cameraName] || 0;
    if (now - last < 3000) return;
    previewTimes[cameraName] = now;
    const img = card.querySelector(".preview-img") as HTMLImageElement | null;
    if (!img) return;
    // Show the image before setting src: browsers skip loading `display:none` images.
    img.style.display = "block";
    img.onload = () => {
      card.querySelector(".no-feed")?.remove();
    };
    img.src = `/preview/${encodeURIComponent(cameraName)}.jpg?ts=${now}`;
  });
  [...previewsEl.children].forEach((card) => {
    const name = (card as HTMLElement).dataset.camera;
    if (name && !names.includes(name)) (card as HTMLElement).style.display = "none";
  });
}

function render(payload: Snapshot) {
  const recording = payload.recording ?? {};
  statusEl.textContent = recording.detail || "等待设备数据";
  $("#elapsed").textContent = `${(recording.elapsed_sec || 0).toFixed(1)}s`;
  $("#remaining").textContent = recording.remaining_sec > 0 ? `${recording.remaining_sec.toFixed(1)}s` : "—";
  $("#dropped").textContent = recording.dropped_samples || 0;
  $("#status-pulse").style.background = recording.state === 2 ? "var(--green)" : recording.state === 7 ? "var(--red)" : "var(--amber)";

  const exportProgress = Number(recording.export_progress ?? 0);
  const exportDir = String(recording.export_dir ?? "");
  const exportError = String(recording.export_error ?? "");
  if (exportError) {
    exportPanel.style.display = "";
    exportState.textContent = "转换失败";
    exportState.style.color = "var(--red)";
    exportProgressEl.style.width = "100%";
    exportDirEl.textContent = `错误: ${exportError}`;
  } else if (exportProgress > 0 && exportProgress < 1) {
    exportPanel.style.display = "";
    exportState.textContent = `转换中 ${Math.round(exportProgress * 100)}%`;
    exportState.style.color = "";
    exportProgressEl.style.width = `${Math.round(exportProgress * 100)}%`;
    exportDirEl.textContent = "";
    syncQueueProgress(exportProgress);
  } else if (exportProgress >= 1 && exportDir) {
    exportPanel.style.display = "";
    exportState.textContent = "转换完成";
    exportState.style.color = "";
    exportProgressEl.style.width = "100%";
    exportDirEl.textContent = `数据目录: ${exportDir}`;
  }

  // In replay mode the 3D viewer, arm grid and gripper grid show the selected frame,
  // not the live subscription. The status hero and export panel stay live above.
  if (replay) return;

  latestLiveSnapshot = payload;
  renderLiveRobot(payload);
}

type QueueJob = {
  session_id: string;
  decision: string | null;
  export_state: string | null;
  requested_realtime_ns: number;
  error: string;
};

const QUEUE_GROUPS = [
  { state: "RUNNING", label: "转换中" },
  { state: "QUEUED", label: "排队中" },
  { state: "SUCCEEDED", label: "已完成" },
  { state: "FAILED", label: "失败" },
] as const;

let queueJobs: QueueJob[] = [];
let latestExportProgress = 0;
let lastRenderedProgress = -1;

function queueRow(job: QueueJob, label: string): string {
  const progress = job.export_state === "RUNNING" ? ` · ${Math.round(latestExportProgress * 100)}%` : "";
  const error = job.error ? ` · ${escapeHtml(job.error)}` : "";
  return `<div class="queue-row"><span class="queue-session">${escapeHtml(job.session_id)}</span><span class="queue-state">${label}${progress}${error}</span></div>`;
}

function renderQueue() {
  const active = queueJobs.filter((job) => job.decision === "ADOPTED" && job.export_state);
  if (!active.length) {
    queuePanel.style.display = "none";
    queueList.innerHTML = '<div class="empty">暂无待转换会话</div>';
    queueCount.textContent = "0 个会话";
    return;
  }
  queuePanel.style.display = "";
  queueCount.textContent = `${active.length} 个会话`;

  const parts: string[] = [];
  // Running/queued jobs stay expanded; the rest collapse into a history fold.
  for (const state of ["RUNNING", "QUEUED"] as const) {
    const members = active.filter((job) => job.export_state === state);
    if (!members.length) continue;
    const label = QUEUE_GROUPS.find((group) => group.state === state)?.label ?? state;
    parts.push(`<div class="queue-group"><span class="queue-group-label">${label}</span>${members.map((job) => queueRow(job, label)).join("")}</div>`);
  }
  const succeeded = active.filter((job) => job.export_state === "SUCCEEDED");
  const failed = active.filter((job) => job.export_state === "FAILED");
  if (succeeded.length || failed.length) {
    const summary = `${succeeded.length} 完成${failed.length ? ` · ${failed.length} 失败` : ""}`;
    const body =
      (succeeded.length ? `<div class="queue-group"><span class="queue-group-label">已完成</span>${succeeded.map((job) => queueRow(job, "已完成")).join("")}</div>` : "") +
      (failed.length ? `<div class="queue-group"><span class="queue-group-label">失败</span>${failed.map((job) => queueRow(job, "失败")).join("")}</div>` : "");
    parts.push(`<details class="queue-done"><summary>历史记录 · ${summary}</summary>${body}</details>`);
  }
  queueList.innerHTML = parts.join("");
}

function refreshQueue() {
  fetch("/api/lerobot/queue")
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
    .then((payload) => {
      queueJobs = (payload.jobs ?? []) as QueueJob[];
      renderQueue();
    })
    .catch(() => {
      /* keep the last rendered queue on transient failure */
    });
}

function syncQueueProgress(progress: number) {
  latestExportProgress = progress;
  const pct = Math.round(progress * 100);
  if (pct === lastRenderedProgress) return;
  lastRenderedProgress = pct;
  renderQueue();
}

function renderLiveRobot(payload: Snapshot) {
  const arms = payload.arms ?? {};
  for (const [arm, data] of Object.entries(arms)) {
    const positions = (data as any).positions_rad;
    if (positions?.length) {
      setRobotJoints(arm as ArmId, positions);
      jointStampByArm[arm as ArmId] = new Date().toISOString();
    }
  }
  const stamps = Object.values(jointStampByArm);
  jointStamp.textContent = stamps.length ? `joint_states · ${stamps[stamps.length - 1]}` : "等待 joint_states";

  renderArms(arms);
  (Object.keys(arms) as ArmId[]).forEach((arm) => updateMotion(arm, arms[arm]?.cartesian_velocity));
  renderMotionCards();
  renderGrippers(payload.grippers ?? {});
  renderCameras(payload.preview_cameras ?? {});
}

// Changingtek gripper open/close positions (device units) from config/ros/gripper.yaml.
const GRIPPER_RANGE: Record<string, { open: number; close: number }> = {
  right: { open: 4000, close: 12000 },
  left: { open: 400, close: 949 },
  mid: { open: 0, close: 9000 },
};

function gripperOpeningPercent(name: string, value: number): number {
  const range = GRIPPER_RANGE[name.replace("gripper_", "")];
  if (!range) return 0;
  const span = range.close - range.open;
  if (span <= 0) return 0;
  const opening = Math.min(1, Math.max(0, (range.close - value) / span));
  return Math.round(opening * 100);
}

function gripperBar(name: string, value: number): string {
  const label = name.replace("gripper_", "");
  const pct = gripperOpeningPercent(name, value);
  return `<article class="gripper-card"><h4>${label}</h4><div style="margin-bottom:8px;font:11px ui-monospace,Menlo,monospace;color:#8793a8">开合度 ${pct}%</div><div style="height:8px;background:#0b0f17;border:1px solid #202c40;border-radius:4px;overflow:hidden"><div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#55a6ff,#67d391);transition:width .2s"></div></div></article>`;
}

function renderGrippers(grippers: NonNullable<Snapshot["grippers"]>) {
  const entries = Object.entries(grippers);
  if (!entries.length) return;
  const positionTopics = entries.filter(([topic]) => topic.endsWith("/position"));
  if (!positionTopics.length) return;
  grippersEl.innerHTML = positionTopics
    .map(([topic, values]) => gripperBar(topic.split("/").filter(Boolean)[0] ?? "gripper", Number(values.position ?? 0)))
    .join("");
}

type ReplayFeatureValue = number | boolean | ReplayFeatureValue[];

type ReplayFrame = {
  frame_index: number;
  timestamp_ns: number;
  state: number[];
  action: number[];
  features?: Record<string, ReplayFeatureValue>;
  source_timestamps_ns?: Record<string, string>;
  cameras: Record<string, boolean>;
};

type ReplayFeatureMetadata = { dtype?: string; shape?: number[]; names?: unknown };
type ReplaySummary = {
  features?: Record<string, ReplayFeatureMetadata>;
  canonical?: Record<string, unknown>;
  quality?: Record<string, number>;
};
let replay: { session: string; frames: ReplayFrame[]; index: number; fps: number; summary: ReplaySummary; cameras: string[] } | null = null;

async function selectReplaySession(sessionId: string) {
  if (!sessionId) {
    exitReplay();
    return;
  }
  try {
    const [framesResponse, summaryResponse] = await Promise.all([
      fetch(`/api/lerobot/${encodeURIComponent(sessionId)}/frames`),
      fetch(`/api/lerobot/${encodeURIComponent(sessionId)}/summary`),
    ]);
    if (!framesResponse.ok || !summaryResponse.ok) {
      throw new Error(`回放接口错误 (${framesResponse.status}/${summaryResponse.status})`);
    }
    const index = await framesResponse.json();
    const summary = (await summaryResponse.json()) as ReplaySummary;
    const session = sidebar.getSession(sessionId);
    // Camera tiles are the synchronized <video> elements in the replay media
    // panel; the inspector chart stays focused on numeric frame features.
    const frameFeatureNames = Object.keys(index.frames?.[0]?.features ?? {});
    const featureNames = frameFeatureNames.length ? frameFeatureNames : Object.keys(summary.features ?? {});
    const imageKeys = Object.keys(summary.features ?? {}).filter((name) => name.startsWith("observation.images."));
    const cameraIds = imageKeys.length
      ? imageKeys.map((name) => name.slice("observation.images.".length))
      : Object.keys(index.frames?.[0]?.cameras ?? {});
    replay = { session: sessionId, frames: index.frames ?? [], index: 0, fps: session?.fps || 15, summary, cameras: cameraIds };
    charts.setFeatures(featureNames, summary);
    replayTask.textContent = session?.task || "未标注 task";
    const invalid = summary.quality?.invalid_frames ?? 0;
    replayDatasetMeta.textContent = `${session?.frames ?? replay.frames.length} 帧 · ${session?.fps ?? replay.fps} Hz · quality invalid ${invalid}`;
    replayExit.style.display = "";
    video.load();
    renderHealth(summary.quality ?? session?.quality);
    void annotation.load(sessionId);
    renderReplayFrame(0);
  } catch (error) {
    notify(`回放加载失败: ${String(error)}`, true);
  }
}

function exitReplay() {
  video.clear();
  charts.clear();
  annotation.clear();
  renderHealth(undefined);
  sidebar.setActive(null);
  replay = null;
  replayExit.style.display = "none";
  replayFrameLabel.textContent = "— / —";
  replayTimeLabel.textContent = "—";
  replayTask.textContent = "—";
  replayDatasetMeta.textContent = "—";
  poseCount.textContent = "URDF 实时关节";
  gripperCount.textContent = "实时输入";
}

function renderReplayFrame(frameIndex: number) {
  if (!replay) return;
  const frame = replay.frames[frameIndex];
  if (!frame) return;
  replay.index = frameIndex;
  replayFrameLabel.textContent = `${frameIndex + 1} / ${replay.frames.length}`;
  replayTimeLabel.textContent = `${(frame.timestamp_ns / 1e9).toFixed(3)} s`;
  jointStamp.textContent = `回放帧 ${frameIndex + 1} · ${new Date(frame.timestamp_ns / 1e6).toISOString()}`;
  poseCount.textContent = "回放关节";
  gripperCount.textContent = "回放";

  const armIds: ArmId[] = ["l", "m", "r"];
  armsEl.innerHTML = armIds
    .map((armId, i) => {
      const joints = frame.state.slice(i * 6, i * 6 + 6);
      setRobotJoints(armId, joints);
      const rows = joints
        .map((value, j) => `<span>J${j + 1} <b>${((value * 180) / Math.PI).toFixed(1)}°</b></span>`)
        .join("");
      const pose = getEndEffectorPose(armId);
      const poseHtml = pose
        ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--line);font:11px ui-monospace,Menlo,monospace;color:var(--muted)">位置 <b style="color:var(--text)">${vectorText(pose.basePosition)}</b> m<br>姿态 <b style="color:var(--text)">[${pose.baseQuaternion.w.toFixed(3)}, ${pose.baseQuaternion.x.toFixed(3)}, ${pose.baseQuaternion.y.toFixed(3)}, ${pose.baseQuaternion.z.toFixed(3)}]</b></div>`
        : "";
      return `<article class="arm-card"><h4>${armId.toUpperCase()} <span style="color:var(--blue)">REPLAY</span></h4><div class="joint-list">${rows}</div>${poseHtml}</article>`;
    })
    .join("");
  $("#arm-count").textContent = `回放帧 ${frameIndex + 1}/${replay.frames.length}`;

  grippersEl.innerHTML = ["left", "mid", "right"]
    .map((name, i) => gripperBar(name, frame.state[18 + i] ?? 0))
    .join("");
  charts.render(frame, replay.frames, replay.index);
  annotation.onFrameChange(frameIndex);
}

function connect() {
  socket = new WebSocket(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws`);
  socket.onopen = () => {
    connection.className = "connection online";
    connection.querySelector("span")!.textContent = "WebSocket 已连接 · 只读机器人";
  };
  socket.onclose = () => {
    connection.className = "connection";
    connection.querySelector("span")!.textContent = "已断开 · 2 秒后重连";
    setTimeout(connect, 2000);
  };
  socket.onerror = () => notify("无法连接录制服务", true);
  socket.onmessage = (event) => {
    const payload = JSON.parse(event.data) as Snapshot;
    if (payload.type === "recording_snapshot") render(payload);
  };
}

initScene();
initMotionScene();
fetch("/api/layout")
  .then((response) => response.json())
  .then((next) => {
    manifest = next as Manifest;
    return loadFleet();
  })
  .catch((error) => {
    viewerState.textContent = `布局加载失败: ${String(error)}`;
  });
connect();
refreshQueue();
setInterval(refreshQueue, 5000);
replayExit.addEventListener("click", exitReplay);

function getReplayVideoContext(): VideoContext | null {
  if (!replay) return null;
  return { sessionId: replay.session, fps: replay.fps, frameCount: replay.frames.length, cameraIds: replay.cameras };
}

const video = initVideo({ getSession: getReplayVideoContext, onFrameChange: renderReplayFrame });
const charts = initCharts();
const annotation = initAnnotation({
  getSessionId: () => replay?.session ?? null,
  getCurrentFrame: () => replay?.index ?? 0,
  notify,
});
const sidebar = initSidebar({
  onSelect: (sessionId) => {
    sidebar.setActive(sessionId);
    selectReplaySession(sessionId);
  },
  onChanged: () => {
    sidebar.refresh().then(() => {
      if (replay && !sidebar.getSession(replay.session)) exitReplay();
    });
  },
  onRefreshed: (episodes) => renderAnalysis(episodes),
});
// The feature dropdown re-renders the chart on change; playback/frame steps also
// drive the same render path. The chart keeps its own selection state.
for (const selector of ["#replay-feature-select"]) {
  document.querySelector(selector)?.addEventListener("change", () => {
    if (replay) charts.render(replay.frames[replay.index], replay.frames, replay.index);
  });
}

// Sidebar tabs: Episodes | Analysis, following LeRobot Studio.
for (const button of document.querySelectorAll<HTMLButtonElement>(".sidebar-tab")) {
  button.addEventListener("click", () => {
    const tab = button.getAttribute("data-sidebar-tab");
    document.querySelectorAll(".sidebar-tab").forEach((other) => other.classList.toggle("active", other === button));
    const episodes = document.querySelector<HTMLElement>("#sidebar-episodes");
    const analysis = document.querySelector<HTMLElement>("#sidebar-analysis");
    if (episodes) episodes.style.display = tab === "episodes" ? "" : "none";
    if (analysis) analysis.style.display = tab === "analysis" ? "" : "none";
  });
}

// Draggable + resizable dashboard: each panel is a gridstack widget. The panel
// header is the drag handle, and the export progress item starts hidden.
const grid = GridStack.init(
  {
    column: 12,
    cellHeight: 60,
    margin: 12,
    float: false,
    animate: true,
    draggable: { handle: ".panel-head" },
  },
  ".layout.grid-stack"
);

const LAYOUT_KEY = "recording-layout-v3";
const savedLayout = localStorage.getItem(LAYOUT_KEY);
if (savedLayout) {
  try {
    grid.load(JSON.parse(savedLayout));
  } catch {
    /* a stale layout is ignored */
  }
}
grid.on("change", () => {
  localStorage.setItem(LAYOUT_KEY, JSON.stringify(grid.save(false)));
});

// 标签页：录制 / 回放。回放只显示 LeRobot Studio 回放工作区；录制页（3D/相机/机械臂/夹爪）整体隐藏。
function switchTab(tab: "record" | "replay") {
  document.querySelectorAll(".tab").forEach((button) => {
    button.classList.toggle("active", button.getAttribute("data-tab") === tab);
  });
  const recordTab = document.querySelector<HTMLElement>("#tab-record");
  const replayTab = document.querySelector<HTMLElement>("#tab-replay");
  if (recordTab) recordTab.style.display = tab === "replay" ? "none" : "";
  if (replayTab) replayTab.style.display = tab === "replay" ? "" : "none";
  if (tab !== "replay" && replay) exitReplay();
}
document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => switchTab((button.getAttribute("data-tab") as "record" | "replay")));
});
