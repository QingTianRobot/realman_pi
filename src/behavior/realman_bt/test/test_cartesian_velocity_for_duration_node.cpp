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
#include "realman_msgs/srv/get_current_pose.hpp"
#include "rclcpp/rclcpp.hpp"
#include "rclcpp_action/rclcpp_action.hpp"

namespace {

using Node = realman_bt::CartesianVelocityForDurationNode;
using Action = Node::Action;
using ServerGoalHandle = rclcpp_action::ServerGoalHandle<Action>;
using GetCurrentPose = realman_msgs::srv::GetCurrentPose;

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
    int pose_reads{0};
    bool report_motion{true};
  } state;

  auto pose_service = ros_node->create_service<GetCurrentPose>(
      "/l/get_current_pose",
      [&state](const std::shared_ptr<GetCurrentPose::Request> request,
               std::shared_ptr<GetCurrentPose::Response> response) {
        std::lock_guard<std::mutex> lock(state.mutex);
        assert(request->reference_type == GetCurrentPose::Request::TOOL);
        assert(request->reference_name == "tcpgrip");
        ++state.pose_reads;
        response->success = true;
        response->api2_status = 0;
        response->current_joint_degrees = {10.0, 20.0, 30.0, 40.0, 50.0,
                                           state.report_motion && state.pose_reads > 1
                                               ? 60.5
                                               : 60.0};
        response->pose_position_m = {
            state.report_motion && state.pose_reads > 1 ? 0.012 : 0.0,
            0.0,
            0.4};
        response->pose_quaternion_wxyz = {1.0, 0.0, 0.0, 0.0};
        response->message = "current pose read";
      });

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
    assert(state.pose_reads == 2);
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


  {
    std::lock_guard<std::mutex> lock(state.mutex);
    state.report_motion = false;
    state.pose_reads = 0;
  }
  realman_bt::RuntimeDiagnostics no_motion_diagnostics;
  Node no_motion_node(
      "no_motion_velocity",
      config(ros_node.get(), &references, &profiles, &no_motion_diagnostics,
             false, 0.15));
  const auto no_motion_terminal = tickUntil(
      no_motion_node,
      [](bt_core::NodeStatus status) {
        return status == bt_core::NodeStatus::SUCCESS ||
               status == bt_core::NodeStatus::FAILURE;
      },
      std::chrono::seconds(5));
  assert(no_motion_terminal == bt_core::NodeStatus::FAILURE);
  assert(no_motion_node.failureReason().find("no observable robot motion") !=
         std::string::npos);
  {
    std::lock_guard<std::mutex> lock(state.mutex);
    assert(state.pose_reads == 2);
  }
  const auto no_motion_events = no_motion_diagnostics.snapshot().events;
  assert(!no_motion_events.empty());
  assert(no_motion_events.back().detail.find("translation_m=") !=
         std::string::npos);

  struct WatchdogState {
    std::mutex mutex;
    std::condition_variable changed;
    int goals{0};
    int cancels{0};
    int pose_reads{0};
    std::vector<std::chrono::steady_clock::time_point> command_times;
    std::vector<bool> zero_commands;
  } watchdog;
  auto watchdog_pose_service = ros_node->create_service<GetCurrentPose>(
      "/m/get_current_pose",
      [&watchdog](const std::shared_ptr<GetCurrentPose::Request> request,
                  std::shared_ptr<GetCurrentPose::Response> response) {
        std::lock_guard<std::mutex> lock(watchdog.mutex);
        assert(request->reference_type == GetCurrentPose::Request::TOOL);
        assert(request->reference_name == "tcpgrip");
        ++watchdog.pose_reads;
        response->success = true;
        response->api2_status = 0;
        response->current_joint_degrees = {
            0.0, 0.0, 0.0, 0.0, 0.0,
            watchdog.pose_reads > 1 ? 0.5 : 0.0};
        response->pose_position_m = {
            watchdog.pose_reads > 1 ? 0.01 : 0.0, 0.0, 0.4};
        response->pose_quaternion_wxyz = {1.0, 0.0, 0.0, 0.0};
        response->message = "current pose read";
      });
  auto watchdog_server = rclcpp_action::create_server<Action>(
      ros_node, "/m/cartesian_velocity",
      [](const rclcpp_action::GoalUUID&, std::shared_ptr<const Action::Goal>) {
        return rclcpp_action::GoalResponse::ACCEPT_AND_EXECUTE;
      },
      [&watchdog](const std::shared_ptr<ServerGoalHandle>) {
        std::lock_guard<std::mutex> lock(watchdog.mutex);
        ++watchdog.cancels;
        watchdog.changed.notify_all();
        return rclcpp_action::CancelResponse::ACCEPT;
      },
      [&watchdog](const std::shared_ptr<ServerGoalHandle> goal_handle) {
        int goal_number;
        {
          std::lock_guard<std::mutex> lock(watchdog.mutex);
          goal_number = ++watchdog.goals;
          watchdog.changed.notify_all();
        }
        std::thread([&watchdog, goal_handle, goal_number]() {
          const auto watchdog_limit = std::chrono::milliseconds(100);
          const auto cancel_delay = goal_number == 1
                                        ? std::chrono::milliseconds(180)
                                        : std::chrono::milliseconds(500);
          std::chrono::steady_clock::time_point cancel_seen_at{};
          while (true) {
            std::chrono::steady_clock::time_point last_command{};
            {
              std::unique_lock<std::mutex> lock(watchdog.mutex);
              watchdog.changed.wait_for(lock, std::chrono::milliseconds(5));
              if (!watchdog.command_times.empty()) {
                last_command = watchdog.command_times.back();
              }
            }
            const auto now = std::chrono::steady_clock::now();
            if (goal_handle->is_canceling() &&
                cancel_seen_at.time_since_epoch().count() == 0) {
              cancel_seen_at = now;
            }
            if (last_command.time_since_epoch().count() != 0 &&
                now - last_command > watchdog_limit) {
              auto result = std::make_shared<Action::Result>();
              result->success = false;
              result->terminal_state = Action::Result::WATCHDOG_STOP;
              result->message = "velocity command watchdog expired";
              goal_handle->abort(result);
              return;
            }
            if (cancel_seen_at.time_since_epoch().count() != 0 &&
                now - cancel_seen_at >= cancel_delay) {
              auto result = std::make_shared<Action::Result>();
              result->success = false;
              result->terminal_state = Action::Result::CANCELED;
              result->message = "velocity session canceled";
              goal_handle->canceled(result);
              return;
            }
          }
        }).detach();
      });
  auto watchdog_subscription =
      ros_node->create_subscription<geometry_msgs::msg::TwistStamped>(
          "/m/cartesian_velocity/command", rclcpp::QoS(20),
          [&watchdog](geometry_msgs::msg::TwistStamped::SharedPtr command) {
            const auto& twist = command->twist;
            const bool zero =
                twist.linear.x == 0.0 && twist.linear.y == 0.0 &&
                twist.linear.z == 0.0 && twist.angular.x == 0.0 &&
                twist.angular.y == 0.0 && twist.angular.z == 0.0;
            std::lock_guard<std::mutex> lock(watchdog.mutex);
            watchdog.command_times.push_back(std::chrono::steady_clock::now());
            watchdog.zero_commands.push_back(zero);
            watchdog.changed.notify_all();
          });
  realman_bt::CoordinateReferenceRegistry watchdog_references({
      "m|default_tool|2|tcpgrip|m/tool/tcpgrip",
  });
  realman_bt::CartesianVelocityProfileRegistry watchdog_profiles({
      "m|20|100|0.1|0.5|0.2|1.0|1|0.4",
  });
  realman_bt::RuntimeDiagnostics watchdog_diagnostics;
  Node watchdog_node(
      "watchdog_velocity",
      config(ros_node.get(), &watchdog_references, &watchdog_profiles,
             &watchdog_diagnostics, false, 0.12, "m"));
  const auto watchdog_terminal = tickUntil(
      watchdog_node,
      [](bt_core::NodeStatus status) {
        return status == bt_core::NodeStatus::SUCCESS ||
               status == bt_core::NodeStatus::FAILURE;
      },
      std::chrono::seconds(5));
  assert(watchdog_terminal == bt_core::NodeStatus::SUCCESS);
  std::size_t terminal_command_count;
  {
    std::lock_guard<std::mutex> lock(watchdog.mutex);
    assert(watchdog.goals == 1);
    assert(watchdog.cancels == 1);
    assert(watchdog.pose_reads == 2);
    assert(watchdog.command_times.size() == watchdog.zero_commands.size());
    std::vector<std::chrono::steady_clock::time_point> zero_times;
    for (std::size_t index = 0; index < watchdog.zero_commands.size(); ++index) {
      if (watchdog.zero_commands[index]) {
        zero_times.push_back(watchdog.command_times[index]);
      }
    }
    assert(zero_times.size() >= 4);
    for (std::size_t index = 1; index < zero_times.size(); ++index) {
      assert(zero_times[index] - zero_times[index - 1] <
             std::chrono::milliseconds(100));
    }
    assert(zero_times.back() - zero_times.front() >=
           std::chrono::milliseconds(100));
    terminal_command_count = watchdog.command_times.size();
  }
  std::this_thread::sleep_for(std::chrono::milliseconds(120));
  {
    std::lock_guard<std::mutex> lock(watchdog.mutex);
    assert(watchdog.command_times.size() == terminal_command_count);
    watchdog.pose_reads = 0;
    watchdog.command_times.clear();
    watchdog.zero_commands.clear();
  }

  realman_bt::CartesianVelocityProfileRegistry stop_timeout_profiles({
      "m|20|100|0.1|0.5|0.2|1.0|1|0.12",
  });
  realman_bt::RuntimeDiagnostics stop_timeout_diagnostics;
  Node stop_timeout_node(
      "stop_timeout_velocity",
      config(ros_node.get(), &watchdog_references, &stop_timeout_profiles,
             &stop_timeout_diagnostics, false, 0.05, "m"));
  const auto stop_timeout_terminal = tickUntil(
      stop_timeout_node,
      [](bt_core::NodeStatus status) {
        return status == bt_core::NodeStatus::SUCCESS ||
               status == bt_core::NodeStatus::FAILURE;
      },
      std::chrono::seconds(5));
  assert(stop_timeout_terminal == bt_core::NodeStatus::FAILURE);
  assert(stop_timeout_node.failureReason().find(
             "did not stop before timeout") != std::string::npos);
  std::size_t timeout_command_count;
  {
    std::lock_guard<std::mutex> lock(watchdog.mutex);
    assert(watchdog.goals == 2);
    assert(watchdog.cancels == 2);
    timeout_command_count = watchdog.command_times.size();
  }
  std::this_thread::sleep_for(std::chrono::milliseconds(120));
  {
    std::lock_guard<std::mutex> lock(watchdog.mutex);
    assert(watchdog.command_times.size() == timeout_command_count);
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

  realman_bt::CartesianVelocityProfileRegistry short_profiles({
      "l|20|100|0.1|0.5|0.2|1.0|0.2|2",
  });
  {
    std::lock_guard<std::mutex> lock(state.mutex);
    state.pose_reads = 0;
  }
  realman_bt::RuntimeDiagnostics missing_final_pose_diagnostics;
  Node missing_final_pose_node(
      "missing_final_pose_velocity",
      config(ros_node.get(), &references, &short_profiles,
             &missing_final_pose_diagnostics, false, 0.05));
  const auto missing_pose_deadline =
      std::chrono::steady_clock::now() + std::chrono::seconds(2);
  bt_core::NodeStatus missing_final_pose_status = bt_core::NodeStatus::IDLE;
  bool removed_pose_service = false;
  while (std::chrono::steady_clock::now() < missing_pose_deadline) {
    missing_final_pose_status = missing_final_pose_node.executeTick();
    {
      std::lock_guard<std::mutex> lock(state.mutex);
      if (!removed_pose_service && state.pose_reads == 1) {
        pose_service.reset();
        removed_pose_service = true;
      }
    }
    if (missing_final_pose_status == bt_core::NodeStatus::SUCCESS ||
        missing_final_pose_status == bt_core::NodeStatus::FAILURE) {
      break;
    }
    std::this_thread::sleep_for(std::chrono::milliseconds(5));
  }
  assert(removed_pose_service);
  assert(missing_final_pose_status == bt_core::NodeStatus::FAILURE);
  assert(missing_final_pose_node.failureReason().find(
             "final current-pose request timed out") != std::string::npos);

  struct DelayedState {
    std::mutex mutex;
    std::condition_variable changed;
    int cancels{0};
    std::vector<geometry_msgs::msg::TwistStamped> commands;
  } delayed;
  auto delayed_pose_service = ros_node->create_service<GetCurrentPose>(
      "/r/get_current_pose",
      [](const std::shared_ptr<GetCurrentPose::Request> request,
         std::shared_ptr<GetCurrentPose::Response> response) {
        assert(request->reference_type == GetCurrentPose::Request::TOOL);
        assert(request->reference_name == "tcpgrip");
        response->success = true;
        response->api2_status = 0;
        response->current_joint_degrees = {0.0, 0.0, 0.0, 0.0, 0.0, 0.0};
        response->pose_position_m = {0.0, 0.0, 0.4};
        response->pose_quaternion_wxyz = {1.0, 0.0, 0.0, 0.0};
        response->message = "current pose read";
      });
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
