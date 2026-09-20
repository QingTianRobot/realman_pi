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
    global_camera = config.get("global_camera", {})
    global_color = global_camera.get("color", {})
    global_depth = global_camera.get("depth", {})
    global_tf = global_camera.get("tf", {})
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
        # Global RealSense D435 (native realsense2_camera node). use_realsense is
        # auto-degraded to false by rm65_camera_ros2 when the driver is missing.
        "use_realsense": "true" if global_camera.get("enabled", True) else "false",
        # Wrap the serial in single quotes so launch_ros' YAML parameter inference
        # keeps it a string. The D435 serial is all digits and would otherwise be
        # parsed as an integer, which realsense_node_factory rejects: the node
        # then dies with "parameter 'serial_no' has invalid type".
        "realsense_serial_no": (
            "'{}'".format(global_camera["serial_no"])
            if global_camera.get("serial_no", "")
            else ""
        ),
        "realsense_device_type": str(global_camera.get("device_type", "d435")),
        "realsense_namespace": str(global_camera.get("namespace", "camera_global")),
        "realsense_camera_name": str(global_camera.get("camera_name", "d435")),
        "realsense_color_profile": "{}x{}x{}".format(
            global_color.get("width", 424),
            global_color.get("height", 240),
            global_color.get("fps", 15),
        ),
        "realsense_enable_depth": "true" if global_depth.get("enable", False) else "false",
        "realsense_depth_profile": "{}x{}x{}".format(
            global_depth.get("width", 480),
            global_depth.get("height", 270),
            global_depth.get("fps", 15),
        ),
        "realsense_align_depth": "true" if global_camera.get("align_depth", False) else "false",
        "realsense_pointcloud": "true" if global_camera.get("pointcloud", False) else "false",
        "realsense_tf_parent_frame": str(global_tf.get("parent_frame", "world")),
        "realsense_tf_child_frame": str(global_tf.get("child_frame", "d435_link")),
        "realsense_tf_x": str(global_tf.get("x", 0.0)),
        "realsense_tf_y": str(global_tf.get("y", 0.0)),
        "realsense_tf_z": str(global_tf.get("z", 0.0)),
        "realsense_tf_roll": str(global_tf.get("roll", 0.0)),
        "realsense_tf_pitch": str(global_tf.get("pitch", 0.0)),
        "realsense_tf_yaw": str(global_tf.get("yaw", 0.0)),
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


def _realsense_include(delay):
    realsense_launch = PathJoinSubstitution(
        [FindPackageShare("sensor_bringup"), "launch", "realsense_d435.launch.py"]
    )
    arguments = {
        "camera_namespace": LaunchConfiguration("realsense_namespace"),
        "camera_name": LaunchConfiguration("realsense_camera_name"),
        "serial_no": LaunchConfiguration("realsense_serial_no"),
        "device_type": LaunchConfiguration("realsense_device_type"),
        "enable_color": LaunchConfiguration("enable_color"),
        "enable_depth": LaunchConfiguration("realsense_enable_depth"),
        "color_profile": LaunchConfiguration("realsense_color_profile"),
        "depth_profile": LaunchConfiguration("realsense_depth_profile"),
        "align_depth": LaunchConfiguration("realsense_align_depth"),
        "pointcloud": LaunchConfiguration("realsense_pointcloud"),
    }
    return TimerAction(
        period=delay,
        actions=[
            GroupAction(
                [
                    IncludeLaunchDescription(
                        PythonLaunchDescriptionSource(realsense_launch),
                        launch_arguments=arguments.items(),
                        condition=IfCondition(LaunchConfiguration("use_realsense")),
                    )
                ]
            )
        ],
    )


def _realsense_static_tf():
    # Attach the D435 to the shared `world` frame so it joins the same TF tree as
    # the Orbbec optical frames. Pose comes from global_camera.tf in the config.
    return Node(
        package="tf2_ros",
        executable="static_transform_publisher",
        name="global_camera_transform",
        output="screen",
        condition=IfCondition(LaunchConfiguration("use_realsense")),
        arguments=[
            "--x", LaunchConfiguration("realsense_tf_x"),
            "--y", LaunchConfiguration("realsense_tf_y"),
            "--z", LaunchConfiguration("realsense_tf_z"),
            "--roll", LaunchConfiguration("realsense_tf_roll"),
            "--pitch", LaunchConfiguration("realsense_tf_pitch"),
            "--yaw", LaunchConfiguration("realsense_tf_yaw"),
            "--frame-id", LaunchConfiguration("realsense_tf_parent_frame"),
            "--child-frame-id", LaunchConfiguration("realsense_tf_child_frame"),
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
        DeclareLaunchArgument(
            "use_realsense",
            default_value=defaults["use_realsense"],
            description="Start the global RealSense D435 node alongside the Orbbec cameras.",
        ),
        DeclareLaunchArgument(
            "realsense_delay",
            default_value="24.0",
            description="Seconds to wait before opening the D435, after the Orbbec stagger.",
        ),
        DeclareLaunchArgument("realsense_serial_no", default_value=defaults["realsense_serial_no"]),
        DeclareLaunchArgument("realsense_device_type", default_value=defaults["realsense_device_type"]),
        DeclareLaunchArgument("realsense_namespace", default_value=defaults["realsense_namespace"]),
        DeclareLaunchArgument("realsense_camera_name", default_value=defaults["realsense_camera_name"]),
        DeclareLaunchArgument("realsense_color_profile", default_value=defaults["realsense_color_profile"]),
        DeclareLaunchArgument("realsense_enable_depth", default_value=defaults["realsense_enable_depth"]),
        DeclareLaunchArgument("realsense_depth_profile", default_value=defaults["realsense_depth_profile"]),
        DeclareLaunchArgument("realsense_align_depth", default_value=defaults["realsense_align_depth"]),
        DeclareLaunchArgument("realsense_pointcloud", default_value=defaults["realsense_pointcloud"]),
        DeclareLaunchArgument("realsense_tf_parent_frame", default_value=defaults["realsense_tf_parent_frame"]),
        DeclareLaunchArgument("realsense_tf_child_frame", default_value=defaults["realsense_tf_child_frame"]),
        DeclareLaunchArgument("realsense_tf_x", default_value=defaults["realsense_tf_x"]),
        DeclareLaunchArgument("realsense_tf_y", default_value=defaults["realsense_tf_y"]),
        DeclareLaunchArgument("realsense_tf_z", default_value=defaults["realsense_tf_z"]),
        DeclareLaunchArgument("realsense_tf_roll", default_value=defaults["realsense_tf_roll"]),
        DeclareLaunchArgument("realsense_tf_pitch", default_value=defaults["realsense_tf_pitch"]),
        DeclareLaunchArgument("realsense_tf_yaw", default_value=defaults["realsense_tf_yaw"]),
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
        _realsense_include(LaunchConfiguration("realsense_delay")),
        _realsense_static_tf(),
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
