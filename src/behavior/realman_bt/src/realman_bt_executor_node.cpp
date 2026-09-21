#include "realman_bt/realman_bt_executor_node.hpp"

#include <chrono>
#include <cmath>
#include <filesystem>
#include <stdexcept>
#include <utility>

#include "bt_core/xml_parser.hpp"
#include "bt_nodes/control/reactive_fallback_node.hpp"
#include "bt_nodes/control/reactive_sequence_node.hpp"
#include "bt_nodes/control/sequence_node.hpp"
#include "realman_bt/cartesian_velocity_for_duration_node.hpp"
#include "realman_bt/input_mode_nodes.hpp"
#include "realman_bt/move_j_node.hpp"
#include "realman_bt/three_arm_move_j_node.hpp"

namespace realman_bt {
namespace {

std::uint64_t timestampMilliseconds() {
  const auto now = std::chrono::system_clock::now();
  const auto milliseconds =
      std::chrono::duration_cast<std::chrono::milliseconds>(now.time_since_epoch());
  return static_cast<std::uint64_t>(milliseconds.count());
}

}  // namespace

RealmanBtExecutorNode::RealmanBtExecutorNode(const rclcpp::NodeOptions& options)
    : rclcpp::Node("realman_bt_executor", options), blackboard_(bt_core::Blackboard::create()) {
  const std::string tree_file = declare_parameter<std::string>("tree_file", "");
  const std::string arm_id = declare_parameter<std::string>("arm_id", "r");
  const bool dry_run = declare_parameter<bool>("dry_run", true);
  const std::string pika_l_joint_degrees = declare_parameter<std::string>(
      "pika_l_joint_degrees", "");
  const std::string pika_m_joint_degrees = declare_parameter<std::string>(
      "pika_m_joint_degrees", "");
  const std::string pika_r_joint_degrees = declare_parameter<std::string>(
      "pika_r_joint_degrees", "");
  const auto coordinate_references = declare_parameter<std::vector<std::string>>(
      "coordinate_references", std::vector<std::string>{});
  const auto cartesian_velocity_profiles =
      declare_parameter<std::vector<std::string>>(
          "cartesian_velocity_profiles", std::vector<std::string>{});
  const std::string runtime_snapshot_file = declare_parameter<std::string>(
      "runtime_snapshot_file", "/tmp/realman-bt-workspace/runtime.json");
  tick_rate_hz_ = declare_parameter<double>("tick_rate_hz", 20.0);
  autostart_ = declare_parameter<bool>("autostart", true);
  stop_on_terminal_ = declare_parameter<bool>("stop_on_terminal", true);
  terminal_exit_policy_ = TerminalExitPolicy(
      declare_parameter<bool>("exit_on_terminal", true));
  const auto switch_timeout_ms = declare_parameter<std::int64_t>("switch_timeout_ms", 5000);
  const auto safe_fallback_mode = declare_parameter<std::string>("safe_fallback_mode", "none");
  if (tree_file.empty()) throw std::invalid_argument("tree_file must be set");
  if (arm_id != "l" && arm_id != "m" && arm_id != "r") throw std::invalid_argument("arm_id must be l, m, or r");
  if (!std::isfinite(tick_rate_hz_) || tick_rate_hz_ <= 0.0) throw std::invalid_argument("tick_rate_hz must be positive");
  if (runtime_snapshot_file.empty()) throw std::invalid_argument("runtime_snapshot_file must be set");
  if (switch_timeout_ms <= 0) throw std::invalid_argument("switch_timeout_ms must be positive");

  coordinate_reference_registry_ =
      CoordinateReferenceRegistry(coordinate_references);
  cartesian_velocity_profile_registry_ =
      CartesianVelocityProfileRegistry(cartesian_velocity_profiles);

  // Guards populate the registry while XML is constructed. The observer runs
  // inline in ActivateInputMode, before the following input subtree can tick.
  input_mode_coordinator_ = std::make_unique<InputModeCoordinator>(
      input_mode_registry_, std::chrono::milliseconds(switch_timeout_ms),
      safe_fallback_mode,
      [this](const InputModeSnapshot&) { publishInputModeState(); });
  blackboard_->set<InputModeRegistry*>(kInputModeRegistryBlackboardKey,
                                      &input_mode_registry_);
  blackboard_->set<InputModeCoordinator*>(kInputModeCoordinatorBlackboardKey,
                                         input_mode_coordinator_.get());
  blackboard_->set<std::string>("arm_id", arm_id);
  blackboard_->set<bool>("dry_run", dry_run);
  if (!pika_l_joint_degrees.empty()) {
    blackboard_->set<std::string>("pika_l_joint_degrees", pika_l_joint_degrees);
    blackboard_->set<std::string>("pika_m_joint_degrees", pika_m_joint_degrees);
    blackboard_->set<std::string>("pika_r_joint_degrees", pika_r_joint_degrees);
  }
  blackboard_->set<rclcpp::Node*>(kRosNodeBlackboardKey, this);
  blackboard_->set<RuntimeDiagnostics*>(kRuntimeDiagnosticsBlackboardKey,
                                        &diagnostics_);
  blackboard_->set<CoordinateReferenceRegistry*>(
      kCoordinateReferenceRegistryBlackboardKey,
      &coordinate_reference_registry_);
  blackboard_->set<CartesianVelocityProfileRegistry*>(
      kCartesianVelocityProfileRegistryBlackboardKey,
      &cartesian_velocity_profile_registry_);
  blackboard_->set<MoveJCancellationDrainSink>(
      kMoveJCancellationDrainSinkBlackboardKey,
      [this](std::shared_ptr<MoveJCancellationDrain> drain) {
        enqueueCancellationDrain(std::move(drain));
      });
  blackboard_->set<CartesianVelocityCancellationDrainSink>(
      kCartesianVelocityCancellationDrainSinkBlackboardKey,
      [this](std::shared_ptr<CartesianVelocityCancellationDrain> drain) {
        enqueueCartesianVelocityCancellationDrain(std::move(drain));
      });
  factory_.registerNodeType<bt_nodes::SequenceNode>("Sequence");
  factory_.registerNodeType<bt_nodes::ReactiveSequenceNode>("ReactiveSequence");
  factory_.registerNodeType<bt_nodes::ReactiveFallbackNode>("ReactiveFallback");
  factory_.registerNodeType<SelectInputModeNode>("SelectInputMode");
  factory_.registerNodeType<InputModeGuardNode>("InputModeGuard");
  factory_.registerNodeType<ActivateInputModeNode>("ActivateInputMode");
  factory_.registerNodeType<WebInputStubNode>("WebInputStub");
  factory_.registerNodeType<PolicyInputStubNode>("PolicyInputStub");
  factory_.registerNodeType<PikaInputStubNode>("PikaInputStub");
  factory_.registerNodeType<PikaPositionInputNode>("PikaPositionInput");
  factory_.registerNodeType<PikaVelocityInputNode>("PikaVelocityInput");
  factory_.registerNodeType<IdleInputNode>("IdleInput");
  factory_.registerNodeType<MoveJNode>("MoveJ");
  factory_.registerNodeType<ThreeArmMoveJNode>("ThreeArmMoveJ");
  factory_.registerNodeType<CartesianVelocityForDurationNode>(
      "CartesianVelocityForDuration");
  bt_core::XmlParser parser(factory_);
  auto tree = parser.loadFromFile(tree_file, blackboard_);
  tree_ = std::make_unique<bt_core::Tree>(std::move(tree));
  const bool has_input_modes = !input_mode_registry_.definitions().empty();
  if (has_input_modes) {
    input_mode_registry_.validate();
    // Validate fallback against the completed catalog without consuming a
    // request ID or advancing the initial ACTIVE/none state.
    (void)input_mode_coordinator_->selectForTick(InputModeCoordinator::Clock::now());
  }
  tree_id_ = std::filesystem::path(tree_file).stem().string();
  if (tree_id_.empty()) tree_id_ = tree_file;
  snapshot_writer_ = std::make_unique<RuntimeSnapshotWriter>(runtime_snapshot_file);
  try {
    snapshot_writer_->writeIdle(tree_id_, &diagnostics_);
  } catch (const std::exception& error) {
    RCLCPP_ERROR(get_logger(), "failed to write idle behavior tree snapshot: %s", error.what());
  }
  if (has_input_modes) {
    input_mode_state_pub_ = create_publisher<InputModeState>(
        "~/input_mode_state", rclcpp::QoS(1).reliable().transient_local());
    publishInputModeState();
    list_input_modes_service_ = create_service<ListInputModes>(
        "~/list_input_modes",
        [this](std::shared_ptr<ListInputModes::Request> request,
               std::shared_ptr<ListInputModes::Response> response) {
          handleListInputModes(request, response);
        });
    select_input_mode_service_ = create_service<SelectInputMode>(
        "~/select_input_mode",
        [this](std::shared_ptr<SelectInputMode::Request> request,
               std::shared_ptr<SelectInputMode::Response> response) {
          handleSelectInputMode(request, response);
        });
  }
  status_pub_ = create_publisher<std_msgs::msg::String>("~/bt_status", 10);
  rosout_sub_ = create_subscription<rcl_interfaces::msg::Log>(
      "/rosout", rclcpp::QoS(100),
      [this](const rcl_interfaces::msg::Log::SharedPtr message) {
        handleRosout(message);
      });
  start_service_ = create_service<Trigger>(
      "~/start",
      [this](std::shared_ptr<Trigger::Request> request,
             std::shared_ptr<Trigger::Response> response) {
        handleStart(request, response);
      });
  stop_service_ = create_service<Trigger>(
      "~/stop",
      [this](std::shared_ptr<Trigger::Request> request,
             std::shared_ptr<Trigger::Response> response) {
        handleStop(request, response);
      });
  RCLCPP_INFO(get_logger(), "loaded behavior tree %s for arm %s (dry_run=%s)", tree_file.c_str(), arm_id.c_str(), dry_run ? "true" : "false");
  if (autostart_) start();
}

RealmanBtExecutorNode::~RealmanBtExecutorNode() {
  stop();
  if (cancellation_drain_timer_) cancellation_drain_timer_->cancel();
  cancellation_drain_timer_.reset();
  if (!cancellation_drains_.empty()) {
    RCLCPP_WARN(get_logger(),
                "releasing %zu pending MoveJ cancellation drain(s) during shutdown",
                cancellation_drains_.size());
  }
  if (!cartesian_velocity_cancellation_drains_.empty()) {
    RCLCPP_WARN(
        get_logger(),
        "releasing %zu pending Cartesian velocity cancellation drain(s) during shutdown",
        cartesian_velocity_cancellation_drains_.size());
  }
  cancellation_drains_.clear();
  cartesian_velocity_cancellation_drains_.clear();
}

void RealmanBtExecutorNode::start() {
  if (timer_) return;
  const auto period = std::chrono::duration_cast<std::chrono::nanoseconds>(std::chrono::duration<double>(1.0 / tick_rate_hz_));
  timer_ = create_wall_timer(period, [this]() { onTick(); });
  RCLCPP_INFO(get_logger(), "behavior tree ticking at %.2f Hz", tick_rate_hz_);
}

void RealmanBtExecutorNode::stop() {
  if (timer_) {
    timer_->cancel();
    timer_.reset();
  }
  if (tree_) tree_->halt();
  flushSnapshot();
}

void RealmanBtExecutorNode::onTick() {
  if (!tree_) return;
  bt_core::NodeStatus status = bt_core::NodeStatus::FAILURE;
  try {
    status = tree_->tickOnce();
  } catch (const std::exception& error) {
    RCLCPP_ERROR(get_logger(), "behavior tree tick failed: %s", error.what());
    recordEvent("ERROR", "EXECUTOR", "realman_bt_executor", "exception",
                error.what());
    flushSnapshot();
    if (input_mode_state_pub_) {
      input_mode_coordinator_->fail(error.what(), InputModeCoordinator::Clock::now());
    }
    tree_->halt();
  }
  diagnostics_.recordTick(status);
  flushSnapshot();
  std_msgs::msg::String message;
  message.data = bt_core::toStr(status);
  status_pub_->publish(message);
  if (bt_core::isStatusCompleted(status) &&
      (stop_on_terminal_ || terminal_exit_policy_.enabled())) {
    RCLCPP_INFO(get_logger(), "behavior tree reached %s", message.data.c_str());
    terminal_exit_policy_.markTerminal(status == bt_core::NodeStatus::SUCCESS);
    stop();
    requestProcessExitIfReady();
  }
}

void RealmanBtExecutorNode::publishInputModeState() {
  if (!input_mode_state_pub_) return;
  const auto& state = input_mode_coordinator_->snapshot();
  InputModeState message;
  message.requested_mode = state.requested_mode;
  message.selected_mode = state.selected_mode;
  message.active_mode = state.active_mode;
  switch (state.phase) {
    case InputModePhase::kActive: message.phase = InputModeState::ACTIVE; break;
    case InputModePhase::kSwitching: message.phase = InputModeState::SWITCHING; break;
    case InputModePhase::kFailed: message.phase = InputModeState::FAILED; break;
  }
  message.request_id = state.request_id;
  message.epoch = state.epoch;
  message.detail = state.detail;
  input_mode_state_pub_->publish(message);

  const auto transition = [this, &state](const char* phase, bool failed = false) {
    recordEvent(failed ? "ERROR" : "INFO", "EXECUTOR",
                input_mode_state_pub_->get_topic_name(), phase, state.detail);
    flushSnapshot();
    if (failed) {
      RCLCPP_ERROR(get_logger(), "input mode %s: %s", phase, state.detail.c_str());
    } else {
      RCLCPP_INFO(get_logger(),
                  "input mode %s: requested=%s selected=%s active=%s: %s",
                  phase, state.requested_mode.c_str(), state.selected_mode.c_str(),
                  state.active_mode.c_str(), state.detail.c_str());
    }
  };
  if (state.phase == InputModePhase::kFailed &&
      (!last_published_input_mode_ || last_published_input_mode_->phase != state.phase ||
       last_published_input_mode_->detail != state.detail)) {
    transition("failed", true);
  }
  if (last_published_input_mode_ &&
      (last_published_input_mode_->selected_mode != state.selected_mode ||
       last_published_input_mode_->requested_mode != state.requested_mode ||
       (state.phase == InputModePhase::kSwitching &&
        last_published_input_mode_->phase != state.phase))) {
    transition("selected");
  }
  if (!last_published_input_mode_ ||
      last_published_input_mode_->active_mode != state.active_mode ||
      (state.phase == InputModePhase::kActive &&
       last_published_input_mode_->phase != state.phase)) {
    transition("active");
  }
  last_published_input_mode_ = state;
}

void RealmanBtExecutorNode::handleListInputModes(
    const std::shared_ptr<ListInputModes::Request>,
    std::shared_ptr<ListInputModes::Response> response) {
  const auto interface_name = list_input_modes_service_->get_service_name();
  recordEvent("INFO", "SERVICE", interface_name, "request", "");
  flushSnapshot();
  RCLCPP_INFO(get_logger(), "input mode catalog requested");
  for (const auto& definition : input_mode_registry_.definitions()) {
    response->mode_ids.push_back(definition.id);
    response->labels.push_back(definition.label);
    response->selectable.push_back(definition.selectable);
  }
  response->success = true;
  response->message = "input modes listed";
  recordEvent("INFO", "SERVICE", interface_name, "response", response->message);
  flushSnapshot();
  RCLCPP_INFO(get_logger(), "%s", response->message.c_str());
}

void RealmanBtExecutorNode::handleSelectInputMode(
    const std::shared_ptr<SelectInputMode::Request> request,
    std::shared_ptr<SelectInputMode::Response> response) {
  const auto interface_name = select_input_mode_service_->get_service_name();
  const auto request_detail = "mode_id=" + request->mode_id +
                              ", requester_id=" + request->requester_id;
  recordEvent("INFO", "SERVICE", interface_name, "request", request_detail);
  flushSnapshot();
  RCLCPP_INFO(get_logger(), "input mode selection requested: %s", request_detail.c_str());
  const auto result = input_mode_coordinator_->request(
      request->mode_id, request->requester_id, InputModeCoordinator::Clock::now());
  response->accepted = result.accepted;
  response->request_id = result.request_id;
  response->message = result.message;
  publishInputModeState();
  recordEvent(result.accepted ? "INFO" : "WARN", "SERVICE", interface_name,
              "response", response->message);
  flushSnapshot();
  if (result.accepted) {
    RCLCPP_INFO(get_logger(), "%s", response->message.c_str());
  } else {
    RCLCPP_WARN(get_logger(), "%s", response->message.c_str());
  }
}

void RealmanBtExecutorNode::handleStart(const std::shared_ptr<Trigger::Request>, std::shared_ptr<Trigger::Response> response) {
  recordEvent("INFO", "SERVICE", "/realman_bt_executor/start", "request", "");
  flushSnapshot();
  const bool running = static_cast<bool>(timer_);
  start();
  response->success = true;
  response->message = running ? "already running" : "started";
  recordEvent("INFO", "SERVICE", "/realman_bt_executor/start", "response",
              response->message);
  flushSnapshot();
}

void RealmanBtExecutorNode::handleStop(const std::shared_ptr<Trigger::Request>, std::shared_ptr<Trigger::Response> response) {
  recordEvent("INFO", "SERVICE", "/realman_bt_executor/stop", "request", "");
  flushSnapshot();
  const bool running = static_cast<bool>(timer_);
  stop();
  response->success = true;
  response->message = running ? "stopped" : "already stopped";
  recordEvent("INFO", "SERVICE", "/realman_bt_executor/stop", "response",
              response->message);
  flushSnapshot();
}

void RealmanBtExecutorNode::flushSnapshot() {
  if (!snapshot_writer_ || !tree_) return;
  ++snapshot_sequence_;
  try {
    snapshot_writer_->write(*tree_, tree_id_, snapshot_sequence_, &diagnostics_,
                            pendingCancellationCount());
  } catch (const std::exception& error) {
    RCLCPP_ERROR(get_logger(), "failed to write behavior tree snapshot: %s", error.what());
  }
}

void RealmanBtExecutorNode::enqueueCancellationDrain(
    std::shared_ptr<MoveJCancellationDrain> drain) {
  if (!drain) return;
  cancellation_drains_.push_back(std::move(drain));
  if (cancellation_drain_timer_) return;
  cancellation_drain_timer_ = create_wall_timer(
      std::chrono::milliseconds(50), [this]() { drainCancellationQueue(); });
}

void RealmanBtExecutorNode::enqueueCartesianVelocityCancellationDrain(
    std::shared_ptr<CartesianVelocityCancellationDrain> drain) {
  if (!drain) return;
  cartesian_velocity_cancellation_drains_.push_back(std::move(drain));
  if (cancellation_drain_timer_) return;
  cancellation_drain_timer_ = create_wall_timer(
      std::chrono::milliseconds(50), [this]() { drainCancellationQueue(); });
}

void RealmanBtExecutorNode::drainCancellationQueue() {
  auto remaining = cancellation_drains_.begin();
  for (auto current = cancellation_drains_.begin();
       current != cancellation_drains_.end(); ++current) {
    if (!(*current)->drainOnce()) {
      if (remaining != current) *remaining = std::move(*current);
      ++remaining;
    }
  }
  cancellation_drains_.erase(remaining, cancellation_drains_.end());
  auto velocity_remaining = cartesian_velocity_cancellation_drains_.begin();
  for (auto current = cartesian_velocity_cancellation_drains_.begin();
       current != cartesian_velocity_cancellation_drains_.end(); ++current) {
    if (!(*current)->drainOnce()) {
      if (velocity_remaining != current) {
        *velocity_remaining = std::move(*current);
      }
      ++velocity_remaining;
    }
  }
  cartesian_velocity_cancellation_drains_.erase(
      velocity_remaining, cartesian_velocity_cancellation_drains_.end());
  flushSnapshot();
  if (pendingCancellationCount() == 0 && cancellation_drain_timer_) {
    cancellation_drain_timer_->cancel();
    cancellation_drain_timer_.reset();
  }
  requestProcessExitIfReady();
}

std::size_t RealmanBtExecutorNode::pendingCancellationCount() const {
  return cancellation_drains_.size() +
         cartesian_velocity_cancellation_drains_.size();
}

void RealmanBtExecutorNode::requestProcessExitIfReady() {
  if (!terminal_exit_policy_.shouldExit(pendingCancellationCount())) return;
  flushSnapshot();
  RCLCPP_INFO(get_logger(), "terminal cleanup complete; exiting behavior-tree executor");
  get_node_base_interface()->get_context()->shutdown(
      "behavior tree reached a terminal state");
}

void RealmanBtExecutorNode::recordEvent(std::string severity, std::string source,
                                        std::string interface_name,
                                        std::string phase, std::string detail) {
  diagnostics_.recordEvent({timestampMilliseconds(), std::move(severity),
                            std::move(source), std::move(interface_name),
                            std::move(phase), std::move(detail)});
}

void RealmanBtExecutorNode::handleRosout(
    const rcl_interfaces::msg::Log::SharedPtr message) {
  if (!message || (message->level != rcl_interfaces::msg::Log::WARN &&
                   message->level != rcl_interfaces::msg::Log::ERROR)) {
    return;
  }
  if (message->name.find("realman_bt_executor") == std::string::npos &&
      message->name.find("rclcpp_action") == std::string::npos) {
    return;
  }
  recordEvent(message->level == rcl_interfaces::msg::Log::ERROR ? "ERROR" : "WARN",
              "ROS_LOG", message->name, "rosout", message->msg);
  // The tree may already have reached a terminal state and stopped its tick
  // timer. Persist diagnostics immediately so late Action warnings/errors
  // remain visible to the read-only web monitor.
  flushSnapshot();
}

}  // namespace realman_bt
