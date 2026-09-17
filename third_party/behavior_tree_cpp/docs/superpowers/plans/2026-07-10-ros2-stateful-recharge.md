# Stateful ROS2 Recharge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Replace the cooldown-based recharge choreography with one reusable, stateful ROS2 action that consumes one battery event, publishes one recharge command per attempt, waits non-blockingly for one dock event, exposes callable executor start/stop services, and passes both mock and real Humble gates.

**Architecture:** RechargeTask is a direct bt_core::ActionNode with persistent publisher, subscription, and attempt phase. A small QoS helper is shared by RechargeTask and the generic subscriber base. The packaged tree owns one ReadBattery subscription and reuses its blackboard value in both decision branches. Mock tests prove the state machine deterministically; a service-driven ROS_DOMAIN_ID-isolated smoke proves the installed Humble graph.

**Tech Stack:** C++17, rclcpp Humble, std_msgs, sensor_msgs, std_srvs, ament_cmake, GoogleTest, Bash, colcon, ros2 CLI.

**Authoritative design:** docs/superpowers/specs/2026-07-10-commercial-sdk-recharge-design.md

**Spec DAG node:** ros2-stateful-recharge

**Dirty-worktree rule:** This continuation already contains user and prior-task changes in the same files. Each task ends with a scoped diff/checkpoint and two-stage review; do not reset, bulk-stage, or commit unrelated work. Commit only if the user later requests it.

---

## Locked design decisions

1. **Direct ActionNode, not composition from the existing bases.** RosOutputNode and RosSubscriberNode have final tick implementations and cannot express “publish once, then wait across ticks.”
2. **One ReadBattery node.** Keeping two lazy subscribers would require two battery messages. The first branch records the battery once; both comparisons read the same blackboard value.
3. **Terminal phases latch until halt.** Repeated ticks after SUCCESS or FAILURE do not republish. RetryNode starts a new attempt by calling child()->halt(), which reaches RechargeTask::onHalted().
4. **Interfaces survive halt.** onHalted resets attempt state and stale dock data but retains the publisher and subscription.
5. **Dock success wins at the timeout boundary.** The running phase checks docked before elapsed timeout.
6. **timeout_ms <= 0 disables timeout.** This matches the existing subscriber freshness convention; tests use a small positive timeout.
7. **Mock changes are additive.** Existing deliver(&msg), last_publisher_, and last_topic_ remain valid while topic-addressed delivery and typed lookup are added.
8. **Humble is the available runtime gate.** Jazzy remains explicitly unverified because /opt/ros/jazzy/setup.bash is absent.

### Task 1: Add QoS Profiles And Topic-Addressed Mock ROS

**Files:**
- Create: bt_ros2/include/bt_ros2/ros_qos.hpp
- Modify: bt_ros2/include/bt_ros2/ros_subscriber_node.hpp
- Modify: tests/mock_rclcpp/rclcpp/rclcpp.hpp
- Modify: tests/test_ros_bases.cpp

- [x] **Step 1: Write the failing mock-routing and QoS tests**

Add tests before changing the mock:

~~~cpp
TEST_F(RosBasesTest, MockRoutesMessagesByTopicWithoutCrossTalk) {
  auto cfg_a = makeCfg(bb, {{"topic", "/scalar/a"}, {"timeout_ms", "0"}},
                       {{"value", "a"}});
  auto cfg_b = makeCfg(bb, {{"topic", "/scalar/b"}, {"timeout_ms", "0"}},
                       {{"value", "b"}});
  bt_ros2::ReadScalar a("a", cfg_a);
  bt_ros2::ReadScalar b("b", cfg_b);

  EXPECT_EQ(a.tick(), NodeStatus::FAILURE);
  EXPECT_EQ(b.tick(), NodeStatus::FAILURE);

  auto msg = std::make_shared<std_msgs::msg::Float64>();
  msg->data = 7.5;
  node.deliver("/scalar/a", &msg);

  EXPECT_EQ(a.tick(), NodeStatus::SUCCESS);
  EXPECT_EQ(b.tick(), NodeStatus::FAILURE);
  EXPECT_DOUBLE_EQ(bb->get<double>("a").value(), 7.5);
  EXPECT_FALSE(bb->contains("b"));
}

