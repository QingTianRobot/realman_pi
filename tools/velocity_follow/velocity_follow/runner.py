"""The fixed-period control loop that drives the arm and records the result.

Two threads share the arm handle:

* the **control loop** runs on the caller's thread at ``control_period_ms``,
  reads the keyboard, shapes the command and sends one ``rm_movev_canfd``;
* the **sampler** runs at its own rate and reads joints plus forward kinematics,
  so a slow state round trip can never stretch the command period.

Sampling independently is the main reason this tool can see things the ROS path
could not: the driver's telemetry was capped at its 10 Hz state timer, while the
sampler here runs as fast as the controller will answer.
"""

from __future__ import annotations

from dataclasses import dataclass, field
import math
import threading
import time
from typing import Any, Callable, Sequence

from .axes import ZERO_COMMAND
from .limits import shape_command
from .profiles import ProfileRunner
from .samples import CsvRecorder, Sample
from .terminal_keyboard import KeyHoldTracker, RawTerminalReader, is_quit


@dataclass(frozen=True)
class NoiseFloor:
    """Per-axis spread of the measurement while the arm is standing still.

    Pose differencing turns joint-encoder quantisation into apparent velocity.
    On a stationary RM65 at a 20 ms difference interval this is around 1 mm/s
    per axis, which is 5% of a 0.02 m/s key press, so a raw measured trace looks
    ragged even when nothing is wrong. It is zero-mean, so averaging removes it:
    gain, bias and the displacement check are unaffected. What it does bound is
    how small a genuine cross-axis drift can be and still be believed.
    """

    samples: int
    mean: tuple[float, ...]
    stdev: tuple[float, ...]
    duration_sec: float

    @property
    def linear_stdev_mps(self) -> float:
        return max(self.stdev[:3]) if self.stdev else 0.0

    @property
    def angular_stdev_radps(self) -> float:
        return max(self.stdev[3:]) if self.stdev else 0.0

    def is_significant(self, axis_index: int, value: float, *, sigma: float = 3.0) -> bool:
        """Report whether a measured value stands out from the noise."""
        if not self.stdev or self.samples < 8:
            return True
        return abs(value) > sigma * self.stdev[axis_index]


def measure_noise_floor(
    sampler: "PoseVelocitySampler", duration_sec: float
) -> NoiseFloor | None:
    """Watch the stationary arm for a moment to learn the measurement spread."""
    if duration_sec <= 0.0:
        return None
    collected: list[tuple[float, ...]] = []
    deadline = time.perf_counter() + duration_sec
    seen: set[float] = set()
    while time.perf_counter() < deadline:
        now = time.perf_counter()
        velocity, valid, age = sampler.latest(now)
        if valid:
            key = round(now - age, 6)
            if key not in seen:
                seen.add(key)
                collected.append(velocity)
        time.sleep(0.005)
    if len(collected) < 2:
        return None
    means = tuple(
        sum(sample[index] for sample in collected) / len(collected) for index in range(6)
    )
    stdevs = tuple(
        math.sqrt(
            sum((sample[index] - means[index]) ** 2 for sample in collected)
            / (len(collected) - 1)
        )
        for index in range(6)
    )
    return NoiseFloor(len(collected), means, stdevs, duration_sec)



def _wrap_angle(angle: float) -> float:
    return (angle + math.pi) % (2.0 * math.pi) - math.pi


@dataclass
class RunSettings:
    """Everything the loop needs, already validated by the caller."""

    control_period_ms: int = 10
    sample_hz: float = 100.0
    max_linear_speed_mps: float = 0.05
    max_angular_speed_radps: float = 0.25
    max_linear_accel_mps2: float = 0.10
    max_angular_accel_radps2: float = 0.50
    follow: bool = False
    trajectory_mode: int = 0
    radio: int = 0
    frame_type: int = 1
    work_frame: str = ""
    avoid_singularity: int = 1
    max_run_sec: float = 300.0
    execute: bool = False
    status_line: bool = True

    @property
    def period_sec(self) -> float:
        return self.control_period_ms / 1000.0


