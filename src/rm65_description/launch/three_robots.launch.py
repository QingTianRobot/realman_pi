import math
from pathlib import Path

import yaml
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
ROBOT_IDS = ("l", "m", "r")
TRANSFORM_FIELDS = ("x", "y", "z", "roll", "pitch", "yaw")


def _parse_bool(value, argument_name):
    normalized = value.strip().lower()
    if normalized in ("true", "1", "yes", "on"):
        return True
    if normalized in ("false", "0", "no", "off"):
        return False
    raise RuntimeError(f"Launch argument '{argument_name}' must be true or false, got '{value}'")


def _read_layout(config_path):
    try:
        with config_path.open(encoding="utf-8") as config_file:
            layout = yaml.safe_load(config_file)
    except (OSError, yaml.YAMLError) as error:
        raise RuntimeError(f"Unable to read three-robot config '{config_path}': {error}") from error

    if not isinstance(layout, dict) or not isinstance(layout.get("robots"), dict):
        raise RuntimeError(f"Config '{config_path}' must contain a 'robots' mapping")

    robots = layout["robots"]
    missing = [robot_id for robot_id in ROBOT_IDS if robot_id not in robots]
    extra = [robot_id for robot_id in robots if robot_id not in ROBOT_IDS]
    if missing or extra:
        raise RuntimeError(
            f"Config '{config_path}' must define exactly {ROBOT_IDS}; missing={missing}, extra={extra}"
        )

    namespaces = set()
    frame_prefixes = set()
    for robot_id in ROBOT_IDS:
        robot = robots[robot_id]
        if not isinstance(robot, dict):
            raise RuntimeError(f"Robot '{robot_id}' configuration must be a mapping")

        model = robot.get("model")
        if model not in SUPPORTED_MODELS:
            supported = ", ".join(SUPPORTED_MODELS)
            raise RuntimeError(f"Robot '{robot_id}' model '{model}' is invalid. Choose one of: {supported}")

        namespace = robot.get("namespace")
        if namespace != robot_id:
            raise RuntimeError(
                f"Robot '{robot_id}' namespace must be '{robot_id}' so ROS resources stay predictable"
            )
        if namespace in namespaces:
            raise RuntimeError(f"Robot namespace '{namespace}' is duplicated")
        namespaces.add(namespace)

        frame_prefix = robot.get("frame_prefix")
        if frame_prefix != f"{robot_id}/":
            raise RuntimeError(f"Robot '{robot_id}' frame_prefix must be '{robot_id}/'")
        if frame_prefix in frame_prefixes:
            raise RuntimeError(f"TF frame prefix '{frame_prefix}' is duplicated")
        frame_prefixes.add(frame_prefix)

        parent_frame = robot.get("parent_frame")
        if not isinstance(parent_frame, str) or not parent_frame or parent_frame.startswith("/"):
            raise RuntimeError(f"Robot '{robot_id}' parent_frame must be a non-empty TF frame without '/' prefix")

        for field in TRANSFORM_FIELDS:
            value = robot.get(field)
            if not isinstance(value, (int, float)) or not math.isfinite(value):
                raise RuntimeError(f"Robot '{robot_id}' field '{field}' must be a finite number")

    settings = layout.get("settings", {})
    if not isinstance(settings, dict):
        raise RuntimeError(f"Config '{config_path}' 'settings' value must be a mapping")
    return robots, settings


