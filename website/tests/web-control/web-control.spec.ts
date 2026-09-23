import { expect, test } from "@playwright/test";

async function canvasChecksum(page: any) {
  return page.locator("#canvas").evaluate((element: HTMLCanvasElement) => {
    const gl = element.getContext("webgl2") || element.getContext("webgl");
    if (!gl) return 0;
    const pixels = new Uint8Array(element.width * element.height * 4);
    gl.readPixels(0, 0, element.width, element.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    let checksum = 0;
    const stride = Math.max(4, Math.floor(pixels.length / 20000 / 4) * 4);
    for (let index = 0; index < pixels.length; index += stride) {
      checksum = (checksum + pixels[index] * 3 + pixels[index + 1] * 5 + pixels[index + 2] * 7) % 1000000007;
    }
    return checksum;
  });
}

async function emitWebSocketEvent(page: any, message: Record<string, unknown>) {
  await page.evaluate((event: Record<string, unknown>) => {
    (window as any).__webSocket.emit("message", { data: JSON.stringify(event) });
  }, message);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    class FakeWebSocket {
      static OPEN = 1;
      readyState = 0;
      listeners: Record<string, ((event: any) => void)[]> = {};
      sent: string[] = [];
      constructor() {
        (window as any).__webMessages = this.sent;
        (window as any).__webSocket = this;
        setTimeout(() => {
          this.readyState = 1;
          this.emit("open", {});
          this.emit("message", { data: JSON.stringify({ type: "hello", read_only: false }) });
          this.emit("message", { data: JSON.stringify({
            type: "coordinate_state",
            arm: "l",
            motion_allowed: true,
            preferred_reference_type: 1,
            preferred_reference_name: "cell",
            preferred_reference: { type: 1, name: "cell", frame_id: "l/work/cell" },
            tool: { type: 2, name: "tcpgrip", frame_id: "l/tool/tcpgrip", controller_name: "tcpgrip", xyz_m: [0, 0, 0.12], quaternion_wxyz: [1, 0, 0, 0], payload_kg: 0.8, center_of_mass_m: [0, 0, 0.06] },
            work: { type: 1, name: "cell", frame_id: "l/work/cell", controller_name: "cell", xyz_m: [0.4, 0.5, 0.6], quaternion_wxyz: [1, 0, 0, 0] },
            current_tool: "tcpgrip",
            current_work: "cell",
            expected_tool: "tcpgrip",
            expected_work: "cell",
            matched: true,
            tool_matched: true,
            work_matched: true,
            api2_status: 0,
            message: "ok",
          }) });
          this.emit("message", { data: JSON.stringify({ type: "connection", arm: "l", connected: true }) });
          this.emit("message", { data: JSON.stringify({ type: "joint_state", arm: "l", positions_rad: [0, 0, 0, 0, 0, 0], stamp_ns: 42 }) });
          this.emit("message", { data: JSON.stringify({
            type: "coordinate_state",
            arm: "m",
            motion_allowed: true,
            preferred_reference_type: 1,
            preferred_reference_name: "cell",
            preferred_reference: { type: 1, name: "cell", frame_id: "m/work/cell" },
            tool: { type: 2, name: "tcpgrip", frame_id: "m/tool/tcpgrip", controller_name: "tcpgrip", xyz_m: [0, 0, 0.12], quaternion_wxyz: [1, 0, 0, 0], payload_kg: 0.8, center_of_mass_m: [0, 0, 0.06] },
            work: { type: 1, name: "cell", frame_id: "m/work/cell", controller_name: "cell", xyz_m: [0.4, 0.5, 0.6], quaternion_wxyz: [1, 0, 0, 0] },
            current_tool: "tcpgrip",
            current_work: "cell",
            expected_tool: "tcpgrip",
            expected_work: "cell",
            matched: true,
            tool_matched: true,
            work_matched: true,
            api2_status: 0,
            message: "ok",
          }) });
          this.emit("message", { data: JSON.stringify({ type: "connection", arm: "m", connected: true }) });
          this.emit("message", { data: JSON.stringify({ type: "joint_state", arm: "m", positions_rad: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6], stamp_ns: 43 }) });
          this.emit("message", { data: JSON.stringify({
            type: "coordinate_state",
            arm: "r",
            motion_allowed: true,
            preferred_reference_type: 1,
            preferred_reference_name: "cell",
            preferred_reference: { type: 1, name: "cell", frame_id: "r/work/cell" },
            tool: { type: 2, name: "tcpgrip", frame_id: "r/tool/tcpgrip", controller_name: "tcpgrip", xyz_m: [0, 0, 0.12], quaternion_wxyz: [1, 0, 0, 0], payload_kg: 0.8, center_of_mass_m: [0, 0, 0.06] },
            work: { type: 1, name: "cell", frame_id: "r/work/cell", controller_name: "cell", xyz_m: [0.4, 0.5, 0.6], quaternion_wxyz: [1, 0, 0, 0] },
            current_tool: "tcpgrip",
            current_work: "cell",
            expected_tool: "tcpgrip",
            expected_work: "cell",
            matched: true,
            tool_matched: true,
            work_matched: true,
            api2_status: 0,
            message: "ok",
          }) });
          this.emit("message", { data: JSON.stringify({ type: "connection", arm: "r", connected: true }) });
          this.emit("message", { data: JSON.stringify({ type: "joint_state", arm: "r", positions_rad: [0.2, 0.4, 0.6, 0.8, 1.0, 1.2], stamp_ns: 44 }) });
        }, 20);
      }
      addEventListener(type: string, callback: (event: any) => void) { (this.listeners[type] ||= []).push(callback); }
      emit(type: string, event: any) { for (const callback of this.listeners[type] || []) callback(event); }
    send(value: string) {
      this.sent.push(value);
    }
    close() { this.readyState = 3; }
  }
    (window as any).WebSocket = FakeWebSocket;
  });
});

