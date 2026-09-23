from pathlib import Path
import threading

import pytest


class _ObservedRLock:
    """Expose a second caller's lock attempt without relying on sleep timing."""

    def __init__(self):
        self._lock = threading.RLock()
        self._guard = threading.Lock()
        self._held = False
        self.contended = threading.Event()

    def __enter__(self):
        with self._guard:
            if self._held:
                self.contended.set()
        self._lock.acquire()
        with self._guard:
            self._held = True
        return self

    def __exit__(self, *_exception):
        with self._guard:
            self._held = False
        self._lock.release()


def test_service_client_documents_stop_then_explicit_adopt():
    source = Path(__file__).parents[1] / "realman_recording" / "recording_service_client.py"
    text = source.read_text(encoding="utf-8")
    assert "STOP only finalizes the raw session" in text
    assert "ADOPT queues conversion" in text


def test_service_client_prepare_defaults_to_camera_preflight_and_can_opt_out():
    """The explicit diagnostic command must check the same cameras as START by default."""
    source = Path(__file__).parents[1] / "realman_recording" / "recording_service_client.py"
    text = source.read_text(encoding="utf-8")
    assert "def prepare(self, *, record_cameras: bool = True)" in text
    assert "request.record_cameras = record_cameras" in text
    assert 'prepare.add_argument("--no-cameras"' in text


def test_recorder_diagnostics_do_not_claim_prepare_is_a_required_start_command():
    source = Path(__file__).parents[1] / "realman_recording" / "recorder_node.py"
    text = source.read_text(encoding="utf-8")
    assert "START runs admission checks internally; no separate PREPARE is required." in text
    assert 'raise RuntimeError("PREPARE must succeed before START")' not in text


def test_ros_nodes_do_not_duplicate_rclpy_subscription_registry():
    """rclpy owns Node._subscriptions; appending create_subscription twice breaks teardown."""
    package = Path(__file__).parents[1] / "realman_recording"
    for module_name in ("recorder_node.py", "web_bridge_node.py"):
        source = (package / module_name).read_text(encoding="utf-8")
        assert "self._subscriptions = []" not in source
        assert "self._subscriptions.append(self.create_subscription" not in source


def _service_harness():
    """Bind the real service handlers to a tiny stateful test double."""
    pytest.importorskip("rclpy")
    try:
        from realman_recording.session_store import SessionState
        from realman_recording.recorder_node import RecordingRecorderNode
        from realman_recording_msgs.srv import ManageRecording
    except ImportError as error:  # pragma: no cover - only available in Humble test images
        pytest.skip(f"ROS recording interfaces are unavailable: {error}")

    class Logger:
        def error(self, _message):
            pass

    class Result:
        def __init__(self, ready: bool):
            self.ready = ready
            self.summary = "ready" if ready else "topic_stale:/l/joint_states"

    class Harness:
        pass

    harness = Harness()
    harness._service_lock = threading.RLock()
    harness._state = SessionState.IDLE
    harness._last_preflight = None
    harness._prepared_cameras = False
    harness.get_logger = lambda: Logger()
    harness._manage_service_serial = lambda request, response: RecordingRecorderNode._manage_service_serial(
        harness, request, response
    )
    harness._manage_service = lambda request, response: RecordingRecorderNode._manage_service(
        harness, request, response
    )
    harness._Result = Result
    harness._ManageRecording = ManageRecording
    return harness


def test_concurrent_prepare_cannot_replace_start_admission_result():
    """START owns its preflight result until its session has been created."""
    from realman_recording.session_store import SessionState

    harness = _service_harness()
    observed_lock = _ObservedRLock()
    harness._service_lock = observed_lock
    request_entered = threading.Event()
    allow_start_preflight_to_finish = threading.Event()
    competing_prepare_entered = threading.Event()
    start_created = threading.Event()

    def prepare(request):
        if request.command == harness._ManageRecording.Request.START:
            harness._last_preflight = harness._Result(ready=True)
            request_entered.set()
            assert allow_start_preflight_to_finish.wait(timeout=2)
            return "start-preflight"
        competing_prepare_entered.set()
        harness._last_preflight = harness._Result(ready=False)
        return "prepare-preflight"

    def start_session(_request):
        assert harness._last_preflight.ready
        start_created.set()
        harness._state = SessionState.RECORDING
        return "session-started"

    harness._prepare = prepare
    harness._start_session = start_session
    start_request = harness._ManageRecording.Request()
    start_request.command = start_request.START
    start_request.record_cameras = False
    prepare_request = harness._ManageRecording.Request()
    prepare_request.command = prepare_request.PREPARE
    start_response = harness._ManageRecording.Response()
    prepare_response = harness._ManageRecording.Response()

    start_thread = threading.Thread(
        target=harness._manage_service, args=(start_request, start_response)
    )
    prepare_thread = threading.Thread(
        target=harness._manage_service, args=(prepare_request, prepare_response)
    )
    start_thread.start()
    assert request_entered.wait(timeout=2)
    prepare_thread.start()
    # The second request has been submitted while START is held in preflight. With
    # the service lock it cannot execute its PREPARE body until START creates a session.
    assert observed_lock.contended.wait(timeout=2)
    assert not competing_prepare_entered.is_set()
    allow_start_preflight_to_finish.set()
    start_thread.join(timeout=2)
    prepare_thread.join(timeout=2)

    assert not start_thread.is_alive() and not prepare_thread.is_alive()
    assert start_created.is_set()
    assert start_response.success is True
    assert start_response.session_id == "session-started"
    assert competing_prepare_entered.is_set()
    assert prepare_response.success is False


def test_repeated_stop_is_an_explicit_safe_failure():
    """STOP with no active writer returns a failure and does not create a session."""
    harness = _service_harness()
    stop_calls = []
    harness._stop_or_cancel = lambda **_kwargs: stop_calls.append("stop") or None
    request = harness._ManageRecording.Request()
    request.command = request.STOP
    request.session_id = "previous-session"
    response = harness._ManageRecording.Response()

    harness._manage_service(request, response)

    assert stop_calls == ["stop"]
    assert response.success is False
    assert response.session_id == "previous-session"
    assert response.state == "IDLE"
    assert "no active recording session" in response.message
