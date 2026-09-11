# ============================================================================
#  bt_nodes —— 内置标准节点插件（动态库）
#  说明：
#    把所有内置节点（控制/装饰/动作）编译成一个 SHARED 动态库 bt_nodes，
#    通过 BT_REGISTER_NODES 入口自注册。运行时由 NodeFactory::loadPlugin()
#    动态加载。FunctionRegistry 的共享实现也编译进该动态库。
# ============================================================================

get_filename_component(BT_REPO_ROOT "${CMAKE_CURRENT_SOURCE_DIR}/.." ABSOLUTE)

add_library(bt_nodes SHARED
  register_nodes.cpp
  function/function_registry.cpp
)
add_library(bt::nodes ALIAS bt_nodes)

# bt_nodes 公共 API 使用 bt_core 类型，下游需要继承该依赖。
target_link_libraries(bt_nodes PUBLIC bt::core)

# 头文件搜索路径：
#  - 当前目录：让 register_nodes.cpp 用 "control/xxx.hpp" 这样的相对路径 include。
#  - third_party：契约要求 include third_party（与核心库保持一致的依赖可见性）。
target_include_directories(bt_nodes
  PUBLIC
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/..>
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}>
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:include>
    $<INSTALL_INTERFACE:include/bt_nodes>
  PRIVATE
    ${BT_REPO_ROOT}/third_party
)

target_compile_features(bt_nodes PUBLIC cxx_std_17)
target_compile_definitions(bt_nodes PRIVATE BT_NODES_BUILDING_LIBRARY)

# 干净编译：开启常用告警。
target_compile_options(bt_nodes PRIVATE
  $<$<OR:$<CXX_COMPILER_ID:Clang>,$<CXX_COMPILER_ID:AppleClang>,$<CXX_COMPILER_ID:GNU>>:-Wall -Wextra>
)

# 插件入口符号 BT_RegisterNodes 用 visibility("default") 显式导出；
# 其余符号默认隐藏，避免与主程序/其它插件符号冲突。
set_target_properties(bt_nodes PROPERTIES
  EXPORT_NAME nodes
  CXX_VISIBILITY_PRESET hidden
  VISIBILITY_INLINES_HIDDEN ON
)

# ============================================================================
#  安装与导出 —— 让下游用 find_package(bt_nodes) + link bt::nodes
# ============================================================================
include(GNUInstallDirs)
include(CMakePackageConfigHelpers)

install(TARGETS bt_nodes
  EXPORT bt_nodesTargets
  ARCHIVE DESTINATION ${CMAKE_INSTALL_LIBDIR}
  LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
  RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
  INCLUDES DESTINATION
    ${CMAKE_INSTALL_INCLUDEDIR}
    ${CMAKE_INSTALL_INCLUDEDIR}/bt_nodes)

install(DIRECTORY
    action
    control
    data
    decorator
    diagnostic
    function
    timer
  DESTINATION ${CMAKE_INSTALL_INCLUDEDIR}/bt_nodes
  FILES_MATCHING PATTERN "*.hpp")

install(FILES include/bt_nodes/export.hpp
  DESTINATION ${CMAKE_INSTALL_INCLUDEDIR}/bt_nodes)

install(EXPORT bt_nodesTargets
  FILE bt_nodesTargets.cmake
  NAMESPACE bt::
  DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/bt_nodes)

configure_package_config_file(
  ${BT_REPO_ROOT}/cmake/bt_nodesConfig.cmake.in
  ${CMAKE_CURRENT_BINARY_DIR}/bt_nodesConfig.cmake
  INSTALL_DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/bt_nodes)

write_basic_package_version_file(
  ${CMAKE_CURRENT_BINARY_DIR}/bt_nodesConfigVersion.cmake
  VERSION ${PROJECT_VERSION}
  COMPATIBILITY SameMajorVersion)

install(FILES
  ${CMAKE_CURRENT_BINARY_DIR}/bt_nodesConfig.cmake
  ${CMAKE_CURRENT_BINARY_DIR}/bt_nodesConfigVersion.cmake
  DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/bt_nodes)

message(STATUS "[BT-X] bt_nodes 内置节点插件已配置(含 install/export)")
