// A Release build defines NDEBUG, which would turn every assert below into a no-op.
#ifdef NDEBUG
#undef NDEBUG
#endif

#include <algorithm>
#include <cassert>
#include <chrono>
#include <cmath>
#include <cstdio>
#include <filesystem>
#include <fstream>
#include <functional>
#include <memory>
#include <string>
#include <thread>
#include <vector>

#include <unistd.h>

#include "diagnostic_msgs/msg/diagnostic_array.hpp"
#include "geometry_msgs/msg/twist_stamped.hpp"
#include "rclcpp/rclcpp.hpp"
#include "realman_bt/policy_run_node.hpp"
#include "realman_bt/policy_task_blackboard.hpp"
#include "realman_bt/policy_task_config.hpp"
#include "sensor_msgs/msg/joint_state.hpp"
#include "std_msgs/msg/bool.hpp"
#include "std_msgs/msg/float32.hpp"
#include "std_msgs/msg/float64.hpp"
#include "std_msgs/msg/string.hpp"
#include "std_srvs/srv/set_bool.hpp"
#include "std_srvs/srv/trigger.hpp"

namespace {

using namespace std::chrono_literals;
using bt_core::NodeStatus;
using realman_bt::PolicyRunNode;
using realman_bt::PolicyTaskConfig;
using Clock = std::chrono::steady_clock;

constexpr double kPi = 3.14159265358979323846;

namespace fs = std::filesystem;

fs::path nextTraceDir() {
  static int counter = 0;
  return fs::temp_directory_path() /
         ("policy_run_trace_" + std::to_string(::getpid()) + "_" + std::to_string(counter++));
}

PolicyTaskConfig fastConfig() {
  PolicyTaskConfig c;
  c.trace.dir = nextTraceDir().string();
  c.trace.period_sec = 0.02;
  c.service_wait_sec = 0.6;
  c.service_call_timeout_sec = 0.3;
  c.router_release_sec = 0.15;
  c.max_attempt_sec = 4.0;
  c.stall.sec = 0.6;
  c.release.min_closed_sec = 0.3;
  c.release.settle_sec = 0.2;
  c.verdict.window_sec = 0.3;
  c.joint_state_stale_sec = 0.5;
  c.stats_stale_sec = 1.0;
  c.gripper_ready.position_stale_sec = 0.5;
  c.max_joint_speed_dps = 400.0;
  c.lift.min_closed_sec = 0.3;
  c.lift.hold_sec = 0.2;
  return c;
}

constexpr char kPlacePrompt[] = "pick up the power adapter and put it in the blue bin";
constexpr char kPickPrompt[] = "pick up the power adapter";

struct Call {
  std::string name;
  bool data;
  Clock::time_point at;
};

// A stand-in for everything PolicyRun talks to: the arms, the gripper, the bridge and the router.
struct FakeStack {
  FakeStack() {
    node = std::make_shared<rclcpp::Node>("fake_policy_stack");
    executor.add_node(node);
    for (const char* arm : {"l", "m", "r"}) {
      joint_pubs[arm] = node->create_publisher<sensor_msgs::msg::JointState>(
          std::string("/") + arm + "/joint_states", 10);
    }
    r_current_pub = node->create_publisher<sensor_msgs::msg::JointState>("/r/joint_currents", 10);
    position_pub = node->create_publisher<std_msgs::msg::Float64>("/gripper_right/position", 10);
    torque_pub = node->create_publisher<std_msgs::msg::Bool>("/gripper_right/torque_reached", 10);
    policy_gripper_pub =
        node->create_publisher<std_msgs::msg::Float32>("/pi05_policy/r/gripper_percentage", 10);
    velocity_pub =
        node->create_publisher<geometry_msgs::msg::TwistStamped>("/r/cartesian_velocity/command", 10);
    stats_pub = node->create_publisher<diagnostic_msgs::msg::DiagnosticArray>("/policy/stats", 10);
    // Like the real bridge: takes a prompt from the topic (unless told to ignore it) and reports it.
    prompt_sub = node->create_subscription<std_msgs::msg::String>(
        "/policy/prompt", 10, [this](std_msgs::msg::String::ConstSharedPtr message) {
          prompts_received.push_back({message->data, Clock::now()});
          if (follow_prompt) bridge_prompt = message->data;
        });
  }

  void serve(bool activate = true, bool deactivate = true, bool bridge_estop = true,
             bool router_estop = true) {
    using SetBool = std_srvs::srv::SetBool;
    using Trigger = std_srvs::srv::Trigger;
    if (activate && !activate_answers) {
      // Takes the request (and starts publishing) but never answers it.
      silent_activate_service = node->create_service<SetBool>(
          "/policy/activate",
          [this](std::shared_ptr<rclcpp::Service<SetBool>>, std::shared_ptr<rmw_request_id_t>,
                 const SetBool::Request::SharedPtr request) {
            record("activate", request->data);
            if (request->data) stats_allow_publish = true;
          });
    } else if (activate) {
      activate_service = node->create_service<SetBool>(
          "/policy/activate", [this](const SetBool::Request::SharedPtr request,
                                     SetBool::Response::SharedPtr response) {
            record("activate", request->data);
            response->success = activate_succeeds;
            response->message = activate_succeeds ? "ok" : "bridge refused";
            // Like the real bridge, activating also clears a pause.
            if (activate_succeeds && request->data) {
              stats_allow_publish = true;
              stats_paused = false;
            }
          });
    }
    if (deactivate) {
      deactivate_service = node->create_service<SetBool>(
          "/policy/deactivate", [this](const SetBool::Request::SharedPtr request,
                                       SetBool::Response::SharedPtr response) {
            record("deactivate", request->data);
            response->success = true;
            if (request->data) stats_allow_publish = false;
          });
    }
    auto trigger = [this](const char* name) {
      return [this, name](const Trigger::Request::SharedPtr, Trigger::Response::SharedPtr response) {
        record(name, true);
        response->success = true;
        stats_allow_publish = false;
      };
    };
    if (bridge_estop) {
      bridge_estop_service = node->create_service<Trigger>("/policy/emergency_stop",
                                                           trigger("bridge_estop"));
    }
    if (router_estop) {
      router_estop_service = node->create_service<Trigger>("/policy_router/emergency_stop",
                                                           trigger("router_estop"));
    }
  }

