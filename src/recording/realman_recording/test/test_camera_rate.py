"""CameraRateTracker: server-side fps/freshness behind the :8770 camera tiles."""
import pytest

from realman_recording.camera_rate import CameraRateTracker, expected_fps_by_camera

SECOND = 1_000_000_000
MS = 1_000_000


def _tracker(**overrides):
    options = dict(expected_fps={"left": 30.0, "d435": 30.0}, window_sec=2.0, stale_after_sec=1.0, low_fps_ratio=0.7)
    options.update(overrides)
    return CameraRateTracker(["left", "d435"], **options)


def _feed(tracker, camera_id, fps, start_ns, end_ns):
    step = int(SECOND / fps)
    at = start_ns
    while at <= end_ns:
        tracker.record(camera_id, at)
        at += step


def test_camera_that_never_published_is_no_data():
    camera = _tracker().snapshot(10 * SECOND)["left"]
    assert camera["state"] == "no_data"
    assert camera["fps"] is None
    assert camera["age_ms"] is None
    assert camera["frames_total"] == 0
    assert camera["expected_fps"] == 30.0


def test_steady_30hz_camera_is_ok():
    tracker = _tracker()
    _feed(tracker, "left", 30.0, 1 * SECOND, 5 * SECOND)
    camera = tracker.snapshot(5 * SECOND + 10 * MS)["left"]
    assert camera["state"] == "ok"
    assert camera["fps"] == pytest.approx(30.0, abs=1.0)
    assert camera["age_ms"] < 50


def test_5hz_camera_is_low_fps():
    # 11-16: the left Orbbec ran at 5 Hz for about a minute after start.
    tracker = _tracker()
    _feed(tracker, "left", 5.0, 1 * SECOND, 6 * SECOND)
    camera = tracker.snapshot(6 * SECOND + 10 * MS)["left"]
    assert camera["state"] == "low_fps"
    assert camera["fps"] == pytest.approx(5.0, abs=0.6)


def test_camera_that_stopped_is_stale_and_rate_decays_to_zero():
    tracker = _tracker()
    _feed(tracker, "left", 30.0, 1 * SECOND, 3 * SECOND)
    stale = tracker.snapshot(4 * SECOND + 500 * MS)["left"]
    assert stale["state"] == "stale"
    assert stale["age_ms"] == pytest.approx(1500, abs=40)
    later = tracker.snapshot(10 * SECOND)["left"]
    assert later["state"] == "stale"
    assert later["fps"] == 0.0
    assert later["frames_total"] > 0


def test_first_frames_are_warming_not_low_fps():
    tracker = _tracker()
    _feed(tracker, "left", 30.0, 1 * SECOND, 1 * SECOND + 200 * MS)
    camera = tracker.snapshot(1 * SECOND + 210 * MS)["left"]
    assert camera["state"] == "warming"
    assert camera["fps"] is None


def test_rate_uses_elapsed_time_before_the_window_fills():
    tracker = _tracker()
    _feed(tracker, "left", 30.0, 1 * SECOND, 2 * SECOND)
    camera = tracker.snapshot(2 * SECOND + 1 * MS)["left"]
    assert camera["state"] == "ok"
    assert camera["fps"] == pytest.approx(30.0, abs=1.5)


def test_without_expected_fps_never_reports_low_fps():
    tracker = _tracker(expected_fps={})
    _feed(tracker, "left", 2.0, 1 * SECOND, 6 * SECOND)
    camera = tracker.snapshot(6 * SECOND + 1 * MS)["left"]
    assert camera["expected_fps"] is None
    assert camera["state"] == "ok"


def test_unknown_camera_is_ignored():
    tracker = _tracker()
    tracker.record("ghost", 1 * SECOND)
    assert set(tracker.snapshot(2 * SECOND)) == {"left", "d435"}


def test_expected_fps_by_camera_broadcasts_a_single_value_and_checks_length():
    assert expected_fps_by_camera(["a", "b"], [30.0]) == {"a": 30.0, "b": 30.0}
    assert expected_fps_by_camera(["a", "b"], [30.0, 15.0]) == {"a": 30.0, "b": 15.0}
    assert expected_fps_by_camera(["a", "b"], []) == {}
    assert expected_fps_by_camera(["a", "b"], [0.0]) == {}
    with pytest.raises(ValueError):
        expected_fps_by_camera(["a", "b"], [30.0, 15.0, 5.0])


@pytest.mark.parametrize("bad", [dict(window_sec=0.0), dict(stale_after_sec=-1.0), dict(low_fps_ratio=1.5)])
def test_invalid_options_are_rejected(bad):
    with pytest.raises(ValueError):
        _tracker(**bad)
