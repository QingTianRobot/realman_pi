<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

// An embeddable, interactive URDF figure for documentation pages. It loads the same generated assets as the
// home page (three-robots.json, docs-data.json), so models, limits and gripper endpoints always match the
// repository. The scene only starts rendering once it scrolls into view.
const props = withDefaults(
  defineProps<{
    model?: "arm" | "gripper" | "arm-gripper";
    focus?: string; // link name to highlight, e.g. "link_3"
    frames?: boolean; // draw a coordinate axis on every link
    animate?: boolean; // gentle idle motion until the reader touches a control
    controls?: boolean; // joint / gripper sliders
    caption?: string;
  }>(),
  { model: "arm", focus: "", frames: false, animate: false, controls: false, caption: "" },
);

type Layout = {
  robots: { model: string }[];
  grippers?: Record<string, { urdf: string; drivingJoint: string; closedRad: number; openRad: number }>;
  endEffectors?: Record<string, { xyz: number[]; rpy: number[]; parentLink: string }>;
};
type DocsData = { grippers: Record<string, { openPosition: number; closePosition: number }> };

const host = ref<HTMLElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const state = ref<"idle" | "loading" | "ready" | "error">("idle");
const jointNames = ["joint_1", "joint_2", "joint_3", "joint_4", "joint_5", "joint_6"];
const joints = reactive(
  jointNames.map(() => ({ value: 0, lower: -180, upper: 180 })),
);
const opening = ref(1);
const manual = ref(false);
const drivingRad = ref(0);
const endpoints = ref<Record<string, { openPosition: number; closePosition: number }>>({});
const showArm = computed(() => props.model !== "gripper");
const showGripper = computed(() => props.model !== "arm");
const devicePositions = computed(() =>
  Object.entries(endpoints.value).map(([name, range]) => ({
    name,
    position: Math.round(range.closePosition + opening.value * (range.openPosition - range.closePosition)),
  })),
);

let applyControls: () => void = () => undefined;
let dispose: (() => void) | undefined;
let started = false;
const POSE = [0, 0.45, 1.05, 0, 1.0, 0];
const degrees = (rad: number) => Math.round((rad * 180) / Math.PI);

const onJoint = (index: number, event: Event) => {
  joints[index].value = Number((event.target as HTMLInputElement).value);
  manual.value = true;
  applyControls();
};
const onOpening = (event: Event) => {
  opening.value = Number((event.target as HTMLInputElement).value) / 100;
  manual.value = true;
  applyControls();
};
const resume = () => { manual.value = false; };
watch(() => props.focus, () => applyControls());

