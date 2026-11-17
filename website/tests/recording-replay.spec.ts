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
  await page.route("**/api/lerobot/pending", (route) => route.fulfill({ json: { sessions: [] } }));
  await page.route("**/api/lerobot/trash", (route) => route.fulfill({ json: { sessions: [] } }));

  await page.goto("/");
  // :8770 shares :8765's token sheet (realman_web_control theme.css): light page, hue 250.
  await expect(page.locator("html")).toHaveCSS("--hue", "250");
  await expect(page.locator(".topbar .brand-mark svg.arm-icon")).toHaveCount(1);
  await page.getByRole("button", { name: "回放 · 转换" }).click();
  await expect(page.locator("#replay-search")).toBeVisible();
  await expect(page.locator('#replay-filter option[value="pick the object"]')).toHaveCount(1);
  await page.locator('.episode-item[data-session="episode-1"] .episode-main').click();

  await expect(page.locator("#replay-source")).toHaveText("已转换 · LeRobot");
  await expect(page.locator("#replay-cameras .camera-card")).toHaveCount(2);
  await expect(page.locator('#replay-cameras .camera-card[data-camera="front"] video')).toHaveAttribute("src", /\/api\/lerobot\/episode-1\/video\/front$/);
  // Every camera sits in one row of the media panel (stacked on a phone).
  const wide = (page.viewportSize()?.width ?? 0) >= 1000;
  await expect(page.locator("#replay-cameras")).toHaveAttribute("data-camera-layout", wide ? "2x1" : "1x2");
  await expect(page.locator('#replay-feature-select option[value="action.command.gripper"]')).toHaveCount(1);
  await expect(page.locator('#replay-feature-select option[value="observation.user_added_scalar"]')).toHaveCount(1);
  await page.locator("#replay-feature-select").selectOption("observation.joint_position");
  const rawFrame = page.locator("#replay-feature-raw");
  await expect.poll(async () => JSON.parse((await rawFrame.textContent()) ?? "{}").dimensions?.at(-1)).toBe("r.joint_6");
  await expect(page.locator("#replay-feature-chart .uplot")).toBeVisible();
  await page.locator("#replay-feature-select").selectOption("quality.sync_error_ns");
  await expect.poll(async () => JSON.parse((await rawFrame.textContent()) ?? "{}").dimensions)
    .toEqual(["image:front", "/l/joint_states"]);
  const pageWidth = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(pageWidth.document).toBeLessThanOrEqual(pageWidth.viewport + 1);

  await page.getByRole("button", { name: "关闭回放" }).click();
  await expect(page.locator("#replay-source")).toHaveText("未选择");
  await page.getByRole("button", { name: "录制" }).click();
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
  await page.route("**/api/lerobot/pending", (route) => route.fulfill({ json: { sessions: [] } }));
  await page.route("**/api/lerobot/trash", (route) => route.fulfill({ json: { sessions: [] } }));
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
  await page.locator('.tab[data-tab="replay"]').click();
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

const baseSnapshot = {
  type: "recording_snapshot",
  recording: { state: 0, detail: "实时观测", elapsed_sec: 0, remaining_sec: 0, dropped_samples: 0 },
  arms: {},
  grippers: {},
  preview_cameras: {},
};
const pikaSide = (side: string, extra: Record<string, unknown>) => ({
  state: "no_data", pose_topic: `/pika_pose_${side}`, frame_id: "", position_m: null, orientation_xyzw: null,
  pose_age_ms: null, speed_mps: null, command_topic: `/pika/${side}/cartesian_velocity`, command_active: false,
  command_frame_id: "", command_linear_mps: null, command_angular_radps: null, command_age_ms: null, ...extra,
});

