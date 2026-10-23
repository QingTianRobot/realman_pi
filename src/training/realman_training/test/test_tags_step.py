from __future__ import annotations

import base64 as _b64
import json
import shlex
import subprocess

import pytest
from fake_runner import FakeRunner, RecordingLog
from lerobot_fixture import Episode, build_dataset, build_view, gripper, tag_index, write_clean_manifest, write_tags

from realman_training import episode_tags
from realman_training.config import RemoteConfig, load_config
from realman_training.jobs import StepFailed
from realman_training.steps import tags

REMOTE = RemoteConfig()
TAGS = [
    {"success": True, "arm": "right", "lighting_level": 2},
    {"success": False, "arm": "right", "lighting_level": 2, "failure_reason": "re-grasp"},
    {"success": True, "arm": "right", "lighting_level": 1},
]
EPISODES = [
    Episode("pick_and_place", gripper((50, 40), (5700, 60), (50, 40))),
    Episode("pick_only", gripper((50, 40), (5700, 50))),
    Episode("pick_only", gripper((50, 30), (5700, 30))),
]


@pytest.fixture()
def raw(tmp_path):
    return build_dataset(tmp_path / "data" / "raw_x" / REMOTE.dataset, EPISODES)


def fake_robot(recording, meta) -> FakeRunner:
    """Answers the tag index read and runs the remote tar of the recording's meta locally against `recording`."""
    runner = FakeRunner().on("episode_meta.json", stdout=json.dumps(meta))
    source = f"{REMOTE.recording_root}/{recording.name}"

    def base64_impl(argv, input_data):
        # argv is the ssh command; extract the "sh -c" inner part
        inner = shlex.split(argv[-1])
        assert inner[:3] == ["docker", "exec", REMOTE.recording_container]
        sh_argv = inner[3:]
        assert sh_argv[:2] == ["sh", "-c"]
        cmd_str = sh_argv[2]
        assert cmd_str.endswith(" | base64")
        tar_cmd_str = cmd_str[: -len(" | base64")]
        tar_argv = shlex.split(tar_cmd_str)
        # Assert flock structure: flock -s -w <n> <lock> tar ...
        assert tar_argv[:2] == ["flock", "-s"]
        lock_arg = f"{REMOTE.recording_root}/.{recording.name}.lock"
        assert tar_argv[4] == lock_arg
        # Run the tar command locally, replacing the remote source with local recording
        tar_argv = [str(recording) if a == source else a for a in tar_argv[5:]]
        data = subprocess.run(tar_argv, capture_output=True, check=True).stdout
        return _b64.b64encode(data).decode()

    runner.on("base64", stdout=base64_impl)
    return runner


def test_dataset_path_is_relative_to_the_tag_root():
    assert tags.dataset_path(REMOTE, "realman__pi05-three-arm") == "lerobot/realman__pi05-three-arm"


def test_refresh_a_raw_copy_reads_the_index_under_a_shared_lock(raw):
    runner = fake_robot(raw, tag_index(raw, TAGS))
    result = tags.refresh({"path": str(raw)}, RecordingLog(), runner=runner)
    assert (result["kind"], result["episodes"], result["previous"]) == ("raw", 3, False)
    doc = episode_tags.load(raw)
    assert doc["origin"] == f"{REMOTE.ssh_host}:{REMOTE.recording_container}:{REMOTE.tags_root}/episode_meta.json"
    assert doc["episodes"][1]["tags"]["failure_reason"] == "re-grasp"
    inner = shlex.split(runner.commands("episode_meta.json")[0][-1])
    assert inner[3:9] == ["flock", "-s", "-w", str(REMOTE.lock_wait_sec), f"{REMOTE.tags_root}/.episode_tags.lock", "cat"]


