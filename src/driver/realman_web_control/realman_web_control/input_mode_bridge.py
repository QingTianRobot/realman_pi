"""ROS-independent input mode arbitration. The owner serializes all calls/effects."""

from __future__ import annotations

from copy import deepcopy
from dataclasses import asdict, dataclass, replace
import math
import time
from typing import Any, Callable

from .protocol import ProtocolError


MOTION_TYPES = frozenset({"execute_motion", "execute_trajectory", "start_cartesian_velocity"})


@dataclass(frozen=True)
class InputModeOption:
    id: str
    label: str
    selectable: bool


@dataclass(frozen=True)
class InputModeSnapshot:
    requested_mode: str
    selected_mode: str
    active_mode: str
    phase: str
    request_id: int
    epoch: int
    detail: str = ""


@dataclass(frozen=True)
class InputModeEffect:
    kind: str
    client_id: str | None
    payload: dict[str, Any]
    token: int = 0


@dataclass(frozen=True)
class _PendingSelection:
    token: int
    client_id: str
    browser_request_id: str
    mode_id: str
    deadline: float
    state_revision: int
    motion: dict[str, Any] | None = None
    executor_request_id: int | None = None
    failed_state: InputModeSnapshot | None = None


class InputModeBridge:
    """Hold at most one global selection/override until correlated activation.

    Local tokens identify callbacks independently of browser IDs (which may be
    reused across clients) and executor IDs (which may be reused for ACTIVE).
    A state must have arrived after the local request, even for already-active
    Web. Effects must be applied in order before the next controller call.
    """

    def __init__(self, *, web_override_timeout_sec: float,
                 clock: Callable[[], float] = time.monotonic) -> None:
        if not math.isfinite(web_override_timeout_sec) or web_override_timeout_sec <= 0:
            raise ValueError("web_override_timeout_sec must be finite and positive")
        self._timeout = web_override_timeout_sec
        self._clock = clock
        self._catalog: tuple[InputModeOption, ...] | None = None
        self._direct_control_allowed = True
        self._generation = 0
        self._snapshot: InputModeSnapshot | None = None
        self._state_revision = 0
        self._next_token = 0
        self._pending: _PendingSelection | None = None

    @property
    def available(self) -> bool:
        return self._catalog is not None

    @property
    def pending_token(self) -> int | None:
        return self._pending.token if self._pending is not None else None

    @property
    def generation(self) -> int:
        return self._generation

    def cached_events(self, client_id: str | None = None) -> list[InputModeEffect]:
        events = [InputModeEffect("send_event", client_id, {
            "type": "input_mode_list", "available": self.available,
            "modes": [asdict(option) for option in self._catalog or ()],
        })]
        if self.available and self._snapshot is not None:
            events.append(InputModeEffect("send_event", client_id, {
                "type": "input_mode_state", **asdict(self._snapshot),
            }))
        return events

    def update_catalog(self, modes: tuple[InputModeOption, ...] | None, *,
                       confirmed_absent: bool = True) -> list[InputModeEffect]:
        effects = []
        if modes is None:
            effects = self._discard("input_mode_unavailable", "input mode router is unavailable")
            self._snapshot = None
            self._state_revision = 0
        elif not self.available:
            self._generation += 1
            self._snapshot = None
            self._state_revision = 0
        self._catalog = tuple(modes) if modes is not None else None
        # An unhealthy or pending probe is not evidence that the router is absent.
        self._direct_control_allowed = modes is None and confirmed_absent
        return effects + self.cached_events()

    @staticmethod
    def _error(client_id: str, request_id: str, code: str, message: str) -> InputModeEffect:
        return InputModeEffect("send_event", client_id, ProtocolError(code, message, request_id).event())

    def _discard(self, code: str, message: str) -> list[InputModeEffect]:
        pending, self._pending = self._pending, None
        if pending is None:
            return []
        return [self._error(pending.client_id, pending.browser_request_id, code, message)]

    def select_mode(self, client_id: str, message: dict[str, Any]) -> list[InputModeEffect]:
        mode_id, request_id = message["mode_id"], message["request_id"]
        if not self.available:
            return [self._error(client_id, request_id, "input_mode_unavailable", "input mode router is unavailable")]
        option = next((option for option in self._catalog if option.id == mode_id), None)
        if option is None:
            return [self._error(client_id, request_id, "input_mode_unknown", f"unknown input mode: {mode_id}")]
        if mode_id == "web" or not option.selectable:
            return [self._error(client_id, request_id, "input_mode_not_selectable", f"input mode is not selectable: {mode_id}")]
        return self._begin(client_id, request_id, mode_id)

    def intercept_motion(self, client_id: str, message: dict[str, Any]) -> list[InputModeEffect]:
        if message["type"] not in MOTION_TYPES:
            raise ValueError("only qualifying motion messages may enter the input mode gate")
        if not self.available:
            if not self._direct_control_allowed:
                return [self._error(client_id, message["request_id"], "input_mode_unavailable",
                                    "input mode discovery is unhealthy; command discarded")]
            return [InputModeEffect("forward_motion", client_id, deepcopy(message))]
        if not any(option.id == "web" for option in self._catalog):
            return [self._error(client_id, message["request_id"], "input_mode_unknown", "router has no web input mode")]
        return self._begin(client_id, message["request_id"], "web", deepcopy(message))

    def _begin(self, client_id: str, request_id: str, mode_id: str,
               motion: dict[str, Any] | None = None) -> list[InputModeEffect]:
        effects = self._discard("input_mode_superseded", "superseded by a newer Web request")
        self._next_token += 1
        self._pending = _PendingSelection(
            self._next_token, client_id, request_id, mode_id,
            self._clock() + self._timeout, self._state_revision, motion,
        )
        # Web-owned Actions can outlive discovery/state replay. Cancellation is
        # idempotent and must precede every valid non-Web selection, even before
        # this discovery generation has delivered its first state sample.
        if mode_id != "web":
            effects.append(InputModeEffect("cancel_web_actions", client_id, {}, self._next_token))
        effects.append(InputModeEffect("request_mode", client_id, {
            "mode_id": mode_id, "request_id": request_id,
        }, self._next_token))
        return effects

    def selection_response(self, token: int, accepted: bool, executor_request_id: int,
                           message: str) -> list[InputModeEffect]:
        if self._pending is None or self._pending.token != token:
            return []
        effects = self.expire()
        pending = self._pending
        if pending is None or pending.executor_request_id is not None:
            return effects
        effects.append(InputModeEffect("send_event", pending.client_id, {
            "type": "input_mode_result", "request_id": pending.browser_request_id,
            "executor_request_id": executor_request_id, "accepted": accepted, "message": message,
        }))
        if not accepted:
            effects += self._discard("input_mode_rejected", message)
        else:
            self._pending = replace(pending, executor_request_id=executor_request_id)
            effects += self._resolve()
        return effects

    def update_state(self, snapshot: InputModeSnapshot) -> list[InputModeEffect]:
        effects = self.expire()
        if not self.available:
            return effects
        previous = self._snapshot
        if previous is not None and (
            snapshot.request_id < previous.request_id or snapshot.epoch < previous.epoch
        ):
            return effects
        if previous is not None and snapshot.request_id == previous.request_id:
            # Same-epoch samples cannot undo failure, but the executor's next
            # fallback activation legitimately advances the epoch for this ID.
            if (previous.phase == "FAILED" and snapshot.phase != "FAILED"
                    and snapshot.epoch == previous.epoch):
                return effects
            if (snapshot.epoch == previous.epoch and previous.phase == "ACTIVE"
                    and snapshot.phase == "SWITCHING"):
                return effects
        self._snapshot = snapshot
        self._state_revision += 1
        if snapshot.phase == "FAILED" and self._pending is not None:
            # Preserve this request's failure even if recovery is published
            # before the outstanding selection response reaches the bridge.
            self._pending = replace(self._pending, failed_state=snapshot)
        if self.available:
            effects.append(InputModeEffect("send_event", None, {
                "type": "input_mode_state", **asdict(snapshot),
            }))
            effects += self._resolve()
        return effects

    def _resolve(self) -> list[InputModeEffect]:
        pending, snapshot = self._pending, self._snapshot
        if (pending is None or snapshot is None or pending.executor_request_id is None
                or self._state_revision <= pending.state_revision):
            return []
        if pending.failed_state is not None and pending.failed_state.request_id == pending.executor_request_id:
            return self._discard("input_mode_failed", pending.failed_state.detail or "input mode activation failed")
        if snapshot.request_id > pending.executor_request_id:
            return self._discard("input_mode_superseded", "executor selected a newer input mode request")
        if snapshot.request_id != pending.executor_request_id:
            return []
        if snapshot.phase == "FAILED":
            return self._discard("input_mode_failed", snapshot.detail or "input mode activation failed")
        if snapshot.phase != "ACTIVE":
            return []
        if snapshot.active_mode != pending.mode_id:
            return self._discard("input_mode_superseded", "executor activated a different input mode")
        self._pending = None
        if pending.motion is not None:
            return [InputModeEffect("forward_motion", pending.client_id, pending.motion)]
        return []

    def expire(self) -> list[InputModeEffect]:
        if self._pending is not None and self._clock() >= self._pending.deadline:
            return self._discard("input_mode_timeout", "input mode activation timed out; command discarded")
        return []

    def client_disconnected(self, client_id: str) -> list[InputModeEffect]:
        if self._pending is not None and self._pending.client_id == client_id:
            return self._discard("input_mode_disconnected", "requesting Web client disconnected")
        return []

    def cancel_motion(self, arm: str, *, action: str | None = None,
                      client_id: str | None = None) -> list[InputModeEffect]:
        pending = self._pending
        if pending is None or pending.motion is None or pending.motion["arm"] != arm:
            return []
        motion_action = {"start_cartesian_velocity": "cartesian_velocity"}.get(
            pending.motion["type"], pending.motion["type"])
        if action is not None and action != motion_action:
            return []
        if client_id is not None and client_id != pending.client_id:
            raise ProtocolError("not_goal_owner", "only the client that started this goal may cancel it")
        return self._discard("input_mode_cancelled", "queued Web motion cancelled before activation")
