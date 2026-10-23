#include <chrono>
#include <cstdlib>
#include <filesystem>
#include <fstream>
#include <functional>
#include <iterator>
#include <memory>
#include <stdexcept>
#include <string>
#include <thread>
#include <vector>

#include "realman_bt/realman_bt_executor_node.hpp"
#include "realman_msgs/msg/input_mode_state.hpp"
#include "realman_msgs/srv/list_input_modes.hpp"
#include "realman_msgs/srv/select_input_mode.hpp"

namespace {
using namespace std::chrono_literals;
using State = realman_msgs::msg::InputModeState;
using List = realman_msgs::srv::ListInputModes;
using Select = realman_msgs::srv::SelectInputMode;
using Trigger = std_srvs::srv::Trigger;
constexpr auto kList = "/realman_bt_executor/list_input_modes";
constexpr auto kSelect = "/realman_bt_executor/select_input_mode";
constexpr auto kState = "/realman_bt_executor/input_mode_state";

void require(bool condition, const std::string& detail) {
  if (!condition) throw std::runtime_error(detail);
}

std::string readFile(const std::filesystem::path& path) {
  std::ifstream stream(path);
  require(stream.good(), "cannot read test artifact: " + path.string());
  return {std::istreambuf_iterator<char>(stream), {}};
}

std::string routerXml() {
  return readFile(std::filesystem::path(BT_TEST_CONFIG_DIR) / "control.xml");
}

void replaceOnce(std::string& text, const std::string& from, const std::string& to) {
  const auto position = text.find(from);
  require(position != std::string::npos, "test XML replacement target missing");
  text.replace(position, from.size(), to);
}

struct Fixture {
  Fixture() {
    char pattern[] = "/tmp/realman-input-mode-executor-XXXXXX";
    const auto directory = mkdtemp(pattern);
    require(directory != nullptr, "cannot create temporary test directory");
    path = directory;
    client_node = std::make_shared<rclcpp::Node>("input_mode_executor_test");
    executor.add_node(client_node);
  }

  ~Fixture() {
    if (node) executor.remove_node(node);
    node.reset();
    executor.remove_node(client_node);
    std::filesystem::remove_all(path);
  }

  void load(const std::string& xml, std::vector<rclcpp::Parameter> extra = {}) {
    const auto tree_file = path / "router.xml";
    std::ofstream(tree_file) << xml;
    std::vector<rclcpp::Parameter> parameters{
        {"tree_file", tree_file.string()},
        {"runtime_snapshot_file", (path / "runtime.json").string()},
        {"autostart", false}, {"exit_on_terminal", false},
        {"stop_on_terminal", false}, {"tick_rate_hz", 20.0},
        // Every non-idle branch starts by moving the arms to a start pose read from these.
        {"pika_l_joint_degrees", "0,0,0,0,0,0"},
        {"pika_m_joint_degrees", "0,0,0,0,0,0"},
        {"pika_r_joint_degrees", "0,0,0,0,0,0"}};
    parameters.insert(parameters.end(), extra.begin(), extra.end());
    node = std::make_shared<realman_bt::RealmanBtExecutorNode>(
        rclcpp::NodeOptions().parameter_overrides(parameters));
    executor.add_node(node);
  }

  bool until(const std::function<bool()>& ready, std::chrono::milliseconds timeout = 2s) {
    const auto deadline = std::chrono::steady_clock::now() + timeout;
    do {
      executor.spin_some();
      if (ready()) return true;
      std::this_thread::sleep_for(1ms);
    } while (std::chrono::steady_clock::now() < deadline);
    return false;
  }

  template <typename Service>
  typename Service::Response::SharedPtr call(
      const std::string& name, const typename Service::Request::SharedPtr& request) {
    auto client = client_node->create_client<Service>(name);
    require(client->wait_for_service(2s), "missing service: " + name);
    auto future = client->async_send_request(request);
    require(until([&] { return future.wait_for(0s) == std::future_status::ready; }),
            "service response timed out: " + name);
    return future.get();
  }

  Select::Response::SharedPtr select(const std::string& mode,
                                    const std::string& requester = "test-client") {
    auto request = std::make_shared<Select::Request>();
    request->mode_id = mode;
    request->requester_id = requester;
    return call<Select>(kSelect, request);
  }

