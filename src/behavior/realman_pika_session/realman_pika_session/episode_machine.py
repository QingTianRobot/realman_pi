"""ROS-neutral state machine: one recording per Pika keyboard session, then restart the Pika branch.

A stop press ends the recording and restarts the BT's Pika branch (mode off, then back on). Leaving the
mode makes the router cancel the velocity sessions at once, and re-entering it runs the branch's entry
MoveJ to pika_default_pose, so the arms home without waiting for the Pika stream to go quiet.
"""
from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class State(str, Enum):
    IDLE = "idle"
    STARTING = "starting"
    RECORDING = "recording"
    STOPPING = "stopping"
    HOMING = "homing"
    FAILED = "failed"


@dataclass(frozen=True)
class Action:
    kind: str  # "start" | "stop" | "restart"
    arms: tuple[str, ...] = ()


@dataclass(frozen=True)
class MachineConfig:
    required_mode: str
    keyboard_stale_sec: float
    home_arms: tuple[str, ...]


class EpisodeMachine:
    def __init__(self, config: MachineConfig) -> None:
        self._config = config
        self.state = State.IDLE
        self._session_id = ""
        self._detail = ""
        self._keyboard: bool | None = None
        self._keyboard_stamp = 0.0
        self._mode = ""
        self._external_session = ""
        self._pending_stop = False
        self._abnormal = ""
        # A stop press runs the recording STOP and the branch restart side by side; both must finish.
        self._stop_pending = False
        self._restart_pending = False
        self._failures: list[str] = []
        # A press made while the mode was not yet `required_mode`. The :8765 Pika switch selects the
        # mode only after that press has made Pika publish, so the first press of an activation
        # always lands here; it starts the episode once the mode arrives while the key is still on.
        self._press_waiting_for_mode = False

    # ---- inputs -------------------------------------------------------
    def on_keyboard(self, enabled: bool, now: float) -> list[Action]:
        previous = self._keyboard
        self._keyboard = enabled
        self._keyboard_stamp = now
        if previous is None or previous == enabled:
            return []
        return self._rising(now) if enabled else self._falling()

    def on_mode(self, active_mode: str, now: float) -> list[Action]:
        entered = active_mode == self._config.required_mode and self._mode != active_mode
        self._mode = active_mode
        if self.state is State.RECORDING and active_mode != self._config.required_mode:
            return self._abnormal_stop(f"mode changed to {active_mode or 'unknown'}")
        if entered and self._press_waiting_for_mode:
            self._press_waiting_for_mode = False
            if self.state is State.IDLE and self._key_on_and_fresh(now):
                return self._start_if_free()
        return []

    def on_recording_status(self, recording: bool, session_id: str) -> None:
        self._external_session = session_id if recording and session_id != self._session_id else ""

    def on_start_result(self, success: bool, session_id: str, message: str, now: float) -> list[Action]:
        if self.state is not State.STARTING:
            return []
        if not success:
            self.state = State.IDLE
            self._detail = f"start failed: {message}"
            return []
        self._session_id = session_id
        self.state = State.RECORDING
        self._detail = ""
        if self._mode != self._config.required_mode:
            return self._abnormal_stop(f"mode changed to {self._mode or 'unknown'}")
        if self._pending_stop:
            return self._normal_stop()
        return []

    def on_stop_result(self, success: bool, message: str, now: float) -> list[Action]:
        if self.state is not State.STOPPING or not self._stop_pending:
            return []
        self._stop_pending = False
        if self._abnormal:
            self.state = State.FAILED
            self._detail = f"abnormal stop: {self._abnormal}"
            if not success:
                self._detail += f"; stop failed: {message}"
            return []
        if not success:
            self._failures.append(f"stop failed: {message}")
        if self._restart_pending:
            self.state = State.HOMING  # the recording is closed; only the branch restart is left
            return []
        return self._finish(now)

    def on_restart_result(self, success: bool, message: str, now: float) -> list[Action]:
        if self.state not in (State.STOPPING, State.HOMING) or not self._restart_pending:
            return []
        self._restart_pending = False
        if not success:
            self._failures.append(f"restart failed: {message}")
        if self._stop_pending:
            return []
        return self._finish(now)

    def tick(self, now: float) -> list[Action]:
        if self.state is State.RECORDING and now - self._keyboard_stamp > self._config.keyboard_stale_sec:
            return self._abnormal_stop("keyboard state stale")
        return []

    def snapshot(self) -> dict:
        return {"state": self.state.value, "session_id": self._session_id, "detail": self._detail}

    # ---- transitions --------------------------------------------------
    def _rising(self, now: float) -> list[Action]:
        if self.state is State.FAILED:
            self.state = State.IDLE
            self._detail = "cleared"
            return []
        if self.state is not State.IDLE:
            # Teleop was switched back on mid-stop; _finish starts the next episode if it is still on.
            return self._ignore_busy()
        if self._mode != self._config.required_mode:
            self._detail = f"ignored: mode is {self._mode or 'unknown'}"
            self._press_waiting_for_mode = True
            return []
        return self._start_if_free()

    def _start_if_free(self) -> list[Action]:
        if self._external_session:
            self._detail = f"ignored: recording busy ({self._external_session})"
            return []
        self.state = State.STARTING
        self._pending_stop = False
        self._abnormal = ""
        self._failures = []
        self._session_id = ""
        self._detail = ""
        return [Action("start")]

    def _falling(self) -> list[Action]:
        self._press_waiting_for_mode = False
        if self.state is State.STARTING:
            self._pending_stop = True
            return []
        if self.state is State.RECORDING:
            return self._normal_stop()
        if self.state in (State.STOPPING, State.HOMING):
            return self._ignore_busy()
        if self.state is State.IDLE and self._mode == self._config.required_mode:
            # A stop press with no recording (it failed to start, or another recorder was busy) still
            # takes the arms off the Pika stream and home.
            self.state = State.HOMING
            self._failures = []
            self._detail = ""
            self._restart_pending = True
            return [self._restart_action()]
        return []

    def _ignore_busy(self) -> list[Action]:
        self._detail = f"ignored: busy ({self.state.value})"
        return []

    def _normal_stop(self) -> list[Action]:
        self.state = State.STOPPING
        self._stop_pending = True
        self._restart_pending = True
        return [Action("stop"), self._restart_action()]

    def _abnormal_stop(self, reason: str) -> list[Action]:
        # Mode lost or keyboard link lost: close the recording, never move the arms.
        self._abnormal = reason
        self.state = State.STOPPING
        self._stop_pending = True
        self._restart_pending = False
        return [Action("stop")]

    def _restart_action(self) -> Action:
        return Action("restart", self._config.home_arms)

    def _finish(self, now: float) -> list[Action]:
        if self._failures:
            self.state = State.FAILED
            self._detail = "; ".join(self._failures)
            return []
        self.state = State.IDLE
        self._detail = ""
        if self._mode == self._config.required_mode and self._key_on_and_fresh(now):
            # The key went on again while the arms homed, so Pika teleop is running: record it.
            return self._start_if_free()
        return []

    def _key_on_and_fresh(self, now: float) -> bool:
        return self._keyboard is True and now - self._keyboard_stamp <= self._config.keyboard_stale_sec
