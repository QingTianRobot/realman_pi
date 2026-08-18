import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const websiteDirectory = resolve(repositoryDirectory, "website");
const requireFromWebsite = createRequire(resolve(websiteDirectory, "package.json"));
const { defineConfig, devices } = requireFromWebsite("@playwright/test");

export default defineConfig({
  testDir: resolve(websiteDirectory, "tests/web-control"),
  outputDir: resolve(websiteDirectory, "test-results/web-control"),
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4174/",
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROME_PATH || "/usr/bin/google-chrome",
      args: ["--no-sandbox"],
    },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 412, height: 915 } } },
  ],
  webServer: {
    command: "npm run dev:web-control",
    cwd: websiteDirectory,
    url: "http://127.0.0.1:4174/",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});

