import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import URDFLoader from "urdf-loader";
import { GridStack } from "gridstack";
import "gridstack/dist/gridstack.min.css";
import "./styles.css";

type ArmId = "l" | "m" | "r";
type Robot = {
  id: ArmId;
  model: string;
  transform: { x: number; y: number; z: number; roll: number; pitch: number; yaw: number };
  urdf_url: string;
  package_root_url: string;
};
type Manifest = { version: number; default_joint_position_rad: number; robots: Robot[] };
type Snapshot = {
  type: "recording_snapshot";
  recording: Record<string, any>;
  arms: Partial<Record<ArmId, { positions_rad?: number[]; connected?: boolean }>>;
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

let manifest: Manifest | null = null;
let socket: WebSocket | null = null;
let toastTimer: number | undefined;
let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let controls: OrbitControls;
const robotScenes: Partial<Record<ArmId, any>> = {};
const jointStampByArm: Partial<Record<ArmId, string>> = {};
const grippersEl = $("#grippers");
const exportPanel = $("#export-panel");
const exportState = $("#export-state");
const exportProgressEl = $("#export-progress");
const exportDirEl = $("#export-dir");
const replayCount = $("#replay-count");
const replayDataset = $<HTMLSelectElement>("#replay-dataset");
const replaySlider = $<HTMLInputElement>("#replay-slider");
const replayFrameLabel = $("#replay-frame-label");
const replayExit = $<HTMLButtonElement>("#replay-exit");
const replayPlay = $<HTMLButtonElement>("#replay-play");
const replayPrev = $<HTMLButtonElement>("#replay-prev");
const replayNext = $<HTMLButtonElement>("#replay-next");
const replaySpeed = $<HTMLSelectElement>("#replay-speed");
const replayEpisodes = $("#replay-episodes");
const replayCameras = $("#replay-cameras");
const replayCameraCount = $("#replay-camera-count");
const replayTask = $("#replay-task");
const replayDatasetMeta = $("#replay-dataset-meta");
const replayFeatureSelect = $<HTMLSelectElement>("#replay-feature-select");
const replayFeatureComponent = $<HTMLSelectElement>("#replay-feature-component");
const replayFeatureChart = $<SVGElement>("#replay-feature-chart");
const replayFeatureRaw = $("#replay-feature-raw");
const replayFeatureCount = $("#replay-feature-count");
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

function getEndEffectorPose(arm: ArmId): { pos: number[]; quat: number[] } | null {
  const robot = robotScenes[arm] as any;
  if (!robot) return null;
  try {
    const links = robot.links ?? {};
    const base = links["base_link"];
    const ee = links["link_6"];
    if (!base || !ee) return null;
    const relative = base.matrixWorld.clone().invert().multiply(ee.matrixWorld);
    const pos = new THREE.Vector3().setFromMatrixPosition(relative);
    const quat = new THREE.Quaternion().setFromRotationMatrix(relative);
    return { pos: [pos.x, pos.y, pos.z], quat: [quat.w, quat.x, quat.y, quat.z] };
  } catch {
    return null;
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
        ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--line);font:11px ui-monospace,Menlo,monospace;color:var(--muted)">位置 <b style="color:var(--text)">${pose.pos.map((v) => v.toFixed(3)).join(" ")}</b><br>姿态 <b style="color:var(--text)">${pose.quat.map((v) => v.toFixed(3)).join(" ")}</b></div>`
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

type ReplaySession = { session_id: string; frames: number; fps: number; task?: string; quality?: Record<string, number> };
type ReplayFeatureMetadata = { dtype?: string; shape?: number[]; names?: unknown };
type ReplaySummary = {
  features?: Record<string, ReplayFeatureMetadata>;
  canonical?: Record<string, unknown>;
  quality?: Record<string, number>;
};
let replay: { session: string; frames: ReplayFrame[]; index: number; fps: number; features: string[]; summary: ReplaySummary } | null = null;
let replaySessions: ReplaySession[] = [];
let replayTimer: number | undefined;

async function loadReplayDatasets() {
  try {
    const response = await fetch("/api/lerobot");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const sessions: ReplaySession[] = data.sessions ?? [];
    replaySessions = sessions;
    replayDataset.innerHTML =
      '<option value="">— 选择已完成的数据集 —</option>' +
      sessions
        .map((session) => `<option value="${escapeHtml(session.session_id)}">${escapeHtml(session.session_id)} · ${session.frames} 帧</option>`)
        .join("");
    replayCount.textContent = sessions.length ? `${sessions.length} 个数据集` : "暂无";
    replayEpisodes.innerHTML = sessions.length
      ? sessions.map((session) => `<button class="episode-item" data-session="${escapeHtml(session.session_id)}"><strong>${escapeHtml(session.session_id)}</strong><small>${session.frames} 帧 · ${session.fps} Hz</small></button>`).join("")
      : '<div class="empty">暂无已导出 episode</div>';
    replayEpisodes.querySelectorAll<HTMLButtonElement>("[data-session]").forEach((button) => {
      button.addEventListener("click", () => {
        replayDataset.value = button.dataset.session ?? "";
        selectReplaySession(replayDataset.value);
      });
    });
  } catch {
    replayCount.textContent = "回放不可用";
  }
}

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
    const session = replaySessions.find((item) => item.session_id === sessionId);
    // Video features are rendered by the synchronized camera cards. Keep the
    // inspector focused on frame-level numeric/quality fields so selecting a
    // camera cannot produce an empty chart that looks like missing telemetry.
    const frameFeatureNames = Object.keys(index.frames?.[0]?.features ?? {});
    const featureNames = frameFeatureNames.length ? frameFeatureNames : Object.keys(summary.features ?? {});
    replay = { session: sessionId, frames: index.frames ?? [], index: 0, fps: session?.fps || 15, features: featureNames, summary };
    replayFeatureSelect.innerHTML = featureNames.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join("");
    replayFeatureCount.textContent = `${featureNames.length} fields`;
    replayTask.textContent = session?.task || "未标注 task";
    const invalid = summary.quality?.invalid_frames ?? 0;
    replayDatasetMeta.textContent = `${session?.frames ?? replay.frames.length} 帧 · ${session?.fps ?? replay.fps} Hz · quality invalid ${invalid}`;
    replaySlider.max = String(Math.max(0, (index.frames ?? []).length - 1));
    replaySlider.value = "0";
    replayExit.style.display = "";
    replayPlay.style.display = "";
    renderReplayFrame(0);
  } catch (error) {
    notify(`回放加载失败: ${String(error)}`, true);
  }
}

