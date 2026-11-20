import * as THREE from "three";
import { createViewerRenderer, type ViewerRenderer } from "./viewer-renderer";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import URDFLoader from "urdf-loader";
import { GridStack, type GridItemHTMLElement } from "gridstack";
import "gridstack/dist/gridstack.min.css";
// One design system with :8765: the token sheet and robot-arm mark are imported
// from realman_web_control, not copied, so the two consoles cannot drift apart.
import "@web-control/theme.css";
import { ARM_ICON_SVG } from "@web-control/arm_icon";
import "./styles.css";
import { initSidebar } from "./replay/sidebar";
import { renderAnalysis } from "./replay/analysis";
import { initVideo, type VideoContext } from "./replay/video";
import { initCharts, renderHealth } from "./replay/charts";
import { initAnnotation } from "./replay/annotation";
import { initQuality } from "./replay/quality";
import { initPikaView, type PikaSnapshot } from "./pika-view";
import { initPikaRecalibrate } from "./pika-recalibrate";

type ArmId = "l" | "m" | "r";
// Arm identity colors shared with :8765 (realman_web_control main.ts ARM_COLORS).
const ARM_COLORS: Record<ArmId, number> = { l: 0x2d9b9d, m: 0xd47746, r: 0x84949a };
type Robot = {
  id: ArmId;
  model: string;
  transform: { x: number; y: number; z: number; roll: number; pitch: number; yaw: number };
  urdf_url: string;
  package_root_url: string;
};
type Manifest = { version: number; default_joint_position_rad: number; robots: Robot[]; pika_recalibrate?: boolean };
type CartesianVelocity = {
  commanded_linear_velocity_mps?: number[];
  commanded_angular_velocity_radps?: number[];
  measured_frame_id?: string;
  measured_linear_velocity_mps?: number[];
  measured_angular_velocity_radps?: number[];
  measured_valid?: boolean;
  measured_age_ms?: number;
};
// Measured by the bridge from image-topic receive times (monotonic), not by the
// browser: see camera_rate.py. fps/age_ms are null until there is data.
type CameraState = "no_data" | "stale" | "warming" | "low_fps" | "ok";
type CameraStats = {
  state: CameraState; fps: number | null; age_ms: number | null;
  expected_fps: number | null; frames_total: number; topic?: string;
};
type Snapshot = {
  type: "recording_snapshot";
  recording: Record<string, any>;
  arms: Partial<Record<ArmId, {
    positions_rad?: number[]; connected?: boolean; coordinate_state?: Record<string, unknown>;
    cartesian_velocity?: CartesianVelocity;
  }>>;
  preview_cameras: Record<string, number>;
  camera_stats_enabled?: boolean;
  camera_stats?: Record<string, CameraStats>;
  grippers?: Record<string, Record<string, number | boolean>>;
  gripper_limits?: Record<string, GripperLimits>;
  pika?: PikaSnapshot;
};

const $ = <T extends HTMLElement>(selector: string) => document.querySelector(selector) as T;
for (const mark of document.querySelectorAll(".brand-mark")) mark.innerHTML = ARM_ICON_SVG;
const statusEl = $("#recording");
const connection = $("#connection");
const armsEl = $("#arms");
const previewsEl = $("#previews");
const toast = $("#toast");
const viewerState = $("#viewer-state");
const jointStamp = $("#joint-stamp");
let canvas = $<HTMLCanvasElement>("#canvas");
const viewer = $("#viewer");
let motionCanvas = $<HTMLCanvasElement>("#motion-canvas");
const motionViewer = $("#motion-viewer");
const motionCards = $("#motion-cards");
const motion3dStatus = $("#motion-3d-status");

let manifest: Manifest | null = null;
let socket: WebSocket | null = null;
let toastTimer: number | undefined;
let renderer: ViewerRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let controls: OrbitControls;
let motionRenderer: ViewerRenderer;
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
const exportProgressLabel = $("#export-progress-label");
const exportProgress = $("#export-progress");
const exportDir = $("#export-dir");
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
  const colors: Record<ArmId, number> = ARM_COLORS;
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
    const actualArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 0.001, 0x2f9e6e, 0.035, 0.018);
    const commandedArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 0.001, 0x3e7bd6, 0.028, 0.014);
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
  scene = new THREE.Scene();
  const view = createViewerRenderer(canvas);
  canvas = view.canvas; renderer = view.renderer;
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

  let lastFrame = 0;
  const frame = (now: number) => {
    requestAnimationFrame(frame);
    if (document.hidden || !canvas.getClientRects().length || now - lastFrame < 33) return;
    lastFrame = now;
    controls.update();
    renderer.render(scene, camera);
  };
  requestAnimationFrame(frame);
}