  void record(const std::string& name, bool data) { calls.push_back({name, data, Clock::now()}); }

  int count(const std::string& name) const {
    return static_cast<int>(std::count_if(calls.begin(), calls.end(),
                                          [&](const Call& c) { return c.name == name; }));
  }

  std::vector<std::string> names() const {
    std::vector<std::string> result;
    for (const auto& call : calls) result.push_back(call.name);
    return result;
  }

  bool activated() const { return stats_allow_publish; }

  // Moves the right arm toward its target (degrees per second), then publishes everything.
  void tick(double dt) {
    for (int joint = 0; joint < 6; ++joint) {
      const double error = r_target[joint] - r[joint];
      const double step = std::clamp(error, -arm_rate_dps * dt, arm_rate_dps * dt);
      r[joint] += step;
    }
    publishAll();
    executor.spin_some();
  }

  void publishAll() {
    const auto stamp = node->now();
    auto publish_joints = [&](const char* arm, const std::array<double, 6>& degrees, bool alive) {
      if (!alive) return;
      sensor_msgs::msg::JointState message;
      message.header.stamp = stamp;
      message.name = {"j1", "j2", "j3", "j4", "j5", "j6"};
      for (double d : degrees) message.position.push_back(d * kPi / 180.0);
      joint_pubs[arm]->publish(message);
    };
    publish_joints("l", l, l_alive);
    publish_joints("m", m, m_alive);
    publish_joints("r", r, r_alive);
    if (r_alive) {
      sensor_msgs::msg::JointState currents;  // the driver's joint_currents: mA in effort
      currents.header.stamp = stamp;
      currents.name = {"j1", "j2", "j3", "j4", "j5", "j6"};
      currents.effort = {812.0, -2440.0, 1503.0, 95.0, -310.0, 12.0};
      r_current_pub->publish(currents);
    }
    if (gripper_alive) {
      std_msgs::msg::Float64 position;
      position.data = gripper_position;
      position_pub->publish(position);
      std_msgs::msg::Bool torque;
      torque.data = torque_reached;
      torque_pub->publish(torque);
    }
    std_msgs::msg::Float32 gripper;
    gripper.data = static_cast<float>(policy_gripper);
    policy_gripper_pub->publish(gripper);
    geometry_msgs::msg::TwistStamped velocity;
    velocity.header.stamp = stamp;
    velocity.twist.linear.x = cmd_linear;
    velocity.twist.angular.z = cmd_angular;
    velocity_pub->publish(velocity);
    if (stats_alive) {
      diagnostic_msgs::msg::DiagnosticArray stats;
      diagnostic_msgs::msg::DiagnosticStatus status;
      status.name = "policy_bridge";
      auto value = [&](const char* key, bool on) {
        diagnostic_msgs::msg::KeyValue kv;
        kv.key = key;
        kv.value = on ? "1.0" : "0.0";
        status.values.push_back(kv);
      };
      value("allow_publish", stats_allow_publish);
      value("mode_active", stats_mode_active);
      value("paused", stats_paused);
      if (report_prompt) {
        diagnostic_msgs::msg::KeyValue kv;
        kv.key = "prompt";
        kv.value = bridge_prompt;
        status.values.push_back(kv);
      }
      stats.status.push_back(status);
      stats_pub->publish(stats);
    }
  }

  std::shared_ptr<rclcpp::Node> node;
  rclcpp::executors::SingleThreadedExecutor executor;
  std::map<std::string, rclcpp::Publisher<sensor_msgs::msg::JointState>::SharedPtr> joint_pubs;
  rclcpp::Publisher<sensor_msgs::msg::JointState>::SharedPtr r_current_pub;
  rclcpp::Publisher<std_msgs::msg::Float64>::SharedPtr position_pub;
  rclcpp::Publisher<std_msgs::msg::Bool>::SharedPtr torque_pub;
  rclcpp::Publisher<std_msgs::msg::Float32>::SharedPtr policy_gripper_pub;
  rclcpp::Publisher<geometry_msgs::msg::TwistStamped>::SharedPtr velocity_pub;
  rclcpp::Publisher<diagnostic_msgs::msg::DiagnosticArray>::SharedPtr stats_pub;
  rclcpp::Subscription<std_msgs::msg::String>::SharedPtr prompt_sub;
  rclcpp::Service<std_srvs::srv::SetBool>::SharedPtr activate_service, deactivate_service,
      silent_activate_service;
  rclcpp::Service<std_srvs::srv::Trigger>::SharedPtr bridge_estop_service, router_estop_service;

  std::vector<Call> calls;
  bool activate_succeeds{true};
  bool activate_answers{true};
  std::string bridge_prompt{kPlacePrompt};  // the bridge starts with policy_bridge.yaml prompt.initial
  bool follow_prompt{true};
  bool report_prompt{true};
  struct PromptMessage {
    std::string text;
    Clock::time_point at;
  };
  std::vector<PromptMessage> prompts_received;

