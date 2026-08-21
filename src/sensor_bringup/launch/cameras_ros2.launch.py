"""Start the production Orbbec cameras as ROS 2 image publishers.

The device selector is the serial number from ``config/ros/cameras_ros2.yaml``;
USB port names are intentionally not used because they change after re-plugging.
The default profile is the low-bandwidth USB2 profile validated on the production
host. RViz is opt-in so the same launch works on a headless industrial PC.
"""

from pathlib import Path

import yaml
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, GroupAction, IncludeLaunchDescription, TimerAction
from launch.conditions import IfCondition
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration, PathJoinSubstitution
from launch_ros.actions import Node
from launch_ros.substitutions import FindPackageShare


def _load_defaults():
    config_path = Path(get_package_share_directory("sensor_bringup")) / "config" / "cameras_ros2.yaml"
    with config_path.open(encoding="utf-8") as config_file:
        config = yaml.safe_load(config_file) or {}
    cameras = config.get("cameras", {})
    streams = config.get("streams", {})
    color = streams.get("color", {})
    depth = streams.get("depth", {})
    return {
        "left_serial": str(cameras.get("left", {}).get("serial", "")),
        "middle_serial": str(cameras.get("middle", {}).get("serial", "")),
        "right_serial": str(cameras.get("right", {}).get("serial", "")),
        "left_color_auto_exposure": "true"
        if cameras.get("left", {}).get("color", {}).get("auto_exposure", True)
        else "false",
        "left_color_exposure": str(
            cameras.get("left", {}).get("color", {}).get("exposure", -1)
        ),
        "color_width": str(color.get("width", 640)),
        "color_height": str(color.get("height", 480)),
        "color_fps": str(color.get("fps", 30)),
        "color_format": str(color.get("format", "MJPG")),
        "enable_color": "true" if config.get("mode", "color") == "color" else "false",
        "depth_width": str(depth.get("width", 320)),
        "depth_height": str(depth.get("height", 240)),
        "depth_fps": str(depth.get("fps", 15)),
        "depth_format": str(depth.get("format", "Y16")),
        "depth_decimation_factor": str(depth.get("decimation_factor", 2)),
        "enable_depth": "true" if config.get("mode", "color") == "depth" else "false",
        "enable_frame_sync": "true" if config.get("sync", {}).get("enable_frame_sync", False) else "false",
        "trigger_out_enabled": "true" if config.get("sync", {}).get("trigger_out_enabled", False) else "false",
        "software_trigger_enabled": "true" if config.get("sync", {}).get("software_trigger_enabled", False) else "false",
    }


def _camera_include(side, serial, launch_arguments, condition, delay):
    camera_launch = PathJoinSubstitution(
        [FindPackageShare("orbbec_camera"), "launch", "gemini305.launch.py"]
    )
    arguments = {
        "camera_name": f"camera_{side}",
        "serial_number": serial,
        "device_num": LaunchConfiguration("device_num"),
        "enable_point_cloud": LaunchConfiguration("enable_point_cloud"),
        "enable_color": LaunchConfiguration("enable_color"),
        "enable_depth": LaunchConfiguration("enable_depth"),
        "color_width": LaunchConfiguration("color_width"),
        "color_height": LaunchConfiguration("color_height"),
        "color_fps": LaunchConfiguration("color_fps"),
        "color_format": LaunchConfiguration("color_format"),
        "depth_width": LaunchConfiguration("depth_width"),
        "depth_height": LaunchConfiguration("depth_height"),
        "depth_fps": LaunchConfiguration("depth_fps"),
        "depth_format": LaunchConfiguration("depth_format"),
        "depth_decimation_factor": LaunchConfiguration("depth_decimation_factor"),
        "enable_frame_sync": LaunchConfiguration("enable_frame_sync"),
        "trigger_out_enabled": LaunchConfiguration("trigger_out_enabled"),
        "software_trigger_enabled": LaunchConfiguration("software_trigger_enabled"),
        "log_level": "info",
    }
    arguments.update(launch_arguments)
    return TimerAction(
        period=delay,
        actions=[
            GroupAction(
                [
                    IncludeLaunchDescription(
                        PythonLaunchDescriptionSource(camera_launch),
                        launch_arguments=arguments.items(),
                        condition=condition,
                    )
                ]
            )
        ],
    )


