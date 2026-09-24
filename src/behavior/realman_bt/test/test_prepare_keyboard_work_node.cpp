#include <cassert>
#include <chrono>
#include <memory>
#include <mutex>
#include <string>
#include <thread>
#include <vector>

#include "realman_bt/input_mode.hpp"
#include "realman_bt/input_mode_nodes.hpp"
#include "realman_bt/prepare_keyboard_work_node.hpp"
#include "realman_bt/runtime_snapshot.hpp"
#include "realman_msgs/srv/select_frame.hpp"
#include "rclcpp/rclcpp.hpp"

namespace {

using namespace std::chrono_literals;
using Node = realman_bt::PrepareKeyboardWorkNode;
using SelectFrame = realman_msgs::srv::SelectFrame;

struct CoordinatorFixture {
  CoordinatorFixture()
      : coordinator(registry, 1s, "none", {}) {
    registry.registerMode("web", "Web", false);
    registry.registerMode("keyboard", "Keyboard", true);
    registry.registerMode("none", "None", true);
  }

  realman_bt::InputModeRegistry registry;
  realman_bt::InputModeCoordinator coordinator;
};

bt_core::NodeConfig config(
    realman_bt::CoordinateReferenceRegistry* references,
    realman_bt::InputModeCoordinator* coordinator, bool dry_run,
    rclcpp::Node* ros_node = nullptr,
    realman_bt::RuntimeDiagnostics* diagnostics = nullptr) {
  bt_core::NodeConfig result;
  result.blackboard = bt_core::Blackboard::create();
  result.blackboard->set<realman_bt::CoordinateReferenceRegistry*>(
      realman_bt::kCoordinateReferenceRegistryBlackboardKey, references);
  result.blackboard->set<realman_bt::InputModeCoordinator*>(
      realman_bt::kInputModeCoordinatorBlackboardKey, coordinator);
  if (ros_node != nullptr) {
    result.blackboard->set<rclcpp::Node*>(realman_bt::kRosNodeBlackboardKey,
                                         ros_node);
  }
  if (diagnostics != nullptr) {
    result.blackboard->set<realman_bt::RuntimeDiagnostics*>(
        realman_bt::kRuntimeDiagnosticsBlackboardKey, diagnostics);
  }
  result.port_values = {{"dry_run", dry_run ? "true" : "false"}};
  return result;
}

bt_core::NodeStatus tickUntilTerminal(Node& node,
                                      std::chrono::milliseconds timeout = 2s) {
  const auto deadline = std::chrono::steady_clock::now() + timeout;
  bt_core::NodeStatus status = bt_core::NodeStatus::IDLE;
  while (std::chrono::steady_clock::now() < deadline) {
    status = node.executeTick();
    if (status == bt_core::NodeStatus::SUCCESS ||
        status == bt_core::NodeStatus::FAILURE) {
      return status;
    }
    std::this_thread::sleep_for(2ms);
  }
  return status;
}

}  // namespace

