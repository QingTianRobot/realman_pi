#undef NDEBUG
#include <cassert>
#include <array>
#include <atomic>
#include <chrono>
#include <memory>
#include <mutex>
#include <stdexcept>
#include <string>
#include <thread>
#include <vector>

#include "realman_bt/move_j_node.hpp"
#include "realman_bt/rotate_joint_node.hpp"
#include "realman_bt/runtime_snapshot.hpp"
#include "rclcpp/rclcpp.hpp"
#include "rclcpp_action/rclcpp_action.hpp"

namespace {

using Action = realman_bt::MoveJNode::Action;
using ServerGoalHandle = rclcpp_action::ServerGoalHandle<Action>;
using GetCurrentPose = realman_bt::RotateJointNode::GetCurrentPose;

bt_core::NodeConfig config(rclcpp::Node* ros_node,
                           realman_bt::RuntimeDiagnostics* diagnostics,
                           const std::string& direction, bool dry_run) {
  bt_core::NodeConfig result;
  result.blackboard = bt_core::Blackboard::create();
  result.blackboard->set<rclcpp::Node*>(realman_bt::kRosNodeBlackboardKey, ros_node);
  result.blackboard->set<realman_bt::RuntimeDiagnostics*>(
      realman_bt::kRuntimeDiagnosticsBlackboardKey, diagnostics);
  result.port_values = {
      {"arm_id", "r"},
      {"dry_run", dry_run ? "true" : "false"},
      {"joint", "6"},
      {"direction", direction},
      {"angle_degrees", "10"},
      {"velocity_percent", "15"},
      {"timeout_sec", "5"},
  };
  return result;
}

bt_core::NodeStatus tickUntilDone(realman_bt::SingleJointMoveNode& node,
                                  std::chrono::milliseconds timeout) {
  const auto deadline = std::chrono::steady_clock::now() + timeout;
  auto status = bt_core::NodeStatus::RUNNING;
  while (std::chrono::steady_clock::now() < deadline) {
    status = node.executeTick();
    if (status != bt_core::NodeStatus::RUNNING) return status;
    std::this_thread::sleep_for(std::chrono::milliseconds(5));
  }
  return status;
}

struct ServerState {
  std::mutex mutex;
  std::vector<Action::Goal> goals;
  std::atomic<bool> hold{false};
  std::atomic<bool> fail_read{false};
  std::atomic<int> cancels{0};
};

}  // namespace

