// ============================================================================
//  bt_ros2/src/bt_executor_node.cpp
//  BtExecutorNode 的实现。
//
//  @author lovelyyoshino
//  @date 2026-06-30
//  @version v1.1.0
//  @last_modified 2026-07-13
//  @changelog
//    - v1.1.0 (2026-07-13): 实现幂等服务控制与终态树显式复位
// ============================================================================
#include "bt_ros2/bt_executor_node.hpp"

#include <chrono>
#include <functional>
#include <stdexcept>

#include "bt_ros2/node_registration.hpp"
#include "bt_ros2/ros_blackboard_keys.hpp"

#include "bt_core/blackboard.hpp"
#include "bt_core/xml_parser.hpp"

using namespace std::chrono_literals;

namespace bt_ros2 {

BtExecutorNode::BtExecutorNode(const rclcpp::NodeOptions& options)
    : rclcpp::Node("bt_executor", options),
      blackboard_(bt_core::Blackboard::create()) {
  declareAndLoadParameters();
  registerNodeTypes();

  // 根状态发布器：把每拍的根节点状态(IDLE/RUNNING/SUCCESS/FAILURE)发出去，
  // 便于外部节点/工具监控行为树整体进展。
  status_pub_ = create_publisher<std_msgs::msg::String>(status_topic_, 10);

  loadTree();

  start_service_ = create_service<Trigger>(
      "~/start",
      std::bind(&BtExecutorNode::handleStart, this,
                std::placeholders::_1, std::placeholders::_2));
  stop_service_ = create_service<Trigger>(
      "~/stop",
      std::bind(&BtExecutorNode::handleStop, this,
                std::placeholders::_1, std::placeholders::_2));

  if (autostart_) {
    start();
  } else {
    RCLCPP_INFO(get_logger(), "autostart=false，等待外部调用 start() 后开始 tick。");
  }
}

void BtExecutorNode::declareAndLoadParameters() {
  // declare_parameter 给出默认值；运行时可被 launch / yaml / 命令行覆盖。
  tree_file_     = declare_parameter<std::string>("tree_file", "");
  tick_rate_hz_  = declare_parameter<double>("tick_rate_hz", 10.0);
  status_topic_  = declare_parameter<std::string>("status_topic", "~/bt_status");
  autostart_     = declare_parameter<bool>("autostart", true);
  stop_on_terminal_ = declare_parameter<bool>("stop_on_terminal", false);

  if (tree_file_.empty()) {
    throw std::runtime_error(
        "参数 'tree_file' 未设置：请通过 launch 或 --ros-args -p tree_file:=<路径> 指定行为树 XML。");
  }
  if (tick_rate_hz_ <= 0.0) {
    throw std::runtime_error("参数 'tick_rate_hz' 必须为正数。");
  }

  RCLCPP_INFO(get_logger(),
              "参数: tree_file=%s tick_rate_hz=%.2f status_topic=%s autostart=%s stop_on_terminal=%s",
              tree_file_.c_str(), tick_rate_hz_, status_topic_.c_str(),
              autostart_ ? "true" : "false",
              stop_on_terminal_ ? "true" : "false");
}

void BtExecutorNode::registerNodeTypes() {
  // 单例注册目录 + 注册函数引用列表，集中注册 bt_nodes / ROS topic / 数据录入 / 回充节点。
  registerDefaultNodes(factory_);

  RCLCPP_INFO(get_logger(), "已注册 %zu 种节点类型。", factory_.size());
}

void BtExecutorNode::loadTree() {
  // 关键步骤：先把本 ROS 节点的裸指针注入黑板，适配器节点 tick 时才能桥接 ROS。
  // 顺序很重要——必须在 XmlParser 建树/节点 tick 之前完成。
  setRosNodeHandle(blackboard_, this);

  bt_core::XmlParser parser(factory_);
  // loadFromFile 复用我们注入了 ROS 句柄的同一个黑板（务必传入，否则适配器取不到句柄）。
  bt_core::Tree tree = parser.loadFromFile(tree_file_, blackboard_);
  tree_ = std::make_unique<bt_core::Tree>(std::move(tree));

  RCLCPP_INFO(get_logger(), "已从 %s 加载行为树，共 %zu 个节点。",
              tree_file_.c_str(), tree_->nodes().size());
}

void BtExecutorNode::start() {
  if (timer_) {
    return;  // 已在运行。
  }
  // 周期 = 1 / 频率，转成纳秒交给 wall timer。
  const auto period = std::chrono::duration_cast<std::chrono::nanoseconds>(
      std::chrono::duration<double>(1.0 / tick_rate_hz_));
  timer_ = create_wall_timer(period, std::bind(&BtExecutorNode::onTick, this));
  RCLCPP_INFO(get_logger(), "开始 tick，频率 %.2f Hz。", tick_rate_hz_);
}

void BtExecutorNode::stop() {
  if (timer_) {
    timer_->cancel();
    timer_.reset();
  }
  if (tree_) {
    tree_->halt();  // 复位正在 RUNNING 的子树，释放异步资源。
  }
  RCLCPP_INFO(get_logger(), "已停止 tick 并 halt 行为树。");
}

void BtExecutorNode::onTick() {
  if (!tree_) {
    return;
  }
  // 执行一拍；BtExecutorNode 由 ROS executor 单线程驱动，tick 之间不阻塞。
  const bt_core::NodeStatus status = tree_->tickOnce();

  // 发布根状态，供外部监控。
  std_msgs::msg::String msg;
  msg.data = bt_core::toStr(status);
  status_pub_->publish(msg);

  // ROS2 topic 驱动的树通常要持续 tick：首拍无消息可能是 FAILURE，但不能因此停掉。
  // 若用户要“一轮跑完即停”的 demo 行为，可通过 stop_on_terminal=true 开启。
  if (stop_on_terminal_ && bt_core::isStatusCompleted(status)) {
    RCLCPP_INFO(get_logger(), "行为树到达终结状态: %s，停止 tick。",
                msg.data.c_str());
    if (timer_) {
      timer_->cancel();
      timer_.reset();
    }
  }
}

void BtExecutorNode::handleStart(
    const std::shared_ptr<Trigger::Request>,
    std::shared_ptr<Trigger::Response> response) {
  const bool was_running = static_cast<bool>(timer_);
  start();
  response->success = true;
  response->message = was_running ? "already running" : "started";
}

void BtExecutorNode::handleStop(
    const std::shared_ptr<Trigger::Request>,
    std::shared_ptr<Trigger::Response> response) {
  const bool was_running = static_cast<bool>(timer_);
  stop();
  response->success = true;
  response->message = was_running ? "stopped" : "already stopped";
}

}  // namespace bt_ros2
