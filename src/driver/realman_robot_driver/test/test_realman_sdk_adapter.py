import builtins
import sys
import threading
from types import ModuleType, SimpleNamespace

import pytest

from realman_robot_driver.coordinate_manager import ToolFrame, WorkFrame
from realman_robot_driver.realman_sdk_adapter import RealManSdkAdapter


class FakeRobot:
    def __init__(self):
        self.calls = []
        self.results = {}
        self.joint_result = (7, [])

    def _call(self, name, *args):
        self.calls.append((name, *args))
        result = self.results.get(name, 0)
        if isinstance(result, Exception):
            raise result
        return result

    def rm_get_joint_degree(self):
        self.calls.append(("rm_get_joint_degree",))
        return self.joint_result

    def rm_movej(self, joint, velocity, radius, connect, block):
        return self._call("rm_movej", joint, velocity, radius, connect, block)

    def rm_movel(self, pose, velocity, radius, connect, block):
        return self._call("rm_movel", pose, velocity, radius, connect, block)

    def rm_movej_p(self, pose, velocity, radius, connect, block):
        return self._call("rm_movej_p", pose, velocity, radius, connect, block)

    def rm_set_arm_slow_stop(self):
        return self._call("rm_set_arm_slow_stop")

    def rm_set_arm_stop(self):
        return self._call("rm_set_arm_stop")

    def rm_get_arm_current_trajectory(self):
        return self._call("rm_get_arm_current_trajectory")

    def rm_get_current_arm_state(self):
        return self._call("rm_get_current_arm_state")

    def rm_get_arm_event_call_back(self, callback):
        return self._call("rm_get_arm_event_call_back", callback)

    def rm_set_movev_canfd_init(self, avoid_singularity_flag, frame_type, period_ms):
        return self._call(
            "rm_set_movev_canfd_init", avoid_singularity_flag, frame_type, period_ms
        )

    def rm_movev_canfd(self, cartesian_velocity, follow, trajectory_mode, radio):
        return self._call(
            "rm_movev_canfd", cartesian_velocity, follow, trajectory_mode, radio
        )

    def rm_get_current_tool_frame(self):
        return self._call("rm_get_current_tool_frame")

    def rm_get_current_work_frame(self):
        return self._call("rm_get_current_work_frame")

    def rm_set_manual_tool_frame(self, frame):
        return self._call("rm_set_manual_tool_frame", frame)

    def rm_set_manual_work_frame(self, name, pose):
        return self._call("rm_set_manual_work_frame", name, pose)

    def rm_change_tool_frame(self, name):
        return self._call("rm_change_tool_frame", name)

    def rm_change_work_frame(self, name):
        return self._call("rm_change_work_frame", name)


@pytest.fixture
def fake_robot():
    return FakeRobot()


@pytest.fixture
def adapter(fake_robot):
    instance = RealManSdkAdapter(
        ip="192.0.2.123",
        port=8080,
        thread_mode="RM_TRIPLE_MODE_E",
        robot_model="RM65-B",
        mock_mode=False,
        arm_id="l",
    )
    instance._robot = fake_robot
    instance._handle = SimpleNamespace(id=17)
    instance._connected = True
    return instance


def test_movej_is_nonblocking_and_preserves_degrees(adapter, fake_robot):
    assert adapter.movej([1.0] * 6, 20, 0, False) == 0
    assert fake_robot.calls[-1] == ("rm_movej", [1.0] * 6, 20, 0, 0, 0)


@pytest.mark.parametrize(
    ("method_name", "pose", "vendor_name"),
    [
        ("movel", [0.1, 0.2, 0.3, 1.0, 0.0, 0.0, 0.0], "rm_movel"),
        ("movej_p", [0.2, 0.1, 0.3, 1.0, 0.0, 0.0, 0.0], "rm_movej_p"),
    ],
)
def test_pose_motion_forwards_vendor_arguments(adapter, fake_robot, method_name, pose, vendor_name):
    assert getattr(adapter, method_name)(pose, 20, 5, True) == 0
    assert fake_robot.calls[-1] == (vendor_name, pose, 20, 5, 1, 0)


def test_velocity_vector_is_not_converted_to_euler(adapter, fake_robot):
    assert adapter.movev([0.1, 0, 0, 0, 0.2, 0], True, 0, 0) == 0
    assert fake_robot.calls[-1][0] == "rm_movev_canfd"
    assert fake_robot.calls[-1][1] == [0.1, 0, 0, 0, 0.2, 0]


