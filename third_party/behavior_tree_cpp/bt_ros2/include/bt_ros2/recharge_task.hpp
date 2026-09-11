/**
 * recharge_task.hpp — 有状态 ROS2 回充动作节点声明
 *
 * @author pony
 * @date 2026-07-12
 * @version v1.0.1
 * @last_modified 2026-07-12
 * @changelog
 *   - v1.0.1 (2026-07-12): 消除回调并发数据竞争与销毁期悬空访问
 *   - v1.0.0 (2026-07-12): 初始实现持久接口、单次发布与跨 tick 状态机
 */
#ifndef BT_ROS2_RECHARGE_TASK_HPP
#define BT_ROS2_RECHARGE_TASK_HPP

#include <atomic>
#include <chrono>
#include <memory>

#include "bt_core/leaf_node.hpp"
#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/bool.hpp"
#include "std_msgs/msg/string.hpp"

namespace bt_ros2 {

/**
 * @brief 发布一次回充命令并跨 tick 等待对接结果的有状态动作。
 * @details 行为树执行器必须串行调用 tick/onHalted；ROS 回调可以并发到达，
 *          但只访问独立的共享原子状态，任务销毁也不会使在途回调悬空。
 */
class RechargeTask final : public bt_core::ActionNode {
 public:
  using bt_core::ActionNode::ActionNode;

  static bt_core::PortsList providedPorts();
  bt_core::NodeStatus tick() override;
  void onHalted() override;

 private:
  // 终态必须保留到 halt，避免父节点重复 tick 时重发命令。
  enum class Phase { IDLE, RUNNING, SUCCEEDED, FAILED };

  void ensureRosInterfaces();

  rclcpp::Publisher<std_msgs::msg::String>::SharedPtr command_pub_;
  rclcpp::Subscription<std_msgs::msg::Bool>::SharedPtr dock_sub_;
  Phase phase_{Phase::IDLE};
  // 回调只捕获这份共享原子状态，避免并发 tick 的数据竞争和销毁期悬空 this。
  std::shared_ptr<std::atomic_bool> docked_state_{
      std::make_shared<std::atomic_bool>(false)};
  int timeout_ms_{30000};
  std::chrono::steady_clock::time_point attempt_started_{};
};

}  // namespace bt_ros2

#endif  // BT_ROS2_RECHARGE_TASK_HPP