test("Pika window explains an empty feed and then shows live and stale trackers", async ({ page }) => {
  test.setTimeout(30_000);
  let sendLive: () => void = () => undefined;
  await page.routeWebSocket("/ws", (socket) => {
    socket.send(JSON.stringify({
      ...baseSnapshot,
      pika: { sides: { l: pikaSide("l", {}), r: pikaSide("r", {}) } },
    }));
    sendLive = () => socket.send(JSON.stringify({
      ...baseSnapshot,
      pika: { sides: {
        l: pikaSide("l", {
          state: "live", frame_id: "pika_world", position_m: [0.1, 0.2, 1.0], orientation_xyzw: [0, 0, 0, 1],
          pose_age_ms: 8, speed_mps: 0.12, command_active: true, command_frame_id: "l/work/pikabase",
          command_linear_mps: [0.05, 0, 0], command_angular_radps: [0, 0, 0.3], command_age_ms: 20,
        }),
        r: pikaSide("r", {
          state: "stale", frame_id: "pika_world", position_m: [0.4, 0.2, 1.0], orientation_xyzw: [0, 0, 0, 1],
          pose_age_ms: 3_720_000,
        }),
      } },
    }));
  });
  await page.goto("/");

  const viewer = page.locator("#pika-viewer");
  await expect(viewer).toHaveAttribute("data-pika-state", "no_data", { timeout: 15_000 });
  await expect(page.locator("#pika-empty")).toBeVisible();
  await expect(page.locator("#pika-empty")).toContainText("暂无 Pika 位姿数据");
  await expect(page.locator("#pika-empty")).toContainText("/pika_pose_l");
  await expect(page.locator("#pika-r")).toContainText("NO DATA");

  sendLive();
  await expect(viewer).toHaveAttribute("data-pika-state", "partial");
  await expect(page.locator("#pika-empty")).toBeHidden();
  await expect(page.locator("#pika-status")).toHaveText("1 / 2 在线");
  await expect(page.locator("#pika-l")).toContainText("LIVE");
  await expect(page.locator("#pika-l")).toContainText("遥操作中");
  await expect(page.locator("#pika-r")).toContainText("STALE");
  await expect(page.locator("#pika-r")).toContainText("1.0 小时 未更新");

  // Beside the three-arm view on desktop; its own full-width row on a phone.
  const [pika, arms, layout] = await Promise.all([".pika-panel", ".layout .grid-stack-item:first-child", ".layout.grid-stack"]
    .map((selector) => page.locator(selector).first().boundingBox()));
  if (layout!.width > 900) {
    expect(Math.abs(pika!.y - arms!.y)).toBeLessThan(2);
    expect(pika!.x).toBeGreaterThan(arms!.x + arms!.width - 2);
  } else {
    expect(pika!.width).toBeGreaterThan(layout!.width * 0.9);
  }
});

test("live camera preview fits every camera in the panel without scrolling", async ({ page }) => {
  test.setTimeout(30_000);
  await page.route(/\/preview\/.*\.jpg/, (route) => route.fulfill({ status: 404, body: "" }));
  await page.routeWebSocket("/ws", (socket) => {
    const now = Date.now() * 1e6;
    socket.send(JSON.stringify({ ...baseSnapshot, preview_cameras: { "orbbec-left": now, "orbbec-right": now, d435: now } }));
  });
  await page.goto("/");

  await expect(page.locator("#previews .camera-card")).toHaveCount(3, { timeout: 15_000 });
  await expect(page.locator("#previews")).toHaveAttribute("data-camera-layout", /^\dx\d$/);
  const overflow = await page.locator("#previews").evaluate((grid) => {
    const panel = grid.closest(".grid-stack-item-content") as HTMLElement;
    return {
      grid: grid.scrollHeight - grid.clientHeight,
      panel: panel.scrollHeight - panel.clientHeight,
      cardsInside: [...grid.querySelectorAll(".camera-card")].every((card) => {
        const box = card.getBoundingClientRect(), outer = grid.getBoundingClientRect();
        return box.top >= outer.top - 1 && box.bottom <= outer.bottom + 1 && box.height > 40;
      }),
    };
  });
  expect(overflow.grid).toBeLessThanOrEqual(1);
  expect(overflow.panel).toBeLessThanOrEqual(1);
  expect(overflow.cardsInside).toBe(true);
});

