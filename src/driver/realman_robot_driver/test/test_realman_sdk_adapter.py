import builtins
import math
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

    def rm_delete_robot_arm(self):
        return self._call("rm_delete_robot_arm")

    def rm_destroy(self):
        return self._call("rm_destroy")


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
    assert adapter._pending_event_callback is None


def test_event_callback_reference_changes_only_after_successful_registration(adapter, fake_robot):
    first = lambda event: ("first", event)
    second = lambda event: ("second", event)

    fake_robot.results["rm_get_arm_event_call_back"] = 41
    assert adapter.register_event_callback(first) == 41
    assert adapter._event_callback is None
    assert adapter._pending_event_callback is None

    fake_robot.results["rm_get_arm_event_call_back"] = 0
    assert adapter.register_event_callback(first) == 0
    assert adapter._event_callback is first
    assert adapter._pending_event_callback is None

    fake_robot.results["rm_get_arm_event_call_back"] = 42
    assert adapter.register_event_callback(second) == 42
    assert adapter._event_callback is first
    assert adapter._pending_event_callback is None


def test_connected_without_handle_fails_closed_without_calling_sdk(adapter, fake_robot):
    adapter._handle = None

    assert adapter.movej([0.0] * 6, 20, 0, False) == -1
    assert fake_robot.calls == []
    assert adapter.last_error_message == "SDK robot handle is unavailable"


@pytest.mark.parametrize("handle", [None, SimpleNamespace(id=-1)])
def test_get_state_without_valid_handle_fails_closed_without_calling_sdk(
    adapter, fake_robot, handle
):
    adapter._handle = handle

    state = adapter.get_state()

    assert state.joint_degrees == ()
    assert state.connected is False
    assert state.error_code == -1
    assert fake_robot.calls == []
    assert adapter.last_error == -1
    assert adapter.last_error_message


class HandleWithRaisingId:
    @property
    def id(self):
        raise RuntimeError("handle id unavailable")


@pytest.mark.parametrize("handle", [HandleWithRaisingId(), SimpleNamespace(id=True)])
def test_get_state_handles_unreadable_or_boolean_handle_id_without_calling_sdk(
    adapter, fake_robot, handle
):
    adapter._handle = handle

    state = adapter.get_state()

    assert state.joint_degrees == ()
    assert state.connected is False
    assert state.error_code == -1
    assert fake_robot.calls == []
    assert adapter.last_error == -1
    assert adapter.last_error_message == "SDK returned an invalid robot handle"


def test_set_work_frame_malformed_input_returns_error_without_calling_sdk(
    adapter, fake_robot
):
    class MalformedFrame:
        @property
        def xyz_m(self):
            raise RuntimeError("malformed work frame")

    status = adapter.set_work_frame(MalformedFrame())

    assert status == -1
    assert fake_robot.calls == []
    assert adapter.last_error == -1
    assert adapter.last_error_message == "malformed work frame"


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


@pytest.mark.parametrize(
    ("stop_method", "vendor_method"),
    [("stop", "rm_set_arm_stop"), ("slow_stop", "rm_set_arm_slow_stop")],
)
def test_stop_requests_preempt_a_blocking_motion(adapter, fake_robot, stop_method, vendor_method):
    entered = threading.Event()
    release = threading.Event()
    stop_completed = threading.Event()

    def slow_movej(*args):
        entered.set()
        release.wait(timeout=1.0)
        return 0

    fake_robot.rm_movej = slow_movej
    def issue_stop():
        assert getattr(adapter, stop_method)() == 0
        stop_completed.set()

    motion = threading.Thread(target=adapter.movej, args=([0.0] * 6, 20, 0, False))
    stopper = threading.Thread(target=issue_stop)
    motion.start()
    assert entered.wait(timeout=1.0)
    stopper.start()
    assert stop_completed.wait(timeout=0.2)
    assert fake_robot.calls[-1][0] == vendor_method
    release.set()
    motion.join(timeout=1.0)
    stopper.join(timeout=1.0)

    assert not motion.is_alive()
    assert not stopper.is_alive()