function exitReplay() {
  stopReplayPlay();
  replay = null;
  replayExit.style.display = "none";
  replayPlay.style.display = "none";
  replayDataset.value = "";
  replaySlider.max = "0";
  replaySlider.value = "0";
  replayFrameLabel.textContent = "— / —";
  replayCameras.innerHTML = '<div class="empty">选择一个 Episode 开始回放</div>';
  replayCameraCount.textContent = "选择 Episode 后显示";
  replayCount.textContent = "未选择数据集";
  replayTask.textContent = "—";
  replayDatasetMeta.textContent = "—";
  replayEpisodes.querySelectorAll(".episode-item").forEach((item) => item.classList.remove("active"));
  replayFeatureSelect.innerHTML = "";
  replayFeatureComponent.innerHTML = "";
  replayFeatureComponent.hidden = true;
  replayFeatureRaw.textContent = "选择一个字段查看数据";
  replayFeatureChart.innerHTML = "";
  poseCount.textContent = "URDF 实时关节";
  gripperCount.textContent = "实时输入";
}

function stopReplayPlay() {
  if (replayTimer !== undefined) {
    clearInterval(replayTimer);
    replayTimer = undefined;
  }
  replayPlay.textContent = "▶ 播放";
}

function toggleReplayPlay() {
  if (!replay) return;
  if (replayTimer !== undefined) {
    stopReplayPlay();
    return;
  }
  replayPlay.textContent = "⏸ 暂停";
  replayTimer = window.setInterval(() => {
    if (!replay) {
      stopReplayPlay();
      return;
    }
    const next = Number(replaySlider.value) + 1;
    if (next >= replay.frames.length) {
      stopReplayPlay();
      replaySlider.value = String(replay.frames.length - 1);
      renderReplayFrame(replay.frames.length - 1);
      return;
    }
    replaySlider.value = String(next);
    renderReplayFrame(next);
  }, 1000 / ((replay.fps || 15) * Number(replaySpeed.value || 1)));
}

function moveReplayFrame(delta: number) {
  if (!replay || !replay.frames.length) return;
  const next = Math.min(replay.frames.length - 1, Math.max(0, replay.index + delta));
  replaySlider.value = String(next);
  stopReplayPlay();
  renderReplayFrame(next);
}

function numericComponents(value: ReplayFeatureValue | undefined): number[] {
  if (typeof value === "number" && Number.isFinite(value)) return [value];
  // Studio's feature browser treats numeric features as plottable; represent
  // canonical boolean quality flags as 0/1 while the raw inspector keeps bool.
  if (typeof value === "boolean") return [value ? 1 : 0];
  if (Array.isArray(value)) return value.flatMap((item) => numericComponents(item));
  return [];
}

