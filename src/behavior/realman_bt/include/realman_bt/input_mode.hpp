#pragma once

#include <chrono>
#include <cstdint>
#include <functional>
#include <string>
#include <vector>

namespace realman_bt {

enum class InputModePhase : std::uint8_t {
  kActive = 0,
  kSwitching = 1,
  kFailed = 2,
};

struct InputModeDefinition {
  std::string id;
  std::string label;
  bool selectable{false};
};

class InputModeRegistry {
 public:
  void registerMode(std::string id, std::string label, bool selectable);
  void validate() const;

  const std::vector<InputModeDefinition>& definitions() const noexcept {
    return definitions_;
  }

 private:
  std::vector<InputModeDefinition> definitions_;
};

struct InputModeSnapshot {
  std::string requested_mode{"none"};
  std::string selected_mode{"none"};
  std::string active_mode{"none"};
  InputModePhase phase{InputModePhase::kActive};
  std::uint64_t request_id{0};
  std::uint64_t epoch{0};
  std::string detail;
};

struct InputModeRequestResult {
  bool accepted{false};
  std::uint64_t request_id{0};
  std::string message;
};

class InputModeCoordinator {
 public:
  using Clock = std::chrono::steady_clock;
  using Observer = std::function<void(const InputModeSnapshot&)>;

  InputModeCoordinator(const InputModeRegistry& registry,
                       std::chrono::milliseconds switch_timeout,
                       std::string safe_fallback_mode, Observer observer);

  InputModeRequestResult request(const std::string& mode_id,
                                 const std::string& requester_id,
                                 Clock::time_point now);
  std::string selectForTick(Clock::time_point now);
  void activate(const std::string& mode_id, Clock::time_point now);
  void fail(std::string detail, Clock::time_point now);

  const InputModeSnapshot& snapshot() const noexcept { return snapshot_; }

 private:
  enum class TransitionStep : std::uint8_t {
    kIdle,
    kAwaitingNeutralActivation,
    kReadyToSelectRequested,
    kAwaitingRequestedActivation,
  };

  void ensureConfigurationValid();
  bool isRegistered(const std::string& mode_id) const;
  bool isSelectable(const std::string& mode_id) const;
  void notifyObserver() const;
  void scheduleFallback(Clock::time_point now);

  const InputModeRegistry& registry_;
  std::chrono::milliseconds switch_timeout_;
  std::string safe_fallback_mode_;
  Observer observer_;
  InputModeSnapshot snapshot_;
  std::uint64_t next_request_id_{1};
  Clock::time_point deadline_{};
  TransitionStep transition_step_{TransitionStep::kIdle};
  bool configuration_validated_{false};
};

}  // namespace realman_bt
