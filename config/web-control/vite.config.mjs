import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const repositoryDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const websiteDirectory = resolve(repositoryDirectory, "website");
const webDirectory = resolve(repositoryDirectory, "src/driver/realman_web_control/web");
const staticDirectory = resolve(
  repositoryDirectory,
  "src/driver/realman_web_control/realman_web_control/static",
);
const requireFromWebsite = createRequire(resolve(websiteDirectory, "package.json"));
const { defineConfig } = requireFromWebsite("vite");
const YAML = requireFromWebsite("yaml");
const descriptionDirectory = resolve(repositoryDirectory, "src/rm65_description");

async function devManifest() {
  const layout = YAML.parse(await readFile(resolve(repositoryDirectory, "config/ros/three_robots.yaml"), "utf8"));
  const motion = YAML.parse(await readFile(resolve(repositoryDirectory, "config/ros/realman_motion.yaml"), "utf8"));
  const coordinates = YAML.parse(await readFile(resolve(repositoryDirectory, "config/ros/realman_coordinates.yaml"), "utf8"));
  const keyboard = YAML.parse(await readFile(resolve(repositoryDirectory, "config/ros/keyboard_control.yaml"), "utf8"));
  const robots = await Promise.all(["l", "m", "r"].map(async (id) => {
    const item = layout.robots[id];
    const settings = motion.robots[id];
    const coordinate = coordinates.robots[id];
    const tool = coordinate.tools[coordinate.default_tool];
    const work = coordinate.work_frames[coordinate.default_work];
    const urdf = await readFile(resolve(descriptionDirectory, "urdf", `${item.model}.urdf`), "utf8");
    const joints = [...urdf.matchAll(/<joint\s+name="(joint_[1-6])"[\s\S]*?<limit\s+lower="([^"]+)"\s+upper="([^"]+)"/g)]
      .sort((a, b) => a[1].localeCompare(b[1], undefined, { numeric: true }))
      .map((match) => ({ name: match[1], lower_rad: Number(match[2]), upper_rad: Number(match[3]), lower_deg: Number(match[2]) * 180 / Math.PI, upper_deg: Number(match[3]) * 180 / Math.PI }));
    return {
      id, model: item.model, parent_frame: item.parent_frame, transform: { x: item.x, y: item.y, z: item.z, roll: item.roll, pitch: item.pitch, yaw: item.yaw },
      urdf_url: `/models/urdf/${item.model}.urdf`, package_root_url: "/models", joints,
      frames: { base: { type: 0, name: "base", frame_id: `${id}/base_link` }, work: { type: 1, name: work.controller_name, frame_id: work.ros_frame_id }, tool: { type: 2, name: tool.controller_name, frame_id: tool.ros_frame_id } },
      motion: settings,
    };
  }));
  const keyboardArms = Object.fromEntries(["l", "r"].map((id) => {
    const coordinate = coordinates.robots[id];
    const work = coordinate.work_frames[coordinate.default_work];
    const bindings = Object.fromEntries(Object.entries(keyboard.arms[id]).map(([axis, pair]) => [axis, { positive: pair.positive, negative: pair.negative }]));
    return [id, {
      bindings,
      linear_speed_mps: keyboard.linear_speed_fraction * motion.robots[id].max_linear_speed_mps,
      angular_speed_radps: keyboard.angular_speed_fraction * motion.robots[id].max_angular_speed_radps,
      work_reference_name: work.controller_name,
      work_frame_id: work.ros_frame_id,
    }];
  }));
  const endEffectorConfig = YAML.parse(await readFile(resolve(repositoryDirectory, "config/ros/end_effectors.yaml"), "utf8"));
  const endEffectors = Object.fromEntries(Object.entries(endEffectorConfig.mounts ?? {}).map(([id, mount]) => {
    const gripper = endEffectorConfig.grippers[mount.gripper];
    return [id, {
      gripper: mount.gripper,
      gripper_name: mount.gripper_name,
      urdf_url: `/models/urdf/${gripper.urdf}`,
      parent_link: mount.parent_link,
      xyz: mount.xyz,
      rpy: mount.rpy,
      driving_joint: gripper.driving_joint,
      closed_rad: gripper.closed_rad,
      open_rad: gripper.open_rad,
    }];
  }));
  // Same shape as model_manifest._joint_current_guard (validation and defaults live there).
  const policyTask = YAML.parse(await readFile(resolve(repositoryDirectory, "config/ros/policy_task.yaml"), "utf8"))
    .realman_bt_executor.ros__parameters.policy_task;
  const jointCurrent = { ...policyTask.current_guard, policy_arm: policyTask.arm };
  // Same shape as model_manifest quality_reasons (validation lives in quality_marks.py).
  const qualityReasons = YAML.parse(await readFile(resolve(repositoryDirectory, "config/recording/quality_reasons.yaml"), "utf8")).reasons;
  return {
    version: 1,
    root_frame: robots[0].parent_frame || layout.robots.l.parent_frame,
    default_joint_position_rad: layout.settings.default_joint_position || 0,
    robots,
    // Same shape as model_manifest._pedestal (validation lives there).
    pedestal: layout.pedestal
      ? {
          frame: layout.pedestal.frame,
          center_xy: layout.pedestal.center_xy,
          size_xy: layout.pedestal.size_xy,
          top_z: layout.pedestal.top_z,
          bottom_z: layout.pedestal.bottom_z,
          color: layout.pedestal.color,
        }
      : null,
    end_effectors: endEffectors,
    joint_current: jointCurrent,
    quality_reasons: qualityReasons,
    keyboard_control: {
      heartbeat_period_ms: keyboard.heartbeat_period_ms,
      input_timeout_ms: keyboard.input_timeout_ms,
      arms: keyboardArms,
      grippers: keyboard.grippers,
    },
  };
}