def test_query_raw_integer_status_updates_and_clears_last_error(adapter, fake_robot):
    fake_robot.results["rm_get_arm_current_trajectory"] = 23

    assert adapter.current_trajectory() == 23
    assert adapter.last_error == 23
    assert adapter.last_error_message == "SDK trajectory query failed"

    fake_robot.results["rm_get_arm_current_trajectory"] = 0
    assert adapter.current_trajectory() == 0
    assert adapter.last_error == 0
    assert adapter.last_error_message == ""


def test_query_malformed_status_returns_error_without_leaking_exception(
    adapter, fake_robot
):
    fake_robot.results["rm_get_arm_current_trajectory"] = (object(), {"state": 1})

    result = adapter.current_trajectory()

    assert result == (-1, None)
    assert adapter.last_error == -1
    assert adapter.last_error_message == "SDK trajectory query failed"
    assert adapter._active_calls == 0


@pytest.mark.parametrize("result", [(7,), [], [0]])
def test_query_short_sequence_fails_closed(adapter, fake_robot, result):
    fake_robot.results["rm_get_arm_current_trajectory"] = result

    query_result = adapter.current_trajectory()

    assert query_result == (-1, None)
    assert adapter.last_error == -1
    assert adapter.last_error_message == "SDK trajectory query failed"


def test_get_state_malformed_status_returns_error_without_leaking_exception(
    adapter, fake_robot
):
    fake_robot.joint_result = (object(), [0.0] * 6)

    state = adapter.get_state()

    assert state.joint_degrees == ()
    assert state.connected is True
    assert state.error_code == -1
    assert adapter.last_error == -1
    assert adapter.last_error_message == "SDK joint state request failed"
    assert adapter._active_calls == 0


def test_mock_current_trajectory_uses_documented_raw_dict_shape():
    adapter = RealManSdkAdapter(
        ip="192.0.2.123",
        port=8080,
        thread_mode="RM_TRIPLE_MODE_E",
        robot_model="RM65-B",
        mock_mode=True,
    )

    assert adapter.connect() == 0
    assert adapter.current_trajectory() == {"trajectory_type": 0}
    assert adapter.current_arm_state() == (0, {})


def test_mock_motion_reports_active_then_completed_trajectory_event():
    adapter = RealManSdkAdapter(
        ip="192.0.2.123",
        port=8080,
        thread_mode="RM_TRIPLE_MODE_E",
        robot_model="RM65-B",
        mock_mode=True,
    )
    events: list[object] = []

    assert adapter.connect() == 0
    assert adapter.register_event_callback(events.append) == 0
    assert adapter.movej([0.0] * 6, 10, 0, connect=False) == 0
    assert adapter.current_trajectory() == {"trajectory_type": 1}
    assert adapter.current_trajectory() == {"trajectory_type": 0}
    assert events == [
        {
            "event_type": 1,
            "device": 0,
            "trajectory_state": True,
            "trajectory_connect": 0,
        }
    ]


def test_disconnect_clears_event_callback_and_reconnect_does_not_retain_it():
    adapter = RealManSdkAdapter(
        ip="192.0.2.123",
        port=8080,
        thread_mode="RM_TRIPLE_MODE_E",
        robot_model="RM65-B",
        mock_mode=True,
    )
    callback = lambda event: event

    assert adapter.connect() == 0
    assert adapter.register_event_callback(callback) == 0
    assert adapter.disconnect() == 0
    assert adapter._event_callback is None
    assert adapter._pending_event_callback is None
    assert adapter.connect() == 0
    assert adapter._event_callback is None
    assert adapter._pending_event_callback is None


def test_disconnect_attempts_destroy_after_delete_exception_and_clears_callback(
    adapter, fake_robot
):
    callback = lambda event: event
    adapter._event_callback = callback
    fake_robot.results["rm_delete_robot_arm"] = RuntimeError("delete failed")

    assert adapter.disconnect() == -1
    assert ("rm_delete_robot_arm",) in fake_robot.calls
    assert ("rm_destroy",) in fake_robot.calls
    assert adapter._event_callback is None
    assert adapter._robot is None
    assert adapter._handle is None
    assert adapter.connected is False


def test_disconnect_retains_event_callback_until_destroy_returns(adapter, fake_robot):
    callback = lambda event: event
    adapter._event_callback = callback

    def destroy():
        assert adapter._event_callback is callback
        return 0

    fake_robot.rm_destroy = destroy

    assert adapter.disconnect() == 0
    assert adapter._event_callback is None
    assert adapter._pending_event_callback is None


