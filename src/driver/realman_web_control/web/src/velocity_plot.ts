import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Fixed magnitude colour scale shared by the 3D arrow and the HTML colour bar:
// 0 = idle, 1 = the arm's configured speed limit.
export const VELOCITY_COLOR_STOPS: ReadonlyArray<readonly [number, string]> = [
  [0, "#2f7fd0"],
  [0.25, "#2fc3b0"],
  [0.5, "#9bd65a"],
  [0.75, "#f2b84b"],
  [1, "#e5484d"],
];
const OVER_SCALE_COLOR = "#ff4fd8";

export function velocityColor(ratio: number) {
  if (!Number.isFinite(ratio) || ratio <= 0) return VELOCITY_COLOR_STOPS[0][1];
  if (ratio > 1) return OVER_SCALE_COLOR;
  for (let index = 1; index < VELOCITY_COLOR_STOPS.length; index += 1) {
    const [end, endColor] = VELOCITY_COLOR_STOPS[index];
    const [start, startColor] = VELOCITY_COLOR_STOPS[index - 1];
    if (ratio <= end) {
      const color = new THREE.Color(startColor).lerp(new THREE.Color(endColor), (ratio - start) / (end - start));
      return `#${color.getHexString()}`;
    }
  }
  return VELOCITY_COLOR_STOPS[VELOCITY_COLOR_STOPS.length - 1][1];
}

export function velocityColorGradient() {
  return `linear-gradient(90deg, ${VELOCITY_COLOR_STOPS.map(([stop, color]) => `${color} ${stop * 100}%`).join(", ")})`;
}

function finiteVector(values: number[] | undefined) {
  return Array.isArray(values) && values.length === 3 && values.every(Number.isFinite) ? values : undefined;
}

function textSprite(text: string, color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 32;
  const context = canvas.getContext("2d")!;
  context.font = "700 22px Inter, ui-sans-serif, system-ui, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = color;
  context.fillText(text, 32, 16);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true }));
  sprite.scale.set(0.32, 0.16, 1);
  return sprite;
}

type Arrow = { group: THREE.Group; shaft: THREE.Mesh; head: THREE.Mesh; material: THREE.MeshBasicMaterial };

function makeArrow(color: string, radius: number, opacity = 1): Arrow {
  const material = new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 1, 12), material);
  const head = new THREE.Mesh(new THREE.ConeGeometry(radius * 2.6, 1, 16), material);
  const group = new THREE.Group();
  group.add(shaft, head);
  group.visible = false;
  return { group, shaft, head, material };
}

const UP = new THREE.Vector3(0, 1, 0);

function placeArrow(arrow: Arrow, direction: THREE.Vector3, length: number) {
  if (length < 1e-4) {
    arrow.group.visible = false;
    return;
  }
  const headLength = Math.min(0.22, length * 0.45);
  const shaftLength = length - headLength;
  arrow.group.visible = true;
  arrow.group.quaternion.setFromUnitVectors(UP, direction);
  arrow.shaft.scale.set(1, shaftLength, 1);
  arrow.shaft.position.set(0, shaftLength / 2, 0);
  arrow.head.scale.set(1, headLength, 1);
  arrow.head.position.set(0, shaftLength + headLength / 2, 0);
}

/**
 * One draggable 3D plot of a velocity vector in a fixed [-scale, scale]^3 box.
 * Zoom and pan are disabled so the visual scale never changes; dragging only
 * rotates the view and double-click restores the default angle.
 */
export class VelocityPlot {
  readonly available: boolean;
  private renderer?: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
  private controls?: OrbitControls;
  private measured = makeArrow(VELOCITY_COLOR_STOPS[0][1], 0.04);
  private reference = makeArrow("#475569", 0.014, 0.55);
  private dropLine: THREE.Line;
  private dropDot: THREE.Mesh;
  private pending = 0;
  private resizeObserver?: ResizeObserver;

