// The assertions wrap calls with side effects (selectForTick); a Release build
// defines NDEBUG and would drop them, so keep assert live in every build type.
#undef NDEBUG
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

// Drives the coordinator the way the tree does on each tick until no transition is pending.
void settle(InputModeCoordinator& coordinator, InputModeCoordinator::Clock::time_point now) {
  for (int tick = 0; tick < 4 && coordinator.snapshot().phase != InputModePhase::kActive; ++tick) {
    coordinator.activate(coordinator.selectForTick(now), now);
  }
}

// After a branch fails, the fallback mode keeps saying why the tree went there, through the switch
// and once it is ACTIVE, so the Web page can show it.
void testFallbackToNoneCarriesTheFailureReason() {
  using Clock = InputModeCoordinator::Clock;
  const auto now = Clock::time_point{};
  auto registry = makeRegistry();
  InputModeCoordinator coordinator(registry, std::chrono::milliseconds(100), "none", {});
  coordinator.request("policy", "browser", now);
  settle(coordinator, now);
  assert(coordinator.snapshot().active_mode == "policy");
  assert(coordinator.snapshot().detail.empty());

  coordinator.fail("joint J5 = 19.6 deg is outside [20.0, 108.2]", now);
  assert(coordinator.selectForTick(now) == "none");
  assert(coordinator.snapshot().phase == InputModePhase::kSwitching);
  assert(coordinator.snapshot().detail ==
         "policy failed: joint J5 = 19.6 deg is outside [20.0, 108.2]");
  settle(coordinator, now);
  assertSnapshot(coordinator.snapshot(), "none", "none", "none", InputModePhase::kActive, 1, 2);
  assert(coordinator.snapshot().detail ==
         "policy failed: joint J5 = 19.6 deg is outside [20.0, 108.2]");
}

// Switching back to the failed mode starts clean: the old failure is not shown again.
void testRequestingAModeAgainClearsTheOldFailure() {
  using Clock = InputModeCoordinator::Clock;
  const auto now = Clock::time_point{};
  auto registry = makeRegistry();
  InputModeCoordinator coordinator(registry, std::chrono::milliseconds(100), "none", {});
  coordinator.request("policy", "browser", now);
  settle(coordinator, now);
  coordinator.fail("grasp missed", now);
  static_cast<void>(coordinator.selectForTick(now));
  settle(coordinator, now);

  coordinator.request("policy", "browser", now);
  assert(coordinator.snapshot().detail.empty());
  settle(coordinator, now);
  assert(coordinator.snapshot().active_mode == "policy");
  assert(coordinator.snapshot().detail.empty());
}

// A switch to none that someone asked for names who asked; other modes carry no detail.
void testRequestedNoneNamesTheRequester() {
  using Clock = InputModeCoordinator::Clock;
  const auto now = Clock::time_point{};
  auto registry = makeRegistry();
  InputModeCoordinator coordinator(registry, std::chrono::milliseconds(100), "none", {});
  coordinator.request("pika", "browser", now);
  settle(coordinator, now);
  assert(coordinator.snapshot().detail.empty());

  coordinator.request("none", "web:operator", now);
  settle(coordinator, now);
  assert(coordinator.snapshot().active_mode == "none");
  assert(coordinator.snapshot().phase == InputModePhase::kActive);
  assert(coordinator.snapshot().detail == "requested by web:operator");
}

}  // namespace

