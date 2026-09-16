#include "realman_bt/realman_bt_executor_node.hpp"

#include <chrono>
#include <cmath>
#include <filesystem>
#include <stdexcept>
#include <utility>

#include "bt_core/xml_parser.hpp"
#include "bt_nodes/control/sequence_node.hpp"
#include "realman_bt/move_j_node.hpp"

namespace realman_bt {
namespace {

std::uint64_t timestampMilliseconds() {
  const auto now = std::chrono::system_clock::now();
  const auto milliseconds =
      std::chrono::duration_cast<std::chrono::milliseconds>(now.time_since_epoch());
  return static_cast<std::uint64_t>(milliseconds.count());
}

}  // namespace

RealmanBtExecutorNode::RealmanBtExecutorNode(const rclcpp::NodeOptions& options)
    : rclcpp::Node("realman_bt_executor", options), blackboard_(bt_core::Blackboard::create()) {
  const std::string tree_file = declare_parameter<std::string>("tree_file", "");
  const std::string arm_id = declare_parameter<std::string>("arm_id", "r");
  const bool dry_run = declare_parameter<bool>("dry_run", true);
  const std::string runtime_snapshot_file = declare_parameter<std::string>(
      "runtime_snapshot_file", "/tmp/realman-bt-workspace/runtime.json");
  tick_rate_hz_ = declare_parameter<double>("tick_rate_hz", 20.0);
  autostart_ = declare_parameter<bool>("autostart", true);
  stop_on_terminal_ = declare_parameter<bool>("stop_on_terminal", true);
  if (tree_file.empty()) throw std::invalid_argument("tree_file must be set");
  if (arm_id != "l" && arm_id != "m" && arm_id != "r") throw std::invalid_argument("arm_id must be l, m, or r");
  if (!std::isfinite(tick_rate_hz_) || tick_rate_hz_ <= 0.0) throw std::invalid_argument("tick_rate_hz must be positive");
  if (runtime_snapshot_file.empty()) throw std::invalid_argument("runtime_snapshot_file must be set");

  blackboard_->set<std::string>("arm_id", arm_id);
  blackboard_->set<bool>("dry_run", dry_run);
  blackboard_->set<rclcpp::Node*>(kRosNodeBlackboardKey, this);
  blackboard_->set<RuntimeDiagnostics*>(kRuntimeDiagnosticsBlackboardKey,
                                        &diagnostics_);
  blackboard_->set<MoveJCancellationDrainSink>(
      kMoveJCancellationDrainSinkBlackboardKey,
      [this](std::shared_ptr<MoveJCancellationDrain> drain) {
        enqueueCancellationDrain(std::move(drain));
      });
  factory_.registerNodeType<bt_nodes::SequenceNode>("Sequence");
  factory_.registerNodeType<MoveJNode>("MoveJ");
  bt_core::XmlParser parser(factory_);
  auto tree = parser.loadFromFile(tree_file, blackboard_);
  tree_ = std::make_unique<bt_core::Tree>(std::move(tree));
  tree_id_ = std::filesystem::path(tree_file).stem().string();
  if (tree_id_.empty()) tree_id_ = tree_file;
  snapshot_writer_ = std::make_unique<RuntimeSnapshotWriter>(runtime_snapshot_file);
  try {
    snapshot_writer_->writeIdle(tree_id_, &diagnostics_);
  } catch (const std::exception& error) {
    RCLCPP_ERROR(get_logger(), "failed to write idle behavior tree snapshot: %s", error.what());
  }
  status_pub_ = create_publisher<std_msgs::msg::String>("~/bt_status", 10);
  rosout_sub_ = create_subscription<rcl_interfaces::msg::Log>(
      "/rosout", rclcpp::QoS(100),
      [this](const rcl_interfaces::msg::Log::SharedPtr message) {
        handleRosout(message);
      });
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

RealmanBtExecutorNode::~RealmanBtExecutorNode() {
  stop();
  if (cancellation_drain_timer_) cancellation_drain_timer_->cancel();
  cancellation_drain_timer_.reset();
  if (!cancellation_drains_.empty()) {
    RCLCPP_WARN(get_logger(),
                "releasing %zu pending MoveJ cancellation drain(s) during shutdown",
                cancellation_drains_.size());
  }
  cancellation_drains_.clear();
}

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
  flushSnapshot();
}

void RealmanBtExecutorNode::onTick() {
  if (!tree_) return;
  bt_core::NodeStatus status = bt_core::NodeStatus::FAILURE;
  try {
    status = tree_->tickOnce();
  } catch (const std::exception& error) {
    RCLCPP_ERROR(get_logger(), "behavior tree tick failed: %s", error.what());
    recordEvent("ERROR", "EXECUTOR", "realman_bt_executor", "exception",
                error.what());
    tree_->halt();
  }
  diagnostics_.recordTick(status);
  flushSnapshot();
  std_msgs::msg::String message;
  message.data = bt_core::toStr(status);
  status_pub_->publish(message);
  if (stop_on_terminal_ && bt_core::isStatusCompleted(status)) {
    RCLCPP_INFO(get_logger(), "behavior tree reached %s", message.data.c_str());
    stop();
  }
}

void RealmanBtExecutorNode::handleStart(const std::shared_ptr<Trigger::Request>, std::shared_ptr<Trigger::Response> response) {
  recordEvent("INFO", "SERVICE", "/realman_bt_executor/start", "request", "");
  flushSnapshot();
  const bool running = static_cast<bool>(timer_);
  start();
  response->success = true;
  response->message = running ? "already running" : "started";
  recordEvent("INFO", "SERVICE", "/realman_bt_executor/start", "response",
              response->message);
  flushSnapshot();
}

void RealmanBtExecutorNode::handleStop(const std::shared_ptr<Trigger::Request>, std::shared_ptr<Trigger::Response> response) {
  recordEvent("INFO", "SERVICE", "/realman_bt_executor/stop", "request", "");
  flushSnapshot();
  const bool running = static_cast<bool>(timer_);
  stop();
  response->success = true;
  response->message = running ? "stopped" : "already stopped";
  recordEvent("INFO", "SERVICE", "/realman_bt_executor/stop", "response",
              response->message);
  flushSnapshot();
}

void RealmanBtExecutorNode::flushSnapshot() {
  if (!snapshot_writer_ || !tree_) return;
  ++snapshot_sequence_;
  try {
    snapshot_writer_->write(*tree_, tree_id_, snapshot_sequence_, &diagnostics_);
  } catch (const std::exception& error) {
    RCLCPP_ERROR(get_logger(), "failed to write behavior tree snapshot: %s", error.what());
  }
}

void RealmanBtExecutorNode::enqueueCancellationDrain(
    std::shared_ptr<MoveJCancellationDrain> drain) {
  if (!drain) return;
  cancellation_drains_.push_back(std::move(drain));
  if (cancellation_drain_timer_) return;
  cancellation_drain_timer_ = create_wall_timer(
      std::chrono::milliseconds(50), [this]() { drainCancellationQueue(); });
}

void RealmanBtExecutorNode::drainCancellationQueue() {
  auto remaining = cancellation_drains_.begin();
  for (auto current = cancellation_drains_.begin();
       current != cancellation_drains_.end(); ++current) {
    if (!(*current)->drainOnce()) {
      if (remaining != current) *remaining = std::move(*current);
      ++remaining;
    }
  }
  cancellation_drains_.erase(remaining, cancellation_drains_.end());
  flushSnapshot();
  if (cancellation_drains_.empty() && cancellation_drain_timer_) {
    cancellation_drain_timer_->cancel();
    cancellation_drain_timer_.reset();
  }
}

void RealmanBtExecutorNode::recordEvent(std::string severity, std::string source,
                                        std::string interface_name,
                                        std::string phase, std::string detail) {
  diagnostics_.recordEvent({timestampMilliseconds(), std::move(severity),
                            std::move(source), std::move(interface_name),
                            std::move(phase), std::move(detail)});
}

void RealmanBtExecutorNode::handleRosout(
    const rcl_interfaces::msg::Log::SharedPtr message) {
  if (!message || (message->level != rcl_interfaces::msg::Log::WARN &&
                   message->level != rcl_interfaces::msg::Log::ERROR)) {
    return;
  }
  if (message->name.find("realman_bt_executor") == std::string::npos &&
      message->name.find("rclcpp_action") == std::string::npos) {
    return;
  }
  recordEvent(message->level == rcl_interfaces::msg::Log::ERROR ? "ERROR" : "WARN",
              "ROS_LOG", message->name, "rosout", message->msg);
}

}  // namespace realman_bt