test("status panels grow to show every arm, motion and gripper card without inner scrolling", async ({ page }) => {
  test.setTimeout(30_000);
  await page.routeWebSocket("/ws", (socket) => {
    const velocity = (frame: string) => ({
      measured_frame_id: frame, measured_valid: true, measured_age_ms: 10,
      commanded_linear_velocity_mps: [0.1, 0, 0], commanded_angular_velocity_radps: [0, 0, 0.2],
      measured_linear_velocity_mps: [0.09, 0, 0], measured_angular_velocity_radps: [0, 0, 0.18],
    });
    const snapshot = JSON.stringify({
      ...baseSnapshot,
      arms: Object.fromEntries(["l", "m", "r"].map((arm) => [arm, {
        connected: true, positions_rad: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6], cartesian_velocity: velocity(`${arm}/base_link`),
      }])),
      grippers: {
        "/gripper_left/position": { position: 400 }, "/gripper_mid/position": { position: 0 }, "/gripper_right/position": { position: 3955 },
      },
    });
    socket.send(snapshot);
    setTimeout(() => socket.send(snapshot), 300);
  });
  await page.goto("/");
  await expect(page.locator("#arms .arm-card")).toHaveCount(3, { timeout: 15_000 });
  await expect(page.locator("#motion-cards svg")).toHaveCount(6, { timeout: 15_000 });
  await expect(page.locator("#grippers .gripper-card")).toHaveCount(3, { timeout: 15_000 });

  await expect.poll(async () => page.evaluate(() => [...document.querySelectorAll(".layout .grid-stack-item.fit-content")].map((item) => {
    const content = item.querySelector(".grid-stack-item-content") as HTMLElement;
    const used = [...content.children].reduce((sum, child) => sum + (child as HTMLElement).offsetHeight, 0);
    // No hidden overflow, and at most one 20 px row of slack below the content.
    return content.scrollHeight <= content.clientHeight + 1 && content.clientHeight - used < 24;
  })), { timeout: 10_000 }).toEqual([true, true, true]);
});

test("gripper opening uses the live limits from gripper_manager, not hardcoded ranges", async ({ page }) => {
  test.setTimeout(30_000);
  let sendLimits: () => void = () => undefined;
  await page.routeWebSocket("/ws", (socket) => {
    const grippers = {
      "/gripper_left/position": { position: 50 }, "/gripper_mid/position": { position: 4500 }, "/gripper_right/position": { position: 3955 },
    };
    socket.send(JSON.stringify({ ...baseSnapshot, grippers }));
    sendLimits = () => socket.send(JSON.stringify({
      ...baseSnapshot,
      grippers,
      gripper_limits: {
        gripper_left: { open_position: 50, close_position: 8500, min_position: 0, max_position: 8500 },
        gripper_mid: { open_position: 0, close_position: 9000, min_position: 0, max_position: 9000 },
        gripper_right: { open_position: 50, close_position: 8500, min_position: 0, max_position: 8500 },
      },
    }));
  });
  await page.goto("/");

  // Before any limits arrive: raw position only, no guessed percentage.
  const right = page.locator('#grippers [data-gripper="gripper_right"]');
  await expect(right).toContainText("开合度 —", { timeout: 15_000 });
  await expect(right).toContainText("位置 3955 · 等待 /gripper_right/limits");

  sendLimits();
  // (8500 - 3955) / (8500 - 50) = 53.8 % open.
  await expect(right).toContainText("开合度 54%");
  await expect(right).toContainText("开 50 / 闭 8500");
  await expect(page.locator('#grippers [data-gripper="gripper_left"]')).toContainText("开合度 100%");
  await expect(page.locator('#grippers [data-gripper="gripper_mid"]')).toContainText("开合度 50%");
});

