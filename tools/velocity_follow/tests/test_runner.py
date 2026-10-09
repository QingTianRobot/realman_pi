"""Unit tests for velocity_follow.runner."""

from __future__ import annotations

import math
import time

import pytest

from velocity_follow.arm import ArmState, MockArm
from velocity_follow.key_bindings import KeyBinding
from velocity_follow.profiles import ProfileRunner, Segment
from velocity_follow.runner import (
    PoseVelocitySampler,
    RunSettings,
    VelocityFollowRun,
)
from velocity_follow.samples import CsvRecorder, load_samples
from velocity_follow.terminal_keyboard import KeyHoldTracker


SAMPLE_DT = 0.01


class ScriptedArm:
    """Replays a fixed pose sequence and records what was sent to it.

    Stamps advance by a fixed step from zero rather than from the wall clock, so
    a differencing test asserts on arithmetic instead of on how long the machine
    has been up.
    """

    def __init__(self, poses=None, status=0, sample_dt=SAMPLE_DT):
        self.poses = list(poses or [])
        self.status = status
        self.sample_dt = sample_dt
        self.sent = []
        self.stopped = 0
        self._index = 0

    def _stamp(self):
        return self._index * self.sample_dt

    def read_state(self):
        stamp = self._stamp()
        if not self.poses:
            self._index += 1
            return ArmState(stamp, (), (), False)
        pose = self.poses[min(self._index, len(self.poses) - 1)]
        self._index += 1
        if pose is None:
            return ArmState(stamp, (), (), False)
        return ArmState(stamp, (0.0,) * 6, tuple(pose), True)

    def send_velocity(self, velocity, *, follow, trajectory_mode=0, radio=0):
        self.sent.append(tuple(velocity))
        return self.status

    def slow_stop(self):
        self.stopped += 1
        return 0

    def disconnect(self):
        pass


class FakeReader:
    """Feeds a scripted key stream into the loop, one batch per tick."""

    def __init__(self, batches):
        self.batches = list(batches)

    def read_pending(self):
        return list(self.batches.pop(0)) if self.batches else []


def _settings(**overrides):
    defaults = {
        "control_period_ms": 5,
        "sample_hz": 200.0,
        "max_run_sec": 5.0,
        "execute": True,
        "status_line": False,
    }
    defaults.update(overrides)
    return RunSettings(**defaults)


def _tracker():
    return KeyHoldTracker(
        {"w": KeyBinding("vx", 1.0), "s": KeyBinding("vx", -1.0)},
        hold_timeout_sec=10.0,
        linear_speed_mps=0.02,
        angular_speed_radps=0.10,
    )


# ------------------------------------------------------------------ sampler


def _ramp(count, step_m=0.0002, axis=0, start=0.0):
    """Poses advancing by a fixed step each SAMPLE_DT: a constant velocity."""
    poses = []
    for index in range(count):
        pose = [0.0] * 6
        pose[axis] = start + index * step_m
        poses.append(pose)
    return poses


def test_sampler_fits_a_constant_velocity_from_a_pose_ramp():
    # 0.2 mm every 10 ms is 0.02 m/s.
    sampler = PoseVelocitySampler(ScriptedArm(_ramp(20)), rate_hz=100.0, window_sec=0.1)
    for _ in range(20):
        sampler._sample_once()
    velocity, valid, _age = sampler.latest(19 * SAMPLE_DT)
    assert valid
    assert velocity[0] == pytest.approx(0.02)
    assert velocity[1:] == pytest.approx((0.0,) * 5, abs=1e-12)


def test_sampler_needs_enough_of_a_window_before_it_reports():
    # Two samples 10 ms apart span far less than a 100 ms window; a slope from
    # them would carry all the quantisation and timing noise the fit exists for.
    sampler = PoseVelocitySampler(ScriptedArm(_ramp(2)), rate_hz=100.0, window_sec=0.1)
    sampler._sample_once()
    sampler._sample_once()
    assert sampler.latest(SAMPLE_DT)[1] is False