def _launch_nodes(context):
    config_path = Path(LaunchConfiguration("config_file").perform(context)).expanduser()
    use_gui = _parse_bool(LaunchConfiguration("use_gui").perform(context), "use_gui")
    use_rviz = _parse_bool(LaunchConfiguration("use_rviz").perform(context), "use_rviz")
    use_driver_joint_states = _parse_bool(
        LaunchConfiguration("use_driver_joint_states").perform(context),
        "use_driver_joint_states",
    )
    robots, settings = _read_layout(config_path)

    package_share = Path(get_package_share_directory("rm65_description"))
    default_joint_position = settings.get("default_joint_position", 0.0)
    if not isinstance(default_joint_position, (int, float)) or not math.isfinite(default_joint_position):
        raise RuntimeError("settings.default_joint_position must be a finite number")

    actions = []
    for robot_id in ROBOT_IDS:
        robot = robots[robot_id]
        namespace = robot["namespace"]
        frame_prefix = robot["frame_prefix"]
        urdf_path = package_share / "urdf" / f"{robot['model']}.urdf"
        robot_description = urdf_path.read_text(encoding="utf-8")

        actions.extend(
            [
                Node(
                    package="robot_state_publisher",
                    executable="robot_state_publisher",
                    namespace=namespace,
                    name="robot_state_publisher",
                    output="screen",
                    parameters=[
                        {
                            "frame_prefix": frame_prefix,
                            "robot_description": robot_description,
                        }
                    ],
                ),
                *([] if use_driver_joint_states else [
                    Node(
                        package=("joint_state_publisher_gui" if use_gui else "joint_state_publisher"),
                        executable=("joint_state_publisher_gui" if use_gui else "joint_state_publisher"),
                        namespace=namespace,
                        name="joint_state_publisher",
                        output="screen",
                        parameters=[
                            {
                                "robot_description": robot_description,
                                "zeros.joint_1": float(default_joint_position),
                                "zeros.joint_2": float(default_joint_position),
                                "zeros.joint_3": float(default_joint_position),
                                "zeros.joint_4": float(default_joint_position),
                                "zeros.joint_5": float(default_joint_position),
                                "zeros.joint_6": float(default_joint_position),
                            }
                        ],
                    )
                ]),
                Node(
                    package="tf2_ros",
                    executable="static_transform_publisher",
                    namespace=namespace,
                    name="world_transform",
                    output="screen",
                    arguments=[
                        "--x",
                        str(robot["x"]),
                        "--y",
                        str(robot["y"]),
                        "--z",
                        str(robot["z"]),
                        "--roll",
                        str(robot["roll"]),
                        "--pitch",
                        str(robot["pitch"]),
                        "--yaw",
                        str(robot["yaw"]),
                        "--frame-id",
                        robot["parent_frame"],
                        "--child-frame-id",
                        f"{frame_prefix}world",
                    ],
                ),
            ]
        )

    if use_rviz:
        rviz_name = settings.get("rviz_config", "three_robots.rviz")
        if not isinstance(rviz_name, str) or Path(rviz_name).name != rviz_name:
            raise RuntimeError("settings.rviz_config must be a file name without directory components")
        rviz_config = package_share / "config" / "rviz" / rviz_name
        actions.append(
            Node(
                package="rviz2",
                executable="rviz2",
                name="rviz2",
                output="screen",
                arguments=["-d", str(rviz_config)],
            )
        )

    return actions


def generate_launch_description():
    package_share = Path(get_package_share_directory("rm65_description"))
    default_config = package_share / "config" / "ros" / "three_robots.yaml"
    return LaunchDescription(
        [
            DeclareLaunchArgument(
                "config_file",
                default_value=str(default_config),
                description="Absolute path to the annotated three-robot layout YAML file.",
            ),
            DeclareLaunchArgument(
                "use_gui",
                default_value="false",
                description="Start one joint_state_publisher_gui window per robot.",
            ),
            DeclareLaunchArgument(
                "use_rviz",
                default_value="true",
                description="Start RViz 2 with the three-robot display configuration.",
            ),
            DeclareLaunchArgument(
                "use_driver_joint_states",
                default_value="false",
                description=(
                    "Use /l|m|r/joint_states from realman_robot_driver instead of "
                    "starting joint_state_publisher."
                ),
            ),
            OpaqueFunction(function=_launch_nodes),
        ]
    )
