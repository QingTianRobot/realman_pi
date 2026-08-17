cmake_minimum_required(VERSION 3.10)
project(realman_msgs)

find_package(ament_cmake REQUIRED)
find_package(rosidl_default_generators REQUIRED)

rosidl_generate_interfaces(${PROJECT_NAME}
  "action/CartesianVelocity.action"
  "action/ExecuteMotion.action"
  "srv/SelectFrame.srv"
  "srv/VerifyCoordinates.srv"
)

install(DIRECTORY action srv
  DESTINATION share/${PROJECT_NAME}
)

install(FILES resource/${PROJECT_NAME}
  DESTINATION share/ament_index/resource_index/packages
)

ament_export_dependencies(rosidl_default_runtime)

ament_package()
