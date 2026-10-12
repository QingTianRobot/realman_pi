<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

type ArmId = "l" | "m" | "r";

type RobotConfig = {
  id: ArmId;
  model: string;
  framePrefix: string;
  parentFrame: string;
  transform: { x: number; y: number; z: number; roll: number; pitch: number; yaw: number };
};

type Layout = { rootFrame: string; visualizationReferenceArm: ArmId; robots: RobotConfig[] };

// One TF frame of the arm chain. `parent` is null only for the global root.
type FrameNode = {
  frame: string;
  parent: string | null;
  depth: number;
  arm: ArmId | null;
  link: string | null;
  joint: string;
  jointType: string;
  axis: number[] | null;
  limitDeg: [number, number] | null;
  xyz: number[];
  rpyDeg: number[];
  note: string;
};

const canvas = ref<HTMLCanvasElement | null>(null);
const host = ref<HTMLElement | null>(null);
const state = ref<"loading" | "ready" | "error">("loading");
const selectedArm = ref<ArmId>("l");
const hovered = ref<string>("");
const nodes = reactive<Record<ArmId, FrameNode[]>>({ l: [], m: [], r: [] });
const worldNode = ref<FrameNode | null>(null);
const label = reactive({ visible: false, text: "", left: 0, top: 0 });

const armIds: ArmId[] = ["l", "m", "r"];
const current = computed(() => nodes[selectedArm.value]);
const hoveredNode = computed<FrameNode | null>(() => {
  if (!hovered.value) return null;
  if (worldNode.value?.frame === hovered.value) return worldNode.value;
  return nodes[selectedArm.value].find((node) => node.frame === hovered.value) ?? null;
});

const parentFrame = computed(() => hoveredNode.value?.parent ?? "");

let applyHighlight: (frame: string) => void = () => undefined;
let applySelection: (arm: ArmId) => void = () => undefined;
let dispose: (() => void) | undefined;

const format = (values: number[], digits = 3) => values.map((value) => (Math.abs(value) < 5e-4 ? 0 : value).toFixed(digits)).join(", ");
const setHover = (frame: string) => {
  hovered.value = frame;
  applyHighlight(frame);
};
watch(selectedArm, (arm) => {
  hovered.value = "";
  applySelection(arm);
});

// Idle posture: the same relaxed bend the hero scene uses, so link frames are visibly separated.
const POSE = [0, 0.45, 1.05, 0, 1.0, 0];
const ARM_COLORS: Record<ArmId, number> = { l: 0x2c8c8f, m: 0xc76a3e, r: 0x48565b };

