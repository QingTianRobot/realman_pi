"""ROS-independent sequencing for the :8765 Pika velocity switch.

On:  helper start -> both /pika/{l,r}/cartesian_velocity fresh -> select `mode`.
Off: select `off_mode` (only when `mode` is active or requested) -> helper stop.
Off is also accepted while waiting for input (helper stop only) and while
selecting (the outstanding request is forgotten, then the off step runs), and
while the helper is unreachable (the stop then fails with its detail).
Mode requests go through the input-mode bridge under the switch's own client id
and are correlated by the executor request id from the bridge's
`input_mode_result`; bridge errors for the request count as refusals except
the bridge's short pending timeout, which is not a failure while selecting,
only `mode_switch_timeout_sec` is (it covers the entry MoveJ). The off step
waits at most `off_mode_timeout_sec`, and stops at once on a bridge timeout
that came before the executor accepted the request.
A helper start/stop that gets no answer within `helper_timeout_sec + 5 s`
fails the switch; its late answer is handled as normal, and answers of an
older start/stop (older epoch) are dropped.
The owner serializes all calls and applies the returned effects in order.
"""

from __future__ import annotations

from dataclasses import dataclass
import time
from typing import Any, Callable

PIKA_CLIENT_ID = "pika_switch"
PIKA_ARMS = ("l", "r")
TRANSITIONS = frozenset({"starting", "waiting_input", "selecting", "stopping"})
SUPERSEDED = "superseded by another input mode request"
BRIDGE_TIMEOUT = "input_mode_timeout"
HELPER_GRACE_SEC = 5.0  # On top of helper_timeout_sec, which bounds the HTTP call itself.


@dataclass(frozen=True)
class PikaSwitchConfig:
    input_fresh_ms: float
    input_wait_timeout_sec: float
    status_poll_sec: float
    mode_switch_timeout_sec: float
    mode: str
    off_mode: str
    helper_timeout_sec: float
    off_mode_timeout_sec: float


