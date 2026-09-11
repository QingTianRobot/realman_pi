#include <cassert>
#include <chrono>
#include <stdexcept>

#include "realman_bt/control_mode_state_machine.hpp"

using realman_bt::ControlMode;
using realman_bt::ControlModeStateMachine;
using realman_bt::SwitchEvent;
using realman_bt::SwitchPhase;

int main() {
  using Clock = ControlModeStateMachine::Clock;
  const auto now = Clock::time_point{};

  assert(realman_bt::parseControlMode("none") == ControlMode::NONE);
  assert(realman_bt::parseControlMode("web") == ControlMode::WEB);
  assert(realman_bt::parseControlMode("policy") == ControlMode::POLICY);
  assert(realman_bt::parseControlMode("teleop") == ControlMode::TELEOP);
  try {
    static_cast<void>(realman_bt::parseControlMode("joystick"));
    assert(false);
  } catch (const std::invalid_argument&) {}

  ControlModeStateMachine machine;
  const auto request = machine.request(ControlMode::WEB, "browser-1", 1000, now);
  assert(request.accepted && request.request_id == 1);
  assert(machine.state().phase == SwitchPhase::REQUESTED);
  machine.advance(SwitchEvent::CURRENT_STOPPED, now);
  assert(machine.state().phase == SwitchPhase::CANCELING_MOTION);
  machine.advance(SwitchEvent::MOTION_CANCELED, now);
  machine.advance(SwitchEvent::ARM_SAFE, now);
  machine.advance(SwitchEvent::BACKEND_ACTIVE, now);
  machine.advance(SwitchEvent::LEASE_CONFIRMED, now);
  assert(machine.state().phase == SwitchPhase::ACTIVE);
  assert(machine.state().epoch == 1);
  assert(machine.commandAllowed(ControlMode::WEB, "browser-1", 1, now));
  assert(!machine.commandAllowed(ControlMode::WEB, "browser-1", 0, now));
  assert(!machine.leaseValid(now + std::chrono::milliseconds(1001)));

  const auto next = machine.request(ControlMode::POLICY, "policy-a", 2000, now);
  assert(next.accepted && next.request_id == 2);
  machine.fail("BACKEND_UNHEALTHY", "policy failed health check", now);
  assert(machine.state().phase == SwitchPhase::FAILED);
  assert(machine.state().current_mode == ControlMode::NONE);
  assert(machine.state().owner_id.empty());

  machine.cancel(now);
  assert(machine.state().phase == SwitchPhase::IDLE);
  assert(machine.state().current_mode == ControlMode::NONE);
  return 0;
}
