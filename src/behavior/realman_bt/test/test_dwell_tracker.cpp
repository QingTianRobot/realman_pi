// A Release build defines NDEBUG, which would turn every assert below into a no-op.
#ifdef NDEBUG
#undef NDEBUG
#endif

#include <cassert>

#include "realman_bt/dwell_tracker.hpp"

namespace {

using realman_bt::DwellTracker;
using Joints = DwellTracker::Joints;

const Joints kPose{-9.89, 18.05, 79.07, 15.5, 79.6, -6.2};

// Feeds the same pose every 0.1 s from `from` to `to`.
void holdStill(DwellTracker& tracker, double from, double to, Joints pose = kPose) {
  for (double t = from; t <= to + 1e-9; t += 0.1) tracker.onSample(pose, t);
}

void testNothingBeforeTheFirstReading() {
  DwellTracker tracker(2.0, 0.5, 1.0);
  assert(!tracker.dwelled(100.0));
  assert(tracker.stale(100.0));
  assert(tracker.stillSec(100.0) == 0.0);
}

void testAStillArmDwellsAfterDwellSec() {
  DwellTracker tracker(2.0, 0.5, 1.0);
  holdStill(tracker, 0.0, 1.9);
  assert(!tracker.dwelled(1.9));
  holdStill(tracker, 2.0, 2.0);
  assert(tracker.dwelled(2.0));
  assert(tracker.stillSec(2.0) >= 2.0 - 1e-9);
}

void testJitterInsideTheToleranceIsStillness() {
  DwellTracker tracker(2.0, 0.5, 1.0);
  for (int i = 0; i <= 25; ++i) {
    Joints pose = kPose;
    pose[i % 6] += (i % 2 ? 0.49 : -0.49);
    tracker.onSample(pose, i * 0.1);
  }
  assert(tracker.dwelled(2.5));
}

void testMovingBeyondTheToleranceRestartsTheClock() {
  DwellTracker tracker(2.0, 0.5, 1.0);
  holdStill(tracker, 0.0, 1.5);
  Joints moved = kPose;
  moved[2] += 0.6;  // one joint, just over the tolerance
  tracker.onSample(moved, 1.6);
  holdStill(tracker, 1.7, 3.5, moved);
  assert(!tracker.dwelled(3.5));  // only 1.9 s since the move
  holdStill(tracker, 3.6, 3.6, moved);
  assert(tracker.dwelled(3.6));
}

void testSlowDriftIsMotionOnceItLeavesTheBox() {
  // 0.3 deg/s: each step is tiny, but the anchor stays put, so the drift adds up and resets it.
  DwellTracker tracker(3.0, 0.5, 1.0);
  Joints pose = kPose;
  for (int i = 0; i <= 60; ++i) {
    pose[0] = kPose[0] + 0.03 * i;
    tracker.onSample(pose, i * 0.1);
    assert(!tracker.dwelled(i * 0.1));
  }
}

void testAGapInTheReadingsRestartsTheWindow() {
  DwellTracker tracker(2.0, 0.5, 1.0);
  holdStill(tracker, 0.0, 1.5);
  // 1.5 s without readings, then the same pose again.
  assert(tracker.stale(2.6));
  assert(!tracker.dwelled(2.6));
  holdStill(tracker, 3.0, 4.9);
  assert(!tracker.dwelled(4.9));  // the window restarted at 3.0
  holdStill(tracker, 5.0, 5.0);
  assert(tracker.dwelled(5.0));
}

void testStaleReadingsNeverDwell() {
  DwellTracker tracker(2.0, 0.5, 1.0);
  holdStill(tracker, 0.0, 3.0);
  assert(tracker.dwelled(3.0));
  assert(!tracker.dwelled(4.5));  // the last reading is 1.5 s old
  assert(tracker.stillSec(4.5) == 0.0);
}

void testResetForgetsThePose() {
  DwellTracker tracker(2.0, 0.5, 1.0);
  holdStill(tracker, 0.0, 3.0);
  tracker.reset();
  assert(!tracker.dwelled(3.0));
  assert(!tracker.anchor().has_value());
  holdStill(tracker, 3.1, 5.0);
  assert(!tracker.dwelled(5.0));  // 1.9 s since the first reading after the reset
  holdStill(tracker, 5.1, 5.2);
  assert(tracker.dwelled(5.2));
}

}  // namespace

int main() {
  testNothingBeforeTheFirstReading();
  testAStillArmDwellsAfterDwellSec();
  testJitterInsideTheToleranceIsStillness();
  testMovingBeyondTheToleranceRestartsTheClock();
  testSlowDriftIsMotionOnceItLeavesTheBox();
  testAGapInTheReadingsRestartsTheWindow();
  testStaleReadingsNeverDwell();
  testResetForgetsThePose();
  return 0;
}
