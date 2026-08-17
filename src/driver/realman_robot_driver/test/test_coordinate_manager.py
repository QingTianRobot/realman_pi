from __future__ import annotations

import math
from pathlib import Path
from types import SimpleNamespace

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
        self.arm_id = "l"
        self.tool = (0, _controller_tool("other"))
        self.work = (0, _controller_work("other"))
        self.tool_frames = {
            "tcpgrip": _controller_tool("tcpgrip"),
            "camera": _controller_tool(
                "camera", xyz_m=(0.0, 0.0, 0.2), payload_kg=0.2,
                center_of_mass_m=(0.0, 0.0, 0.01),
            ),
        }
        self.work_frames = {
            "cell": _controller_work("cell"),
            "fixture": _controller_work("fixture", xyz_m=(0.5, 0.0, 0.0)),
        }
        self.calls: list[tuple[object, ...]] = []
        self.raise_from: str | None = None
        self.on_call = None

    def _record(self, *call: object) -> None:
        self.calls.append(call)
        if self.on_call is not None:
            self.on_call()
        if self.raise_from == call[0]:
            raise RuntimeError(f"forced {call[0]} failure")

    def current_tool_frame(self):
        self._record("current_tool_frame")
        return self.tool

    def current_work_frame(self):
        self._record("current_work_frame")
        return self.work

    def set_tool_frame(self, frame: object) -> int:
        self._record("set_tool_frame", frame)
        self.tool_frames[frame.controller_name] = _controller_tool(
            frame.controller_name,
            xyz_m=frame.xyz_m,
            quaternion_wxyz=frame.quaternion_wxyz,
            payload_kg=frame.payload_kg,
            center_of_mass_m=frame.center_of_mass_m,
        )
        return 0

    def set_work_frame(self, frame: object) -> int:
        self._record("set_work_frame", frame)
        self.work_frames[frame.controller_name] = _controller_work(
            frame.controller_name,
            xyz_m=frame.xyz_m,
            quaternion_wxyz=frame.quaternion_wxyz,
        )
        return 0

    def change_tool_frame(self, name: str) -> int:
        self._record("change_tool_frame", name)
        self.tool = (0, self.tool_frames[name])
        return 0

    def change_work_frame(self, name: str) -> int:
        self._record("change_work_frame", name)
        self.work = (0, self.work_frames[name])
        return 0


class AtomicOwner:
    def __init__(self) -> None:
        self.owned: set[str] = set()
        self.released: list[str] = []
        self.raise_on_release = False

    def acquire(self, arm: str) -> bool:
        if arm in self.owned:
            return False
        self.owned.add(arm)
        return True

    def release(self, arm: str) -> None:
        self.owned.remove(arm)
        self.released.append(arm)
        if self.raise_on_release:
            raise RuntimeError("forced ownership release failure")


def _controller_tool(
    controller_name: str = "tcpgrip",
    *,
    xyz_m=(0.0, 0.0, 0.1),
    quaternion_wxyz=(1.0, 0.0, 0.0, 0.0),
    payload_kg=0.5,
    center_of_mass_m=(0.0, 0.0, 0.02),
):
    return SimpleNamespace(
        controller_name=controller_name,
        xyz_m=xyz_m,
        quaternion_wxyz=quaternion_wxyz,
        payload_kg=payload_kg,
        center_of_mass_m=center_of_mass_m,
    )


def _controller_work(
    controller_name: str = "cell",
    *,
    xyz_m=(0.4, 0.0, 0.0),
    quaternion_wxyz=(1.0, 0.0, 0.0, 0.0),
):
    return SimpleNamespace(
        controller_name=controller_name,
        xyz_m=xyz_m,
        quaternion_wxyz=quaternion_wxyz,
        payload_kg=None,
        center_of_mass_m=None,
    )


@pytest.fixture
def profile_path(tmp_path: Path) -> Path:
    return write_profile(tmp_path)


@pytest.fixture
def fake_adapter() -> FakeAdapter:
    return FakeAdapter()


@pytest.fixture
def atomic_owner() -> AtomicOwner:
    return AtomicOwner()


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


