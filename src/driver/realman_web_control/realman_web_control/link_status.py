"""Connection view of every arm, camera and gripper for the :8765 topbar (``GET /api/links``).

ROS-neutral: the node feeds message receipt times into :class:`RateTracker` and the latest
``/<arm>/connected`` and ``/<gripper>/link`` payloads; this module reads sysfs for the
cameras' USB link and turns it all into one JSON snapshot with an ok / warn / down tone per
device. Camera identities come from ``config/ros/cameras_ros2.yaml`` (plus the optional,
gitignored ``cameras_ros2.local.yaml``), arm addresses from ``config/ros/realman_driver.yaml``.
"""

from __future__ import annotations

import collections
import threading
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Iterable

import yaml

# RealSense USB product ids by cameras_ros2 ``device_type``. The D435's USB serial string is
# not the librealsense serial in cameras_ros2.yaml, so the global camera is matched by model.
REALSENSE_PRODUCT_IDS = {"d435": "0b07", "d435i": "0b3a", "d405": "0b5b", "d415": "0ad3", "d455": "0b5c"}
ORBBEC_VENDOR_ID = "2bc5"
REALSENSE_VENDOR_ID = "8086"
WRIST_LABELS = {"left": "左腕相机", "middle": "中腕相机", "right": "右腕相机"}
ARM_LABELS = {"l": "左臂", "m": "中臂", "r": "右臂"}
GRIPPER_LABELS = {"gripper_left": "左夹爪", "gripper_mid": "中夹爪", "gripper_right": "右夹爪"}


def usb_speed_label(speed_mbps: float | None) -> str:
    """Short generation label of a negotiated USB link speed (sysfs ``speed``, Mb/s)."""
    if speed_mbps is None:
        return ""
    if speed_mbps >= 20000:
        return "USB 3.2 Gen2x2"
    if speed_mbps >= 10000:
        return "USB 3.1 Gen2"
    if speed_mbps >= 5000:
        return "USB 3.0"
    if speed_mbps >= 480:
        return "USB 2.0"
    if speed_mbps >= 12:
        return "USB 1.1"
    return "USB 1.0"


def usb_speed_short(speed_mbps: float | None) -> str:
    """The topbar badge: ``3.0`` / ``2.0`` / ``1.1`` …"""
    label = usb_speed_label(speed_mbps)
    return label.split(" ", 2)[1] if label else ""


def _read(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="replace").strip()
    except OSError:
        return ""


def scan_usb(devices_root: str | Path = "/sys/bus/usb/devices") -> list[dict[str, Any]]:
    """Every USB device (not interface, not root hub) under ``/sys/bus/usb/devices``."""
    root = Path(devices_root)
    try:
        entries = sorted(root.iterdir())
    except OSError:
        return []
    controllers = {entry.name[3:]: _read(entry / "serial") for entry in entries if entry.name.startswith("usb")}
    devices = []
    for entry in entries:
        if entry.name.startswith("usb") or ":" in entry.name or not (entry / "idVendor").is_file():
            continue
        busnum = _read(entry / "busnum")
        try:
            speed = float(_read(entry / "speed"))
        except ValueError:
            speed = None
        devices.append({
            "usb_path": entry.name,
            "busnum": int(busnum) if busnum.isdigit() else None,
            "speed_mbps": speed,
            "usb_version": _read(entry / "version"),
            "vendor_id": _read(entry / "idVendor").lower(),
            "product_id": _read(entry / "idProduct").lower(),
            "product": _read(entry / "product"),
            "manufacturer": _read(entry / "manufacturer"),
            "serial": _read(entry / "serial"),
            "controller": controllers.get(busnum, ""),
        })
    return devices


def _deep_merge(base: Any, override: Any) -> Any:
    if isinstance(base, dict) and isinstance(override, dict):
        merged = dict(base)
        for key, value in override.items():
            merged[key] = _deep_merge(base.get(key), value) if key in base else value
        return merged
    return override


