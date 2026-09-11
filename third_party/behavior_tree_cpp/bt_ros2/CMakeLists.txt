# ============================================================================
#  bt_ros2/CMakeLists.txt
#  ROS2(ament_cmake) wrapper 包的构建脚本。
#
#  集成 bt_core 的两种方式（二选一，下方都有支持）：
#    【方式 A：作为独立 ROS2 包构建（推荐用于真实 ROS2 工作区）】
#       把整个仓库（含 bt_core）放进 colcon 工作区的 src/，先安装/导出 bt_core，
#       本文件用 find_package(bt_core) 找到 bt::core target。
#       要求 bt_core 提供 bt_coreConfig.cmake（见文末“关于 find_package”说明）。
#
#    【方式 B：作为主仓库子目录构建（顶层 CMake 的 BT_BUILD_ROS2=ON）】
#       顶层 CMakeLists 已 add_subdirectory(bt_core)，bt::core target 已存在，
#       本文件直接复用，无需 find_package。
#
#  本脚本通过判断 “bt::core target 是否已存在” 自动选择 A 或 B，对两种集成都适用。
# ============================================================================
cmake_minimum_required(VERSION 3.16)
project(bt_ros2 VERSION 0.1.0 LANGUAGES CXX)

# ---- C++ 标准（与 bt_core 一致，C++17）-----------------------------------
if(NOT CMAKE_CXX_STANDARD)
  set(CMAKE_CXX_STANDARD 17)
  set(CMAKE_CXX_STANDARD_REQUIRED ON)
  set(CMAKE_CXX_EXTENSIONS OFF)
endif()

# ---- ROS2 / ament 依赖 ----------------------------------------------------
find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(rclcpp_action REQUIRED)
find_package(std_msgs REQUIRED)
find_package(sensor_msgs REQUIRED)
find_package(std_srvs REQUIRED)

# ---- 解析 bt::core target（方式 A / B 自适应）-----------------------------
if(NOT TARGET bt::core)
  # 方式 A：本包独立构建，需要从已安装/导出的 bt_core 找到 target。
  #   情形 1：bt_core 安装时提供了 bt_coreConfig.cmake → find_package 可直接拿到 bt::core。
  find_package(bt_core QUIET)

  if(NOT TARGET bt::core)
    # 情形 2：未找到 config，退而把 bt_core 当作源码子目录纳入（需要能访问其源码）。
    #   BT_CORE_DIR 可由 -DBT_CORE_DIR=<path/to/bt_core> 指定；默认尝试同级目录。
    set(BT_CORE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../bt_core"
        CACHE PATH "bt_core 源码目录（当未通过 find_package 提供时使用）")
    if(EXISTS "${BT_CORE_DIR}/CMakeLists.txt")
      message(STATUS "[bt_ros2] 未找到 bt_coreConfig，改用源码子目录: ${BT_CORE_DIR}")
      add_subdirectory("${BT_CORE_DIR}" "${CMAKE_CURRENT_BINARY_DIR}/bt_core_build")
    else()
      message(FATAL_ERROR
        "[bt_ros2] 找不到 bt::core target。请二选一：\n"
        "  1) 先构建并安装 bt_core，使其提供 bt_coreConfig.cmake，再 find_package(bt_core)；\n"
        "  2) 传入 -DBT_CORE_DIR=<bt_core 源码目录> 以源码子目录方式集成。")
    endif()
  else()
    message(STATUS "[bt_ros2] 通过 find_package(bt_core) 找到 bt::core target。")
  endif()
else()
  message(STATUS "[bt_ros2] 复用上层已定义的 bt::core target（方式 B：主仓库子目录构建）。")
endif()

# ---- 解析 bt::nodes target（已安装包 / 源码子目录自适应）-------------------
if(NOT TARGET bt::nodes)
  find_package(bt_nodes QUIET)

  if(NOT TARGET bt::nodes)
    set(BT_NODES_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../bt_nodes"
        CACHE PATH "bt_nodes 源码目录（当未通过 find_package 提供时使用）")
    if(EXISTS "${BT_NODES_DIR}/CMakeLists.txt")
      message(STATUS "[bt_ros2] 未找到 bt_nodesConfig，改用源码子目录: ${BT_NODES_DIR}")
      add_subdirectory("${BT_NODES_DIR}" "${CMAKE_CURRENT_BINARY_DIR}/bt_nodes_build")
    else()
      message(FATAL_ERROR
        "[bt_ros2] 找不到 bt::nodes target。请二选一：\n"
        "  1) 安装 bt_nodes，使其提供 bt_nodesConfig.cmake；\n"
        "  2) 传入 -DBT_NODES_DIR=<bt_nodes 源码目录> 以源码子目录方式集成。")
    endif()
  else()
    message(STATUS "[bt_ros2] 通过 find_package(bt_nodes) 找到 bt::nodes target。")
  endif()
