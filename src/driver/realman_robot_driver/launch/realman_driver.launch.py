import os
from datetime import datetime
from pathlib import Path

from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, OpaqueFunction, SetEnvironmentVariable
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


ROBOT_NAMESPACES = ("l", "m", "r")


def _launch_node(context):
    config_file = Path(LaunchConfiguration("config_file").perform(context)).expanduser()
    coordinates_config_file = Path(
        LaunchConfiguration("coordinates_config_file").perform(context)
    ).expanduser()
    motion_config_file = Path(
        LaunchConfiguration("motion_config_file").perform(context)
    ).expanduser()
    namespace = LaunchConfiguration("namespace").perform(context)
    if namespace not in ROBOT_NAMESPACES:
        raise ValueError("namespace must be one of l, m, or r")
    return [
        Node(
            package="realman_robot_driver",
            executable="realman_driver_node",
            namespace=namespace,
            name="realman_driver",
            # rcutils uses argv0 in the official log filename. Keep one file per arm.
            prefix=f'''bash -c 'name="$1"; shift; exec -a "$name" python3 "$@"' -- {namespace}_realman_driver''',
            output="screen",
            parameters=[
                str(config_file),
                {
                    "coordinates_config_file": str(coordinates_config_file),
                    "motion_config_file": str(motion_config_file),
                },
            ],
        )
    ]


def generate_launch_description():
    package_share = Path(get_package_share_directory("realman_robot_driver"))
    config_root = Path(
        os.environ.get(
            "REALMAN_CONFIG_ROOT",
            package_share / "config",
        )
    )
    default_config = config_root / "ros" / "realman_driver.yaml"
    default_coordinates_config = config_root / "ros" / "realman_coordinates.yaml"
    default_motion_config = config_root / "ros" / "realman_motion.yaml"
    log_root = Path(os.environ.get("REALMAN_LOG_ROOT", Path.cwd() / "logs"))
    run_log_dir = log_root / datetime.now().strftime("%Y%m%d_%H%M%S")
    run_log_dir.mkdir(parents=True, exist_ok=True)
    return LaunchDescription(
        [
            SetEnvironmentVariable("ROS_LOG_DIR", str(run_log_dir)),
            SetEnvironmentVariable("RCUTILS_COLORIZED_OUTPUT", "1"),
            DeclareLaunchArgument(
                "namespace",
                default_value="r",
                description="ROS namespace for one arm, for example l, m, or r.",
            ),
            DeclareLaunchArgument(
                "config_file",
                default_value=str(default_config),
                description="Annotated RealMan driver parameter YAML under root config/ros.",
            ),
            DeclareLaunchArgument(
                "coordinates_config_file",
                default_value=str(default_coordinates_config),
                description="Desired coordinate profiles under root config/ros.",
            ),
            DeclareLaunchArgument(
                "motion_config_file",
                default_value=str(default_motion_config),
                description="Motion safety limits under root config/ros.",
            ),
            OpaqueFunction(function=_launch_node),
        ]
    )
