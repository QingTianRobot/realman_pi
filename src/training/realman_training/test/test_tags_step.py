from __future__ import annotations

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

    def pipe_impl(producer, consumer, on_bytes):
        inner = shlex.split(producer[-1])
        assert inner[:3] == ["docker", "exec", REMOTE.recording_container]
        argv = inner[3:]
        assert argv[:5] == ["flock", "-s", "-w", str(REMOTE.lock_wait_sec), f"{REMOTE.recording_root}/.{recording.name}.lock"]
        argv = [str(recording) if a == source else a for a in argv[5:]]
        data = subprocess.run(argv, capture_output=True, check=True).stdout
        subprocess.run(consumer, input=data, check=True)
        on_bytes(len(data))
        return len(data)

    runner.pipe_impl = pipe_impl
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