@pytest.mark.parametrize(
    ("method_name", "result", "expected_status"),
    [
        ("movej", 31, 31),
        ("movel", 32, 32),
        ("movej_p", 33, 33),
        ("movev", 34, 34),
    ],
)
def test_motion_commands_return_nonzero_vendor_status_unchanged(
    adapter, fake_robot, method_name, result, expected_status
):
    fake_robot.results[
        {
            "movej": "rm_movej",
            "movel": "rm_movel",
            "movej_p": "rm_movej_p",
            "movev": "rm_movev_canfd",
        }[method_name]
    ] = result

    arguments = {
        "movej": ([0.0] * 6, 20, 0, False),
        "movel": ([0.0] * 7, 20, 0, False),
        "movej_p": ([0.0] * 7, 20, 0, False),
        "movev": ([0.0] * 6, True, 0, 0),
    }[method_name]

    assert getattr(adapter, method_name)(*arguments) == expected_status


def test_stop_motion_and_state_calls_preserve_vendor_results(adapter, fake_robot):
    trajectory = {"trajectory_state": 3}
    arm_state = (6, {"joint": [1.0] * 6})
    fake_robot.results.update(
        {
            "rm_set_arm_slow_stop": 4,
            "rm_set_arm_stop": 5,
            "rm_get_arm_current_trajectory": trajectory,
            "rm_get_current_arm_state": arm_state,
        }
    )

    assert adapter.slow_stop() == 4
    assert adapter.stop() == 5
    assert adapter.current_trajectory() is trajectory
    assert adapter.current_arm_state() is arm_state
    assert [call[0] for call in fake_robot.calls[-4:]] == [
        "rm_set_arm_slow_stop",
        "rm_set_arm_stop",
        "rm_get_arm_current_trajectory",
        "rm_get_current_arm_state",
    ]


def test_event_callback_is_registered_and_retained(adapter, fake_robot):
    callback = lambda event: event

    assert adapter.register_event_callback(callback) == 0
    assert fake_robot.calls[-1] == ("rm_get_arm_event_call_back", callback)
    assert adapter._event_callback is callback


def test_event_callback_reference_changes_only_after_successful_registration(adapter, fake_robot):
    first = lambda event: ("first", event)
    second = lambda event: ("second", event)

    fake_robot.results["rm_get_arm_event_call_back"] = 41
    assert adapter.register_event_callback(first) == 41
    assert adapter._event_callback is None

    fake_robot.results["rm_get_arm_event_call_back"] = 0
    assert adapter.register_event_callback(first) == 0
    assert adapter._event_callback is first

    fake_robot.results["rm_get_arm_event_call_back"] = 42
    assert adapter.register_event_callback(second) == 42
    assert adapter._event_callback is first


def test_connected_without_handle_fails_closed_without_calling_sdk(adapter, fake_robot):
    adapter._handle = None

    assert adapter.movej([0.0] * 6, 20, 0, False) == -1
    assert fake_robot.calls == []
    assert adapter.last_error_message == "SDK robot handle is unavailable"


def test_velocity_init_and_nonzero_status_are_forwarded(adapter, fake_robot):
    fake_robot.results["rm_set_movev_canfd_init"] = 11

    assert adapter.set_movev_init(1, 0, 5) == 11
    assert fake_robot.calls[-1] == ("rm_set_movev_canfd_init", 1, 0, 5)


def test_disconnected_missing_robot_invalid_handle_and_exception_fail_explicitly(
    adapter, fake_robot
):
    adapter._connected = False
    assert adapter.movej([0.0] * 6, 20, 0, False) == -1

    adapter._connected = True
    adapter._robot = None
    assert adapter.movej([0.0] * 6, 20, 0, False) == -1

    adapter._robot = fake_robot
    adapter._handle = SimpleNamespace(id=-1)
    assert adapter.movej([0.0] * 6, 20, 0, False) == -1

    adapter._handle = SimpleNamespace(id=17)
    fake_robot.results["rm_movej"] = RuntimeError("SDK failure")
    assert adapter.movej([0.0] * 6, 20, 0, False) == -1
    assert adapter.last_error_message == "SDK failure"


