"""Helpers shared by the input-mode routers (Pika, policy): per-arm velocity profiles and velocity clamping."""

from __future__ import annotations

from dataclasses import dataclass
import math
from typing import Any

from geometry_msgs.msg import TwistStamped


@dataclass
class ArmProfile:
    reference_name: str
    frame_id: str
    control_period_ms: int
    watchdog_ms: int
    max_linear_speed_mps: float
    max_angular_speed_radps: float
    max_linear_accel_mps2: float
    max_angular_accel_radps2: float


def positive_float(value: Any, field: str) -> float:
    try:
        parsed = float(value)
    except (TypeError, ValueError) as error:
        raise ValueError(f"{field} must be numeric") from error
    if not math.isfinite(parsed) or parsed <= 0.0:
        raise ValueError(f"{field} must be positive and finite")
    return parsed


def clamp_angular_velocity(
    source: TwistStamped, max_angular_speed_radps: float
) -> tuple[TwistStamped, bool]:
    """Norm-clamp angular velocity while preserving direction and metadata."""
    limit = positive_float(max_angular_speed_radps, "max_angular_speed_radps")
    angular = (
        source.twist.angular.x,
        source.twist.angular.y,
        source.twist.angular.z,
    )
    norm = math.hypot(*angular)
    if norm <= limit:
        return source, False
    scale = limit / norm
    limited = TwistStamped()
    limited.header.frame_id = source.header.frame_id
    limited.header.stamp.sec = source.header.stamp.sec
    limited.header.stamp.nanosec = source.header.stamp.nanosec
    limited.twist.linear.x = source.twist.linear.x
    limited.twist.linear.y = source.twist.linear.y
    limited.twist.linear.z = source.twist.linear.z
    limited.twist.angular.x = angular[0] * scale
    limited.twist.angular.y = angular[1] * scale
    limited.twist.angular.z = angular[2] * scale
    return limited, True


def clamp_linear_velocity(
    source: TwistStamped, max_linear_speed_mps: float
) -> tuple[TwistStamped, bool]:
    """Norm-clamp linear velocity while preserving direction and metadata."""
    limit = positive_float(max_linear_speed_mps, "max_linear_speed_mps")
    linear = (
        source.twist.linear.x,
        source.twist.linear.y,
        source.twist.linear.z,
    )
    norm = math.hypot(*linear)
    if norm <= limit:
        return source, False
    scale = limit / norm
    limited = TwistStamped()
    limited.header.frame_id = source.header.frame_id
    limited.header.stamp.sec = source.header.stamp.sec
    limited.header.stamp.nanosec = source.header.stamp.nanosec
    limited.twist.linear.x = linear[0] * scale
    limited.twist.linear.y = linear[1] * scale
    limited.twist.linear.z = linear[2] * scale
    limited.twist.angular.x = source.twist.angular.x
    limited.twist.angular.y = source.twist.angular.y
    limited.twist.angular.z = source.twist.angular.z
    return limited, True


def parse_arm_profiles(
    coordinate_references: list[str],
    velocity_profiles: list[str],
    work_reference: str,
    max_linear_speed_mps: float,
    max_angular_speed_radps: float,
    max_angular_accel_radps2: float,
    max_linear_accel_mps2: float | None = None,
    label: str = "Pika",
) -> dict[str, ArmProfile]:
    references: dict[str, tuple[str, str]] = {}
    for entry in coordinate_references:
        parts = entry.split("|")
        if len(parts) != 5:
            raise ValueError("coordinate reference is malformed")
        arm, logical_name, reference_type, controller_name, frame_id = parts
        if arm in {"l", "r"} and logical_name == work_reference:
            if arm in references or reference_type != "1" or not controller_name or not frame_id:
                raise ValueError(f"{arm} configured {label} WORK reference is invalid or duplicated")
            references[arm] = (controller_name, frame_id)

    motion: dict[str, tuple[int, int, float, float]] = {}
    for entry in velocity_profiles:
        parts = entry.split("|")
        if len(parts) != 9:
            raise ValueError("Cartesian velocity profile is malformed")
        arm = parts[0]
        if arm not in {"l", "r"}:
            continue
        if arm in motion:
            raise ValueError(f"duplicate Cartesian velocity profile for {arm}")
        try:
            period = int(parts[1])
            watchdog = int(parts[2])
        except ValueError as error:
            raise ValueError(f"{arm} period/watchdog must be integers") from error
        if period <= 0 or watchdog <= 0:
            raise ValueError(f"{arm} period/watchdog must be positive")
        motion[arm] = (
            period,
            watchdog,
            positive_float(parts[5], f"{arm}.max_linear_accel_mps2"),
            positive_float(parts[6], f"{arm}.max_angular_accel_radps2"),
        )

    if set(references) != {"l", "r"} or set(motion) != {"l", "r"}:
        raise ValueError(f"l and r configured {label} WORK references and velocity profiles are required")
    linear_limit = positive_float(max_linear_speed_mps, "max_linear_speed_mps")
    angular_limit = positive_float(max_angular_speed_radps, "max_angular_speed_radps")
    angular_accel_limit = positive_float(
        max_angular_accel_radps2, "max_angular_accel_radps2"
    )
    # None keeps the per-arm value from cartesian_velocity_profiles (0.10 m/s^2).
    linear_accel_limit = (
        None
        if max_linear_accel_mps2 is None
        else positive_float(max_linear_accel_mps2, "max_linear_accel_mps2")
    )
    return {
        arm: ArmProfile(
            references[arm][0],
            references[arm][1],
            motion[arm][0],
            motion[arm][1],
            linear_limit,
            angular_limit,
            motion[arm][2] if linear_accel_limit is None else linear_accel_limit,
            angular_accel_limit,
        )
        for arm in ("l", "r")
    }


def velocity_goal(profile: ArmProfile, follow: bool) -> Any:
    """A WORK-frame ``CartesianVelocity`` session request for one arm."""
    from realman_msgs.action import CartesianVelocity

    goal = CartesianVelocity.Goal()
    goal.reference_type = CartesianVelocity.Goal.WORK
    goal.reference_name = profile.reference_name
    goal.control_period_ms = profile.control_period_ms
    goal.watchdog_ms = profile.watchdog_ms
    goal.max_linear_speed_mps = profile.max_linear_speed_mps
    goal.max_angular_speed_radps = profile.max_angular_speed_radps
    goal.max_linear_accel_mps2 = profile.max_linear_accel_mps2
    goal.max_angular_accel_radps2 = profile.max_angular_accel_radps2
    goal.follow = follow
    goal.trajectory_mode = 0
    goal.radio = 0
    return goal