test("loads configured URDF scene and sends MOVEJ, MOVEL, and MOVEP protocol", async ({ page }) => {
  test.setTimeout(60_000);

  await page.goto("/");
  await expect(page.locator(".fleet-chip")).toHaveCount(3);
  await expect(page.locator(".fleet-chip[data-arm=\"l\"]")).toContainText("ONLINE");
  await expect(page.locator(".fleet-chip[data-arm=\"m\"]")).toContainText("6 joints");
  await expect(page.locator(".fleet-chip[data-arm=\"r\"]")).toContainText("6 joints");
  const middleChip = await page.locator(".fleet-chip[data-arm=\"m\"]").elementHandle();
  await page.evaluate(() => {
    const webSocket = (window as any).__webSocket;
    const positions = {
      l: [0, 0, 0, 0, 0, 0],
      m: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6],
      r: [0.2, 0.4, 0.6, 0.8, 1.0, 1.2],
    };
    for (let stamp = 100; stamp < 200; stamp += 1) {
      for (const arm of ["l", "m", "r"] as const) {
        webSocket.emit("message", {
          data: JSON.stringify({ type: "joint_state", arm, positions_rad: positions[arm], stamp_ns: stamp }),
        });
      }
    }
  });
  expect(await middleChip!.evaluate((element) => element.isConnected)).toBe(true);
  await page.locator(".fleet-chip[data-arm=\"m\"]").click();
  await expect(page.locator("#arm-select")).toHaveValue("m");
  await expect(page.locator("#selected-arm-label")).toContainText("M");
  await expect(page.locator("input[data-joint-index=\"0\"]")).toHaveValue(/^5\.7/);
  await page.locator(".fleet-chip[data-arm=\"r\"]").click();
  await expect(page.locator("#arm-select")).toHaveValue("r");
  await expect(page.locator("#selected-arm-label")).toContainText("R");
  await expect(page.locator("input[data-joint-index=\"0\"]")).toHaveValue(/^11\.4/);
  await page.evaluate(() => {
    (window as any).__webSocket.emit("message", { data: JSON.stringify({
      type: "joint_records",
      arm: "r",
      records: [{ id: "ready", label: "Ready", joint_degrees: [15, 25, 35, 45, 55, 65], created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" }],
    }) });
  });
  await expect(page.locator("#record-select")).toHaveValue("ready");
  await page.locator("#apply-record").click();
  let recordRequestId = await page.evaluate(() => {
    const messages = (window as any).__webMessages as string[];
    const message = messages.map((value) => JSON.parse(value)).findLast((item) => item.type === "apply_joint_record");
    return message.request_id;
  });
  const recordRequestReference = await page.evaluate(() => {
    const messages = (window as any).__webMessages as string[];
    return messages.map((value) => JSON.parse(value)).findLast((item) => item.type === "apply_joint_record").reference;
  });
  expect(recordRequestReference).toEqual({ reference_type: 1, reference_name: "cell" });
  await page.evaluate((requestId) => {
    (window as any).__webSocket.emit("message", { data: JSON.stringify({
      type: "joint_record_applied",
      arm: "r",
      request_id: requestId,
      command: 0,
      record: { id: "ready", label: "Ready", joint_degrees: [15, 25, 35, 45, 55, 65] },
      joint_degrees: [15, 25, 35, 45, 55, 65],
    }) });
  }, recordRequestId);
  await expect(page.locator("input[data-joint-index=\"0\"]")).toHaveValue(/^15/);
  await page.locator("#record-name").fill("inspection");
  await expect(page.locator("#save-record")).toBeEnabled();
  await page.locator("#save-record").click();
  const saveRecordRequestId = await page.evaluate(() => {
    const messages = (window as any).__webMessages as string[];
    const message = messages.map((value) => JSON.parse(value)).findLast((item) => item.type === "save_joint_record");
    return message?.request_id || "";
  });
  expect(saveRecordRequestId).not.toBe("");
  await page.evaluate((requestId) => {
    (window as any).__webSocket.emit("message", { data: JSON.stringify({
      type: "joint_record_saved",
      arm: "r",
      request_id: requestId,
      record: { id: "inspection", label: "inspection", joint_degrees: [15, 25, 35, 45, 55, 65] },
    }) });
  }, saveRecordRequestId);
  await expect(page.locator("#viewer")).toHaveAttribute("data-live-meshes", /^(2[1-9]|[3-9][0-9]|[1-9][0-9]{2,})$/, { timeout: 30_000 });
  await expect(page.locator("#viewer")).toHaveAttribute("data-shadow-meshes", /^(2[1-9]|[3-9][0-9]|[1-9][0-9]{2,})$/);
  await expect(page.locator("#viewer")).toHaveAttribute("data-visualization-reference-arm", "m");
  const viewerBounds = await page.locator("#viewer").boundingBox();
  expect(viewerBounds?.height).toBeLessThanOrEqual(560);
  expect(viewerBounds?.height).toBeGreaterThan(300);
  const liveCanvasBeforeFeedback = await canvasChecksum(page);
  await page.evaluate(() => {
    (window as any).__webSocket.emit("message", { data: JSON.stringify({
      type: "action_feedback",
      arm: "r",
      action: "execute_motion",
      feedback: { progress: 0.1, detail: "submitted", current_joint_degrees: [0, 0, 0, 0, 0, 0] },
    }) });
  });
  await page.waitForTimeout(100);
  expect(await canvasChecksum(page)).toEqual(liveCanvasBeforeFeedback);
  await expect(page.locator("#connection")).toContainText("ROS ONLINE");
  await expect(page.locator("#coordinate-state")).toContainText("READY");
  await expect(page.locator("#coordinate-summary")).toContainText("WORK / cell");
  await expect(page.locator("#motion-reference")).toHaveText("WORK / cell");
  await expect(page.locator("#motion-mode button")).toHaveCount(3);
  await page.locator(".fleet-chip[data-arm=\"l\"]").click();
  await page.evaluate(() => {
    (window as any).__webSocket.emit("message", { data: JSON.stringify({
      type: "connection", arm: "l", connected: false,
    }) });
  });
  await expect(page.locator("#connection")).toContainText("OFFLINE");
  await expect(page.locator("#recover-motion")).toBeEnabled();
  await page.locator("#recover-motion").click();
  const recoveryRequestId = await page.evaluate(() => {
    const messages = (window as any).__webMessages as string[];
    return messages.map((value) => JSON.parse(value)).findLast((item) => item.type === "recover_motion").request_id;
  });
  await expect(page.locator("#recover-motion")).toBeDisabled();
  await page.evaluate((requestId) => {
    (window as any).__webSocket.emit("message", { data: JSON.stringify({
      type: "motion_recovery_state", arm: "l", request_id: requestId, state: "requested",
    }) });
    (window as any).__webSocket.emit("message", { data: JSON.stringify({
      type: "motion_recovery_result", arm: "l", request_id: requestId,
      success: true, recovered: true, api2_status: 0, message: "motion event channel recovered",
    }) });
  }, recoveryRequestId);
  await expect(page.locator("#result")).toContainText("L 已恢复");
  await expect(page.locator("#recover-motion")).toBeEnabled();
  await page.locator(".fleet-chip[data-arm=\"r\"]").click();
  await expect(page.locator("input[data-joint-index=\"0\"]")).toBeVisible();
  await page.locator("input[data-joint-index=\"0\"]").evaluate((element: HTMLInputElement) => {
    element.value = "30";
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await expect(page.locator("input[data-joint-index=\"0\"]")).toHaveValue(/^30/);
  await page.locator("#execute-motion").click();
  await page.locator("#cancel-motion").click();
  await page.evaluate(() => {
    (window as any).__webSocket.emit("message", { data: JSON.stringify({
      type: "action_result", arm: "r", action: "execute_motion", result: { success: false },
    }) });
  });

  await page.locator("button[data-motion-command=\"1\"]").click();
  await expect(page.locator("#joint-target")).toBeHidden();
  await expect(page.locator("#pose-target")).toBeVisible();
  await expect(page.locator("#execute-motion")).toHaveText("发送 MOVEL");
  await expect(page.locator("#execute-motion")).toBeDisabled();
  await page.locator("#pose-x").fill("0.4");
  await page.locator("#pose-y").fill("0.1");
  await page.locator("#pose-z").fill("0.5");
  await page.locator("#motion-velocity").fill("20");
  await page.locator("#motion-timeout").fill("12");
  await expect(page.locator("#execute-motion")).toBeEnabled();
  await page.locator(".fleet-chip[data-arm=\"l\"]").click();
  await expect(page.locator("#motion-reference")).toHaveText("WORK / cell");
  await expect(page.locator("#pose-x")).toHaveValue("");
  await expect(page.locator("#execute-motion")).toBeDisabled();
  await page.locator(".fleet-chip[data-arm=\"r\"]").click();
  await expect(page.locator("#pose-x")).toHaveValue("0.40");
  await expect(page.locator("#execute-motion")).toBeEnabled();
  await page.locator("#execute-motion").click();
  await page.evaluate(() => {
    (window as any).__webSocket.emit("message", { data: JSON.stringify({
      type: "action_result", arm: "r", action: "execute_motion", result: { success: true },
    }) });
  });

  const beforeKinematicsMotionCount = await page.evaluate(() =>
    ((window as any).__webMessages as string[])
      .map((value) => JSON.parse(value))
      .filter((message) => message.type === "execute_motion").length,
  );
  await expect(page.locator("#fill-current-pose")).toBeVisible();
  await page.locator("#fill-current-pose").click();
  let kinematicsMessageCount = await page.evaluate(() =>
    ((window as any).__webMessages as string[])
      .map((value) => JSON.parse(value))
      .filter((message) => message.type === "get_current_pose").length,
  );
  expect(kinematicsMessageCount).toBe(2);
  await page.evaluate(() => {
    (window as any).__webSocket.emit("message", { data: JSON.stringify({
      type: "kinematics_result",
      operation: "get_current_pose",
      arm: "r",
      request_id: JSON.parse((window as any).__webMessages[(window as any).__webMessages.length - 1]).request_id,
      success: true,
      pose_position_m: [0.51, 0.52, 0.53],
      pose_quaternion_wxyz: [1, 0, 0, 0],
      current_joint_degrees: [11.5, 22.9, 34.4, 45.8, 57.3, 68.8],
      message: "current pose read",
    }) });
  });
  await expect(page.locator("#pose-x")).toHaveValue("0.51");
  await expect(page.locator("#kinematics-status")).toContainText("当前位置已填入");
  await page.locator("#pose-x").fill("0.55");
  await expect(page.locator("#solve-ik")).toBeEnabled();
  await page.locator("#solve-ik").click();
  kinematicsMessageCount = await page.evaluate(() =>
    ((window as any).__webMessages as string[])
      .map((value) => JSON.parse(value))
      .filter((message) => message.type === "solve_ik").length,
  );
  expect(kinematicsMessageCount).toBe(1);
  const solveRequestId = await page.evaluate(() => {
    const messages = (window as any).__webMessages as string[];
    return JSON.parse(messages[messages.length - 1]).request_id;
  });
  await page.evaluate((requestId) => {
    (window as any).__webSocket.emit("message", { data: JSON.stringify({
      type: "kinematics_result",
      operation: "solve_ik",
      arm: "r",
      request_id: requestId,
      success: true,
      api2_status: 0,
      joint_degrees: [1, 2, 3, 4, 5, 6],
      message: "inverse kinematics solved; shadow preview only",
    }) });
  }, solveRequestId);
  await expect(page.locator("input[data-joint-index=\"0\"]")).toHaveValue(/^1/);
  await expect(page.locator("#kinematics-status")).toContainText("逆解成功");
  expect(await page.evaluate(() =>
    ((window as any).__webMessages as string[])
      .map((value) => JSON.parse(value))
      .filter((message) => message.type === "execute_motion").length,
  )).toBe(beforeKinematicsMotionCount);
  await page.locator("#apply-record").click();
  recordRequestId = await page.evaluate(() => {
    const messages = (window as any).__webMessages as string[];
    const message = messages.map((value) => JSON.parse(value)).findLast((item) => item.type === "apply_joint_record");
    return message.request_id;
  });
  expect(await page.evaluate(() => {
    const messages = (window as any).__webMessages as string[];
    return messages.map((value) => JSON.parse(value)).findLast((item) => item.type === "apply_joint_record").command;
  })).toBe(1);
  await page.evaluate((requestId) => {
    (window as any).__webSocket.emit("message", { data: JSON.stringify({
      type: "joint_record_applied",
      arm: "r",
      request_id: requestId,
      command: 1,
      success: true,
      api2_status: 0,
      record: { id: "ready", label: "Ready", joint_degrees: [15, 25, 35, 45, 55, 65] },
      joint_degrees: [15, 25, 35, 45, 55, 65],
      pose_position_m: [0.61, 0.62, 0.63],
      pose_quaternion_wxyz: [1, 0, 0, 0],
      message: "forward kinematics solved",
    }) });
  }, recordRequestId);
  await expect(page.locator("#pose-x")).toHaveValue("0.61");
  await expect(page.locator("#kinematics-status")).toContainText("记录正解已填入");

  await page.locator("button[data-motion-command=\"2\"]").click();
  await expect(page.locator("#execute-motion")).toHaveText("发送 MOVEP");
  await expect(page.locator("#fill-current-pose")).toBeVisible();
  await expect(page.locator("#solve-ik")).toBeHidden();
  const currentPoseCountBeforeMovepFill = await page.evaluate(() =>
    ((window as any).__webMessages as string[])
      .map((value) => JSON.parse(value))
      .filter((message) => message.type === "get_current_pose").length,
  );
  await page.locator("#fill-current-pose").click();
  await expect.poll(async () => page.evaluate(() =>
    ((window as any).__webMessages as string[])
      .map((value) => JSON.parse(value))
      .filter((message) => message.type === "get_current_pose").length,
  )).toBe(currentPoseCountBeforeMovepFill + 1);
  await page.locator("#pose-x").fill("0.62");
  await expect(page.locator("#kinematics-status")).toContainText("MOVEP 不提供逆解/影子预览");
  await page.locator("#execute-motion").click();
  await page.locator("#cancel-motion").click();
  const messages = await page.evaluate(() => (window as any).__webMessages as string[]);
  const motionMessages = messages.map((value) => JSON.parse(value)).filter((message) => message.type === "execute_motion");
  expect(motionMessages.map((message) => message.goal.command)).toEqual([0, 1, 2]);
  expect(motionMessages.slice(1).map((message) => [message.goal.reference_type, message.goal.reference_name])).toEqual([[1, "cell"], [1, "cell"]]);
  expect(motionMessages[1].goal.pose_position_m).toEqual([0.4, 0.1, 0.5]);
  expect(motionMessages[1].goal.pose_quaternion_wxyz).toEqual([1, 0, 0, 0]);
  expect(motionMessages[1].goal.velocity_percent).toBe(20);
  expect(motionMessages[1].goal.timeout_sec).toBe(12);
  expect(messages.some((value) => JSON.parse(value).type === "cancel_action")).toBe(true);
  await page.locator("button[data-motion-command=\"0\"]").click();
  await expect(page.locator("#delete-record")).toBeVisible();
  await expect(page.locator("#delete-record")).toBeEnabled();
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#delete-record").click();
  const deleteRequestId = await page.evaluate(() => {
    const messages = (window as any).__webMessages as string[];
    const message = messages.map((value) => JSON.parse(value)).findLast((item) => item.type === "delete_joint_record");
    return message?.request_id || "";
  });
  expect(deleteRequestId).not.toBe("");
  await page.evaluate((requestId) => {
    (window as any).__webSocket.emit("message", { data: JSON.stringify({
      type: "joint_record_deleted",
      arm: "r",
      request_id: requestId,
      record: { id: "ready", label: "Ready" },
    }) });
  }, deleteRequestId);
  await expect(page.locator("#record-select")).toHaveValue("");
  await expect(page.locator("#record-status")).toContainText("已删除 Ready");
  await page.screenshot({ path: test.info().outputPath("web-control.png"), fullPage: true });
});

test("falls back to a live Canvas 2D arm preview when WebGL is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function getContext(
      contextId: string,
      options?: any,
    ) {
      if (["webgl", "webgl2", "experimental-webgl"].includes(contextId)) return null;
      return originalGetContext.call(this, contextId as any, options);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });

  await page.goto("/");

  await expect(page.locator("#viewer")).toHaveAttribute("data-renderer", "canvas2d");
  await expect(page.locator("#viewer-state")).toContainText("2D");
  await expect(page.locator(".fleet-chip")).toHaveCount(3);
  const initialChecksum = await page.locator("#canvas").evaluate((element: HTMLCanvasElement) => {
    const context = element.getContext("2d");
    if (!context) return 0;
    return context.getImageData(0, 0, element.width, element.height).data
      .reduce((sum, value, index) => (sum + value * ((index % 7) + 1)) % 1000000007, 0);
  });
  expect(initialChecksum).toBeGreaterThan(0);

  await emitWebSocketEvent(page, {
    type: "joint_state",
    arm: "r",
    positions_rad: [0.8, -0.6, 0.5, -0.4, 0.3, -0.2],
    stamp_ns: 200,
  });
  await expect.poll(() => page.locator("#canvas").evaluate((element: HTMLCanvasElement) => {
    const context = element.getContext("2d");
    if (!context) return 0;
    return context.getImageData(0, 0, element.width, element.height).data
      .reduce((sum, value, index) => (sum + value * ((index % 7) + 1)) % 1000000007, 0);
  })).not.toBe(initialChecksum);
});

