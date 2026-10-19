// A Release build defines NDEBUG, which would turn every assert below into a no-op.
#ifdef NDEBUG
#undef NDEBUG
#endif

#include <array>
#include <cassert>
#include <chrono>
#include <functional>
#include <unordered_map>
#include <memory>
#include <stdexcept>
#include <string>
#include <thread>
#include <vector>

#include "bt_core/leaf_node.hpp"
#include "rclcpp/rclcpp.hpp"
#include "realman_bt/motion_dwell_monitor_node.hpp"
#include "realman_bt/move_j_node.hpp"
#include "sensor_msgs/msg/joint_state.hpp"

namespace {

using namespace std::chrono_literals;
using bt_core::NodeStatus;
using realman_bt::MotionDwellMonitorNode;
using Clock = std::chrono::steady_clock;

constexpr double kPi = 3.14159265358979323846;

// A child that stays RUNNING (an input leaf, a policy run) until told otherwise.
class ScriptedChild final : public bt_core::ActionNode {
 public:
  ScriptedChild(std::string name, bt_core::NodeConfig config)
      : ActionNode(std::move(name), std::move(config)) {}
  NodeStatus tick() override {
    ++ticks;
    return result;
  }
  void onHalted() override { ++halts; }

  NodeStatus result{NodeStatus::RUNNING};
  int ticks{0};
  int halts{0};
};

// Publishes /r/joint_states (and /l) like the driver; the test moves the pose.
struct FakeArm {
  FakeArm() {
    node = std::make_shared<rclcpp::Node>("fake_driver");
    executor.add_node(node);
    r_pub = node->create_publisher<sensor_msgs::msg::JointState>("/r/joint_states", 10);
    l_pub = node->create_publisher<sensor_msgs::msg::JointState>("/l/joint_states", 10);
  }

  void publish() {
    auto send = [&](const rclcpp::Publisher<sensor_msgs::msg::JointState>::SharedPtr& pub,
                    const std::array<double, 6>& degrees) {
      sensor_msgs::msg::JointState message;
      message.header.stamp = node->now();
      message.name = {"j1", "j2", "j3", "j4", "j5", "j6"};
      for (double d : degrees) message.position.push_back(d * kPi / 180.0);
      pub->publish(message);
    };
    if (alive) send(r_pub, r);
    send(l_pub, l);
    executor.spin_some();
  }

  std::shared_ptr<rclcpp::Node> node;
  rclcpp::executors::SingleThreadedExecutor executor;
  rclcpp::Publisher<sensor_msgs::msg::JointState>::SharedPtr r_pub, l_pub;
  std::array<double, 6> r{-9.89, 18.05, 79.07, 15.5, 79.6, -6.2};
  std::array<double, 6> l{12.17, 25.22, 73.05, -16.7, 80.3, 14.45};
  bool alive{true};
};

using Ports = std::unordered_map<std::string, std::string>;

// A one-entry braced list would pick the iterator-range constructor (two const char*), so build it.
Ports armOnly(const std::string& arm) {
  Ports ports;
  ports["arm_id"] = arm;
  return ports;
}

struct Fixture {
  explicit Fixture(Ports ports = armOnly("r")) {
    bt_core::NodeConfig config;
    config.blackboard = bt_core::Blackboard::create();
    blackboard = config.blackboard;
    blackboard->set<rclcpp::Node*>(realman_bt::kRosNodeBlackboardKey, arm.node.get());
    // What the executor puts there from config/ros/motion_monitor.yaml, shortened for the test.
    blackboard->set<double>(realman_bt::kMotionDwellSecKey, 0.6);
    blackboard->set<double>(realman_bt::kMotionDwellToleranceDegKey, 0.5);
    blackboard->set<double>(realman_bt::kMotionDwellStaleSecKey, 0.3);
    config.port_values = std::move(ports);
    monitor = std::make_shared<MotionDwellMonitorNode>("monitor", config);
    child = std::make_shared<ScriptedChild>("child", config);
    monitor->setChild(child);
  }

