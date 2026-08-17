from __future__ import annotations

from pathlib import Path

import pytest
import yaml

from realman_robot_driver.coordinate_manager import CoordinateManager


def profile_data() -> dict:
    return {
        "version": 1,
        "policy": {"on_start": "verify", "on_mismatch": "block_motion"},
        "robots": {
            arm: {
                "default_tool": "tcpgrip",
                "default_work": "cell",
                "tools": {
                    "tcpgrip": {
                        "controller_name": "tcpgrip",
                        "ros_frame_id": f"{arm}/tool/tcpgrip",
                        "pose": {
                            "xyz_m": [0.0, 0.0, 0.1],
                            "quaternion_wxyz": [2.0, 0.0, 0.0, 0.0],
                        },
                        "payload_kg": 0.5,
                        "center_of_mass_m": [0.0, 0.0, 0.02],
                    },
                    "camera": {
                        "controller_name": "camera",
                        "ros_frame_id": f"{arm}/tool/camera",
                        "pose": {
                            "xyz_m": [0.0, 0.0, 0.2],
                            "quaternion_wxyz": [1.0, 0.0, 0.0, 0.0],
                        },
                        "payload_kg": 0.2,
                        "center_of_mass_m": [0.0, 0.0, 0.01],
                    },
                },
                "work_frames": {
                    "cell": {
                        "controller_name": "cell",
                        "ros_frame_id": f"{arm}/work/cell",
                        "pose": {
                            "xyz_m": [0.4, 0.0, 0.0],
                            "quaternion_wxyz": [1.0, 0.0, 0.0, 0.0],
                        },
                    },
                    "fixture": {
                        "controller_name": "fixture",
                        "ros_frame_id": f"{arm}/work/fixture",
                        "pose": {
                            "xyz_m": [0.5, 0.0, 0.0],
                            "quaternion_wxyz": [1.0, 0.0, 0.0, 0.0],
                        },
                    },
                },
            }
            for arm in ("l", "m", "r")
        },
    }


def write_profile(tmp_path: Path, **tool_overrides: object) -> Path:
    data = profile_data()
    tool = data["robots"]["l"]["tools"]["tcpgrip"]
    for key, value in tool_overrides.items():
        if key in {"xyz_m", "quaternion_wxyz"}:
            tool["pose"][key] = value
        else:
            tool[key] = value
    path = tmp_path / "coordinates.yaml"
    path.write_text(yaml.safe_dump(data), encoding="ascii")
    return path


class FakeAdapter:
    def __init__(self) -> None:
        self.tool = (0, "other_tool")
        self.work = (0, "other_work")
        self.calls: list[tuple[object, ...]] = []

    def current_tool_frame(self, arm: str):
        self.calls.append(("current_tool_frame", arm))
        return self.tool

    def current_work_frame(self, arm: str):
        self.calls.append(("current_work_frame", arm))
        return self.work

    def set_tool_frame(self, arm: str, frame: object) -> int:
        self.calls.append(("set_tool_frame", arm, frame))
        return 0

    def set_work_frame(self, arm: str, frame: object) -> int:
        self.calls.append(("set_work_frame", arm, frame))
        return 0

    def change_tool_frame(self, arm: str, name: str) -> int:
        self.calls.append(("change_tool_frame", arm, name))
        self.tool = (0, name)
        return 0

    def change_work_frame(self, arm: str, name: str) -> int:
        self.calls.append(("change_work_frame", arm, name))
        self.work = (0, name)
        return 0


@pytest.fixture
def profile_path(tmp_path: Path) -> Path:
    return write_profile(tmp_path)


@pytest.fixture
def fake_adapter() -> FakeAdapter:
    return FakeAdapter()


def test_loads_exact_robot_ids_and_normalizes_quaternions(profile_path: Path):
    manager = CoordinateManager.from_yaml(profile_path)

    assert set(manager.profiles) == {"l", "m", "r"}
    assert manager.profiles["l"].tools["tcpgrip"].quaternion_wxyz == (1.0, 0.0, 0.0, 0.0)
    assert manager.profiles["m"].tool_default == "tcpgrip"
    assert manager.policy.on_start == "verify"
    assert manager.policy.on_mismatch == "block_motion"


def test_rejects_zero_quaternion(tmp_path: Path):
    path = write_profile(tmp_path, quaternion_wxyz=[0.0, 0.0, 0.0, 0.0])

    with pytest.raises(ValueError, match="quaternion"):
        CoordinateManager.from_yaml(path)


@pytest.mark.parametrize("quaternion", [[float("nan"), 0.0, 0.0, 0.0], [float("inf"), 0.0, 0.0, 0.0]])
def test_rejects_non_finite_quaternion(tmp_path: Path, quaternion: list[float]):
    path = write_profile(tmp_path, quaternion_wxyz=quaternion)

    with pytest.raises(ValueError, match="finite"):
        CoordinateManager.from_yaml(path)


def test_normalizes_large_finite_quaternion(tmp_path: Path):
    path = write_profile(tmp_path, quaternion_wxyz=[1.0e308, 0.0, 0.0, 0.0])

    manager = CoordinateManager.from_yaml(path)

    assert manager.profiles["l"].tools["tcpgrip"].quaternion_wxyz == (1.0, 0.0, 0.0, 0.0)


