/**
 * recharge_task.cpp — 有状态 ROS2 回充动作节点实现
 *
 * @author pony
 * @date 2026-07-12
 * @version v1.0.1
 * @last_modified 2026-07-12
 * @changelog
 *   - v1.0.1 (2026-07-12): 强化回调并发、接口创建与发布异常边界
 *   - v1.0.0 (2026-07-12): 初始实现持久接口、单次发布与跨 tick 状态机
 */
#include "bt_ros2/recharge_task.hpp"

#include <cstddef>
#include <stdexcept>
#include <string>
#include <utility>

#include "bt_ros2/ros_blackboard_keys.hpp"
#include "bt_ros2/ros_qos.hpp"

namespace bt_ros2 {

bt_core::PortsList RechargeTask::providedPorts() {
  return bt_core::makePorts(
      bt_core::InputPort<std::string>(
          "command_topic", "/robot/command", "回充命令话题"),
      bt_core::InputPort<std::string>(
          "dock_topic", "/dock/is_docked", "对接状态话题"),
      bt_core::InputPort<std::string>("target", "main_dock", "目标充电桩"),
      bt_core::InputPort<int>(
          "timeout_ms", "30000", "等待超时；<=0 表示不超时"),
      bt_core::InputPort<int>(
          "command_qos_depth", "10", "命令发布队列深度"),
      bt_core::InputPort<int>(
          "dock_qos_depth", "10", "对接订阅队列深度"),
      bt_core::InputPort<std::string>(
          "dock_qos_profile", "default", "对接订阅 QoS",
          {"default", "sensor_data"}));
}

void RechargeTask::ensureRosInterfaces() {
  if (command_pub_ && dock_sub_) {
    return;
  }

  const std::string command_topic =
      getInput<std::string>("command_topic").value_or("/robot/command");
  const std::string dock_topic =
      getInput<std::string>("dock_topic").value_or("/dock/is_docked");
  const int command_depth =
      getInput<int>("command_qos_depth").value_or(10);
  const int dock_depth = getInput<int>("dock_qos_depth").value_or(10);
  const std::string dock_profile =
      getInput<std::string>("dock_qos_profile").value_or("default");

  if (command_topic.empty()) {
    throw std::runtime_error(
        "RechargeTask '" + name() + "': port 'command_topic' is empty");
  }
  if (dock_topic.empty()) {
    throw std::runtime_error(
        "RechargeTask '" + name() + "': port 'dock_topic' is empty");
  }
  if (command_depth <= 0) {
    throw std::runtime_error(
        "RechargeTask '" + name() +
        "': command_qos_depth must be greater than zero, got " +
        std::to_string(command_depth));
  }

  // 先完成全部参数校验，避免配置错误时只创建一半 ROS 接口。
  const rclcpp::QoS dock_qos = makeSubscriptionQos(dock_depth, dock_profile);
  rclcpp::Node* ros_node = getRosNodeHandle(blackboard());
  auto command_pub = ros_node->create_publisher<std_msgs::msg::String>(
      command_topic,
      rclcpp::QoS(rclcpp::KeepLast(static_cast<std::size_t>(command_depth))));
  const auto docked_state = docked_state_;
  auto dock_sub = ros_node->create_subscription<std_msgs::msg::Bool>(
      dock_topic, dock_qos,
      [docked_state](const std_msgs::msg::Bool::SharedPtr msg) {
        docked_state->store(msg->data, std::memory_order_release);
      });

  // 两个端点都创建成功后再提交，异常时不保留半初始化接口。
  command_pub_ = std::move(command_pub);
  dock_sub_ = std::move(dock_sub);
}

bt_core::NodeStatus RechargeTask::tick() {
  if (phase_ == Phase::SUCCEEDED) {
    return bt_core::NodeStatus::SUCCESS;
  }
  if (phase_ == Phase::FAILED) {
    return bt_core::NodeStatus::FAILURE;
  }

  ensureRosInterfaces();

  if (phase_ == Phase::IDLE) {
    docked_state_->store(false, std::memory_order_release);
    timeout_ms_ = getInput<int>("timeout_ms").value_or(30000);
    attempt_started_ = std::chrono::steady_clock::now();

    std_msgs::msg::String command;
    command.data =
        "start_recharge:" +
        getInput<std::string>("target").value_or("main_dock");
    try {
      command_pub_->publish(command);
      phase_ = Phase::RUNNING;
    } catch (...) {
      // 发布是否已触达中间件不可判定，锁定失败可避免无 halt 重试造成重复命令。
      phase_ = Phase::FAILED;
      throw;
    }
    return bt_core::NodeStatus::RUNNING;
  }

  if (docked_state_->load(std::memory_order_acquire)) {
    phase_ = Phase::SUCCEEDED;
    return bt_core::NodeStatus::SUCCESS;
  }

  if (timeout_ms_ > 0 &&
      std::chrono::steady_clock::now() - attempt_started_ >=
          std::chrono::milliseconds(timeout_ms_)) {
    phase_ = Phase::FAILED;
    return bt_core::NodeStatus::FAILURE;
  }

  return bt_core::NodeStatus::RUNNING;
}

void RechargeTask::onHalted() {
  // ROS 接口跨尝试复用；只清理本次状态与可能滞留的对接信号。
  phase_ = Phase::IDLE;
  docked_state_->store(false, std::memory_order_release);
  attempt_started_ = {};
}

}  // namespace bt_ros2
