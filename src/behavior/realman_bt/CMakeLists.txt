cmake_minimum_required(VERSION 3.16)
project(realman_bt VERSION 0.1.0 LANGUAGES CXX)

find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(rclcpp_action REQUIRED)
find_package(rcl_interfaces REQUIRED)
find_package(realman_msgs REQUIRED)
find_package(std_msgs REQUIRED)
find_package(std_srvs REQUIRED)
find_package(geometry_msgs REQUIRED)

set(BT_VENDOR_ROOT "${CMAKE_CURRENT_SOURCE_DIR}/../../../third_party/behavior_tree_cpp")
if(NOT TARGET bt::core)
  add_subdirectory("${BT_VENDOR_ROOT}/bt_core" "${CMAKE_CURRENT_BINARY_DIR}/bt_core")
endif()

add_library(input_mode src/input_mode.cpp)
target_include_directories(input_mode PUBLIC
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
  $<INSTALL_INTERFACE:include>)
target_compile_features(input_mode PUBLIC cxx_std_17)

add_library(runtime_snapshot src/runtime_snapshot.cpp)
target_include_directories(runtime_snapshot PUBLIC
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
  $<INSTALL_INTERFACE:include>)
target_compile_features(runtime_snapshot PUBLIC cxx_std_17)
target_link_libraries(runtime_snapshot PUBLIC bt::core)

add_library(input_mode_nodes src/input_mode_nodes.cpp)
target_include_directories(input_mode_nodes PUBLIC
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
  $<INSTALL_INTERFACE:include>)
target_compile_features(input_mode_nodes PUBLIC cxx_std_17)
target_link_libraries(input_mode_nodes PUBLIC
  input_mode runtime_snapshot bt::core)

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

install(TARGETS input_mode runtime_snapshot input_mode_nodes
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
target_link_libraries(realman_bt_executor input_mode_nodes)
ament_target_dependencies(realman_bt_executor
  rclcpp rclcpp_action rcl_interfaces realman_msgs std_msgs std_srvs)
install(TARGETS realman_bt_executor DESTINATION lib/${PROJECT_NAME})
install(PROGRAMS scripts/pika_control_router.py
  DESTINATION lib/${PROJECT_NAME}
  RENAME pika_control_router)
install(TARGETS move_j_nodes
  ARCHIVE DESTINATION lib
  LIBRARY DESTINATION lib
  RUNTIME DESTINATION bin)
install(DIRECTORY launch DESTINATION share/${PROJECT_NAME} FILES_MATCHING PATTERN "*.py")
install(FILES
  "${CMAKE_CURRENT_SOURCE_DIR}/../../../config/behavior-trees/arm_move.xml"
  "${CMAKE_CURRENT_SOURCE_DIR}/../../../config/behavior-trees/control_router.xml"
  "${CMAKE_CURRENT_SOURCE_DIR}/../../../config/behavior-trees/three_arm_staged_move.xml"
  DESTINATION share/${PROJECT_NAME}/behavior-trees)

if(BUILD_TESTING)
  find_package(ament_cmake_pytest REQUIRED)
  add_executable(test_input_mode_executor
    test/test_input_mode_executor.cpp
    src/realman_bt_executor_node.cpp)
  target_include_directories(test_input_mode_executor PRIVATE
    "${BT_VENDOR_ROOT}" "${BT_VENDOR_ROOT}/bt_nodes")
  target_compile_features(test_input_mode_executor PRIVATE cxx_std_17)
  target_compile_definitions(test_input_mode_executor PRIVATE
    BT_TEST_CONFIG_DIR="${CMAKE_CURRENT_SOURCE_DIR}/../../../config/behavior-trees")
  target_link_libraries(test_input_mode_executor move_j_nodes input_mode_nodes)
  ament_target_dependencies(test_input_mode_executor
    rclcpp rclcpp_action rcl_interfaces realman_msgs std_msgs std_srvs)
  add_test(NAME test_input_mode_executor COMMAND test_input_mode_executor)
  set_tests_properties(test_input_mode_executor PROPERTIES
    TIMEOUT 45
    ENVIRONMENT "ROS_DOMAIN_ID=217")

  add_executable(test_input_mode test/test_input_mode.cpp)
  target_link_libraries(test_input_mode PRIVATE input_mode)
  add_test(NAME test_input_mode COMMAND test_input_mode)

  add_executable(test_input_mode_nodes test/test_input_mode_nodes.cpp)
  target_include_directories(test_input_mode_nodes PRIVATE
    "${BT_VENDOR_ROOT}"
    "${BT_VENDOR_ROOT}/bt_nodes")
  target_compile_features(test_input_mode_nodes PRIVATE cxx_std_17)
  target_link_libraries(test_input_mode_nodes PRIVATE input_mode_nodes)
  add_test(NAME test_input_mode_nodes COMMAND test_input_mode_nodes)

  add_executable(test_runtime_snapshot test/test_runtime_snapshot.cpp)
  target_include_directories(test_runtime_snapshot PRIVATE
    "${BT_VENDOR_ROOT}")
  target_link_libraries(test_runtime_snapshot PRIVATE runtime_snapshot)
  add_test(NAME test_runtime_snapshot COMMAND test_runtime_snapshot)

  add_executable(test_three_arm_move_j_node test/test_three_arm_move_j_node.cpp)
  target_link_libraries(test_three_arm_move_j_node move_j_nodes)
  ament_target_dependencies(test_three_arm_move_j_node rclcpp rclcpp_action realman_msgs)
  add_test(NAME test_three_arm_move_j_node COMMAND test_three_arm_move_j_node)

  add_executable(test_terminal_exit_policy test/test_terminal_exit_policy.cpp)
  target_include_directories(test_terminal_exit_policy PRIVATE
    "${CMAKE_CURRENT_SOURCE_DIR}/include")
  target_compile_features(test_terminal_exit_policy PRIVATE cxx_std_17)
  add_test(NAME test_terminal_exit_policy COMMAND test_terminal_exit_policy)

  add_executable(test_reactive_control_nodes test/test_reactive_control_nodes.cpp)
  target_include_directories(test_reactive_control_nodes PRIVATE
    "${BT_VENDOR_ROOT}"
    "${BT_VENDOR_ROOT}/bt_nodes")
  target_compile_features(test_reactive_control_nodes PRIVATE cxx_std_17)
  target_link_libraries(test_reactive_control_nodes PRIVATE bt::core)
  add_test(NAME test_reactive_control_nodes COMMAND test_reactive_control_nodes)

  ament_add_pytest_test(test_tree_contract test/test_tree_contract.py)
  ament_add_pytest_test(test_control_router_tree test/test_control_router_tree.py)
  ament_add_pytest_test(test_pika_control_router test/test_pika_control_router.py)
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
