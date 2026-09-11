// ============================================================================
//  bt_ros2/bt_executor_node.hpp
//  BtExecutorNode —— 把 bt_core 行为树“跑”在 ROS2 里的执行器节点。
//
//  @author lovelyyoshino
//  @date 2026-06-30
//  @version v1.1.0
//  @last_modified 2026-07-13
//  @changelog
//    - v1.1.0 (2026-07-13): 增加可外部调用且幂等的 start/stop Trigger 服务
//
//  职责（一个标准的 rclcpp::Node 包装器）：
//    1. 从 ROS2 参数读取：
//         - tree_file    : 要加载的行为树 XML 路径
//         - tick_rate_hz : 周期 tick 频率（Hz）
//         - status_topic : 发布根状态的 topic 名
//         - autostart    : 是否在构造后立即开始 tick
//    2. 构造 NodeFactory，注册：
//         - bt_ros2 的 ROS 适配器节点（条件/动作）
//         - bt_nodes 的常用控制/装饰节点（Sequence/Fallback/Parallel/Inverter/Retry）
//    3. 把自身（rclcpp::Node*）写入共享黑板（供适配器节点桥接 ROS，见
//       ros_blackboard_keys.hpp），再用 XmlParser 从文件加载成 Tree。
//    4. 用一个 ROS2 wall timer 周期性 tickOnce()，并把根节点状态发布到 status_topic。
//
//  设计取舍：
//    - 核心库 bt_core 始终零 ROS 依赖；ROS 的“时间驱动 + 参数 + 话题”全部封装在本类，
//      这正是 architecture.md 第 5 节“bt_ros2 为可选包”的体现。
//    - tick 由 ROS executor 的单线程定时器驱动，避免在节点 tick 里手动 sleep。
// ============================================================================
#ifndef BT_ROS2_BT_EXECUTOR_NODE_HPP
#define BT_ROS2_BT_EXECUTOR_NODE_HPP

#include <memory>
#include <string>

#include "bt_core/node_factory.hpp"
#include "bt_core/tree.hpp"
#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/string.hpp"
#include "std_srvs/srv/trigger.hpp"

namespace bt_ros2 {

/**
 * @brief 周期性 tick 一棵 bt_core 行为树的 ROS2 执行器节点。
 */
class BtExecutorNode : public rclcpp::Node {
public:
  /**
   * @param options ROS2 节点选项（支持参数覆盖、remap、intra-process 等）。
   */
  explicit BtExecutorNode(
      const rclcpp::NodeOptions& options = rclcpp::NodeOptions());

  /// @brief 手动开始周期 tick（autostart=false 时由外部调用）。
  void start();

  /// @brief 停止周期 tick 并 halt 行为树（释放正在 RUNNING 的子树）。
  void stop();

private:
  using Trigger = std_srvs::srv::Trigger;

  /// @brief 声明并读取本节点的 ROS2 参数（带默认值）。
  void declareAndLoadParameters();

  /// @brief 向工厂注册 ROS 适配器节点 + bt_nodes 常用节点。
  void registerNodeTypes();

  /// @brief 加载 tree_file 指定的 XML 为可执行 Tree（失败抛 runtime_error）。
  void loadTree();

  /// @brief timer 回调：tick 一拍 + 发布根状态。
  void onTick();

  /// @brief 处理 ~/start：幂等地启动周期 tick。
  void handleStart(
      const std::shared_ptr<Trigger::Request>,
      std::shared_ptr<Trigger::Response> response);

  /// @brief 处理 ~/stop：幂等地停止 tick 并 halt 行为树。
  void handleStop(
      const std::shared_ptr<Trigger::Request>,
      std::shared_ptr<Trigger::Response> response);

  // -- 配置参数（来自 ROS2 param）------------------------------------------
  std::string tree_file_;          ///< 行为树 XML 文件路径
  double      tick_rate_hz_{10.0}; ///< tick 频率（Hz）
  std::string status_topic_{"~/bt_status"};  ///< 根状态发布 topic
  bool        autostart_{true};    ///< 是否构造后自动开始
  bool        stop_on_terminal_{false};  ///< 根节点终结后是否停止 tick

  // -- bt_core 运行期对象 ---------------------------------------------------
  bt_core::NodeFactory     factory_;     ///< 节点工厂（注册 + 建树）
  bt_core::Blackboard::Ptr blackboard_;  ///< 共享黑板（持有 ROS 句柄）
  std::unique_ptr<bt_core::Tree> tree_;  ///< 已加载的行为树

  // -- ROS2 资源 ------------------------------------------------------------
  rclcpp::TimerBase::SharedPtr timer_;   ///< 周期 tick 定时器
  rclcpp::Publisher<std_msgs::msg::String>::SharedPtr status_pub_;  ///< 根状态发布器
  rclcpp::Service<Trigger>::SharedPtr start_service_;  ///< 幂等启动服务
  rclcpp::Service<Trigger>::SharedPtr stop_service_;   ///< 幂等停止服务
};

}  // namespace bt_ros2

#endif  // BT_ROS2_BT_EXECUTOR_NODE_HPP