def test_mock_connected_malformed_tool_frame_returns_error_without_raising():
    adapter = RealManSdkAdapter(
        ip="192.0.2.123",
        port=8080,
        thread_mode="RM_TRIPLE_MODE_E",
        robot_model="RM65-B",
        mock_mode=True,
    )
    assert adapter.connect() == 0

    class MalformedFrame:
        @property
        def controller_name(self):
            raise RuntimeError("malformed tool frame")

    assert adapter.set_tool_frame(MalformedFrame()) == -1
    assert adapter.last_error == -1
    assert adapter.last_error_message == "malformed tool frame"


@pytest.mark.parametrize(
    "quaternion_wxyz",
    [
        (float("nan"), 0.0, 0.0, 0.0),
        (float("inf"), 0.0, 0.0, 0.0),
        (0.0, 0.0, 0.0, 0.0),
        (2.0, 0.0, 0.0, 0.0),
    ],
)
def test_nonmock_tool_frame_rejects_invalid_or_nonunit_quaternion_before_sdk(
    adapter, fake_robot, monkeypatch, quaternion_wxyz
):
    _install_frame_types(monkeypatch)
    tool = ToolFrame(
        controller_name="gripper",
        ros_frame_id="l/tool",
        xyz_m=(0.1, 0.2, 0.3),
        quaternion_wxyz=quaternion_wxyz,
        payload_kg=1.5,
        center_of_mass_m=(0.01, 0.02, 0.03),
    )

    assert adapter.set_tool_frame(tool) == -1
    assert fake_robot.calls == []
    assert adapter.last_error == -1
    assert adapter.last_error_message


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
        quaternion_wxyz=(1.0, 0.0, 0.0, 0.0),
    )
    fake_robot.results["rm_get_current_tool_frame"] = (
        0,
        {
            "frame_name": "gripper",
            "pose": {
                "position": {"x": 0.1, "y": 0.2, "z": 0.3},
                "quaternion": {"w": 1.0, "x": 0.0, "y": 0.0, "z": 0.0},
            },
            "payload": 1.5,
            "x": 0.01,
            "y": 0.02,
            "z": 0.03,
        },
    )
    fake_robot.results["rm_get_current_work_frame"] = (
        0,
        {"frame_name": "cell", "pose": [0.4, 0.5, 0.6, 0.0, 0.0, 0.0]},
    )

    assert adapter.arm_id == "l"
    tool_status, current_tool = adapter.current_tool_frame()
    work_status, current_work = adapter.current_work_frame()
    assert tool_status == work_status == 0
    assert current_tool.controller_name == "gripper"
    assert current_tool.xyz_m == (0.1, 0.2, 0.3)
    assert current_tool.quaternion_wxyz == (1.0, 0.0, 0.0, 0.0)
    assert current_tool.payload_kg == 1.5
    assert current_tool.center_of_mass_m == (0.01, 0.02, 0.03)
    assert current_work.controller_name == "cell"
    assert current_work.xyz_m == (0.4, 0.5, 0.6)
    assert current_work.quaternion_wxyz == (1.0, 0.0, 0.0, 0.0)
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
        [0.4, 0.5, 0.6, 0.0, 0.0, 0.0],
    )
    assert adapter.change_tool_frame("gripper") == 0
    assert adapter.change_work_frame("cell") == 0


def test_set_work_frame_normalizes_quaternion_and_serializes_known_axis_euler(
    adapter, fake_robot
):
    scale = math.sqrt(2.0)
    work = WorkFrame(
        controller_name="cell",
        ros_frame_id="l/cell",
        xyz_m=(0.4, 0.5, 0.6),
        quaternion_wxyz=(scale, 0.0, 0.0, scale),
    )

    assert adapter.set_work_frame(work) == 0

    method, name, pose = fake_robot.calls[-1]
    assert (method, name) == ("rm_set_manual_work_frame", "cell")
    assert pose == pytest.approx([0.4, 0.5, 0.6, 0.0, 0.0, math.pi / 2.0])