def test_rejects_duplicate_tool_controller_names(tmp_path: Path):
    data = profile_data()
    data["robots"]["l"]["tools"]["camera"]["controller_name"] = "tcpgrip"
    path = tmp_path / "coordinates.yaml"
    path.write_text(yaml.safe_dump(data), encoding="ascii")

    with pytest.raises(ValueError, match=r"tools.*controller_name.*unique"):
        CoordinateManager.from_yaml(path)


def test_rejects_duplicate_work_controller_names(tmp_path: Path):
    data = profile_data()
    data["robots"]["l"]["work_frames"]["fixture"]["controller_name"] = "cell"
    path = tmp_path / "coordinates.yaml"
    path.write_text(yaml.safe_dump(data), encoding="ascii")

    with pytest.raises(ValueError, match=r"work_frames.*controller_name.*unique"):
        CoordinateManager.from_yaml(path)


def test_rejects_unknown_root_key(tmp_path: Path):
    data = profile_data()
    data["unexpected_root"] = True
    path = tmp_path / "coordinates.yaml"
    path.write_text(yaml.safe_dump(data), encoding="ascii")

    with pytest.raises(ValueError, match=r"root.*unexpected_root"):
        CoordinateManager.from_yaml(path)


def test_rejects_unknown_tool_payload_key(tmp_path: Path):
    data = profile_data()
    data["robots"]["l"]["tools"]["tcpgrip"]["unexpected_payload"] = 1
    path = tmp_path / "coordinates.yaml"
    path.write_text(yaml.safe_dump(data), encoding="ascii")

    with pytest.raises(ValueError, match=r"tools\.tcpgrip.*unexpected_payload"):
        CoordinateManager.from_yaml(path)


def test_rejects_unknown_tool_pose_key(tmp_path: Path):
    data = profile_data()
    data["robots"]["l"]["tools"]["tcpgrip"]["pose"]["unexpected_pose"] = 1
    path = tmp_path / "coordinates.yaml"
    path.write_text(yaml.safe_dump(data), encoding="ascii")

    with pytest.raises(ValueError, match=r"tools\.tcpgrip\.pose.*unexpected_pose"):
        CoordinateManager.from_yaml(path)


@pytest.mark.parametrize("section, alias", [("tools", 7), ("work_frames", "")])
def test_rejects_non_string_or_empty_frame_alias(
    tmp_path: Path, section: str, alias: str | int
):
    data = profile_data()
    frames = data["robots"]["l"][section]
    frames[alias] = next(iter(frames.values()))
    path = tmp_path / "coordinates.yaml"
    path.write_text(yaml.safe_dump(data), encoding="ascii")

    with pytest.raises(ValueError, match=rf"robots\.l\.{section}.*alias"):
        CoordinateManager.from_yaml(path)


def test_rejects_unknown_default_tool_alias(tmp_path: Path):
    data = profile_data()
    data["robots"]["l"]["default_tool"] = "unknown"
    path = tmp_path / "coordinates.yaml"
    path.write_text(yaml.safe_dump(data), encoding="ascii")

    with pytest.raises(ValueError, match="default_tool"):
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


@pytest.mark.parametrize("key, value", [("on_start", "write"), ("on_mismatch", "warn")])
def test_rejects_unsupported_policy_values(tmp_path: Path, key: str, value: str):
    data = profile_data()
    data["policy"][key] = value
    path = tmp_path / "coordinates.yaml"
    path.write_text(yaml.safe_dump(data), encoding="ascii")

    with pytest.raises(ValueError, match=key):
        CoordinateManager.from_yaml(path)


def test_accepts_explicit_apply_startup_policy(tmp_path: Path):
    data = profile_data()
    data["policy"]["on_start"] = "apply"
    path = tmp_path / "coordinates.yaml"
    path.write_text(yaml.safe_dump(data), encoding="ascii")

    manager = CoordinateManager.from_yaml(path)

    assert manager.policy.on_start == "apply"