@dataclass(frozen=True)
class ModeView:
    available: bool
    selectable: bool
    phase: str | None
    requested_mode: str
    active_mode: str
    detail: str = ""
    request_id: int = 0  # executor request id of the snapshot


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
        self._deadline = 0.0
        self._stop_after_mode = False
        self._next_request = 0
        self._mode_request: str | None = None
        self._executor_request_id: int | None = None
        self._epoch = 0
        self._last_input: dict[str, float] = {}
        self._helper_in_flight: str | None = None
        self._helper_deadline = 0.0
        # The owner sends one status probe at start-up (Task 4); polling resumes after one period.
        self._next_poll = clock() + config.status_poll_sec
        self._published: dict[str, Any] | None = None

    # ---- inputs -------------------------------------------------------
    def input_received(self, arm: str) -> None:
        if arm in PIKA_ARMS:
            self._last_input[arm] = self._clock()

    @property
    def reachable(self) -> bool:
        return self._reachable

    def command(self, client_id: str, request_id: str, enabled: bool, mode: ModeView) -> list[PikaEffect]:
        # Off does not need a reachable helper while the row is shown: Pika may still drive the arms.
        if not self._enabled or (not self._reachable and (enabled or not self.state_event()["available"])):
            return [self._error(client_id, request_id, "pika_switch_unavailable", "Pika helper is not available")]
        busy = ("starting", "stopping") if not enabled else TRANSITIONS
        if self._phase in busy or self._helper_in_flight in ("start", "stop"):
            return [self._error(client_id, request_id, "pika_switch_busy", f"Pika switch is {self._phase}")]
        if not enabled and self._phase == "selecting":
            # The entry MoveJ may be under way: forget the pikavelocity request (its late
            # result or error no longer matches) and select off_mode as the off step does.
            return self._begin_off_mode()
        if not enabled and self._phase == "waiting_input":
            return self._enter("stopping", "") + [self._helper("stop")]
        if enabled:
            if self._phase == "on" and self._in_mode(mode):
                return [PikaEffect("send_event", self.state_event(), client_id)]  # answer the requester only
            if not (mode.available and mode.selectable):
                return [self._error(client_id, request_id, "pika_mode_unavailable",
                                    f"{self._config.mode} mode is not available; start the control tree first")]
            self._last_input.clear()
            return self._enter("starting", "") + [self._helper("start")]
        if mode.available and self._config.mode in (mode.active_mode, mode.requested_mode):
            return self._begin_off_mode()
        return self._enter("stopping", "") + [self._helper("stop")]

    def mode_request_result(self, request_id: str, accepted: bool, executor_request_id: int,
                            message: str) -> list[PikaEffect]:
        if self._mode_request is None or request_id != self._mode_request:
            return []
        if accepted:
            self._executor_request_id = executor_request_id
            return []
        return self._refused(message)

    def mode_request_error(self, request_id: str, code: str, message: str) -> list[PikaEffect]:
        """A bridge `error` event for the outstanding request counts as a refusal.

        `input_mode_timeout` is the bridge's own short pending timeout; the entry
        MoveJ can take longer, so only `mode_switch_timeout_sec` ends the wait.
        In the off step a bridge timeout before the executor accepted the request
        means `off_mode` cannot be confirmed: stop the stack anyway.
        """
        if self._mode_request is None or request_id != self._mode_request:
            return []
        if code == BRIDGE_TIMEOUT:
            if self._phase == "stopping" and self._stop_after_mode and self._executor_request_id is None:
                return self._finish_off_mode(f"{self._config.off_mode} not confirmed")
            return []
        return self._refused(message)

    def helper_result(self, action: str, ok: bool, payload: dict[str, Any], *,
                      epoch: int | None = None) -> list[PikaEffect]:
        if epoch is not None and epoch != self._epoch:
            return []  # issued before a later start/stop; its answer is stale
        if self._helper_in_flight == action:
            self._helper_in_flight = None
        if action == "status":
            # A status whose probe errored (tmux timed out or missing) is no answer about the stack.
            self._reachable = ok and not payload.get("error")
            if self._reachable:
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
        # Executor request ids are per executor process: after an executor restart they start
        # again and no longer match, so recovery then relies on router-unavailable or the own timeout.
        executor = self._executor_request_id
        ours = executor is not None and mode.request_id == executor
        superseded = executor is not None and mode.request_id > executor
        if self._helper_in_flight in ("start", "stop") and now >= self._helper_deadline:
            # The HTTP call is bounded by helper_timeout_sec; no answer by now means the owner lost it.
            action, self._helper_in_flight = self._helper_in_flight, None
            effects += self._enter("failed", f"Pika helper {action} got no answer")
        if self._phase == "waiting_input":
            if all(self._fresh(arm, now) for arm in PIKA_ARMS):
                self._deadline = now + self._config.mode_switch_timeout_sec
                effects += self._enter("selecting", "") + [self._select(self._config.mode)]
            elif now >= self._deadline:
                missing = ", ".join(f"/pika/{arm}" for arm in PIKA_ARMS if not self._fresh(arm, now))
                effects += self._enter("failed", f"no {missing} input for {self._config.input_wait_timeout_sec:g} s")
        elif self._phase == "selecting":
            if ours and mode.phase == "ACTIVE" and mode.active_mode == self._config.mode:
                effects += self._enter("on", "")
            elif ours and mode.phase == "FAILED":
                effects += self._enter("failed", mode.detail or f"switch to {self._config.mode} failed")
            elif ours and mode.requested_mode != self._config.mode:
                # After a failed switch the executor schedules its fallback under the same request id
                # on the next tick, so FAILED is usually missed; the changed requested mode is not.
                effects += self._enter("failed", mode.detail or f"{self._config.mode} failed")
            elif superseded:
                effects += self._enter("failed", SUPERSEDED)
            elif not mode.available:
                effects += self._enter("failed", "input mode router is unavailable")
            elif now >= self._deadline:
                effects += self._enter("failed", f"{self._config.mode} not active after {self._config.mode_switch_timeout_sec:g} s")
        elif self._phase == "stopping" and self._stop_after_mode:
            off_mode = self._config.off_mode
            if ours and mode.phase == "ACTIVE" and mode.active_mode == off_mode:
                effects += self._finish_off_mode("")
            elif ours and mode.phase == "FAILED":
                effects += self._finish_off_mode(f"{off_mode} refused: {mode.detail}")
            elif ours and mode.requested_mode != off_mode:
                effects += self._finish_off_mode(mode.detail or f"{off_mode} failed")
            elif superseded:
                effects += self._finish_off_mode(SUPERSEDED)
            elif not mode.available:
                effects += self._finish_off_mode("input mode router is unavailable")
            elif now >= self._deadline:
                effects += self._finish_off_mode(f"{off_mode} not active after {self._config.off_mode_timeout_sec:g} s")
        elif self._phase in ("off", "on", "failed"):
            in_mode = self._in_mode(mode)
            if self._helper_in_flight is None:
                # Pika running and the tree in the Pika mode (under any request) is `on`, however it got there.
                if self._phase in ("off", "failed") and self._stack_running and in_mode:
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
            # The row stays while Pika may still drive the arms, even with the helper unreachable.
            "available": self._enabled and (self._reachable or self._phase != "off" or self._stack_running),
            "helper_reachable": self._reachable,
            "input_fresh_ms": self._config.input_fresh_ms,
            "phase": self._phase,
            "stack_running": self._stack_running,
            "input_age_ms": ages,
            "mode_lost": self._mode_lost,
            "detail": self._detail,
        }

    # ---- helpers ------------------------------------------------------
    def _in_mode(self, mode: ModeView) -> bool:
        return mode.phase == "ACTIVE" and mode.active_mode == self._config.mode

    def _fresh(self, arm: str, now: float) -> bool:
        received = self._last_input.get(arm)
        return received is not None and (now - received) * 1000 < self._config.input_fresh_ms

    def _refused(self, message: str) -> list[PikaEffect]:
        # Clearing the request makes any later signal for it (error, snapshot) a no-op.
        self._mode_request = None
        if self._phase == "selecting":
            return self._enter("failed", f"{self._config.mode} refused: {message}")
        if self._phase == "stopping" and self._stop_after_mode:
            return self._finish_off_mode(f"{self._config.off_mode} refused: {message}")
        return []

    def _begin_off_mode(self) -> list[PikaEffect]:
        """Off step: select off_mode, then stop the stack (see tick)."""
        self._stop_after_mode = True
        self._deadline = self._clock() + self._config.off_mode_timeout_sec
        # _select replaces any outstanding request, so signals for the old one are ignored.
        return self._enter("stopping", "") + [self._select(self._config.off_mode)]

    def _finish_off_mode(self, detail: str) -> list[PikaEffect]:
        """End the off sequence's mode step and stop the stack."""
        self._stop_after_mode = False
        self._mode_request = None
        self._executor_request_id = None
        self._detail = detail
        return self._publish() + [self._helper("stop")]

    def _enter(self, phase: str, detail: str) -> list[PikaEffect]:
        self._phase = phase
        self._detail = detail
        if phase != "on":
            self._mode_lost = False
        if phase not in ("selecting", "stopping"):
            self._mode_request = None
            self._executor_request_id = None
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
        if action in ("start", "stop"):
            self._epoch += 1
            self._helper_deadline = self._clock() + self._config.helper_timeout_sec + HELPER_GRACE_SEC
        return PikaEffect("helper", {"action": action, "epoch": self._epoch})

    def _select(self, mode_id: str) -> PikaEffect:
        self._next_request += 1
        self._mode_request = f"pika-{self._next_request}"
        self._executor_request_id = None
        return PikaEffect("select_mode", {"mode_id": mode_id, "request_id": self._mode_request}, PIKA_CLIENT_ID)

    @staticmethod
    def _error(client_id: str, request_id: str, code: str, message: str) -> PikaEffect:
        return PikaEffect("reply_error", {"type": "error", "code": code, "message": message,
                                          "request_id": request_id}, client_id)
