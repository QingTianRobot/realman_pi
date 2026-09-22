#!/usr/bin/env python3
"""Read allowlisted launcher metadata from a behavior-tree XML root."""

from __future__ import annotations

import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path


_ARM_RE = re.compile(r"^[lmr](?:,[lmr])*$")
_ACTION_RE = re.compile(
    r"^(?:execute_motion|cartesian_velocity)"
    r"(?:,(?:execute_motion|cartesian_velocity))*$"
)
_LAUNCHERS = {
    "arm_move": "arm_move.launch.py",
    "control_router": "control_router.launch.py",
}
_BOOLS = {"true", "false"}


def read_metadata(path: Path) -> tuple[str, str, str, str, str, str]:
    """Return arms, actions, launcher, and terminal policies."""

    try:
        root = ET.parse(path).getroot()
    except (OSError, ET.ParseError) as error:
        raise ValueError(f"cannot parse behavior-tree XML {path}: {error}") from error
    if root.tag != "root":
        raise ValueError(f"behavior-tree XML {path} must have a root <root> element")

    arm_id = root.attrib.get("realman_arm_id", "r")
    required_arms = root.attrib.get("realman_required_arms", arm_id)
    required_actions = root.attrib.get(
        "realman_required_actions", "execute_motion"
    )
    launch_name = root.attrib.get("realman_launch", "arm_move")
    stop_on_terminal = root.attrib.get("realman_stop_on_terminal", "true")
    exit_on_terminal = root.attrib.get("realman_exit_on_terminal", "true")

    if arm_id not in {"l", "m", "r"}:
        raise ValueError(f"realman_arm_id must be l, m, or r (got {arm_id!r})")
    if not _ARM_RE.fullmatch(required_arms):
        raise ValueError(
            "realman_required_arms must be a comma-separated list of l, m, and r "
            f"(got {required_arms!r})"
        )
    required = required_arms.split(",")
    if len(required) != len(set(required)):
        raise ValueError(f"realman_required_arms contains a duplicate arm (got {required_arms!r})")
    if not _ACTION_RE.fullmatch(required_actions):
        raise ValueError(
            "realman_required_actions must be a comma-separated list of "
            "execute_motion and cartesian_velocity "
            f"(got {required_actions!r})"
        )
    required_action_list = required_actions.split(",")
    if len(required_action_list) != len(set(required_action_list)):
        raise ValueError(
            "realman_required_actions contains a duplicate action "
            f"(got {required_actions!r})"
        )
    if launch_name not in _LAUNCHERS:
        raise ValueError(
            f"realman_launch must be one of {', '.join(sorted(_LAUNCHERS))} "
            f"(got {launch_name!r})"
        )
    if stop_on_terminal not in _BOOLS:
        raise ValueError(f"realman_stop_on_terminal must be true or false (got {stop_on_terminal!r})")
    if exit_on_terminal not in _BOOLS:
        raise ValueError(f"realman_exit_on_terminal must be true or false (got {exit_on_terminal!r})")

    return (
        arm_id,
        required_arms,
        required_actions,
        _LAUNCHERS[launch_name],
        stop_on_terminal,
        exit_on_terminal,
    )


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print(f"usage: {argv[0]} TREE.xml", file=sys.stderr)
        return 2
    try:
        print("\t".join(read_metadata(Path(argv[1]))))
    except ValueError as error:
        print(f"[bt-start] {error}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
