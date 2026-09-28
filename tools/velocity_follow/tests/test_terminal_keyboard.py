"""Unit tests for velocity_follow.terminal_keyboard."""

from __future__ import annotations

import io

import pytest

from velocity_follow.key_bindings import KeyBinding
from velocity_follow.terminal_keyboard import (
    KeyHoldTracker,
    RawTerminalReader,
    is_quit,
)


def _tracker(**overrides):
    settings = {
        "hold_timeout_sec": 0.25,
        "linear_speed_mps": 0.02,
        "angular_speed_radps": 0.10,
    }
    settings.update(overrides)
    return KeyHoldTracker(
        {
            "w": KeyBinding("vx", 1.0),
            "s": KeyBinding("vx", -1.0),
            "a": KeyBinding("vy", 1.0),
            "x": KeyBinding("wz", 1.0),
        },
        **settings,
    )


def test_a_press_drives_its_axis_until_the_hold_expires():
    tracker = _tracker()
    assert tracker.press("w", 0.0) is True
    assert tracker.command_at(0.0)[0] == pytest.approx(0.02)
    assert tracker.command_at(0.24)[0] == pytest.approx(0.02)
    # No terminal reports key release, so the axis stops once repeats stop.
    assert tracker.command_at(0.25) == (0.0,) * 6


def test_auto_repeat_refreshes_the_hold():
    tracker = _tracker()
    tracker.press("w", 0.0)
    tracker.press("w", 0.2)
    assert tracker.command_at(0.4)[0] == pytest.approx(0.02)
    assert tracker.command_at(0.45) == (0.0,) * 6


def test_the_opposite_key_replaces_rather_than_cancels_its_axis():
    tracker = _tracker()
    tracker.press("w", 0.0)
    tracker.press("s", 0.01)
    assert tracker.command_at(0.02)[0] == pytest.approx(-0.02)


def test_separate_axes_combine():
    tracker = _tracker()
    tracker.press("w", 0.0)
    tracker.press("a", 0.0)
    tracker.press("x", 0.0)
    command = tracker.command_at(0.1)
    assert command[0] == pytest.approx(0.02)
    assert command[1] == pytest.approx(0.02)
    assert command[5] == pytest.approx(0.10)
    assert tracker.active_axes == ("vx", "vy", "wz")


def test_unbound_characters_are_counted_but_ignored():
    tracker = _tracker()
    assert tracker.press("k", 0.0) is False
    assert tracker.command_at(0.0) == (0.0,) * 6
    assert tracker.ignored_count == 1
    assert tracker.press_count == 0
    tracker.press("w", 0.0)
    assert tracker.press_count == 1


def test_release_all_stops_every_axis_at_once():
    tracker = _tracker()
    tracker.press("w", 0.0)
    tracker.press("a", 0.0)
    tracker.release_all()
    assert tracker.command_at(0.0) == (0.0,) * 6


@pytest.mark.parametrize(
    "settings",
    [
        {"hold_timeout_sec": 0.0},
        {"linear_speed_mps": 0.0},
        {"angular_speed_radps": -1.0},
    ],
)
def test_tracker_rejects_non_positive_settings(settings):
    with pytest.raises(ValueError):
        _tracker(**settings)


def test_quit_characters_are_ctrl_c_and_escape_only():
    assert is_quit("\x03")
    assert is_quit("\x1b")
    assert not is_quit("q")
    assert not is_quit("w")


def test_reader_reports_no_support_for_a_non_tty_stream():
    reader = RawTerminalReader(io.StringIO("wasd"))
    assert reader.supported is False
    with reader:
        # Entering is a no-op without a TTY, and reading yields nothing rather
        # than raising, so the node can fall back to the scripted profile.
        assert reader.read_pending() == []


def test_no_motion_key_of_either_arm_is_also_a_quit_key():
    from velocity_follow.key_bindings import DEFAULT_LAYOUT, parse_arm_bindings

    # The left arm's +wx is q; a quit on q ended runs on the first rotation.
    for arm in ("l", "r"):
        for character in parse_arm_bindings(DEFAULT_LAYOUT, arm):
            assert not is_quit(character), (arm, character)