test("copies the selected arm current joint angles as degree array", async ({ page }) => {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"], { origin: "http://127.0.0.1:4174" });
  await page.goto("/");
  await page.locator('.fleet-chip[data-arm="m"]').click();
  await page.locator("#copy-current-joints").click();

  await expect(page.locator("#joint-copy-status")).toHaveText("已复制当前关节角");
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(
    "[5.730, 11.459, 17.189, 22.918, 28.648, 34.377]",
  );
});

test("copies current angles through the legacy clipboard fallback", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
    document.execCommand = () => true;
  });
  await page.goto("/");
  await page.locator('.fleet-chip[data-arm="m"]').click();
  await page.locator("#copy-current-joints").click();
  await expect(page.locator("#joint-copy-status")).toHaveText("已复制当前关节角");
});

test("keeps the last live pose when a duplicate publisher emits an all-zero sample", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".fleet-chip[data-arm=\"l\"]")).toContainText("ONLINE");
  await expect(page.locator("#joint-stamp")).toContainText("42");
  await page.evaluate(() => {
    (window as any).__webSocket.emit("message", { data: JSON.stringify({
      type: "joint_state", arm: "l", positions_rad: [0.4, 0.2, -0.3, 0.1, 0.5, -0.2], stamp_ns: 100,
    }) });
  });
  await expect(page.locator("#joint-stamp")).toContainText("100");
  await page.evaluate(() => {
    (window as any).__webSocket.emit("message", { data: JSON.stringify({
      type: "joint_state", arm: "l", positions_rad: [0, 0, 0, 0, 0, 0], stamp_ns: 101,
    }) });
  });
  await expect(page.locator("#joint-stamp")).toContainText("100");
});

