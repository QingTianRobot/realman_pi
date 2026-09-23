"""Canonical LeRobot v3 feature and ROS-topic contract.

This is intentionally independent of ROS and of the LeRobot SDK.  It makes the
vector layout reviewable and testable: topic order is configuration, never an
incidental ordering of an MCAP dictionary.  Model-specific fields such as
``observation.state`` and top-level ``action`` deliberately do not belong here;
adapters derive those views from the physical quantities below.
"""
from __future__ import annotations

from dataclasses import dataclass
from hashlib import sha256
import json
from typing import Iterable


@dataclass(frozen=True)
class LeRobotV3Schema:
    """One fixed-embodiment canonical data layout for a LeRobot v3 dataset."""

    repo_id: str
    fps: int
    arm_joint_topics: tuple[str, ...]
    arm_action_topics: tuple[str, ...]
    arm_velocity_topics: tuple[str, ...]
    gripper_position_topics: tuple[str, ...]
    gripper_action_topics: tuple[str, ...]
    camera_ids: tuple[str, ...]
    joint_names: tuple[str, ...]
    embodiment_id: str
    urdf_package: str
    urdf_relative_path: str
    urdf_base_link: str
    base_frames: tuple[str, ...]
    ee_links: tuple[str, ...]
    cartesian_command_representation: str
    cartesian_command_frames: tuple[str, ...]

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
        if self.arm_velocity_topics and len(self.arm_velocity_topics) != len(self.arm_joint_topics):
            raise ValueError("each arm joint stream requires one measured velocity stream when configured")
        if any(not value.startswith("/") for value in self.arm_velocity_topics):
            raise ValueError("all configured velocity topics must be absolute ROS topic names")
        if not self.joint_names or len(set(self.joint_names)) != len(self.joint_names):
            raise ValueError("joint_names must be non-empty and unique")
        if (len(self.base_frames) != len(self.arm_joint_topics)
                or len(self.ee_links) != len(self.arm_joint_topics)
                or not all(self.base_frames)
                or not all(self.ee_links)):
            raise ValueError("each arm requires one base frame and end-effector link")
        if len(set(self.arm_ids)) != self.arm_count:
            raise ValueError("each configured base frame must identify a unique arm")
        if not self.embodiment_id or not self.urdf_package or not self.urdf_relative_path or not self.urdf_base_link:
            raise ValueError("embodiment_id and URDF source details are required")
        if self.cartesian_command_representation != "velocity":
            raise ValueError("canonical v1 only supports Cartesian velocity commands")
        if len(self.cartesian_command_frames) != len(self.arm_action_topics) or not all(self.cartesian_command_frames):
            raise ValueError("each Cartesian command stream requires a fixed frame")
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
    def arm_count(self) -> int:
        return len(self.arm_joint_topics)

    @property
    def joint_dim(self) -> int:
        return len(self.joint_names) * self.arm_count

    @property
    def ee_pose_dim(self) -> int:
        return 7 * self.arm_count

    @property
    def ee_velocity_dim(self) -> int:
        return 6 * self.arm_count

    @property
    def gripper_dim(self) -> int:
        return len(self.gripper_position_topics)

    @property
    def command_dim(self) -> int:
        return 6 * len(self.arm_action_topics)

    @property
    def gripper_command_dim(self) -> int:
        return len(self.gripper_action_topics)

    @property
    def sync_source_ids(self) -> tuple[str, ...]:
        """Stable quality-vector layout: source topics followed by camera ids."""
        return (*self.arm_joint_topics, *self.gripper_position_topics,
                *self.arm_action_topics, *self.gripper_action_topics,
                *(f"image:{camera}" for camera in self.camera_ids))

    @staticmethod
    def _topic_entity(topic: str) -> str:
        """Return the ROS namespace component that identifies a robot device."""
        parts = [part for part in topic.split("/") if part]
        return parts[-2] if len(parts) > 1 else parts[-1]

    @staticmethod
    def _frame_robot_id(frame: str) -> str:
        """Return the robot namespace from a qualified frame such as l/work/cell."""
        return next(part for part in frame.split("/") if part)

    @property
    def arm_ids(self) -> tuple[str, ...]:
        """Arm labels follow configured base-frame order (for example l/m/r)."""
        return tuple(self._frame_robot_id(frame) for frame in self.base_frames)

    @property
    def gripper_ids(self) -> tuple[str, ...]:
        """Stable gripper labels follow the configured observation order."""
        return tuple(self._topic_entity(topic) for topic in self.gripper_position_topics)

    def features(self, image_shapes: dict[str, tuple[int, int, int]]) -> dict[str, dict]:
        """Return the public ``LeRobotDataset.create`` feature declaration."""
        missing = set(self.camera_ids).difference(image_shapes)
        if missing:
            raise ValueError(f"missing camera image shapes: {sorted(missing)}")
        joint_components = [f"{arm}.{joint}" for arm in self.arm_ids for joint in self.joint_names]
        ee_pose_components = [
            f"{arm}.{axis}" for arm in self.arm_ids
            for axis in ("x", "y", "z", "qx", "qy", "qz", "qw")
        ]
        ee_velocity_components = [
            f"{arm}.{axis}" for arm in self.arm_ids
            for axis in ("vx", "vy", "vz", "wx", "wy", "wz")
        ]
        gripper_components = list(self.gripper_ids)
        command_components = [
            f"{self._frame_robot_id(frame)}.{axis}" for frame in self.cartesian_command_frames
            for axis in ("vx", "vy", "vz", "wx", "wy", "wz")
        ]
        result: dict[str, dict] = {
            "observation.joint_position": {
                "dtype": "float32", "shape": (self.joint_dim,), "names": joint_components,
            },
            "observation.joint_velocity": {
                "dtype": "float32", "shape": (self.joint_dim,), "names": joint_components,
            },
            "observation.ee_pose_base": {
                "dtype": "float32", "shape": (self.ee_pose_dim,), "names": ee_pose_components,
            },
            "observation.ee_velocity_base": {
                "dtype": "float32", "shape": (self.ee_velocity_dim,), "names": ee_velocity_components,
            },
            "observation.gripper_position": {
                "dtype": "float32", "shape": (self.gripper_dim,), "names": gripper_components,
            },
            "action.command.cartesian_velocity": {
                "dtype": "float32", "shape": (self.command_dim,), "names": command_components,
            },
            "quality.valid": {"dtype": "bool", "shape": (1,), "names": ["valid"]},
            "quality.sync_error_ns": {
                "dtype": "int64", "shape": (len(self.sync_source_ids),), "names": list(self.sync_source_ids),
            },
        }
        if self.gripper_action_topics:
            result["action.command.gripper"] = {
                "dtype": "float32", "shape": (self.gripper_command_dim,), "names": gripper_components,
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
            "joint_names": self.joint_names, "embodiment_id": self.embodiment_id,
            "urdf_package": self.urdf_package, "urdf_relative_path": self.urdf_relative_path,
            "urdf_base_link": self.urdf_base_link, "base_frames": self.base_frames,
            "ee_links": self.ee_links, "cartesian_command_representation": self.cartesian_command_representation,
            "cartesian_command_frames": self.cartesian_command_frames,
        }
        return sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()


