import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import URDFLoader from "urdf-loader";

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
      return `<article class="arm-card ${arm.connected ? "connected" : ""}"><h4>${name.toUpperCase()} <span>${arm.connected ? "CONNECTED" : "OFFLINE"}</span></h4><div class="joint-list">${
        positions.length
          ? positions.map((value, index) => `<span>J${index + 1} <b>${(value * 180 / Math.PI).toFixed(1)}°</b></span>`).join("")
          : "<span>暂无关节数据</span>"
      }</div></article>`;
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
      card.innerHTML = `<div class="no-feed">等待视频帧…</div><span class="camera-label">${cameraName}</span><span class="camera-health">NO SIGNAL</span>`;
      previewsEl.append(card);
    }
    (card as HTMLElement).style.display = "block";
    const health = card.querySelector(".camera-health") as HTMLElement | null;
    const ageSec = cameras[cameraName] ? (Date.now() * 1e6 - cameras[cameraName]) / 1e9 : Infinity;
    if (health) health.textContent = ageSec < 3 ? `LIVE · ${ageSec.toFixed(1)}s` : "NO SIGNAL";
    if (!cameras[cameraName] || previewTimes[cameraName] === cameras[cameraName]) return;
    previewTimes[cameraName] = cameras[cameraName];
    const img = new Image();
    img.alt = `${cameraName} 低清预览`;
    img.onload = () => {
      card.querySelector(".no-feed")?.remove();
      card.querySelector("img")?.remove();
      card.prepend(img);
    };
    img.src = `/preview/${encodeURIComponent(cameraName)}.jpg?ts=${cameras[cameraName]}`;
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

function renderGrippers(grippers: NonNullable<Snapshot["grippers"]>) {
  const entries = Object.entries(grippers);
  if (!entries.length) return;
  grippersEl.innerHTML = entries.map(([topic, values]) => {
    const label = topic.split("/").filter(Boolean).slice(-2, -1)[0] ?? topic;
    const items = Object.entries(values).map(([key, value]) =>
      `<span>${key}<b>${typeof value === "boolean" ? (value ? "ON" : "OFF") : Number(value).toFixed(3)}</b></span>`
    ).join("");
    return `<article class="gripper-card"><h4>${label}</h4><div class="gripper-values">${items || "暂无数据"}</div></article>`;
  }).join("");
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
