// ============================================================================
//  bt_ros2/ros_subscriber_node.hpp
//  ROS2 订阅型状态节点的可复用基类 —— 把"在一个状态里接收 ROS2 数据"这件事
//  收敛成"继承 + 实现一个方法"。
//
//  ────────────────────────────────────────────────────────────────────────
//  解决什么痛点
//  ────────────────────────────────────────────────────────────────────────
//    没有这个基类时，每个想接收 ROS2 数据的节点都要重复写：
//      1) 从黑板取 rclcpp::Node 句柄(getRosNodeHandle)
//      2) 首次 tick 惰性 create_subscription
//      3) 回调里缓存最新消息 + 记录接收时间
//      4) tick 时判断"有没有收到 / 数据是否过期"
//    这套样板又臭又长，还容易把"新鲜度"漏掉。本基类把 1~4 全部收敛，
//    用户只需继承并实现**一个**方法。
//
//  ────────────────────────────────────────────────────────────────────────
//  两种用法(覆盖绝大多数"数据录入"场景)
//  ────────────────────────────────────────────────────────────────────────
//    A) 把数据当"条件"用 —— 继承 RosConditionNode<MsgT>，实现 evaluate(msg)->bool
//       例：IsObstacleClose : 订阅测距，range < 0.5 则 SUCCESS。
//
//    B) 把数据"录入黑板"给后续节点用 —— 继承 RosInputNode<MsgT>，实现 onData(msg)
//       在 onData 里用 setOutput<T>(port, value) 把感兴趣的字段写进黑板。
//       例：ReadBattery : 订阅电量，setOutput("level", msg.percentage)。
//
//  ────────────────────────────────────────────────────────────────────────
//  线程模型(重要前提)
//  ────────────────────────────────────────────────────────────────────────
//    约定由 BtExecutorNode 用**单线程 executor** 驱动：timer 的 tick 回调与
//    subscription 回调在同一线程里交替执行，**不会并发**。因此 tick 读缓存、
//    回调写缓存之间没有数据竞争，无需加锁。若你改用多线程 executor，需自行
//    给 last_msg_/last_recv_ 加锁——这点在 README 里也会强调。
//
//  ────────────────────────────────────────────────────────────────────────
//  公共端口(所有子类自动拥有)
//  ────────────────────────────────────────────────────────────────────────
//    topic      (input)  订阅的话题名
//    timeout_ms (input)  数据时效窗口；<=0 表示永不过期(只要收到过就算有效)
//    qos_depth  (input)  订阅 QoS 队列深度(默认 10)
//    qos_profile(input)  QoS 配置：default 或 sensor_data
// ============================================================================
#ifndef BT_ROS2_ROS_SUBSCRIBER_NODE_HPP
#define BT_ROS2_ROS_SUBSCRIBER_NODE_HPP

#include <memory>
#include <string>

#include "bt_core/leaf_node.hpp"
#include "bt_core/node_status.hpp"
#include "bt_ros2/data_freshness.hpp"
#include "bt_ros2/ros_blackboard_keys.hpp"
#include "bt_ros2/ros_qos.hpp"
#include "rclcpp/rclcpp.hpp"

namespace bt_ros2 {

// ---------------------------------------------------------------------------
//  CRTP 风格的订阅核心 —— 被 RosConditionNode / RosInputNode 复用。
//  BaseLeaf 是 bt_core::ConditionNode 或 bt_core::ActionNode。
// ---------------------------------------------------------------------------
/**
 * @brief 订阅型节点基类模板。
 * @tparam MsgT     ROS2 消息类型(如 sensor_msgs::msg::Range)。
 * @tparam BaseLeaf bt_core::ConditionNode 或 bt_core::ActionNode。
 *
 * 子类不要直接继承本模板，请用下面的 RosConditionNode / RosInputNode 别名基类。
 */
template <typename MsgT, typename BaseLeaf>
class RosSubscriberNodeBase : public BaseLeaf {
public:
  using BaseLeaf::BaseLeaf;  // 继承 (std::string, NodeConfig) 构造

  /// @brief 公共端口：topic / timeout_ms / qos_depth / qos_profile。
  ///        子类如需额外端口，可在自己的 providedPorts() 里合并本函数返回值。
  static bt_core::PortsList subscriberPorts() {
    return bt_core::makePorts(
        bt_core::InputPort<std::string>("topic", "", "要订阅的话题名"),
        bt_core::InputPort<int>("timeout_ms", "0",
                                "数据时效窗口(ms)，<=0 表示永不过期"),
        bt_core::InputPort<int>("qos_depth", "10", "订阅 QoS 队列深度"),
        bt_core::InputPort<std::string>(
            "qos_profile", "default", "订阅 QoS 配置",
            {"default", "sensor_data"}));
  }

  /// 默认 providedPorts 即公共端口（子类可覆盖以追加自有端口）。
  static bt_core::PortsList providedPorts() { return subscriberPorts(); }

protected:
  /// @brief 子类钩子：收到新数据时是否进一步处理。默认什么都不做。
  ///        RosInputNode 用它把消息字段写进黑板。
  virtual void onMessage(const MsgT& /*msg*/) {}

  /// @brief 子类钩子：基于"最新且新鲜"的数据给出节点状态。
  ///        RosConditionNode 用它把 evaluate(msg) 映射成 SUCCESS/FAILURE。
  virtual bt_core::NodeStatus onFreshData(const MsgT& msg) = 0;

  /// @brief 子类钩子：当前无新鲜数据(从未收到或已过期)时的状态。
  ///        默认 FAILURE(数据不可用 = 条件不满足)。需要"等数据"语义可覆盖为 RUNNING。
  virtual bt_core::NodeStatus onNoFreshData() { return bt_core::NodeStatus::FAILURE; }

