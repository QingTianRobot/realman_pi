import os
from pathlib import Path

from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


def generate_launch_description():
    package_share = Path(get_package_share_directory("realman_web_control"))
    description_share = Path(get_package_share_directory("rm65_description"))
    config_root = Path(os.environ.get("REALMAN_CONFIG_ROOT", Path.cwd() / "config"))

    return LaunchDescription(
        [
            DeclareLaunchArgument(
                "web_control_config_file",
                default_value=str(config_root / "ros" / "realman_web_control.yaml"),
                description="Root Web settings, including input-mode discovery and override timing.",
            ),
            DeclareLaunchArgument(
                "layout_config_file",
                default_value=str(config_root / "ros" / "three_robots.yaml"),
                description="Three-arm Web/TF layout under root config/ros.",
            ),
            DeclareLaunchArgument(
                "motion_config_file",
                default_value=str(config_root / "ros" / "realman_motion.yaml"),
                description="Motion limits exposed to the browser UI.",
            ),
            DeclareLaunchArgument(
                "coordinates_config_file",
                default_value=str(config_root / "ros" / "realman_coordinates.yaml"),
                description="Verified coordinate frame names exposed to the browser UI.",
            ),
            DeclareLaunchArgument(
                "keyboard_control_config_file",
                default_value=str(config_root / "ros" / "keyboard_control.yaml"),
                description="Dual-arm Web keyboard bindings and heartbeat timing.",
            ),
            DeclareLaunchArgument(
                "joint_record_dir",
                default_value=str(config_root / "web-control" / "joint-records"),
                description="Writable Web control joint target records under root config/.",
            ),
            DeclareLaunchArgument(
                "gripper_config_file",
                default_value=str(config_root / "ros" / "gripper.yaml"),
                description="Changingtek gripper topology under root config/ros.",
            ),
            DeclareLaunchArgument(
                "calibration_config_file",
                default_value=str(config_root / "ros" / "camera_calibration.yaml"),
                description="ChArUco calibration service configuration.",
            ),
            Node(
                package="realman_web_control",
                executable="web_control_node",
                name="realman_web_control",
                output="screen",
                parameters=[
                    {
                        # WebServerConfig loads input_mode timing from this file once.
                        "web_control_config_file": LaunchConfiguration("web_control_config_file"),
                        "layout_config_file": LaunchConfiguration("layout_config_file"),
                        "motion_config_file": LaunchConfiguration("motion_config_file"),
                        "coordinates_config_file": LaunchConfiguration("coordinates_config_file"),
                        "keyboard_control_config_file": LaunchConfiguration("keyboard_control_config_file"),
                        "joint_record_dir": LaunchConfiguration("joint_record_dir"),
                        "description_root": str(description_share),
                        "static_root": str(package_share / "static"),
                        "calibration_config_file": LaunchConfiguration("calibration_config_file"),
                        "gripper_config_file": LaunchConfiguration("gripper_config_file"),
                    }
                ],
            ),
        ]
    )
