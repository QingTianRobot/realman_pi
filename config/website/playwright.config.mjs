import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const websiteDirectory = resolve(repositoryDirectory, "website");
// Website dependencies are installed under website/node_modules, while this
// authoritative configuration remains under the repository-root config/ tree.
const requireFromWebsite = createRequire(resolve(websiteDirectory, "package.json"));
const { defineConfig, devices } = requireFromWebsite("@playwright/test");

export default defineConfig({
  testDir: resolve(websiteDirectory, "tests"),
  // The browser action console has its own Vite server and configuration.
  testIgnore: ["web-control/**"],
  outputDir: resolve(websiteDirectory, "test-results"),
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173/realman_pi/",
    launchOptions: {
      // CI and the development workstation provide Chrome at this path. Set
      // PLAYWRIGHT_CHROME_PATH when another compatible binary is required.
      executablePath: process.env.PLAYWRIGHT_CHROME_PATH || "/usr/bin/google-chrome",
      args: ["--no-sandbox"],
    },
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], viewport: { width: 412, height: 915 } },
    },
  ],
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4173",
    cwd: websiteDirectory,
    url: "http://127.0.0.1:4173/realman_pi/",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
