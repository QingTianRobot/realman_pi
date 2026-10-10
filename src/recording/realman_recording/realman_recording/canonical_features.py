"""Materialize physical and derived canonical robot features from aligned raw data.

This module has no ROS or LeRobot SDK dependency so the feature contract is unit
testable.  It never fills missing data with zeros: malformed vectors, incomplete
source provenance and failed FK are export errors rather than training examples.
"""
from __future__ import annotations

from dataclasses import dataclass
from math import isfinite
from typing import Any, Iterable, Sequence

from .kinematics import ee_velocity, finite_difference
from .lerobot_align import AlignedFrame
from .lerobot_schema import LeRobotV3Schema


@dataclass(frozen=True)
class CanonicalFrame:
    """One fixed-policy-grid canonical frame, before SDK-specific array conversion."""

    joint_position: tuple[float, ...]
    joint_velocity: tuple[float, ...]
    ee_pose_base: tuple[float, ...]
    ee_velocity_base: tuple[float, ...]
    gripper_position: tuple[float, ...]
    command_cartesian_velocity: tuple[float, ...]
    command_gripper: tuple[float, ...] | None
    valid: bool
    sync_error_ns: tuple[int, ...]


def validate_command_frame(topic: str, frame_id: str, command_topics: Sequence[str], command_frames: Sequence[str]) -> None:
    """Reject a command whose declared reference frame differs from the profile."""
    expected_by_topic = dict(zip(command_topics, command_frames, strict=True))
    expected = expected_by_topic.get(topic)
    if expected is None:
        return
    if not frame_id or frame_id != expected:
        raise ValueError(
            f"Cartesian command frame mismatch for {topic}: expected {expected!r}, got {frame_id!r}"
        )


def _vector(value: Any, width: int, *, name: str) -> tuple[float, ...]:
    if isinstance(value, (str, bytes)):
        raise ValueError(f"{name} must be a numeric vector")
    try:
        result = tuple(float(item) for item in value)
    except TypeError as error:
        raise ValueError(f"{name} must be a numeric vector") from error
    if len(result) != width:
        raise ValueError(f"{name} must have exactly {width} values")
    if not all(isfinite(item) for item in result):
        raise ValueError(f"{name} must contain finite values")
    return result


def _scalar(value: Any, *, name: str) -> float:
    if isinstance(value, (str, bytes)):
        raise ValueError(f"{name} must be numeric")
    try:
        result = float(value)
    except (TypeError, ValueError) as error:
        raise ValueError(f"{name} must be numeric") from error
    if not isfinite(result):
        raise ValueError(f"{name} must be finite")
    return result


def _flatten_vectors(frame: AlignedFrame, topics: Iterable[str], width: int, *, label: str) -> tuple[float, ...]:
    result: list[float] = []
    for topic in topics:
        if topic not in frame.values:
            raise ValueError(f"missing {label} source: {topic}")
        result.extend(_vector(frame.values[topic], width, name=label))
    return tuple(result)


def _pose_velocity_series(timestamps_ns: Sequence[int], poses: Sequence[tuple[float, ...]]) -> list[tuple[float, ...]]:
    if len(timestamps_ns) < 2 or len(timestamps_ns) != len(poses):
        raise ValueError("at least two timestamped end-effector poses are required")
    result = []
    for index in range(len(poses)):
        left, right = max(0, index - 1), min(len(poses) - 1, index + 1)
        dt_sec = (timestamps_ns[right] - timestamps_ns[left]) / 1e9
        result.append(ee_velocity(poses[left], poses[right], dt_sec))
    return result


def materialize_canonical_frames(
    aligned: Sequence[AlignedFrame], schema: LeRobotV3Schema, kinematics: Sequence[Any],
    image_timestamps_ns: dict[str, Sequence[int]],
) -> list[CanonicalFrame]:
    """Build canonical fields from aligned raw streams and configured FK instances.

    ``kinematics`` has one ``pose(joint_positions)`` provider per arm.  Image time
    provenance comes from the chosen JPEG for each policy anchor.  Sync errors are
    signed ``source_time - anchor_time`` and ordered by ``schema.sync_source_ids``.
    """
    if len(aligned) < 2:
        raise ValueError("canonical velocity derivation requires at least two aligned frames")
    if len(kinematics) != schema.arm_count:
        raise ValueError("each configured arm requires one kinematics provider")
    if set(image_timestamps_ns) != set(schema.camera_ids):
        raise ValueError("image provenance must include every configured camera")
    if any(len(image_timestamps_ns[camera]) != len(aligned) for camera in schema.camera_ids):
        raise ValueError("image provenance length must match aligned frames")

    joint_positions = [
        _flatten_vectors(frame, schema.arm_joint_topics, len(schema.joint_names), label="joint position")
        for frame in aligned
    ]
    timestamps = [frame.timestamp_ns for frame in aligned]
    joint_velocities = finite_difference(list(zip(timestamps, joint_positions, strict=True)))
    poses_by_frame: list[tuple[float, ...]] = []
    for position in joint_positions:
        poses: list[float] = []
        for arm_index, solver in enumerate(kinematics):
            start = arm_index * len(schema.joint_names)
            pose = _vector(solver.pose(position[start:start + len(schema.joint_names)]), 7, name="FK pose")
            poses.extend(pose)
        poses_by_frame.append(tuple(poses))

    if schema.arm_velocity_topics:
        # Driver-published measured end-effector velocity (base frame, 6-DOF per arm).
        ee_velocities_by_frame = [
            _flatten_vectors(frame, schema.arm_velocity_topics, 6, label="measured ee velocity")
            for frame in aligned
        ]
    else:
        # Fall back to FK + shortest-arc pose difference when no measured velocity stream
        # is configured (keeps older recordings exportable).
        ee_velocities_by_frame: list[tuple[float, ...]] = [tuple() for _ in aligned]
        for arm_index in range(schema.arm_count):
            poses = [pose[arm_index * 7:(arm_index + 1) * 7] for pose in poses_by_frame]
            velocities = _pose_velocity_series(timestamps, poses)
            for index, velocity in enumerate(velocities):
                ee_velocities_by_frame[index] += velocity

    result = []
    for index, frame in enumerate(aligned):
        gripper = tuple(_scalar(frame.values.get(topic), name="gripper position") for topic in schema.gripper_position_topics)
        command = _flatten_vectors(frame, schema.arm_action_topics, 6, label="Cartesian command")
        command_gripper = (
            tuple(_scalar(frame.values.get(topic), name="gripper command") for topic in schema.gripper_action_topics)
            if schema.gripper_action_topics else None
        )
        source_times = dict(frame.source_timestamps_ns)
        source_times.update({f"image:{camera}": image_timestamps_ns[camera][index] for camera in schema.camera_ids})
        missing = set(schema.sync_source_ids).difference(source_times)
        if missing:
            raise ValueError(f"missing source provenance: {sorted(missing)}")
        sync_error = tuple(int(source_times[source] - frame.timestamp_ns) for source in schema.sync_source_ids)
        result.append(CanonicalFrame(
            joint_position=joint_positions[index], joint_velocity=joint_velocities[index],
            ee_pose_base=poses_by_frame[index], ee_velocity_base=ee_velocities_by_frame[index],
            gripper_position=gripper, command_cartesian_velocity=command,
            command_gripper=command_gripper, valid=True, sync_error_ns=sync_error,
        ))
    return result
