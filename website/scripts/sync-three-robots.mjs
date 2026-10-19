import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import { buildBtCatalog } from "./bt-catalog.mjs";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const websiteDirectory = resolve(scriptDirectory, "..");
const repositoryDirectory = resolve(websiteDirectory, "..");
const configPath = join(repositoryDirectory, "config", "ros", "three_robots.yaml");
const endEffectorsPath = join(repositoryDirectory, "config", "ros", "end_effectors.yaml");
const sourceDescription = join(repositoryDirectory, "src", "rm65_description");
const generatedDirectory = join(websiteDirectory, "docs", ".vitepress", "cache", "public");
const generatedModelsDirectory = join(generatedDirectory, "models");
const robotIds = ["l", "m", "r"];
const supportedModels = new Set(["RM65-6F", "RM65-6FB", "RM65-B", "RM65-B-V", "RM65-6FB-V"]);
const transformFields = ["x", "y", "z", "roll", "pitch", "yaw"];

function fail(message) {
  throw new Error(`Unable to sync website robot assets: ${message}`);
}

function finiteNumber(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value)) fail(`${label} must be a finite number`);
  return value;
}

const source = await readFile(configPath, "utf8");
const layout = YAML.parse(source);
if (!layout || typeof layout !== "object" || Array.isArray(layout) || !layout.robots) {
  fail("config must contain a robots mapping");
}

const configuredIds = Object.keys(layout.robots);
if (configuredIds.length !== robotIds.length || robotIds.some((id) => !configuredIds.includes(id))) {
  fail(`config must define exactly ${robotIds.join(", ")}`);
}

const robots = robotIds.map((id) => {
  const robot = layout.robots[id];
  if (!robot || typeof robot !== "object" || Array.isArray(robot)) fail(`robots.${id} must be a mapping`);
  if (!supportedModels.has(robot.model)) fail(`robots.${id}.model '${robot.model}' is unsupported`);
  if (robot.namespace !== id) fail(`robots.${id}.namespace must be '${id}'`);
  if (robot.frame_prefix !== `${id}/`) fail(`robots.${id}.frame_prefix must be '${id}/'`);
  if (typeof robot.parent_frame !== "string" || !robot.parent_frame || robot.parent_frame.startsWith("/")) {
    fail(`robots.${id}.parent_frame must be a non-empty frame name`);
  }
  const transform = Object.fromEntries(transformFields.map((field) => [field, finiteNumber(robot[field], `robots.${id}.${field}`)]));
  return {
    id,
    model: robot.model,
    namespace: robot.namespace,
    framePrefix: robot.frame_prefix,
    parentFrame: robot.parent_frame,
    transform,
  };
});
if (robots.some((robot) => robot.parentFrame !== robots[0].parentFrame)) {
  fail("all robots must use the same parent frame so the web scene has one TF root");
}

