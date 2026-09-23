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


def test_v3_receipt_is_written_as_a_complete_json_document(tmp_path: Path):
    schema = schema_from_parameters(
        repo_id="realman/pi05-three-arm", fps=15.0, arms=["l"],
        arm_action_topics=["/l/cartesian_velocity/command"],
        gripper_position_topics=["/gripper_left/position"],
        gripper_action_topics=[], camera_ids=["front"],
        base_frames=["l/base_link"], ee_links=["link_6"],
        cartesian_command_frames=["l/base_link"],
    )
    (tmp_path / "export").mkdir()
    urdf = tmp_path / "robot.urdf"
    urdf.write_text("<robot name='test'/>", encoding="utf-8")

    LeRobotExporter._write_v3_receipt(
        tmp_path, tmp_path / "dataset", {"session_id": "session-1"}, schema,
        3, [100, 200], urdf, {"state": "UNAVAILABLE"},
    )

    receipt = __import__("json").loads((tmp_path / "export" / "lerobot-v3.json").read_text(encoding="utf-8"))
    assert receipt["episode_index"] == 3
    assert receipt["first_walltime_ns"] == 100
    assert receipt["canonical"]["camera_archive_quality"] == {"state": "UNAVAILABLE"}


def test_dataset_root_uses_stable_repo_child_for_collection_directory(tmp_path: Path):
    schema = schema_from_parameters(
        repo_id="realman/pi05-three-arm", fps=15.0, arms=["l"],
        arm_action_topics=["/l/cartesian_velocity/command"],
        gripper_position_topics=["/gripper_left/position"],
        gripper_action_topics=[], camera_ids=["front"],
        base_frames=["l/base_link"], ee_links=["link_6"],
        cartesian_command_frames=["l/base_link"],
    )
    assert LeRobotExporter._dataset_root(tmp_path, schema) == tmp_path / "realman__pi05-three-arm"
    (tmp_path / "meta").mkdir()
    (tmp_path / "meta" / "info.json").write_text("{}", encoding="utf-8")
    assert LeRobotExporter._dataset_root(tmp_path, schema) == tmp_path
