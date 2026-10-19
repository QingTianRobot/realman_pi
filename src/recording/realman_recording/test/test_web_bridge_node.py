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
