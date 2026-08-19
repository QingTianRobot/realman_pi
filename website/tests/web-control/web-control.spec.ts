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
            preferred_reference: { type: 1, name: "cell", frame_id: "l/cell" },
            tool: { type: 2, name: "tcpgrip", frame_id: "l/tool", controller_name: "tcpgrip", xyz_m: [0, 0, 0.12], quaternion_wxyz: [1, 0, 0, 0], payload_kg: 0.8, center_of_mass_m: [0, 0, 0.06] },
            work: { type: 1, name: "cell", frame_id: "l/work", controller_name: "cell", xyz_m: [0.4, 0.5, 0.6], quaternion_wxyz: [1, 0, 0, 0] },
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
            preferred_reference: { type: 1, name: "cell", frame_id: "m/cell" },
            tool: { type: 2, name: "tcpgrip", frame_id: "m/tool", controller_name: "tcpgrip", xyz_m: [0, 0, 0.12], quaternion_wxyz: [1, 0, 0, 0], payload_kg: 0.8, center_of_mass_m: [0, 0, 0.06] },
            work: { type: 1, name: "cell", frame_id: "m/work", controller_name: "cell", xyz_m: [0.4, 0.5, 0.6], quaternion_wxyz: [1, 0, 0, 0] },
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
            preferred_reference: { type: 1, name: "cell", frame_id: "r/cell" },
            tool: { type: 2, name: "tcpgrip", frame_id: "r/tool", controller_name: "tcpgrip", xyz_m: [0, 0, 0.12], quaternion_wxyz: [1, 0, 0, 0], payload_kg: 0.8, center_of_mass_m: [0, 0, 0.06] },
            work: { type: 1, name: "cell", frame_id: "r/work", controller_name: "cell", xyz_m: [0.4, 0.5, 0.6], quaternion_wxyz: [1, 0, 0, 0] },
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
  await expect(page.locator("#viewer")).toHaveAttribute("data-live-meshes", /^(2[1-9]|[3-9][0-9]|[1-9][0-9]{2,})$/, { timeout: 30_000 });
  await expect(page.locator("#viewer")).toHaveAttribute("data-shadow-meshes", /^(2[1-9]|[3-9][0-9]|[1-9][0-9]{2,})$/);
  await expect(page.locator("#connection")).toContainText("ROS ONLINE");
  await expect(page.locator("#coordinate-state")).toContainText("READY");
  await expect(page.locator("#coordinate-summary")).toContainText("WORK / cell");
  await expect(page.locator("#motion-reference")).toHaveText("WORK / cell");
  await expect(page.locator("#motion-mode button")).toHaveCount(3);
  await expect(page.locator("input[data-joint-index=\"0\"]")).toBeVisible();
  const before = await canvasChecksum(page);
  await page.locator("input[data-joint-index=\"0\"]").evaluate((element: HTMLInputElement) => {
    element.value = "30";
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.waitForTimeout(200);
  expect(await canvasChecksum(page)).not.toBe(before);
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
  await expect(page.locator("#pose-x")).toHaveValue("0.4");
  await expect(page.locator("#execute-motion")).toBeEnabled();
  await page.locator("#execute-motion").click();
  await page.evaluate(() => {
    (window as any).__webSocket.emit("message", { data: JSON.stringify({
      type: "action_result", arm: "r", action: "execute_motion", result: { success: true },
    }) });
  });

  await page.locator("button[data-motion-command=\"2\"]").click();
  await expect(page.locator("#execute-motion")).toHaveText("发送 MOVEP");
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
  await page.screenshot({ path: test.info().outputPath("web-control.png"), fullPage: true });
});
