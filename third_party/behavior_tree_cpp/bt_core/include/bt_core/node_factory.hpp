// ============================================================================
//  bt_core/node_factory.hpp
//  NodeFactory —— 节点注册工厂，框架“插件化”的核心枢纽。
//
//  设计说明：
//    工厂维护两张表：
//      1) builders_  : 注册名 -> 构造函数。反序列化/编辑器建树时按名实例化节点。
//      2) manifests_ : 注册名 -> 节点元信息(类别 + 端口列表)。供 bt_server 的
//                      /nodes 接口枚举，前端据此渲染可拖拽的节点面板。
//
//    注册方式有两条路径，互补：
//      - 编译期：直接 factory.registerNodeType<T>("Name")。
//      - 运行期：PluginLoader 加载 .so 后调用其中的 BT_REGISTER_NODES 入口，
//                入口里再调 registerNodeType。两条路径最终都落到同一张表。
//
//    “providedPorts() 可选”：节点若定义了静态 providedPorts() 则自动收集端口
//    元信息；没有也能注册(端口列表为空)。用 SFINAE 检测。
// ============================================================================
#ifndef BT_CORE_NODE_FACTORY_HPP
#define BT_CORE_NODE_FACTORY_HPP

#include <functional>
#include <memory>
#include <stdexcept>
#include <string>
#include <type_traits>
#include <unordered_map>
#include <vector>

#include "bt_core/control_node.hpp"
#include "bt_core/decorator_node.hpp"
#include "bt_core/leaf_node.hpp"
#include "bt_core/tree_node.hpp"

namespace bt_core {

/// @brief 节点构造函数签名：给定实例名与配置，产出节点。
using NodeBuilder =
    std::function<TreeNode::Ptr(const std::string&, const NodeConfig&)>;

/// @brief 注册到工厂的一条节点元信息(暴露给编辑器)。
struct NodeManifest {
  std::string registration_name;  ///< 注册名(即 XML 标签名)
  NodeType    type{NodeType::UNDEFINED};
  PortsList   ports;              ///< 端口声明
};

class NodeFactory;

std::shared_ptr<void> loadPluginLibrary(const std::string& library_path,
                                        NodeFactory& factory);

// ---------------------------------------------------------------------------
//  SFINAE：检测某类型是否定义了静态 providedPorts()
// ---------------------------------------------------------------------------
template <typename T, typename = void>
struct has_provided_ports : std::false_type {};

template <typename T>
struct has_provided_ports<
    T, std::void_t<decltype(T::providedPorts())>> : std::true_type {};

/// @brief 若 T 定义了 providedPorts() 则返回之，否则返回空列表。
template <typename T>
PortsList collectPorts() {
  if constexpr (has_provided_ports<T>::value) {
    return T::providedPorts();
  } else {
    return {};
  }
}

/**
 * @brief 节点工厂。
 */
class NodeFactory {
public:
  /**
   * @brief 注册一个节点类型。
   * @tparam T 必须继承自 TreeNode，且构造签名为 T(std::string, NodeConfig)。
   * @param registration_name 注册名(XML 标签名 / 编辑器显示名)。
   * @throws std::logic_error 名称重复注册。
   */
  template <typename T>
  void registerNodeType(const std::string& registration_name) {
    static_assert(std::is_base_of<TreeNode, T>::value,
                  "注册类型必须继承自 bt_core::TreeNode");

    if (builders_.count(registration_name) ||
        manifests_.count(registration_name)) {
      throw std::logic_error("节点类型重复注册: " + registration_name);
    }

    // 先完成所有可能执行用户代码或分配内存的工作，随后才修改注册表。
    NodeBuilder builder =
        [registration_name](const std::string& inst_name,
                            const NodeConfig& cfg) -> TreeNode::Ptr {
      auto node = std::make_shared<T>(inst_name, cfg);
      node->setRegistrationName(registration_name);
      return node;
    };

    PortsList ports = collectPorts<T>();
    NodeType type = NodeType::UNDEFINED;
    {
      NodeConfig tmp_cfg;
      tmp_cfg.blackboard = Blackboard::create();
      T probe(registration_name, tmp_cfg);
      type = probe.type();
    }

    NodeManifest manifest;
    manifest.registration_name = registration_name;
    manifest.type = type;
    manifest.ports = std::move(ports);

    auto [builder_it, builder_inserted] =
        builders_.emplace(registration_name, std::move(builder));
    if (!builder_inserted) {
      throw std::logic_error("节点类型重复注册: " + registration_name);
    }

    try {
      const bool manifest_inserted =
          manifests_.emplace(registration_name, std::move(manifest)).second;
      if (!manifest_inserted) {
        throw std::logic_error("节点类型重复注册: " + registration_name);
      }
    } catch (...) {
      builders_.erase(builder_it);
      throw;
    }
  }

  /**
   * @brief 按注册名创建一个节点实例。
   * @throws std::runtime_error 名称未注册。
   */
  TreeNode::Ptr createNode(const std::string& registration_name,
                           const std::string& instance_name,
                           const NodeConfig& config) const {
    auto it = builders_.find(registration_name);
    if (it == builders_.end()) {
      throw std::runtime_error("未注册的节点类型: " + registration_name);
    }
    return it->second(instance_name, config);
  }

  /// @brief 是否已注册某节点类型。
  bool isRegistered(const std::string& registration_name) const {
    return builders_.find(registration_name) != builders_.end();
  }

  /// @brief 返回所有节点的 manifest(供 /nodes 接口枚举)。
  std::vector<NodeManifest> manifests() const {
    std::vector<NodeManifest> result;
    result.reserve(manifests_.size());
    for (const auto& [name, m] : manifests_) {
      result.push_back(m);
    }
    return result;
  }

  /// @brief 已注册节点数量。
  size_t size() const { return builders_.size(); }

  /**
   * @brief 加载一个动态库插件，把其中的节点注册进本工厂，并由本工厂持有库句柄。
   * @param library_path 插件路径(.so/.dll/.dylib)。
   * @details 这是加载插件的**推荐入口**。库句柄存入 plugin_handles_(首个声明的
   *          成员，最后析构)，保证 builders_/manifests_ 析构时库仍处于已映射
   *          状态，从根本上避免“卸载后访问插件代码”导致的段错误。
   * @throws std::runtime_error 加载失败 / 缺少入口符号。
   */
  void loadPlugin(const std::string& library_path);

  /**
   * @brief 由插件加载器回调，把库句柄交给工厂持有。一般不直接调用。
   */
  void retainPluginHandle(std::shared_ptr<void> handle) {
    plugin_handles_.push_back(std::move(handle));
  }

private:
  friend std::shared_ptr<void> loadPluginLibrary(
      const std::string& library_path, NodeFactory& factory);

  // ⚠️ 成员声明顺序即析构逆序：plugin_handles_ 必须是首个成员，使其最后析构。
  //    这样 builders_/manifests_(可能引用插件代码)先于库卸载而析构，避免段错误。
  std::vector<std::shared_ptr<void>>            plugin_handles_;
  std::unordered_map<std::string, NodeBuilder>  builders_;
  std::unordered_map<std::string, NodeManifest> manifests_;
};

}  // namespace bt_core

#endif  // BT_CORE_NODE_FACTORY_HPP
