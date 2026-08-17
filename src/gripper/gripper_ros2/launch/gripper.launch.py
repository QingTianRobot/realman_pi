"""
Launch file for the gripper ROS 2 nodes.

Supports launching one or both grippers (left + right) as separate nodes,
each on its own serial port. Parameters are loaded from config/gripper_params.yaml
and can be overridden via command-line arguments.

Usage:
    # Both grippers (left + right):
    ros2 launch gripper_ros2 gripper.launch.py

    # Right gripper only:
    ros2 launch gripper_ros2 gripper.launch.py side:=right

    # Left gripper only:
    ros2 launch gripper_ros2 gripper.launch.py side:=left

    # Custom ports:
    ros2 launch gripper_ros2 gripper.launch.py right_port:=/dev/ttyCH341USB1 left_port:=/dev/ttyCH341USB0
"""

import os
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.conditions import IfCondition
from launch.substitutions import LaunchConfiguration, PythonExpression
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory


def generate_launch_description():
    pkg_dir = get_package_share_directory('gripper_ros2')
    default_config = os.path.join(pkg_dir, 'config', 'gripper_params.yaml')

    # --------------- Launch arguments ---------------
    config_file = LaunchConfiguration('config_file')
    side = LaunchConfiguration('side')
    right_port = LaunchConfiguration('right_port')
    left_port = LaunchConfiguration('left_port')
    right_open = LaunchConfiguration('right_open')
    right_close = LaunchConfiguration('right_close')
    left_open = LaunchConfiguration('left_open')
    left_close = LaunchConfiguration('left_close')

    declare_config = DeclareLaunchArgument(
        'config_file', default_value=default_config,
        description='Path to the YAML parameters file'
    )
    declare_side = DeclareLaunchArgument(
        'side', default_value='both',
        choices=['left', 'right', 'both'],
        description='Which gripper side(s) to launch'
    )
    declare_right_port = DeclareLaunchArgument(
        'right_port', default_value='/dev/ttyUSB0',
        description='Serial port for the right gripper'
    )
    declare_left_port = DeclareLaunchArgument(
        'left_port', default_value='/dev/ttyUSB1',
        description='Serial port for the left gripper'
    )
    declare_right_open = DeclareLaunchArgument(
        'right_open', default_value='4000',
        description='Open position for right gripper'
    )
    declare_right_close = DeclareLaunchArgument(
        'right_close', default_value='12000',
        description='Close position for right gripper'
    )
    declare_left_open = DeclareLaunchArgument(
        'left_open', default_value='400',
        description='Open position for left gripper'
    )
    declare_left_close = DeclareLaunchArgument(
        'left_close', default_value='949',
        description='Close position for left gripper'
    )

    # --------------- Right gripper node ---------------
    # Launch when side is 'right' or 'both'
    right_condition = IfCondition(
        PythonExpression(['"', side, '" in ("right", "both")'])
    )
    right_node = Node(
        package='gripper_ros2',
        executable='gripper_node',
        name='gripper_right',
        namespace='',
        parameters=[config_file, {
            'port': right_port,
            'open_pos': right_open,
            'close_pos': right_close,
        }],
        output='screen',
        condition=right_condition,
    )

    # --------------- Left gripper node ---------------
    # Launch when side is 'left' or 'both'
    left_condition = IfCondition(
        PythonExpression(['"', side, '" in ("left", "both")'])
    )
    left_node = Node(
        package='gripper_ros2',
        executable='gripper_node',
        name='gripper_left',
        namespace='',
        parameters=[config_file, {
            'port': left_port,
            'open_pos': left_open,
            'close_pos': left_close,
        }],
        output='screen',
        condition=left_condition,
    )

    return LaunchDescription([
        declare_config,
        declare_side,
        declare_right_port,
        declare_left_port,
        declare_right_open,
        declare_right_close,
        declare_left_open,
        declare_left_close,
        right_node,
        left_node,
    ])
