"""Tests for the post-start fixed-exposure step in cameras_ros2.launch.py.

Needs a sourced ROS 2 environment (launch, launch_ros, ament_index_python); skipped
elsewhere. Only the per-camera decision and command are checked, not a full launch.
"""

import importlib.util
from pathlib import Path

import pytest

pytest.importorskip("launch")
pytest.importorskip("launch_ros")
pytest.importorskip("ament_index_python")

LAUNCH = Path(__file__).resolve().parents[1] / "launch" / "cameras_ros2.launch.py"


@pytest.fixture(scope="module")
def mod():
    spec = importlib.util.spec_from_file_location("cameras_ros2_launch", LAUNCH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _streams(auto_exposure, exposure):
    return {"enable_color_auto_exposure": auto_exposure, "color_exposure": exposure}


def _words(action):
    return [substitution.text for part in action.cmd for substitution in part]


def test_no_post_start_step_when_auto_exposure_stays_on(mod):
    assert mod._exposure_apply_action("left", _streams("true", "-1")) is None


def test_fixed_exposure_camera_gets_a_post_start_step(mod):
    action = mod._exposure_apply_action("right", _streams("false", "43"))
    words = _words(action)
    assert words[1].endswith("apply_color_exposure.py")
    assert words[2:] == ["--side", "right", "--exposure", "43"]


def test_auto_exposure_off_without_a_value_still_gets_a_step(mod):
    words = _words(mod._exposure_apply_action("middle", _streams("false", "-1")))
    assert words[2:] == ["--side", "middle", "--exposure", "-1"]


def test_missing_script_skips_the_step_instead_of_breaking_the_launch(mod, monkeypatch, capsys):
    monkeypatch.setattr(mod, "_exposure_apply_script", lambda: None)
    assert mod._exposure_apply_action("right", _streams("false", "43")) is None
    assert "apply_color_exposure.py" in capsys.readouterr().err


# A minimal config whose middle wrist camera is disabled, to exercise the
# per-device ``enabled`` flag without touching the real cameras_ros2.yaml.
_DISABLED_MIDDLE_CONFIG = {
    "wrist_cameras": {
        "mode": "color",
        "devices": {
            "left": {"serial": "L"},
            "middle": {"serial": "M", "enabled": False},
            "right": {"serial": "R"},
        },
    },
    "global_camera": {},
}


def test_load_defaults_marks_disabled_side(mod, monkeypatch):
    monkeypatch.setattr(mod, "_load_config", lambda: _DISABLED_MIDDLE_CONFIG)
    defaults = mod._load_defaults()
    assert defaults["sides"]["left"]["enabled"] is True
    assert defaults["sides"]["middle"]["enabled"] is False
    assert defaults["sides"]["right"]["enabled"] is True


def test_use_flag_default_maps_enabled(mod):
    assert mod._use_flag_default(True) == "true"
    assert mod._use_flag_default(False) == "false"
