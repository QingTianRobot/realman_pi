#include <cassert>
#include <array>
#include <chrono>
#include <condition_variable>
#include <mutex>
#include <set>
#include <string>
#include <thread>
#include <vector>

#include "realman_bt/move_j_node.hpp"
#include "realman_bt/runtime_snapshot.hpp"
#include "realman_bt/three_arm_move_j_node.hpp"
#include "rclcpp/rclcpp.hpp"
#include "rclcpp_action/rclcpp_action.hpp"

namespace {

bt_core::NodeConfig validConfig(rclcpp::Node* ros_node,
                                realman_bt::RuntimeDiagnostics* diagnostics,
                                bool dry_run = true) {
  bt_core::NodeConfig config;
  config.blackboard = bt_core::Blackboard::create();
  config.blackboard->set<rclcpp::Node*>(realman_bt::kRosNodeBlackboardKey,
                                        ros_node);
  config.blackboard->set<realman_bt::RuntimeDiagnostics*>(
      realman_bt::kRuntimeDiagnosticsBlackboardKey, diagnostics);
  config.port_values = {
      {"dry_run", dry_run ? "true" : "false"},
      {"l_joint_degrees", "24,20,66,24,84,14.5"},
      {"m_joint_degrees", "0,18,70,0,90,9"},
      {"r_joint_degrees", "15,22,65,23,82,-7.5"},
      {"velocity_percent", "10"},
      {"blend_radius_percent", "0"},
      {"timeout_sec", "120"},
  };
  return config;
}

struct ServerState {
  std::mutex mutex;
  std::condition_variable changed;
  int received{0};
  int completed{0};
  bool release_r{false};
  bool fail_m{false};
  std::array<std::array<double, 6>, 3> goals{};
};

using Action = realman_bt::ThreeArmMoveJNode::Action;
using ServerGoalHandle = rclcpp_action::ServerGoalHandle<Action>;

template <class Predicate>
bool tickUntil(realman_bt::ThreeArmMoveJNode& move, Predicate predicate,
               std::chrono::milliseconds timeout) {
  const auto deadline = std::chrono::steady_clock::now() + timeout;
  while (std::chrono::steady_clock::now() < deadline) {
    const auto status = move.executeTick();
    if (status == bt_core::NodeStatus::FAILURE) return false;
    if (predicate(status)) return true;
    std::this_thread::sleep_for(std::chrono::milliseconds(5));
  }
  return false;
}

}  // namespace

