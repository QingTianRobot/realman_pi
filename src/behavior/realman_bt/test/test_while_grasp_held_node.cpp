// A Release build defines NDEBUG, which would turn every assert below into a no-op.
#ifdef NDEBUG
#undef NDEBUG
#endif

#include <cassert>
#include <chrono>
#include <memory>
#include <string>
#include <thread>
#include <vector>

#include "bt_core/leaf_node.hpp"
#include "rclcpp/rclcpp.hpp"
#include "realman_bt/policy_attempt_events.hpp"
#include "realman_bt/policy_task_blackboard.hpp"
#include "realman_bt/policy_task_config.hpp"
#include "realman_bt/retry_unless_fault_node.hpp"
#include "realman_bt/while_grasp_held_node.hpp"
#include "std_msgs/msg/float64.hpp"

namespace {

using namespace std::chrono_literals;
using bt_core::NodeStatus;
using realman_bt::PolicyTaskConfig;
using realman_bt::WhileGraspHeldNode;
using AttemptEvent = realman_recording_msgs::msg::AttemptEvent;

PolicyTaskConfig fastConfig() {
  PolicyTaskConfig config;
  config.gripper_ready.position_stale_sec = 0.2;
  config.grasp_check.carry_lost_sec = 0.1;
  return config;
}

// The carry motions: RUNNING until told otherwise; counts ticks and halts.
class FakeCarry final : public bt_core::ActionNode {
 public:
  using bt_core::ActionNode::ActionNode;

  bt_core::NodeStatus tick() override {
    ++ticks;
    if (result == NodeStatus::FAILURE) setFailureReason("MoveJ goal rejected by action server");
    return result;
  }
  void onHalted() override { ++halts; }

  NodeStatus result{NodeStatus::RUNNING};
  int ticks{0};
  int halts{0};
};

struct Fixture {
  explicit Fixture(bool dry_run = false, PolicyTaskConfig cfg = fastConfig()) : config(cfg) {
    ros = std::make_shared<rclcpp::Node>("fake_gripper_manager");
    executor.add_node(ros);
    publisher = ros->create_publisher<std_msgs::msg::Float64>("/gripper_right/position", 10);
    // Like the recorder: collects the carried attempt's RESULT.
    attempt_sub = ros->create_subscription<AttemptEvent>(
        "/recording/attempt", rclcpp::QoS(10).reliable(),
        [this](AttemptEvent::ConstSharedPtr message) { attempts.push_back(*message); });

    bt_core::NodeConfig node_config;
    node_config.blackboard = bt_core::Blackboard::create();
    blackboard = node_config.blackboard;
    blackboard->set<const PolicyTaskConfig*>(realman_bt::kPolicyTaskConfigBlackboardKey, &config);
    blackboard->set<rclcpp::Node*>(realman_bt::kRosNodeBlackboardKey, ros.get());
    node_config.port_values = {{"arm_id", "r"}, {"dry_run", dry_run ? "true" : "false"}};
    node = std::make_unique<WhileGraspHeldNode>("pick_carry", node_config);
    bt_core::NodeConfig child_config;
    child_config.blackboard = blackboard;
    carry = std::make_shared<FakeCarry>("pick_carry_to_release", child_config);
    node->setChild(carry);
  }

  // Ticks while the fake gripper publishes `position`, until the node stops running or the limit.
  NodeStatus run(std::chrono::milliseconds limit) {
    const auto deadline = std::chrono::steady_clock::now() + limit;
    NodeStatus status = NodeStatus::IDLE;
    while (std::chrono::steady_clock::now() < deadline) {
      if (publishing) {
        std_msgs::msg::Float64 message;
        message.data = position;
        publisher->publish(message);
      }
      executor.spin_some();
      status = node->executeTick();
      if (status != NodeStatus::RUNNING) return status;
      std::this_thread::sleep_for(5ms);
    }
    return status;
  }

  // What PolicyRun leaves after a held grasp_check attempt.
  void handOverAnAttempt() {
    AttemptEvent result;
    result.kind = AttemptEvent::RESULT;
    result.attempt_id = "policy_attempt_20261101T000000Z_r";
    result.task = "pick";
    result.arm = "r";
    result.outcome = "grasp_held";
    result.succeeded = true;
    realman_bt::handOverCarriedAttempt(blackboard, result);
  }

