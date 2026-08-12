import os
from datetime import datetime
from pathlib import Path

from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription, SetEnvironmentVariable
from launch.conditions import IfCondition
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


def generate_launch_description():
    bringup_share = Path(get_package_share_directory("realman_bringup"))
    description_share = Path(get_package_share_directory("rm65_description"))
    three_robots_launch = description_share / "launch" / "three_robots.launch.py"
    # Docker mounts the repository configuration at REALMAN_CONFIG_ROOT so edits
    # are picked up on restart. Installed config remains the local build fallback.
    config_root = Path(os.environ.get("REALMAN_CONFIG_ROOT", bringup_share / "config"))
    three_robots_config = config_root / "ros" / "three_robots.yaml"
    controller_config = config_root / "ros" / "xbox_controller.yaml"

    # One launch invocation gets one timestamped ROS log directory. The ROS 2
    # processes keep their official node-specific log files inside it.
    log_root = Path(os.environ.get("REALMAN_LOG_ROOT", Path.cwd() / "logs"))
    run_log_dir = log_root / datetime.now().strftime("%Y%m%d_%H%M%S")
    run_log_dir.mkdir(parents=True, exist_ok=True)

    start_robots = LaunchConfiguration("start_robots")
    start_joy_driver = LaunchConfiguration("start_joy_driver")
    start_controller = LaunchConfiguration("start_controller")
    use_gui = LaunchConfiguration("use_gui")
    use_rviz = LaunchConfiguration("use_rviz")

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
            IncludeLaunchDescription(
                PythonLaunchDescriptionSource(str(three_robots_launch)),
                condition=IfCondition(start_robots),
                launch_arguments={
                    "config_file": str(three_robots_config),
                    "use_gui": use_gui,
                    "use_rviz": use_rviz,
                }.items(),
            ),
            Node(
                package="joy",
                executable="game_controller_node",
                namespace="input",
                name="joy_node",
                output="screen",
                condition=IfCondition(start_joy_driver),
                parameters=[str(controller_config)],
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
        ]
    )
