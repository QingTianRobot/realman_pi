"""Unit tests for policy_bridge.mode.mode_watcher."""

from __future__ import annotations

from policy_bridge.config_loader import ModeConfig, ModeMapping
from policy_bridge.mode.mode_watcher import (
    ACTIVE_PHASE,
    ModeWatcher,
    resolve_internal_mode,
)


SWITCHING_PHASE = 1
FAILED_PHASE = 2


def _mode_cfg() -> ModeConfig:
    return ModeConfig(
        topic="/realman_bt_executor/input_mode_state",
        mapping=ModeMapping(
            velocity_modes=frozenset({"policy"}),
            position_modes=frozenset({"policy_position"}),
            inactive_modes=frozenset({"web", "pika", "none"}),
        ),
        default_when_unknown="inactive",
    )


class _FakeLogger:
    def __init__(self) -> None:
        self.infos: list[str] = []
        self.warns: list[str] = []

    def info(self, message: str) -> None:
        self.infos.append(message)

    def warn(self, message: str) -> None:
        self.warns.append(message)


class _FakeNode:
    def __init__(self) -> None:
        self._logger = _FakeLogger()

    def get_logger(self) -> _FakeLogger:
        return self._logger


def test_resolve_maps_policy_active_to_velocity():
    internal, known = resolve_internal_mode("policy", ACTIVE_PHASE, _mode_cfg().mapping, "inactive")
    assert internal == "velocity"
    assert known is True


def test_resolve_maps_position_mode():
    internal, _ = resolve_internal_mode("policy_position", ACTIVE_PHASE, _mode_cfg().mapping, "inactive")
    assert internal == "position"


def test_non_active_phase_collapses_to_inactive():
    for phase in (SWITCHING_PHASE, FAILED_PHASE):
        internal, known = resolve_internal_mode("policy", phase, _mode_cfg().mapping, "inactive")
        assert internal == "inactive"
        assert known is True


def test_inactive_modes_map_to_inactive():
    for mode in ("web", "pika", "none"):
        internal, known = resolve_internal_mode(mode, ACTIVE_PHASE, _mode_cfg().mapping, "inactive")
        assert internal == "inactive"
        assert known is True


def test_unknown_mode_uses_default_and_reports_unknown():
    internal, known = resolve_internal_mode("futuremode", ACTIVE_PHASE, _mode_cfg().mapping, "inactive")
    assert internal == "inactive"
    assert known is False


def test_watcher_transition_fires_callback_once():
    node = _FakeNode()
    changes: list[str] = []
    watcher = ModeWatcher(node, _mode_cfg(), changes.append)
    assert watcher.internal_mode == "inactive"

    watcher.update("policy", ACTIVE_PHASE)
    assert watcher.internal_mode == "velocity"
    assert changes == ["velocity"]

    # Same state again -> no duplicate callback.
    watcher.update("policy", ACTIVE_PHASE)
    assert changes == ["velocity"]


def test_watcher_switching_phase_drops_to_inactive():
    changes: list[str] = []
    watcher = ModeWatcher(_FakeNode(), _mode_cfg(), changes.append)
    watcher.update("policy", ACTIVE_PHASE)
    watcher.update("policy", SWITCHING_PHASE)
    assert watcher.internal_mode == "inactive"
    assert changes == ["velocity", "inactive"]


def test_watcher_warns_once_for_unknown_mode():
    node = _FakeNode()
    watcher = ModeWatcher(node, _mode_cfg(), lambda _mode: None)
    watcher.update("futuremode", ACTIVE_PHASE)
    watcher.update("futuremode", ACTIVE_PHASE)
    assert len(node.get_logger().warns) == 1
    assert "futuremode" in node.get_logger().warns[0]
