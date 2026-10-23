// A Release build defines NDEBUG, which would turn every assert below into a no-op.
#ifdef NDEBUG
#undef NDEBUG
#endif

#include <algorithm>
#include <cassert>
#include <cmath>
#include <stdexcept>
#include <string>

#include "realman_bt/policy_supervisor.hpp"

namespace {

using realman_bt::AttemptOutcome;
using realman_bt::BridgeStats;
using realman_bt::Joints;
using realman_bt::PolicySupervisor;
using realman_bt::PolicyTaskConfig;

// Feeds a PolicySupervisor the way the ROS wrapper does: sensors at 10 Hz, one evaluation per step.
struct Rig {
  explicit Rig(PolicyTaskConfig cfg = PolicyTaskConfig()) : config(std::move(cfg)), sup(config) {}

  void start(const std::string& task = "place") {
    feed();
    sup.start(t, task);
  }

  // Advances `dt` seconds, delivers every sensor reading and evaluates.
  const realman_bt::Verdict& step(double dt = 0.1) {
    t += dt;
    feed();
    verdict = sup.evaluate(t);
    return verdict;
  }

  // Steps until `seconds` have passed or the attempt finished.
  void run(double seconds) {
    const double end = t + seconds;
    while (t < end - 1e-9 && !verdict.finished) step();
  }

  void feed() {
    if (arm_alive) sup.onJoints("r", arm, t, t);
    if (lm_alive) {
      sup.onJoints("l", l, t, t);
      sup.onJoints("m", m, t, t);
    }
    if (stats_alive) sup.onBridgeStats(stats, t);
    sup.onPolicyGripperCommand(policy_gripper, t);
    sup.onDriverCommand(lin, ang, t);
    if (gripper_alive) sup.onGripperReading(gripper_position, torque_reached, t);
  }

  PolicyTaskConfig config;
  PolicySupervisor sup;
  double t{100.0};
  realman_bt::Verdict verdict;