def test_sdk_calls_are_serialized(adapter, fake_robot):
    entered = threading.Event()
    release = threading.Event()
    active = 0
    peak_active = 0

    def slow_movej(*args):
        nonlocal active, peak_active
        active += 1
        peak_active = max(peak_active, active)
        entered.set()
        release.wait(timeout=1.0)
        active -= 1
        return 0

    fake_robot.rm_movej = slow_movej
    first = threading.Thread(target=adapter.movej, args=([0.0] * 6, 20, 0, False))
    second = threading.Thread(target=adapter.movej, args=([1.0] * 6, 20, 0, False))
    first.start()
    assert entered.wait(timeout=1.0)
    second.start()
    release.set()
    first.join(timeout=1.0)
    second.join(timeout=1.0)

    assert not first.is_alive()
    assert not second.is_alive()
    assert peak_active == 1


class FakePose:
    def __init__(self):
        self.position = SimpleNamespace(x=0.0, y=0.0, z=0.0)
        self.quaternion = SimpleNamespace(w=0.0, x=0.0, y=0.0, z=0.0)


class FakeFrame:
    def __init__(self):
        self.frame_name = ""
        self.pose = None
        self.payload = 0.0
        self.x = 0.0
        self.y = 0.0
        self.z = 0.0


def _install_frame_types(monkeypatch):
    sdk = ModuleType("Robotic_Arm.rm_robot_interface")
    sdk.rm_frame_t = FakeFrame
    sdk.rm_pose_t = FakePose
    package = ModuleType("Robotic_Arm")
    package.rm_robot_interface = sdk
    monkeypatch.setitem(sys.modules, "Robotic_Arm", package)
    monkeypatch.setitem(sys.modules, "Robotic_Arm.rm_robot_interface", sdk)


def test_coordinate_adapter_protocol_uses_one_adapter_arm_and_vendor_frames(
    adapter, fake_robot, monkeypatch
):
    _install_frame_types(monkeypatch)
    tool = ToolFrame(
        controller_name="gripper",
        ros_frame_id="l/tool",
        xyz_m=(0.1, 0.2, 0.3),
        quaternion_wxyz=(1.0, 0.0, 0.0, 0.0),
        payload_kg=1.5,
        center_of_mass_m=(0.01, 0.02, 0.03),
    )
    work = WorkFrame(
        controller_name="cell",
        ros_frame_id="l/cell",
        xyz_m=(0.4, 0.5, 0.6),
        quaternion_wxyz=(0.5, 0.5, 0.5, 0.5),
    )
    fake_robot.results["rm_get_current_tool_frame"] = (0, {"frame_name": "gripper"})
    fake_robot.results["rm_get_current_work_frame"] = (0, {"frame_name": "cell"})

    assert adapter.arm_id == "l"
    assert adapter.current_tool_frame() == (0, {"frame_name": "gripper"})
    assert adapter.current_work_frame() == (0, {"frame_name": "cell"})
    assert adapter.set_tool_frame(tool) == 0
    sent_tool = fake_robot.calls[-1][1]
    assert sent_tool.frame_name == b"gripper"
    assert (sent_tool.pose.position.x, sent_tool.pose.position.y, sent_tool.pose.position.z) == tool.xyz_m
    assert (
        sent_tool.pose.quaternion.w,
        sent_tool.pose.quaternion.x,
        sent_tool.pose.quaternion.y,
        sent_tool.pose.quaternion.z,
    ) == tool.quaternion_wxyz
    assert (sent_tool.payload, sent_tool.x, sent_tool.y, sent_tool.z) == (1.5, 0.01, 0.02, 0.03)
    assert adapter.set_work_frame(work) == 0
    assert fake_robot.calls[-1] == (
        "rm_set_manual_work_frame",
        "cell",
        [0.4, 0.5, 0.6, 0.5, 0.5, 0.5, 0.5],
    )
    assert adapter.change_tool_frame("gripper") == 0
    assert adapter.change_work_frame("cell") == 0


def test_coordinate_operations_return_nonzero_vendor_status_unchanged(
    adapter, fake_robot, monkeypatch
):
    _install_frame_types(monkeypatch)
    tool = ToolFrame(
        controller_name="gripper",
        ros_frame_id="l/tool",
        xyz_m=(0.1, 0.2, 0.3),
        quaternion_wxyz=(1.0, 0.0, 0.0, 0.0),
        payload_kg=1.5,
        center_of_mass_m=(0.01, 0.02, 0.03),
    )
    work = WorkFrame(
        controller_name="cell",
        ros_frame_id="l/cell",
        xyz_m=(0.4, 0.5, 0.6),
        quaternion_wxyz=(0.5, 0.5, 0.5, 0.5),
    )

    fake_robot.results.update(
        {
            "rm_get_current_tool_frame": (51, {"frame_name": "bad-tool"}),
            "rm_get_current_work_frame": (52, {"frame_name": "bad-work"}),
            "rm_set_manual_tool_frame": 53,
            "rm_set_manual_work_frame": 54,
            "rm_change_tool_frame": 55,
            "rm_change_work_frame": 56,
        }
    )

    assert adapter.current_tool_frame() == (51, {"frame_name": "bad-tool"})
    assert adapter.current_work_frame() == (52, {"frame_name": "bad-work"})
    assert adapter.set_tool_frame(tool) == 53
    assert adapter.set_work_frame(work) == 54
    assert adapter.change_tool_frame("gripper") == 55
    assert adapter.change_work_frame("cell") == 56


