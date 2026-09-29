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
    def __init__(self, solution=(0.0, 0.1, 0.2, 0.3, 0.4, 0.5), current=(0.0,) * 6):
        self.solution = list(solution) if solution is not None else None
        self.current = list(current) if current is not None else None
        self.movej_calls = []
        self.canfd_calls = []
        self.ik_calls = []
        self.state_reads = 0
        self.slow_stop_calls = 0
        self.canfd_status = 0

    def get_state(self):
        self.state_reads += 1
        if self.current is None:
            return SimpleNamespace(joint_degrees=[], error_code=-1)
        return SimpleNamespace(joint_degrees=list(self.current), error_code=0)

    def inverse_kinematics(self, current, pose_euler):
        self.ik_calls.append((list(current), list(pose_euler)))
        if self.solution is None:
            return 1, []
        return 0, list(self.solution)

    def movej(self, joint_degrees, velocity_percent, blend_radius_percent, connect):
        self.movej_calls.append((list(joint_degrees), velocity_percent, blend_radius_percent, connect))
        return 0

    def movej_canfd(self, joint_degrees, follow, trajectory_mode, radio):
        self.canfd_calls.append((list(joint_degrees), follow, trajectory_mode, radio))
        return self.canfd_status

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
        velocity_percent=0,
        blend_radius_percent=0,
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
    assert adapter.ik_calls
    # Streamed by passthrough, which executes immediately. rm_movej with
    # connect=1 was used before and never executed anything.
    assert adapter.movej_calls == []
    assert adapter.canfd_calls[-1][0] == pytest.approx([0.0, 0.1, 0.2, 0.3, 0.4, 0.5])
    assert adapter.canfd_calls[-1][1:] == (True, 0, 0)
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


def _session(adapter, clock, speed_dps=30.0):
    from dataclasses import replace

    return CartesianPoseSession(
        arm_id="l",
        adapter=adapter,
        ownership=ArmOwnership(),
        settings=replace(settings(), pose_max_joint_speed_dps=speed_dps),
        active_frame={ReferenceType.BASE: ("base", "l/base_link")},
        monotonic=clock,
        ros_time_now_ns=RosClock(),
    )


def test_each_passthrough_step_is_limited_by_the_joint_speed():
    # Passthrough does no planning: a far IK solution must be approached at
    # pose_max_joint_speed_dps, not jumped to in one tick.
    clock = Clock()
    adapter = Adapter(solution=(10.0, -10.0, 0.2, 0.0, 0.0, 0.0))
    session = _session(adapter, clock, speed_dps=30.0)
    assert session.start(goal())
    assert session.accept_command(pose())
    for _ in range(3):
        clock.advance(0.02)
        assert session.tick() is None
    steps = [call[0] for call in adapter.canfd_calls]
    # 30 deg/s x 20 ms = 0.6 deg per tick per joint.
    assert steps[0][:3] == pytest.approx([0.6, -0.6, 0.2])
    assert steps[2][:2] == pytest.approx([1.8, -1.8])
    session.cancel()


def test_a_stalled_tick_cannot_become_one_large_step():
    clock = Clock()
    adapter = Adapter(solution=(10.0, 0.0, 0.0, 0.0, 0.0, 0.0))
    session = _session(adapter, clock, speed_dps=30.0)
    assert session.start(goal())
    assert session.accept_command(pose())
    clock.advance(0.09)  # inside the 100 ms watchdog, but 4.5 periods late
    session.accept_command(pose(stamp_ns=1_050_000_000))
    assert session.tick() is None
    # Capped at two periods: 30 deg/s x 40 ms.
    assert adapter.canfd_calls[-1][0][0] == pytest.approx(1.2)
    session.cancel()


def test_the_first_step_starts_from_the_arm_actual_joints():
    clock = Clock()
    adapter = Adapter(solution=(12.0, 25.0, 73.0, -16.0, 80.0, 14.0), current=(12.0, 25.0, 73.0, -16.0, 80.0, 14.0))
    session = _session(adapter, clock)
    assert session.start(goal())
    assert session.accept_command(pose())
    clock.advance(0.02)
    assert session.tick() is None
    assert adapter.canfd_calls[-1][0] == pytest.approx([12.0, 25.0, 73.0, -16.0, 80.0, 14.0])
    # IK is seeded from the command, not from a fresh joint read every tick.
    assert adapter.ik_calls[-1][0] == pytest.approx([12.0, 25.0, 73.0, -16.0, 80.0, 14.0])
    assert adapter.state_reads == 1
    session.cancel()


def test_a_session_cannot_start_without_the_current_joints():
    adapter = Adapter(current=None)
    session = _session(adapter, Clock())
    assert session.start(goal()) is False
    assert "current joint state" in session.result.message


def test_ik_failure_holds_the_last_joint_target():
    clock = Clock()
    adapter = Adapter(solution=(5.0, 0.0, 0.0, 0.0, 0.0, 0.0))
    session = _session(adapter, clock)
    assert session.start(goal())
    assert session.accept_command(pose())
    clock.advance(0.02)
    session.tick()
    held = adapter.canfd_calls[-1][0]
    adapter.solution = None
    session.accept_command(pose(stamp_ns=1_020_000_000))
    clock.advance(0.02)
    assert session.tick() is None
    assert adapter.canfd_calls[-1][0] == pytest.approx(held)
    session.cancel()


def test_a_rejected_passthrough_command_aborts_the_session():
    clock = Clock()
    adapter = Adapter()
    adapter.canfd_status = 1
    session = _session(adapter, clock)
    assert session.start(goal())
    assert session.accept_command(pose())
    clock.advance(0.02)
    result = session.tick()
    assert result is not None
    assert result.terminal_state == PoseTerminalState.ABORTED
    assert adapter.slow_stop_calls == 1


def test_step_towards_clamps_each_joint_independently():
    from realman_robot_driver.cartesian_pose_session import step_towards

    assert step_towards([0, 0, 0], [5, -0.1, -5], 1.0) == pytest.approx([1.0, -0.1, -1.0])
    assert step_towards([0, 0], [5, 5], 0.0) == pytest.approx([0.0, 0.0])