  std::array<double, 6> l{12.17, 25.22, 73.05, -16.7, 80.3, 14.45};
  std::array<double, 6> m{0.0, 18.0, 70.0, 0.0, 90.0, 9.0};
  std::array<double, 6> r{-9.89, 18.05, 79.07, 15.5, 79.6, -6.2};
  std::array<double, 6> r_target{-9.89, 18.05, 79.07, 15.5, 79.6, -6.2};
  double arm_rate_dps{150.0};
  bool l_alive{true}, m_alive{true}, r_alive{true}, gripper_alive{true}, stats_alive{true};
  bool stats_allow_publish{false}, stats_mode_active{true}, stats_paused{false};
  double policy_gripper{1.0};
  double gripper_position{50.0};
  bool torque_reached{false};
  double cmd_linear{0.05};
  double cmd_angular{0.10};
};

struct Fixture {
  explicit Fixture(bool dry_run = false, PolicyTaskConfig cfg = fastConfig(), const std::string& task = "place")
      : config(std::move(cfg)) {
    bt_core::NodeConfig node_config;
    node_config.blackboard = bt_core::Blackboard::create();
    blackboard = node_config.blackboard;
    blackboard->set<const PolicyTaskConfig*>(realman_bt::kPolicyTaskConfigBlackboardKey, &config);
    blackboard->set<rclcpp::Node*>(realman_bt::kRosNodeBlackboardKey, stack.node.get());
    node_config.port_values = {{"arm_id", "r"}, {"task", task}, {"dry_run", dry_run ? "true" : "false"}};
    node = std::make_unique<PolicyRunNode>("policy_run", node_config);
  }

  // Runs the loop at ~100 Hz. `script(stack, seconds_since_start)` plays the world.
  NodeStatus run(std::chrono::milliseconds limit,
                 const std::function<void(FakeStack&, double)>& script = nullptr,
                 const std::function<bool(NodeStatus)>& stop_when = nullptr) {
    const auto begin = Clock::now();
    auto previous = begin;
    NodeStatus status = NodeStatus::IDLE;
    while (Clock::now() - begin < limit) {
      const auto now = Clock::now();
      const double dt = std::chrono::duration<double>(now - previous).count();
      previous = now;
      const double elapsed = std::chrono::duration<double>(now - begin).count();
      if (script) script(stack, elapsed);
      stack.tick(dt);
      status = node->executeTick();
      last_return = Clock::now();
      if (stop_when ? stop_when(status) : status != NodeStatus::RUNNING) return status;
      std::this_thread::sleep_for(10ms);
    }
    return status;
  }

  // Lets queued service calls and replies through without ticking the node.
  void settle(std::chrono::milliseconds duration = 250ms) {
    const auto end = Clock::now() + duration;
    while (Clock::now() < end) {
      stack.tick(0.01);
      std::this_thread::sleep_for(5ms);
    }
  }

  bool faultRaised() const {
    return blackboard->get<bool>(realman_bt::kPolicyFaultKey).value_or(false);
  }
  bool timeoutRaised() const {
    return blackboard->get<bool>(realman_bt::kPolicyTimeoutKey).value_or(false);
  }
  std::string text(const char* key) const { return blackboard->get<std::string>(key).value_or(""); }
  bool armedFlag() const { return blackboard->get<bool>(realman_bt::kPolicyArmedKey).value_or(false); }

  PolicyTaskConfig config;
  FakeStack stack;
  bt_core::Blackboard::Ptr blackboard;
  std::unique_ptr<PolicyRunNode> node;
  Clock::time_point last_return;
};

// Plays one pick-and-place once the bridge is active: close, travel to the bin, open.
struct GraspScenario {
  explicit GraspScenario(bool object_held) : held(object_held) {}

  void operator()(FakeStack& s, double now) {
    if (armed_at < 0.0) {
      if (s.activated()) armed_at = now;
      return;
    }
    const double t = now - armed_at;
    if (t > 0.15 && !closed) {
      closed = true;
      s.policy_gripper = 0.0;
      s.gripper_position = held ? 5750.0 : 8450.0;
      s.torque_reached = held;
    }
    if (t > 0.65) s.r_target[0] = -52.0;
    if (t > 0.65 && s.r[0] < -40.0 && !opened) {
      opened = true;
      s.policy_gripper = 1.0;
    }
  }

