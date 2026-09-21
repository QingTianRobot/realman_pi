#include <array>
#include <cassert>
#include <chrono>
#include <condition_variable>
#include <memory>
#include <mutex>
#include <string>
#include <thread>
#include <vector>

#include "geometry_msgs/msg/twist_stamped.hpp"
#include "realman_bt/cartesian_velocity_for_duration_node.hpp"
#include "realman_bt/runtime_snapshot.hpp"
#include "rclcpp/rclcpp.hpp"
#include "rclcpp_action/rclcpp_action.hpp"

namespace {

using Node = realman_bt::CartesianVelocityForDurationNode;
using Action = Node::Action;
using ServerGoalHandle = rclcpp_action::ServerGoalHandle<Action>;

bt_core::NodeConfig config(rclcpp::Node* ros_node,
                           realman_bt::CoordinateReferenceRegistry* references,
                           realman_bt::CartesianVelocityProfileRegistry* profiles,
                           realman_bt::RuntimeDiagnostics* diagnostics,
                           bool dry_run, double duration_sec,
                           const std::string& arm_id = "l") {
  bt_core::NodeConfig result;
  result.blackboard = bt_core::Blackboard::create();
  result.blackboard->set<rclcpp::Node*>(realman_bt::kRosNodeBlackboardKey,
                                       ros_node);
  result.blackboard->set<realman_bt::CoordinateReferenceRegistry*>(
      realman_bt::kCoordinateReferenceRegistryBlackboardKey, references);
  result.blackboard->set<realman_bt::CartesianVelocityProfileRegistry*>(
      realman_bt::kCartesianVelocityProfileRegistryBlackboardKey, profiles);
  result.blackboard->set<realman_bt::RuntimeDiagnostics*>(
      realman_bt::kRuntimeDiagnosticsBlackboardKey, diagnostics);
  result.port_values = {
      {"arm_id", arm_id},
      {"dry_run", dry_run ? "true" : "false"},
      {"reference", "default_tool"},
      {"linear_velocity_mps", "0.02,0,0"},
      {"angular_velocity_radps", "0,0,0"},
      {"duration_sec", std::to_string(duration_sec)},
  };
  return result;
}

template <class Predicate>
bt_core::NodeStatus tickUntil(Node& node, Predicate predicate,
                              std::chrono::milliseconds timeout) {
  const auto deadline = std::chrono::steady_clock::now() + timeout;
  bt_core::NodeStatus status = bt_core::NodeStatus::IDLE;
  while (std::chrono::steady_clock::now() < deadline) {
    status = node.executeTick();
    if (predicate(status)) return status;
    std::this_thread::sleep_for(std::chrono::milliseconds(5));
  }
  return status;
}

}  // namespace