@pytest.mark.parametrize("controller_name", ["", "0123456789"])
def test_rejects_invalid_controller_frame_name(tmp_path: Path, controller_name: str):
    path = write_profile(tmp_path, controller_name=controller_name)

    with pytest.raises(ValueError, match="controller_name"):
        CoordinateManager.from_yaml(path)


@pytest.mark.parametrize("ros_frame_id", ["", "tool0", "m/tool0"])
def test_rejects_invalid_or_unnamespaced_ros_frame_id(tmp_path: Path, ros_frame_id: str):
    path = write_profile(tmp_path, ros_frame_id=ros_frame_id)

    with pytest.raises(ValueError, match="ros_frame_id"):
        CoordinateManager.from_yaml(path)


def test_rejects_duplicate_ros_frame_ids(tmp_path: Path):
    data = profile_data()
    data["robots"]["l"]["work_frames"]["cell"]["ros_frame_id"] = "l/tool/tcpgrip"
    path = tmp_path / "coordinates.yaml"
    path.write_text(yaml.safe_dump(data), encoding="ascii")

    with pytest.raises(ValueError, match="unique"):
        CoordinateManager.from_yaml(path)


@pytest.mark.parametrize("change", ["missing_default", "missing_robot", "extra_robot"])
def test_rejects_missing_defaults_and_nonexact_robot_profiles(tmp_path: Path, change: str):
    data = profile_data()
    if change == "missing_default":
        del data["robots"]["l"]["default_tool"]
    elif change == "missing_robot":
        del data["robots"]["r"]
    else:
        data["robots"]["x"] = data["robots"]["l"]
    path = tmp_path / "coordinates.yaml"
    path.write_text(yaml.safe_dump(data), encoding="ascii")

    with pytest.raises(ValueError):
        CoordinateManager.from_yaml(path)


@pytest.mark.parametrize("key, value", [("on_start", "apply"), ("on_mismatch", "warn")])
def test_rejects_unsupported_policy_values(tmp_path: Path, key: str, value: str):
    data = profile_data()
    data["policy"][key] = value
    path = tmp_path / "coordinates.yaml"
    path.write_text(yaml.safe_dump(data), encoding="ascii")

    with pytest.raises(ValueError, match=key):
        CoordinateManager.from_yaml(path)


def test_mismatch_blocks_motion_by_default(fake_adapter: FakeAdapter, profile_path: Path):
    manager = CoordinateManager.from_yaml(profile_path)

    result = manager.verify(fake_adapter, "l")

    assert result.matched is False
    assert result.expected_tool == "tcpgrip"
    assert result.current_tool == "other_tool"
    assert result.expected_work == "cell"
    assert result.current_work == "other_work"
    assert manager.motion_allowed("l") is False


def test_apply_writes_defaults_and_reads_back(fake_adapter: FakeAdapter, profile_path: Path):
    manager = CoordinateManager.from_yaml(profile_path)

    result = manager.apply(fake_adapter, "l")

    assert result.matched is True
    assert result.status == 0
    assert manager.motion_allowed("l") is True
    assert ("set_tool_frame", "l", manager.profiles["l"].tools["tcpgrip"]) in fake_adapter.calls
    assert ("set_work_frame", "l", manager.profiles["l"].works["cell"]) in fake_adapter.calls


def test_select_refuses_busy_arm(profile_path: Path, fake_adapter: FakeAdapter):
    manager = CoordinateManager.from_yaml(profile_path, is_arm_busy=lambda arm: arm == "l")

    result = manager.select_tool(fake_adapter, "l", "tcpgrip")

    assert result.matched is False
    assert result.status != 0
    assert "busy" in result.message
    assert manager.motion_allowed("l") is False
    assert manager.selected_tool("l") == "tcpgrip"
    assert not any(call[0] == "change_tool_frame" for call in fake_adapter.calls)


def test_select_tool_updates_selection_and_verifies_readback(
    profile_path: Path, fake_adapter: FakeAdapter
):
    manager = CoordinateManager.from_yaml(profile_path)
    fake_adapter.work = (0, "cell")

    result = manager.select_tool(fake_adapter, "l", "camera")

    assert result.matched is True
    assert manager.selected_tool("l") == "camera"
    assert ("change_tool_frame", "l", "camera") in fake_adapter.calls


def test_select_work_updates_selection_and_verifies_readback(
    profile_path: Path, fake_adapter: FakeAdapter
):
    manager = CoordinateManager.from_yaml(profile_path)
    fake_adapter.tool = (0, "tcpgrip")

    result = manager.select_work(fake_adapter, "l", "fixture")

    assert result.matched is True
    assert manager.selected_work("l") == "fixture"
    assert ("change_work_frame", "l", "fixture") in fake_adapter.calls


def test_adapter_read_failure_blocks_motion(profile_path: Path):
    class FailingAdapter:
        def current_tool_frame(self, arm: str):
            return (42, None)

        def current_work_frame(self, arm: str):
            return (0, "cell")

    manager = CoordinateManager.from_yaml(profile_path)
    result = manager.verify(FailingAdapter(), "l")

    assert result.status == 42
    assert result.matched is False
    assert manager.motion_allowed("l") is False


def test_loads_checked_in_coordinate_profile():
    path = Path(__file__).resolve().parents[4] / "config/ros/realman_coordinates.yaml"

    manager = CoordinateManager.from_yaml(path)

    assert set(manager.profiles) == {"l", "m", "r"}
    assert manager.profiles["l"].tool_default == "tcpgrip"
    assert manager.profiles["l"].work_default == "cell"
