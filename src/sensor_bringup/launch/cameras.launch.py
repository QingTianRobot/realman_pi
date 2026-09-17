"""
[DEPRECATED] 旧的 RealSense + Orbbec 统一出图 launch，已被 cameras_ros2.launch.py 取代。

相机出图的生产主线是 ROS2 节点：三路 Orbbec + 全局 RealSense D435 都由
``cameras_ros2.launch.py`` 发布（入口 ``rm65_camera_ros2`` 或 ``start_sensors.sh``）。
本文件的出图节点历史上已被注释，且使用 Orbbec ``multi_camera_synced.launch.py``，
不再维护，仅作历史参考保留。请勿在新部署中使用。

历史备注：曾一度改为 ``src/camera_stream`` 的局域网 RTSP 推流方案，该方案现同样弃用；
两条旧路径都已让位给 ``cameras_ros2.launch.py`` 的 ROS2 节点出图。
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
        # 出图节点已迁移到 src/camera_stream 局域网推流，默认关闭以释放 USB 设备。
        # realsense_launch,
        # orbbec_launch,
    ])