  bool held;
  double armed_at{-1.0};
  bool closed{false};
  bool opened{false};
};

void expectStopsInOrder(const FakeStack& stack, bool with_activate = true) {
  std::vector<std::string> expected;
  if (with_activate) expected.push_back("activate");
  expected.insert(expected.end(), {"deactivate", "bridge_estop", "router_estop"});
  assert(stack.names() == expected);
}

// ---- before anything moves ---------------------------------------------------------------------

void testDryRunTouchesNothing() {
  Fixture f(true);
  f.stack.serve();

  assert(f.run(1s) == NodeStatus::SUCCESS);

  assert(f.stack.calls.empty());
  assert(f.text(realman_bt::kPolicyAttemptResultKey) == "dry_run");
}

void testAMissingServiceIsAFaultAndNothingIsSent() {
  Fixture f;
  f.stack.serve(true, true, true, /*router_estop=*/false);

  assert(f.run(3s) == NodeStatus::FAILURE);

  assert(f.faultRaised());
  assert(f.text(realman_bt::kPolicyFailureReasonKey).find("/policy_router/emergency_stop") !=
         std::string::npos);
  assert(f.stack.calls.empty());  // it never activated, so there is nothing to stop
  assert(f.text(realman_bt::kPolicyAttemptResultKey) == "fault");
}

void testMissingJointStatesOfAnotherArmIsAFault() {
  Fixture f;
  f.stack.serve();
  f.stack.l_alive = false;

  assert(f.run(3s) == NodeStatus::FAILURE);

  assert(f.faultRaised());
  assert(f.text(realman_bt::kPolicyFailureReasonKey).find("l joint_states") != std::string::npos);
  assert(f.stack.calls.empty());
}

void testNoGripperReadingIsAFault() {
  Fixture f;
  f.stack.serve();
  f.stack.gripper_alive = false;

  assert(f.run(3s) == NodeStatus::FAILURE);

  assert(f.faultRaised());
  assert(f.stack.calls.empty());
}

void testABridgeThatIsNotInPolicyModeIsAFault() {
  Fixture f;
  f.stack.serve();
  f.stack.stats_mode_active = false;

  assert(f.run(3s) == NodeStatus::FAILURE);

  assert(f.faultRaised());
  assert(f.text(realman_bt::kPolicyFailureReasonKey).find("policy mode") != std::string::npos);
  assert(f.stack.calls.empty());
}

// ---- policy-server timeouts --------------------------------------------------------------------

void testASilentBridgeIsAPolicyTimeout() {
  Fixture f;
  f.stack.serve();
  f.stack.stats_alive = false;

  assert(f.run(3s) == NodeStatus::FAILURE);

  assert(!f.faultRaised());
  assert(f.timeoutRaised());
  assert(f.text(realman_bt::kPolicyAttemptResultKey) == "policy_timeout");
  assert(f.text(realman_bt::kPolicyFailureReasonKey).find("/policy/stats") != std::string::npos);
  assert(f.stack.calls.empty());
}

void testABridgeWhoseServicesAreMissingIsAPolicyTimeout() {
  Fixture f;
  f.stack.serve(/*activate=*/false);

  assert(f.run(3s) == NodeStatus::FAILURE);

  assert(!f.faultRaised());
  assert(f.timeoutRaised());
  assert(f.text(realman_bt::kPolicyFailureReasonKey).find("/policy/activate") != std::string::npos);
  assert(f.stack.calls.empty());
}

void testMissingRobotDataBesideASilentBridgeIsStillAFault() {
  // Waiting for the bridge would be a timeout, but the arm's own data is missing too.
  Fixture f;
  f.stack.serve();
  f.stack.stats_alive = false;
  f.stack.m_alive = false;

  assert(f.run(3s) == NodeStatus::FAILURE);

  assert(f.faultRaised());
  assert(!f.timeoutRaised());
}

void testAnActivationWithoutAnswerIsAPolicyTimeoutAndStillStopsTheBridge() {
  Fixture f;
  f.stack.activate_answers = false;
  f.stack.serve();

  assert(f.run(3s) == NodeStatus::FAILURE);

  assert(!f.faultRaised());
  assert(f.timeoutRaised());
  assert(f.text(realman_bt::kPolicyAttemptResultKey) == "policy_timeout");
  assert(f.text(realman_bt::kPolicyFailureReasonKey).find("no reply from /policy/activate") !=
         std::string::npos);
  f.settle();
  expectStopsInOrder(f.stack);
}

void testABridgeThatPausesWhileRunningIsAPolicyTimeoutAndStopsIt() {
  Fixture f;
  f.stack.serve();
  const auto script = [](FakeStack& s, double) {
    if (s.activated()) s.stats_paused = true;  // its inference requests keep timing out
  };

  assert(f.run(5s, script) == NodeStatus::FAILURE);

  assert(!f.faultRaised());
  assert(f.timeoutRaised());
  assert(f.text(realman_bt::kPolicyAttemptResultKey) == "policy_timeout");
  assert(f.text(realman_bt::kPolicyFailureReasonKey).find("paused itself") != std::string::npos);
  f.settle();
  expectStopsInOrder(f.stack);
}

void testABridgeThatGoesSilentWhileRunningIsAPolicyTimeoutAndStopsIt() {
  Fixture f;
  f.stack.serve();
  const auto script = [](FakeStack& s, double) {
    if (s.activated()) s.stats_alive = false;
  };

  assert(f.run(5s, script) == NodeStatus::FAILURE);

  assert(!f.faultRaised());
  assert(f.timeoutRaised());
  assert(f.text(realman_bt::kPolicyFailureReasonKey).find("no policy bridge stats") != std::string::npos);
  f.settle();
  expectStopsInOrder(f.stack);
}

void testABridgePausedBeforeTheAttemptIsResumedByTheActivation() {
  // The previous attempt ended with the bridge paused; activating clears it and the attempt runs.
  Fixture f;
  f.stack.serve();
  f.stack.stats_paused = true;
  GraspScenario scenario(true);

  assert(f.run(8s, std::ref(scenario)) == NodeStatus::SUCCESS);

  assert(!f.timeoutRaised());
  assert(f.text(realman_bt::kPolicyAttemptResultKey) == "released_held");
}

void testARetryableFailureRaisesNeitherFlag() {
  PolicyTaskConfig config = fastConfig();
  config.max_attempt_sec = 0.8;
  Fixture f(false, config);
  f.stack.serve();

  assert(f.run(5s) == NodeStatus::FAILURE);

  assert(!f.faultRaised());
  assert(!f.timeoutRaised());
}

void testARefusedActivationIsAFaultAndStillStopsTheBridge() {
  Fixture f;
  f.stack.serve();
  f.stack.activate_succeeds = false;

  assert(f.run(3s) == NodeStatus::FAILURE);

  assert(f.faultRaised());
  assert(f.text(realman_bt::kPolicyFailureReasonKey).find("bridge refused") != std::string::npos);
  f.settle();
  expectStopsInOrder(f.stack);
}

// ---- a whole attempt ----------------------------------------------------------------------------

void testAHeldObjectReleasedOverTheBinIsASuccess() {
  Fixture f;
  f.stack.serve();
  GraspScenario scenario(true);

  assert(f.run(8s, std::ref(scenario)) == NodeStatus::SUCCESS);

  assert(!f.faultRaised());
  expectStopsInOrder(f.stack);
  assert(f.stack.calls.front().data);  // activate(true)
  assert(f.stack.calls[1].data);       // deactivate(data=true): false would re-activate it
  assert(f.text(realman_bt::kPolicyAttemptResultKey) == "released_held");
  assert(f.text(realman_bt::kPolicyGraspVerdictKey) == "held");
  assert(!f.armedFlag());
  assert(f.blackboard->get<double>(realman_bt::kPolicyAttemptSecKey).value_or(0.0) > 0.5);
  // The node waits for the router to let go of the session before it lets the next step start.
  const auto last_stop = f.stack.calls.back().at;
  assert(std::chrono::duration<double>(f.last_return - last_stop).count() >=
         f.config.router_release_sec * 0.8);
}

void testReleasingWithNothingHeldIsARetryableFailure() {
  Fixture f;
  f.stack.serve();
  GraspScenario scenario(false);

  assert(f.run(8s, std::ref(scenario)) == NodeStatus::FAILURE);

  assert(!f.faultRaised());
  expectStopsInOrder(f.stack);
  assert(f.text(realman_bt::kPolicyAttemptResultKey) == "released_empty");
  assert(f.text(realman_bt::kPolicyGraspVerdictKey) == "empty");
  assert(!f.text(realman_bt::kPolicyFailureReasonKey).empty());
}

void testNoReleaseInTimeIsARetryableTimeout() {
  PolicyTaskConfig config = fastConfig();
  config.max_attempt_sec = 0.8;
  Fixture f(false, config);
  f.stack.serve();

  assert(f.run(5s) == NodeStatus::FAILURE);

  assert(!f.faultRaised());
  assert(f.text(realman_bt::kPolicyAttemptResultKey) == "timeout");
  expectStopsInOrder(f.stack);
}

void testAClosedGripperThatStopsMovingIsARetryableStall() {
  Fixture f;
  f.stack.serve();
  const auto script = [](FakeStack& s, double) {
    if (!s.activated()) return;
    s.policy_gripper = 0.0;
    s.gripper_position = 5750.0;
    s.torque_reached = true;
    s.cmd_linear = 0.0;
    s.cmd_angular = 0.0;
  };

  assert(f.run(6s, script) == NodeStatus::FAILURE);

  assert(!f.faultRaised());
  assert(f.text(realman_bt::kPolicyAttemptResultKey) == "stall");
  expectStopsInOrder(f.stack);
}

// ---- faults while it runs ---------------------------------------------------------------------

void expectFaultAfterActivation(const std::function<void(FakeStack&)>& break_something,
                                const std::string& reason_fragment) {
  Fixture f;
  f.stack.serve();
  const auto script = [&](FakeStack& s, double) {
    if (s.activated()) break_something(s);
  };

  assert(f.run(5s, script) == NodeStatus::FAILURE);

  assert(f.faultRaised());
  assert(f.text(realman_bt::kPolicyAttemptResultKey) == "fault");
  const std::string reason = f.text(realman_bt::kPolicyFailureReasonKey);
  assert(reason.find(reason_fragment) != std::string::npos);
  f.settle();
  expectStopsInOrder(f.stack);
}

void testAJointOutsideTheEnvelopeStopsTheBridge() {
  expectFaultAfterActivation(
      [](FakeStack& s) {
        s.r[4] = 2.0;
        s.r_target[4] = 2.0;
      },
      "J5");
}

void testAnotherArmDriftingStopsTheBridge() {
  expectFaultAfterActivation([](FakeStack& s) { s.l[0] += 2.0; }, "arm l");
}

void testLosingTheArmsJointStatesStopsTheBridge() {
  expectFaultAfterActivation([](FakeStack& s) { s.r_alive = false; }, "joint_states");
}

// ---- operator activation ------------------------------------------------------------------------

void testOperatorModeWaitsForSomeoneElseToActivate() {
  PolicyTaskConfig config = fastConfig();
  config.activation = "operator";
  Fixture f(false, config);
  f.stack.serve();

  // Nobody activates: it waits and never calls /policy/activate itself.
  assert(f.run(700ms) == NodeStatus::RUNNING);
  assert(f.stack.count("activate") == 0);
  assert(!f.armedFlag());

  // The operator calls /policy/activate (the bridge now reports allow_publish).
  f.stack.stats_allow_publish = true;
  GraspScenario scenario(true);
  assert(f.run(8s, std::ref(scenario)) == NodeStatus::SUCCESS);
  assert(f.stack.count("activate") == 0);
  expectStopsInOrder(f.stack, /*with_activate=*/false);
}

// ---- halting ------------------------------------------------------------------------------------

void testHaltingARunningAttemptStopsTheBridgeInOrderOnce() {
  Fixture f;
  f.stack.serve();
  assert(f.run(4s, nullptr, [&](NodeStatus) { return f.stack.activated(); }) ==
         NodeStatus::RUNNING);
  f.run(150ms);  // a few supervised ticks

  f.node->halt();
  f.settle();
  expectStopsInOrder(f.stack);

  f.node->halt();  // halting again is harmless
  f.settle();
  assert(f.stack.calls.size() == 4);
  assert(!f.armedFlag());
}

void testHaltingBeforeAnythingWasStartedSendsNothing() {
  Fixture f;
  f.stack.serve();
  f.stack.stats_mode_active = false;  // keeps it in the preflight wait
  assert(f.run(200ms) == NodeStatus::RUNNING);

  f.node->halt();
  f.settle();

  assert(f.stack.calls.empty());
}

void testHaltingWhileWaitingForTheOperatorSendsNothing() {
  PolicyTaskConfig config = fastConfig();
  config.activation = "operator";
  Fixture f(false, config);
  f.stack.serve();
  assert(f.run(300ms) == NodeStatus::RUNNING);

  f.node->halt();
  f.settle();

  assert(f.stack.calls.empty());
}

void testANewAttemptStartsCleanAfterAnAttempt() {
  Fixture f;
  f.stack.serve();
  GraspScenario first(true);
  assert(f.run(8s, std::ref(first)) == NodeStatus::SUCCESS);
  f.settle();
  assert(f.stack.calls.size() == 4);

  // What Repeat does after a successful round: halt the child. Nothing is running any more, so
  // the halt must be silent.
  f.node->halt();
  f.settle();
  assert(f.stack.calls.size() == 4);

  // The world resets: arm back at the start pose, gripper open.
  f.stack.r_target = {-9.89, 18.05, 79.07, 15.5, 79.6, -6.2};
  f.stack.policy_gripper = 1.0;
  f.stack.gripper_position = 50.0;
  f.stack.torque_reached = false;
  f.settle(600ms);
  f.stack.calls.clear();

  GraspScenario second(true);
  assert(f.run(8s, std::ref(second)) == NodeStatus::SUCCESS);

  expectStopsInOrder(f.stack);
  assert(f.text(realman_bt::kPolicyAttemptResultKey) == "released_held");
}

// ---- trace files --------------------------------------------------------------------------------

std::vector<fs::path> traceFiles(const PolicyTaskConfig& config) {
  std::vector<fs::path> files;
  if (!fs::exists(config.trace.dir)) return files;
  for (const auto& entry : fs::directory_iterator(config.trace.dir)) files.push_back(entry.path());
  std::sort(files.begin(), files.end());
  return files;
}

std::vector<std::string> readLines(const fs::path& path) {
  std::ifstream in(path);
  std::vector<std::string> lines;
  for (std::string line; std::getline(in, line);) lines.push_back(line);
  return lines;
}

std::vector<std::string> fields(const std::string& line) {
  std::vector<std::string> out;
  std::string field;
  for (char c : line) {
    if (c == ',') {
      out.push_back(field);
      field.clear();
    } else {
      field += c;
    }
  }
  out.push_back(field);
  return out;
}

// A numeric column of a data row; an empty or malformed cell fails the test with the row printed.
double cell(const std::vector<std::string>& row, std::size_t index) {
  try {
    return std::stod(row.at(index));
  } catch (const std::exception&) {
    std::string joined;
    for (const auto& field : row) joined += field + ",";
    std::fprintf(stderr, "bad cell %zu in row: %s\n", index, joined.c_str());
    std::abort();
  }
}

// The data rows (not comments, not the column header) of one trace file.
std::vector<std::vector<std::string>> dataRows(const std::vector<std::string>& lines) {
  std::vector<std::vector<std::string>> rows;
  for (const auto& line : lines) {
    if (line.empty() || line[0] == '#' || line.rfind("t_sec,", 0) == 0) continue;
    rows.push_back(fields(line));
  }
  return rows;
}

bool hasLine(const std::vector<std::string>& lines, const std::string& wanted) {
  return std::find(lines.begin(), lines.end(), wanted) != lines.end();
}

bool hasLineStartingWith(const std::vector<std::string>& lines, const std::string& prefix) {
  return std::any_of(lines.begin(), lines.end(),
                     [&](const std::string& line) { return line.rfind(prefix, 0) == 0; });
}

void removeTraceDir(const PolicyTaskConfig& config) { fs::remove_all(config.trace.dir); }

void testASuccessfulAttemptLeavesATraceOfTheTrajectoryAndTheOutcome() {
  Fixture f;
  f.stack.serve();
  GraspScenario scenario(true);
  assert(f.run(8s, std::ref(scenario)) == NodeStatus::SUCCESS);

  const auto files = traceFiles(f.config);
  assert(files.size() == 1);
  const auto lines = readLines(files[0]);
  assert(hasLineStartingWith(lines, "# policy attempt started "));
  assert(hasLine(lines, "# result=released_held"));
  assert(hasLine(lines, "# grasp=held"));

  const auto rows = dataRows(lines);
  assert(rows.size() >= 20);
  double previous_time = -1.0;
  double lowest_j1 = 1e9;
  bool saw_closed_position = false;
  bool saw_running = false;
  bool stopping_after_running = true;
  bool seen_stopping = false;
  bool saw_currents = false;
  for (const auto& row : rows) {
    assert(row.size() == 24);
    if (!row[19].empty() && cell(row, 19) == -2440.0) saw_currents = true;  // i2_ma
    const double t = cell(row, 0);
    assert(t >= previous_time);
    previous_time = t;
    lowest_j1 = std::min(lowest_j1, cell(row, 2));
    if (!row[13].empty() && cell(row, 13) > 5000.0) saw_closed_position = true;
    if (row[1] == "running") {
      saw_running = true;
      if (seen_stopping) stopping_after_running = false;
    }
    if (row[1] == "stopping") seen_stopping = true;
  }
  assert(saw_running && seen_stopping && stopping_after_running);
  assert(lowest_j1 < -40.0);          // the arm's trip to the bin is in the record
  assert(saw_closed_position);        // so is the gripper closing
  assert(saw_currents);               // and the right arm's joint currents from /r/joint_currents
  removeTraceDir(f.config);
}

void testAFaultTraceNamesTheReason() {
  Fixture f;
  f.stack.serve();
  const auto script = [](FakeStack& s, double) {
    if (!s.activated()) return;
    s.r[4] = 2.0;
    s.r_target[4] = 2.0;
  };
  assert(f.run(5s, script) == NodeStatus::FAILURE);

  const auto files = traceFiles(f.config);
  assert(files.size() == 1);
  const auto lines = readLines(files[0]);
  assert(hasLine(lines, "# result=fault"));
  assert(hasLineStartingWith(lines, "# reason=joint J5"));
  removeTraceDir(f.config);
}

void testAFailedPreflightStillLeavesAFileWithTheReason() {
  Fixture f;
  f.stack.serve(true, true, true, /*router_estop=*/false);
  assert(f.run(3s) == NodeStatus::FAILURE);

  const auto files = traceFiles(f.config);
  assert(files.size() == 1);
  const auto lines = readLines(files[0]);
  assert(hasLine(lines, "# result=fault"));
  assert(hasLineStartingWith(lines, "# reason=policy is not ready to start"));
  assert(dataRows(lines).empty());  // it never ran, so there is no trajectory
  removeTraceDir(f.config);
}

void testTheTraceCanBeSwitchedOff() {
  PolicyTaskConfig config = fastConfig();
  config.trace.enabled = false;
  Fixture f(false, config);
  f.stack.serve();
  GraspScenario scenario(true);
  assert(f.run(8s, std::ref(scenario)) == NodeStatus::SUCCESS);

  assert(traceFiles(f.config).empty());
}

void testAnUnwritableTraceDirectoryDoesNotStopTheAttempt() {
  PolicyTaskConfig config = fastConfig();
  config.trace.dir = "/proc/no_such_place/policy-attempts";
  Fixture f(false, config);
  f.stack.serve();
  GraspScenario scenario(true);

  assert(f.run(8s, std::ref(scenario)) == NodeStatus::SUCCESS);

  expectStopsInOrder(f.stack);
}

void testAHaltedAttemptSaysSoInItsTrace() {
  Fixture f;
  f.stack.serve();
  assert(f.run(4s, nullptr, [&](NodeStatus) { return f.stack.activated(); }) == NodeStatus::RUNNING);
  f.run(150ms);

  f.node->halt();

  const auto files = traceFiles(f.config);
  assert(files.size() == 1);
  const auto lines = readLines(files[0]);
  assert(hasLine(lines, "# result=halted"));
  assert(!dataRows(lines).empty());
  removeTraceDir(f.config);
}

void testEachAttemptGetsItsOwnTraceFile() {
  Fixture f;
  f.stack.serve();
  GraspScenario first(true);
  assert(f.run(8s, std::ref(first)) == NodeStatus::SUCCESS);
  f.node->halt();
  f.stack.r_target = {-9.89, 18.05, 79.07, 15.5, 79.6, -6.2};
  f.stack.policy_gripper = 1.0;
  f.stack.gripper_position = 50.0;
  f.stack.torque_reached = false;
  f.settle(600ms);
  GraspScenario second(true);
  assert(f.run(8s, std::ref(second)) == NodeStatus::SUCCESS);

  const auto files = traceFiles(f.config);
  assert(files.size() == 2);
  for (const auto& file : files) assert(hasLine(readLines(file), "# result=released_held"));
  removeTraceDir(f.config);
}

// ---- wiring -------------------------------------------------------------------------------------

// ---- tasks and prompts -------------------------------------------------------------------------

// The pick-only demonstration once the bridge is active: reach down, close on the adapter, lift.
struct PickScenario {
  explicit PickScenario(bool turn_to_bin = false, double closed_position = 5700.0, bool torque = true)
      : to_bin(turn_to_bin), closed_at(closed_position), close_torque(torque) {}