function initMotionScene() {
  motionScene = new THREE.Scene();
  const view = createViewerRenderer(motionCanvas);
  motionCanvas = view.canvas; motionRenderer = view.renderer;
  motionCamera = new THREE.PerspectiveCamera(38, 1, 0.01, 100);
  motionCamera.up.set(0, 0, 1);
  motionCamera.position.set(1.2, -1.8, 1.25);
  motionControls = new OrbitControls(motionCamera, motionCanvas);
  motionControls.enableDamping = true;
  motionControls.target.set(0, 0, 0.55);
  motionScene.add(new THREE.HemisphereLight(0xffffff, 0xd3dbe5, 2.4));
  const grid = new THREE.GridHelper(3.5, 22, 0xb3c1d1, 0xdde4ec);
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
  let lastFrame = 0;
  const frame = (now: number) => {
    requestAnimationFrame(frame);
    if (document.hidden || !motionCanvas.getClientRects().length || now - lastFrame < 33) return;
    lastFrame = now;
    motionControls.update();
    motionRenderer.render(motionScene, motionCamera);
  };
  requestAnimationFrame(frame);
}

// Same per-arm finish as the :8765 viewer, so an arm reads the same on both pages.
function paintArms() {
  for (const [arm, urdf] of Object.entries(robotScenes) as [ArmId, any][]) {
    urdf?.traverse((object: any) => {
      if (!(object instanceof THREE.Mesh) || object.userData.armPainted) return;
      object.material = new THREE.MeshStandardMaterial({ color: ARM_COLORS[arm], metalness: 0.25, roughness: 0.56 });
      object.userData.armPainted = true;
    });
  }
}

async function loadFleet() {
  if (!manifest || !renderer) return;
  viewerState.textContent = "加载 URDF…";
  viewerState.removeAttribute("hidden");
  // STL meshes stream in after loadAsync resolves; paint them once the manager is idle.
  const manager = new THREE.LoadingManager();
  manager.onLoad = paintArms;
  const loader = new URDFLoader(manager);
  loader.parseVisual = renderer?.mode === "webgl";
  loader.packages = { rm65_description: `${location.origin}/models` };
  try {
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd3dbe5, 2.4));
    const key = new THREE.DirectionalLight(0xffffff, 4);
    key.position.set(2, -3, 4);
    key.castShadow = true;
  scene.add(key);
  const grid = new THREE.GridHelper(3.5, 22, 0xb3c1d1, 0xdde4ec);
  grid.rotation.x = Math.PI / 2;
  scene.add(grid);
  createMotionVisuals();

    const middle = manifest.robots.find((robot) => robot.id === "m")?.transform;
    if (!middle) throw new Error("middle-arm transform is missing from the layout manifest");

    for (const config of manifest.robots) {
      const urdf = await loader.loadAsync(`${location.origin}${config.urdf_url}`);
      urdf.position.set(config.transform.x - middle.x, config.transform.y - middle.y, config.transform.z - middle.z);
      urdf.rotation.set(config.transform.roll, config.transform.pitch, config.transform.yaw, "ZYX");
      urdf.userData.compatColor = `#${ARM_COLORS[config.id].toString(16).padStart(6, "0")}`;

      scene.add(urdf);
      robotScenes[config.id] = urdf;
      setRobotJoints(config.id, Array(6).fill(manifest!.default_joint_position_rad));
    }
    paintArms();
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
        ? `<div class="arm-pose">位置 <b>${vectorText(pose.basePosition)}</b> m<br>姿态 <b>[${pose.baseQuaternion.w.toFixed(3)}, ${pose.baseQuaternion.x.toFixed(3)}, ${pose.baseQuaternion.y.toFixed(3)}, ${pose.baseQuaternion.z.toFixed(3)}]</b></div>`
        : "";
      return `<article class="arm-card ${arm.connected ? "connected" : ""}"><h4>${name.toUpperCase()} <span>${arm.connected ? "CONNECTED" : "OFFLINE"}</span></h4><div class="joint-list">${
        positions.length
          ? positions.map((value, index) => `<span>J${index + 1} <b>${(value * 180 / Math.PI).toFixed(1)}°</b></span>`).join("")
          : "<span>暂无关节数据</span>"
      }</div>${poseHtml}</article>`;
    })
    .join("");
}

