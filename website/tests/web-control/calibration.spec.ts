import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    class FakeWebSocket {
      static OPEN = 1;
      readyState = 0;
      listeners: Record<string, ((event: any) => void)[]> = {};
      sent: string[] = [];

      constructor() {
        (window as any).__calibrationMessages = this.sent;
        (window as any).__calibrationSocket = this;
        setTimeout(() => {
          this.readyState = 1;
          this.emit("open", {});
          this.emit("message", { data: JSON.stringify({ type: "hello", read_only: false }) });
        }, 10);
      }

      addEventListener(type: string, callback: (event: any) => void) {
        (this.listeners[type] ||= []).push(callback);
      }

      emit(type: string, event: any) {
        for (const callback of this.listeners[type] || []) callback(event);
      }

      send(value: string) {
        this.sent.push(value);
      }

      close() {
        this.readyState = 3;
      }
    }
    (window as any).WebSocket = FakeWebSocket;
  });
});

test("calibration page loads config and sends atomic capture/solve requests", async ({ page }) => {
  await page.goto("calibration.html");
  await expect(page.getByRole("heading", { level: 1, name: "ChArUco 手眼标定" })).toBeVisible();
  const topActionHeights = await page.evaluate(() => {
    const back = document.querySelector<HTMLElement>(".top-actions .button");
    const connection = document.querySelector<HTMLElement>(".top-actions .status");
    return [back?.getBoundingClientRect().height, connection?.getBoundingClientRect().height];
  });
  expect(topActionHeights[0]).toBe(topActionHeights[1]);
  await expect(page.locator("#config-state")).toHaveText("CONFIG LOADED");
  await expect(page.locator("#config")).toContainText("DICT_5X5_100");
  await expect(page.locator("#config")).toContainText("每臂最少样本：30");
  await expect(page.locator("#capture")).toBeEnabled();
  await page.evaluate(() => {
    (window as any).__calibrationSocket.emit("message", {
      data: JSON.stringify({
        type: "camera_health",
        inputs: [{
          camera_id: "left", arm_id: "l", status: "healthy", message: "Image and CameraInfo are current",
          image_received: true, camera_info_received: true, image_age_sec: 0.02,
          camera_info_age_sec: 0.03, image_timestamp_delay_sec: 0.04,
          camera_info_timestamp_delay_sec: 0.04, image_camera_info_skew_sec: 0.01,
          image_width: 640, image_height: 480,
        }],
      }),
    });
  });
  await expect(page.locator("#health-state")).toHaveText("HEALTHY");
  await expect(page.locator("#camera-health")).toContainText("640 × 480");

  await page.locator("#capture").click();
  const capture = await page.evaluate(() => {
    const messages = (window as any).__calibrationMessages as string[];
    return JSON.parse(messages.find((value) => JSON.parse(value).type === "capture_calibration_sample")!);
  });
  expect(capture.arm_ids).toEqual(["l", "m", "r"]);
  expect(capture.start_new_session).toBe(true);

  await page.evaluate((requestId) => {
    (window as any).__calibrationSocket.emit("message", {
      data: JSON.stringify({
        type: "calibration_capture_result",
        request_id: requestId,
        success: true,
        session_id: "session-test",
        batch_id: "batch-1",
        sample_counts: [1, 1, 1],
        message: "captured",
      }),
    });
  }, capture.request_id);
  await expect(page.locator("#session-state")).toHaveText("SAMPLES 1/30 · 1/30 · 1/30");
  await expect(page.locator("#solve")).toBeEnabled();

  await page.locator("#solve").click();
  const solve = await page.evaluate(() => {
    const messages = (window as any).__calibrationMessages as string[];
    return JSON.parse(messages.find((value) => JSON.parse(value).type === "solve_calibration")!);
  });
  expect(solve.session_id).toBe("session-test");
  await page.evaluate((requestId) => {
    (window as any).__calibrationSocket.emit("message", {
      data: JSON.stringify({
        type: "calibration_solve_result",
        request_id: requestId,
        success: true,
        layout_updated: true,
        layout_backup_file: "/opt/rm65_ws/config/ros/three_robots.yaml.bak",
        result_json: JSON.stringify({ hand_eye: { l: {} }, relative_base_poses: {} }),
        message: "solved",
      }),
    });
  }, solve.request_id);
  await expect(page.locator("#solve-state")).toHaveText("SOLVED");
  await expect(page.locator("#result")).toContainText("relative_base_poses");
  await expect(page.locator("#log")).toContainText("相对位置已写回配置");
});

test("calibration page loads a historical session and solves that exact session", async ({ page }) => {
  await page.route("**/api/calibration/sessions", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        sessions: [{
          session_id: "session-20260821T102303.053863Z",
          created_at: "2026-08-21T10:23:03+00:00",
          sample_counts: { l: 30, m: 30, r: 30 },
          solved: false,
        }],
      }),
    });
  });
  await page.goto("calibration.html");
  await expect(page.locator("#session-history")).toHaveValue("");
  await page.locator("#session-history").selectOption("session-20260821T102303.053863Z");
  await page.locator("#load-session").click();
  await expect(page.locator("#session")).toHaveValue("session-20260821T102303.053863Z");
  await expect(page.locator("#new-session")).not.toBeChecked();
  await expect(page.locator("#session-state")).toContainText("LOADED L 30/30 · M 30/30 · R 30/30");
  await expect(page.locator("#solve")).toBeEnabled();

  await page.locator("#solve").click();
  const solve = await page.evaluate(() => {
    const messages = (window as any).__calibrationMessages as string[];
    return JSON.parse(messages.find((value) => JSON.parse(value).type === "solve_calibration")!);
  });
  expect(solve.session_id).toBe("session-20260821T102303.053863Z");
});

test("calibration page prunes empty sessions on refresh and deletes a selected session", async ({ page }) => {
  const requests: { method: string; url: string }[] = [];
  await page.route("**/api/calibration/sessions**", async (route) => {
    const request = route.request();
    requests.push({ method: request.method(), url: request.url() });
    if (request.method() === "DELETE") {
      await route.fulfill({ contentType: "application/json", body: JSON.stringify({ deleted_session_id: "session-delete" }) });
      return;
    }
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        sessions: [{
          session_id: "session-delete",
          created_at: "2026-08-21T10:23:03+00:00",
          sample_counts: { l: 1, m: 1, r: 1 },
          solved: false,
        }],
        deleted_session_ids: request.url().includes("delete_empty=true") ? ["session-empty"] : [],
      }),
    });
  });
  await page.goto("calibration.html");
  await page.locator("#refresh-sessions").click();
  await expect(page.locator("#log")).toContainText("已清理 1 个 0/30 空会话");
  expect(requests.some((request) => request.method === "GET" && request.url.includes("delete_empty=true"))).toBe(true);

  await page.locator("#session-history").selectOption("session-delete");
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#delete-session").click();
  await expect(page.locator("#log")).toContainText("已删除历史会话 session-delete");
  expect(requests.some((request) => request.method === "DELETE" && request.url.endsWith("/session-delete"))).toBe(true);
});