def generate_launch_description():
    defaults = _load_defaults()
    declarations = [
        DeclareLaunchArgument("left_serial", default_value=defaults["left_serial"]),
        DeclareLaunchArgument("middle_serial", default_value=defaults["middle_serial"]),
        DeclareLaunchArgument("right_serial", default_value=defaults["right_serial"]),
        DeclareLaunchArgument(
            "left_color_auto_exposure",
            default_value=defaults["left_color_auto_exposure"],
        ),
        DeclareLaunchArgument(
            "left_color_exposure", default_value=defaults["left_color_exposure"]
        ),
        DeclareLaunchArgument("use_left", default_value="true"),
        DeclareLaunchArgument("use_middle", default_value="true"),
        DeclareLaunchArgument("use_right", default_value="true"),
        DeclareLaunchArgument("use_rviz", default_value="false"),
        DeclareLaunchArgument("enable_color", default_value=defaults["enable_color"]),
        DeclareLaunchArgument("enable_depth", default_value=defaults["enable_depth"]),
        DeclareLaunchArgument("enable_point_cloud", default_value="false"),
        DeclareLaunchArgument(
            "device_num",
            default_value="3",
            description="Number of Orbbec devices in the shared SDK context.",
        ),
        DeclareLaunchArgument("color_width", default_value=defaults["color_width"]),
        DeclareLaunchArgument("color_height", default_value=defaults["color_height"]),
        DeclareLaunchArgument("color_fps", default_value=defaults["color_fps"]),
        DeclareLaunchArgument("color_format", default_value=defaults["color_format"]),
        DeclareLaunchArgument("depth_width", default_value=defaults["depth_width"]),
        DeclareLaunchArgument("depth_height", default_value=defaults["depth_height"]),
        DeclareLaunchArgument("depth_fps", default_value=defaults["depth_fps"]),
        DeclareLaunchArgument("depth_format", default_value=defaults["depth_format"]),
        DeclareLaunchArgument(
            "depth_decimation_factor",
            default_value=defaults["depth_decimation_factor"],
        ),
        DeclareLaunchArgument("enable_frame_sync", default_value=defaults["enable_frame_sync"]),
        DeclareLaunchArgument("trigger_out_enabled", default_value=defaults["trigger_out_enabled"]),
        DeclareLaunchArgument(
            "software_trigger_enabled",
            default_value=defaults["software_trigger_enabled"],
        ),
        DeclareLaunchArgument(
            "rviz_config",
            default_value=str(
                Path(get_package_share_directory("sensor_bringup")) / "config" / "rviz" / "cameras.rviz"
            ),
        ),
    ]

    camera_actions = [
        _camera_include(
            "left",
            LaunchConfiguration("left_serial"),
            {
                "enable_color_auto_exposure": LaunchConfiguration(
                    "left_color_auto_exposure"
                ),
                "color_exposure": LaunchConfiguration("left_color_exposure"),
            },
            IfCondition(LaunchConfiguration("use_left")),
            0.0,
        ),
        _camera_include(
            "middle",
            LaunchConfiguration("middle_serial"),
            {},
            IfCondition(LaunchConfiguration("use_middle")),
            8.0,
        ),
        _camera_include(
            "right",
            LaunchConfiguration("right_serial"),
            {},
            IfCondition(LaunchConfiguration("use_right")),
            16.0,
        ),
        Node(
            package="rviz2",
            executable="rviz2",
            name="camera_rviz2",
            output="screen",
            arguments=["-d", LaunchConfiguration("rviz_config")],
            condition=IfCondition(LaunchConfiguration("use_rviz")),
        ),
    ]
    return LaunchDescription(declarations + camera_actions)
