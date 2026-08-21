<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

type RobotConfig = {
  id: "l" | "m" | "r";
  model: string;
  expectedMeshCount: number;
  transform: {
    x: number;
    y: number;
    z: number;
    roll: number;
    pitch: number;
    yaw: number;
  };
};

type LayoutConfig = {
  rootFrame: string;
  visualizationReferenceArm: "m";
  defaultJointPosition: number;
  robots: RobotConfig[];
};

const canvas = ref<HTMLCanvasElement | null>(null);
const viewport = ref<HTMLElement | null>(null);
const state = ref<"loading" | "ready" | "error">("loading");
const meshCount = ref(0);
const robotCount = ref(0);
const modelNames = ref("");
const rootFrame = ref("world");
const visualizationReferenceArm = ref("m");

let dispose: (() => void) | undefined;

onMounted(async () => {
  if (!canvas.value || !viewport.value) return;

  try {
    const base = import.meta.env.BASE_URL;
    const response = await fetch(`${base}three-robots.json`);
    if (!response.ok) throw new Error(`Failed to load generated robot config: ${response.status}`);
    const config = (await response.json()) as LayoutConfig;
    robotCount.value = config.robots.length;
    modelNames.value = [...new Set(config.robots.map((robot) => robot.model))].join(" / ");
    rootFrame.value = config.rootFrame;
    visualizationReferenceArm.value = config.visualizationReferenceArm;

    const THREE = await import("three");
    const [{ OrbitControls }, { default: URDFLoader }] = await Promise.all([
      import("three/examples/jsm/controls/OrbitControls.js"),
      import("urdf-loader"),
    ]);

    const host = viewport.value;
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas.value,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 100);
    camera.up.set(0, 0, 1);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.enablePan = false;
    controls.minDistance = 0.8;
    controls.maxDistance = 8;
    controls.autoRotate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    controls.autoRotateSpeed = 0.42;

    scene.add(new THREE.HemisphereLight(0xf6faf8, 0x354248, 2.4));
    const keyLight = new THREE.DirectionalLight(0xffffff, 4.2);
    keyLight.position.set(2.2, -2.8, 3.6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xd7794c, 2.1);
    rimLight.position.set(-2.4, 1.8, 2.2);
    scene.add(rimLight);

    const grid = new THREE.GridHelper(5.4, 27, 0x718087, 0xb8c0bd);
    grid.rotation.x = Math.PI / 2;
    grid.position.z = -0.002;
    const gridMaterial = grid.material as InstanceType<typeof THREE.Material> & {
      opacity: number;
      transparent: boolean;
    };
    gridMaterial.opacity = 0.3;
    gridMaterial.transparent = true;
    scene.add(grid);

    const loader = new URDFLoader();
    loader.packages = {
      rm65_description: `${base}models/rm65_description`,
    };
    const robotsGroup = new THREE.Group();
    scene.add(robotsGroup);

    const robotColors: Record<RobotConfig["id"], number[]> = {
      l: [0x2c8c8f, 0x42a7a4, 0x236d72, 0x9cc8c5, 0xc0d5d0, 0x1c5b61, 0x6e9e9b],
      m: [0xc76a3e, 0xe18750, 0xa94e2e, 0xe1b092, 0xc7d1cc, 0x86402b, 0xf0c39e],
      r: [0x48565b, 0x647277, 0x344146, 0x9ca8a5, 0xc8d0cd, 0x273338, 0x7e8b8c],
    };
    const loadedRobots = await Promise.all(
      config.robots.map(async (robotConfig) => {
        const robot = await loader.loadAsync(`${base}models/${robotConfig.model}.urdf`);
        robot.position.set(
          robotConfig.transform.x,
          robotConfig.transform.y,
          robotConfig.transform.z,
        );
        robot.rotation.set(
          robotConfig.transform.roll,
          robotConfig.transform.pitch,
          robotConfig.transform.yaw,
          "ZYX",
        );
        robot.setJointValues({
          joint_1: config.defaultJointPosition,
          joint_2: config.defaultJointPosition,
          joint_3: config.defaultJointPosition,
          joint_4: config.defaultJointPosition,
          joint_5: config.defaultJointPosition,
          joint_6: config.defaultJointPosition,
        });
        robotsGroup.add(robot);
        return { robot, config: robotConfig };
      }),
    );
    const referenceRobot = loadedRobots.find(({ config: robotConfig }) => (
      robotConfig.id === config.visualizationReferenceArm
    ));
    if (!referenceRobot) throw new Error("Generated layout does not define the middle-arm visualization reference");
    // Rendering is middle-arm-relative only. The generated transforms remain the authoritative TF/world values.
    const referenceTransform = referenceRobot.config.transform;
    loadedRobots.forEach(({ robot, config: robotConfig }) => {
      robot.position.sub(new THREE.Vector3(
        referenceTransform.x,
        referenceTransform.y,
        referenceTransform.z,
      ));
    });

    let modelTimer = 0;
    const prepareModels = (attempt = 0) => {
      const meshes = loadedRobots.flatMap(({ robot }) => {
        const robotMeshes: InstanceType<typeof THREE.Mesh>[] = [];
        robot.traverse((object) => {
          if (object instanceof THREE.Mesh) robotMeshes.push(object);
        });
        return robotMeshes;
      });

      const expectedMeshCount = config.robots.reduce((total, robot) => total + robot.expectedMeshCount, 0);
      if (meshes.length < expectedMeshCount) {
        if (attempt >= 160) {
          state.value = "error";
          return;
        }
        modelTimer = window.setTimeout(() => prepareModels(attempt + 1), 50);
        return;
      }

      loadedRobots.forEach(({ robot, config: robotConfig }) => {
        const colors = robotColors[robotConfig.id];
        Object.values(robot.links).forEach((link, index) => {
          link.traverse((object) => {
            if (!(object instanceof THREE.Mesh)) return;
            const source = Array.isArray(object.material) ? object.material[0] : object.material;
            object.material = new THREE.MeshStandardMaterial({
              color: colors[index % colors.length],
              metalness: 0.2,
              roughness: 0.58,
              side: source?.side ?? THREE.FrontSide,
            });
            object.castShadow = true;
            object.receiveShadow = true;
          });
        });
      });

      robotsGroup.updateMatrixWorld(true);
      const bounds = new THREE.Box3().setFromObject(robotsGroup);
      const size = bounds.getSize(new THREE.Vector3());
      const maxDimension = Math.max(size.x, size.y, size.z);
      const focusHeight = Math.max(bounds.min.z + size.z * 0.48, 0.24);
      controls.target.set(0, 0, focusHeight);
      camera.position.set(
        maxDimension * 1.12,
        -maxDimension * 1.48,
        focusHeight + maxDimension * 0.78,
      );
      camera.lookAt(controls.target);
      controls.maxDistance = Math.max(8, maxDimension * 3.2);

      meshCount.value = meshes.length;
      state.value = "ready";
    };

    prepareModels();

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.zoom = width <= 640 ? 0.82 : 1;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    let frame = 0;
    const render = () => {
      frame = window.requestAnimationFrame(render);
      controls.update();
      renderer.render(scene, camera);
    };
    render();

    dispose = () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(modelTimer);
      resizeObserver.disconnect();
      controls.dispose();
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
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
    ref="viewport"
    class="robot-viewport"
    :data-state="state"
    :data-mesh-count="meshCount"
    :data-robot-count="robotCount"
    :data-root-frame="rootFrame"
    :data-visualization-reference-arm="visualizationReferenceArm"
  >
    <canvas ref="canvas" aria-label="基于配置的 RM65 三机械臂 URDF 三维模型" role="img" />
    <div class="model-readout" aria-hidden="true">
      <span>{{ modelNames || "RM65" }} / {{ robotCount ? "L / M / R" : "..." }}</span>
      <span>{{ state === "ready" ? "CONFIG / LIVE" : "CONFIG / LOADING" }}</span>
    </div>
    <p v-if="state === 'loading'" class="viewer-state">正在加载三机械臂模型</p>
    <p v-else-if="state === 'error'" class="viewer-state viewer-error">模型预览暂不可用</p>
  </div>
</template>