const DEV_LINKS = {
  type: "link_status",
  groups: [
    { kind: "arms", title: "机械臂", items: [
      { id: "l", short: "L", label: "左臂", tone: "ok", reason: "", badge: "", details: [["控制器", "192.0.2.123:8080"], ["驱动连接", "已连接"], ["joint_states", "30.0 Hz"], ["期望频率", "30 Hz"], ["最近一条", "12 ms 前"]] },
      { id: "m", short: "M", label: "中臂", tone: "down", reason: "驱动报告控制器未连接", badge: "", details: [["控制器", "192.0.2.125:8080"], ["驱动连接", "未连接"], ["joint_states", "—"], ["期望频率", "30 Hz"], ["最近一条", "—"]] },
      { id: "r", short: "R", label: "右臂", tone: "ok", reason: "", badge: "", details: [["控制器", "192.0.2.124:8080"], ["驱动连接", "已连接"], ["joint_states", "29.9 Hz"], ["期望频率", "30 Hz"], ["最近一条", "20 ms 前"]] },
    ] },
    { kind: "cameras", title: "相机", items: [
      { id: "camera_left", short: "L", label: "左腕相机", tone: "ok", reason: "", badge: "3.0", details: [["帧率", "30.0 / 30 fps"], ["最近一帧", "18 ms 前"], ["话题", "/camera_left/color/image_raw"], ["USB", "USB 3.0 · 5000 Mb/s"], ["USB 端口", "2-3（bus 2）"], ["控制器", "0000:00:14.0"], ["设备", "Orbbec Gemini 305"], ["USB 序列号", "CV2T66100096"]] },
      { id: "camera_right", short: "R", label: "右腕相机", tone: "warn", reason: "协商为 USB 2.0（480 Mb/s），未跑在 USB 3", badge: "2.0", details: [["帧率", "30.0 / 30 fps"], ["最近一帧", "25 ms 前"], ["话题", "/camera_right/color/image_raw"], ["USB", "USB 2.0 · 480 Mb/s"], ["USB 端口", "1-4（bus 1）"], ["控制器", "0000:00:14.0"], ["设备", "Orbbec Gemini 305"], ["USB 序列号", "CV2T66100035"]] },
      { id: "camera_global/d435", short: "G", label: "全局相机 D435", tone: "down", reason: "已 4.2 s 没有新消息", badge: "3.0", details: [["帧率", "0.0 / 30 fps"], ["最近一帧", "4200 ms 前"], ["话题", "/camera_global/d435/color/image_raw"], ["USB", "USB 3.0 · 5000 Mb/s"], ["USB 端口", "2-2（bus 2）"], ["控制器", "0000:00:14.0"], ["设备", "Intel(R) RealSense(TM) Depth Camera 435"], ["USB 序列号", "343223027232"]] },
    ] },
    { kind: "grippers", title: "夹爪", items: [
      { id: "gripper_left", short: "L", label: "左夹爪", tone: "ok", reason: "", badge: "", details: [["连接", "已连接"], ["串口", "/dev/realman/gripper_left → ttyUSB0"], ["Modbus", "从站 2 @ 115200"], ["轮询", "19.8 / 20 Hz"], ["报警", "无"], ["USB", "USB 1.1 · 12 Mb/s"], ["USB 端口", "5-1.2（bus 5）"], ["控制器", "0000:06:00.0"], ["适配器", "USB Serial 1a86:7523"]] },
      { id: "gripper_right", short: "R", label: "右夹爪", tone: "warn", reason: "报警位 32（0x20）", badge: "", details: [["连接", "已连接"], ["串口", "/dev/realman/gripper_right → ttyUSB1"], ["Modbus", "从站 3 @ 115200"], ["轮询", "20.0 / 20 Hz"], ["报警", "32"], ["USB", "USB 1.1 · 12 Mb/s"], ["USB 端口", "5-1.4（bus 5）"], ["控制器", "0000:06:00.0"], ["适配器", "USB Serial 1a86:7523"]] },
    ] },
    { kind: "pika", title: "Pika", items: [
      { id: "l", short: "L", label: "左 Pika", tone: "ok", reason: "正在遥操作：速度指令 19.8 Hz", badge: "▶", details: [["位姿", "19.6 Hz · 41 ms 前"], ["位姿话题", "/pika_web/pose_l"], ["速度指令", "19.8 Hz（遥操作中）"], ["Pika 栈", "运行中"], ["速度控制开关", "开启"], ["键盘启停", "已开始 · 30 ms 前"], ["采集", "recording · pick_and_place"]] },
      { id: "r", short: "R", label: "右 Pika", tone: "off", reason: "Pika 未启动（:8765 的 Pika 速度控制开关可启动）", badge: "", details: [["位姿", "—"], ["位姿话题", "/pika_web/pose_r"], ["速度指令", "未发送（未按 W/A/S/D 开始）"], ["Pika 栈", "未运行"], ["速度控制开关", "关闭"], ["键盘启停", "—"]] },
    ] },
  ],
};

