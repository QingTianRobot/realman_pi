cmake_minimum_required(VERSION 3.16)
project(realman_bt VERSION 0.1.0 LANGUAGES CXX)

find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(rclcpp_action REQUIRED)
find_package(rcl_interfaces REQUIRED)
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
  $<INSTALL_INTERFACE:include>)
target_compile_features(runtime_snapshot PUBLIC cxx_std_17)
target_link_libraries(runtime_snapshot PUBLIC bt::core)

add_library(move_j_nodes
  src/move_j_node.cpp
  src/three_arm_move_j_node.cpp)
target_include_directories(move_j_nodes PUBLIC
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
  $<INSTALL_INTERFACE:include>)
target_compile_features(move_j_nodes PUBLIC cxx_std_17)
target_link_libraries(move_j_nodes runtime_snapshot bt::core)
ament_target_dependencies(move_j_nodes
  rclcpp rclcpp_action realman_msgs)

install(TARGETS control_mode_state_machine runtime_snapshot
  EXPORT export_${PROJECT_NAME})
install(DIRECTORY include/ DESTINATION include)
add_executable(realman_bt_executor
  src/main.cpp
  src/realman_bt_executor_node.cpp)
target_include_directories(realman_bt_executor PRIVATE
  "${CMAKE_CURRENT_SOURCE_DIR}/include"
  "${BT_VENDOR_ROOT}"
  "${BT_VENDOR_ROOT}/bt_nodes")
target_compile_features(realman_bt_executor PRIVATE cxx_std_17)
target_link_libraries(realman_bt_executor bt::core)
target_link_libraries(realman_bt_executor runtime_snapshot)
target_link_libraries(realman_bt_executor move_j_nodes)
ament_target_dependencies(realman_bt_executor
  rclcpp rclcpp_action rcl_interfaces realman_msgs std_msgs std_srvs)
install(TARGETS realman_bt_executor DESTINATION lib/${PROJECT_NAME})
install(TARGETS move_j_nodes
  ARCHIVE DESTINATION lib
  LIBRARY DESTINATION lib
  RUNTIME DESTINATION bin)
install(DIRECTORY launch DESTINATION share/${PROJECT_NAME} FILES_MATCHING PATTERN "*.py")
install(FILES
  "${CMAKE_CURRENT_SOURCE_DIR}/../../../config/behavior-trees/arm_move.xml"
  "${CMAKE_CURRENT_SOURCE_DIR}/../../../config/behavior-trees/three_arm_staged_move.xml"
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

  add_executable(test_three_arm_move_j_node test/test_three_arm_move_j_node.cpp)
  target_link_libraries(test_three_arm_move_j_node move_j_nodes)
  ament_target_dependencies(test_three_arm_move_j_node rclcpp rclcpp_action realman_msgs)
  add_test(NAME test_three_arm_move_j_node COMMAND test_three_arm_move_j_node)

  ament_add_pytest_test(test_tree_contract test/test_tree_contract.py)
  ament_add_pytest_test(test_arm_move_tree test/test_arm_move_tree.py)
  ament_add_pytest_test(test_three_arm_move_tree test/test_three_arm_move_tree.py)
endif()

ament_export_targets(export_${PROJECT_NAME})
# runtime_snapshot links bt::core through its public interface.  bt_core is
# vendored into this package, but its CMake install rules also provide a
# standalone bt_coreConfig.cmake/bt::core target.  Record that package
# dependency so consumers of find_package(realman_bt) load bt::core before
# resolving the exported runtime_snapshot target.
ament_export_dependencies(bt_core)
ament_package()
