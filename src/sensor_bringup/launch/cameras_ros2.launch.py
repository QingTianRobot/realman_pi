"""Start the production Orbbec cameras as ROS 2 image publishers.

The device selector is the serial number from ``config/ros/cameras_ros2.yaml``;
USB port names are intentionally not used because they change after re-plugging.
An optional, gitignored ``config/ros/cameras_ros2.local.yaml`` is deep-merged on
top of the base config so each site can override serials (or any other leaf
field) without touching the committed file; when it is absent the base config
alone drives the launch. The default profile is the low-bandwidth USB2 profile
validated on the production host. RViz is opt-in so the same launch works on a
headless industrial PC.
"""

import os
import sys
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


# Leaf keys accepted under a wrist camera's color / depth stream block. Anything
# else is a likely typo and is reported instead of being silently ignored.
_COLOR_LEAF_KEYS = {"width", "height", "fps", "format", "auto_exposure", "exposure"}
_DEPTH_LEAF_KEYS = {"width", "height", "fps", "format", "decimation_factor"}


def _warn(message):
    print(f"[cameras_ros2] WARNING: {message}", file=sys.stderr)


def _deep_merge(base, override):
    """Recursively merge ``override`` onto ``base``; leaf values in override win."""
    if not isinstance(base, dict) or not isinstance(override, dict):
        return override if override is not None else base
    merged = dict(base)
    for key, value in override.items():
        merged[key] = _deep_merge(merged.get(key), value) if isinstance(value, dict) else value
    return merged


def _base_config_path():
    return Path(get_package_share_directory("sensor_bringup")) / "config" / "cameras_ros2.yaml"


def _local_override_path(base_path):
    """Locate the optional, gitignored cameras_ros2.local.yaml override.

    Precedence:
      1. RM65_CAMERAS_LOCAL_CONFIG (absolute path) for ad-hoc overrides.
      2. Beside the resolved base config. Under ``colcon build --symlink-install``
         the installed base config is a symlink into ``config/ros/`` in the source
         tree, so resolving it finds a local file added or edited without a rebuild.
      3. Beside the installed base config (plain builds that installed a copy).
    Returns None when no override file exists, in which case the base config runs.
    """
    env_path = os.environ.get("RM65_CAMERAS_LOCAL_CONFIG")
    candidates = []
    if env_path:
        candidates.append(Path(env_path))
    candidates.append(base_path.resolve().parent / "cameras_ros2.local.yaml")
    candidates.append(base_path.parent / "cameras_ros2.local.yaml")
    for candidate in candidates:
        if candidate.is_file():
            return candidate
    return None


def _load_config():
    """Load the base cameras_ros2.yaml, then deep-merge the optional local override.

    Guarantees:
      - The local file is OPTIONAL: when it is absent the base config is used
        as-is and the launch runs normally.
      - Precedence is local > base at every leaf (deep merge, base-only keys kept).
    """
    base_path = _base_config_path()
    with base_path.open(encoding="utf-8") as config_file:
        config = yaml.safe_load(config_file) or {}

    local_path = _local_override_path(base_path)
    if local_path is None:
        # No local override present; the committed base config alone drives launch.
        print(f"[cameras_ros2] no local override; using base {base_path}", file=sys.stderr)
        return config

    # An empty or comment-only local file yields {} and leaves base untouched.
    with local_path.open(encoding="utf-8") as local_file:
        local = yaml.safe_load(local_file) or {}
    config = _deep_merge(config, local)  # local wins over base at every leaf
    print(f"[cameras_ros2] applied local override (local > base): {local_path}", file=sys.stderr)
    return config