async function start() {
  if (started || !canvas.value || !host.value) return;
  started = true;
  state.value = "loading";
  try {
    const base = import.meta.env.BASE_URL;
    const [layout, data] = await Promise.all([
      fetch(`${base}three-robots.json`).then((response) => response.json() as Promise<Layout>),
      fetch(`${base}docs-data.json`).then((response) => response.json() as Promise<DocsData>),
    ]);
    endpoints.value = data.grippers ?? {};
    const THREE = await import("three");
    const [{ OrbitControls }, { default: URDFLoader }] = await Promise.all([
      import("three/examples/jsm/controls/OrbitControls.js"),
      import("urdf-loader"),
    ]);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas.value, alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 100);
    camera.up.set(0, 0, 1);
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.enableDamping = true;
    orbit.enablePan = false;
    orbit.autoRotate = props.animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    orbit.autoRotateSpeed = 0.8;
    scene.add(new THREE.HemisphereLight(0xf6faf8, 0x354248, 2.4));
    const key = new THREE.DirectionalLight(0xffffff, 3.4);
    key.position.set(2.2, -2.8, 3.6);
    scene.add(key);
    const grid = new THREE.GridHelper(2, 20, 0x718087, 0xb8c0bd);
    grid.rotation.x = Math.PI / 2;
    grid.position.z = -0.002;
    (grid.material as any).transparent = true;
    (grid.material as any).opacity = 0.25;
    scene.add(grid);

    const token = (name: string, fallback: number) => {
      const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return value ? new THREE.Color(value) : new THREE.Color(fallback);
    };

    const loader = new URDFLoader();
    loader.packages = { rm65_description: `${base}models/rm65_description` };
    let arm: any = null;
    let gripper: any = null;
    let gripperDef: NonNullable<Layout["grippers"]>[string] | undefined;
    const group = new THREE.Group();
    scene.add(group);

    if (props.model !== "gripper") {
      arm = await loader.loadAsync(`${base}models/${layout.robots[0].model}.urdf`);
      group.add(arm);
      jointNames.forEach((name, index) => {
        const limit = arm.joints[name]?.limit;
        joints[index].lower = limit ? degrees(limit.lower) : -180;
        joints[index].upper = limit ? degrees(limit.upper) : 180;
        joints[index].value = degrees(POSE[index]);
      });
    }
    if (props.model !== "arm") {
      gripperDef = layout.grippers?.ctag2f90c;
      const mount = layout.endEffectors?.l;
      if (gripperDef) {
        gripper = await loader.loadAsync(`${base}models/${gripperDef.urdf}`);
        if (arm && mount) {
          gripper.position.set(mount.xyz[0], mount.xyz[1], mount.xyz[2]);
          gripper.rotation.set(mount.rpy[0], mount.rpy[1], mount.rpy[2], "ZYX");
          arm.links[mount.parentLink]?.add(gripper);
        } else {
          group.add(gripper);
        }
      }
    }

    // Wait for the STL meshes, then give every mesh a material and remember which link owns it.
    const roots = [arm, gripper].filter(Boolean);
    for (let attempt = 0; attempt < 160; attempt += 1) {
      let count = 0;
      roots.forEach((root) => root.traverse((object: any) => { if (object instanceof THREE.Mesh) count += 1; }));
      const expected = roots.reduce((total, root) => {
        let visuals = 0;
        root.traverse((object: any) => { if (object.isURDFVisual) visuals += 1; });
        return total + visuals;
      }, 0);
      if (count >= expected && count > 0) break;
      await new Promise((resolve) => window.setTimeout(resolve, 50));
    }
    const owners = new Map<string, any[]>();
    const axesByLink = new Map<string, any>();
    const paint = (root: any, tint: number, prefix: string) => {
      root.traverse((object: any) => {
        if (!(object instanceof THREE.Mesh)) return;
        let owner = object.parent;
        while (owner && !owner.isURDFLink) owner = owner.parent;
        const name = `${prefix}${owner?.name ?? ""}`;
        object.material = new THREE.MeshStandardMaterial({ color: tint, metalness: 0.2, roughness: 0.58 });
        owners.set(name, [...(owners.get(name) ?? []), object]);
      });
      if (props.frames) {
        root.traverse((object: any) => {
          if (!object.isURDFLink) return;
          const axes = new THREE.AxesHelper(0.07);
          (axes.material as any).depthTest = false;
          axes.renderOrder = 6;
          object.add(axes);
          axesByLink.set(`${prefix}${object.name}`, axes);
        });
      }
    };
    if (arm) paint(arm, 0x2c8c8f, "");
    if (gripper) paint(gripper, 0x2b3438, "gripper:");

    applyControls = () => {
      const accent = token("--rm-accent", 0xc85e35);
      if (arm) jointNames.forEach((name, index) => arm.setJointValue(name, (joints[index].value * Math.PI) / 180));
      if (gripper && gripperDef) {
        const rad = gripperDef.closedRad + (gripperDef.openRad - gripperDef.closedRad) * opening.value;
        gripper.setJointValue(gripperDef.drivingJoint, rad);
        drivingRad.value = rad;
      }
      owners.forEach((meshes, name) => {
        const active = props.focus !== "" && name === props.focus;
        meshes.forEach((mesh) => {
          mesh.material.emissive.copy(active ? accent : new THREE.Color(0x000000));
          mesh.material.emissiveIntensity = active ? 0.85 : 0;
        });
      });
      axesByLink.forEach((axes, name) => axes.scale.setScalar(props.focus !== "" && name === props.focus ? 2.4 : 1));
    };
    applyControls();

    group.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(group);
    const size = bounds.getSize(new THREE.Vector3());
    const dimension = Math.max(size.x, size.y, size.z);
    const target = bounds.getCenter(new THREE.Vector3());
    orbit.target.copy(target);
    camera.position.set(target.x + dimension * 1.25, target.y - dimension * 1.7, target.z + dimension * 0.7);
    camera.lookAt(target);
    orbit.maxDistance = dimension * 6;
    orbit.minDistance = dimension * 0.6;

    const resize = () => {
      const { width, height } = host.value!.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host.value);
    resize();

    let visible = true;
    const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    visibility.observe(host.value);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    let frame = 0;
    const render = () => {
      frame = window.requestAnimationFrame(render);
      if (!visible) return;
      if (props.animate && !manual.value && !reduced) {
        const seconds = (performance.now() - t0) / 1000;
        if (arm) {
          jointNames.forEach((name, index) => {
            const swing = [0.5, 0.22, 0.3, 0.55, 0.3, 0.7][index] * Math.sin((2 * Math.PI * seconds) / [11, 8, 9.5, 7, 8.5, 6][index] + index * 0.9);
            const value = POSE[index] + swing;
            arm.setJointValue(name, value);
            joints[index].value = degrees(value);
          });
        }
        if (gripper && gripperDef) {
          opening.value = 0.5 + 0.5 * Math.sin((2 * Math.PI * seconds) / 7);
          gripper.setJointValue(gripperDef.drivingJoint, gripperDef.closedRad + (gripperDef.openRad - gripperDef.closedRad) * opening.value);
          drivingRad.value = gripperDef.closedRad + (gripperDef.openRad - gripperDef.closedRad) * opening.value;
        }
      }
      orbit.update();
      renderer.render(scene, camera);
    };
    render();
    state.value = "ready";
    dispose = () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibility.disconnect();
      orbit.dispose();
      scene.traverse((object: any) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        (Array.isArray(object.material) ? object.material : [object.material]).forEach((material: any) => material.dispose());
      });
      renderer.dispose();
    };
  } catch {
    state.value = "error";
  }
}

