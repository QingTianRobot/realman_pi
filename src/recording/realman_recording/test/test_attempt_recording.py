"""Pure rules the recorder uses to record one session per policy attempt."""
from __future__ import annotations

import pytest

from realman_recording.attempt_recording import (
    NO_RESULT,
    attempt_goal,
    attempt_tags,
    dataset_routing_error,
    finished_attempt,
    parse_profile_repo_ids,
    repo_id_for_profile,
    started_attempt,
)


def test_profile_routing_maps_listed_profiles_and_keeps_the_default():
    mapping = parse_profile_repo_ids(["", " policy_rollout = realman/pi05-policy-rollouts "])
    assert mapping == {"policy_rollout": "realman/pi05-policy-rollouts"}
    assert repo_id_for_profile("policy_rollout", mapping, "realman/pi05-three-arm") == "realman/pi05-policy-rollouts"
    assert repo_id_for_profile("teleop", mapping, "realman/pi05-three-arm") == "realman/pi05-three-arm"


@pytest.mark.parametrize("entries", [
    ["policy_rollout"],
    ["=realman/x"],
    ["policy_rollout=no-slash"],
    ["a=realman/x", "a=realman/y"],
])
def test_profile_routing_refuses_malformed_entries(entries):
    with pytest.raises(ValueError):
        parse_profile_repo_ids(entries)


def test_the_start_goal_records_the_attempt_plus_a_margin():
    goal = attempt_goal(task="pick_only", max_duration_sec=60, profile="policy_rollout",
                        stop_margin_sec=10, record_cameras=True)
    assert (goal.profile, goal.task, goal.duration_sec) == ("policy_rollout", "pick_only", 70)
    assert goal.record_cameras is True
    assert goal.start_at_walltime_ns == 0
    with pytest.raises(ValueError):
        attempt_goal(task="t", max_duration_sec=0, profile="p", stop_margin_sec=0, record_cameras=False)


def test_attempt_records_and_tags():
    attempt = started_attempt(attempt_id="policy_attempt_x", task="pick_only", arm="r",
                              prompt="pick up the white object", stamp_ns=42)
    assert attempt == {"attempt_id": "policy_attempt_x", "task": "pick_only", "arm": "r",
                       "prompt": "pick up the white object", "started_ns": "42",
                       "outcome": None, "succeeded": None, "reason": ""}
    failed = finished_attempt(attempt, outcome="dropped", succeeded=False, reason="slipped")
    assert attempt_tags(failed) == {"success": False, "policy_task": "pick_only",
                                    "attempt_id": "policy_attempt_x", "failure_reason": "dropped"}
    succeeded = finished_attempt(attempt, outcome="lifted_held", succeeded=True, reason="")
    assert attempt_tags(succeeded) == {"success": True, "policy_task": "pick_only", "attempt_id": "policy_attempt_x"}
    assert finished_attempt(attempt, outcome="", succeeded=False, reason="")["outcome"] == NO_RESULT
    with pytest.raises(ValueError):
        started_attempt(attempt_id="", task="t", arm="r", prompt="", stamp_ns=0)


def test_a_routed_profile_is_refused_when_the_export_dir_is_itself_a_dataset(tmp_path):
    # The exporter appends to export_dir itself once it holds meta/info.json, whatever the
    # repo_id, so a policy episode would land in the teleop dataset.
    default = "realman/pi05-three-arm"
    assert dataset_routing_error(tmp_path, "realman/pi05-policy-rollouts", default) is None
    (tmp_path / "meta").mkdir()
    (tmp_path / "meta" / "info.json").write_text("{}", encoding="utf-8")
    message = dataset_routing_error(tmp_path, "realman/pi05-policy-rollouts", default)
    assert message is not None
    assert "realman/pi05-policy-rollouts" in message and str(tmp_path) in message
    # The default dataset keeps exporting into such a directory as before.
    assert dataset_routing_error(tmp_path, default, default) is None
