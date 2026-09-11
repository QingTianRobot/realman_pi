#include "realman_bt/control_mode_state_machine.hpp"

#include <stdexcept>
#include <utility>

namespace realman_bt {

ControlMode parseControlMode(const std::string& value) {
  if (value == "none") return ControlMode::NONE;
  if (value == "web") return ControlMode::WEB;
  if (value == "policy") return ControlMode::POLICY;
  if (value == "teleop") return ControlMode::TELEOP;
  throw std::invalid_argument("unknown control mode: " + value);
}

const char* toString(ControlMode mode) {
  switch (mode) {
    case ControlMode::NONE: return "none";
    case ControlMode::WEB: return "web";
    case ControlMode::POLICY: return "policy";
    case ControlMode::TELEOP: return "teleop";
  }
  return "none";
}

SwitchRequestResult ControlModeStateMachine::request(
    ControlMode mode, std::string owner_id, std::uint32_t lease_timeout_ms,
    Clock::time_point) {
  const auto request_id = next_request_id_++;
  if (mode != ControlMode::NONE && owner_id.empty()) {
    return {false, request_id, "owner_id is required"};
  }
  if (mode != ControlMode::NONE && lease_timeout_ms == 0) {
    return {false, request_id, "lease_timeout_ms must be positive"};
  }
  state_.requested_mode = mode;
  state_.requested_owner_id = std::move(owner_id);
  state_.phase = SwitchPhase::REQUESTED;
  state_.failure_code.clear();
  state_.detail.clear();
  requested_lease_timeout_ms_ = lease_timeout_ms;
  return {true, request_id, "accepted"};
}

const ControlModeSnapshot& ControlModeStateMachine::advance(
    SwitchEvent event, Clock::time_point now) {
  const auto invalid = [&]() {
    throw std::logic_error("invalid control mode transition");
  };
  switch (event) {
    case SwitchEvent::CURRENT_STOPPED:
      if (state_.phase != SwitchPhase::REQUESTED) invalid();
      state_.phase = SwitchPhase::CANCELING_MOTION;
      break;
    case SwitchEvent::MOTION_CANCELED:
      if (state_.phase != SwitchPhase::CANCELING_MOTION) invalid();
      state_.phase = SwitchPhase::VERIFYING_SAFE;
      break;
    case SwitchEvent::ARM_SAFE:
      if (state_.phase != SwitchPhase::VERIFYING_SAFE) invalid();
      state_.phase = SwitchPhase::ACTIVATING_BACKEND;
      break;
    case SwitchEvent::BACKEND_ACTIVE:
      if (state_.phase != SwitchPhase::ACTIVATING_BACKEND) invalid();
      state_.phase = SwitchPhase::CONFIRMING_LEASE;
      break;
    case SwitchEvent::LEASE_CONFIRMED:
      if (state_.phase != SwitchPhase::CONFIRMING_LEASE) invalid();
      state_.current_mode = state_.requested_mode;
      state_.owner_id = state_.requested_owner_id;
      ++state_.epoch;
      state_.phase = SwitchPhase::ACTIVE;
      lease_deadline_ = now + std::chrono::milliseconds(requested_lease_timeout_ms_);
      break;
  }
  return state_;
}

void ControlModeStateMachine::fail(std::string code, std::string detail,
                                   Clock::time_point) {
  state_.current_mode = ControlMode::NONE;
  state_.requested_mode = ControlMode::NONE;
  state_.owner_id.clear();
  state_.requested_owner_id.clear();
  state_.phase = SwitchPhase::FAILED;
  state_.failure_code = std::move(code);
  state_.detail = std::move(detail);
  requested_lease_timeout_ms_ = 0;
  lease_deadline_ = {};
}

void ControlModeStateMachine::cancel(Clock::time_point) {
  state_ = {};
  requested_lease_timeout_ms_ = 0;
  lease_deadline_ = {};
}

bool ControlModeStateMachine::leaseValid(Clock::time_point now) const {
  if (state_.phase != SwitchPhase::ACTIVE) return false;
  if (state_.current_mode == ControlMode::NONE) return true;
  return now <= lease_deadline_;
}

bool ControlModeStateMachine::commandAllowed(
    ControlMode mode, const std::string& owner_id, std::uint64_t epoch,
    Clock::time_point now) const {
  return leaseValid(now) && state_.current_mode == mode &&
         state_.owner_id == owner_id && state_.epoch == epoch;
}

}  // namespace realman_bt