def test_refresh_reports_what_changed(raw):
    write_tags(raw, TAGS)
    moved = [dict(t) for t in TAGS]
    moved[2]["lighting_level"] = 2
    result = tags.refresh({"path": str(raw)}, RecordingLog(), runner=fake_robot(raw, tag_index(raw, moved)))
    assert result["previous"] is True and result["changed"] == {"episodes": 1, "keys": {"lighting_level": 1}}


def test_a_renumbered_recording_is_refused_and_the_old_file_kept(raw, tmp_path):
    write_tags(raw, TAGS)
    before = episode_tags.tags_path(raw).read_bytes()
    other = build_dataset(tmp_path / "remote" / REMOTE.dataset, [EPISODES[0], EPISODES[2], EPISODES[1]])
    with pytest.raises(StepFailed, match="no longer matches"):
        tags.refresh({"path": str(raw)}, RecordingLog(), runner=fake_robot(other, tag_index(raw, TAGS)))
    assert episode_tags.tags_path(raw).read_bytes() == before


def test_an_unreachable_robot_fails_and_names_it(raw):
    runner = FakeRunner().on("episode_meta.json", returncode=255, stdout="ssh: connect to host realman_local: timed out")
    with pytest.raises(StepFailed, match="realman_local"):
        tags.refresh({"path": str(raw)}, RecordingLog(), runner=runner)
    assert not episode_tags.tags_path(raw).exists()


def _clean_of(raw, tmp_path):
    clean = build_dataset(tmp_path / "data" / "c", [EPISODES[0], EPISODES[2]])
    write_clean_manifest(clean, source=str(raw), removed={1: "re-grasp"}, old_to_new={0: 0, 2: 1})
    return clean


def test_a_clean_set_is_derived_from_its_source_without_the_robot(raw, tmp_path):
    write_tags(raw, TAGS)
    clean = _clean_of(raw, tmp_path)
    runner = FakeRunner()
    result = tags.refresh({"path": str(clean)}, RecordingLog(), runner=runner)
    assert result["kind"] == "clean" and runner.calls == []
    doc = episode_tags.load(clean)
    assert [r["session_id"] for r in doc["episodes"]] == ["S000", "S002"]
    assert doc["derived_from"]["path"] == str(raw) and doc["derived_from"]["via"].endswith("c.clean_manifest.json")


def test_a_clean_set_needs_tags_on_its_source(raw, tmp_path):
    clean = _clean_of(raw, tmp_path)
    with pytest.raises(StepFailed, match="tags refresh"):
        tags.refresh({"path": str(clean)}, RecordingLog(), runner=FakeRunner())


def test_a_view_copies_its_source_rows(raw, tmp_path):
    write_tags(raw, TAGS)
    view = build_view(tmp_path / "data" / "v", source=str(raw), prompts={"pick_and_place": "put", "pick_only": "pick"},
                      lengths=[140, 90, 60], tasks=["pick_and_place", "pick_only", "pick_only"])
    assert tags.refresh({"path": str(view)}, RecordingLog(), runner=FakeRunner())["kind"] == "view"
    assert episode_tags.load(view)["episodes"][1]["tags"]["success"] is False


def test_status_compares_the_raw_ancestor(raw, tmp_path):
    write_tags(raw, TAGS)
    clean = _clean_of(raw, tmp_path)
    config = load_config(None)
    moved = [dict(t) for t in TAGS]
    moved[1] = {"success": True, "arm": "right", "lighting_level": 2}
    result = tags.status(config, clean, fake_robot(raw, tag_index(raw, moved)))
    assert (result["state"], result["episodes_changed"], result["raw"]) == ("changed", 1, str(raw.resolve()))
    assert result["keys"] == {"failure_reason": 1, "success": 1}
    assert tags.status(config, raw, fake_robot(raw, tag_index(raw, TAGS)))["state"] == "current"
    down = FakeRunner().on("episode_meta.json", returncode=255, stdout="ssh: connect to host realman_local: timed out")
    assert tags.status(config, raw, down)["state"] == "unknown"
    episode_tags.tags_path(raw).unlink()
    assert tags.status(config, clean, FakeRunner())["state"] == "no_tags"


