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
  await expect(page.getByText("rm65_deploy_sync")).toBeVisible();
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
  expect(stdout).toContain("rm65_deploy_sync");
  expect(stdout).toContain("rm65_camera_status");
  expect(stdout).toContain("8100-8103");
  expect(stdout).toContain("rm65_docker_camera_rviz");
});

test("functions load ROS runtime defaults from project env", async () => {
  const escapedPath = functionsZshPath.replace(/"/g, '\\"');
  const { stdout } = await execFileAsync(
    "zsh",
    [
      "-lc",
      [
        "unset ROS_DOMAIN_ID ROS_LOCALHOST_ONLY DISPLAY XAUTHORITY",
        `source "${escapedPath}"`,
        'printf "domain=%s\\nlocalhost=%s\\ndisplay=%s\\nxauthority=%s\\n" "$ROS_DOMAIN_ID" "$ROS_LOCALHOST_ONLY" "${DISPLAY-unset}" "${XAUTHORITY-unset}"',
        "export ROS_DOMAIN_ID=42",
        `source "${escapedPath}"`,
        'printf "manual_domain=%s\\n" "$ROS_DOMAIN_ID"',
      ].join("; "),
    ],
    { maxBuffer: 1_000_000 },
  );

  expect(stdout).toContain("domain=0");
  expect(stdout).toContain("localhost=0");
  expect(stdout).toContain("display=unset");
  expect(stdout).toContain("xauthority=unset");
  expect(stdout).toContain("manual_domain=42");
});

test("Pages workflow rebuilds when startup helper sources change", async () => {
  const workflow = await readFile(deployWorkflowPath, "utf8");

  expect(workflow).toContain('"functions.zsh"');
  expect(workflow).toContain('"config/docker/**"');
});
