import { expect, test } from "@playwright/test";

test("replay workspace synchronizes camera tiles and exposes added canonical features", async ({ page }) => {
  await page.route("**/api/lerobot", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        sessions: [
          {
            session_id: "episode-1",
            repo_id: "realman/test",
            episode_index: 0,
            frames: 1,
            fps: 10,
            task: "pick the object",
            quality: { invalid_frames: 0 },
          },
        ],
      }),
    }),
  );
  await page.route("**/api/lerobot/episode-1/summary", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        features: {
          "observation.joint_position": {
            dtype: "float32",
            shape: [18],
            names: Array.from({ length: 18 }, (_, index) => `${["l", "m", "r"][Math.floor(index / 6)]}.joint_${(index % 6) + 1}`),
          },
          "action.command.gripper": { dtype: "float32", shape: [3], names: ["gripper_left", "gripper_mid", "gripper_right"] },
          "observation.user_added_scalar": { dtype: "float32", shape: [] },
          "quality.sync_error_ns": { dtype: "int64", shape: [2], names: ["image:front", "/l/joint_states"] },
          "quality.valid": { dtype: "bool", shape: [1], names: ["valid"] },
        },
        quality: { invalid_frames: 0 },
        canonical: {
          joint_names: ["joint_1", "joint_2", "joint_3", "joint_4", "joint_5", "joint_6"],
          base_frames: ["l/base_link", "m/base_link", "r/base_link"],
          units: { position: "rad" },
          quality_sync_source_ids: ["image:front", "/l/joint_states"],
        },
      }),
    }),
  );
  await page.route("**/api/lerobot/episode-1/frames", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        frames: [
            {
              frame_index: 0,
              timestamp_ns: 1_000_000_000,
              state: Array(21).fill(0),
              action: [],
              features: {
                "observation.joint_position": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                "action.command.gripper": [0, 0.5, 1],
                "observation.user_added_scalar": 2.5,
                "quality.sync_error_ns": [1, -1],
                "quality.valid": [true],
              },
              source_timestamps_ns: { "image:front": "1000000001", "/l/joint_states": "999999999" },
              cameras: { front: true, wrist: true },
            },
            {
              frame_index: 1,
              timestamp_ns: 1_100_000_000,
              state: Array(21).fill(0),
              action: [],
              features: {
                "observation.joint_position": [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 0],
                "action.command.gripper": [0.1, 0.6, 0.9],
                "observation.user_added_scalar": 3.5,
                "quality.sync_error_ns": [2, 3],
                "quality.valid": [false],
              },
              source_timestamps_ns: { "image:front": "1100000002", "/l/joint_states": "1100000003" },
              cameras: { front: true, wrist: true },
            },
        ],
      }),
    }),
  );
  await page.route("**/api/lerobot/episode-1/frames/*/cameras/*", (route) =>
    route.fulfill({
      contentType: "image/png",
      body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADUlEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC", "base64"),
    }),
  );

  await page.goto("/");
  await expect(page.locator("html")).toHaveCSS("--blue", "#55a6ff");
  await page.getByRole("button", { name: "回放" }).click();
  await page.locator('.episode-item[data-session="episode-1"]').click();

  await expect(page.locator("#replay-cameras .camera-card")).toHaveCount(2);
  await expect.poll(() => page.locator('#replay-cameras img[alt="front"]').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBe(1);
  await expect(page.locator('#replay-feature-select option[value="action.command.gripper"]')).toHaveCount(1);
  await expect(page.locator('#replay-feature-select option[value="observation.user_added_scalar"]')).toHaveCount(1);
  const dimensionSelect = page.locator("#replay-feature-component");
  await expect(dimensionSelect.locator("option")).toHaveCount(18);
  await dimensionSelect.selectOption("r.joint_6");
  const rawFrame = page.locator("#replay-feature-raw");
  await expect.poll(async () => JSON.parse((await rawFrame.textContent()) ?? "{}").selected_component).toBe("r.joint_6");
  await expect.poll(async () => JSON.parse((await rawFrame.textContent()) ?? "{}").selected_value).toBe(17);
  const chartPoints = (await page.locator("#replay-feature-chart polyline").getAttribute("points")) ?? "";
  const firstY = Number(chartPoints.split(" ")[0]?.split(",")[1]);
  const secondY = Number(chartPoints.split(" ")[1]?.split(",")[1]);
  expect(firstY).toBeLessThan(secondY);
  await page.locator("#replay-feature-select").selectOption("quality.sync_error_ns");
  await expect(page.locator("#replay-feature-component option")).toHaveText([
    "image:front",
    "/l/joint_states",
  ]);
  await expect.poll(async () => JSON.parse((await rawFrame.textContent()) ?? "{}").source_timestamps_ns)
    .toEqual({ "image:front": "1000000001", "/l/joint_states": "999999999" });
  await page.locator("#replay-feature-select").selectOption("quality.valid");
  await expect(page.locator("#replay-feature-component option")).toHaveText(["valid"]);
  await expect.poll(async () => JSON.parse((await rawFrame.textContent()) ?? "{}").value).toEqual([true]);
  await expect(page.locator("#replay-feature-chart polyline")).toBeVisible();
  await expect(page.locator(".layout.replay-layout #viewer")).toBeVisible();
  await expect(page.locator(".layout.replay-layout #previews")).toBeHidden();
  const pageWidth = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(pageWidth.document).toBeLessThanOrEqual(pageWidth.viewport + 1);

  await page.getByRole("button", { name: "退出回放" }).click();
  await page.getByRole("button", { name: "录制" }).click();
  await expect(page.locator(".layout")).not.toHaveClass(/replay-layout/);
  await expect(page.locator("#previews")).toBeVisible();
});
