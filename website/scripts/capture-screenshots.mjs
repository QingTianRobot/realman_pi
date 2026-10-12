// Regenerates the documentation screenshots of the :8765 Web control page from the real UI, fed by a
// scripted WebSocket (no robot needed). Run with the Vite dev server up:
//   npm run dev:web-control            # terminal 1 (serves http://127.0.0.1:4174/)
//   PLAYWRIGHT_CHROME_PATH=/path/to/chrome node scripts/capture-screenshots.mjs   # terminal 2
// Output: docs-assets/screenshots/*.png (committed; sync-three-robots.mjs copies them into the site's generated
// public directory as /screenshots/). Re-run after visible UI changes.
import { mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "../docs-assets/screenshots");
const require = createRequire(join(here, "../package.json"));
const { chromium } = require("@playwright/test");
const baseUrl = process.env.WEB_CONTROL_URL ?? "http://127.0.0.1:4174/";
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROME_PATH || "/usr/bin/google-chrome",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });

await page.addInitScript(() => {
  class FakeWebSocket {
    static OPEN = 1;
    readyState = 0;
    listeners = {};
    constructor() {
      window.__socket = this;
      setTimeout(() => { this.readyState = 1; this.emit("open", {}); this.emit("message", { data: JSON.stringify({ type: "hello", read_only: false }) }); }, 20);
    }
    addEventListener(type, callback) { (this.listeners[type] ||= []).push(callback); }
    emit(type, event) { for (const callback of this.listeners[type] || []) callback(event); }
    send() {}
    close() { this.readyState = 3; }
  }
  window.WebSocket = FakeWebSocket;
});

const emit = (message) => page.evaluate((event) => window.__socket.emit("message", { data: JSON.stringify(event) }), message);

await page.goto(baseUrl);
await page.waitForSelector(".fleet-chip");

const pose = { l: [-0.3, 0.5, 1.0, 0.2, 0.9, -0.4], m: [0.1, 0.45, 1.05, 0, 1.0, 0.1], r: [0.35, 0.4, 1.1, -0.2, 1.0, 0.3] };
for (const arm of ["l", "m", "r"]) {
  const frame = (name, controller) => ({ type: 1, name, frame_id: `${arm}/${name === "tcpgrip" ? "tool" : "work"}/${name}`, controller_name: controller ?? name });
  await emit({
    type: "coordinate_state", arm, motion_allowed: true, preferred_reference_type: 1, preferred_reference_name: "cell",
    preferred_reference: { type: 1, name: "cell", frame_id: `${arm}/work/cell` },
    tool: { ...frame("tcpgrip"), type: 2, xyz_m: [0, 0, 0.12], quaternion_wxyz: [1, 0, 0, 0], payload_kg: 0.8, center_of_mass_m: [0, 0, 0.06] },
    work: { ...frame("cell"), xyz_m: [0, 0, 0], quaternion_wxyz: [1, 0, 0, 0] },
    current_tool: "tcpgrip", current_work: "cell", expected_tool: "tcpgrip", expected_work: "cell",
    matched: true, tool_matched: true, work_matched: true, api2_status: 0, message: "ok",
  });
  await emit({ type: "connection", arm, connected: true });
  await emit({ type: "joint_state", arm, positions_rad: pose[arm], stamp_ns: 1000 });
}
await emit({
  type: "input_mode_list", available: true,
  modes: [
    { id: "web", label: "Web", selectable: false },
    { id: "keyboard", label: "Web / 键盘速度控制", selectable: true },
    { id: "pikaposition", label: "Pika / 位置控制", selectable: true },
    { id: "pikavelocity", label: "Pika / 速度控制", selectable: true },
    { id: "pikamixed", label: "Pika / Mixed 控制", selectable: true },
    { id: "none", label: "无输入", selectable: true },
  ],
});
await emit({ type: "input_mode_state", requested_mode: "keyboard", selected_mode: "keyboard", active_mode: "keyboard", phase: "ACTIVE", request_id: 7, epoch: 3, detail: "键盘控制已启用" });
await emit({
  type: "gripper_list",
  grippers: [
    { name: "gripper_left", open_position: 20, close_position: 900 },
    { name: "gripper_mid", open_position: 0, close_position: 9000 },
    { name: "gripper_right", open_position: 50, close_position: 8500 },
  ],
});
for (const [name, position] of [["gripper_left", 420], ["gripper_mid", 3000], ["gripper_right", 2500]]) {
  await emit({ type: "gripper_state", name, connected: true, position, speed: 0, current: 0, torque_reached: false, alarm: 0 });
}
await page.waitForFunction(() => document.querySelector("#viewer")?.dataset.gripperMeshes === "27", null, { timeout: 30000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: join(outDir, "web-control-overview.png") });
console.log("wrote", join(outDir, "web-control-overview.png"));
await browser.close();
