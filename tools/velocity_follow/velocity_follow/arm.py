"""Direct RealMan Python SDK boundary, plus an offline stand-in.

This is the only module that knows the vendor API exists. Everything above it
works with plain numbers, so the control loop, the metrics and the tests run
without a robot, without ROS and without the SDK installed.

The SDK calls used here:

``rm_set_movev_canfd_init(avoid_singularity_flag, frame_type, dt)``
    Enters Cartesian velocity streaming. ``frame_type`` is 0 for the tool frame
    and 1 for the current work frame; ``dt`` is the streaming period in ms.
``rm_movev_canfd(velocity, follow, trajectory_mode, radio)``
    One velocity command, ``[vx, vy, vz, wx, wy, wz]`` in m/s and rad/s.
``rm_get_joint_degree()`` / ``rm_algo_forward_kinematics(joints, 1)``
    Joint feedback and the pose it implies, ``[x, y, z, rx, ry, rz]`` in m and rad.
"""

from __future__ import annotations

from dataclasses import dataclass
import math
import threading
import time
from typing import Any, Sequence


# rm_set_movev_canfd_init frame selectors.
FRAME_TOOL = 0
FRAME_WORK = 1
FRAME_TYPES = {"tool": FRAME_TOOL, "work": FRAME_WORK}


class ArmError(RuntimeError):
    """A vendor call failed or returned a non-zero status."""


@dataclass(frozen=True)
class ArmState:
    """One joint/pose reading and the moment it was taken.

    ``stamp`` is the midpoint of the controller round trip, not the moment the
    sampler decided to read. The two differ by however long the call waited for
    the handle lock the control loop also takes, which during streaming is tens
    of milliseconds. Timestamping the intent rather than the measurement made
    every velocity estimate divide a real displacement by a wrong interval.

    ``read_duration_sec`` is how long that round trip took, so a consumer can
    judge how much timing uncertainty the sample carries.
    """

    stamp: float
    joint_degrees: tuple[float, ...]
    pose: tuple[float, ...]
    ok: bool
    read_duration_sec: float = 0.0


def _status(value: Any) -> int:
    """Normalise a vendor return that may be an int or a (status, data) tuple."""
    if isinstance(value, tuple) and value:
        value = value[0]
    try:
        return int(value)
    except (TypeError, ValueError):
        return -1


class RealManArm:
    """One SDK handle for one arm, safe to call from two threads."""

    def __init__(
        self,
        ip: str,
        port: int = 8080,
        *,
        thread_mode: str = "RM_TRIPLE_MODE_E",
        connect_timeout_sec: float = 5.0,
    ) -> None:
        self.ip = ip
        self.port = int(port)
        self.thread_mode = thread_mode
        self.connect_timeout_sec = float(connect_timeout_sec)
        self._robot: Any = None
        self._handle: Any = None
        # The sampler thread reads state while the control loop writes velocity.
        # The vendor handle is not documented as re-entrant, so serialise it.
        self._lock = threading.Lock()

    @property
    def connected(self) -> bool:
        return self._robot is not None and self._handle is not None

    def connect(self) -> None:
        try:
            from Robotic_Arm.rm_robot_interface import RoboticArm, rm_thread_mode_e
        except ImportError as error:  # pragma: no cover - depends on the host
            raise ArmError(
                "the RealMan Python SDK is not importable; install Robotic_Arm or "
                "run with --mock to exercise everything except the robot"
            ) from error
        mode = getattr(rm_thread_mode_e, self.thread_mode, None)
        if mode is None:
            raise ArmError(f"unknown SDK thread mode {self.thread_mode!r}")
        robot = RoboticArm(mode)
        handle = robot.rm_create_robot_arm(self.ip, self.port)
        identifier = getattr(handle, "id", -1)
        if identifier is None or int(identifier) < 0:
            try:
                robot.rm_destroy()
            except Exception:
                pass
            raise ArmError(f"could not reach the controller at {self.ip}:{self.port}")
        self._robot = robot
        self._handle = handle

    def disconnect(self) -> None:
        robot, self._robot, self._handle = self._robot, None, None
        if robot is None:
            return
        for name in ("rm_delete_robot_arm", "rm_destroy"):
            try:
                getattr(robot, name)()
            except Exception:
                pass

    def _call(self, name: str, *args: Any) -> Any:
        if not self.connected:
            raise ArmError("the arm is not connected")
        method = getattr(self._robot, name, None)
        if method is None:
            raise ArmError(f"the installed SDK has no {name}")
        with self._lock:
            return method(*args)

    # ------------------------------------------------------------- feedback

    def read_state(self) -> ArmState:
        """Read joints and run FK, never raising into the sampler thread."""
        if not self.connected:
            return ArmState(time.perf_counter(), (), (), False)
        try:
            # Bracket only the controller round trip, and only inside the lock,
            # so the stamp describes when the joints were actually read.
            with self._lock:
                started = time.perf_counter()
                result = self._robot.rm_get_joint_degree()
                finished = time.perf_counter()
        except Exception:
            return ArmState(time.perf_counter(), (), (), False)
        stamp = 0.5 * (started + finished)
        duration = finished - started
        try:
            status, joints = result
        except (TypeError, ValueError):
            return ArmState(stamp, (), (), False, duration)
        if _status(status) != 0 or not joints:
            return ArmState(stamp, (), (), False, duration)
        degrees = tuple(float(value) for value in joints)
        # rm_algo_* is a local computation on those joints, so it adds no
        # controller latency and must not shift the stamp.
        try:
            pose = self._call("rm_algo_forward_kinematics", list(degrees), 1)
        except Exception:
            return ArmState(stamp, degrees, (), False, duration)
        try:
            values = tuple(float(value) for value in pose)
        except (TypeError, ValueError):
            return ArmState(stamp, degrees, (), False, duration)
        if len(values) != 6 or not all(math.isfinite(value) for value in values):
            return ArmState(stamp, degrees, (), False, duration)
        return ArmState(stamp, degrees, values, True, duration)

    # -------------------------------------------------------------- motion

    def change_work_frame(self, name: str) -> None:
        status = _status(self._call("rm_change_work_frame", name))
        if status != 0:
            raise ArmError(f"selecting work frame {name!r} failed with status {status}")

    def start_velocity(
        self, *, frame_type: int, period_ms: int, avoid_singularity: int = 1
    ) -> None:
        status = _status(
            self._call(
                "rm_set_movev_canfd_init", int(avoid_singularity), int(frame_type), int(period_ms)
            )
        )
        if status != 0:
            raise ArmError(f"entering Cartesian velocity mode failed with status {status}")

    def send_velocity(
        self,
        velocity: Sequence[float],
        *,
        follow: bool,
        trajectory_mode: int = 0,
        radio: int = 0,
    ) -> int:
        return _status(
            self._call(
                "rm_movev_canfd",
                [float(value) for value in velocity],
                bool(follow),
                int(trajectory_mode),
                int(radio),
            )
        )

    def slow_stop(self) -> int:
        try:
            return _status(self._call("rm_set_arm_slow_stop"))
        except Exception:
            return -1