  void start() {
    require(call<Trigger>("/realman_bt_executor/start",
                         std::make_shared<Trigger::Request>())->success,
            "start service rejected request");
  }

  void subscribe() {
    subscription = client_node->create_subscription<State>(
        kState, rclcpp::QoS(1).reliable().transient_local(),
        [this](State::ConstSharedPtr message) { states.push_back(*message); });
  }

  std::string snapshot() const { return readFile(path / "runtime.json"); }

  std::filesystem::path path;
  rclcpp::executors::SingleThreadedExecutor executor;
  rclcpp::Node::SharedPtr client_node;
  std::shared_ptr<realman_bt::RealmanBtExecutorNode> node;
  rclcpp::Subscription<State>::SharedPtr subscription;
  std::vector<State> states;
};

// These assertions catch absent/misnamed services, hard-coded catalogs, a
// volatile publisher, lost response fields, and missing synchronous events.
void testCatalogSelectionAndLateSubscriber() {
  Fixture f;
  f.load(routerXml());
  const auto catalog = f.call<List>(kList, std::make_shared<List::Request>());
  require(catalog->success, "catalog failed");
  require(catalog->mode_ids == std::vector<std::string>(
              {"web", "keyboard", "policy", "pikaposition", "pikavelocity",
               "pikamixed", "none"}),
          "catalog order differs from XML declarations");
  require(catalog->labels == std::vector<std::string>(
              {"Web", "Web / 键盘速度控制", "Policy", "Pika / 位置控制",
               "Pika / 速度控制", "Pika / Mixed 控制", "无输入"}),
          "catalog labels differ from XML declarations");
  require(catalog->selectable.size() == 7 && !catalog->selectable[0] &&
              catalog->selectable[1] && catalog->selectable[2] &&
              catalog->selectable[3] && catalog->selectable[4] &&
              catalog->selectable[5] && catalog->selectable[6],
          "catalog arrays/selectability differ from XML declarations");
  f.subscribe();  // No tree ticks or prior subscribers: this must replay startup.
  require(f.until([&] { return !f.states.empty(); }), "late subscriber missed startup state");
  const auto initial = f.states.front();
  require(initial.requested_mode == "none" && initial.selected_mode == "none" &&
              initial.active_mode == "none" && initial.phase == State::ACTIVE &&
              initial.request_id == 0 && initial.epoch == 0 && initial.detail.empty(),
          "startup state is not ACTIVE/none with zero counters");
  const auto endpoints = f.client_node->get_publishers_info_by_topic(kState);
  require(endpoints.size() == 1, "expected one input mode publisher");
  const auto qos = endpoints.front().qos_profile().get_rmw_qos_profile();
  require(qos.reliability == RMW_QOS_POLICY_RELIABILITY_RELIABLE &&
              qos.durability == RMW_QOS_POLICY_DURABILITY_TRANSIENT_LOCAL,
          "state publisher must be reliable and transient local");

  const auto policy = f.select("policy");
  require(policy->accepted && policy->request_id == 1, "policy selection not accepted");
  require(f.until([&] { return f.states.back().requested_mode == "policy"; }),
          "request state was not published");
  require(f.states.back().phase == State::SWITCHING && f.states.back().selected_mode == "none" &&
              f.states.back().active_mode == "none", "request skipped neutral selection");
  const auto unknown = f.select("unknown");
  require(!unknown->accepted && unknown->request_id == 0 && !unknown->message.empty(),
          "unknown mode was accepted or consumed an ID");
  const auto rejected_snapshot = f.snapshot();
  require(rejected_snapshot.find("\"source\":\"SERVICE\"") != std::string::npos &&
              rejected_snapshot.find("\"phase\":\"request\"") != std::string::npos &&
              rejected_snapshot.find("unknown input mode: unknown") != std::string::npos,
          "selection diagnostics were not flushed while stopped");
  require(rejected_snapshot.find(kList) != std::string::npos &&
              rejected_snapshot.find(catalog->message) != std::string::npos,
          "list service diagnostics are missing");

  f.start();
  require(f.until([&] { return f.states.back().active_mode == "policy"; }),
          "policy did not activate");
  require(f.states.back().phase == State::ACTIVE && f.states.back().epoch == 1 &&
              f.states.back().request_id == policy->request_id, "active state fields lost");
  const auto activated_snapshot = f.snapshot();
  const auto activation = activated_snapshot.rfind("\"phase\":\"active\"");
  const auto leaf_entry = activated_snapshot.find("Policy input is a placeholder; no command emitted");
  require(activation != std::string::npos && leaf_entry != std::string::npos && activation < leaf_entry,
          "activation observer did not flush before the input subtree tick");
  const auto web = f.select("web", "web-control");
  require(web->accepted && web->request_id == 2, "web-control could not select web");
  require(f.until([&] { return f.states.back().phase == State::ACTIVE &&
                              f.states.back().active_mode == "web"; }), "web did not activate");
  require(f.states.back().epoch == 2, "web activation did not advance epoch");
  f.subscription.reset();
  f.states.clear();
  f.subscribe();
  require(f.until([&] { return !f.states.empty(); }), "late subscriber missed current state");
  f.until([] { return false; }, 100ms);
  require(f.states.size() == 1 && f.states.front().active_mode == "web",
          "state publisher replayed stale history instead of depth-one latest state");
}

void testSubscriberConnectedBeforePublisher() {
  Fixture f;
  f.subscribe();
  f.load(routerXml());
  require(f.until([&] { return !f.states.empty(); }), "connected subscriber missed startup");
  require(f.states.front().active_mode == "none" && f.states.front().phase == State::ACTIVE,
          "connected subscriber startup differs from late subscriber");
}

void testMoveJHasNoModeInterfaces() {
  Fixture f;
  f.load(readFile(std::filesystem::path(BT_TEST_CONFIG_DIR) / "move.xml"));
  auto list = f.client_node->create_client<List>(kList);
  auto select = f.client_node->create_client<Select>(kSelect);
  require(!list->wait_for_service(250ms) && !select->wait_for_service(250ms),
          "MoveJ-only executor exposes input mode services");
  require(f.client_node->get_publishers_info_by_topic(kState).empty(),
          "MoveJ-only executor exposes input mode topic");
  f.start();
  require(f.until([&] { return f.snapshot().find("\"success\":1") != std::string::npos; }),
          "MoveJ dry-run stopped working");
}

void testInvalidConfigurationFailsConstruction() {
  for (const auto timeout : {0, -1}) {
    Fixture f;
    bool rejected = false;
    try { f.load(routerXml(), {{"switch_timeout_ms", timeout}}); }
    catch (const std::invalid_argument& e) { rejected = std::string(e.what()).find("positive") != std::string::npos; }
    require(rejected, "non-positive switch timeout accepted");
  }
  for (const auto fallback : {"missing", "web"}) {
    Fixture f;
    bool rejected = false;
    try { f.load(routerXml(), {{"safe_fallback_mode", fallback}}); }
    catch (const std::invalid_argument& e) { rejected = std::string(e.what()).find("fallback") != std::string::npos; }
    require(rejected, "unregistered/nonselectable fallback accepted");
  }
  Fixture f;
  auto missing_none = routerXml();
  replaceOnce(missing_none, "mode=\"none\" label=", "mode=\"other\" label=");
  bool rejected = false;
  try { f.load(missing_none); }
  catch (const std::invalid_argument& e) { rejected = std::string(e.what()).find("none") != std::string::npos; }
  require(rejected, "incomplete registry accepted before ticking");
}

// A malformed branch remap throws only after policy activates. The next
// selector tick can still route none without revisiting that branch.
void testBranchExceptionPublishesFailureAndRecovers() {
  Fixture f;
  auto xml = routerXml();
  replaceOnce(xml, "<PolicyInputStub/>",
              "<InputModeGuard mode=\"policy\" label=\"Policy\" selectable=\"true\" selected_mode=\"{dry_run}\"/>");
  f.load(xml);
  f.subscribe();
  require(f.until([&] { return !f.states.empty(); }), "missing initial state");
  require(f.select("policy")->accepted, "policy request rejected");
  f.start();
  require(f.until([&] { return f.states.back().phase == State::FAILED; }),
          "branch exception did not publish FAILED");
  const auto failed = f.states.back();
  require(failed.detail.find("Blackboard: key 'dry_run'") != std::string::npos,
          "branch exception detail lost");
  const auto snapshot = f.snapshot();
  require(snapshot.find("\"phase\":\"exception\",\"detail\":\"" + failed.detail + "\"") != std::string::npos &&
              snapshot.find("\"phase\":\"failed\",\"detail\":\"" + failed.detail + "\"") != std::string::npos,
          "exception/failed diagnostics did not retain verbatim detail");
  require(snapshot.find("\"failure\":1") != std::string::npos,
          "exception tick was not counted exactly once");
  require(f.until([&] { return f.states.back().phase == State::ACTIVE &&
                              f.states.back().active_mode == "none"; }),
          "persistent executor did not recover to none after exception");
  require(f.snapshot().find("\"failure\":1") != std::string::npos,
          "recovery unexpectedly added terminal failure ticks");
}

// A leaf reports a task-level failure through FailInputMode: the router publishes FAILED with the
// reason, then recovers to the safe mode without anyone selecting it.
void testFailInputModeReportsFailedThenRecoversToNone() {
  Fixture f;
  auto xml = routerXml();
  replaceOnce(xml, "<PolicyInputStub/>", "<FailInputMode reason=\"task gave up\"/>");
  f.load(xml);
  f.subscribe();
  require(f.until([&] { return !f.states.empty(); }), "missing initial state");
  require(f.select("policy")->accepted, "policy request rejected");
  f.start();
  require(f.until([&] { return f.states.back().phase == State::FAILED; }),
          "FailInputMode did not publish FAILED");
  require(f.states.back().detail == "task gave up", "FAILED detail is not the node's reason");
  require(f.until([&] { return f.states.back().phase == State::ACTIVE &&
                              f.states.back().active_mode == "none"; }),
          "router did not recover to none after FailInputMode");
  require(f.states.back().detail == "policy failed: task gave up",
          "none does not say why the router fell back to it");
}

// The policy branch's start-pose MoveJ with no driver to send it to. Waiting for an action server does
// not keep the switch alive, so the switch timeout still bounds it; a MoveJ that fails before the
// deadline fails the switch at once with its own detail instead (2026-10-24).
std::string policyEntryWithoutDriver(const std::string& move_timeout_sec) {
  auto xml = routerXml();
  replaceOnce(xml, R"(<ThreeArmMoveJ name="policy_start_pose" dry_run="{dry_run}")",
              R"(<ThreeArmMoveJ name="policy_start_pose" dry_run="false")");
  replaceOnce(xml, R"(timeout_sec="120"/>
            <ActivateInputMode mode="policy"/>)",
              "timeout_sec=\"" + move_timeout_sec + R"("/>
            <ActivateInputMode mode="policy"/>)");
  return xml;
}