test("renders the server-discovered global input mode and sends selections", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#input-mode-card")).toHaveCount(1);
  await expect(page.locator("#input-mode-card")).toBeHidden();

  await emitWebSocketEvent(page, {
    type: "input_mode_list",
    available: true,
    modes: [
      { id: "web", label: "Web", selectable: false },
      { id: "policy", label: "Policy", selectable: true },
      { id: "pika", label: "Pika", selectable: true },
      { id: "none", label: "无输入", selectable: true },
    ],
  });
  await expect(page.locator("#input-mode-card")).toBeVisible();
  await expect(page.locator("#input-mode-select option")).toHaveText(["Policy", "Pika", "无输入"]);
  await expect(page.locator("#input-mode-select option[value=web]")).toHaveCount(0);

  await page.locator("#input-mode-select").selectOption("pika");
  const selection = await page.evaluate(() =>
    ((window as any).__webMessages as string[])
      .map((value) => JSON.parse(value))
      .findLast((message) => message.type === "select_input_mode"),
  );
  expect(selection).toMatchObject({ type: "select_input_mode", mode_id: "pika" });
  expect(selection.request_id).toEqual(expect.any(String));
  expect(selection.request_id).not.toBe("");
  await expect(page.locator("#input-mode-select")).toBeDisabled();

  await emitWebSocketEvent(page, {
    type: "input_mode_result",
    request_id: selection.request_id,
    executor_request_id: 42,
    accepted: true,
    message: "selection accepted",
  });
  await emitWebSocketEvent(page, {
    type: "input_mode_state",
    requested_mode: "pika",
    selected_mode: "pika",
    active_mode: "web",
    phase: "SWITCHING",
    request_id: 42,
    epoch: 7,
    detail: "Pika 正在切换",
  });
  await expect(page.locator("#input-mode-select")).toBeDisabled();
  await expect(page.locator("#input-mode-active")).toContainText("Web");
  await expect(page.locator("#input-mode-detail")).toHaveText("Pika 正在切换");

  await emitWebSocketEvent(page, {
    type: "input_mode_state",
    requested_mode: "web",
    selected_mode: "web",
    active_mode: "web",
    phase: "ACTIVE",
    request_id: 42,
    epoch: 8,
    detail: "Web 控制已启用",
  });
  await expect(page.locator("#input-mode-select")).toBeEnabled();
  await expect(page.locator("#input-mode-active")).toContainText("Web");
  await expect(page.locator("#input-mode-detail")).toHaveText("Web 控制已启用");

  await emitWebSocketEvent(page, {
    type: "input_mode_state",
    requested_mode: "pika",
    selected_mode: "pika",
    active_mode: "web",
    phase: "FAILED",
    request_id: 43,
    epoch: 9,
    detail: "Pika 启动失败",
  });
  await expect(page.locator("#input-mode-active")).toContainText("FAILED");
  await expect(page.locator("#input-mode-detail")).toHaveText("Pika 启动失败");

  await emitWebSocketEvent(page, { type: "input_mode_list", available: false, modes: [] });
  await expect(page.locator("#input-mode-card")).toBeHidden();
});