function componentLabels(feature: string, count: number): string[] {
  if (!replay) return Array.from({ length: count }, (_, index) => `分量 ${index}`);
  // Match LeRobot Studio's chart behavior: feature.names is the authoritative
  // label for each vector dimension. Canonical metadata remains a fallback for
  // older exports created before named dimensions were added to the schema.
  const featureNames = replay.summary.features?.[feature]?.names;
  if (Array.isArray(featureNames) && featureNames.length === count
    && featureNames.every((name) => typeof name === "string" && name.length > 0)) {
    return featureNames as string[];
  }
  const canonical = replay.summary.canonical ?? {};
  const syncSourceIds = Array.isArray(canonical.quality_sync_source_ids)
    ? canonical.quality_sync_source_ids.filter((source): source is string => typeof source === "string")
    : [];
  if (feature === "quality.sync_error_ns" && syncSourceIds.length === count) return syncSourceIds;

  const jointNames = Array.isArray(canonical.joint_names)
    ? canonical.joint_names.filter((name): name is string => typeof name === "string")
    : [];
  const baseFrames = Array.isArray(canonical.base_frames)
    ? canonical.base_frames.filter((name): name is string => typeof name === "string")
    : [];
  const arms = baseFrames.map((frameName) => frameName.split("/")[0]);
  const jointFeature = ["observation.joint_position", "observation.joint_velocity", "observation.joint_effort"].includes(feature);
  if (jointFeature && jointNames.length && arms.length * jointNames.length === count) {
    return arms.flatMap((arm) => jointNames.map((joint) => `${arm}.${joint}`));
  }

  const poseAxes = ["x", "y", "z", "qx", "qy", "qz", "qw"];
  const velocityAxes = ["vx", "vy", "vz", "wx", "wy", "wz"];
  const command = canonical.cartesian_command as { frames?: unknown } | undefined;
  const commandFrames = Array.isArray(command?.frames)
    ? command.frames.filter((name): name is string => typeof name === "string")
    : [];
  const axes = feature === "observation.ee_pose_base" ? poseAxes
    : feature === "observation.ee_velocity_base" || feature === "action.command.cartesian_velocity" ? velocityAxes
      : [];
  const frameNames = feature === "action.command.cartesian_velocity" ? commandFrames : baseFrames;
  if (axes.length && frameNames.length * axes.length === count) {
    return frameNames.flatMap((frameName) => axes.map((axis) => `${frameName.split("/")[0]}.${axis}`));
  }
  return Array.from({ length: count }, (_, index) => `${feature.split(".").at(-1)}[${index}]`);
}