def load_yaml(path: str | Path) -> dict[str, Any]:
    try:
        return yaml.safe_load(Path(path).read_text(encoding="utf-8")) or {}
    except (OSError, yaml.YAMLError):
        return {}


@dataclass(frozen=True)
class CameraSpec:
    camera_id: str
    label: str
    image_topic: str
    info_topic: str
    expected_fps: float
    serial: str
    vendor_id: str
    product_id: str = ""


def camera_specs(cameras_config_file: str | Path) -> list[CameraSpec]:
    """Enabled wrist Orbbecs and the global RealSense, as launched by cameras_ros2.launch.py."""
    base_path = Path(cameras_config_file)
    config = load_yaml(base_path)
    local = base_path.parent / "cameras_ros2.local.yaml"
    if local.is_file():
        config = _deep_merge(config, load_yaml(local))
    specs: list[CameraSpec] = []
    wrist = config.get("wrist_cameras") or {}
    default_fps = float(((wrist.get("streams") or {}).get("color") or {}).get("fps", 30) or 30)
    for side, device in (wrist.get("devices") or {}).items():
        device = device or {}
        if device.get("enabled", True) is False:
            continue
        fps = float((((device.get("streams") or {}).get("color") or {}).get("fps", default_fps)) or default_fps)
        namespace = f"camera_{side}"
        specs.append(CameraSpec(
            camera_id=namespace,
            label=WRIST_LABELS.get(str(side), f"{side} 相机"),
            image_topic=f"/{namespace}/color/image_raw",
            info_topic=f"/{namespace}/color/camera_info",
            expected_fps=fps,
            serial=str(device.get("serial", "")),
            vendor_id=ORBBEC_VENDOR_ID,
        ))
    global_camera = config.get("global_camera") or {}
    if global_camera and global_camera.get("enabled", True) is not False:
        namespace = str(global_camera.get("namespace", "camera_global"))
        name = str(global_camera.get("camera_name", "d435"))
        device_type = str(global_camera.get("device_type", "d435")).lower()
        specs.append(CameraSpec(
            camera_id=f"{namespace}/{name}",
            label=f"全局相机 {device_type.upper()}",
            image_topic=f"/{namespace}/{name}/color/image_raw",
            info_topic=f"/{namespace}/{name}/color/camera_info",
            expected_fps=float((global_camera.get("color") or {}).get("fps", 30) or 30),
            serial=str(global_camera.get("serial_no", "")),
            vendor_id=REALSENSE_VENDOR_ID,
            product_id=REALSENSE_PRODUCT_IDS.get(device_type, ""),
        ))
    return specs


def match_camera_usb(spec: CameraSpec, devices: Iterable[dict[str, Any]]) -> dict[str, Any] | None:
    """The USB device of one camera: serial first, then a unique vendor:product model match."""
    vendor = [device for device in devices if device["vendor_id"] == spec.vendor_id]
    if spec.serial:
        for device in vendor:
            if device["serial"] == spec.serial:
                return device
    if spec.product_id:
        models = [device for device in vendor if device["product_id"] == spec.product_id]
        if len(models) == 1:
            return models[0]
    return None


@dataclass(frozen=True)
class PikaSpec:
    side: str
    label: str
    pose_topic: str
    velocity_topic: str


PIKA_LABELS = {"l": "左 Pika", "r": "右 Pika"}


def pika_specs(recording_config_file: str | Path) -> list[PikaSpec]:
    """Pika sides and topics as the recorder uses them (``/recording_web_bridge`` in recording.yaml).

    On a host where Pika runs over Wi-Fi the pose topics are the throttled ``/pika_web/pose_*``
    copies; reading the same list keeps :8765 from pulling the raw 125/250 Hz poses across the link.
    """
    params = (load_yaml(recording_config_file).get("/recording_web_bridge") or {}).get("ros__parameters") or {}
    sides = [str(side) for side in params.get("pika_sides") or []]
    poses = [str(topic) for topic in params.get("pika_pose_topics") or []]
    velocities = [str(topic) for topic in params.get("pika_command_velocity_topics") or []]
    return [
        PikaSpec(
            side=side,
            label=PIKA_LABELS.get(side, f"{side} Pika"),
            pose_topic=poses[index] if index < len(poses) else "",
            velocity_topic=velocities[index] if index < len(velocities) else f"/pika/{side}/cartesian_velocity",
        )
        for index, side in enumerate(sides)
    ]