  Joints arm{-9.89, 18.05, 79.07, 15.5, 79.6, -6.2};
  Joints l{12.17, 25.22, 73.05, -16.7, 80.3, 14.45};
  Joints m{0.0, 18.0, 70.0, 0.0, 90.0, 9.0};
  BridgeStats stats{true, true, false};
  bool arm_alive{true};
  bool lm_alive{true};
  bool stats_alive{true};
  bool gripper_alive{true};
  double policy_gripper{1.0};  // 1 = open
  double lin{0.05};
  double ang{0.10};
  double gripper_position{50.0};
  bool torque_reached{false};
};

// Closes the gripper (policy command and measured position) for `seconds`, holding `plateau`.
void closeFor(Rig& rig, double seconds, double plateau, bool torque) {
  rig.policy_gripper = 0.0;
  rig.gripper_position = plateau;
  rig.torque_reached = torque;
  rig.run(seconds);
}

// The arm travels to the bin side (J1 far negative) at 30 deg/s with the gripper still closed.
void driveJ1To(Rig& rig, double target) {
  while (rig.arm[0] > target && !rig.verdict.finished) {
    rig.arm[0] = std::max(target, rig.arm[0] - 3.0);
    rig.step();
  }
}

// The policy opens the gripper with the arm over the bin. Returns the time of the open command.
double openOverTheBin(Rig& rig) {
  driveJ1To(rig, -52.0);
  rig.policy_gripper = 1.0;
  const double opened_at = rig.t + 0.1;
  rig.run(0.1);
  return opened_at;
}

void testNothingFinishesBeforeTheAttemptStarts() {
  Rig rig;
  rig.step();
  assert(!rig.verdict.finished);
}

void testAHealthyQuietAttemptKeepsRunning() {
  Rig rig;
  rig.start();
  rig.run(5.0);
  assert(!rig.verdict.finished);
}

// ---- faults ----------------------------------------------------------------------------------

void testAJointOutsideTheEnvelopeIsAFaultAndStaysLatched() {
  Rig rig;
  rig.start();
  rig.arm[4] = 2.0;  // J5 floor is 3.5
  rig.step();
  assert(rig.verdict.finished && rig.verdict.outcome == AttemptOutcome::kFault);
  assert(rig.verdict.fault);
  assert(rig.verdict.reason.find("J5") != std::string::npos);

  rig.arm[4] = 60.0;  // back inside: the verdict does not change
  rig.step();
  assert(rig.verdict.outcome == AttemptOutcome::kFault);
}

void testASampleThatIsOutsideBetweenTicksIsStillCaught() {
  Rig rig;
  rig.start();
  // Two samples arrive between ticks; the first is out of range, the second back inside.
  rig.t += 0.05;
  Joints outside = rig.arm;
  outside[0] = -80.0;
  rig.sup.onJoints("r", outside, rig.t, rig.t);
  rig.t += 0.05;
  rig.sup.onJoints("r", rig.arm, rig.t, rig.t);
  rig.verdict = rig.sup.evaluate(rig.t);
  assert(rig.verdict.finished && rig.verdict.fault);
  assert(rig.verdict.reason.find("J1") != std::string::npos);
}

void testAFastJointIsAFault() {
  Rig rig;
  rig.start();
  rig.step();
  rig.arm[1] += 8.0;  // 8 degrees in 0.1 s = 80 deg/s, limit 50
  rig.step();
  assert(rig.verdict.finished && rig.verdict.fault);
  assert(rig.verdict.reason.find("deg/s") != std::string::npos);
}

void testNormalMotionIsNotMistakenForSpeed() {
  Rig rig;
  rig.start();
  double direction = 1.0;
  for (int i = 0; i < 80; ++i) {
    rig.arm[1] += direction * 3.0;  // 30 deg/s, bouncing between 18 and 60
    if (rig.arm[1] > 60.0 || rig.arm[1] < 18.0) direction = -direction;
    rig.step();
  }
  assert(!rig.verdict.finished);
}

void testSamplesArrivingCloseTogetherDoNotInflateTheSpeed() {
  Rig rig;
  rig.start();
  // 40 deg/s of real motion, but two samples arrive only 10 ms apart (queueing jitter).
  rig.t += 0.1;
  rig.arm[1] += 4.0;
  rig.sup.onJoints("r", rig.arm, rig.t, rig.t);
  rig.t += 0.01;
  rig.arm[1] += 0.4;
  rig.sup.onJoints("r", rig.arm, rig.t, rig.t);
  rig.verdict = rig.sup.evaluate(rig.t);
  assert(!rig.verdict.finished);
}

void testTheOtherArmsDriftingIsAFault() {
  for (const char* arm : {"l", "m"}) {
    Rig rig;
    rig.start();
    rig.run(1.0);
    assert(!rig.verdict.finished);
    (std::string(arm) == "l" ? rig.l : rig.m)[2] += 1.5;  // limit 1.0 deg from the start pose
    rig.step();
    assert(rig.verdict.finished && rig.verdict.fault);
    assert(rig.verdict.reason.find(arm) != std::string::npos);
  }
}

void testSmallMovementOfTheOtherArmsIsTolerated() {
  Rig rig;
  rig.start();
  rig.l[0] += 0.4;
  rig.m[5] -= 0.6;
  rig.run(3.0);
  assert(!rig.verdict.finished);
}

void testLostJointStatesAreAFault() {
  Rig rig;
  rig.start();
  rig.arm_alive = false;
  rig.run(1.5);  // joint_state_stale_sec = 1.0
  assert(rig.verdict.finished && rig.verdict.fault);
  assert(rig.verdict.reason.find("joint_states") != std::string::npos);
}

void testLostJointStatesOfTheOtherArmsAreAFault() {
  Rig rig;
  rig.start();
  rig.lm_alive = false;
  rig.run(1.5);
  assert(rig.verdict.finished && rig.verdict.fault);
}

void testAPausedBridgeIsAPolicyTimeout() {
  // The bridge pauses itself after its inference requests timed out several times in a row.
  Rig rig;
  rig.start();
  rig.run(1.0);
  rig.stats.paused = true;
  rig.step();
  assert(rig.verdict.finished && rig.verdict.outcome == AttemptOutcome::kPolicyTimeout);
  assert(rig.verdict.policy_timeout && !rig.verdict.fault && !rig.verdict.succeeded);
  assert(rig.verdict.reason.find("paused") != std::string::npos);
}

void testAPauseReportedBeforeTheStartIsTheOneTheActivationCleared() {
  Rig rig;
  rig.stats.paused = true;
  rig.start();  // the last stats before the activation still said paused
  // The bridge publishes its stats once a second, so the next ones arrive well after the first
  // evaluations: until then the stale "paused" is all there is.
  rig.stats_alive = false;
  rig.run(0.9);
  assert(!rig.verdict.finished);
  rig.stats_alive = true;
  rig.stats.paused = false;
  rig.run(2.0);
  assert(!rig.verdict.finished);
}

void testABridgeThatIsStillPausedAfterTheStartIsAPolicyTimeout() {
  Rig rig;
  rig.stats.paused = true;
  rig.start();
  rig.step();  // the first stats after the start say paused again
  assert(rig.verdict.finished && rig.verdict.outcome == AttemptOutcome::kPolicyTimeout);
}

void testSilentBridgeStatsAreAPolicyTimeout() {
  Rig rig;
  rig.start();
  rig.stats_alive = false;
  rig.run(6.0);  // stats_stale_sec = 5.0
  assert(rig.verdict.finished && rig.verdict.outcome == AttemptOutcome::kPolicyTimeout);
  assert(rig.verdict.policy_timeout && !rig.verdict.fault);
  assert(rig.verdict.reason.find("stats") != std::string::npos);
}

void testAFaultBeatsAPolicyTimeoutThatHappensAtTheSameTime() {
  Rig rig;
  rig.start();
  rig.arm[4] = 2.0;  // J5 below the envelope
  rig.stats.paused = true;
  rig.step();
  assert(rig.verdict.outcome == AttemptOutcome::kFault);
  assert(!rig.verdict.policy_timeout);
}

void testAFaultBeatsATimeoutThatHappensAtTheSameTime() {
  PolicyTaskConfig config;
  config.max_attempt_sec = 1.0;
  Rig rig(config);
  rig.start();
  rig.arm[4] = 2.0;
  rig.run(2.0);
  assert(rig.verdict.outcome == AttemptOutcome::kFault);
}

// ---- retryable failures ----------------------------------------------------------------------

void testNoReleaseWithinTheTimeIsARetryableTimeout() {
  Rig rig;
  rig.start();
  rig.run(46.0);
  assert(rig.verdict.finished);
  assert(rig.verdict.outcome == AttemptOutcome::kTimeout);
  assert(!rig.verdict.fault);
  assert(rig.verdict.attempt_sec >= 45.0 && rig.verdict.attempt_sec < 46.0);
}

void testClosedAndNotMovingIsAStall() {
  // 2026-10-14 cycle 2: the gripper held an adapter and the policy then sent ~0 for 30 s.
  Rig rig;
  rig.start();
  rig.run(3.0);
  rig.lin = 0.002;
  rig.ang = 0.01;
  closeFor(rig, 9.0, 5700.0, true);
  assert(rig.verdict.finished);
  assert(rig.verdict.outcome == AttemptOutcome::kStall);
  assert(!rig.verdict.fault);
}

void testStallNeedsTheGripperToBeClosed() {
  // Standing still with the gripper open is the approach phase; only the attempt timeout covers it.
  Rig rig;
  rig.start();
  rig.lin = 0.0;
  rig.ang = 0.0;
  rig.run(12.0);
  assert(!rig.verdict.finished);
}

void testMovementResetsTheStallTimer() {
  Rig rig;
  rig.start();
  rig.lin = 0.0;
  rig.ang = 0.0;
  closeFor(rig, 6.0, 5700.0, true);
  rig.lin = 0.05;
  rig.run(1.0);
  rig.lin = 0.0;
  rig.run(6.0);
  assert(!rig.verdict.finished);
}

// ---- release and grasp verdict ----------------------------------------------------------------

void testReleasingOverTheBinAfterAGraspIsASuccess() {
  Rig rig;
  rig.start();
  rig.run(4.0);
  closeFor(rig, 10.0, 5750.0, true);
  openOverTheBin(rig);
  assert(!rig.verdict.finished);  // still settling
  rig.run(2.0);
  assert(rig.verdict.finished);
  assert(rig.verdict.outcome == AttemptOutcome::kReleasedHeld);
  assert(rig.verdict.grasp_verdict == "held");
  assert(!rig.verdict.fault);
}

void testSettlingKeepsSupervisingForTheConfiguredTime() {
  PolicyTaskConfig config;
  config.release.settle_sec = 1.0;
  Rig rig(config);
  rig.start();
  closeFor(rig, 5.0, 5750.0, true);
  const double opened_at = openOverTheBin(rig);
  rig.run(2.0);
  assert(rig.verdict.finished);
  assert(rig.t - opened_at >= 0.9 && rig.t - opened_at <= 1.3);
}

void testReleasingWithNothingBetweenTheJawsIsARetryableFailure() {
  Rig rig;
  rig.start();
  closeFor(rig, 6.0, 8450.0, false);
  openOverTheBin(rig);
  rig.run(2.0);
  assert(rig.verdict.finished);
  assert(rig.verdict.outcome == AttemptOutcome::kReleasedEmpty);
  assert(rig.verdict.grasp_verdict == "empty");
  assert(!rig.verdict.fault);
}

void testAPartialCloseWithoutTorqueDoesNotCountAsHeld() {
  Rig rig;
  rig.start();
  closeFor(rig, 6.0, 5750.0, false);
  openOverTheBin(rig);
  rig.run(2.0);
  assert(rig.verdict.outcome == AttemptOutcome::kReleasedEmpty);
}

void testOpeningOverTheMatIsNotARelease() {
  // 2026-10-14 run 2: the policy re-opened the gripper on the mat and the loop ended the cycle early.
  Rig rig;
  rig.arm[0] = 15.0;  // over the mat
  rig.start();
  closeFor(rig, 5.0, 4000.0, false);
  rig.policy_gripper = 1.0;
  rig.run(3.0);
  assert(!rig.verdict.finished);
}

void testClosedTimeAccumulatesAcrossRetryOpens() {
  Rig rig;
  rig.start();
  closeFor(rig, 2.0, 4000.0, false);  // first try
  rig.policy_gripper = 1.0;
  rig.gripper_position = 50.0;
  rig.run(1.0);                       // retry-open on the mat
  closeFor(rig, 2.0, 5750.0, true);   // second try: 4 s closed in total
  openOverTheBin(rig);
  rig.run(2.0);
  assert(rig.verdict.finished);
  assert(rig.verdict.outcome == AttemptOutcome::kReleasedHeld);
}

void testTooBriefAClosureIsNotARelease() {
  Rig rig;
  rig.start();
  closeFor(rig, 1.0, 5750.0, true);  // min_closed_sec is 3
  openOverTheBin(rig);
  rig.run(3.0);
  assert(!rig.verdict.finished);
}

void testTheVerdictLooksAtTheClosedPlateauNotTheOpeningMotion() {
  Rig rig;
  rig.start();
  closeFor(rig, 8.0, 5750.0, true);
  openOverTheBin(rig);
  // The jaws start to open once released; those readings must not turn "held" into "empty".
  rig.gripper_position = 8400.0;
  rig.torque_reached = false;
  rig.run(2.0);
  assert(rig.verdict.finished);
  assert(rig.verdict.grasp_verdict == "held");
}

void testAMissingGripperReadingGivesAnUnknownVerdictThatIsRetried() {
  Rig rig;
  rig.start();
  rig.gripper_alive = false;  // the wrapper refuses to start without readings; the logic still must not succeed
  closeFor(rig, 6.0, 0.0, false);
  openOverTheBin(rig);
  rig.run(2.0);
  assert(rig.verdict.finished);
  assert(rig.verdict.outcome == AttemptOutcome::kReleasedEmpty);
  assert(rig.verdict.grasp_verdict == "unknown");
}

// ---- bookkeeping ------------------------------------------------------------------------------

void testTheVerdictIsFinalOnceReached() {
  Rig rig;
  rig.start();
  rig.arm[4] = 2.0;
  rig.step();
  const std::string reason = rig.verdict.reason;
  rig.arm[4] = 60.0;
  rig.run(5.0);
  assert(rig.verdict.outcome == AttemptOutcome::kFault);
  assert(rig.verdict.reason == reason);
}

void testAStartedAttemptUsesTheArmsPositionAtStartAsTheDriftReference() {
  Rig rig;
  rig.l[0] += 5.0;  // the left arm is already off its nominal pose when the attempt starts
  rig.start();
  rig.run(2.0);
  assert(!rig.verdict.finished);
}

void testRestartingClearsTheLatchedState() {
  Rig rig;
  rig.start();
  rig.arm[4] = 2.0;
  rig.step();
  assert(rig.verdict.finished);

  rig.arm[4] = 79.0;
  rig.sup.reset();
  rig.verdict = realman_bt::Verdict();
  rig.start();
  rig.run(2.0);
  assert(!rig.verdict.finished);
}

// ---- snapshot (what the trace records) ----------------------------------------------------------

void testSnapshotBeforeStartIsNotStarted() {
  Rig rig;
  rig.feed();
  const auto snapshot = rig.sup.snapshot(rig.t);
  assert(!snapshot.started && !snapshot.finished);
  assert(snapshot.elapsed_sec == 0.0);
}

// Currents are only recorded: the supervised arm's latest reading reaches the snapshot, another
// arm's or a non-finite one does not, and none of them ends the attempt.
void testJointCurrentsOfTheSupervisedArmReachTheSnapshot() {
  Rig rig;
  rig.start();
  assert(!rig.sup.snapshot(rig.t).currents_valid);
  rig.sup.onJointCurrents("l", {1, 2, 3, 4, 5, 6});
  assert(!rig.sup.snapshot(rig.t).currents_valid);
  rig.sup.onJointCurrents("r", {800, -2400, 1500, 90, -300, 12});
  auto snapshot = rig.sup.snapshot(rig.t);
  assert(snapshot.currents_valid && snapshot.currents_ma[1] == -2400 && snapshot.currents_ma[5] == 12);
  rig.sup.onJointCurrents("r", {9e9, 9e9, 9e9, 9e9, 9e9, std::nan("")});
  snapshot = rig.sup.snapshot(rig.t);
  assert(snapshot.currents_ma[1] == -2400);  // the non-finite reading was ignored
  rig.sup.onJointCurrents("r", {9e9, 9e9, 9e9, 9e9, 9e9, 9e9});
  rig.run(1.0);
  assert(!rig.verdict.finished);  // recording only: no current ends an attempt yet
}

void testSnapshotReportsTheLatestReadings() {
  Rig rig;
  rig.arm[1] = 30.0;  // already there when the attempt starts, so no jump for the speed check
  rig.start();
  rig.run(1.0);
  const auto snapshot = rig.sup.snapshot(rig.t);
  assert(snapshot.started && !snapshot.finished);
  assert(std::fabs(snapshot.elapsed_sec - 1.0) < 0.15);
  assert(snapshot.arm_valid && snapshot.arm[1] == 30.0);
  assert(snapshot.policy_gripper == 1.0);
  assert(snapshot.gripper_position == 50.0 && !snapshot.torque_reached);
  assert(snapshot.cmd_linear == 0.05 && snapshot.cmd_angular == 0.10);
  assert(snapshot.stats_allow_publish && !snapshot.stats_paused);
  assert(snapshot.closed_total_sec == 0.0);
}

void testSnapshotShowsHowFarTheOtherArmsMoved() {
  Rig rig;
  rig.start();
  rig.l[2] += 0.7;
  rig.step();
  const auto snapshot = rig.sup.snapshot(rig.t);
  assert(std::fabs(snapshot.drift_deg.at("l") - 0.7) < 1e-9);
  assert(snapshot.drift_deg.at("m") == 0.0);
  assert(snapshot.drift_deg.count("r") == 0);  // the supervised arm is not an "other" arm
}

void testSnapshotCountsClosedTime() {
  Rig rig;
  rig.start();
  closeFor(rig, 2.0, 5750.0, true);
  const auto snapshot = rig.sup.snapshot(rig.t);
  assert(std::fabs(snapshot.closed_total_sec - 2.0) < 0.15);
  assert(snapshot.policy_gripper == 0.0 && snapshot.torque_reached);
}

void testSnapshotKeepsTheLatestGripperReadingAcrossAReset() {
  // The grasp-verdict window is per attempt, but the trace still wants to show the gripper from its
  // very first row.
  Rig rig;
  rig.start();
  rig.gripper_position = 1234.0;
  rig.torque_reached = true;
  rig.step();

  rig.sup.reset();

  const auto snapshot = rig.sup.snapshot(rig.t);
  assert(snapshot.gripper_position == 1234.0 && snapshot.torque_reached);
}

void testSnapshotMarksAFinishedAttempt() {
  Rig rig;
  rig.start();
  rig.arm[4] = 2.0;
  rig.step();
  assert(rig.sup.snapshot(rig.t).finished);
}

void testSnapshotLeavesMissingReadingsAsNaN() {
  PolicySupervisor supervisor{PolicyTaskConfig()};
  const auto snapshot = supervisor.snapshot(0.0);
  assert(!snapshot.arm_valid);
  assert(std::isnan(snapshot.policy_gripper) && std::isnan(snapshot.gripper_position));
  assert(std::isnan(snapshot.cmd_linear));
}

void testOutcomeNamesAreStable() {
  // These strings go to the blackboard and the runtime snapshot.
  assert(std::string(realman_bt::outcomeName(AttemptOutcome::kReleasedHeld)) == "released_held");
  assert(std::string(realman_bt::outcomeName(AttemptOutcome::kReleasedEmpty)) == "released_empty");
  assert(std::string(realman_bt::outcomeName(AttemptOutcome::kLiftedHeld)) == "lifted_held");
  assert(std::string(realman_bt::outcomeName(AttemptOutcome::kDropped)) == "dropped");
  assert(std::string(realman_bt::outcomeName(AttemptOutcome::kWrongTask)) == "wrong_task");
  assert(std::string(realman_bt::outcomeName(AttemptOutcome::kWrongSideEmpty)) == "wrong_side_empty");
  assert(std::string(realman_bt::outcomeName(AttemptOutcome::kTimeout)) == "timeout");
  assert(std::string(realman_bt::outcomeName(AttemptOutcome::kStall)) == "stall");
  assert(std::string(realman_bt::outcomeName(AttemptOutcome::kPolicyTimeout)) == "policy_timeout");
  assert(std::string(realman_bt::outcomeName(AttemptOutcome::kFault)) == "fault");
}

void testOnlyTheTwoHeldOutcomesAreSuccessesAndOnlyFaultAndWrongTaskEndTheTask() {
  using realman_bt::isFault;
  using realman_bt::isSuccess;
  for (auto outcome : {AttemptOutcome::kReleasedHeld, AttemptOutcome::kLiftedHeld}) {
    assert(isSuccess(outcome) && !isFault(outcome));
  }
  using realman_bt::isPolicyTimeout;
  for (auto outcome : {AttemptOutcome::kReleasedEmpty, AttemptOutcome::kDropped, AttemptOutcome::kTimeout,
                       AttemptOutcome::kStall, AttemptOutcome::kWrongSideEmpty}) {
    assert(!isSuccess(outcome) && !isFault(outcome) && !isPolicyTimeout(outcome));
  }
  for (auto outcome : {AttemptOutcome::kFault, AttemptOutcome::kWrongTask}) {
    assert(!isSuccess(outcome) && isFault(outcome) && !isPolicyTimeout(outcome));
  }
  // A policy-server timeout is retried, but on its own budget.
  assert(!isSuccess(AttemptOutcome::kPolicyTimeout) && !isFault(AttemptOutcome::kPolicyTimeout) &&
         isPolicyTimeout(AttemptOutcome::kPolicyTimeout));
}

// ---- tasks: lift_and_hold (pick) --------------------------------------------------------------

// Moves one joint of the supervised arm to `target` at 20 deg/s (well under the 50 deg/s limit).
void moveJoint(Rig& rig, int joint, double target) {
  while (std::fabs(rig.arm[joint] - target) > 1e-9 && !rig.verdict.finished) {
    const double step = std::clamp(target - rig.arm[joint], -2.0, 2.0);
    rig.arm[joint] += step;
    rig.step();
  }
}

// The pick demonstration: reach down (J2 18 -> 65), close on the adapter, then lift J2 by `lift_deg`.
void reachAndGrasp(Rig& rig, double plateau, bool torque, double closed_sec = 3.5) {
  moveJoint(rig, 1, 65.0);
  closeFor(rig, closed_sec, plateau, torque);
}

void testPickLiftedAndStillHeldIsASuccess() {
  Rig rig;
  rig.start("pick");
  reachAndGrasp(rig, 5700.0, true);
  assert(!rig.verdict.finished);
  moveJoint(rig, 1, 52.0);  // lifted 13 deg
  rig.run(3.0);
  assert(rig.verdict.finished);
  assert(rig.verdict.outcome == AttemptOutcome::kLiftedHeld);
  assert(rig.verdict.succeeded && !rig.verdict.fault);
  assert(rig.verdict.grasp_verdict == "held");
  assert(rig.verdict.reason.empty());
}

void testPickWaitsForTheHoldTimeAfterTheLift() {
  Rig rig;
  rig.start("pick");
  reachAndGrasp(rig, 5700.0, true);
  moveJoint(rig, 1, 54.0);  // exactly past -10 deg
  const double lifted_at = rig.t;
  rig.run(1.5);
  assert(!rig.verdict.finished);  // hold_sec is 2 s
  rig.run(1.0);
  assert(rig.verdict.outcome == AttemptOutcome::kLiftedHeld);
  assert(rig.t - lifted_at >= 1.9 && rig.t - lifted_at <= 2.3);
}

void testPickTooSmallALiftIsNotYetASuccess() {
  Rig rig;
  rig.start("pick");
  reachAndGrasp(rig, 5700.0, true);
  moveJoint(rig, 1, 58.0);  // only 7 deg
  rig.run(4.0);
  assert(!rig.verdict.finished);
}

void testPickTheLiftCountsFromWhereTheGripperClosed() {
  PolicyTaskConfig config;
  Rig rig(config);
  rig.start("pick");
  moveJoint(rig, 1, 65.0);
  rig.policy_gripper = 0.0;  // closes at J2 = 65; the reference is taken now
  rig.step();
  moveJoint(rig, 1, 70.0);  // keeps pushing down while closing
  closeFor(rig, 3.5, 5700.0, true);
  moveJoint(rig, 1, 56.0);  // 14 below the push-down, but only 9 below the close
  rig.run(3.0);
  assert(!rig.verdict.finished);
  moveJoint(rig, 1, 54.0);
  rig.run(2.5);
  assert(rig.verdict.outcome == AttemptOutcome::kLiftedHeld);
}

void testPickClosingOnNothingAndLiftingIsNoSuccess() {
  Rig rig;
  rig.start("pick");
  reachAndGrasp(rig, 8450.0, false);
  moveJoint(rig, 1, 40.0);
  rig.run(50.0);
  assert(rig.verdict.finished);
  assert(rig.verdict.outcome == AttemptOutcome::kTimeout);
  assert(rig.verdict.reason.find("lift-and-hold") != std::string::npos);
}

void testPickAPartialCloseWithoutTorqueIsNotHeld() {
  Rig rig;
  rig.start("pick");
  reachAndGrasp(rig, 5700.0, false);
  moveJoint(rig, 1, 45.0);
  rig.run(5.0);
  assert(!rig.verdict.finished || rig.verdict.outcome != AttemptOutcome::kLiftedHeld);
}

void testPickNeedsTheMinimumClosedTime() {
  Rig rig;
  rig.start("pick");
  reachAndGrasp(rig, 5700.0, true, 0.5);
  moveJoint(rig, 1, 52.0);  // ~0.7 s more closed: 1.2 s in total, below 3 s
  rig.run(1.0);
  assert(!rig.verdict.finished);  // 2.2 s closed
  rig.run(1.5);
  assert(!rig.verdict.finished);  // 3 s reached at ~3.0, the 2 s hold only starts then
  rig.run(2.0);
  assert(rig.verdict.outcome == AttemptOutcome::kLiftedHeld);
}

void testPickTheObjectSlippingOutIsARetryableDrop() {
  Rig rig;
  rig.start("pick");
  reachAndGrasp(rig, 5450.0, true);
  moveJoint(rig, 1, 58.0);
  rig.gripper_position = 8745.0;  // 2026-10-19 pick attempt 1: lost it during the lift
  rig.torque_reached = true;      // the jaws pressing on each other also reach torque
  rig.step();
  assert(rig.verdict.finished);
  assert(rig.verdict.outcome == AttemptOutcome::kDropped);
  assert(!rig.verdict.succeeded && !rig.verdict.fault);
  assert(rig.verdict.grasp_verdict == "empty");
  assert(rig.verdict.reason.find("8745") != std::string::npos);
}

void testPickOpeningOnPurposeAfterAHoldIsNotADrop() {
  Rig rig;
  rig.start("pick");
  reachAndGrasp(rig, 5700.0, true);
  rig.policy_gripper = 1.0;  // the policy opens again (a re-grasp)
  rig.gripper_position = 50.0;
  rig.torque_reached = false;
  rig.run(1.0);
  assert(!rig.verdict.finished);
}

void testPickTurningToTheBinIsAWrongTaskFault() {
  Rig rig;
  rig.start("pick");
  reachAndGrasp(rig, 5700.0, true);
  driveJ1To(rig, -30.0);
  assert(rig.verdict.finished);
  assert(rig.verdict.outcome == AttemptOutcome::kWrongTask);
  assert(rig.verdict.fault && !rig.verdict.succeeded);
  assert(rig.verdict.reason.find("bin side") != std::string::npos);
  assert(rig.arm[0] < -25.0 && rig.arm[0] > -28.0);  // caught at the first sample past the limit
}

// 2026-10-20 live run: the jaws met at ~8430 without torque, then the policy lifted and turned J1
// to the bin side. Nothing is carried away, so this is a retryable miss, not a wrong task.
void testPickTurningToTheBinWithEmptyJawsIsARetryableMiss() {
  Rig rig;
  rig.start("pick");
  reachAndGrasp(rig, 8431.0, false);
  driveJ1To(rig, -30.0);
  assert(rig.verdict.finished);
  assert(rig.verdict.outcome == AttemptOutcome::kWrongSideEmpty);
  assert(!rig.verdict.fault && !rig.verdict.succeeded);
  assert(rig.verdict.grasp_verdict == "empty");
  assert(rig.verdict.reason.find("empty jaws") != std::string::npos);
  assert(rig.arm[0] < -25.0 && rig.arm[0] > -28.0);
}

// Partly closed (something between the jaws) is still the wrong task, torque or not.
void testPickTurningToTheBinPartlyClosedIsStillAWrongTask() {
  Rig rig;
  rig.start("pick");
  reachAndGrasp(rig, 6000.0, false);
  driveJ1To(rig, -30.0);
  assert(rig.verdict.outcome == AttemptOutcome::kWrongTask);
  assert(rig.verdict.fault);
}

void testPickJ1OnTheBinSideBeforeAnyGraspIsNotAWrongTask() {
  Rig rig;
  rig.start("pick");
  driveJ1To(rig, -30.0);  // reaching, gripper still open
  rig.run(1.0);
  assert(!rig.verdict.finished);
}

void testPlaceIgnoresTheLiftAndStillNeedsTheRelease() {
  Rig rig;
  rig.start("place");
  reachAndGrasp(rig, 5700.0, true);
  moveJoint(rig, 1, 40.0);
  rig.run(4.0);
  assert(!rig.verdict.finished);
  driveJ1To(rig, -50.0);  // the bin side is where place should go: no wrong_task for place
  assert(!rig.verdict.finished);
}

void testTheDefaultTaskIsPlace() {
  Rig rig;
  rig.feed();
  rig.sup.start(rig.t);
  reachAndGrasp(rig, 5700.0, true);
  moveJoint(rig, 1, 40.0);
  rig.run(4.0);
  assert(!rig.verdict.finished);
}

void testAnUnknownTaskIsRejectedAndChangesNothing() {
  Rig rig;
  rig.start("pick");
  try {
    rig.sup.start(rig.t, "stack");
    assert(false);
  } catch (const std::invalid_argument& error) {
    assert(std::string(error.what()).find("stack") != std::string::npos);
    assert(std::string(error.what()).find("pick") != std::string::npos);
  }
  assert(rig.sup.snapshot(rig.t).started);  // the running attempt was not reset
}

void testPickFaultsStillWin() {
  Rig rig;
  rig.start("pick");
  reachAndGrasp(rig, 5700.0, true);
  rig.arm[4] = 2.0;  // below the J5 floor
  rig.step();
  assert(rig.verdict.outcome == AttemptOutcome::kFault);
}

void testRestartingWithAnotherTaskForgetsTheLiftState() {
  Rig rig;
  rig.start("pick");
  reachAndGrasp(rig, 5700.0, true);
  rig.policy_gripper = 1.0;  // GripperReady opened it before the next attempt
  rig.gripper_position = 50.0;
  rig.torque_reached = false;
  rig.start("pick");  // a new attempt
  moveJoint(rig, 1, 50.0);  // no close in this attempt yet: no reference, no success
  rig.run(3.0);
  assert(!rig.verdict.finished);
}

}  // namespace

