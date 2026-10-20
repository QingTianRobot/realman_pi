"""Console configuration: config/training/training_console.yaml on top of built-in defaults."""

from __future__ import annotations

import dataclasses
import os
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).resolve().parents[4]
DEFAULT_CONFIG = REPO_ROOT / "config" / "training" / "training_console.yaml"
ENV_CONFIG = "REALMAN_TRAINING_CONFIG"
ARMS = ("l", "m", "r")


@dataclasses.dataclass(frozen=True)
class QualityConfig:
    """Per-episode rules; the numbers come from the 2026-10-13 and 2026-10-16 manual cleanings."""

    arm: str = "r"
    gripper_open_raw: float = 50.0
    gripper_close_raw: float = 8500.0
    closed_threshold_raw: float = 4275.0  # halfway between open and closed
    start_closed_sec: float = 1.0
    glitch_max_frames: int = 2
    plateau_window_sec: float = 3.0
    empty_position_min: float = 8300.0
    start_partial_raw: float = 300.0
    release_tasks: tuple[str, ...] = ("pick_and_place",)
    start_pose_deg: tuple[float, ...] = (-9.89, 18.04, 79.08, 15.51, 79.60, -6.20)
    start_pose_tol_deg: float = 2.0


@dataclasses.dataclass(frozen=True)
class ConsoleConfig:
    data_root: Path = dataclasses.field(default_factory=lambda: Path("~/data/realman").expanduser())
    quality: QualityConfig = dataclasses.field(default_factory=QualityConfig)


def load_config(path: str | Path | None = None) -> ConsoleConfig:
    source = Path(path or os.environ.get(ENV_CONFIG) or DEFAULT_CONFIG)
    document = yaml.safe_load(source.read_text(encoding="utf-8")) or {}
    section = document.get("training_console") if isinstance(document, dict) else None
    if not isinstance(section, dict):
        raise ValueError(f"{source}: missing the training_console section")
    quality = _quality(section.get("quality") or {}, source)
    data_root = Path(str(section.get("data_root", "~/data/realman"))).expanduser()
    return ConsoleConfig(data_root=data_root, quality=quality)


def _quality(raw: dict, source: Path) -> QualityConfig:
    defaults = QualityConfig()
    fields = {field.name: field for field in dataclasses.fields(QualityConfig)}
    unknown = sorted(set(raw) - set(fields))
    if unknown:
        raise ValueError(f"{source}: unknown quality keys {unknown}")
    values = {}
    for name, value in raw.items():
        default = getattr(defaults, name)
        try:
            if isinstance(default, tuple):
                values[name] = tuple(type(default[0])(item) if default else item for item in value)
            elif isinstance(default, int):
                values[name] = int(value)
            elif isinstance(default, float):
                values[name] = float(value)
            else:
                values[name] = str(value)
        except (TypeError, ValueError) as error:
            raise ValueError(f"{source}: quality.{name}: {error}") from None
    quality = dataclasses.replace(defaults, **values)
    _validate(quality, source)
    return quality


def _validate(q: QualityConfig, source: Path) -> None:
    def fail(key: str, why: str) -> None:
        raise ValueError(f"{source}: quality.{key} {why}")

    if q.arm not in ARMS:
        fail("arm", f"must be one of {ARMS}")
    if not q.gripper_open_raw < q.closed_threshold_raw < q.gripper_close_raw:
        fail("closed_threshold_raw", "must lie between gripper_open_raw and gripper_close_raw")
    if not q.gripper_open_raw < q.empty_position_min <= q.gripper_close_raw:
        fail("empty_position_min", "must lie in (gripper_open_raw, gripper_close_raw]")
    if q.glitch_max_frames < 1:
        fail("glitch_max_frames", "must be at least 1")
    for key in ("start_closed_sec", "plateau_window_sec", "start_pose_tol_deg"):
        if getattr(q, key) <= 0:
            fail(key, "must be positive")
    if len(q.start_pose_deg) not in (0, 6):
        fail("start_pose_deg", "must list six joint angles or be empty")
