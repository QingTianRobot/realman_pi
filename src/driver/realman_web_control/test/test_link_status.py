"""Topbar link strip: USB scan, camera matching, rates and the ok/warn/down tones."""

from pathlib import Path

from realman_web_control.link_status import (
    ArmSpec,
    LinkSettings,
    LinkState,
    RateTracker,
    arm_specs,
    build_snapshot,
    camera_specs,
    match_camera_usb,
    pika_specs,
    scan_usb,
    usb_speed_label,
    usb_speed_short,
)


def _usb(root: Path, name: str, **files: str) -> None:
    entry = root / name
    entry.mkdir(parents=True)
    for key, value in files.items():
        (entry / key).write_text(value + "\n", encoding="utf-8")


def _fake_sysfs(root: Path) -> Path:
    _usb(root, "usb1", busnum="1", serial="0000:00:14.0", idVendor="1d6b", idProduct="0002", speed="480")
    _usb(root, "usb2", busnum="2", serial="0000:00:14.0", idVendor="1d6b", idProduct="0003", speed="20000")
    _usb(root, "1-4", busnum="1", idVendor="2bc5", idProduct="0840", speed="480", serial="CV2T66100035", product="Orbbec Gemini 305")
    _usb(root, "2-3", busnum="2", idVendor="2bc5", idProduct="0840", speed="5000", serial="CV2T66100096", product="Orbbec Gemini 305")
    _usb(root, "2-2", busnum="2", idVendor="8086", idProduct="0b07", speed="5000", serial="343223027232", product="RealSense 435")
    _usb(root, "1-4:1.0", idVendor="ignored")  # interface dirs are skipped
    return root


CAMERAS_YAML = """
wrist_cameras:
  streams: {color: {fps: 30}}
  devices:
    left: {serial: CV2T66100096}
    middle: {serial: CV2L360000HS, enabled: false}
    right: {serial: CV2T66100035, streams: {color: {fps: 15}}}
global_camera:
  enabled: true
  device_type: d435
  serial_no: "262322074840"
  namespace: camera_global
  camera_name: d435
  color: {fps: 30}
"""


class FakeClock:
    def __init__(self) -> None:
        self.now = 100.0

    def __call__(self) -> float:
        return self.now


def test_usb_speed_labels():
    assert usb_speed_label(480) == "USB 2.0"
    assert usb_speed_label(5000) == "USB 3.0"
    assert usb_speed_label(10000) == "USB 3.1 Gen2"
    assert usb_speed_label(12) == "USB 1.1"
    assert usb_speed_label(None) == ""
    assert usb_speed_short(5000) == "3.0"
    assert usb_speed_short(480) == "2.0"


def test_scan_usb_skips_root_hubs_and_interfaces(tmp_path):
    devices = {d["usb_path"]: d for d in scan_usb(_fake_sysfs(tmp_path))}
    assert set(devices) == {"1-4", "2-3", "2-2"}
    assert devices["2-3"]["speed_mbps"] == 5000
    assert devices["1-4"]["controller"] == "0000:00:14.0"


def test_camera_specs_follow_cameras_ros2_and_local_override(tmp_path):
    base = tmp_path / "cameras_ros2.yaml"
    base.write_text(CAMERAS_YAML, encoding="utf-8")
    (tmp_path / "cameras_ros2.local.yaml").write_text("wrist_cameras:\n  devices:\n    left: {serial: LOCAL1}\n", encoding="utf-8")
    specs = {spec.camera_id: spec for spec in camera_specs(base)}
    assert set(specs) == {"camera_left", "camera_right", "camera_global/d435"}
    assert specs["camera_left"].serial == "LOCAL1"
    assert specs["camera_right"].expected_fps == 15
    assert specs["camera_global/d435"].info_topic == "/camera_global/d435/color/camera_info"
    assert specs["camera_global/d435"].product_id == "0b07"


def test_realsense_matched_by_model_when_usb_serial_differs(tmp_path):
    base = tmp_path / "cameras_ros2.yaml"
    base.write_text(CAMERAS_YAML, encoding="utf-8")
    devices = scan_usb(_fake_sysfs(tmp_path / "sys"))
    specs = {spec.camera_id: spec for spec in camera_specs(base)}
    assert match_camera_usb(specs["camera_global/d435"], devices)["usb_path"] == "2-2"
    assert match_camera_usb(specs["camera_left"], devices)["usb_path"] == "2-3"


def test_rate_tracker_rate_and_age():
    clock = FakeClock()
    rates = RateTracker(window_sec=2.0, clock=clock)
    assert rates.read("x") == (None, None)
    for _ in range(60):
        rates.record("x")
        clock.now += 1 / 30
    rate, age = rates.read("x")
    assert 29 <= rate <= 31 and age < 0.05
    clock.now += 5
    rate, age = rates.read("x")
    assert rate == 0 and age > 4.9


