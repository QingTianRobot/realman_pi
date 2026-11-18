"""The console's metadata mirror of a compute host: the JSON files the compute host wrote name its own absolute paths
(<workdir>/data/realman/..., <workdir>/src/openpi/...); the console reads them as its data_root / docker_data."""

from __future__ import annotations

import json
from pathlib import Path

import pytest
from console_fixture import MODEL, build_world

from realman_training import catalog, compute, job_params, serve_dataset
from realman_training.config import load_config
from realman_training.steps import tags as tags_step

WORKDIR = "/w"
EI_DATA = f"{WORKDIR}/{compute.REMOTE_DATA_ROOT}"
EI_OPENPI = f"{WORKDIR}/{compute.REMOTE_OPENPI}"


def _ei_paths(path: Path, paths: dict) -> None:
    """Rewrite one JSON file as the compute host wrote it."""
    text = path.read_text(encoding="utf-8")
    text = text.replace(str(paths["docker_data"]), EI_OPENPI).replace(str(paths["data"]), EI_DATA)
    path.write_text(text, encoding="utf-8")


@pytest.fixture()
def mirror(tmp_path):
    paths = build_world(tmp_path)
    for path in (paths["run"] / "console_train.json", paths["run"] / "model_card.json",
                 paths["view"] / "contract.json", Path(f"{paths['clean']}.clean_manifest.json")):
        _ei_paths(path, paths)
        assert EI_DATA in path.read_text(encoding="utf-8")
    config_path = paths["config"]
    config_path.write_text(config_path.read_text(encoding="utf-8")
                           + f"  compute:\n    ssh_host: EI\n    workdir: {WORKDIR}\n", encoding="utf-8")
    return paths, load_config(config_path)


def test_local_path_maps_the_compute_roots_onto_the_mirror(mirror):
    paths, config = mirror
    assert compute.local_path(config, f"{EI_DATA}/a/b") == f"{paths['data']}/a/b"
    assert compute.local_path(config, EI_DATA) == str(paths["data"])
    assert compute.local_path(config, f"{EI_OPENPI}/checkpoints/x") == f"{paths['docker_data']}/checkpoints/x"
    assert compute.local_path(config, f"{EI_DATA}2/a") == f"{EI_DATA}2/a"  # whole components only
    assert compute.local_path(config, "/elsewhere/a") == "/elsewhere/a"


def test_local_path_is_the_identity_without_a_compute_host(tmp_path):
    path = tmp_path / "c.yaml"
    path.write_text(f"training_console:\n  data_root: {tmp_path}\n", encoding="utf-8")
    config = load_config(path)
    assert compute.local_path(config, f"{EI_DATA}/a") == f"{EI_DATA}/a"
    assert compute.local_path(config, f"{tmp_path}/a") == f"{tmp_path}/a"


def test_a_mirrored_run_names_its_view_relative_to_data_root(mirror):
    _, config = mirror
    row = next(r for r in catalog.list_runs(config) if r["name"] == MODEL)
    assert row["view"] == "realman_right_arm_multitask_view"
    model = next(m for m in catalog.list_models(config)["models"] if m["name"] == MODEL)
    assert model["dataset"] == "realman_right_arm_multitask_view"
    # the web sends run.view back for an eval
    params = job_params.build("eval", {"config_name": MODEL.split("/")[0], "exp": MODEL.split("/")[1],
                                       "view": row["view"], "gpu": 0}, config)
    assert params["view"] == str((config.data_root / row["view"]).resolve())


def test_a_card_only_run_reads_its_dataset_dir_from_the_mirror(mirror):
    paths, config = mirror
    (paths["run"] / "console_train.json").unlink()
    row = next(r for r in catalog.list_runs(config) if r["name"] == MODEL)
    assert row["view"] == "realman_right_arm_multitask_view"


def test_the_served_model_s_dataset_and_lineage_are_found_in_the_mirror(mirror):
    _, config = mirror
    data = serve_dataset.model_dataset(config, MODEL)
    assert "error" not in data and data["view"] == "realman_right_arm_multitask_view"
    lineage = data["lineage"]
    assert [row["kind"] for row in lineage] == ["view", "clean", "raw"]
    assert lineage[1]["path"] == "realman__multitask_clean" and lineage[1]["removed_tasks"]
    assert lineage[2]["path"].startswith("raw_realman_ts_20261016")


def test_a_view_s_source_is_followed_in_the_mirror_for_tags(mirror):
    paths, config = mirror
    kind, source, _ = tags_step.kind_of(paths["view"], config)
    assert kind == "view" and source == paths["clean"]
    assert tags_step.raw_root(paths["view"], config) == paths["raw"].resolve()


def test_the_dataset_list_shows_mirrored_sources_locally(mirror):
    paths, config = mirror
    from realman_training.summary_cache import SummaryCache

    rows = {r["name"]: r for r in catalog.list_datasets(config, SummaryCache(config.quality))}
    assert rows["realman_right_arm_multitask_view"]["source"] == str(paths["clean"])
    assert rows["realman__multitask_clean"]["source"] == str(paths["raw"])


def test_a_mirrored_view_s_tasks_come_from_its_source_in_the_mirror(mirror, monkeypatch):
    from realman_training.steps import view as view_step

    paths, config = mirror
    read = []
    real = view_step.read_episodes
    monkeypatch.setattr(view_step, "read_episodes", lambda root: read.append(Path(root)) or real(root))
    view_step.episode_tasks(paths["view"], config)
    assert paths["clean"] in read


def test_a_mirrored_run_s_prompts_fall_back_to_its_view_contract(mirror):
    from realman_training.serving import model_prompts

    paths, config = mirror
    (paths["run"] / "model_card.json").unlink()
    assert model_prompts(paths["run"]) == {}
    assert set(model_prompts(paths["run"], config)) == {"pick_and_place", "pick_only"}