// Fit every visible camera inside the preview panel: choose the column count whose
// 16:9 tiles come out largest for the panel's current size, so nothing scrolls.
const CAMERA_ASPECT = 16 / 9;
function layoutCameraGrid() {
  const count = [...previewsEl.querySelectorAll<HTMLElement>(".camera-card")].filter((card) => card.style.display !== "none").length;
  const box = previewsEl.getBoundingClientRect();
  if (!count || !box.width || !box.height) return;
  const gap = 10, padding = 24;
  let best = { columns: 1, rows: count, area: 0 };
  for (let columns = 1; columns <= count; columns += 1) {
    const rows = Math.ceil(count / columns);
    const cellWidth = (box.width - padding - gap * (columns - 1)) / columns;
    const cellHeight = (box.height - padding - gap * (rows - 1)) / rows;
    const width = Math.min(cellWidth, cellHeight * CAMERA_ASPECT);
    const area = width * (width / CAMERA_ASPECT);
    if (area > best.area) best = { columns, rows, area };
  }
  previewsEl.style.setProperty("--camera-columns", String(best.columns));
  previewsEl.style.setProperty("--camera-rows", String(best.rows));
  previewsEl.dataset.cameraLayout = `${best.columns}x${best.rows}`;
}
new ResizeObserver(layoutCameraGrid).observe(previewsEl);

const previewTimes: Record<string, number> = {};
const CAMERA_STATE_LABEL: Record<CameraState | "disabled" | "unknown", string> = {
  ok: "LIVE", low_fps: "LOW FPS", warming: "STARTING", stale: "STALE", no_data: "NO DATA",
  disabled: "PREVIEW OFF", unknown: "NO SIGNAL",
};

function formatFrameAge(ageMs: number | null): string {
  if (ageMs === null || !Number.isFinite(ageMs)) return "—";
  if (ageMs < 1000) return `${Math.round(ageMs)} ms`;
  if (ageMs < 60_000) return `${(ageMs / 1000).toFixed(1)} s`;
  if (ageMs < 3_600_000) return `${(ageMs / 60_000).toFixed(1)} min`;
  return `${(ageMs / 3_600_000).toFixed(1)} h`;
}

function cameraHealthText(stats: CameraStats | undefined, enabled: boolean, previewNs: number): {
  state: CameraState | "disabled" | "unknown"; badge: string; detail: string; title: string;
} {
  if (!enabled) {
    return { state: "disabled", badge: CAMERA_STATE_LABEL.disabled, detail: "", title: "preview_enabled 关闭，桥接未订阅图像话题" };
  }
  if (!stats) {
    // Older bridge without camera_stats: fall back to the preview capture time.
    const ageSec = previewNs ? (Date.now() * 1e6 - previewNs) / 1e9 : Infinity;
    return ageSec < 3
      ? { state: "ok", badge: `LIVE · ${ageSec.toFixed(1)}s`, detail: "", title: "" }
      : { state: "unknown", badge: CAMERA_STATE_LABEL.unknown, detail: "", title: "" };
  }
  const fps = stats.fps === null ? "— fps" : `${stats.fps.toFixed(1)} fps`;
  const expected = stats.expected_fps ? ` / ${stats.expected_fps.toFixed(0)}` : "";
  const age = formatFrameAge(stats.age_ms);
  const title = `${stats.topic ?? ""} · 已收 ${stats.frames_total} 帧 · 统计来自桥接收图时间`;
  if (stats.state === "no_data") {
    return { state: "no_data", badge: CAMERA_STATE_LABEL.no_data, detail: "", title };
  }
  return { state: stats.state, badge: CAMERA_STATE_LABEL[stats.state], detail: `${fps}${expected} · ${age}`, title };
}