void testEntryWaitingForADriverStillTimesOut() {
  Fixture f;
  f.load(policyEntryWithoutDriver("120"), {{"switch_timeout_ms", 300}});
  f.subscribe();
  require(f.until([&] { return !f.states.empty(); }), "missing initial state");
  require(f.select("policy")->accepted, "policy request rejected");
  f.start();
  require(f.until([&] { return f.states.back().phase == State::FAILED; }),
          "an entry waiting for a driver was not bounded by the switch timeout");
  require(f.states.back().detail == "input mode switch timed out", "timeout detail changed");
}

void testFailedEntryFailsTheSwitchAtOnce() {
  Fixture f;
  f.load(policyEntryWithoutDriver("0.3"), {{"switch_timeout_ms", 5000}});
  f.subscribe();
  require(f.until([&] { return !f.states.empty(); }), "missing initial state");
  require(f.select("policy")->accepted, "policy request rejected");
  f.start();
  require(f.until([&] { return f.states.back().phase == State::FAILED; }, 2s),
          "a failed entry move waited for the switch timeout");
  require(f.states.back().detail == "policy entry failed before activation",
          "entry failure detail changed");
  require(f.until([&] { return f.states.back().phase == State::ACTIVE &&
                              f.states.back().active_mode == "none"; }),
          "router did not recover to none after the entry failed");
}

