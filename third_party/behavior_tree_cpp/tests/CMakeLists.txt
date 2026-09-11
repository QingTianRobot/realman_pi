# ============================================================================
#  tests —— 单元测试(GoogleTest)
#
#  GoogleTest 加载策略(零网络依赖):
#    1) 优先使用 third_party/googletest(已 vendor，无需联网，最稳)
#    2) 若 vendor 不存在则退化到 FetchContent 从 GitHub 拉取(需联网)
# ============================================================================

# Windows: 强制使用共享 CRT，避免链接冲突(GoogleTest 子构建需要)
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
# 不安装 GoogleTest 到本项目 install prefix
set(INSTALL_GTEST OFF CACHE BOOL "" FORCE)

set(VENDORED_GTEST "${CMAKE_SOURCE_DIR}/third_party/googletest")
if(EXISTS "${VENDORED_GTEST}/CMakeLists.txt")
  message(STATUS "[tests] 使用 vendored GoogleTest: ${VENDORED_GTEST}")
  add_subdirectory(${VENDORED_GTEST} ${CMAKE_BINARY_DIR}/_deps/googletest-build EXCLUDE_FROM_ALL)
else()
  message(STATUS "[tests] vendored GoogleTest 不存在，回退 FetchContent(需联网)")
  include(FetchContent)
  FetchContent_Declare(
    googletest
    GIT_REPOSITORY https://github.com/google/googletest.git
    GIT_TAG        v1.15.2
  )
  FetchContent_MakeAvailable(googletest)
endif()

# bt_core 单元测试
add_executable(test_bt_core test_bt_core.cpp)
target_link_libraries(test_bt_core
  PRIVATE
    bt::core
    GTest::gtest_main
)

# bt_core 进阶单元测试(异步 RUNNING / halt / 端口语义 / XML round-trip / 错误路径 / 类型转换)
add_executable(test_bt_advanced test_bt_advanced.cpp)
target_link_libraries(test_bt_advanced
  PRIVATE
    bt::core
    GTest::gtest_main
)

if(TARGET bt::nodes)
  # 数据层单元测试(data_freshness 纯逻辑 + header-only 数据节点 + 函数注册表)
  # data_freshness.hpp 与 bt_nodes/data/*.hpp 均为 header-only；FunctionRegistry
  # 的唯一共享实现由 bt::nodes 提供：
  #   - 只需 include bt_ros2/include(取 data_freshness) 与 bt_nodes(取 data/* 节点头);
  #     节点头内部用 "data/xxx.hpp" 相对包含，故 include base 指向 bt_nodes 目录。
  #   - 不需要 link bt_ros2 库(那个依赖 ROS2)。
  add_executable(test_data_nodes test_data_nodes.cpp)
  target_include_directories(test_data_nodes
    PRIVATE
      ${CMAKE_SOURCE_DIR}/bt_ros2/include
      ${CMAKE_SOURCE_DIR}/bt_nodes
  )
  target_link_libraries(test_data_nodes
    PRIVATE
      bt::core
      bt::nodes
      GTest::gtest_main
  )

  # bt_ros2 订阅/发布可复用基类的单元测试
  # 用 tests/mock_rclcpp 假冒 rclcpp 让基类模板能在零 ROS2 环境实例化运行。
  # 仅供测试,不进任何发布产物。
  add_executable(test_ros_bases
    test_ros_bases.cpp
    ${CMAKE_SOURCE_DIR}/bt_ros2/src/recharge_task.cpp
    ${CMAKE_SOURCE_DIR}/bt_ros2/src/node_registration.cpp
    ${CMAKE_SOURCE_DIR}/bt_ros2/src/ros_topic_action_node.cpp
    ${CMAKE_SOURCE_DIR}/bt_ros2/src/ros_topic_condition_node.cpp
  )
  target_include_directories(test_ros_bases
    PRIVATE
      ${CMAKE_CURRENT_SOURCE_DIR}/mock_rclcpp            # mock rclcpp 头(必须最优先)
      ${CMAKE_SOURCE_DIR}                                # node_registration.cpp includes bt_nodes/...
      ${CMAKE_SOURCE_DIR}/bt_ros2/include                # ros_subscriber/publisher_node.hpp
      ${CMAKE_SOURCE_DIR}/bt_nodes                       # header-only bt_nodes for recharge tree test
  )
  target_compile_definitions(test_ros_bases
    PRIVATE
      BT_SOURCE_DIR="${CMAKE_SOURCE_DIR}"
  )
  target_link_libraries(test_ros_bases
    PRIVATE
      bt::core
      bt::nodes
      GTest::gtest_main
  )
endif()

# XmlParser <SubTree ID="..."/> 引用支持单测
# 直接 include bt_nodes 节点头(header-only),无需外部插件
add_executable(test_subtree test_subtree.cpp)
target_include_directories(test_subtree
  PRIVATE
    ${CMAKE_SOURCE_DIR}/bt_nodes
)
target_link_libraries(test_subtree
  PRIVATE
    bt::core
    GTest::gtest_main
)

# 真实 DSO 边界回归：宿主注册函数，动态插件创建 FunctionAction 并调用。
if(TARGET bt::nodes)
  # 独立 MODULE DSO：生命周期测试不能重用 libbt_nodes，因为测试进程已直接
  # 链接它，dlclose 因此可能给出错误的安全结论。两个变体共用同一插件源文件。
  add_library(test_lifetime_plugin MODULE plugins/throwing_plugin.cpp)
  target_link_libraries(test_lifetime_plugin PRIVATE bt::core)

  add_library(test_throwing_plugin MODULE plugins/throwing_plugin.cpp)
  target_compile_definitions(test_throwing_plugin
    PRIVATE
      BT_TEST_THROW_AFTER_REGISTER=1
  )
  target_link_libraries(test_throwing_plugin PRIVATE bt::core)

  add_executable(test_plugin_runtime test_plugin_runtime.cpp)
  target_compile_definitions(test_plugin_runtime
    PRIVATE
      BT_NODES_PLUGIN_PATH="$<TARGET_FILE:bt_nodes>"
      BT_LIFETIME_PLUGIN_PATH="$<TARGET_FILE:test_lifetime_plugin>"
      BT_THROWING_PLUGIN_PATH="$<TARGET_FILE:test_throwing_plugin>"
  )
  target_link_libraries(test_plugin_runtime
    PRIVATE
      bt::core
      bt::nodes
      GTest::gtest_main
  )
  add_dependencies(test_plugin_runtime
    test_lifetime_plugin
    test_throwing_plugin
  )
endif()

include(GoogleTest)
gtest_discover_tests(test_bt_core)
gtest_discover_tests(test_bt_advanced)
gtest_discover_tests(test_subtree)
if(TARGET bt::nodes)
  gtest_discover_tests(test_data_nodes)
  gtest_discover_tests(test_ros_bases)
  gtest_discover_tests(test_plugin_runtime)
endif()