@dataclass(frozen=True)
class ArmSpec:
    arm: str
    label: str
    ip: str
    port: int
    expected_hz: float


def arm_specs(driver_config_file: str | Path, arms: Iterable[str]) -> list[ArmSpec]:
    config = load_yaml(driver_config_file)
    specs = []
    for arm in arms:
        params = (config.get(f"/{arm}/realman_driver") or {}).get("ros__parameters") or {}
        specs.append(ArmSpec(
            arm=arm,
            label=ARM_LABELS.get(arm, arm),
            ip=str(params.get("robot_ip", "")),
            port=int(params.get("robot_port", 0) or 0),
            expected_hz=float(params.get("state_publish_rate", 0) or 0),
        ))
    return specs


class RateTracker:
    """Thread-safe receipt times per key; rate over a sliding window and age of the newest."""

    def __init__(self, window_sec: float = 2.0, clock=time.monotonic) -> None:
        self.window_sec = float(window_sec)
        self._clock = clock
        self._lock = threading.Lock()
        self._stamps: dict[str, collections.deque[float]] = {}
        self._first: dict[str, float] = {}
        self._last: dict[str, float] = {}

    def record(self, key: str) -> None:
        now = self._clock()
        with self._lock:
            stamps = self._stamps.setdefault(key, collections.deque())
            self._first.setdefault(key, now)
            self._last[key] = now
            stamps.append(now)
            while stamps and stamps[0] < now - self.window_sec:
                stamps.popleft()

    def read(self, key: str) -> tuple[float | None, float | None]:
        """``(rate_hz, age_sec)``; both ``None`` before the first message."""
        now = self._clock()
        with self._lock:
            stamps = self._stamps.get(key)
            if key not in self._last:
                return None, None
            while stamps and stamps[0] < now - self.window_sec:
                stamps.popleft()
            # Count only what fits the window; a stream that started less than a window ago is
            # divided by its own lifetime so the first seconds do not read low.
            span = min(self.window_sec, max(now - self._first[key], 1e-3))
            return len(stamps) / span, now - self._last[key]


@dataclass
class LinkSettings:
    rate_window_sec: float = 2.0
    stale_after_sec: float = 1.0
    low_rate_ratio: float = 0.7
    prefer_usb3: bool = True
    arms: tuple[str, ...] = ("l", "m", "r")
    usb_devices_root: str = "/sys/bus/usb/devices"
    gripper_link_stale_sec: float = 5.0
    pika_expected_pose_hz: float = 20.0
    pika_active_within_sec: float = 0.5

    @classmethod
    def from_dict(cls, raw: dict[str, Any] | None) -> "LinkSettings":
        raw = raw or {}
        return cls(
            rate_window_sec=float(raw.get("rate_window_sec", 2.0)),
            stale_after_sec=float(raw.get("stale_after_sec", 1.0)),
            low_rate_ratio=float(raw.get("low_rate_ratio", 0.7)),
            prefer_usb3=bool(raw.get("prefer_usb3", True)),
            arms=tuple(str(arm) for arm in raw.get("arms", ("l", "m", "r"))),
            usb_devices_root=str(raw.get("usb_devices_root", "/sys/bus/usb/devices")),
            gripper_link_stale_sec=float(raw.get("gripper_link_stale_sec", 5.0)),
            pika_expected_pose_hz=float(raw.get("pika_expected_pose_hz", 20.0)),
            pika_active_within_sec=float(raw.get("pika_active_within_sec", 0.5)),
        )


def _round(value: float | None, digits: int = 1) -> float | None:
    return None if value is None else round(value, digits)