std::string policyTaskTree(const std::string& body) {
  return R"(<?xml version="1.0"?>
<root main_tree_to_execute="MainTree" realman_arm_id="r" realman_required_arms="r"
      realman_launch="arm_move" realman_stop_on_terminal="true" realman_exit_on_terminal="true">
  <BehaviorTree ID="MainTree">)" + body + R"(</BehaviorTree>
</root>)";
}

// GripperReady and PolicyRun are registered, and in dry run they finish without any gripper, bridge
// or router being present.
void testPolicyTaskLeavesAreRegisteredAndDryRunOnTheirOwn() {
  Fixture f;
  f.load(policyTaskTree(R"(
    <Sequence name="attempt">
      <GripperReady arm_id="r" dry_run="{dry_run}"/>
      <PolicyRun arm_id="r" dry_run="{dry_run}"/>
    </Sequence>)"));
  f.start();
  require(f.until([&] { return f.snapshot().find("\"success\":1") != std::string::npos; }),
          "GripperReady/PolicyRun dry-run tree did not run to success");
}

// policy_task.cycles reaches the tree as the blackboard value {policy_cycles}.
void testPolicyTaskCountsReachTheTreeThroughTheBlackboard() {
  Fixture f;
  f.load(policyTaskTree(R"(
    <Repeat num_cycles="{policy_cycles}">
      <PolicyRun arm_id="r" dry_run="{dry_run}"/>
    </Repeat>)"),
         {{"policy_task.cycles", 3}});
  f.start();
  require(f.until([&] { return f.snapshot().find("\"success\":1") != std::string::npos; }),
          "Repeat over PolicyRun did not finish");
  // Two RUNNING ticks between three cycles.
  require(f.snapshot().find("\"running\":2") != std::string::npos,
          "policy_task.cycles=3 did not become three cycles");
}

void testAnInvalidPolicyTaskValueStopsTheExecutorFromStarting() {
  Fixture f;
  bool rejected = false;
  try {
    f.load(policyTaskTree("<PolicyRun arm_id=\"r\" dry_run=\"{dry_run}\"/>"),
           {{"policy_task.attempts", 0}});
  } catch (const std::invalid_argument& e) {
    rejected = std::string(e.what()).find("policy_task.attempts") != std::string::npos;
  }
  require(rejected, "an invalid policy_task value was accepted");
}

void testTimeoutPublishesFailedDetail() {
  Fixture f;
  f.load(routerXml(), {{"switch_timeout_ms", 1}});
  f.subscribe();
  require(f.until([&] { return !f.states.empty(); }), "missing startup state");
  require(f.select("pikaposition")->accepted, "pika position request rejected");
  std::this_thread::sleep_for(5ms);
  f.start();
  require(f.until([&] { return f.states.back().phase == State::FAILED; }),
          "switch timeout did not publish FAILED");
  require(f.states.back().detail == "input mode switch timed out",
          "timeout detail changed in ROS mapping");
}

// The policy task tree is built from the vendored Repeat/Retry/Fallback plus RetryUnlessFault.
// An unregistered tag makes the executor refuse to construct, so loading and running this tree is
// the registration check; the dry-run MoveJ leaves make it finish on its own.
void testTaskControlNodesAreRegistered() {
  Fixture f;
  f.load(R"(<?xml version="1.0"?>
<root main_tree_to_execute="MainTree" realman_arm_id="r" realman_required_arms="r"
      realman_launch="arm_move" realman_stop_on_terminal="true" realman_exit_on_terminal="true">
  <BehaviorTree ID="MainTree">
    <Repeat num_cycles="2">
      <RetryUnlessFault num_attempts="3">
        <Fallback name="task_or_stop">
          <Retry num_attempts="2">
            <MoveJ name="task_move" arm_id="{arm_id}" dry_run="{dry_run}" joint_degrees="0,0,0,0,0,0" velocity_percent="10" blend_radius_percent="0" timeout_sec="120"/>
          </Retry>
          <MoveJ name="never_reached" arm_id="{arm_id}" dry_run="{dry_run}" joint_degrees="0,0,0,0,0,0" velocity_percent="10" blend_radius_percent="0" timeout_sec="120"/>
        </Fallback>
      </RetryUnlessFault>
    </Repeat>
  </BehaviorTree>
</root>)");
  f.start();
  require(f.until([&] { return f.snapshot().find("\"success\":1") != std::string::npos; }),
          "Repeat/RetryUnlessFault/Fallback/Retry tree did not run to success");
}

std::string pickXml() {
  return readFile(std::filesystem::path(BT_TEST_CONFIG_DIR) / "control_pick.xml");
}

// control_pick.xml in dry run: every leaf of one pick cycle is registered and validates, the
// detector reports a clear table without reading the camera, and the branch then idles in policy
// mode instead of failing.
void testPickTreeDryRunEndsWithAClearTableAndIdles() {
  Fixture f;
  f.load(pickXml());
  f.subscribe();
  require(f.until([&] { return !f.states.empty(); }), "missing initial state");
  require(f.select("policy")->accepted, "policy request rejected");
  f.start();
  require(f.until([&] { return f.snapshot().find("dry-run: camera not read") != std::string::npos; }, 5s),
          "pick cycle did not reach WhiteObjectsRemain");
  require(!f.until([&] { return f.states.back().phase == State::FAILED; }, 500ms),
          "a clear table was reported as FAILED");
  require(f.states.back().phase == State::ACTIVE && f.states.back().active_mode == "policy",
          "pick branch did not stay in policy mode after clearing the table");
}

// A cycle that fails (here every attempt) ends the Repeat without pick_table_clear, so the branch
// reports FAILED instead of mistaking the end of the loop for a clear table.
void testPickTreeFailedCycleIsNotAClearTable() {
  Fixture f;
  auto xml = pickXml();
  replaceOnce(xml, "<PolicyRun arm_id=\"r\" task=\"pick\" dry_run=\"{dry_run}\"/>",
              "<CheckBool key=\"never_set\"/>");
  f.load(xml);
  f.subscribe();
  require(f.until([&] { return !f.states.empty(); }), "missing initial state");
  require(f.select("policy")->accepted, "policy request rejected");
  f.start();
  require(f.until([&] { return f.states.back().phase == State::FAILED; }, 5s),
          "a failed pick cycle did not publish FAILED");
}
}  // namespace