def test_the_window_suppresses_single_step_encoder_wobble():
    # A stationary arm whose reading flips by one encoder step every sample.
    # Two-sample differencing reports +-4 mm/s of motion that never happened;
    # the windowed fit must report essentially none.
    poses = [[0.00002 if index % 2 else -0.00002, 0, 0, 0, 0, 0] for index in range(30)]
    sampler = PoseVelocitySampler(ScriptedArm(poses), rate_hz=100.0, window_sec=0.1)
    worst = 0.0
    for index in range(30):
        sampler._sample_once()
        velocity, valid, _age = sampler.latest(index * SAMPLE_DT)
        if valid:
            worst = max(worst, abs(velocity[0]))
    assert worst < 0.0005


def test_the_window_forgets_samples_older_than_its_span():
    # Stand still, then move: once the window has slid past the standstill the
    # estimate must be the new speed, not an average with the old one.
    poses = [[0.0] * 6] * 20 + _ramp(20, start=0.0)
    sampler = PoseVelocitySampler(ScriptedArm(poses), rate_hz=100.0, window_sec=0.1)
    for _ in range(40):
        sampler._sample_once()
    velocity, valid, _age = sampler.latest(39 * SAMPLE_DT)
    assert valid
    assert velocity[0] == pytest.approx(0.02)


def test_sampler_marks_the_estimate_invalid_after_a_failed_read():
    arm = ScriptedArm([[0.0] * 6, None])
    sampler = PoseVelocitySampler(arm, rate_hz=100.0)
    sampler._sample_once()
    sampler._sample_once()
    assert sampler.read_failures == 1
    assert sampler.latest(SAMPLE_DT)[1] is False


def test_sampler_restarts_the_fit_after_a_long_gap():
    # A stalled link can hand back poses seconds apart; fitting across the
    # stall would invent a velocity that was never commanded.
    arm = ScriptedArm(_ramp(10) + [[1.0, 0, 0, 0, 0, 0]], sample_dt=SAMPLE_DT)
    sampler = PoseVelocitySampler(arm, rate_hz=100.0, window_sec=0.1, max_gap_sec=0.5)
    for _ in range(10):
        sampler._sample_once()
    assert sampler.latest(9 * SAMPLE_DT)[1] is True
    arm.sample_dt = 10.0  # the next read lands long after the previous one
    sampler._sample_once()
    assert sampler.latest(100.0)[1] is False


def test_sampler_unwraps_a_rotation_through_pi():
    # A steady +2 rad/s about z that crosses +pi part way through the window.
    # Without unwrapping, the fit would see a 2*pi step and report a violent
    # spin in the wrong direction.
    poses = []
    angle = math.pi - 0.09
    for _ in range(20):
        wrapped = (angle + math.pi) % (2.0 * math.pi) - math.pi
        poses.append([0.0, 0.0, 0.0, 0.0, 0.0, wrapped])
        angle += 0.02
    sampler = PoseVelocitySampler(ScriptedArm(poses), rate_hz=100.0, window_sec=0.1)
    for _ in range(20):
        sampler._sample_once()
    velocity, valid, _age = sampler.latest(19 * SAMPLE_DT)
    assert valid
    assert velocity[5] == pytest.approx(2.0)


def test_sampler_reports_net_displacement_between_first_and_last_pose():
    arm = ScriptedArm([[0.0] * 6, [0.01, 0.0, 0.0, 0.0, 0.0, 0.0]])
    sampler = PoseVelocitySampler(arm, rate_hz=100.0)
    sampler._sample_once()
    sampler._sample_once()
    assert sampler.displacement == pytest.approx((0.01, 0.0, 0.0))


def test_sampler_has_no_displacement_before_any_successful_read():
    assert PoseVelocitySampler(ScriptedArm(), rate_hz=100.0).displacement is None


def test_sampler_rejects_a_non_positive_rate():
    with pytest.raises(ValueError):
        PoseVelocitySampler(ScriptedArm(), rate_hz=0.0)


def test_sampler_thread_starts_and_stops_cleanly():
    arm = MockArm(tau_sec=0.01, dead_time_sec=0.0)
    arm.connect()
    sampler = PoseVelocitySampler(arm, rate_hz=200.0)
    sampler.start()
    time.sleep(0.05)
    sampler.stop()
    assert len(sampler.sample_times) > 1


# --------------------------------------------------------------------- loop


def test_a_run_needs_either_keys_or_a_profile(tmp_path):
    with pytest.raises(ValueError):
        VelocityFollowRun(ScriptedArm(), CsvRecorder(tmp_path / "r.csv"), _settings())


