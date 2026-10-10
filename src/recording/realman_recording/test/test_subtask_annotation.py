"""Tests for subtask annotation: v3 schema feature, store write, exporter mapping,
and the GET/POST endpoints.

The pure frame->subtask mapping and coverage-validation functions (Task 3) and the
store write (Task 2) are ROS-free and always run.  The aiohttp endpoint tests are
skipped locally where aiohttp is absent and run in Docker.
"""
import json

import pytest

from realman_recording.lerobot_schema import schema_from_parameters


def _schema():
    return schema_from_parameters(
        repo_id="realman/pi05-three-arm", fps=15.0, arms=["l", "m", "r"],
        arm_action_topics=["/l/cartesian_velocity/command", "/m/cartesian_velocity/command", "/r/cartesian_velocity/command"],
        gripper_position_topics=["/gripper_left/position", "/gripper_mid/position", "/gripper_right/position"],
        gripper_action_topics=[], camera_ids=[],
    )


# --- Task 1: LeRobotV3Schema.features() declares subtask_index --------------------


def test_schema_declares_subtask_index_feature():
    features = _schema().features({})
    assert features["subtask_index"] == {"dtype": "int64", "shape": (1,)}
