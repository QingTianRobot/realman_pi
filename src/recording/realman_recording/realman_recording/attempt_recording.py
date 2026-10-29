"""Pure rules for recording one session per policy attempt (no ROS import).

The recorder turns /recording/attempt events into its ordinary START/STOP lifecycle; these
helpers build the START goal, the manifest's ``quality.attempt`` record, the machine-written
episode tags and the profile -> LeRobot dataset routing, so they can be tested without a graph.
"""
from __future__ import annotations

from types import SimpleNamespace
from typing import Any, Iterable

# Outcome recorded when a session ends before PolicyRun reported the attempt's result.
NO_RESULT = "no_result"


def parse_profile_repo_ids(entries: Iterable[str]) -> dict[str, str]:
    """``["policy_rollout=realman/pi05-policy-rollouts"]`` -> mapping; blank entries are skipped."""
    mapping: dict[str, str] = {}
    for entry in entries:
        text = str(entry).strip()
        if not text:
            continue
        profile, separator, repo_id = text.partition("=")
        profile, repo_id = profile.strip(), repo_id.strip()
        if not separator or not profile or "/" not in repo_id or profile in mapping:
            raise ValueError(f"lerobot_profile_repo_ids entries must be unique profile=owner/dataset: {text!r}")
        mapping[profile] = repo_id
    return mapping


def repo_id_for_profile(profile: str, mapping: dict[str, str], default: str) -> str:
    return mapping.get(profile.strip(), default)


def attempt_goal(
    *, task: str, max_duration_sec: int, profile: str, stop_margin_sec: int, record_cameras: bool,
) -> SimpleNamespace:
    """A ManageRecording START look-alike for the recorder's ``_prepare``/``_start_session``.

    ``duration_sec`` is the recorder's own countdown: if PolicyRun never reports a RESULT, the
    session still ends ``stop_margin_sec`` after the longest the attempt could have lasted.
    """
    if int(max_duration_sec) <= 0:
        raise ValueError("max_duration_sec must be positive")
    return SimpleNamespace(
        command=0,
        session_id="",
        profile=profile,
        task=task,
        duration_sec=int(max_duration_sec) + max(0, int(stop_margin_sec)),
        record_cameras=bool(record_cameras),
        start_at_walltime_ns=0,
    )


def started_attempt(*, attempt_id: str, task: str, arm: str, prompt: str, stamp_ns: int) -> dict[str, Any]:
    if not attempt_id:
        raise ValueError("attempt_id is required")
    return {"attempt_id": attempt_id, "task": task, "arm": arm, "prompt": prompt,
            "started_ns": str(stamp_ns), "outcome": None, "succeeded": None, "reason": ""}


def finished_attempt(attempt: dict[str, Any], *, outcome: str, succeeded: bool, reason: str) -> dict[str, Any]:
    return {**attempt, "outcome": outcome or NO_RESULT, "succeeded": bool(succeeded), "reason": reason}


def attempt_tags(attempt: dict[str, Any]) -> dict[str, Any]:
    """Episode tags the recorder writes (``episode_tags.auto``); a manual edit still wins."""
    tags: dict[str, Any] = {"success": bool(attempt["succeeded"]), "policy_task": attempt["task"],
                            "attempt_id": attempt["attempt_id"]}
    if not attempt["succeeded"]:
        tags["failure_reason"] = attempt["outcome"]
    return tags
