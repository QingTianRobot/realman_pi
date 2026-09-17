"""Pure contract tests for lossy, read-only Rerun state visualization."""
from __future__ import annotations

from realman_recording.rerun_adapter import RerunVisualizationAdapter


class _FakeRerun:
    def __init__(self):
        self.events = []

    def init(self, application_id, *, spawn=False):
        self.events.append(("init", application_id, spawn))

    def set_time_nanos(self, timeline, timestamp_ns):
        self.events.append(("time", timeline, timestamp_ns))

    def log(self, entity_path, value):
        self.events.append(("log", entity_path, value))

    def Scalars(self, values):
        return ("scalars", tuple(values))

    def EncodedImage(self, *, contents, media_type):
        return ("jpeg", contents)


def test_adapter_logs_only_coalesced_joint_and_gripper_snapshot():
    rerun = _FakeRerun()
    adapter = RerunVisualizationAdapter(rerun_module=rerun, application_id="recording-test")

    adapter.offer_snapshot(
        timestamp_ns=42,
        arms={"l": [0.1, 0.2]},
        grippers={"left": {"position": 0.5, "alarm": 0}},
    )

    assert rerun.events[0] == ("init", "recording-test", False)
    assert ("time", "wall_time", 42) in rerun.events
    assert ("log", "recording/arms/l/joints_rad", ("scalars", (0.1, 0.2))) in rerun.events
    assert ("log", "recording/grippers/left/position", ("scalars", (0.5,))) in rerun.events


def test_adapter_logs_compressed_preview_without_decoding_it():
    rerun = _FakeRerun()
    adapter = RerunVisualizationAdapter(rerun_module=rerun, application_id="recording-test")

    adapter.offer_preview(camera_id="front", timestamp_ns=42, jpeg=b"jpeg")

    assert ("log", "recording/cameras/front/preview", ("jpeg", b"jpeg")) in rerun.events


def test_adapter_logs_recording_health_as_small_scalars():
    rerun = _FakeRerun()
    adapter = RerunVisualizationAdapter(rerun_module=rerun, application_id="recording-test")

    adapter.offer_recording_status(timestamp_ns=42, state=2, elapsed_sec=1.0, remaining_sec=9.0, dropped_samples=3)

    assert ("log", "recording/status/state", ("scalars", (2,))) in rerun.events
    assert ("log", "recording/status/dropped_samples", ("scalars", (3,))) in rerun.events