# --- F3: robot-path source and hand-made file protection ---

def test_clean_set_with_robot_path_source_raises_on_the_robot(raw, tmp_path):
    """(a) cleaned set whose manifest source is a robot path with a hand-made tag file raises 'on the robot'."""
    robot_source = "realman_ts:/home/x/lerobot/realman__pi05-three-arm"
    clean = build_dataset(tmp_path / "data" / "c2", [EPISODES[0], EPISODES[2]])
    write_clean_manifest(clean, source=robot_source, removed={1: "re-grasp"}, old_to_new={0: 0, 2: 1})
    # Write a hand-made tag file (valid schema but derived_from.via == "manual")
    handmade_doc = {
        "schema_version": 1,
        "origin": "manual",
        "dataset_path": "lerobot/realman__pi05-three-arm",
        "snapshot_at": "2026-10-13T10:00:00+08:00",
        "remote_generated_at": None,
        "remote_errors": 0,
        "derived_from": {"source": None, "via": "manual", "note": "hand-tagged 10-13"},
        "episodes": [
            {"episode_index": 0, "session_id": None, "length": 140, "task": "pick_and_place",
             "tags": {"success": True}, "tag_sources": {}},
            {"episode_index": 1, "session_id": None, "length": 60, "task": "pick_only",
             "tags": {"success": True}, "tag_sources": {}},
        ],
    }
    episode_tags.write(clean, handmade_doc)
    before = episode_tags.tags_path(clean).read_bytes()
    runner = FakeRunner()
    with pytest.raises(StepFailed, match="on the robot"):
        tags.refresh({"path": str(clean)}, RecordingLog(), runner=runner)
    assert episode_tags.tags_path(clean).read_bytes() == before


def test_raw_handmade_refuses_before_remote_call(raw):
    """(b) raw dataset with hand-made file raises 'hand-made' before any remote call."""
    handmade_doc = {
        "schema_version": 1,
        "origin": "manual",
        "dataset_path": "lerobot/realman__pi05-three-arm",
        "snapshot_at": "2026-10-13T10:00:00+08:00",
        "remote_generated_at": None,
        "remote_errors": 0,
        "derived_from": {"source": None, "via": "manual", "note": "hand-tagged"},
        "episodes": [
            {"episode_index": 0, "session_id": None, "length": 140, "task": "pick_and_place",
             "tags": {"success": True}, "tag_sources": {}},
            {"episode_index": 1, "session_id": None, "length": 90, "task": "pick_only",
             "tags": {"success": False}, "tag_sources": {}},
            {"episode_index": 2, "session_id": None, "length": 60, "task": "pick_only",
             "tags": {"success": True}, "tag_sources": {}},
        ],
    }
    episode_tags.write(raw, handmade_doc)
    before = episode_tags.tags_path(raw).read_bytes()
    runner = FakeRunner()
    with pytest.raises(StepFailed, match="hand-made"):
        tags.refresh({"path": str(raw)}, RecordingLog(), runner=runner)
    assert runner.calls == []
    assert episode_tags.tags_path(raw).read_bytes() == before


def test_raw_handmade_force_replaces_file(raw):
    """(b) with force: True the hand-made file is replaced."""
    handmade_doc = {
        "schema_version": 1,
        "origin": "manual",
        "dataset_path": "lerobot/realman__pi05-three-arm",
        "snapshot_at": "2026-10-13T10:00:00+08:00",
        "remote_generated_at": None,
        "remote_errors": 0,
        "derived_from": {"source": None, "via": "manual"},
        "episodes": [
            {"episode_index": 0, "session_id": None, "length": 140, "task": "pick_and_place",
             "tags": {}, "tag_sources": {}},
            {"episode_index": 1, "session_id": None, "length": 90, "task": "pick_only",
             "tags": {}, "tag_sources": {}},
            {"episode_index": 2, "session_id": None, "length": 60, "task": "pick_only",
             "tags": {}, "tag_sources": {}},
        ],
    }
    episode_tags.write(raw, handmade_doc)
    before = episode_tags.tags_path(raw).read_bytes()
    runner = fake_robot(raw, tag_index(raw, TAGS))
    result = tags.refresh({"path": str(raw), "force": True}, RecordingLog(), runner=runner)
    assert result["kind"] == "raw"
    assert episode_tags.tags_path(raw).read_bytes() != before
    doc = episode_tags.load(raw)
    assert doc["derived_from"] is None  # replaced by fresh remote doc


