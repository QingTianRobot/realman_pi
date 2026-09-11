#pragma once

#include <cstdint>
#include <string>

namespace realman_bt {

enum class ControlMode : std::uint8_t { NONE = 0, WEB = 1, POLICY = 2, TELEOP = 3 };

enum class SwitchPhase : std::uint8_t {
  IDLE = 0,
  REQUESTED = 1,
  STOPPING_CURRENT = 2,
  CANCELING_MOTION = 3,
  VERIFYING_SAFE = 4,
  ACTIVATING_BACKEND = 5,
  CONFIRMING_LEASE = 6,
  ACTIVE = 7,
  FAILED = 8,
};

enum class SwitchEvent {
  CURRENT_STOPPED,
  MOTION_CANCELED,
  ARM_SAFE,
  BACKEND_ACTIVE,
  LEASE_CONFIRMED,
};

ControlMode parseControlMode(const std::string& value);
const char* toString(ControlMode mode);

}  // namespace realman_bt