test("camera tiles show the bridge-measured fps and frame age and flag slow, stale and silent cameras", async ({ page }) => {
  test.setTimeout(30_000);
  await page.route(/\/preview\/.*\.jpg/, (route) => route.fulfill({ status: 404, body: "" }));
  const stat = (extra: Record<string, unknown>) => ({
    state: "ok", fps: 29.8, age_ms: 21, expected_fps: 30, frames_total: 900, topic: "/camera/color/image_raw", ...extra,
  });
  let sendRecovered: () => void = () => undefined;
  await page.routeWebSocket("/ws", (socket) => {
    const now = Date.now() * 1e6;
    socket.send(JSON.stringify({
      ...baseSnapshot,
      preview_cameras: { "orbbec-left": now, "orbbec-right": now, d435: now - 4e9, "orbbec-middle": 0 },
      camera_stats_enabled: true,
      camera_stats: {
        "orbbec-left": stat({ state: "low_fps", fps: 5.1, age_ms: 180, topic: "/camera_left/color/image_raw" }),
        "orbbec-right": stat({ topic: "/camera_right/color/image_raw" }),
        d435: stat({ state: "stale", fps: 0, age_ms: 4200, topic: "/camera_global/d435/color/image_raw" }),
        "orbbec-middle": stat({ state: "no_data", fps: null, age_ms: null, frames_total: 0, topic: "/camera_middle/color/image_raw" }),
      },
    }));
    sendRecovered = () => socket.send(JSON.stringify({
      ...baseSnapshot,
      preview_cameras: { "orbbec-left": now, "orbbec-right": now, d435: now, "orbbec-middle": now },
      camera_stats_enabled: true,
      camera_stats: {
        "orbbec-left": stat({}), "orbbec-right": stat({}), d435: stat({}), "orbbec-middle": stat({ state: "warming", fps: null }),
      },
    }));
  });
  await page.goto("/");

  const card = (name: string) => page.locator(`#previews [data-camera="${name}"]`);
  await expect(card("orbbec-left")).toHaveAttribute("data-camera-state", "low_fps", { timeout: 15_000 });
  await expect(card("orbbec-left").locator(".camera-health")).toHaveText(/LOW FPS\s*5\.1 fps \/ 30 · 180 ms/);
  await expect(card("orbbec-right")).toHaveAttribute("data-camera-state", "ok");
  await expect(card("orbbec-right").locator(".camera-health")).toHaveText(/LIVE\s*29\.8 fps \/ 30 · 21 ms/);
  await expect(card("d435")).toHaveAttribute("data-camera-state", "stale");
  await expect(card("d435").locator(".camera-health")).toHaveText(/STALE\s*0\.0 fps \/ 30 · 4\.2 s/);
  await expect(card("orbbec-middle")).toHaveAttribute("data-camera-state", "no_data");
  await expect(card("orbbec-middle").locator(".no-feed")).toContainText("未收到图像帧");
  await expect(card("orbbec-middle").locator(".no-feed")).toContainText("/camera_middle/color/image_raw");
  await expect(page.locator("#camera-count")).toHaveText("4 路 · 3 路异常");

  // Unhealthy tiles are outlined so they stand out at a glance; healthy ones are not.
  const outline = (name: string) => card(name).evaluate((el) => getComputedStyle(el).outlineColor);
  expect(await outline("orbbec-left")).not.toBe("rgba(0, 0, 0, 0)");
  expect(await outline("d435")).not.toBe("rgba(0, 0, 0, 0)");
  expect(await outline("orbbec-right")).toBe("rgba(0, 0, 0, 0)");
  // The badge stays inside its tile even in a narrow layout.
  const inside = await card("orbbec-left").evaluate((el) => {
    const badge = el.querySelector(".camera-health")!.getBoundingClientRect(), tile = el.getBoundingClientRect();
    return badge.left >= tile.left - 1 && badge.right <= tile.right + 1 && badge.bottom <= tile.bottom + 1;
  });
  expect(inside).toBe(true);

  sendRecovered();
  await expect(card("orbbec-left")).toHaveAttribute("data-camera-state", "ok");
  await expect(card("orbbec-middle")).toHaveAttribute("data-camera-state", "warming");
  await expect(card("orbbec-middle").locator(".camera-health")).toHaveText(/STARTING\s*— fps \/ 30/);
  await expect(page.locator("#camera-count")).toHaveText("4 路 · 低清预览");
});

test("camera tiles say so when the bridge preview is disabled", async ({ page }) => {
  test.setTimeout(30_000);
  await page.routeWebSocket("/ws", (socket) => {
    socket.send(JSON.stringify({
      ...baseSnapshot, preview_cameras: { "orbbec-left": 0 }, camera_stats_enabled: false, camera_stats: {},
    }));
  });
  await page.goto("/");
  const card = page.locator('#previews [data-camera="orbbec-left"]');
  await expect(card).toHaveAttribute("data-camera-state", "disabled", { timeout: 15_000 });
  await expect(card.locator(".camera-health")).toHaveText("PREVIEW OFF");
  await expect(card.locator(".no-feed")).toContainText("预览未启用");
});

