<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

const canvas = ref<HTMLCanvasElement | null>(null);
const viewport = ref<HTMLElement | null>(null);
const state = ref<"loading" | "ready" | "error">("loading");
const meshCount = ref(0);

let dispose: (() => void) | undefined;

onMounted(async () => {
  if (!canvas.value || !viewport.value) return;

  try {
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
    controls.minDistance = 0.65;
    controls.maxDistance = 3.2;
    controls.autoRotate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    controls.autoRotateSpeed = 0.55;

    scene.add(new THREE.HemisphereLight(0xf6faf8, 0x354248, 2.4));
    const keyLight = new THREE.DirectionalLight(0xffffff, 4.2);
    keyLight.position.set(2.2, -2.8, 3.6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xd7794c, 2.1);
    rimLight.position.set(-2.4, 1.8, 2.2);
    scene.add(rimLight);

    const grid = new THREE.GridHelper(2.8, 14, 0x718087, 0xb8c0bd);
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
    const base = import.meta.env.BASE_URL;
    loader.packages = {
      rm65_description: `${base}models/rm65_description`,
    };

    let modelTimer = 0;
    loader.load(
      `${base}models/RM65-B.urdf`,
      (robot) => {
        robot.setJointValue("joint_1", 0.28);
        robot.setJointValue("joint_2", -0.62);
        robot.setJointValue("joint_3", 1.02);
        robot.setJointValue("joint_4", 0.35);
        robot.setJointValue("joint_5", 0.52);
        robot.setJointValue("joint_6", -0.24);

        scene.add(robot);

        const prepareModel = (attempt = 0) => {
          const meshes: InstanceType<typeof THREE.Mesh>[] = [];
          robot.traverse((object) => {
            if (object instanceof THREE.Mesh) meshes.push(object);
          });

          if (meshes.length < 7) {
            if (attempt >= 120) {
              state.value = "error";
              return;
            }
            modelTimer = window.setTimeout(() => prepareModel(attempt + 1), 50);
            return;
          }

          const colors = [0xcbd2cf, 0x17707b, 0xd5dbd8, 0x3c4b50, 0xc75e35, 0xb9c2bf, 0x17646d];
          Object.values(robot.links).forEach((link, index) => {
            link.traverse((object) => {
              if (!(object instanceof THREE.Mesh)) return;
              const source = Array.isArray(object.material) ? object.material[0] : object.material;
              const material = new THREE.MeshStandardMaterial({
                color: colors[index % colors.length],
                metalness: 0.2,
                roughness: 0.58,
                side: source?.side ?? THREE.FrontSide,
              });
              object.material = material;
              object.castShadow = true;
              object.receiveShadow = true;
            });
          });

          robot.updateMatrixWorld(true);
          const bounds = new THREE.Box3().setFromObject(robot);
          const center = bounds.getCenter(new THREE.Vector3());
          robot.position.set(-center.x, -center.y, -bounds.min.z);
          robot.updateMatrixWorld(true);

          const fittedBounds = new THREE.Box3().setFromObject(robot);
          const size = fittedBounds.getSize(new THREE.Vector3());
          const maxDimension = Math.max(size.x, size.y, size.z);
          const focusHeight = Math.max(size.z * 0.46, 0.26);
          controls.target.set(0, 0, focusHeight);
          camera.position.set(maxDimension * 1.45, -maxDimension * 1.75, maxDimension * 1.15);
          camera.lookAt(controls.target);

          meshCount.value = meshes.length;
          state.value = "ready";
        };

        prepareModel();
      },
      undefined,
      () => {
        state.value = "error";
      },
    );

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
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
  <div ref="viewport" class="robot-viewport" :data-state="state" :data-mesh-count="meshCount">
    <canvas ref="canvas" aria-label="RM65-B URDF 三维模型" role="img" />
    <div class="model-readout" aria-hidden="true">
      <span>RM65-B</span>
      <span>URDF / LIVE</span>
    </div>
    <p v-if="state === 'loading'" class="viewer-state">正在加载模型</p>
    <p v-else-if="state === 'error'" class="viewer-state viewer-error">模型预览暂不可用</p>
  </div>
</template>