class PoseVelocitySampler:
    """Background thread turning pose samples into a measured twist.

    The estimate is the least-squares slope of pose against time over a sliding
    window, not a difference of two consecutive samples. Two things make the
    two-sample version unusable on real hardware: joint-encoder quantisation
    shows up as roughly 1 mm/s of apparent speed at a 20 ms interval, and each
    controller round trip takes about as long as the interval itself, so a
    single interval carries large timing uncertainty. Fitting over ~100 ms
    averages both down, at the cost of blurring changes faster than the window.
    The window is reported alongside the results so that trade is visible.

    Angular values are Euler-rate, not body angular velocity, so they only
    compare with the command for small rotations about one axis; the report
    states this rather than hiding it.
    """

    def __init__(
        self,
        arm: Any,
        *,
        rate_hz: float,
        window_sec: float = 0.1,
        max_gap_sec: float = 0.5,
    ) -> None:
        if rate_hz <= 0.0:
            raise ValueError("rate_hz must be positive")
        if window_sec <= 0.0:
            raise ValueError("window_sec must be positive")
        self.arm = arm
        self.period_sec = 1.0 / rate_hz
        self.window_sec = float(window_sec)
        self.max_gap_sec = float(max_gap_sec)
        self._lock = threading.Lock()
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None
        self._window: list[tuple[float, tuple[float, ...]]] = []
        self._unwrapped: tuple[float, ...] | None = None
        self._velocity: tuple[float, ...] = ZERO_COMMAND
        self._valid = False
        self._stamp: float = 0.0
        self._latest_pose: tuple[float, ...] | None = None
        self._first_pose: tuple[float, ...] | None = None
        self._sample_times: list[float] = []
        self._read_durations: list[float] = []
        self.read_failures = 0

    def start(self) -> None:
        self._thread = threading.Thread(target=self._run, name="pose-sampler", daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._stop.set()
        if self._thread is not None:
            self._thread.join(timeout=2.0)

    def _run(self) -> None:
        deadline = time.perf_counter()
        while not self._stop.is_set():
            self._sample_once()
            deadline += self.period_sec
            remaining = deadline - time.perf_counter()
            if remaining > 0.0:
                self._stop.wait(remaining)
            else:
                # The controller answered slower than the requested rate; resync
                # instead of spinning to catch up.
                deadline = time.perf_counter()

    def _reset_locked(self) -> None:
        self._window.clear()
        self._unwrapped = None
        self._valid = False

    def _sample_once(self) -> None:
        state = self.arm.read_state()
        if not state.ok or len(state.pose) != 6:
            with self._lock:
                self.read_failures += 1
                self._reset_locked()
            return
        pose = tuple(state.pose)
        with self._lock:
            self._sample_times.append(state.stamp)
            self._read_durations.append(state.read_duration_sec)
            self._latest_pose = pose
            if self._first_pose is None:
                self._first_pose = pose

            if self._window and state.stamp - self._window[-1][0] > self.max_gap_sec:
                # A stalled link would otherwise fit a slope across the stall.
                self._reset_locked()

            # Unwrap the Euler angles incrementally so a pass through +-pi does
            # not put a spurious 2*pi step into the fit.
            if self._unwrapped is None:
                unwrapped = pose
            else:
                unwrapped = tuple(
                    pose[i] if i < 3
                    else self._unwrapped[i] + _wrap_angle(pose[i] - self._unwrapped[i])
                    for i in range(6)
                )
            self._unwrapped = unwrapped
            self._window.append((state.stamp, unwrapped))
            horizon = state.stamp - self.window_sec
            while len(self._window) > 2 and self._window[0][0] < horizon:
                self._window.pop(0)
            self._fit_locked(state.stamp)

    def _fit_locked(self, stamp: float) -> None:
        window = self._window
        if len(window) < 3:
            self._valid = False
            return
        span = window[-1][0] - window[0][0]
        if span < 0.4 * self.window_sec:
            self._valid = False
            return
        mean_t = sum(sample[0] for sample in window) / len(window)
        variance = sum((sample[0] - mean_t) ** 2 for sample in window)
        if variance <= 0.0:
            self._valid = False
            return
        velocity = []
        for axis in range(6):
            mean_value = sum(sample[1][axis] for sample in window) / len(window)
            covariance = sum(
                (sample[0] - mean_t) * (sample[1][axis] - mean_value) for sample in window
            )
            velocity.append(covariance / variance)
        self._velocity = tuple(velocity)
        self._valid = True
        self._stamp = stamp

    def latest(self, now: float) -> tuple[tuple[float, ...], bool, float]:
        """Return the measured twist, its validity and its age in seconds."""
        with self._lock:
            if not self._valid:
                return ZERO_COMMAND, False, 0.0
            return self._velocity, True, max(0.0, now - self._stamp)

    @property
    def displacement(self) -> tuple[float, float, float] | None:
        """Net translation between the first and last successful pose reads."""
        with self._lock:
            if self._first_pose is None or self._latest_pose is None:
                return None
            return tuple(self._latest_pose[i] - self._first_pose[i] for i in range(3))

    @property
    def sample_times(self) -> list[float]:
        with self._lock:
            return list(self._sample_times)

    @property
    def mean_read_ms(self) -> float:
        """Average controller round trip, which bounds the usable window."""
        with self._lock:
            if not self._read_durations:
                return 0.0
            return 1000.0 * sum(self._read_durations) / len(self._read_durations)


@dataclass
class RunOutcome:
    """What a finished run produced, for the caller to report on."""

    csv_path: Any
    sample_count: int
    commanded_integral: tuple[float, float, float]
    actual_displacement: tuple[float, float, float] | None
    sample_times: list[float] = field(default_factory=list)
    read_failures: int = 0
    send_failures: int = 0
    mean_read_ms: float = 0.0
    stop_reason: str = ""
    executed: bool = False


class VelocityFollowRun:
    """One measurement run against one arm."""

    def __init__(
        self,
        arm: Any,
        recorder: CsvRecorder,
        settings: RunSettings,
        *,
        keys: KeyHoldTracker | None = None,
        reader: RawTerminalReader | None = None,
        profile: ProfileRunner | None = None,
        on_status: Callable[[str], None] | None = None,
    ) -> None:
        if keys is None and profile is None:
            raise ValueError("a run needs either keyboard input or a profile")
        self.arm = arm
        self.recorder = recorder
        self.settings = settings
        self.keys = keys
        self.reader = reader
        self.profile = profile
        self.on_status = on_status
        self._limited: tuple[float, ...] = ZERO_COMMAND
        self._integral = [0.0, 0.0, 0.0]
        self._send_failures = 0
        self._quit = False
        self._stop_reason = ""

    # ---------------------------------------------------------------- input

    def _requested(self, now: float) -> tuple[float, ...]:
        if self.keys is not None:
            if self.reader is not None:
                for character in self.reader.read_pending():
                    if is_quit(character):
                        self._quit = True
                        self.keys.release_all()
                        return ZERO_COMMAND
                    self.keys.press(character, now)
            return self.keys.command_at(now)
        assert self.profile is not None
        return self.profile.command_at(now - self._started_at)

    def _segment(self) -> str:
        if self.profile is not None:
            return self.profile.label
        return "keyboard"

    # ----------------------------------------------------------------- loop

    def execute(self, sampler: PoseVelocitySampler) -> RunOutcome:
        """Run until the profile ends, the operator quits, or the cap is hit."""
        settings = self.settings
        period = settings.period_sec
        self._started_at = time.perf_counter()
        deadline = self._started_at
        # There is no previous interval on the first tick, so charge it the
        # nominal period: a near-zero dt would make the acceleration limit allow
        # a near-zero first step and stall the ramp for one cycle.
        last_tick: float | None = None
        count = 0
        try:
            while True:
                now = time.perf_counter()
                elapsed = now - self._started_at
                dt = period if last_tick is None else max(0.0, now - last_tick)
                last_tick = now

                requested = self._requested(now)
                clipped, limited = shape_command(
                    self._limited,
                    requested,
                    max_linear_speed_mps=settings.max_linear_speed_mps,
                    max_angular_speed_radps=settings.max_angular_speed_radps,
                    max_linear_accel_mps2=settings.max_linear_accel_mps2,
                    max_angular_accel_radps2=settings.max_angular_accel_radps2,
                    dt=dt if dt > 0.0 else period,
                )
                sent = self._send(limited)
                if sent:
                    self._limited = limited
                    for index in range(3):
                        self._integral[index] += limited[index] * dt

                measured, valid, age = sampler.latest(now)
                self.recorder.write(
                    Sample(
                        t_sec=elapsed,
                        segment=self._segment(),
                        segment_elapsed_sec=(
                            self.profile.segment_elapsed(elapsed)
                            if self.profile is not None
                            else elapsed
                        ),
                        commanded=requested,
                        accepted=clipped,
                        limited=limited,
                        measured=measured,
                        measured_valid=valid,
                        session_active=settings.execute,
                        command_age_ms=0,
                        measured_age_ms=int(age * 1000.0),
                        telemetry_age_sec=age,
                    )
                )
                count += 1
                if self.on_status is not None and count % 10 == 0:
                    self.on_status(self._status(limited, measured, valid, elapsed))

                if self._quit:
                    self._stop_reason = "operator pressed quit"
                    break
                if self.profile is not None and self.profile.finished:
                    self._stop_reason = "profile completed"
                    break
                if elapsed >= settings.max_run_sec:
                    self._stop_reason = "max run time reached"
                    break

                deadline += period
                remaining = deadline - time.perf_counter()
                if remaining > 0.0:
                    time.sleep(remaining)
                else:
                    # Fell behind: resync rather than burning through a backlog
                    # of ticks, which would send a burst of stale commands.
                    deadline = time.perf_counter()
        except KeyboardInterrupt:
            self._stop_reason = "interrupted"
        finally:
            self._stop_motion()

        return RunOutcome(
            csv_path=self.recorder.path,
            sample_count=count,
            commanded_integral=tuple(self._integral),
            actual_displacement=sampler.displacement,
            sample_times=sampler.sample_times,
            read_failures=sampler.read_failures,
            mean_read_ms=sampler.mean_read_ms,
            send_failures=self._send_failures,
            stop_reason=self._stop_reason or "finished",
            executed=settings.execute,
        )

    def _send(self, limited: Sequence[float]) -> bool:
        if not self.settings.execute:
            return False
        try:
            status = self.arm.send_velocity(
                limited,
                follow=self.settings.follow,
                trajectory_mode=self.settings.trajectory_mode,
                radio=self.settings.radio,
            )
        except Exception:
            self._send_failures += 1
            return False
        if status != 0:
            self._send_failures += 1
            return False
        return True

    def _stop_motion(self) -> None:
        """Always leave the arm stationary, whatever ended the run."""
        if not self.settings.execute:
            return
        for _ in range(3):
            try:
                self.arm.send_velocity(
                    ZERO_COMMAND,
                    follow=self.settings.follow,
                    trajectory_mode=self.settings.trajectory_mode,
                    radio=self.settings.radio,
                )
            except Exception:
                break
            time.sleep(self.settings.period_sec)
        try:
            self.arm.slow_stop()
        except Exception:
            pass

    def _status(
        self,
        limited: Sequence[float],
        measured: Sequence[float],
        valid: bool,
        elapsed: float,
    ) -> str:
        commanded_speed = math.hypot(*limited[:3])
        measured_speed = math.hypot(*measured[:3]) if valid else float("nan")
        ratio = (
            measured_speed / commanded_speed
            if valid and commanded_speed > 1.0e-6
            else float("nan")
        )
        axes = ",".join(self.keys.active_axes) if self.keys is not None else self._segment()
        return (
            f"t={elapsed:6.1f}s  keys[{axes:<12}]  "
            f"cmd={commanded_speed * 1000:6.1f} mm/s  "
            f"meas={measured_speed * 1000:6.1f} mm/s  "
            f"ratio={ratio:5.2f}"
        )


__all__ = [
    "NoiseFloor",
    "PoseVelocitySampler",
    "measure_noise_floor",
    "RunOutcome",
    "RunSettings",
    "VelocityFollowRun",
]