const settings = layout.settings ?? {};
if (!settings || typeof settings !== "object" || Array.isArray(settings)) fail("settings must be a mapping");
const defaultJointPosition = finiteNumber(settings.default_joint_position ?? 0, "settings.default_joint_position");
const modelMeshCounts = new Map();
for (const robot of robots) {
  if (modelMeshCounts.has(robot.model)) continue;
  const urdf = await readFile(join(sourceDescription, "urdf", `${robot.model}.urdf`), "utf8");
  modelMeshCounts.set(robot.model, (urdf.match(/<visual\b/g) ?? []).length);
}
// Optional end effectors (grippers) attached to each arm's flange in the web scene.
const endEffectorSource = YAML.parse(await readFile(endEffectorsPath, "utf8"));
const gripperDefinitions = endEffectorSource?.grippers ?? {};
const gripperMounts = endEffectorSource?.mounts ?? {};
const usedGrippers = new Set();
const endEffectors = {};
for (const id of robotIds) {
  const mount = gripperMounts[id];
  if (!mount) continue;
  const definition = gripperDefinitions[mount.gripper];
  if (!definition) fail(`mounts.${id}.gripper '${mount.gripper}' is not defined under grippers`);
  const vector = (value, label) => {
    if (!Array.isArray(value) || value.length !== 3) fail(`${label} must be a 3-element list`);
    return value.map((entry, index) => finiteNumber(entry, `${label}[${index}]`));
  };
  usedGrippers.add(mount.gripper);
  endEffectors[id] = {
    gripper: mount.gripper,
    parentLink: mount.parent_link,
    xyz: vector(mount.xyz, `mounts.${id}.xyz`),
    rpy: vector(mount.rpy, `mounts.${id}.rpy`),
  };
}
const grippers = {};
for (const name of usedGrippers) {
  const definition = gripperDefinitions[name];
  const urdf = await readFile(join(sourceDescription, "urdf", definition.urdf), "utf8");
  grippers[name] = {
    urdf: definition.urdf,
    drivingJoint: definition.driving_joint,
    closedRad: finiteNumber(definition.closed_rad, `grippers.${name}.closed_rad`),
    openRad: finiteNumber(definition.open_rad, `grippers.${name}.open_rad`),
    expectedMeshCount: (urdf.match(/<visual\b/g) ?? []).length,
  };
}
// Optional shared pedestal under the three bases (visual only, world frame). See three_robots.yaml.
let pedestal = null;
if (layout.pedestal !== undefined) {
  const block = layout.pedestal;
  if (!block || typeof block !== "object" || Array.isArray(block)) fail("pedestal must be a mapping");
  if (block.frame !== robots[0].parentFrame) fail(`pedestal.frame must be '${robots[0].parentFrame}'`);
  const pair = (value, label) => {
    if (!Array.isArray(value) || value.length !== 2) fail(`${label} must be a 2-element list`);
    return value.map((entry, index) => finiteNumber(entry, `${label}[${index}]`));
  };
  const centerXy = pair(block.center_xy, "pedestal.center_xy");
  const sizeXy = pair(block.size_xy, "pedestal.size_xy");
  if (sizeXy.some((value) => value <= 0)) fail("pedestal.size_xy must be positive");
  const topZ = finiteNumber(block.top_z, "pedestal.top_z");
  const bottomZ = finiteNumber(block.bottom_z, "pedestal.bottom_z");
  if (!(topZ > bottomZ)) fail("pedestal.top_z must be above pedestal.bottom_z");
  if (typeof block.color !== "string" || !/^#[0-9a-fA-F]{6}$/.test(block.color)) fail("pedestal.color must be '#rrggbb'");
  pedestal = { frame: block.frame, centerXy, sizeXy, topZ, bottomZ, color: block.color };
}
const generatedLayout = {
  source: "config/ros/three_robots.yaml",
  rootFrame: robots[0].parentFrame,
  // The visualizer translates this arm to its display origin; robot transforms stay in TF/world coordinates.
  visualizationReferenceArm: "m",
  defaultJointPosition,
  robots: robots.map((robot) => ({ ...robot, expectedMeshCount: modelMeshCounts.get(robot.model) })),
  grippers,
  endEffectors,
  pedestal,
};


// Numbers and mode lists that the interactive documentation components display. They are copied
// from the authoritative configs at build time so the docs cannot drift from them.
const rosConfigDirectory = join(repositoryDirectory, "config", "ros");
const motionConfig = YAML.parse(await readFile(join(rosConfigDirectory, "realman_motion.yaml"), "utf8"));
const pikaConfig = YAML.parse(await readFile(join(rosConfigDirectory, "pika_config.yaml"), "utf8"));
const keyboardConfig = YAML.parse(await readFile(join(rosConfigDirectory, "keyboard_control.yaml"), "utf8"));
const gripperConfig = YAML.parse(await readFile(join(rosConfigDirectory, "gripper.yaml"), "utf8"));
const policyTaskConfig = YAML.parse(await readFile(join(rosConfigDirectory, "policy_task.yaml"), "utf8")).realman_bt_executor.ros__parameters.policy_task;
const controlTree = await readFile(join(repositoryDirectory, "config", "behavior-trees", "control.xml"), "utf8");
const calibrationConfig = YAML.parse(await readFile(join(rosConfigDirectory, "camera_calibration.yaml"), "utf8"));
const docsData = {
  source: ["realman_motion.yaml", "pika_config.yaml", "keyboard_control.yaml", "gripper.yaml", "control.xml", "camera_calibration.yaml", "policy_task.yaml"],
  motion: motionConfig.robots,
  // What the behavior tree supervises while the policy runs (config/ros/policy_task.yaml).
  policyTask: {
    cycles: policyTaskConfig.cycles,
    attempts: policyTaskConfig.attempts,
    activation: policyTaskConfig.activation,
    maxAttemptSec: policyTaskConfig.max_attempt_sec,
    stallSec: policyTaskConfig.stall.sec,
    maxJointSpeedDps: policyTaskConfig.max_joint_speed_dps,
    j5FloorDeg: policyTaskConfig.joint_envelope_deg.lo[4],
  },
  pika: { velocity: pikaConfig.pika_velocity, mixed: pikaConfig.pika_mixed },
  keyboard: {
    linearSpeedFraction: keyboardConfig.linear_speed_fraction,
    angularSpeedFraction: keyboardConfig.angular_speed_fraction,
  },
  grippers: Object.fromEntries(
    (gripperConfig.buses ?? []).flatMap((bus) => bus.grippers ?? []).map((gripper) => [
      gripper.name,
      {
        openPosition: gripper.open_position,
        closePosition: gripper.close_position,
        minPosition: gripper.min_position,
        maxPosition: gripper.max_position,
      },
    ]),
  ),
  // Hand-eye calibration contract shown by the calibration explainer: board, frames, sample gate and solver limits.
  calibration: {
    board: {
      dictionary: calibrationConfig.board.dictionary,
      squaresX: calibrationConfig.board.squares_x,
      squaresY: calibrationConfig.board.squares_y,
      squareLengthM: calibrationConfig.board.square_length_m,
      markerLengthM: calibrationConfig.board.marker_length_m,
      outerWidthM: calibrationConfig.board.outer_width_m,
      outerHeightM: calibrationConfig.board.outer_height_m,
      minimumCorners: calibrationConfig.board.minimum_corners,
    },
    arms: Object.entries(calibrationConfig.robots).map(([id, robot]) => ({
      id,
      baseFrame: robot.base_frame,
      endEffectorFrame: robot.end_effector_frame,
      opticalFrame: calibrationConfig.cameras[robot.camera_id].optical_frame,
    })),
    minimumSamplesPerArm: calibrationConfig.sampling.minimum_samples_per_arm,
    handEyeMethod: calibrationConfig.solver.hand_eye_method,
    maximumHandEyeResidual: calibrationConfig.solver.maximum_hand_eye_residual,
    maximumRelativeTranslationSpreadM: calibrationConfig.solver.maximum_relative_translation_spread_m,
    maximumRelativeRotationSpreadRad: calibrationConfig.solver.maximum_relative_rotation_spread_rad,
  },
  // Input-mode catalog in XML order: the same source the executor uses.
  modes: [...controlTree.matchAll(/<InputModeGuard\s+mode="([a-z]+)"\s+label="([^"]*)"\s+selectable="(true|false)"/g)].map(
    (match) => ({ id: match[1], label: match[2], selectable: match[3] === "true" }),
  ),
  // The production tree and every registered node's ports, read from control.xml and the C++ sources
  // (BtTreeExplorer on the behavior-tree node reference page).
  bt: await buildBtCatalog(repositoryDirectory),
};