function renderCameras(cameras: Record<string, number>, stats: Record<string, CameraStats> | undefined, enabled: boolean) {
  const names = Object.keys(cameras);
  const unhealthy = stats ? names.filter((name) => stats[name] && stats[name].state !== "ok" && stats[name].state !== "warming").length : 0;
  $("#camera-count").textContent = !names.length
    ? "等待视频流"
    : unhealthy ? `${names.length} 路 · ${unhealthy} 路异常` : `${names.length} 路 · 低清预览`;
  $("#camera-count").classList.toggle("camera-count-alert", unhealthy > 0);
  if (!names.length) return;
  previewsEl.querySelector(".empty")?.remove();
  names.forEach((cameraName) => {
    let card = previewsEl.querySelector<HTMLElement>(`[data-camera="${CSS.escape(cameraName)}"]`);
    if (!card) {
      card = document.createElement("div");
      card.className = "camera-card";
      card.setAttribute("data-camera", cameraName);
      card.innerHTML = `<img class="preview-img" alt="" style="display:none"><div class="no-feed"><span class="no-feed-title">等待视频帧…</span><span class="no-feed-topic"></span></div><span class="camera-label"></span><span class="camera-health"><b class="camera-health-state">NO SIGNAL</b><span class="camera-health-detail"></span></span>`;
      (card.querySelector(".preview-img") as HTMLImageElement).alt = cameraName;
      (card.querySelector(".camera-label") as HTMLElement).textContent = cameraName;
      previewsEl.append(card);
    }
    card.style.display = "block";
    const health = cameraHealthText(stats?.[cameraName], enabled, cameras[cameraName]);
    card.dataset.cameraState = health.state;
    (card.querySelector(".camera-health-state") as HTMLElement).textContent = health.badge;
    (card.querySelector(".camera-health-detail") as HTMLElement).textContent = health.detail;
    (card.querySelector(".camera-health") as HTMLElement).title = health.title;
    const noFeed = card.querySelector(".no-feed");
    if (noFeed) {
      const topic = stats?.[cameraName]?.topic ?? "";
      (noFeed.querySelector(".no-feed-title") as HTMLElement).textContent =
        health.state === "no_data" ? "未收到图像帧" : health.state === "disabled" ? "预览未启用" : "等待视频帧…";
      (noFeed.querySelector(".no-feed-topic") as HTMLElement).textContent =
        health.state === "no_data" ? `检查话题 ${topic} 是否在发布` : "";
    }
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
      card!.querySelector(".no-feed")?.remove();
    };
    img.src = `/preview/${encodeURIComponent(cameraName)}.jpg?ts=${now}`;
  });
  [...previewsEl.children].forEach((card) => {
    const name = (card as HTMLElement).dataset.camera;
    if (name && !names.includes(name)) (card as HTMLElement).style.display = "none";
  });
  layoutCameraGrid();
}

function render(payload: Snapshot) {
  const recording = payload.recording ?? {};
  statusEl.textContent = recording.detail || "等待设备数据";
  $("#elapsed").textContent = `${(recording.elapsed_sec || 0).toFixed(1)}s`;
  $("#remaining").textContent = recording.remaining_sec > 0 ? `${recording.remaining_sec.toFixed(1)}s` : "—";
  $("#dropped").textContent = recording.dropped_samples || 0;
  $("#status-pulse").style.background = recording.state === 2 ? "var(--green)" : recording.state === 7 ? "var(--red)" : "var(--amber)";

  pikaView.render(payload.pika);
  pikaRecalibrate.observe(payload.pika);

  // In replay mode the 3D viewer, arm grid and gripper grid show the selected frame,
  // not the live subscription.
  if (replay) return;

  latestLiveSnapshot = payload;
  renderLiveRobot(payload);
}

// Live view: an arm whose driver reports connected=false is not drawn at all, so a
// powered-off arm does not look like a live one frozen at its last pose. An arm
// absent from the snapshot stays visible. Replay always draws all three arms.
function applyArmVisibility(arms: Snapshot["arms"] | null) {
  const hidden: ArmId[] = [];
  for (const [arm, urdf] of Object.entries(robotScenes) as [ArmId, any][]) {
    const visible = !arms || arms[arm]?.connected !== false;
    urdf.visible = visible;
    if (!visible) hidden.push(arm);
  }
  viewer.dataset.hiddenArms = hidden.join(",");
}

function renderLiveRobot(payload: Snapshot) {
  const arms = payload.arms ?? {};
  applyArmVisibility(arms);
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
  renderGrippers(payload.grippers ?? {}, payload.gripper_limits);
  renderCameras(payload.preview_cameras ?? {}, payload.camera_stats, payload.camera_stats_enabled ?? true);
}