let watcher: IntersectionObserver | undefined;
onMounted(() => {
  if (!host.value) return;
  // Heavy work (three.js, URDF, STL) waits until the figure is near the viewport.
  watcher = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      watcher?.disconnect();
      void start();
    },
    { rootMargin: "240px" },
  );
  watcher.observe(host.value);
});
onBeforeUnmount(() => {
  watcher?.disconnect();
  dispose?.();
});
</script>

<template>
  <figure v-reveal class="urdf-figure" :data-state="state" :data-model="model">
    <div :class="['urdf-figure-body', { 'with-controls': controls }]">
      <div ref="host" class="urdf-figure-view">
        <canvas ref="canvas" role="img" :aria-label="caption || 'URDF 三维模型'" />
        <p v-if="state === 'idle' || state === 'loading'" class="viewer-state">正在加载模型</p>
        <p v-else-if="state === 'error'" class="viewer-state viewer-error">模型暂不可用</p>
      </div>
      <div v-if="controls && state === 'ready'" class="urdf-figure-panel">
        <template v-if="showArm">
          <label v-for="(joint, index) in joints" :key="index" class="urdf-figure-row">
            <span class="urdf-figure-name">J{{ index + 1 }}</span>
            <input
              type="range"
              step="1"
              :min="joint.lower"
              :max="joint.upper"
              :value="joint.value"
              :aria-label="`关节 ${index + 1}`"
              @input="onJoint(index, $event)"
            />
            <span class="urdf-figure-value">{{ joint.value }}°</span>
          </label>
        </template>
        <template v-if="showGripper">
          <label class="urdf-figure-row">
            <span class="urdf-figure-name">夹爪</span>
            <input type="range" min="0" max="100" step="1" :value="Math.round(opening * 100)" aria-label="夹爪开合" @input="onOpening" />
            <span class="urdf-figure-value">{{ Math.round(opening * 100) }}%</span>
          </label>
          <dl class="urdf-figure-readout">
            <dt>驱动关节</dt><dd>{{ drivingRad.toFixed(2) }} rad</dd>
            <template v-for="item in devicePositions" :key="item.name">
              <dt>{{ item.name }}</dt><dd>{{ item.position }}</dd>
            </template>
          </dl>
        </template>
        <button v-if="animate" type="button" class="urdf-figure-auto" :disabled="!manual" @click="resume">恢复自动摆动</button>
      </div>
    </div>
    <figcaption v-if="caption">{{ caption }}</figcaption>
  </figure>
</template>