// A real (4x4) JPEG: raw tiles swap in a frame only after it has loaded.
const TINY_JPEG = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAEAAQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwCnRRRXrHnn/9k=";

test("a pending session replays inline: all cameras in sync plus action/state curves, no popup", async ({ page }) => {
  const S = 1_000_000_000;
  const cameras = ["d435", "orbbec-left", "orbbec-right"];
  const imageRequests: string[] = [];
  await page.route("**/api/lerobot", (route) => route.fulfill({ json: { sessions: [] } }));
  await page.route("**/api/lerobot/trash", (route) => route.fulfill({ json: { sessions: [] } }));
  await page.route("**/api/lerobot/pending", (route) => route.fulfill({ json: { sessions: [
    { session_id: "raw-1", session_number: 12, task: "pick_only", complete: true },
  ] } }));
  await page.route("**/api/lerobot/raw-1/raw/replay", (route) => route.fulfill({ json: {
    session_id: "raw-1", session_number: 12, task: "pick_only", fps: 10, duration_s: 0.3, state_error: "",
    cameras, camera_frame_counts: { d435: 4, "orbbec-left": 4, "orbbec-right": 4 },
    topics_present: ["/l/joint_states"],
    summary: { features: {
      "observation.joint_position": { dtype: "float32", shape: [18], names: Array.from({ length: 18 }, (_, i) => `${"lmr"[Math.floor(i / 6)]}.joint_${(i % 6) + 1}`) },
      "action.command_action": { dtype: "float32", shape: [6], names: ["l.vx", "l.vy", "l.vz", "l.wx", "l.wy", "l.wz"] },
    }, canonical: {} },
    frames: [0, 1, 2, 3].map((index) => ({
      frame_index: index, timestamp_ns: index * S / 10, walltime_ns: String(10 * S + index * S / 10),
      state: [...Array.from({ length: 18 }, (_, j) => (j < 6 ? index / 10 : null)), null, null, null],
      action: [],
      features: {
        "observation.joint_position": Array.from({ length: 18 }, (_, j) => (j < 6 ? index / 10 : null)),
        // No command sample before frame 2: a gap, not zeros.
        "action.command_action": index < 2 ? null : [0.01 * index, 0, 0, 0, 0, 0],
      },
      camera_frames: Object.fromEntries(cameras.map((camera) => [camera, `${10 * S + index * S / 10}.jpg`])),
    })),
  } }));
  await page.route(/\/api\/lerobot\/raw-1\/raw\/image\//, (route) => {
    imageRequests.push(new URL(route.request().url()).pathname);
    return route.fulfill({ contentType: "image/jpeg", body: Buffer.from(TINY_JPEG, "base64") });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "回放 · 转换" }).click();
  await page.locator('#replay-pending .episode-item[data-session="raw-1"] .episode-main').click();

  await expect(page.locator("#replay-source")).toHaveText("待转换 · 原始数据");
  await expect(page.locator("#replay-pending .episode-item.active")).toHaveAttribute("data-session", "raw-1");
  await expect(page.locator("#replay-cameras .camera-card img")).toHaveCount(3);
  const wide = (page.viewportSize()?.width ?? 0) >= 1000;
  await expect(page.locator("#replay-cameras")).toHaveAttribute("data-camera-layout", wide ? "3x1" : "1x3");
  await expect(page.locator("#replay-camera-count")).toContainText("3 路");
  // No modal of any kind opened for the replay.
  await expect(page.locator("dialog[open], .raw-modal")).toHaveCount(0);
  await expect(page.locator('#replay-feature-select option[value="action.command_action"]')).toHaveCount(1);
  await expect(page.locator("#replay-feature-chart .uplot")).toBeVisible();
  // Annotation/deviation editing belongs to converted episodes only.
  await expect(page.locator("#annotation-toggle")).toBeHidden();
  await expect(page.locator(".raw-note")).toBeVisible();

  // Stepping moves every camera to its JPEG for that frame.
  await page.locator("#replay-next").click();
  await page.locator("#replay-next").click();
  await expect(page.locator("#replay-frame-label")).toHaveText("3 / 4");
  for (const camera of cameras) {
    await expect(page.locator(`#replay-cameras .camera-card[data-camera="${camera}"] img`))
      .toHaveAttribute("src", new RegExp(`/raw/image/${camera}/${10 * S + 2 * S / 10}\\.jpg\\?w=`));
  }
  await page.locator("#replay-feature-select").selectOption("action.command_action");
  const raw = page.locator("#replay-feature-raw");
  await expect.poll(async () => JSON.parse((await raw.textContent()) ?? "{}").value?.[0]).toBeCloseTo(0.02);
  await page.locator("#replay-prev").click();
  await page.locator("#replay-prev").click();
  // Before the first command sample the raw value is null and the dimension count stays 6.
  await expect.poll(async () => JSON.parse((await raw.textContent()) ?? "{}").dimensions?.length).toBe(6);
  await expect.poll(async () => JSON.parse((await raw.textContent()) ?? "{}").value).toBeNull();

  // Play runs to the end on its own and every camera was requested.
  await page.locator("#replay-play").click();
  await expect(page.locator("#replay-frame-label")).toHaveText("4 / 4", { timeout: 5000 });
  for (const camera of cameras) expect(imageRequests.some((path) => path.includes(`/raw/image/${camera}/`))).toBe(true);
  const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(pageWidth).toBeLessThanOrEqual(1);
});