// 开合度 uses each gripper's effective limits from gripper_manager (/<gripper>/limits,
// gripper.yaml plus :8765 overrides), sent in the snapshot as gripper_limits.
// Without them the card shows the raw position only, never a guessed percentage.
type GripperLimits = { open_position: number; close_position: number; min_position: number; max_position: number };
let gripperLimits: Record<string, GripperLimits> = {};

// Live topics give "gripper_left"; replay frames give "left".
const gripperKey = (name: string) => (name.startsWith("gripper_") ? name : `gripper_${name}`);

function gripperOpeningPercent(name: string, value: number): number | null {
  const limits = gripperLimits[gripperKey(name)];
  if (!limits) return null;
  const span = limits.close_position - limits.open_position;
  if (!span) return null;
  const opening = Math.min(1, Math.max(0, (limits.close_position - value) / span));
  return Math.round(opening * 100);
}

function gripperBar(name: string, value: number): string {
  const label = name.replace("gripper_", "");
  const pct = gripperOpeningPercent(name, value);
  const key = gripperKey(name);
  const limits = gripperLimits[key];
  const meta = limits
    ? `位置 ${value} · 开 ${limits.open_position} / 闭 ${limits.close_position}`
    : `位置 ${value} · 等待 /${key}/limits`;
  return `<article class="gripper-card" data-gripper="${key}"><h4>${label}</h4><div class="gripper-pct">开合度 ${pct === null ? "—" : `${pct}%`}</div><div class="gripper-meta">${meta}</div><div class="gripper-track"><div class="gripper-fill" style="width:${pct ?? 0}%"></div></div></article>`;
}

