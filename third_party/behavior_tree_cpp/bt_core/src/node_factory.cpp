// ============================================================================
//  bt_core/src/node_factory.cpp
//  说明：bt_core 目前以头文件为主(模板密集)。本文件提供一个非模板的编译单元，
//        让 bt_core 成为一个有实际产物的库(而非纯 INTERFACE)，并放置未来需要
//        分离实现的非模板逻辑(如版本信息)。
// ============================================================================
#include "bt_core/node_factory.hpp"

namespace bt_core {

// 框架版本号(与顶层 CMake project 版本对应)。
const char* version() { return "0.1.0"; }

}  // namespace bt_core