TEST_F(RosBasesTest, SubscriberUsesSensorDataProfileAndConfiguredDepth) {
  auto cfg = makeCfg(bb, {{"topic", "/range"},
                          {"timeout_ms", "0"},
                          {"qos_depth", "7"},
                          {"qos_profile", "sensor_data"},
                          {"threshold", "1.0"}});
  IsClose n("sensor_qos", cfg);
  EXPECT_EQ(n.tick(), NodeStatus::FAILURE);

  auto sub = node.subscription<RangeMsg>("/range");
  ASSERT_NE(sub, nullptr);
  EXPECT_EQ(sub->qos.profile, "sensor_data");
  EXPECT_EQ(sub->qos.depth(), 7u);
}

TEST_F(RosBasesTest, SubscriberRejectsUnknownQosProfile) {
  auto cfg = makeCfg(bb, {{"topic", "/range"},
                          {"qos_profile", "unknown"},
                          {"threshold", "1.0"}});
  IsClose n("bad_qos", cfg);
  EXPECT_THROW(n.tick(), std::runtime_error);
}
~~~

Also update the existing subscriber port assertions to expect qos_profile and a total of five ports for subclasses with one custom port:

~~~cpp
EXPECT_TRUE(ports.count("qos_profile"));
EXPECT_EQ(ports.at("qos_profile").default_value, "default");
EXPECT_EQ(ports.size(), 5u);
~~~

- [x] **Step 2: Run the focused target and verify RED**

Run:

~~~bash
cmake -S . -B build +  -DBT_BUILD_NODES=ON +  -DBT_BUILD_SERVER=OFF +  -DBT_BUILD_TESTS=ON +  -DBT_BUILD_EXAMPLES=OFF
cmake --build build --target test_ros_bases --parallel
~~~

Expected: compilation fails because topic-addressed deliver(), subscription(), SensorDataQoS metadata, and qos_profile do not exist.

- [x] **Step 3: Implement the shared QoS selector**

Create bt_ros2/include/bt_ros2/ros_qos.hpp:

~~~cpp
#ifndef BT_ROS2_ROS_QOS_HPP
#define BT_ROS2_ROS_QOS_HPP

#include <stdexcept>
#include <string>

#include "rclcpp/rclcpp.hpp"

namespace bt_ros2 {

inline rclcpp::QoS makeSubscriptionQos(
    int depth, const std::string& profile) {
  if (depth <= 0) {
    throw std::runtime_error("qos_depth must be greater than zero");
  }
  if (profile == "default") {
    return rclcpp::QoS(
        rclcpp::KeepLast(static_cast<size_t>(depth)));
  }
  if (profile == "sensor_data") {
    rclcpp::QoS qos = rclcpp::SensorDataQoS();
    qos.keep_last(static_cast<size_t>(depth));
    return qos;
  }
  throw std::runtime_error(
      "unsupported qos_profile '" + profile +
      "'; expected default or sensor_data");
}

}  // namespace bt_ros2

#endif  // BT_ROS2_ROS_QOS_HPP
~~~

- [x] **Step 4: Extend the mock without breaking existing tests**

In tests/mock_rclcpp/rclcpp/rclcpp.hpp:

- add stdexcept and typeindex includes;
- store topic and copied QoS on Publisher and Subscription;
- store type-erased publisher/subscription records keyed by topic and type;
- add typed publisher<MsgT>(topic) and subscription<MsgT>(topic);
- add deliver(topic, PtrT*) while retaining deliver(PtrT*);
- retain last_publisher_ and last_topic_.

Use this QoS surface:

~~~cpp
struct QoS {
  KeepLast k;
  std::string profile{"default"};

  explicit QoS(KeepLast value) : k(value) {}
  explicit QoS(size_t depth) : k(KeepLast(depth)) {}

  QoS& keep_last(size_t depth) {
    k.d = depth;
    return *this;
  }
  size_t depth() const { return k.d; }
};

struct SensorDataQoS : QoS {
  SensorDataQoS() : QoS(KeepLast(5)) {
    profile = "sensor_data";
  }
};
~~~

The new delivery overload must match both topic and std::type_index(typeid(PtrT)); throw a descriptive runtime_error when no matching subscription exists. The legacy overload continues dispatching to the most recently created subscription.

- [x] **Step 5: Wire qos_profile into RosSubscriberNodeBase**

Add this port:

~~~cpp
bt_core::InputPort<std::string>(
    "qos_profile", "default", "订阅 QoS 配置",
    {"default", "sensor_data"})
~~~

In ensureSubscription(), read qos_profile with value_or("default") and replace the direct QoS construction:

~~~cpp
const std::string profile =
    this->template getInput<std::string>("qos_profile")
        .value_or("default");