def _rate_tone(rate: float | None, age: float | None, expected: float, settings: LinkSettings) -> tuple[str, str]:
    if rate is None:
        return "down", "没有收到消息"
    if age is not None and age > settings.stale_after_sec:
        return "down", f"已 {age:.1f} s 没有新消息"
    if expected > 0 and rate < expected * settings.low_rate_ratio:
        return "warn", f"频率 {rate:.1f} Hz，低于期望 {expected:g} Hz 的 {settings.low_rate_ratio:.0%}"
    return "ok", ""


@dataclass
class LinkState:
    """Everything the node learns from ROS; :func:`build_snapshot` reads it."""

    rates: RateTracker
    arm_connected: dict[str, bool] = field(default_factory=dict)
    gripper_links: dict[str, tuple[float, dict[str, Any]]] = field(default_factory=dict)
    gripper_states: dict[str, dict[str, Any]] = field(default_factory=dict)
    # Latest small status values (Pika keyboard start/stop, Pika episode state): key -> (monotonic, value).
    values: dict[str, tuple[float, Any]] = field(default_factory=dict)
    lock: threading.Lock = field(default_factory=threading.Lock)

    def set_value(self, key: str, value: Any, now: float | None = None) -> None:
        with self.lock:
            self.values[key] = (time.monotonic() if now is None else now, value)

    def set_arm_connected(self, arm: str, connected: bool) -> None:
        with self.lock:
            self.arm_connected[arm] = bool(connected)

    def set_gripper_link(self, name: str, payload: dict[str, Any], now: float | None = None) -> None:
        with self.lock:
            self.gripper_links[name] = (time.monotonic() if now is None else now, dict(payload))


