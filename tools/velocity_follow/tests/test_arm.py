"""Unit tests for velocity_follow.arm."""

from __future__ import annotations

import time

import pytest

from velocity_follow.arm import (
    ArmError,
    FRAME_TOOL,
    FRAME_TYPES,
    FRAME_WORK,
    MockArm,
    RealManArm,
    _status,
    open_arm,
)


class FakeRobot:
    """Stands in for the vendor RoboticArm object."""

    def __init__(self, *, handle_id=1, joints=(0.0, 1.0, 2.0, 3.0, 4.0, 5.0), pose=None):
        self.handle_id = handle_id
        self.joints = list(joints)
        self.pose = list(pose if pose is not None else [0.3, 0.0, 0.4, 0.0, 0.0, 0.0])
        self.calls = []
        self.deleted = False
        self.destroyed = False
        self.velocity_status = 0

    def rm_create_robot_arm(self, ip, port):
        self.calls.append(("create", ip, port))
        return type("Handle", (), {"id": self.handle_id})()

    def rm_delete_robot_arm(self):
        self.deleted = True
        return 0

    def rm_destroy(self):
        self.destroyed = True
        return 0

    def rm_get_joint_degree(self):
        return 0, list(self.joints)

    def rm_algo_forward_kinematics(self, joints, flag):
        self.calls.append(("fk", tuple(joints), flag))
        return list(self.pose)

    def rm_set_movev_canfd_init(self, avoid, frame_type, dt):
        self.calls.append(("init", avoid, frame_type, dt))
        return 0

    def rm_movev_canfd(self, velocity, follow, trajectory_mode=0, radio=0):
        self.calls.append(("movev", tuple(velocity), follow, trajectory_mode, radio))
        return self.velocity_status

    def rm_change_work_frame(self, name):
        self.calls.append(("work_frame", name))
        return 0

    def rm_set_arm_slow_stop(self):
        self.calls.append(("slow_stop",))
        return 0


def _connected(robot):
    arm = RealManArm("10.0.0.1", 8080)
    arm._robot = robot
    arm._handle = type("Handle", (), {"id": 1})()
    return arm


def test_status_normalises_plain_ints_and_status_tuples():
    assert _status(0) == 0
    assert _status((0, [1.0])) == 0
    assert _status((-3, None)) == -3
    assert _status(None) == -1
    assert _status("nope") == -1


def test_frame_selectors_match_the_sdk_vocabulary():
    assert FRAME_TYPES == {"tool": FRAME_TOOL, "work": FRAME_WORK}
    assert (FRAME_TOOL, FRAME_WORK) == (0, 1)


def test_read_state_returns_joints_and_the_pose_they_imply():
    robot = FakeRobot()
    state = _connected(robot).read_state()
    assert state.ok
    assert state.joint_degrees == (0.0, 1.0, 2.0, 3.0, 4.0, 5.0)
    assert state.pose == (0.3, 0.0, 0.4, 0.0, 0.0, 0.0)
    # FK must be asked for Euler output, which is what the pose differencing needs.
    assert ("fk", state.joint_degrees, 1) in robot.calls


def test_read_state_reports_failure_instead_of_raising_into_the_sampler():
    class Failing(FakeRobot):
        def rm_get_joint_degree(self):
            raise OSError("socket closed")

    assert _connected(Failing()).read_state().ok is False

    class BadStatus(FakeRobot):
        def rm_get_joint_degree(self):
            return -1, []

    assert _connected(BadStatus()).read_state().ok is False

    class BadPose(FakeRobot):
        def rm_algo_forward_kinematics(self, joints, flag):
            return [0.0, float("nan"), 0.0, 0.0, 0.0, 0.0]

    assert _connected(BadPose()).read_state().ok is False

    class ShortPose(FakeRobot):
        def rm_algo_forward_kinematics(self, joints, flag):
            return [0.0, 0.0]

    assert _connected(ShortPose()).read_state().ok is False


def test_start_velocity_passes_the_frame_and_period_through():
    robot = FakeRobot()
    _connected(robot).start_velocity(frame_type=FRAME_WORK, period_ms=10, avoid_singularity=1)
    assert ("init", 1, 1, 10) in robot.calls


def test_start_velocity_raises_on_a_non_zero_status():
    class Failing(FakeRobot):
        def rm_set_movev_canfd_init(self, avoid, frame_type, dt):
            return -4

    with pytest.raises(ArmError):
        _connected(Failing()).start_velocity(frame_type=1, period_ms=10)