test("renders command and measured Cartesian velocity telemetry for both arms", async ({ page }) => {
  await page.goto("/");
  await emitWebSocketEvent(page, {
    type: "cartesian_velocity_state",
    arm: "l",
    state: {
      session_active: true,
      reference_type: 1,
      reference_name: "cell",
      command_frame_id: "l/work/cell",
      commanded_linear_velocity_mps: [0.4, 0, 0],
      commanded_angular_velocity_radps: [0, 0.1, 0],
      limited_linear_velocity_mps: [0.2, 0, 0],
      limited_angular_velocity_radps: [0, 0.05, 0],
      measured_frame_id: "l/base_link",
      measured_linear_velocity_mps: [0.18, 0, 0],
      measured_angular_velocity_radps: [0, 0.04, 0],
      measured_valid: true,
      command_age_ms: 20,
      measured_age_ms: 10,
    },
  });
  await emitWebSocketEvent(page, {
    type: "cartesian_velocity_state",
    arm: "r",
    state: {
      session_active: false,
      reference_type: 1,
      reference_name: "cell",
      command_frame_id: "r/work/cell",
      commanded_linear_velocity_mps: [0, 0, 0],
      commanded_angular_velocity_radps: [0, 0, 0],
      limited_linear_velocity_mps: [0, 0, 0],
      limited_angular_velocity_radps: [0, 0, 0],
      measured_frame_id: "r/base_link",
      measured_linear_velocity_mps: [0, 0, 0],
      measured_angular_velocity_radps: [0, 0, 0],
      measured_valid: false,
      command_age_ms: 200,
      measured_age_ms: 999,
    },
  });

  await expect(page.locator("#velocity-telemetry-panel")).toBeVisible();
  await expect(page.locator("#velocity-telemetry-l")).toContainText("l/work/cell");
  await expect(page.locator("#velocity-telemetry-l")).toContainText("命令线速度");
  await expect(page.locator("#velocity-telemetry-l")).toContainText("0.400");
  await expect(page.locator("#velocity-telemetry-l")).toContainText("l/base_link");
  await expect(page.locator("#velocity-telemetry-l")).toContainText("VALID");
  await expect(page.locator("#velocity-telemetry-r")).toContainText("r/work/cell");
  await expect(page.locator("#velocity-telemetry-r")).toContainText("r/base_link");
  await expect(page.locator("#velocity-telemetry-r")).toContainText("STALE / NO DATA");
});

test("unlocks input mode selection when reconnect loses its result", async ({ page }) => {
  await page.goto("/");
  await emitWebSocketEvent(page, {
    type: "input_mode_list",
    available: true,
    modes: [
      { id: "web", label: "Web", selectable: false },
      { id: "policy", label: "Policy", selectable: true },
      { id: "pika", label: "Pika", selectable: true },
    ],
  });
  await page.locator("#input-mode-select").selectOption("pika");
  await expect(page.locator("#input-mode-select")).toBeDisabled();

  await page.evaluate(() => {
    (window as any).__closedWebSocket = (window as any).__webSocket;
    (window as any).__webSocket.readyState = 3;
    (window as any).__webSocket.emit("close", {});
  });
  await expect.poll(() => page.evaluate(() =>
    (window as any).__webSocket !== (window as any).__closedWebSocket,
  )).toBe(true);

  await emitWebSocketEvent(page, {
    type: "input_mode_list",
    available: true,
    modes: [
      { id: "web", label: "Web", selectable: false },
      { id: "policy", label: "Policy", selectable: true },
      { id: "pika", label: "Pika", selectable: true },
    ],
  });
  await emitWebSocketEvent(page, {
    type: "input_mode_state",
    requested_mode: "policy",
    selected_mode: "policy",
    active_mode: "policy",
    phase: "ACTIVE",
    request_id: 77,
    epoch: 12,
    detail: "Policy 已启用",
  });
  await expect(page.locator("#input-mode-select")).toBeEnabled();
  await expect(page.locator("#input-mode-select")).toHaveValue("policy");
});

test("enables input mode selection when the socket opens after catalog discovery", async ({ page }) => {
  await page.goto("/");
  await expect.poll(() => page.evaluate(() =>
    (window as any).__webSocket?.readyState,
  )).toBe(1);
  await page.evaluate(() => {
    const socket = (window as any).__webSocket;
    socket.readyState = 0;
    socket.emit("message", { data: JSON.stringify({
      type: "input_mode_list",
      available: true,
      modes: [
        { id: "web", label: "Web", selectable: false },
        { id: "policy", label: "Policy", selectable: true },
      ],
    }) });
  });
  await expect(page.locator("#input-mode-select")).toBeDisabled();

  await page.evaluate(() => {
    const socket = (window as any).__webSocket;
    socket.readyState = 1;
    socket.emit("open", {});
  });
  await expect(page.locator("#input-mode-select")).toBeEnabled();
});

