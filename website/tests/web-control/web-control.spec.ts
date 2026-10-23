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

// The server pushes the behavior-tree view over /ws on every visible change.
async function pushBtRuntime(page: any, runtime: Record<string, unknown>) {
  await emitWebSocketEvent(page, { type: "bt_runtime", runtime });
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
  // Shared pedestal from config/ros/three_robots.yaml.
  await expect(page.locator("#viewer")).toHaveAttribute("data-pedestal", "1");
  const viewerBounds = await page.locator("#viewer").boundingBox();
  expect(viewerBounds?.height).toBeLessThanOrEqual(560);
  expect(viewerBounds?.height).toBeGreaterThan(300);
  await expect(page.locator(".visualization-column > .viewer-panel")).toHaveCount(1);
  await expect(page.locator(".visualization-column > #velocity-telemetry-panel")).toHaveCount(1);
  await expect(page.locator(".controls > #velocity-telemetry-panel")).toHaveCount(0);
  await expect(page.locator(".visualization-column > .status-row > #coordinate-panel")).toHaveCount(1);
  await expect(page.locator(".visualization-column > .status-row > #action-monitor-panel")).toHaveCount(1);
  await expect(page.locator("#motion-panel")).toBeVisible();
  await expect(page.locator("#velocity-panel")).toBeHidden();
  await expect(page.locator("#gripper-panel")).toBeHidden();
  await expect(page.locator("#control-tab-keyboard")).toBeHidden();
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

test("switches control tabs and remembers the last one across reloads", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#control-tab-motion")).toHaveAttribute("aria-selected", "true");
  await page.locator("#control-tab-velocity").click();
  await expect(page.locator("#velocity-panel")).toBeVisible();
  await expect(page.locator("#motion-panel")).toBeHidden();
  await expect(page.locator("#coordinate-panel")).toBeVisible();
  await expect(page.locator("#action-monitor-panel")).toBeVisible();
  await page.reload();
  await expect(page.locator("#control-tab-velocity")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#velocity-panel")).toBeVisible();
});

test("resets the joint target to the live pose on load and when reopening the motion tab", async ({ page }) => {
  await page.goto("/");
  // The fake socket's initial l sample is all zero; the first real pose must still reach the sliders.
  await emitWebSocketEvent(page, { type: "joint_state", arm: "l", positions_rad: [0.5, 0.2, -0.3, 0.1, 0.4, -0.2], stamp_ns: 100 });
  await expect(page.locator("input[data-joint-index=\"0\"]")).toHaveValue(/^28\.6/);
  await expect(page.locator("#joint-value-0")).toHaveText("28.65°");

  await page.locator("#control-tab-velocity").click();
  await emitWebSocketEvent(page, { type: "joint_state", arm: "l", positions_rad: [1.0, 0.2, -0.3, 0.1, 0.4, -0.2], stamp_ns: 101 });
  await expect(page.locator("#joint-value-0")).toHaveText("28.65°");
  await page.locator("#control-tab-motion").click();
  await expect(page.locator("input[data-joint-index=\"0\"]")).toHaveValue(/^57\.3/);
  await expect(page.locator("#joint-value-0")).toHaveText("57.30°");

  // Clicking the already-open motion tab keeps a manual edit.
  await page.locator("input[data-joint-index=\"0\"]").evaluate((element: HTMLInputElement) => {
    element.value = "10";
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.locator("#control-tab-motion").click();
  await expect(page.locator("#joint-value-0")).toHaveText(/^10\.0\d°$/);
});

function btNode(path: string, kind: string, registration: string, name: string, status: string, failure_reason = "") {
  return { path, kind, registration_name: registration, name, status, failure_reason };
}
// Shape of the live control.xml snapshot on realman_ts (policy mode active), trimmed.
const controlRuntime = {
  available: true, tree_id: "control", sequence: 7, timestamp_ms: 1, root_status: "RUNNING", failure_reason: "",
  nodes: [
    btNode("0", "Control", "ReactiveSequence", "input_control", "RUNNING"),
    btNode("0/0", "Action", "SelectInputMode", "SelectInputMode", "SUCCESS"),
    btNode("0/1", "Control", "ReactiveFallback", "input_router", "RUNNING"),
    btNode("0/1/0", "Control", "ReactiveSequence", "keyboard_branch", "FAILURE"),
    btNode("0/1/0/0", "Condition", "InputModeGuard", "InputModeGuard", "FAILURE"),
    btNode("0/1/0/1", "Action", "KeyboardVelocityInput", "KeyboardVelocityInput", "IDLE"),
    btNode("0/1/1", "Control", "ReactiveSequence", "policy_branch", "RUNNING"),
    btNode("0/1/1/0", "Condition", "InputModeGuard", "InputModeGuard", "SUCCESS"),
    btNode("0/1/1/1", "Control", "Sequence", "policy_entry", "RUNNING"),
    btNode("0/1/1/1/0", "Action", "ThreeArmMoveJ", "policy_start_pose", "SUCCESS"),
    btNode("0/1/1/1/1", "Decorator", "RetryUnlessFault", "RetryUnlessFault", "RUNNING"),
    btNode("0/1/1/1/1/0", "Action", "PolicyRun", "PolicyRun", "FAILURE", "policy server timeout"),
    btNode("0/1/2", "Control", "ReactiveSequence", "none_branch", "IDLE"),
    btNode("0/1/2/0", "Condition", "InputModeGuard", "InputModeGuard", "IDLE"),
    btNode("0/1/2/1", "Action", "IdleInput", "IdleInput", "IDLE"),
  ],
};
const moveRuntime = {
  available: true, tree_id: "arm_move", sequence: 3, timestamp_ms: 1, root_status: "SUCCESS", failure_reason: "",
  nodes: [
    btNode("0", "Control", "Sequence", "arm_move", "SUCCESS"),
    btNode("0/0", "Action", "MoveJ", "ready_pose", "SUCCESS"),
    btNode("0/1", "Action", "MoveJ", "work_pose", "SUCCESS"),
  ],
};

test("shows the behavior-tree card only while a tree runs and focuses the active router branch", async ({ page }) => {
  await page.goto("/");
  await pushBtRuntime(page, { available: false });
  await expect(page.locator("#bt-panel")).toBeHidden();

  await pushBtRuntime(page, controlRuntime);
  await expect(page.locator("#bt-panel")).toBeVisible();
  // Appearing does not take over the panel the operator is using.
  await expect(page.locator("#motion-panel")).toBeVisible();
  await expect(page.locator("#bt-root-status")).toHaveText("RUNNING");
  await expect(page.locator("#bt-tree-id")).toContainText("输入路由 policy_branch");
  await expect(page.locator("#bt-breadcrumb")).toContainText("input_control");
  await expect(page.locator("#bt-breadcrumb")).toContainText("input_router");
  await expect(page.locator("#bt-tree > .bt-node")).toHaveAttribute("data-path", "0/1/1");
  await expect(page.locator("#bt-tree")).not.toContainText("keyboard_branch");
  await expect(page.locator('#bt-tree [data-path="0/1/1/1/1/0"]')).toHaveAttribute("data-status", "FAILURE");
  await expect(page.locator("#bt-tree")).toContainText("policy server timeout");

  // Collapse and expand a subtree; the choice survives the next snapshot.
  await page.locator('[data-bt-toggle="0/1/1/1"]').click();
  await expect(page.locator('#bt-tree [data-path="0/1/1/1/0"]')).toHaveCount(0);
  await pushBtRuntime(page, { ...controlRuntime, sequence: 43 });
  await expect(page.locator('#bt-tree [data-path="0/1/1/1/0"]')).toHaveCount(0);
  await page.locator('[data-bt-toggle="0/1/1/1"]').click();
  await expect(page.locator('#bt-tree [data-path="0/1/1/1/0"]')).toHaveCount(1);

  // Whole tree on demand: other branches appear, IDLE subtrees start collapsed.
  await page.locator("#bt-scope-toggle").click();
  await expect(page.locator("#bt-tree > .bt-node")).toHaveAttribute("data-path", "0");
  await expect(page.locator("#bt-tree")).toContainText("keyboard_branch");
  await expect(page.locator('#bt-tree [data-path="0/1/2/1"]')).toHaveCount(0);
  // Unused input branches are muted and folded: their guard FAILURE is normal routing.
  await expect(page.locator('#bt-tree [data-path="0/1/0"]')).toHaveClass(/bt-muted/);
  await expect(page.locator('#bt-tree [data-path="0/1/0/0"]')).toHaveCount(0);
  await expect(page.locator('#bt-tree [data-path="0/1/1"]')).not.toHaveClass(/bt-muted/);
  await expect(page.locator("#bt-breadcrumb")).toBeHidden();

  // The tree stops: bt-start takes the monitor down and the tab goes away.
  await pushBtRuntime(page, { available: false });
  await expect(page.locator("#bt-panel")).toBeHidden();
  await expect(page.locator("#motion-panel")).toBeVisible();
});

test("says in the behavior-tree card why the router went to the none branch", async ({ page }) => {
  await page.goto("/");
  await emitWebSocketEvent(page, {
    type: "input_mode_list",
    available: true,
    modes: [{ id: "policy", label: "Policy", selectable: true }, { id: "none", label: "无输入", selectable: true }],
  });
  await pushBtRuntime(page, controlRuntime);
  const reason = page.locator("#bt-mode-reason");
  const state = { type: "input_mode_state", request_id: 7, epoch: 3 };
  await emitWebSocketEvent(page, { ...state, requested_mode: "policy", selected_mode: "policy",
    active_mode: "policy", phase: "ACTIVE", detail: "" });
  await expect(reason).toBeHidden();

  const failure = "joint J5 = 19.6 deg is outside [20.0, 108.2]";
  await emitWebSocketEvent(page, { ...state, requested_mode: "policy", selected_mode: "policy",
    active_mode: "policy", phase: "FAILED", detail: failure });
  await expect(reason).toHaveText(`Policy 失败：${failure}`);
  await expect(reason).toHaveClass(/bt-mode-reason-failure/);

  // The executor keeps the reason on the none state after the failed branch has been halted.
  await emitWebSocketEvent(page, { ...state, epoch: 4, requested_mode: "none", selected_mode: "none",
    active_mode: "none", phase: "ACTIVE", detail: `policy failed: ${failure}` });
  await expect(reason).toHaveText(`切换到 无输入 分支的原因：policy failed: ${failure}`);
  await expect(reason).toHaveClass(/bt-mode-reason-failure/);

  await emitWebSocketEvent(page, { ...state, epoch: 5, requested_mode: "none", selected_mode: "none",
    active_mode: "none", phase: "ACTIVE", detail: "requested by web:operator" });
  await expect(reason).toHaveText("切换到 无输入 分支的原因：requested by web:operator");
  await expect(reason).not.toHaveClass(/bt-mode-reason-failure/);

  // Switching back to policy starts clean: the old reason is gone.
  await emitWebSocketEvent(page, { ...state, request_id: 8, epoch: 5, requested_mode: "policy",
    selected_mode: "none", active_mode: "none", phase: "SWITCHING", detail: "" });
  await expect(reason).toBeHidden();
});

test("updates the behavior tree from pushes and hides it when the socket drops", async ({ page }) => {
  await page.goto("/");
  await pushBtRuntime(page, controlRuntime);
  await expect(page.locator('#bt-tree [data-path="0/1/1/1/1/0"]')).toHaveAttribute("data-status", "FAILURE");
  const nodes = (controlRuntime.nodes as Record<string, unknown>[]).map((node) =>
    node.path === "0/1/1/1/1/0" ? { ...node, status: "RUNNING", failure_reason: "" } : node);
  await pushBtRuntime(page, { ...controlRuntime, sequence: 43, nodes });
  await expect(page.locator('#bt-tree [data-path="0/1/1/1/1/0"]')).toHaveAttribute("data-status", "RUNNING");

  // No socket, no tree states: a frozen tree would look like a stuck robot.
  await page.evaluate(() => (window as any).__webSocket.emit("close", {}));
  await expect(page.locator("#bt-running")).toBeHidden();
});

test("stops the running behavior tree after a confirming second click", async ({ page }) => {
  await page.goto("/");
  await pushBtRuntime(page, controlRuntime);
  const stopRequests = () => page.evaluate(() => ((window as any).__webMessages as string[])
    .map((value) => JSON.parse(value)).filter((item) => item.type === "stop_behavior_tree"));

  // First click only arms the button.
  await page.locator("#bt-stop").click();
  await expect(page.locator("#bt-stop")).toHaveText("确认终止？");
  expect(await stopRequests()).toHaveLength(0);
  await page.locator("#bt-stop").click();
  await expect.poll(stopRequests).toHaveLength(1);
  const [request] = await stopRequests();
  expect(Object.keys(request).sort()).toEqual(["request_id", "type"]);
  await expect(page.locator("#bt-stop")).toHaveText("正在终止…");
  await expect(page.locator("#bt-stop")).toBeDisabled();

  await emitWebSocketEvent(page, {
    type: "behavior_tree_stop_result", request_id: request.request_id, success: true,
    message: "shutting down after 0 pending cancellation(s)",
  });
  await expect(page.locator("#bt-stop-status")).toContainText("等待行为树取消动作并退出");

  // The executor exits, bt-start stops the monitor: tab and in-flight state go away.
  await pushBtRuntime(page, { available: false });
  await expect(page.locator("#bt-panel")).toBeHidden();
  await expect(page.locator("#motion-panel")).toBeVisible();

  // A later tree starts clean; a refused request is reported and the button re-enabled.
  await pushBtRuntime(page, controlRuntime);
  await expect(page.locator("#bt-stop")).toHaveText("终止行为树");
  await page.locator("#bt-stop").click();
  await page.locator("#bt-stop").click();
  await expect.poll(stopRequests).toHaveLength(2);
  const second = (await stopRequests())[1];
  await emitWebSocketEvent(page, {
    type: "error", code: "behavior_tree_unavailable", request_id: second.request_id,
    message: "/realman_bt_executor/shutdown is not available; no behavior tree is running",
  });
  await expect(page.locator("#bt-stop-status")).toContainText("终止失败");
  await expect(page.locator("#bt-stop")).toBeEnabled();
});

function libraryTree(name: string, launch = "arm_move", arms = ["r"]) {
  return { name, main_tree: "MainTree", launch, arms, valid: true, favorite: false };
}
async function mockLauncher(page: any) {
  const state = {
    favorites: [] as string[],
    starts: [] as Record<string, unknown>[],
    launcher: { running: false, launched_here: false } as Record<string, unknown>,
  };
  const trees = () => {
    const all = [libraryTree("control.xml", "control_router", ["l", "m", "r"]), libraryTree("move.xml"), libraryTree("three.xml", "arm_move", ["l", "m", "r"])];
    const pinned = state.favorites.map((name) => ({ ...all.find((tree) => tree.name === name)!, favorite: true }));
    return [...pinned, ...all.filter((tree) => !state.favorites.includes(tree.name))];
  };
  await page.route("**/api/bt/trees", (route: any) => route.fulfill({ json: { available: true, launcher: state.launcher, trees: trees() } }));
  await page.route("**/api/bt/favorites", async (route: any) => {
    const body = route.request().postDataJSON();
    state.favorites = body.favorite ? [...state.favorites, body.name] : state.favorites.filter((name) => name !== body.name);
    await route.fulfill({ json: { ok: true, trees: trees() } });
  });
  await page.route("**/api/bt/start", async (route: any) => {
    const body = route.request().postDataJSON();
    state.starts.push(body);
    state.launcher = { running: true, launched_here: true, tree: body.tree, dry_run: body.dry_run, started_at_ms: 1000 + state.starts.length, log: "/opt/rm65_ws/logs/bt-launcher/x.log" };
    await route.fulfill({ json: { ok: true, ...state.launcher } });
  });
  return state;
}

test("starts a behavior tree picked from the file list, with shared favorites pinned first", async ({ page }) => {
  const state = await mockLauncher(page);
  await page.goto("/");
  // The card is there before any tree runs, because trees can be started from it.
  await expect(page.locator("#bt-launcher")).toBeVisible();
  await expect(page.locator("#bt-running")).toBeHidden();
  await expect(page.locator("#bt-stop")).toBeHidden();
  await expect(page.locator("#bt-root-status")).toHaveText("未运行");

  await page.locator("#bt-picker-button").click();
  await expect(page.locator("#bt-picker-list .bt-option")).toHaveCount(3);
  await page.locator('[data-favorite-toggle="three.xml"]').click();
  await expect(page.locator("#bt-picker-list .bt-option").first()).toHaveAttribute("data-tree", "three.xml");
  await expect(page.locator("#bt-picker-list .bt-option-group").first()).toHaveText("收藏");
  expect(state.favorites).toEqual(["three.xml"]);
  await page.locator('#bt-picker-list [data-tree="control.xml"]').click();
  await expect(page.locator("#bt-picker-list")).toBeHidden();
  await expect(page.locator("#bt-picker-label")).toHaveText("control");
  await expect(page.locator("#bt-picker-meta")).toHaveText("control_router · l,m,r");

  // Real motion is the default; the first click only arms the start.
  await expect(page.locator("#bt-real-motion")).toBeChecked();
  await page.locator("#bt-start").click();
  await expect(page.locator("#bt-start")).toHaveText("确认启动（真实运动）？");
  expect(state.starts).toHaveLength(0);
  await page.locator("#bt-start").click();
  await expect.poll(() => state.starts.length).toBe(1);
  expect(state.starts[0]).toEqual({ tree: "control.xml", dry_run: false });
  await expect(page.locator("#bt-start-status")).toContainText("正在启动 control.xml（真实运动）");
  await expect(page.locator("#bt-start")).toBeDisabled();

  // The tree comes up: the launcher gives way to the live tree and its stop button.
  await pushBtRuntime(page, controlRuntime);
  await expect(page.locator("#bt-running")).toBeVisible();
  await expect(page.locator("#bt-launcher")).toBeHidden();
  await expect(page.locator("#bt-stop")).toBeVisible();
  await expect(page.locator("#bt-root-status")).toHaveText("RUNNING");

  // It stops again: the start menu is back, and the pin is still there.
  await pushBtRuntime(page, { available: false });
  state.launcher = { ...state.launcher, running: false, launched_here: false, exit_code: 0 };
  await expect(page.locator("#bt-launcher")).toBeVisible();
  await expect(page.locator("#bt-start")).toBeEnabled();
});

test("starts in dry-run when real motion is unticked and reports a bt-start that exits", async ({ page }) => {
  const state = await mockLauncher(page);
  await page.goto("/");
  await page.locator("#bt-real-motion").uncheck();
  await page.locator("#bt-start").click();
  await expect(page.locator("#bt-start")).toHaveText("确认启动（dry-run）？");
  await page.locator("#bt-start").click();
  await expect.poll(() => state.starts.length).toBe(1);
  expect(state.starts[0]).toEqual({ tree: "control.xml", dry_run: true });
  // bt-start gives up (e.g. an arm Action is not ready) and exits without a monitor.
  state.launcher = { ...state.launcher, running: false, launched_here: false, exit_code: 1,
    log_tail: ["[bt-start] Action /l/execute_motion is not ready; behavior tree not started"] };
  await expect(page.locator("#bt-start-status")).toContainText("启动失败：bt-start 退出码 1");
  await expect(page.locator("#bt-start-log")).toContainText("/l/execute_motion is not ready");
  await expect(page.locator("#bt-start")).toBeEnabled();
});

test("keeps the behavior-tree card outside the control tabs, foldable per browser", async ({ page }) => {
  await mockLauncher(page);
  await page.goto("/");
  await expect(page.locator("#bt-panel")).toBeVisible();
  // Its own card under the input mode card, not a fifth tab.
  await expect(page.locator("[data-control-tab]")).toHaveCount(4);
  await expect(page.locator("#bt-panel")).not.toHaveAttribute("data-control-panel", /.*/);
  for (const tab of ["velocity", "gripper", "motion"]) {
    await page.locator(`#control-tab-${tab}`).click();
    await expect(page.locator("#bt-panel")).toBeVisible();
  }
  await page.locator("#bt-collapse").click();
  await expect(page.locator("#bt-body")).toBeHidden();
  await page.reload();
  await expect(page.locator("#bt-panel")).toBeVisible();
  await expect(page.locator("#bt-body")).toBeHidden();
  await page.locator("#bt-collapse").click();
  await expect(page.locator("#bt-launcher")).toBeVisible();
});

test("shows every node of a tree that is not the control router", async ({ page }) => {
  await page.goto("/");
  await pushBtRuntime(page, moveRuntime);
  await expect(page.locator("#bt-root-status")).toHaveText("SUCCESS");
  await expect(page.locator("#bt-tree-id")).toContainText("整棵树");
  await expect(page.locator("#bt-scope-toggle")).toBeHidden();
  await expect(page.locator("#bt-tree .bt-node")).toHaveCount(3);
  await expect(page.locator("#bt-tree")).toContainText("work_pose");
});

test("reports a WebGL renderer failure when WebGL is unavailable", async ({ page }) => {
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

  await expect(page.locator("#viewer")).not.toHaveAttribute("data-renderer", "canvas2d");
  await expect(page.locator("#viewer-state")).toContainText("WebGL 渲染失败");
  await expect(page.locator("#viewer-state")).toContainText("Error creating WebGL context");
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

test("restarts the active input branch through none and back", async ({ page }) => {
  await page.goto("/");
  const lastSelection = () => page.evaluate(() =>
    ((window as any).__webMessages as string[])
      .map((value) => JSON.parse(value))
      .findLast((message) => message.type === "select_input_mode"),
  );
  const modeState = (overrides: Record<string, unknown>) => emitWebSocketEvent(page, {
    type: "input_mode_state", requested_mode: "pika", selected_mode: "pika", active_mode: "pika",
    phase: "ACTIVE", request_id: 1, epoch: 3, detail: "", ...overrides,
  });
  await emitWebSocketEvent(page, {
    type: "input_mode_list",
    available: true,
    modes: [
      { id: "web", label: "Web", selectable: false },
      { id: "pika", label: "Pika", selectable: true },
      { id: "none", label: "无输入", selectable: true },
    ],
  });
  const restart = page.locator("#input-mode-restart");
  await modeState({ requested_mode: "none", selected_mode: "none", active_mode: "none" });
  await expect(restart).toBeDisabled();

  await modeState({});
  await expect(restart).toBeEnabled();
  await restart.click();
  const toNone = await lastSelection();
  expect(toNone).toMatchObject({ mode_id: "none" });
  await expect(restart).toBeDisabled();
  await expect(page.locator("#input-mode-detail")).toContainText("重启 Pika");

  await emitWebSocketEvent(page, {
    type: "input_mode_result", request_id: toNone.request_id, executor_request_id: 10, accepted: true, message: "",
  });
  await modeState({ requested_mode: "none", selected_mode: "none", phase: "SWITCHING", request_id: 10 });
  expect((await lastSelection()).request_id).toBe(toNone.request_id);
  await modeState({ requested_mode: "none", selected_mode: "none", active_mode: "none", request_id: 10, epoch: 4 });

  const back = await lastSelection();
  expect(back).toMatchObject({ mode_id: "pika" });
  expect(back.request_id).not.toBe(toNone.request_id);
  await emitWebSocketEvent(page, {
    type: "input_mode_result", request_id: back.request_id, executor_request_id: 11, accepted: true, message: "",
  });
  await modeState({ request_id: 11, epoch: 5 });
  await expect(page.locator("#input-mode-select")).toHaveValue("pika");
  await expect(restart).toBeEnabled();

  // A failed switch to none ends the restart; nothing is selected afterwards.
  await restart.click();
  const failedNone = await lastSelection();
  await emitWebSocketEvent(page, {
    type: "input_mode_result", request_id: failedNone.request_id, executor_request_id: 12, accepted: true, message: "",
  });
  await modeState({ requested_mode: "none", selected_mode: "none", phase: "FAILED", request_id: 12, detail: "none 失败" });
  await modeState({ requested_mode: "none", selected_mode: "none", active_mode: "none", request_id: 12, epoch: 6 });
  expect((await lastSelection()).request_id).toBe(failedNone.request_id);
});

test("renders command and measured Cartesian velocity telemetry for both arms", async ({ page }) => {
  await page.goto("/");
  // The WORK command is rotated with the arm's coordinate_state, so wait for it first.
  await expect(page.locator("#motion-reference")).toHaveText("WORK / cell");
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
  await expect(page.locator("#velocity-telemetry-l")).toContainText("l/base_link");
  await expect(page.locator("#velocity-telemetry-l")).toContainText("VALID");
  await expect(page.locator("#velocity-telemetry-l")).toContainText("命令已从 WORK / cell 旋转到实测坐标系");
  await expect(page.locator("#velocity-telemetry-r")).toContainText("r/work/cell");
  await expect(page.locator("#velocity-telemetry-r")).toContainText("r/base_link");
  await expect(page.locator("#velocity-telemetry-r")).toContainText("STALE / NO DATA");
  // No numeric readouts any more: the card only carries frames, status and the two charts.
  await expect(page.locator("#velocity-telemetry-l")).not.toContainText("0.400");

  // y-axis autoscale: peak 0.2 m/s and 0.05 rad/s, padded and rounded up; idle arm keeps the floor.
  const trace = (arm: string, kind: string) => page.locator(`#velocity-telemetry-${arm} [data-field="${kind}-trace"]`);
  await expect(trace("l", "linear")).toHaveAttribute("data-y-max", "0.25");
  await expect(trace("l", "angular")).toHaveAttribute("data-y-max", "0.1");
  await expect(trace("r", "linear")).toHaveAttribute("data-y-max", "0.01");
  await expect(trace("l", "linear")).toHaveAttribute("data-last-command", "[0.2,0,0]");
});

test("plots joint currents against the policy guard limits below the velocity telemetry", async ({ page }) => {
  await page.goto("/");
  const panel = page.locator("#joint-current-panel");
  await expect(panel).toBeVisible();
  // Placed directly after the velocity telemetry, in the same column.
  await expect(page.locator(".visualization-column > #velocity-telemetry-panel + #joint-current-panel")).toHaveCount(1);
  // Limits and sustain come from config/ros/policy_task.yaml current_guard; the policy drives r.
  await expect(page.locator("#joint-current-hint")).toContainText("R 臂持续 0.5 s 超过 100%");
  await expect(page.locator('#joint-current-r [data-field="guard"]')).toHaveText("保护 ON");
  await expect(page.locator('#joint-current-l [data-field="guard"]')).toHaveText("仅监测");
  await expect(page.locator('#joint-current-r .current-chip[data-joint="2"]')).toContainText("/ 7 A");

  await emitWebSocketEvent(page, { type: "joint_currents", arm: "l", currents_ma: [800, -2400, 1500, 90, -300, 12], stamp_ns: 1 });
  await expect(page.locator('#joint-current-l [data-field="status"]')).toHaveText("正常");
  await expect(page.locator('#joint-current-l [data-field="j2"]')).toHaveText("2.40");
  const trace = (arm: string) => page.locator(`#joint-current-${arm} [data-field="current-trace"]`);
  await expect(trace("l")).toHaveAttribute("data-last-percent", "[20,34,19,2,4,0]");
  await expect(trace("l")).toHaveAttribute("data-y-max", "150");

  // J2 pressed past its 7 A limit: the chip turns red at once, the status counts up and turns to
  // the guard's colour once the sustain time has passed.
  const pressing = { type: "joint_currents", arm: "r", currents_ma: [900, -10000, 3000, 500, 400, 100], stamp_ns: 2 };
  await emitWebSocketEvent(page, pressing);
  await expect(page.locator('#joint-current-r .current-chip[data-joint="2"]')).toHaveClass(/over/);
  await expect(page.locator('#joint-current-r .current-chip[data-joint="1"]')).not.toHaveClass(/over/);
  await expect(page.locator('#joint-current-r [data-field="status"]')).toContainText("J2 超限");
  await expect(trace("r")).toHaveAttribute("data-y-max", "200");
  await page.waitForTimeout(600);
  await emitWebSocketEvent(page, pressing);
  await expect(page.locator('#joint-current-r [data-field="status"]')).toHaveClass(/over/);
  // One reading back under the limit clears it, as in the guard.
  await emitWebSocketEvent(page, { ...pressing, currents_ma: [900, -3000, 3000, 500, 400, 100] });
  await expect(page.locator('#joint-current-r [data-field="status"]')).toHaveText("正常");
  // No readings for a second: stale.
  await expect(page.locator('#joint-current-r [data-field="status"]')).toHaveText("STALE / NO DATA", { timeout: 3000 });
});

test("expresses WORK commands in the measured base frame and skips TOOL commands", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#motion-reference")).toHaveText("WORK / cell");
  const yawQuarterTurn = [Math.SQRT1_2, 0, 0, Math.SQRT1_2];
  await emitWebSocketEvent(page, {
    type: "coordinate_state", arm: "l", motion_allowed: true, preferred_reference_type: 1, preferred_reference_name: "cell",
    preferred_reference: { type: 1, name: "cell", frame_id: "l/work/cell" },
    tool: null, work: { type: 1, name: "cell", frame_id: "l/work/cell", xyz_m: [0, 0, 0], quaternion_wxyz: yawQuarterTurn },
    current_tool: "", current_work: "cell", expected_tool: "", expected_work: "cell", matched: true, tool_matched: true,
    work_matched: true, api2_status: 0, message: "ok",
  });
  const state = (referenceType: number, name: string) => ({
    type: "cartesian_velocity_state", arm: "l", state: {
      session_active: true, reference_type: referenceType, reference_name: name, command_frame_id: `l/${referenceType === 2 ? "tool" : "work"}/${name}`,
      commanded_linear_velocity_mps: [0.1, 0, 0], commanded_angular_velocity_radps: [0, 0, 0.2],
      limited_linear_velocity_mps: [0.1, 0, 0], limited_angular_velocity_radps: [0, 0, 0.2],
      measured_frame_id: "l/base_link", measured_linear_velocity_mps: [0, 0.09, 0], measured_angular_velocity_radps: [0, 0, 0.19],
      measured_valid: true, command_age_ms: 10, measured_age_ms: 10,
    },
  });
  const trace = (kind: string) => page.locator(`#velocity-telemetry-l [data-field="${kind}-trace"]`);
  await emitWebSocketEvent(page, state(1, "cell"));
  // +X in the work frame is +Y in base after a quarter turn about Z; Z rotation is unchanged.
  await expect(trace("linear")).toHaveAttribute("data-last-command", "[0,0.1,0]");
  await expect(trace("angular")).toHaveAttribute("data-last-command", "[0,0,0.2]");

  await emitWebSocketEvent(page, state(2, "tcpgrip"));
  await expect(page.locator("#velocity-telemetry-l")).toContainText("TOOL 坐标系命令随末端旋转，未叠加命令");
  await expect(trace("linear")).toHaveAttribute("data-last-command", "null");
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
  await expect(page.locator("#control-tab-keyboard")).toHaveAttribute("aria-selected", "true");

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

test("mounts a gripper on every arm and follows live gripper position feedback", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/");
  const viewer = page.locator("#viewer");
  // 3 grippers x 9 meshes are loaded, attached to the flange links, before the scene is ready.
  await expect(viewer).toHaveAttribute("data-gripper-meshes", "27", { timeout: 30_000 });

  await emitWebSocketEvent(page, {
    type: "gripper_list",
    grippers: [
      { name: "gripper_left", open_position: 400, close_position: 949 },
      { name: "gripper_mid", open_position: 0, close_position: 9000 },
      { name: "gripper_right", open_position: 4000, close_position: 12000 },
    ],
  });
  // Each gripper maps its own device-unit endpoints (open/close differ per gripper) to 0..1.
  await emitWebSocketEvent(page, { type: "gripper_state", name: "gripper_left", connected: true, position: 674.5, speed: 0, current: 0, torque_reached: false, alarm: 0 });
  await emitWebSocketEvent(page, { type: "gripper_state", name: "gripper_mid", connected: true, position: 9000, speed: 0, current: 0, torque_reached: false, alarm: 0 });
  await emitWebSocketEvent(page, { type: "gripper_state", name: "gripper_right", connected: true, position: 4000, speed: 0, current: 0, torque_reached: false, alarm: 0 });
  await expect(viewer).toHaveAttribute("data-gripper-l", "0.50");
  await expect(viewer).toHaveAttribute("data-gripper-m", "0.00");
  await expect(viewer).toHaveAttribute("data-gripper-r", "1.00");
  await expect(page.locator("#gripper-feedback")).toContainText("开合 50%");

  // Live updates keep moving the model.
  await emitWebSocketEvent(page, { type: "gripper_state", name: "gripper_left", connected: true, position: 949, speed: 0, current: 0, torque_reached: false, alarm: 0 });
  await expect(viewer).toHaveAttribute("data-gripper-l", "0.00");
});

test("gripper travel limits are edited, confirmed and applied from the web panel", async ({ page }) => {
  await page.goto("/");
  await page.locator("#control-tab-gripper").click();
  const sentCommands = () => page.evaluate(() =>
    ((window as any).__webMessages as string[])
      .map((value) => JSON.parse(value))
      .filter((item) => item.type === "gripper_command"));
  const list = (open: number, close: number) => ({
    type: "gripper_list",
    grippers: [{ name: "gripper_right", open_position: open, close_position: close, min_position: 0, max_position: 12000 }],
  });
  const state = (position: number, speed = 0) => ({
    type: "gripper_state", name: "gripper_right", connected: true, position, speed, current: 0, torque_reached: false, alarm: 0,
  });

  await emitWebSocketEvent(page, list(4000, 12000));
  await emitWebSocketEvent(page, state(4000));
  await page.locator("#gripper-limits > summary").click();
  await expect(page.locator("#gripper-open-position")).toHaveValue("4000");
  await expect(page.locator("#gripper-close-position")).toHaveValue("12000");
  await expect(page.locator("#gripper-limits-range")).toContainText("0..12000");

  // "Set to current position" only copies the live reading into the input.
  await emitWebSocketEvent(page, state(52));
  await page.locator("#gripper-teach-open").click();
  await expect(page.locator("#gripper-open-position")).toHaveValue("52");
  expect(await sentCommands()).toHaveLength(0);

  // It is disabled while the gripper is moving.
  await emitWebSocketEvent(page, state(60, 5));
  await expect(page.locator("#gripper-teach-open")).toBeDisabled();
  await emitWebSocketEvent(page, state(52, 0));
  await expect(page.locator("#gripper-teach-open")).toBeEnabled();

  // Unapplied edits survive a gripper_list broadcast.
  await page.locator("#gripper-close-position").fill("8500");
  await emitWebSocketEvent(page, list(77, 11000));
  await expect(page.locator("#gripper-open-position")).toHaveValue("52");
  await expect(page.locator("#gripper-close-position")).toHaveValue("8500");

  // Apply asks for confirmation that shows old -> new values, then sends one command.
  let dialogMessage = "";
  page.once("dialog", async (dialog) => {
    dialogMessage = dialog.message();
    await dialog.accept();
  });
  await page.locator("#gripper-limits-apply").click();
  expect(dialogMessage).toContain("开位 77 → 52");
  expect(dialogMessage).toContain("闭位 11000 → 8500");
  const commands = await sentCommands();
  expect(commands).toHaveLength(1);
  expect(commands[0]).toMatchObject({
    command: "set_limits", name: "gripper_right", open_position: 52, close_position: 8500,
  });

  // The completed result clears the edit state; the broadcast limits drive the readout.
  await emitWebSocketEvent(page, {
    type: "gripper_result", name: "gripper_right", command: "set_limits",
    request_id: commands[0].request_id, state: "completed", success: true, message: "ok",
  });
  // Different limits prove the inputs follow the broadcast again (the edit state is really cleared).
  await emitWebSocketEvent(page, list(60, 9000));
  await expect(page.locator("#gripper-open-position")).toHaveValue("60");
  await expect(page.locator("#gripper-close-position")).toHaveValue("9000");
  await emitWebSocketEvent(page, list(52, 8500));
  await emitWebSocketEvent(page, state(4000));
  await expect(page.locator("#gripper-open-position")).toHaveValue("52");
  await expect(page.locator("#gripper-close-position")).toHaveValue("8500");
  await expect(page.locator("#gripper-feedback")).toContainText("开合 53%");

  // The raw-position slider sends one move_raw on release.
  await page.locator("#gripper-raw-position").evaluate((element: HTMLInputElement) => {
    element.value = "1234";
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await expect(page.locator("#gripper-raw-value")).toHaveText("1234");
  const jog = (await sentCommands()).filter((item) => item.command === "move_raw");
  expect(jog).toHaveLength(1);
  expect(jog[0]).toMatchObject({ name: "gripper_right", position: 1234 });
});

test("gripper limits editor errors stay visible while telemetry streams", async ({ page }) => {
  await page.goto("/");
  await page.locator("#control-tab-gripper").click();
  await expect(page.locator(".fleet-chip[data-arm=\"l\"]")).toContainText("ONLINE");
  const sentCommands = () => page.evaluate(() =>
    ((window as any).__webMessages as string[])
      .map((value) => JSON.parse(value))
      .filter((item) => item.type === "gripper_command"));
  const state = (name: string, position: number) => ({
    type: "gripper_state", name, connected: true, position, speed: 0, current: 0, torque_reached: false, alarm: 0,
  });
  const streamTelemetry = async () => {
    for (const position of [4001, 4002, 4003, 4004, 4005]) {
      await emitWebSocketEvent(page, state("gripper_right", position));
    }
  };
  await emitWebSocketEvent(page, {
    type: "gripper_list",
    grippers: [
      { name: "gripper_right", open_position: 4000, close_position: 12000, min_position: 0, max_position: 12000 },
      { name: "gripper_left", open_position: 20, close_position: 900, min_position: 0, max_position: 1000 },
    ],
  });
  await emitWebSocketEvent(page, state("gripper_right", 4000));
  await page.locator("#gripper-limits > summary").click();
  const status = page.locator("#gripper-limits-status");
  const feedback = page.locator("#gripper-feedback");
  await expect(page.locator("#gripper-open-position")).toHaveValue("4000");
  await expect(status).toHaveAttribute("role", "status");
  await expect(status).toHaveText("");

  // A client-side validation failure lands in the limits status line and survives telemetry.
  let dialogs = 0;
  page.on("dialog", async (dialog) => {
    dialogs += 1;
    await dialog.dismiss();
  });
  await page.locator("#gripper-open-position").fill("");
  await page.locator("#gripper-limits-apply").click();
  await expect(status).toContainText("开位和闭位必须是整数");
  await streamTelemetry();
  await expect(status).toContainText("开位和闭位必须是整数");
  await expect(feedback).not.toContainText("必须是整数");
  expect(dialogs).toBe(0);
  expect(await sentCommands()).toHaveLength(0);

  // Starting a new edit clears the stale message.
  await page.locator("#gripper-open-position").fill("100");
  await expect(status).toHaveText("");

  // A rejected set_limits stays visible while gripper_state keeps arriving.
  page.removeAllListeners("dialog");
  page.on("dialog", (dialog) => dialog.accept());
  await page.locator("#gripper-limits-apply").click();
  const commands = await sentCommands();
  expect(commands).toHaveLength(1);
  expect(commands[0]).toMatchObject({ command: "set_limits", open_position: 100, close_position: 12000 });
  await emitWebSocketEvent(page, {
    type: "gripper_result", name: "gripper_right", command: "set_limits",
    request_id: commands[0].request_id, state: "requested",
  });
  await emitWebSocketEvent(page, {
    type: "gripper_result", name: "gripper_right", command: "set_limits",
    request_id: commands[0].request_id, state: "completed", success: false,
    message: "Gripper busy: continuous control is active",
  });
  await streamTelemetry();
  await expect(status).toContainText("失败：Gripper busy: continuous control is active");
  await expect(feedback).not.toContainText("Gripper busy");
  await expect(feedback).toContainText("位置 4005");

  // A rejected move_raw is reported in the same place.
  await emitWebSocketEvent(page, {
    type: "gripper_result", name: "gripper_right", command: "move_raw",
    request_id: "raw-1", state: "failed", success: false, message: "position 99999 is outside 0..12000",
  });
  await streamTelemetry();
  await expect(status).toContainText("失败：position 99999 is outside 0..12000");

  // A successful set_limits is marked as applied.
  await emitWebSocketEvent(page, {
    type: "gripper_result", name: "gripper_right", command: "set_limits",
    request_id: commands[0].request_id, state: "completed", success: true, message: "limits saved",
  });
  await streamTelemetry();
  await expect(status).toContainText("已应用：limits saved");

  // Results of other commands keep using the telemetry line.
  await emitWebSocketEvent(page, {
    type: "gripper_result", name: "gripper_right", command: "open",
    request_id: "open-1", state: "completed", success: true, message: "open done",
  });
  await expect(feedback).toContainText("open done");
  await expect(status).toContainText("已应用：limits saved");

  // Switching gripper clears the limits message.
  await page.locator("#gripper-select").selectOption("gripper_left");
  await expect(status).toHaveText("");
});

test("gripper travel limits are disabled without write access", async ({ page }) => {
  await page.goto("/");
  await page.locator("#control-tab-gripper").click();
  // The fake socket sends its own read_only:false hello 20 ms after load; wait for that burst first.
  await expect(page.locator(".fleet-chip[data-arm=\"l\"]")).toContainText("ONLINE");
  await emitWebSocketEvent(page, { type: "hello", read_only: true });
  await emitWebSocketEvent(page, {
    type: "gripper_list",
    grippers: [{ name: "gripper_right", open_position: 50, close_position: 8500, min_position: 0, max_position: 8500 }],
  });
  await page.locator("#gripper-limits > summary").click();
  await expect(page.locator("#gripper-limits-apply")).toBeDisabled();
  await expect(page.locator("#gripper-open-position")).toBeDisabled();
  await expect(page.locator("#gripper-raw-position")).toBeDisabled();
});

test("gripper travel limits are disabled while the socket is closed and re-enabled on reconnect", async ({ page }) => {
  await page.goto("/");
  await page.locator("#control-tab-gripper").click();
  await expect(page.locator(".fleet-chip[data-arm=\"l\"]")).toContainText("ONLINE");
  await emitWebSocketEvent(page, {
    type: "gripper_list",
    grippers: [{ name: "gripper_right", open_position: 50, close_position: 8500, min_position: 0, max_position: 8500 }],
  });
  await page.locator("#gripper-limits > summary").click();
  await expect(page.locator("#gripper-limits-apply")).toBeEnabled();
  await expect(page.locator("#gripper-open-position")).toBeEnabled();
  await expect(page.locator("#gripper-raw-position")).toBeEnabled();

  // Losing the socket must disable the editor without waiting for another gripper message.
  await page.evaluate(() => {
    const socket = (window as any).__webSocket;
    socket.readyState = 3;
    socket.emit("close", {});
  });
  await expect(page.locator("#gripper-limits-apply")).toBeDisabled();
  await expect(page.locator("#gripper-open-position")).toBeDisabled();
  await expect(page.locator("#gripper-close-position")).toBeDisabled();
  await expect(page.locator("#gripper-raw-position")).toBeDisabled();

  // Even if the button is forced on, Apply must neither ask for confirmation nor send anything.
  let dialogs = 0;
  page.on("dialog", async (dialog) => {
    dialogs += 1;
    await dialog.dismiss();
  });
  await page.locator("#gripper-limits-apply").evaluate((element: HTMLButtonElement) => {
    element.disabled = false;
    element.click();
  });
  expect(dialogs).toBe(0);

  // The app reconnects after 2 s; the editor comes back once the new socket is open.
  await expect(page.locator("#gripper-limits-apply")).toBeEnabled({ timeout: 8_000 });
  await expect(page.locator("#gripper-open-position")).toBeEnabled();
});

test("restarts the bringup container after a confirming second click and shows the result", async ({ page }) => {
  const state = { helper: { services: ["realman_bringup_remote"], restarting: false } as Record<string, unknown>, posts: 0 };
  await page.route("**/api/docker/restart", async (route: any) => {
    if (route.request().method() === "POST") {
      state.posts += 1;
      state.helper = { ...state.helper, restarting: true, service: "realman_bringup_remote", started_at_ms: Date.now() };
      return route.fulfill({ json: { ok: true, service: "realman_bringup_remote", started_at_ms: Date.now() } });
    }
    return route.fulfill({ json: { available: true, service: "realman_bringup_remote", helper: state.helper } });
  });
  await page.goto("/");
  const button = page.locator("#docker-restart");
  await expect(button).toHaveText("重启 Docker");
  await button.click();
  await expect(button).toHaveText("确认重启？");
  expect(state.posts).toBe(0);
  await button.click();
  await expect(button).toHaveText("重启中…");
  await expect(button).toBeDisabled();
  await expect(page.locator("#docker-restart-state")).toContainText("RESTARTING");
  expect(state.posts).toBe(1);

  state.helper = { ...state.helper, restarting: false, finished_at_ms: Date.now(), exit_code: 0, output_tail: [] };
  await expect(page.locator("#docker-restart-state")).toContainText("RESTARTED");
  await expect(button).toBeEnabled();
});

test("disables the restart button while the host helper is not running", async ({ page }) => {
  await page.route("**/api/docker/restart", (route: any) => route.fulfill({
    json: { available: false, error: "host restart helper is not reachable (./rm65 restart-helper install)" },
  }));
  await page.goto("/");
  await expect(page.locator("#docker-restart")).toBeDisabled();
  await expect(page.locator("#docker-restart")).toHaveAttribute("title", /restart-helper install/);
});
