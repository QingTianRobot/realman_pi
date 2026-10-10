"""Launch isolated recording recorder and optional read-only Web bridge."""
from __future__ import annotations

import os
from datetime import datetime
from pathlib import Path

from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, SetEnvironmentVariable
from launch.conditions import IfCondition
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


def generate_launch_description() -> LaunchDescription:
    package_share = Path(get_package_share_directory("realman_recording"))
    # Docker mounts the repository configuration here; the installed package
    # copy remains the standalone/source-build fallback.
    config_root = Path(os.environ.get("REALMAN_CONFIG_ROOT", package_share / "config"))
    # Match the project-wide ROS logging contract even when this independent
    # collector is launched beside, rather than through, system.launch.py.
    log_root = Path(os.environ.get("REALMAN_LOG_ROOT", Path.cwd() / "logs"))
    run_log_dir = log_root / datetime.now().strftime("%Y%m%d_%H%M%S")
    run_log_dir.mkdir(mode=0o750, parents=True, exist_ok=True)
    return LaunchDescription(
        [
            SetEnvironmentVariable("ROS_LOG_DIR", str(run_log_dir)),
            SetEnvironmentVariable("RCUTILS_COLORIZED_OUTPUT", "1"),
            DeclareLaunchArgument(
                "recording_config_file",
                default_value=str(config_root / "ros" / "recording.yaml"),
                description="Authoritative recording parameters under config/ros.",
            ),
            DeclareLaunchArgument(
                "recording_root",
                default_value=os.environ.get("REALMAN_RECORDING_ROOT", "/data/realman-recordings"),
                description="Persistent runtime session root, never config/source storage.",
            ),
            DeclareLaunchArgument(
                "start_web_bridge",
                default_value="true",
                description="Start the read-only browser recording dashboard.",
            ),
            Node(
                package="realman_recording",
                executable="recorder_node",
                name="recording_recorder",
                output="screen",
                parameters=[
                    LaunchConfiguration("recording_config_file"),
                    {"recording_root": LaunchConfiguration("recording_root")},
                ],
            ),
            Node(
                package="realman_recording",
                executable="web_bridge_node",
                name="recording_web_bridge",
                output="screen",
                condition=IfCondition(LaunchConfiguration("start_web_bridge")),
                parameters=[LaunchConfiguration("recording_config_file")],
            ),
        ]
    )
