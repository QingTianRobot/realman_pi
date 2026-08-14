cmake_minimum_required(VERSION 3.8)
project(realman_bringup)

find_package(ament_cmake REQUIRED)

install(DIRECTORY launch DESTINATION share/${PROJECT_NAME})

# Runtime configuration remains authoritative at the repository root. Installing
# it into bringup's share directory gives launch files stable local and Docker paths.
set(ROOT_CONFIG_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../config")
install(
  DIRECTORY "${ROOT_CONFIG_DIR}/ros"
  DESTINATION share/${PROJECT_NAME}/config
)

if(BUILD_TESTING)
  find_package(ament_cmake_pytest REQUIRED)
  ament_add_pytest_test(test_system_launch test/test_system_launch.py)
endif()

ament_package()
