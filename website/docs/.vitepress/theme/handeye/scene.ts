import type * as ThreeNS from "three";
import { CHAPTERS, DURATION, chapterAt, clamp01, lerp, smooth } from "./timeline";
import { createKinematics, type ArmRig } from "./kinematics";

// The three-arm hand-eye scene. It is built once from the generated layout (three-robots.json) and calibration
// contract (docs-data.json); apply(t) then draws the frame for time t. Nothing here keeps animation state, so
// seeking, scrubbing and the offline video export all see exactly the same pictures.

type Three = typeof ThreeNS;
export type ArmId = "l" | "m" | "r";
export const ARM_IDS: ArmId[] = ["l", "m", "r"];

export type Layout = {
  robots: { id: string; model: string; transform: { x: number; y: number; z: number; roll: number; pitch: number; yaw: number } }[];
  grippers?: Record<string, { urdf: string; drivingJoint: string; closedRad: number; openRad: number }>;
  endEffectors?: Record<string, { gripper: string; xyz: number[]; rpy: number[]; parentLink: string }>;
};
export type Calibration = {
  board: { dictionary: string; squaresX: number; squaresY: number; squareLengthM: number; markerLengthM: number; outerWidthM: number; outerHeightM: number; minimumCorners: number };
  arms: { id: string; baseFrame: string; endEffectorFrame: string; opticalFrame: string }[];
  minimumSamplesPerArm: number;
  handEyeMethod: string;
  maximumHandEyeResidual: number;
  maximumRelativeTranslationSpreadM: number;
  maximumRelativeRotationSpreadRad: number;
};
export type Pose = { x: number; y: number; z: number; roll: number; pitch: number; yaw: number };
export type FrameInfo = {
  chapter: number;
  samples: number;
  total: number;
  corners: { seen: number; total: number } | null;
  spreadCm: number | null;
  relative: { m: Pose; r: Pose } | null;
};
export type HandEyeScene = {
  apply: (t: number, pipArm: ArmId) => FrameInfo;
  resize: () => void;
  refreshTheme: () => void;
  events: () => { t: number; kind: string }[];
  sampleCount: number;
  stats: Record<string, { samples: number; attempts: number; failed: number; jumped: number; ready: boolean }>;
  dispose: () => void;
};
export type SceneOptions = {
  THREE: Three;
  URDFLoader: any;
  canvas: HTMLCanvasElement;
  overlay: HTMLCanvasElement;
  host: HTMLElement;
  base: string;
  layout: Layout;
  calibration: Calibration;
};

// The camera mount is illustrative: the real T_tool_camera is exactly what the calibration estimates.
const MOUNT = { position: [0, -0.075, 0.065], lookAt: [0, 0, 0.36] };
const HFOV = (62 * Math.PI) / 180;
const ASPECT = 4 / 3;
const FRUSTUM_DEPTH = 0.34;
const ARM_PAINT: Record<ArmId, number> = { l: 0x2c8c8f, m: 0xc76a3e, r: 0x6b7c83 };
const ARM_LINE: Record<ArmId, string> = { l: "#3aa6a8", m: "#d9783f", r: "#8b9ca3" };
const JOINTS = ["joint_1", "joint_2", "joint_3", "joint_4", "joint_5", "joint_6"];
const LEAD = 1.5; // seconds spent moving from the ready pose to the first sample pose
const STAR_SAMPLE = 11; // the sample pose the arms hold from chapter 4 on
const SAMPLE_START = CHAPTERS[2].start;
const SAMPLE_END = CHAPTERS[2].end;