await rm(generatedDirectory, { recursive: true, force: true });
await mkdir(join(websiteDirectory, "docs", ".vitepress", "cache"), { recursive: true });
await mkdir(generatedModelsDirectory, { recursive: true });
const modelNames = [...new Set(robots.map((robot) => robot.model))];
for (const model of modelNames) {
  await cp(join(sourceDescription, "urdf", `${model}.urdf`), join(generatedModelsDirectory, `${model}.urdf`));
  await cp(
    join(sourceDescription, "meshes", model),
    join(generatedModelsDirectory, "rm65_description", "meshes", model),
    { recursive: true },
  );
}
for (const name of usedGrippers) {
  const { urdf, mesh_dir: meshDir } = gripperDefinitions[name];
  await cp(join(sourceDescription, "urdf", urdf), join(generatedModelsDirectory, urdf));
  await cp(
    join(sourceDescription, "meshes", meshDir),
    join(generatedModelsDirectory, "rm65_description", "meshes", meshDir),
    { recursive: true },
  );
}
// Documentation screenshots live outside docs/ because the site's public directory is generated (see above).
await cp(join(websiteDirectory, "docs-assets", "screenshots"), join(generatedDirectory, "screenshots"), { recursive: true });
await writeFile(join(generatedDirectory, "docs-data.json"), `${JSON.stringify(docsData, null, 2)}\n`);
await writeFile(join(generatedDirectory, "three-robots.json"), `${JSON.stringify(generatedLayout, null, 2)}\n`);
console.log(`Synced ${robots.length} robots (${modelNames.join(", ")}) from ${configPath}`);