function devApiPlugin() {
  return {
    name: "realman-web-control-dev-api",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        try {
          const url = request.url?.split("?", 1)[0] || "/";
          if (url === "/api/layout") {
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify(await devManifest()));
            return;
          }
          if (url === "/api/bt/trees") {
            // No bt_launcher locally: the start menu stays hidden in dev.
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ available: false }));
            return;
          }
          if (url === "/api/links") {
            // Sample topbar link strip (same shape as link_status.build_snapshot): one USB 2.0
            // camera, one silent camera and a gripper alarm so every tone shows in dev.
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify(DEV_LINKS));
            return;
          }
          if (url === "/api/docker/restart" && request.method === "GET") {
            // No host restart helper locally: the restart button stays hidden in dev.
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ available: false }));
            return;
          }
          if (url === "/api/calibration") {
            const calibration = YAML.parse(
              await readFile(resolve(repositoryDirectory, "config/ros/camera_calibration.yaml"), "utf8"),
            );
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify(calibration));
            return;
          }
          if (url === "/api/calibration/sessions" && request.method === "GET") {
            // Local UI development has no ROS log mount; production serves recoverable sessions.
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ sessions: [], deleted_session_ids: [] }));
            return;
          }
          if (url.startsWith("/api/calibration/sessions/") && request.method === "DELETE") {
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ deleted_session_id: decodeURIComponent(url.split("/").at(-1) || "") }));
            return;
          }
          if (url.startsWith("/models/")) {
            const relative = url.slice("/models/".length);
            const candidate = resolve(descriptionDirectory, relative);
            if (candidate.startsWith(`${descriptionDirectory}/`) && await stat(candidate).then(() => true, () => false)) {
              const contents = await readFile(candidate);
              response.end(contents);
              return;
            }
          }
        } catch {
          // Vite's regular 404 handler provides the browser-facing response.
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [devApiPlugin()],
  root: webDirectory,
  cacheDir: resolve(websiteDirectory, "node_modules/.vite-realman-web-control"),
  base: "/",
  resolve: {
    alias: {
      three: resolve(websiteDirectory, "node_modules/three"),
      "urdf-loader": resolve(websiteDirectory, "node_modules/urdf-loader"),
    },
  },
  build: {
    outDir: staticDirectory,
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      // Keep motion control and calibration as separate operator pages while
      // sharing the same authenticated WebSocket/ROS bridge.
      input: {
        control: resolve(webDirectory, "index.html"),
        calibration: resolve(webDirectory, "calibration.html"),
        params: resolve(webDirectory, "params.html"),
      },
    },
  },
  server: {
    host: "127.0.0.1",
    port: 4174,
    strictPort: true,
  },
});