test("captures independent l/r physical keys only while keyboard is active", async ({ page }) => {
  await page.goto("/");
  await emitWebSocketEvent(page, {
    type: "input_mode_list",
    available: true,
    modes: [
      { id: "web", label: "Web", selectable: false },
      { id: "keyboard", label: "Web / 键盘速度控制", selectable: true },
      { id: "none", label: "无输入", selectable: true },
    ],
  });
  await emitWebSocketEvent(page, {
    type: "input_mode_state",
    requested_mode: "keyboard",
    selected_mode: "keyboard",
    active_mode: "keyboard",
    phase: "ACTIVE",
    request_id: 51,
    epoch: 4,
    detail: "keyboard active",
  });
  await emitWebSocketEvent(page, { type: "keyboard_lease", active: true });
  await expect(page.locator("#keyboard-control-card")).toBeVisible();
  await expect(page.locator("#viewer")).toHaveAttribute("data-keyboard-work-frames", "l,r");
  await expect(page.locator("#keyboard-frame-legend")).toBeVisible();
  await expect(page.locator("#keyboard-frame-legend")).toContainText("L WORK");
  await expect(page.locator("#keyboard-frame-legend")).toContainText("R WORK");

  await page.keyboard.down("w");
  await page.keyboard.down("i");
  await expect.poll(() => page.evaluate(() =>
    ((window as any).__webMessages as string[])
      .map(JSON.parse)
      .filter((message) => message.type === "keyboard_state")
      .some((message) => message.arm === "l" && message.keys.includes("KeyW")),
  )).toBe(true);
  await expect.poll(() => page.evaluate(() =>
    ((window as any).__webMessages as string[])
      .map(JSON.parse)
      .filter((message) => message.type === "keyboard_state")
      .some((message) => message.arm === "r" && message.keys.includes("KeyI")),
  )).toBe(true);
  await expect(page.locator('#keyboard-left [data-code="KeyW"]')).toHaveClass(/pressed/);
  await expect(page.locator('#keyboard-right [data-code="KeyI"]')).toHaveClass(/pressed/);

  await page.keyboard.up("w");
  await expect.poll(() => page.evaluate(() =>
    ((window as any).__webMessages as string[])
      .map(JSON.parse)
      .filter((message) => message.type === "keyboard_state" && message.arm === "l")
      .at(-1)?.keys.length,
  )).toBe(0);
  await page.keyboard.up("i");

  await emitWebSocketEvent(page, {
    type: "input_mode_state", requested_mode: "none", selected_mode: "none",
    active_mode: "none", phase: "ACTIVE", request_id: 52, epoch: 5, detail: "",
  });
  await expect(page.locator("#viewer")).toHaveAttribute("data-keyboard-work-frames", "");
  await expect(page.locator("#keyboard-frame-legend")).toBeHidden();
});

test("does not send keyboard heartbeat when another browser owns the active mode", async ({ page }) => {
  await page.goto("/");
  await emitWebSocketEvent(page, {
    type: "input_mode_list", available: true,
    modes: [{ id: "keyboard", label: "Web / 键盘速度控制", selectable: true }],
  });
  await emitWebSocketEvent(page, {
    type: "input_mode_state", requested_mode: "keyboard", selected_mode: "keyboard",
    active_mode: "keyboard", phase: "ACTIVE", request_id: 60, epoch: 10, detail: "",
  });
  await emitWebSocketEvent(page, { type: "keyboard_lease", active: false });
  await page.waitForTimeout(180);
  expect(await page.evaluate(() =>
    ((window as any).__webMessages as string[]).map(JSON.parse)
      .filter((message) => message.type === "keyboard_state").length,
  )).toBe(0);
  await expect(page.locator("#keyboard-control-state")).toHaveText("REMOTE");
  await emitWebSocketEvent(page, {
    type: "error", code: "keyboard_lease", message: "client does not own keyboard control lease",
    request_id: "movej-remote",
  });
  await expect(page.locator("#result")).not.toContainText("keyboard_lease");
});

test("highlights keyboard instructions without scrolling away from the work area", async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).__keyboardGuideScrolls = 0;
    Element.prototype.scrollIntoView = function () {
      if ((this as HTMLElement).id === "keyboard-control-card") {
        (window as any).__keyboardGuideScrolls += 1;
      }
    };
  });
  await page.goto("/");
  await emitWebSocketEvent(page, {
    type: "input_mode_list", available: true,
    modes: [{ id: "keyboard", label: "Web / 键盘速度控制", selectable: true }],
  });
  const active = {
    type: "input_mode_state", requested_mode: "keyboard", selected_mode: "keyboard",
    active_mode: "keyboard", phase: "ACTIVE", request_id: 61, epoch: 10, detail: "",
  };
  await emitWebSocketEvent(page, active);
  await emitWebSocketEvent(page, { type: "keyboard_lease", active: true });

  await expect.poll(() => page.evaluate(() => (window as any).__keyboardGuideScrolls)).toBe(0);
  await expect(page.locator("#keyboard-control-card")).toHaveClass(/keyboard-guide-active/);

  await emitWebSocketEvent(page, active);
  await expect.poll(() => page.evaluate(() => (window as any).__keyboardGuideScrolls)).toBe(0);

  await emitWebSocketEvent(page, { ...active, request_id: 62, epoch: 11 });
  await expect.poll(() => page.evaluate(() => (window as any).__keyboardGuideScrolls)).toBe(0);
});

test("blurs the input mode selector after keyboard activation so motion keys are available", async ({ page }) => {
  await page.goto("/");
  await emitWebSocketEvent(page, {
    type: "input_mode_list", available: true,
    modes: [
      { id: "keyboard", label: "Web / 键盘速度控制", selectable: true },
      { id: "none", label: "无输入", selectable: true },
    ],
  });
  await page.locator("#input-mode-select").selectOption("keyboard");
  const browserRequestId = await page.evaluate(() =>
    ((window as any).__webMessages as string[]).map(JSON.parse)
      .findLast((message) => message.type === "select_input_mode")?.request_id,
  );
  await emitWebSocketEvent(page, {
    type: "input_mode_result", request_id: browserRequestId,
    executor_request_id: 63, accepted: true, message: "accepted",
  });
  await emitWebSocketEvent(page, {
    type: "input_mode_state", requested_mode: "keyboard", selected_mode: "keyboard",
    active_mode: "keyboard", phase: "ACTIVE", request_id: 63, epoch: 12, detail: "",
  });
  await emitWebSocketEvent(page, { type: "keyboard_lease", active: true });
  await expect(page.locator("#input-mode-select")).not.toBeFocused();
});

test("keeps the mode selector focused during repeated active-state replay", async ({ page }) => {
  await page.goto("/");
  await emitWebSocketEvent(page, {
    type: "input_mode_list", available: true,
    modes: [
      { id: "keyboard", label: "Web / 键盘速度控制", selectable: true },
      { id: "none", label: "无输入", selectable: true },
    ],
  });
  const active = {
    type: "input_mode_state", requested_mode: "none", selected_mode: "none",
    active_mode: "none", phase: "ACTIVE", request_id: 64, epoch: 13, detail: "",
  };
  await emitWebSocketEvent(page, active);
  await page.locator("#input-mode-select").focus();
  await emitWebSocketEvent(page, active);
  await expect(page.locator("#input-mode-select")).toBeFocused();
});

