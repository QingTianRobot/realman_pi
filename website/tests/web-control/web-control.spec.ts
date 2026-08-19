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

test("loads configured URDF scene and sends MOVEJ/cancel protocol", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#viewer")).toHaveAttribute("data-live-meshes", /^[7-9]|[1-9][0-9]+$/, { timeout: 30_000 });
  await expect(page.locator("#viewer")).toHaveAttribute("data-shadow-meshes", /^[7-9]|[1-9][0-9]+$/);
  await expect(page.locator("#connection")).toContainText("ROS ONLINE");
  await expect(page.locator("#coordinate-state")).toContainText("READY");
  await expect(page.locator("#coordinate-summary")).toContainText("WORK / cell");
  await expect(page.locator("input[data-joint-index=\"0\"]")).toBeVisible();
  const before = await canvasChecksum(page);
  await page.locator("input[data-joint-index=\"0\"]").evaluate((element: HTMLInputElement) => {
    element.value = "30";
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.waitForTimeout(200);
  expect(await canvasChecksum(page)).not.toBe(before);
  await page.locator("#movej").click();
  await page.locator("#cancel-motion").click();
  const messages = await page.evaluate(() => (window as any).__webMessages as string[]);
  expect(messages.some((value) => JSON.parse(value).type === "execute_motion")).toBe(true);
  expect(messages.some((value) => JSON.parse(value).type === "cancel_action")).toBe(true);
  await page.screenshot({ path: test.info().outputPath("web-control.png"), fullPage: true });
});
