cmake_minimum_required(VERSION 3.16)
project(realman_bt VERSION 0.1.0 LANGUAGES CXX)

find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(rclcpp_action REQUIRED)
find_package(realman_msgs REQUIRED)
find_package(std_msgs REQUIRED)
find_package(std_srvs REQUIRED)

set(BT_VENDOR_ROOT "${CMAKE_CURRENT_SOURCE_DIR}/../../../third_party/behavior_tree_cpp")
if(NOT TARGET bt::core)
  add_subdirectory("${BT_VENDOR_ROOT}/bt_core" "${CMAKE_CURRENT_BINARY_DIR}/bt_core")
endif()

add_library(control_mode_state_machine src/control_mode_state_machine.cpp)
target_include_directories(control_mode_state_machine PUBLIC
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
  $<INSTALL_INTERFACE:include>)
target_compile_features(control_mode_state_machine PUBLIC cxx_std_17)

add_library(runtime_snapshot src/runtime_snapshot.cpp)
target_include_directories(runtime_snapshot PUBLIC
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
  $<INSTALL_INTERFACE:include>
  "${BT_VENDOR_ROOT}")
target_compile_features(runtime_snapshot PUBLIC cxx_std_17)
target_link_libraries(runtime_snapshot PUBLIC bt::core)

install(TARGETS control_mode_state_machine runtime_snapshot
  EXPORT export_${PROJECT_NAME})
install(DIRECTORY include/ DESTINATION include)
add_executable(realman_bt_executor
  src/main.cpp
  src/realman_bt_executor_node.cpp
  src/move_j_node.cpp)
target_include_directories(realman_bt_executor PRIVATE
  "${CMAKE_CURRENT_SOURCE_DIR}/include"
  "${BT_VENDOR_ROOT}"
  "${BT_VENDOR_ROOT}/bt_nodes")
target_compile_features(realman_bt_executor PRIVATE cxx_std_17)
target_link_libraries(realman_bt_executor bt::core)
target_link_libraries(realman_bt_executor runtime_snapshot)
ament_target_dependencies(realman_bt_executor
  rclcpp rclcpp_action realman_msgs std_msgs std_srvs)
install(TARGETS realman_bt_executor DESTINATION lib/${PROJECT_NAME})
install(DIRECTORY launch DESTINATION share/${PROJECT_NAME} FILES_MATCHING PATTERN "*.py")
install(FILES
  "${CMAKE_CURRENT_SOURCE_DIR}/../../../config/behavior-trees/arm_move.xml"
  DESTINATION share/${PROJECT_NAME}/behavior-trees)

if(BUILD_TESTING)
  find_package(ament_cmake_pytest REQUIRED)
  add_executable(test_control_mode_state_machine test/test_control_mode_state_machine.cpp)
  target_link_libraries(test_control_mode_state_machine PRIVATE control_mode_state_machine)
  add_test(NAME test_control_mode_state_machine COMMAND test_control_mode_state_machine)

  add_executable(test_runtime_snapshot test/test_runtime_snapshot.cpp)
  target_include_directories(test_runtime_snapshot PRIVATE
    "${BT_VENDOR_ROOT}")
  target_link_libraries(test_runtime_snapshot PRIVATE runtime_snapshot)
  add_test(NAME test_runtime_snapshot COMMAND test_runtime_snapshot)

  ament_add_pytest_test(test_tree_contract test/test_tree_contract.py)
  ament_add_pytest_test(test_arm_move_tree test/test_arm_move_tree.py)
endif()

ament_export_targets(export_${PROJECT_NAME})
ament_package()
