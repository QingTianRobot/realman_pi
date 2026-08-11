from pathlib import Path

from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, OpaqueFunction
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


SUPPORTED_MODELS = (
    "RM65-6F",
    "RM65-6FB",
    "RM65-B",
    "RM65-B-V",
    "RM65-6FB-V",
)


def _launch_nodes(context):
    model = LaunchConfiguration("model").perform(context)
    if model not in SUPPORTED_MODELS:
        supported = ", ".join(SUPPORTED_MODELS)
        raise RuntimeError(f"Unsupported RM65 model '{model}'. Choose one of: {supported}")

    package_share = Path(get_package_share_directory("rm65_description"))
    urdf_path = package_share / "urdf" / f"{model}.urdf"
    rviz_config = package_share / "rviz" / "rm65.rviz"
    robot_description = urdf_path.read_text(encoding="utf-8")

    return [
        Node(
            package="robot_state_publisher",
            executable="robot_state_publisher",
            name="robot_state_publisher",
            output="screen",
            parameters=[{"robot_description": robot_description}],
        ),
        Node(
            package="joint_state_publisher_gui",
            executable="joint_state_publisher_gui",
            name="joint_state_publisher_gui",
            output="screen",
        ),
        Node(
            package="rviz2",
            executable="rviz2",
            name="rviz2",
            output="screen",
            arguments=["-d", str(rviz_config)],
        ),
    ]


def generate_launch_description():
    return LaunchDescription(
        [
            DeclareLaunchArgument(
                "model",
                default_value="RM65-B",
                description="RM65 model: " + ", ".join(SUPPORTED_MODELS),
            ),
            OpaqueFunction(function=_launch_nodes),
        ]
    )