// The Web "终止行为树" button calls ~/shutdown: it must answer, halt the tree, and then end
// the process (the launch takes the routers down on executor exit). A second request while
// draining is acknowledged rather than restarting the drain. Runs last: it shuts the context.
void testShutdownServiceHaltsThenExits() {
  Fixture f;
  f.load(routerXml(), {{"shutdown_drain_timeout_sec", 0.5}});
  f.start();
  require(f.until([&] { return f.snapshot().find("\"root_status\":\"RUNNING\"") != std::string::npos; }),
          "tree did not start ticking");
  auto client = f.client_node->create_client<Trigger>("/realman_bt_executor/shutdown");
  require(client->wait_for_service(2s), "missing service: /realman_bt_executor/shutdown");
  auto first = client->async_send_request(std::make_shared<Trigger::Request>());
  auto second = client->async_send_request(std::make_shared<Trigger::Request>());
  require(f.until([&] {
            return first.wait_for(0s) == std::future_status::ready &&
                   second.wait_for(0s) == std::future_status::ready;
          }),
          "shutdown service did not answer before exiting");
  const auto accepted = first.get();
  const auto repeated = second.get();
  require(accepted->success && accepted->message.rfind("shutting down after 0", 0) == 0,
          "unexpected shutdown response: " + accepted->message);
  require(repeated->success && repeated->message == "already shutting down",
          "second shutdown request was not acknowledged: " + repeated->message);
  require(f.snapshot().find("\"root_status\":\"IDLE\"") != std::string::npos,
          "tree was not halted before exit");
  require(f.until([] { return !rclcpp::ok(); }), "executor did not exit after shutdown");
}

