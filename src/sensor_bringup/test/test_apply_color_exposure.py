"""Tests for the ROS-free logic of scripts/apply_color_exposure.py.

The script re-applies a fixed color exposure after a Gemini 305 starts streaming,
because the "auto exposure OFF" the driver writes during startup is lost on the
production devices (it only sticks when set at runtime). The rclpy plumbing is not
exercised here; the ordering and failure rules are.
"""

import importlib.util
from pathlib import Path

import pytest

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "apply_color_exposure.py"


def _load():
    spec = importlib.util.spec_from_file_location("apply_color_exposure", SCRIPT)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@pytest.fixture(scope="module")
def mod():
    return _load()


def test_auto_exposure_is_turned_off_before_exposure_is_set(mod):
    assert mod.build_steps(43) == [
        ("set_color_auto_exposure", False),
        ("set_color_exposure", 43),
    ]


def test_unset_exposure_only_turns_auto_exposure_off(mod):
    assert mod.build_steps(-1) == [("set_color_auto_exposure", False)]


def test_exposure_below_unset_sentinel_is_rejected(mod):
    with pytest.raises(ValueError):
        mod.build_steps(-2)


def test_steps_run_in_order_and_report_success(mod):
    calls = []

    def call(service, value):
        calls.append((service, value))
        return True, ""

    assert mod.run_steps(mod.build_steps(43), call) is True
    assert calls == [("set_color_auto_exposure", False), ("set_color_exposure", 43)]


def test_exposure_is_not_set_when_turning_auto_exposure_off_fails(mod):
    calls = []

    def call(service, value):
        calls.append(service)
        return (False, "device busy") if service == "set_color_auto_exposure" else (True, "")

    assert mod.run_steps(mod.build_steps(43), call) is False
    assert calls == ["set_color_auto_exposure"]


def test_failure_message_is_reported_to_the_logger(mod):
    logged = []

    def call(service, value):
        return False, "device busy"

    mod.run_steps(mod.build_steps(43), call, log=logged.append)
    assert any("set_color_auto_exposure" in line and "device busy" in line for line in logged)


def test_side_and_exposure_are_parsed(mod):
    args = mod.parse_args(["--side", "right", "--exposure", "43"])
    assert (args.side, args.exposure) == ("right", 43)


def test_unknown_side_is_rejected(mod):
    with pytest.raises(SystemExit):
        mod.parse_args(["--side", "top", "--exposure", "43"])


def test_exposure_defaults_to_unset(mod):
    assert mod.parse_args(["--side", "left"]).exposure == -1