def test_snapshot_tones(tmp_path):
    base = tmp_path / "cameras_ros2.yaml"
    base.write_text(CAMERAS_YAML, encoding="utf-8")
    devices = scan_usb(_fake_sysfs(tmp_path / "sys"))
    clock = FakeClock()
    state = LinkState(rates=RateTracker(2.0, clock=clock))
    for _ in range(60):
        state.rates.record("camera/camera_left")
        state.rates.record("camera/camera_right")
        state.rates.record("joint_states/l")
        clock.now += 1 / 30
    state.set_arm_connected("l", True)
    state.set_arm_connected("r", False)
    state.gripper_states = {
        "gripper_left": {"connected": True, "alarm": 0},
        "gripper_right": {"connected": True, "alarm": 32},
    }
    state.set_gripper_link("gripper_left", {
        "connected": True, "port": "/dev/realman/gripper_left", "tty": "ttyUSB0", "baudrate": 115200,
        "poll_hz": 19.8, "configured_poll_hz": 20.0,
        "usb": {"usb_path": "5-1.2", "busnum": 5, "speed_mbps": 12.0, "vendor_id": "1a86", "product_id": "7523", "product": "USB Serial", "controller": "0000:06:00.0"},
    }, now=clock.now)
    snapshot = build_snapshot(
        state=state,
        settings=LinkSettings(),
        arms=[ArmSpec("l", "左臂", "10.0.0.1", 8080, 30.0), ArmSpec("r", "右臂", "10.0.0.2", 8080, 30.0)],
        cameras=camera_specs(base),
        grippers={"gripper_left": {"slave_id": 2}, "gripper_right": {"slave_id": 3}},
        gripper_bus={"gripper_left": {"port": "/dev/realman/gripper_left", "baudrate": 115200},
                     "gripper_right": {"port": "/dev/realman/gripper_right", "baudrate": 115200}},
        usb_devices=devices,
        now=clock.now,
    )
    groups = {group["kind"]: {item["id"]: item for item in group["items"]} for group in snapshot["groups"]}
    assert groups["arms"]["l"]["tone"] == "ok"
    assert groups["arms"]["r"]["tone"] == "down"
    cams = groups["cameras"]
    assert cams["camera_left"]["tone"] == "ok" and cams["camera_left"]["badge"] == "3.0"
    # Right camera: fps fine (30 >= 15) but only USB 2.0 -> amber.
    assert cams["camera_right"]["tone"] == "warn" and cams["camera_right"]["badge"] == "2.0"
    assert cams["camera_global/d435"]["tone"] == "down"  # no camera_info yet
    grips = groups["grippers"]
    assert grips["gripper_left"]["tone"] == "ok"
    assert ["USB 端口", "5-1.2（bus 5）"] in grips["gripper_left"]["details"]
    assert ["串口", "/dev/realman/gripper_left → ttyUSB0"] in grips["gripper_left"]["details"]
    assert grips["gripper_right"]["tone"] == "warn"  # alarm bit, and no /link from an old manager


def test_arm_specs_read_driver_yaml(tmp_path):
    path = tmp_path / "realman_driver.yaml"
    path.write_text("/l/realman_driver:\n  ros__parameters: {robot_ip: 10.0.0.1, robot_port: 8080, state_publish_rate: 30.0}\n", encoding="utf-8")
    [left, middle] = arm_specs(path, ["l", "m"])
    assert (left.ip, left.port, left.expected_hz) == ("10.0.0.1", 8080, 30.0)
    assert middle.ip == ""


RECORDING_YAML = """
/recording_recorder:
  ros__parameters: {}
/recording_web_bridge:
  ros__parameters:
    pika_sides: [l, r]
    pika_pose_topics: [/pika_web/pose_l, /pika_web/pose_r]
    pika_command_velocity_topics: [/pika/l/cartesian_velocity, /pika/r/cartesian_velocity]
"""


def _pika_snapshot(state, pikas, switch, now):
    return {
        item["id"]: item
        for group in build_snapshot(
            state=state, settings=LinkSettings(), arms=[], cameras=[], grippers={}, gripper_bus={},
            usb_devices=[], now=now, pikas=pikas, pika_switch=switch,
        )["groups"] if group["kind"] == "pika"
        for item in group["items"]
    }



def test_pika_specs_follow_recording_web_bridge(tmp_path):
    path = tmp_path / "recording.yaml"
    path.write_text(RECORDING_YAML, encoding="utf-8")
    [left, right] = pika_specs(path)
    assert (left.side, left.pose_topic) == ("l", "/pika_web/pose_l")
    assert right.velocity_topic == "/pika/r/cartesian_velocity"


def test_pika_tones_off_down_ok_and_teleop_badge(tmp_path):
    path = tmp_path / "recording.yaml"
    path.write_text(RECORDING_YAML, encoding="utf-8")
    pikas = pika_specs(path)
    clock = FakeClock()
    state = LinkState(rates=RateTracker(2.0, clock=clock))
    # Stack stopped and no poses: grey "off", not red.
    items = _pika_snapshot(state, pikas, {"phase": "off", "stack_running": False, "helper_reachable": True}, clock.now)
    assert items["l"]["tone"] == "off" and items["r"]["tone"] == "off"
    # Stack running, left streams poses + velocity at 20 Hz, right silent.
    for _ in range(40):
        state.rates.record("pika_pose/l")
        state.rates.record("pika_velocity/l")
        clock.now += 0.05
    state.set_value("pika/keyboard_enabled", True, now=clock.now)
    items = _pika_snapshot(state, pikas, {"phase": "on", "stack_running": True, "helper_reachable": True}, clock.now)
    assert items["l"]["tone"] == "ok" and items["l"]["badge"] == "▶"
    assert items["r"]["tone"] == "down"
    assert ["速度控制开关", "开启"] in items["l"]["details"]


def test_ages_never_negative_when_a_value_lands_after_now(tmp_path):
    path = tmp_path / "recording.yaml"
    path.write_text(RECORDING_YAML, encoding="utf-8")
    clock = FakeClock()
    state = LinkState(rates=RateTracker(2.0, clock=clock))
    state.set_value("pika/keyboard_enabled", False, now=clock.now + 0.004)
    items = _pika_snapshot(state, pika_specs(path), {"phase": "on", "stack_running": True}, clock.now)
    assert ["键盘启停", "未开始 · 0 ms 前"] in items["l"]["details"]
    rates = RateTracker(2.0, clock=clock)
    clock.now += 0.004
    rates.record("x")
    clock.now -= 0.004
    assert rates.read("x")[1] == 0.0
