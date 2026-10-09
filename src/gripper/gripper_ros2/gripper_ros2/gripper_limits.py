"""Validation and persistence of the web-editable gripper travel endpoints.

Only ``open_position`` and ``close_position`` are editable at runtime. They are
stored in a small overrides file next to ``gripper.yaml`` so the hand-written
configuration (comments, ``min_position``/``max_position``) is never rewritten.
"""

from __future__ import annotations

import os
import tempfile
from pathlib import Path

import yaml


OVERRIDES_FILENAME = "gripper_overrides.yaml"
LIMIT_FIELDS = ("open_position", "close_position")
# The open..close span must cover at least this fraction of min..max so the
# percentage mapping cannot collapse into a single point.
MIN_SPAN_FRACTION = 0.05


def _is_int(value) -> bool:
    return isinstance(value, int) and not isinstance(value, bool)


def validate_limits(open_position, close_position, min_position, max_position) -> str | None:
    """Return the reason the endpoints are unacceptable, or ``None`` when valid."""
    if not _is_int(open_position) or not _is_int(close_position):
        return "open_position and close_position must be integers"
    if not min_position <= open_position <= max_position:
        return f"open_position {open_position} is outside {min_position}..{max_position}"
    if not min_position <= close_position <= max_position:
        return f"close_position {close_position} is outside {min_position}..{max_position}"
    if open_position >= close_position:
        return "open_position must be smaller than close_position"
    minimum_span = MIN_SPAN_FRACTION * (max_position - min_position)
    if close_position - open_position < minimum_span:
        return f"close_position - open_position must be at least {minimum_span:g}"
    return None


def check_raw_position(position, min_position, max_position) -> str | None:
    """Return the reason a raw jog target is unacceptable, or ``None``."""
    if not _is_int(position):
        return "position must be an integer"
    if not min_position <= position <= max_position:
        return f"position {position} is outside {min_position}..{max_position}"
    return None


def position_ranges(config: dict) -> dict[str, tuple[int, int]]:
    """Map every configured gripper name to its ``(min_position, max_position)``."""
    return {
        gripper["name"]: (gripper["min_position"], gripper["max_position"])
        for bus in config["buses"]
        for gripper in bus["grippers"]
    }


def overrides_path(config_file, override: str = "") -> Path:
    return Path(override) if override else Path(config_file).with_name(OVERRIDES_FILENAME)


def load_overrides(path, ranges) -> tuple[dict[str, dict[str, int]], list[str]]:
    """Read the overrides file; return ``(accepted entries, problems)``.

    A missing or empty file is normal. Anything unreadable or invalid is
    reported in ``problems`` and skipped so the node still starts from
    ``gripper.yaml``.
    """
    path = Path(path)
    try:
        document = yaml.safe_load(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return {}, []
    except (OSError, UnicodeError, yaml.YAMLError) as error:
        return {}, [f"{path}: cannot read overrides: {error}"]
    if not document:
        return {}, []
    grippers = document.get("grippers") if isinstance(document, dict) else None
    if not isinstance(grippers, dict):
        return {}, [f"{path}: expected a 'grippers' mapping"]
    accepted, problems = {}, []
    for name, entry in grippers.items():
        if name not in ranges:
            problems.append(f"{path}: unknown gripper {name!r}")
            continue
        if not isinstance(entry, dict):
            problems.append(f"{path}: {name} must be a mapping")
            continue
        minimum, maximum = ranges[name]
        problem = validate_limits(
            entry.get("open_position"), entry.get("close_position"), minimum, maximum,
        )
        if problem:
            problems.append(f"{path}: {name}: {problem}")
            continue
        accepted[name] = {field: entry[field] for field in LIMIT_FIELDS}
    return accepted, problems


def save_overrides(path, overrides) -> None:
    """Atomically write the overrides file (temp file, fsync, ``os.replace``)."""
    path = Path(path)
    document = {
        "grippers": {
            name: {field: int(entry[field]) for field in LIMIT_FIELDS}
            for name, entry in sorted(overrides.items())
        }
    }
    text = (
        "# Written by gripper_manager from the web UI.\n"
        "# Delete this file to fall back to gripper.yaml.\n"
        + yaml.safe_dump(document, sort_keys=False)
    )
    descriptor, temporary = tempfile.mkstemp(
        dir=path.parent, prefix=f".{path.name}.", suffix=".tmp",
    )
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as handle:
            handle.write(text)
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(temporary, 0o644)
        os.replace(temporary, path)
    except BaseException:
        try:
            os.unlink(temporary)
        except OSError:
            pass
        raise


def apply_overrides(config: dict, overrides: dict) -> None:
    """Overlay accepted overrides onto a loaded ``gripper.yaml`` document."""
    for bus in config["buses"]:
        for gripper in bus["grippers"]:
            entry = overrides.get(gripper["name"])
            if entry:
                gripper.update({field: entry[field] for field in LIMIT_FIELDS})