sub_ = node->template create_subscription<MsgT>(
    topic, makeSubscriptionQos(depth, profile),
    [this](const typename MsgT::SharedPtr msg) {
      last_msg_ = *msg;
      last_recv_ = std::chrono::steady_clock::now();
      received_ = true;
    });
~~~

- [x] **Step 6: Verify GREEN and compatibility**

Run:

~~~bash
cmake --build build --target test_ros_bases --parallel
./build/bin/test_ros_bases +  --gtest_filter='RosBasesTest.MockRoutesMessagesByTopicWithoutCrossTalk:RosBasesTest.Subscriber*'
./build/bin/test_ros_bases +  --gtest_filter='RosBasesTest.IsDocked*:RosBasesTest.PublishRechargeCommand*:RosBasesTest.OutputNode*'
~~~

Expected: new QoS/routing tests pass and legacy delivery/publisher tests remain green.

### Task 2: Make ReadBattery Wait For External Data

**Files:**
- Modify: bt_ros2/include/bt_ros2/example_data_nodes.hpp
- Modify: tests/test_ros_bases.cpp

- [x] **Step 1: Write the failing waiting tests**

~~~cpp
TEST_F(RosBasesTest, ReadBatteryReturnsRunningBeforeFirstMessage) {
  auto cfg = makeCfg(bb,
                     {{"topic", "/battery_state"}, {"timeout_ms", "0"}},
                     {{"level", "battery_level"}});
  bt_ros2::ReadBattery n("battery", cfg);
  EXPECT_EQ(n.tick(), NodeStatus::RUNNING);
  EXPECT_FALSE(bb->contains("battery_level"));
}

TEST_F(RosBasesTest, ReadBatteryReturnsRunningAfterMessageExpires) {
  auto cfg = makeCfg(bb,
                     {{"topic", "/battery_state"}, {"timeout_ms", "1"}},
                     {{"level", "battery_level"}});
  bt_ros2::ReadBattery n("battery", cfg);
  EXPECT_EQ(n.tick(), NodeStatus::RUNNING);

  auto msg = std::make_shared<sensor_msgs::msg::BatteryState>();
  msg->percentage = 0.42F;
  node.deliver("/battery_state", &msg);
  EXPECT_EQ(n.tick(), NodeStatus::SUCCESS);

  std::this_thread::sleep_for(std::chrono::milliseconds(10));
  EXPECT_EQ(n.tick(), NodeStatus::RUNNING);
}
~~~

Update existing tests that currently expect ReadBattery’s first tick, or a tree blocked on ReadBattery, to return RUNNING rather than FAILURE.

- [x] **Step 2: Verify RED**

Run:

~~~bash
cmake --build build --target test_ros_bases --parallel
./build/bin/test_ros_bases --gtest_filter='RosBasesTest.ReadBattery*'
~~~

Expected: the new assertions report FAILURE instead of RUNNING.

- [x] **Step 3: Override only ReadBattery’s no-data hook**

Add to ReadBattery:

~~~cpp
protected:
  bt_core::NodeStatus onNoFreshData() override {
    return bt_core::NodeStatus::RUNNING;
  }
~~~

Do not change RosSubscriberNodeBase’s generic default; condition nodes and ReadScalar retain FAILURE when no fresh data exists.

- [x] **Step 4: Verify GREEN**

Run the ReadBattery tests and the generic subscriber tests. Expected: ReadBattery waits with RUNNING, while IsDocked, IsClose, and ReadScalar retain their established semantics.

### Task 3: Implement The RechargeTask State Machine

**Files:**
- Create: bt_ros2/include/bt_ros2/recharge_task.hpp
- Create: bt_ros2/src/recharge_task.cpp
- Modify: tests/CMakeLists.txt
- Modify: tests/test_ros_bases.cpp

- [x] **Step 1: Add the source to the mock test target**

Add the future source beside node_registration.cpp:

~~~cmake
add_executable(test_ros_bases
  test_ros_bases.cpp
  ${CMAKE_SOURCE_DIR}/bt_ros2/src/recharge_task.cpp
  ${CMAKE_SOURCE_DIR}/bt_ros2/src/node_registration.cpp
  ${CMAKE_SOURCE_DIR}/bt_ros2/src/ros_topic_action_node.cpp
  ${CMAKE_SOURCE_DIR}/bt_ros2/src/ros_topic_condition_node.cpp
)
~~~

- [x] **Step 2: Write all failing state-machine tests**

Add named tests for:

- RechargeTaskExposesDocumentedPortsAndDefaults;
- RechargeTaskFirstTickCreatesInterfacesPublishesOnceAndRuns;
- RechargeTaskUsesConfiguredTopicsAndQos;
- RechargeTaskRemainsRunningWithoutDockAndDoesNotRepublish;
- RechargeTaskSucceedsAfterDockMessage;
- RechargeTaskFailsAfterTimeout;
- RechargeTaskDockSuccessWinsWhenTimeoutAlsoElapsed;
- RechargeTaskSuccessStaysLatchedWithoutRepublishing;
- RechargeTaskFailureStaysLatchedWithoutRepublishing;
- RechargeTaskHaltStartsFreshAttemptWithoutRecreatingInterfaces.

Use this pattern for the core invariant:

~~~cpp
auto cfg = makeCfg(bb, {{"timeout_ms", "1000"}});
bt_ros2::RechargeTask task("recharge", cfg);

EXPECT_EQ(task.tick(), NodeStatus::RUNNING);
auto command =
    node.publisher<std_msgs::msg::String>("/robot/command");
auto dock =
    node.subscription<std_msgs::msg::Bool>("/dock/is_docked");
ASSERT_NE(command, nullptr);
ASSERT_NE(dock, nullptr);
ASSERT_EQ(command->published.size(), 1u);
EXPECT_EQ(command->published.front().data,
          "start_recharge:main_dock");

EXPECT_EQ(task.tick(), NodeStatus::RUNNING);
EXPECT_EQ(command->published.size(), 1u);

auto docked = std::make_shared<std_msgs::msg::Bool>();
docked->data = true;
node.deliver("/dock/is_docked", &docked);
EXPECT_EQ(task.tick(), NodeStatus::SUCCESS);
EXPECT_EQ(task.tick(), NodeStatus::SUCCESS);
EXPECT_EQ(command->published.size(), 1u);
~~~

Timeout and precedence tests use timeout_ms=1 and a 10 ms wait. Deliver true after the wait in the precedence test and require SUCCESS.

The halt/retry test saves the publisher and subscription pointers, calls task.halt(), delivers stale true while idle, then requires the next tick to return RUNNING, reuse both pointers, and raise the command count from one to exactly two.

- [x] **Step 3: Verify RED**

Run:

~~~bash
cmake --build build --target test_ros_bases --parallel
~~~

Expected: compilation fails because recharge_task.hpp/.cpp and RechargeTask do not exist.

- [x] **Step 4: Declare the action and exact seven ports**

Use this class shape:

~~~cpp
class RechargeTask final : public bt_core::ActionNode {
 public:
  using bt_core::ActionNode::ActionNode;

  static bt_core::PortsList providedPorts();
  bt_core::NodeStatus tick() override;
  void onHalted() override;

 private:
  enum class Phase { IDLE, RUNNING, SUCCEEDED, FAILED };
  void ensureRosInterfaces();

  rclcpp::Publisher<std_msgs::msg::String>::SharedPtr command_pub_;
  rclcpp::Subscription<std_msgs::msg::Bool>::SharedPtr dock_sub_;
  Phase phase_{Phase::IDLE};
  bool docked_{false};
  int timeout_ms_{30000};
  std::chrono::steady_clock::time_point attempt_started_{};
};
~~~

providedPorts() returns exactly:

~~~cpp
return bt_core::makePorts(
    bt_core::InputPort<std::string>(
        "command_topic", "/robot/command", "回充命令话题"),
    bt_core::InputPort<std::string>(
        "dock_topic", "/dock/is_docked", "对接状态话题"),
    bt_core::InputPort<std::string>(
        "target", "main_dock", "目标充电桩"),
    bt_core::InputPort<int>(
        "timeout_ms", "30000", "等待超时；<=0 表示不超时"),
    bt_core::InputPort<int>(
        "command_qos_depth", "10", "命令发布队列深度"),
    bt_core::InputPort<int>(
        "dock_qos_depth", "10", "对接订阅队列深度"),
    bt_core::InputPort<std::string>(
        "dock_qos_profile", "default", "对接订阅 QoS",
        {"default", "sensor_data"}));
~~~

- [x] **Step 5: Implement lazy interfaces and terminal latching**

ensureRosInterfaces() reads and validates the two topics and depths once, creates the command publisher with default QoS, and creates the dock subscription with makeSubscriptionQos(). The callback only updates docked_; the documented single-thread executor supplies serialization.