else()
  message(STATUS "[bt_ros2] 复用上层已定义的 bt::nodes target。")
endif()

# ---- 库：把适配器节点 + 执行器节点编译成一个库，供可执行文件与下游复用 ----
add_library(bt_ros2_lib
  src/bt_executor_node.cpp
  src/node_registration.cpp
  src/recharge_task.cpp
  src/ros_topic_condition_node.cpp
  src/ros_topic_action_node.cpp
)

# 头文件搜索路径：
#   - 本包 include/
#   - bt_nodes/（header-only 的控制/装饰节点；executor 注册时要用）
target_include_directories(bt_ros2_lib
  PUBLIC
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:include>
    # bt_nodes 是仓库内 header-only 目录，位于本包上一级。
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/..>
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/../bt_nodes>
)

target_compile_features(bt_ros2_lib PUBLIC cxx_std_17)

# 链接 bt::core 与共享 FunctionRegistry 所在的 bt::nodes；rclcpp 等用 ament 方式注入。
target_link_libraries(bt_ros2_lib PUBLIC bt::core bt::nodes)
ament_target_dependencies(
  bt_ros2_lib PUBLIC
  rclcpp rclcpp_action std_msgs sensor_msgs std_srvs)

# ---- 可执行：bt_executor 入口 --------------------------------------------
add_executable(bt_executor src/main.cpp)
target_link_libraries(bt_executor PRIVATE bt_ros2_lib)

# ---- 安装规则（ament 约定）-----------------------------------------------
# 可执行 → lib/<pkg>/，供 ros2 run / launch 找到。
install(TARGETS bt_executor
  DESTINATION lib/${PROJECT_NAME})

# 库 + 导出信息（供其它 ROS2 包依赖本包的适配器节点）。
install(TARGETS bt_ros2_lib
  EXPORT export_${PROJECT_NAME}
  ARCHIVE DESTINATION lib
  LIBRARY DESTINATION lib
  RUNTIME DESTINATION bin)

# 头文件。
install(DIRECTORY include/
  DESTINATION include)

# launch 文件与示例树（供 ros2 launch / 运行时按 share 路径查找）。
install(DIRECTORY launch
  DESTINATION share/${PROJECT_NAME})
install(DIRECTORY trees
  DESTINATION share/${PROJECT_NAME})

# ---- 测试（可选）---------------------------------------------------------
if(BUILD_TESTING)
  find_package(ament_lint_auto REQUIRED)

  # ament_lint_common 的 ROS 通用默认项并不完全等于本仓库策略，仅排除：
  # - copyright：项目尚未提供可据实写入的法定版权主体；
  # - cpplint/uncrustify：其头文件与排版规则和 bt_core / bt_nodes 的统一规范冲突。
  # 排除范围只作用于 bt_ros2；cppcheck、flake8、lint_cmake、pep257、xmllint
  # 仍由 ament_lint_auto 注册，不能把未执行的三项表述为通过。
  list(APPEND AMENT_LINT_AUTO_EXCLUDE
    ament_cmake_copyright
    ament_cmake_cpplint
    ament_cmake_uncrustify)
  ament_lint_auto_find_test_dependencies()
endif()

# ---- 导出给下游 ament 包 --------------------------------------------------
ament_export_include_directories(include)
ament_export_libraries(bt_ros2_lib)
ament_export_dependencies(
  rclcpp rclcpp_action std_msgs sensor_msgs std_srvs)

ament_package()

# ============================================================================
#  关于 find_package(bt_core)（方式 A）：
#    bt_core 现已提供完整的 install/export：install(TARGETS bt_core EXPORT
#    bt_coreTargets) + install(EXPORT ... NAMESPACE bt::) + 生成 bt_coreConfig.cmake
#    与版本文件（EXPORT_NAME 设为 core，故导出目标即 bt::core）。
#    因此先构建并安装 bt_core（cmake --install <build> --prefix <p>），再给本包传
#    -DCMAKE_PREFIX_PATH=<p>，即可走方式 A：find_package(bt_core) 直接拿到 bt::core。
#    已验证：独立下游项目 find_package(bt_core)+link bt::core 编译运行通过。
#    方式 B（顶层 BT_BUILD_ROS2=ON）或 -DBT_CORE_DIR=<源码目录> 仍作为备选。
# ============================================================================
