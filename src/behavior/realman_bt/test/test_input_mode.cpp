#include <cassert>
#include <chrono>
#include <stdexcept>
#include <string>
#include <vector>

#include "realman_bt/input_mode.hpp"

namespace {

using realman_bt::InputModeCoordinator;
using realman_bt::InputModePhase;
using realman_bt::InputModeRegistry;
using realman_bt::InputModeSnapshot;

template <typename Callable>
void assertInvalidArgument(Callable&& callable) {
  try {
    callable();
    assert(false);
  } catch (const std::invalid_argument&) {
  }
}

template <typename Callable>
void assertLogicError(Callable&& callable) {
  try {
    callable();
    assert(false);
  } catch (const std::logic_error&) {
  }
}

InputModeRegistry makeRegistry() {
  InputModeRegistry registry;
  registry.registerMode("web", "Web", false);
  registry.registerMode("policy", "Policy", true);
  registry.registerMode("pika", "Pika", true);
  registry.registerMode("none", "无输入", true);
  return registry;
}

void assertSnapshot(const InputModeSnapshot& snapshot,
                    const std::string& requested,
                    const std::string& selected,
                    const std::string& active,
                    InputModePhase phase,
                    std::uint64_t request_id,
                    std::uint64_t epoch) {
  assert(snapshot.requested_mode == requested);
  assert(snapshot.selected_mode == selected);
  assert(snapshot.active_mode == active);
  assert(snapshot.phase == phase);
  assert(snapshot.request_id == request_id);
  assert(snapshot.epoch == epoch);
}

void testRegistryPreservesOrderAndCoalescesExactDuplicates() {
  InputModeRegistry registry;
  registry.registerMode("web", "Web", false);
  registry.registerMode("policy", "Policy", true);
  registry.registerMode("pika", "Pika", true);
  registry.registerMode("none", "无输入", true);
  registry.registerMode("policy", "Policy", true);

  registry.validate();

  assert(registry.definitions().size() == 4);
  assert(registry.definitions()[0].id == "web");
  assert(registry.definitions()[1].id == "policy");
  assert(registry.definitions()[2].id == "pika");
  assert(registry.definitions()[3].id == "none");
}

void testRegistryRejectsMalformedDefinitionsIndependently() {
  assertInvalidArgument([] {
    InputModeRegistry registry;
    registry.registerMode("", "Empty", true);
  });
  assertInvalidArgument([] {
    InputModeRegistry registry;
    registry.registerMode("Policy", "Policy", true);
  });
  assertInvalidArgument([] {
    InputModeRegistry registry;
    registry.registerMode("policy-mode", "Policy", true);
  });
  assertInvalidArgument([] {
    InputModeRegistry registry;
    registry.registerMode("policy", "", true);
  });
  assertInvalidArgument([] {
    InputModeRegistry registry;
    registry.registerMode("policy", "   ", true);
  });
  assertInvalidArgument([] {
    InputModeRegistry registry;
    registry.registerMode("policy", "Policy\nMode", true);
  });
  assertInvalidArgument([] {
    InputModeRegistry registry;
    registry.registerMode("policy", "Policy", true);
    registry.registerMode("policy", "Different", true);
  });
}

void testRegistryRejectsInvalidCatalogsIndependently() {
  assertInvalidArgument([] {
    InputModeRegistry registry;
    registry.registerMode("policy", "Policy", true);
    registry.validate();
  });
  assertInvalidArgument([] {
    InputModeRegistry registry;
    registry.registerMode("web", "Web", true);
    registry.registerMode("none", "无输入", true);
    registry.validate();
  });
  assertInvalidArgument([] {
    InputModeRegistry registry;
    registry.registerMode("web", "Web", false);
    registry.registerMode("none", "无输入", false);
    registry.validate();
  });
}

void testCoordinatorValidatesFallbackOnlyOnFirstUse() {
  InputModeRegistry registry;
  InputModeCoordinator coordinator(
      registry, std::chrono::milliseconds(100), "missing", {});
  registry = makeRegistry();

  assertInvalidArgument([&] {
    static_cast<void>(coordinator.selectForTick(InputModeCoordinator::Clock::time_point{}));
  });

  InputModeCoordinator nonselectable_fallback(
      registry, std::chrono::milliseconds(100), "web", {});
  assertInvalidArgument([&] {
    static_cast<void>(nonselectable_fallback.selectForTick(
        InputModeCoordinator::Clock::time_point{}));
  });
}

void testCompleteNeutralTransitionSequences() {
  using Clock = InputModeCoordinator::Clock;
  const auto start = Clock::time_point{};
  auto registry = makeRegistry();
  std::vector<InputModeSnapshot> events;
  InputModeCoordinator coordinator(
      registry, std::chrono::milliseconds(100), "none",
      [&](const InputModeSnapshot& snapshot) { events.push_back(snapshot); });

  assertSnapshot(coordinator.snapshot(), "none", "none", "none",
                 InputModePhase::kActive, 0, 0);
  assert(coordinator.selectForTick(start) == "none");
  coordinator.activate("none", start);
  assert(events.empty());

  const auto policy_request = coordinator.request("policy", "browser", start);
  assert(policy_request.accepted && policy_request.request_id == 1);
  assertSnapshot(coordinator.snapshot(), "policy", "none", "none",
                 InputModePhase::kSwitching, 1, 0);
  assert(coordinator.selectForTick(start) == "none");
  coordinator.activate("none", start);
  assert(coordinator.selectForTick(start) == "policy");
  coordinator.activate("policy", start);
  assertSnapshot(coordinator.snapshot(), "policy", "policy", "policy",
                 InputModePhase::kActive, 1, 1);

  const auto pika_request = coordinator.request("pika", "browser", start);
  assert(pika_request.accepted && pika_request.request_id == 2);
  assertSnapshot(coordinator.snapshot(), "pika", "none", "policy",
                 InputModePhase::kSwitching, 2, 1);
  assert(coordinator.selectForTick(start) == "none");
  coordinator.activate("none", start);
  assertSnapshot(coordinator.snapshot(), "pika", "none", "none",
                 InputModePhase::kSwitching, 2, 1);
  assert(coordinator.selectForTick(start) == "pika");
  assertSnapshot(coordinator.snapshot(), "pika", "pika", "none",
                 InputModePhase::kSwitching, 2, 1);
  coordinator.activate("pika", start);
  assertSnapshot(coordinator.snapshot(), "pika", "pika", "pika",
                 InputModePhase::kActive, 2, 2);

  const auto web_request = coordinator.request("web", "web-control", start);
  assert(web_request.accepted && web_request.request_id == 3);
  assertSnapshot(coordinator.snapshot(), "web", "none", "pika",
                 InputModePhase::kSwitching, 3, 2);
  coordinator.activate("none", start);
  assertSnapshot(coordinator.snapshot(), "web", "none", "none",
                 InputModePhase::kSwitching, 3, 2);
  assert(coordinator.selectForTick(start) == "web");
  coordinator.activate("web", start);
  assertSnapshot(coordinator.snapshot(), "web", "web", "web",
                 InputModePhase::kActive, 3, 3);

  const auto none_request = coordinator.request("none", "browser", start);
  assert(none_request.accepted && none_request.request_id == 4);
  assertSnapshot(coordinator.snapshot(), "none", "none", "web",
                 InputModePhase::kSwitching, 4, 3);
  coordinator.activate("none", start);
  assertSnapshot(coordinator.snapshot(), "none", "none", "none",
                 InputModePhase::kSwitching, 4, 3);
  assert(coordinator.selectForTick(start) == "none");
  assertSnapshot(coordinator.snapshot(), "none", "none", "none",
                 InputModePhase::kSwitching, 4, 3);
  coordinator.activate("none", start);
  assertSnapshot(coordinator.snapshot(), "none", "none", "none",
                 InputModePhase::kActive, 4, 4);
}

void testSameActiveRequestIsIdempotent() {
  using Clock = InputModeCoordinator::Clock;
  const auto now = Clock::time_point{};
  auto registry = makeRegistry();
  std::vector<InputModeSnapshot> events;
  InputModeCoordinator coordinator(
      registry, std::chrono::milliseconds(100), "none",
      [&](const InputModeSnapshot& snapshot) { events.push_back(snapshot); });

  const auto first = coordinator.request("policy", "browser", now);
  coordinator.activate("none", now);
  assert(coordinator.selectForTick(now) == "policy");
  coordinator.activate("policy", now);
  const auto event_count = events.size();

  const auto repeated = coordinator.request("policy", "different-requester", now);
  assert(repeated.accepted);
  assert(repeated.request_id == first.request_id);
  assert(events.size() == event_count);
  assertSnapshot(coordinator.snapshot(), "policy", "policy", "policy",
                 InputModePhase::kActive, first.request_id, 1);
}

void testRepeatedNeutralActivationIsIdempotent() {
  using Clock = InputModeCoordinator::Clock;
  const auto now = Clock::time_point{};
  auto registry = makeRegistry();
  std::vector<InputModeSnapshot> events;
  InputModeCoordinator coordinator(
      registry, std::chrono::milliseconds(100), "none",
      [&](const InputModeSnapshot& snapshot) { events.push_back(snapshot); });

  const auto request = coordinator.request("policy", "browser", now);
  coordinator.activate("none", now);
  const auto event_count = events.size();
  const auto epoch = coordinator.snapshot().epoch;

  coordinator.activate("none", now);

  assert(events.size() == event_count);
  assertSnapshot(coordinator.snapshot(), "policy", "none", "none",
                 InputModePhase::kSwitching, request.request_id, epoch);
  assert(coordinator.selectForTick(now) == "policy");
  assert(coordinator.snapshot().phase == InputModePhase::kSwitching);
  assert(coordinator.snapshot().epoch == epoch);
  coordinator.activate("policy", now);
  assert(coordinator.snapshot().phase == InputModePhase::kActive);
  assert(coordinator.snapshot().epoch == epoch + 1);
}

void testSupersedingRequestUsesLatestModeAndRequestId() {
  using Clock = InputModeCoordinator::Clock;
  const auto now = Clock::time_point{};
  auto registry = makeRegistry();
  InputModeCoordinator coordinator(
      registry, std::chrono::milliseconds(100), "none", {});

  const auto first = coordinator.request("policy", "browser", now);
  const auto second = coordinator.request("pika", "browser", now);
  assert(first.accepted && second.accepted);
  assert(first.request_id == 1);
  assert(second.request_id == 2);
  assert(coordinator.snapshot().request_id == second.request_id);
  coordinator.activate("none", now);
  assert(coordinator.selectForTick(now) == "pika");
}

void testRequestForActiveModeCancelsPendingDifferentMode() {
  using Clock = InputModeCoordinator::Clock;
  const auto now = Clock::time_point{};
  auto registry = makeRegistry();
  std::vector<InputModeSnapshot> events;
  InputModeCoordinator coordinator(
      registry, std::chrono::milliseconds(100), "none",
      [&](const InputModeSnapshot& snapshot) { events.push_back(snapshot); });

  const auto policy = coordinator.request("policy", "browser", now);
  coordinator.activate("none", now);
  assert(coordinator.selectForTick(now) == "policy");
  coordinator.activate("policy", now);
  assert(coordinator.snapshot().epoch == 1);

  const auto pika = coordinator.request("pika", "browser", now);
  assert(pika.accepted && pika.request_id == policy.request_id + 1);
  const auto event_count_with_pending_request = events.size();

  const auto cancel = coordinator.request("policy", "browser", now);

  assert(cancel.accepted && cancel.request_id == pika.request_id + 1);
  assert(events.size() == event_count_with_pending_request + 1);
  assertSnapshot(coordinator.snapshot(), "policy", "policy", "policy",
                 InputModePhase::kActive, cancel.request_id, 1);

  const auto event_count_after_cancel = events.size();
  assert(coordinator.selectForTick(now) == "policy");
  coordinator.activate("policy", now);
  assert(events.size() == event_count_after_cancel);
  assert(coordinator.snapshot().epoch == 1);
}

void testRejectedRequestsDoNotMutateStateOrConsumeRequestIds() {
  using Clock = InputModeCoordinator::Clock;
  const auto now = Clock::time_point{};
  auto registry = makeRegistry();
  std::vector<InputModeSnapshot> events;
  InputModeCoordinator coordinator(
      registry, std::chrono::milliseconds(100), "none",
      [&](const InputModeSnapshot& snapshot) { events.push_back(snapshot); });

  const auto unknown = coordinator.request("unknown", "browser", now);
  const auto anonymous = coordinator.request("policy", "", now);
  assert(!unknown.accepted && unknown.request_id == 0);
  assert(!anonymous.accepted && anonymous.request_id == 0);
  assert(events.empty());
  const auto accepted = coordinator.request("policy", "browser", now);
  assert(accepted.accepted && accepted.request_id == 1);
}

void testTimeoutPublishesFailedBeforeSchedulingFallback() {
  using Clock = InputModeCoordinator::Clock;
  const auto start = Clock::time_point{};
  auto registry = makeRegistry();
  std::vector<InputModeSnapshot> events;
  InputModeCoordinator coordinator(
      registry, std::chrono::milliseconds(100), "none",
      [&](const InputModeSnapshot& snapshot) { events.push_back(snapshot); });

  const auto request = coordinator.request("policy", "browser", start);
  assert(request.accepted);
  assert(coordinator.selectForTick(start + std::chrono::milliseconds(100)) ==
         "none");
  assert(coordinator.snapshot().phase == InputModePhase::kFailed);
  assert(coordinator.snapshot().request_id == request.request_id);
  assert(!coordinator.snapshot().detail.empty());
  assert(events.back().phase == InputModePhase::kFailed);

  assert(coordinator.selectForTick(start + std::chrono::milliseconds(101)) ==
         "none");
  assertSnapshot(coordinator.snapshot(), "none", "none", "none",
                 InputModePhase::kSwitching, request.request_id, 0);
}

void testActivationAfterDeadlinePublishesFailedInsteadOfActive() {
  using Clock = InputModeCoordinator::Clock;
  const auto start = Clock::time_point{};
  auto registry = makeRegistry();
  std::vector<InputModeSnapshot> events;
  InputModeCoordinator coordinator(
      registry, std::chrono::milliseconds(100), "none",
      [&](const InputModeSnapshot& snapshot) { events.push_back(snapshot); });

  const auto request = coordinator.request("policy", "browser", start);
  coordinator.activate("none", start);
  assert(coordinator.selectForTick(start + std::chrono::milliseconds(99)) ==
         "policy");
  const auto event_count_before_activation = events.size();

  assertLogicError([&] {
    coordinator.activate("policy", start + std::chrono::milliseconds(101));
  });

  assert(events.size() == event_count_before_activation + 1);
  assert(events.back().phase == InputModePhase::kFailed);
  assertSnapshot(coordinator.snapshot(), "policy", "policy", "none",
                 InputModePhase::kFailed, request.request_id, 0);
  assert(coordinator.snapshot().detail == "input mode switch timed out");
}

void testExplicitFailurePublishesBeforeFallback() {
  using Clock = InputModeCoordinator::Clock;
  const auto now = Clock::time_point{};
  auto registry = makeRegistry();
  std::vector<InputModeSnapshot> events;
  InputModeCoordinator coordinator(
      registry, std::chrono::milliseconds(100), "none",
      [&](const InputModeSnapshot& snapshot) { events.push_back(snapshot); });

  const auto request = coordinator.request("policy", "browser", now);
  coordinator.activate("none", now);
  static_cast<void>(coordinator.selectForTick(now));
  coordinator.activate("policy", now);

  coordinator.fail("policy branch failed", now);
  assertSnapshot(coordinator.snapshot(), "policy", "policy", "policy",
                 InputModePhase::kFailed, request.request_id, 1);
  assert(coordinator.snapshot().detail == "policy branch failed");
  assert(events.back().phase == InputModePhase::kFailed);

  assert(coordinator.selectForTick(now) == "none");
  assertSnapshot(coordinator.snapshot(), "none", "none", "policy",
                 InputModePhase::kSwitching, request.request_id, 1);
}

}  // namespace

int main() {
  testRegistryPreservesOrderAndCoalescesExactDuplicates();
  testRegistryRejectsMalformedDefinitionsIndependently();
  testRegistryRejectsInvalidCatalogsIndependently();
  testCoordinatorValidatesFallbackOnlyOnFirstUse();
  testCompleteNeutralTransitionSequences();
  testSameActiveRequestIsIdempotent();
  testRepeatedNeutralActivationIsIdempotent();
  testSupersedingRequestUsesLatestModeAndRequestId();
  testRequestForActiveModeCancelsPendingDifferentMode();
  testRejectedRequestsDoNotMutateStateOrConsumeRequestIds();
  testTimeoutPublishesFailedBeforeSchedulingFallback();
  testActivationAfterDeadlinePublishesFailedInsteadOfActive();
  testExplicitFailurePublishesBeforeFallback();
  return 0;
}
