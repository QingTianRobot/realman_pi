import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const websiteDirectory = resolve(repositoryDirectory, "website");
const requireFromWebsite = createRequire(resolve(websiteDirectory, "package.json"));
const { defineConfig, devices } = requireFromWebsite("@playwright/test");
// The real web_server.py on a fixture world with fake steps (src/training/realman_training/test/web_fake.py).
const python = process.env.REALMAN_TRAINING_PYTHON || "python3";

export default defineConfig({
  testDir: resolve(websiteDirectory, "tests/training-console"),
  outputDir: resolve(websiteDirectory, "test-results/training-console"),
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4180/",
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROME_PATH || "/usr/bin/google-chrome",
      args: ["--no-sandbox"],
    },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    // Phones run the layout checks only (tests tagged @mobile); the flows run once, on desktop.
    { name: "mobile", grep: /@mobile/, use: { ...devices["Pixel 7"], viewport: { width: 412, height: 915 } } },
  ],
  webServer: {
    command: `npm run build:training && "${python}" ../src/training/realman_training/test/web_fake.py --port 4180`,
    cwd: websiteDirectory,
    url: "http://127.0.0.1:4180/api/health",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
