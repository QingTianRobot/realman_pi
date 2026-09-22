from types import SimpleNamespace

import pytest

from realman_robot_driver.cartesian_pose_session import (
    CartesianPoseSession,
    PoseTerminalState,
)
from realman_robot_driver.motion_coordinator import ArmOwnership
from realman_robot_driver.motion_types import MotionSettings, ReferenceType


class Clock:
    def __init__(self):
        self.value = 0.0

    def __call__(self):
        return self.value

    def advance(self, seconds):
        self.value += seconds


class RosClock:
    def __init__(self, value_ns=1_000_000_000):
        self.value_ns = value_ns

    def __call__(self):
        return self.value_ns


class Adapter:
    def __init__(self):
        self.pose_calls = []
        self.slow_stop_calls = 0

    def movep(self, pose, follow, trajectory_mode, radio):
        self.pose_calls.append((list(pose), follow, trajectory_mode, radio))
        return 0

    def slow_stop(self):
        self.slow_stop_calls += 1
        return 0


def settings():
    return MotionSettings(
        default_timeout_sec=10.0,
        max_linear_speed_mps=1.0,
        max_angular_speed_radps=2.0,
        velocity_control_period_ms=20,
        velocity_watchdog_ms=100,
        max_linear_accel_mps2=10.0,
        max_angular_accel_radps2=20.0,
        joint_goal_tolerance_deg=0.25,
        stop_timeout_sec=1.0,
    )


def pose(frame="l/base_link", position=(0.0, 0.0, 0.0), quaternion=(1.0, 0.0, 0.0, 0.0), stamp_ns=1_000_000_000):
    return SimpleNamespace(
        header=SimpleNamespace(
            frame_id=frame,
            stamp=SimpleNamespace(sec=stamp_ns // 1_000_000_000, nanosec=stamp_ns % 1_000_000_000),
        ),
        pose=SimpleNamespace(
            position=SimpleNamespace(x=position[0], y=position[1], z=position[2]),
            orientation=SimpleNamespace(x=quaternion[1], y=quaternion[2], z=quaternion[3], w=quaternion[0]),
        ),
    )


def goal(**changes):
    value = dict(
        reference_type=int(ReferenceType.BASE),
        reference_name="base",
        control_period_ms=20,
        watchdog_ms=100,
        max_linear_speed_mps=1.0,
        max_angular_speed_radps=2.0,
        max_linear_accel_mps2=10.0,
        max_angular_accel_radps2=20.0,
        follow=True,
        trajectory_mode=0,
        radio=0,
    )
    value.update(changes)
    return SimpleNamespace(**value)


def test_pose_session_forwards_new_base_frame_command():
    clock = Clock()
    ros_clock = RosClock()
    adapter = Adapter()
    session = CartesianPoseSession(
        arm_id="l",
        adapter=adapter,
        ownership=ArmOwnership(),
        settings=settings(),
        active_frame={ReferenceType.BASE: ("base", "l/base_link")},
        monotonic=clock,
        ros_time_now_ns=ros_clock,
    )

    assert session.start(goal())
    assert session.accept_command(pose(position=(0.01, 0.0, 0.0)))
    clock.advance(0.02)
    assert session.tick() is None
    assert adapter.pose_calls[-1][0][:3] == pytest.approx([0.01, 0.0, 0.0])
    session.cancel()


def test_pose_session_rejects_wrong_frame_and_watchdog_stops():
    clock = Clock()
    ros_clock = RosClock()
    adapter = Adapter()
    session = CartesianPoseSession(
        arm_id="l",
        adapter=adapter,
        ownership=ArmOwnership(),
        settings=settings(),
        active_frame={ReferenceType.BASE: ("base", "l/base_link")},
        monotonic=clock,
        ros_time_now_ns=ros_clock,
    )
    assert session.start(goal())
    with pytest.raises(ValueError, match="frame_id"):
        session.accept_command(pose(frame="r/base_link"))
    clock.advance(0.11)
    result = session.tick()
    assert result is not None
    assert result.terminal_state == PoseTerminalState.WATCHDOG_STOP
    assert adapter.slow_stop_calls == 1


def test_pose_session_rejects_stale_and_non_unit_quaternion():
    ros_clock = RosClock()
    session = CartesianPoseSession(
        arm_id="l",
        adapter=Adapter(),
        ownership=ArmOwnership(),
        settings=settings(),
        active_frame={ReferenceType.BASE: ("base", "l/base_link")},
        monotonic=Clock(),
        ros_time_now_ns=ros_clock,
    )
    assert session.start(goal())
    with pytest.raises(ValueError, match="unit quaternion"):
        session.accept_command(pose(quaternion=(2.0, 0.0, 0.0, 0.0)))
    assert session.accept_command(pose(stamp_ns=1_000_000_000))
    with pytest.raises(ValueError, match="newer"):
        session.accept_command(pose(stamp_ns=1_000_000_000))
