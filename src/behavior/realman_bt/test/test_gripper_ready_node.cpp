// A Release build defines NDEBUG, which would turn every assert below into a no-op.
#ifdef NDEBUG
#undef NDEBUG
#endif

#include <cassert>
#include <chrono>
#include <functional>
#include <memory>
#include <string>
#include <thread>

#include "rclcpp/rclcpp.hpp"
#include "realman_bt/gripper_ready_node.hpp"
#include "realman_bt/policy_task_blackboard.hpp"
#include "realman_bt/policy_task_config.hpp"
#include "realman_bt/retry_unless_fault_node.hpp"
#include "std_msgs/msg/float64.hpp"
#include "std_srvs/srv/trigger.hpp"

namespace {

using namespace std::chrono_literals;
using bt_core::NodeStatus;
using realman_bt::GripperReadyNode;
using realman_bt::PolicyTaskConfig;
using Trigger = std_srvs::srv::Trigger;

PolicyTaskConfig fastConfig() {
  PolicyTaskConfig config;
  config.gripper_ready.timeout_sec = 0.4;
  config.gripper_ready.position_stale_sec = 0.2;
  config.service_call_timeout_sec = 0.5;
  return config;
}

// A stand-in for gripper_manager: publishes the position and serves /gripper_right/open.
struct FakeGripper {
  FakeGripper() {
    node = std::make_shared<rclcpp::Node>("fake_gripper_manager");
    executor.add_node(node);
    publisher = node->create_publisher<std_msgs::msg::Float64>("/gripper_right/position", 10);
  }

  void serveOpen(bool success = true, const std::string& message = "opened") {
    open_service = node->create_service<Trigger>(
        "/gripper_right/open",
        [this, success, message](const Trigger::Request::SharedPtr,
                                 Trigger::Response::SharedPtr response) {
          ++open_calls;
          if (success && open_moves_gripper) position = 50.0;
          response->success = success;
          response->message = message;
        });
  }

  void publish() {
    if (!publishing) return;
    std_msgs::msg::Float64 message;
    message.data = position;
    publisher->publish(message);
  }

  std::shared_ptr<rclcpp::Node> node;
  rclcpp::executors::SingleThreadedExecutor executor;
  rclcpp::Publisher<std_msgs::msg::Float64>::SharedPtr publisher;
  rclcpp::Service<Trigger>::SharedPtr open_service;
  double position{8000.0};
  bool publishing{true};
  bool open_moves_gripper{true};
  int open_calls{0};
};

struct Fixture {
  explicit Fixture(bool dry_run = false, PolicyTaskConfig cfg = fastConfig()) : config(cfg) {
    bt_core::NodeConfig node_config;
    node_config.blackboard = bt_core::Blackboard::create();
    blackboard = node_config.blackboard;
    blackboard->set<const PolicyTaskConfig*>(realman_bt::kPolicyTaskConfigBlackboardKey, &config);
    blackboard->set<rclcpp::Node*>(realman_bt::kRosNodeBlackboardKey, gripper.node.get());
    node_config.port_values = {{"arm_id", "r"}, {"dry_run", dry_run ? "true" : "false"}};
    node = std::make_unique<GripperReadyNode>("gripper_ready", node_config);
  }

  // Ticks the node while the fake gripper publishes, until `done` or the deadline.
  NodeStatus run(std::chrono::milliseconds limit,
                 const std::function<bool(NodeStatus)>& done = nullptr) {
    const auto deadline = std::chrono::steady_clock::now() + limit;
    NodeStatus status = NodeStatus::IDLE;
    while (std::chrono::steady_clock::now() < deadline) {
      gripper.publish();
      gripper.executor.spin_some();
      status = node->executeTick();
      if (status != NodeStatus::RUNNING && !done) return status;
      if (done && done(status)) return status;
      std::this_thread::sleep_for(5ms);
    }
    return status;
  }

  bool faultRaised() const {
    return blackboard->get<bool>(realman_bt::kPolicyFaultKey).value_or(false);
  }
  std::string reason() const {
    return blackboard->get<std::string>(realman_bt::kPolicyFailureReasonKey).value_or("");
  }