tick() follows this exact order:

~~~cpp
if (phase_ == Phase::SUCCEEDED) {
  return bt_core::NodeStatus::SUCCESS;
}
if (phase_ == Phase::FAILED) {
  return bt_core::NodeStatus::FAILURE;
}

ensureRosInterfaces();

if (phase_ == Phase::IDLE) {
  docked_ = false;
  timeout_ms_ = getInput<int>("timeout_ms").value_or(30000);
  attempt_started_ = std::chrono::steady_clock::now();

  std_msgs::msg::String command;
  command.data =
      "start_recharge:" +
      getInput<std::string>("target").value_or("main_dock");
  command_pub_->publish(command);
  phase_ = Phase::RUNNING;
  return bt_core::NodeStatus::RUNNING;
}

if (docked_) {
  phase_ = Phase::SUCCEEDED;
  return bt_core::NodeStatus::SUCCESS;
}

if (timeout_ms_ > 0 &&
    std::chrono::steady_clock::now() - attempt_started_ >=
        std::chrono::milliseconds(timeout_ms_)) {
  phase_ = Phase::FAILED;
  return bt_core::NodeStatus::FAILURE;
}
return bt_core::NodeStatus::RUNNING;
~~~

onHalted() sets phase_ to IDLE, docked_ to false, and clears attempt_started_. It must not reset command_pub_ or dock_sub_.

- [x] **Step 6: Verify GREEN**

Run:

~~~bash
cmake --build build --target test_ros_bases --parallel
./build/bin/test_ros_bases --gtest_filter='RosBasesTest.RechargeTask*'
~~~

Expected: every state transition, latch, timeout, precedence, and retry assertion passes with exactly one publish per attempt.

### Task 4: Register RechargeTask And Package The Eight-Node Tree

**Files:**
- Modify: bt_ros2/src/node_registration.cpp
- Modify: bt_ros2/CMakeLists.txt
- Modify: bt_ros2/trees/recharge.xml
- Modify: tests/test_ros_bases.cpp

- [x] **Step 1: Write failing registration and packaged-flow tests**

Extend DefaultRegistrationCatalogExposesFullNodeSet:

~~~cpp
EXPECT_TRUE(factory.isRegistered("RechargeTask"));
EXPECT_TRUE(factory.isRegistered("IsDocked"));
EXPECT_TRUE(factory.isRegistered("PublishRechargeCommand"));
EXPECT_TRUE(factory.isRegistered("TaskDoneNotifier"));
EXPECT_EQ(factory.size(), 35u);
~~~

Strengthen the packaged-tree test:

~~~cpp
bt_core::Tree tree = parser.loadFromFile(tree_path, bb);
EXPECT_EQ(tree.nodes().size(), 8u);
EXPECT_EQ(tree.tickOnce(), NodeStatus::RUNNING);

auto battery =
    std::make_shared<sensor_msgs::msg::BatteryState>();
battery->percentage = 0.18F;
node.deliver("/battery_state", &battery);

EXPECT_EQ(tree.tickOnce(), NodeStatus::RUNNING);
auto command =
    node.publisher<std_msgs::msg::String>("/robot/command");
ASSERT_NE(command, nullptr);
ASSERT_EQ(command->published.size(), 1u);

EXPECT_EQ(tree.tickOnce(), NodeStatus::RUNNING);
EXPECT_EQ(command->published.size(), 1u);

auto docked = std::make_shared<std_msgs::msg::Bool>();
docked->data = true;
node.deliver("/dock/is_docked", &docked);
EXPECT_EQ(tree.tickOnce(), NodeStatus::SUCCESS);

auto done =
    node.publisher<std_msgs::msg::String>("/bt/task_done");
ASSERT_NE(done, nullptr);
ASSERT_EQ(done->published.size(), 1u);
EXPECT_EQ(done->published.front().data, "task_done:recharge");
~~~

- [x] **Step 2: Verify RED**

Run the two registration/tree tests. Expected: RechargeTask is unregistered, the factory has 34 types, and the current XML has 11 nodes.

- [x] **Step 3: Register and compile RechargeTask**

Add src/recharge_task.cpp to bt_ros2_lib. Include bt_ros2/recharge_task.hpp in node_registration.cpp and add:

~~~cpp
registerIfMissing<RechargeTask>(factory, "RechargeTask");
~~~

Keep IsDocked, PublishRechargeCommand, and TaskDoneNotifier registered for source/XML compatibility.

- [x] **Step 4: Replace the XML choreography**

