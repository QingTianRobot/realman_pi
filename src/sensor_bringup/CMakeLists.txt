cmake_minimum_required(VERSION 3.10)
project(sensor_bringup)

find_package(ament_cmake REQUIRED)

install(
  DIRECTORY launch
  DESTINATION share/${PROJECT_NAME}
)

# Plain (non --symlink-install) builds find this under lib/; the launch file also
# looks next to its own source tree first, so a symlink-install needs no rebuild.
install(
  PROGRAMS scripts/apply_color_exposure.py
  DESTINATION lib/${PROJECT_NAME}
)

# Keep machine-readable sources under the repository-level config/ directory,
# while installing the selected files where ros2 launch can resolve them.
install(
  FILES
    ${CMAKE_CURRENT_SOURCE_DIR}/../../config/ros/cameras_ros2.yaml
  DESTINATION share/${PROJECT_NAME}/config
)

# Optional, gitignored site override. Installed only when present at build time.
# Under `colcon build --symlink-install` the launch also resolves this file from
# the source tree, so it can be created or edited without rebuilding.
install(
  FILES
    ${CMAKE_CURRENT_SOURCE_DIR}/../../config/ros/cameras_ros2.local.yaml
  DESTINATION share/${PROJECT_NAME}/config
  OPTIONAL
)

install(
  FILES
    ${CMAKE_CURRENT_SOURCE_DIR}/../../config/rviz/cameras.rviz
  DESTINATION share/${PROJECT_NAME}/config/rviz
)

if(BUILD_TESTING)
  find_package(ament_cmake_pytest REQUIRED)
  ament_add_pytest_test(test_apply_color_exposure test/test_apply_color_exposure.py)
  ament_add_pytest_test(test_cameras_ros2_launch test/test_cameras_ros2_launch.py)
  ament_add_pytest_test(test_check_cameras test/test_check_cameras.py)
endif()

ament_package()
