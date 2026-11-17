"""Parked ("synthetic") arms: a configured arm that is not recorded, e.g. powered off.

The canonical three-arm schema stays unchanged so episodes stay combinable with real
three-arm data. A synthetic arm only stops blocking PREPARE and export:

* PREPARE drops it from the required arms and its ``/<arm>/joint_states`` from the
  required topics (its other configured topics, such as a gripper, stay required).
* Export fills it only where it has no samples at all: ``/<arm>/joint_states`` with the
  configured parked pose and ``/<arm>/cartesian_velocity/state`` with zero velocity, on
  the timeline of a real arm. The recorder stores the parked pose in each session's
  metadata, and the exporter lists every synthesized stream in its receipt.

Real data always wins: an arm that does publish keeps its recorded samples.
"""
from __future__ import annotations

import math
from typing import Iterable, Mapping, Sequence

from .lerobot_align import TimedSample

JOINT_COUNT = 6
ZERO_VELOCITY = (0.0,) * 6


def parse_synthetic_arms(arms: Sequence[str], synthetic: Iterable[str],
                         joint_degrees: Iterable[float]) -> dict[str, tuple[float, ...]]:
    """Validate the parameters and return ``{arm: parked joint positions in radians}``.

    ``synthetic`` may be ROS 2's ``[""]`` list-type sentinel, which means none.
    ``joint_degrees`` holds six values per synthetic arm, in ``synthetic`` order.
    """
    names = [str(item) for item in synthetic if str(item)]
    if not names:
        return {}
    arms = tuple(str(item) for item in arms)
    for name in names:
        if name not in arms:
            raise ValueError(f"synthetic arm {name!r} is not one of the recorded arms {list(arms)}")
    if len(set(names)) != len(names):
        raise ValueError("a synthetic arm is listed twice")
    if len(names) >= len(arms):
        raise ValueError("at least one real arm must remain; every arm is synthetic")
    values = [float(item) for item in joint_degrees]
    if len(values) != JOINT_COUNT * len(names):
        raise ValueError(
            f"synthetic_arm_joint_degrees needs six joint values per synthetic arm "
            f"({JOINT_COUNT * len(names)}), got {len(values)}"
        )
    if not all(math.isfinite(value) for value in values):
        raise ValueError("synthetic_arm_joint_degrees must be finite")
    return {
        name: tuple(math.radians(value) for value in values[index * JOINT_COUNT:(index + 1) * JOINT_COUNT])
        for index, name in enumerate(names)
    }


def preflight_arms(arms: Sequence[str], synthetic: Mapping[str, Sequence[float]]) -> tuple[str, ...]:
    """Arms whose driver must report connected before a session may start."""
    return tuple(arm for arm in arms if arm not in synthetic)


def preflight_topics(topics: Sequence[str], synthetic: Mapping[str, Sequence[float]]) -> tuple[str, ...]:
    """Required PREPARE topics without the synthetic arms' joint-state streams."""
    skipped = {f"/{arm}/joint_states" for arm in synthetic}
    return tuple(topic for topic in topics if topic not in skipped)


def fill_synthetic_streams(streams: Mapping[str, list[TimedSample]], schema, synthetic: Mapping[str, Sequence[float]]
                           ) -> tuple[dict[str, list[TimedSample]], list[str]]:
    """Return ``(streams with parked arms filled, synthesized topic names)``.

    The input mapping is not modified. Only topics without any sample are filled, at the
    timestamps of the first real arm's joint stream.
    """
    result = dict(streams)
    if not synthetic:
        return result, []
    joint_topics = tuple(schema.arm_joint_topics)
    velocity_topics = tuple(schema.arm_velocity_topics)
    synthetic_joint_topics = {f"/{arm}/joint_states" for arm in synthetic}
    reference = next(
        (streams[topic] for topic in joint_topics if topic not in synthetic_joint_topics and streams.get(topic)),
        None,
    )
    if reference is None:
        raise ValueError("cannot park a synthetic arm: the session has no real arm joint stream")
    synthesized: list[str] = []
    for arm, parked in synthetic.items():
        joint_topic = f"/{arm}/joint_states"
        if joint_topic not in joint_topics:
            continue
        index = joint_topics.index(joint_topic)
        fills = [(joint_topic, tuple(float(value) for value in parked))]
        if len(velocity_topics) == len(joint_topics):
            fills.append((velocity_topics[index], ZERO_VELOCITY))
        for topic, value in fills:
            if result.get(topic):
                continue  # real data wins
            result[topic] = [TimedSample(timestamp_ns=sample.timestamp_ns, value=value) for sample in reference]
            synthesized.append(topic)
    return result, synthesized