@pytest.mark.parametrize(
    ("xyz_m", "quaternion_wxyz"),
    [
        ((float("nan"), 0.0, 0.0), (1.0, 0.0, 0.0, 0.0)),
        ((0.0, 0.0, 0.0), (float("nan"), 0.0, 0.0, 0.0)),
        ((0.0, 0.0, 0.0), (float("inf"), 0.0, 0.0, 0.0)),
        ((0.0, 0.0, 0.0), (0.0, 0.0, 0.0, 0.0)),
    ],
)
def test_set_work_frame_rejects_nonfinite_or_zero_pose_before_sdk(
    adapter, fake_robot, xyz_m, quaternion_wxyz
):
    work = WorkFrame(
        controller_name="cell",
        ros_frame_id="l/cell",
        xyz_m=xyz_m,
        quaternion_wxyz=quaternion_wxyz,
    )

    assert adapter.set_work_frame(work) == -1
    assert fake_robot.calls == []
    assert adapter.last_error == -1
    assert adapter.last_error_message


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

    assert adapter.current_tool_frame() == (51, None)
    assert adapter.current_work_frame() == (52, None)
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
        quaternion_wxyz=(1.0, 0.0, 0.0, 0.0),
    )
    adapter.configure_mock_coordinate_profile(
        SimpleNamespace(
            tool_default="gripper",
            work_default="cell",
            tools={"gripper": tool},
            works={"cell": work},
        )
    )
    tool_status, current_tool = adapter.current_tool_frame()
    work_status, current_work = adapter.current_work_frame()
    assert tool_status == work_status == 0
    assert current_tool.controller_name == "gripper"
    assert current_tool.xyz_m == tool.xyz_m
    assert current_tool.payload_kg == tool.payload_kg
    assert current_tool.center_of_mass_m == tool.center_of_mass_m
    assert current_work.controller_name == "cell"
    assert current_work.xyz_m == work.xyz_m
    assert adapter.disconnect() == 0
    assert adapter.get_state().connected is False


@pytest.mark.parametrize(
    "frame",
    [
        {"frame_name": "tool", "pose": {"position": {"x": 0.0, "y": 0.0, "z": 0.0}}},
        {
            "frame_name": "tool",
            "pose": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
            "payload": float("nan"),
            "x": 0.0,
            "y": 0.0,
            "z": 0.0,
        },
        {"name": "invented", "xyz": [0.0, 0.0, 0.0]},
    ],
)
def test_coordinate_readback_rejects_missing_nonfinite_or_unknown_shape(
    adapter, fake_robot, frame
):
    fake_robot.results["rm_get_current_tool_frame"] = (0, frame)

    status, current = adapter.current_tool_frame()

    assert status == -1
    assert current is None
    assert adapter.last_error == -1


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
    adapter._handle = SimpleNamespace(id=17)
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
    adapter._handle = SimpleNamespace(id=17)
    adapter._connected = True

    state = adapter.get_state()

    assert state.connected is False
    assert state.error_code == -2
    assert adapter.connected is False


class BlockingCreateRobot:
    created = 0
    create_entered = threading.Event()
    create_release = threading.Event()
    destroyed = []

    def __init__(self, mode):
        type(self).created += 1
        self.calls = []

    def rm_create_robot_arm(self, ip, port):
        type(self).create_entered.set()
        type(self).create_release.wait(timeout=2.0)
        return SimpleNamespace(id=type(self).created)

    def rm_delete_robot_arm(self):
        self.calls.append("delete")
        return 0

    def rm_destroy(self):
        self.calls.append("destroy")
        type(self).destroyed.append(self)
        return 0


def _install_connecting_sdk(monkeypatch, robot_type):
    sdk = ModuleType("Robotic_Arm.rm_robot_interface")
    sdk.RoboticArm = robot_type
    sdk.rm_thread_mode_e = SimpleNamespace(RM_TRIPLE_MODE_E=object())
    package = ModuleType("Robotic_Arm")
    package.rm_robot_interface = sdk
    monkeypatch.setitem(sys.modules, "Robotic_Arm", package)
    monkeypatch.setitem(sys.modules, "Robotic_Arm.rm_robot_interface", sdk)


class InvalidHandleRobot:
    instances = []

    def __init__(self, mode):
        self.calls = []
        type(self).instances.append(self)

    def rm_create_robot_arm(self, ip, port):
        self.calls.append(("create", ip, port))
        return SimpleNamespace(id=-1)

    def rm_delete_robot_arm(self):
        self.calls.append(("delete",))
        return 0

    def rm_destroy(self):
        self.calls.append(("destroy",))
        return 0