int main(int argc, char** argv) {
  // Pure target math: ccw adds, cw subtracts, only the chosen joint moves.
  const std::array<double, 6> current{{1, 2, 3, 4, 5, 6}};
  assert((realman_bt::rotateJointTarget(current, 6, false, 10) ==
          std::array<double, 6>{{1, 2, 3, 4, 5, 16}}));
  assert((realman_bt::rotateJointTarget(current, 6, true, 10) ==
          std::array<double, 6>{{1, 2, 3, 4, 5, -4}}));
  assert((realman_bt::rotateJointTarget(current, 1, true, 2.5) ==
          std::array<double, 6>{{-1.5, 2, 3, 4, 5, 6}}));
  for (const int bad_joint : {0, 7}) {
    bool threw = false;
    try {
      (void)realman_bt::rotateJointTarget(current, bad_joint, false, 1);
    } catch (const std::invalid_argument&) {
      threw = true;
    }
    assert(threw);
  }

  rclcpp::init(argc, argv);
  auto ros_node = std::make_shared<rclcpp::Node>("rotate_joint_test");

  // Every invalid port fails before any ROS resource or diagnostic event.
  const std::vector<std::pair<std::string, std::string>> invalid_ports{
      {"arm_id", "x"},          {"joint", "0"},           {"joint", "7"},
      {"direction", "left"},    {"direction", ""},        {"angle_degrees", "0"},
      {"angle_degrees", "-5"},  {"angle_degrees", "181"}, {"angle_degrees", "nan"},
      {"velocity_percent", "0"}, {"velocity_percent", "101"},
      {"timeout_sec", "0"},     {"timeout_sec", "inf"},   {"timeout_sec", "abc"},
      {"joint", "six"},         {"dry_run", "maybe"},
  };
  for (const auto& [port, value] : invalid_ports) {
    realman_bt::RuntimeDiagnostics diagnostics;
    auto bad = config(ros_node.get(), &diagnostics, "ccw", false);
    bad.port_values[port] = value;
    realman_bt::RotateJointNode node("invalid_rotate", bad);
    assert(node.executeTick() == bt_core::NodeStatus::FAILURE);
    assert(!node.failureReason().empty());
    assert(diagnostics.snapshot().events.empty());
  }

  // Dry-run validates and succeeds without reading joints or sending a goal.
  {
    realman_bt::RuntimeDiagnostics diagnostics;
    realman_bt::RotateJointNode node(
        "dry_rotate", config(ros_node.get(), &diagnostics, "cw", true));
    assert(node.executeTick() == bt_core::NodeStatus::SUCCESS);
    const auto events = diagnostics.snapshot().events;
    assert(events.size() == 1);
    assert(events.front().phase == "result");
    assert(events.front().interface_name == "/r/get_current_pose");
  }

  ServerState state;
  auto pose_service = ros_node->create_service<GetCurrentPose>(
      "/r/get_current_pose",
      [&state](const std::shared_ptr<GetCurrentPose::Request> request,
               std::shared_ptr<GetCurrentPose::Response> response) {
        assert(request->reference_type == GetCurrentPose::Request::BASE);
        response->success = !state.fail_read;
        response->message = state.fail_read ? "arm not connected" : "ok";
        response->current_joint_degrees = {10, 20, 30, 40, 50, 60};
      });
  auto server = rclcpp_action::create_server<Action>(
      ros_node, "/r/execute_motion",
      [](const rclcpp_action::GoalUUID&, std::shared_ptr<const Action::Goal>) {
        return rclcpp_action::GoalResponse::ACCEPT_AND_EXECUTE;
      },
      [&state](const std::shared_ptr<ServerGoalHandle>) {
        ++state.cancels;
        return rclcpp_action::CancelResponse::ACCEPT;
      },
      [&state](const std::shared_ptr<ServerGoalHandle> goal_handle) {
        std::thread([&state, goal_handle]() {
          {
            std::lock_guard<std::mutex> lock(state.mutex);
            state.goals.push_back(*goal_handle->get_goal());
          }
          auto result = std::make_shared<Action::Result>();
          while (state.hold) {
            if (goal_handle->is_canceling()) {
              result->message = "canceled";
              goal_handle->canceled(result);
              return;
            }
            std::this_thread::sleep_for(std::chrono::milliseconds(5));
          }
          result->success = true;
          result->message = "test goal complete";
          goal_handle->succeed(result);
        }).detach();
      });

  rclcpp::executors::MultiThreadedExecutor executor;
  executor.add_node(ros_node);
  std::thread spin_thread([&executor]() { executor.spin(); });

  // Live ccw then cw: the goal is a MOVEJ to current joints with only J6 moved.
  for (const auto& [direction, expected_j6] :
       std::vector<std::pair<std::string, double>>{{"ccw", 70.0}, {"cw", 50.0}}) {
    realman_bt::RuntimeDiagnostics diagnostics;
    realman_bt::RotateJointNode node(
        "live_rotate", config(ros_node.get(), &diagnostics, direction, false));
    assert(tickUntilDone(node, std::chrono::seconds(5)) ==
           bt_core::NodeStatus::SUCCESS);
    assert(node.executeTick() == bt_core::NodeStatus::SUCCESS);
    std::lock_guard<std::mutex> lock(state.mutex);
    assert(!state.goals.empty());
    const auto& goal = state.goals.back();
    assert(goal.command == Action::Goal::MOVEJ);
    assert(goal.velocity_percent == 15);
    assert(goal.blend_radius_percent == 0);
    assert((goal.joint_degrees == std::array<double, 6>{{10, 20, 30, 40, 50, expected_j6}}));
    bool saw_target = false;
    for (const auto& event : diagnostics.snapshot().events) {
      if (event.phase == "target") saw_target = true;
    }
    assert(saw_target);
  }

  // MoveJointTo: J1 goes to an absolute angle, the other joints keep their current values.
  {
    realman_bt::RuntimeDiagnostics diagnostics;
    auto to_config = config(ros_node.get(), &diagnostics, "ccw", false);
    to_config.port_values.erase("direction");
    to_config.port_values.erase("angle_degrees");
    to_config.port_values["joint"] = "1";
    to_config.port_values["target_degrees"] = "-135";
    realman_bt::MoveJointToNode node("turn_to_release", to_config);
    assert(tickUntilDone(node, std::chrono::seconds(5)) == bt_core::NodeStatus::SUCCESS);
    std::lock_guard<std::mutex> lock(state.mutex);
    assert((state.goals.back().joint_degrees ==
            std::array<double, 6>{{-135, 20, 30, 40, 50, 60}}));
  }
  for (const auto& bad_target : {"400", "-361", "nan", "far"}) {
    realman_bt::RuntimeDiagnostics diagnostics;
    auto bad = config(ros_node.get(), &diagnostics, "ccw", false);
    bad.port_values["target_degrees"] = bad_target;
    realman_bt::MoveJointToNode node("bad_target", bad);
    assert(node.executeTick() == bt_core::NodeStatus::FAILURE);
    assert(diagnostics.snapshot().events.empty());
  }

  // A failed joint read fails the leaf with the driver's message and sends nothing.
  {
    state.fail_read = true;
    std::size_t goals_before = 0;
    {
      std::lock_guard<std::mutex> lock(state.mutex);
      goals_before = state.goals.size();
    }
    realman_bt::RuntimeDiagnostics diagnostics;
    realman_bt::RotateJointNode node(
        "read_fail_rotate", config(ros_node.get(), &diagnostics, "ccw", false));
    assert(tickUntilDone(node, std::chrono::seconds(5)) ==
           bt_core::NodeStatus::FAILURE);
    assert(node.failureReason().find("arm not connected") != std::string::npos);
    std::lock_guard<std::mutex> lock(state.mutex);
    assert(state.goals.size() == goals_before);
    state.fail_read = false;
  }

  // Halt with an in-flight goal hands it to the executor drain, which cancels it.
  {
    state.hold = true;
    std::vector<std::shared_ptr<realman_bt::MoveJCancellationDrain>> drains;
    realman_bt::RuntimeDiagnostics diagnostics;
    auto halt_config = config(ros_node.get(), &diagnostics, "ccw", false);
    halt_config.blackboard->set<realman_bt::MoveJCancellationDrainSink>(
        realman_bt::kMoveJCancellationDrainSinkBlackboardKey,
        [&drains](std::shared_ptr<realman_bt::MoveJCancellationDrain> drain) {
          drains.push_back(std::move(drain));
        });
    std::size_t goals_before = 0;
    {
      std::lock_guard<std::mutex> lock(state.mutex);
      goals_before = state.goals.size();
    }
    realman_bt::RotateJointNode node("halt_rotate", halt_config);
    const auto deadline = std::chrono::steady_clock::now() + std::chrono::seconds(5);
    bool goal_seen = false;
    while (!goal_seen && std::chrono::steady_clock::now() < deadline) {
      assert(node.executeTick() == bt_core::NodeStatus::RUNNING);
      std::this_thread::sleep_for(std::chrono::milliseconds(5));
      std::lock_guard<std::mutex> lock(state.mutex);
      goal_seen = state.goals.size() > goals_before;
    }
    assert(goal_seen);
    node.halt();
    assert(drains.size() == 1);
    const auto drain_deadline = std::chrono::steady_clock::now() + std::chrono::seconds(5);
    bool drained = false;
    while (!drained && std::chrono::steady_clock::now() < drain_deadline) {
      drained = drains.front()->drainOnce();
      std::this_thread::sleep_for(std::chrono::milliseconds(5));
    }
    assert(drained);
    const auto cancel_deadline = std::chrono::steady_clock::now() + std::chrono::seconds(5);
    while (state.cancels == 0 && std::chrono::steady_clock::now() < cancel_deadline) {
      std::this_thread::sleep_for(std::chrono::milliseconds(5));
    }
    assert(state.cancels == 1);
    state.hold = false;
  }

  executor.cancel();
  spin_thread.join();
  rclcpp::shutdown();
  return 0;
}
