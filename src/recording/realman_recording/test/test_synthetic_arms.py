"""A configured-off arm (SJDrealman's middle arm) is recorded as a parked, synthetic arm.

The three-arm schema stays unchanged so episodes remain combinable with real three-arm
data; the parked arm only stops blocking PREPARE and export, and every synthesized
stream is listed in the session/episode provenance.
"""
import math

import pytest

from realman_recording.lerobot_align import TimedSample
from realman_recording.lerobot_exporter import LeRobotExporter
from realman_recording.lerobot_schema import schema_from_parameters
from realman_recording.synthetic_arms import (
    fill_synthetic_streams,
    parse_synthetic_arms,
    preflight_arms,
    preflight_topics,
)

PARKED_DEG = [0.0, 17.997, 70.0, 0.0, 90.0, 8.997]


def schema():
    return schema_from_parameters(
        repo_id="realman/test", fps=30, arms=["l", "m", "r"],
        arm_action_topics=["/l/cartesian_velocity/command", "/m/cartesian_velocity/command", "/r/cartesian_velocity/command"],
        arm_velocity_topics=["/l/cartesian_velocity/state", "/m/cartesian_velocity/state", "/r/cartesian_velocity/state"],
        gripper_position_topics=["/gripper_left/position", "/gripper_mid/position", "/gripper_right/position"],
        gripper_action_topics=[], camera_ids=["cam"],
    )


def samples(times, value):
    return [TimedSample(timestamp_ns=t, value=value) for t in times]


def recorded_without_m():
    times = [1_000_000_000 + i * 33_000_000 for i in range(10)]
    joint = (0.1, 0.2, 0.3, 0.4, 0.5, 0.6)
    vel = [0.0] * 6
    return times, {
        "/l/joint_states": samples(times, joint), "/r/joint_states": samples(times, joint),
        "/l/cartesian_velocity/state": samples(times, vel), "/r/cartesian_velocity/state": samples(times, vel),
        "/gripper_left/position": samples(times, 10.0), "/gripper_mid/position": samples(times, 0.0),
        "/gripper_right/position": samples(times, 20.0),
    }


# ---- parsing -------------------------------------------------------------------

def test_parse_converts_degrees_to_radians():
    parsed = parse_synthetic_arms(["l", "m", "r"], ["m"], PARKED_DEG)
    assert list(parsed) == ["m"]
    assert parsed["m"] == pytest.approx(tuple(math.radians(v) for v in PARKED_DEG))


def test_parse_treats_the_ros_empty_sentinel_as_no_synthetic_arm():
    assert parse_synthetic_arms(["l", "m", "r"], [""], [0.0]) == {}
    assert parse_synthetic_arms(["l", "m", "r"], [], []) == {}


@pytest.mark.parametrize("synthetic, degrees, message", [
    (["x"], PARKED_DEG, "not one of the recorded arms"),
    (["m"], PARKED_DEG[:5], "six joint values per synthetic arm"),
    (["m", "m"], PARKED_DEG * 2, "listed twice"),
    (["l", "m", "r"], PARKED_DEG * 3, "at least one real arm"),
    (["m"], [0.0, 0.0, float("nan"), 0.0, 0.0, 0.0], "finite"),
])
def test_parse_rejects_bad_configuration(synthetic, degrees, message):
    with pytest.raises(ValueError, match=message):
        parse_synthetic_arms(["l", "m", "r"], synthetic, degrees)


# ---- PREPARE -------------------------------------------------------------------

def test_preflight_no_longer_requires_the_parked_arm():
    assert preflight_arms(("l", "m", "r"), {"m": (0.0,) * 6}) == ("l", "r")
    topics = ("/l/joint_states", "/m/joint_states", "/r/joint_states", "/gripper_mid/position")
    # Only the parked arm's joint stream is dropped; its gripper stays as configured.
    assert preflight_topics(topics, {"m": (0.0,) * 6}) == (
        "/l/joint_states", "/r/joint_states", "/gripper_mid/position")


def test_preflight_unchanged_without_synthetic_arms():
    topics = ("/l/joint_states", "/m/joint_states", "/r/joint_states")
    assert preflight_arms(("l", "m", "r"), {}) == ("l", "m", "r")
    assert preflight_topics(topics, {}) == topics


# ---- export --------------------------------------------------------------------

def test_export_requirement_fails_for_a_silent_arm_without_synthesis():
    _times, streams = recorded_without_m()
    with pytest.raises(ValueError, match="/m/joint_states"):
        LeRobotExporter._v3_streams(streams, schema())


def test_fill_parks_the_missing_arm_on_the_reference_timeline():
    times, streams = recorded_without_m()
    parked = parse_synthetic_arms(["l", "m", "r"], ["m"], PARKED_DEG)
    filled, synthesized = fill_synthetic_streams(streams, schema(), parked)
    assert synthesized == ["/m/joint_states", "/m/cartesian_velocity/state"]
    assert [s.timestamp_ns for s in filled["/m/joint_states"]] == times
    assert all(s.value == pytest.approx(parked["m"]) for s in filled["/m/joint_states"])
    assert all(list(s.value) == [0.0] * 6 for s in filled["/m/cartesian_velocity/state"])
    # Real streams and the input mapping are left untouched.
    assert filled["/l/joint_states"] is streams["/l/joint_states"]
    assert "/m/joint_states" not in streams
    # The canonical requirement check now passes for the three-arm schema.
    names = [name for name, _samples, _policy in LeRobotExporter._v3_streams(filled, schema())]
    assert "/m/joint_states" in names and "/m/cartesian_velocity/state" in names


def test_real_data_wins_over_synthesis():
    times, streams = recorded_without_m()
    real = samples(times, (9.0,) * 6)
    streams["/m/joint_states"] = real
    filled, synthesized = fill_synthetic_streams(
        streams, schema(), parse_synthetic_arms(["l", "m", "r"], ["m"], PARKED_DEG))
    assert filled["/m/joint_states"] is real
    assert synthesized == ["/m/cartesian_velocity/state"]


def test_fill_without_synthetic_arms_is_a_no_op():
    _times, streams = recorded_without_m()
    filled, synthesized = fill_synthetic_streams(streams, schema(), {})
    assert filled == streams and synthesized == []


def test_fill_needs_a_real_arm_timeline():
    streams = {"/gripper_left/position": samples([1, 2], 1.0)}
    with pytest.raises(ValueError, match="no real arm joint stream"):
        fill_synthetic_streams(streams, schema(), parse_synthetic_arms(["l", "m", "r"], ["m"], PARKED_DEG))


# ---- session metadata -> exporter ----------------------------------------------

def test_exporter_reads_the_parked_pose_from_the_session_metadata():
    manifest = {"metadata": {"synthetic_arms": {"m": {"joint_positions_rad": [0.0, 0.3, 1.2, 0.0, 1.5, 0.1],
                                                       "velocity": "zero"}}}}
    assert LeRobotExporter._session_synthetic_arms(manifest) == {"m": (0.0, 0.3, 1.2, 0.0, 1.5, 0.1)}
    assert LeRobotExporter._session_synthetic_arms({"metadata": {}}) == {}


@pytest.mark.parametrize("entry", [{"joint_positions_rad": [0.0] * 5}, {"joint_positions_rad": [True] * 6}, "m"])
def test_exporter_rejects_a_malformed_parked_pose(entry):
    with pytest.raises(ValueError, match="joint_positions_rad"):
        LeRobotExporter._session_synthetic_arms({"metadata": {"synthetic_arms": {"m": entry}}})
