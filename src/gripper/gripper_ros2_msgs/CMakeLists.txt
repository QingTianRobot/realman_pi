cmake_minimum_required(VERSION 3.10)
project(gripper_ros2_msgs)

find_package(rosidl_default_generators REQUIRED)

rosidl_generate_interfaces(${PROJECT_NAME}
  "msg/GripperLimits.msg"
  "srv/GripperPercentage.srv"
  "srv/MoveGripperRaw.srv"
  "srv/SetGripperLimits.srv"
)

ament_export_dependencies(rosidl_default_runtime)

ament_package()