def test_mismatch_blocks_motion_by_default(fake_adapter: FakeAdapter, profile_path: Path):
    manager = CoordinateManager.from_yaml(profile_path)

    result = manager.verify(fake_adapter, "l")

    assert result.matched is False
    assert result.expected_tool == "tcpgrip"
    assert result.current_tool == "other"
    assert result.expected_work == "cell"
    assert result.current_work == "other"
    assert manager.motion_allowed("l") is False


@pytest.mark.parametrize(
    ("frame_kind", "field", "value"),
    [
        ("tool", "xyz_m", (0.001, 0.0, 0.1)),
        ("tool", "quaternion_wxyz", (0.0, 1.0, 0.0, 0.0)),
        ("tool", "payload_kg", 0.6),
        ("tool", "center_of_mass_m", (0.01, 0.0, 0.02)),
        ("work", "xyz_m", (0.401, 0.0, 0.0)),
        ("work", "quaternion_wxyz", (0.0, 0.0, 1.0, 0.0)),
    ],
)
def test_same_name_frame_with_wrong_configured_field_blocks_motion(
    profile_path: Path, frame_kind: str, field: str, value: object
):
    manager = CoordinateManager.from_yaml(profile_path)
    adapter = FakeAdapter()
    adapter.tool = (0, _controller_tool())
    adapter.work = (0, _controller_work())
    setattr(adapter.tool[1] if frame_kind == "tool" else adapter.work[1], field, value)

    result = manager.verify(adapter, "l")

    assert result.matched is False
    assert manager.motion_allowed("l") is False
    assert f"{frame_kind}.{field}" in result.message


def test_quaternion_sign_and_small_finite_readback_error_match(profile_path: Path):
    manager = CoordinateManager.from_yaml(profile_path)
    adapter = FakeAdapter()
    adapter.tool = (
        0,
        _controller_tool(
            xyz_m=(0.0, 0.0, 0.100001),
            quaternion_wxyz=(-1.0, 0.0, 0.0, 0.0),
            payload_kg=0.50001,
            center_of_mass_m=(0.0, 0.0, 0.020001),
        ),
    )
    adapter.work = (0, _controller_work(xyz_m=(0.400001, 0.0, 0.0)))

    result = manager.verify(adapter, "l")

    assert result.matched is True
    assert manager.motion_allowed("l") is True


def test_work_frame_euler_quantization_within_sdk_precision_matches(
    profile_path: Path,
):
    manager = CoordinateManager.from_yaml(profile_path)
    adapter = FakeAdapter()
    half_turn = 0.0005
    adapter.tool = (0, _controller_tool("tcpgrip"))
    adapter.work = (
        0,
        _controller_work(
            "cell",
            quaternion_wxyz=(math.cos(half_turn), 0.0, 0.0, math.sin(half_turn)),
        ),
    )

    result = manager.verify(adapter, "l")

    assert result.matched is True
    assert result.tool_matched is True
    assert result.work_matched is True
    assert manager.motion_allowed("l") is True


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("xyz_m", (float("nan"), 0.0, 0.1)),
        ("quaternion_wxyz", (float("inf"), 0.0, 0.0, 0.0)),
        ("payload_kg", float("nan")),
        ("center_of_mass_m", None),
    ],
)
def test_invalid_or_missing_controller_tool_field_fails_closed(
    profile_path: Path, field: str, value: object
):
    manager = CoordinateManager.from_yaml(profile_path)
    adapter = FakeAdapter()
    adapter.tool = (0, _controller_tool())
    adapter.work = (0, _controller_work())
    setattr(adapter.tool[1], field, value)

    result = manager.verify(adapter, "l")

    assert result.status == -1
    assert result.matched is False
    assert field in result.message
    assert manager.motion_allowed("l") is False


def test_apply_writes_defaults_and_reads_back(
    atomic_owner: AtomicOwner, fake_adapter: FakeAdapter, profile_path: Path
):
    manager = CoordinateManager.from_yaml(
        profile_path,
        acquire_arm=atomic_owner.acquire,
        release_arm=atomic_owner.release,
    )

    result = manager.apply(fake_adapter, "l")

    assert result.matched is True
    assert result.status == 0
    assert manager.motion_allowed("l") is True
    assert ("set_tool_frame", manager.profiles["l"].tools["tcpgrip"]) in fake_adapter.calls
    assert ("set_work_frame", manager.profiles["l"].works["cell"]) in fake_adapter.calls
    assert atomic_owner.owned == set()
    assert atomic_owner.released == ["l"]


