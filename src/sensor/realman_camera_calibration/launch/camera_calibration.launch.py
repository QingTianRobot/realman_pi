"""Launch the input monitor used as the first calibration milestone."""

import os
from datetime import datetime
from pathlib import Path

from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, SetEnvironmentVariable
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node
from launch_ros.parameter_descriptions import ParameterValue


def generate_launch_description() -> LaunchDescription:
    if "REALMAN_CONFIG_ROOT" in os.environ:
        default_config = str(
            Path(os.environ["REALMAN_CONFIG_ROOT"])
            / "ros"
            / "camera_calibration.yaml"
        )
    else:
        default_config = str(Path.cwd() / "config" / "ros" / "camera_calibration.yaml")
    config_root = Path(os.environ.get("REALMAN_CONFIG_ROOT", str(Path.cwd() / "config")))
    default_layout_config = str(config_root / "ros" / "three_robots.yaml")
    configured_log_dir = os.environ.get("ROS_LOG_DIR")
    if configured_log_dir:
        run_log_dir = Path(configured_log_dir)
    else:
        log_root = Path(os.environ.get("REALMAN_LOG_ROOT", str(Path.cwd() / "logs")))
        run_log_dir = log_root / datetime.now().strftime("%Y%m%d_%H%M%S")
    run_log_dir.mkdir(parents=True, exist_ok=True)
    return LaunchDescription(
        [
            SetEnvironmentVariable("ROS_LOG_DIR", str(run_log_dir)),
            SetEnvironmentVariable("RCUTILS_COLORIZED_OUTPUT", "1"),
            DeclareLaunchArgument("config_file", default_value=default_config),
            DeclareLaunchArgument(
                "layout_config_file",
                default_value=default_layout_config,
                description="Three-arm layout YAML updated after a successful solve.",
            ),
            DeclareLaunchArgument(
                "update_layout_after_solve",
                default_value=os.environ.get("REALMAN_UPDATE_LAYOUT_AFTER_CALIBRATION", "true"),
                description="Write calibrated middle/right base poses into the layout YAML.",
            ),
            Node(
                package="realman_camera_calibration",
                executable="camera_calibration_node",
                name="camera_calibration",
                output="screen",
                parameters=[
                    {
                        "config_file": LaunchConfiguration("config_file"),
                        "layout_config_file": LaunchConfiguration("layout_config_file"),
                        "update_layout_after_solve": ParameterValue(
                            LaunchConfiguration("update_layout_after_solve"), value_type=bool
                        ),
                    }
                ],
            ),
        ]
    )