class MockArm:
    """Offline stand-in: a first-order lag with a configurable dead time.

    It exists so the keyboard handling, the recording and the report can be
    exercised on a laptop, and so a regression in the control loop is caught
    without booking a robot. The defaults deliberately imitate an arm that is
    a little short and a little late.
    """

    def __init__(
        self,
        *,
        gain: float = 0.9,
        tau_sec: float = 0.10,
        dead_time_sec: float = 0.05,
        sample_jitter_sec: float = 0.0,
    ) -> None:
        self.gain = float(gain)
        self.tau_sec = float(tau_sec)
        self.dead_time_sec = float(dead_time_sec)
        self.sample_jitter_sec = float(sample_jitter_sec)
        self._lock = threading.Lock()
        self._connected = False
        self._streaming = False
        self._pose = [0.30, 0.0, 0.40, 0.0, 0.0, 0.0]
        self._velocity = [0.0] * 6
        self._pending: list[tuple[float, tuple[float, ...]]] = []
        self._last_step: float | None = None
        self.sent_commands = 0

    @property
    def connected(self) -> bool:
        return self._connected

    def connect(self) -> None:
        self._connected = True

    def disconnect(self) -> None:
        self._connected = False
        self._streaming = False

    def change_work_frame(self, name: str) -> None:
        if not self._connected:
            raise ArmError("the arm is not connected")

    def start_velocity(self, *, frame_type: int, period_ms: int, avoid_singularity: int = 1) -> None:
        if not self._connected:
            raise ArmError("the arm is not connected")
        self._streaming = True

    def send_velocity(self, velocity, *, follow: bool, trajectory_mode: int = 0, radio: int = 0) -> int:
        if not self._streaming:
            return -1
        with self._lock:
            self.sent_commands += 1
            self._pending.append(
                (time.perf_counter() + self.dead_time_sec, tuple(float(v) for v in velocity))
            )
        return 0

    def slow_stop(self) -> int:
        with self._lock:
            self._pending.clear()
            self._velocity = [0.0] * 6
        return 0

    def _advance(self, now: float) -> None:
        target = None
        while self._pending and self._pending[0][0] <= now:
            target = self._pending.pop(0)[1]
        if target is None:
            target = tuple(self._velocity)
        step = now - self._last_step if self._last_step is not None else 0.0
        self._last_step = now
        if step <= 0.0 or step > 1.0:
            return
        alpha = min(1.0, step / self.tau_sec)
        for index in range(6):
            desired = self.gain * target[index]
            self._velocity[index] += (desired - self._velocity[index]) * alpha
            self._pose[index] += self._velocity[index] * step

    def read_state(self) -> ArmState:
        with self._lock:
            started = time.perf_counter()
            self._advance(started)
            pose = tuple(self._pose)
            finished = time.perf_counter()
        return ArmState(
            0.5 * (started + finished), (0.0,) * 6, pose, True, finished - started
        )


def open_arm(
    ip: str,
    port: int,
    *,
    thread_mode: str = "RM_TRIPLE_MODE_E",
    mock: bool = False,
    mock_options: dict[str, float] | None = None,
) -> Any:
    """Return a connected real or mock arm with the same surface."""
    arm = MockArm(**(mock_options or {})) if mock else RealManArm(ip, port, thread_mode=thread_mode)
    arm.connect()
    return arm


__all__ = [
    "ArmError",
    "ArmState",
    "FRAME_TOOL",
    "FRAME_TYPES",
    "FRAME_WORK",
    "MockArm",
    "RealManArm",
    "open_arm",
]
