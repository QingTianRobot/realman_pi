#pragma once

#include <chrono>
#include <cstdint>
#include <string>

#include "realman_bt/control_mode_types.hpp"

namespace realman_bt {

struct SwitchRequestResult {
  bool accepted{false};
  std::uint64_t request_id{0};
  std::string message;
};

struct ControlModeSnapshot {
  ControlMode current_mode{ControlMode::NONE};
  ControlMode requested_mode{ControlMode::NONE};
  SwitchPhase phase{SwitchPhase::IDLE};
  std::string owner_id;
  std::string requested_owner_id;
  std::uint64_t epoch{0};
  std::string failure_code;
  std::string detail;
};

class ControlModeStateMachine {
 public:
  using Clock = std::chrono::steady_clock;

  SwitchRequestResult request(ControlMode mode, std::string owner_id,
                              std::uint32_t lease_timeout_ms,
                              Clock::time_point now);
  const ControlModeSnapshot& advance(SwitchEvent event, Clock::time_point now);
  void fail(std::string code, std::string detail, Clock::time_point now);
  void cancel(Clock::time_point now);

  bool leaseValid(Clock::time_point now) const;
  bool commandAllowed(ControlMode mode, const std::string& owner_id,
                      std::uint64_t epoch, Clock::time_point now) const;
  const ControlModeSnapshot& state() const { return state_; }

 private:
  ControlModeSnapshot state_;
  std::uint64_t next_request_id_{1};
  std::uint32_t requested_lease_timeout_ms_{0};
  Clock::time_point lease_deadline_{};
};

}  // namespace realman_bt
