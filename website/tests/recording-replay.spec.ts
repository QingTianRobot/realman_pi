import { expect, test } from "@playwright/test";

test("live workspace presents FK position and direct driver velocity in 2D and 3D", async ({ page }) => {
  test.setTimeout(30_000);
  await page.routeWebSocket("/ws", (socket) => {
    const velocity = (commandedLinear: number[], commandedAngular: number[], measuredLinear: number[], measuredAngular: number[]) => ({
      measured_frame_id: "l/base_link",
      measured_valid: true,
      measured_age_ms: 12,
      commanded_linear_velocity_mps: commandedLinear,
      commanded_angular_velocity_radps: commandedAngular,
      measured_linear_velocity_mps: measuredLinear,
      measured_angular_velocity_radps: measuredAngular,
    });
    const snapshot = (joint1: number) => JSON.stringify({
      type: "recording_snapshot",
      recording: { state: 0, detail: "实时观测", elapsed_sec: 0, remaining_sec: 0, dropped_samples: 0 },
      arms: {
        l: { connected: true, positions_rad: [joint1, 0, 0, 0, 0, 0], cartesian_velocity: velocity([0.3, 0, 0], [0, 0, 0.7], [0.2, 0, 0], [0, 0, 0.5]) },
        m: { connected: true, positions_rad: [0, 0, 0, 0, 0, 0], cartesian_velocity: { ...velocity([0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]), measured_frame_id: "m/base_link" } },
        r: { connected: true, positions_rad: [0, 0, 0, 0, 0, 0], cartesian_velocity: { ...velocity([0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]), measured_frame_id: "r/base_link" } },
      },
      grippers: {},
      preview_cameras: {},
    });
    socket.send(JSON.stringify({ type: "hello", read_only_robot: true }));
    setTimeout(() => socket.send(snapshot(0)), 400);
  });

  await page.goto("/");

  await expect(page.locator("#motion-l")).toContainText("位置", { timeout: 15_000 });
  await expect(page.locator("#motion-l")).toContainText(/驱动线速度\s+0\.200/, { timeout: 15_000 });
  await expect(page.locator("#motion-l")).toContainText(/驱动角速度\s+0\.500/, { timeout: 15_000 });
  await expect(page.locator("#motion-l")).toContainText(/控制线速度\s+0\.300/, { timeout: 15_000 });
  await expect(page.locator("#motion-l")).toContainText(/控制角速度\s+0\.700/, { timeout: 15_000 });
  await expect(page.locator("#motion-l svg")).toHaveCount(2, { timeout: 15_000 });
  await expect(page.locator("#motion-l")).toContainText("驱动测量 · 12 ms", { timeout: 15_000 });
  await expect(page.locator("#motion-viewer")).toHaveAttribute("data-velocity-vectors", "actual+commanded");
  await expect(page.locator("#motion-viewer")).toHaveAttribute("data-end-effector-markers", "active");
});

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
          "observation.images.front": { dtype: "video", shape: [] },
          "observation.images.wrist": { dtype: "video", shape: [] },
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
  await page.route("**/api/lerobot/episode-1/video/*", (route) =>
    route.fulfill({ status: 200, contentType: "video/mp4", body: "" }),
  );

  await page.goto("/");
  await expect(page.locator("html")).toHaveCSS("--blue", "#55a6ff");
  await page.getByRole("button", { name: "回放" }).click();
  await expect(page.locator("#replay-search")).toBeVisible();
  await expect(page.locator('#replay-filter option[value="pick the object"]')).toHaveCount(1);
  await expect(page.locator('.episode-item[data-session="episode-1"] .episode-action[data-action="hide"]')).toHaveText("隐藏");
  await page.locator('.episode-item[data-session="episode-1"] .episode-main').click();

  await expect(page.locator("#replay-cameras .camera-card")).toHaveCount(2);
  await expect(page.locator('#replay-cameras .camera-card[data-camera="front"] video')).toHaveAttribute("src", /\/api\/lerobot\/episode-1\/video\/front$/);
  await expect(page.locator('#replay-feature-select option[value="action.command.gripper"]')).toHaveCount(1);
  await expect(page.locator('#replay-feature-select option[value="observation.user_added_scalar"]')).toHaveCount(1);
  await page.locator("#replay-feature-select").selectOption("observation.joint_position");
  const dimensionSelect = page.locator("#replay-feature-component");
  await expect(dimensionSelect.locator("option")).toHaveCount(18);
  await dimensionSelect.selectOption("r.joint_6");
  const rawFrame = page.locator("#replay-feature-raw");
  await expect.poll(async () => JSON.parse((await rawFrame.textContent()) ?? "{}").component).toBe("r.joint_6");
  await expect.poll(async () => JSON.parse((await rawFrame.textContent()) ?? "{}").state_component).toBe(17);
  const chartPoints = (await page.locator("#replay-feature-chart .chart-state").getAttribute("points")) ?? "";
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
  await expect.poll(async () => JSON.parse((await rawFrame.textContent()) ?? "{}").state_value).toEqual([true]);
  await expect(page.locator("#replay-feature-chart .chart-state")).toBeVisible();
  // Tab-based design: replay tab is visible, record tab (with #viewer and #previews) is hidden
  await expect(page.locator("#tab-replay")).toBeVisible();
  await expect(page.locator("#tab-record")).toBeHidden();
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

