import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// The recording dashboard is a read-only viewer built with the same Vite/Three.js/
// urdf-loader toolchain as realman_web_control, sharing website/node_modules.  Its
// bundle is checked into realman_recording/static/ and served by recording_web_server.
const repositoryDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const websiteDirectory = resolve(repositoryDirectory, "website");
const webDirectory = resolve(repositoryDirectory, "src/recording/realman_recording/web");
const staticDirectory = resolve(repositoryDirectory, "src/recording/realman_recording/realman_recording/static");
const descriptionDirectory = resolve(repositoryDirectory, "src/rm65_description");
const requireFromWebsite = createRequire(resolve(websiteDirectory, "package.json"));
const { defineConfig } = requireFromWebsite("vite");
const YAML = requireFromWebsite("yaml");

// Minimal, display-only layout: arm model + world transform + URDF URL.  Unlike
// web_control there is no motion/coordinates/frames contract to serve.
async function recordingManifest() {
  const layout = YAML.parse(await readFile(resolve(repositoryDirectory, "config/ros/three_robots.yaml"), "utf8"));
  const robots = ["l", "m", "r"].map((id) => {
    const item = layout.robots[id];
    return {
      id,
      model: item.model,
      transform: { x: item.x, y: item.y, z: item.z, roll: item.roll, pitch: item.pitch, yaw: item.yaw },
      urdf_url: `/models/urdf/${item.model}.urdf`,
      package_root_url: "/models",
    };
  });
  return { version: 1, default_joint_position_rad: layout.settings?.default_joint_position || 0, robots };
}

function devApiPlugin() {
  return {
    name: "realman-recording-dev-api",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        try {
          const url = request.url?.split("?", 1)[0] || "/";
          if (url === "/api/layout") {
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify(await recordingManifest()));
            return;
          }
          if (url.startsWith("/models/")) {
            const relative = url.slice("/models/".length);
            const candidate = resolve(descriptionDirectory, relative);
            if (candidate.startsWith(`${descriptionDirectory}/`) && await stat(candidate).then(() => true, () => false)) {
              response.end(await readFile(candidate));
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
  cacheDir: resolve(websiteDirectory, "node_modules/.vite-realman-recording"),
  base: "/",
  resolve: {
    alias: {
      three: resolve(websiteDirectory, "node_modules/three"),
      "urdf-loader": resolve(websiteDirectory, "node_modules/urdf-loader"),
      gridstack: resolve(websiteDirectory, "node_modules/gridstack"),
    },
  },
  build: {
    outDir: staticDirectory,
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: { input: { recording: resolve(webDirectory, "index.html") } },
  },
  server: { host: "127.0.0.1", port: 4175, strictPort: true },
});