// The requested branch moves the arms to its start pose before ActivateInputMode; at 10% that takes far
// longer than the switch timeout. While its MoveJ keeps the switch alive the deadline restarts, so a long
// entry move is not cut off as "input mode switch timed out" (2026-10-24, policy mode).
void testKeepSwitchAliveOutlastsTheSwitchTimeout() {
  using Clock = InputModeCoordinator::Clock;
  using std::chrono::milliseconds;
  const auto start = Clock::time_point{};
  auto registry = makeRegistry();
  InputModeCoordinator coordinator(registry, milliseconds(100), "none", nullptr);

  const auto request = coordinator.request("policy", "browser", start);
  coordinator.activate("none", start);
  assert(coordinator.selectForTick(start) == "policy");
  for (int tick = 1; tick <= 30; ++tick) {
    const auto now = start + milliseconds(50 * tick);
    assert(coordinator.selectForTick(now) == "policy");
    coordinator.keepSwitchAlive(now);
    coordinator.afterTick(true, now);
  }
  assert(coordinator.snapshot().phase == InputModePhase::kSwitching);

  coordinator.activate("policy", start + milliseconds(1550));
  assertSnapshot(coordinator.snapshot(), "policy", "policy", "policy",
                 InputModePhase::kActive, request.request_id, 1);

  // Once ACTIVE, neither call changes anything.
  coordinator.keepSwitchAlive(start + milliseconds(1600));
  coordinator.afterTick(false, start + milliseconds(1600));
  assert(coordinator.snapshot().phase == InputModePhase::kActive);
}

// A branch that is merely RUNNING (an entry waiting for a service that never comes) is still bounded by
// the switch timeout; so is the neutral half of a switch, and a deadline that already passed.
void testOnlyKeepSwitchAliveExtendsTheDeadline() {
  using Clock = InputModeCoordinator::Clock;
  using std::chrono::milliseconds;
  const auto start = Clock::time_point{};
  auto registry = makeRegistry();

  InputModeCoordinator waiting(registry, milliseconds(100), "none", nullptr);
  waiting.request("policy", "browser", start);
  waiting.activate("none", start);
  assert(waiting.selectForTick(start) == "policy");
  waiting.afterTick(true, start + milliseconds(90));
  static_cast<void>(waiting.selectForTick(start + milliseconds(100)));
  assert(waiting.snapshot().phase == InputModePhase::kFailed);
  assert(waiting.snapshot().detail == "input mode switch timed out");

  InputModeCoordinator neutral(registry, milliseconds(100), "none", nullptr);
  neutral.request("policy", "browser", start);
  neutral.keepSwitchAlive(start + milliseconds(90));
  assert(neutral.selectForTick(start + milliseconds(100)) == "none");
  assert(neutral.snapshot().phase == InputModePhase::kFailed);

  InputModeCoordinator late(registry, milliseconds(100), "none", nullptr);
  late.request("policy", "browser", start);
  late.activate("none", start);
  assert(late.selectForTick(start) == "policy");
  late.keepSwitchAlive(start + milliseconds(100));
  static_cast<void>(late.selectForTick(start + milliseconds(101)));
  assert(late.snapshot().phase == InputModePhase::kFailed);
  assert(late.snapshot().detail == "input mode switch timed out");
}

// An entry that stopped (its MoveJ failed) is not re-entered every tick until the deadline: the switch
// fails at once and names the mode.
void testFailedEntryFailsTheSwitchAtOnce() {
  using Clock = InputModeCoordinator::Clock;
  const auto start = Clock::time_point{};
  auto registry = makeRegistry();
  InputModeCoordinator coordinator(registry, std::chrono::milliseconds(100), "none", nullptr);

  coordinator.request("policy", "browser", start);
  coordinator.activate("none", start);
  assert(coordinator.selectForTick(start) == "policy");
  coordinator.afterTick(false, start);
  assert(coordinator.snapshot().phase == InputModePhase::kFailed);
  assert(coordinator.snapshot().detail == "policy entry failed before activation");
  assert(coordinator.selectForTick(start) == "none");
}

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
  testFallbackToNoneCarriesTheFailureReason();
  testRequestingAModeAgainClearsTheOldFailure();
  testRequestedNoneNamesTheRequester();
  testKeepSwitchAliveOutlastsTheSwitchTimeout();
  testOnlyKeepSwitchAliveExtendsTheDeadline();
  testFailedEntryFailsTheSwitchAtOnce();
  return 0;
}
