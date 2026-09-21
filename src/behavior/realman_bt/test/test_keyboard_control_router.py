from concurrent.futures import Future
from pathlib import Path
import sys
from types import SimpleNamespace

import pytest


ROOT = Path(__file__).parents[4]
ROUTER = ROOT / "src/behavior/realman_bt/scripts/keyboard_control_router.py"
sys.path.insert(0, str(ROUTER.parent))


def test_router_constructs_only_left_and_right_resources():
    source = ROUTER.read_text(encoding="utf-8")
    assert 'for arm in ("l", "r")' in source
    assert 'f"/keyboard/{arm}/cartesian_velocity"' in source
    assert 'f"/{arm}/cartesian_velocity/command"' in source
    assert '"/keyboard/m/cartesian_velocity"' not in source


def test_router_requires_active_keyboard_and_verified_default_work():
    source = ROUTER.read_text(encoding="utf-8")
    assert 'message.active_mode == "keyboard"' in source
    assert 'state.get("work_matched") is True' in source
    assert 'state.get("motion_allowed") is True' in source
    assert "CartesianVelocity.Goal.WORK" in source
    assert "CartesianVelocity.Goal.BASE" not in source


def test_router_stops_on_timeout_mode_loss_and_shutdown():
    source = ROUTER.read_text(encoding="utf-8")
    assert "input_timeout_ms" in source
    assert "_publish_zero" in source
    assert "_cancel" in source
    assert "cancel_after_accept" in source
    assert "destroy_node" in source
    assert "self.dry_run" in source


def test_profile_parser_resolves_only_l_r_default_work_and_motion_limits():
    from keyboard_control_router import parse_arm_profiles

    profiles = parse_arm_profiles(
        [
            "l|default_work|1|cell|l/work/cell",
            "m|default_work|1|cell|m/work/cell",
            "r|default_work|1|cell|r/work/cell",
        ],
        [
            "l|20|100|0.05|0.25|0.1|0.5|10|2",
            "m|20|100|0.05|0.25|0.1|0.5|10|2",
            "r|20|100|0.05|0.25|0.1|0.5|10|2",
        ],
    )
    assert set(profiles) == {"l", "r"}
    assert profiles["l"].reference_name == "cell"
    assert profiles["l"].frame_id == "l/work/cell"
    assert profiles["r"].control_period_ms == 20


def test_profile_parser_rejects_base_or_missing_default_work():
    from keyboard_control_router import parse_arm_profiles

    with pytest.raises(ValueError, match="default WORK"):
        parse_arm_profiles(
            ["l|base|0|base|l/base_link", "r|default_work|1|cell|r/work/cell"],
            [
                "l|20|100|0.05|0.25|0.1|0.5|10|2",
                "r|20|100|0.05|0.25|0.1|0.5|10|2",
            ],
        )


def test_late_accepted_goal_is_cancelled_after_mode_loss():
    from keyboard_control_router import KeyboardControlRouter, _ArmProfile, _ArmState

    class Handle:
        accepted = True

        def __init__(self):
            self.cancelled = False

        def cancel_goal_async(self):
            self.cancelled = True
            future = Future()
            future.set_result(SimpleNamespace())
            return future

    router = KeyboardControlRouter.__new__(KeyboardControlRouter)
    router.mode = ""
    router.input_timeout_ms = 150
    router.get_logger = lambda: SimpleNamespace(error=lambda _message: None, warning=lambda _message: None, info=lambda _message: None)
    profile = _ArmProfile("cell", "l/work/cell", 20, 100, 0.05, 0.25, 0.1, 0.5)
    pending = Future()
    state = _ArmState(SimpleNamespace(), SimpleNamespace(), profile, pending_goal=pending,
                      last_input_at=1.0, work_available=True, cancel_after_accept=True)
    router._arms = {"l": state}
    handle = Handle()
    pending.set_result(handle)

    router._goal_response("l", pending)

    assert handle.cancelled
    assert state.goal_handle is None