int main(int argc, char** argv) {
  rclcpp::init(argc, argv);
  auto ros_node = std::make_shared<rclcpp::Node>("cartesian_velocity_bt_test");

  realman_bt::CoordinateReferenceRegistry references({
      "l|base|0|base|l/base_link",
      "l|default_tool|2|tcpgrip|l/tool/tcpgrip",
  });
  realman_bt::CartesianVelocityProfileRegistry profiles({
      "l|20|100|0.1|0.5|0.2|1.0|10|2",
  });

  realman_bt::RuntimeDiagnostics dry_diagnostics;
  Node dry_node("dry_velocity", config(ros_node.get(), &references, &profiles,
                                        &dry_diagnostics, true, 0.5));
  assert(dry_node.executeTick() == bt_core::NodeStatus::SUCCESS);
  const auto dry_events = dry_diagnostics.snapshot().events;
  assert(dry_events.size() == 1);
  assert(dry_events.front().interface_name == "/l/cartesian_velocity");
  assert(dry_events.front().phase == "result");

  realman_bt::RuntimeDiagnostics invalid_diagnostics;
  auto invalid = config(ros_node.get(), &references, &profiles,
                        &invalid_diagnostics, true, 0.5);
  invalid.port_values["reference"] = "tool/missing";
  Node invalid_node("invalid_reference", invalid);
  assert(invalid_node.executeTick() == bt_core::NodeStatus::FAILURE);
  assert(invalid_node.failureReason().find("unknown coordinate reference") !=
         std::string::npos);

  struct State {
    std::mutex mutex;
    std::condition_variable changed;
    int goals{0};
    int cancels{0};
    Action::Goal goal{};
    std::vector<geometry_msgs::msg::TwistStamped> commands;
  } state;

  auto server = rclcpp_action::create_server<Action>(
      ros_node, "/l/cartesian_velocity",
      [](const rclcpp_action::GoalUUID&, std::shared_ptr<const Action::Goal>) {
        return rclcpp_action::GoalResponse::ACCEPT_AND_EXECUTE;
      },
      [&state](const std::shared_ptr<ServerGoalHandle>) {
        std::lock_guard<std::mutex> lock(state.mutex);
        ++state.cancels;
        state.changed.notify_all();
        return rclcpp_action::CancelResponse::ACCEPT;
      },
      [&state](const std::shared_ptr<ServerGoalHandle> goal_handle) {
        {
          std::lock_guard<std::mutex> lock(state.mutex);
          state.goal = *goal_handle->get_goal();
          ++state.goals;
          state.changed.notify_all();
        }
        std::thread([goal_handle]() {
          while (!goal_handle->is_canceling()) {
            std::this_thread::sleep_for(std::chrono::milliseconds(2));
          }
          auto result = std::make_shared<Action::Result>();
          result->success = false;
          result->terminal_state = Action::Result::CANCELED;
          result->message = "velocity session canceled";
          goal_handle->canceled(result);
        }).detach();
      });
  auto subscription = ros_node->create_subscription<geometry_msgs::msg::TwistStamped>(
      "/l/cartesian_velocity/command", rclcpp::QoS(20),
      [&state](geometry_msgs::msg::TwistStamped::SharedPtr command) {
        std::lock_guard<std::mutex> lock(state.mutex);
        state.commands.push_back(*command);
        state.changed.notify_all();
      });

  rclcpp::executors::MultiThreadedExecutor executor;
  executor.add_node(ros_node);
  std::thread spin_thread([&executor]() { executor.spin(); });

  realman_bt::RuntimeDiagnostics live_diagnostics;
  Node live_node("live_velocity", config(ros_node.get(), &references, &profiles,
                                          &live_diagnostics, false, 0.15));
  const auto terminal = tickUntil(
      live_node,
      [](bt_core::NodeStatus status) {
        return status == bt_core::NodeStatus::SUCCESS ||
               status == bt_core::NodeStatus::FAILURE;
      },
      std::chrono::seconds(5));
  assert(terminal == bt_core::NodeStatus::SUCCESS);

  {
    std::lock_guard<std::mutex> lock(state.mutex);
    assert(state.goals == 1);
    assert(state.cancels == 1);
    assert(state.goal.reference_type == Action::Goal::TOOL);
    assert(state.goal.reference_name == "tcpgrip");
    assert(state.goal.control_period_ms == 20);
    assert(state.goal.watchdog_ms == 100);
    assert(state.commands.size() >= 4);
    bool saw_positive_x = false;
    for (const auto& command : state.commands) {
      assert(command.header.frame_id == "l/tool/tcpgrip");
      if (command.twist.linear.x == 0.02) saw_positive_x = true;
    }
    assert(saw_positive_x);
    const auto& final = state.commands.back().twist;
    assert(final.linear.x == 0.0 && final.linear.y == 0.0 &&
           final.linear.z == 0.0 && final.angular.x == 0.0 &&
           final.angular.y == 0.0 && final.angular.z == 0.0);
  }

  realman_bt::RuntimeDiagnostics halt_diagnostics;
  auto halt_config = config(ros_node.get(), &references, &profiles,
                            &halt_diagnostics, false, 5.0);
  std::shared_ptr<realman_bt::CartesianVelocityCancellationDrain> halt_drain;
  halt_config.blackboard->set<realman_bt::CartesianVelocityCancellationDrainSink>(
      realman_bt::kCartesianVelocityCancellationDrainSinkBlackboardKey,
      [&halt_drain](
          std::shared_ptr<realman_bt::CartesianVelocityCancellationDrain> drain) {
        halt_drain = std::move(drain);
      });
  Node halted_node("halted_velocity", std::move(halt_config));
  const auto running = tickUntil(
      halted_node,
      [&state](bt_core::NodeStatus status) {
        std::lock_guard<std::mutex> lock(state.mutex);
        return status == bt_core::NodeStatus::RUNNING && state.goals == 2 &&
               !state.commands.empty() &&
               state.commands.back().twist.linear.x == 0.02;
      },
      std::chrono::seconds(5));
  assert(running == bt_core::NodeStatus::RUNNING);
  halted_node.halt();
  assert(halt_drain);
  {
    std::unique_lock<std::mutex> lock(state.mutex);
    assert(state.changed.wait_for(lock, std::chrono::seconds(1), [&state]() {
      if (state.commands.empty()) return false;
      const auto& final = state.commands.back().twist;
      return final.linear.x == 0.0 && final.linear.y == 0.0 &&
             final.linear.z == 0.0 && final.angular.x == 0.0 &&
             final.angular.y == 0.0 && final.angular.z == 0.0;
    }));
  }
  assert(halt_drain->drainOnce());
  {
    std::unique_lock<std::mutex> lock(state.mutex);
    assert(state.changed.wait_for(lock, std::chrono::seconds(1), [&state]() {
      return state.cancels == 2;
    }));
  }

  struct DelayedState {
    std::mutex mutex;
    std::condition_variable changed;
    int cancels{0};
    std::vector<geometry_msgs::msg::TwistStamped> commands;
  } delayed;
  auto delayed_server = rclcpp_action::create_server<Action>(
      ros_node, "/r/cartesian_velocity",
      [](const rclcpp_action::GoalUUID&, std::shared_ptr<const Action::Goal>) {
        std::this_thread::sleep_for(std::chrono::milliseconds(120));
        return rclcpp_action::GoalResponse::ACCEPT_AND_EXECUTE;
      },
      [&delayed](const std::shared_ptr<ServerGoalHandle>) {
        std::lock_guard<std::mutex> lock(delayed.mutex);
        ++delayed.cancels;
        delayed.changed.notify_all();
        return rclcpp_action::CancelResponse::ACCEPT;
      },
      [](const std::shared_ptr<ServerGoalHandle> goal_handle) {
        std::thread([goal_handle]() {
          while (!goal_handle->is_canceling()) {
            std::this_thread::sleep_for(std::chrono::milliseconds(2));
          }
          auto result = std::make_shared<Action::Result>();
          result->success = false;
          result->terminal_state = Action::Result::CANCELED;
          result->message = "delayed velocity session canceled";
          goal_handle->canceled(result);
        }).detach();
      });
  auto delayed_subscription =
      ros_node->create_subscription<geometry_msgs::msg::TwistStamped>(
          "/r/cartesian_velocity/command", rclcpp::QoS(20),
          [&delayed](geometry_msgs::msg::TwistStamped::SharedPtr command) {
            std::lock_guard<std::mutex> lock(delayed.mutex);
            delayed.commands.push_back(*command);
            delayed.changed.notify_all();
          });
  realman_bt::CoordinateReferenceRegistry delayed_references({
      "r|default_tool|2|tcpgrip|r/tool/tcpgrip",
  });
  realman_bt::CartesianVelocityProfileRegistry delayed_profiles({
      "r|20|100|0.1|0.5|0.2|1.0|0.03|2",
  });
  realman_bt::RuntimeDiagnostics delayed_diagnostics;
  Node delayed_node(
      "delayed_velocity",
      config(ros_node.get(), &delayed_references, &delayed_profiles,
             &delayed_diagnostics, false, 1.0, "r"));
  const auto delayed_terminal = tickUntil(
      delayed_node,
      [](bt_core::NodeStatus status) {
        return status == bt_core::NodeStatus::SUCCESS ||
               status == bt_core::NodeStatus::FAILURE;
      },
      std::chrono::seconds(5));
  assert(delayed_terminal == bt_core::NodeStatus::FAILURE);
  assert(delayed_node.failureReason().find("goal response timed out") !=
         std::string::npos);
  {
    std::lock_guard<std::mutex> lock(delayed.mutex);
    assert(delayed.cancels == 1);
    assert(delayed.commands.empty());
  }

  executor.cancel();
  spin_thread.join();
  rclcpp::shutdown();
  return 0;
}
