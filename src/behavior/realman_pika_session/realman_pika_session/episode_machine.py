"""ROS-neutral state machine: one recording per Pika keyboard session, then home the arms."""
from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class State(str, Enum):
    IDLE = "idle"
    STARTING = "starting"
    RECORDING = "recording"
    STOPPING = "stopping"
    RELEASING = "releasing"
    HOMING = "homing"
    FAILED = "failed"


@dataclass(frozen=True)
class Action:
    kind: str  # "start" | "stop" | "home"
    arms: tuple[str, ...] = ()


@dataclass(frozen=True)
class MachineConfig:
    required_mode: str
    keyboard_stale_sec: float
    release_timeout_sec: float
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
        self._velocity_active: dict[str, bool] = {}
        self._external_session = ""
        self._pending_stop = False
        self._abnormal = ""
        self._stop_ok = True
        self._stop_message = ""
        self._release_started = 0.0
        self._home_pending: set[str] = set()

    # ---- inputs -------------------------------------------------------
    def on_keyboard(self, enabled: bool, now: float) -> list[Action]:
        previous = self._keyboard
        self._keyboard = enabled
        self._keyboard_stamp = now
        if previous is None or previous == enabled:
            return []
        return self._rising(now) if enabled else self._falling()

    def on_mode(self, active_mode: str, now: float) -> list[Action]:
        self._mode = active_mode
        if self.state is State.RECORDING and active_mode != self._config.required_mode:
            return self._abnormal_stop(f"mode changed to {active_mode}")
        return []

    def on_velocity_session(self, arm: str, active: bool, now: float) -> list[Action]:
        self._velocity_active[arm] = active
        if self.state is State.RELEASING and self._released():
            return self._home()
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
        if self.state is not State.STOPPING:
            return []
        if self._abnormal:
            self.state = State.FAILED
            self._detail = f"abnormal stop: {self._abnormal}"
            return []
        self._stop_ok = success
        self._stop_message = message
        self.state = State.RELEASING
        self._release_started = now
        if self._released():
            return self._home()
        return []

    def on_home_result(self, arm: str, success: bool, message: str, now: float) -> list[Action]:
        if self.state is not State.HOMING or arm not in self._home_pending:
            return []
        if not success:
            self.state = State.FAILED
            self._detail = f"home {arm} failed: {message}"
            self._home_pending.clear()
            return []
        self._home_pending.discard(arm)
        if not self._home_pending:
            if self._stop_ok:
                self.state = State.IDLE
            else:
                self.state = State.FAILED
                self._detail = f"stop failed: {self._stop_message}"
        return []

    def tick(self, now: float) -> list[Action]:
        if self.state is State.RECORDING and now - self._keyboard_stamp > self._config.keyboard_stale_sec:
            return self._abnormal_stop("keyboard state stale")
        if self.state is State.RELEASING and now - self._release_started > self._config.release_timeout_sec:
            actions = self._home()
            if actions:
                self._detail = "release timeout"
            return actions
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
            return self._ignore_busy()
        if self._mode != self._config.required_mode:
            self._detail = f"ignored: mode is {self._mode or 'unknown'}"
            return []
        if self._external_session:
            self._detail = f"ignored: recording busy ({self._external_session})"
            return []
        self.state = State.STARTING
        self._pending_stop = False
        self._abnormal = ""
        self._stop_ok = True
        self._stop_message = ""
        self._session_id = ""
        self._detail = ""
        return [Action("start")]

    def _falling(self) -> list[Action]:
        if self.state is State.STARTING:
            self._pending_stop = True
            return []
        if self.state is State.RECORDING:
            return self._normal_stop()
        if self.state in (State.STOPPING, State.RELEASING, State.HOMING):
            return self._ignore_busy()
        return []

    def _ignore_busy(self) -> list[Action]:
        self._detail = f"ignored: busy ({self.state.value})"
        return []

    def _normal_stop(self) -> list[Action]:
        self.state = State.STOPPING
        return [Action("stop")]

    def _abnormal_stop(self, reason: str) -> list[Action]:
        self._abnormal = reason
        self.state = State.STOPPING
        return [Action("stop")]

    def _released(self) -> bool:
        return not any(self._velocity_active.get(arm, False) for arm in self._config.home_arms)

    def _home(self) -> list[Action]:
        if self._mode != self._config.required_mode:
            self.state = State.FAILED
            self._detail = f"home skipped: mode changed to {self._mode or 'unknown'}"
            self._home_pending.clear()
            return []
        self.state = State.HOMING
        self._home_pending = set(self._config.home_arms)
        return [Action("home", self._config.home_arms)]
