cmake_minimum_required(VERSION 3.16)

project(bt_install_consumer LANGUAGES CXX)

find_package(bt_core CONFIG REQUIRED)
find_package(bt_nodes CONFIG REQUIRED)

add_executable(bt_install_consumer main.cpp)
target_compile_features(bt_install_consumer PRIVATE cxx_std_17)
target_link_libraries(bt_install_consumer PRIVATE bt::core bt::nodes)

file(GENERATE
  OUTPUT "${CMAKE_CURRENT_BINARY_DIR}/install_consumer_paths-$<CONFIG>.txt"
  CONTENT "executable=$<TARGET_FILE:bt_install_consumer>\nplugin=$<TARGET_FILE:bt::nodes>\nruntime_dir=$<TARGET_FILE_DIR:bt::core>\nruntime_dir=$<TARGET_FILE_DIR:bt::nodes>\n")