test("the chart playhead is drawn at the current frame", async ({ page }) => {
  await page.route("**/api/lerobot", (route) => route.fulfill({ json: { sessions: [] } }));
  await page.route("**/api/lerobot/trash", (route) => route.fulfill({ json: { sessions: [] } }));
  await page.route("**/api/lerobot/pending", (route) => route.fulfill({ json: { sessions: [{ session_id: "raw-m", session_number: 1, task: "t", complete: true }] } }));
  await page.route("**/api/lerobot/raw-m/raw/replay", (route) => route.fulfill({ json: {
    fps: 10, cameras: [], camera_frame_counts: {}, topics_present: [], duration_s: 9.9, state_error: "",
    summary: { features: { "observation.gripper_position": { dtype: "float32", shape: [1], names: ["gripper_left"] } }, canonical: {} },
    frames: Array.from({ length: 100 }, (_, index) => ({ frame_index: index, timestamp_ns: index * 1e8, state: [], action: [],
      features: { "observation.gripper_position": [index] }, camera_frames: {} })),
  } }));
  await page.goto("/");
  await page.getByRole("button", { name: "回放 · 转换" }).click();
  await page.locator('#replay-pending .episode-item[data-session="raw-m"] .episode-main').click();
  await expect(page.locator("#replay-feature-chart .uplot")).toBeVisible();
  for (let i = 0; i < 50; i++) await page.locator("#replay-next").click();
  await expect(page.locator("#replay-frame-label")).toHaveText("51 / 100");
  // Count playhead-colored pixels in the canvas column for frame 50 and one y-axis gutter to its left.
  const hits = await page.locator("#replay-feature-chart").evaluate((element) => {
    const over = element.querySelector(".u-over") as HTMLElement;
    const canvas = element.querySelector("canvas") as HTMLCanvasElement;
    const ratio = canvas.width / canvas.getBoundingClientRect().width;
    const left = over.offsetLeft, width = over.offsetWidth;
    const context = canvas.getContext("2d")!;
    const columnHits = (cssX: number) => {
      const x = Math.round(cssX * ratio);
      let count = 0;
      for (let y = Math.round((over.offsetTop + 4) * ratio); y < Math.round((over.offsetTop + 30) * ratio); y += 1) {
        for (const dx of [-1, 0, 1]) {
          const [r, g, b] = context.getImageData(x + dx, y, 1, 1).data;
          if (b > 180 && r < 110 && g < 140) { count += 1; break; } // #3e63dd
        }
      }
      return count;
    };
    const expected = left + (50 / 99) * width;
    return { atFrame: columnHits(expected), gutterLeft: columnHits(expected - left) };
  });
  expect(hits.atFrame).toBeGreaterThan(10);
  expect(hits.gutterLeft).toBe(0);
});