The final tree body is:

~~~xml
<Fallback name="battery_guard">
  <Sequence name="battery_ok">
    <ReadBattery name="read_battery"
                 topic="/battery_state"
                 timeout_ms="2000"
                 qos_profile="sensor_data"
                 level="{battery_level}"/>
    <CompareBlackboard name="enough_power"
                       key="battery_level"
                       op="&gt;="
                       value="0.20"/>
  </Sequence>

  <Sequence name="recharge_flow">
    <CompareBlackboard name="needs_recharge"
                       key="battery_level"
                       op="&lt;"
                       value="0.20"/>
    <RechargeTask name="recharge"
                  command_topic="/robot/command"
                  dock_topic="/dock/is_docked"
                  target="main_dock"
                  timeout_ms="30000"
                  command_qos_depth="10"
                  dock_qos_depth="10"
                  dock_qos_profile="default"/>
    <TaskDoneNotifier name="notify_recharge_done"
                      topic="/bt/task_done"
                      task_name="recharge"/>
  </Sequence>
</Fallback>
~~~

This is exactly eight nodes: one Fallback, two Sequences, one ReadBattery, two CompareBlackboard nodes, one RechargeTask, and one notifier.

- [x] **Step 5: Verify GREEN and legacy compatibility**

Run:

~~~bash
cmake --build build --target test_ros_bases --parallel
./build/bin/test_ros_bases +  --gtest_filter='RosBasesTest.DefaultRegistrationCatalog*:RosBasesTest.IsDocked*:RosBasesTest.PublishRechargeCommand*'
~~~

Expected: 35 registrations, packaged tree flow succeeds from one battery and one dock event, and all compatibility nodes remain green.

### Task 5: Write The Final Humble Smoke Before Adding Services

**Files:**
- Rewrite: scripts/smoke_ros2.sh

- [x] **Step 1: Replace fixed choreography with bounded observation helpers**

The script must:

- source /opt/ros/humble/setup.bash only when ROS_DISTRO is unset;
- export ROS_DOMAIN_ID from BT_ROS2_SMOKE_DOMAIN_ID, then existing ROS_DOMAIN_ID, then a PID-derived value in 100..199;
- build in a unique caller-supplied or mktemp directory;
- retain logs after cleanup;
- use ros2 service/topic commands with --no-daemon where supported;
- start unbuffered command, done, and status echoes before events;
- fail immediately if the launch process exits;
- use sleep only as the short interval inside bounded polling.

Use a helper with this behavior:

~~~bash
wait_until() {
  local label="$1"
  local timeout_s="$2"
  shift 2
  local deadline=$((SECONDS + timeout_s))
  until "$@"; do
    if ! kill -0 "$LAUNCH_PID" >/dev/null 2>&1; then
      echo "[ros2-smoke] launch exited while waiting for $label" >&2
      return 1
    fi
    if (( SECONDS >= deadline )); then
      echo "[ros2-smoke] timeout waiting for $label" >&2
      return 1
    fi
    sleep 0.2
  done
}
~~~

Define named predicates for:

- exact Trigger service/type discovery;
- topic subscription counts;
- exact log-line counts;
- launch log registration count 35 and tree node count 8.

- [x] **Step 2: Encode the exact service and event sequence**

Launch with:

~~~bash
ros2 launch bt_ros2 bt_executor.launch.py +  tree_file:="$TREE_FILE" +  tick_rate_hz:=10.0 +  autostart:=false +  stop_on_terminal:=true >"$LAUNCH_LOG" 2>&1 &
~~~

Then:

1. wait for /bt_executor/start and /bt_executor/stop as std_srvs/srv/Trigger;
2. call start twice and assert started, then already running;
3. wait for RUNNING status and one /battery_state subscriber;
4. call stop twice and assert stopped, then already stopped;
5. call start once;
6. publish exactly one BatteryState using --once --wait-matching-subscriptions 1;
7. wait for exactly one start_recharge:main_dock line and one dock subscriber;
8. publish exactly one Bool dock event;
9. wait for exactly one task_done:recharge line and terminal SUCCESS;
10. call stop twice after terminal and require success;
11. terminate and wait for launch/echo processes;
12. assert command count 1, notifier count 1, and final status SUCCESS.

Use:

~~~bash
ros2 topic pub --once --wait-matching-subscriptions 1 +  /battery_state sensor_msgs/msg/BatteryState +  '{percentage: 0.18}'