def schema_from_parameters(*, repo_id: str, fps: float, arms: Iterable[str], arm_action_topics: Iterable[str],
                           arm_velocity_topics: Iterable[str] = (),
                           gripper_position_topics: Iterable[str], gripper_action_topics: Iterable[str],
                           camera_ids: Iterable[str], joint_names: Iterable[str] = ("joint_1", "joint_2", "joint_3", "joint_4", "joint_5", "joint_6"),
                           embodiment_id: str = "realman-rm65-b-three-arm-v1",
                           urdf_package: str = "rm65_description",
                           urdf_relative_path: str = "urdf/RM65-B.urdf",
                           urdf_base_link: str = "base_link",
                           base_frames: Iterable[str] = ("l/base_link", "m/base_link", "r/base_link"),
                           ee_links: Iterable[str] = ("link_6", "link_6", "link_6"),
                           cartesian_command_representation: str = "velocity",
                           cartesian_command_frames: Iterable[str] = ("l/base_link", "m/base_link", "r/base_link")) -> LeRobotV3Schema:
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
        arm_velocity_topics=tuple(str(item) for item in arm_velocity_topics if str(item)),
        gripper_position_topics=tuple(str(item) for item in gripper_position_topics if str(item)),
        gripper_action_topics=tuple(str(item) for item in gripper_action_topics if str(item)),
        camera_ids=tuple(str(item) for item in camera_ids if str(item)),
        joint_names=tuple(str(item) for item in joint_names if str(item)),
        embodiment_id=str(embodiment_id), urdf_package=str(urdf_package),
        urdf_relative_path=str(urdf_relative_path), urdf_base_link=str(urdf_base_link),
        base_frames=tuple(str(item) for item in base_frames if str(item)),
        ee_links=tuple(str(item) for item in ee_links if str(item)),
        cartesian_command_representation=str(cartesian_command_representation),
        cartesian_command_frames=tuple(str(item) for item in cartesian_command_frames if str(item)),
    )
