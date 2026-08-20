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
    config_root = Path(os.environ.get("REALMAN_CONFIG_ROOT", package_share / "config"))

    return LaunchDescription(
        [
            DeclareLaunchArgument(
                "web_control_config_file",
                default_value=str(config_root / "ros" / "realman_web_control.yaml"),
                description="Annotated browser bridge settings under root config/ros.",
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
                "joint_record_dir",
                default_value=str(config_root / "web-control" / "joint-records"),
                description="Writable Web control joint target records under root config/.",
            ),
            Node(
                package="realman_web_control",
                executable="web_control_node",
                name="realman_web_control",
                output="screen",
                parameters=[
                    {
                        "web_control_config_file": LaunchConfiguration("web_control_config_file"),
                        "layout_config_file": LaunchConfiguration("layout_config_file"),
                        "motion_config_file": LaunchConfiguration("motion_config_file"),
                        "coordinates_config_file": LaunchConfiguration("coordinates_config_file"),
                        "joint_record_dir": LaunchConfiguration("joint_record_dir"),
                        "description_root": str(description_share),
                        "static_root": str(package_share / "static"),
                    }
                ],
            ),
        ]
    )