  void settle() {
    const auto end = std::chrono::steady_clock::now() + 300ms;
    while (std::chrono::steady_clock::now() < end) {
      executor.spin_some();
      std::this_thread::sleep_for(5ms);
    }
  }

  bool faultRaised() const { return blackboard->get<bool>(realman_bt::kPolicyFaultKey).value_or(false); }
  std::string reason() const {
    return blackboard->get<std::string>(realman_bt::kPolicyFailureReasonKey).value_or("");
  }

  PolicyTaskConfig config;
  std::shared_ptr<rclcpp::Node> ros;
  rclcpp::executors::SingleThreadedExecutor executor;
  rclcpp::Publisher<std_msgs::msg::Float64>::SharedPtr publisher;
  rclcpp::Subscription<AttemptEvent>::SharedPtr attempt_sub;
  std::vector<AttemptEvent> attempts;
  bt_core::Blackboard::Ptr blackboard;
  std::unique_ptr<WhileGraspHeldNode> node;
  std::shared_ptr<FakeCarry> carry;
  double position{5700.0};  // closed on an adapter
  bool publishing{true};
};

void testTheCarryRunsWhileTheObjectIsHeld() {
  Fixture f;
  assert(f.run(300ms) == NodeStatus::RUNNING);
  assert(f.carry->ticks > 10 && f.carry->halts == 0);

  f.carry->result = NodeStatus::SUCCESS;
  assert(f.run(200ms) == NodeStatus::SUCCESS);
  assert(!f.faultRaised() && f.reason().empty());
}

void testADropStopsTheCarryAndIsRetryable() {
  Fixture f;
  assert(f.run(200ms) == NodeStatus::RUNNING);
  f.position = 8450.0;  // the jaws met: the object is gone

  assert(f.run(1s) == NodeStatus::FAILURE);

  assert(f.carry->halts == 1);  // the motion is stopped where the object fell
  assert(!f.faultRaised());     // RetryUnlessFault opens, rehomes and runs the policy again
  assert(f.reason().find("dropped while carrying") != std::string::npos);
  assert(f.reason().find("8450") != std::string::npos);
  assert(f.node->failureReason() == f.reason());
}

void testOneOpenReadingIsNotADrop() {
  Fixture f;
  assert(f.run(100ms) == NodeStatus::RUNNING);
  f.position = 8450.0;
  f.run(30ms);  // shorter than carry_lost_sec (0.1 s)
  f.position = 5700.0;
  assert(f.run(300ms) == NodeStatus::RUNNING);
  assert(f.carry->halts == 0);
}

void testADropIsSeenEvenOnTheTickTheCarryWouldFinish() {
  Fixture f;
  f.position = 8450.0;
  f.run(20ms);
  std::this_thread::sleep_for(150ms);  // past carry_lost_sec with the jaws met
  f.carry->result = NodeStatus::SUCCESS;
  assert(f.run(100ms) == NodeStatus::FAILURE);
  assert(!f.faultRaised());
}

void testAFailedCarryMotionIsAFault() {
  Fixture f;
  assert(f.run(100ms) == NodeStatus::RUNNING);
  f.carry->result = NodeStatus::FAILURE;

  assert(f.run(200ms) == NodeStatus::FAILURE);

  assert(f.faultRaised());  // a MoveJ that fails is not retried, as before the carry moved in the retry
  assert(f.reason().find("pick_carry_to_release") != std::string::npos);
  assert(f.reason().find("goal rejected") != std::string::npos);
}

void testNoGripperPositionIsAFault() {
  Fixture f;
  f.publishing = false;

  assert(f.run(1s) == NodeStatus::FAILURE);

  assert(f.faultRaised());
  assert(f.reason().find("no gripper position") != std::string::npos);
  assert(f.carry->halts == 1);
}

void testDryRunOnlyTicksTheChild() {
  Fixture f(true);
  f.position = 8450.0;
  f.carry->result = NodeStatus::SUCCESS;
  assert(f.run(200ms) == NodeStatus::SUCCESS);
  assert(f.carry->ticks == 1 && !f.faultRaised());
}

void testDryRunStillTurnsAFailedCarryIntoAFault() {
  Fixture f(true);
  f.carry->result = NodeStatus::FAILURE;
  assert(f.run(200ms) == NodeStatus::FAILURE);
  assert(f.faultRaised());
}

void testAHaltForgetsTheDropTimer() {
  Fixture f;
  f.position = 8450.0;
  f.run(50ms);
  f.node->halt();
  f.position = 5700.0;
  assert(f.run(300ms) == NodeStatus::RUNNING);
}

// ---- the carried attempt's RESULT for the recorder --------------------------------------------

void testACarryThatArrivesEndsTheAttemptAsCarried() {
  Fixture f;
  f.handOverAnAttempt();
  assert(f.run(100ms) == NodeStatus::RUNNING);
  f.carry->result = NodeStatus::SUCCESS;
  assert(f.run(200ms) == NodeStatus::SUCCESS);
  f.settle();

  assert(f.attempts.size() == 1);
  const auto& result = f.attempts[0];
  assert(result.kind == AttemptEvent::RESULT);
  assert(result.attempt_id == "policy_attempt_20261101T000000Z_r" && result.task == "pick");
  assert(result.outcome == "carried" && result.succeeded && result.reason.empty());
  assert(!realman_bt::takeCarriedAttempt(f.blackboard).has_value());
}

void testADropEndsTheAttemptAsAFailure() {
  Fixture f;
  f.handOverAnAttempt();
  assert(f.run(100ms) == NodeStatus::RUNNING);
  f.position = 8450.0;
  assert(f.run(1s) == NodeStatus::FAILURE);
  f.settle();

  assert(f.attempts.size() == 1);
  assert(f.attempts[0].outcome == "carry_dropped" && !f.attempts[0].succeeded);
  assert(f.attempts[0].reason.find("dropped while carrying") != std::string::npos);
}

void testAFailedCarryMotionEndsTheAttemptAsACarryFault() {
  Fixture f;
  f.handOverAnAttempt();
  assert(f.run(100ms) == NodeStatus::RUNNING);
  f.carry->result = NodeStatus::FAILURE;
  assert(f.run(200ms) == NodeStatus::FAILURE);
  f.settle();

  assert(f.attempts.size() == 1);
  assert(f.attempts[0].outcome == "carry_fault" && !f.attempts[0].succeeded);
  assert(f.attempts[0].reason.find("pick_carry_to_release") != std::string::npos);
}

void testAHaltedCarryEndsTheAttemptOnce() {
  Fixture f;
  f.handOverAnAttempt();
  assert(f.run(100ms) == NodeStatus::RUNNING);
  f.node->halt();
  f.node->halt();
  f.settle();

  assert(f.attempts.size() == 1);
  assert(f.attempts[0].outcome == "halted" && !f.attempts[0].succeeded);
}

void testACarryWithoutAHandOverAnnouncesNothing() {
  Fixture f;
  f.carry->result = NodeStatus::SUCCESS;
  assert(f.run(200ms) == NodeStatus::SUCCESS);
  f.settle();
  assert(f.attempts.empty());
}

}  // namespace

int main(int argc, char** argv) {
  rclcpp::init(argc, argv);
  testTheCarryRunsWhileTheObjectIsHeld();
  testADropStopsTheCarryAndIsRetryable();
  testOneOpenReadingIsNotADrop();
  testADropIsSeenEvenOnTheTickTheCarryWouldFinish();
  testAFailedCarryMotionIsAFault();
  testNoGripperPositionIsAFault();
  testDryRunOnlyTicksTheChild();
  testDryRunStillTurnsAFailedCarryIntoAFault();
  testAHaltForgetsTheDropTimer();
  testACarryThatArrivesEndsTheAttemptAsCarried();
  testADropEndsTheAttemptAsAFailure();
  testAFailedCarryMotionEndsTheAttemptAsACarryFault();
  testAHaltedCarryEndsTheAttemptOnce();
  testACarryWithoutAHandOverAnnouncesNothing();
  rclcpp::shutdown();
  return 0;
}