test("lets a remote page request the already-active keyboard mode", async ({ page }) => {
  await page.goto("/");
  await emitWebSocketEvent(page, {
    type: "input_mode_list", available: true,
    modes: [
      { id: "keyboard", label: "Web / 键盘速度控制", selectable: true },
      { id: "none", label: "无输入", selectable: true },
    ],
  });
  await emitWebSocketEvent(page, {
    type: "input_mode_state", requested_mode: "keyboard", selected_mode: "keyboard",
    active_mode: "keyboard", phase: "ACTIVE", request_id: 65, epoch: 14, detail: "",
  });
  await emitWebSocketEvent(page, { type: "keyboard_lease", active: false });
  await expect(page.locator("#input-mode-select")).toHaveValue("");
  await page.locator("#input-mode-select").selectOption("keyboard");
  await expect.poll(() => page.evaluate(() =>
    ((window as any).__webMessages as string[]).map(JSON.parse)
      .some((message) => message.type === "select_input_mode" && message.mode_id === "keyboard"),
  )).toBe(true);
});

async function activateKeyboardWithGrippers(page: any) {
  await page.goto("/");
  await expect(page.locator(".fleet-chip[data-arm='l']")).toContainText("ONLINE");
  await emitWebSocketEvent(page, { type: "input_mode_list", available: true,
    modes: [{ id: "keyboard", label: "Keyboard", selectable: true }] });
  await emitWebSocketEvent(page, { type: "input_mode_state", requested_mode: "keyboard",
    selected_mode: "keyboard", active_mode: "keyboard", phase: "ACTIVE", request_id: 55, epoch: 8 });
  await emitWebSocketEvent(page, { type: "keyboard_lease", active: true });
  for (const name of ["gripper_left", "gripper_right"]) {
    await emitWebSocketEvent(page, { type: "gripper_state", name, connected: true, alarm: 0,
      position: 0, speed: 0, current: 0, torque_reached: false });
  }
}

async function latestKeys(page: any, arm: string) {
  return page.evaluate((id: string) => ((window as any).__webMessages as string[]).map(JSON.parse)
    .findLast((msg) => msg.type === "keyboard_state" && msg.arm === id)?.keys ?? [], arm);
}

test("keyboard grippers use independent full-target keys alongside arm velocity", async ({ page }) => {
  await activateKeyboardWithGrippers(page);
  await expect(page.locator("#keyboard-control-card")).toContainText("松键不撤销");
  await expect(page.locator('#keyboard-left [data-code="Digit1"]')).toHaveText("1");
  await expect(page.locator('#keyboard-right [data-code="Digit0"]')).toHaveText("0");
  await page.keyboard.down("w");
  await page.keyboard.down("1");
  await page.keyboard.down("0");
  await expect.poll(() => latestKeys(page, "l")).toEqual(["Digit1", "KeyW"]);
  await expect.poll(() => latestKeys(page, "r")).toEqual(["Digit0"]);
  await page.keyboard.up("1");
  await expect.poll(() => latestKeys(page, "l")).toEqual(["KeyW"]);
  await page.keyboard.up("w");
  await page.keyboard.up("0");
  await page.keyboard.down("2");
  await page.keyboard.down("9");
  await expect.poll(() => latestKeys(page, "l")).toEqual(["Digit2"]);
  await expect.poll(() => latestKeys(page, "r")).toEqual(["Digit9"]);
});

test("keyboard gripper readiness is independent from WORK and blocks alarms", async ({ page }) => {
  await activateKeyboardWithGrippers(page);
  await page.keyboard.down("w");
  await page.keyboard.down("1");
  await emitWebSocketEvent(page, { type: "coordinate_state", arm: "l", motion_allowed: false,
    work_matched: false, current_work: "other", expected_work: "cell" });
  await expect.poll(() => latestKeys(page, "l")).toEqual(["Digit1"]);
  await page.keyboard.up("1");
  await page.keyboard.down("2");
  await expect.poll(() => latestKeys(page, "l")).toEqual(["Digit2"]);
  await emitWebSocketEvent(page, { type: "gripper_state", name: "gripper_left", connected: true, alarm: 1 });
  await expect.poll(() => latestKeys(page, "l")).toEqual([]);
  await expect(page.locator("#keyboard-left .keyboard-gripper")).toContainText("ALARM");
  await page.keyboard.up("2");
  await page.keyboard.down("1");
  await expect.poll(() => latestKeys(page, "l")).toEqual([]);
  await page.keyboard.down("9");
  await expect.poll(() => latestKeys(page, "r")).toEqual(["Digit9"]);
});

test("keyboard grippers ignore repeats after blur, modifiers and editable targets", async ({ page }) => {
  await activateKeyboardWithGrippers(page);
  await page.keyboard.down("1");
  await expect.poll(() => latestKeys(page, "l")).toEqual(["Digit1"]);
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await page.keyboard.down("1"); // Physical key is still down: repeat=true.
  await expect.poll(() => latestKeys(page, "l")).toEqual([]);
  await page.keyboard.up("1");
  await page.keyboard.press("Control+2");
  await expect.poll(() => latestKeys(page, "l")).toEqual([]);
  await page.locator("input[data-joint-index='0']").focus();
  await page.keyboard.press("1");
  await expect.poll(() => latestKeys(page, "l")).toEqual([]);
  await page.locator("input[data-joint-index='0']").blur();
  await page.keyboard.down("2");
  await expect.poll(() => latestKeys(page, "l")).toEqual(["Digit2"]);
  await emitWebSocketEvent(page, { type: "input_mode_state", requested_mode: "none", selected_mode: "none",
    active_mode: "none", phase: "ACTIVE", request_id: 56, epoch: 9 });
  await expect.poll(() => latestKeys(page, "l")).toEqual([]);
});

