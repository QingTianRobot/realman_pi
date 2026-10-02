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
  await expect(viewer).toHaveAttribute("data-visualization-reference-arm", "m");
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
  expect(layout.visualizationReferenceArm).toBe("m");
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

test("authoritative layout retains the calibrated production arrangement", async () => {
  const source = YAML.parse(await readFile(resolve("../config/ros/three_robots.yaml"), "utf8"));

  // Guard against accidentally publishing the former symmetric planning layout
  // instead of the current three-arm ChArUco calibration result.
  expect(source.robots.m.x).not.toBe(0);
  expect(source.robots.m.y).not.toBe(0);
  expect(source.robots.r.x).not.toBe(1);
  expect(source.robots.r.y).not.toBe(0);
});

test("documentation routes render", async ({ page }) => {
  for (const route of [
    "guide/getting-started",
    "guide/cameras",
    "guide/remote-rviz",
    "models/",
    "architecture/overview",
    "architecture/tf-tree",
    "architecture/package",
    "reference/ros-interfaces",
    "reference/configuration",
    "reference/cli-and-env",
    "development/",
    "development/testing",
    "development/pika-teleop",
    "development/documentation-workflow",
    "development/startup-entries",
    "development/camera-calibration",
    "development/realman-python-driver",
    "development/realman-driver-scaffold",
    "development/realman-action-development",
    "development/realman-web-control",
    "development/three-arm-visualization",
    "development/xbox-controller",
    "development/system-bringup",
    "development/behavior-tree-control",
    "development/behavior-tree-motion",
    "development/gripper-control",
    "development/policy-bridge",
    "development/velocity-follow-test",
    "troubleshooting",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
  }
});

test("documentation tables share the content width without touching navigation", async ({ page }) => {
  await page.goto("development/startup-entries");
  await page.waitForSelector('.VPDoc .vp-doc table', { timeout: 10_000 });

  const layout = await page.evaluate(() => {
    const content = document.querySelector<HTMLElement>(".VPDoc .content-container");
    const tables = [...document.querySelectorAll<HTMLTableElement>(".VPDoc .vp-doc table")];
    const contentRect = content?.getBoundingClientRect();
    return {
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      contentLeft: contentRect?.left ?? Number.POSITIVE_INFINITY,
      contentRight: contentRect?.right ?? Number.NEGATIVE_INFINITY,
      tables: tables.map((table) => {
        const rect = table.getBoundingClientRect();
        return { left: rect.left, right: rect.right, width: rect.width };
      }),
    };
  });

  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
  expect(layout.tables.length).toBeGreaterThan(0);
  for (const table of layout.tables) {
    expect(table.left).toBeGreaterThanOrEqual(layout.contentLeft - 1);
    expect(table.right).toBeLessThanOrEqual(layout.contentRight + 1);
    expect(table.width).toBeCloseTo(layout.contentRight - layout.contentLeft, 0);
  }
});

test("repository tree preserves its multiline structure", async ({ page }) => {
  await page.goto("architecture/package");

  const repositoryTree = page.locator("main pre code").filter({ hasText: "realman_pi/" });
  await expect(repositoryTree).toBeVisible();

  const lines = (await repositoryTree.textContent())?.trim().split("\n") ?? [];
  expect(lines.length).toBeGreaterThan(20);
  // Lines carry trailing descriptions, so match the tree branch prefix.
  expect(lines.some((line) => line.startsWith("├── config/"))).toBe(true);
  expect(lines).toContain("└── README.md");
});

test("mermaid diagrams render inside the column and open a zoom viewer", async ({ page }) => {
  await page.goto("architecture/overview");
  const diagram = page.locator(".vp-doc .mermaid svg").first();
  await expect(diagram).toBeVisible({ timeout: 15_000 });

  const layout = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
    frames: [...document.querySelectorAll<HTMLElement>(".vp-doc .mermaid")].map((frame) => {
      const rect = frame.getBoundingClientRect();
      return { right: rect.right, height: rect.height };
    }),
  }));
  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
  for (const frame of layout.frames) {
    expect(frame.right).toBeLessThanOrEqual(layout.viewportWidth + 1);
    // Tall diagrams scroll inside their frame instead of stretching the page.
    expect(frame.height).toBeLessThanOrEqual(page.viewportSize()!.height * 0.7 + 60);
  }

  await page.locator(".vp-doc .mermaid").first().click();
  const viewer = page.locator(".mermaid-lightbox");
  await expect(viewer).toBeVisible();
  await expect(viewer.locator("svg")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(viewer).toHaveCount(0);
});

test("joint sliders take over an arm from the idle animation", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator(".robot-viewport")).toHaveAttribute("data-state", "ready", { timeout: 30_000 });
  const toggle = page.locator(".joint-panel-toggle");
  if ((await toggle.textContent())?.includes("关节控制") && !(await toggle.textContent())?.includes("收起")) await toggle.click();

  const first = page.locator(".joint-row input").first();
  await expect(first).toBeVisible();
  await first.fill("45");
  await expect(page.locator(".joint-arms button.active small")).toHaveText("手动");

  // The manual arm holds the user's value while the animation keeps running for the others.
  await page.waitForTimeout(1200);
  await expect(first).toHaveValue("45");
  await expect(page.locator(".joint-auto")).toBeEnabled();
  await page.locator(".joint-auto").click();
  await expect(page.locator(".joint-arms button.active small")).toHaveText("自动");
});

test("mermaid labels stay inside their boxes and the SVG", async ({ page }) => {
  for (const route of [
    "architecture/overview",
    "development/behavior-tree-control",
    "development/pika-teleop",
    "development/realman-driver-scaffold",
  ]) {
    await page.goto(route);
    await expect(page.locator(".vp-doc .mermaid svg").first()).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(800);

    const problems = await page.evaluate(() => {
      const found: string[] = [];
      document.querySelectorAll<SVGSVGElement>(".vp-doc .mermaid svg").forEach((svg, index) => {
        const svgBox = svg.getBoundingClientRect();
        svg.querySelectorAll<SVGElement>("foreignObject, text").forEach((element) => {
          const label = element.textContent?.trim() ?? "";
          if (!label) return;
          const range = document.createRange();
          range.selectNodeContents(
            element.tagName === "foreignObject"
              ? element.querySelector("span.nodeLabel, span.edgeLabel, p, span") ?? element
              : element,
          );
          const text = range.getBoundingClientRect();
          if (!text.width) return;
          // 2px tolerance for sub-pixel layout.
          if (text.left < svgBox.left - 2 || text.right > svgBox.right + 2 || text.top < svgBox.top - 2 || text.bottom > svgBox.bottom + 2) {
            found.push(`diagram ${index}: "${label.slice(0, 30)}" leaves the SVG`);
          }
          const node = element.closest("g.node");
          // Nodes contain several shapes (some empty); the node outline is the largest one.
          const shapes = node ? [...node.querySelectorAll("rect, polygon, path, circle, ellipse")] : [];
          const outline = shapes
            .map((shape) => shape.getBoundingClientRect())
            .sort((a, b) => b.width * b.height - a.width * a.height)[0];
          if (node && outline) {
            const box = outline;
            if (text.width > box.width + 2 || text.height > box.height + 2) {
              found.push(`diagram ${index}: "${label.slice(0, 30)}" is larger than its node`);
            }
          }
        });
      });
      return found;
    });
    expect(problems, `${route}: ${problems.join("; ")}`).toEqual([]);
  }
});