def _resolve_side_streams(global_streams, device_cfg, side):
    """Deep-merge a device's stream leaves over the shared wrist defaults, then
    flatten them into gemini305.launch.py argument literals."""
    merged = _deep_merge(global_streams, device_cfg.get("streams", {}))
    color = merged.get("color", {}) or {}
    depth = merged.get("depth", {}) or {}

    for key in set(color) - _COLOR_LEAF_KEYS:
        _warn(f"wrist_cameras.devices.{side}.streams.color unknown key '{key}' (ignored)")
    for key in set(depth) - _DEPTH_LEAF_KEYS:
        _warn(f"wrist_cameras.devices.{side}.streams.depth unknown key '{key}' (ignored)")

    return {
        "color_width": str(color.get("width", 640)),
        "color_height": str(color.get("height", 480)),
        "color_fps": str(color.get("fps", 30)),
        "color_format": str(color.get("format", "MJPG")),
        "enable_color_auto_exposure": "true" if color.get("auto_exposure", True) else "false",
        "color_exposure": str(color.get("exposure", -1)),
        "depth_width": str(depth.get("width", 320)),
        "depth_height": str(depth.get("height", 240)),
        "depth_fps": str(depth.get("fps", 15)),
        "depth_format": str(depth.get("format", "Y16")),
        "depth_decimation_factor": str(depth.get("decimation_factor", 2)),
    }


def _load_defaults():
    config = _load_config()
    wrist = config.get("wrist_cameras", {}) or {}
    global_streams = wrist.get("streams", {}) or {}
    devices = wrist.get("devices", {}) or {}
    mode = wrist.get("mode", "color")
    sync = wrist.get("sync", {}) or {}
    global_camera = config.get("global_camera", {}) or {}
    global_color = global_camera.get("color", {}) or {}
    global_depth = global_camera.get("depth", {}) or {}
    global_tf = global_camera.get("tf", {}) or {}

    sides = {}
    for side in ("left", "middle", "right"):
        device_cfg = devices.get(side, {}) or {}
        sides[side] = {
            "serial": str(device_cfg.get("serial", "")),
            "streams": _resolve_side_streams(global_streams, device_cfg, side),
        }

    realsense_serial_raw = str(global_camera.get("serial_no", "") or "")
    return {
        "sides": sides,
        "enable_color": "true" if mode == "color" else "false",
        "enable_depth": "true" if mode == "depth" else "false",
        "enable_frame_sync": "true" if sync.get("enable_frame_sync", False) else "false",
        "trigger_out_enabled": "true" if sync.get("trigger_out_enabled", False) else "false",
        "software_trigger_enabled": "true" if sync.get("software_trigger_enabled", False) else "false",
        # Global RealSense D435 (native realsense2_camera node). use_realsense is
        # auto-degraded to false by rm65_camera_ros2 when the driver is missing.
        "use_realsense": "true" if global_camera.get("enabled", True) else "false",
        # Wrap the serial in single quotes so launch_ros' YAML parameter inference
        # keeps it a string. The D435 serial is all digits and would otherwise be
        # parsed as an integer, which realsense_node_factory rejects: the node
        # then dies with "parameter 'serial_no' has invalid type".
        "realsense_serial_no": "'{}'".format(realsense_serial_raw) if realsense_serial_raw else "",
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


def _camera_include(side, serial, stream_args, condition, delay):
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
        "enable_frame_sync": LaunchConfiguration("enable_frame_sync"),
        "trigger_out_enabled": LaunchConfiguration("trigger_out_enabled"),
        "software_trigger_enabled": LaunchConfiguration("software_trigger_enabled"),
        "log_level": "info",
    }
    # Per-side resolved stream/exposure literals, already merged from the shared
    # wrist defaults, this device's own streams block, and any local override.
    arguments.update(stream_args)
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
    sides = defaults["sides"]
    declarations = [
        DeclareLaunchArgument("left_serial", default_value=sides["left"]["serial"]),
        DeclareLaunchArgument("middle_serial", default_value=sides["middle"]["serial"]),
        DeclareLaunchArgument("right_serial", default_value=sides["right"]["serial"]),
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
            sides["left"]["streams"],
            IfCondition(LaunchConfiguration("use_left")),
            0.0,
        ),
        _camera_include(
            "middle",
            LaunchConfiguration("middle_serial"),
            sides["middle"]["streams"],
            IfCondition(LaunchConfiguration("use_middle")),
            8.0,
        ),
        _camera_include(
            "right",
            LaunchConfiguration("right_serial"),
            sides["right"]["streams"],
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
