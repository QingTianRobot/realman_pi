"""Thin wrapper around the upstream ``realsense2_camera`` driver launch.

The global RealSense D435 is published through the native ROS 2 node so its
image topics stay the single source of truth for calibration and RViz, matching
the three Orbbec streams in ``cameras_ros2.launch.py``.

This file only maps a small, curated set of selectors onto the upstream
``rs_launch.py`` and pins a namespace/camera name so the D435 never collides with
the Orbbec ``/camera_left|middle|right`` topics. When ``realsense2_camera`` is
absent (the librealsense/realsense-ros submodules are not built), the parent
launch degrades gracefully via ``use_realsense:=false`` and never reaches here.
"""

from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration, PathJoinSubstitution
from launch_ros.substitutions import FindPackageShare


def generate_launch_description():
    upstream_launch = PathJoinSubstitution(
        [FindPackageShare("realsense2_camera"), "rs_launch.py"]
    )

    declarations = [
        DeclareLaunchArgument(
            "camera_namespace",
            default_value="camera_global",
            description="Namespace that isolates the D435 from the Orbbec cameras.",
        ),
        DeclareLaunchArgument(
            "camera_name",
            default_value="d435",
            description="Base name; upstream derives TF frames such as d435_link.",
        ),
        DeclareLaunchArgument(
            "serial_no",
            default_value="",
            description="D435 serial number; empty selects the first device.",
        ),
        DeclareLaunchArgument(
            "device_type",
            default_value="d435",
            description="RealSense device type filter passed to the driver.",
        ),
        DeclareLaunchArgument("enable_color", default_value="true"),
        DeclareLaunchArgument("enable_depth", default_value="false"),
        DeclareLaunchArgument(
            "color_profile",
            default_value="424x240x15",
            description="Color width x height x fps validated on the USB2 topology.",
        ),
        DeclareLaunchArgument(
            "depth_profile",
            default_value="480x270x15",
            description="Depth width x height x fps; only used when enable_depth.",
        ),
        DeclareLaunchArgument("align_depth", default_value="false"),
        DeclareLaunchArgument("pointcloud", default_value="false"),
    ]

    realsense_node = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(upstream_launch),
        launch_arguments={
            "camera_namespace": LaunchConfiguration("camera_namespace"),
            "camera_name": LaunchConfiguration("camera_name"),
            "serial_no": LaunchConfiguration("serial_no"),
            "device_type": LaunchConfiguration("device_type"),
            "enable_color": LaunchConfiguration("enable_color"),
            "enable_depth": LaunchConfiguration("enable_depth"),
            "rgb_camera.color_profile": LaunchConfiguration("color_profile"),
            "depth_module.depth_profile": LaunchConfiguration("depth_profile"),
            "align_depth.enable": LaunchConfiguration("align_depth"),
            "pointcloud.enable": LaunchConfiguration("pointcloud"),
            "publish_tf": "true",
        }.items(),
    )

    return LaunchDescription(declarations + [realsense_node])
