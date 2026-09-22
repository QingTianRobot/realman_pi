#!/usr/bin/env python3
"""Launch the persistent, configuration-driven input-mode router."""

import math
import os
import sys
from datetime import datetime
from pathlib import Path

import yaml

from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, SetEnvironmentVariable
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node

sys.path.insert(0, str(Path(__file__).resolve().parent))
from coordinate_reference_registry import load_runtime_registries  # noqa: E402


def _config_root() -> Path:
    return Path(os.environ.get("REALMAN_CONFIG_ROOT", "/opt/rm65_ws/config"))


def _log_directory() -> Path:
    log_root = Path(os.environ.get("REALMAN_LOG_ROOT", Path.cwd() / "logs"))
    run_directory = log_root / datetime.now().strftime("%Y%m%d_%H%M%S")
    run_directory.mkdir(parents=True, exist_ok=True)
    return run_directory


def _default_runtime_snapshot_file() -> str:
    """Store runtime state beside the active behavior-tree workspace."""
    return os.environ.get("BT_TREE_WORKSPACE", "/tmp/realman-bt-workspace") + "/runtime.json"


def _load_pika_joint_defaults(config_file: Path) -> dict[str, str]:
    """Load the production Pika schema and expose only its joint angles."""
    with config_file.open("r", encoding="utf-8") as stream:
        document = yaml.safe_load(stream) or {}
    pose = document.get("pika_default_pose")
    if not isinstance(pose, dict):
        raise ValueError(f"missing pika_default_pose in {config_file}")

    values: dict[str, str] = {}
    for config_name, blackboard_name in (
        ("left", "pika_l_joint_degrees"),
        ("middle", "pika_m_joint_degrees"),
        ("right", "pika_r_joint_degrees"),
    ):
        arm = pose.get(config_name)
        joints = arm.get("joint_degrees") if isinstance(arm, dict) else None
        if not isinstance(joints, list) or len(joints) != 6:
            raise ValueError(
                f"{config_file}: pika_default_pose.{config_name}.joint_degrees must contain six values"
            )
        if any(
            isinstance(value, bool)
            or not isinstance(value, (int, float))
            or not math.isfinite(float(value))
            for value in joints
        ):
            raise ValueError(
                f"{config_file}: pika_default_pose.{config_name}.joint_degrees must be finite numbers"
            )
        values[blackboard_name] = ",".join(format(float(value), ".15g") for value in joints)
    return values


def _load_pika_velocity_config(config_file: Path) -> dict[str, str | float]:
    with config_file.open("r", encoding="utf-8") as stream:
        document = yaml.safe_load(stream) or {}
    velocity = document.get("pika_velocity")
    if not isinstance(velocity, dict):
        raise ValueError(f"missing pika_velocity in {config_file}")
    work_reference = velocity.get("work_reference")
    if not isinstance(work_reference, str) or not work_reference:
        raise ValueError(f"{config_file}: pika_velocity.work_reference must be a non-empty string")
    result: dict[str, str | float] = {
        "pika_velocity_work_reference": work_reference,
    }
    for config_name, parameter_name in (
        ("max_linear_speed_mps", "pika_velocity_max_linear_speed_mps"),
        ("max_angular_speed_radps", "pika_velocity_max_angular_speed_radps"),
    ):
        value = velocity.get(config_name)
        if (
            isinstance(value, bool)
            or not isinstance(value, (int, float))
            or not math.isfinite(float(value))
            or float(value) <= 0.0
        ):
            raise ValueError(f"{config_file}: pika_velocity.{config_name} must be positive")
        result[parameter_name] = float(value)
    return result


def _load_keyboard_input_timeout(config_file: Path) -> int:
    with config_file.open("r", encoding="utf-8") as stream:
        document = yaml.safe_load(stream) or {}
    value = document.get("input_timeout_ms")
    if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
        raise ValueError(f"{config_file}: input_timeout_ms must be a positive integer")
    return value


def generate_launch_description():
    config_root = _config_root()
    pika_config_file = config_root / "ros" / "pika_config.yaml"
    pika_joint_defaults = _load_pika_joint_defaults(pika_config_file)
    pika_velocity_config = _load_pika_velocity_config(pika_config_file)
    coordinate_references, velocity_profiles = load_runtime_registries(
        config_root / "ros" / "realman_coordinates.yaml",
        config_root / "ros" / "realman_motion.yaml",
    )
    keyboard_input_timeout_ms = _load_keyboard_input_timeout(
        config_root / "ros" / "keyboard_control.yaml"
    )
    tree_file = DeclareLaunchArgument(
        "tree_file",
        default_value=str(config_root / "behavior-trees" / "control.xml"),
        description="Absolute path to the persistent control-router XML file.",
    )
    arm_id = DeclareLaunchArgument(
        "arm_id",
        default_value="r",
        choices=["l", "m", "r"],
        description="Default RealMan arm namespace for compatible tree nodes.",
    )
    dry_run = DeclareLaunchArgument(
        "dry_run",
        default_value="true",
        description="Validate compatible motion nodes without sending a goal.",
    )
    stop_on_terminal = DeclareLaunchArgument(
        "stop_on_terminal",
        default_value="false",
        description="Keep ticking after a router branch reaches a terminal status.",
    )
    exit_on_terminal = DeclareLaunchArgument(
        "exit_on_terminal",
        default_value="false",
        description="Keep the persistent executor alive after terminal cleanup.",
    )
    runtime_snapshot_file = DeclareLaunchArgument(
        "runtime_snapshot_file",
        default_value=_default_runtime_snapshot_file(),
        description="Atomic JSON file containing the latest behavior-tree runtime snapshot.",
    )

    executor = Node(
        package="realman_bt",
        executable="realman_bt_executor",
        name="realman_bt_executor",
        output="screen",
        parameters=[
            str(config_root / "ros" / "behavior_tree.yaml"),
            {
                "tree_file": LaunchConfiguration("tree_file"),
                "arm_id": LaunchConfiguration("arm_id"),
                "dry_run": LaunchConfiguration("dry_run"),
                "stop_on_terminal": LaunchConfiguration("stop_on_terminal"),
                "exit_on_terminal": LaunchConfiguration("exit_on_terminal"),
                "runtime_snapshot_file": LaunchConfiguration("runtime_snapshot_file"),
                **pika_joint_defaults,
                "coordinate_references": coordinate_references,
                "cartesian_velocity_profiles": velocity_profiles,
            },
        ],
    )

    pika_router = Node(
        package="realman_bt",
        executable="pika_control_router",
        name="pika_control_router",
        output="screen",
        parameters=[{
            "dry_run": LaunchConfiguration("dry_run"),
            "coordinate_references": coordinate_references,
            "cartesian_velocity_profiles": velocity_profiles,
            **pika_velocity_config,
        }],
    )

    keyboard_router = Node(
        package="realman_bt",
        executable="keyboard_control_router",
        name="keyboard_control_router",
        output="screen",
        parameters=[{
            "dry_run": LaunchConfiguration("dry_run"),
            "input_timeout_ms": keyboard_input_timeout_ms,
            "coordinate_references": coordinate_references,
            "cartesian_velocity_profiles": velocity_profiles,
        }],
    )

    return LaunchDescription(
        [
            SetEnvironmentVariable("RCUTILS_COLORIZED_OUTPUT", "1"),
            SetEnvironmentVariable("ROS_LOG_DIR", str(_log_directory())),
            tree_file,
            arm_id,
            dry_run,
            stop_on_terminal,
            exit_on_terminal,
            runtime_snapshot_file,
            executor,
            pika_router,
            keyboard_router,
        ]
    )
