#include "realman_bt/input_mode_nodes.hpp"

#include <chrono>
#include <cstdint>
#include <stdexcept>
#include <utility>

#include "realman_bt/runtime_snapshot.hpp"

namespace realman_bt {
namespace {

InputModeCoordinator* coordinator(
    const bt_core::Blackboard::Ptr& blackboard) {
  const auto value = blackboard->get<InputModeCoordinator*>(
      kInputModeCoordinatorBlackboardKey);
  if (!value.has_value() || value.value() == nullptr) {
    throw std::runtime_error(
        "input mode coordinator is missing from blackboard");
  }
  return value.value();
}

std::uint64_t timestampMilliseconds() {
  const auto now = std::chrono::system_clock::now();
  const auto milliseconds =
      std::chrono::duration_cast<std::chrono::milliseconds>(
          now.time_since_epoch());
  return static_cast<std::uint64_t>(milliseconds.count());
}

void recordPlaceholderEntry(const bt_core::Blackboard::Ptr& blackboard,
                            const std::string& interface_name,
                            const std::string& detail) {
  const auto diagnostics =
      blackboard->get<RuntimeDiagnostics*>(kRuntimeDiagnosticsBlackboardKey);
  if (!diagnostics.has_value() || diagnostics.value() == nullptr) return;
  diagnostics.value()->recordEvent({timestampMilliseconds(), "INFO", "EXECUTOR",
                                    interface_name, "placeholder", detail});
}

std::string requireLiteral(const bt_core::NodeConfig& config,
                           const std::string& port) {
  if (config.port_remap.count(port) != 0) {
    throw std::invalid_argument(port + " must be a literal value");
  }
  const auto value = config.port_values.find(port);
  if (value == config.port_values.end()) {
    throw std::invalid_argument(port + " literal is required");
  }
  return value->second;
}

}  // namespace

bt_core::PortsList SelectInputModeNode::providedPorts() {
  return bt_core::makePorts(bt_core::OutputPort<std::string>(
      "selected_mode", "Mode selected for this behavior-tree tick"));
}

bt_core::NodeStatus SelectInputModeNode::tick() {
  const std::string selected =
      coordinator(blackboard())->selectForTick(InputModeCoordinator::Clock::now());
  setOutput("selected_mode", selected);
  return bt_core::NodeStatus::SUCCESS;
}

InputModeGuardNode::InputModeGuardNode(std::string name,
                                       bt_core::NodeConfig config)
    : ConditionNode(std::move(name), std::move(config)) {
  if (!blackboard()->contains(kInputModeRegistryBlackboardKey)) return;

  const auto registry = blackboard()->get<InputModeRegistry*>(
      kInputModeRegistryBlackboardKey);
  if (!registry.has_value() || registry.value() == nullptr) {
    throw std::invalid_argument("input mode registry pointer must not be null");
  }
  mode_id_ = requireLiteral(this->config(), "mode");
  const std::string label = requireLiteral(this->config(), "label");
  const std::string selectable_text =
      requireLiteral(this->config(), "selectable");
  if (selectable_text != "true" && selectable_text != "false") {
    throw std::invalid_argument("selectable literal must be true or false");
  }
  registry.value()->registerMode(mode_id_, label, selectable_text == "true");
}

bt_core::PortsList InputModeGuardNode::providedPorts() {
  return bt_core::makePorts(
      bt_core::InputPort<std::string>("mode", "", "Literal input mode ID"),
      bt_core::InputPort<std::string>("label", "", "Literal display label"),
      bt_core::InputPort<bool>("selectable", "", "Whether the UI may select it"),
      bt_core::InputPort<std::string>(
          "selected_mode", "", "Mode selected for this behavior-tree tick"));
}

bt_core::NodeStatus InputModeGuardNode::tick() {
  const auto selected = getInput<std::string>("selected_mode");
  return selected.has_value() && selected.value() == mode_id_
             ? bt_core::NodeStatus::SUCCESS
             : bt_core::NodeStatus::FAILURE;
}

ActivateInputModeNode::ActivateInputModeNode(std::string name,
                                             bt_core::NodeConfig config)
    : ActionNode(std::move(name), std::move(config)) {
  if (!blackboard()->contains(kInputModeCoordinatorBlackboardKey)) return;
  mode_id_ = requireLiteral(this->config(), "mode");
}

bt_core::PortsList ActivateInputModeNode::providedPorts() {
  return bt_core::makePorts(bt_core::InputPort<std::string>(
      "mode", "", "Literal input mode ID to mark active"));
}

bt_core::NodeStatus ActivateInputModeNode::tick() {
  try {
    if (mode_id_.empty()) {
      throw std::invalid_argument("mode literal is required");
    }
    coordinator(blackboard())->activate(mode_id_,
                                        InputModeCoordinator::Clock::now());
    setFailureReason("");
    return bt_core::NodeStatus::SUCCESS;
  } catch (const std::exception& error) {
    setFailureReason(error.what());
    return bt_core::NodeStatus::FAILURE;
  }
}

bt_core::NodeStatus WebInputStubNode::tick() {
  return bt_core::NodeStatus::RUNNING;
}

bt_core::NodeStatus PolicyInputStubNode::tick() {
  if (!entry_recorded_) {
    recordPlaceholderEntry(
        blackboard(), name(),
        "Policy input is a placeholder; no command emitted");
    entry_recorded_ = true;
  }
  return bt_core::NodeStatus::RUNNING;
}

void PolicyInputStubNode::onHalted() { entry_recorded_ = false; }

bt_core::NodeStatus KeyboardVelocityInputNode::tick() {
  if (!entry_recorded_) {
    recordPlaceholderEntry(
        blackboard(), name(),
        "Keyboard velocity stream is routed by keyboard_control_router");
    entry_recorded_ = true;
  }
  return bt_core::NodeStatus::RUNNING;
}

void KeyboardVelocityInputNode::onHalted() { entry_recorded_ = false; }

bt_core::NodeStatus PikaInputStubNode::tick() {
  if (!entry_recorded_) {
    recordPlaceholderEntry(
        blackboard(), name(),
        "Pika input is a placeholder; no command emitted");
    entry_recorded_ = true;
  }
  return bt_core::NodeStatus::RUNNING;
}

void PikaInputStubNode::onHalted() { entry_recorded_ = false; }

bt_core::NodeStatus PikaPositionInputNode::tick() {
  if (!entry_recorded_) {
    recordPlaceholderEntry(
        blackboard(), name(),
        "Pika position stream is routed by the Cartesian Pika bridge");
    entry_recorded_ = true;
  }
  return bt_core::NodeStatus::RUNNING;
}

void PikaPositionInputNode::onHalted() { entry_recorded_ = false; }

bt_core::NodeStatus PikaVelocityInputNode::tick() {
  if (!entry_recorded_) {
    recordPlaceholderEntry(
        blackboard(), name(),
        "Pika velocity stream is routed by the Cartesian Pika bridge");
    entry_recorded_ = true;
  }
  return bt_core::NodeStatus::RUNNING;
}

void PikaVelocityInputNode::onHalted() { entry_recorded_ = false; }

bt_core::NodeStatus IdleInputNode::tick() {
  return bt_core::NodeStatus::RUNNING;
}

}  // namespace realman_bt