  PolicyTaskConfig config;
  FakeGripper gripper;
  bt_core::Blackboard::Ptr blackboard;
  std::unique_ptr<GripperReadyNode> node;
};

void testAnAlreadyOpenGripperSucceedsWithoutCallingOpen() {
  Fixture f;
  f.gripper.serveOpen();
  f.gripper.position = 50.0;

  assert(f.run(2s) == NodeStatus::SUCCESS);

  assert(f.gripper.open_calls == 0);
  assert(!f.faultRaised());
}

void testAClosedGripperIsOpenedOnceAndTheNodeWaitsForThePosition() {
  Fixture f;
  f.gripper.serveOpen();

  assert(f.run(2s) == NodeStatus::SUCCESS);

  assert(f.gripper.open_calls == 1);
  assert(!f.faultRaised());
}

void testAHalfClosedGripperCountsAsNotReady() {
  // The failure that started this: cycle 3 began with a half-closed gripper.
  Fixture f;
  f.gripper.serveOpen();
  f.gripper.position = 4200.0;

  assert(f.run(2s) == NodeStatus::SUCCESS);

  assert(f.gripper.open_calls == 1);
}

void testAGripperThatNeverOpensIsAFault() {
  Fixture f;
  f.gripper.serveOpen();
  f.gripper.open_moves_gripper = false;

  assert(f.run(3s) == NodeStatus::FAILURE);

  assert(f.gripper.open_calls == 1);
  assert(f.faultRaised());
  assert(f.reason().find("did not open") != std::string::npos);
  assert(f.node->failureReason() == f.reason());
}

void testAMissingOpenServiceIsAFault() {
  Fixture f;

  assert(f.run(3s) == NodeStatus::FAILURE);

  assert(f.faultRaised());
  assert(f.reason().find("not available") != std::string::npos);
}

void testNoPositionDataIsAFault() {
  Fixture f;
  f.gripper.serveOpen();
  f.gripper.publishing = false;

  assert(f.run(3s) == NodeStatus::FAILURE);

  assert(f.gripper.open_calls == 0);
  assert(f.faultRaised());
  assert(f.reason().find("no gripper position") != std::string::npos);
}

void testAStalePositionIsNotTrusted() {
  Fixture f;
  f.gripper.serveOpen();
  f.gripper.position = 50.0;
  f.gripper.publish();
  f.gripper.executor.spin_some();
  f.gripper.publishing = false;
  std::this_thread::sleep_for(300ms);  // older than position_stale_sec (0.2 s)

  const NodeStatus first = f.run(50ms);
  assert(first == NodeStatus::RUNNING);

  assert(f.run(3s) == NodeStatus::FAILURE);
  assert(f.faultRaised());
}

void testARefusedOpenIsAFaultAtOnce() {
  Fixture f;
  f.gripper.serveOpen(false, "gripper disabled");

  assert(f.run(3s) == NodeStatus::FAILURE);

  assert(f.faultRaised());
  assert(f.reason().find("gripper disabled") != std::string::npos);
}

void testHaltStartsTheWholeCheckOver() {
  Fixture f;
  f.gripper.serveOpen();
  f.gripper.open_moves_gripper = false;
  assert(f.run(120ms) == NodeStatus::RUNNING);
  assert(f.gripper.open_calls == 1);

  f.node->halt();
  assert(f.run(120ms) == NodeStatus::RUNNING);

  assert(f.gripper.open_calls == 2);
}

void testASecondRunAfterSuccessChecksAgain() {
  Fixture f;
  f.gripper.serveOpen();
  assert(f.run(2s) == NodeStatus::SUCCESS);
  assert(f.gripper.open_calls == 1);

  f.gripper.position = 8000.0;  // the policy closed the gripper again
  assert(f.run(2s) == NodeStatus::SUCCESS);

  assert(f.gripper.open_calls == 2);
}

void testDryRunNeverTouchesTheGripper() {
  Fixture f(true);
  f.gripper.serveOpen();

  assert(f.run(500ms) == NodeStatus::SUCCESS);

  assert(f.gripper.open_calls == 0);
  assert(!f.faultRaised());
}

void testItNeedsTheConfigurationToRun() {
  Fixture f;
  f.blackboard->remove(realman_bt::kPolicyTaskConfigBlackboardKey);

  try {
    f.node->executeTick();
    assert(false);
  } catch (const std::runtime_error&) {
  }
}

void testItNeedsAGripperForTheArm() {
  Fixture f;
  f.config.gripper_for_arm.erase("r");

  try {
    f.node->executeTick();
    assert(false);
  } catch (const std::runtime_error&) {
  }
}

void testPortsAreDeclared() {
  const auto ports = GripperReadyNode::providedPorts();
  assert(ports.count("arm_id") == 1);
  assert(ports.count("dry_run") == 1);
}

}  // namespace

int main(int argc, char** argv) {
  rclcpp::init(argc, argv);
  testAnAlreadyOpenGripperSucceedsWithoutCallingOpen();
  testAClosedGripperIsOpenedOnceAndTheNodeWaitsForThePosition();
  testAHalfClosedGripperCountsAsNotReady();
  testAGripperThatNeverOpensIsAFault();
  testAMissingOpenServiceIsAFault();
  testNoPositionDataIsAFault();
  testAStalePositionIsNotTrusted();
  testARefusedOpenIsAFaultAtOnce();
  testHaltStartsTheWholeCheckOver();
  testASecondRunAfterSuccessChecksAgain();
  testDryRunNeverTouchesTheGripper();
  testItNeedsTheConfigurationToRun();
  testItNeedsAGripperForTheArm();
  testPortsAreDeclared();
  rclcpp::shutdown();
  return 0;
}
