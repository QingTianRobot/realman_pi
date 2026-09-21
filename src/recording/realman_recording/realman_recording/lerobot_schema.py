"""Explicit LeRobot v3 feature and ROS-topic contract for π₀.₅ training.

This is intentionally independent of ROS and of the LeRobot SDK.  It makes the
vector layout reviewable and testable: topic order is configuration, never an
incidental ordering of an MCAP dictionary.
"""
from __future__ import annotations

from dataclasses import dataclass
from hashlib import sha256
import json
from typing import Iterable


@dataclass(frozen=True)
class LeRobotV3Schema:
    """One fixed three-arm training profile and its declared data layout."""

    repo_id: str
    fps: int
    arm_joint_topics: tuple[str, ...]
    arm_action_topics: tuple[str, ...]
    gripper_position_topics: tuple[str, ...]
    gripper_action_topics: tuple[str, ...]
    camera_ids: tuple[str, ...]

    def __post_init__(self) -> None:
        if not self.repo_id or "/" not in self.repo_id:
            raise ValueError("LeRobot repo_id must be an owner/dataset identifier")
        if self.fps <= 0:
            raise ValueError("LeRobot dataset fps must be positive")
        required = (self.arm_joint_topics, self.arm_action_topics, self.gripper_position_topics)
        if any(not values for values in required):
            raise ValueError("joint, arm-action, and gripper-position streams are required")
        topic_groups = required + (self.gripper_action_topics,)
        if any(any(not value.startswith("/") for value in values) for values in topic_groups):
            raise ValueError("all configured state/action topics must be absolute ROS topic names")
        if len(self.arm_joint_topics) != len(self.arm_action_topics):
            raise ValueError("each arm joint stream requires one action stream")
        # Some deployments expose position feedback but no independently recorded
        # gripper command topic.  Do not fabricate an action from observation; the
        # resulting action vector is then arm-only and its exact dimension remains
        # explicit in metadata.  A profile that does have gripper commands supplies
        # all of them in the desired left/middle/right order.
        if self.gripper_action_topics and len(self.gripper_position_topics) != len(self.gripper_action_topics):
            raise ValueError("gripper action topics must be empty or match gripper position topics")
        if len(set(self.camera_ids)) != len(self.camera_ids) or not all(self.camera_ids):
            raise ValueError("camera ids must be non-empty and unique")

    @property
    def state_dim(self) -> int:
        return 6 * len(self.arm_joint_topics) + len(self.gripper_position_topics)

    @property
    def action_dim(self) -> int:
        return 6 * len(self.arm_action_topics) + len(self.gripper_action_topics)

    def features(self, image_shapes: dict[str, tuple[int, int, int]]) -> dict[str, dict]:
        """Return the public ``LeRobotDataset.create`` feature declaration."""
        missing = set(self.camera_ids).difference(image_shapes)
        if missing:
            raise ValueError(f"missing camera image shapes: {sorted(missing)}")
        result: dict[str, dict] = {
            "observation.state": {"dtype": "float32", "shape": (self.state_dim,), "names": None},
            "action": {"dtype": "float32", "shape": (self.action_dim,), "names": None},
        }
        for camera_id in self.camera_ids:
            height, width, channels = image_shapes[camera_id]
            if channels != 3 or height <= 0 or width <= 0:
                raise ValueError(f"{camera_id} must be a positive RGB HWC image shape")
            result[f"observation.images.{camera_id}"] = {
                "dtype": "video", "shape": (height, width, channels),
                "names": ["height", "width", "channels"],
            }
        return result

    @property
    def fingerprint(self) -> str:
        payload = {
            "repo_id": self.repo_id, "fps": self.fps, "joint": self.arm_joint_topics,
            "arm_action": self.arm_action_topics, "gripper": self.gripper_position_topics,
            "gripper_action": self.gripper_action_topics, "cameras": self.camera_ids,
        }
        return sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()


def schema_from_parameters(*, repo_id: str, fps: float, arms: Iterable[str], arm_action_topics: Iterable[str],
                           gripper_position_topics: Iterable[str], gripper_action_topics: Iterable[str],
                           camera_ids: Iterable[str]) -> LeRobotV3Schema:
    """Build the contract from recorder parameters while preserving declared order."""
    arm_names = tuple(str(item) for item in arms if str(item))
    if not arm_names:
        raise ValueError("at least one arm is required")
    integer_fps = int(fps)
    if integer_fps != fps:
        raise ValueError("LeRobot v3 FPS must be an integer")
    return LeRobotV3Schema(
        repo_id=str(repo_id), fps=integer_fps,
        arm_joint_topics=tuple(f"/{arm}/joint_states" for arm in arm_names),
        arm_action_topics=tuple(str(item) for item in arm_action_topics if str(item)),
        gripper_position_topics=tuple(str(item) for item in gripper_position_topics if str(item)),
        gripper_action_topics=tuple(str(item) for item in gripper_action_topics if str(item)),
        camera_ids=tuple(str(item) for item in camera_ids if str(item)),
    )
