// ============================================================================
//  bt_core/src/plugin_loader.cpp
//  插件加载的平台相关实现。
//    - POSIX(Linux/macOS): dlopen / dlsym / dlclose
//    - Windows           : LoadLibrary / GetProcAddress / FreeLibrary
//
//  生命周期要点：
//    加载返回的句柄用 shared_ptr<void> + 自定义删除器管理。插件 builder 与其
//    创建的节点均共享持有该句柄，确保析构插件对象之前动态库仍处于映射状态。
// ============================================================================
#include "bt_core/plugin_loader.hpp"

#include <stdexcept>

#include "bt_core/plugin_register.hpp"

#if defined(_WIN32)
  #include <windows.h>
#else
  #include <dlfcn.h>
#endif

namespace bt_core {

// ----------------------------- 平台封装 ------------------------------------
namespace {

// Member order is deliberate: plugin objects are destroyed before their handle.
struct PluginBuilderOwner {
  std::shared_ptr<void> handle;
  NodeBuilder           builder;
};

struct PluginNodeOwner {
  std::shared_ptr<void> handle;
  TreeNode::Ptr          node;
};

void* openLibrary(const std::string& path, std::string& err) {
#if defined(_WIN32)
  void* h = reinterpret_cast<void*>(LoadLibraryA(path.c_str()));
  if (!h) err = "LoadLibrary 失败, code=" + std::to_string(GetLastError());
  return h;
#else
  void* h = dlopen(path.c_str(), RTLD_NOW | RTLD_LOCAL);
  if (!h) {
    const char* e = dlerror();
    err = e ? e : "dlopen 未知错误";
  }
  return h;
#endif
}

void* findSymbol(void* handle, const char* symbol) {
#if defined(_WIN32)
  return reinterpret_cast<void*>(
      GetProcAddress(reinterpret_cast<HMODULE>(handle), symbol));
#else
  return dlsym(handle, symbol);
#endif
}

void closeLibrary(void* handle) {
  if (!handle) return;
#if defined(_WIN32)
  FreeLibrary(reinterpret_cast<HMODULE>(handle));
#else
  dlclose(handle);
#endif
}

NodeBuilder wrapPluginBuilder(NodeBuilder builder,
                              std::shared_ptr<void> handle) {
  auto builder_owner = std::make_shared<PluginBuilderOwner>(
      PluginBuilderOwner{std::move(handle), std::move(builder)});
  return [builder_owner = std::move(builder_owner)](
             const std::string& instance_name,
             const NodeConfig& config) -> TreeNode::Ptr {
    auto node = builder_owner->builder(instance_name, config);
    auto owner = std::make_shared<PluginNodeOwner>(
        PluginNodeOwner{builder_owner->handle, std::move(node)});
    return TreeNode::Ptr(owner, owner->node.get());
  };
}

}  // namespace

// ------------------------------- 加载 --------------------------------------

std::shared_ptr<void> loadPluginLibrary(const std::string& library_path,
                                        NodeFactory& factory) {
  std::string err;
  void* handle = openLibrary(library_path, err);
  if (!handle) {
    throw std::runtime_error("加载插件失败 '" + library_path + "': " + err);
  }

  auto library_handle =
      std::shared_ptr<void>(handle, [](void* h) { closeLibrary(h); });

  // 查找约定入口符号 BT_RegisterNodes
  void* sym = findSymbol(library_handle.get(), BT_PLUGIN_ENTRY_SYMBOL);
  if (!sym) {
    throw std::runtime_error("插件 '" + library_path + "' 缺少入口符号 " +
                             BT_PLUGIN_ENTRY_SYMBOL);
  }

  auto builders_before = factory.builders_;
  auto manifests_before = factory.manifests_;

  try {
    auto register_fn = reinterpret_cast<PluginRegisterFn>(sym);
    register_fn(factory);

    for (auto& [name, builder] : factory.builders_) {
      if (builders_before.find(name) == builders_before.end()) {
        NodeBuilder wrapped = wrapPluginBuilder(builder, library_handle);
        builder = std::move(wrapped);
      }
    }
  } catch (...) {
    // Snapshot locals receive partial plugin builders and are destroyed before
    // library_handle, keeping the plugin mapped throughout their destruction.
    factory.builders_.swap(builders_before);
    factory.manifests_.swap(manifests_before);
    throw;
  }

  return library_handle;
}

// ----------------- NodeFactory::loadPlugin（安全析构顺序入口） ----------------

void NodeFactory::loadPlugin(const std::string& library_path) {
  // Reserve before registration commits so retaining the successful handle
  // cannot allocate after the factory maps have been updated.
  plugin_handles_.reserve(plugin_handles_.size() + 1);
  auto handle = loadPluginLibrary(library_path, *this);
  plugin_handles_.push_back(std::move(handle));
}

// --------------------------- 跨平台文件名 ----------------------------------

std::string PluginLoader::platformLibraryName(const std::string& base_name) {
#if defined(_WIN32)
  return base_name + ".dll";
#elif defined(__APPLE__)
  return "lib" + base_name + ".dylib";
#else
  return "lib" + base_name + ".so";
#endif
}

}  // namespace bt_core
