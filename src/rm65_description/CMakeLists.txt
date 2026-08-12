cmake_minimum_required(VERSION 3.10)
project(rm65_description)

find_package(ament_cmake REQUIRED)

install(
  DIRECTORY launch meshes urdf
  DESTINATION share/${PROJECT_NAME}
)

# Configuration sources are centralized at the repository root. Install them
# into the package share directory so launch files resolve stable paths after
# both local colcon builds and Docker image builds.
set(ROOT_CONFIG_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../config")
install(
  DIRECTORY "${ROOT_CONFIG_DIR}/ros" "${ROOT_CONFIG_DIR}/rviz"
  DESTINATION share/${PROJECT_NAME}/config
)

ament_package()
