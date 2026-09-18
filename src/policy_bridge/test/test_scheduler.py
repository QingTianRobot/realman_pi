"""Unit tests for policy_bridge.inference.scheduler."""

from __future__ import annotations

import numpy as np

from policy_bridge.config_loader import ActionConfig
from policy_bridge.inference.scheduler import InferenceScheduler, _InlineExecutor
from policy_bridge.inference.ws_client import PolicyServiceError


def _action_cfg(horizon=16, dim=7, steps=4, lead=2, clip=(-1.0, 1.0)) -> ActionConfig:
    return ActionConfig(
        action_horizon=horizon,
        action_dim=dim,
        steps_per_inference=steps,
        inference_lead_steps=lead,
        action_clip=clip,
    )


class FakeBuffer:
    def __init__(self, remaining: int = 0) -> None:
        self.remaining = remaining


class FakeObs:
    _UNSET = object()

    def __init__(self, obs=_UNSET) -> None:
        self._obs = {"state": np.zeros(7, dtype=np.float32)} if obs is FakeObs._UNSET else obs

    def build(self, side):
        return self._obs


class FakeWs:
    """Returns a canned response, or raises ``error`` when set."""

    def __init__(self, actions=None, error=None) -> None:
        self._actions = (
            actions
            if actions is not None
            else np.zeros((16, 7), dtype=np.float32)
        )
        self._error = error
        self.calls = 0

    def infer(self, obs):
        self.calls += 1
        if self._error is not None:
            raise self._error
        return {"actions": self._actions}


def _make(buffer, ws, *, obs=None, chunks=None, threshold=5):
    received = chunks if chunks is not None else []
    builder = obs if isinstance(obs, FakeObs) else FakeObs()
    scheduler = InferenceScheduler(
        _action_cfg(),
        buffer,
        builder,
        received.append,
        ws,
        executor=_InlineExecutor(),
        failure_pause_threshold=threshold,
    )
    return scheduler, received


# --- trigger conditions ---------------------------------------------------


def test_should_trigger_on_empty_queue():
    sched, _ = _make(FakeBuffer(0), FakeWs())
    assert sched.should_trigger(0) is True


def test_should_trigger_at_lead_threshold():
    sched, _ = _make(FakeBuffer(0), FakeWs())
    assert sched.should_trigger(2) is True   # lead == 2
    assert sched.should_trigger(3) is False  # above lead


def test_force_overrides_remaining():
    sched, _ = _make(FakeBuffer(0), FakeWs())
    assert sched.should_trigger(99, force=True) is True


def test_maybe_trigger_runs_and_delivers_chunk():
    buffer = FakeBuffer(0)
    ws = FakeWs()
    sched, received = _make(buffer, ws)
    assert sched.maybe_trigger("left") is True
    assert ws.calls == 1
    assert len(received) == 1
    # only the first steps_per_inference rows are handed off
    assert received[0].shape == (4, 7)
    assert sched.success_count == 1


# --- re-entrancy guard ----------------------------------------------------


def test_no_trigger_when_queue_is_full():
    buffer = FakeBuffer(10)  # remaining well above lead
    ws = FakeWs()
    sched, received = _make(buffer, ws)
    assert sched.maybe_trigger("left") is False
    assert ws.calls == 0
    assert received == []


def test_reentrancy_guard_blocks_second_trigger():
    """A slow inference keeps _inflight True so a second call is ignored."""
    buffer = FakeBuffer(0)
    sched_holder = {}

    class SlowWs(FakeWs):
        def infer(self, obs):
            # while we are inside, a nested trigger must be refused
            sched = sched_holder["sched"]
            assert sched.maybe_trigger("left") is False
            return super().infer(obs)

    ws = SlowWs()
    sched, received = _make(buffer, ws)
    sched_holder["sched"] = sched
    assert sched.maybe_trigger("left") is True
    assert ws.calls == 1
    assert len(received) == 1


# --- validation / timeout does not clobber the old queue ------------------


def test_invalid_response_is_rejected_and_keeps_old_queue():
    buffer = FakeBuffer(3)
    # malformed shape -> validators.check returns None -> on_chunk not called
    ws = FakeWs(actions=np.zeros((5, 7), dtype=np.float32))
    sched, received = _make(buffer, ws)
    assert sched.maybe_trigger("left", force=True) is True
    assert received == []           # old queue untouched
    assert sched.reject_count == 1
    assert sched.consecutive_failures == 1


def test_missing_observation_is_skip_not_failure():
    buffer = FakeBuffer(0)
    ws = FakeWs()
    sched, received = _make(buffer, ws, obs=FakeObs(obs=None))
    # obs None -> build returns None -> skip; ws never called
    assert sched.maybe_trigger("left") is True
    assert ws.calls == 0
    assert received == []
    assert sched.consecutive_failures == 0


# --- consecutive failure pause + resume -----------------------------------


def test_pauses_after_threshold_consecutive_failures():
    buffer = FakeBuffer(0)
    ws = FakeWs(error=PolicyServiceError("boom"))
    sched, received = _make(buffer, ws, threshold=5)
    for _ in range(5):
        assert sched.paused is False
        sched.maybe_trigger("left", force=True)
    assert sched.paused is True
    assert sched.consecutive_failures == 5
    # once paused, further triggers are refused
    calls_before = ws.calls
    assert sched.maybe_trigger("left", force=True) is False
    assert ws.calls == calls_before


def test_resume_clears_pause_latch():
    buffer = FakeBuffer(0)
    ws = FakeWs(error=PolicyServiceError("boom"))
    sched, _ = _make(buffer, ws, threshold=2)
    sched.maybe_trigger("left", force=True)
    sched.maybe_trigger("left", force=True)
    assert sched.paused is True
    sched.resume()
    assert sched.paused is False
    assert sched.consecutive_failures == 0


def test_success_resets_consecutive_failures():
    buffer = FakeBuffer(0)
    ws = FakeWs(error=PolicyServiceError("boom"))
    sched, _ = _make(buffer, ws, threshold=5)
    sched.maybe_trigger("left", force=True)
    assert sched.consecutive_failures == 1
    ws._error = None  # service recovers
    sched.maybe_trigger("left", force=True)
    assert sched.consecutive_failures == 0
    assert sched.success_count == 1