def test_mock_adapter_is_safe_and_deterministic():
    adapter = RealManSdkAdapter(
        ip="192.0.2.123",
        port=8080,
        thread_mode="RM_TRIPLE_MODE_E",
        robot_model="RM65-B",
        mock_mode=True,
    )

    assert adapter.get_state().connected is False
    assert adapter.stop() == -1
    assert adapter.connect() == 0
    assert adapter.connect() == 0
    state = adapter.get_state()
    assert state.connected is True
    assert state.robot_model == "RM65-B"
    assert state.joint_degrees == (0.0,) * 6
    assert adapter.stop() == 0
    assert adapter.slow_stop() == 0
    assert adapter.movej([0.0] * 6, 20, 0, False) == 0
    assert adapter.movel([0.0] * 7, 20, 0, False) == 0
    assert adapter.movej_p([0.0] * 7, 20, 0, False) == 0
    assert adapter.set_movev_init(1, 0, 5) == 0
    assert adapter.movev([0.0] * 6, True, 0, 0) == 0
    assert adapter.current_tool_frame() == (0, {"frame_name": ""})
    assert adapter.current_work_frame() == (0, {"frame_name": ""})
    assert adapter.change_tool_frame("gripper") == 0
    assert adapter.change_work_frame("cell") == 0
    assert adapter.current_tool_frame() == (0, {"frame_name": "gripper"})
    assert adapter.current_work_frame() == (0, {"frame_name": "cell"})
    assert adapter.disconnect() == 0
    assert adapter.get_state().connected is False


def test_missing_sdk_reports_a_distinct_status(monkeypatch):
    original_import = builtins.__import__

    def reject_sdk(name, *args, **kwargs):
        if name == "Robotic_Arm.rm_robot_interface":
            raise ImportError("test SDK unavailable")
        return original_import(name, *args, **kwargs)

    monkeypatch.setattr(builtins, "__import__", reject_sdk)
    adapter = RealManSdkAdapter(
        ip="192.0.2.123",
        port=8080,
        thread_mode="RM_TRIPLE_MODE_E",
        robot_model="RM65-B",
        mock_mode=False,
    )

    assert adapter.connect() == -100
    assert adapter.get_state().error_code == -100
    assert adapter.disconnect() == 0
    assert adapter.last_error == 0


def test_state_error_is_retained_until_a_successful_read():
    adapter = RealManSdkAdapter(
        ip="192.0.2.123",
        port=8080,
        thread_mode="RM_TRIPLE_MODE_E",
        robot_model="RM65-B",
        mock_mode=False,
    )
    robot = FakeRobot()
    adapter._robot = robot
    adapter._connected = True

    failed_state = adapter.get_state()

    assert failed_state.error_code == 7
    assert failed_state.joint_degrees == ()
    assert adapter.last_error == 7
    assert adapter.last_error_message == "SDK joint state request failed"

    robot.joint_result = (0, [0.0, 10.0, 20.0, 30.0, 40.0, 50.0])
    recovered_state = adapter.get_state()

    assert recovered_state.error_code == 0
    assert recovered_state.joint_degrees[-1] == 50.0
    assert adapter.last_error == 0
    assert adapter.last_error_message == ""


def test_communication_error_marks_connection_for_retry():
    adapter = RealManSdkAdapter(
        ip="192.0.2.123",
        port=8080,
        thread_mode="RM_TRIPLE_MODE_E",
        robot_model="RM65-B",
        mock_mode=False,
    )
    robot = FakeRobot()
    robot.joint_result = (-2, [])
    adapter._robot = robot
    adapter._connected = True

    state = adapter.get_state()

    assert state.connected is False
    assert state.error_code == -2
    assert adapter.connected is False