class UnexpectedReplacementRobot:
    instances = []

    def __init__(self, mode):
        type(self).instances.append(self)


def test_connect_aborts_when_stale_robot_teardown_fails(monkeypatch):
    UnexpectedReplacementRobot.instances = []
    _install_connecting_sdk(monkeypatch, UnexpectedReplacementRobot)
    adapter = RealManSdkAdapter(
        ip="192.0.2.123",
        port=8080,
        thread_mode="RM_TRIPLE_MODE_E",
        robot_model="RM65-B",
        mock_mode=False,
    )
    stale_robot = FakeRobot()
    stale_robot.results["rm_destroy"] = 71
    adapter._robot = stale_robot
    adapter._handle = SimpleNamespace(id=17)

    assert adapter.connect() == 71

    assert stale_robot.calls == [("rm_delete_robot_arm",), ("rm_destroy",)]
    assert UnexpectedReplacementRobot.instances == []
    assert adapter._robot is None
    assert adapter._handle is None
    assert adapter.connected is False
    assert adapter.last_error == 71
    assert adapter.last_error_message == "SDK disconnect failed"


def test_connect_invalid_handle_cleans_up_robot_immediately(monkeypatch):
    InvalidHandleRobot.instances = []
    _install_connecting_sdk(monkeypatch, InvalidHandleRobot)
    adapter = RealManSdkAdapter(
        ip="192.0.2.123",
        port=8080,
        thread_mode="RM_TRIPLE_MODE_E",
        robot_model="RM65-B",
        mock_mode=False,
    )

    assert adapter.connect() == -1

    robot = InvalidHandleRobot.instances[-1]
    assert robot.calls == [("create", "192.0.2.123", 8080), ("delete",), ("destroy",)]
    assert adapter._robot is None
    assert adapter._handle is None
    assert adapter.connected is False
    assert adapter.last_error == -1
    assert adapter.last_error_message == "SDK returned an invalid robot handle"


def test_connect_is_single_handle_and_disconnect_waits_for_blocking_create(monkeypatch):
    BlockingCreateRobot.created = 0
    BlockingCreateRobot.create_entered.clear()
    BlockingCreateRobot.create_release.clear()
    BlockingCreateRobot.destroyed = []
    _install_connecting_sdk(monkeypatch, BlockingCreateRobot)
    adapter = RealManSdkAdapter(
        ip="192.0.2.123",
        port=8080,
        thread_mode="RM_TRIPLE_MODE_E",
        robot_model="RM65-B",
        mock_mode=False,
    )
    connect_results = []
    connector = threading.Thread(target=lambda: connect_results.append(adapter.connect()))
    second_connector = threading.Thread(target=lambda: connect_results.append(adapter.connect()))
    connector.start()
    assert BlockingCreateRobot.create_entered.wait(timeout=1.0)
    second_connector.start()
    disconnect_result = []
    disconnector = threading.Thread(target=lambda: disconnect_result.append(adapter.disconnect()))
    disconnector.start()
    assert disconnector.is_alive()
    BlockingCreateRobot.create_release.set()
    connector.join(timeout=2.0)
    second_connector.join(timeout=2.0)
    disconnector.join(timeout=2.0)

    assert not connector.is_alive()
    assert not second_connector.is_alive()
    assert not disconnector.is_alive()
    assert connect_results == [0, 0]
    assert disconnect_result == [0]
    assert BlockingCreateRobot.created == 1
    assert len(BlockingCreateRobot.destroyed) == 1
    assert adapter.connected is False


def test_disconnect_waits_for_blocking_motion_before_destroy(adapter, fake_robot):
    entered = threading.Event()
    release = threading.Event()
    destroy_started = threading.Event()

    def slow_movej(*args):
        entered.set()
        release.wait(timeout=2.0)
        return 17

    def destroy():
        destroy_started.set()
        return 0

    fake_robot.rm_movej = slow_movej
    fake_robot.rm_destroy = destroy
    motion = threading.Thread(target=adapter.movej, args=([0.0] * 6, 20, 0, False))
    motion.start()
    assert entered.wait(timeout=1.0)

    disconnect_result = []
    disconnector = threading.Thread(target=lambda: disconnect_result.append(adapter.disconnect()))
    disconnector.start()
    assert disconnector.is_alive()
    assert not destroy_started.wait(timeout=0.2)
    assert adapter.stop() == 0
    assert ("rm_set_arm_stop",) in fake_robot.calls

    release.set()
    motion.join(timeout=2.0)
    disconnector.join(timeout=2.0)
    assert not motion.is_alive()
    assert not disconnector.is_alive()
    assert destroy_started.is_set()
    assert disconnect_result == [0]