onMounted(async () => {
  if (!canvas.value || !host.value) return;
  try {
    const base = import.meta.env.BASE_URL;
    const response = await fetch(`${base}three-robots.json`);
    if (!response.ok) throw new Error(`three-robots.json: ${response.status}`);
    const layout = (await response.json()) as Layout;

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
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 0.8;
    scene.add(new THREE.HemisphereLight(0xf6faf8, 0x354248, 2.4));
    const key = new THREE.DirectionalLight(0xffffff, 3.6);
    key.position.set(2.2, -2.8, 3.6);
    scene.add(key);

    // Theme colors come from the site tokens at use time, so light/dark both stay on-palette.
    const token = (name: string, fallback: number) => {
      const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return value ? new THREE.Color(value) : new THREE.Color(fallback);
    };

    const loader = new URDFLoader();
    loader.packages = { rm65_description: `${base}models/rm65_description` };
    const loaded = await Promise.all(
      layout.robots.map(async (config) => ({
        config,
        robot: (await loader.loadAsync(`${base}models/${config.model}.urdf`)) as any,
      })),
    );

    const reference = layout.robots.find((robot) => robot.id === layout.visualizationReferenceArm)!;
    const group = new THREE.Group();
    scene.add(group);

    type LinkEntry = { arm: ArmId; frame: string; object: any; meshes: any[]; axes: any };
    const links = new Map<string, LinkEntry>();
    const armRoots: Record<string, any> = {};

    const euler = new THREE.Euler();
    const toDegrees = (rad: number) => (rad * 180) / Math.PI;

    for (const { config, robot } of loaded) {
      const id = config.id;
      robot.position.set(
        config.transform.x - reference.transform.x,
        config.transform.y - reference.transform.y,
        config.transform.z - reference.transform.z,
      );
      robot.rotation.set(config.transform.roll, config.transform.pitch, config.transform.yaw, "ZYX");
      POSE.forEach((value, index) => robot.setJointValue(`joint_${index + 1}`, value));
      group.add(robot);
      armRoots[id] = robot;

      // Walk link -> joint -> link so every frame knows its parent frame and the joint that connects them.
      const chain: FrameNode[] = [];
      const visit = (linkObject: any, parentFrame: string | null, joint: any | null, depth: number) => {
        const frame = `${config.framePrefix}${linkObject.name}`;
        let jointType = "fixed";
        let axis: number[] | null = null;
        let limitDeg: [number, number] | null = null;
        let xyz = [0, 0, 0];
        let rpyDeg = [0, 0, 0];
        let jointName = "";
        if (joint) {
          jointName = joint.name;
          jointType = joint.jointType ?? "fixed";
          if (joint.axis) axis = [joint.axis.x, joint.axis.y, joint.axis.z];
          if (jointType === "revolute" && joint.limit) limitDeg = [toDegrees(joint.limit.lower), toDegrees(joint.limit.upper)];
          const origin = joint.origPosition ?? joint.position;
          xyz = [origin.x, origin.y, origin.z];
          euler.setFromQuaternion(joint.origQuaternion ?? joint.quaternion, "ZYX");
          rpyDeg = [toDegrees(euler.x), toDegrees(euler.y), toDegrees(euler.z)];
        }
        const isRoot = parentFrame === null;
        chain.push({
          frame,
          parent: isRoot ? "world" : parentFrame,
          depth,
          arm: id,
          link: linkObject.name,
          joint: isRoot ? "static transform" : jointName,
          jointType: isRoot ? "static" : jointType,
          axis,
          limitDeg,
          xyz: isRoot
            ? [config.transform.x, config.transform.y, config.transform.z]
            : xyz,
          rpyDeg: isRoot
            ? [toDegrees(config.transform.roll), toDegrees(config.transform.pitch), toDegrees(config.transform.yaw)]
            : rpyDeg,
          note: isRoot
            ? "世界坐标系到该臂的静态变换，来自 config/ros/three_robots.yaml（标定结果）。"
            : jointType === "fixed"
              ? "固定关节，没有自由度。"
              : "",
        });
        const axes = new THREE.AxesHelper(0.07);
        (axes.material as any).depthTest = false;
        axes.renderOrder = 6;
        axes.visible = false;
        linkObject.add(axes);
        links.set(frame, { arm: id, frame, object: linkObject, meshes: [], axes });
        // Child joints are direct children flagged as URDF joints; their link children continue the chain.
        for (const child of linkObject.children) {
          if (!child.isURDFJoint) continue;
          for (const grandchild of child.children) {
            if (grandchild.isURDFLink) visit(grandchild, frame, child, depth + 1);
          }
        }
      };
      visit(robot, null, null, 1);
      nodes[id] = chain;

    }

    worldNode.value = {
      frame: layout.rootFrame,
      parent: null,
      depth: 0,
      arm: null,
      link: null,
      joint: "",
      jointType: "root",
      axis: null,
      limitDeg: null,
      xyz: [0, 0, 0],
      rpyDeg: [0, 0, 0],
      note: "全局根坐标系，RViz 的 Fixed Frame；所有机械臂都通过静态变换接入它。",
    };

    // Materials are applied once the STL meshes finish loading.
    const expected = loaded.reduce((total, { robot }) => {
      let count = 0;
      robot.traverse((object: any) => { if (object.isURDFVisual) count += 1; });
      return total + count;
    }, 0);
    for (let attempt = 0; attempt < 160; attempt += 1) {
      let meshes = 0;
      group.traverse((object: any) => { if (object instanceof THREE.Mesh) meshes += 1; });
      if (meshes >= expected) break;
      await new Promise((resolve) => window.setTimeout(resolve, 50));
    }
    // STL meshes load asynchronously, so link ownership is assigned only once they all exist.
    for (const { config, robot } of loaded) {
      robot.traverse((object: any) => {
        if (!(object instanceof THREE.Mesh)) return;
        let owner = object.parent;
        while (owner && !owner.isURDFLink) owner = owner.parent;
        if (!owner) return;
        const entry = links.get(`${config.framePrefix}${owner.name}`);
        if (!entry) return;
        entry.meshes.push(object);
        object.userData.frame = entry.frame;
      });
    }
    for (const entry of links.values()) {
      entry.meshes.forEach((mesh) => {
        mesh.material = new THREE.MeshStandardMaterial({
          color: ARM_COLORS[entry.arm],
          metalness: 0.2,
          roughness: 0.58,
          transparent: true,
          opacity: 1,
        });
        mesh.userData.baseColor = ARM_COLORS[entry.arm];
      });
    }

    // World frame: axes at the world origin and a dashed line to each arm's `<id>/world` origin.
    const worldOrigin = new THREE.Vector3(
      -reference.transform.x,
      -reference.transform.y,
      -reference.transform.z,
    );
    const worldAxes = new THREE.AxesHelper(0.25);
    worldAxes.position.copy(worldOrigin);
    (worldAxes.material as any).depthTest = false;
    worldAxes.renderOrder = 6;
    scene.add(worldAxes);
    const grid = new THREE.GridHelper(4, 20, 0x718087, 0xb8c0bd);
    grid.rotation.x = Math.PI / 2;
    grid.position.z = -0.002;
    (grid.material as any).transparent = true;
    (grid.material as any).opacity = 0.28;
    scene.add(grid);

    const staticLines: Record<string, any> = {};
    for (const { config } of loaded) {
      const geometry = new THREE.BufferGeometry().setFromPoints([worldOrigin, armRoots[config.id].position.clone()]);
      const line = new THREE.Line(
        geometry,
        new THREE.LineDashedMaterial({ color: 0x718087, dashSize: 0.05, gapSize: 0.04, transparent: true, depthTest: false }),
      );
      line.computeLineDistances();
      line.renderOrder = 5;
      scene.add(line);
      staticLines[config.id] = line;
    }

    // Parent -> child arrow (head at the child), redrawn for the highlighted frame.
    const connector = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 0.1, 0xc85e35, 0.03, 0.018);
    [connector.line.material, connector.cone.material].forEach((material: any) => { material.depthTest = false; });
    connector.renderOrder = 7;
    connector.line.renderOrder = 7;
    connector.cone.renderOrder = 7;
    connector.visible = false;
    scene.add(connector);
    const placeConnector = (from: any, to: any) => {
      const direction = to.clone().sub(from);
      const length = direction.length();
      if (length < 1e-4) {
        connector.visible = false;
        return;
      }
      connector.position.copy(from);
      connector.setDirection(direction.normalize());
      connector.setLength(length, Math.min(0.04, length * 0.4), 0.02);
      connector.visible = true;
    };

    let highlighted = "";
    let highlightedParent = "";
    const worldPosition = (frame: string, target: any) => {
      if (frame === layout.rootFrame) return target.copy(worldOrigin);
      const entry = links.get(frame);
      return entry ? entry.object.getWorldPosition(target) : target.set(0, 0, 0);
    };

    const refreshStyles = () => {
      const accent = token("--rm-accent", 0xc85e35);
      const brand = token("--vp-c-brand-1", 0x116a75);
      connector.setColor(accent);
      for (const entry of links.values()) {
        const selected = entry.arm === selectedArm.value;
        const active = entry.frame === highlighted;
        // The parent of the highlighted frame gets a softer teal tint so the pair reads parent -> child.
        const parent = !active && selected && entry.frame === highlightedParent;
        entry.axes.visible = selected;
        entry.axes.scale.setScalar(active ? 2.4 : parent ? 1.8 : 1);
        entry.meshes.forEach((mesh) => {
          const material = mesh.material;
          material.opacity = selected ? 1 : 0.18;
          material.depthWrite = selected;
          material.emissive.copy(active ? accent : parent ? brand : new THREE.Color(0x000000));
          material.emissiveIntensity = active ? 0.85 : parent ? 0.7 : 0;
        });
      }
      for (const id of armIds) {
        const active = highlighted === `${id}/world`;
        (staticLines[id].material as any).color.copy(active ? accent : brand);
        (staticLines[id].material as any).opacity = id === selectedArm.value ? 0.9 : 0.25;
      }
      worldAxes.scale.setScalar(highlighted === layout.rootFrame ? 1.8 : 1);
    };

    applyHighlight = (frame: string) => {
      highlighted = frame;
      const node = frame === layout.rootFrame ? null : nodes[selectedArm.value].find((item) => item.frame === frame);
      highlightedParent = node?.parent ?? "";
      refreshStyles();
      if (node && node.parent) {
        const from = worldPosition(node.parent, new THREE.Vector3());
        const to = worldPosition(node.frame, new THREE.Vector3());
        placeConnector(from, to);
      } else {
        connector.visible = false;
      }
      if (!frame) label.visible = false;
    };
    applySelection = () => {
      highlighted = "";
      highlightedParent = "";
      connector.visible = false;
      label.visible = false;
      refreshStyles();
    };
    refreshStyles();

    // Pointer picking: hovering a link's mesh highlights the same frame as hovering its tree entry.
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const pick = (event: PointerEvent) => {
      const box = canvas.value!.getBoundingClientRect();
      pointer.set(((event.clientX - box.left) / box.width) * 2 - 1, -((event.clientY - box.top) / box.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const targets: any[] = [];
      for (const entry of links.values()) if (entry.arm === selectedArm.value) targets.push(...entry.meshes);
      const hit = raycaster.intersectObjects(targets, false)[0];
      return hit ? (hit.object.userData.frame as string) : "";
    };
    const onMove = (event: PointerEvent) => {
      const frame = pick(event);
      canvas.value!.style.cursor = frame ? "pointer" : "";
      if (frame !== hovered.value) setHover(frame);
    };
    const onLeave = () => setHover("");
    const onClick = (event: PointerEvent) => {
      // Clicking another arm's (faded) body selects it.
      const box = canvas.value!.getBoundingClientRect();
      pointer.set(((event.clientX - box.left) / box.width) * 2 - 1, -((event.clientY - box.top) / box.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const meshes: any[] = [];
      for (const entry of links.values()) meshes.push(...entry.meshes);
      const hit = raycaster.intersectObjects(meshes, false)[0];
      const arm = hit ? (links.get(hit.object.userData.frame)?.arm ?? null) : null;
      if (arm && arm !== selectedArm.value) selectedArm.value = arm;
    };
    canvas.value.addEventListener("pointermove", onMove);
    canvas.value.addEventListener("pointerleave", onLeave);
    canvas.value.addEventListener("click", onClick);

    // Frame the whole layout.
    group.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(group);
    const size = bounds.getSize(new THREE.Vector3());
    const dimension = Math.max(size.x, size.y, size.z);
    const focusZ = Math.max(bounds.min.z + size.z * 0.45, 0.2);
    controls.target.set(0, 0, focusZ);
    camera.position.set(dimension * 1.0, -dimension * 1.5, focusZ + dimension * 0.75);
    camera.lookAt(controls.target);
    controls.maxDistance = Math.max(8, dimension * 3);

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
    const projected = new THREE.Vector3();
    let frameId = 0;
    const render = () => {
      frameId = window.requestAnimationFrame(render);
      if (!visible) return;
      controls.update();
      // Keep the connector glued to the arm and the floating label on the hovered frame.
      if (hovered.value) {
        const node = hovered.value === layout.rootFrame ? null : nodes[selectedArm.value].find((item) => item.frame === hovered.value);
        if (node && node.parent) {
          const from = worldPosition(node.parent, new THREE.Vector3());
          const to = worldPosition(node.frame, new THREE.Vector3());
          placeConnector(from, to);
        }
        worldPosition(hovered.value, projected).project(camera);
        const box = host.value!.getBoundingClientRect();
        label.visible = projected.z < 1;
        label.left = ((projected.x + 1) / 2) * box.width;
        label.top = ((1 - projected.y) / 2) * box.height;
        label.text = hovered.value;
      }
      renderer.render(scene, camera);
    };
    render();

    state.value = "ready";
    dispose = () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      visibility.disconnect();
      canvas.value?.removeEventListener("pointermove", onMove);
      canvas.value?.removeEventListener("pointerleave", onLeave);
      canvas.value?.removeEventListener("click", onClick);
      controls.dispose();
      scene.traverse((object: any) => {
        if (!(object instanceof THREE.Mesh || object instanceof THREE.Line)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material: any) => material.dispose());
      });
      renderer.dispose();
    };
  } catch {
    state.value = "error";
  }
});

onBeforeUnmount(() => dispose?.());
</script>

<template>
  <div
    class="tf-explorer"
    :data-state="state"
    :data-selected-arm="selectedArm"
    :data-hovered-frame="hovered"
    :data-frame-count="current.length"
  >
    <div class="tf-explorer-side">
      <div class="tf-explorer-arms" role="tablist" aria-label="选择机械臂">
        <button
          v-for="id in armIds"
          :key="id"
          type="button"
          role="tab"
          :aria-selected="selectedArm === id"
          :class="['tf-explorer-arm', `arm-${id}`, { active: selectedArm === id }]"
          @click="selectedArm = id"
        >{{ id.toUpperCase() }}</button>
      </div>
      <ol v-if="state === 'ready'" class="tf-explorer-tree" aria-label="TF 父子关系">
        <li v-if="worldNode" class="tf-explorer-item depth-0">
          <button
            type="button"
            :class="['tf-node', 'root', { hovered: hovered === worldNode.frame, related: parentFrame === worldNode.frame }]"
            :data-frame="worldNode.frame"
            @mouseenter="setHover(worldNode.frame)"
            @mouseleave="setHover('')"
            @focus="setHover(worldNode.frame)"
            @blur="setHover('')"
          >{{ worldNode.frame }}</button>
          <span class="tf-explorer-meta">全局根</span>
        </li>
        <li
          v-for="node in current"
          :key="node.frame"
          :class="['tf-explorer-item', `depth-${node.depth}`]"
        >
          <button
            type="button"
            :class="['tf-node', `arm-${node.arm}`, { hovered: hovered === node.frame, related: parentFrame === node.frame }]"
            :data-frame="node.frame"
            :data-parent="node.parent"
            @mouseenter="setHover(node.frame)"
            @mouseleave="setHover('')"
            @focus="setHover(node.frame)"
            @blur="setHover('')"
          >{{ node.frame }}</button>
          <span class="tf-explorer-meta">父 {{ node.parent }} · {{ node.joint }}</span>
        </li>
      </ol>
      <div class="tf-explorer-info" aria-live="polite">
        <template v-if="hoveredNode">
          <p class="tf-explorer-info-title">{{ hoveredNode.frame }}</p>
          <dl>
            <template v-if="hoveredNode.parent">
              <dt>父坐标系</dt><dd>{{ hoveredNode.parent }}</dd>
            </template>
            <dt>子坐标系</dt><dd>{{ hoveredNode.frame }}</dd>
            <template v-if="hoveredNode.joint">
              <dt>连接</dt><dd>{{ hoveredNode.joint }} · {{ hoveredNode.jointType }}</dd>
            </template>
            <template v-if="hoveredNode.axis">
              <dt>旋转轴</dt><dd>{{ format(hoveredNode.axis, 0) }}</dd>
            </template>
            <template v-if="hoveredNode.limitDeg">
              <dt>限位</dt><dd>{{ format(hoveredNode.limitDeg, 0) }}°</dd>
            </template>
            <template v-if="hoveredNode.parent">
              <dt>相对父级 xyz (m)</dt><dd>{{ format(hoveredNode.xyz) }}</dd>
              <dt>相对父级 rpy (°)</dt><dd>{{ format(hoveredNode.rpyDeg, 1) }}</dd>
            </template>
          </dl>
          <p v-if="hoveredNode.note" class="tf-explorer-note">{{ hoveredNode.note }}</p>
        </template>
        <p v-else class="tf-explorer-note">悬停坐标系（或三维视图中的连杆）：橙色是子坐标系，青色是它的父坐标系，橙线连接两者的原点，下面显示关节和相对位姿。AG2F90-C 夹爪目前只存在于网页预览，ROS 的 TF 树里还没有它。</p>
      </div>
    </div>
    <div ref="host" class="tf-explorer-view">
      <canvas ref="canvas" aria-label="三台 RM65 的 URDF 模型与 TF 坐标轴" role="img" />
      <span v-if="label.visible" class="tf-explorer-label" :style="{ left: `${label.left}px`, top: `${label.top}px` }">{{ label.text }}</span>
      <p v-if="state === 'loading'" class="viewer-state">正在加载 TF 场景</p>
      <p v-else-if="state === 'error'" class="viewer-state viewer-error">TF 场景暂不可用</p>
    </div>
  </div>
</template>