  void operator()(FakeStack& s, double now) {
    if (armed_at < 0.0) {
      if (s.activated()) armed_at = now;
      return;
    }
    const double t = now - armed_at;
    if (t > 0.05) s.r_target[1] = 40.0;  // reach down
    if (t > 0.35 && !closed) {
      closed = true;
      s.policy_gripper = 0.0;
      s.gripper_position = closed_at;
      s.torque_reached = close_torque;
    }
    if (t > 0.8) {
      if (to_bin) {
        s.r_target[0] = -45.0;  // what the place task does next
      } else {
        s.r_target[1] = 25.0;  // lift 15 deg, keep holding
      }
    }
  }

  bool to_bin;
  double closed_at;
  bool close_torque;
  double armed_at{-1.0};
  bool closed{false};
};

void testThePickTaskSwitchesTheBridgePromptBeforeActivating() {
  Fixture f(false, fastConfig(), "pick");
  f.stack.serve();
  PickScenario scenario;

  assert(f.run(8s, std::ref(scenario)) == NodeStatus::SUCCESS);

  assert(!f.faultRaised());
  expectStopsInOrder(f.stack);
  assert(f.text(realman_bt::kPolicyAttemptResultKey) == "lifted_held");
  assert(f.text(realman_bt::kPolicyGraspVerdictKey) == "held");
  assert(f.stack.bridge_prompt == kPickPrompt);
  assert(!f.stack.prompts_received.empty());
  assert(f.stack.prompts_received.front().text == kPickPrompt);
  // The prompt went out, and was taken, before the bridge was allowed to publish anything.
  assert(f.stack.prompts_received.front().at < f.stack.calls.front().at);
}

void testThePlaceTaskKeepsThePlacePrompt() {
  Fixture f;
  f.stack.serve();
  GraspScenario scenario(true);
  assert(f.run(8s, std::ref(scenario)) == NodeStatus::SUCCESS);
  for (const auto& message : f.stack.prompts_received) assert(message.text == kPlacePrompt);
  assert(f.stack.bridge_prompt == kPlacePrompt);
}

void testABridgeThatKeepsTheWrongPromptIsAFaultAndNothingIsActivated() {
  Fixture f(false, fastConfig(), "pick");
  f.stack.serve();
  f.stack.follow_prompt = false;  // still on the place prompt

  assert(f.run(5s) == NodeStatus::FAILURE);

  assert(f.faultRaised());
  assert(f.stack.count("activate") == 0);
  const std::string reason = f.text(realman_bt::kPolicyFailureReasonKey);
  assert(reason.find("waiting for 'pick up the power adapter'") != std::string::npos);
  assert(reason.find("task pick") != std::string::npos);
}

void testABridgeThatDoesNotReportItsPromptIsAFault() {
  Fixture f;
  f.stack.serve();
  f.stack.report_prompt = false;  // a bridge from before the prompt was in /policy/stats

  assert(f.run(5s) == NodeStatus::FAILURE);

  assert(f.faultRaised());
  assert(f.stack.count("activate") == 0);
  assert(f.text(realman_bt::kPolicyFailureReasonKey).find("does not report its prompt") != std::string::npos);
}

void testThePickTaskTurningToTheBinIsAFaultAndStopsTheBridge() {
  Fixture f(false, fastConfig(), "pick");
  f.stack.serve();
  PickScenario scenario(true);

  assert(f.run(8s, std::ref(scenario)) == NodeStatus::FAILURE);

  assert(f.faultRaised());  // not retried: the policy does not follow the prompt
  expectStopsInOrder(f.stack);
  assert(f.text(realman_bt::kPolicyAttemptResultKey) == "wrong_task");
}

// A missed grasp that then heads for the bin is retryable: no fault, the bridge is still stopped.
void testThePickTaskTurningToTheBinWithEmptyJawsIsARetryableFailure() {
  Fixture f(false, fastConfig(), "pick");
  f.stack.serve();
  PickScenario scenario(true, 8431.0, false);

  assert(f.run(8s, std::ref(scenario)) == NodeStatus::FAILURE);

  assert(!f.faultRaised());
  expectStopsInOrder(f.stack);
  assert(f.text(realman_bt::kPolicyAttemptResultKey) == "wrong_side_empty");
  assert(f.text(realman_bt::kPolicyGraspVerdictKey) == "empty");
}

void testAnUnknownTaskStopsBeforeTouchingAnything() {
  Fixture f(false, fastConfig(), "stack");
  f.stack.serve();
  try {
    f.node->executeTick();
    assert(false);
  } catch (const std::runtime_error& error) {
    assert(std::string(error.what()).find("stack") != std::string::npos);
  }
  assert(f.stack.calls.empty() && f.stack.prompts_received.empty());
}

void testTheTraceNamesTheTaskAndItsPrompt() {
  Fixture f(false, fastConfig(), "pick");
  f.stack.serve();
  PickScenario scenario;
  assert(f.run(8s, std::ref(scenario)) == NodeStatus::SUCCESS);
  const auto files = traceFiles(f.config);
  assert(files.size() == 1);
  const auto lines = readLines(files[0]);
  assert(hasLine(lines, "# task=pick completion=lift_and_hold prompt='pick up the power adapter'"));
  assert(hasLine(lines, "# result=lifted_held"));
  removeTraceDir(f.config);
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

void testPortsAreDeclared() {
  const auto ports = PolicyRunNode::providedPorts();
  assert(ports.count("arm_id") == 1);
  assert(ports.count("task") == 1);
  assert(ports.count("dry_run") == 1);
}

}  // namespace

int main(int argc, char** argv) {
  rclcpp::init(argc, argv);
  testDryRunTouchesNothing();
  testAMissingServiceIsAFaultAndNothingIsSent();
  testMissingJointStatesOfAnotherArmIsAFault();
  testNoGripperReadingIsAFault();
  testABridgeThatIsNotInPolicyModeIsAFault();
  testASilentBridgeIsAPolicyTimeout();
  testABridgeWhoseServicesAreMissingIsAPolicyTimeout();
  testMissingRobotDataBesideASilentBridgeIsStillAFault();
  testAnActivationWithoutAnswerIsAPolicyTimeoutAndStillStopsTheBridge();
  testABridgeThatPausesWhileRunningIsAPolicyTimeoutAndStopsIt();
  testABridgeThatGoesSilentWhileRunningIsAPolicyTimeoutAndStopsIt();
  testABridgePausedBeforeTheAttemptIsResumedByTheActivation();
  testARetryableFailureRaisesNeitherFlag();
  testARefusedActivationIsAFaultAndStillStopsTheBridge();
  testAHeldObjectReleasedOverTheBinIsASuccess();
  testReleasingWithNothingHeldIsARetryableFailure();
  testNoReleaseInTimeIsARetryableTimeout();
  testAClosedGripperThatStopsMovingIsARetryableStall();
  testAJointOutsideTheEnvelopeStopsTheBridge();
  testAnotherArmDriftingStopsTheBridge();
  testLosingTheArmsJointStatesStopsTheBridge();
  testOperatorModeWaitsForSomeoneElseToActivate();
  testHaltingARunningAttemptStopsTheBridgeInOrderOnce();
  testHaltingBeforeAnythingWasStartedSendsNothing();
  testHaltingWhileWaitingForTheOperatorSendsNothing();
  testANewAttemptStartsCleanAfterAnAttempt();
  testASuccessfulAttemptLeavesATraceOfTheTrajectoryAndTheOutcome();
  testAFaultTraceNamesTheReason();
  testAFailedPreflightStillLeavesAFileWithTheReason();
  testTheTraceCanBeSwitchedOff();
  testAnUnwritableTraceDirectoryDoesNotStopTheAttempt();
  testAHaltedAttemptSaysSoInItsTrace();
  testEachAttemptGetsItsOwnTraceFile();
  testThePickTaskSwitchesTheBridgePromptBeforeActivating();
  testThePlaceTaskKeepsThePlacePrompt();
  testABridgeThatKeepsTheWrongPromptIsAFaultAndNothingIsActivated();
  testABridgeThatDoesNotReportItsPromptIsAFault();
  testThePickTaskTurningToTheBinIsAFaultAndStopsTheBridge();
  testThePickTaskTurningToTheBinWithEmptyJawsIsARetryableFailure();
  testAnUnknownTaskStopsBeforeTouchingAnything();
  testTheTraceNamesTheTaskAndItsPrompt();
  testItNeedsTheConfigurationToRun();
  testPortsAreDeclared();
  rclcpp::shutdown();
  return 0;
}
