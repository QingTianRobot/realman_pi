import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

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
const generatedLayout = {
  source: "config/ros/three_robots.yaml",
  rootFrame: robots[0].parentFrame,
  // The visualizer translates this arm to its display origin; robot transforms stay in TF/world coordinates.
  visualizationReferenceArm: "m",
  defaultJointPosition,
  robots: robots.map((robot) => ({ ...robot, expectedMeshCount: modelMeshCounts.get(robot.model) })),
  grippers,
  endEffectors,
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
await writeFile(join(generatedDirectory, "three-robots.json"), `${JSON.stringify(generatedLayout, null, 2)}\n`);
console.log(`Synced ${robots.length} robots (${modelNames.join(", ")}) from ${configPath}`);