function renderGrippers(grippers: NonNullable<Snapshot["grippers"]>, limits: Snapshot["gripper_limits"]) {
  gripperLimits = limits ?? {};
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
// kind "episode" = converted LeRobot episode (parquet + mp4); kind "raw" = a 待转换
// session replayed straight from state.mcap + its JPEGs (/raw/replay).
type ReplayKind = "episode" | "raw";
type RawReplayPayload = {
  fps: number;
  frames: (ReplayFrame & { camera_frames?: Record<string, string | null> })[];
  cameras: string[];
  camera_frame_counts?: Record<string, number>;
  summary: ReplaySummary;
  task?: string;
  session_number?: number;
  duration_s?: number;
  state_error?: string;
  topics_present?: string[];
};
let replay: {
  kind: ReplayKind; session: string; frames: ReplayFrame[]; index: number; fps: number;
  summary: ReplaySummary; cameras: string[];
  cameraFrames?: (Record<string, string | null> | undefined)[];
  cameraFrameCounts?: Record<string, number>;
} | null = null;
let replayRequest = 0;
const replayTab = $("#tab-replay");
const replaySource = $("#replay-source");

function setReplayKind(kind: ReplayKind | null): void {
  if (kind) replayTab.dataset.replayKind = kind;
  else delete replayTab.dataset.replayKind;
  replaySource.textContent = kind === "raw" ? "待转换 · 原始数据" : kind === "episode" ? "已转换 · LeRobot" : "未选择";
  replaySource.className = `source-pill${kind ? ` ${kind}` : ""}`;
}

async function selectPendingSession(sessionId: string) {
  const request = ++replayRequest;
  video.clear();
  setReplayKind("raw");
  sidebar.setActive(sessionId);
  $("#replay-camera-count").textContent = "读取原始数据…";
  try {
    const response = await fetch(`/api/lerobot/${encodeURIComponent(sessionId)}/raw/replay`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = (await response.json()) as RawReplayPayload;
    if (request !== replayRequest) return;
    const frames = payload.frames ?? [];
    replay = {
      kind: "raw", session: sessionId, frames, index: 0, fps: payload.fps || 15,
      summary: payload.summary ?? {}, cameras: payload.cameras ?? [],
      cameraFrames: frames.map((frame) => frame.camera_frames),
      cameraFrameCounts: payload.camera_frame_counts,
    };
    const featureNames = Object.keys(payload.summary?.features ?? {});
    charts.setFeatures(featureNames, payload.summary);
    const number = payload.session_number ? String(payload.session_number).padStart(6, "0") : sessionId;
    replayTask.textContent = payload.task ? `${number} · ${payload.task}` : number;
    replayDatasetMeta.textContent = `${frames.length} 帧 · ${replay.fps.toFixed(0)} Hz 采样 · ${(payload.duration_s ?? 0).toFixed(1)} s`;
    replayExit.style.display = "";
    video.load();
    renderRawHealth(payload);
    annotation.clear();
    quality.clear();
    renderReplayFrame(0);
    if (payload.state_error) notify(`状态曲线不可用（相机仍可回放）：${payload.state_error}`, true);
  } catch (error) {
    if (request !== replayRequest) return;
    notify(`无法回放该待转换数据：${error instanceof Error ? error.message : String(error)}`, true);
    exitReplay();
  }
}

function renderRawHealth(payload: RawReplayPayload): void {
  const counts = payload.camera_frame_counts ?? {};
  const rows = [
    ["来源", "state.mcap + 原始 JPEG"],
    ["相机", payload.cameras.length ? payload.cameras.map((camera) => `${camera} ${counts[camera] ?? 0}`).join(" · ") : "—"],
    ["状态话题", payload.topics_present?.length ? String(payload.topics_present.length) : "—"],
  ];
  $("#replay-health").innerHTML = rows
    .map(([label, value]) => `<div class="health-stat"><span>${label}</span><b>${value}</b></div>`)
    .join("");
}

async function selectReplaySession(sessionId: string) {
  if (!sessionId) {
    exitReplay();
    return;
  }
  const request = ++replayRequest;
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
    if (request !== replayRequest) return;
    const session = sidebar.getSession(sessionId);
    // Camera tiles are the synchronized <video> elements in the replay media
    // panel; the inspector chart stays focused on numeric frame features.
    const frameFeatureNames = Object.keys(index.frames?.[0]?.features ?? {});
    const featureNames = frameFeatureNames.length ? frameFeatureNames : Object.keys(summary.features ?? {});
    const imageKeys = Object.keys(summary.features ?? {}).filter((name) => name.startsWith("observation.images."));
    const cameraIds = imageKeys.length
      ? imageKeys.map((name) => name.slice("observation.images.".length))
      : Object.keys(index.frames?.[0]?.cameras ?? {});
    replay = { kind: "episode", session: sessionId, frames: index.frames ?? [], index: 0, fps: session?.fps || 15, summary, cameras: cameraIds };
    setReplayKind("episode");
    charts.setFeatures(featureNames, summary);
    replayTask.textContent = session?.task || "未标注 task";
    const invalid = summary.quality?.invalid_frames ?? 0;
    replayDatasetMeta.textContent = `${session?.frames ?? replay.frames.length} 帧 · ${session?.fps ?? replay.fps} Hz · quality invalid ${invalid}`;
    replayExit.style.display = "";
    video.load();
    renderHealth(summary.quality ?? session?.quality);
    void annotation.load(sessionId);
    quality.load(sessionId);
    renderReplayFrame(0);
  } catch (error) {
    console.error("selectReplaySession failed:", error);
    notify(`回放加载失败: ${String(error)}`, true);
  }
}

function exitReplay() {
  replayRequest += 1;
  setReplayKind(null);
  video.clear();
  charts.clear();
  annotation.clear();
  quality.clear();
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
  if (latestLiveSnapshot) applyArmVisibility(latestLiveSnapshot.arms ?? {});
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
  applyArmVisibility(null);

  const armIds: ArmId[] = ["l", "m", "r"];
  armsEl.innerHTML = armIds
    .map((armId, i) => {
      const joints = frame.state.slice(i * 6, i * 6 + 6) as (number | null)[];
      const known = joints.length === 6 && joints.every((value) => typeof value === "number" && Number.isFinite(value));
      if (known) setRobotJoints(armId, joints as number[]);
      const rows = joints
        .map((value, j) => `<span>J${j + 1} <b>${typeof value === "number" ? `${((value * 180) / Math.PI).toFixed(1)}°` : "—"}</b></span>`)
        .join("");
      const pose = known ? getEndEffectorPose(armId) : null;
      const poseHtml = pose
        ? `<div class="arm-pose">位置 <b>${vectorText(pose.basePosition)}</b> m<br>姿态 <b>[${pose.baseQuaternion.w.toFixed(3)}, ${pose.baseQuaternion.x.toFixed(3)}, ${pose.baseQuaternion.y.toFixed(3)}, ${pose.baseQuaternion.z.toFixed(3)}]</b></div>`
        : "";
      return `<article class="arm-card"><h4>${armId.toUpperCase()} <span class="replay-badge">REPLAY</span></h4><div class="joint-list">${rows}</div>${poseHtml}</article>`;
    })
    .join("");
  $("#arm-count").textContent = `回放帧 ${frameIndex + 1}/${replay.frames.length}`;

  grippersEl.innerHTML = ["left", "mid", "right"]
    .map((name, i) => {
      const value = frame.state[18 + i] as number | null | undefined;
      return typeof value === "number" ? gripperBar(name, value) : `<article class="gripper-card"><h4>${name}</h4><div class="muted">无数据</div></article>`;
    })
    .join("");
  charts.render(frame, replay.frames, replay.index);
  annotation.onFrameChange(frameIndex);
  quality.onFrameChange(frameIndex);
}

function refreshProgress(): void {
  fetch("/api/lerobot/queue")
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
    .then((payload) => {
      const jobs = (payload.jobs ?? []) as { decision: string | null; export_state: string | null; error: string }[];
      const adopted = jobs.filter((job) => job.decision === "ADOPTED" && job.export_state);
      const succeeded = adopted.filter((job) => job.export_state === "SUCCEEDED").length;
      const failed = adopted.filter((job) => job.export_state === "FAILED").length;
      const running = adopted.filter((job) => job.export_state === "RUNNING").length;
      const queued = adopted.filter((job) => job.export_state === "QUEUED").length;
      const total = adopted.length;
      const done = succeeded + failed;
      exportProgressLabel.textContent = total ? `${done} / ${total}${running ? ` · ${running} 转换中` : queued ? ` · ${queued} 排队` : ""}` : "0 / 0";
      exportProgress.style.width = total ? `${Math.round((done / total) * 100)}%` : "0%";
      const failedJob = adopted.find((job) => job.export_state === "FAILED");
      exportDir.textContent = failedJob ? `最近失败: ${failedJob.error}` : "";
    })
    .catch(() => {
      /* keep the last progress on transient failure */
    });
}

function connect() {
  socket = new WebSocket(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws`);
  socket.onopen = () => {
    connection.className = "status-pill ready";
    connection.querySelector("span")!.textContent = "已连接 · 只读";
  };
  socket.onclose = () => {
    connection.className = "status-pill offline";
    connection.querySelector("span")!.textContent = "已断开 · 2 秒后重连";
    setTimeout(connect, 2000);
  };
  socket.onerror = () => notify("无法连接录制服务", true);
  socket.onmessage = (event) => {
    const payload = JSON.parse(event.data) as Snapshot;
    if (payload.type === "recording_snapshot") render(payload);
  };
}

const pikaView = initPikaView(
  $("#pika-viewer"), $("#pika-cards"), $("#pika-status"), $("#pika-empty"), $<HTMLButtonElement>("#pika-recenter"),
);
const pikaRecalibrate = initPikaRecalibrate($<HTMLButtonElement>("#pika-recalibrate"), $("#pika-recal-line"));

for (const [initialize, status] of [[initScene, viewerState], [initMotionScene, motion3dStatus]] as const) {
  try { initialize(); }
  catch (error) { status.textContent = "3D 视图不可用；状态、相机与转换功能仍可使用"; console.warn("3D initialization failed", error); }
}
fetch("/api/layout")
  .then((response) => response.json())
  .then((next) => {
    manifest = next as Manifest;
    pikaRecalibrate.enable(Boolean(manifest.pika_recalibrate));
    return loadFleet();
  })
  .catch((error) => {
    viewerState.textContent = `布局加载失败: ${String(error)}`;
  });
connect();
refreshProgress();
setInterval(refreshProgress, 2000);
replayExit.addEventListener("click", exitReplay);

function getReplayVideoContext(): VideoContext | null {
  if (!replay) return null;
  const current = replay;
  return {
    kind: current.kind === "raw" ? "frames" : "video",
    sessionId: current.session, fps: current.fps, frameCount: current.frames.length, cameraIds: current.cameras,
    frameImage: (index, cameraId) => current.cameraFrames?.[index]?.[cameraId] ?? null,
    cameraFrameCounts: current.cameraFrameCounts,
  };
}

const video = initVideo({ getSession: getReplayVideoContext, onFrameChange: renderReplayFrame });
const charts = initCharts();
const annotation = initAnnotation({
  getSessionId: () => replay?.session ?? null,
  getCurrentFrame: () => replay?.index ?? 0,
  notify,
});
const quality = initQuality({
  getCurrentFrame: () => replay?.index ?? 0,
  getRepoId: () => (replay ? sidebar.getSession(replay.session)?.repo_id ?? null : null),
  notify,
});
const sidebar = initSidebar({
  onSelect: (sessionId) => {
    sidebar.setActive(sessionId);
    void selectReplaySession(sessionId);
  },
  // A 待转换 session plays in the same workspace (all cameras + curves), not a popup.
  onSelectPending: (sessionId) => {
    void selectPendingSession(sessionId);
  },
  onChanged: () => {
    // handleAction already refreshed the sidebar; only check whether the
    // currently-open replay session was just hidden so we can exit replay.
    if (replay && !sidebar.getSession(replay.session)) exitReplay();
  },
  onRefreshed: (episodes) => renderAnalysis(episodes),
});
// Keep the conversion lists live: the serial worker moves sessions from
// 待转换 → 已转换 over time, so poll the catalog like the old record-tab queue.
setInterval(() => { void sidebar.refresh(); }, 5000);
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
    // 20 px rows (panel heights in index.html are multiples of 3) so content-fitted
    // status panels end close to their content.
    cellHeight: 20,
    margin: 12,
    float: false,
    animate: true,
    draggable: { handle: ".panel-head" },
    // Side-by-side panels (3D + Pika) stack into one column on narrow screens.
    columnOpts: { breakpoints: [{ w: 900, c: 1 }] },
  },
  ".layout.grid-stack"
);

// v5: 20 px rows (v4 used 60 px rows, so its saved heights no longer apply).
const LAYOUT_KEY = "recording-layout-v5";
const savedLayout = localStorage.getItem(LAYOUT_KEY);
if (savedLayout) {
  try {
    grid.load(JSON.parse(savedLayout));
  } catch {
    /* a stale layout is ignored */
  }
}
// Status panels (arms, 2D motion, grippers) grow to their content instead of
// scrolling inside a fixed-height widget: whenever their content or width changes,
// set the widget height to the rows the content needs.
function fitPanelHeights() {
  const cellHeight = grid.getCellHeight(true);
  const margin = Number(grid.opts.margin ?? 0);
  for (const item of document.querySelectorAll<GridItemHTMLElement>(".layout .grid-stack-item.fit-content")) {
    const content = item.querySelector<HTMLElement>(".grid-stack-item-content");
    if (!content || !content.getClientRects().length) continue;
    const border = content.offsetHeight - content.clientHeight;
    const natural = [...content.children].reduce((sum, child) => sum + (child as HTMLElement).offsetHeight, 0) + border;
    const rows = Math.max(1, Math.ceil((natural + 2 * margin) / cellHeight));
    if (rows !== item.gridstackNode?.h) grid.update(item, { h: rows, minH: rows, maxH: rows });
  }
}
let fitScheduled = false;
const scheduleFit = () => {
  if (fitScheduled) return;
  fitScheduled = true;
  requestAnimationFrame(() => { fitScheduled = false; fitPanelHeights(); });
};
const fitObserver = new ResizeObserver(scheduleFit);
for (const content of document.querySelectorAll(".layout .grid-stack-item.fit-content .grid-stack-item-content > *")) {
  fitObserver.observe(content);
}
scheduleFit();

grid.on("change", () => {
  // Only the 12-column desktop arrangement is persisted; the 1-column view is derived.
  if (grid.getColumn() !== 12) return;
  localStorage.setItem(LAYOUT_KEY, JSON.stringify(grid.save(false)));
});

// 标签页：录制 / 转换。转换页显示 LeRobot 转换工作区；录制页（3D/相机/机械臂/夹爪）整体隐藏。
function switchTab(tab: "record" | "replay") {
  document.querySelectorAll(".tab").forEach((button) => {
    button.classList.toggle("active", button.getAttribute("data-tab") === tab);
  });
  $("#tab-record").hidden = tab === "replay";
  replayTab.hidden = tab !== "replay";
  // The camera tiles size themselves to the panel, which had no box while hidden.
  if (tab === "replay") window.dispatchEvent(new Event("resize"));
  if (tab !== "replay" && replay) exitReplay();
}
document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => switchTab((button.getAttribute("data-tab") as "record" | "replay")));
});
