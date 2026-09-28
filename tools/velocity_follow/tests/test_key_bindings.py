"""Unit tests for velocity_follow.key_bindings."""

from __future__ import annotations

import pytest

from pathlib import Path

from velocity_follow.key_bindings import (
    DEFAULT_LAYOUT,
    KeyBinding,
    code_to_character,
    describe_bindings,
    load_key_bindings,
    parse_arm_bindings,
    read_layout,
)


def _layout():
    return {
        "arms": {
            "l": {
                "vx": {"positive": "KeyW", "negative": "KeyS"},
                "vy": {"positive": "KeyA", "negative": "KeyD"},
                "vz": {"positive": "KeyR", "negative": "KeyF"},
                "wx": {"positive": "KeyQ", "negative": "KeyE"},
                "wy": {"positive": "KeyZ", "negative": "KeyC"},
                "wz": {"positive": "KeyX", "negative": "KeyV"},
            }
        }
    }


def test_code_to_character_translates_letter_and_digit_codes():
    assert code_to_character("KeyW") == "w"
    assert code_to_character("Digit1") == "1"


@pytest.mark.parametrize("code", ["", "Enter", "KeyWW", "Digit", "ShiftLeft", 7])
def test_code_to_character_rejects_codes_with_no_terminal_character(code):
    with pytest.raises(ValueError):
        code_to_character(code)


def test_parse_arm_bindings_covers_every_axis_in_both_directions():
    bindings = parse_arm_bindings(_layout(), "l")
    assert len(bindings) == 12
    assert bindings["w"] == KeyBinding("vx", 1.0)
    assert bindings["s"] == KeyBinding("vx", -1.0)
    assert bindings["v"] == KeyBinding("wz", -1.0)


def test_parse_arm_bindings_rejects_a_missing_arm_or_axis():
    with pytest.raises(ValueError):
        parse_arm_bindings(_layout(), "r")
    broken = _layout()
    del broken["arms"]["l"]["vz"]
    with pytest.raises(ValueError):
        parse_arm_bindings(broken, "l")
    with pytest.raises(ValueError):
        parse_arm_bindings({"arms": {"l": "not-a-mapping"}}, "l")
    with pytest.raises(ValueError):
        parse_arm_bindings("not-a-mapping", "l")


def test_parse_arm_bindings_rejects_a_key_bound_twice():
    duplicated = _layout()
    duplicated["arms"]["l"]["vy"]["positive"] = "KeyW"
    with pytest.raises(ValueError):
        parse_arm_bindings(duplicated, "l")


def test_binding_scales_linear_and_angular_axes_with_their_own_speed():
    assert KeyBinding("vx", 1.0).scaled(0.02, 0.10) == (0.02, 0.0, 0.0, 0.0, 0.0, 0.0)
    assert KeyBinding("wz", -1.0).scaled(0.02, 0.10) == (0.0, 0.0, 0.0, 0.0, 0.0, -0.10)


def test_describe_bindings_lists_every_axis_once():
    text = describe_bindings(parse_arm_bindings(_layout(), "l"))
    assert text.count("\n") == 5
    assert "vx: +w / -s" in text


REPO_ROOT = Path(__file__).resolve().parents[3]
LAYOUT_FILE = REPO_ROOT / "config" / "ros" / "keyboard_control.yaml"


def test_the_builtin_layout_matches_the_authoritative_yaml():
    yaml = pytest.importorskip("yaml")
    if not LAYOUT_FILE.is_file():
        pytest.skip("keyboard_control.yaml is not reachable from this checkout")
    document = yaml.safe_load(LAYOUT_FILE.read_text(encoding="utf-8"))
    # The built-in copy exists so the tool runs without PyYAML or a checkout.
    # If the Web page's key map moves, this catches the drift.
    for arm in ("l", "r"):
        assert parse_arm_bindings(document, arm) == parse_arm_bindings(DEFAULT_LAYOUT, arm)


def test_read_layout_prefers_the_file_and_names_its_source(tmp_path):
    pytest.importorskip("yaml")
    path = tmp_path / "layout.yaml"
    path.write_text(
        "arms:\n  l:\n"
        + "".join(
            f"    {axis}: {{positive: Key{p}, negative: Key{n}}}\n"
            for axis, p, n in (
                ("vx", "W", "S"), ("vy", "A", "D"), ("vz", "R", "F"),
                ("wx", "Q", "E"), ("wy", "Z", "C"), ("wz", "X", "V"),
            )
        ),
        encoding="utf-8",
    )
    layout, source = read_layout(path)
    assert source == str(path)
    assert parse_arm_bindings(layout, "l")["w"] == KeyBinding("vx", 1.0)


@pytest.mark.parametrize(
    "content", ["", "not a mapping", "arms: {}\n", "{[unbalanced"]
)
def test_read_layout_falls_back_instead_of_refusing_to_start(tmp_path, content):
    pytest.importorskip("yaml")
    path = tmp_path / "broken.yaml"
    path.write_text(content, encoding="utf-8")
    layout, source = read_layout(path)
    # An operator asked to drive a robot, not to debug a config file.
    assert "built-in layout" in source
    assert parse_arm_bindings(layout, "l")


def test_read_layout_falls_back_for_a_missing_file_and_for_none(tmp_path):
    layout, source = read_layout(tmp_path / "absent.yaml")
    assert layout is DEFAULT_LAYOUT and "not found" in source
    layout, source = read_layout(None)
    assert layout is DEFAULT_LAYOUT and source == "built-in layout"


def test_load_key_bindings_returns_the_map_and_its_source():
    bindings, source = load_key_bindings(None, "r")
    assert len(bindings) == 12
    assert bindings["i"] == KeyBinding("vx", 1.0)
    assert source == "built-in layout"


def test_load_key_bindings_falls_back_when_the_file_lacks_the_arm(tmp_path):
    pytest.importorskip("yaml")
    path = tmp_path / "left-only.yaml"
    path.write_text(
        "arms:\n  l:\n"
        + "".join(
            f"    {axis}: {{positive: Key{p}, negative: Key{n}}}\n"
            for axis, p, n in (
                ("vx", "W", "S"), ("vy", "A", "D"), ("vz", "R", "F"),
                ("wx", "Q", "E"), ("wy", "Z", "C"), ("wz", "X", "V"),
            )
        ),
        encoding="utf-8",
    )
    bindings, source = load_key_bindings(path, "r")
    assert len(bindings) == 12
    assert "lacks r" in source
