#!/usr/bin/env python3
# ============================================================================
#  bt_ros2/launch/bt_executor.launch.py
#  示例 launch 文件 —— 启动一个 BtExecutorNode，并演示如何传参。
#
#  用法：
#    ros2 launch bt_ros2 bt_executor.launch.py
#    ros2 launch bt_ros2 bt_executor.launch.py tick_rate_hz:=5.0
#    ros2 launch bt_ros2 bt_executor.launch.py tree_file:=/abs/path/to/your_tree.xml
# ============================================================================
import os

from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


def generate_launch_description():
    # 本包安装后的 share 目录（install/bt_ros2/share/bt_ros2），示例树就装在这里。
    pkg_share = get_package_share_directory('bt_ros2')
    default_tree = os.path.join(pkg_share, 'trees', 'example.xml')

    # ---- 可在命令行覆盖的 launch 参数 ----
    tree_file_arg = DeclareLaunchArgument(
        'tree_file',
        default_value=default_tree,
        description='要加载的行为树 XML 文件绝对路径')

    tick_rate_arg = DeclareLaunchArgument(
        'tick_rate_hz',
        default_value='2.0',
        description='行为树 tick 频率（Hz）')

    status_topic_arg = DeclareLaunchArgument(
        'status_topic',
        default_value='~/bt_status',
        description='发布根节点状态的 topic 名')

    autostart_arg = DeclareLaunchArgument(
        'autostart',
        default_value='true',
        description='是否在节点构造后自动开始 tick')

    stop_on_terminal_arg = DeclareLaunchArgument(
        'stop_on_terminal',
        default_value='false',
        description='根节点 SUCCESS/FAILURE 后是否停止 tick；topic 驱动建议 false')

    # ---- 执行器节点 ----
    bt_executor_node = Node(
        package='bt_ros2',
        executable='bt_executor',
        name='bt_executor',
        output='screen',
        # 把 launch 参数透传为 ROS2 节点参数（与 declare_parameter 名字一一对应）。
        parameters=[{
            'tree_file': LaunchConfiguration('tree_file'),
            'tick_rate_hz': LaunchConfiguration('tick_rate_hz'),
            'status_topic': LaunchConfiguration('status_topic'),
            'autostart': LaunchConfiguration('autostart'),
            'stop_on_terminal': LaunchConfiguration('stop_on_terminal'),
        }],
    )

    return LaunchDescription([
        tree_file_arg,
        tick_rate_arg,
        status_topic_arg,
        autostart_arg,
        stop_on_terminal_arg,
        bt_executor_node,
    ])
