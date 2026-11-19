"""ROS-neutral restart of one BT input-mode branch: select `off_mode`, then select `mode` again.

Selecting the active mode again is a no-op in the executor ("already active"), so a restart is two
selections. Each one is followed on /realman_bt_executor/input_mode_state by its executor request id:
ACTIVE in the target mode is success; FAILED, a fallback (the requested mode changes under our id) or
a newer request (someone else selected) is failure. Leaving `mode` makes the Pika router cancel its
velocity sessions; entering it runs the branch's entry MoveJ (pika_default_pose), which homes the arms.
"""
from __future__ import annotations

from dataclasses import dataclass

ACTIVE = "ACTIVE"
FAILED = "FAILED"


@dataclass(frozen=True)
class ModeView:
    requested_mode: str
    active_mode: str
    phase: str  # "ACTIVE" | "SWITCHING" | "FAILED"
    request_id: int
    detail: str = ""


@dataclass(frozen=True)
class Effect:
    kind: str  # "select" (mode_id) | "done" (success, message)
    mode_id: str = ""
    success: bool = False
    message: str = ""


class BranchRestart:
    def __init__(self, mode: str, off_mode: str, off_timeout_sec: float, on_timeout_sec: float) -> None:
        self._mode = mode
        self._off_mode = off_mode
        self._timeouts = {off_mode: off_timeout_sec, mode: on_timeout_sec}
        self._target = ""  # "" = no restart running
        self._request_id: int | None = None  # executor request id of the current selection
        self._deadline = 0.0
        self._last: ModeView | None = None

    @property
    def running(self) -> bool:
        return self._target != ""

    @property
    def target(self) -> str:
        return self._target

    def start(self, now: float) -> list[Effect]:
        """Begin a restart; a restart already running is left alone (its result still comes)."""
        if self.running:
            return []
        return self._select(self._off_mode, now)

    def on_select_response(self, mode_id: str, accepted: bool, request_id: int, message: str,
                           now: float) -> list[Effect]:
        if mode_id != self._target or self._request_id is not None:
            return []  # a late answer for an earlier step or an abandoned restart
        if not accepted:
            return self._done(False, f"{mode_id} refused: {message}")
        self._request_id = request_id
        return self._check(now)

    def on_mode_state(self, view: ModeView, now: float) -> list[Effect]:
        self._last = view
        return self._check(now) if self.running and self._request_id is not None else []

    def tick(self, now: float) -> list[Effect]:
        if self.running and now > self._deadline:
            return self._done(False, f"{self._target} not active after {self._timeouts[self._target]:g} s")
        return []

    # ---- internals ----------------------------------------------------
    def _select(self, mode_id: str, now: float) -> list[Effect]:
        self._target = mode_id
        self._request_id = None
        self._deadline = now + self._timeouts[mode_id]
        return [Effect("select", mode_id=mode_id)]

    def _check(self, now: float) -> list[Effect]:
        view, ours = self._last, self._request_id
        if view is None or ours is None or view.request_id < ours:
            return []  # the state for our request has not arrived yet
        if view.request_id > ours:
            return self._done(False, f"{self._target} superseded by another input mode request")
        if view.phase == FAILED:
            return self._done(False, view.detail or f"{self._target} failed")
        if view.requested_mode != self._target:
            # After a failed switch the executor falls back under the same request id.
            return self._done(False, view.detail or f"{self._target} failed")
        if view.phase == ACTIVE and view.active_mode == self._target:
            if self._target == self._off_mode:
                return self._select(self._mode, now)
            return self._done(True, f"{self._mode} restarted")
        return []

    def _done(self, success: bool, message: str) -> list[Effect]:
        self._target = ""
        self._request_id = None
        return [Effect("done", success=success, message=message)]
