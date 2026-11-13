"""PikaMotionCache: the ROS-neutral state behind the :8770 Pika window."""
import pytest

from realman_recording.pika_motion import COMMAND_STALE_NS, POSE_STALE_NS, PikaMotionCache

SECOND = 1_000_000_000


def _cache():
    return PikaMotionCache(["l", "r"], ["/pika_pose_l", "/pika_pose_r"], ["/pika/l/cartesian_velocity", "/pika/r/cartesian_velocity"])


def _pose(cache, side, x, at_ns):
    cache.update_pose(side, frame_id="pika_world", position=(x, 0.0, 1.0), orientation_xyzw=(0, 0, 0, 1), received_ns=at_ns)


def test_never_received_side_reports_no_data():
    side = _cache().snapshot(5 * SECOND)["sides"]["r"]
    assert side["state"] == "no_data"
    assert side["position_m"] is None
    assert side["pose_age_ms"] is None
    assert side["pose_topic"] == "/pika_pose_r"
    assert side["command_active"] is False


def test_live_pose_reports_position_and_speed():
    cache = _cache()
    for step in range(11):
        _pose(cache, "l", 0.01 * step, step * 20_000_000)  # 0.5 m/s over 200 ms
    side = cache.snapshot(200_000_000 + 1)["sides"]["l"]
    assert side["state"] == "live"
    assert side["frame_id"] == "pika_world"
    assert side["position_m"] == pytest.approx([0.1, 0.0, 1.0])
    assert side["speed_mps"] == pytest.approx(0.5)


def test_old_pose_is_stale_and_keeps_last_position_without_speed():
    cache = _cache()
    _pose(cache, "r", 0.0, 0)
    _pose(cache, "r", 0.1, SECOND // 5)
    side = cache.snapshot(SECOND // 5 + POSE_STALE_NS + 1)["sides"]["r"]
    assert side["state"] == "stale"
    assert side["position_m"] == pytest.approx([0.1, 0.0, 1.0])
    assert side["speed_mps"] is None
    assert side["pose_age_ms"] >= 1000


def test_command_is_active_only_while_fresh():
    cache = _cache()
    cache.update_command("l", frame_id="l/work/pikabase", linear=(0.1, 0, 0), angular=(0, 0, 0.2), received_ns=SECOND)
    fresh = cache.snapshot(SECOND + 10_000_000)["sides"]["l"]
    assert fresh["command_active"] is True
    assert fresh["command_linear_mps"] == [0.1, 0.0, 0.0]
    assert fresh["command_frame_id"] == "l/work/pikabase"
    stopped = cache.snapshot(SECOND + COMMAND_STALE_NS + 1)["sides"]["l"]
    assert stopped["command_active"] is False
    assert stopped["command_linear_mps"] is None


def test_non_finite_samples_and_unknown_sides_are_ignored():
    cache = _cache()
    cache.update_pose("l", frame_id="w", position=(float("nan"), 0, 0), orientation_xyzw=(0, 0, 0, 1), received_ns=1)
    _pose(cache, "x", 0.0, 1)
    assert cache.snapshot(2)["sides"]["l"]["state"] == "no_data"
    assert set(cache.snapshot(2)["sides"]) == {"l", "r"}


def test_empty_string_defaults_mean_no_sides_and_mismatch_is_rejected():
    assert PikaMotionCache([""], [""], [""]).snapshot(0) == {"sides": {}}
    with pytest.raises(ValueError):
        PikaMotionCache(["l", "r"], ["/pika_pose_l"])
    with pytest.raises(ValueError):
        PikaMotionCache(["l"], ["/pika_pose_l"], ["/a", "/b"])


def test_speed_survives_a_fast_publisher():
    cache = _cache()
    for step in range(2001):  # 2 kHz for 1 s at 0.3 m/s
        _pose(cache, "l", 0.00015 * step, step * 500_000)
    side = cache.snapshot(1_000_000_001)["sides"]["l"]
    assert side["speed_mps"] == pytest.approx(0.3, rel=0.05)
    assert side["position_m"] == pytest.approx([0.3, 0.0, 1.0])
