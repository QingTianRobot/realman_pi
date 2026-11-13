import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createViewerRenderer } from "./viewer-renderer";

// Live view of the two Pika trackers, beside the three-arm 3D window. The bridge sends
// `snapshot.pika.sides.<side>`; poses are drawn in the tracker's own frame (frame_id),
// which is not the robot world, so this is a separate scene with its own axes.
export type PikaSide = {
  state: "no_data" | "stale" | "live";
  pose_topic: string;
  frame_id: string;
  position_m: number[] | null;
  orientation_xyzw: number[] | null;
  pose_age_ms: number | null;
  speed_mps: number | null;
  command_topic: string;
  command_active: boolean;
  command_frame_id: string;
  command_linear_mps: number[] | null;
  command_angular_radps: number[] | null;
  command_age_ms: number | null;
};
export type PikaSnapshot = { sides: Record<string, PikaSide> };

const SIDE_COLORS: Record<string, number> = { l: 0x55a6ff, r: 0xf4bb63 };
const SIDE_LABELS: Record<string, string> = { l: "左 Pika", r: "右 Pika" };
const TRAIL_POINTS = 150;

type SideVisual = { marker: THREE.Mesh; axes: THREE.AxesHelper; trail: THREE.Line; points: THREE.Vector3[] };

function age(ms: number | null): string {
  if (ms === null) return "—";
  if (ms < 1000) return `${ms} ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)} s`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)} 分钟`;
  return `${(ms / 3_600_000).toFixed(1)} 小时`;
}

function norm(values: number[] | null): number | null {
  return values ? Math.hypot(...values) : null;
}

function triple(values: number[] | null): string {
  return values ? `[${values.map((value) => value.toFixed(3)).join(", ")}]` : "—";
}

export function initPikaView(viewer: HTMLElement, cards: HTMLElement, status: HTMLElement, overlay: HTMLElement, recenter: HTMLButtonElement | null) {
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let controls: OrbitControls | null = null;
  const visuals: Record<string, SideVisual> = {};
  // Follow the trackers until the operator orbits the view; "居中" resumes following.
  let follow = true;

  try {
    scene = new THREE.Scene();
    const view = createViewerRenderer(viewer.querySelector("canvas") as HTMLCanvasElement);
    const renderer = view.renderer;
    camera = new THREE.PerspectiveCamera(40, 1, 0.01, 100);
    camera.up.set(0, 0, 1);
    camera.position.set(0.45, -0.6, 1.35);
    controls = new OrbitControls(camera, view.canvas);
    controls.enableDamping = true;
    controls.target.set(0, 0, 1);
    controls.addEventListener("start", () => { follow = false; });
    scene.add(new THREE.HemisphereLight(0xe7f0ed, 0x263438, 2.5));
    const grid = new THREE.GridHelper(4, 40, 0x567078, 0x263b40);
    grid.rotation.x = Math.PI / 2;
    scene.add(grid, new THREE.AxesHelper(0.2));
    for (const [side, color] of Object.entries(SIDE_COLORS)) {
      const marker = new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 12), new THREE.MeshBasicMaterial({ color }));
      const axes = new THREE.AxesHelper(0.09);
      const trail = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 }));
      marker.visible = axes.visible = false;
      scene.add(marker, axes, trail);
      visuals[side] = { marker, axes, trail, points: [] };
    }
    const resize = () => {
      const box = viewer.getBoundingClientRect();
      if (!box.width || !box.height || !camera) return;
      renderer.setSize(box.width, box.height, false);
      camera.aspect = box.width / box.height;
      camera.updateProjectionMatrix();
    };
    new ResizeObserver(resize).observe(viewer);
    resize();
    let lastFrame = 0;
    const frame = (now: number) => {
      requestAnimationFrame(frame);
      if (document.hidden || !view.canvas.getClientRects().length || now - lastFrame < 33) return;
      lastFrame = now;
      controls!.update();
      renderer.render(scene!, camera!);
    };
    requestAnimationFrame(frame);
  } catch (error) {
    console.warn("Pika 3D initialization failed", error);
    scene = null;
  }
  recenter?.addEventListener("click", () => { follow = true; });

  function updateScene(sides: Record<string, PikaSide>) {
    if (!scene || !camera || !controls) return;
    const livePositions: THREE.Vector3[] = [];
    for (const [side, visual] of Object.entries(visuals)) {
      const data = sides[side];
      const shown = !!data?.position_m && data.state !== "no_data";
      visual.marker.visible = visual.axes.visible = shown;
      if (!shown) continue;
      const position = new THREE.Vector3(...(data.position_m as [number, number, number]));
      const [x, y, z, w] = data.orientation_xyzw ?? [0, 0, 0, 1];
      visual.marker.position.copy(position);
      visual.axes.position.copy(position);
      visual.axes.quaternion.set(x, y, z, w);
      // A stale side keeps its last pose, dimmed, so it is visibly not moving.
      (visual.marker.material as THREE.MeshBasicMaterial).opacity = data.state === "live" ? 1 : 0.3;
      (visual.marker.material as THREE.MeshBasicMaterial).transparent = data.state !== "live";
      if (data.state !== "live") continue;
      livePositions.push(position);
      const last = visual.points.at(-1);
      if (!last || last.distanceToSquared(position) > 1e-8) {
        visual.points.push(position.clone());
        if (visual.points.length > TRAIL_POINTS) visual.points.shift();
        visual.trail.geometry.setFromPoints(visual.points);
      }
    }
    if (follow && livePositions.length) {
      const center = livePositions.reduce((sum, item) => sum.add(item), new THREE.Vector3()).divideScalar(livePositions.length);
      const offset = camera.position.clone().sub(controls.target);
      controls.target.lerp(center, 0.2);
      camera.position.copy(controls.target).add(offset);
    }
  }

  function render(snapshot: PikaSnapshot | undefined) {
    const sides = snapshot?.sides ?? {};
    const names = Object.keys(sides);
    const states = names.map((side) => sides[side].state);
    const live = states.filter((state) => state === "live").length;
    viewer.dataset.pikaState = !names.length ? "unconfigured" : live === names.length ? "live" : live ? "partial" : states.includes("stale") ? "stale" : "no_data";
    status.textContent = !names.length ? "未配置" : `${live} / ${names.length} 在线`;
    const frames = [...new Set(names.map((side) => sides[side].frame_id).filter(Boolean))];
    const frameLabel = viewer.closest("section")?.querySelector("#pika-frame");
    if (frameLabel) frameLabel.textContent = frames.length ? `坐标系 ${frames.join(" / ")}` : "追踪器坐标系";

    if (!names.length) {
      overlay.textContent = "未配置 Pika 位姿话题（recording.yaml · pika_pose_topics）";
    } else if (!live) {
      const topics = names.map((side) => sides[side].pose_topic).join("、");
      overlay.innerHTML = states.includes("stale")
        ? `<div><b>Pika 位姿已停止更新</b><br>${topics} 超过 1 s 没有新数据，追踪器可能丢失定位。</div>`
        : `<div><b>暂无 Pika 位姿数据</b><br>等待 ${topics}<br>确认主机 tmux <code>pika</code> 已启动、追踪器已定位。</div>`;
    }
    overlay.hidden = live > 0;

    cards.innerHTML = names.map((side) => {
      const data = sides[side];
      const label = SIDE_LABELS[side] ?? side.toUpperCase();
      const badge = data.state === "live" ? "LIVE" : data.state === "stale" ? "STALE" : "NO DATA";
      let body: string;
      if (data.state === "no_data") {
        body = `<span class="pika-hint">未收到 ${data.pose_topic}</span>`;
      } else {
        const speed = data.speed_mps;
        body = `<span>位置 <b>${triple(data.position_m)}</b> m</span>`
          + `<span>速度 <b>${speed === null ? "—" : speed.toFixed(3)}</b> m/s</span>`
          + (data.state === "stale" ? `<span class="pika-hint">已 ${age(data.pose_age_ms)} 未更新（追踪器定位丢失？）</span>` : "");
      }
      const command = data.command_active
        ? `<span class="pika-teleop on">遥操作中 · 线 ${norm(data.command_linear_mps)!.toFixed(3)} m/s · 角 ${norm(data.command_angular_radps)!.toFixed(3)} rad/s</span>`
        : `<span class="pika-teleop" title="${data.command_topic || "未配置命令话题"} 无数据">遥操作未 START</span>`;
      return `<article class="pika-card ${data.state}" id="pika-${side}" style="--pika-color:#${(SIDE_COLORS[side] ?? 0x8793a8).toString(16).padStart(6, "0")}"><h4>${label}<span>${badge}</span></h4>${body}${command}</article>`;
    }).join("");
    updateScene(sides);
  }

  viewer.dataset.pikaState = "waiting";
  status.textContent = "等待快照";
  overlay.textContent = "等待录制服务快照…";
  return { render };
}
