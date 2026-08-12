cmake_minimum_required(VERSION 3.8)
project(xbox_controller_driver)

if(CMAKE_CXX_COMPILER_ID MATCHES "GNU|Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(sensor_msgs REQUIRED)

add_library(button_state_tracker src/button_state_tracker.cpp)
target_compile_features(button_state_tracker PUBLIC cxx_std_17)
target_include_directories(button_state_tracker PUBLIC
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
  $<INSTALL_INTERFACE:include>
)

add_executable(xbox_controller_node src/xbox_controller_node.cpp)
target_compile_features(xbox_controller_node PUBLIC cxx_std_17)
target_link_libraries(xbox_controller_node button_state_tracker)
ament_target_dependencies(xbox_controller_node rclcpp sensor_msgs)

install(TARGETS button_state_tracker xbox_controller_node
  EXPORT export_${PROJECT_NAME}
  ARCHIVE DESTINATION lib
  LIBRARY DESTINATION lib
  RUNTIME DESTINATION lib/${PROJECT_NAME}
)
install(DIRECTORY include/ DESTINATION include)

if(BUILD_TESTING)
  find_package(ament_cmake_gtest REQUIRED)
  ament_add_gtest(button_state_tracker_test test/button_state_tracker_test.cpp)
  target_link_libraries(button_state_tracker_test button_state_tracker)
endif()

ament_export_include_directories(include)
ament_export_targets(export_${PROJECT_NAME} HAS_LIBRARY_TARGET)
ament_package()
