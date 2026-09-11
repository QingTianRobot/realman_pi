# ============================================================================
#  bt_server —— 基于 cpp-httplib 的行为树 HTTP 服务(Web 编辑器后端)
#  说明:
#    - 可执行目标 bt_server,link bt::core(核心库)。
#    - cpp-httplib 是 header-only,头文件在顶层 third_party/httplib.h,
#      因此把 third_party 加入 include 目录即可,无需额外编译单元。
#    - cpp-httplib 在 POSIX 平台依赖线程库;用 Threads::Threads 链接 pthread。
#  仅当顶层 BT_BUILD_SERVER=ON 时,顶层 CMake 才 add_subdirectory(bt_server)。
# ============================================================================

# 可执行文件:服务进程(源文件均在 src/,头文件 demo_nodes.hpp/json_util.hpp 同目录)
add_executable(bt_server
  src/main.cpp
  src/tree_api_service.cpp
)

# 头文件搜索路径:
#   - 顶层 third_party/  → httplib.h
#   - 本目录 src/        → demo_nodes.hpp / json_util.hpp(用 "" 包含,通常自动可见,
#                          这里显式加上以防万一)
target_include_directories(bt_server
  PRIVATE
    ${CMAKE_SOURCE_DIR}/third_party
    ${CMAKE_CURRENT_SOURCE_DIR}/src
)

# 链接核心库(提供 NodeFactory / XmlParser / Tree 等)。
target_link_libraries(bt_server PRIVATE bt::core)

# C++17。
target_compile_features(bt_server PRIVATE cxx_std_17)

# cpp-httplib 需要线程支持(std::thread / pthread)。
find_package(Threads REQUIRED)
target_link_libraries(bt_server PRIVATE Threads::Threads)

# 开启常用告警(与核心库保持一致的工程标准)。
target_compile_options(bt_server PRIVATE
  $<$<OR:$<CXX_COMPILER_ID:Clang>,$<CXX_COMPILER_ID:AppleClang>,$<CXX_COMPILER_ID:GNU>>:-Wall -Wextra>
)

message(STATUS "[BT-X] bt_server 已配置(cpp-httplib + bt::core)")
