#!/usr/bin/env python3
"""Launch the persistent, configuration-driven input-mode router."""

import os
from datetime import datetime
from pathlib import Path

from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, SetEnvironmentVariable
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


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


def generate_launch_description():
    config_root = _config_root()
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
            },
        ],
    )

    pika_router = Node(
        package="realman_bt",
        executable="pika_control_router",
        name="pika_control_router",
        output="screen",
        parameters=[{"dry_run": LaunchConfiguration("dry_run")}],
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
        ]
    )