const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export async function createHandEyeScene(options: SceneOptions): Promise<HandEyeScene> {
  const { THREE, URDFLoader, canvas, overlay, host, base, layout, calibration } = options;
  const kin = createKinematics(THREE);
  const V3 = THREE.Vector3;
  const M4 = THREE.Matrix4;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.autoClear = false;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 16 / 9, 0.02, 60);
  camera.up.set(0, 0, 1);
  camera.layers.enable(1);
  scene.add(new THREE.HemisphereLight(0xf6faf8, 0x354248, 2.6));
  const key = new THREE.DirectionalLight(0xffffff, 3.2);
  key.position.set(1.4, -2.4, 3.4);
  scene.add(key);
  const grid = new THREE.GridHelper(3, 30, 0x718087, 0x8c9aa0);
  grid.rotation.x = Math.PI / 2;
  grid.position.set(-0.7, 0.19, -0.002);
  (grid.material as ThreeNS.Material).transparent = true;
  (grid.material as ThreeNS.Material).opacity = 0.22;
  scene.add(grid);

  // ---------------------------------------------------------------------------------------------- theme
  const theme = { ink: "#e6edf0", muted: "#9aa8ad", bg: "#12181b", soft: "#1c2427", divider: "#2c373b", brand: "#5fb8be", accent: "#c85e35", mono: "monospace", sans: "sans-serif" };
  const refreshTheme = () => {
    const style = getComputedStyle(document.documentElement);
    const read = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
    theme.ink = read("--vp-c-text-1", theme.ink);
    theme.muted = read("--vp-c-text-2", theme.muted);
    theme.bg = read("--vp-c-bg", theme.bg);
    theme.soft = read("--vp-c-bg-soft", theme.soft);
    theme.divider = read("--vp-c-divider", theme.divider);
    theme.brand = read("--vp-c-brand-1", theme.brand);
    theme.accent = read("--rm-accent", theme.accent);
    theme.mono = read("--vp-font-family-mono", theme.mono);
    theme.sans = read("--vp-font-family-base", theme.sans);
  };
  refreshTheme();

  // ---------------------------------------------------------------------------------------------- arms
  const loader = new URDFLoader();
  loader.packages = { rm65_description: `${base}models/rm65_description` };
  const rigs = {} as Record<ArmId, ArmRig>;
  const roots = {} as Record<ArmId, any>;
  const grippers = {} as Record<ArmId, any>;
  const worlds = {} as Record<ArmId, ThreeNS.Matrix4>;
  const layoutById = new Map(layout.robots.map((robot) => [robot.id, robot]));
  const worldOf = (id: ArmId) => {
    const matrix = new M4();
    const config = layoutById.get(id)!.transform;
    matrix.compose(new V3(config.x, config.y, config.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(config.roll, config.pitch, config.yaw, "ZYX")), new V3(1, 1, 1));
    return matrix;
  };
  const world = new THREE.Group();
  scene.add(world);
  for (const id of ARM_IDS) {
    const config = layoutById.get(id)!;
    const arm = await loader.loadAsync(`${base}models/${config.model}.urdf`);
    arm.position.set(config.transform.x, config.transform.y, config.transform.z);
    arm.rotation.set(config.transform.roll, config.transform.pitch, config.transform.yaw, "ZYX");
    world.add(arm);
    roots[id] = arm;
    const mount = layout.endEffectors?.[id];
    const gripperDef = mount ? layout.grippers?.[mount.gripper] : undefined;
    if (mount && gripperDef) {
      const gripper = await loader.loadAsync(`${base}models/${gripperDef.urdf}`);
      gripper.position.set(mount.xyz[0], mount.xyz[1], mount.xyz[2]);
      gripper.rotation.set(mount.rpy[0], mount.rpy[1], mount.rpy[2], "ZYX");
      arm.links[mount.parentLink]?.add(gripper);
      gripper.setJointValue(gripperDef.drivingJoint, (gripperDef.closedRad + gripperDef.openRad) * 0.45);
      grippers[id] = gripper;
    }
    rigs[id] = {
      root: arm,
      link: arm.links.link_6,
      joints: JOINTS,
      lower: JOINTS.map((name) => arm.joints[name]?.limit?.lower ?? -3.1),
      upper: JOINTS.map((name) => arm.joints[name]?.limit?.upper ?? 3.1),
    };
  }
  world.updateMatrixWorld(true);
  // Wait for the STL meshes, then paint them. Grippers go on layer 1 so the simulated camera view never sees them.
  for (let attempt = 0; attempt < 200; attempt += 1) {
    let meshes = 0;
    let visuals = 0;
    world.traverse((object: any) => {
      if (object instanceof THREE.Mesh) meshes += 1;
      if (object.isURDFVisual) visuals += 1;
    });
    if (meshes >= visuals && meshes > 0) break;
    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }
  const armMaterials: ThreeNS.MeshStandardMaterial[] = [];
  const paint = (root: any, color: number, layer: number) => {
    root.traverse((object: any) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.material = new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.58 });
      armMaterials.push(object.material);
      object.layers.set(layer);
    });
  };
  for (const id of ARM_IDS) {
    paint(roots[id], ARM_PAINT[id], 0);
    if (grippers[id]) paint(grippers[id], 0x46555b, 1);
  }

  // ---------------------------------------------------------------------------------------------- board
  const baseOrigins = ARM_IDS.map((id) => new V3(layoutById.get(id)!.transform.x, layoutById.get(id)!.transform.y, layoutById.get(id)!.transform.z));
  const centroid = baseOrigins.reduce((sum, point) => sum.add(point), new V3()).multiplyScalar(1 / 3);
  const boardCenter = centroid.clone().add(new V3(0.88, -0.044, 0.30));
  // Board frame as OpenCV sees it: x to the viewer's right, y down, z into the board (away from the arms).
  const boardWorld = new M4().makeBasis(new V3(0, -1, 0), new V3(0, 0, -1), new V3(1, 0, 0)).setPosition(boardCenter);
  const board = calibration.board;
  const patternWidth = board.squaresX * board.squareLengthM;
  const patternHeight = board.squaresY * board.squareLengthM;
  const boardTexture = (() => {
    const cell = 64;
    const surface = document.createElement("canvas");
    surface.width = board.squaresX * cell;
    surface.height = board.squaresY * cell;
    const context = surface.getContext("2d")!;
    context.fillStyle = "#f7f8f6";
    context.fillRect(0, 0, surface.width, surface.height);
    const random = mulberry32(5);
    const inset = (cell * (1 - board.markerLengthM / board.squareLengthM)) / 2;
    for (let row = 0; row < board.squaresY; row += 1) {
      for (let column = 0; column < board.squaresX; column += 1) {
        const x = column * cell;
        const y = row * cell;
        context.fillStyle = "#14191b";
        if ((row + column) % 2 === 1) {
          context.fillRect(x, y, cell, cell);
        } else {
          // White squares carry a marker: a black block with a pseudo-random 3x3 pattern.
          context.fillRect(x + inset, y + inset, cell - 2 * inset, cell - 2 * inset);
          context.fillStyle = "#f7f8f6";
          const bit = (cell - 2 * inset) / 5;
          for (let i = 0; i < 3; i += 1) {
            for (let j = 0; j < 3; j += 1) {
              if (random() > 0.5) context.fillRect(x + inset + (1 + i) * bit, y + inset + (1 + j) * bit, bit, bit);
            }
          }
        }
      }
    }
    const texture = new THREE.CanvasTexture(surface);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  })();
  const boardGroup = new THREE.Group();
  boardGroup.matrixAutoUpdate = false;
  boardGroup.matrix.copy(boardWorld);
  const boardFlip = new THREE.Group();
  boardFlip.rotation.x = Math.PI; // plane faces local +z; the viewer sees the -z side
  const frameMesh = new THREE.Mesh(new THREE.PlaneGeometry(board.outerWidthM, board.outerHeightM), new THREE.MeshBasicMaterial({ color: 0xf7f8f6 }));
  frameMesh.position.z = -0.0005;
  const patternMesh = new THREE.Mesh(new THREE.PlaneGeometry(patternWidth, patternHeight), new THREE.MeshBasicMaterial({ map: boardTexture, side: THREE.DoubleSide }));
  boardFlip.add(frameMesh, patternMesh);
  const boardAxes = new THREE.AxesHelper(0.06);
  boardAxes.layers.set(1);
  boardGroup.add(boardFlip, boardAxes);
  scene.add(boardGroup);
  const stand = new THREE.Group();
  const standMaterial = new THREE.MeshStandardMaterial({ color: 0x46555b, metalness: 0.2, roughness: 0.6 });
  const standHeight = boardCenter.z - board.outerHeightM / 2;
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, standHeight, 14), standMaterial);
  pole.rotation.x = Math.PI / 2;
  pole.position.set(boardCenter.x + 0.012, boardCenter.y, standHeight / 2);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.01, 28), standMaterial);
  foot.rotation.x = Math.PI / 2;
  foot.position.set(boardCenter.x + 0.012, boardCenter.y, 0.005);
  stand.add(pole, foot);
  scene.add(stand);
  // Inner ChArUco corners in the board frame: what the detector reports to solvePnP.
  const innerCorners: ThreeNS.Vector3[] = [];
  for (let row = 1; row < board.squaresY; row += 1) {
    for (let column = 1; column < board.squaresX; column += 1) {
      innerCorners.push(new V3(column * board.squareLengthM - patternWidth / 2, row * board.squareLengthM - patternHeight / 2, 0));
    }
  }

  // ---------------------------------------------------------------------------------------------- camera mount
  const mountPosition = new V3(...(MOUNT.position as [number, number, number]));
  const mountZ = new V3(...(MOUNT.lookAt as [number, number, number])).sub(mountPosition).normalize();
  const mountX = new V3(1, 0, 0);
  const mountY = new V3().crossVectors(mountZ, mountX).normalize();
  const mountMatrix = new M4().makeBasis(mountX, mountY, mountZ).setPosition(mountPosition); // T_link6_camera (optical frame)
  const mountInverse = mountMatrix.clone().invert();

  const makeFrustum = (color: string, depth: number) => {
    const w = Math.tan(HFOV / 2) * depth;
    const h = w / ASPECT;
    const corners = [new V3(-w, -h, depth), new V3(w, -h, depth), new V3(w, h, depth), new V3(-w, h, depth)];
    const points: ThreeNS.Vector3[] = [];
    corners.forEach((corner, index) => {
      points.push(new V3(), corner, corner, corners[(index + 1) % 4]);
    });
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8, depthTest: false });
    const lines = new THREE.LineSegments(geometry, material);
    lines.renderOrder = 4;
    lines.layers.set(1);
    return lines;
  };
  const cameraNodes = {} as Record<ArmId, { group: ThreeNS.Group; frustum: ThreeNS.LineSegments; guess: ThreeNS.Group }>;
  for (const id of ARM_IDS) {
    const group = new THREE.Group();
    group.matrixAutoUpdate = false;
    group.matrix.copy(mountMatrix);
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.026, 0.026), new THREE.MeshStandardMaterial({ color: 0x1a2124, metalness: 0.3, roughness: 0.5 }));
    body.position.z = -0.012;
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.01, 18), new THREE.MeshStandardMaterial({ color: 0x6a7a80 }));
    lens.rotation.x = Math.PI / 2;
    lens.position.z = 0.003;
    const axes = new THREE.AxesHelper(0.05);
    (axes.material as ThreeNS.Material).depthTest = false;
    axes.renderOrder = 5;
    const frustum = makeFrustum(ARM_LINE[id], FRUSTUM_DEPTH);
    [body, lens, axes].forEach((object) => object.layers.set(1));
    group.add(body, lens, axes, frustum);
    rigs[id].link.add(group);
    // The "guess" camera used in chapter 4: a wire box that starts away from the true mount and slides onto it.
    const guess = new THREE.Group();
    guess.matrixAutoUpdate = false;
    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(0.05, 0.026, 0.026)),
      new THREE.LineBasicMaterial({ color: 0xc85e35, depthTest: false, transparent: true }),
    );
    wire.position.z = -0.012;
    wire.renderOrder = 6;
    const guessAxes = new THREE.AxesHelper(0.06);
    (guessAxes.material as ThreeNS.Material).depthTest = false;
    guessAxes.renderOrder = 6;
    [wire, guessAxes].forEach((object) => object.layers.set(1));
    guess.add(wire, guessAxes);
    rigs[id].link.add(guess);
    cameraNodes[id] = { group, frustum, guess };
  }

  const pipCamera = new THREE.PerspectiveCamera((2 * Math.atan(Math.tan(HFOV / 2) / ASPECT) * 180) / Math.PI, ASPECT, 0.03, 8);
  pipCamera.matrixAutoUpdate = false;
  const flipX = new M4().makeRotationX(Math.PI);

  // ---------------------------------------------------------------------------------------------- samples
  const random = mulberry32(65);
  const ready = {} as Record<ArmId, number[]>;
  const samples = {} as Record<ArmId, number[][]>;
  const toolMatrices = {} as Record<ArmId, ThreeNS.Matrix4[]>;
  const cameraBoard = {} as Record<ArmId, ThreeNS.Matrix4[]>;
  // Camera spots sit between each base and the board; the middle arm faces away (yaw ~ pi), so keep it off the
  // thin sliver straight behind its base that joint_1 cannot reach.
  const lateral: Record<ArmId, number> = { l: -0.06, m: -0.015, r: 0.096 };
  const spread: Record<ArmId, number> = { l: 0.14, m: 0.07, r: 0.14 };
  const stats: HandEyeScene["stats"] = {};
  const targetFor = (id: ArmId, depth: number, du: number, dv: number, roll: number, jitter: [number, number]) => {
    const position = new V3(boardCenter.x - depth, boardCenter.y + lateral[id] + du, boardCenter.z + dv);
    const lookAt = new V3(boardCenter.x, boardCenter.y + jitter[0], boardCenter.z + jitter[1]);
    const z = lookAt.clone().sub(position).normalize();
    const y0 = new V3(0, 0, -1).addScaledVector(z, z.z).normalize();
    const x0 = new V3().crossVectors(y0, z).normalize();
    const x = x0.clone().multiplyScalar(Math.cos(roll)).addScaledVector(y0, Math.sin(roll));
    const y = y0.clone().multiplyScalar(Math.cos(roll)).addScaledVector(x0, -Math.sin(roll));
    const cameraWorld = new M4().makeBasis(x, y, z).setPosition(position);
    return cameraWorld.multiply(mountInverse); // wanted pose of link_6
  };
  // Multi-start seeds: joint_1 points at the target (in the arm's own frame), the rest sweeps elbow/wrist branches.
  const seeds = (id: ArmId, target: ThreeNS.Matrix4) => {
    const local = new V3().setFromMatrixPosition(target).applyMatrix4(worldOf(id).invert());
    const heading = Math.atan2(local.y, local.x);
    const first = Math.max(-3.05, Math.min(3.05, heading));
    const out: number[][] = [];
    for (const q2 of [-1, -0.3, 0.5]) for (const q3 of [-2, -1, 1, 2]) for (const q5 of [-1.3, 1.3]) out.push([first, q2, q3, 0.1, q5, 0.2]);
    return out;
  };
  for (const id of ARM_IDS) {
    // Ready pose: farther back, centred. Try several seeds so each arm settles into a sensible elbow.
    const readyTarget = targetFor(id, 0.5, 0, 0.06, 0, [0, 0]);
    let best: { q: number[]; ok: boolean; positionError: number; rotationError: number } | null = null;
    for (const seed of seeds(id, readyTarget)) {
      const result = kin.solve(rigs[id], readyTarget, seed, 120);
      if (!best || result.positionError + result.rotationError < best.positionError + best.rotationError) best = result;
      if (result.ok) break;
    }
    ready[id] = best!.q;
    stats[id] = { samples: 0, attempts: 0, failed: 0, jumped: 0, ready: best!.ok };
    samples[id] = [];
    toolMatrices[id] = [];
    cameraBoard[id] = [];
    let previous: number[] | null = best!.ok ? ready[id] : null;
    const wanted = calibration.minimumSamplesPerArm;
    for (let attempt = 0; attempt < wanted * 40 && samples[id].length < wanted; attempt += 1) {
      const depth = 0.3 + random() * 0.13;
      const target = targetFor(id, depth, (random() - 0.5) * spread[id], (random() - 0.5) * 0.12, (random() - 0.5) * 0.7, [(random() - 0.5) * 0.04, (random() - 0.5) * 0.04]);
      let result = kin.solve(rigs[id], target, previous ?? seeds(id, target)[0]);
      if (!result.ok) {
        // Warm start lost the branch: retry from a few multi-start seeds, keeping the solution closest to the previous pose.
        let closest: typeof result | null = null;
        for (const seed of seeds(id, target).filter((_, index) => index % 3 === 0)) {
          const candidate = kin.solve(rigs[id], target, seed, 90);
          if (!candidate.ok) continue;
          if (!previous) { closest = candidate; break; }
          const distance = Math.max(...candidate.q.map((value, index) => Math.abs(value - previous![index])));
          if (!closest || distance < Math.max(...closest.q.map((value, index) => Math.abs(value - previous![index])))) closest = candidate;
        }
        if (closest) result = closest;
      }
      const jump = previous ? Math.max(...result.q.map((value, index) => Math.abs(value - previous![index]))) : 0;
      stats[id].attempts += 1;
      if (!result.ok) { stats[id].failed += 1; continue; }
      if (jump > 1.6) { stats[id].jumped += 1; continue; }
      stats[id].samples += 1;
      samples[id].push(result.q);
      const tool = kin.forward(rigs[id], result.q);
      toolMatrices[id].push(tool);
      cameraBoard[id].push(tool.clone().multiply(mountMatrix).invert().multiply(boardWorld));
      previous = result.q;
    }
    // No reachable ready pose of its own: start from the first sample pose instead.
    if (!best!.ok && samples[id].length) ready[id] = samples[id][0];
    await new Promise((resolve) => window.setTimeout(resolve, 0));
  }
  const total = Math.min(...ARM_IDS.map((id) => samples[id].length));
  const star = Math.min(STAR_SAMPLE, total - 1);
  const slot = (SAMPLE_END - SAMPLE_START - LEAD) / Math.max(total, 1);

  // ---------------------------------------------------------------------------------------------- ghosts
  const ghostGeometry = new THREE.BufferGeometry().setFromPoints([
    new V3(-board.outerWidthM / 2, -board.outerHeightM / 2, 0),
    new V3(board.outerWidthM / 2, -board.outerHeightM / 2, 0),
    new V3(board.outerWidthM / 2, board.outerHeightM / 2, 0),
    new V3(-board.outerWidthM / 2, board.outerHeightM / 2, 0),
  ]);
  const ghosts = {} as Record<ArmId, ThreeNS.LineLoop[]>;
  for (const id of ARM_IDS) {
    ghosts[id] = [];
    const material = new THREE.LineBasicMaterial({ color: ARM_LINE[id], transparent: true, opacity: 0.85, depthTest: false });
    for (let index = 0; index < total; index += 1) {
      const outline = new THREE.LineLoop(ghostGeometry, material);
      outline.matrixAutoUpdate = false;
      outline.renderOrder = 3;
      outline.visible = false;
      outline.layers.set(1);
      scene.add(outline);
      ghosts[id].push(outline);
    }
  }
  const DELTA = { t: new V3(0.045, -0.03, 0.04), axis: new V3(1, 0.6, 0.3).normalize(), angle: 0.2 };

  // ---------------------------------------------------------------------------------------------- views
  type View = { t: number; target: [number, number, number]; r: number; az: number; el: number };
  const mid = new V3(centroid.x + 0.3, centroid.y, 0.25);
  const front = boardCenter.clone().add(new V3(-0.4, 0, -0.02));
  const views: View[] = [
    { t: 0, target: [mid.x - 0.3, mid.y, 0.36], r: 2.7, az: 205, el: 18 },
    { t: 11, target: [mid.x - 0.3, mid.y, 0.36], r: 2.5, az: 190, el: 16 },
    { t: 15, target: [front.x - 0.05, front.y, 0.3], r: 1.25, az: 28, el: 14 },
    { t: 25, target: [front.x - 0.05, front.y, 0.3], r: 1.2, az: 52, el: 12 },
    { t: 28, target: [front.x - 0.1, front.y, 0.3], r: 1.6, az: 34, el: 16 },
    { t: 51, target: [front.x - 0.1, front.y, 0.3], r: 1.5, az: 66, el: 14 },
    { t: 54, target: [front.x + 0.1, front.y, 0.3], r: 1.2, az: 28, el: 12 },
    { t: 71, target: [front.x + 0.1, front.y, 0.3], r: 1.1, az: 52, el: 10 },
    { t: 74, target: [front.x - 0.1, front.y, 0.3], r: 1.55, az: 30, el: 16 },
    { t: 85, target: [front.x - 0.1, front.y, 0.3], r: 1.5, az: 52, el: 14 },
    { t: 88, target: [mid.x - 0.25, mid.y, 0.1], r: 2.1, az: 270, el: 70 },
    { t: 104, target: [mid.x - 0.25, mid.y, 0.1], r: 2.0, az: 270, el: 78 },
  ];
  const viewAt = (t: number) => {
    let index = 0;
    while (index < views.length - 2 && t >= views[index + 1].t) index += 1;
    const a = views[index];
    const b = views[index + 1];
    const k = smooth((t - a.t) / Math.max(b.t - a.t, 1e-6));
    return {
      target: a.target.map((value, i) => lerp(value, b.target[i], k)) as [number, number, number],
      r: lerp(a.r, b.r, k),
      az: lerp(a.az, b.az, k),
      el: lerp(a.el, b.el, k),
    };
  };

  // ---------------------------------------------------------------------------------------------- poses over time
  const lerpQ = (a: number[], b: number[], k: number) => a.map((value, i) => lerp(value, b[i], k));
  const HOME = [0, 0, 0, 0, 0, 0];
  const poseAt = (id: ArmId, t: number): number[] => {
    if (t < SAMPLE_START) {
      const sway = Math.sin(t * 0.9 + ARM_IDS.indexOf(id)) * 0.035;
      const raised = lerpQ(HOME, ready[id], smooth((t - CHAPTERS[1].start) / 4.5));
      return raised.map((value, i) => (i === 0 || i === 3 || i === 5 ? value + sway * (i === 3 ? 1.6 : 1) : value));
    }
    if (t < SAMPLE_END) {
      const local = t - SAMPLE_START;
      if (local < LEAD) return lerpQ(ready[id], samples[id][0], smooth(local / LEAD));
      const position = (local - LEAD) / slot;
      const index = Math.min(total - 1, Math.floor(position));
      const within = position - index;
      const from = index === 0 ? samples[id][0] : samples[id][index - 1];
      return lerpQ(from, samples[id][index], index === 0 ? 1 : smooth(within / 0.62));
    }
    const settle = smooth((t - SAMPLE_END) / 1.6);
    return lerpQ(samples[id][total - 1], samples[id][star], settle);
  };
  const capturedAt = (t: number) => {
    if (t < SAMPLE_START + LEAD) return 0;
    const position = (Math.min(t, SAMPLE_END) - SAMPLE_START - LEAD) / slot;
    const index = Math.floor(position);
    return Math.min(total, index + (position - index >= 0.8 ? 1 : 0));
  };

  const events = () => {
    const list: { t: number; kind: string }[] = CHAPTERS.map((chapter) => ({ t: chapter.start, kind: "chapter" }));
    for (let index = 0; index < total; index += 1) list.push({ t: SAMPLE_START + LEAD + (index + 0.8) * slot, kind: "capture" });
    list.push({ t: CHAPTERS[3].start + 0.12 * 20 + 0.62 * 20 * 0.55, kind: "converge" });
    return list.sort((a, b) => a.t - b.t);
  };

  // ---------------------------------------------------------------------------------------------- overlay helpers
  const overlayContext = overlay.getContext("2d")!;
  let width = 1;
  let height = 1;
  const projected = new V3();
  const screen = (point: ThreeNS.Vector3) => {
    projected.copy(point).project(camera);
    return { x: ((projected.x + 1) / 2) * width, y: ((1 - projected.y) / 2) * height, front: projected.z < 1 && projected.z > -1 };
  };
  const unit = () => Math.max(11, Math.min(width / 68, 24));
  const drawLine = (a: ThreeNS.Vector3, b: ThreeNS.Vector3, color: string, options: { dash?: boolean; widthPx?: number; alpha?: number; progress?: number; arrow?: boolean } = {}) => {
    const k = options.progress ?? 1;
    if (k <= 0) return;
    const p = screen(a);
    const q = screen(new V3().lerpVectors(a, b, k));
    const c = overlayContext;
    c.save();
    c.globalAlpha = options.alpha ?? 1;
    c.strokeStyle = color;
    c.fillStyle = color;
    c.lineWidth = options.widthPx ?? Math.max(1.5, unit() / 6);
    if (options.dash) c.setLineDash([unit() * 0.5, unit() * 0.4]);
    c.beginPath();
    c.moveTo(p.x, p.y);
    c.lineTo(q.x, q.y);
    c.stroke();
    if (options.arrow) {
      const angle = Math.atan2(q.y - p.y, q.x - p.x);
      const size = unit() * 0.9;
      c.setLineDash([]);
      c.beginPath();
      c.moveTo(q.x, q.y);
      c.lineTo(q.x - size * Math.cos(angle - 0.4), q.y - size * Math.sin(angle - 0.4));
      c.lineTo(q.x - size * Math.cos(angle + 0.4), q.y - size * Math.sin(angle + 0.4));
      c.closePath();
      c.fill();
    }
    c.restore();
  };
  const drawLabel = (point: ThreeNS.Vector3, text: string, color: string, options: { dx?: number; dy?: number; alpha?: number; mono?: boolean } = {}) => {
    const { x, y } = screen(point);
    const c = overlayContext;
    const size = unit();
    c.save();
    c.globalAlpha = options.alpha ?? 1;
    c.font = `${options.mono === false ? "" : "600 "}${size}px ${options.mono === false ? theme.sans : theme.mono}`;
    const textWidth = c.measureText(text).width;
    const px = x + (options.dx ?? 0) * size - textWidth / 2;
    const py = y + (options.dy ?? 0) * size;
    c.fillStyle = theme.bg;
    c.globalAlpha = (options.alpha ?? 1) * 0.86;
    c.fillRect(px - size * 0.4, py - size * 0.95, textWidth + size * 0.8, size * 1.55);
    c.globalAlpha = options.alpha ?? 1;
    c.strokeStyle = color;
    c.lineWidth = 1;
    c.strokeRect(px - size * 0.4, py - size * 0.95, textWidth + size * 0.8, size * 1.55);
    c.fillStyle = theme.ink;
    c.fillText(text, px, py);
    c.restore();
  };
  const dot = (point: ThreeNS.Vector3, color: string, radius = 0.32, alpha = 1) => {
    const { x, y } = screen(point);
    const c = overlayContext;
    c.save();
    c.globalAlpha = alpha;
    c.fillStyle = color;
    c.beginPath();
    c.arc(x, y, unit() * radius, 0, Math.PI * 2);
    c.fill();
    c.restore();
  };
  const origin = (matrix: ThreeNS.Matrix4) => new V3().setFromMatrixPosition(matrix);

  // ---------------------------------------------------------------------------------------------- relative poses
  ARM_IDS.forEach((id) => { worlds[id] = worldOf(id); });
  const relativePose = (id: ArmId): Pose => {
    const relative = worlds.l.clone().invert().multiply(worlds[id]);
    const euler = new THREE.Euler().setFromRotationMatrix(relative, "ZYX");
    const position = origin(relative);
    return { x: position.x, y: position.y, z: position.z, roll: euler.x, pitch: euler.y, yaw: euler.z };
  };
  const relative = { m: relativePose("m"), r: relativePose("r") };

  // ---------------------------------------------------------------------------------------------- frame
  const resize = () => {
    const rect = host.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    width = rect.width;
    height = rect.height;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const ratio = Math.min(window.devicePixelRatio, 2);
    overlay.width = Math.round(width * ratio);
    overlay.height = Math.round(height * ratio);
    overlayContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const deltaAt = (s: number) => new M4().makeTranslation(DELTA.t.x * s, DELTA.t.y * s, DELTA.t.z * s).multiply(new M4().makeRotationAxis(DELTA.axis, DELTA.angle * s));
  const guessScale = (t: number) => {
    const u = (t - CHAPTERS[3].start) / (CHAPTERS[3].end - CHAPTERS[3].start);
    const v = clamp01((u - 0.12) / 0.6);
    return (1 - smooth(v)) * (1 - smooth(v));
  };

  const apply = (t: number, pipArm: ArmId): FrameInfo => {
    const chapter = chapterAt(t);
    const local = t - CHAPTERS[chapter].start;
    for (const id of ARM_IDS) kin.setPose(rigs[id], poseAt(id, t));
    world.updateMatrixWorld(true);
    const captured = capturedAt(t);

    // Board and per-chapter visibility.
    const boardIn = smooth((t - CHAPTERS[1].start) / 1.2);
    boardGroup.visible = boardIn > 0.001;
    stand.visible = boardGroup.visible;
    stand.scale.set(1, 1, 1);
    boardGroup.scale.setScalar(Math.max(boardIn, 0.001));
    const frustumOn = chapter === 1 ? smooth((t - 15) / 1.5) : chapter === 2 ? 1 - smooth((t - (SAMPLE_END - 2)) / 2) : 0;
    ARM_IDS.forEach((id) => {
      cameraNodes[id].frustum.visible = frustumOn > 0.01;
      (cameraNodes[id].frustum.material as ThreeNS.LineBasicMaterial).opacity = (id === pipArm ? 0.85 : 0.3) * frustumOn;
      cameraNodes[id].group.visible = t >= CHAPTERS[1].start + 0.5;
    });

    // Arms turn translucent from chapter 4 so the lines and ghost boards stay readable.
    const armAlpha = t < CHAPTERS[3].start ? 1 : t < CHAPTERS[4].start ? lerp(1, 0.5, smooth(t - CHAPTERS[3].start)) : t < CHAPTERS[5].start ? lerp(0.5, 0.36, smooth(t - CHAPTERS[4].start)) : lerp(0.36, 0.14, smooth(t - CHAPTERS[5].start));
    armMaterials.forEach((material) => {
      const transparent = armAlpha < 0.999;
      if (material.transparent !== transparent) material.needsUpdate = true;
      material.transparent = transparent;
      material.opacity = armAlpha;
      material.depthWrite = armAlpha > 0.95;
    });

    // Chapter 4: guessed X, and the boards each sample implies.
    const s = chapter === 3 ? guessScale(t) : chapter >= 4 ? 0 : 0;
    const guessOn = chapter === 3;
    const spreads: number[] = [];
    ARM_IDS.forEach((id) => {
      cameraNodes[id].guess.visible = guessOn;
      if (guessOn) {
        cameraNodes[id].guess.matrix.copy(mountMatrix).multiply(deltaAt(s));
        cameraNodes[id].guess.matrixWorldNeedsUpdate = true;
      }
      ghosts[id].forEach((outline, index) => {
        outline.visible = guessOn && index < total;
        if (!outline.visible) return;
        const tool = toolMatrices[id][index];
        const predicted = tool.clone().multiply(mountMatrix).multiply(deltaAt(s)).multiply(cameraBoard[id][index]);
        outline.matrix.copy(predicted);
        outline.matrixWorldNeedsUpdate = true;
        if (index < total) spreads.push(origin(predicted).distanceToSquared(boardCenter));
      });
    });
    const spreadCm = guessOn && spreads.length ? Math.sqrt(spreads.reduce((sum, value) => sum + value, 0) / spreads.length) * 100 : null;
    world.updateMatrixWorld(true);
    scene.updateMatrixWorld(true);

    // Main camera.
    const view = viewAt(t);
    const azimuth = (view.az * Math.PI) / 180;
    const elevation = (view.el * Math.PI) / 180;
    camera.position.set(
      view.target[0] + view.r * Math.cos(elevation) * Math.cos(azimuth),
      view.target[1] + view.r * Math.cos(elevation) * Math.sin(azimuth),
      view.target[2] + view.r * Math.sin(elevation),
    );
    camera.lookAt(view.target[0], view.target[1], view.target[2]);
    camera.updateMatrixWorld(true);

    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.render(scene, camera);

    // Picture-in-picture: what the chosen arm's camera sees (grippers and overlays are on layer 1, so hidden).
    const pipOpacity = chapter === 1 ? smooth((t - 17) / 1.2) : chapter === 2 ? 1 - smooth((t - (SAMPLE_END - 1.5)) / 1.2) : 0;
    let corners: FrameInfo["corners"] = null;
    const pip = { w: Math.max(140, width * 0.27), h: 0, x: 0, y: 0 };
    pip.h = pip.w / ASPECT;
    pip.x = width - pip.w - unit() * 0.8;
    pip.y = unit() * 0.8;
    if (pipOpacity > 0.01) {
      const tool = new M4().copy(rigs[pipArm].link.matrixWorld);
      pipCamera.matrix.copy(tool.multiply(mountMatrix).multiply(flipX));
      pipCamera.matrixWorldNeedsUpdate = true;
      pipCamera.updateMatrixWorld(true);
      renderer.setScissorTest(true);
      renderer.setViewport(pip.x, height - pip.y - pip.h, pip.w, pip.h);
      renderer.setScissor(pip.x, height - pip.y - pip.h, pip.w, pip.h);
      renderer.setClearColor(new THREE.Color(theme.soft), 1);
      renderer.clear();
      renderer.render(scene, pipCamera);
      renderer.setScissorTest(false);
      renderer.setClearColor(0x000000, 0);
      let seen = 0;
      const cameraSpace = new V3();
      innerCorners.forEach((corner) => {
        cameraSpace.copy(corner).applyMatrix4(boardWorld).project(pipCamera);
        if (Math.abs(cameraSpace.x) <= 1 && Math.abs(cameraSpace.y) <= 1 && cameraSpace.z < 1) seen += 1;
      });
      corners = { seen, total: innerCorners.length };
    }

    // Overlay.
    const c = overlayContext;
    c.clearRect(0, 0, width, height);
    c.textBaseline = "alphabetic";
    const size = unit();
    const baseOf = (id: ArmId) => origin(worlds[id]);

    const bases = ARM_IDS.map((id) => baseOf(id).clone().add(new V3(0, 0, 0.012)));
    const baseOfId = (id: ArmId) => bases[ARM_IDS.indexOf(id)];
    const baseTag = (id: ArmId, alpha: number, row = 1.9) => {
      dot(baseOfId(id), ARM_LINE[id], 0.4, alpha);
      drawLabel(baseOfId(id).clone().add(new V3(0, 0, -0.03)), id, ARM_LINE[id], { alpha, dy: row });
    };

    if (chapter === 0) {
      const appear = smooth(local / 1.5);
      ARM_IDS.forEach((id) => baseTag(id, appear));
      const pulse = 0.65 + 0.35 * Math.sin(t * 3);
      const pair = (a: ArmId, b: ArmId, text: string, k: number, lift: number) => {
        drawLine(baseOfId(a), baseOfId(b), theme.accent, { dash: true, alpha: 0.85 * k });
        drawLabel(new V3().lerpVectors(baseOfId(a), baseOfId(b), 0.5).add(new V3(0, 0, lift)), text, theme.accent, { alpha: k * pulse, dy: -0.3 });
      };
      pair("l", "m", "l → m ?", smooth((local - 4) / 1.2), 0.45);
      pair("l", "r", "l → r ?", smooth((local - 5.5) / 1.2), 0.7);
    } else if (chapter === 1) {
      const tool = origin(rigs.l.link.matrixWorld);
      const cameraPoint = origin(new M4().copy(rigs.l.link.matrixWorld).multiply(mountMatrix));
      drawLine(tool, cameraPoint, theme.accent, { widthPx: Math.max(2, size / 4), alpha: smooth((local - 7) / 1.2), dash: true });
      drawLabel(cameraPoint.clone().add(new V3(0, 0, 0.07)), "T_tool_camera = ?", theme.accent, { alpha: smooth((local - 7.5) / 1.2), dy: -0.2 });
      drawLabel(tool.clone().add(new V3(0, 0, -0.07)), "link_6", theme.brand, { alpha: smooth((local - 3) / 1.2), dy: 1.7 });
      drawLabel(boardCenter.clone().add(new V3(0, 0, board.outerHeightM / 2 + 0.045)), "ChArUco 板（固定）", theme.ink, { alpha: smooth((local - 3.5) / 1.2), dy: -0.3 });
      ARM_IDS.forEach((id) => drawLabel(origin(rigs[id].link.matrixWorld).clone().add(new V3(0, 0, 0.09)), id, ARM_LINE[id], { alpha: smooth((local - 1) / 1.2), dy: -0.4 }));
    } else if (chapter === 2) {
      const flashPhase = (() => {
        const position = (t - SAMPLE_START - LEAD) / slot;
        const within = position - Math.floor(position);
        return position > 0 && position < total && within >= 0.8 ? 1 - (within - 0.8) / 0.2 : 0;
      })();
      if (flashPhase > 0) {
        ARM_IDS.forEach((id) => drawLine(origin(new M4().copy(rigs[id].link.matrixWorld).multiply(mountMatrix)), boardCenter, ARM_LINE[id], { alpha: 0.9 * flashPhase, widthPx: Math.max(2, size / 4) }));
      }
      if (local > 5) {
        const k = smooth((local - 5) / 1.5);
        const toolL = origin(rigs.l.link.matrixWorld);
        const camL = origin(new M4().copy(rigs.l.link.matrixWorld).multiply(mountMatrix));
        drawLine(baseOfId("l"), toolL, theme.brand, { alpha: 0.9 * k, arrow: true });
        drawLabel(new V3().lerpVectors(baseOfId("l"), toolL, 0.5), "T_base_tool (TF)", theme.brand, { alpha: k, dx: 4.6, dy: 0 });
        drawLine(camL, boardCenter, theme.muted, { alpha: 0.85 * k, dash: true, arrow: true });
        drawLabel(new V3().lerpVectors(camL, boardCenter, 0.55), "T_camera_board (PnP)", theme.muted, { alpha: k, dy: -1.3 });
      }
    } else if (chapter === 3) {
      drawLabel(boardCenter.clone().add(new V3(0, 0, board.outerHeightM / 2 + 0.05)), "板的真实位置", theme.ink, { alpha: smooth(local / 1.2), dx: -3.2, dy: -0.8 });
      drawLabel(origin(new M4().copy(rigs.l.link.matrixWorld).multiply(mountMatrix.clone().multiply(deltaAt(s)))).add(new V3(0, 0, 0.07)), "猜测的 X", theme.accent, { alpha: smooth(local / 1.2), dx: 2.6, dy: -1.4 });
    } else if (chapter === 4) {
      // One arm at a time walks the chain; finished chains stay as dim lines.
      const slotLen = 4;
      ARM_IDS.forEach((id, order) => {
        const mine = local - order * slotLen;
        if (mine < 0) return;
        const active = mine < slotLen;
        const dim = active ? 1 : 0.35;
        const k0 = smooth(mine / 1.1);
        const k1 = smooth((mine - 1.1) / 1.1);
        const k2 = smooth((mine - 2.2) / 1.1);
        const toolP = origin(toolMatrices[id][star]);
        const camP = origin(toolMatrices[id][star].clone().multiply(mountMatrix));
        drawLine(baseOfId(id), toolP, theme.brand, { progress: k0, alpha: dim, widthPx: Math.max(2, size / 4) });
        drawLine(toolP, camP, theme.accent, { progress: k1, alpha: dim, widthPx: Math.max(2, size / 4) });
        drawLine(camP, boardCenter, ARM_LINE[id], { progress: k2, alpha: dim, widthPx: Math.max(2, size / 5), dash: true });
        dot(toolP, theme.brand, 0.3, k0 * dim);
        dot(camP, theme.accent, 0.3, k1 * dim);
        if (active) {
          drawLabel(new V3().lerpVectors(baseOfId(id), toolP, 0.5), "T_base_tool", theme.brand, { alpha: k0, dx: -4.2 });
          drawLabel(camP.clone().add(new V3(0, 0, 0.08)), "T_tool_camera", theme.accent, { alpha: k1, dy: -0.4 });
          drawLabel(new V3().lerpVectors(camP, boardCenter, 0.55), "T_camera_board", ARM_LINE[id], { alpha: k2, dy: -1.3 });
        }
      });
      const done = smooth((local - 12.2) / 1.2);
      dot(boardCenter, theme.ink, 0.5, done);
      drawLabel(boardCenter.clone().add(new V3(0, 0, board.outerHeightM / 2 + 0.05)), "三臂得到同一个 T_base_board", theme.ink, { alpha: done, dy: -0.2 });
    } else {
      // Plan view: bases at the bottom, board on top. One relation at a time, earlier ones dimmed.
      const step = (from: number, length = 1.8) => smooth((local - from) / length);
      ARM_IDS.forEach((id) => baseTag(id, 1, 1.9));
      const lP = baseOfId("l");
      const boardP = boardCenter.clone();
      boardP.z = 0.012;
      dot(boardP, theme.ink, 0.45, step(0));
      const onlyL = step(0);
      drawLine(lP, boardP, ARM_LINE.l, { progress: onlyL, alpha: local < 5 ? 1 : 0.4, widthPx: Math.max(2, size / 4), arrow: true });
      drawLabel(new V3().lerpVectors(lP, boardP, 0.5), "T_base_l_board", ARM_LINE.l, { alpha: onlyL * (local < 5 ? 1 : 0), dy: 2.6 });
      const rel = (id: ArmId, from: number, text: string, boardText: string) => {
        const toBase = step(from);
        const closing = step(from + 2.6);
        const active = local < from + 6;
        drawLine(boardP, baseOfId(id), ARM_LINE[id], { progress: toBase, alpha: active ? 1 : 0.4, widthPx: Math.max(2, size / 4), arrow: true });
        drawLabel(new V3().lerpVectors(boardP, baseOfId(id), 0.5), boardText, ARM_LINE[id], { alpha: toBase * (local < from + 2.6 ? 1 : 0), dy: id === "m" ? -1.6 : -2.2 });
        drawLine(lP, baseOfId(id), theme.accent, { progress: closing, widthPx: Math.max(3, size / 3), arrow: true });
        drawLabel(new V3().lerpVectors(lP, baseOfId(id), 0.5), text, theme.accent, { alpha: closing, dx: -7.6, dy: 0.3 });
      };
      rel("m", 3.2, "T_base_l_base_m", "inverse(T_base_m_board)");
      rel("r", 9.4, "T_base_l_base_r", "inverse(T_base_r_board)");
    }

    // PiP frame and corner dots.
    if (pipOpacity > 0.01) {
      c.save();
      c.globalAlpha = pipOpacity;
      c.strokeStyle = ARM_LINE[pipArm];
      c.lineWidth = 2;
      c.strokeRect(pip.x, pip.y, pip.w, pip.h);
      const cameraSpace = new V3();
      c.fillStyle = theme.accent;
      innerCorners.forEach((corner) => {
        cameraSpace.copy(corner).applyMatrix4(boardWorld).project(pipCamera);
        if (Math.abs(cameraSpace.x) > 1 || Math.abs(cameraSpace.y) > 1 || cameraSpace.z >= 1) return;
        c.beginPath();
        c.arc(pip.x + ((cameraSpace.x + 1) / 2) * pip.w, pip.y + ((1 - cameraSpace.y) / 2) * pip.h, Math.max(1.4, size * 0.16), 0, Math.PI * 2);
        c.fill();
      });
      c.font = `600 ${size * 0.9}px ${theme.mono}`;
      c.fillStyle = theme.bg;
      c.globalAlpha = pipOpacity * 0.86;
      const caption = `${pipArm} 臂相机`;
      c.fillRect(pip.x, pip.y + pip.h - size * 1.7, pip.w, size * 1.7);
      c.globalAlpha = pipOpacity;
      c.fillStyle = theme.ink;
      c.fillText(corners ? `${caption} · 角点 ${corners.seen}/${corners.total}` : caption, pip.x + size * 0.5, pip.y + pip.h - size * 0.5);
      c.restore();
    }

    return {
      chapter,
      samples: chapter < 2 ? 0 : chapter === 2 ? captured : total,
      total: calibration.minimumSamplesPerArm,
      corners,
      spreadCm,
      relative: chapter === 5 ? relative : null,
    };
  };

  resize();
  return {
    apply,
    resize,
    refreshTheme,
    events,
    sampleCount: total,
    stats,
    dispose: () => {
      scene.traverse((object: any) => {
        if (!(object instanceof THREE.Mesh || object instanceof THREE.LineSegments || object instanceof THREE.LineLoop)) return;
        object.geometry.dispose();
        (Array.isArray(object.material) ? object.material : [object.material]).forEach((material: any) => material.dispose());
      });
      boardTexture.dispose();
      renderer.dispose();
    },
  };
}

export { DURATION };