def test_a_profile_run_records_a_row_per_tick_and_stops_at_the_end(tmp_path):
    arm = ScriptedArm([[0.0] * 6] * 500)
    path = tmp_path / "run.csv"
    recorder = CsvRecorder(path)
    profile = ProfileRunner((Segment("vx", "hold", 0.02, 0.2, label="hold"),))
    sampler = PoseVelocitySampler(arm, rate_hz=200.0)
    outcome = VelocityFollowRun(
        arm, recorder, _settings(), profile=profile
    ).execute(sampler)
    recorder.close()
    assert outcome.stop_reason == "profile completed"
    samples = load_samples(path)
    assert len(samples) == outcome.sample_count > 10
    assert all(sample.segment in ("hold", "done") for sample in samples)


def test_a_keyboard_run_moves_on_a_press_and_quits_on_q(tmp_path):
    arm = ScriptedArm([[0.0] * 6] * 500)
    recorder = CsvRecorder(tmp_path / "run.csv")
    keys = _tracker()
    reader = FakeReader([["w"], [], [], [], [], ["\x1b"]])
    sampler = PoseVelocitySampler(arm, rate_hz=200.0)
    outcome = VelocityFollowRun(
        arm, recorder, _settings(), keys=keys, reader=reader
    ).execute(sampler)
    recorder.close()
    assert outcome.stop_reason == "operator pressed quit"
    assert any(vector[0] > 0.0 for vector in arm.sent)


def test_the_acceleration_limit_shapes_what_reaches_the_arm(tmp_path):
    arm = ScriptedArm([[0.0] * 6] * 500)
    recorder = CsvRecorder(tmp_path / "run.csv")
    keys = _tracker()
    keys.press("w", time.perf_counter())
    reader = FakeReader([])
    profile = None
    settings = _settings(max_linear_accel_mps2=0.10, max_run_sec=0.05)
    sampler = PoseVelocitySampler(arm, rate_hz=200.0)
    VelocityFollowRun(
        arm, recorder, settings, keys=keys, reader=reader, profile=profile
    ).execute(sampler)
    recorder.close()
    # The first command out of standstill must be a ramp step, not the full key
    # speed: 0.10 m/s^2 over a 5 ms tick is 0.5 mm/s.
    assert arm.sent[0][0] == pytest.approx(0.0005, abs=2.0e-4)
    assert arm.sent[0][0] < 0.02


def test_a_dry_run_never_sends_anything_but_still_records(tmp_path):
    arm = ScriptedArm([[0.0] * 6] * 500)
    path = tmp_path / "run.csv"
    recorder = CsvRecorder(path)
    keys = _tracker()
    keys.press("w", time.perf_counter())
    sampler = PoseVelocitySampler(arm, rate_hz=200.0)
    outcome = VelocityFollowRun(
        arm, recorder, _settings(execute=False, max_run_sec=0.05),
        keys=keys, reader=FakeReader([]),
    ).execute(sampler)
    recorder.close()
    assert arm.sent == []
    assert arm.stopped == 0
    assert outcome.sample_count > 0
    assert load_samples(path)[0].commanded[0] == pytest.approx(0.02)


def test_the_arm_is_always_stopped_when_an_executing_run_ends(tmp_path):
    arm = ScriptedArm([[0.0] * 6] * 500)
    recorder = CsvRecorder(tmp_path / "run.csv")
    keys = _tracker()
    keys.press("w", time.perf_counter())
    sampler = PoseVelocitySampler(arm, rate_hz=200.0)
    VelocityFollowRun(
        arm, recorder, _settings(max_run_sec=0.02), keys=keys, reader=FakeReader([])
    ).execute(sampler)
    recorder.close()
    assert arm.stopped == 1
    # The last commands must be zeros so the arm is not left coasting.
    assert arm.sent[-1] == (0.0,) * 6


def test_rejected_commands_are_counted_and_not_integrated(tmp_path):
    arm = ScriptedArm([[0.0] * 6] * 500, status=-1)
    recorder = CsvRecorder(tmp_path / "run.csv")
    keys = _tracker()
    keys.press("w", time.perf_counter())
    sampler = PoseVelocitySampler(arm, rate_hz=200.0)
    outcome = VelocityFollowRun(
        arm, recorder, _settings(max_run_sec=0.05), keys=keys, reader=FakeReader([])
    ).execute(sampler)
    recorder.close()
    assert outcome.send_failures > 0
    # Nothing was accepted, so the displacement check must not claim travel.
    assert outcome.commanded_integral == pytest.approx((0.0, 0.0, 0.0))


