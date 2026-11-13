"""ROS-independent sequencing for the :8765 Pika velocity switch.

On:  helper start -> both /pika/{l,r}/cartesian_velocity fresh -> select `mode`.
Off: select `off_mode` (only when `mode` is active) -> helper stop.
The owner serializes all calls and applies the returned effects in order.
"""

from __future__ import annotations

from dataclasses import dataclass
import time
from typing import Any, Callable

PIKA_ARMS = ("l", "r")
TRANSITIONS = frozenset({"starting", "waiting_input", "selecting", "stopping"})


@dataclass(frozen=True)
class PikaSwitchConfig:
    input_fresh_ms: float
    input_wait_timeout_sec: float
    status_poll_sec: float
    mode_switch_timeout_sec: float
    mode: str
    off_mode: str


@dataclass(frozen=True)
class ModeView:
    available: bool
    selectable: bool
    phase: str | None
    requested_mode: str
    active_mode: str
    detail: str = ""


@dataclass(frozen=True)
class PikaEffect:
    kind: str
    payload: dict[str, Any]
    client_id: str | None = None


class PikaSwitch:
    def __init__(self, config: PikaSwitchConfig, *, enabled: bool,
                 clock: Callable[[], float] = time.monotonic) -> None:
        self._config = config
        self._enabled = enabled
        self._clock = clock
        self._reachable = False
        self._stack_running = False
        self._phase = "off"
        self._detail = ""
        self._mode_lost = False
        self._client_id: str | None = None
        self._deadline = 0.0
        self._stop_after_mode = False
        self._next_request = 0
        self._last_input: dict[str, float] = {}
        self._helper_in_flight: str | None = None
        # The owner sends one status probe at start-up (Task 4); polling resumes after one period.
        self._next_poll = clock() + config.status_poll_sec
        self._published: dict[str, Any] | None = None

    # ---- inputs -------------------------------------------------------
    def input_received(self, arm: str) -> None:
        if arm in PIKA_ARMS:
            self._last_input[arm] = self._clock()

    def command(self, client_id: str, request_id: str, enabled: bool, mode: ModeView) -> list[PikaEffect]:
        if not self._enabled or not self._reachable:
            return [self._error(client_id, request_id, "pika_switch_unavailable", "Pika helper is not available")]
        if self._phase in TRANSITIONS or self._helper_in_flight in ("start", "stop"):
            return [self._error(client_id, request_id, "pika_switch_busy", f"Pika switch is {self._phase}")]
        self._client_id = client_id
        if enabled:
            if not (mode.available and mode.selectable):
                return [self._error(client_id, request_id, "pika_mode_unavailable",
                                    f"{self._config.mode} mode is not available; start the control tree first")]
            self._last_input.clear()
            return self._enter("starting", "") + [self._helper("start")]
        if mode.available and mode.active_mode == self._config.mode and mode.phase is not None:
            self._stop_after_mode = True
            self._deadline = self._clock() + self._config.mode_switch_timeout_sec
            return self._enter("stopping", "") + [self._select(self._config.off_mode)]
        return self._enter("stopping", "") + [self._helper("stop")]

    def helper_result(self, action: str, ok: bool, payload: dict[str, Any]) -> list[PikaEffect]:
        if self._helper_in_flight == action:
            self._helper_in_flight = None
        if action == "status":
            self._reachable = ok
            if ok:
                self._stack_running = bool(payload.get("running"))
            return self._publish()
        self._reachable = self._reachable or ok
        if not ok:
            tail = payload.get("output_tail") or []
            detail = "; ".join([str(payload.get("error", f"{action} failed")), *[str(line) for line in tail[-3:]]])
            return self._enter("failed", detail)
        if action == "start" and self._phase == "starting":
            self._stack_running = True
            self._deadline = self._clock() + self._config.input_wait_timeout_sec
            return self._enter("waiting_input", "")
        if action == "stop" and self._phase == "stopping":
            self._stack_running = False
            return self._enter("off", self._detail)
        return self._publish()

    def tick(self, mode: ModeView) -> list[PikaEffect]:
        now = self._clock()
        effects: list[PikaEffect] = []
        if self._phase == "waiting_input":
            if all(self._fresh(arm, now) for arm in PIKA_ARMS):
                self._deadline = now + self._config.mode_switch_timeout_sec
                effects += self._enter("selecting", "") + [self._select(self._config.mode)]
            elif now >= self._deadline:
                missing = ", ".join(f"/pika/{arm}" for arm in PIKA_ARMS if not self._fresh(arm, now))
                effects += self._enter("failed", f"no {missing} input for {self._config.input_wait_timeout_sec:g} s")
        elif self._phase == "selecting":
            if mode.phase == "ACTIVE" and mode.active_mode == self._config.mode:
                effects += self._enter("on", "")
            elif mode.phase == "FAILED" and mode.requested_mode == self._config.mode:
                effects += self._enter("failed", mode.detail or f"switch to {self._config.mode} failed")
            elif not mode.available:
                effects += self._enter("failed", "input mode router is unavailable")
            elif now >= self._deadline:
                effects += self._enter("failed", f"{self._config.mode} not active after {self._config.mode_switch_timeout_sec:g} s")
        elif self._phase == "stopping" and self._stop_after_mode:
            reached = mode.phase == "ACTIVE" and mode.active_mode == self._config.off_mode
            refused = mode.phase == "FAILED" and mode.requested_mode == self._config.off_mode
            if reached or refused or not mode.available or now >= self._deadline:
                self._stop_after_mode = False
                if refused:
                    self._detail = f"{self._config.off_mode} refused: {mode.detail}"
                effects += self._publish() + [self._helper("stop")]
        elif self._phase in ("off", "on") and self._helper_in_flight is None:
            in_mode = mode.phase == "ACTIVE" and mode.active_mode == self._config.mode
            if self._phase == "off" and self._stack_running and in_mode:
                effects += self._enter("on", "")
            elif self._phase == "on" and not self._stack_running:
                effects += self._enter("off", "Pika stack stopped outside :8765")
            self._mode_lost = self._phase == "on" and not in_mode
        if (self._enabled and self._helper_in_flight is None and self._phase not in TRANSITIONS
                and now >= self._next_poll):
            self._next_poll = now + self._config.status_poll_sec
            effects.append(self._helper("status"))
        return effects + self._publish()

    # ---- outputs ------------------------------------------------------
    def state_event(self) -> dict[str, Any]:
        now = self._clock()
        ages = {arm: (round((now - self._last_input[arm]) * 1000) if arm in self._last_input else None)
                for arm in PIKA_ARMS}
        return {
            "type": "pika_switch_state",
            "available": self._enabled and self._reachable,
            "phase": self._phase,
            "stack_running": self._stack_running,
            "input_age_ms": ages,
            "mode_lost": self._mode_lost,
            "detail": self._detail,
        }

    # ---- helpers ------------------------------------------------------
    def _fresh(self, arm: str, now: float) -> bool:
        received = self._last_input.get(arm)
        return received is not None and (now - received) * 1000 < self._config.input_fresh_ms

    def _enter(self, phase: str, detail: str) -> list[PikaEffect]:
        self._phase = phase
        self._detail = detail
        if phase != "on":
            self._mode_lost = False
        return self._publish()

    def _publish(self) -> list[PikaEffect]:
        state = self.state_event()
        # Input ages change every tick; only broadcast them while waiting for input.
        comparable = {**state, "input_age_ms": state["input_age_ms"] if self._phase == "waiting_input" else None}
        if comparable == self._published:
            return []
        self._published = comparable
        return [PikaEffect("send_event", state)]

    def _helper(self, action: str) -> PikaEffect:
        self._helper_in_flight = action
        return PikaEffect("helper", {"action": action})

    def _select(self, mode_id: str) -> PikaEffect:
        self._next_request += 1
        return PikaEffect("select_mode", {"mode_id": mode_id, "request_id": f"pika-{self._next_request}"},
                          self._client_id)

    @staticmethod
    def _error(client_id: str, request_id: str, code: str, message: str) -> PikaEffect:
        return PikaEffect("reply_error", {"type": "error", "code": code, "message": message,
                                          "request_id": request_id}, client_id)