int main() {
  testNothingFinishesBeforeTheAttemptStarts();
  testAHealthyQuietAttemptKeepsRunning();
  testAJointOutsideTheEnvelopeIsAFaultAndStaysLatched();
  testASampleThatIsOutsideBetweenTicksIsStillCaught();
  testAFastJointIsAFault();
  testNormalMotionIsNotMistakenForSpeed();
  testSamplesArrivingCloseTogetherDoNotInflateTheSpeed();
  testTheOtherArmsDriftingIsAFault();
  testSmallMovementOfTheOtherArmsIsTolerated();
  testLostJointStatesAreAFault();
  testLostJointStatesOfTheOtherArmsAreAFault();
  testAPausedBridgeIsAPolicyTimeout();
  testAPauseReportedBeforeTheStartIsTheOneTheActivationCleared();
  testABridgeThatIsStillPausedAfterTheStartIsAPolicyTimeout();
  testSilentBridgeStatsAreAPolicyTimeout();
  testAFaultBeatsAPolicyTimeoutThatHappensAtTheSameTime();
  testAFaultBeatsATimeoutThatHappensAtTheSameTime();
  testNoReleaseWithinTheTimeIsARetryableTimeout();
  testClosedAndNotMovingIsAStall();
  testStallNeedsTheGripperToBeClosed();
  testMovementResetsTheStallTimer();
  testReleasingOverTheBinAfterAGraspIsASuccess();
  testSettlingKeepsSupervisingForTheConfiguredTime();
  testReleasingWithNothingBetweenTheJawsIsARetryableFailure();
  testAPartialCloseWithoutTorqueDoesNotCountAsHeld();
  testOpeningOverTheMatIsNotARelease();
  testClosedTimeAccumulatesAcrossRetryOpens();
  testTooBriefAClosureIsNotARelease();
  testTheVerdictLooksAtTheClosedPlateauNotTheOpeningMotion();
  testAMissingGripperReadingGivesAnUnknownVerdictThatIsRetried();
  testTheVerdictIsFinalOnceReached();
  testAStartedAttemptUsesTheArmsPositionAtStartAsTheDriftReference();
  testRestartingClearsTheLatchedState();
  testSnapshotBeforeStartIsNotStarted();
  testSnapshotReportsTheLatestReadings();
  testJointCurrentsOfTheSupervisedArmReachTheSnapshot();
  testSnapshotShowsHowFarTheOtherArmsMoved();
  testSnapshotCountsClosedTime();
  testSnapshotKeepsTheLatestGripperReadingAcrossAReset();
  testSnapshotMarksAFinishedAttempt();
  testSnapshotLeavesMissingReadingsAsNaN();
  testOutcomeNamesAreStable();
  testOnlyTheTwoHeldOutcomesAreSuccessesAndOnlyFaultAndWrongTaskEndTheTask();
  testPickLiftedAndStillHeldIsASuccess();
  testPickWaitsForTheHoldTimeAfterTheLift();
  testPickTooSmallALiftIsNotYetASuccess();
  testPickTheLiftCountsFromWhereTheGripperClosed();
  testPickClosingOnNothingAndLiftingIsNoSuccess();
  testPickAPartialCloseWithoutTorqueIsNotHeld();
  testPickNeedsTheMinimumClosedTime();
  testPickTheObjectSlippingOutIsARetryableDrop();
  testPickOpeningOnPurposeAfterAHoldIsNotADrop();
  testPickTurningToTheBinIsAWrongTaskFault();
  testPickTurningToTheBinWithEmptyJawsIsARetryableMiss();
  testPickTurningToTheBinPartlyClosedIsStillAWrongTask();
  testPickJ1OnTheBinSideBeforeAnyGraspIsNotAWrongTask();
  testPlaceIgnoresTheLiftAndStillNeedsTheRelease();
  testTheDefaultTaskIsPlace();
  testAnUnknownTaskIsRejectedAndChangesNothing();
  testPickFaultsStillWin();
  testRestartingWithAnotherTaskForgetsTheLiftState();
  return 0;
}
