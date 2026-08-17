from __future__ import annotations

import math
from dataclasses import FrozenInstanceError
from pathlib import Path
import typing

import pytest
import yaml

from realman_robot_driver import motion_types
from realman_robot_driver.motion_types import (
    CommandType,
    FeedbackPhase,
    Goal,
    MotionSettings,
    ReferenceState,
    ReferenceType,
    TerminalState,
    limit_vector_delta,
    validate_goal,
)


def valid_goal(**overrides: object) -> Goal:
    values: dict[str, object] = {
        "command": CommandType.MOVEJ,
        "reference_type": ReferenceType.BASE,
        "reference_name": "base",
        "joint_degrees": (0.0, 1.0, 2.0, 3.0, 4.0, 5.0),
        "pose_position_m": (0.1, 0.2, 0.3),
        "pose_quaternion_wxyz": (2.0, 0.0, 0.0, 0.0),
        "velocity_percent": 50,
        "blend_radius_percent": 0,
        "connect": False,
        "timeout_sec": 2.0,
    }
    values.update(overrides)
    return Goal(**values)


def test_enums_match_action_constants():
    assert CommandType.MOVEJ == 0
    assert CommandType.MOVEL == 1
    assert CommandType.MOVEJ_P == 2
    assert ReferenceType.BASE == 0
    assert ReferenceType.WORK == 1
    assert ReferenceType.TOOL == 2
    assert TerminalState.SUCCEEDED == 0
    assert TerminalState.CANCELED == 1
    assert TerminalState.ABORTED == 2
    assert TerminalState.TIMEOUT == 3
    assert FeedbackPhase.VALIDATING == 0
    assert FeedbackPhase.SUBMITTING == 1
    assert FeedbackPhase.EXECUTING == 2
    assert FeedbackPhase.STOPPING == 3


def test_valid_goal_normalizes_quaternion_and_result_is_immutable():
    result = validate_goal(
        valid_goal(
            command=CommandType.MOVEJ_P,
            joint_degrees=(),
            pose_position_m=(0.0, 0.0, 0.0),
            pose_quaternion_wxyz=(2.0, 0.0, 0.0, 0.0),
        )
    )

    assert result.valid
    assert result.errors == ()
    assert result.goal is not None
    assert result.goal.pose_quaternion_wxyz == (1.0, 0.0, 0.0, 0.0)
    with pytest.raises(FrozenInstanceError):
        result.valid = False  # type: ignore[misc]


@pytest.mark.parametrize(
    ("field", "value", "message"),
    [
        ("joint_degrees", (0.0,) * 5, "joint_degrees must contain exactly six values"),
        ("joint_degrees", (0.0, 1.0, 2.0, 3.0, 4.0, math.nan), "joint_degrees must contain finite values"),
        ("pose_position_m", (0.0, 0.0), "pose_position_m must contain exactly three values"),
        ("pose_position_m", (0.0, math.inf, 0.0), "pose_position_m must contain finite values"),
        ("pose_quaternion_wxyz", (0.0, 0.0, 0.0, 0.0), "pose_quaternion_wxyz must have a non-zero norm"),
        ("pose_quaternion_wxyz", (1.0, 0.0, math.inf, 0.0), "pose_quaternion_wxyz must contain finite values"),
        ("velocity_percent", 0, "velocity_percent must be between 1 and 100"),
        ("velocity_percent", 101, "velocity_percent must be between 1 and 100"),
        ("blend_radius_percent", -1, "blend_radius_percent must be between 0 and 100"),
        ("blend_radius_percent", 101, "blend_radius_percent must be between 0 and 100"),
        ("timeout_sec", 0.0, "timeout_sec must be a positive finite number"),
        ("timeout_sec", math.nan, "timeout_sec must be a positive finite number"),
        ("connect", True, "connect=true is not supported in version one"),
    ],
)
def test_goal_validation_reports_concrete_field_errors(field: str, value: object, message: str):
    command = CommandType.MOVEJ
    if field in {"pose_position_m", "pose_quaternion_wxyz"}:
        command = CommandType.MOVEL
    result = validate_goal(valid_goal(command=command, **{field: value}))

    assert not result.valid
    assert message in result.errors
    assert result.error == message


def test_movepose_commands_require_pose_fields_but_not_joint_fields():
    result = validate_goal(
        valid_goal(
            command=CommandType.MOVEL,
            joint_degrees=(),
            pose_position_m=(0.0, 0.0, 0.0),
            pose_quaternion_wxyz=(1.0, 0.0, 0.0, 0.0),
        )
    )

    assert result.valid


