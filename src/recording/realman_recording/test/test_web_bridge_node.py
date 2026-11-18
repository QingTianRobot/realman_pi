"""Unit test for the batch-export bridge's ADOPT_ALL service wait.

rclpy's ``Future.result()`` takes no ``timeout`` kwarg (unlike
``concurrent.futures``); the bridge must poll ``done()`` instead of passing a
keyword that would crash the web response after the adoption already happened.
"""


class _FakeResponse:
    success = True
    message = "adopted 1 pending session(s)"
    state = "READY"


class _RclpyFuture:
    """Mirror rclpy.task.Future: ``result()`` accepts no arguments."""

    def __init__(self, response):
        self._response = response
        self._done = False

    def done(self):
        return self._done

    def result(self):
        return self._response

    def cancel(self):
        self._done = True


class _FakeClient:
    def __init__(self, future):
        self._future = future

    def service_is_ready(self):
        return True

    def call_async(self, request):
        return self._future


def test_export_all_polls_future_without_timeout_kwarg():
    __import__("pytest").importorskip("rclpy")
    from realman_recording.web_bridge_node import RecordingWebBridgeNode

    future = _RclpyFuture(_FakeResponse())
    future._done = True  # resolve immediately so the poll loop is the fast path
    node = object.__new__(RecordingWebBridgeNode)
    node._recording_client = _FakeClient(future)

    result = node._export_all()
    assert result["ok"] is True
    assert result["message"] == "adopted 1 pending session(s)"


def test_export_all_reports_timeout_when_future_never_completes(monkeypatch):
    __import__("pytest").importorskip("rclpy")
    import time as _time

    from realman_recording.web_bridge_node import RecordingWebBridgeNode

    future = _RclpyFuture(_FakeResponse())
    future._done = False  # never completes
    node = object.__new__(RecordingWebBridgeNode)
    node._recording_client = _FakeClient(future)

    # Advance a fake clock past the 30s deadline without blocking on real sleeps.
    counter = {"n": 0.0}
    def fake_monotonic():
        counter["n"] += 1.0
        return counter["n"]
    monkeypatch.setattr(_time, "monotonic", fake_monotonic)
    monkeypatch.setattr(_time, "sleep", lambda _seconds: None)

    try:
        node._export_all()
    except RuntimeError as error:
        assert "timed out" in str(error)
    else:
        raise AssertionError("expected a timeout RuntimeError")


class _SnapshotServer:
    def __init__(self):
        self.snapshots = []

    def send_snapshot(self, payload):
        self.snapshots.append(payload)


def _bridge_with_camera(monkeypatch, now_ns):
    import threading
    import time as _time

    from realman_recording.camera_rate import CameraRateTracker
    from realman_recording.camera_workers import CameraSource
    from realman_recording.pika_motion import PikaMotionCache
    from realman_recording.web_bridge_node import RecordingWebBridgeNode

    monkeypatch.setattr(_time, "monotonic_ns", lambda: now_ns["value"])
    node = object.__new__(RecordingWebBridgeNode)
    node._camera_sources = (CameraSource("orbbec-left", "/camera_left/color/image_raw"),)
    node._camera_rates = CameraRateTracker(["orbbec-left"], expected_fps={"orbbec-left": 30.0})
    node._preview_worker = object()
    node._preview_lock = threading.Lock()
    node._preview_frames = {}
    node._arms = ()
    node._recording_status = {}
    node._gripper = {}
    node._gripper_limits = {}
    node._pika = PikaMotionCache([], [], [])
    node._server = _SnapshotServer()
    return node


def test_image_callback_counts_frames_before_decoding(monkeypatch):
    __import__("pytest").importorskip("rclpy")
    now = {"value": 0}
    node = _bridge_with_camera(monkeypatch, now)
    node._preview_worker = None  # decoding skipped entirely; the frame still counts
    for index in range(31):
        now["value"] = 1_000_000_000 + index * 33_333_333
        node._preview_image("orbbec-left", object())
    stats = node._camera_rates.snapshot(now["value"] + 1_000_000)["orbbec-left"]
    assert stats["frames_total"] == 31
    assert stats["state"] == "ok"


def test_snapshot_carries_camera_stats(monkeypatch):
    __import__("pytest").importorskip("rclpy")
    now = {"value": 5_000_000_000}
    node = _bridge_with_camera(monkeypatch, now)
    node._send_snapshot()
    payload = node._server.snapshots[-1]
    assert payload["camera_stats_enabled"] is True
    assert payload["camera_stats"]["orbbec-left"]["state"] == "no_data"
    assert payload["camera_stats"]["orbbec-left"]["topic"] == "/camera_left/color/image_raw"
    assert payload["preview_cameras"] == {"orbbec-left": 0}


def test_pika_recalibrate_passes_recorder_state_and_snapshot(monkeypatch):
    __import__("pytest").importorskip("rclpy")
    from realman_recording import web_bridge_node
    from realman_recording.pika_motion import PikaMotionCache
    from realman_recording.web_bridge_node import RecordingWebBridgeNode

    seen = {}

    def fake_recalibrate(url, timeout, state, snapshot):
        seen.update(url=url, timeout=timeout, state=state, sides=sorted(snapshot["sides"]))
        return 200, {"ok": True}

    monkeypatch.setattr(web_bridge_node, "recalibrate", fake_recalibrate)
    node = object.__new__(RecordingWebBridgeNode)
    node._pika_helper_url = "http://127.0.0.1:8783"
    node._pika_helper_timeout_sec = 90.0
    node._recording_status = {"state": 2}
    node._pika = PikaMotionCache(["l", "r"], ["/pika_pose_l", "/pika_pose_r"], [])
    assert node._pika_recalibrate() == (200, {"ok": True})
    assert seen == {"url": "http://127.0.0.1:8783", "timeout": 90.0, "state": 2, "sides": ["l", "r"]}
