from pathlib import Path

import pytest

from realman_web_control.joint_records import JointRecordStore


def test_joint_records_are_stored_under_arm_directories(tmp_path: Path):
    store = JointRecordStore(tmp_path)

    record = store.save("m", "Ready Pose", [0, 1, 2, 3, 4, 5])

    assert (tmp_path / "m" / "ready-pose.yaml").is_file()
    assert (tmp_path / "l").is_dir()
    assert record.event()["joint_degrees"] == [0.0, 1.0, 2.0, 3.0, 4.0, 5.0]
    assert store.list("m")[0].label == "Ready Pose"
    assert store.list("l") == []


def test_joint_records_keep_duplicate_names_addressable(tmp_path: Path):
    store = JointRecordStore(tmp_path)

    first = store.save("l", "home", [0, 0, 0, 0, 0, 0])
    second = store.save("l", "home", [1, 1, 1, 1, 1, 1])

    assert first.record_id == "home"
    assert second.record_id == "home-2"
    assert store.get("l", "home-2").joint_degrees == (1.0, 1.0, 1.0, 1.0, 1.0, 1.0)


def test_joint_records_reject_bad_arm_and_joint_vectors(tmp_path: Path):
    store = JointRecordStore(tmp_path)

    with pytest.raises(ValueError, match="arm"):
        store.save("center", "bad", [0, 0, 0, 0, 0, 0])
    with pytest.raises(ValueError, match="six"):
        store.save("l", "bad", [0, 1])