def test_send_velocity_forwards_the_vector_and_returns_the_status():
    robot = FakeRobot()
    arm = _connected(robot)
    assert arm.send_velocity((0.01, 0, 0, 0, 0, 0.1), follow=True, trajectory_mode=2, radio=5) == 0
    assert ("movev", (0.01, 0.0, 0.0, 0.0, 0.0, 0.1), True, 2, 5) in robot.calls
    robot.velocity_status = -7
    assert arm.send_velocity((0,) * 6, follow=False) == -7


def test_change_work_frame_raises_on_failure():
    class Failing(FakeRobot):
        def rm_change_work_frame(self, name):
            return -2

    with pytest.raises(ArmError):
        _connected(Failing()).change_work_frame("cell")


def test_slow_stop_never_raises_even_when_the_link_is_gone():
    class Failing(FakeRobot):
        def rm_set_arm_slow_stop(self):
            raise OSError("gone")

    assert _connected(Failing()).slow_stop() == -1


def test_calling_a_disconnected_arm_is_an_arm_error():
    with pytest.raises(ArmError):
        RealManArm("10.0.0.1").start_velocity(frame_type=1, period_ms=10)


def test_disconnect_releases_the_handle_and_is_repeatable():
    robot = FakeRobot()
    arm = _connected(robot)
    arm.disconnect()
    assert robot.deleted and robot.destroyed
    assert arm.connected is False
    arm.disconnect()


def test_mock_arm_refuses_velocity_before_streaming_starts():
    arm = MockArm()
    arm.connect()
    assert arm.send_velocity((0.01,) + (0.0,) * 5, follow=False) == -1
    arm.start_velocity(frame_type=1, period_ms=10)
    assert arm.send_velocity((0.01,) + (0.0,) * 5, follow=False) == 0


def test_mock_arm_lags_the_command_and_falls_short_of_it():
    arm = MockArm(gain=0.8, tau_sec=0.02, dead_time_sec=0.0)
    arm.connect()
    arm.start_velocity(frame_type=1, period_ms=10)
    start = arm.read_state().pose
    for _ in range(60):
        arm.send_velocity((0.02, 0.0, 0.0, 0.0, 0.0, 0.0), follow=False)
        time.sleep(0.005)
    arm.read_state()
    moved = arm.read_state().pose[0] - start[0]
    # It moved, in the commanded direction, but less than the command integral.
    assert 0.0 < moved < 0.02 * 0.35


def test_mock_arm_stops_on_slow_stop():
    arm = MockArm(tau_sec=0.01, dead_time_sec=0.0)
    arm.connect()
    arm.start_velocity(frame_type=1, period_ms=10)
    arm.send_velocity((0.02, 0.0, 0.0, 0.0, 0.0, 0.0), follow=False)
    time.sleep(0.02)
    arm.read_state()
    arm.slow_stop()
    time.sleep(0.02)
    before = arm.read_state().pose[0]
    time.sleep(0.05)
    assert arm.read_state().pose[0] == pytest.approx(before, abs=1e-6)


def test_open_arm_returns_a_connected_mock_without_the_sdk():
    arm = open_arm("10.0.0.1", 8080, mock=True, mock_options={"gain": 0.5})
    assert arm.connected and arm.gain == 0.5


def test_the_stamp_describes_the_read_not_the_wait_for_the_lock():
    # The regression behind the first real-arm run: the control loop holds the
    # handle lock while it streams, and the sampler used to stamp the moment it
    # *wanted* to read. Every velocity then divided a real displacement by an
    # interval that was off by however long the lock was held.
    import threading

    robot = FakeRobot()
    arm = _connected(robot)
    held = threading.Event()
    release = threading.Event()

    def hold_the_lock():
        with arm._lock:
            held.set()
            release.wait(1.0)

    holder = threading.Thread(target=hold_the_lock)
    holder.start()
    held.wait(1.0)
    wanted_at = time.perf_counter()
    timer = threading.Timer(0.05, release.set)
    timer.start()
    state = arm.read_state()
    holder.join()
    # The read could not happen until the lock was released 50 ms later.
    assert state.ok
    assert state.stamp - wanted_at >= 0.04


def test_read_duration_covers_only_the_controller_round_trip():
    class Slow(FakeRobot):
        def rm_get_joint_degree(self):
            time.sleep(0.02)
            return super().rm_get_joint_degree()

    state = _connected(Slow()).read_state()
    assert state.ok
    assert 0.015 <= state.read_duration_sec < 0.2


def test_a_disconnected_arm_reads_as_a_failed_sample_not_an_exception():
    assert RealManArm("10.0.0.1").read_state().ok is False
