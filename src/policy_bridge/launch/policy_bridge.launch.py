#!/usr/bin/env python3
"""Launch the policy_bridge_node (VLA policy service <-> ROS 2 bridge).

Configuration lives under the project-root ``config/`` directory (authoritative
source: ``config/ros/policy_bridge.yaml``); the container mounts it at
``/opt/rm65_ws/config``. Logs follow the timestamped ``logs/YYYYMMDD_HHMMSS/``
convention with colored rcutils output.
"""

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


def generate_launch_description():
    config_root = _config_root()
    return LaunchDescription(
        [
            SetEnvironmentVariable("RCUTILS_COLORIZED_OUTPUT", "1"),
            SetEnvironmentVariable("ROS_LOG_DIR", str(_log_directory())),
            DeclareLaunchArgument(
                "config_file",
                default_value=str(config_root / "ros" / "policy_bridge.yaml"),
                description="Absolute path to the policy bridge YAML configuration.",
            ),
            DeclareLaunchArgument(
                "active_side",
                default_value="left",
                choices=["left", "right"],
                description="Phase-1 single-arm stream: which side the action chunk drives.",
            ),
            Node(
                package="policy_bridge",
                executable="policy_bridge_node",
                name="policy_bridge_node",
                output="screen",
                parameters=[
                    {
                        "config_file": LaunchConfiguration("config_file"),
                        "active_side": LaunchConfiguration("active_side"),
                    }
                ],
            ),
        ]
    )