int main(int argc, char** argv) {
  rclcpp::init(argc, argv);

  realman_bt::CoordinateReferenceRegistry references({
      "l|default_work|1|cell|l/work/cell",
      "r|default_work|1|cell|r/work/cell",
  });

  CoordinatorFixture dry_coordinator;
  realman_bt::RuntimeDiagnostics dry_diagnostics;
  Node dry_node("dry_prepare_keyboard_work",
                config(&references, &dry_coordinator.coordinator, true,
                       nullptr, &dry_diagnostics));
  assert(dry_node.executeTick() == bt_core::NodeStatus::SUCCESS);
  const auto dry_events = dry_diagnostics.snapshot().events;
  assert(dry_events.size() == 2);
  assert(dry_events[0].phase == "dry_run");
  assert(dry_events[1].phase == "dry_run");

  realman_bt::CoordinateReferenceRegistry invalid_references({
      "l|default_work|2|tcpgrip|l/tool/tcpgrip",
      "r|default_work|1|cell|r/work/cell",
  });
  CoordinatorFixture invalid_coordinator;
  Node invalid_node(
      "invalid_prepare_keyboard_work",
      config(&invalid_references, &invalid_coordinator.coordinator, true));
  assert(invalid_node.executeTick() == bt_core::NodeStatus::FAILURE);
  assert(invalid_node.failureReason().find("default WORK") != std::string::npos);
  assert(invalid_coordinator.coordinator.snapshot().phase ==
         realman_bt::InputModePhase::kFailed);

  auto ros_node = std::make_shared<rclcpp::Node>("prepare_keyboard_work_test");
  struct ServiceState {
    std::mutex mutex;
    std::vector<std::string> l_requests;
    std::vector<std::string> r_requests;
    bool l_success{true};
    bool r_success{true};
    std::string l_active_name{"cell"};
    std::string r_active_name{"cell"};
  } state;

  auto l_service = ros_node->create_service<SelectFrame>(
      "/l/coordinates/select_work",
      [&state](const SelectFrame::Request::SharedPtr request,
               SelectFrame::Response::SharedPtr response) {
        std::lock_guard<std::mutex> lock(state.mutex);
        state.l_requests.push_back(request->name);
        response->success = state.l_success;
        response->active_name = state.l_active_name;
        response->message = state.l_success ? "selected" : "left selection failed";
      });
  auto r_service = ros_node->create_service<SelectFrame>(
      "/r/coordinates/select_work",
      [&state](const SelectFrame::Request::SharedPtr request,
               SelectFrame::Response::SharedPtr response) {
        std::lock_guard<std::mutex> lock(state.mutex);
        state.r_requests.push_back(request->name);
        response->success = state.r_success;
        response->active_name = state.r_active_name;
        response->message = state.r_success ? "selected" : "right selection failed";
      });

  rclcpp::executors::MultiThreadedExecutor executor;
  executor.add_node(ros_node);
  std::thread spin_thread([&executor] { executor.spin(); });

  CoordinatorFixture success_coordinator;
  realman_bt::RuntimeDiagnostics success_diagnostics;
  Node success_node(
      "prepare_keyboard_work",
      config(&references, &success_coordinator.coordinator, false,
             ros_node.get(), &success_diagnostics));
  assert(tickUntilTerminal(success_node) == bt_core::NodeStatus::SUCCESS);
  {
    std::lock_guard<std::mutex> lock(state.mutex);
    assert(state.l_requests == std::vector<std::string>({"cell"}));
    assert(state.r_requests == std::vector<std::string>({"cell"}));
  }
  assert(success_coordinator.coordinator.snapshot().phase !=
         realman_bt::InputModePhase::kFailed);

  {
    std::lock_guard<std::mutex> lock(state.mutex);
    state.l_success = false;
  }
  CoordinatorFixture failed_response_coordinator;
  Node failed_response_node(
      "failed_prepare_keyboard_work",
      config(&references, &failed_response_coordinator.coordinator, false,
             ros_node.get()));
  assert(tickUntilTerminal(failed_response_node) ==
         bt_core::NodeStatus::FAILURE);
  assert(failed_response_node.failureReason().find("left selection failed") !=
         std::string::npos);
  assert(failed_response_coordinator.coordinator.snapshot().phase ==
         realman_bt::InputModePhase::kFailed);

  {
    std::lock_guard<std::mutex> lock(state.mutex);
    state.l_success = true;
    state.l_active_name = "pikabase";
  }
  CoordinatorFixture mismatch_coordinator;
  Node mismatch_node(
      "mismatch_prepare_keyboard_work",
      config(&references, &mismatch_coordinator.coordinator, false,
             ros_node.get()));
  assert(tickUntilTerminal(mismatch_node) == bt_core::NodeStatus::FAILURE);
  assert(mismatch_node.failureReason().find("expected cell") !=
         std::string::npos);
  assert(mismatch_coordinator.coordinator.snapshot().phase ==
         realman_bt::InputModePhase::kFailed);

  executor.cancel();
  spin_thread.join();
  executor.remove_node(ros_node);
  rclcpp::shutdown();
  return 0;
}
