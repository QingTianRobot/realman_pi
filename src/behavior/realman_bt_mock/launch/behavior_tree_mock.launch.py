from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(package='realman_bt_mock', executable='mock_control_mode_source', name='mock_control_mode_source', namespace='realman/mock', output='screen'),
        Node(package='realman_bt_mock', executable='mock_control_backend', name='mock_control_backend', namespace='realman/mock', output='screen'),
        Node(package='realman_bt_mock', executable='motion_command_recorder', name='motion_command_recorder', namespace='realman/mock', output='screen'),
    ])
