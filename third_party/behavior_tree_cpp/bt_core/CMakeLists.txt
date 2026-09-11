# ============================================================================
#  bt_core —— 核心库(零 ROS 依赖)
#  说明：核心以模板头文件为主，但保留一个 .cpp 编译单元，产出静态/动态库目标
#        bt_core，供其它模块 link。后续 PluginLoader / XmlParser 的实现文件加这里。
# ============================================================================

get_filename_component(BT_REPO_ROOT "${CMAKE_CURRENT_SOURCE_DIR}/.." ABSOLUTE)

# 核心库源文件(非模板实现)
set(BT_CORE_SOURCES
  src/node_factory.cpp
  src/plugin_loader.cpp
  src/xml_parser.cpp
  ${BT_REPO_ROOT}/third_party/tinyxml2.cpp
)

add_library(bt_core ${BT_CORE_SOURCES})
add_library(bt::core ALIAS bt_core)   # build 树内别名，下游用 bt::core

# 导出名设为 core，使 install(EXPORT NAMESPACE bt::) 生成的目标也是 bt::core
# （否则会变成 bt::bt_core，与 build 树别名不一致）。库文件名仍是 libbt_core。
set_target_properties(bt_core PROPERTIES EXPORT_NAME core)

# 头文件搜索路径：对外暴露 include/ 目录
target_include_directories(bt_core
  PUBLIC
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:include>
  PRIVATE
    ${BT_REPO_ROOT}/third_party    # tinyxml2.h(实现细节，不对外暴露)
)

target_compile_features(bt_core PUBLIC cxx_std_17)

# 开启常用告警，核心库要求干净编译
target_compile_options(bt_core PRIVATE
  $<$<OR:$<CXX_COMPILER_ID:Clang>,$<CXX_COMPILER_ID:AppleClang>,$<CXX_COMPILER_ID:GNU>>:-Wall -Wextra>
)

# POSIX 平台需要 libdl(供后续 PluginLoader 的 dlopen 使用)
if(UNIX)
  target_link_libraries(bt_core PUBLIC ${CMAKE_DL_LIBS})
endif()

# ============================================================================
#  安装与导出 —— 让下游用 find_package(bt_core) + link bt::core
#  说明：这是"cmake build 注册"的核心。安装后:
#    - 头文件装到 <prefix>/include/bt_core
#    - 库装到 <prefix>/lib
#    - 生成 bt_coreConfig.cmake / bt_coreTargets.cmake 供 find_package 发现
#  bt_ros2 等独立包即可 find_package(bt_core REQUIRED) 而非 add_subdirectory。
# ============================================================================
include(GNUInstallDirs)
include(CMakePackageConfigHelpers)

# 安装库目标，并归入导出集 bt_coreTargets
install(TARGETS bt_core
  EXPORT bt_coreTargets
  ARCHIVE DESTINATION ${CMAKE_INSTALL_LIBDIR}
  LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
  RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
  INCLUDES DESTINATION ${CMAKE_INSTALL_INCLUDEDIR})

# 安装公共头文件目录(bt_core/include/bt_core -> <prefix>/include/bt_core)
install(DIRECTORY include/bt_core
  DESTINATION ${CMAKE_INSTALL_INCLUDEDIR}
  FILES_MATCHING PATTERN "*.hpp")

# 导出目标集，带 bt:: 命名空间(与 build 树里的 ALIAS 一致)
install(EXPORT bt_coreTargets
  FILE bt_coreTargets.cmake
  NAMESPACE bt::
  DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/bt_core)

# 由模板生成 Config 文件
configure_package_config_file(
  ${BT_REPO_ROOT}/cmake/bt_coreConfig.cmake.in
  ${CMAKE_CURRENT_BINARY_DIR}/bt_coreConfig.cmake
  INSTALL_DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/bt_core)

# 生成版本文件(与顶层 project 版本一致，兼容同大版本)
write_basic_package_version_file(
  ${CMAKE_CURRENT_BINARY_DIR}/bt_coreConfigVersion.cmake
  VERSION ${PROJECT_VERSION}
  COMPATIBILITY SameMajorVersion)

install(FILES
  ${CMAKE_CURRENT_BINARY_DIR}/bt_coreConfig.cmake
  ${CMAKE_CURRENT_BINARY_DIR}/bt_coreConfigVersion.cmake
  DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/bt_core)

message(STATUS "[BT-X] bt_core 已配置(含 install/export，支持 find_package)")