int main(int argc, char** argv) {
  rclcpp::init(argc, argv);
  try {
    testCatalogSelectionAndLateSubscriber();
    testSubscriberConnectedBeforePublisher();
    testMoveJHasNoModeInterfaces();
    testInvalidConfigurationFailsConstruction();
    testBranchExceptionPublishesFailureAndRecovers();
    testTimeoutPublishesFailedDetail();
    testEntryWaitingForADriverStillTimesOut();
    testFailedEntryFailsTheSwitchAtOnce();
    testFailInputModeReportsFailedThenRecoversToNone();
    testPolicyTaskLeavesAreRegisteredAndDryRunOnTheirOwn();
    testPolicyTaskCountsReachTheTreeThroughTheBlackboard();
    testAnInvalidPolicyTaskValueStopsTheExecutorFromStarting();
    testTaskControlNodesAreRegistered();
    testPickTreeDryRunEndsWithAClearTableAndIdles();
    testPickTreeFailedCycleIsNotAClearTable();
    testShutdownServiceHaltsThenExits();
  } catch (const std::exception& error) {
    RCLCPP_ERROR(rclcpp::get_logger("test_input_mode_executor"), "%s", error.what());
    rclcpp::shutdown();
    return 1;
  }
  if (rclcpp::ok()) rclcpp::shutdown();
  return 0;
}
