import * as THREE from "three";

export type ViewerRenderer = {
  mode: "webgl" | "canvas";
  setSize(width: number, height: number, updateStyle?: boolean): void;
  render(scene: THREE.Scene, camera: THREE.Camera): void;
};

// Fallback projects the same URDF transforms without requiring a GPU context.
export function createViewerRenderer(original: HTMLCanvasElement): { canvas: HTMLCanvasElement; renderer: ViewerRenderer } {
  try {
    const context = original.getContext("webgl2", { antialias: false, alpha: false, preserveDrawingBuffer: false });
    if (context) {
      const renderer = new THREE.WebGLRenderer({ canvas: original, context, antialias: false, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x091114, 1);
      original.parentElement!.dataset.renderer = "webgl";
      return { canvas: original, renderer: { mode: "webgl", setSize: (w, h, style) => renderer.setSize(w, h, style), render: (scene, camera) => renderer.render(scene, camera) } };
    }
  } catch (error) {
    console.warn("3D renderer unavailable; using compatible joint view", error);
  }
  // A canvas bound to WebGL cannot subsequently obtain a 2D context.
  const canvas = original.cloneNode(false) as HTMLCanvasElement;
  original.replaceWith(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("浏览器无法创建图形画布；其他功能仍可使用");
  canvas.parentElement!.dataset.renderer = "canvas";
  const badge = document.createElement("span");
  badge.textContent = "简化 3D · 拖动旋转 / 滚轮缩放";
  Object.assign(badge.style, { position: "absolute", left: "12px", top: "12px", color: "#8793a8", fontSize: "12px", pointerEvents: "none" });
  canvas.parentElement!.append(badge);
  const project = (point: THREE.Vector3, camera: THREE.Camera) => {
    const p = point.clone().project(camera);
    return Math.abs(p.z) <= 1 ? { x: (p.x + 1) * canvas.width / 2, y: (1 - p.y) * canvas.height / 2 } : null;
  };
  const line = (a: THREE.Vector3, b: THREE.Vector3, camera: THREE.Camera, color: string, width = 1) => {
    const start = project(a, camera), end = project(b, camera);
    if (!start || !end) return;
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
  };
  return { canvas, renderer: {
    mode: "canvas",
    setSize(width, height) { canvas.width = Math.max(1, Math.round(width)); canvas.height = Math.max(1, Math.round(height)); },
    render(scene, camera) {
      ctx.fillStyle = "#091114"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      scene.updateMatrixWorld(true); camera.updateMatrixWorld(true);
      scene.traverseVisible((node: THREE.Object3D & { isURDFLink?: boolean; isLine?: boolean; isLineSegments?: boolean; geometry?: THREE.BufferGeometry; material?: THREE.Material & { color?: THREE.Color } }) => {
        if (node.isURDFLink) {
          let parent = node.parent as typeof node | null;
          while (parent && !parent.isURDFLink) parent = parent.parent as typeof node | null;
          if (!parent) return;
          let root: THREE.Object3D = node;
          while (root.parent && !root.userData.compatColor) root = root.parent;
          const color = root.userData.compatColor ?? "#55a6ff";
          const world = node.getWorldPosition(new THREE.Vector3());
          line(parent.getWorldPosition(new THREE.Vector3()), world, camera, color, 4);
          const p = project(world, camera);
          if (p) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fill(); }
        } else if (node.isLine && node.geometry) {
          const position = node.geometry.getAttribute("position");
          if (!position) return;
          const color = node.material?.color?.getStyle() ?? "#385363";
          for (let i = 0; i + 1 < position.count; i += node.isLineSegments ? 2 : 1) {
            line(new THREE.Vector3().fromBufferAttribute(position, i).applyMatrix4(node.matrixWorld), new THREE.Vector3().fromBufferAttribute(position, i + 1).applyMatrix4(node.matrixWorld), camera, color, 2);
          }
        } else if (node.geometry?.type === "SphereGeometry") {
          const p = project(node.getWorldPosition(new THREE.Vector3()), camera);
          if (p) { ctx.fillStyle = node.material?.color?.getStyle() ?? "#55a6ff"; ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fill(); }
        }
      });
    },
  } };
}
