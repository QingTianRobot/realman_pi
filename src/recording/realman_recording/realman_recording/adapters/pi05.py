"""Explicit π0.5 training view over canonical physical robot features.

The adapter is intentionally not invoked while recording or exporting the canonical
dataset.  Checkpoint-specific dimensions and rotation encoding are parameters, so a
future OpenPI transform can reproduce the same mapping without rewriting raw data.
"""
from __future__ import annotations

from dataclasses import dataclass
from math import isfinite, sqrt
from typing import Any, Mapping

from ..canonical_features import CanonicalFrame


@dataclass(frozen=True)
class Pi05AdapterConfig:
    """A checkpoint's exact proprioception/action contract, never inferred."""

    rotation_representation: str = "quaternion_xyzw"
    expected_state_dim: int | None = None
    expected_action_dim: int | None = None
    include_gripper_command: bool = False
    action_representation: str = "cartesian_velocity"
    dataset_fps: int | None = None
    # Identifies the normalization statistics/assets selected by the training job.
    # This adapter does not normalize data itself; the OpenPI transform owns that step.
    normalizer_asset_version: str = ""

    def __post_init__(self) -> None:
        if self.rotation_representation not in {"quaternion_xyzw", "rot6d"}:
            raise ValueError("π0.5 rotation_representation must be quaternion_xyzw or rot6d")
        if self.expected_state_dim is None or self.expected_action_dim is None:
            raise ValueError("π0.5 checkpoint dimensions must be explicit")
        if self.expected_state_dim <= 0 or self.expected_action_dim <= 0:
            raise ValueError("π0.5 checkpoint dimensions must be positive")
        if self.action_representation not in {"cartesian_velocity", "cartesian_delta"}:
            raise ValueError("π0.5 action_representation must be cartesian_velocity or cartesian_delta")
        if self.action_representation == "cartesian_delta" and (self.dataset_fps is None or self.dataset_fps <= 0):
            raise ValueError("cartesian_delta requires a positive explicit dataset_fps")
        if not self.normalizer_asset_version.strip():
            raise ValueError("π0.5 normalizer_asset_version must identify the training normalizer")


def _rot6d(quaternion: tuple[float, float, float, float]) -> tuple[float, ...]:
    """First two rotation-matrix columns, from a normalized xyzw quaternion."""
    x, y, z, w = quaternion
    norm = sqrt(x*x + y*y + z*z + w*w)
    if not all(isfinite(value) for value in quaternion) or abs(norm - 1.0) > 1e-6:
        raise ValueError("canonical EE pose must contain unit quaternion xyzw rotations")
    x, y, z, w = x / norm, y / norm, z / norm, w / norm
    return (
        1 - 2 * (y*y + z*z), 2 * (x*y + z*w), 2 * (x*z - y*w),
        2 * (x*y - z*w), 1 - 2 * (x*x + z*z), 2 * (y*z + x*w),
    )


class Pi05Adapter:
    """Create only the common OpenPI-style `observation.state` and `action` view."""

    def __init__(self, config: Pi05AdapterConfig) -> None:
        self.config = config

    def contract(self) -> dict[str, Any]:
        """Return serializable model-view semantics for a training run receipt.

        The returned mapping belongs with the OpenPI run/configuration artifact, not in
        the canonical recording.  In particular, the identifier says which external
        normalizer was selected without claiming this adapter applies normalization.
        """
        return {
            "adapter": "realman_recording.adapters.pi05",
            "rotation_representation": self.config.rotation_representation,
            "expected_state_dim": self.config.expected_state_dim,
            "expected_action_dim": self.config.expected_action_dim,
            "include_gripper_command": self.config.include_gripper_command,
            "action_representation": self.config.action_representation,
            "dataset_fps": self.config.dataset_fps,
            "normalizer_asset_version": self.config.normalizer_asset_version,
        }

    def adapt(self, frame: CanonicalFrame | Mapping[str, Any]) -> dict[str, tuple[float, ...]]:
        if isinstance(frame, Mapping):
            frame = self._from_feature_mapping(frame)
        if not frame.valid:
            raise ValueError("invalid canonical frame cannot become a π0.5 training example")
        if len(frame.ee_pose_base) % 7 or len(frame.gripper_position) != len(frame.ee_pose_base) // 7:
            raise ValueError("canonical EE pose/gripper layout is inconsistent")
        state: list[float] = []
        for offset in range(0, len(frame.ee_pose_base), 7):
            pose = frame.ee_pose_base[offset:offset + 7]
            state.extend(pose[:3])
            state.extend(pose[3:] if self.config.rotation_representation == "quaternion_xyzw" else _rot6d(pose[3:]))
        state.extend(frame.gripper_position)
        action = tuple(float(value) for value in frame.command_cartesian_velocity)
        if self.config.include_gripper_command:
            if frame.command_gripper is None:
                raise ValueError("π0.5 profile requires a recorded canonical gripper command")
            action += tuple(float(value) for value in frame.command_gripper)
        if self.config.action_representation == "cartesian_delta":
            assert self.config.dataset_fps is not None
            action = tuple(value / self.config.dataset_fps for value in action)
        if len(state) != self.config.expected_state_dim:
            raise ValueError(f"π0.5 state dimension {len(state)} does not match configured checkpoint dimension {self.config.expected_state_dim}")
        if len(action) != self.config.expected_action_dim:
            raise ValueError(f"π0.5 action dimension {len(action)} does not match configured checkpoint dimension {self.config.expected_action_dim}")
        return {"observation.state": tuple(state), "action": action}

    @staticmethod
    def _from_feature_mapping(features: Mapping[str, Any]) -> CanonicalFrame:
        """Adapt the dictionary returned by ``LeRobotDataset[index]``."""
        def values(name: str) -> tuple[float, ...]:
            value = features.get(name)
            for method_name in ("detach", "cpu"):
                method = getattr(value, method_name, None)
                if callable(method):
                    value = method()
            method = getattr(value, "tolist", None)
            value = method() if callable(method) else value
            if value is None:
                raise ValueError(f"canonical LeRobot feature is missing: {name}")
            return tuple(float(item) for item in value)

        valid = features.get("quality.valid", (True,))
        method = getattr(valid, "tolist", None)
        valid = method() if callable(method) else valid
        if isinstance(valid, (list, tuple)):
            valid = valid[0] if valid else False
        return CanonicalFrame(
            joint_position=(), joint_velocity=(),
            ee_pose_base=values("observation.ee_pose_base"), ee_velocity_base=(),
            gripper_position=values("observation.gripper_position"),
            command_cartesian_velocity=values("action.command.cartesian_velocity"),
            command_gripper=(
                values("action.command.gripper") if "action.command.gripper" in features else None
            ), valid=bool(valid), sync_error_ns=(),
        )