def test_connection_and_active_reference_are_explicit_validation_inputs():
    disconnected = validate_goal(valid_goal(), connected=False)
    assert "arm is not connected" in disconnected.errors

    mismatch = validate_goal(
        valid_goal(),
        active_reference_type=ReferenceType.TOOL,
        active_reference_name="tcpgrip",
    )
    assert "reference_type does not match active frame" in mismatch.errors
    assert "reference_name does not match active frame" in mismatch.errors


def test_reference_resolver_rejects_an_unconfigured_reference():
    result = validate_goal(
        valid_goal(reference_type=ReferenceType.WORK, reference_name="fixture"),
        reference_resolver=ReferenceState({ReferenceType.WORK: frozenset({"cell"})}),
    )

    assert not result.valid
    assert "reference_name is not configured for reference_type" in result.errors


def test_reference_resolver_accepts_a_configured_reference():
    result = validate_goal(
        valid_goal(reference_type=ReferenceType.WORK, reference_name="cell"),
        reference_resolver=ReferenceState({ReferenceType.WORK: frozenset({"cell"})}),
    )

    assert result.valid


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("command", 0.0),
        ("command", True),
        ("reference_type", 0.0),
        ("reference_type", False),
    ],
)
def test_goal_validation_rejects_non_integer_ros_enum_values(field: str, value: object):
    result = validate_goal(valid_goal(**{field: value}))

    assert not result.valid
    assert any(error.startswith(f"{field} must be one of") for error in result.errors)


def test_limit_vector_delta_preserves_direction():
    limited = limit_vector_delta((0.0, 0.0, 0.0), (3.0, 4.0, 0.0), 1.0, 1.0)

    assert math.sqrt(sum(value * value for value in limited)) == pytest.approx(1.0)
    assert limited[0] / limited[1] == pytest.approx(3.0 / 4.0)


def settings_data() -> dict[str, object]:
    arm_settings = {
        "default_timeout_sec": 10.0,
        "max_linear_speed_mps": 0.05,
        "max_angular_speed_radps": 0.25,
        "velocity_control_period_ms": 20,
        "velocity_watchdog_ms": 100,
        "max_linear_accel_mps2": 0.10,
        "max_angular_accel_radps2": 0.50,
    }
    return {"robots": {arm: dict(arm_settings) for arm in ("l", "m", "r")}}


def write_settings(tmp_path: Path, **changes: object) -> Path:
    data = settings_data()
    for key, value in changes.items():
        data["robots"]["l"][key] = value  # type: ignore[index]
    path = tmp_path / "realman_motion.yaml"
    path.write_text(yaml.safe_dump(data), encoding="ascii")
    return path


def test_motion_settings_parse_existing_schema_and_units(tmp_path: Path):
    path = write_settings(tmp_path)

    settings = MotionSettings.from_yaml(path, "l")

    assert settings.default_timeout_sec == 10.0
    assert settings.max_linear_speed_mps == 0.05
    assert settings.velocity_control_period_ms == 20
    assert settings.velocity_watchdog_ms == 100
    assert settings.control_period_sec == pytest.approx(0.020)
    assert settings.watchdog_sec == pytest.approx(0.100)
    assert isinstance(settings.velocity_control_period_ms, int)
    assert isinstance(settings.velocity_watchdog_ms, int)


def test_motion_settings_millisecond_fields_reject_fractional_and_boolean_values(tmp_path: Path):
    for field, value in (
        ("velocity_control_period_ms", 20.5),
        ("velocity_watchdog_ms", 100.5),
        ("velocity_control_period_ms", True),
        ("velocity_watchdog_ms", False),
    ):
        path = write_settings(tmp_path, **{field: value})
        with pytest.raises(ValueError, match=field):
            MotionSettings.from_yaml(path, "l")


def test_motion_type_hints_resolve_private_mapping_helper():
    hints = typing.get_type_hints(motion_types._expect_keys)

    assert hints["data"] == typing.Mapping[typing.Any, typing.Any]


@pytest.mark.parametrize(
    "field",
    [
        "default_timeout_sec",
        "max_linear_speed_mps",
        "max_angular_speed_radps",
        "velocity_control_period_ms",
        "velocity_watchdog_ms",
        "max_linear_accel_mps2",
        "max_angular_accel_radps2",
    ],
)
def test_motion_settings_reject_non_positive_or_non_finite_values(tmp_path: Path, field: str):
    for value in (0.0, -1.0, math.nan, math.inf):
        path = write_settings(tmp_path, **{field: value})
        with pytest.raises(ValueError, match=field):
            MotionSettings.from_yaml(path, "l")


def test_motion_settings_reject_unknown_keys_and_unknown_arm(tmp_path: Path):
    path = write_settings(tmp_path, unsupported=1)
    with pytest.raises(ValueError, match="unknown key"):
        MotionSettings.from_yaml(path, "l")

    with pytest.raises(ValueError, match="unknown arm"):
        MotionSettings.from_yaml(write_settings(tmp_path), "x")
