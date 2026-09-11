// ============================================================================
//  bt_core/plugin_loader.hpp
//  PluginLoader —— 跨平台动态库插件加载器。
//
//  设计说明：
//    负责在运行时加载节点插件(.so/.dll/.dylib)，查找约定入口符号
//    BT_RegisterNodes 并调用它，把插件里的节点注册进给定的 NodeFactory。
//    封装了 POSIX(dlopen) 与 Windows(LoadLibrary) 的差异。
//
//    句柄生命周期：每个插件注册的 builder 和它创建的节点都会共享持有库句柄。
//    因此 Tree 可安全地存活到 NodeFactory 或 PluginLoader 之后；PluginLoader
//    仅额外保留显式加载者持有的句柄。
// ============================================================================
#ifndef BT_CORE_PLUGIN_LOADER_HPP
#define BT_CORE_PLUGIN_LOADER_HPP

#include <memory>
#include <string>
#include <utility>
#include <vector>

#include "bt_core/node_factory.hpp"

namespace bt_core {

/**
 * @brief 加载一个插件库并把其中的节点注册进 factory。
 * @param library_path 动态库文件路径(.so/.dll/.dylib)。
 * @param factory 目标工厂。
 * @return 一个持有原生库句柄的 shared_ptr<void>，其自定义删除器会在引用计数
 *         归零时卸载库。插件新注册的 builders 及其创建的节点也会持有同一
 *         句柄，因此 Tree 可以安全地超过 factory 或返回句柄的生命周期。
 * @throws std::runtime_error 加载失败 / 找不到入口符号。
 */
std::shared_ptr<void> loadPluginLibrary(const std::string& library_path,
                                        NodeFactory& factory);

/**
 * @brief 动态库插件加载器(显式持有句柄的便捷封装)。
 *
 * @details PluginLoader 可在调用者不再需要显式加载记录时析构：成功注册的
 *          builders 和从它们创建的节点会分别保留 DSO 直到自身销毁。
 */
class PluginLoader {
public:
  PluginLoader() = default;

  // 句柄用 shared_ptr 管理，可安全拷贝/移动。
  /**
   * @brief 加载一个插件库并把其中的节点注册进 factory。
   * @throws std::runtime_error 加载失败 / 找不到入口符号。
   */
  void load(const std::string& library_path, NodeFactory& factory) {
    handles_.reserve(handles_.size() + 1);
    auto handle = loadPluginLibrary(library_path, factory);
    handles_.push_back(std::move(handle));
  }

  /// @brief 已成功加载的库数量。
  size_t loadedCount() const { return handles_.size(); }

  /**
   * @brief 给定基础名，拼出当前平台的动态库文件名。
   * @details 例如 "my_nodes" -> Linux:"libmy_nodes.so" / macOS:"libmy_nodes.dylib"
   *          / Windows:"my_nodes.dll"。便于跨平台书写加载代码。
   */
  static std::string platformLibraryName(const std::string& base_name);

private:
  std::vector<std::shared_ptr<void>> handles_;  ///< 原生库句柄(带卸载删除器)
};

}  // namespace bt_core

#endif  // BT_CORE_PLUGIN_LOADER_HPP
