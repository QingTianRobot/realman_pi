import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { expect, test, type Locator } from "@playwright/test";
import YAML from "yaml";

async function canvasChecksum(locator: Locator) {
  return locator.evaluate((element: HTMLCanvasElement) => {
    const gl = element.getContext("webgl2") || element.getContext("webgl");
    if (!gl) return { coloredPixels: 0, checksum: 0 };

    const pixels = new Uint8Array(element.width * element.height * 4);
    gl.readPixels(0, 0, element.width, element.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    let coloredPixels = 0;
    let checksum = 0;
    const stride = Math.max(4, Math.floor(pixels.length / 20_000 / 4) * 4);
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] > 0 && pixels[i] + pixels[i + 1] + pixels[i + 2] > 0) coloredPixels += 1;
    }
    for (let i = 0; i < pixels.length; i += stride) {
      checksum = (checksum + pixels[i] * 3 + pixels[i + 1] * 5 + pixels[i + 2] * 7) % 1_000_000_007;
    }
    return { coloredPixels, checksum };
  });
}

test("homepage renders the configured three-arm scene without layout overflow", async ({ page }, testInfo) => {
  await page.goto("./");
  await expect(page.getByRole("heading", { level: 1, name: "RealMan RM65" })).toBeVisible();

  const viewer = page.locator(".robot-viewport");
  await expect(viewer).toHaveAttribute("data-state", "ready", { timeout: 30_000 });
  await expect(viewer).toHaveAttribute("data-robot-count", "3");
  await expect(viewer).toHaveAttribute("data-root-frame", "world");
  await expect(viewer).toHaveAttribute("data-mesh-count", /^(?:2[1-9]|[3-9][0-9]+)$/);
  const canvas = viewer.locator("canvas");
  await expect(canvas).toBeVisible();
  await page.waitForTimeout(500);

  const first = await canvasChecksum(canvas);
  expect(first.coloredPixels).toBeGreaterThan(500);
  await page.waitForTimeout(700);
  const second = await canvasChecksum(canvas);
  expect(second.checksum).not.toBe(first.checksum);

  const layout = await page.evaluate(() => {
    const signal = document.querySelector(".signal-band")?.getBoundingClientRect();
    const readout = document.querySelector(".model-readout")?.getBoundingClientRect();
    const actions = [...document.querySelectorAll<HTMLElement>(".rm-action")];
    return {
      viewportHeight: window.innerHeight,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      signalTop: signal?.top ?? Number.POSITIVE_INFINITY,
      actionsFit: actions.every((action) => action.scrollWidth <= action.clientWidth + 1),
      readoutFits:
        readout !== undefined &&
        readout.left >= 0 &&
        readout.right <= window.innerWidth &&
        readout.top >= 0 &&
        readout.bottom <= window.innerHeight,
    };
  });

  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
  expect(layout.signalTop).toBeLessThan(layout.viewportHeight);
  expect(layout.actionsFit).toBe(true);
  expect(layout.readoutFits).toBe(true);

  await expect(page.getByText("l / m / r", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("config/ros/three_robots.yaml", { exact: false }).first()).toBeVisible();

  await page.screenshot({ path: testInfo.outputPath("homepage.png"), fullPage: true });
});

test("generated web layout matches the authoritative three-arm transforms", async ({ request }) => {
  const response = await request.get("three-robots.json");
  expect(response.ok()).toBe(true);
  const layout = await response.json();
  const source = YAML.parse(await readFile(resolve("../config/ros/three_robots.yaml"), "utf8"));

  expect(layout.source).toBe("config/ros/three_robots.yaml");
  expect(layout.rootFrame).toBe(source.robots.l.parent_frame);
  expect(layout.defaultJointPosition).toBe(source.settings.default_joint_position);
  for (const robot of layout.robots) {
    const expected = source.robots[robot.id];
    expect(robot.model).toBe(expected.model);
    expect(robot.namespace).toBe(expected.namespace);
    expect(robot.framePrefix).toBe(expected.frame_prefix);
    expect(robot.parentFrame).toBe(expected.parent_frame);
    expect(robot.transform).toEqual({
      x: expected.x,
      y: expected.y,
      z: expected.z,
      roll: expected.roll,
      pitch: expected.pitch,
      yaw: expected.yaw,
    });
  }
});

test("documentation routes render", async ({ page }) => {
  for (const route of [
    "guide/getting-started",
    "models/",
    "architecture/tf-tree",
    "architecture/package",
    "development/",
    "development/documentation-workflow",
    "development/three-arm-visualization",
    "development/xbox-controller",
    "development/system-bringup",
    "troubleshooting",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
  }
});
