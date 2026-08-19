import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { expect, test } from "@playwright/test";

const execFileAsync = promisify(execFile);
const functionsZshPath = fileURLToPath(new URL("../../functions.zsh", import.meta.url));
const deployWorkflowPath = fileURLToPath(new URL("../../.github/workflows/deploy-pages.yml", import.meta.url));

async function publicHelperNames() {
  const source = await readFile(functionsZshPath, "utf8");
  return Array.from(source.matchAll(/^(rm65_[a-z0-9_]+)\(\) \{/gm), (match) => match[1]).sort();
}

test("startup entries page renders the current helper index", async ({ page }) => {
  await page.goto("development/startup-entries");

  await expect(page.locator("h1")).toHaveText("启动入口索引");
  await expect(page.getByText("rm65_docker_bringup_model")).toBeVisible();
  await expect(page.getByText("rm65_docker_web_control_start")).toBeVisible();
});

test("startup entries page documents every public helper", async ({ page }) => {
  await page.goto("development/startup-entries");
  const pageText = await page.locator("main").textContent();

  for (const helperName of await publicHelperNames()) {
    expect(pageText).toContain(helperName);
  }
});

test("rm65_project_help mentions startup entry descriptions", async () => {
  const { stdout } = await execFileAsync(
    "zsh",
    ["-lc", `source "${functionsZshPath.replace(/"/g, '\\"')}" && rm65_project_help`],
    { maxBuffer: 1_000_000 },
  );

  expect(stdout).toContain("启动入口索引");
  expect(stdout).toContain("rm65_docker_bringup_model");
  expect(stdout).toContain("rm65_docker_web_control_start");
});

test("Pages workflow rebuilds when startup helper sources change", async () => {
  const workflow = await readFile(deployWorkflowPath, "utf8");

  expect(workflow).toContain('"functions.zsh"');
  expect(workflow).toContain('"config/docker/**"');
});
