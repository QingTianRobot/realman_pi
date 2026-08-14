安装教程：
https://github.com/realsenseai/librealsense/blob/master/doc/installation.md

https://blog.csdn.net/qq_45445740/article/details/143613024



启动教程：
cd realsense_ws

ros2 launch realsense2_camera rs_align_depth_launch.py \
depth_module.depth_profile:=1280x720x30 \
rgb_camera.color_profile:=1280x720x30 \
camera_namespace:=camera_rm \
camera_name:=camera_rm