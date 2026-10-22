import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// The training console UI shares website/node_modules with the other Vite apps. Its bundle is checked in under
// realman_training/static/ and served by web_server.py. `npm run dev:training` proxies /api (and the job-log
// WebSocket) to the e2e fake backend on :4180, or to TRAINING_API.
const repositoryDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const websiteDirectory = resolve(repositoryDirectory, "website");
const webDirectory = resolve(repositoryDirectory, "src/training/realman_training/web");
const staticDirectory = resolve(repositoryDirectory, "src/training/realman_training/realman_training/static");
const requireFromWebsite = createRequire(resolve(websiteDirectory, "package.json"));
const { defineConfig } = requireFromWebsite("vite");
const api = process.env.TRAINING_API || "http://127.0.0.1:4180";

export default defineConfig({
  root: webDirectory,
  cacheDir: resolve(websiteDirectory, "node_modules/.vite-realman-training"),
  base: "/",
  // Sources live outside website/, so bare imports resolve through website/node_modules explicitly.
  resolve: { alias: { marked: resolve(websiteDirectory, "node_modules/marked") } },
  build: { outDir: staticDirectory, emptyOutDir: true, sourcemap: false },
  server: { host: "127.0.0.1", port: 4176, strictPort: true, proxy: { "/api": { target: api, ws: true } } },
});
