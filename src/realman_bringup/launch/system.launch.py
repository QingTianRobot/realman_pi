import os
import time
from datetime import datetime
from glob import glob
from pathlib import Path

from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import (
    DeclareLaunchArgument,
    IncludeLaunchDescription,
    OpaqueFunction,
    SetEnvironmentVariable,
    TimerAction,
)
from launch.conditions import IfCondition
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.logging import get_logger
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


def _device_paths(device_path):
    if device_path == "auto":
        return (
            glob("/dev/input/by-id/*-event-joystick")
            + glob("/dev/input/by-path/*-event-joystick")
        )
    return glob(device_path)


def _device_available(device_path):
    return any(Path(path).exists() for path in _device_paths(device_path))


def generate_launch_description():
    bringup_share = Path(get_package_share_directory("realman_bringup"))
    description_share = Path(get_package_share_directory("rm65_description"))
    three_robots_launch = description_share / "launch" / "three_robots.launch.py"
    driver_share = Path(get_package_share_directory("realman_robot_driver"))
    web_control_share = Path(get_package_share_directory("realman_web_control"))
    three_drivers_launch = driver_share / "launch" / "three_realman_drivers.launch.py"
    # Docker mounts the repository configuration at REALMAN_CONFIG_ROOT so edits
    # are picked up on restart. Installed config remains the local build fallback.
    config_root = Path(os.environ.get("REALMAN_CONFIG_ROOT", bringup_share / "config"))
    three_robots_config = config_root / "ros" / "three_robots.yaml"
    default_driver_config = config_root / "ros" / "realman_driver.yaml"
    driver_config_root = Path(
        os.environ.get("REALMAN_CONFIG_ROOT", driver_share / "config")
    )
    default_coordinates_config = driver_config_root / "ros" / "realman_coordinates.yaml"
    default_motion_config = driver_config_root / "ros" / "realman_motion.yaml"
    controller_config = config_root / "ros" / "xbox_controller.yaml"

    # One launch invocation gets one timestamped ROS log directory. The ROS 2
    # processes keep their official node-specific log files inside it.
    log_root = Path(os.environ.get("REALMAN_LOG_ROOT", Path.cwd() / "logs"))
    run_log_dir = log_root / datetime.now().strftime("%Y%m%d_%H%M%S")
    run_log_dir.mkdir(parents=True, exist_ok=True)

    start_robots = LaunchConfiguration("start_robots")
    start_joy_driver_config = LaunchConfiguration("start_joy_driver")
    start_controller = LaunchConfiguration("start_controller")
    use_gui = LaunchConfiguration("use_gui")
    use_rviz = LaunchConfiguration("use_rviz")
    start_driver = LaunchConfiguration("start_driver")
    driver_config_file = LaunchConfiguration("driver_config_file")
    coordinates_config_file = LaunchConfiguration("coordinates_config_file")
    motion_config_file = LaunchConfiguration("motion_config_file")
    start_web_control = LaunchConfiguration("start_web_control")
    web_control_config_file = LaunchConfiguration("web_control_config_file")
    wait_for_joy_device = LaunchConfiguration("wait_for_joy_device")
    joy_device_path = LaunchConfiguration("joy_device_path")
    joy_poll_interval = LaunchConfiguration("joy_poll_interval")
    logger = get_logger("realman_bringup")
    wait_state = {"last_log_time": 0.0}

    def start_joy_driver_when_available(context):
        device_path = joy_device_path.perform(context)
        joy_node = Node(
            package="joy",
            executable="game_controller_node",
            namespace="input",
            name="joy_node",
            output="screen",
            parameters=[str(controller_config)],
        )

        if wait_for_joy_device.perform(context).lower() != "true":
            return [joy_node]

        if _device_available(device_path):
            logger.info(f"Joystick device found: {device_path}")
            return [joy_node]

        now = time.monotonic()
        if now - wait_state["last_log_time"] >= 5.0:
            logger.info(
                f"Waiting for joystick device '{device_path}'. "
                "The launch will keep polling until it appears."
            )
            wait_state["last_log_time"] = now

        try:
            poll_interval = max(0.1, float(joy_poll_interval.perform(context)))
        except ValueError:
            logger.error("joy_poll_interval must be a positive number; using 1.0")
            poll_interval = 1.0

        return [
            TimerAction(
                period=poll_interval,
                actions=[OpaqueFunction(function=start_joy_driver_when_available)],
            )
        ]

    return LaunchDescription(
        [
            SetEnvironmentVariable("ROS_LOG_DIR", str(run_log_dir)),
            SetEnvironmentVariable("RCUTILS_COLORIZED_OUTPUT", "1"),
            DeclareLaunchArgument(
                "start_robots",
                default_value="true",
                description="Start the configured l, m, and r RM65 descriptions and TF trees.",
            ),
            DeclareLaunchArgument(
                "start_joy_driver",
                default_value="true",
                description="Read the mapped SDL event device with game_controller_node.",
            ),
            DeclareLaunchArgument(
                "start_controller",
                default_value="true",
                description="Start the C++ Xbox button event logger.",
            ),
            DeclareLaunchArgument(
                "use_gui",
                default_value="false",
                description="Start one joint_state_publisher_gui window per robot.",
            ),
            DeclareLaunchArgument(
                "use_rviz",
                default_value="true",
                description="Start RViz 2 with the three-arm display configuration.",
            ),
            DeclareLaunchArgument(
                "start_driver",
                default_value="true",
                description="Start the three RealMan drivers and use their joint states for TF.",
            ),
            DeclareLaunchArgument(
                "driver_config_file",
                default_value=str(default_driver_config),
                description="RealMan driver YAML under the project-root config/ directory.",
            ),
            DeclareLaunchArgument(
                "coordinates_config_file",
                default_value=str(default_coordinates_config),
                description="Desired RealMan coordinate profiles under root config/ros.",
            ),
            DeclareLaunchArgument(
                "motion_config_file",
                default_value=str(default_motion_config),
                description="RealMan motion safety limits under root config/ros.",
            ),
            DeclareLaunchArgument(
                "start_web_control",
                default_value="false",
                description="Start the authenticated browser WebSocket/action bridge.",
            ),
            DeclareLaunchArgument(
                "web_control_config_file",
                default_value=str(config_root / "ros" / "realman_web_control.yaml"),
                description="Browser bridge settings under the project-root config/ directory.",
            ),
            DeclareLaunchArgument(
                "wait_for_joy_device",
                default_value="false",
                description="Keep polling until the configured joystick device appears.",
            ),
            DeclareLaunchArgument(
                "joy_device_path",
                default_value=os.environ.get("REALMAN_JOY_DEVICE", "auto"),
                description="Joystick path, glob, or auto to scan /dev/input.",
            ),
            DeclareLaunchArgument(
                "joy_poll_interval",
                default_value="1.0",
                description="Seconds between joystick device checks.",
            ),
            IncludeLaunchDescription(
                PythonLaunchDescriptionSource(str(three_robots_launch)),
                condition=IfCondition(start_robots),
                launch_arguments={
                    "config_file": str(three_robots_config),
                    "use_gui": use_gui,
                    "use_rviz": use_rviz,
                    "use_driver_joint_states": start_driver,
                }.items(),
            ),
            IncludeLaunchDescription(
                PythonLaunchDescriptionSource(str(three_drivers_launch)),
                condition=IfCondition(start_driver),
                launch_arguments={
                    "config_file": driver_config_file,
                    "coordinates_config_file": coordinates_config_file,
                    "motion_config_file": motion_config_file,
                }.items(),
            ),
            IncludeLaunchDescription(
                PythonLaunchDescriptionSource(
                    str(web_control_share / "launch" / "web_control.launch.py")
                ),
                condition=IfCondition(start_web_control),
                launch_arguments={
                    "web_control_config_file": web_control_config_file,
                    "layout_config_file": str(three_robots_config),
                    "motion_config_file": motion_config_file,
                    "coordinates_config_file": coordinates_config_file,
                }.items(),
            ),
            Node(
                package="xbox_controller_driver",
                executable="xbox_controller_node",
                namespace="input",
                name="xbox_controller",
                output="screen",
                condition=IfCondition(start_controller),
                parameters=[str(controller_config)],
            ),
            OpaqueFunction(
                function=start_joy_driver_when_available,
                condition=IfCondition(start_joy_driver_config),
            ),
        ]
    )