  constructor(private readonly canvas: HTMLCanvasElement) {
    try {
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      this.renderer = undefined;
    }
    this.available = Boolean(this.renderer);
    this.camera.up.set(0, 0, 1);
    this.resetView();

    const box = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(2, 2, 2)),
      new THREE.LineBasicMaterial({ color: 0xc3cedb }),
    );
    const grid = new THREE.GridHelper(2, 4, 0xc3cedb, 0xe3e9f0);
    grid.rotation.x = Math.PI / 2;
    const rings = new THREE.Group();
    for (const radius of [0.5, 1]) {
      const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2);
      const ring = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(curve.getPoints(64)),
        new THREE.LineBasicMaterial({ color: radius === 1 ? 0x9fb0c4 : 0xc3cedb }),
      );
      rings.add(ring);
    }
    const axes = new THREE.Group();
    for (const [axis, color, label] of [
      [new THREE.Vector3(1, 0, 0), "#e5484d", "X"],
      [new THREE.Vector3(0, 1, 0), "#30a46c", "Y"],
      [new THREE.Vector3(0, 0, 1), "#3e63dd", "Z"],
    ] as const) {
      axes.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([axis.clone().multiplyScalar(-1), axis.clone()]),
        new THREE.LineBasicMaterial({ color }),
      ));
      const sprite = textSprite(label, color);
      sprite.position.copy(axis).multiplyScalar(1.18);
      axes.add(sprite);
    }
    this.dropLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
      new THREE.LineDashedMaterial({ color: 0x8796a8, dashSize: 0.05, gapSize: 0.04 }),
    );
    this.dropLine.visible = false;
    this.dropDot = new THREE.Mesh(new THREE.CircleGeometry(0.035, 20), new THREE.MeshBasicMaterial({ color: 0x8796a8 }));
    this.dropDot.visible = false;
    this.scene.add(box, grid, rings, axes, this.reference.group, this.measured.group, this.dropLine, this.dropDot);

    if (!this.renderer) return;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(0xffffff, 1);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.target.set(0, 0, 0);
    this.controls.addEventListener("change", () => this.requestRender());
    canvas.addEventListener("dblclick", () => {
      this.resetView();
      this.controls?.update();
      this.requestRender();
    });
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
  }

  private resetView() {
    this.camera.position.set(2.8, -3.8, 2.35);
    this.camera.lookAt(0, 0, 0);
  }

  private resize() {
    const { clientWidth: width, clientHeight: height } = this.canvas;
    if (!this.renderer || !width || !height) return;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.requestRender();
  }

  private requestRender() {
    if (!this.renderer || this.pending) return;
    this.pending = requestAnimationFrame(() => {
      this.pending = 0;
      this.renderer?.render(this.scene, this.camera);
    });
  }

  /**
   * Draw `measured` (and optionally a faint `reference` command vector) against a fixed
   * full scale. Returns the magnitude ratio so callers can label the same colour.
   */
  update(measured: number[] | undefined, scale: number, reference?: number[]) {
    const validScale = Number.isFinite(scale) && scale > 0;
    const vector = finiteVector(measured);
    let ratio = Number.NaN;
    if (vector && validScale) {
      const value = new THREE.Vector3(...vector);
      ratio = value.length() / scale;
      const length = Math.min(ratio, 1);
      const direction = value.normalize();
      placeArrow(this.measured, direction, length);
      this.measured.material.color.set(velocityColor(ratio));
      const tip = direction.clone().multiplyScalar(length);
      const show = length >= 1e-4 && Math.abs(tip.z) > 1e-3;
      this.dropLine.visible = show;
      this.dropDot.visible = show;
      if (show) {
        this.dropLine.geometry.setFromPoints([tip, new THREE.Vector3(tip.x, tip.y, 0)]);
        this.dropLine.computeLineDistances();
        this.dropDot.position.set(tip.x, tip.y, 0.001);
      }
    } else {
      this.measured.group.visible = false;
      this.dropLine.visible = false;
      this.dropDot.visible = false;
    }
    const referenceVector = finiteVector(reference);
    if (referenceVector && validScale) {
      const value = new THREE.Vector3(...referenceVector);
      placeArrow(this.reference, value.clone().normalize(), Math.min(value.length() / scale, 1));
    } else {
      this.reference.group.visible = false;
    }
    this.requestRender();
    return ratio;
  }
}
