"""Contract tests for recorder preflight admission."""
from __future__ import annotations

from realman_recording.preflight import PreflightChecker, PreflightRequirements


def test_preflight_rejects_stale_disconnected_and_unavailable_inputs():
    requirements = PreflightRequirements(
        required_topics=("/l/joint_states", "/gripper_left/position"),
        required_arms=("l",),
        required_cameras=("front",),
        max_age_ns=1_000,
        min_free_space_bytes=10_000,
    )

    result = PreflightChecker(requirements).evaluate(
        now_wall_ns=10_000,
        last_receipt_wall_ns={"/l/joint_states": 9_500, "/gripper_left/position": 8_000},
        arm_connected={"l": False},
        free_space_bytes=9_999,
        mcap_available=False,
        camera_available={"front": False},
    )

    assert result.ready is False
    assert {diagnostic.code for diagnostic in result.diagnostics if not diagnostic.ok} == {
        "topic_stale",
        "arm_disconnected",
        "storage_low",
        "mcap_unavailable",
        "camera_unavailable",
    }


def test_preflight_accepts_fresh_complete_inputs():
    requirements = PreflightRequirements(
        required_topics=("/l/joint_states",),
        required_arms=("l",),
        required_cameras=(),
        max_age_ns=1_000,
        min_free_space_bytes=10,
    )

    result = PreflightChecker(requirements).evaluate(
        now_wall_ns=10_000,
        last_receipt_wall_ns={"/l/joint_states": 9_000},
        arm_connected={"l": True},
        free_space_bytes=10,
        mcap_available=True,
        camera_available={},
    )

    assert result.ready is True
    assert all(diagnostic.ok for diagnostic in result.diagnostics)


def test_preflight_marks_fresh_sensors_for_alignment_when_cross_sensor_skew_is_large():
    """Skew requests post-record alignment but does not reject healthy sensors."""
    requirements = PreflightRequirements(
        required_topics=("/l/joint_states", "/gripper_left/position", "/camera/color/image_raw/compressed"),
        required_arms=("l",),
        required_cameras=("front",),
        max_age_ns=1_000,
        alignment_trigger_ns=100,
        min_free_space_bytes=10,
    )

    result = PreflightChecker(requirements).evaluate(
        now_wall_ns=10_000,
        last_receipt_wall_ns={
            "/l/joint_states": 9_900,
            "/gripper_left/position": 9_850,
            "/camera/color/image_raw/compressed": 9_500,
        },
        arm_connected={"l": True},
        free_space_bytes=10,
        mcap_available=True,
        camera_available={"front": True},
    )

    assert result.ready is True
    assert result.alignment_required is True
    assert "alignment_required" in result.summary