  /// @brief 统一的 tick 流程：惰性订阅 → 判新鲜 → 分派钩子。
  bt_core::NodeStatus tickImpl() {
    ensureSubscription();

    const bool fresh = isFresh(received_, last_recv_,
                               std::chrono::steady_clock::now(), timeout_ms_);
    if (!fresh) {
      return onNoFreshData();
    }
    onMessage(last_msg_);          // 数据录入钩子(RosInputNode 用)
    return onFreshData(last_msg_); // 状态判定钩子(RosConditionNode 用)
  }

private:
  /// @brief 首次 tick 时惰性创建订阅(此时才能从黑板拿到 ROS 句柄)。
  void ensureSubscription() {
    if (sub_) return;

    rclcpp::Node* node = getRosNodeHandle(this->blackboard());

    const std::string topic = this->template getInput<std::string>("topic").value_or("");
    if (topic.empty()) {
      throw std::runtime_error("RosSubscriberNode '" + this->name() +
                               "': 端口 'topic' 未设置");
    }
    timeout_ms_ = this->template getInput<int>("timeout_ms").value_or(0);
    const int depth = this->template getInput<int>("qos_depth").value_or(10);
    const std::string profile =
        this->template getInput<std::string>("qos_profile").value_or("default");

    sub_ = node->template create_subscription<MsgT>(
        topic, makeSubscriptionQos(depth, profile),
        [this](const typename MsgT::SharedPtr msg) {
          // 回调与 tick 同线程(单线程 executor)，直接写缓存即可。
          last_msg_ = *msg;
          last_recv_ = std::chrono::steady_clock::now();
          received_ = true;
        });
  }

  typename rclcpp::Subscription<MsgT>::SharedPtr sub_;  ///< 订阅句柄(惰性)
  MsgT       last_msg_{};                 ///< 最近一次收到的消息
  SteadyTime last_recv_{};                ///< 最近一次接收时刻
  bool       received_{false};            ///< 是否至少收到过一次
  int        timeout_ms_{0};              ///< 时效窗口(首次 tick 时从端口读)
};

// ---------------------------------------------------------------------------
//  用法 A：把 ROS2 数据当"条件"
// ---------------------------------------------------------------------------
/**
 * @brief 订阅型条件节点。子类只需实现 evaluate(msg)->bool。
 *
 * @code
 *   class IsObstacleClose : public RosConditionNode<sensor_msgs::msg::Range> {
 *    public:
 *     using RosConditionNode::RosConditionNode;
 *     bool evaluate(const sensor_msgs::msg::Range& m) override {
 *       return m.range < 0.5;  // 障碍物近 → 条件成立
 *     }
 *   };
 *   // XML: <IsObstacleClose topic="/range" timeout_ms="500"/>
 * @endcode
 */
template <typename MsgT>
class RosConditionNode
    : public RosSubscriberNodeBase<MsgT, bt_core::ConditionNode> {
public:
  using RosSubscriberNodeBase<MsgT, bt_core::ConditionNode>::RosSubscriberNodeBase;

  /// @brief 子类实现：根据最新且新鲜的消息判断条件真假。
  virtual bool evaluate(const MsgT& msg) = 0;

  bt_core::NodeStatus tick() override final { return this->tickImpl(); }

protected:
  bt_core::NodeStatus onFreshData(const MsgT& msg) override final {
    return evaluate(msg) ? bt_core::NodeStatus::SUCCESS
                         : bt_core::NodeStatus::FAILURE;
  }
};

// ---------------------------------------------------------------------------
//  用法 B：把 ROS2 数据"录入黑板"
// ---------------------------------------------------------------------------
/**
 * @brief 订阅型数据录入节点。子类只需实现 onData(msg)，在里面 setOutput 写黑板。
 *
 * 语义：只要有新鲜数据就把它录入黑板并返回 SUCCESS；无新鲜数据返回 FAILURE
 *       (可覆盖 onNoFreshData 改成 RUNNING 以实现"阻塞等首帧数据")。
 *
 * @code
 *   class ReadBattery : public RosInputNode<sensor_msgs::msg::BatteryState> {
 *    public:
 *     using RosInputNode::RosInputNode;
 *     static bt_core::PortsList providedPorts() {
 *       auto p = subscriberPorts();                       // 复用公共端口
 *       p.insert(bt_core::OutputPort<double>("level", "电量百分比"));
 *       return p;
 *     }
 *     void onData(const sensor_msgs::msg::BatteryState& m) override {
 *       setOutput<double>("level", m.percentage);         // 录入黑板
 *     }
 *   };
 *   // XML: <ReadBattery topic="/battery" level="{battery_level}"/>
 *   // 之后别的节点就能 getInput<double>("battery_level") 读到电量。
 * @endcode
 */
template <typename MsgT>
class RosInputNode
    : public RosSubscriberNodeBase<MsgT, bt_core::ActionNode> {
public:
  using RosSubscriberNodeBase<MsgT, bt_core::ActionNode>::RosSubscriberNodeBase;

  /// @brief 子类实现：把消息里关心的字段 setOutput 进黑板。
  virtual void onData(const MsgT& msg) = 0;

  bt_core::NodeStatus tick() override final { return this->tickImpl(); }

protected:
  void onMessage(const MsgT& msg) override final { onData(msg); }

  /// 有新鲜数据 → 录入完成即 SUCCESS（录入动作本身的成败）。
  bt_core::NodeStatus onFreshData(const MsgT& /*msg*/) override final {
    return bt_core::NodeStatus::SUCCESS;
  }
};

}  // namespace bt_ros2

#endif  // BT_ROS2_ROS_SUBSCRIBER_NODE_HPP
