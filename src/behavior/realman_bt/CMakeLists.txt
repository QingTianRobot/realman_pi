cmake_minimum_required(VERSION 3.16)
project(realman_bt LANGUAGES CXX)

find_package(ament_cmake REQUIRED)

add_library(control_mode_state_machine src/control_mode_state_machine.cpp)
target_include_directories(control_mode_state_machine PUBLIC
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
  $<INSTALL_INTERFACE:include>)
target_compile_features(control_mode_state_machine PUBLIC cxx_std_17)

install(TARGETS control_mode_state_machine EXPORT export_${PROJECT_NAME})
install(DIRECTORY include/ DESTINATION include)

if(BUILD_TESTING)
  add_executable(test_control_mode_state_machine test/test_control_mode_state_machine.cpp)
  target_link_libraries(test_control_mode_state_machine PRIVATE control_mode_state_machine)
  add_test(NAME test_control_mode_state_machine COMMAND test_control_mode_state_machine)
endif()

ament_export_targets(export_${PROJECT_NAME})
ament_package()
