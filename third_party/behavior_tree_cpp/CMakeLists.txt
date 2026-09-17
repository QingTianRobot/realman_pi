# ============================================================================
#  BehaviorTree.CPP-X —— 顶层 CMake
#  说明：用 option 开关控制各可选模块编译，保证 bt_core 始终零 ROS 依赖。
# ============================================================================
cmake_minimum_required(VERSION 3.16)

project(behavior_tree_cpp_x
  VERSION 0.1.0
  DESCRIPTION "插件化、ROS 解耦的 C++ 行为树框架"
  LANGUAGES CXX)

# ---- 全局 C++ 标准 --------------------------------------------------------
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# 默认 Release；导出 compile_commands.json 供 IDE / clangd 使用
if(NOT CMAKE_BUILD_TYPE)
  set(CMAKE_BUILD_TYPE Release CACHE STRING "构建类型" FORCE)
endif()
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# 动态库与可执行文件统一输出目录，便于 PluginLoader 查找插件
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)

# ---- 编译可选项 -----------------------------------------------------------
option(BT_BUILD_NODES   "编译内置节点插件"          ON)
option(BT_BUILD_SERVER  "编译 HTTP/WS 服务(Web编辑器后端)" ON)
option(BT_BUILD_ROS2    "编译 ROS2 wrapper"          OFF)
option(BT_BUILD_TESTS   "编译单元测试"               ON)
option(BT_BUILD_EXAMPLES "编译示例程序"              ON)

message(STATUS "[BT-X] 配置：NODES=${BT_BUILD_NODES} SERVER=${BT_BUILD_SERVER} "
               "ROS2=${BT_BUILD_ROS2} TESTS=${BT_BUILD_TESTS} EXAMPLES=${BT_BUILD_EXAMPLES}")

# ---- 子模块 ---------------------------------------------------------------
# bt_core 是所有模块的基础，始终编译
add_subdirectory(bt_core)

if(BT_BUILD_NODES)
  add_subdirectory(bt_nodes)
endif()

if(BT_BUILD_SERVER)
  add_subdirectory(bt_server)
endif()

if(BT_BUILD_ROS2)
  add_subdirectory(bt_ros2)
endif()

if(BT_BUILD_EXAMPLES)
  add_subdirectory(examples)
endif()

if(BT_BUILD_TESTS)
  enable_testing()
  add_subdirectory(tests)
endif()