def test_a_max_run_time_stops_a_keyboard_run_that_is_never_quit(tmp_path):
    arm = ScriptedArm([[0.0] * 6] * 500)
    recorder = CsvRecorder(tmp_path / "run.csv")
    sampler = PoseVelocitySampler(arm, rate_hz=200.0)
    outcome = VelocityFollowRun(
        arm, recorder, _settings(max_run_sec=0.05), keys=_tracker(), reader=FakeReader([])
    ).execute(sampler)
    recorder.close()
    assert outcome.stop_reason == "max run time reached"


def test_the_loop_holds_its_period_within_a_few_milliseconds(tmp_path):
    arm = ScriptedArm([[0.0] * 6] * 5000)
    recorder = CsvRecorder(tmp_path / "run.csv")
    sampler = PoseVelocitySampler(arm, rate_hz=200.0)
    outcome = VelocityFollowRun(
        arm, recorder, _settings(control_period_ms=10, max_run_sec=0.5),
        keys=_tracker(), reader=FakeReader([]),
    ).execute(sampler)
    recorder.close()
    # ~50 ticks in 0.5 s at 10 ms. Python timing is not hard real time, so allow
    # generous slack; the point is that it is not 10x off.
    assert 35 <= outcome.sample_count <= 65


# -------------------------------------------------------------- noise floor


def _noise(stdev_mps):
    from velocity_follow.runner import NoiseFloor

    return NoiseFloor(
        samples=100,
        mean=(0.0,) * 6,
        stdev=(stdev_mps,) * 3 + (stdev_mps * 5,) * 3,
        duration_sec=1.0,
    )


def test_noise_floor_reports_the_worst_linear_and_angular_spread():
    floor = _noise(0.0015)
    assert floor.linear_stdev_mps == pytest.approx(0.0015)
    assert floor.angular_stdev_radps == pytest.approx(0.0075)


def test_noise_floor_calls_a_value_significant_only_above_three_sigma():
    floor = _noise(0.001)
    assert floor.is_significant(0, 0.004) is True
    assert floor.is_significant(0, 0.002) is False
    # A named sigma overrides the default.
    assert floor.is_significant(0, 0.002, sigma=1.0) is True


def test_noise_floor_believes_everything_when_it_has_too_few_samples():
    from velocity_follow.runner import NoiseFloor

    thin = NoiseFloor(samples=3, mean=(0.0,) * 6, stdev=(0.01,) * 6, duration_sec=0.1)
    # Better to report a possible drift than to hide it behind a guess.
    assert thin.is_significant(0, 0.0001) is True


def test_measure_noise_floor_reports_a_stationary_arm_as_nearly_still():
    from velocity_follow.runner import measure_noise_floor

    class Jittering:
        """A stationary arm whose pose wobbles by one encoder step."""

        def __init__(self):
            self._index = 0

        def read_state(self):
            self._index += 1
            offset = 0.00002 if self._index % 2 else -0.00002
            return ArmState(self._index * 0.01, (0.0,) * 6, (offset, 0, 0, 0, 0, 0), True)

    sampler = PoseVelocitySampler(Jittering(), rate_hz=200.0, window_sec=0.1)
    sampler.start()
    floor = measure_noise_floor(sampler, 0.3)
    sampler.stop()
    assert floor is not None
    assert floor.samples > 5
    # The wobble is +-0.02 mm, which two-sample differencing reads as +-4 mm/s.
    # The windowed fit reports the arm as what it is: standing still.
    assert floor.linear_stdev_mps < 0.0005


def test_measure_noise_floor_returns_nothing_when_asked_for_no_time():
    from velocity_follow.runner import measure_noise_floor

    assert measure_noise_floor(PoseVelocitySampler(ScriptedArm(), rate_hz=100.0), 0.0) is None


def test_measure_noise_floor_returns_nothing_without_valid_samples():
    from velocity_follow.runner import measure_noise_floor

    sampler = PoseVelocitySampler(ScriptedArm([None]), rate_hz=200.0)
    sampler.start()
    floor = measure_noise_floor(sampler, 0.1)
    sampler.stop()
    assert floor is None