test("keyboard safety events release both arms and stop heartbeat", async ({ page }) => {
  await page.goto("/");
  await emitWebSocketEvent(page, {
    type: "input_mode_list", available: true,
    modes: [{ id: "keyboard", label: "Web / 键盘速度控制", selectable: true }],
  });
  await emitWebSocketEvent(page, { type: "keyboard_lease", active: true });
  await emitWebSocketEvent(page, {
    type: "input_mode_state", requested_mode: "keyboard", selected_mode: "keyboard",
    active_mode: "keyboard", phase: "ACTIVE", request_id: 52, epoch: 5, detail: "",
  });
  await page.keyboard.down("w");
  await page.keyboard.down("i");
  await expect.poll(() => page.evaluate(() =>
    ((window as any).__webMessages as string[]).map(JSON.parse)
      .filter((message) => message.type === "keyboard_state").length,
  )).toBeGreaterThan(0);

  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect.poll(() => page.evaluate(() => {
    const messages = ((window as any).__webMessages as string[]).map(JSON.parse)
      .filter((message) => message.type === "keyboard_state");
    return ["l", "r"].every((arm) => messages.findLast((message) => message.arm === arm)?.keys.length === 0);
  })).toBe(true);
  const afterBlur = await page.evaluate(() =>
    ((window as any).__webMessages as string[]).map(JSON.parse)
      .filter((message) => message.type === "keyboard_state").length,
  );
  await page.waitForTimeout(180);
  expect(await page.evaluate(() =>
    ((window as any).__webMessages as string[]).map(JSON.parse)
      .filter((message) => message.type === "keyboard_state").length,
  )).toBe(afterBlur);

  await emitWebSocketEvent(page, { type: "input_mode_list", available: false, modes: [] });
  await expect(page.locator("#keyboard-control-card")).toBeHidden();
});

test("keyboard releases an unavailable arm and both arms on mode or visibility loss", async ({ page }) => {
  await page.goto("/");
  const catalog = {
    type: "input_mode_list", available: true,
    modes: [{ id: "keyboard", label: "Web / 键盘速度控制", selectable: true }],
  };
  const active = {
    type: "input_mode_state", requested_mode: "keyboard", selected_mode: "keyboard",
    active_mode: "keyboard", phase: "ACTIVE", request_id: 53, epoch: 6, detail: "",
  };
  await emitWebSocketEvent(page, catalog);
  await emitWebSocketEvent(page, active);
  await emitWebSocketEvent(page, { type: "keyboard_lease", active: true });
  await page.keyboard.down("w");
  await page.keyboard.down("i");
  await emitWebSocketEvent(page, {
    type: "coordinate_state", arm: "l", motion_allowed: false,
    work_matched: false, current_work: "other", expected_work: "cell",
    work: { type: 1, name: "other", frame_id: "l/work/other" },
  });
  await expect.poll(() => page.evaluate(() => {
    const messages = ((window as any).__webMessages as string[]).map(JSON.parse)
      .filter((message) => message.type === "keyboard_state");
    return messages.findLast((message) => message.arm === "l")?.keys.length;
  })).toBe(0);
  await expect.poll(() => page.evaluate(() => {
    const messages = ((window as any).__webMessages as string[]).map(JSON.parse)
      .filter((message) => message.type === "keyboard_state");
    return messages.findLast((message) => message.arm === "r")?.keys.includes("KeyI");
  })).toBe(true);

  await emitWebSocketEvent(page, {
    type: "input_mode_state", requested_mode: "none", selected_mode: "none",
    active_mode: "none", phase: "ACTIVE", request_id: 54, epoch: 7, detail: "",
  });
  await expect.poll(() => page.evaluate(() => {
    const messages = ((window as any).__webMessages as string[]).map(JSON.parse)
      .filter((message) => message.type === "keyboard_state");
    return ["l", "r"].every((arm) => messages.findLast((message) => message.arm === arm)?.keys.length === 0);
  })).toBe(true);

  await emitWebSocketEvent(page, active);
  await page.keyboard.down("i");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect.poll(() => page.evaluate(() => {
    const messages = ((window as any).__webMessages as string[]).map(JSON.parse)
      .filter((message) => message.type === "keyboard_state");
    return ["l", "r"].every((arm) => messages.findLast((message) => message.arm === arm)?.keys.length === 0);
  })).toBe(true);
});

test("clears MOVEL waiting feedback placeholder when the action is rejected", async ({ page }) => {
  await page.goto("/");
  await page.locator("button[data-motion-command=\"1\"]").click();
  await page.locator("#pose-x").fill("0.4");
  await page.locator("#pose-y").fill("0.1");
  await page.locator("#pose-z").fill("0.5");
  await expect(page.locator("#execute-motion")).toBeEnabled();
  await page.locator("#execute-motion").click();
  await expect(page.locator("#feedback")).toContainText("等待 feedback");
  const requestId = await page.evaluate(() =>
    ((window as any).__webMessages as string[])
      .map((value) => JSON.parse(value))
      .findLast((item) => item.type === "execute_motion").request_id,
  );
  await page.evaluate((id) => {
    (window as any).__webSocket.emit("message", { data: JSON.stringify({
      type: "action_state", arm: "l", action: "execute_motion", request_id: id,
      state: "rejected", message: "driver rejected motion goal",
    }) });
  }, requestId);
  await expect(page.locator("#feedback")).toContainText("driver rejected motion goal");
  await expect(page.locator("#feedback")).not.toContainText("等待 feedback");
});

test("reports an emergency-stop action result transport loss without exposing the ROS exception", async ({ page }) => {
  await page.goto("/");
  await page.locator("button[data-motion-command=\"1\"]").click();
  await page.locator("#pose-x").fill("0.4");
  await page.locator("#pose-y").fill("0.1");
  await page.locator("#pose-z").fill("0.5");
  await expect(page.locator("#execute-motion")).toBeEnabled();
  await page.locator("#execute-motion").click();
  await expect(page.locator("#feedback")).toContainText("等待 feedback");
  const requestId = await page.evaluate(() =>
    ((window as any).__webMessages as string[])
      .map((value) => JSON.parse(value))
      .findLast((item) => item.type === "execute_motion").request_id,
  );
  await page.evaluate((id) => {
    (window as any).__webSocket.emit("message", { data: JSON.stringify({
      type: "action_state", arm: "l", action: "execute_motion", request_id: id,
      state: "stopped", code: "goal_handle_unknown",
      message: "运动已中断，Action 结果不可用；请检查急停状态并恢复机械臂",
    }) });
  }, requestId);
  await expect(page.locator("#feedback")).toContainText("请检查急停状态并恢复机械臂");
  await expect(page.locator("#feedback")).not.toContainText("Goal handle is not known");
  await expect(page.locator("#execute-motion")).toBeEnabled();
  await expect(page.locator("#cancel-motion")).toBeDisabled();
});

test("warns when MOVEL has no feedback without permitting a second motion", async ({ page }) => {
  test.setTimeout(25_000);
  await page.goto("/");
  await page.locator("button[data-motion-command=\"1\"]").click();
  await page.locator("#pose-x").fill("0.4");
  await page.locator("#pose-y").fill("0.1");
  await page.locator("#pose-z").fill("0.5");
  await page.locator("#execute-motion").click();
  await expect(page.locator("#feedback")).toContainText("等待 feedback");
  await expect(page.locator("#feedback")).toContainText("尚未收到", { timeout: 12_000 });
  await expect(page.locator("#execute-motion")).toBeDisabled();
  await expect(page.locator("#cancel-motion")).toBeEnabled();
});