ros2 topic pub --once --wait-matching-subscriptions 1 +  /dock/is_docked std_msgs/msg/Bool +  '{data: true}'
~~~

Use PYTHONUNBUFFERED=1 ros2 topic echo --field data so grep -cFx assertions operate on stable one-line payloads.

- [x] **Step 3: Run the real smoke and verify RED**

Run:

~~~bash
set +u
source /opt/ros/humble/setup.bash
set -u
ROS_DOMAIN_ID=173 +BT_ROS2_SMOKE_ROOT="$(mktemp -d)" +./scripts/smoke_ros2.sh
~~~

Expected: bounded failure while waiting for /bt_executor/start because the executor does not yet expose Trigger services. Preserve the RED log path.

### Task 6: Add Executor Services, Dependencies, And Public Contract

**Files:**
- Modify: bt_core/include/bt_core/tree_node.hpp
- Modify: bt_core/include/bt_core/leaf_node.hpp
- Modify: bt_core/include/bt_core/control_node.hpp
- Modify: bt_core/include/bt_core/decorator_node.hpp
- Modify: bt_core/include/bt_core/tree.hpp
- Modify: bt_ros2/include/bt_ros2/bt_executor_node.hpp
- Modify: bt_ros2/include/bt_ros2/ros_publisher_node.hpp
- Modify: bt_ros2/src/bt_executor_node.cpp
- Modify: bt_ros2/CMakeLists.txt
- Modify: bt_ros2/package.xml
- Modify: bt_ros2/README.md
- Modify: bt_ros2/trees/recharge.xml
- Modify: scripts/smoke_ros2.sh
- Modify: tests/mock_rclcpp/rclcpp/rclcpp.hpp
- Modify: tests/test_bt_advanced.cpp
- Modify: tests/test_ros_bases.cpp

- [x] **Step 1: Add std_srvs to the public build surface**

In CMake:

~~~cmake
find_package(std_srvs REQUIRED)

ament_target_dependencies(
  bt_ros2_lib PUBLIC
  rclcpp rclcpp_action std_msgs sensor_msgs std_srvs)

ament_export_dependencies(
  rclcpp rclcpp_action std_msgs sensor_msgs std_srvs)
~~~

In package.xml:

~~~xml
<depend>std_srvs</depend>
<exec_depend>ament_index_python</exec_depend>
<exec_depend>launch</exec_depend>
<exec_depend>launch_ros</exec_depend>
~~~

The three Python packages are launch-time dependencies; do not add unnecessary CMake find_package calls for them.

- [x] **Step 2: Declare and create idempotent services**

Include functional in the implementation and std_srvs/srv/trigger.hpp in the
public header. Add the Trigger alias, callbacks, and two service members:

~~~cpp
using Trigger = std_srvs::srv::Trigger;

void handleStart(
    const std::shared_ptr<Trigger::Request>,
    std::shared_ptr<Trigger::Response> response);
void handleStop(
    const std::shared_ptr<Trigger::Request>,
    std::shared_ptr<Trigger::Response> response);

rclcpp::Service<Trigger>::SharedPtr start_service_;
rclcpp::Service<Trigger>::SharedPtr stop_service_;
~~~

After loadTree() and before the autostart branch, create ~/start and ~/stop with std::bind.

~~~cpp
start_service_ = create_service<Trigger>(
    "~/start",
    std::bind(&BtExecutorNode::handleStart, this,
              std::placeholders::_1, std::placeholders::_2));
stop_service_ = create_service<Trigger>(
    "~/stop",
    std::bind(&BtExecutorNode::handleStop, this,
              std::placeholders::_1, std::placeholders::_2));
~~~

Callbacks:

~~~cpp
void BtExecutorNode::handleStart(
    const std::shared_ptr<Trigger::Request>,
    std::shared_ptr<Trigger::Response> response) {
  const bool was_running = static_cast<bool>(timer_);
  start();
  response->success = true;
  response->message =
      was_running ? "already running" : "started";
}

void BtExecutorNode::handleStop(
    const std::shared_ptr<Trigger::Request>,
    std::shared_ptr<Trigger::Response> response) {
  const bool was_running = static_cast<bool>(timer_);
  stop();
  response->success = true;
  response->message =
      was_running ? "stopped" : "already stopped";
}
~~~

The node name bt_executor makes the resolved services /bt_executor/start and /bt_executor/stop.

- [x] **Step 3: Update the package README**

Document:

