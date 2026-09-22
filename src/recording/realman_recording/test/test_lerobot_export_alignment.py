"""Exporter alignment tests; run in the recording image with NumPy installed."""
from pathlib import Path

from realman_recording.lerobot_align import TimedSample
from realman_recording.lerobot_exporter import LeRobotExporter
from realman_recording.lerobot_schema import schema_from_parameters


def test_v3_anchor_grid_is_fixed_fps_not_four_camera_union(tmp_path: Path):
    schema = schema_from_parameters(
        repo_id="realman/pi05-three-arm", fps=15.0, arms=["l", "m", "r"],
        arm_action_topics=["/l/cartesian_velocity/command", "/m/cartesian_velocity/command", "/r/cartesian_velocity/command"],
        gripper_position_topics=["/gripper_left/position", "/gripper_mid/position", "/gripper_right/position"],
        gripper_action_topics=[], camera_ids=["orbbec-left", "orbbec-middle", "orbbec-right", "d435"],
    )
    streams = [("/l/joint_states", [TimedSample(0, (0.0,)), TimedSample(1_000_000_000, (1.0,))], object())]
    cameras = {
        camera: [(index * 66_666_667 + offset, tmp_path / f"{camera}-{index}.jpg") for index in range(16)]
        for offset, camera in enumerate(schema.camera_ids)
    }
    anchors = LeRobotExporter._v3_anchors(streams, cameras, schema, 0.2)
    assert 14 <= len(anchors) <= 16
    assert all(later - earlier == 66_666_667 for earlier, later in zip(anchors, anchors[1:]))


def test_camera_archive_quality_reads_persisted_queue_stats(tmp_path: Path):
    (tmp_path / "videos").mkdir()
    (tmp_path / "videos" / "media-index.json").write_text(
        '{"stats":{"front":{"accepted":10,"dropped":2,"errors":1}}}', encoding="utf-8"
    )

    assert LeRobotExporter._camera_archive_quality(tmp_path) == {
        "state": "AVAILABLE",
        "stats": {"front": {"accepted": 10, "dropped": 2, "errors": 1}},
    }