# --- F4: raw_root validates sources ---

def test_status_error_for_robot_path_source(raw, tmp_path):
    """Status of a cleaned set with a robot-path source returns state 'error' mentioning 'on the robot'."""
    robot_source = "realman_ts:/home/x/lerobot/realman__pi05-three-arm"
    clean = build_dataset(tmp_path / "data" / "c3", [EPISODES[0], EPISODES[2]])
    write_clean_manifest(clean, source=robot_source, removed={1: "re-grasp"}, old_to_new={0: 0, 2: 1})
    write_tags(raw, TAGS)
    config = load_config(None)
    result = tags.status(config, clean, FakeRunner())
    assert result["state"] == "error"
    assert "on the robot" in result["error"]


def test_status_error_for_cycle(raw, tmp_path):
    """Status of two cleaned sets whose manifests name each other returns state 'error'."""
    a = build_dataset(tmp_path / "a", [EPISODES[0]])
    b = build_dataset(tmp_path / "b", [EPISODES[0]])
    write_clean_manifest(a, source=str(b), removed={}, old_to_new={0: 0})
    write_clean_manifest(b, source=str(a), removed={}, old_to_new={0: 0})
    config = load_config(None)
    result = tags.status(config, a, FakeRunner())
    assert result["state"] == "error"


def test_status_error_for_missing_local_source(raw, tmp_path):
    """Status of a cleaned set whose source is not a dataset returns 'not a local dataset'."""
    not_a_dataset = tmp_path / "not_a_dataset"
    not_a_dataset.mkdir()
    clean = build_dataset(tmp_path / "data" / "c4", [EPISODES[0], EPISODES[2]])
    write_clean_manifest(clean, source=str(not_a_dataset), removed={1: "re-grasp"}, old_to_new={0: 0, 2: 1})
    config = load_config(None)
    result = tags.status(config, clean, FakeRunner())
    assert result["state"] == "error"
    assert "not a local dataset" in result["error"]


# --- F5: timeout passes -w to both remote commands ---

def test_status_timeout_sets_flock_wait(raw):
    """status(..., timeout=7) passes -w 7 to both remote commands (read_index and read_remote_episodes)."""
    write_tags(raw, TAGS)
    config = load_config(None)
    runner = fake_robot(raw, tag_index(raw, TAGS))
    result = tags.status(config, raw, runner, timeout=7)
    assert result["state"] == "current"
    # read_index command (episode_meta.json): check -w 7
    # argv[-1] is "docker exec <container> flock -s -w <n> <lock> cat <file>"
    index_cmd = runner.commands("episode_meta.json")[0]
    index_inner = shlex.split(index_cmd[-1])
    # index_inner[3] = "flock", [4] = "-s", [5] = "-w", [6] = wait_value
    assert index_inner[5:7] == ["-w", "7"]
    # read_remote_episodes command (base64): check -w 7 inside sh -c
    base64_cmd = runner.commands("base64")[0]
    base64_inner = shlex.split(base64_cmd[-1])
    sh_cmd_str = base64_inner[base64_inner.index("-c") + 1]
    tar_part = sh_cmd_str[: -len(" | base64")]
    tar_argv = shlex.split(tar_part)
    assert tar_argv[3] == "7"