  // Ticks at ~50 Hz while publishing; `script(arm, seconds)` plays the arm. Stops on a non-RUNNING
  // status or after `limit`. Returns the status and how long it took.
  std::pair<NodeStatus, double> run(std::chrono::milliseconds limit,
                                    const std::function<void(FakeArm&, double)>& script = nullptr) {
    const auto begin = Clock::now();
    NodeStatus status = NodeStatus::IDLE;
    while (Clock::now() - begin < limit) {
      const double elapsed = std::chrono::duration<double>(Clock::now() - begin).count();
      if (script) script(arm, elapsed);
      arm.publish();
      status = monitor->executeTick();
      if (status != NodeStatus::RUNNING) return {status, elapsed};
      std::this_thread::sleep_for(20ms);
    }
    return {status, std::chrono::duration<double>(Clock::now() - begin).count()};
  }

  bool dwellFlag() const { return blackboard->get<bool>(realman_bt::kMotionDwellKey).value_or(false); }
  std::string reason() const {
    return blackboard->get<std::string>(realman_bt::kMotionDwellReasonKey).value_or("");
  }

  FakeArm arm;
  bt_core::Blackboard::Ptr blackboard;
  std::shared_ptr<MotionDwellMonitorNode> monitor;
  std::shared_ptr<ScriptedChild> child;
};

void testAStillArmEndsTheChildWithFailure() {
  Fixture f;
  const auto [status, seconds] = f.run(3s);

  assert(status == NodeStatus::FAILURE);
  assert(seconds >= 0.55 && seconds < 1.5);  // dwell 0.6 s from the blackboard default
  assert(f.child->halts == 1);
  assert(f.dwellFlag());
  assert(f.reason().find("arm r stayed within 0.50 deg") != std::string::npos);
}

void testAMovingArmNeverFires() {
  Fixture f;
  const auto [status, seconds] = f.run(1500ms, [](FakeArm& arm, double t) {
    arm.r[0] = -9.89 + 4.0 * t;  // 4 deg/s, out of the 0.5 deg box every ~0.13 s
  });

  assert(status == NodeStatus::RUNNING);
  assert(f.child->halts == 0);
  assert(!f.dwellFlag());
}

void testItStopsAfterTheArmStopsMoving() {
  Fixture f;
  const auto [status, seconds] = f.run(3s, [](FakeArm& arm, double t) {
    if (t < 0.8) arm.r[1] = 18.05 + 5.0 * t;
  });

  assert(status == NodeStatus::FAILURE);
  // The window starts the last time the arm left the 0.5 deg box, at most ~0.1 s before the
  // motion ended at this speed; never during the motion.
  assert(seconds >= 0.8 + 0.6 - 0.15);
}

void testOnlyTheWatchedArmCounts() {
  // The left arm is still the whole time; the right arm moves.
  Fixture f(armOnly("r"));
  const auto [status, seconds] = f.run(1500ms, [](FakeArm& arm, double t) { arm.r[3] = 15.5 + 4.0 * t; });
  assert(status == NodeStatus::RUNNING);

  Fixture g(armOnly("l"));
  const auto [status_l, seconds_l] = g.run(3s, [](FakeArm& arm, double t) { arm.r[3] = 15.5 + 4.0 * t; });
  assert(status_l == NodeStatus::FAILURE);
  assert(g.reason().find("arm l") != std::string::npos);
}

void testPortsWinOverTheConfiguredDefaults() {
  Fixture f(Ports{{"arm_id", "r"}, {"dwell_sec", "1.2"}});
  const auto [status, seconds] = f.run(4s);

  assert(status == NodeStatus::FAILURE);
  assert(seconds >= 1.15);
}

void testATolerancePortWiderThanTheMotionMakesItStill() {
  Fixture f(Ports{{"arm_id", "r"}, {"tolerance_deg", "5.0"}});
  const auto [status, seconds] = f.run(3s, [](FakeArm& arm, double t) { arm.r[0] = -9.89 + 1.0 * t; });
  assert(status == NodeStatus::FAILURE);  // 1 deg/s stays inside 5 deg for more than 0.6 s
}

void testOnDwellSuccess() {
  Fixture f(Ports{{"arm_id", "r"}, {"on_dwell", "success"}});
  const auto [status, seconds] = f.run(3s);

  assert(status == NodeStatus::SUCCESS);
  assert(f.child->halts == 1);
  assert(f.dwellFlag());
}

void testTheChildFinishingFirstIsPassedThrough() {
  Fixture f;
  f.child->result = NodeStatus::SUCCESS;
  assert(f.run(1s).first == NodeStatus::SUCCESS);
  assert(f.child->halts == 0 && !f.dwellFlag());

  Fixture g;
  g.child->result = NodeStatus::FAILURE;
  assert(g.run(1s).first == NodeStatus::FAILURE);
  assert(!g.dwellFlag());
}

void testWithoutJointStatesItNeverFires() {
  Fixture f;
  f.arm.alive = false;
  assert(f.run(1500ms).first == NodeStatus::RUNNING);
  assert(f.child->halts == 0);
}

void testANewRunStartsANewWindow() {
  Fixture f;
  assert(f.run(3s).first == NodeStatus::FAILURE);
  assert(f.dwellFlag());

  // Ticked again (a parent retrying): the flag is cleared and stillness is counted from now.
  const auto start = Clock::now();
  f.arm.publish();
  assert(f.monitor->executeTick() == NodeStatus::RUNNING);
  assert(!f.dwellFlag());
  const auto [status, seconds] = f.run(3s);
  assert(status == NodeStatus::FAILURE);
  assert(std::chrono::duration<double>(Clock::now() - start).count() >= 0.55);
}

void testHaltRestartsTheWindowAndHaltsTheChild() {
  Fixture f;
  assert(f.run(400ms).first == NodeStatus::RUNNING);  // 0.4 s of stillness so far
  f.monitor->halt();
  assert(f.child->halts == 1);

  const auto [status, seconds] = f.run(3s);
  assert(status == NodeStatus::FAILURE);
  assert(seconds >= 0.55);  // not 0.2: the 0.4 s before the halt do not count
}

void testBadPortsThrow() {
  bool threw = false;
  try {
    Fixture f(armOnly("x"));
    f.monitor->executeTick();
  } catch (const std::runtime_error&) {
    threw = true;
  }
  assert(threw);

  threw = false;
  try {
    Fixture f(Ports{{"arm_id", "r"}, {"on_dwell", "halt"}});
    f.monitor->executeTick();
  } catch (const std::runtime_error&) {
    threw = true;
  }
  assert(threw);

  threw = false;
  try {
    Fixture f(Ports{{"arm_id", "r"}, {"dwell_sec", "0"}});
    f.monitor->executeTick();
  } catch (const std::exception&) {
    threw = true;
  }
  assert(threw);
}

void testPortsAreDeclared() {
  const auto ports = MotionDwellMonitorNode::providedPorts();
  assert(ports.size() == 4);
  for (const char* port : {"arm_id", "dwell_sec", "tolerance_deg", "on_dwell"}) assert(ports.count(port) == 1);
}

}  // namespace

int main(int argc, char** argv) {
  rclcpp::init(argc, argv);
  testAStillArmEndsTheChildWithFailure();
  testAMovingArmNeverFires();
  testItStopsAfterTheArmStopsMoving();
  testOnlyTheWatchedArmCounts();
  testPortsWinOverTheConfiguredDefaults();
  testATolerancePortWiderThanTheMotionMakesItStill();
  testOnDwellSuccess();
  testTheChildFinishingFirstIsPassedThrough();
  testWithoutJointStatesItNeverFires();
  testANewRunStartsANewWindow();
  testHaltRestartsTheWindowAndHaltsTheChild();
  testBadPortsThrow();
  testPortsAreDeclared();
  rclcpp::shutdown();
  return 0;
}
