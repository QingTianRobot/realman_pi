"""
统一启动 RealSense 和 Orbbec 相机。

用法:
    ros2 launch sensor_bringup cameras.launch.py

等价于同时执行:
    ros2 launch realsense2_camera rs_align_depth_launch.py \
        depth_module.depth_profile:=1280x720x30 \
        rgb_camera.color_profile:=1280x720x30 \
        camera_namespace:=camera_rm \
        camera_name:=camera_rm

    ros2 launch orbbec_camera multi_camera_synced.launch.py
"""

from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration, PathJoinSubstitution
from launch.actions import DeclareLaunchArgument
from launch_ros.substitutions import FindPackageShare


def generate_launch_description():
    # --------------- 可覆盖的 launch 参数 ---------------
    declare_camera_name = DeclareLaunchArgument(
        'camera_name', default_value='camera_rm',
        description='RealSense 相机名'
    )
    declare_camera_namespace = DeclareLaunchArgument(
        'camera_namespace', default_value='camera_rm',
        description='RealSense 相机命名空间'
    )
    declare_depth_profile = DeclareLaunchArgument(
        'depth_module.depth_profile', default_value='1280x720x30',
        description='RealSense 深度流分辨率@帧率'
    )
    declare_color_profile = DeclareLaunchArgument(
        'rgb_camera.color_profile', default_value='1280x720x30',
        description='RealSense 彩色流分辨率@帧率'
    )

    camera_name = LaunchConfiguration('camera_name')
    camera_namespace = LaunchConfiguration('camera_namespace')
    depth_profile = LaunchConfiguration('depth_module.depth_profile')
    color_profile = LaunchConfiguration('rgb_camera.color_profile')

    # --------------- RealSense 相机 ---------------
    realsense_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            PathJoinSubstitution([
                FindPackageShare('realsense2_camera'),
                'rs_align_depth_launch.py',
            ])
        ),
        launch_arguments={
            'camera_name': camera_name,
            'camera_namespace': camera_namespace,
            'depth_module.depth_profile': depth_profile,
            'rgb_camera.color_profile': color_profile,
        }.items(),
    )

    # --------------- Orbbec 相机 ---------------
    orbbec_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            PathJoinSubstitution([
                FindPackageShare('orbbec_camera'),
                'launch/multi_camera_synced.launch.py',
            ])
        ),
    )

    return LaunchDescription([
        declare_camera_name,
        declare_camera_namespace,
        declare_depth_profile,
        declare_color_profile,
        realsense_launch,
        orbbec_launch,
    ])
