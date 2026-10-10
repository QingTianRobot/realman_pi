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
    "development/production-operations",
    "development/documentation-workflow",
    "development/startup-entries",
    "development/camera-calibration",
    "development/realman-python-driver",
    "development/realman-driver-scaffold",
    "development/realman-action-development",
    "development/recording-platform",
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
    "development/production-operations",
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

test("grippers are mounted on every arm and the gripper slider takes over", async ({ page, request }) => {
  const layout = await (await request.get("three-robots.json")).json();
  const source = YAML.parse(await readFile(resolve("../config/ros/end_effectors.yaml"), "utf8"));
  for (const id of ["l", "m", "r"]) {
    expect(layout.endEffectors[id].gripper).toBe(source.mounts[id].gripper);
    expect(layout.endEffectors[id].parentLink).toBe(source.mounts[id].parent_link);
  }
  expect(layout.grippers.ctag2f90c.drivingJoint).toBe(source.grippers.ctag2f90c.driving_joint);

  await page.goto("./");
  await expect(page.locator(".robot-viewport")).toHaveAttribute("data-state", "ready", { timeout: 30_000 });
  // 3 arms plus 3 grippers (9 meshes each) must all be loaded before the scene reports ready.
  const meshes = Number(await page.locator(".robot-viewport").getAttribute("data-mesh-count"));
  expect(meshes).toBeGreaterThanOrEqual(21 + 27);

  const toggle = page.locator(".joint-panel-toggle");
  if (!(await toggle.textContent())?.includes("收起")) await toggle.click();
  const slider = page.locator(".gripper-row input");
  await expect(slider).toBeVisible();
  await slider.fill("0");
  await expect(page.locator(".joint-arms button.active small")).toHaveText("手动");
  await page.waitForTimeout(1200);
  await expect(slider).toHaveValue("0");
});

test("the joint panel never covers the arms or the headline", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator(".robot-viewport")).toHaveAttribute("data-state", "ready", { timeout: 30_000 });
  const viewport = page.viewportSize()!;
  // The scene is only fitted around the panel on wide screens; phones stack it differently.
  test.skip(viewport.width <= 900, "fitted layout is for wide screens");

  const toggle = page.locator(".joint-panel-toggle");
  if (!(await toggle.textContent())?.includes("收起")) await toggle.click();
  await page.waitForTimeout(600);

  // Sample opaque canvas pixels over a few seconds of the idle animation.
  const result = await page.evaluate(async () => {
    const canvas = document.querySelector<HTMLCanvasElement>(".robot-viewport canvas")!;
    const gl = (canvas.getContext("webgl2") || canvas.getContext("webgl"))!;
    const box = canvas.getBoundingClientRect();
    const scale = box.width / canvas.width;
    const pixels = new Uint8Array(canvas.width * canvas.height * 4);
    let minX = Infinity;
    let maxX = -Infinity;
    for (let sample = 0; sample < 8; sample += 1) {
      gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      for (let y = 0; y < canvas.height; y += 4) {
        for (let x = 0; x < canvas.width; x += 4) {
          if (pixels[(y * canvas.width + x) * 4 + 3] > 200) {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
          }
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 700));
    }
    const panel = document.querySelector(".joint-panel")!.getBoundingClientRect();
    const copy = document.querySelector(".hero-copy")!.getBoundingClientRect();
    return { left: minX * scale + box.left, right: maxX * scale + box.left, panelLeft: panel.left, copyRight: copy.right };
  });
  expect(result.right, "arms must end left of the panel").toBeLessThanOrEqual(result.panelLeft);
  expect(result.left, "arms must start right of the headline column").toBeGreaterThanOrEqual(result.copyRight - 2);
});

test("docs link to repository files through GitHub URLs, not relative paths", async () => {
  // A relative link such as ../../../config/ros/x.yaml escapes docs/ and 404s on the published site.
  const { readdir } = await import("node:fs/promises");
  const root = resolve("docs");
  const offenders: string[] = [];
  async function walk(directory: string) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.name === ".vitepress" || entry.name === "node_modules") continue;
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (entry.name.endsWith(".md")) {
        const text = await readFile(path, "utf8");
        for (const match of text.matchAll(/\]\(((?:\.\.\/)+(?:config|src|docs|scripts|tools|tests|\.agents|docker)[^)\s]*)\)/g)) {
          offenders.push(`${path.replace(root, "docs")}: ${match[1]}`);
        }
      }
    }
  }
  await walk(root);
  expect(offenders).toEqual([]);
});

test("TF explorer lists the URDF frame chain and highlights parent and child on hover", async ({ page }) => {
  await page.goto("./");
  const explorer = page.locator(".tf-explorer");
  await explorer.scrollIntoViewIfNeeded();
  await expect(explorer).toHaveAttribute("data-state", "ready", { timeout: 30_000 });

  // world + l/world, l/base_link and link_1..link_6 come from the loaded URDF, not a hand-written list.
  const frames = await explorer.locator(".tf-explorer-tree [data-frame]").evaluateAll((nodes) => nodes.map((node) => (node as HTMLElement).dataset.frame));
  expect(frames).toEqual(["world", "l/world", "l/base_link", "l/link_1", "l/link_2", "l/link_3", "l/link_4", "l/link_5", "l/link_6"]);

  await explorer.locator('[data-frame="l/link_3"]').hover();
  await expect(explorer).toHaveAttribute("data-hovered-frame", "l/link_3");
  const info = explorer.locator(".tf-explorer-info");
  await expect(info).toContainText("父坐标系");
  await expect(info).toContainText("l/link_2");
  await expect(info).toContainText("joint_3");
  await expect(explorer.locator('[data-frame="l/link_2"]')).toHaveClass(/related/);
  await expect(explorer.locator('[data-frame="l/link_3"]')).toHaveClass(/hovered/);

  // The 3D label follows the hovered frame.
  await expect(explorer.locator(".tf-explorer-label")).toHaveText("l/link_3");

  await page.mouse.move(0, 0);
  await expect(explorer).toHaveAttribute("data-hovered-frame", "");

  await explorer.getByRole("tab", { name: "R" }).click();
  await expect(explorer).toHaveAttribute("data-selected-arm", "r");
  await expect(explorer.locator('[data-frame="r/link_6"]')).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
