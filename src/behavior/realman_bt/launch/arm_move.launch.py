#!/usr/bin/env python3
"""Launch the standalone MoveJ behavior-tree demo."""

import os
from datetime import datetime
from pathlib import Path

from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, SetEnvironmentVariable
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


def _default_tree_file() -> str:
    """Prefer the repository config mount, then use the installed tree."""
    config_root = os.environ.get("REALMAN_CONFIG_ROOT")
    if config_root:
        candidate = Path(config_root) / "behavior-trees" / "arm_move.xml"
        if candidate.is_file():
            return str(candidate)
    package_share = Path(get_package_share_directory("realman_bt"))
    return str(package_share / "behavior-trees" / "arm_move.xml")


def _log_directory() -> Path:
    log_root = Path(os.environ.get("REALMAN_LOG_ROOT", Path.cwd() / "logs"))
    run_directory = log_root / datetime.now().strftime("%Y%m%d_%H%M%S")
    run_directory.mkdir(parents=True, exist_ok=True)
    return run_directory


def generate_launch_description():
    tree_file = DeclareLaunchArgument(
        "tree_file",
        default_value=_default_tree_file(),
        description="Absolute path to the behavior-tree XML file.",
    )
    arm_id = DeclareLaunchArgument(
        "arm_id",
        default_value="r",
        choices=["l", "m", "r"],
        description="RealMan arm namespace.",
    )
    dry_run = DeclareLaunchArgument(
        "dry_run",
        default_value="true",
        description="Validate the tree without sending a motion goal.",
    )
    tick_rate_hz = DeclareLaunchArgument(
        "tick_rate_hz",
        default_value="10.0",
        description="Behavior-tree tick frequency in Hz.",
    )
    autostart = DeclareLaunchArgument(
        "autostart",
        default_value="true",
        description="Start ticking immediately after the tree is loaded.",
    )
    stop_on_terminal = DeclareLaunchArgument(
        "stop_on_terminal",
        default_value="true",
        description="Stop ticking after SUCCESS or FAILURE.",
    )

    executor = Node(
        package="realman_bt",
        executable="realman_bt_executor",
        name="realman_bt_executor",
        output="screen",
        parameters=[
            {
                "tree_file": LaunchConfiguration("tree_file"),
                "arm_id": LaunchConfiguration("arm_id"),
                "dry_run": LaunchConfiguration("dry_run"),
                "tick_rate_hz": LaunchConfiguration("tick_rate_hz"),
                "autostart": LaunchConfiguration("autostart"),
                "stop_on_terminal": LaunchConfiguration("stop_on_terminal"),
            }
        ],
    )

    return LaunchDescription(
        [
            SetEnvironmentVariable("RCUTILS_COLORIZED_OUTPUT", "1"),
            SetEnvironmentVariable("ROS_LOG_DIR", str(_log_directory())),
            tree_file,
            arm_id,
            dry_run,
            tick_rate_hz,
            autostart,
            stop_on_terminal,
            executor,
        ]
    )
