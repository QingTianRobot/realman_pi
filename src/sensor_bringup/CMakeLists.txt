cmake_minimum_required(VERSION 3.10)
project(sensor_bringup)

find_package(ament_cmake REQUIRED)

install(
  DIRECTORY launch
  DESTINATION share/${PROJECT_NAME}
)

# Keep machine-readable sources under the repository-level config/ directory,
# while installing the selected files where ros2 launch can resolve them.
install(
  FILES
    ${CMAKE_CURRENT_SOURCE_DIR}/../../config/ros/cameras_ros2.yaml
  DESTINATION share/${PROJECT_NAME}/config
)

install(
  FILES
    ${CMAKE_CURRENT_SOURCE_DIR}/../../config/rviz/cameras.rviz
  DESTINATION share/${PROJECT_NAME}/config/rviz
)

ament_package()