test("replay marks deviation intervals on frames and saves them in nanoseconds", async ({ page }) => {
  const first = 1_790_000_000_000_000_000n;
  const step = 100_000_000n;
  const reasons = [{ id: "grasp_miss", label: "抓偏" }, { id: "stall", label: "卡住犹豫" }];
  const saved: any[] = [];
  let revision = 0;
  const frameOf = (ns: string | null) => (ns === null ? null : Number((BigInt(ns) - first + step - 1n) / step));
  const documentFor = (intervals: any[]) => ({
    session_id: "episode-q", revision, attempt: { attempt_id: "policy_attempt_x", outcome: "dropped", succeeded: false },
    frames: { fps: 10, first_walltime_ns: first.toString(), frame_count: 4 }, reasons,
    intervals: intervals.map((item) => ({
      ...item, source: "replay", start_frame: frameOf(item.start_ns),
      end_frame: item.end_ns === null ? 3 : (frameOf(item.end_ns) as number) - 1,
    })),
  });
  await page.route("**/api/lerobot", (route) => route.fulfill({ json: { sessions: [
    { session_id: "episode-q", repo_id: "realman/pi05-policy-rollouts", episode_index: 0, frames: 4, fps: 10,
      task: "pick_only", quality: { invalid_frames: 0 } },
  ] } }));
  await page.route("**/api/lerobot/episode-q/summary", (route) => route.fulfill({ json: {
    features: { "observation.images.front": { dtype: "video", shape: [] } }, quality: { invalid_frames: 0 }, canonical: {},
  } }));
  await page.route("**/api/lerobot/episode-q/frames", (route) => route.fulfill({ json: { frames: [0, 1, 2, 3].map((index) => ({
    frame_index: index, timestamp_ns: 1_000_000_000 + index * 100_000_000, state: Array(21).fill(0), action: [], features: {},
    cameras: { front: true },
  })) } }));
  await page.route("**/api/lerobot/episode-q/video/*", (route) => route.fulfill({ status: 200, contentType: "video/mp4", body: "" }));
  await page.route("**/api/lerobot/episode-q/subtasks", (route) => route.fulfill({ json: { subtasks: [] } }));
  await page.route("**/api/recording/episode-q/quality_events", async (route) => {
    if (route.request().method() === "PUT") {
      const body = route.request().postDataJSON();
      saved.push(body);
      expect(body.revision).toBe(revision);
      revision += 1;
      await route.fulfill({ json: documentFor(body.intervals) });
    } else {
      await route.fulfill({ json: documentFor([]) });
    }
  });

  await page.goto("/");
  await page.getByRole("button", { name: "回放" }).click();
  await page.locator('.episode-item[data-session="episode-q"] .episode-main').click();
  await expect(page.locator("#replay-frame-label")).toHaveText("1 / 4");
  await page.locator("#quality-toggle").click();
  await expect(page.locator("#quality-attempt")).toContainText("policy_attempt_x");

  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#replay-frame-label")).toHaveText("2 / 4");
  await page.keyboard.press("d");
  await expect.poll(() => saved.length).toBe(1);
  expect(saved[0].intervals).toEqual([
    { start_ns: (first + step).toString(), end_ns: null, reason: null, source: "replay" },
  ]);
  await expect(page.locator("#quality-track .quality-band.open")).toHaveCount(1);

  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#replay-frame-label")).toHaveText("4 / 4");
  await page.keyboard.press("d");
  await expect.poll(() => saved.length).toBe(2);
  expect(saved[1].intervals).toEqual([
    { start_ns: (first + step).toString(), end_ns: (first + 4n * step).toString(), reason: null, source: "replay" },
  ]);

  await page.locator("#quality-list .quality-reason").selectOption("stall");
  await expect.poll(() => saved.length).toBe(3);
  expect(saved[2].intervals[0].reason).toBe("stall");
  expect(saved[2].intervals[0].start_ns).toBe((first + step).toString());

  // The reason <select> may still hold focus, and keys typed into a field never edit intervals.
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.keyboard.press("Delete");
  await expect.poll(() => saved.length).toBe(4);
  expect(saved[3].intervals).toEqual([]);
  await expect(page.locator("#quality-track .quality-band")).toHaveCount(0);
});