function renderFeatureInspector(frame: ReplayFrame) {
  if (!replay) return;
  const feature = replayFeatureSelect.value || replay.features[0];
  const values = frame.features?.[feature];
  const components = numericComponents(values);
  const labels = componentLabels(feature, components.length);
  const optionSignature = [...replayFeatureComponent.options].map((option) => `${option.value}\t${option.text}`).join("\n");
  const nextSignature = labels.map((label, index) => `${index}\t${label}`).join("\n");
  const previousIndex = Number(replayFeatureComponent.value || 0);
  if (optionSignature !== nextSignature) {
    replayFeatureComponent.innerHTML = labels
      .map((label, index) => `<option value="${index}">${escapeHtml(label)}</option>`)
      .join("");
  }
  replayFeatureComponent.hidden = components.length < 2;
  const componentIndex = Math.min(Math.max(0, previousIndex), Math.max(0, components.length - 1));
  if (components.length) replayFeatureComponent.value = String(componentIndex);
  const selectedComponent = labels[componentIndex];
  const selectedValue = components[componentIndex];
  replayFeatureRaw.textContent = JSON.stringify(
    {
      feature,
      value: values,
      ...(components.length > 1 ? { selected_component: selectedComponent, selected_value: selectedValue } : {}),
      frame_index: frame.frame_index,
      source_timestamps_ns: frame.source_timestamps_ns ?? {},
      metadata: replay.summary.canonical ?? {},
    },
    null,
    2,
  );

  const frameValues = replay.frames.map((item) => numericComponents(item.features?.[feature])[componentIndex] ?? Number.NaN);
  const all = frameValues.filter((value): value is number => Number.isFinite(value));
  if (!components.length || !all.length) {
    replayFeatureChart.innerHTML = "";
    return;
  }
  const min = Math.min(...all), max = Math.max(...all), span = max - min || 1;
  const width = 320, height = 120, pad = 8;
  const polyline = frameValues.map((value, index) => Number.isFinite(value)
    ? `${pad + (index / Math.max(1, frameValues.length - 1)) * (width - pad * 2)},${height - pad - ((value - min) / span) * (height - pad * 2)}`
    : "").filter(Boolean).join(" ");
  const markerX = pad + (replay.index / Math.max(1, replay.frames.length - 1)) * (width - pad * 2);
  replayFeatureChart.innerHTML = `<polyline points="${polyline}" fill="none" stroke="#55a6ff" stroke-width="1.5"/><line x1="${markerX}" x2="${markerX}" y1="${pad}" y2="${height - pad}" stroke="#67d391" stroke-width="1"/><text x="${pad}" y="${height - 2}" fill="#8793a8" font-size="9">${min.toPrecision(4)} — ${max.toPrecision(4)}</text>`;
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
        ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--line);font:11px ui-monospace,Menlo,monospace;color:var(--muted)">位置 <b style="color:var(--text)">${pose.pos.map((v) => v.toFixed(3)).join(" ")}</b><br>姿态 <b style="color:var(--text)">${pose.quat.map((v) => v.toFixed(3)).join(" ")}</b></div>`
        : "";
      return `<article class="arm-card"><h4>${armId.toUpperCase()} <span style="color:var(--blue)">REPLAY</span></h4><div class="joint-list">${rows}</div>${poseHtml}</article>`;
    })
    .join("");
  $("#arm-count").textContent = `回放帧 ${frameIndex + 1}/${replay.frames.length}`;

  grippersEl.innerHTML = ["left", "mid", "right"]
    .map((name, i) => gripperBar(name, frame.state[18 + i] ?? 0))
    .join("");
  renderFeatureInspector(frame);

  // Keep replay imagery separate from the live preview: both remain read-only,
  // and scrubbing updates the image URLs without rebuilding cards or flickering.
  const cameraIds = Object.keys(frame.cameras ?? {});
  replayCount.textContent = cameraIds.length ? `${cameraIds.length} 路相机` : "无相机";
  replayCameraCount.textContent = cameraIds.length ? `${cameraIds.length} 路 · 当前帧同步` : "该 Episode 无相机字段";
  replayCameras.querySelector(".empty")?.remove();
  replayCameras.querySelectorAll<HTMLElement>(".camera-card").forEach((card) => {
    if (!cameraIds.includes(card.dataset.camera ?? "")) card.remove();
  });
  cameraIds.forEach((cameraId) => {
    let card = replayCameras.querySelector<HTMLElement>(`[data-camera="${CSS.escape(cameraId)}"]`);
    if (!card) {
      card = document.createElement("div");
      card.className = "camera-card";
      card.dataset.camera = cameraId;
      card.innerHTML = `<img alt="${escapeHtml(cameraId)}"><span class="camera-label">${escapeHtml(cameraId)}</span>`;
      replayCameras.append(card);
    }
    const img = card.querySelector("img");
    const url = `/api/lerobot/${encodeURIComponent(replay!.session)}/frames/${frame.frame_index}/cameras/${encodeURIComponent(cameraId)}`;
    if (img && img.getAttribute("src") !== url) img.src = url;
  });
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
loadReplayDatasets();
replayDataset.addEventListener("change", () => selectReplaySession(replayDataset.value));
replaySlider.addEventListener("input", () => {
  stopReplayPlay();
  renderReplayFrame(Number(replaySlider.value));
});
replayExit.addEventListener("click", exitReplay);
replayPlay.addEventListener("click", toggleReplayPlay);
replayPrev.addEventListener("click", () => moveReplayFrame(-1));
replayNext.addEventListener("click", () => moveReplayFrame(1));
replaySpeed.addEventListener("change", () => {
  if (replayTimer !== undefined) {
    stopReplayPlay();
    toggleReplayPlay();
  }
});
replayFeatureSelect.addEventListener("change", () => replay && renderFeatureInspector(replay.frames[replay.index]));
replayFeatureComponent.addEventListener("change", () => replay && renderFeatureInspector(replay.frames[replay.index]));
document.addEventListener("keydown", (event) => {
  if (!replay || (event.target as HTMLElement | null)?.matches("input,select,textarea")) return;
  if (event.key === "ArrowLeft") moveReplayFrame(-1);
  if (event.key === "ArrowRight") moveReplayFrame(1);
  if (event.key === " ") { event.preventDefault(); toggleReplayPlay(); }
});

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

// 标签页：录制 / 回放。共享的 3D/相机/机械臂/夹爪面板在下方，随当前标签切换数据。
function switchTab(tab: "record" | "replay") {
  document.querySelectorAll(".tab").forEach((button) => {
    button.classList.toggle("active", button.getAttribute("data-tab") === tab);
  });
  const recordTab = document.querySelector<HTMLElement>("#tab-record");
  const replayTab = document.querySelector<HTMLElement>("#tab-replay");
  const layout = document.querySelector<HTMLElement>(".layout.grid-stack");
  if (recordTab) recordTab.style.display = tab === "record" ? "" : "none";
  if (replayTab) replayTab.style.display = tab === "replay" ? "" : "none";
  if (tab === "replay") {
    layout?.classList.add("replay-layout");
    grid.disable();
  } else {
    if (replay) exitReplay();
    layout?.classList.remove("replay-layout");
    grid.enable();
  }
}
document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => switchTab((button.getAttribute("data-tab") as "record" | "replay")));
});