int main(int argc, char** argv) {
  rclcpp::init(argc, argv);
  auto ros_node = std::make_shared<rclcpp::Node>("three_arm_move_j_test");

  realman_bt::RuntimeDiagnostics diagnostics;
  realman_bt::ThreeArmMoveJNode move(
      "three_arm_move", validConfig(ros_node.get(), &diagnostics));
  assert(move.executeTick() == bt_core::NodeStatus::SUCCESS);

  const auto snapshot = diagnostics.snapshot();
  std::set<std::string> completed_interfaces;
  for (const auto& event : snapshot.events) {
    if (event.source == "ACTION" && event.phase == "result") {
      completed_interfaces.insert(event.interface_name);
    }
  }
  assert(completed_interfaces ==
         std::set<std::string>({"/l/execute_motion", "/m/execute_motion",
                                "/r/execute_motion"}));

  realman_bt::RuntimeDiagnostics invalid_diagnostics;
  auto invalid_config = validConfig(ros_node.get(), &invalid_diagnostics);
  invalid_config.port_values["m_joint_degrees"] = "0,18,70";
  realman_bt::ThreeArmMoveJNode invalid_move("invalid_three_arm_move",
                                             invalid_config);
  assert(invalid_move.executeTick() == bt_core::NodeStatus::FAILURE);
  assert(!invalid_move.failureReason().empty());
  assert(invalid_diagnostics.snapshot().events.empty());

  ServerState server_state;
  const std::array<const char*, 3> arm_ids{{"l", "m", "r"}};
  std::array<rclcpp_action::Server<Action>::SharedPtr, 3> servers;
  for (std::size_t index = 0; index < arm_ids.size(); ++index) {
    servers[index] = rclcpp_action::create_server<Action>(
        ros_node, std::string("/") + arm_ids[index] + "/execute_motion",
        [](const rclcpp_action::GoalUUID&,
           std::shared_ptr<const Action::Goal>) {
          return rclcpp_action::GoalResponse::ACCEPT_AND_EXECUTE;
        },
        [](const std::shared_ptr<ServerGoalHandle>) {
          return rclcpp_action::CancelResponse::ACCEPT;
        },
          [&, index](const std::shared_ptr<ServerGoalHandle> goal_handle) {
          std::thread([&, index, goal_handle]() {
            bool should_fail = false;
            {
              std::unique_lock<std::mutex> lock(server_state.mutex);
              server_state.goals[index] = goal_handle->get_goal()->joint_degrees;
              ++server_state.received;
              server_state.changed.notify_all();
              server_state.changed.wait(lock, [&]() {
                return server_state.received == 3;
              });
              should_fail = server_state.fail_m && index == 1;
              if (index == 2) {
                server_state.changed.wait(lock, [&]() {
                  return server_state.release_r;
                });
              }
            }
            auto result = std::make_shared<Action::Result>();
            result->success = !should_fail;
            result->message = result->success ? "test goal complete" : "test goal failed";
            if (result->success) {
              goal_handle->succeed(result);
            } else {
              goal_handle->abort(result);
            }
            {
              std::lock_guard<std::mutex> lock(server_state.mutex);
              ++server_state.completed;
            }
            server_state.changed.notify_all();
          }).detach();
        });
  }

  rclcpp::executors::MultiThreadedExecutor executor;
  executor.add_node(ros_node);
  std::thread spin_thread([&executor]() { executor.spin(); });

  std::vector<std::shared_ptr<realman_bt::MoveJCancellationDrain>> drains;
  realman_bt::RuntimeDiagnostics failure_diagnostics;
  {
    std::lock_guard<std::mutex> lock(server_state.mutex);
    server_state.fail_m = true;
  }
  bt_core::NodeConfig failure_config = validConfig(ros_node.get(), &failure_diagnostics, false);
  failure_config.blackboard->set<realman_bt::MoveJCancellationDrainSink>(
      realman_bt::kMoveJCancellationDrainSinkBlackboardKey,
      [&drains](std::shared_ptr<realman_bt::MoveJCancellationDrain> drain) {
        drains.push_back(std::move(drain));
      });
  realman_bt::ThreeArmMoveJNode failed_move("failed_three_arm_move", failure_config);
  bool failed = false;
  const auto failure_deadline = std::chrono::steady_clock::now() + std::chrono::seconds(5);
  while (std::chrono::steady_clock::now() < failure_deadline) {
    if (failed_move.executeTick() == bt_core::NodeStatus::FAILURE) {
      failed = true;
      break;
    }
    std::this_thread::sleep_for(std::chrono::milliseconds(5));
  }
  assert(failed);
  assert(!failed_move.failureReason().empty());
  assert(drains.size() == 1);
  assert(drains.front()->drainOnce());
  {
    std::lock_guard<std::mutex> lock(server_state.mutex);
    server_state.release_r = true;
  }
  server_state.changed.notify_all();
  const auto drain_deadline = std::chrono::steady_clock::now() + std::chrono::seconds(5);
  while (std::chrono::steady_clock::now() < drain_deadline) {
    {
      std::lock_guard<std::mutex> lock(server_state.mutex);
      if (server_state.completed == 3) break;
    }
    std::this_thread::sleep_for(std::chrono::milliseconds(5));
  }
  {
    std::lock_guard<std::mutex> lock(server_state.mutex);
    assert(server_state.completed == 3);
    server_state.received = 0;
    server_state.completed = 0;
    server_state.release_r = false;
    server_state.fail_m = false;
  }

  realman_bt::RuntimeDiagnostics live_diagnostics;
  realman_bt::ThreeArmMoveJNode live_move(
      "live_three_arm_move",
      validConfig(ros_node.get(), &live_diagnostics, false));
  assert(tickUntil(
      live_move,
      [&server_state](bt_core::NodeStatus) {
        std::lock_guard<std::mutex> lock(server_state.mutex);
        return server_state.completed == 2;
      },
      std::chrono::seconds(5)));

  {
    std::lock_guard<std::mutex> lock(server_state.mutex);
    const std::array<double, 6> expected_l{{24, 20, 66, 24, 84, 14.5}};
    const std::array<double, 6> expected_m{{0, 18, 70, 0, 90, 9}};
    const std::array<double, 6> expected_r{{15, 22, 65, 23, 82, -7.5}};
    assert(server_state.received == 3);
    assert(server_state.completed == 2);
    assert(server_state.goals[0] == expected_l);
    assert(server_state.goals[1] == expected_m);
    assert(server_state.goals[2] == expected_r);
  }
  assert(live_move.executeTick() == bt_core::NodeStatus::RUNNING);

  {
    std::lock_guard<std::mutex> lock(server_state.mutex);
    server_state.release_r = true;
  }
  server_state.changed.notify_all();
  assert(tickUntil(
      live_move,
      [](bt_core::NodeStatus status) {
        return status == bt_core::NodeStatus::SUCCESS;
      },
      std::chrono::seconds(5)));

  executor.cancel();
  spin_thread.join();

  rclcpp::shutdown();
  return 0;
}