- the seven RechargeTask ports/defaults and state transitions;
- default versus sensor_data subscriber QoS;
- one command per attempt and halt/retry semantics;
- autostart=false with the two Trigger calls;
- the exact one-battery/one-dock tutorial commands;
- the safety boundary: String is a demo protocol, not execution acknowledgement; production/safety-critical robots should use a typed ROS2 Action or idempotent command/ack protocol;
- Humble verification and Jazzy’s unverified status.

The post-smoke notifier repair adds `subscriber_wait_timeout_ms` to
`RosOutputNode`: the default `0` preserves immediate legacy publishing; a
positive value waits non-blockingly for a matched subscriber, publishes once
after a match or the finite timeout, latches `SUCCESS`, and resets the wait and
latch on `halt()`. The packaged `TaskDoneNotifier` uses `3000` ms.

Executor stop also has a lifecycle contract below the ROS wrapper. Each node
records that it executed until an explicit halt completes. Control and
decorator nodes therefore reset terminal descendants that participated in the
attempt, skip never-started leaves, and make repeated stop a no-op. `Tree::halt`
applies the same guard at the root, including an ActionNode root.

- [x] **Step 4: Verify GREEN on Humble**

Run a fresh mock build:

~~~bash
UNIT_BUILD="$(mktemp -d)"
cmake -S . -B "$UNIT_BUILD" \
  -DCMAKE_BUILD_TYPE=Debug \
  -DBT_BUILD_NODES=ON \
  -DBT_BUILD_SERVER=OFF \
  -DBT_BUILD_TESTS=ON \
  -DBT_BUILD_EXAMPLES=OFF
cmake --build "$UNIT_BUILD" --target test_ros_bases --parallel
"$UNIT_BUILD/bin/test_ros_bases"
~~~

Run a fresh top-level Humble build:

~~~bash
set +u
source /opt/ros/humble/setup.bash
set -u
TOP_BUILD="$(mktemp -d)"
cmake -S . -B "$TOP_BUILD" \
  -DCMAKE_BUILD_TYPE=Release \
  -DBT_BUILD_NODES=ON \
  -DBT_BUILD_SERVER=OFF \
  -DBT_BUILD_ROS2=ON \
  -DBT_BUILD_TESTS=ON \
  -DBT_BUILD_EXAMPLES=OFF
cmake --build "$TOP_BUILD" --parallel
ctest --test-dir "$TOP_BUILD" --output-on-failure
~~~

Run the isolated smoke:

~~~bash
ROS_DOMAIN_ID=173 \
BT_ROS2_SMOKE_ROOT="$(mktemp -d)" \
./scripts/smoke_ros2.sh
~~~

Expected: one battery, one command, one dock, one notifier, final SUCCESS, and idempotent service responses.

- [x] **Step 5: Run hygiene and environment assertions**

~~~bash
bash -n scripts/smoke_ros2.sh scripts/test.sh
PYTHONPYCACHEPREFIX="$(mktemp -d)" \
  python3 -m py_compile bt_ros2/launch/bt_executor.launch.py
python3 - <<'PY'
import xml.etree.ElementTree as ET
ET.parse("bt_ros2/package.xml")
ET.parse("bt_ros2/trees/recharge.xml")
PY
git diff --check
test -f /opt/ros/humble/setup.bash
test ! -f /opt/ros/jazzy/setup.bash
~~~

Keep package XML lint deterministic offline: do not add a remote `xml-model`
processing instruction. The ROS lint-auto gate intentionally excludes
copyright, cpplint, and uncrustify; only cppcheck, flake8, lint_cmake, pep257,
and xmllint are configured and may be reported as passing.

Report Jazzy exactly as: “unverified: ROS 2 Jazzy is not installed on this machine.”

- [x] **Step 6: Two-stage review and Master acceptance**

First dispatch a specification reviewer against Section 4 and Section 7 of the authoritative design plus this plan. After approval, dispatch a different quality reviewer focusing on state latching, single-thread assumptions, mock type safety, service idempotency, shell cleanup, graph readiness, QoS compatibility, and preservation of legacy nodes.

Fix every Critical/Important finding, rerun the focused and real gates, then move ros2-stateful-recharge through worker_tested [_] to Master-accepted [x] in .codex/spec-dag.json. Validate both transitions with:

~~~bash
node ~/.codex/scripts/spec-dag-check.mjs .codex/spec-dag.json
~~~

The Master evidence must include current outputs for mock tests, top-level Humble build/CTest, isolated smoke, reviews, bash syntax, XML/package parsing, and the explicit Jazzy gap.