def test_apply_refuses_busy_arm_before_any_adapter_call(
    fake_adapter: FakeAdapter, profile_path: Path
):
    manager = CoordinateManager.from_yaml(profile_path, is_arm_busy=lambda _arm: True)

    result = manager.apply(fake_adapter, "l")

    assert result.matched is False
    assert result.status != 0
    assert "busy" in result.message
    assert result.expected_tool == "tcpgrip"
    assert fake_adapter.calls == []
    assert manager.motion_allowed("l") is False


def test_apply_refuses_atomically_owned_arm_without_adapter_calls(
    atomic_owner: AtomicOwner, fake_adapter: FakeAdapter, profile_path: Path
):
    manager = CoordinateManager.from_yaml(
        profile_path,
        acquire_arm=atomic_owner.acquire,
        release_arm=atomic_owner.release,
    )
    fake_adapter.work = (0, _controller_work("cell"))
    selected = manager.select_tool(fake_adapter, "l", "camera")
    assert selected.matched is True
    fake_adapter.calls.clear()
    assert atomic_owner.acquire("l") is True

    result = manager.apply(fake_adapter, "l")

    assert result.matched is False
    assert result.status != 0
    assert "busy" in result.message
    assert result.expected_tool == "camera"
    assert fake_adapter.calls == []
    assert atomic_owner.owned == {"l"}


def test_apply_holds_atomic_ownership_until_readback_completes(
    atomic_owner: AtomicOwner, fake_adapter: FakeAdapter, profile_path: Path
):
    manager = CoordinateManager.from_yaml(
        profile_path,
        acquire_arm=atomic_owner.acquire,
        release_arm=atomic_owner.release,
    )
    fake_adapter.on_call = lambda: _assert_arm_remains_owned(atomic_owner)

    result = manager.apply(fake_adapter, "l")

    assert result.matched is True
    assert atomic_owner.owned == set()
    assert atomic_owner.released == ["l"]


@pytest.mark.parametrize("failure", ["set_tool_frame", "current_tool_frame"])
def test_apply_releases_atomic_ownership_after_adapter_failure(
    atomic_owner: AtomicOwner,
    fake_adapter: FakeAdapter,
    profile_path: Path,
    failure: str,
):
    manager = CoordinateManager.from_yaml(
        profile_path,
        acquire_arm=atomic_owner.acquire,
        release_arm=atomic_owner.release,
    )
    fake_adapter.raise_from = failure

    result = manager.apply(fake_adapter, "l")

    assert result.matched is False
    assert atomic_owner.owned == set()
    assert atomic_owner.released == ["l"]


@pytest.mark.parametrize("operation", ["apply", "select_tool", "select_work"])
def test_release_failure_blocks_motion_after_successful_mutation(
    atomic_owner: AtomicOwner,
    fake_adapter: FakeAdapter,
    profile_path: Path,
    operation: str,
):
    manager = CoordinateManager.from_yaml(
        profile_path,
        acquire_arm=atomic_owner.acquire,
        release_arm=atomic_owner.release,
    )
    atomic_owner.raise_on_release = True
    if operation == "apply":
        result = manager.apply(fake_adapter, "l")
    elif operation == "select_tool":
        fake_adapter.work = (0, _controller_work("cell"))
        result = manager.select_tool(fake_adapter, "l", "camera")
    else:
        fake_adapter.tool = (0, _controller_tool("tcpgrip"))
        result = manager.select_work(fake_adapter, "l", "fixture")

    assert result.matched is False
    assert result.status != 0
    assert "ownership release" in result.message
    assert manager.motion_allowed("l") is False
    assert atomic_owner.owned == set()
    assert atomic_owner.released == ["l"]


