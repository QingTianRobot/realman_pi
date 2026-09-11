// ============================================================================
//  bt_core/tree_node.hpp
//  TreeNode —— 所有行为树节点的抽象基类。
//
//  @author lovelyyoshino
//  @date 2026-06-30
//  @version v1.1.0
//  @last_modified 2026-07-13
//  @changelog
//    - v1.1.0 (2026-07-13): 跟踪已执行但尚未显式 halt 的节点，支持幂等深度复位
//
//  设计说明：
//    一切节点(控制/装饰/动作/条件)都继承自 TreeNode。它定义了节点的统一接口：
//      - tick()  : 执行一拍，返回 NodeStatus(纯虚，子类必须实现)
//      - halt()  : 中止正在 RUNNING 的(子)树，复位为 IDLE
//      - 名称/类型/端口/黑板访问
//
//    端口读写封装：节点不直接碰黑板 key，而是通过“端口名 -> 黑板 key 映射”
//    间接访问，从而支持树文件里的端口重映射(remapping)，提升节点复用性。
// ============================================================================
#ifndef BT_CORE_TREE_NODE_HPP
#define BT_CORE_TREE_NODE_HPP

#include <functional>
#include <memory>
#include <optional>
#include <string>
#include <unordered_map>

#include "bt_core/blackboard.hpp"
#include "bt_core/node_status.hpp"

namespace bt_core {

/// @brief 节点配置：构造节点时注入的运行期环境。
struct NodeConfig {
  Blackboard::Ptr blackboard;                               ///< 共享黑板
  std::unordered_map<std::string, std::string> port_remap;  ///< 端口名 -> 黑板 key("{k}" 形式)
  std::unordered_map<std::string, std::string> port_values; ///< 端口名 -> 字面量值(供序列化还原)
};

/**
 * @brief 状态变化观察者回调。
 * @param node_id 节点唯一 id
 * @param prev    变化前状态
 * @param next    变化后状态
 *
 * Tree 会把该回调透传给每个节点，节点状态变化时触发；
 * bt_server 借此把运行态推送给 Web 编辑器做高亮。
 */
using StatusChangeCallback =
    std::function<void(uint16_t node_id, NodeStatus prev, NodeStatus next)>;

class TreeNode {
public:
  using Ptr = std::shared_ptr<TreeNode>;

  /**
   * @param name   节点实例名(树文件里可指定，用于展示与定位)
   * @param config 运行期配置(黑板 + 端口映射)
   */
  TreeNode(std::string name, NodeConfig config)
      : name_(std::move(name)), config_(std::move(config)) {
    if (!config_.blackboard) {
      config_.blackboard = Blackboard::create();
    }
  }

  virtual ~TreeNode() = default;

  // -- 子类必须/可以实现的核心接口 ----------------------------------------

  /// @brief 执行一拍。子类必须实现。
  virtual NodeStatus tick() = 0;

  /// @brief 节点类别。子类必须实现(决定序列化标签与编辑器分类)。
  virtual NodeType type() const = 0;

  /**
   * @brief 中止当前执行。
   * @details 默认实现仅复位为 IDLE；控制/装饰节点会重写以递归 halt 子节点。
   */
  virtual void halt() {
    markHalted();
    setStatus(NodeStatus::IDLE);
  }

  // -- 对外统一的执行入口 ---------------------------------------------------

  /**
   * @brief 执行节点并维护状态 + 触发观察者回调。
   * @details 框架内部(父节点/Tree)应调用 executeTick() 而非直接调用 tick()，
   *          以保证状态变化被记录与广播。
   */
  NodeStatus executeTick() {
    // 即使 tick 抛异常，显式 halt 仍应知道该节点可能已创建部分资源。
    halt_pending_ = true;
    const NodeStatus new_status = tick();
    setStatus(new_status);
    return new_status;
  }

  // -- 状态访问 -------------------------------------------------------------

  NodeStatus status() const { return status_; }

  /// @brief 本节点自上次显式 halt 后是否执行过，供父节点精确传播复位。
  bool needsHalt() const { return halt_pending_; }

  void setStatus(NodeStatus new_status) {
    if (new_status != status_) {
      const NodeStatus prev = status_;
      status_ = new_status;
      if (status_callback_) {
        status_callback_(node_id_, prev, new_status);
      }
    }
  }

  // -- 元信息 ---------------------------------------------------------------

  const std::string& name() const { return name_; }
  void setRegistrationName(std::string n) { registration_name_ = std::move(n); }
  const std::string& registrationName() const { return registration_name_; }

  uint16_t id() const { return node_id_; }
  void setId(uint16_t id) { node_id_ = id; }

  void setStatusCallback(StatusChangeCallback cb) {
    status_callback_ = std::move(cb);
  }

  Blackboard::Ptr blackboard() const { return config_.blackboard; }
  const NodeConfig& config() const { return config_; }

  // -- 端口读写(节点逻辑里使用) -------------------------------------------

  /**
   * @brief 通过端口名读取输入。
   * @details 解析优先级：
   *   1) 若端口被重映射到黑板 key("{k}" 形式) → 读黑板对应 key；
   *   2) 否则若该端口有本地字面量值(来自 XML 如 msg="hi") → 转换为 T 返回。
   *      字面量存在节点本地 port_values，**不进共享黑板**，避免多个同名端口
   *      的节点互相覆盖(经典私有端口语义)；
   *   3) 都没有 → 按端口名直接读黑板(兼容程序化 set 的场景)。
   */
  template <typename T>
  std::optional<T> getInput(const std::string& port_name) const {
    // 1) 重映射端口：读黑板。
    auto remap_it = config_.port_remap.find(port_name);
    if (remap_it != config_.port_remap.end()) {
      return config_.blackboard->get<T>(remap_it->second);
    }
    // 2) 本地字面量端口值。
    auto val_it = config_.port_values.find(port_name);
    if (val_it != config_.port_values.end()) {
      return convertFromString<T>(val_it->second);
    }
    // 3) 回退：按端口名直接读黑板。
    return config_.blackboard->get<T>(port_name);
  }

  /**
   * @brief 通过端口名写出输出到黑板。
   */
  template <typename T>
  void setOutput(const std::string& port_name, T value) {
    const std::string key = resolveKey(port_name);
    config_.blackboard->set<T>(key, std::move(value));
  }

protected:
  /// @brief 派生 halt 实现完成清理后调用，保证重复 halt 不再触达后代。
  void markHalted() { halt_pending_ = false; }

  /// @brief 把端口名解析为实际黑板 key(考虑重映射)。
  std::string resolveKey(const std::string& port_name) const {
    auto it = config_.port_remap.find(port_name);
    return it != config_.port_remap.end() ? it->second : port_name;
  }

private:
  std::string         name_;
  std::string         registration_name_;  ///< 注册名(节点类型名，用于序列化)
  NodeConfig          config_;
  NodeStatus          status_{NodeStatus::IDLE};
  bool                halt_pending_{false};
  uint16_t            node_id_{0};
  StatusChangeCallback status_callback_;
};

}  // namespace bt_core

#endif  // BT_CORE_TREE_NODE_HPP
