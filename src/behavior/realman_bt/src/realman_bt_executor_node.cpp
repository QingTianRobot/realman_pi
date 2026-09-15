#include "realman_bt/realman_bt_executor_node.hpp"

#include <chrono>
#include <cmath>
#include <stdexcept>

#include "bt_core/xml_parser.hpp"
#include "bt_nodes/control/sequence_node.hpp"
#include "realman_bt/move_j_node.hpp"

namespace realman_bt {

RealmanBtExecutorNode::RealmanBtExecutorNode(const rclcpp::NodeOptions& options)
    : rclcpp::Node("realman_bt_executor", options), blackboard_(bt_core::Blackboard::create()) {
  const std::string tree_file = declare_parameter<std::string>("tree_file", "");
  const std::string arm_id = declare_parameter<std::string>("arm_id", "r");
  const bool dry_run = declare_parameter<bool>("dry_run", true);
  tick_rate_hz_ = declare_parameter<double>("tick_rate_hz", 10.0);
  autostart_ = declare_parameter<bool>("autostart", true);
  stop_on_terminal_ = declare_parameter<bool>("stop_on_terminal", true);
  if (tree_file.empty()) throw std::invalid_argument("tree_file must be set");
  if (arm_id != "l" && arm_id != "m" && arm_id != "r") throw std::invalid_argument("arm_id must be l, m, or r");
  if (!std::isfinite(tick_rate_hz_) || tick_rate_hz_ <= 0.0) throw std::invalid_argument("tick_rate_hz must be positive");

  blackboard_->set<std::string>("arm_id", arm_id);
  blackboard_->set<bool>("dry_run", dry_run);
  blackboard_->set<rclcpp::Node*>(kRosNodeBlackboardKey, this);
  factory_.registerNodeType<bt_nodes::SequenceNode>("Sequence");
  factory_.registerNodeType<MoveJNode>("MoveJ");
  bt_core::XmlParser parser(factory_);
  auto tree = parser.loadFromFile(tree_file, blackboard_);
  tree_ = std::make_unique<bt_core::Tree>(std::move(tree));
  status_pub_ = create_publisher<std_msgs::msg::String>("~/bt_status", 10);
  start_service_ = create_service<Trigger>(
      "~/start",
      [this](std::shared_ptr<Trigger::Request> request,
             std::shared_ptr<Trigger::Response> response) {
        handleStart(request, response);
      });
  stop_service_ = create_service<Trigger>(
      "~/stop",
      [this](std::shared_ptr<Trigger::Request> request,
             std::shared_ptr<Trigger::Response> response) {
        handleStop(request, response);
      });
  RCLCPP_INFO(get_logger(), "loaded behavior tree %s for arm %s (dry_run=%s)", tree_file.c_str(), arm_id.c_str(), dry_run ? "true" : "false");
  if (autostart_) start();
}

RealmanBtExecutorNode::~RealmanBtExecutorNode() { stop(); }

void RealmanBtExecutorNode::start() {
  if (timer_) return;
  const auto period = std::chrono::duration_cast<std::chrono::nanoseconds>(std::chrono::duration<double>(1.0 / tick_rate_hz_));
  timer_ = create_wall_timer(period, [this]() { onTick(); });
  RCLCPP_INFO(get_logger(), "behavior tree ticking at %.2f Hz", tick_rate_hz_);
}

void RealmanBtExecutorNode::stop() {
  if (timer_) {
    timer_->cancel();
    timer_.reset();
  }
  if (tree_) tree_->halt();
}

void RealmanBtExecutorNode::onTick() {
  if (!tree_) return;
  bt_core::NodeStatus status = bt_core::NodeStatus::FAILURE;
  try {
    status = tree_->tickOnce();
  } catch (const std::exception& error) {
    RCLCPP_ERROR(get_logger(), "behavior tree tick failed: %s", error.what());
    tree_->halt();
  }
  std_msgs::msg::String message;
  message.data = bt_core::toStr(status);
  status_pub_->publish(message);
  if (stop_on_terminal_ && bt_core::isStatusCompleted(status)) {
    RCLCPP_INFO(get_logger(), "behavior tree reached %s", message.data.c_str());
    stop();
  }
}

void RealmanBtExecutorNode::handleStart(const std::shared_ptr<Trigger::Request>, std::shared_ptr<Trigger::Response> response) {
  const bool running = static_cast<bool>(timer_);
  start();
  response->success = true;
  response->message = running ? "already running" : "started";
}

void RealmanBtExecutorNode::handleStop(const std::shared_ptr<Trigger::Request>, std::shared_ptr<Trigger::Response> response) {
  const bool running = static_cast<bool>(timer_);
  stop();
  response->success = true;
  response->message = running ? "stopped" : "already stopped";
}

}  // namespace realman_bt