def test_mutations_fail_closed_without_atomic_owner(
    fake_adapter: FakeAdapter, profile_path: Path
):
    manager = CoordinateManager.from_yaml(profile_path)

    result = manager.select_tool(fake_adapter, "l", "camera")

    assert result.matched is False
    assert result.status != 0
    assert "ownership" in result.message
    assert fake_adapter.calls == []


def test_select_refuses_busy_arm(profile_path: Path, fake_adapter: FakeAdapter):
    manager = CoordinateManager.from_yaml(profile_path, is_arm_busy=lambda arm: arm == "l")

    result = manager.select_tool(fake_adapter, "l", "tcpgrip")

    assert result.matched is False
    assert result.status != 0
    assert "busy" in result.message
    assert manager.motion_allowed("l") is False
    assert result.expected_tool == "tcpgrip"
    assert result.current_tool is None
    assert not any(call[0] == "change_tool_frame" for call in fake_adapter.calls)


def test_select_tool_updates_selection_and_verifies_readback(
    atomic_owner: AtomicOwner, profile_path: Path, fake_adapter: FakeAdapter
):
    manager = CoordinateManager.from_yaml(
        profile_path,
        acquire_arm=atomic_owner.acquire,
        release_arm=atomic_owner.release,
    )
    fake_adapter.work = (0, _controller_work("cell"))

    result = manager.select_tool(fake_adapter, "l", "camera")

    assert result.matched is True
    assert (result.expected_tool, result.current_tool) == ("camera", "camera")
    assert (result.expected_work, result.current_work) == ("cell", "cell")
    assert ("change_tool_frame", "camera") in fake_adapter.calls
    assert atomic_owner.owned == set()
    assert atomic_owner.released == ["l"]


def test_select_work_updates_selection_and_verifies_readback(
    atomic_owner: AtomicOwner, profile_path: Path, fake_adapter: FakeAdapter
):
    manager = CoordinateManager.from_yaml(
        profile_path,
        acquire_arm=atomic_owner.acquire,
        release_arm=atomic_owner.release,
    )
    fake_adapter.tool = (0, _controller_tool("tcpgrip"))

    result = manager.select_work(fake_adapter, "l", "fixture")

    assert result.matched is True
    assert (result.expected_tool, result.current_tool) == ("tcpgrip", "tcpgrip")
    assert (result.expected_work, result.current_work) == ("fixture", "fixture")
    assert ("change_work_frame", "fixture") in fake_adapter.calls
    assert atomic_owner.owned == set()
    assert atomic_owner.released == ["l"]


def test_does_not_expose_unapproved_selection_query_methods(profile_path: Path):
    manager = CoordinateManager.from_yaml(profile_path)

    assert not hasattr(manager, "selected_tool")
    assert not hasattr(manager, "selected_work")


def test_adapter_read_failure_blocks_motion(profile_path: Path):
    class FailingAdapter:
        arm_id = "l"

        def current_tool_frame(self):
            return (42, None)

        def current_work_frame(self):
            return (0, "cell")

    manager = CoordinateManager.from_yaml(profile_path)
    result = manager.verify(FailingAdapter(), "l")

    assert result.status == 42
    assert result.matched is False
    assert manager.motion_allowed("l") is False


@pytest.mark.parametrize("arm_id", ["m", None])
def test_rejects_wrong_or_missing_adapter_identity(
    profile_path: Path, fake_adapter: FakeAdapter, arm_id: str | None
):
    manager = CoordinateManager.from_yaml(profile_path)
    if arm_id is None:
        del fake_adapter.arm_id
    else:
        fake_adapter.arm_id = arm_id

    result = manager.verify(fake_adapter, "l")

    assert result.matched is False
    assert result.status != 0
    assert "arm_id" in result.message
    assert fake_adapter.calls == []


def test_loads_checked_in_coordinate_profile():
    path = Path(__file__).resolve().parents[4] / "config/ros/realman_coordinates.yaml"

    manager = CoordinateManager.from_yaml(path)

    assert set(manager.profiles) == {"l", "m", "r"}
    assert manager.profiles["l"].tool_default == "tcpgrip"
    assert manager.profiles["l"].work_default == "cell"


def _assert_arm_remains_owned(owner: AtomicOwner) -> None:
    assert owner.acquire("l") is False
