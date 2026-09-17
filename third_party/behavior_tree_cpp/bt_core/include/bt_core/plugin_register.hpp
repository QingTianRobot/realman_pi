// ============================================================================
//  bt_core/register_macro.hpp
//  插件注册宏 —— 让节点动态库以统一约定向 NodeFactory 自注册。
//
//  设计说明：
//    每个节点插件(.so/.dll/.dylib)必须导出一个 C 链接的入口函数：
//        extern "C" void BT_RegisterNodes(bt_core::NodeFactory&);
//    PluginLoader 加载库后用 dlsym/GetProcAddress 找到该符号并调用，把库里
//    的节点注册进工厂。C 链接(extern "C")是为了避免 C++ name mangling 导致
//    跨编译器找不到符号。
//
//    使用方式(在插件 .cpp 里)：
//        BT_REGISTER_NODES(factory) {
//          factory.registerNodeType<MyAction>("MyAction");
//        }
// ============================================================================
#ifndef BT_CORE_REGISTER_MACRO_HPP
#define BT_CORE_REGISTER_MACRO_HPP

#include "bt_core/node_factory.hpp"

/// @brief 插件必须导出的入口符号名(供 PluginLoader 查找)。
#define BT_PLUGIN_ENTRY_SYMBOL "BT_RegisterNodes"

// 跨平台导出修饰：Windows 用 dllexport，POSIX 用 default 可见性。
#if defined(_WIN32)
  #define BT_PLUGIN_EXPORT extern "C" __declspec(dllexport)
#else
  #define BT_PLUGIN_EXPORT extern "C" __attribute__((visibility("default")))
#endif

/**
 * @brief 定义插件注册入口。展开为标准的 BT_RegisterNodes 函数签名。
 * @param factory 形参名，函数体内用它注册节点。
 */
#define BT_REGISTER_NODES(factory) \
  BT_PLUGIN_EXPORT void BT_RegisterNodes(bt_core::NodeFactory& factory)

namespace bt_core {
/// @brief 插件入口函数指针类型(PluginLoader 内部使用)。
using PluginRegisterFn = void (*)(NodeFactory&);
}  // namespace bt_core

#endif  // BT_CORE_REGISTER_MACRO_HPP