def build_snapshot(
    *,
    state: LinkState,
    settings: LinkSettings,
    arms: list[ArmSpec],
    cameras: list[CameraSpec],
    grippers: dict[str, dict[str, Any]],
    gripper_bus: dict[str, dict[str, Any]],
    usb_devices: list[dict[str, Any]] | None = None,
    now: float | None = None,
    pikas: list[PikaSpec] | None = None,
    pika_switch: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """``{"groups": [{"kind", "title", "items": [...]}, ...]}``; every item has id/label/tone/summary/details."""
    now = time.monotonic() if now is None else now
    devices = scan_usb(settings.usb_devices_root) if usb_devices is None else usb_devices
    with state.lock:
        arm_connected = dict(state.arm_connected)
        gripper_links = dict(state.gripper_links)
        gripper_states = {name: dict(value) for name, value in state.gripper_states.items()}
        values = dict(state.values)

    arm_items = []
    for arm in arms:
        rate, age = state.rates.read(f"joint_states/{arm.arm}")
        tone, reason = _rate_tone(rate, age, arm.expected_hz, settings)
        connected = arm_connected.get(arm.arm)
        if connected is False:
            tone, reason = "down", "驱动报告控制器未连接"
        arm_items.append({
            "id": arm.arm,
            "short": arm.arm.upper(),
            "label": arm.label,
            "tone": tone,
            "reason": reason,
            "badge": "",
            "details": [
                ["控制器", f"{arm.ip}:{arm.port}" if arm.ip else "未配置"],
                ["驱动连接", {True: "已连接", False: "未连接", None: "未收到 /connected"}[connected]],
                ["joint_states", f"{rate:.1f} Hz" if rate is not None else "—"],
                ["期望频率", f"{arm.expected_hz:g} Hz" if arm.expected_hz else "—"],
                ["最近一条", f"{age * 1000:.0f} ms 前" if age is not None else "—"],
            ],
        })

    camera_items = []
    for camera in cameras:
        rate, age = state.rates.read(f"camera/{camera.camera_id}")
        tone, reason = _rate_tone(rate, age, camera.expected_fps, settings)
        usb = match_camera_usb(camera, devices)
        speed = usb["speed_mbps"] if usb else None
        if usb is None:
            usb_reason = "USB 上找不到这台相机"
            tone = "down" if tone == "down" else "warn"
            reason = reason or usb_reason
        elif settings.prefer_usb3 and speed is not None and speed < 5000 and tone == "ok":
            tone, reason = "warn", f"协商为 {usb_speed_label(speed)}（{speed:g} Mb/s），未跑在 USB 3"
        details = [
            ["帧率", f"{rate:.1f} / {camera.expected_fps:g} fps" if rate is not None else f"— / {camera.expected_fps:g} fps"],
            ["最近一帧", f"{age * 1000:.0f} ms 前" if age is not None else "—"],
            ["话题", camera.image_topic],
        ]
        if usb:
            details += [
                ["USB", f"{usb_speed_label(speed)} · {speed:g} Mb/s" if speed is not None else "未知"],
                ["USB 端口", f"{usb['usb_path']}（bus {usb['busnum']}）"],
                ["控制器", usb["controller"] or "—"],
                ["设备", usb["product"] or f"{usb['vendor_id']}:{usb['product_id']}"],
                ["USB 序列号", usb["serial"] or "—"],
            ]
        else:
            details.append(["USB", f"未找到（配置序列号 {camera.serial or '—'}）"])
        camera_items.append({
            "id": camera.camera_id,
            "short": {"camera_left": "L", "camera_middle": "M", "camera_right": "R"}.get(camera.camera_id, "G"),
            "label": camera.label,
            "tone": tone,
            "reason": reason,
            "badge": usb_speed_short(speed),
            "details": details,
        })

    gripper_items = []
    for name, config in grippers.items():
        received = gripper_links.get(name)
        link = received[1] if received and now - received[0] <= settings.gripper_link_stale_sec else None
        feedback = gripper_states.get(name, {})
        bus = gripper_bus.get(name, {})
        connected = link.get("connected") if link else feedback.get("connected")
        alarm = int(feedback.get("alarm", 0) or 0)
        usb = (link or {}).get("usb")
        speed = usb.get("speed_mbps") if usb else None
        if not connected:
            tone, reason = "down", (link or {}).get("bus_error") or "Modbus 无应答（未连接）"
        elif alarm:
            tone, reason = "warn", f"报警位 {alarm}（0x{alarm:02X}）"
        else:
            tone, reason = "ok", ""
        if link is None:
            reason = reason or "gripper_manager 没有发布 /link（旧版本或未运行）"
        port = (link or {}).get("port") or bus.get("port", "")
        tty = (link or {}).get("tty", "")
        details = [
            ["连接", "已连接" if connected else "未连接"],
            ["串口", f"{port} → {tty}" if tty and not port.endswith(tty) else (port or "—")],
            ["Modbus", f"从站 {config.get('slave_id', '—')} @ {(link or {}).get('baudrate') or bus.get('baudrate', '—')}"],
            ["轮询", f"{link['poll_hz']:g} / {link['configured_poll_hz']:g} Hz" if link and link.get("poll_hz") is not None else "—"],
            ["报警", str(alarm) if alarm else "无"],
        ]
        if usb:
            details += [
                ["USB", f"{usb_speed_label(speed)} · {speed:g} Mb/s" if speed is not None else "未知"],
                ["USB 端口", f"{usb.get('usb_path')}（bus {usb.get('busnum')}）"],
                ["控制器", usb.get("controller") or "—"],
                ["适配器", f"{usb.get('product') or 'USB'} {usb.get('vendor_id')}:{usb.get('product_id')}"],
            ]
        elif link and link.get("usb_error"):
            details.append(["USB", link["usb_error"]])
        gripper_items.append({
            "id": name,
            "short": {"gripper_left": "L", "gripper_mid": "M", "gripper_right": "R"}.get(name, name[:1].upper()),
            "label": GRIPPER_LABELS.get(name, name),
            "tone": tone,
            "reason": reason,
            "badge": "",
            "details": details,
        })

    pika_items = _pika_items(pikas or [], pika_switch, values, state.rates, settings, now)
    return {
        "type": "link_status",
        "groups": [
            {"kind": "arms", "title": "机械臂", "items": arm_items},
            {"kind": "cameras", "title": "相机", "items": camera_items},
            {"kind": "grippers", "title": "夹爪", "items": gripper_items},
            {"kind": "pika", "title": "Pika", "items": pika_items},
        ],
    }


PIKA_PHASE_TEXT = {
    "off": "关闭", "starting": "启动中", "waiting_input": "等待 Pika 指令", "selecting": "切换模式中",
    "on": "开启", "stopping": "关闭中", "failed": "失败",
}


def _pika_items(
    pikas: list[PikaSpec],
    switch: dict[str, Any] | None,
    values: dict[str, tuple[float, Any]],
    rates: RateTracker,
    settings: LinkSettings,
    now: float,
) -> list[dict[str, Any]]:
    """One item per Pika side: pose stream, teleop activity, stack and keyboard state.

    ``off`` (grey) = the stack is not running and no pose arrives, which is the normal idle state;
    ``down`` = the stack runs (or the switch is on) but this side sends no pose.
    """
    switch = switch or {}
    stack_running = bool(switch.get("stack_running"))
    phase = str(switch.get("phase", "off"))
    expected_on = stack_running or phase not in ("off", "")
    pedal = values.get("pika/keyboard_enabled")
    episode = values.get("pika/episode")
    episode_state = episode[1] if episode else {}
    items = []
    for pika in pikas:
        rate, age = rates.read(f"pika_pose/{pika.side}")
        cmd_rate, cmd_age = rates.read(f"pika_velocity/{pika.side}")
        active = cmd_age is not None and cmd_age <= settings.pika_active_within_sec
        pose_fresh = age is not None and age <= settings.stale_after_sec
        if not pose_fresh:
            if expected_on:
                tone, reason = "down", "Pika 栈在运行，但这一侧没有位姿（追踪器未定位，或 Wi-Fi 链路断开）"
            else:
                tone, reason = "off", "Pika 未启动（:8765 的 Pika 速度控制开关可启动）"
        elif settings.pika_expected_pose_hz > 0 and rate < settings.pika_expected_pose_hz * settings.low_rate_ratio:
            tone, reason = "warn", f"位姿 {rate:.1f} Hz，低于期望 {settings.pika_expected_pose_hz:g} Hz 的 {settings.low_rate_ratio:.0%}（Wi-Fi 丢包？）"
        else:
            tone, reason = "ok", ""
        if active and tone != "down":
            reason = reason or f"正在遥操作：速度指令 {cmd_rate:.1f} Hz"
        details = [
            ["位姿", f"{rate:.1f} Hz · {age * 1000:.0f} ms 前" if pose_fresh else ("—" if age is None else f"已 {age:.1f} s 没有新位姿")],
            ["位姿话题", pika.pose_topic or "未配置"],
            ["速度指令", f"{cmd_rate:.1f} Hz（遥操作中）" if active else ("未发送（未按 W/A/S/D 开始）" if cmd_age is None else f"已停 {cmd_age:.1f} s")],
            ["Pika 栈", ("运行中" if stack_running else "未运行") + ("" if switch.get("helper_reachable", False) else " · helper 不可达")],
            ["速度控制开关", PIKA_PHASE_TEXT.get(phase, phase) + (f"（{switch['detail']}）" if switch.get("detail") else "")],
            ["键盘启停", "—" if pedal is None else ("已开始" if pedal[1] else "未开始") + f" · {(now - pedal[0]) * 1000:.0f} ms 前"],
        ]
        if isinstance(episode_state, dict) and episode_state.get("state"):
            details.append(["采集", f"{episode_state['state']}" + (f" · {episode_state.get('task')}" if episode_state.get("task") else "")])
        items.append({
            "id": pika.side,
            "short": pika.side.upper(),
            "label": pika.label,
            "tone": tone,
            "reason": reason,
            "badge": "▶" if active else "",
            "details": details,
        })
    return items
