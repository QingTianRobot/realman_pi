#include <cstdint>
#include <string>
#include <vector>

#include "gtest/gtest.h"
#include "xbox_controller_driver/button_state_tracker.hpp"

using xbox_controller_driver::ButtonStateTracker;

TEST(ButtonStateTracker, ReportsOnlyPressAndReleaseEdges)
{
  ButtonStateTracker tracker({"a", "b"});

  EXPECT_TRUE(tracker.update({0, 0}).empty());
  const auto pressed = tracker.update({1, 0});
  ASSERT_EQ(pressed.size(), 1U);
  EXPECT_EQ(pressed[0].index, 0U);
  EXPECT_EQ(pressed[0].name, "a");
  EXPECT_TRUE(pressed[0].pressed);

  EXPECT_TRUE(tracker.update({1, 0}).empty());
  const auto released = tracker.update({0, 0});
  ASSERT_EQ(released.size(), 1U);
  EXPECT_FALSE(released[0].pressed);
}

TEST(ButtonStateTracker, NamesUnknownButtonsByIndex)
{
  ButtonStateTracker tracker({"a"});
  const auto events = tracker.update({0, 0, 1});

  ASSERT_EQ(events.size(), 1U);
  EXPECT_EQ(events[0].name, "button_2");
}

TEST(ButtonStateTracker, ReleasesButtonsMissingFromShorterMessages)
{
  ButtonStateTracker tracker({"a", "b"});
  tracker.update({0, 1});
  const auto events = tracker.update({0});

  ASSERT_EQ(events.size(), 1U);
  EXPECT_EQ(events[0].name, "b");
  EXPECT_FALSE(events[0].pressed);
}
