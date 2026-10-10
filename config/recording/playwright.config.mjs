import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const websiteDirectory = resolve(repositoryDirectory, "website");
const requireFromWebsite = createRequire(resolve(websiteDirectory, "package.json"));
const { defineConfig, devices } = requireFromWebsite("@playwright/test");

export default defineConfig({
  testDir: resolve(websiteDirectory, "tests"),
  testMatch: "recording-replay.spec.ts",
  outputDir: resolve(websiteDirectory, "test-results/recording"),
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4175/",
    ...devices["Desktop Chrome"],
    launchOptions: { args: ["--no-sandbox"] },
  },
  // Cover the normal desktop workspace and the narrow breakpoint where the
  // three-column episode/viewer/inspector layout collapses to a vertical flow.
  projects: [
    { name: "recording-replay", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } },
    { name: "recording-replay-mobile", use: { ...devices["Pixel 7"], viewport: { width: 412, height: 915 } } },
  ],
  webServer: {
    // Recording Vite middleware supplies its browser-safe /api/layout fixture;
    // API routes specific to replay are mocked by the test itself.
    command: "npm run dev:recording -- --host 127.0.0.1 --port 4175 --strictPort",
    cwd: websiteDirectory,
    url: "http://127.0.0.1:4175/",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
