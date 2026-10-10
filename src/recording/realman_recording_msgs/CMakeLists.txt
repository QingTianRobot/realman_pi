# Recording control/status interfaces are intentionally independent of the RealMan SDK.
cmake_minimum_required(VERSION 3.10)
project(realman_recording_msgs)

find_package(ament_cmake REQUIRED)
find_package(builtin_interfaces REQUIRED)
find_package(rosidl_default_generators REQUIRED)
find_package(std_msgs REQUIRED)

rosidl_generate_interfaces(${PROJECT_NAME}
  "msg/RecordingStatus.msg"
  "srv/ManageRecording.srv"
  DEPENDENCIES builtin_interfaces std_msgs
)

install(DIRECTORY msg srv
  DESTINATION share/${PROJECT_NAME}
)

install(FILES resource/${PROJECT_NAME}
  DESTINATION share/ament_index/resource_index/packages
)

ament_export_dependencies(rosidl_default_runtime)
ament_package()
