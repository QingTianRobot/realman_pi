from pathlib import Path


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
