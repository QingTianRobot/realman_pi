"""Reuse the authoritative Web keyboard layout for terminal key input.

``config/ros/keyboard_control.yaml`` owns which physical key drives which axis.
The browser reports ``KeyboardEvent.code`` values such as ``KeyW``; a terminal
delivers the typed character instead, so the codes are translated once here and
the operator keeps muscle memory between the Web page and this harness.

``DEFAULT_LAYOUT`` mirrors that file so the tool runs from a bare Python with no
PyYAML and no checkout. When the YAML is readable it wins, because it is the
contract the Web page actually uses; a drift between the two is caught by the
test that loads both.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Mapping

from .axes import AXIS_NAMES, ZERO_COMMAND, axis_index


@dataclass(frozen=True)
class KeyBinding:
    """One terminal character mapped onto a signed Cartesian axis."""

    axis: str
    sign: float

    def scaled(self, linear_speed: float, angular_speed: float) -> tuple[float, ...]:
        """Return the six-axis command this key produces on its own."""
        index = axis_index(self.axis)
        speed = linear_speed if index < 3 else angular_speed
        command = list(ZERO_COMMAND)
        command[index] = self.sign * speed
        return tuple(command)


def code_to_character(code: str) -> str:
    """Translate a ``KeyboardEvent.code`` into the character a terminal sends."""
    if not isinstance(code, str) or not code:
        raise ValueError("key code must be a non-empty string")
    if code.startswith("Key") and len(code) == 4:
        return code[3].lower()
    if code.startswith("Digit") and len(code) == 6:
        return code[5]
    raise ValueError(
        f"key code {code!r} has no terminal character; use KeyX or DigitN codes"
    )


def parse_arm_bindings(layout: Mapping[str, Any], arm: str) -> dict[str, KeyBinding]:
    """Build the character map for one arm from the keyboard layout mapping."""
    if not isinstance(layout, Mapping):
        raise ValueError("keyboard layout must be a mapping")
    arms = layout.get("arms")
    if not isinstance(arms, Mapping) or arm not in arms:
        raise ValueError(f"keyboard layout has no arms.{arm} section")
    axes = arms[arm]
    if not isinstance(axes, Mapping):
        raise ValueError(f"arms.{arm} must be a mapping of axis to key pair")

    bindings: dict[str, KeyBinding] = {}
    for axis in AXIS_NAMES:
        pair = axes.get(axis)
        if not isinstance(pair, Mapping):
            raise ValueError(f"arms.{arm}.{axis} must define positive and negative keys")
        for direction, sign in (("positive", 1.0), ("negative", -1.0)):
            code = pair.get(direction)
            if not isinstance(code, str):
                raise ValueError(f"arms.{arm}.{axis}.{direction} must be a key code")
            character = code_to_character(code)
            if character in bindings:
                raise ValueError(
                    f"key {code!r} is bound twice for arm {arm}; codes must be unique"
                )
            bindings[character] = KeyBinding(axis, sign)
    return bindings


# Kept in step with config/ros/keyboard_control.yaml; the loader prefers that file.
DEFAULT_LAYOUT: dict[str, Any] = {
    "arms": {
        "l": {
            "vx": {"positive": "KeyW", "negative": "KeyS"},
            "vy": {"positive": "KeyA", "negative": "KeyD"},
            "vz": {"positive": "KeyR", "negative": "KeyF"},
            "wx": {"positive": "KeyQ", "negative": "KeyE"},
            "wy": {"positive": "KeyZ", "negative": "KeyC"},
            "wz": {"positive": "KeyX", "negative": "KeyV"},
        },
        "r": {
            "vx": {"positive": "KeyI", "negative": "KeyK"},
            "vy": {"positive": "KeyJ", "negative": "KeyL"},
            "vz": {"positive": "KeyU", "negative": "KeyO"},
            "wx": {"positive": "KeyY", "negative": "KeyP"},
            "wy": {"positive": "KeyN", "negative": "KeyM"},
            "wz": {"positive": "KeyB", "negative": "KeyG"},
        },
    }
}


def read_layout(config_path: Path | str | None) -> tuple[dict[str, Any], str]:
    """Return the keyboard layout and where it came from.

    A missing file, a missing PyYAML or an unparseable document all fall back to
    the built-in copy rather than refusing to start: the operator asked to drive
    a robot, not to debug a config path.
    """
    if config_path is None:
        return DEFAULT_LAYOUT, "built-in layout"
    path = Path(config_path)
    if not path.is_file():
        return DEFAULT_LAYOUT, f"built-in layout ({path} not found)"
    try:
        import yaml
    except ImportError:
        return DEFAULT_LAYOUT, "built-in layout (PyYAML not installed)"
    try:
        layout = yaml.safe_load(path.read_text(encoding="utf-8"))
    except Exception as error:
        return DEFAULT_LAYOUT, f"built-in layout ({path} is unreadable: {error})"
    arms = layout.get("arms") if isinstance(layout, Mapping) else None
    if not isinstance(arms, Mapping) or not arms:
        return DEFAULT_LAYOUT, f"built-in layout ({path} has no arms section)"
    return dict(layout), str(path)


def load_key_bindings(
    config_path: Path | str | None, arm: str
) -> tuple[dict[str, KeyBinding], str]:
    """Return the arm's character map and the layout source that produced it."""
    layout, source = read_layout(config_path)
    try:
        return parse_arm_bindings(layout, arm), source
    except ValueError:
        if layout is DEFAULT_LAYOUT:
            raise
        # A file that parses but does not describe this arm is worse than no
        # file: fall back rather than leaving the operator with no keys.
        return parse_arm_bindings(DEFAULT_LAYOUT, arm), f"built-in layout ({source} lacks {arm})"


def describe_bindings(bindings: Mapping[str, KeyBinding]) -> str:
    """Render a one-line-per-axis operator cheat sheet."""
    by_axis: dict[str, dict[float, str]] = {}
    for character, binding in bindings.items():
        by_axis.setdefault(binding.axis, {})[binding.sign] = character
    lines = []
    for axis in AXIS_NAMES:
        directions = by_axis.get(axis)
        if not directions:
            continue
        positive = directions.get(1.0, "-")
        negative = directions.get(-1.0, "-")
        lines.append(f"  {axis}: +{positive} / -{negative}")
    return "\n".join(lines)


__all__ = [
    "DEFAULT_LAYOUT",
    "KeyBinding",
    "code_to_character",
    "describe_bindings",
    "load_key_bindings",
    "parse_arm_bindings",
    "read_layout",
]
