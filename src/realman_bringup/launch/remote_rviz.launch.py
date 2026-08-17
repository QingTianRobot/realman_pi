"""Start an RViz-only viewer for a remote RealMan ROS 2 graph."""

import os
from datetime import datetime
from pathlib import Path

from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, SetEnvironmentVariable
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


def generate_launch_description():
    config_root = os.environ.get("REALMAN_CONFIG_ROOT")
    if config_root:
        default_rviz_config = Path(config_root) / "rviz" / "three_robots.rviz"
    else:
        description_share = Path(get_package_share_directory("rm65_description"))
        default_rviz_config = description_share / "config" / "rviz" / "three_robots.rviz"
    log_root = Path(os.environ.get("REALMAN_LOG_ROOT", Path.cwd() / "logs"))
    run_log_dir = log_root / datetime.now().strftime("%Y%m%d_%H%M%S")
    run_log_dir.mkdir(parents=True, exist_ok=True)

    return LaunchDescription(
        [
            SetEnvironmentVariable("ROS_LOG_DIR", str(run_log_dir)),
            SetEnvironmentVariable("RCUTILS_COLORIZED_OUTPUT", "1"),
            DeclareLaunchArgument(
                "rviz_config",
                default_value=str(default_rviz_config),
                description="RViz configuration for the remote three-arm ROS graph.",
            ),
            Node(
                package="rviz2",
                executable="rviz2",
                name="rviz2",
                output="screen",
                arguments=["-d", LaunchConfiguration("rviz_config")],
            ),
        ]
    )