def test_stale_motion_result_does_not_pollute_disconnect_or_reconnect(adapter, fake_robot):
    entered = threading.Event()
    release = threading.Event()
    destroy_entered = threading.Event()
    destroy_release = threading.Event()

    def stale_movej(*args):
        entered.set()
        release.wait(timeout=2.0)
        return 44

    def blocking_destroy():
        destroy_entered.set()
        destroy_release.wait(timeout=2.0)
        return 0

    fake_robot.rm_movej = stale_movej
    fake_robot.rm_destroy = blocking_destroy
    motion = threading.Thread(target=adapter.movej, args=([0.0] * 6, 20, 0, False))
    motion.start()
    assert entered.wait(timeout=1.0)
    disconnector = threading.Thread(target=adapter.disconnect)
    disconnector.start()
    release.set()
    assert destroy_entered.wait(timeout=1.0)

    assert adapter.last_error == 0
    destroy_release.set()
    motion.join(timeout=2.0)
    disconnector.join(timeout=2.0)
    assert not motion.is_alive()
    assert not disconnector.is_alive()

    adapter.mock_mode = True
    assert adapter.connect() == 0
    assert adapter.last_error == 0


def test_stale_callback_completion_cannot_bind_after_reconnect(adapter, fake_robot):
    callback_started = threading.Event()
    callback_release = threading.Event()
    first = lambda event: ("first", event)

    def blocking_callback(callback):
        callback_started.set()
        callback_release.wait(timeout=2.0)
        return 0

    fake_robot.rm_get_arm_event_call_back = blocking_callback
    registration_result = []
    registration = threading.Thread(
        target=lambda: registration_result.append(adapter.register_event_callback(first))
    )
    registration.start()
    assert callback_started.wait(timeout=1.0)

    disconnect_result = []
    disconnector = threading.Thread(target=lambda: disconnect_result.append(adapter.disconnect()))
    disconnector.start()
    callback_release.set()
    registration.join(timeout=2.0)
    disconnector.join(timeout=2.0)
    assert not registration.is_alive()
    assert not disconnector.is_alive()

    adapter._robot = None
    adapter._handle = None
    adapter._connected = False
    adapter.mock_mode = True
    assert adapter.connect() == 0
    assert registration_result == [-1]
    assert adapter._event_callback is None


def test_disconnect_retains_callback_during_post_registration_teardown(
    adapter, fake_robot, monkeypatch
):
    vendor_call_returned = threading.Event()
    finish_registration = threading.Event()
    callback = lambda event: event
    invoke_vendor = adapter._invoke_vendor

    def block_after_vendor_call(*args, **kwargs):
        result = invoke_vendor(*args, **kwargs)
        vendor_call_returned.set()
        finish_registration.wait(timeout=2.0)
        return result

    def destroy():
        assert (
            adapter._event_callback is callback
            or adapter._pending_event_callback is callback
        )
        return 0

    monkeypatch.setattr(adapter, "_invoke_vendor", block_after_vendor_call)
    fake_robot.rm_destroy = destroy
    registration_result = []
    registration = threading.Thread(
        target=lambda: registration_result.append(adapter.register_event_callback(callback))
    )
    registration.start()
    assert vendor_call_returned.wait(timeout=1.0)
    assert adapter._active_calls == 0

    disconnect_result = []
    disconnector = threading.Thread(target=lambda: disconnect_result.append(adapter.disconnect()))
    disconnector.start()
    disconnector.join(timeout=2.0)
    assert not disconnector.is_alive()

    finish_registration.set()
    registration.join(timeout=2.0)
    assert not registration.is_alive()
    assert disconnect_result == [0]
    assert registration_result == [-1]
    assert adapter._event_callback is None
    assert adapter._pending_event_callback is None
