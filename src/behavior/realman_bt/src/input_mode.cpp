#include "realman_bt/input_mode.hpp"

#include <algorithm>
#include <cctype>
#include <stdexcept>
#include <utility>

namespace realman_bt {
namespace {

bool validModeId(const std::string& id) {
  if (id.empty() || id.front() < 'a' || id.front() > 'z') return false;
  return std::all_of(id.begin() + 1, id.end(), [](char character) {
    return (character >= 'a' && character <= 'z') ||
           (character >= '0' && character <= '9');
  });
}

bool validLabel(const std::string& label) {
  if (label.empty()) return false;
  bool has_non_whitespace = false;
  for (const unsigned char character : label) {
    if (character < 0x20 || character == 0x7f) return false;
    if (!std::isspace(character)) has_non_whitespace = true;
  }
  return has_non_whitespace;
}

}  // namespace

void InputModeRegistry::registerMode(std::string id, std::string label,
                                     bool selectable) {
  if (!validModeId(id)) {
    throw std::invalid_argument(
        "input mode id must be a lower-case ASCII identifier");
  }
  if (!validLabel(label)) {
    throw std::invalid_argument(
        "input mode label must contain visible characters and no controls");
  }

  const auto existing = std::find_if(
      definitions_.begin(), definitions_.end(),
      [&](const InputModeDefinition& definition) { return definition.id == id; });
  if (existing == definitions_.end()) {
    definitions_.push_back({std::move(id), std::move(label), selectable});
    return;
  }
  if (existing->label != label || existing->selectable != selectable) {
    throw std::invalid_argument("conflicting registration for input mode: " + id);
  }
}

void InputModeRegistry::validate() const {
  const auto none = std::find_if(
      definitions_.begin(), definitions_.end(),
      [](const InputModeDefinition& definition) { return definition.id == "none"; });
  if (none == definitions_.end()) {
    throw std::invalid_argument("input mode registry must define none");
  }

  const auto web = std::find_if(
      definitions_.begin(), definitions_.end(),
      [](const InputModeDefinition& definition) { return definition.id == "web"; });
  if (web != definitions_.end() && web->selectable) {
    throw std::invalid_argument("web input mode must not be selectable");
  }

  const bool has_selectable = std::any_of(
      definitions_.begin(), definitions_.end(),
      [](const InputModeDefinition& definition) { return definition.selectable; });
  if (!has_selectable) {
    throw std::invalid_argument(
        "input mode registry must define a selectable entry");
  }
}

InputModeCoordinator::InputModeCoordinator(
    const InputModeRegistry& registry, std::chrono::milliseconds switch_timeout,
    std::string safe_fallback_mode, Observer observer)
    : registry_(registry),
      switch_timeout_(switch_timeout),
      safe_fallback_mode_(std::move(safe_fallback_mode)),
      observer_(std::move(observer)) {
  if (switch_timeout_ <= std::chrono::milliseconds::zero()) {
    throw std::invalid_argument("input mode switch timeout must be positive");
  }
}

InputModeRequestResult InputModeCoordinator::request(
    const std::string& mode_id, const std::string& requester_id,
    Clock::time_point now) {
  ensureConfigurationValid();
  if (requester_id.empty()) {
    return {false, 0, "requester_id is required"};
  }
  if (!isRegistered(mode_id)) {
    return {false, 0, "unknown input mode: " + mode_id};
  }
  if (snapshot_.phase == InputModePhase::kActive &&
      snapshot_.active_mode == mode_id) {
    return {true, snapshot_.request_id, "already active"};
  }

  const auto request_id = next_request_id_++;
  snapshot_.requested_mode = mode_id;
  snapshot_.selected_mode = "none";
  snapshot_.phase = InputModePhase::kSwitching;
  snapshot_.request_id = request_id;
  snapshot_.detail.clear();
  deadline_ = now + switch_timeout_;
  transition_step_ = TransitionStep::kAwaitingNeutralActivation;
  notifyObserver();
  return {true, request_id, "accepted"};
}

std::string InputModeCoordinator::selectForTick(Clock::time_point now) {
  ensureConfigurationValid();
  if (snapshot_.phase == InputModePhase::kFailed) {
    scheduleFallback(now);
    return snapshot_.selected_mode;
  }
  if (snapshot_.phase != InputModePhase::kSwitching) {
    return snapshot_.selected_mode;
  }
  if (now >= deadline_) {
    fail("input mode switch timed out", now);
    return snapshot_.selected_mode;
  }
  if (transition_step_ == TransitionStep::kReadyToSelectRequested) {
    const bool selection_changed =
        snapshot_.selected_mode != snapshot_.requested_mode;
    snapshot_.selected_mode = snapshot_.requested_mode;
    transition_step_ = TransitionStep::kAwaitingRequestedActivation;
    if (selection_changed) notifyObserver();
  }
  return snapshot_.selected_mode;
}

void InputModeCoordinator::activate(const std::string& mode_id,
                                    Clock::time_point) {
  ensureConfigurationValid();
  if (mode_id != snapshot_.selected_mode) {
    throw std::logic_error("cannot activate unselected input mode: " + mode_id);
  }
  if (snapshot_.phase == InputModePhase::kFailed) return;
  if (snapshot_.phase == InputModePhase::kActive) {
    if (mode_id != snapshot_.active_mode) {
      throw std::logic_error("selected and active input modes disagree");
    }
    return;
  }

  if (transition_step_ == TransitionStep::kAwaitingNeutralActivation) {
    if (mode_id != "none") {
      throw std::logic_error("input mode transition requires a neutral tick");
    }
    const bool active_changed = snapshot_.active_mode != "none";
    snapshot_.active_mode = "none";
    transition_step_ = TransitionStep::kReadyToSelectRequested;
    if (active_changed) notifyObserver();
    return;
  }

  if (transition_step_ != TransitionStep::kAwaitingRequestedActivation ||
      mode_id != snapshot_.requested_mode) {
    throw std::logic_error("input mode activation is out of sequence");
  }
  snapshot_.active_mode = mode_id;
  snapshot_.phase = InputModePhase::kActive;
  ++snapshot_.epoch;
  snapshot_.detail.clear();
  transition_step_ = TransitionStep::kIdle;
  notifyObserver();
}

void InputModeCoordinator::fail(std::string detail, Clock::time_point) {
  ensureConfigurationValid();
  const bool changed = snapshot_.phase != InputModePhase::kFailed ||
                       snapshot_.detail != detail;
  snapshot_.phase = InputModePhase::kFailed;
  snapshot_.detail = std::move(detail);
  transition_step_ = TransitionStep::kIdle;
  if (changed) notifyObserver();
}

void InputModeCoordinator::ensureConfigurationValid() {
  if (configuration_validated_) return;
  registry_.validate();
  if (!isRegistered(safe_fallback_mode_)) {
    throw std::invalid_argument("unknown safe fallback input mode: " +
                                safe_fallback_mode_);
  }
  if (!isSelectable(safe_fallback_mode_)) {
    throw std::invalid_argument("safe fallback input mode must be selectable: " +
                                safe_fallback_mode_);
  }
  configuration_validated_ = true;
}

bool InputModeCoordinator::isRegistered(const std::string& mode_id) const {
  return std::any_of(
      registry_.definitions().begin(), registry_.definitions().end(),
      [&](const InputModeDefinition& definition) {
        return definition.id == mode_id;
      });
}

bool InputModeCoordinator::isSelectable(const std::string& mode_id) const {
  const auto definition = std::find_if(
      registry_.definitions().begin(), registry_.definitions().end(),
      [&](const InputModeDefinition& candidate) {
        return candidate.id == mode_id;
      });
  return definition != registry_.definitions().end() && definition->selectable;
}

void InputModeCoordinator::notifyObserver() const {
  if (observer_) observer_(snapshot_);
}

void InputModeCoordinator::scheduleFallback(Clock::time_point now) {
  snapshot_.requested_mode = safe_fallback_mode_;
  snapshot_.selected_mode = "none";
  snapshot_.phase = InputModePhase::kSwitching;
  snapshot_.detail.clear();
  deadline_ = now + switch_timeout_;
  transition_step_ = TransitionStep::kAwaitingNeutralActivation;
  notifyObserver();
}

}  // namespace realman_bt
