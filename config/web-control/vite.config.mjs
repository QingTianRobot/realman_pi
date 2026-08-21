import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const repositoryDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const websiteDirectory = resolve(repositoryDirectory, "website");
const webDirectory = resolve(repositoryDirectory, "src/driver/realman_web_control/web");
const staticDirectory = resolve(
  repositoryDirectory,
  "src/driver/realman_web_control/realman_web_control/static",
);
const requireFromWebsite = createRequire(resolve(websiteDirectory, "package.json"));
const { defineConfig } = requireFromWebsite("vite");
const YAML = requireFromWebsite("yaml");
const descriptionDirectory = resolve(repositoryDirectory, "src/rm65_description");

async function devManifest() {
  const layout = YAML.parse(await readFile(resolve(repositoryDirectory, "config/ros/three_robots.yaml"), "utf8"));
  const motion = YAML.parse(await readFile(resolve(repositoryDirectory, "config/ros/realman_motion.yaml"), "utf8"));
  const coordinates = YAML.parse(await readFile(resolve(repositoryDirectory, "config/ros/realman_coordinates.yaml"), "utf8"));
  const robots = await Promise.all(["l", "m", "r"].map(async (id) => {
    const item = layout.robots[id];
    const settings = motion.robots[id];
    const coordinate = coordinates.robots[id];
    const tool = coordinate.tools[coordinate.default_tool];
    const work = coordinate.work_frames[coordinate.default_work];
    const urdf = await readFile(resolve(descriptionDirectory, "urdf", `${item.model}.urdf`), "utf8");
    const joints = [...urdf.matchAll(/<joint\s+name="(joint_[1-6])"[\s\S]*?<limit\s+lower="([^"]+)"\s+upper="([^"]+)"/g)]
      .sort((a, b) => a[1].localeCompare(b[1], undefined, { numeric: true }))
      .map((match) => ({ name: match[1], lower_rad: Number(match[2]), upper_rad: Number(match[3]), lower_deg: Number(match[2]) * 180 / Math.PI, upper_deg: Number(match[3]) * 180 / Math.PI }));
    return {
      id, model: item.model, parent_frame: item.parent_frame, transform: { x: item.x, y: item.y, z: item.z, roll: item.roll, pitch: item.pitch, yaw: item.yaw },
      urdf_url: `/models/urdf/${item.model}.urdf`, package_root_url: "/models", joints,
      frames: { base: { type: 0, name: "base", frame_id: `${id}/base_link` }, work: { type: 1, name: work.controller_name, frame_id: work.ros_frame_id }, tool: { type: 2, name: tool.controller_name, frame_id: tool.ros_frame_id } },
      motion: settings,
    };
  }));
  return { version: 1, root_frame: robots[0].parent_frame || layout.robots.l.parent_frame, default_joint_position_rad: layout.settings.default_joint_position || 0, robots };
}

function devApiPlugin() {
  return {
    name: "realman-web-control-dev-api",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        try {
          const url = request.url?.split("?", 1)[0] || "/";
          if (url === "/api/layout") {
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify(await devManifest()));
            return;
          }
          if (url === "/api/calibration") {
            const calibration = YAML.parse(
              await readFile(resolve(repositoryDirectory, "config/ros/camera_calibration.yaml"), "utf8"),
            );
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify(calibration));
            return;
          }
          if (url === "/api/calibration/sessions" && request.method === "GET") {
            // Local UI development has no ROS log mount; production serves recoverable sessions.
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ sessions: [], deleted_session_ids: [] }));
            return;
          }
          if (url.startsWith("/api/calibration/sessions/") && request.method === "DELETE") {
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ deleted_session_id: decodeURIComponent(url.split("/").at(-1) || "") }));
            return;
          }
          if (url.startsWith("/models/")) {
            const relative = url.slice("/models/".length);
            const candidate = resolve(descriptionDirectory, relative);
            if (candidate.startsWith(`${descriptionDirectory}/`) && await stat(candidate).then(() => true, () => false)) {
              const contents = await readFile(candidate);
              response.end(contents);
              return;
            }
          }
        } catch {
          // Vite's regular 404 handler provides the browser-facing response.
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [devApiPlugin()],
  root: webDirectory,
  cacheDir: resolve(websiteDirectory, "node_modules/.vite-realman-web-control"),
  base: "/",
  resolve: {
    alias: {
      three: resolve(websiteDirectory, "node_modules/three"),
      "urdf-loader": resolve(websiteDirectory, "node_modules/urdf-loader"),
    },
  },
  build: {
    outDir: staticDirectory,
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      // Keep motion control and calibration as separate operator pages while
      // sharing the same authenticated WebSocket/ROS bridge.
      input: {
        control: resolve(webDirectory, "index.html"),
        calibration: resolve(webDirectory, "calibration.html"),
      },
    },
  },
  server: {
    host: "127.0.0.1",
    port: 4174,
    strictPort: true,
  },
});
