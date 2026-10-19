"""Exporter alignment tests; run in the recording image with NumPy installed."""
from pathlib import Path

import pytest

from realman_recording.lerobot_align import TimedSample
from realman_recording.lerobot_exporter import LeRobotExporter, _split_ee_pose, _split_ee_velocity
from realman_recording.lerobot_schema import schema_from_parameters


def test_split_ee_pose_and_velocity_preserve_arm_order():
    pose = (1.0, 2.0, 3.0, 0.0, 0.0, 0.0, 1.0) * 3  # 3 arms × [x,y,z,qx,qy,qz,qw]
    position, rotation = _split_ee_pose(pose, 3)
    assert position == (1.0, 2.0, 3.0, 1.0, 2.0, 3.0, 1.0, 2.0, 3.0)
    assert rotation == (0.0, 0.0, 0.0, 1.0) * 3

    velocity = tuple(float(index) for index in range(18))  # 3 arms × [vx,vy,vz,wx,wy,wz]
    linear, angular = _split_ee_velocity(velocity, 3)
    assert linear == (0.0, 1.0, 2.0, 6.0, 7.0, 8.0, 12.0, 13.0, 14.0)
    assert angular == (3.0, 4.0, 5.0, 9.0, 10.0, 11.0, 15.0, 16.0, 17.0)


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
        {"valid_frames": 2, "invalid_frames": 0, "max_sync_error_ns": 1234},
    )

    receipt = __import__("json").loads((tmp_path / "export" / "lerobot-v3.json").read_text(encoding="utf-8"))
    assert receipt["episode_index"] == 3
    assert receipt["first_walltime_ns"] == 100
    assert receipt["canonical"]["camera_archive_quality"] == {"state": "UNAVAILABLE"}
    assert receipt["quality"] == {"valid_frames": 2, "invalid_frames": 0, "max_sync_error_ns": 1234}


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


def _three_arm_schema():
    return schema_from_parameters(
        repo_id="realman/pi05-three-arm", fps=15.0, arms=["l", "m", "r"],
        arm_action_topics=["/l/cartesian_velocity/command", "/m/cartesian_velocity/command", "/r/cartesian_velocity/command"],
        gripper_position_topics=["/gripper_left/position", "/gripper_mid/position", "/gripper_right/position"],
        gripper_action_topics=[], camera_ids=["front"],
    )


def test_v3_streams_zero_fills_a_never_commanded_arm():
    schema = _three_arm_schema()
    joint = [TimedSample(0, (0.0, 0.0, 0.0, 0.0, 0.0, 0.0)), TimedSample(100_000_000, (0.1, 0.0, 0.0, 0.0, 0.0, 0.0))]
    command = [TimedSample(0, (1.0, 0.0, 0.0, 0.0, 0.0, 0.0)), TimedSample(100_000_000, (1.0, 0.0, 0.0, 0.0, 0.0, 0.0))]
    gripper = [TimedSample(0, 0.0), TimedSample(100_000_000, 0.5)]
    streams = {
        "/l/joint_states": joint, "/m/joint_states": joint, "/r/joint_states": joint,
        "/gripper_left/position": gripper, "/gripper_mid/position": gripper, "/gripper_right/position": gripper,
        "/l/cartesian_velocity/command": command, "/r/cartesian_velocity/command": command,
        # Middle arm was never commanded during this episode.
    }
    by_name = {name: samples for name, samples, _ in LeRobotExporter._v3_streams(streams, schema)}
    middle = by_name["/m/cartesian_velocity/command"]
    assert len(middle) == len(joint)
    assert [sample.timestamp_ns for sample in middle] == [sample.timestamp_ns for sample in joint]
    assert all(sample.value == (0.0, 0.0, 0.0, 0.0, 0.0, 0.0) for sample in middle)


def test_v3_streams_still_rejects_a_missing_state_stream():
    schema = _three_arm_schema()
    joint = [TimedSample(0, (0.0, 0.0, 0.0, 0.0, 0.0, 0.0)), TimedSample(100_000_000, (0.1, 0.0, 0.0, 0.0, 0.0, 0.0))]
    command = [TimedSample(0, (1.0, 0.0, 0.0, 0.0, 0.0, 0.0)), TimedSample(100_000_000, (1.0, 0.0, 0.0, 0.0, 0.0, 0.0))]
    gripper = [TimedSample(0, 0.0), TimedSample(100_000_000, 0.5)]
    streams = {
        # /m/joint_states missing — this is a recording defect, not an idle arm.
        "/l/joint_states": joint, "/r/joint_states": joint,
        "/gripper_left/position": gripper, "/gripper_mid/position": gripper, "/gripper_right/position": gripper,
        "/l/cartesian_velocity/command": command, "/m/cartesian_velocity/command": command, "/r/cartesian_velocity/command": command,
    }
    with pytest.raises(ValueError):
        LeRobotExporter._v3_streams(streams, schema)
