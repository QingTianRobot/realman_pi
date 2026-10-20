"""Per-episode quality verdicts for raw or cleaned RealMan recordings.

The rules reproduce the 2026-10-13 and 2026-10-16 manual cleanings. Drop-severity findings are suggestions:
the console pre-checks them and a person confirms before anything is removed.
"""

from __future__ import annotations

import dataclasses
from pathlib import Path

import numpy as np

from .config import QualityConfig
from .lerobot_io import read_episode_columns, read_episodes, read_info

GRIPPER_COLUMN = "observation.gripper_position"
JOINT_COLUMN = "observation.joint_position"
ARM_INDEX = {"l": 0, "m": 1, "r": 2}


@dataclasses.dataclass(frozen=True)
class Finding:
    code: str
    severity: str  # drop | warn
    message: str


@dataclasses.dataclass(frozen=True)
class EpisodeQuality:
    episode: int
    task: str
    frames: int
    verdict: str  # suggest_drop | warn | ok
    findings: tuple[Finding, ...]

    def to_dict(self) -> dict:
        return dataclasses.asdict(self)


class QualityUnavailable(ValueError):
    """The dataset has no raw gripper readings to judge (a training view, or another robot)."""


def _runs(mask: np.ndarray) -> list[tuple[bool, int, int]]:
    """(value, start, end) for each run of equal values; end is exclusive."""
    runs, start = [], 0
    for i in range(1, len(mask) + 1):
        if i == len(mask) or mask[i] != mask[start]:
            runs.append((bool(mask[start]), start, i))
            start = i
    return runs


def check_episode(
    task: str, gripper: np.ndarray, joints_deg: np.ndarray, fps: float, config: QualityConfig
) -> tuple[Finding, ...]:
    findings: list[Finding] = []

    def drop(code: str, message: str) -> None:
        findings.append(Finding(code, "drop", message))

    def warn(code: str, message: str) -> None:
        findings.append(Finding(code, "warn", message))

    threshold = config.closed_threshold_raw
    closed = gripper > threshold
    start_frames = max(1, int(round(config.start_closed_sec * fps)))
    starts_closed = bool(closed[:start_frames].any())
    if starts_closed:
        drop(
            "start_closed",
            f"gripper closed in the first {config.start_closed_sec:g} s (max reading {gripper[:start_frames].max():.0f})",
        )
    if not closed.any():
        drop("never_closed", f"never closed: max reading {gripper.max():.0f} <= {threshold:.0f}")
    else:
        rising = int(np.count_nonzero(closed[1:] & ~closed[:-1]))
        if rising >= 2:
            drop("regrasp", f"{rising} closing events (re-grasp)")
        runs = _runs(closed)
        gaps = [
            (start, end)
            for k, (value, start, end) in enumerate(runs)
            if not value and 0 < k < len(runs) - 1 and end - start <= config.glitch_max_frames
        ]
        if gaps:
            start, end = gaps[0]
            drop("glitch", f"closed reading interrupted for {end - start} frame(s) at frame {start}")
        _, run_start, run_end = [run for run in runs if run[0]][-1]
        window = max(1, int(round(config.plateau_window_sec * fps)))
        plateau = float(np.median(gripper[max(run_start, run_end - window) : run_end]))
        if plateau >= config.empty_position_min:
            drop(
                "closed_on_nothing",
                f"closed plateau {plateau:.0f} >= {config.empty_position_min:.0f}: the jaws met on nothing",
            )
        if task in config.release_tasks and closed[-1]:
            drop("no_release", f"task {task} ends with the gripper still closed (no release)")
    if not starts_closed and gripper[0] > config.start_partial_raw:
        warn("start_partial", f"first reading {gripper[0]:.0f} is above {config.start_partial_raw:.0f} (not fully open)")
    if config.start_pose_deg and len(joints_deg):
        deviation = np.abs(joints_deg[0] - np.asarray(config.start_pose_deg))
        if deviation.max() > config.start_pose_tol_deg:
            joint = int(deviation.argmax()) + 1
            warn("start_pose", f"first frame is {deviation.max():.1f} deg from the start pose (J{joint})")
    return tuple(findings)


def _verdict(findings: tuple[Finding, ...]) -> str:
    if any(f.severity == "drop" for f in findings):
        return "suggest_drop"
    return "warn" if findings else "ok"


def inspect(root: str | Path, config: QualityConfig) -> list[EpisodeQuality]:
    info = read_info(root)
    for column in (GRIPPER_COLUMN, JOINT_COLUMN):
        if column not in info.get("features", {}):
            raise QualityUnavailable(
                f"{root}: no {column}; a training view has no raw gripper readings, inspect its cleaned source"
            )
    fps = float(info["fps"])
    arm = ARM_INDEX[config.arm]
    results = []
    for episode in read_episodes(root):
        columns = read_episode_columns(episode, [GRIPPER_COLUMN, JOINT_COLUMN])
        gripper = columns[GRIPPER_COLUMN][:, arm]
        joints = np.degrees(columns[JOINT_COLUMN][:, arm * 6 : arm * 6 + 6])
        findings = check_episode(episode.task, gripper, joints, fps, config)
        results.append(EpisodeQuality(episode.index, episode.task, episode.length, _verdict(findings), findings))
    return results


def suggested_drops(results: list[EpisodeQuality]) -> list[int]:
    return [r.episode for r in results if r.verdict == "suggest_drop"]
