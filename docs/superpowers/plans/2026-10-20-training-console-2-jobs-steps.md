# Training Console — Plan 2: background jobs and the pipeline steps

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every pipeline step after "inspect" (pull, clean, view, norm, train, eval, register) is a function `run(params, log)` in `realman_training.steps`, runs as a background job with its own directory (`params.json`, `status.json`, `log.txt`), and is reachable from `realman-train <step>`.

**Architecture:** `jobs.py` starts each step in a detached child process (`python -m realman_training _job-run <dir>`) that holds a per-kind `flock` for its whole life, so one job of a kind runs at a time and a crashed job frees its slot by itself; a restarted CLI or web server re-attaches to children that are still alive and marks dead ones `interrupted`. Steps talk to the outside world only through a `Runner` (subprocess wrapper) so the unit tests fake `ssh`, `docker` and `nvidia-smi`. `openpi.py` builds the `docker compose run` commands for the openpi repo on server5090 (same compose files and env recipe as the 10-14/10-16 runs). Plan 1's deferred review items are folded in first.

**Tech Stack:** Python 3.10, numpy, pyarrow, PyYAML, pytest, argparse, `fcntl`, `subprocess`. No ROS, no lerobot, no new dependencies.

Spec: `docs/superpowers/specs/2026-10-20-training-console-design.md` (delivery step 3). Plan 1: `docs/superpowers/plans/2026-10-20-training-console-1-data-inspect.md` (PR QingTianRobot/realman_pi#50, branch `feat/training-console`; this plan's branch `feat/training-console-jobs` is based on it). Plan 3 = `serving.py` + `linkcheck.py`; Plan 4 = web console + container. Left for Plan 4: the `.console/summary.json` cache and running the console itself in a container (all paths here are host paths on server5090).

**openpi feasibility (spec asked to confirm):** `scripts/compute_norm_stats.py` and `scripts/eval_open_loop.py` take only a config *name* (`_config.get_config(name)`), not tyro overrides, so `data.repo_id` / `exclude_episode_indices` cannot be overridden from the command line for norm and eval. Plan 2 therefore keeps "one openpi config per view": every step takes `config_name` + the view directory, mounts the view at `/datasets/lerobot_realman` (compose.realman.yaml) and reads the config's `repo_id`, asset id and holdout set from inside the container (`openpi_scripts/config_info.py`). `scripts/train.py` does accept overrides, so `--batch-size` and `--num-train-steps` are passed through.

## Global Constraints

- Python 3.10; `from __future__ import annotations` in every module of the package (not in `openpi_scripts/*.py`, which run inside the openpi container).
- Lint: `ruff check --config config/python/ruff.toml src tools scripts docker` must pass (CI).
- Tests: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test -p no:cacheprovider` (that is how CI runs the suite). Unit tests never call real `ssh`, `docker`, `nvidia-smi` or `git`: steps take a `runner` argument and tests pass `FakeRunner`.
- Config lives under repo-root `config/` (`config/training/`); none inside the package. `.env` holds only Docker candidate values.
- Never write private IPs, tokens or host secrets into code, config, docs or logs; hosts by ssh alias (`realman_local` from server5090, `server5090`, `realman_ts`).
- No data deletion: pull, clean and view write NEW directories and refuse an existing target. The only thing a step removes is its own unfinished `<target>.partial` directory created in the same job.
- Never call `./rm65 up/down/build`; never touch bringup/web/recording containers or the behaviour tree. The recording container is only read (`docker exec … tar|du|cat`).
- GPU containers use `runtime: nvidia` + `NVIDIA_VISIBLE_DEVICES`, never `gpus:` (stale CDI spec on server5090).
- Multi-GPU training env (verified on 2 and 4 GPUs, 2026-10-14/16): `NCCL_P2P_DISABLE=1 NCCL_SHM_DISABLE=1 NCCL_NET=Socket NCCL_CUMEM_ENABLE=0 XLA_FLAGS=--xla_gpu_enable_command_buffer= NCCL_ALGO=Ring NCCL_PROTO=Simple`; every GPU job also sets `XLA_PYTHON_CLIENT_PREALLOCATE=false`.
- A GPU is "held by someone else" when `nvidia-smi` reports more than `openpi.gpu_busy_mib` (2000) MiB used on it; train and eval refuse such GPUs.
- Base weights inside the container: `/home/openpi/.cache/openpi/openpi-assets/checkpoints/pi05_base_from_mac/params` (passed as `--weight-loader.params-path`; never re-download).
- Prompts must match policy_bridge verbatim: `pick_and_place` = `pick up the power adapter and put it in the blue bin`, `pick_only` = `pick up the power adapter`.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (exactly this model name).
- Docs are part of the feature: update `website/docs/development/training-console.md` and its sidebar title.
- Verification on server5090 may run pull, clean, view and every `--dry-run`; it must NOT start a real training run, a real eval on a GPU, or touch `openpi-serve`, without the user's explicit OK.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/training/realman_training/realman_training/lerobot_io.py` | (modify) read each data file once (`read_columns`), wrap missing columns, `video_files()` |
| `src/training/realman_training/realman_training/config.py` | (modify) strict list fields, `data_root: null`, config discovery from cwd, `state_dir`, `remote`, `openpi`, `prompts` sections |
| `src/training/realman_training/realman_training/quality.py` | (modify) use `read_columns`, guard zero-length episodes |
| `src/training/realman_training/realman_training/runner.py` | `Runner` (run/check/stream/pipe), `Completed`, `CommandFailed`, `compact()` |
| `src/training/realman_training/realman_training/jobs.py` | `JobStore`, `Job`, `StepLog`, `StepFailed`, `JobCancelled`, `JobConflict`, `run_job()` |
| `src/training/realman_training/realman_training/openpi.py` | `Compose` (docker compose run argv + env), `ConfigInfo`, `config_info()`, `busy_gpus()`, `parse_gpus()`, `train_env()`, `repo_commit()`, paths |
| `src/training/realman_training/realman_training/openpi_scripts/config_info.py` | runs in the openpi container: prints a config's repo_id, asset id, holdout, batch, steps |
| `src/training/realman_training/realman_training/openpi_scripts/prompt_swap.py` | runs in the openpi container: per-task MAE with every task's prompt |
| `src/training/realman_training/realman_training/steps/__init__.py` | package marker |
| `src/training/realman_training/realman_training/steps/clean.py` | drop_episodes.py logic: renumber, hard-link videos, aggregate stats, `<dst>.clean_manifest.json` |
| `src/training/realman_training/realman_training/steps/pull.py` | realman_ts recording → `raw_realman_ts_<datetime>/<dataset>` |
| `src/training/realman_training/realman_training/steps/view.py` | `make_realman_view.py --task-prompt` in the openpi image, then gripper-label checks |
| `src/training/realman_training/realman_training/steps/norm.py` | `opic-norm` for a config + view (skips when the stats exist) |
| `src/training/realman_training/realman_training/steps/train.py` | detached training container, GPU check, follow log, `metrics.csv`, `console_train.json` |
| `src/training/realman_training/realman_training/steps/eval.py` | per-task open-loop eval + prompt swap, `eval/summary.json` |
| `src/training/realman_training/realman_training/steps/register.py` | `model_card.json`, `MODEL_CARD.md`, row in `checkpoints/MODELS.md` |
| `src/training/realman_training/realman_training/cli.py` | (modify) subcommands pull/clean/view/norm/train/eval/register/jobs/job/cancel + hidden `_job-run` |
| `src/training/realman_training/setup.py` | (modify) ship `openpi_scripts/*.py` as package data |
| `src/training/realman_training/test/lerobot_fixture.py` | (modify) write `action.command_action`, per-episode `stats/*` columns, `meta/stats.json`, view gripper targets |
| `src/training/realman_training/test/fake_runner.py` | `FakeRunner`, `RecordingLog` for step tests |
| `src/training/realman_training/test/fake_steps.py` | job targets used by `test_jobs.py` |
| `src/training/realman_training/test/test_*.py` | one test file per new module |
| `config/training/training_console.yaml` | (modify) new sections |
| `config/training/openpi-console.compose.yaml` | compose overlay: `runtime: nvidia`, shm, `NVIDIA_VISIBLE_DEVICES=${CONSOLE_GPUS}` |
| `website/docs/development/training-console.md`, `config/website/vitepress.config.mts` | (modify) docs |

---

### Task 1: Plan 1 review leftovers — read each data file once, strict config, edge cases

**Files:**
- Modify: `src/training/realman_training/realman_training/lerobot_io.py`
- Modify: `src/training/realman_training/realman_training/quality.py`
- Modify: `src/training/realman_training/realman_training/config.py`
- Modify: `src/training/realman_training/test/lerobot_fixture.py`
- Test: `src/training/realman_training/test/test_lerobot_io.py`, `test/test_quality.py`, `test/test_config.py`

**Interfaces:**
- Produces: `lerobot_io.read_columns(root, columns) -> dict[int, dict[str, np.ndarray]]` (episode index → column → `(frames, width)` float64 array, in episode order); `lerobot_io.video_files(root) -> dict[int, list[Path]]`; `read_episode_columns` stays (now a thin wrapper). `config.default_config_path() -> Path`. `lerobot_fixture.build_dataset(...)` now also writes `action.command_action`, per-episode `stats/<feature>/<stat>` columns and `meta/stats.json`; `build_view(..., gripper_targets=None)` takes optional per-episode gripper-target lists.

- [ ] **Step 1: Write the failing tests**

Append to `test/test_lerobot_io.py`:

```python
import pyarrow as pa
import pyarrow.parquet as pq

from realman_training.lerobot_io import NotALeRobotDataset, read_columns, video_files


def test_read_columns_reads_a_shared_data_file_once_and_splits_it(tmp_path, monkeypatch):
    root = build_dataset(tmp_path / "raw", [Episode("a", gripper((50, 5), (6000, 5))), Episode("a", gripper((50, 7)))])
    # Put both episodes into one data file, as LeRobot does when files are not split per episode.
    first = pq.read_table(root / "data/chunk-000/file-000.parquet")
    second = pq.read_table(root / "data/chunk-000/file-001.parquet")
    pq.write_table(pa.concat_tables([first, second]), root / "data/chunk-000/file-000.parquet")
    (root / "data/chunk-000/file-001.parquet").unlink()
    meta = root / "meta/episodes/chunk-000/file-001.parquet"
    table = pq.read_table(meta)
    i = table.schema.get_field_index("data/file_index")
    pq.write_table(table.set_column(i, table.schema.field(i), pa.array([0], pa.int64())), meta)
    calls = []
    original = pq.read_table
    monkeypatch.setattr(pq, "read_table", lambda path, **kw: calls.append(str(path)) or original(path, **kw))
    columns = read_columns(root, ["observation.gripper_position"])
    assert [str(p).endswith("file-000.parquet") for p in calls if "/data/" in str(p)] == [True]
    assert list(columns) == [0, 1]
    assert columns[0]["observation.gripper_position"].shape == (10, 3)
    assert columns[1]["observation.gripper_position"][:, 2].tolist() == [50.0] * 7


def test_a_missing_column_is_not_a_lerobot_dataset(tmp_path):
    root = build_dataset(tmp_path / "raw", [Episode("a", gripper((50, 5)))])
    with pytest.raises(NotALeRobotDataset, match="observation.nope"):
        read_columns(root, ["observation.nope"])


def test_video_files_follow_the_video_path_template(tmp_path):
    root = build_dataset(tmp_path / "raw", [Episode("a", gripper((50, 5))), Episode("a", gripper((50, 5)))])
    files = video_files(root)
    assert sorted(files) == [0, 1]
    assert [p.relative_to(root).as_posix() for p in files[1]] == [
        "videos/observation.images.d435/chunk-000/file-001.mp4",
        "videos/observation.images.orbbec-right/chunk-000/file-001.mp4",
    ]
    assert all(p.is_file() for p in files[0] + files[1])


def test_the_fixture_writes_every_declared_column_and_per_episode_stats(tmp_path):
    root = build_dataset(tmp_path / "raw", [Episode("a", gripper((50, 5), (6000, 5)))])
    info = json.loads((root / "meta/info.json").read_text())
    table = pq.read_table(root / "data/chunk-000/file-000.parquet")
    declared = {k for k, v in info["features"].items() if v["dtype"] != "video"}
    assert declared <= set(table.column_names)
    row = pq.read_table(root / "meta/episodes/chunk-000/file-000.parquet").to_pylist()[0]
    assert row["stats/observation.gripper_position/max"] == [0.0, 0.0, 6000.0]
    assert row["stats/index/count"] == [10]
    assert json.loads((root / "meta/stats.json").read_text())["observation.gripper_position"]["max"] == [0.0, 0.0, 6000.0]
```

(Check the existing imports at the top of `test_lerobot_io.py`; add `json`, `pytest`, `Episode`, `build_dataset`, `gripper` there if they are missing.)

Append to `test/test_quality.py`:

```python
def test_a_zero_length_episode_is_dropped_without_crashing():
    findings = check_episode("pick_only", np.zeros(0), np.zeros((0, 6)), FPS, CONFIG)
    assert [f.code for f in findings] == ["empty"]


def test_a_one_frame_episode_is_judged():
    assert codes("pick_only", [50.0]) == {"never_closed"}


def test_an_all_closed_episode_starts_closed_and_never_releases():
    assert codes("pick_and_place", gripper((5700, 90))) == {"start_closed", "no_release"}
```

Append to `test/test_config.py` (and extend the parametrized list of `test_bad_values_name_the_key` with the two new cases shown):

```python
from realman_training.config import OpenpiConfig, RemoteConfig, default_config_path


def test_a_null_data_root_keeps_the_default(tmp_path):
    config = load_config(_write(tmp_path, "training_console:\n  data_root: null\n"))
    assert config.data_root == Path("~/data/realman").expanduser()


def test_the_config_is_found_from_the_working_directory(tmp_path, monkeypatch):
    target = tmp_path / "config" / "training" / "training_console.yaml"
    target.parent.mkdir(parents=True)
    target.write_text("training_console:\n  data_root: /from/cwd\n")
    (tmp_path / "deeper").mkdir()
    monkeypatch.delenv(ENV_CONFIG, raising=False)
    monkeypatch.chdir(tmp_path / "deeper")
    assert default_config_path().resolve() == target.resolve()
    assert load_config().data_root == Path("/from/cwd")


def test_new_sections_have_the_server5090_defaults(tmp_path):
    config = load_config(_write(tmp_path, "training_console: {}\n"))
    assert config.remote == RemoteConfig()
    assert config.remote.recording_root == "/data/realman-recordings/lerobot"
    assert config.openpi.compose_project == "openpi-console"
    assert config.openpi.gpu_busy_mib == 2000
    assert config.prompts["pick_only"] == "pick up the power adapter"
    assert config.console_dir == config.data_root / "_console"
    assert config.source == (tmp_path / "console.yaml").resolve()
    # a relative overlay path is resolved next to the config file
    assert config.openpi.compose_overlay == (tmp_path / "openpi-console.compose.yaml").resolve()


def test_openpi_values_from_the_file(tmp_path):
    config = load_config(
        _write(tmp_path, "training_console:\n  state_dir: /s\n  openpi:\n    repo: /o\n    gpu_busy_mib: 500\n")
    )
    assert config.openpi.repo == Path("/o") and config.openpi.gpu_busy_mib == 500
    assert config.console_dir == Path("/s")
    assert OpenpiConfig().num_workers == 6
```

New parametrized cases for `test_bad_values_name_the_key`:

```python
        ("training_console:\n  quality:\n    release_tasks: pick_and_place\n", "release_tasks"),
        ("training_console:\n  remote:\n    ssh: x\n", "ssh"),
        ("training_console:\n  prompts: [a]\n", "prompts"),
```

Replace `test_the_shipped_file_equals_the_reviewed_defaults` with:

```python
def test_the_shipped_file_equals_the_reviewed_defaults():
    config = load_config(DEFAULT_CONFIG)
    assert config.quality == QualityConfig()
    assert config.remote == RemoteConfig()
    assert dataclasses.replace(config.openpi, compose_overlay=None) == dataclasses.replace(
        OpenpiConfig(), compose_overlay=None
    )
    assert config.openpi.compose_overlay == DEFAULT_CONFIG.parent / "openpi-console.compose.yaml"
    assert config.data_root == Path("~/data/realman").expanduser()
    assert config.prompts == {
        "pick_and_place": "pick up the power adapter and put it in the blue bin",
        "pick_only": "pick up the power adapter",
    }
```

(add `import dataclasses` at the top of `test_config.py`).

- [ ] **Step 2: Run them to make sure they fail**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test -p no:cacheprovider`
Expected: FAIL — `ImportError: cannot import name 'read_columns'` / `OpenpiConfig` and the fixture assertions.

- [ ] **Step 3: Implement**

`lerobot_io.py` — add after `read_episodes` and replace `read_episode_columns`:

```python
import pyarrow as pa


def _matrix(column: pa.ChunkedArray, path: Path, name: str) -> np.ndarray:
    array = column.combine_chunks()
    rows = len(array)
    if pa.types.is_list(array.type) or pa.types.is_large_list(array.type) or pa.types.is_fixed_size_list(array.type):
        values = array.flatten().to_numpy(zero_copy_only=False).astype(np.float64)
        if rows == 0:
            return values.reshape(0, 0)
        if values.size % rows:
            raise NotALeRobotDataset(f"{path}: column {name} has rows of different lengths")
        return values.reshape(rows, -1)
    return array.to_numpy(zero_copy_only=False).astype(np.float64).reshape(rows, 1)


def read_columns(root: str | Path, columns: list[str]) -> dict[int, dict[str, np.ndarray]]:
    """Episode index -> column -> (frames, width) array. Every data file is read once."""
    episodes = read_episodes(root)
    by_file: dict[Path, list[EpisodeRow]] = {}
    for episode in episodes:
        by_file.setdefault(episode.data_file, []).append(episode)
    found: dict[int, dict[str, np.ndarray]] = {}
    for path, rows in by_file.items():
        try:
            table = pq.read_table(path, columns=[*columns, "episode_index"])
        except (KeyError, OSError, pa.ArrowInvalid) as error:
            raise NotALeRobotDataset(f"{path}: {error}") from None
        index = table.column("episode_index").to_numpy()
        matrices = {name: _matrix(table.column(name), path, name) for name in columns}
        for episode in rows:
            mask = index == episode.index
            if int(mask.sum()) != episode.length:
                raise NotALeRobotDataset(
                    f"{path}: episode {episode.index} has {int(mask.sum())} rows, metadata says {episode.length}"
                )
            found[episode.index] = {name: matrix[mask] for name, matrix in matrices.items()}
    return {episode.index: found[episode.index] for episode in episodes}


def read_episode_columns(episode: EpisodeRow, columns: list[str]) -> dict[str, np.ndarray]:
    try:
        table = pq.read_table(episode.data_file, columns=[*columns, "episode_index"])
    except (KeyError, OSError, pa.ArrowInvalid) as error:
        raise NotALeRobotDataset(f"{episode.data_file}: {error}") from None
    table = table.filter(pc.equal(table["episode_index"], episode.index))
    if table.num_rows != episode.length:
        raise NotALeRobotDataset(
            f"{episode.data_file}: episode {episode.index} has {table.num_rows} rows, metadata says {episode.length}"
        )
    return {name: _matrix(table.column(name), episode.data_file, name) for name in columns}


def video_files(root: str | Path) -> dict[int, list[Path]]:
    """Episode index -> its video files (one per camera), from the episode metadata and info.json video_path."""
    root = Path(root)
    info = read_info(root)
    template = info.get("video_path")
    keys = [name for name, feature in info.get("features", {}).items() if feature.get("dtype") == "video"]
    files: dict[int, list[Path]] = {}
    for path in sorted((root / "meta" / "episodes").glob("chunk-*/file-*.parquet")):
        for row in pq.read_table(path).to_pylist():
            files[int(row["episode_index"])] = [
                root
                / template.format(
                    video_key=key,
                    chunk_index=row[f"videos/{key}/chunk_index"],
                    file_index=row[f"videos/{key}/file_index"],
                )
                for key in keys
            ]
    return dict(sorted(files.items()))
```

Note: the old `read_episode_columns` returned 1-D arrays for scalar columns; `_matrix` returns `(rows, 1)` for scalars. `quality.py` only reads list columns, so nothing else changes.

`quality.py` — at the top of `check_episode` add:

```python
    if len(gripper) == 0:
        return (Finding("empty", "drop", "episode has no frames"),)
```

and in `inspect_dataset` replace the per-episode loop with one `read_columns` call:

```python
    columns = read_columns(root, [GRIPPER_COLUMN, JOINT_COLUMN])
    results = []
    for episode in read_episodes(root):
        data = columns[episode.index]
        gripper = data[GRIPPER_COLUMN][:, arm] if len(data[GRIPPER_COLUMN]) else np.zeros(0)
        joints = (
            np.degrees(data[JOINT_COLUMN][:, arm * 6 : arm * 6 + 6]) if len(data[JOINT_COLUMN]) else np.zeros((0, 6))
        )
        findings = check_episode(episode.task, gripper, joints, fps, config)
        results.append(EpisodeQuality(episode.index, episode.task, episode.length, _verdict(findings), findings))
    return results
```

(import `read_columns` instead of `read_episode_columns`). Add the `empty` row to the rules table in the docs in Task 12.

`config.py` — full replacement:

```python
"""Console configuration: config/training/training_console.yaml on top of built-in defaults."""

from __future__ import annotations

import dataclasses
import os
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).resolve().parents[4]
CONFIG_RELATIVE = Path("config") / "training" / "training_console.yaml"
DEFAULT_CONFIG = REPO_ROOT / CONFIG_RELATIVE
ENV_CONFIG = "REALMAN_TRAINING_CONFIG"
ARMS = ("l", "m", "r")
DEFAULT_PROMPTS = {
    "pick_and_place": "pick up the power adapter and put it in the blue bin",
    "pick_only": "pick up the power adapter",
}


@dataclasses.dataclass(frozen=True)
class QualityConfig:
    """Per-episode rules; the numbers come from the 2026-10-13 and 2026-10-16 manual cleanings."""

    arm: str = "r"
    gripper_open_raw: float = 50.0
    gripper_close_raw: float = 8500.0
    closed_threshold_raw: float = 4275.0  # halfway between open and closed
    start_closed_sec: float = 1.0
    glitch_max_frames: int = 2
    plateau_window_sec: float = 2.0  # 3 s missed raw 2026-10-16 #209 (slow creep, settled at 8448)
    empty_position_min: float = 8300.0
    start_partial_raw: float = 300.0
    release_tasks: tuple[str, ...] = ("pick_and_place",)
    start_pose_deg: tuple[float, ...] = (-9.89, 18.04, 79.08, 15.51, 79.60, -6.20)
    start_pose_tol_deg: float = 2.0


@dataclasses.dataclass(frozen=True)
class RemoteConfig:
    """The recording on realman_ts, reached from server5090 through its recording container."""

    ssh_host: str = "realman_local"
    recording_container: str = "realman_pi-realman_recording-1"
    recording_root: str = "/data/realman-recordings/lerobot"  # inside the container
    dataset: str = "realman__pi05-three-arm"
    connect_timeout_sec: int = 10
    lock_wait_sec: int = 120  # wait this long for the recorder's append lock


@dataclasses.dataclass(frozen=True)
class OpenpiConfig:
    """The openpi checkout and its docker data on server5090."""

    repo: Path = dataclasses.field(default_factory=lambda: Path("~/organization/openpi").expanduser())
    docker_data: Path = dataclasses.field(default_factory=lambda: Path("~/organization/openpi-docker-data").expanduser())
    image: str = "openpi:dev"
    compose_project: str = "openpi-console"
    compose_overlay: Path | None = None  # None = openpi-console.compose.yaml next to the config file
    weights: str = "/home/openpi/.cache/openpi/openpi-assets/checkpoints/pi05_base_from_mac/params"
    gpu_busy_mib: int = 2000
    num_workers: int = 6
    eval_stride: int = 10


@dataclasses.dataclass(frozen=True)
class ConsoleConfig:
    data_root: Path = dataclasses.field(default_factory=lambda: Path("~/data/realman").expanduser())
    state_dir: Path | None = None
    quality: QualityConfig = dataclasses.field(default_factory=QualityConfig)
    remote: RemoteConfig = dataclasses.field(default_factory=RemoteConfig)
    openpi: OpenpiConfig = dataclasses.field(default_factory=OpenpiConfig)
    prompts: dict[str, str] = dataclasses.field(default_factory=lambda: dict(DEFAULT_PROMPTS))
    source: Path | None = None

    @property
    def console_dir(self) -> Path:
        """Jobs and console state; under data_root by default (discover() skips names starting with _)."""
        return self.state_dir or self.data_root / "_console"


def default_config_path() -> Path:
    """$REALMAN_TRAINING_CONFIG, else config/training/training_console.yaml in the working directory or a parent,
    else the file in this source tree."""
    if os.environ.get(ENV_CONFIG):
        return Path(os.environ[ENV_CONFIG])
    for folder in (Path.cwd(), *Path.cwd().parents):
        if (folder / CONFIG_RELATIVE).is_file():
            return folder / CONFIG_RELATIVE
    return DEFAULT_CONFIG


def _path(value: object) -> Path:
    return Path(str(value)).expanduser()


def load_config(path: str | Path | None = None) -> ConsoleConfig:
    source = (Path(path) if path else default_config_path()).resolve()
    document = yaml.safe_load(source.read_text(encoding="utf-8")) or {}
    section = document.get("training_console") if isinstance(document, dict) else None
    if not isinstance(section, dict):
        raise ValueError(f"{source}: missing the training_console section")
    quality = _parse(QualityConfig, section.get("quality") or {}, source, "quality")
    _validate(quality, source)
    remote = _parse(RemoteConfig, section.get("remote") or {}, source, "remote")
    openpi = _parse(OpenpiConfig, section.get("openpi") or {}, source, "openpi")
    overlay = openpi.compose_overlay or Path("openpi-console.compose.yaml")
    openpi = dataclasses.replace(openpi, compose_overlay=overlay if overlay.is_absolute() else source.parent / overlay)
    prompts = section.get("prompts")
    if prompts is None:
        prompts = dict(DEFAULT_PROMPTS)
    if not isinstance(prompts, dict):
        raise ValueError(f"{source}: prompts must map task names to prompts")
    data_root = section.get("data_root")
    state_dir = section.get("state_dir")
    return ConsoleConfig(
        data_root=_path(data_root) if data_root is not None else ConsoleConfig().data_root,
        state_dir=_path(state_dir) if state_dir is not None else None,
        quality=quality,
        remote=remote,
        openpi=openpi,
        prompts={str(k): str(v) for k, v in prompts.items()},
        source=source,
    )


def _parse(cls, raw: object, source: Path, section: str):
    if not isinstance(raw, dict):
        raise ValueError(f"{source}: {section} must be a mapping")
    defaults = cls()
    fields = {field.name for field in dataclasses.fields(cls)}
    unknown = sorted(set(raw) - fields)
    if unknown:
        raise ValueError(f"{source}: unknown {section} keys {unknown}")
    values = {}
    for name, value in raw.items():
        default = getattr(defaults, name)
        try:
            if value is None:
                values[name] = default
            elif isinstance(default, tuple):
                if not isinstance(value, (list, tuple)):
                    raise ValueError(f"must be a list, got {value!r}")
                values[name] = tuple(type(default[0])(item) if default else item for item in value)
            elif isinstance(default, Path) or name == "compose_overlay":
                values[name] = _path(value)
            elif isinstance(default, bool):
                values[name] = bool(value)
            elif isinstance(default, int):
                values[name] = int(value)
            elif isinstance(default, float):
                values[name] = float(value)
            else:
                values[name] = str(value)
        except (TypeError, ValueError) as error:
            raise ValueError(f"{source}: {section}.{name}: {error}") from None
    return dataclasses.replace(defaults, **values)


def _validate(q: QualityConfig, source: Path) -> None:
    def fail(key: str, why: str) -> None:
        raise ValueError(f"{source}: quality.{key} {why}")

    if q.arm not in ARMS:
        fail("arm", f"must be one of {ARMS}")
    if not q.gripper_open_raw < q.closed_threshold_raw < q.gripper_close_raw:
        fail("closed_threshold_raw", "must lie between gripper_open_raw and gripper_close_raw")
    if not q.gripper_open_raw < q.empty_position_min <= q.gripper_close_raw:
        fail("empty_position_min", "must lie in (gripper_open_raw, gripper_close_raw]")
    if q.glitch_max_frames < 1:
        fail("glitch_max_frames", "must be at least 1")
    for key in ("start_closed_sec", "plateau_window_sec", "start_pose_tol_deg"):
        if getattr(q, key) <= 0:
            fail(key, "must be positive")
    if len(q.start_pose_deg) not in (0, 6):
        fail("start_pose_deg", "must list six joint angles or be empty")
```

`cli.py` currently calls `load_config(args.config)`; that still works. Check `grep -rn "DEFAULT_CONFIG\|load_config" src/training` and keep every caller working.

Append to `config/training/training_console.yaml` (inside `training_console:`; keep the existing keys):

```yaml
  # Jobs (one directory each) and other console state. null = <data_root>/_console.
  state_dir: null

  # Tasks -> prompts. Training views get these unless --task-prompt overrides them; they must equal
  # policy_bridge's prompt verbatim.
  prompts:
    pick_and_place: pick up the power adapter and put it in the blue bin
    pick_only: pick up the power adapter

  # The recording on realman_ts, pulled from server5090 (files are root 600 on the host, so through the
  # recording container). Hosts by ssh alias only.
  remote:
    ssh_host: realman_local
    recording_container: realman_pi-realman_recording-1
    recording_root: /data/realman-recordings/lerobot   # path inside the container
    dataset: realman__pi05-three-arm
    connect_timeout_sec: 10
    lock_wait_sec: 120              # the recorder holds .<dataset>.lock only while appending an episode

  # The openpi checkout and its docker data on server5090.
  openpi:
    repo: ~/organization/openpi
    docker_data: ~/organization/openpi-docker-data
    image: openpi:dev
    compose_project: openpi-console
    compose_overlay: openpi-console.compose.yaml   # relative = next to this file
    weights: /home/openpi/.cache/openpi/openpi-assets/checkpoints/pi05_base_from_mac/params
    gpu_busy_mib: 2000              # more than this used on a GPU = someone else holds it
    num_workers: 6
    eval_stride: 10
```

Create `config/training/openpi-console.compose.yaml`:

```yaml
# Overlay on the openpi repo's compose.yaml + compose.realman.yaml for the training console's
# `docker compose run` containers (norm, train, eval). GPUs via the legacy nvidia runtime: the host's
# CDI spec is stale, so `gpus:` fails for new containers. CONSOLE_GPUS is set by realman_training.
services:
  openpi:
    runtime: nvidia
    shm_size: 8gb
    environment:
      NVIDIA_VISIBLE_DEVICES: "${CONSOLE_GPUS:-none}"
      NVIDIA_DRIVER_CAPABILITIES: compute,utility
```

`test/lerobot_fixture.py` — in `build_dataset`, write the declared `action.command_action` column and per-episode stats. Add this helper above `build_dataset`:

```python
_QUANTILES = {"q01": 0.01, "q10": 0.10, "q50": 0.50, "q90": 0.90, "q99": 0.99}


def _stats(values: np.ndarray, integer: bool = False) -> dict[str, list]:
    """Per-episode stats the way the recorder stores them (lists, count as [n])."""
    values = values.reshape(len(values), -1).astype(np.float64)
    cast = (lambda a: [int(round(v)) for v in a]) if integer else (lambda a: [float(v) for v in a])
    out = {
        "min": cast(values.min(0)),
        "max": cast(values.max(0)),
        "mean": cast(values.mean(0)),
        "std": [float(v) for v in values.std(0)],
        "count": [len(values)],
    }
    out.update({name: cast(np.quantile(values, q, axis=0)) for name, q in _QUANTILES.items()})
    return out


def _aggregate_json(per_episode: list[dict[str, dict[str, list]]]) -> dict:
    """meta/stats.json for the fixture: exact min/max/mean/std/count, count-weighted quantiles."""
    out = {}
    for feature in per_episode[0]:
        count = np.array([e[feature]["count"][0] for e in per_episode], dtype=np.float64)
        total = count.sum()
        mean = np.array([e[feature]["mean"] for e in per_episode])
        std = np.array([e[feature]["std"] for e in per_episode])
        weight = count[:, None]
        grand = (mean * weight).sum(0) / total
        var = (weight * (std**2 + (mean - grand) ** 2)).sum(0) / total
        stats = {
            "min": np.array([e[feature]["min"] for e in per_episode]).min(0).tolist(),
            "max": np.array([e[feature]["max"] for e in per_episode]).max(0).tolist(),
            "mean": grand.tolist(),
            "std": np.sqrt(var).tolist(),
            "count": [int(total)],
        }
        for name in _QUANTILES:
            stats[name] = ((np.array([e[feature][name] for e in per_episode]) * weight).sum(0) / total).tolist()
        out[feature] = stats
    return out
```

In the episode loop of `build_dataset`, write `action.command_action` (zeros, 18 wide) and the stats:

```python
        command = np.zeros((n, 18))
        index = np.arange(start, start + n, dtype=np.int64)
        pq.write_table(
            pa.table(
                {
                    "observation.gripper_position": _list_column(grip),
                    "observation.joint_position": _list_column(joints),
                    "action.command_action": _list_column(command),
                    "episode_index": pa.array(np.full(n, i, np.int64)),
                    "index": pa.array(index),
                    "frame_index": pa.array(np.arange(n, dtype=np.int64)),
                    "task_index": pa.array(np.full(n, task_index[episode.task], np.int64)),
                    "timestamp": pa.array((np.arange(n) / FPS).astype(np.float32)),
                }
            ),
            root / "data" / "chunk-000" / f"file-{i:03d}.parquet",
        )
        stats = {
            "observation.gripper_position": _stats(grip.astype(np.float32)),
            "index": _stats(index, integer=True),
            "episode_index": _stats(np.full(n, i), integer=True),
        } if n else {}
        all_stats.append(stats)
        row = {
            "episode_index": i,
            "tasks": [episode.task],
            "length": n,
            "data/chunk_index": 0,
            "data/file_index": i,
            "dataset_from_index": start,
            "dataset_to_index": start + n,
            **{f"stats/{feature}/{name}": value for feature, block in stats.items() for name, value in block.items()},
        }
```

with `all_stats: list[dict] = []` before the loop and, after the loop:

```python
    kept = [s for s in all_stats if s]
    if kept:
        (root / "meta" / "stats.json").write_text(json.dumps(_aggregate_json(kept)))
```

Keep the existing `_write_videos(root, i, row)` and episode-metadata write after building `row`. A zero-length episode has no stats columns; tests that need one build it on its own.

Extend `build_view` with gripper targets (dimension 6 of `action`, 1 = open):

```python
def build_view(
    root: Path,
    *,
    source: str,
    prompts: dict[str, str],
    lengths: list[int],
    gripper_targets: list[list[float]] | None = None,
    tasks: list[str] | None = None,
) -> Path:
```

where `tasks` (optional) names each episode's task key in `prompts` (default: round-robin as today), and inside the loop:

```python
        task_name = tasks[i] if tasks else list(prompts)[i % len(prompts)]
        task = names.index(prompts[task_name])
        action = np.zeros((n, 7))
        if gripper_targets is not None:
            action[:, 6] = gripper_targets[i]
```

writing `"action": _list_column(action)`.

- [ ] **Step 4: Run the whole suite**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test -p no:cacheprovider`
Expected: all pass (the opt-in real-data test skips off server5090).

- [ ] **Step 5: Lint and commit**

```bash
ruff check --config config/python/ruff.toml src/training
git add src/training config/training
git commit -m "fix(training): read each data file once, strict config lists, console config sections

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Runner — the one door to subprocesses

**Files:**
- Create: `src/training/realman_training/realman_training/runner.py`
- Create: `src/training/realman_training/test/fake_runner.py`
- Test: `src/training/realman_training/test/test_runner.py`

**Interfaces:**
- Produces: `Completed(returncode: int, stdout: str, stderr: str)`; `CommandFailed(argv, returncode, output)` (RuntimeError, message names the command and the output tail); `Runner.run(argv, *, input=None, env=None, timeout=None) -> Completed`; `Runner.check(argv, **same) -> str` (stdout, raises CommandFailed); `Runner.stream(argv, on_line, *, input=None, env=None) -> int` (stdout+stderr merged, one call per line); `Runner.pipe(producer, consumer, on_bytes, *, chunk_size=1<<20) -> int` (bytes copied; raises CommandFailed for the side that failed); `compact(line) -> str` (last `\r` segment, for tqdm). `env` entries are added to `os.environ`.
- Test helpers: `FakeRunner(Runner)` with `.on(match, *, stdout="", returncode=0, lines=(), action=None) -> FakeRunner` (`stdout` may be a callable `(argv, input) -> str`), `.calls`, `.inputs`, `.envs`, `.pipe_impl`, `.commands(needle)`; `RecordingLog` with `.lines`, `.progress_calls`, callable + `.progress(done, total=None, text="")`.

- [ ] **Step 1: Write the failing tests** — `test/test_runner.py`:

```python
from __future__ import annotations

import sys

import pytest

from realman_training.runner import CommandFailed, Runner, compact

PY = sys.executable


def test_run_and_check_capture_output():
    runner = Runner()
    done = runner.run([PY, "-c", "import sys; print('out'); print('err', file=sys.stderr); sys.exit(3)"])
    assert (done.returncode, done.stdout.strip(), done.stderr.strip()) == (3, "out", "err")
    assert runner.check([PY, "-c", "print('ok')"]).strip() == "ok"
    with pytest.raises(CommandFailed, match="exited 3.*err"):
        runner.check([PY, "-c", "import sys; print('err', file=sys.stderr); sys.exit(3)"])


def test_env_is_added_to_the_inherited_environment():
    out = Runner().check([PY, "-c", "import os; print(os.environ['RT_X'], 'PATH' in os.environ)"], env={"RT_X": "1"})
    assert out.split() == ["1", "True"]


def test_stream_merges_stderr_and_feeds_stdin():
    lines = []
    code = Runner().stream(
        [PY, "-c", "import sys; print(sys.stdin.read().upper()); print('e', file=sys.stderr)"], lines.append, input="hi"
    )
    assert code == 0 and sorted(lines) == ["HI", "e"]


def test_pipe_counts_bytes_and_reports_the_failing_side(tmp_path):
    seen = []
    target = tmp_path / "copy"
    n = Runner().pipe([PY, "-c", "print('x' * 9999)"], [PY, "-c", f"import sys; open({str(target)!r}, 'w').write(sys.stdin.read())"], seen.append, chunk_size=1000)
    assert n == 10000 and seen[-1] == 10000 and len(seen) >= 10
    assert target.read_text() == "x" * 9999 + "\n"
    with pytest.raises(CommandFailed, match="exited 2"):
        Runner().pipe([PY, "-c", "import sys; sys.exit(2)"], [PY, "-c", "import sys; sys.stdin.read()"], seen.append)
    with pytest.raises(CommandFailed, match="exited 4"):
        Runner().pipe([PY, "-c", "print('x')"], [PY, "-c", "import sys; sys.exit(4)"], seen.append)


def test_compact_keeps_the_last_progress_segment():
    assert compact("a 1%\rb 50%\rc 100%") == "c 100%"
    assert compact("plain") == "plain"
```

- [ ] **Step 2: Run to see it fail**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_runner.py -p no:cacheprovider`
Expected: FAIL — `ModuleNotFoundError: realman_training.runner`.

- [ ] **Step 3: Implement `realman_training/runner.py`**

```python
"""The one place that starts host commands (ssh, docker, nvidia-smi, git), so tests can fake them."""

from __future__ import annotations

import dataclasses
import os
import shlex
import subprocess
from typing import Callable, Sequence


@dataclasses.dataclass(frozen=True)
class Completed:
    returncode: int
    stdout: str
    stderr: str


class CommandFailed(RuntimeError):
    def __init__(self, argv: Sequence[str], returncode: int, output: str):
        tail = "\n".join(output.strip().splitlines()[-15:])
        super().__init__(f"{shlex.join(list(argv))[:300]} exited {returncode}: {tail}")
        self.argv, self.returncode, self.output = list(argv), returncode, output


def compact(line: str) -> str:
    """tqdm redraws with \\r: keep the last state only."""
    return line.rsplit("\r", 1)[-1]


def _env(extra: dict[str, str] | None) -> dict[str, str] | None:
    return None if not extra else {**os.environ, **extra}


class Runner:
    def run(self, argv, *, input: str | None = None, env=None, timeout: float | None = None) -> Completed:
        done = subprocess.run(
            list(argv), input=input, capture_output=True, text=True, env=_env(env), timeout=timeout,
            stdin=None if input is not None else subprocess.DEVNULL,
        )
        return Completed(done.returncode, done.stdout, done.stderr)

    def check(self, argv, **kwargs) -> str:
        done = self.run(argv, **kwargs)
        if done.returncode:
            raise CommandFailed(argv, done.returncode, done.stderr or done.stdout)
        return done.stdout

    def stream(self, argv, on_line: Callable[[str], None], *, input: str | None = None, env=None) -> int:
        proc = subprocess.Popen(
            list(argv),
            stdin=subprocess.PIPE if input is not None else subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            errors="replace",
            env=_env(env),
        )
        try:
            if input is not None:
                proc.stdin.write(input)
                proc.stdin.close()
            for line in proc.stdout:
                on_line(line.rstrip("\n"))
            return proc.wait()
        finally:
            if proc.poll() is None:
                proc.terminate()
                proc.wait(10)

    def pipe(self, producer, consumer, on_bytes: Callable[[int], None], *, chunk_size: int = 1 << 20) -> int:
        """producer | consumer through this process, so the bytes in flight can be counted."""
        prod = subprocess.Popen(list(producer), stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        cons = subprocess.Popen(list(consumer), stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
        total = 0
        try:
            while chunk := prod.stdout.read(chunk_size):
                try:
                    cons.stdin.write(chunk)
                except BrokenPipeError:
                    break
                total += len(chunk)
                on_bytes(total)
            try:
                cons.stdin.close()
            except BrokenPipeError:
                pass
            cons_code = cons.wait()
            if cons_code:
                prod.kill()
                prod.wait()
                raise CommandFailed(consumer, cons_code, cons.stderr.read().decode(errors="replace"))
            prod_code = prod.wait()
            if prod_code:
                raise CommandFailed(producer, prod_code, prod.stderr.read().decode(errors="replace"))
            return total
        finally:
            for proc in (prod, cons):
                if proc.poll() is None:
                    proc.kill()
                    proc.wait()
```

(Ruff does not format; keep the long `subprocess.run(...)` call split across lines as shown or one argument per line.)

Create `test/fake_runner.py`:

```python
"""A Runner that records commands and answers from rules, and a log that records lines and progress."""

from __future__ import annotations

from realman_training.runner import Completed, Runner


class FakeRunner(Runner):
    def __init__(self):
        self.calls: list[list[str]] = []
        self.inputs: list[str | None] = []
        self.envs: list[dict | None] = []
        self._rules: list[tuple] = []
        self.pipe_impl = None

    def on(self, match: str, *, stdout: str = "", returncode: int = 0, lines=(), action=None) -> FakeRunner:
        """First rule whose `match` is a substring of the joined argv answers; action(argv, input) runs first.
        stdout may be a callable (argv, input) -> str for answers that change between calls."""
        self._rules.append((match, stdout, returncode, tuple(lines), action))
        return self

    def _answer(self, argv, input, env):
        argv = [str(a) for a in argv]
        self.calls.append(argv)
        self.inputs.append(input)
        self.envs.append(env)
        text = " ".join(argv)
        for match, stdout, returncode, lines, action in self._rules:
            if match in text:
                if action is not None:
                    action(argv, input)
                if callable(stdout):
                    stdout = stdout(argv, input)
                return stdout, returncode, lines
        return "", 0, ()

    def run(self, argv, *, input=None, env=None, timeout=None) -> Completed:
        stdout, returncode, _ = self._answer(argv, input, env)
        return Completed(returncode, stdout, "" if returncode == 0 else stdout)

    def stream(self, argv, on_line, *, input=None, env=None) -> int:
        stdout, returncode, lines = self._answer(argv, input, env)
        for line in lines or stdout.splitlines():
            on_line(line)
        return returncode

    def pipe(self, producer, consumer, on_bytes, *, chunk_size=1 << 20) -> int:
        self.calls.append(["PIPE", *map(str, producer), "|", *map(str, consumer)])
        return self.pipe_impl([str(a) for a in producer], [str(a) for a in consumer], on_bytes)

    def commands(self, needle: str) -> list[list[str]]:
        return [call for call in self.calls if needle in " ".join(call)]


class RecordingLog:
    def __init__(self):
        self.lines: list[str] = []
        self.progress_calls: list[tuple] = []

    def __call__(self, message: str) -> None:
        self.lines.append(message)

    def progress(self, done: float, total: float | None = None, text: str = "") -> None:
        self.progress_calls.append((done, total, text))

    def text(self) -> str:
        return "\n".join(self.lines)
```

- [ ] **Step 4: Run the tests**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_runner.py -p no:cacheprovider`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
ruff check --config config/python/ruff.toml src/training
git add src/training/realman_training
git commit -m "feat(training): Runner wraps every host command so steps can be tested with fakes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Background jobs

**Files:**
- Create: `src/training/realman_training/realman_training/jobs.py`
- Modify: `src/training/realman_training/realman_training/__main__.py` (only if it does not already call `cli.main()` with `sys.argv`)
- Create: `src/training/realman_training/test/fake_steps.py`
- Test: `src/training/realman_training/test/test_jobs.py`

**Interfaces:**
- Consumes: nothing from earlier tasks except the package layout.
- Produces:
  - `STEPS: dict[str, str]` kind → `"module:function"` for `pull, clean, view, norm, train, eval, register`.
  - `class StepFailed(RuntimeError)` — expected failure, shown without traceback. `class JobCancelled(BaseException)` — raised inside the step on SIGTERM/SIGINT. `class JobConflict(RuntimeError)`.
  - `class StepLog` — `__call__(message)`, `progress(done, total=None, text="")`.
  - `class Job` — `id`, `kind`, `dir`, `.status() -> dict`, `.params() -> dict`, `.log_text(tail_lines=None) -> str`.
  - `class JobStore(root: Path, *, env: dict | None = None)` — `start(kind, params, *, target=None) -> Job`, `get(job_id) -> Job`, `list(kind=None, limit=None) -> list[Job]` (newest first), `running(kind) -> Job | None`, `cancel(job_id) -> bool`, `recover() -> list[str]` (ids marked interrupted), `wait(job_id, on_line, poll=0.3) -> dict` (final status).
  - `run_job(folder: Path) -> int` — the child side (`python -m realman_training _job-run <dir>`).
  - status.json keys: `id, kind, state` (`starting|running|succeeded|failed|cancelled|interrupted`), `created, started, ended, pid, proc_start, progress {done,total,text,at}, result, error`.
  - Every step function has the signature `run(params: dict, log: StepLog, runner: Runner | None = None) -> dict` (JSON-serializable).

- [ ] **Step 1: Write the fake steps and the failing tests**

`test/fake_steps.py`:

```python
"""Job targets for test_jobs.py (imported by the job child through PYTHONPATH)."""

from __future__ import annotations

import time
from pathlib import Path

from realman_training.jobs import StepFailed


def ok(params, log):
    log("hello")
    log.progress(1, 2, "half way")
    return {"echo": params}


def fail(params, log):
    raise StepFailed("nope, and here is why")


def crash(params, log):
    raise ZeroDivisionError("boom")


def sleep(params, log):
    log("sleeping")
    Path(params["flag"]).write_text("started")
    time.sleep(params.get("seconds", 30))
    return {}
```

`test/test_jobs.py`:

```python
from __future__ import annotations

import json
import os
import signal
import subprocess
import sys
import time
from pathlib import Path

import pytest

from realman_training.jobs import JobConflict, JobStore

TEST_DIR = Path(__file__).resolve().parent


@pytest.fixture()
def store(tmp_path):
    return JobStore(tmp_path / "console", env={"PYTHONPATH": str(TEST_DIR)})


def wait_for(path: Path, timeout=10.0):
    end = time.time() + timeout
    while not path.exists():
        assert time.time() < end, f"{path} never appeared"
        time.sleep(0.05)


def test_a_job_runs_in_the_background_and_records_everything(store):
    job = store.start("pull", {"a": 1}, target="fake_steps:ok")
    status = store.wait(job.id, lambda line: None)
    assert status["state"] == "succeeded"
    assert status["result"] == {"echo": {"a": 1}}
    assert status["progress"]["text"] == "half way"
    assert "hello" in job.log_text()
    assert job.params() == {"kind": "pull", "target": "fake_steps:ok", "params": {"a": 1}}
    assert {p.name for p in job.dir.iterdir()} >= {"params.json", "status.json", "log.txt"}


def test_wait_streams_the_log_lines(store):
    lines = []
    job = store.start("pull", {}, target="fake_steps:ok")
    store.wait(job.id, lines.append)
    assert any(line.endswith("hello") for line in lines)


def test_an_expected_failure_and_a_crash_are_failed_with_the_reason(store):
    failed = store.wait(store.start("clean", {}, target="fake_steps:fail").id, lambda line: None)
    assert failed["state"] == "failed" and failed["error"] == "nope, and here is why"
    crashed = store.wait(store.start("clean", {}, target="fake_steps:crash").id, lambda line: None)
    assert crashed["state"] == "failed" and "ZeroDivisionError: boom" in crashed["error"]
    assert "Traceback" in store.get(crashed["id"]).log_text()


def test_one_job_of_a_kind_at_a_time(store, tmp_path):
    first = store.start("train", {"flag": str(tmp_path / "f1")}, target="fake_steps:sleep")
    wait_for(tmp_path / "f1")
    with pytest.raises(JobConflict, match=first.id):
        store.start("train", {"flag": str(tmp_path / "f2")}, target="fake_steps:sleep")
    other = store.start("pull", {}, target="fake_steps:ok")  # another kind is fine
    assert store.wait(other.id, lambda line: None)["state"] == "succeeded"
    assert store.cancel(first.id)
    assert store.wait(first.id, lambda line: None)["state"] == "cancelled"
    again = store.start("train", {"flag": str(tmp_path / "f3")}, target="fake_steps:sleep")
    store.cancel(again.id)
    store.wait(again.id, lambda line: None)


def test_a_restarted_store_reattaches_a_live_job(store, tmp_path):
    job = store.start("train", {"flag": str(tmp_path / "f")}, target="fake_steps:sleep")
    wait_for(tmp_path / "f")
    fresh = JobStore(store.root)
    assert fresh.recover() == []
    assert fresh.running("train").id == job.id
    fresh.cancel(job.id)
    assert fresh.wait(job.id, lambda line: None)["state"] == "cancelled"


def test_a_killed_job_is_marked_interrupted_and_frees_its_kind(store, tmp_path):
    job = store.start("train", {"flag": str(tmp_path / "f")}, target="fake_steps:sleep")
    wait_for(tmp_path / "f")
    os.killpg(job.status()["pid"], signal.SIGKILL)
    deadline = time.time() + 10
    while time.time() < deadline:
        try:
            os.kill(job.status()["pid"], 0)
        except ProcessLookupError:
            break
        store.list()  # reaps finished children
        time.sleep(0.05)
    assert JobStore(store.root).recover() == [job.id]
    status = job.status()
    assert status["state"] == "interrupted" and status["ended"]
    assert store.running("train") is None
    ok = store.start("train", {}, target="fake_steps:ok")
    assert store.wait(ok.id, lambda line: None)["state"] == "succeeded"


def test_a_job_whose_starter_died_before_spawning_is_interrupted(store):
    folder = store.root / "jobs" / "20261020-000000-pull-dead"
    folder.mkdir(parents=True)
    (folder / "status.json").write_text(json.dumps({"id": folder.name, "kind": "pull", "state": "starting", "pid": None}))
    (folder / "params.json").write_text(json.dumps({"kind": "pull", "target": "x:y", "params": {}}))
    assert store.recover() == [folder.name]


def test_a_recorded_pid_that_was_reused_is_not_the_job(store):
    proc = subprocess.Popen([sys.executable, "-c", "import time; time.sleep(30)"])
    try:
        folder = store.root / "jobs" / "20261020-000001-pull-reuse"
        folder.mkdir(parents=True)
        status = {"id": folder.name, "kind": "pull", "state": "running", "pid": proc.pid, "proc_start": "1"}
        (folder / "status.json").write_text(json.dumps(status))
        (folder / "params.json").write_text(json.dumps({"kind": "pull", "target": "x:y", "params": {}}))
        expected = [folder.name] if Path("/proc").is_dir() else []  # macOS has no /proc start time to compare
        assert store.recover() == expected
    finally:
        proc.kill()
        proc.wait()


def test_list_is_newest_first_and_filters_by_kind(store):
    a = store.start("pull", {}, target="fake_steps:ok")
    store.wait(a.id, lambda line: None)
    time.sleep(1.1)
    b = store.start("clean", {}, target="fake_steps:ok")
    store.wait(b.id, lambda line: None)
    assert [j.id for j in store.list()][:2] == [b.id, a.id]
    assert [j.id for j in store.list(kind="pull")] == [a.id]
    assert store.list(limit=1)[0].id == b.id


def test_unknown_kinds_are_refused(store):
    with pytest.raises(KeyError):
        store.start("format_disk", {})
```

- [ ] **Step 2: Run to see it fail**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_jobs.py -p no:cacheprovider`
Expected: FAIL — `ModuleNotFoundError: realman_training.jobs`.

- [ ] **Step 3: Implement `realman_training/jobs.py`**

```python
"""Background jobs: one directory per job (params.json, status.json, log.txt), one running job per kind.

The child process (`python -m realman_training _job-run <dir>`) holds an flock on locks/<kind>.lock for its whole
life, so a second job of the same kind is refused and a crashed child frees the slot by itself. The child writes
its own status; after a restart, active jobs whose process is gone are marked interrupted.
"""

from __future__ import annotations

import datetime
import fcntl
import importlib
import json
import os
import secrets
import signal
import subprocess
import sys
import time
import traceback
from pathlib import Path
from typing import Callable

STEPS = {
    kind: f"realman_training.steps.{kind}:run"
    for kind in ("pull", "clean", "view", "norm", "train", "eval", "register")
}
ACTIVE = ("starting", "running")
FINAL = ("succeeded", "failed", "cancelled", "interrupted")
PACKAGE_PARENT = str(Path(__file__).resolve().parents[1])


class StepFailed(RuntimeError):
    """A step's expected failure (refused target, busy GPU, bad labels): shown without a traceback."""


class JobCancelled(BaseException):
    """Raised inside the step when the job is cancelled; steps catch it only to clean up, then re-raise."""


class JobConflict(RuntimeError):
    pass


def now() -> str:
    return datetime.datetime.now().astimezone().isoformat(timespec="seconds")


def write_json(path: Path, data: dict) -> None:
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    os.replace(tmp, path)


def _read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def _proc_stat(pid: int) -> list[str] | None:
    try:
        return Path(f"/proc/{pid}/stat").read_text().rsplit(")", 1)[1].split()
    except OSError:
        return None


def process_start(pid: int) -> str | None:
    """Kernel start time of a process (Linux), so a reused pid is not mistaken for the job."""
    fields = _proc_stat(pid)
    return fields[19] if fields else None


def _alive(pid: int, start: str | None) -> bool:
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    except PermissionError:
        pass
    fields = _proc_stat(pid)
    if fields is None:
        return True  # no /proc (macOS): trust the pid
    return fields[0] != "Z" and (start is None or fields[19] == start)


class StepLog:
    def __init__(self, write_line: Callable[[str], None], set_progress: Callable[[float, float | None, str], None]):
        self._write_line, self._set_progress = write_line, set_progress

    def __call__(self, message: str) -> None:
        self._write_line(message)

    def progress(self, done: float, total: float | None = None, text: str = "") -> None:
        self._set_progress(done, total, text)


class Job:
    def __init__(self, folder: Path):
        self.dir = Path(folder)
        self.id = self.dir.name

    @property
    def kind(self) -> str:
        return self.status().get("kind", "")

    def status(self) -> dict:
        return _read_json(self.dir / "status.json")

    def params(self) -> dict:
        return _read_json(self.dir / "params.json")

    def log_text(self, tail_lines: int | None = None) -> str:
        path = self.dir / "log.txt"
        text = path.read_text(encoding="utf-8", errors="replace") if path.exists() else ""
        return "\n".join(text.splitlines()[-tail_lines:]) if tail_lines else text


class JobStore:
    def __init__(self, root: str | Path, *, env: dict[str, str] | None = None):
        self.root = Path(root)
        (self.root / "jobs").mkdir(parents=True, exist_ok=True)
        (self.root / "locks").mkdir(parents=True, exist_ok=True)
        self._env = env or {}
        self._children: list[subprocess.Popen] = []

    def _lock_path(self, kind: str) -> Path:
        return self.root / "locks" / f"{kind}.lock"

    def _child_env(self) -> dict[str, str]:
        env = {**os.environ, **self._env}
        env["PYTHONPATH"] = os.pathsep.join(p for p in (PACKAGE_PARENT, env.get("PYTHONPATH", "")) if p)
        return env

    def start(self, kind: str, params: dict, *, target: str | None = None) -> Job:
        target = target or STEPS[kind]
        fd = os.open(self._lock_path(kind), os.O_CREAT | os.O_RDWR, 0o644)
        try:
            try:
                fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
            except BlockingIOError:
                running = self.running(kind)
                raise JobConflict(
                    f"a {kind} job is already running: {running.id if running else '(starting)'}"
                ) from None
            job_id = f"{datetime.datetime.now():%Y%m%d-%H%M%S}-{kind}-{secrets.token_hex(2)}"
            folder = self.root / "jobs" / job_id
            folder.mkdir()
            write_json(folder / "params.json", {"kind": kind, "target": target, "params": params})
            write_json(
                folder / "status.json",
                {"id": job_id, "kind": kind, "state": "starting", "created": now(), "pid": None},
            )
            with open(folder / "log.txt", "ab") as log:
                proc = subprocess.Popen(
                    [sys.executable, "-m", "realman_training", "_job-run", str(folder)],
                    stdin=subprocess.DEVNULL,
                    stdout=log,
                    stderr=subprocess.STDOUT,
                    start_new_session=True,
                    pass_fds=(fd,),
                    env=self._child_env(),
                )
            self._children.append(proc)
            return Job(folder)
        finally:
            os.close(fd)  # the child keeps its inherited copy, and with it the lock

    def _reap(self) -> None:
        self._children = [proc for proc in self._children if proc.poll() is None]

    def get(self, job_id: str) -> Job:
        folder = self.root / "jobs" / job_id
        if not (folder / "status.json").is_file():
            raise KeyError(f"no job {job_id}")
        return Job(folder)

    def list(self, kind: str | None = None, limit: int | None = None) -> list[Job]:
        self._reap()
        jobs = [Job(p) for p in sorted((self.root / "jobs").iterdir(), reverse=True) if (p / "status.json").is_file()]
        if kind:
            jobs = [j for j in jobs if j.status().get("kind") == kind]
        return jobs[:limit] if limit else jobs

    def _dead(self, status: dict) -> bool:
        if status.get("state") not in ACTIVE:
            return False
        pid = status.get("pid")
        if pid:
            return not _alive(int(pid), status.get("proc_start"))
        fd = os.open(self._lock_path(status["kind"]), os.O_CREAT | os.O_RDWR, 0o644)
        try:
            fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
            return True  # nobody holds the kind's lock: the starter died before the child ran
        except BlockingIOError:
            return False
        finally:
            os.close(fd)

    def running(self, kind: str) -> Job | None:
        for job in self.list(kind=kind):
            status = job.status()
            if status.get("state") in ACTIVE and not self._dead(status):
                return job
        return None

    def recover(self) -> list[str]:
        interrupted = []
        for job in self.list():
            status = job.status()
            if self._dead(status):
                status.update(state="interrupted", ended=now(), error="the job process ended without a final status")
                write_json(job.dir / "status.json", status)
                interrupted.append(job.id)
        return interrupted

    def cancel(self, job_id: str) -> bool:
        status = self.get(job_id).status()
        if status.get("state") not in ACTIVE or not status.get("pid") or self._dead(status):
            return False
        try:
            os.killpg(int(status["pid"]), signal.SIGTERM)
        except ProcessLookupError:
            return False
        return True

    def wait(self, job_id: str, on_line: Callable[[str], None], poll: float = 0.3) -> dict:
        job = self.get(job_id)
        offset = 0
        pending = b""
        while True:
            status = job.status()
            path = job.dir / "log.txt"
            if path.exists():
                with path.open("rb") as handle:
                    handle.seek(offset)
                    chunk = handle.read()
                offset += len(chunk)
                pending += chunk
                *complete, pending = pending.split(b"\n")
                for line in complete:
                    on_line(line.decode(errors="replace"))
            if status.get("state") in FINAL:
                if pending:
                    on_line(pending.decode(errors="replace"))
                return status
            if self._dead(status):
                self.recover()
                continue
            self._reap()
            time.sleep(poll)


def run_job(folder: str | Path) -> int:
    folder = Path(folder)
    status_path = folder / "status.json"
    spec = _read_json(folder / "params.json")
    status = _read_json(status_path)
    status.update(state="running", pid=os.getpid(), proc_start=process_start(os.getpid()), started=now())
    write_json(status_path, status)

    def on_signal(signum, frame):
        raise JobCancelled()

    signal.signal(signal.SIGTERM, on_signal)
    signal.signal(signal.SIGINT, on_signal)

    def line(message: str) -> None:
        print(f"{datetime.datetime.now():%H:%M:%S} {message}", flush=True)

    def progress(done: float, total: float | None, text: str) -> None:
        status["progress"] = {"done": done, "total": total, "text": text, "at": now()}
        write_json(status_path, status)

    try:
        module, function = spec["target"].split(":")
        step = getattr(importlib.import_module(module), function)
        status.update(state="succeeded", result=step(spec["params"], StepLog(line, progress)))
    except JobCancelled:
        line("cancelled")
        status.update(state="cancelled", error="cancelled")
    except StepFailed as error:
        line(f"FAILED: {error}")
        status.update(state="failed", error=str(error))
    except Exception as error:  # noqa: BLE001 - every crash must end as a failed status
        traceback.print_exc()
        sys.stdout.flush()
        status.update(state="failed", error=f"{type(error).__name__}: {error}")
    status["ended"] = now()
    write_json(status_path, status)
    return 0 if status["state"] == "succeeded" else 1
```

Wire the hidden subcommand: in `cli.py` `main()`, before building the parser, add:

```python
    argv = sys.argv[1:] if argv is None else argv
    if argv[:1] == ["_job-run"]:
        from .jobs import run_job

        return run_job(argv[1])
```

and pass `argv` to `parser.parse_args(argv)`. Check `__main__.py` calls `raise SystemExit(main())`; if it does not, make it.

- [ ] **Step 4: Run the tests**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_jobs.py -p no:cacheprovider`
Expected: PASS (about 10 s; the jobs are real child processes).

- [ ] **Step 5: Commit**

```bash
ruff check --config config/python/ruff.toml src/training
git add src/training/realman_training
git commit -m "feat(training): background jobs with per-kind locks, re-attach and interrupted status

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: `steps/clean.py` — drop episodes into a new, renumbered dataset

Port of server5090 `~/data/realman/drop_episodes.py` (used for the 10-13 and 10-16 cleanings), generalised to the cameras and path templates in `info.json`.

**Files:**
- Create: `src/training/realman_training/realman_training/steps/__init__.py` (docstring only: `"""Pipeline steps: each module exposes run(params, log, runner=None) -> dict."""`)
- Create: `src/training/realman_training/realman_training/steps/clean.py`
- Test: `src/training/realman_training/test/test_clean.py`

**Interfaces:**
- Consumes: `lerobot_io.read_info`, `datasets.summarize`, `quality.inspect_dataset`, `config.load_config`, `jobs.StepFailed`.
- Produces: `clean.run(params, log, runner=None) -> dict` with params `src` (dataset dir), `dst` (new dir), exactly one of `drop: list[int]` / `keep: list[int]`, optional `reasons: dict[str, str]`, `config`. Result `{"dst", "manifest", "kept_episodes", "kept_frames", "removed": {episode: reason}}`. `clean.aggregate(per_episode) -> dict`, `clean.episode_stats(row) -> dict`, `clean.verify_stats(src) -> dict[str, float]` (worst relative difference per statistic vs `meta/stats.json`). `clean.default_dst(data_root, src) -> Path` = `<data_root>/<src.name>_clean_<YYYYmmdd_HHMMSS>`.

- [ ] **Step 1: Write the failing tests** — `test/test_clean.py`:

```python
from __future__ import annotations

import json
import os
from pathlib import Path

import pyarrow.parquet as pq
import pytest
from fake_runner import RecordingLog
from lerobot_fixture import Episode, build_dataset, gripper

from realman_training.datasets import summarize
from realman_training.jobs import StepFailed
from realman_training.lerobot_io import read_episodes, video_files
from realman_training.quality import inspect_dataset
from realman_training.config import QualityConfig
from realman_training.steps import clean


@pytest.fixture()
def raw(tmp_path):
    good = gripper((50, 40), (5700, 60), (50, 40))
    episodes = [
        Episode("pick_and_place", good),
        Episode("pick_and_place", gripper((5700, 40), (50, 100))),  # starts closed -> suggested drop
        Episode("pick_only", gripper((50, 40), (5700, 50))),
        Episode("pick_only", gripper((50, 40), (8450, 50))),  # closed on nothing -> suggested drop
        Episode("pick_and_place", good),
    ]
    root = build_dataset(tmp_path / "raw_realman_ts_20261020_101500" / "realman__pi05-three-arm", episodes)
    (root.parent / "pull.json").write_text(json.dumps({"origin": "realman_local:rec:/data/x"}))
    return root


def test_drop_renumbers_hard_links_and_writes_the_manifest(raw, tmp_path):
    dst = tmp_path / "clean"
    log = RecordingLog()
    result = clean.run({"src": str(raw), "dst": str(dst), "drop": [1, 3], "reasons": {"1": "starts closed"}}, log)
    assert result["kept_episodes"] == 3
    rows = read_episodes(dst)
    assert [r.index for r in rows] == [0, 1, 2]
    assert [r.task for r in rows] == ["pick_and_place", "pick_only", "pick_and_place"]
    assert [(r.from_index, r.to_index) for r in rows] == [(0, 140), (140, 230), (230, 370)]
    table = pq.read_table(dst / "data/chunk-000/file-001.parquet")
    assert set(table.column("episode_index").to_pylist()) == {1}
    assert table.column("index").to_pylist() == list(range(140, 230))
    old, new = video_files(raw), video_files(dst)
    assert os.stat(new[1][0]).st_ino == os.stat(old[2][0]).st_ino  # hard link, no copy
    manifest = json.loads(Path(f"{dst}.clean_manifest.json").read_text())
    assert manifest["old_to_new"] == {"0": 0, "2": 1, "4": 2}
    assert manifest["removed"]["1"] == {"frames": 140, "reason": "starts closed"}
    assert "closed plateau" in manifest["removed"]["3"]["reason"]  # missing reasons come from the quality rules
    assert manifest["source"] == str(raw) and manifest["origin"] == "realman_local:rec:/data/x"
    assert (manifest["kept_episodes"], manifest["kept_frames"]) == (3, 370)
    info = json.loads((dst / "meta/info.json").read_text())
    assert (info["total_episodes"], info["total_frames"], info["splits"]) == (3, 370, {"train": "0:3"})
    summary = summarize(dst)
    assert summary.kind == "clean" and summary.removed_episodes == 2
    assert [q.verdict for q in inspect_dataset(dst, QualityConfig())] == ["ok", "ok", "ok"]


def test_stats_are_reaggregated_and_index_stats_shifted(raw, tmp_path):
    dst = tmp_path / "clean"
    clean.run({"src": str(raw), "dst": str(dst), "drop": [0]}, RecordingLog())
    stats = json.loads((dst / "meta/stats.json").read_text())
    assert stats["index"]["min"] == [0] and stats["index"]["max"] == [summarize(dst).frames - 1]
    assert stats["episode_index"]["max"] == [3]
    assert stats["observation.gripper_position"]["count"] == [summarize(dst).frames]
    worst = clean.verify_stats(dst)
    assert max(worst[s] for s in ("min", "max", "mean", "std", "count")) < 1e-6


def test_verify_stats_reproduces_the_recorders_stats(raw):
    worst = clean.verify_stats(raw)
    assert max(worst[s] for s in ("min", "max", "mean", "std", "count")) < 1e-6


def test_keep_is_the_complement_of_drop(raw, tmp_path):
    result = clean.run({"src": str(raw), "dst": str(tmp_path / "sub"), "keep": [0, 2]}, RecordingLog())
    assert result["kept_episodes"] == 2 and sorted(result["removed"]) == ["1", "3", "4"]


@pytest.mark.parametrize(
    "params, fragment",
    [
        ({"drop": []}, "nothing to drop"),
        ({"drop": [9]}, "not in the dataset"),
        ({"keep": []}, "keep at least one"),
        ({"drop": [1], "keep": [0]}, "either drop or keep"),
    ],
)
def test_bad_selections_are_refused(raw, tmp_path, params, fragment):
    with pytest.raises(StepFailed, match=fragment):
        clean.run({"src": str(raw), "dst": str(tmp_path / "x"), **params}, RecordingLog())
    assert not (tmp_path / "x").exists() and not (tmp_path / "x.partial").exists()


def test_an_existing_target_is_refused_and_left_alone(raw, tmp_path):
    (tmp_path / "x").mkdir()
    (tmp_path / "x" / "keep.txt").write_text("mine")
    with pytest.raises(StepFailed, match="exists"):
        clean.run({"src": str(raw), "dst": str(tmp_path / "x"), "drop": [1]}, RecordingLog())
    assert (tmp_path / "x" / "keep.txt").read_text() == "mine"


def test_a_failure_halfway_removes_only_the_partial_target(raw, tmp_path, monkeypatch):
    def broken_link(src, dst):
        raise OSError(18, "Invalid cross-device link")

    monkeypatch.setattr(os, "link", broken_link)
    with pytest.raises(StepFailed, match="same filesystem"):
        clean.run({"src": str(raw), "dst": str(tmp_path / "x"), "drop": [1]}, RecordingLog())
    assert not (tmp_path / "x.partial").exists() and summarize(raw).episodes == 5


def test_default_dst_is_under_data_root(tmp_path):
    dst = clean.default_dst(tmp_path, tmp_path / "raw_x" / "realman__pi05-three-arm")
    assert dst.parent == tmp_path and dst.name.startswith("realman__pi05-three-arm_clean_")
```

- [ ] **Step 2: Run to see it fail**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_clean.py -p no:cacheprovider`
Expected: FAIL — `ModuleNotFoundError: realman_training.steps`.

- [ ] **Step 3: Implement `steps/clean.py`**

```python
"""Remove episodes from a LeRobot v3 recording into a NEW, renumbered dataset (the source is never touched).

Port of server5090 ~/data/realman/drop_episodes.py (2026-10-13/16 cleanings): one parquet per episode is rewritten
with new episode_index/index, videos are hard-linked, per-episode stats are re-aggregated the way LeRobot does,
and <dst>.clean_manifest.json records what was removed, why, and the old -> new numbering.
"""

from __future__ import annotations

import datetime
import errno
import json
import os
import shutil
from pathlib import Path

import numpy as np
import pyarrow as pa
import pyarrow.parquet as pq

from ..config import load_config
from ..jobs import StepFailed
from ..lerobot_io import NotALeRobotDataset, read_info
from ..quality import QualityUnavailable, inspect_dataset

QUANTILES = ("q01", "q10", "q50", "q90", "q99")


def default_dst(data_root: str | Path, src: str | Path) -> Path:
    return Path(data_root).expanduser() / f"{Path(src).name}_clean_{datetime.datetime.now():%Y%m%d_%H%M%S}"


def _rows(root: Path) -> list[tuple[pa.Schema, dict]]:
    rows = []
    for path in sorted((root / "meta" / "episodes").glob("chunk-*/file-*.parquet")):
        table = pq.read_table(path)
        if table.num_rows != 1:
            raise NotALeRobotDataset(f"{path}: expected one episode per metadata file, found {table.num_rows}")
        rows.append((table.schema, table.to_pylist()[0]))
    rows.sort(key=lambda item: item[1]["episode_index"])
    return rows


def episode_stats(row: dict) -> dict[str, dict[str, np.ndarray]]:
    out: dict[str, dict[str, np.ndarray]] = {}
    for key, value in row.items():
        if key.startswith("stats/"):
            _, feature, stat = key.split("/")
            out.setdefault(feature, {})[stat] = np.asarray(value, dtype=np.float64)
    return out


def aggregate(per_episode: list[dict]) -> dict[str, dict[str, np.ndarray]]:
    """LeRobot aggregate_stats: exact min/max/mean/std/count, count-weighted quantiles."""
    out = {}
    for feature in per_episode[0]:
        count = np.stack([e[feature]["count"] for e in per_episode])
        mean = np.stack([e[feature]["mean"] for e in per_episode])
        std = np.stack([e[feature]["std"] for e in per_episode])
        weight = count.reshape((len(per_episode),) + (1,) * (mean.ndim - 1))
        total = count.sum()
        grand = (mean * weight).sum(0) / total
        variance = (weight * (std**2 + (mean - grand) ** 2)).sum(0) / total
        stats = {
            "min": np.stack([e[feature]["min"] for e in per_episode]).min(0),
            "max": np.stack([e[feature]["max"] for e in per_episode]).max(0),
            "mean": grand,
            "std": np.sqrt(variance),
            "count": np.array([total]),
        }
        for q in QUANTILES:
            if q in per_episode[0][feature]:
                stats[q] = (np.stack([e[feature][q] for e in per_episode]) * weight).sum(0) / total
        out[feature] = stats
    return out


def _to_json(stats: dict, like: dict | None) -> dict:
    result = {}
    for feature, block in stats.items():
        result[feature] = {}
        for stat, value in block.items():
            ref = (like or {}).get(feature, {}).get(stat)
            integer = ref is not None and np.asarray(ref).dtype.kind in "iu"
            result[feature][stat] = (np.rint(value).astype(np.int64) if integer else value).tolist()
    return result


def verify_stats(src: str | Path) -> dict[str, float]:
    """Worst relative difference per statistic between re-aggregated per-episode stats and meta/stats.json."""
    src = Path(src)
    old = json.loads((src / "meta" / "stats.json").read_text(encoding="utf-8"))
    worst: dict[str, float] = {}
    for feature, block in aggregate([episode_stats(row) for _, row in _rows(src)]).items():
        for stat, value in block.items():
            ref = np.asarray(old[feature][stat], dtype=np.float64)
            diff = float(np.max(np.abs(value - ref) / (np.abs(ref) + 1e-9))) if ref.size else 0.0
            worst[stat] = max(worst.get(stat, 0.0), diff)
    return worst


def _selection(params: dict, indices: list[int]) -> set[int]:
    if "drop" in params and "keep" in params:
        raise StepFailed("pass either drop or keep, not both")
    known = set(indices)
    if "keep" in params:
        keep = {int(e) for e in params["keep"]}
        if not keep:
            raise StepFailed("keep at least one episode")
        unknown = keep - known
        if unknown:
            raise StepFailed(f"episodes {sorted(unknown)} are not in the dataset")
        return known - keep
    drop = {int(e) for e in params.get("drop") or []}
    if not drop:
        raise StepFailed("nothing to drop: pass drop (or keep) episodes")
    unknown = drop - known
    if unknown:
        raise StepFailed(f"episodes {sorted(unknown)} are not in the dataset (0..{max(known)})")
    if drop == known:
        raise StepFailed("that drops every episode")
    return drop


def _reasons(params: dict, src: Path, drop: set[int], log) -> dict[int, str]:
    given = {int(k): str(v) for k, v in (params.get("reasons") or {}).items()}
    missing = drop - set(given)
    if missing:
        try:
            quality = {q.episode: q for q in inspect_dataset(src, load_config(params.get("config")).quality)}
        except QualityUnavailable as error:
            log(f"no quality reasons: {error}")
            quality = {}
        for episode in missing:
            q = quality.get(episode)
            found = [f.message for f in q.findings if f.severity == "drop"] if q else []
            given[episode] = "; ".join(found) or "dropped by hand"
    return {e: given[e] for e in sorted(drop)}


def run(params: dict, log, runner=None) -> dict:
    src = Path(params["src"]).expanduser().resolve()
    dst = Path(params["dst"]).expanduser().absolute()
    manifest_path = Path(f"{dst}.clean_manifest.json")
    partial = dst.with_name(dst.name + ".partial")
    for path in (dst, manifest_path, partial):
        if path.exists():
            raise StepFailed(f"refusing: {path} exists (clean never overwrites)")
    info = read_info(src)
    rows = _rows(src)
    indices = [row["episode_index"] for _, row in rows]
    if indices != list(range(info["total_episodes"])):
        raise StepFailed("episode indices must be 0..total_episodes-1")
    drop = _selection(params, indices)
    reasons = _reasons(params, src, drop, log)
    cameras = [k for k, f in info["features"].items() if f.get("dtype") == "video"]
    chunk_size = int(info.get("chunks_size", 1000))
    data_tpl, video_tpl = info["data_path"], info.get("video_path")
    log(f"{src.name}: keeping {len(rows) - len(drop)} of {len(rows)} episodes, dropping {sorted(drop)}")

    partial.mkdir(parents=True)
    try:
        mapping, new_rows, position = {}, [], 0
        kept = [(schema, row) for schema, row in rows if row["episode_index"] not in drop]
        for new_index, (schema, row) in enumerate(kept):
            old_index, length = row["episode_index"], row["length"]
            mapping[old_index] = new_index
            chunk, file = divmod(new_index, chunk_size)
            source = src / data_tpl.format(chunk_index=row["data/chunk_index"], file_index=row["data/file_index"])
            table = pq.read_table(source)
            if table.num_rows != length or set(table.column("episode_index").to_pylist()) != {old_index}:
                raise StepFailed(f"{source}: expected one data file per episode ({old_index}, {length} rows)")
            for name, values in (
                ("episode_index", np.full(length, new_index, np.int64)),
                ("index", np.arange(position, position + length, dtype=np.int64)),
            ):
                i = table.schema.get_field_index(name)
                table = table.set_column(i, table.schema.field(i), pa.array(values))
            target = partial / data_tpl.format(chunk_index=chunk, file_index=file)
            target.parent.mkdir(parents=True, exist_ok=True)
            pq.write_table(table, target, compression="snappy")
            for key in cameras:
                old_video = src / video_tpl.format(
                    video_key=key, chunk_index=row[f"videos/{key}/chunk_index"], file_index=row[f"videos/{key}/file_index"]
                )
                new_video = partial / video_tpl.format(video_key=key, chunk_index=chunk, file_index=file)
                new_video.parent.mkdir(parents=True, exist_ok=True)
                try:
                    os.link(old_video, new_video)
                except OSError as error:
                    if error.errno == errno.EXDEV:
                        raise StepFailed(f"videos are hard-linked: {dst} must be on the same filesystem as {src}") from None
                    raise
            new = dict(row)
            delta = position - row["dataset_from_index"]
            new.update(
                {
                    "episode_index": new_index,
                    "dataset_from_index": position,
                    "dataset_to_index": position + length,
                    "data/chunk_index": chunk,
                    "data/file_index": file,
                }
            )
            if "meta/episodes/chunk_index" in new:
                new.update({"meta/episodes/chunk_index": chunk, "meta/episodes/file_index": file})
            for key in cameras:
                new[f"videos/{key}/chunk_index"], new[f"videos/{key}/file_index"] = chunk, file
            for stat in ("min", "max", "mean", *QUANTILES):  # translation is exact for the index stats
                if f"stats/index/{stat}" in row:
                    new[f"stats/index/{stat}"] = [type(v)(v + delta) for v in row[f"stats/index/{stat}"]]
                if f"stats/episode_index/{stat}" in row:
                    new[f"stats/episode_index/{stat}"] = [type(v)(new_index) for v in row[f"stats/episode_index/{stat}"]]
            meta = partial / "meta" / "episodes" / f"chunk-{chunk:03d}" / f"file-{file:03d}.parquet"
            meta.parent.mkdir(parents=True, exist_ok=True)
            pq.write_table(pa.Table.from_pylist([new], schema=schema), meta, compression="snappy")
            new_rows.append(new)
            position += length
            log.progress(new_index + 1, len(kept), f"episode {old_index} -> {new_index}")

        new_info = {**info, "total_episodes": len(kept), "total_frames": position, "splits": {"train": f"0:{len(kept)}"}}
        (partial / "meta" / "info.json").write_text(json.dumps(new_info, indent=4), encoding="utf-8")
        shutil.copy2(src / "meta" / "tasks.parquet", partial / "meta" / "tasks.parquet")
        old_stats_path = src / "meta" / "stats.json"
        per_episode = [episode_stats(row) for row in new_rows]
        if old_stats_path.is_file() and per_episode and per_episode[0]:
            old_stats = json.loads(old_stats_path.read_text(encoding="utf-8"))
            (partial / "meta" / "stats.json").write_text(
                json.dumps(_to_json(aggregate(per_episode), old_stats), indent=4), encoding="utf-8"
            )
        os.replace(partial, dst)
    except BaseException:
        shutil.rmtree(partial, ignore_errors=True)
        raise

    pull = src.parent / "pull.json"
    lengths = {row["episode_index"]: row["length"] for _, row in rows}
    manifest = {
        "created": datetime.datetime.now().isoformat(timespec="seconds"),
        "source": str(src),
        "origin": json.loads(pull.read_text(encoding="utf-8")).get("origin") if pull.is_file() else None,
        "source_episodes_at_copy": info["total_episodes"],
        "source_frames_at_copy": info["total_frames"],
        "kept_episodes": len(mapping),
        "kept_frames": position,
        "removed": {str(e): {"frames": lengths[e], "reason": r} for e, r in reasons.items()},
        "old_to_new": {str(k): v for k, v in mapping.items()},
        "note": "Episode indices were renumbered. Do not rsync from the source into this directory.",
    }
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    log(f"built {dst}: {len(mapping)} episodes, {position} frames (removed {len(drop)})")
    return {
        "dst": str(dst),
        "manifest": str(manifest_path),
        "kept_episodes": len(mapping),
        "kept_frames": position,
        "removed": {str(e): r for e, r in reasons.items()},
    }
```

Check: `datasets._manifest` already reads `<dir>.clean_manifest.json` and its `source`/`removed`; `summarize(dst).kind == "clean"` follows.

- [ ] **Step 4: Run the tests**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_clean.py -p no:cacheprovider`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
ruff check --config config/python/ruff.toml src/training
git add src/training/realman_training
git commit -m "feat(training): clean step builds a renumbered, hard-linked dataset with a manifest

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: `steps/pull.py` — copy the recording from realman_ts

The files are root 600 on realman_ts, so everything goes through `docker exec` in the recording container (server5090 `ssh realman_local`, LAN ~3 MB/s, ~3.8 GB on 2026-10-16). The recorder holds `/data/realman-recordings/lerobot/.<dataset>.lock` (`fcntl.LOCK_EX`, `lerobot_dataset_store.py`) only while appending an episode, so `meta` and `data` are copied under a shared lock (`flock -s`) and the videos afterwards without it: videos of finished episodes are never rewritten, and a video of an episode appended meanwhile is simply not referenced by the copied metadata.

**Files:**
- Create: `src/training/realman_training/realman_training/steps/pull.py`
- Test: `src/training/realman_training/test/test_pull.py`

**Interfaces:**
- Consumes: `Runner.check/pipe`, `config.RemoteConfig`, `datasets.summarize`, `lerobot_io.video_files`, `jobs.StepFailed`.
- Produces: `pull.run(params, log, runner=None) -> dict`, params `target` (new dir, e.g. `<data_root>/raw_realman_ts_20261020_101500`), optional `dataset`, `config`. Result `{"target", "dataset_dir", "episodes", "frames", "bytes", "origin"}`. Writes `<target>/pull.json` = `{origin, pulled_at, episodes, frames, bytes}`. `pull.default_target(data_root) -> Path`. `pull.remote(remote_config, argv) -> list[str]` (ssh argv running `docker exec <container> argv…`).

- [ ] **Step 1: Write the failing tests** — `test/test_pull.py`:

```python
from __future__ import annotations

import json
import shlex
import subprocess

import pytest
from fake_runner import FakeRunner, RecordingLog
from lerobot_fixture import Episode, build_dataset, gripper

from realman_training.config import RemoteConfig
from realman_training.datasets import summarize
from realman_training.jobs import StepFailed
from realman_training.runner import CommandFailed
from realman_training.steps import pull

REMOTE = RemoteConfig()
SOURCE = f"{REMOTE.recording_root}/{REMOTE.dataset}"


@pytest.fixture()
def recording(tmp_path):
    root = build_dataset(
        tmp_path / "remote" / REMOTE.dataset,
        [Episode("pick_and_place", gripper((50, 30), (5700, 30), (50, 30))), Episode("pick_only", gripper((50, 40)))],
    )
    (root / "images").mkdir()
    return root


def fake_remote(recording, *, drop_video=False):
    """Answers the remote du/cat and runs the remote tar locally against the fixture."""
    runner = FakeRunner()
    size = sum(p.stat().st_size for p in recording.rglob("*") if p.is_file())
    runner.on("du -sb", stdout=f"{size}\t{SOURCE}\n")
    runner.on("cat", stdout=(recording / "meta/info.json").read_text())

    def pipe_impl(producer, consumer, on_bytes):
        assert producer[:2] == ["ssh", "-o"] and REMOTE.ssh_host in producer
        remote = shlex.split(producer[-1])
        assert remote[:3] == ["docker", "exec", REMOTE.recording_container]
        argv = remote[3:]
        if argv[0] == "flock":
            assert argv[1:5] == ["-s", "-w", str(REMOTE.lock_wait_sec), f"{REMOTE.recording_root}/.{REMOTE.dataset}.lock"]
            argv = argv[5:]
        argv = [str(recording) if a == SOURCE else a for a in argv]
        if drop_video and "--exclude=./meta" in argv:
            argv = [*argv[:-1], "--exclude=*file-001.mp4", argv[-1]]
        data = subprocess.run(argv, capture_output=True, check=True).stdout
        subprocess.run(consumer, input=data, check=True)
        on_bytes(len(data))
        return len(data)

    runner.pipe_impl = pipe_impl
    return runner


def test_pull_copies_meta_and_data_under_the_lock_then_the_videos(recording, tmp_path):
    target = tmp_path / "data" / "raw_realman_ts_20261020_101500"
    log = RecordingLog()
    result = pull.run({"target": str(target)}, log, runner=fake_remote(recording))
    dataset = target / REMOTE.dataset
    assert result["dataset_dir"] == str(dataset) and result["episodes"] == 2
    assert summarize(dataset).episodes == 2
    record = json.loads((target / "pull.json").read_text())
    assert record["origin"] == f"{REMOTE.ssh_host}:{REMOTE.recording_container}:{SOURCE}"
    assert record["episodes"] == 2 and record["bytes"] > 0
    assert not (tmp_path / "data" / "raw_realman_ts_20261020_101500.partial").exists()
    assert log.progress_calls and log.progress_calls[-1][1] > 0


def test_the_lock_only_covers_meta_and_data(recording, tmp_path):
    runner = fake_remote(recording)
    pull.run({"target": str(tmp_path / "t")}, RecordingLog(), runner=runner)
    pipes = runner.commands("PIPE")
    assert len(pipes) == 2
    assert "flock -s" in " ".join(pipes[0])
    assert "meta data" in " ".join(pipes[0]) and "flock" not in " ".join(pipes[1])


def test_an_existing_target_is_refused_before_any_remote_call(recording, tmp_path):
    (tmp_path / "t").mkdir()
    runner = fake_remote(recording)
    with pytest.raises(StepFailed, match="exists"):
        pull.run({"target": str(tmp_path / "t")}, RecordingLog(), runner=runner)
    assert runner.calls == []


def test_a_leftover_partial_is_refused(recording, tmp_path):
    (tmp_path / "t.partial").mkdir()
    with pytest.raises(StepFailed, match="did not finish"):
        pull.run({"target": str(tmp_path / "t")}, RecordingLog(), runner=fake_remote(recording))


def test_a_missing_video_fails_and_removes_the_partial_copy(recording, tmp_path):
    with pytest.raises(StepFailed, match="missing video"):
        pull.run({"target": str(tmp_path / "t")}, RecordingLog(), runner=fake_remote(recording, drop_video=True))
    assert not (tmp_path / "t").exists() and not (tmp_path / "t.partial").exists()


def test_an_unreachable_robot_says_so(tmp_path):
    runner = FakeRunner().on("du -sb", returncode=255, stdout="ssh: connect to host realman_local: timed out")
    with pytest.raises(StepFailed, match="realman_local"):
        pull.run({"target": str(tmp_path / "t")}, RecordingLog(), runner=runner)
    assert not (tmp_path / "t.partial").exists()


def test_remote_quotes_the_inner_command():
    argv = pull.remote(REMOTE, ["tar", "-C", "/a b", "-cf", "-", "meta"])
    assert argv[:2] == ["ssh", "-o"] and "BatchMode=yes" in argv
    assert shlex.split(argv[-1]) == ["docker", "exec", REMOTE.recording_container, "tar", "-C", "/a b", "-cf", "-", "meta"]


def test_default_target_name(tmp_path):
    assert pull.default_target(tmp_path).name.startswith("raw_realman_ts_")


def test_commandfailed_is_importable():
    assert issubclass(CommandFailed, RuntimeError)
```

- [ ] **Step 2: Run to see it fail**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_pull.py -p no:cacheprovider`
Expected: FAIL — `ImportError: cannot import name 'pull'`.

- [ ] **Step 3: Implement `steps/pull.py`**

```python
"""Copy the LeRobot recording from realman_ts into a new raw_realman_ts_<datetime>/<dataset> directory.

The recording files are root 600 on the host, so the copy runs `tar` inside the recording container over
`ssh <alias>`. meta/ and data/ are copied under a shared flock on the recorder's append lock; the videos follow
without it (finished episodes' videos are never rewritten). An existing target is refused: re-pulling into a
cleaned directory corrupted the numbering once (README of 2026-10-13).
"""

from __future__ import annotations

import datetime
import json
import shlex
import shutil
from pathlib import Path

from ..config import RemoteConfig, load_config
from ..datasets import summarize
from ..jobs import StepFailed
from ..lerobot_io import NotALeRobotDataset, video_files
from ..runner import CommandFailed, Runner


def default_target(data_root: str | Path) -> Path:
    return Path(data_root).expanduser() / f"raw_realman_ts_{datetime.datetime.now():%Y%m%d_%H%M%S}"


def remote(config: RemoteConfig, argv: list[str]) -> list[str]:
    return [
        "ssh",
        "-o",
        "BatchMode=yes",
        "-o",
        f"ConnectTimeout={config.connect_timeout_sec}",
        config.ssh_host,
        shlex.join(["docker", "exec", config.recording_container, *argv]),
    ]


def run(params: dict, log, runner: Runner | None = None) -> dict:
    runner = runner or Runner()
    config = load_config(params.get("config")).remote
    dataset = params.get("dataset") or config.dataset
    target = Path(params["target"]).expanduser().absolute()
    partial = target.with_name(target.name + ".partial")
    if target.exists():
        raise StepFailed(f"refusing: {target} exists (pull never overwrites)")
    if partial.exists():
        raise StepFailed(f"{partial} exists: an earlier pull did not finish; look at it and remove it by hand")
    source = f"{config.recording_root}/{dataset}"
    lock = f"{config.recording_root}/.{dataset}.lock"
    origin = f"{config.ssh_host}:{config.recording_container}:{source}"
    try:
        size = int(runner.check(remote(config, ["du", "-sb", source])).split()[0])
        info = json.loads(runner.check(remote(config, ["cat", f"{source}/meta/info.json"])))
    except (CommandFailed, ValueError, IndexError) as error:
        raise StepFailed(f"cannot read {origin}: {error}") from None
    log(f"{origin}: {info.get('total_episodes')} episodes, {info.get('total_frames')} frames, {size / 2**30:.2f} GiB")

    dest = partial / dataset
    dest.mkdir(parents=True)
    try:
        copied = 0

        def progress(base: int):
            return lambda n: log.progress(base + n, size, f"{(base + n) / 2**20:.0f} / {size / 2**20:.0f} MiB")

        log(f"meta + data under a shared lock on {lock}")
        flock = ["flock", "-s", "-w", str(config.lock_wait_sec), lock]
        extract = ["tar", "-C", str(dest), "-xf", "-"]
        copied += runner.pipe(remote(config, [*flock, "tar", "-C", source, "-cf", "-", "meta", "data"]), extract, progress(0))
        log("videos and the rest")
        rest = ["tar", "-C", source, "-cf", "-", "--exclude=./meta", "--exclude=./data", "."]
        copied += runner.pipe(remote(config, rest), extract, progress(copied))

        try:
            summary = summarize(dest)
            missing = [str(p.relative_to(dest)) for files in video_files(dest).values() for p in files if not p.is_file()]
        except NotALeRobotDataset as error:
            raise StepFailed(f"the copy is not a valid dataset: {error}") from None
        if missing:
            raise StepFailed(f"{len(missing)} missing video file(s) after the copy, e.g. {missing[:3]}")
        record = {
            "origin": origin,
            "pulled_at": datetime.datetime.now().astimezone().isoformat(timespec="seconds"),
            "episodes": summary.episodes,
            "frames": summary.frames,
            "bytes": copied,
        }
        (partial / "pull.json").write_text(json.dumps(record, indent=2), encoding="utf-8")
        partial.rename(target)
    except CommandFailed as error:
        shutil.rmtree(partial, ignore_errors=True)
        raise StepFailed(f"copy from {origin} failed: {error}") from None
    except BaseException:
        shutil.rmtree(partial, ignore_errors=True)
        raise
    log(f"pulled {summary.episodes} episodes ({copied / 2**20:.0f} MiB) into {target / dataset}")
    return {
        "target": str(target),
        "dataset_dir": str(target / dataset),
        "episodes": summary.episodes,
        "frames": summary.frames,
        "bytes": copied,
        "origin": origin,
    }
```

- [ ] **Step 4: Run the tests**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_pull.py -p no:cacheprovider`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
ruff check --config config/python/ruff.toml src/training
git add src/training/realman_training
git commit -m "feat(training): pull step copies the realman_ts recording through the recording container

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: `openpi.py` — compose commands, config facts, GPUs

**Files:**
- Create: `src/training/realman_training/realman_training/openpi.py`
- Create: `src/training/realman_training/realman_training/openpi_scripts/config_info.py`
- Modify: `src/training/realman_training/setup.py`
- Test: `src/training/realman_training/test/test_openpi.py`

**Interfaces:**
- Consumes: `config.OpenpiConfig`, `Runner`.
- Produces:
  - `CONTAINER_PREFIX = "source /usr/local/share/openpi/functions.zsh && cd /workspace && "`
  - `MULTI_GPU_ENV: dict[str, str]` (the seven NCCL/XLA settings from Global Constraints)
  - `parse_gpus(text: str | int) -> tuple[int, ...]` ("1,2" → (1, 2); refuses empty, duplicates, negatives)
  - `train_env(gpus) -> dict[str, str]` (`XLA_PYTHON_CLIENT_PREALLOCATE=false`, plus `MULTI_GPU_ENV` when more than one GPU)
  - `@dataclass(frozen=True) Compose(config: OpenpiConfig, dataset_dir: Path, gpus: tuple[int, ...] = ())` with `.env() -> dict`, `.base() -> list[str]`, `.run(command, *, env=None, name=None) -> list[str]` (`docker compose … run -T --no-deps (--rm | -d --name NAME) [-e K=V…] openpi zsh -lc "<prefix><command>"`)
  - `@dataclass(frozen=True) ConfigInfo(name, repo_id, asset_id, holdout: tuple[int, ...], batch_size: int, num_train_steps: int)`
  - `config_info(runner, compose, name) -> ConfigInfo`
  - `norm_stats_path(config, info) -> Path` = `<docker_data>/assets/<name>/<asset_id>/norm_stats.json`
  - `run_dir(config, name, exp) -> Path` = `<docker_data>/checkpoints/<name>/<exp>`
  - `busy_gpus(runner, gpus, threshold_mib) -> dict[int, int]`
  - `repo_commit(runner, repo) -> str` (`<sha>` or `<sha> (+ uncommitted changes)`)
  - `script(name) -> str` (text of `openpi_scripts/<name>.py`)
  - `require_view(path) -> DatasetSummary` (raises `StepFailed` unless `summarize(path).kind == "view"`)
  - `check_holdout(info, summary)` (raises `StepFailed` if the config's holdout episodes are not all in the view)

- [ ] **Step 1: Write the failing tests** — `test/test_openpi.py`:

```python
from __future__ import annotations

import json
from pathlib import Path

import pytest
from fake_runner import FakeRunner
from lerobot_fixture import Episode, build_dataset, build_view, gripper

from realman_training.config import OpenpiConfig
from realman_training.jobs import StepFailed
from realman_training.openpi import (
    CONTAINER_PREFIX,
    MULTI_GPU_ENV,
    Compose,
    ConfigInfo,
    busy_gpus,
    check_holdout,
    config_info,
    norm_stats_path,
    parse_gpus,
    repo_commit,
    require_view,
    run_dir,
    script,
    train_env,
)

OC = OpenpiConfig(repo=Path("/o/openpi"), docker_data=Path("/o/data"), compose_overlay=Path("/cfg/overlay.yaml"))
INFO_JSON = json.dumps(
    {"repo_id": "local/v", "asset_id": "local/v", "exclude_episode_indices": [1, 3], "batch_size": 8, "num_train_steps": 30000}
)


def test_parse_gpus():
    assert parse_gpus("1,2") == (1, 2) and parse_gpus(3) == (3,) and parse_gpus(" 0 , 3 ") == (0, 3)
    for bad in ("", "1,1", "-1", "a"):
        with pytest.raises(ValueError):
            parse_gpus(bad)


def test_train_env_adds_the_nccl_recipe_only_for_several_gpus():
    assert train_env((2,)) == {"XLA_PYTHON_CLIENT_PREALLOCATE": "false"}
    env = train_env((1, 2))
    assert env["NCCL_CUMEM_ENABLE"] == "0" and env["XLA_FLAGS"] == "--xla_gpu_enable_command_buffer="
    assert set(MULTI_GPU_ENV) == {
        "NCCL_P2P_DISABLE", "NCCL_SHM_DISABLE", "NCCL_NET", "NCCL_CUMEM_ENABLE", "XLA_FLAGS", "NCCL_ALGO", "NCCL_PROTO"
    }


def test_compose_run_uses_the_repo_files_the_overlay_and_the_view():
    compose = Compose(OC, Path("/d/view"), (1, 2))
    env = compose.env()
    assert env == {
        "OPENPI_DOCKER_DATA_DIR": "/o/data",
        "OPENPI_REALMAN_DATASET_DIR": "/d/view",
        "OPENPI_COMPOSE_PROJECT_NAME": "openpi-console",
        "OPENPI_DOCKER_IMAGE": "openpi:dev",
        "CONSOLE_GPUS": "1,2",
    }
    argv = compose.run("opic-norm --config-name x", env={"A": "1"})
    assert argv[:4] == ["docker", "compose", "-p", "openpi-console"]
    assert argv[argv.index("-f") + 1] == "/o/openpi/compose.yaml"
    assert "/o/openpi/compose.realman.yaml" in argv and "/cfg/overlay.yaml" in argv
    assert argv[argv.index("run") :][:5] == ["run", "-T", "--no-deps", "--rm", "-e"]
    assert argv[-4:] == ["openpi", "zsh", "-lc", CONTAINER_PREFIX + "opic-norm --config-name x"]
    detached = compose.run("x", name="openpi-console-train-e")
    assert "--rm" not in detached and detached[detached.index("-d") + 1 : detached.index("-d") + 3] == ["--name", "openpi-console-train-e"]
    assert Compose(OC, Path("/d")).env()["CONSOLE_GPUS"] == "none"


def test_config_info_runs_the_shipped_script_in_the_container():
    runner = FakeRunner().on("python -", stdout="noise\n" + INFO_JSON + "\n")
    info = config_info(runner, Compose(OC, Path("/d/view")), "pi05_x")
    assert info == ConfigInfo("pi05_x", "local/v", "local/v", (1, 3), 8, 30000)
    assert runner.inputs[0] == script("config_info")
    assert runner.envs[0]["OPENPI_REALMAN_DATASET_DIR"] == "/d/view"
    assert "uv run --no-sync python - pi05_x" in runner.calls[0][-1]


def test_paths():
    info = ConfigInfo("pi05_x", "local/v", "local/v", (), 8, 10)
    assert norm_stats_path(OC, info) == Path("/o/data/assets/pi05_x/local/v/norm_stats.json")
    assert run_dir(OC, "pi05_x", "e1") == Path("/o/data/checkpoints/pi05_x/e1")


def test_busy_gpus_lists_gpus_over_the_threshold():
    runner = FakeRunner().on("nvidia-smi", stdout="1, 16000\n2, 3\n")
    assert busy_gpus(runner, (1, 2), 2000) == {1: 16000}
    assert runner.calls[0][:3] == ["nvidia-smi", "-i", "1,2"]


def test_repo_commit_marks_uncommitted_changes():
    runner = FakeRunner().on("rev-parse", stdout="abc123\n").on("status --porcelain", stdout=" M x.py\n")
    assert repo_commit(runner, Path("/o/openpi")) == "abc123 (+ uncommitted changes)"
    clean = FakeRunner().on("rev-parse", stdout="abc123\n")
    assert repo_commit(clean, Path("/o/openpi")) == "abc123"


def test_require_view_and_check_holdout(tmp_path):
    raw = build_dataset(tmp_path / "raw", [Episode("a", gripper((50, 5)))])
    with pytest.raises(StepFailed, match="not a training view"):
        require_view(raw)
    view = build_view(tmp_path / "view", source="c", prompts={"a": "do a"}, lengths=[5, 5, 5])
    summary = require_view(view)
    check_holdout(ConfigInfo("n", "r", "r", (0, 2), 8, 10), summary)
    with pytest.raises(StepFailed, match="holdout"):
        check_holdout(ConfigInfo("n", "r", "r", (9,), 8, 10), summary)
```

- [ ] **Step 2: Run to see it fail**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_openpi.py -p no:cacheprovider`
Expected: FAIL — `ModuleNotFoundError: realman_training.openpi`.

- [ ] **Step 3: Implement**

`realman_training/openpi_scripts/config_info.py` (runs inside the openpi container, Python of the openpi venv; no `from __future__`):

```python
"""Run inside the openpi container: print one JSON line describing a training config.

usage: uv run --no-sync python - CONFIG_NAME < config_info.py
"""

import json
import sys

from openpi.training import config as _config

cfg = _config.get_config(sys.argv[1])
data = cfg.data
assets = getattr(data, "assets", None)
print(
    json.dumps(
        {
            "repo_id": data.repo_id,
            "asset_id": getattr(assets, "asset_id", None) or data.repo_id,
            "exclude_episode_indices": list(getattr(data, "exclude_episode_indices", ()) or ()),
            "batch_size": cfg.batch_size,
            "num_train_steps": cfg.num_train_steps,
        }
    )
)
```

`realman_training/openpi.py`:

```python
"""How the console drives openpi on server5090: `docker compose run` on the openpi repo's compose files,
the config facts read from inside the container, and the GPUs.

openpi's norm and eval scripts take a config NAME only, so each training view keeps its own openpi config;
the view is mounted at /datasets/lerobot_realman (compose.realman.yaml).
"""

from __future__ import annotations

import dataclasses
import json
import shlex
from pathlib import Path

from .config import OpenpiConfig
from .datasets import DatasetSummary, summarize
from .jobs import StepFailed
from .runner import Runner

CONTAINER_PREFIX = "source /usr/local/share/openpi/functions.zsh && cd /workspace && "
# Verified on 2 and 4 RTX 5090s (no NVLink, P2P unsupported), 2026-10-14/16: without these the first collective
# hangs or dies with CUDA_ERROR_ILLEGAL_ADDRESS.
MULTI_GPU_ENV = {
    "NCCL_P2P_DISABLE": "1",
    "NCCL_SHM_DISABLE": "1",
    "NCCL_NET": "Socket",
    "NCCL_CUMEM_ENABLE": "0",
    "XLA_FLAGS": "--xla_gpu_enable_command_buffer=",
    "NCCL_ALGO": "Ring",
    "NCCL_PROTO": "Simple",
}
SCRIPTS = Path(__file__).resolve().parent / "openpi_scripts"


def parse_gpus(text: str | int) -> tuple[int, ...]:
    parts = [p.strip() for p in str(text).split(",") if p.strip()]
    if not parts:
        raise ValueError("no GPU given")
    gpus = tuple(int(p) for p in parts)
    if any(g < 0 for g in gpus) or len(set(gpus)) != len(gpus):
        raise ValueError(f"bad GPU list {text!r}")
    return gpus


def train_env(gpus: tuple[int, ...]) -> dict[str, str]:
    return {"XLA_PYTHON_CLIENT_PREALLOCATE": "false", **(MULTI_GPU_ENV if len(gpus) > 1 else {})}


def script(name: str) -> str:
    return (SCRIPTS / f"{name}.py").read_text(encoding="utf-8")


@dataclasses.dataclass(frozen=True)
class Compose:
    config: OpenpiConfig
    dataset_dir: Path
    gpus: tuple[int, ...] = ()

    def env(self) -> dict[str, str]:
        return {
            "OPENPI_DOCKER_DATA_DIR": str(self.config.docker_data),
            "OPENPI_REALMAN_DATASET_DIR": str(self.dataset_dir),
            "OPENPI_COMPOSE_PROJECT_NAME": self.config.compose_project,
            "OPENPI_DOCKER_IMAGE": self.config.image,
            "CONSOLE_GPUS": ",".join(map(str, self.gpus)) or "none",
        }

    def base(self) -> list[str]:
        repo = self.config.repo
        return [
            "docker", "compose", "-p", self.config.compose_project, "--project-directory", str(repo),
            "-f", str(repo / "compose.yaml"), "-f", str(repo / "compose.realman.yaml"),
            "-f", str(self.config.compose_overlay),
        ]

    def run(self, command: str, *, env: dict[str, str] | None = None, name: str | None = None) -> list[str]:
        argv = [*self.base(), "run", "-T", "--no-deps"]
        argv += ["-d", "--name", name] if name else ["--rm"]
        for key, value in (env or {}).items():
            argv += ["-e", f"{key}={value}"]
        return [*argv, "openpi", "zsh", "-lc", CONTAINER_PREFIX + command]


@dataclasses.dataclass(frozen=True)
class ConfigInfo:
    name: str
    repo_id: str
    asset_id: str
    holdout: tuple[int, ...]
    batch_size: int
    num_train_steps: int


def config_info(runner: Runner, compose: Compose, name: str) -> ConfigInfo:
    out = runner.check(
        compose.run(f"uv run --no-sync python - {shlex.quote(name)}"), input=script("config_info"), env=compose.env()
    )
    data = json.loads(out.strip().splitlines()[-1])
    return ConfigInfo(
        name=name,
        repo_id=str(data["repo_id"]),
        asset_id=str(data["asset_id"]),
        holdout=tuple(int(e) for e in data["exclude_episode_indices"]),
        batch_size=int(data["batch_size"]),
        num_train_steps=int(data["num_train_steps"]),
    )


def norm_stats_path(config: OpenpiConfig, info: ConfigInfo) -> Path:
    return config.docker_data / "assets" / info.name / info.asset_id / "norm_stats.json"


def run_dir(config: OpenpiConfig, name: str, exp: str) -> Path:
    return config.docker_data / "checkpoints" / name / exp


def busy_gpus(runner: Runner, gpus: tuple[int, ...], threshold_mib: int) -> dict[int, int]:
    out = runner.check(
        ["nvidia-smi", "-i", ",".join(map(str, gpus)), "--query-gpu=index,memory.used", "--format=csv,noheader,nounits"]
    )
    busy = {}
    for line in out.splitlines():
        if line.strip():
            index, used = (int(x) for x in line.split(","))
            if used > threshold_mib:
                busy[index] = used
    return busy


def repo_commit(runner: Runner, repo: Path) -> str:
    head = runner.check(["git", "-C", str(repo), "rev-parse", "HEAD"]).strip()
    dirty = runner.check(["git", "-C", str(repo), "status", "--porcelain"]).strip()
    return f"{head} (+ uncommitted changes)" if dirty else head


def require_view(path: Path) -> DatasetSummary:
    summary = summarize(path)
    if summary.kind != "view":
        raise StepFailed(f"{path} is not a training view (no contract.json); build one with `realman-train view`")
    return summary


def check_holdout(info: ConfigInfo, summary: DatasetSummary) -> None:
    outside = [e for e in info.holdout if e >= summary.episodes]
    if outside:
        raise StepFailed(
            f"config {info.name}'s holdout episodes {outside} are not in {summary.name} ({summary.episodes} episodes):"
            " wrong view for this config?"
        )
```

`setup.py`: add `package_data={"realman_training": ["openpi_scripts/*.py"]},` to `setup(...)`.

- [ ] **Step 4: Run the tests**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_openpi.py -p no:cacheprovider`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
ruff check --config config/python/ruff.toml src/training
git add src/training/realman_training
git commit -m "feat(training): openpi compose commands, config facts from the container, GPU checks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: `steps/view.py` — training view + gripper-label checks

**Files:**
- Create: `src/training/realman_training/realman_training/steps/view.py`
- Modify: `src/training/realman_training/realman_training/quality.py` (rename `_runs` → `runs`, keep `_runs = runs` for old callers)
- Test: `src/training/realman_training/test/test_view.py`

**Interfaces:**
- Consumes: `datasets.summarize`, `lerobot_io.read_columns/read_episodes`, `quality.runs`, `config`, `Runner.stream`, `jobs.StepFailed`.
- Produces: `view.run(params, log, runner=None) -> dict`; params `src` (clean dataset), `dst`, optional `task_prompts: dict[str, str]`, `arm` (default `quality.arm`), `dry_run`, `config`. Result `{"dst", "episodes", "prompts", "label_failures": []}` or `{"dry_run": True, "command": argv}`. Writes `<dst>/label_check.json` = `{"checked", "failures": [...]}`. `view.view_command(openpi_config, src, dst, arm, prompts) -> list[str]`. `view.check_gripper_labels(root, release_tasks) -> list[dict]`. `view.default_dst(data_root, src) -> Path` = `<data_root>/<src.name>_view`.

Gripper target (action dim 6, 1 = open): a release task (`pick_and_place`) must read open → closed → open; any other task open → closed (`pick_only` grasps and holds).

- [ ] **Step 1: Write the failing tests** — `test/test_view.py`:

```python
from __future__ import annotations

import json
import os
import shlex
from pathlib import Path

import pytest
from fake_runner import FakeRunner, RecordingLog
from lerobot_fixture import Episode, build_dataset, build_view, gripper

from realman_training.config import load_config
from realman_training.jobs import StepFailed
from realman_training.steps import view

PLACE = "pick up the power adapter and put it in the blue bin"
PICK = "pick up the power adapter"
GOOD_PLACE = [1.0] * 10 + [0.0] * 10 + [1.0] * 10
GOOD_PICK = [1.0] * 10 + [0.0] * 20


@pytest.fixture()
def clean(tmp_path):
    return build_dataset(
        tmp_path / "data" / "realman__pi05-three-arm_clean_20261020",
        [Episode("pick_and_place", gripper((50, 30))), Episode("pick_only", gripper((50, 30)))],
    )


def fake_make_view(targets):
    """Plays make_realman_view.py: writes a view with the given gripper targets at --dst."""

    def action(argv, input):
        inner = shlex.split(argv[-1].split("make_realman_view.py", 1)[1])
        dst = inner[inner.index("--dst") + 1]
        pairs = inner[inner.index("--task-prompt") + 1 :]
        prompts = dict(pair.split("=", 1) for pair in pairs)
        build_view(
            Path(dst), source="src", prompts=prompts, lengths=[len(t) for t in targets],
            gripper_targets=targets, tasks=["pick_and_place", "pick_only"],
        )

    return FakeRunner().on("make_realman_view.py", action=action, lines=["view written"])


def test_view_runs_make_realman_view_in_the_openpi_image_and_checks_labels(clean, tmp_path):
    dst = tmp_path / "data" / "v"
    runner = fake_make_view([GOOD_PLACE, GOOD_PICK])
    result = view.run({"src": str(clean), "dst": str(dst)}, RecordingLog(), runner=runner)
    assert result["label_failures"] == [] and result["episodes"] == 2
    assert result["prompts"] == {"pick_and_place": PLACE, "pick_only": PICK}
    argv = runner.calls[0]
    assert argv[:3] == ["docker", "run", "--rm"] and "--network" in argv
    data_root = str(tmp_path / "data")
    assert f"{data_root}:{data_root}" in argv  # one common mount, so hard links work inside the container
    inner = shlex.split(argv[-1].split("make_realman_view.py", 1)[1])
    assert inner[inner.index("--task-prompt") + 1 :] == [f"pick_and_place={PLACE}", f"pick_only={PICK}"]
    assert json.loads((dst / "label_check.json").read_text())["failures"] == []


def test_wrong_gripper_labels_fail_the_job_and_name_the_episodes(clean, tmp_path):
    runner = fake_make_view([GOOD_PICK, GOOD_PICK])  # the place episode never releases
    with pytest.raises(StepFailed, match=r"1 episode\(s\).*\b0\b"):
        view.run({"src": str(clean), "dst": str(tmp_path / "data" / "v")}, RecordingLog(), runner=runner)
    failures = json.loads((tmp_path / "data" / "v" / "label_check.json").read_text())["failures"]
    assert failures == [{"episode": 0, "task": "pick_and_place", "found": "open>closed", "expected": "open>closed>open"}]


def test_a_task_without_a_prompt_is_refused_before_docker(clean, tmp_path):
    config = tmp_path / "c.yaml"
    config.write_text("training_console:\n  prompts:\n    pick_and_place: x\n")
    runner = FakeRunner()
    with pytest.raises(StepFailed, match="pick_only"):
        view.run({"src": str(clean), "dst": str(tmp_path / "v"), "config": str(config)}, RecordingLog(), runner=runner)
    assert runner.calls == []


def test_given_prompts_override_the_config(clean, tmp_path):
    result = view.run(
        {"src": str(clean), "dst": str(tmp_path / "data" / "v"), "task_prompts": {"pick_only": "hold it"}, "dry_run": True},
        RecordingLog(),
        runner=FakeRunner(),
    )
    assert "pick_only=hold it" in result["command"][-1] and f"pick_and_place={PLACE}" in result["command"][-1]


def test_an_existing_target_and_a_view_source_are_refused(clean, tmp_path):
    (tmp_path / "exists").mkdir()
    with pytest.raises(StepFailed, match="exists"):
        view.run({"src": str(clean), "dst": str(tmp_path / "exists")}, RecordingLog(), runner=FakeRunner())
    v = build_view(tmp_path / "data" / "already", source="s", prompts={"a": "b"}, lengths=[3])
    with pytest.raises(StepFailed, match="already a training view"):
        view.run({"src": str(v), "dst": str(tmp_path / "data" / "v2")}, RecordingLog(), runner=FakeRunner())


def test_a_failing_script_fails_the_step(clean, tmp_path):
    runner = FakeRunner().on("make_realman_view.py", returncode=1, lines=["Traceback", "ValueError: x"])
    with pytest.raises(StepFailed, match="exited 1"):
        view.run({"src": str(clean), "dst": str(tmp_path / "data" / "v")}, RecordingLog(), runner=runner)


def test_check_gripper_labels_on_a_built_view(tmp_path):
    root = build_view(
        tmp_path / "v", source="s", prompts={"pick_and_place": PLACE, "pick_only": PICK}, lengths=[30, 30, 30],
        gripper_targets=[GOOD_PLACE, GOOD_PICK, [1.0] * 30], tasks=["pick_and_place", "pick_only", "pick_only"],
    )
    failures = view.check_gripper_labels(root, ("pick_and_place",))
    assert [f["episode"] for f in failures] == [2] and failures[0]["found"] == "open"


def test_default_dst(tmp_path):
    assert view.default_dst(tmp_path, tmp_path / "x_clean_1") == tmp_path / "x_clean_1_view"


def test_uid_is_used_for_the_container(clean, tmp_path):
    argv = view.view_command(load_config().openpi, clean, tmp_path / "data" / "v", "r", {"a": "b"})
    assert argv[argv.index("--user") + 1] == f"{os.getuid()}:{os.getgid()}"
```

- [ ] **Step 2: Run to see it fail**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_view.py -p no:cacheprovider`
Expected: FAIL — `ImportError: cannot import name 'view'`.

- [ ] **Step 3: Implement**

In `quality.py` rename `_runs` to `runs` (public, used by the view checks) and update its one caller in `check_episode`.

`steps/view.py`:

```python
"""Training view of a cleaned recording: openpi's make_realman_view.py (multi-task --task-prompt) in the openpi
image, then a check that every episode's gripper target has the shape its task needs.

The view hard-links the videos, so src and dst must share a filesystem; the container mounts their common parent
once (separate bind mounts would make the links cross-device).
"""

from __future__ import annotations

import json
import os
import shlex
from pathlib import Path

from ..config import OpenpiConfig, load_config
from ..datasets import summarize
from ..jobs import StepFailed, now
from ..lerobot_io import read_columns, read_episodes
from ..quality import runs
from ..runner import Runner, compact


def default_dst(data_root: str | Path, src: str | Path) -> Path:
    return Path(data_root).expanduser() / f"{Path(src).name}_view"


def view_command(openpi: OpenpiConfig, src: Path, dst: Path, arm: str, prompts: dict[str, str]) -> list[str]:
    shared = os.path.commonpath([str(src), str(dst.parent)])
    args = ["--src", str(src), "--dst", str(dst), "--arm", arm, "--task-prompt", *[f"{t}={p}" for t, p in prompts.items()]]
    return [
        "docker", "run", "--rm", "--network", "none", "--user", f"{os.getuid()}:{os.getgid()}",
        "-e", "HOME=/tmp", "-e", "UV_PROJECT_ENVIRONMENT=/.venv",
        "-e", "PYTHONPATH=/workspace/src:/workspace/packages/openpi-client/src",
        "-v", f"{openpi.repo}:/workspace", "-v", f"{shared}:{shared}", "-w", "/workspace",
        "--entrypoint", "zsh", openpi.image, "-lc",
        "uv run --no-sync scripts/make_realman_view.py " + shlex.join(args),
    ]


def _label(states: list[bool]) -> str:
    return ">".join("open" if s else "closed" for s in states)


def check_gripper_labels(root: str | Path, release_tasks: tuple[str, ...]) -> list[dict]:
    root = Path(root)
    contract = json.loads((root / "contract.json").read_text(encoding="utf-8"))
    task_of_prompt = {prompt: task for task, prompt in (contract.get("prompts") or {}).items() if task != "*"}
    columns = read_columns(root, ["action"])
    failures = []
    for episode in read_episodes(root):
        task = task_of_prompt.get(episode.task)
        if task is None:
            continue  # single-prompt views ("*") carry no task name to judge by
        action = columns[episode.index]["action"]
        found = [value for value, _, _ in runs(action[:, 6] > 0.5)] if len(action) else []
        expected = [True, False, True] if task in release_tasks else [True, False]
        if found != expected:
            failures.append({"episode": episode.index, "task": task, "found": _label(found), "expected": _label(expected)})
    return failures


def run(params: dict, log, runner: Runner | None = None) -> dict:
    runner = runner or Runner()
    config = load_config(params.get("config"))
    src = Path(params["src"]).expanduser().resolve()
    dst = Path(params["dst"]).expanduser().absolute()
    if dst.exists():
        raise StepFailed(f"refusing: {dst} exists (view never overwrites)")
    summary = summarize(src)
    if summary.kind == "view":
        raise StepFailed(f"{src} is already a training view; build views from a raw or cleaned recording")
    prompts = {**config.prompts, **{str(k): str(v) for k, v in (params.get("task_prompts") or {}).items()}}
    missing = [task for task in summary.tasks if task not in prompts]
    if missing:
        raise StepFailed(f"no prompt for task(s) {missing}: add them to prompts in the config or pass task=prompt")
    prompts = {task: prompts[task] for task in summary.tasks}
    argv = view_command(config.openpi, src, dst, params.get("arm") or config.quality.arm, prompts)
    log("$ " + shlex.join(argv))
    if params.get("dry_run"):
        return {"dry_run": True, "command": argv}
    code = runner.stream(argv, lambda line: log(compact(line)))
    if code:
        raise StepFailed(f"make_realman_view.py exited {code}")
    failures = check_gripper_labels(dst, config.quality.release_tasks)
    (dst / "label_check.json").write_text(
        json.dumps({"checked": now(), "failures": failures}, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    if failures:
        listed = ", ".join(f"{f['episode']} ({f['task']}: {f['found']})" for f in failures[:10])
        raise StepFailed(f"view written to {dst}, but {len(failures)} episode(s) have wrong gripper labels: {listed}")
    episodes = summarize(dst).episodes
    log(f"view {dst}: {episodes} episodes, gripper labels ok")
    return {"dst": str(dst), "episodes": episodes, "prompts": prompts, "label_failures": []}
```

- [ ] **Step 4: Run the tests**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_view.py test/test_quality.py -p no:cacheprovider`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
ruff check --config config/python/ruff.toml src/training
git add src/training/realman_training
git commit -m "feat(training): view step runs make_realman_view in the openpi image and checks gripper labels

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: `steps/norm.py` and `steps/train.py`

**Files:**
- Create: `src/training/realman_training/realman_training/steps/norm.py`
- Create: `src/training/realman_training/realman_training/steps/train.py`
- Test: `src/training/realman_training/test/test_norm_train.py`

**Interfaces:**
- Consumes: everything in `openpi.py`; `Runner`; `jobs.StepFailed/JobCancelled/now/write_json`.
- Produces:
  - `norm.run(params, log, runner=None) -> dict`; params `config_name`, `view`, optional `force`, `dry_run`, `config`. Result `{"norm_stats": path, "computed": bool}` (+ `"command"` when dry).
  - `train.run(params, log, runner=None, sleep=time.sleep) -> dict`; params `config_name`, `view`, `exp`, `gpus` ("1,2"), optional `batch`, `steps`, `resume`, `attach`, `dry_run`, `num_workers`, `poll_sec` (default 15), `config`. Result `{"run_dir", "container", "last_step", "exit_code"}` or dry `{"dry_run": True, "command": argv, "container": name, "norm": {...}}`.
  - `train.container_name(project, exp) -> str` = `<project>-train-<exp>`.
  - `train.parse_metrics(text) -> list[dict]` (from `Step N: k=v, …` lines of the train log).
  - Files: `<docker_data>/wandb/<exp>.log` (train log, as before), `<run_dir>/metrics.csv`, `<run_dir>/console_train.json` = `{config, exp, view, gpus, batch_size, num_train_steps, holdout, weights, openpi_commit, started, ended, exit_code, container}`.

- [ ] **Step 1: Write the failing tests** — `test/test_norm_train.py`:

```python
from __future__ import annotations

import csv
import json
from pathlib import Path

import pytest
from fake_runner import FakeRunner, RecordingLog
from lerobot_fixture import build_view

from realman_training.jobs import JobCancelled, StepFailed
from realman_training.steps import norm, train

INFO = {"repo_id": "local/v", "asset_id": "local/v", "exclude_episode_indices": [1], "batch_size": 8, "num_train_steps": 300}
LOG = """\
02:00:04.856 [I] Step 0: grad_norm=0.2538, loss=0.0836821, param_norm=1801.99, learning_rate=4.99494e-08 (1162:train.py:333)
02:01:20.602 [I] Step 100: grad_norm=0.218596, loss=0.0646374, param_norm=1801.99, learning_rate=5.04496e-06 (1162:train.py:333)
02:02:35.564 [I] Step 200: grad_norm=0.151241, loss=0.0420924, param_norm=1801.99, learning_rate=1.004e-05 (1162:train.py:333)
"""


@pytest.fixture()
def env(tmp_path):
    view = build_view(tmp_path / "data" / "v_view", source="c", prompts={"a": "do a"}, lengths=[10, 10, 10])
    docker_data = tmp_path / "openpi-docker-data"
    (docker_data / "wandb").mkdir(parents=True)
    config = tmp_path / "console.yaml"
    config.write_text(
        "training_console:\n"
        f"  data_root: {tmp_path / 'data'}\n"
        f"  openpi:\n    repo: {tmp_path / 'openpi'}\n    docker_data: {docker_data}\n"
    )
    return {"view": view, "docker_data": docker_data, "config": str(config)}


def base_runner():
    return FakeRunner().on("python -", stdout=json.dumps(INFO)).on("nvidia-smi", stdout="1, 3\n2, 5\n")


def stats_path(env):
    return env["docker_data"] / "assets/pi05_x/local/v/norm_stats.json"


def test_norm_computes_missing_stats_once(env):
    def write_stats(argv, input):
        stats_path(env).parent.mkdir(parents=True)
        stats_path(env).write_text("{}")

    runner = base_runner().on("opic-norm", action=write_stats, lines=["Computing stats: 100%"])
    params = {"config_name": "pi05_x", "view": str(env["view"]), "config": env["config"]}
    assert norm.run(params, RecordingLog(), runner=runner) == {"norm_stats": str(stats_path(env)), "computed": True}
    assert runner.envs[-1]["OPENPI_REALMAN_DATASET_DIR"] == str(env["view"])
    again = base_runner()
    assert norm.run(params, RecordingLog(), runner=again)["computed"] is False
    assert again.commands("opic-norm") == []


def test_norm_fails_when_the_stats_do_not_appear(env):
    runner = base_runner().on("opic-norm", returncode=0)
    with pytest.raises(StepFailed, match="norm_stats.json"):
        norm.run({"config_name": "pi05_x", "view": str(env["view"]), "config": env["config"]}, RecordingLog(), runner=runner)


def train_params(env, **extra):
    return {"config_name": "pi05_x", "view": str(env["view"]), "exp": "e1", "gpus": "1,2", "config": env["config"],
            "poll_sec": 0, **extra}


def test_train_dry_run_shows_the_command_and_touches_nothing(env):
    stats_path(env).parent.mkdir(parents=True)
    stats_path(env).write_text("{}")
    runner = base_runner().on("container inspect", returncode=1)
    result = train.run(train_params(env, batch=16, steps=30000, dry_run=True), RecordingLog(), runner=runner)
    command = result["command"]
    assert result["container"] == "openpi-console-train-e1"
    assert command[command.index("-d") + 1 : command.index("-d") + 3] == ["--name", "openpi-console-train-e1"]
    assert "NCCL_CUMEM_ENABLE=0" in command and "XLA_PYTHON_CLIENT_PREALLOCATE=false" in command
    inner = command[-1]
    assert "opic-train pi05_x" in inner and "--exp-name=e1" in inner and "--batch-size=16" in inner
    assert "--num-train-steps=30000" in inner and "--weight-loader.params-path=/home/openpi/" in inner
    assert "> /workspace/wandb/e1.log 2>&1" in inner
    assert runner.commands("compose") and not [c for c in runner.commands("compose") if "-d" in c]  # only config_info
    assert not (env["docker_data"] / "checkpoints").exists()


def test_train_refuses_gpus_held_by_someone_else(env):
    runner = FakeRunner().on("python -", stdout=json.dumps(INFO)).on("nvidia-smi", stdout="1, 16000\n2, 5\n")
    runner.on("container inspect", returncode=1)
    with pytest.raises(StepFailed, match="gpu1=16000"):
        train.run(train_params(env), RecordingLog(), runner=runner)
    assert not [c for c in runner.calls if "-d" in c]


def test_train_refuses_an_existing_run_or_container(env):
    run_dir = env["docker_data"] / "checkpoints/pi05_x/e1"
    run_dir.mkdir(parents=True)
    with pytest.raises(StepFailed, match="resume"):
        train.run(train_params(env), RecordingLog(), runner=base_runner().on("container inspect", returncode=1))
    run_dir.rmdir()
    with pytest.raises(StepFailed, match="container openpi-console-train-e1 exists"):
        train.run(train_params(env), RecordingLog(), runner=base_runner().on("container inspect", returncode=0))


def test_train_refuses_a_view_that_lacks_the_holdout(env):
    info = {**INFO, "exclude_episode_indices": [7]}
    runner = FakeRunner().on("python -", stdout=json.dumps(info)).on("container inspect", returncode=1)
    with pytest.raises(StepFailed, match="holdout"):
        train.run(train_params(env), RecordingLog(), runner=runner)


def test_train_computes_norm_first_follows_the_log_and_writes_metrics(env):
    log_path = env["docker_data"] / "wandb/e1.log"
    run_dir = env["docker_data"] / "checkpoints/pi05_x/e1"
    states = iter(["true", "false"])

    def write_stats(argv, input):
        stats_path(env).parent.mkdir(parents=True)
        stats_path(env).write_text("{}")

    def start(argv, input):
        run_dir.mkdir(parents=True)
        log_path.write_text(LOG)

    runner = (
        base_runner()
        .on("container inspect", returncode=1)
        .on("opic-norm", action=write_stats)
        .on("opic-train", action=start, stdout="container-id\n")
        .on("{{.State.Running}}", stdout=lambda argv, input: next(states, "false") + "\n")
        .on("{{.State.ExitCode}}", stdout="0\n")
        .on("git -C", stdout="abc\n")
    )
    log = RecordingLog()
    result = train.run(train_params(env), log, runner=runner)
    assert result == {"run_dir": str(run_dir), "container": "openpi-console-train-e1", "last_step": 200, "exit_code": 0}
    assert runner.commands("opic-norm") and runner.commands("docker rm openpi-console-train-e1")
    assert log.progress_calls[-1][:2] == (200, 300)
    rows = list(csv.DictReader((run_dir / "metrics.csv").open()))
    assert [r["step"] for r in rows] == ["0", "100", "200"] and rows[2]["loss"] == "0.0420924"
    record = json.loads((run_dir / "console_train.json").read_text())
    assert record["gpus"] == [1, 2] and record["batch_size"] == 8 and record["num_train_steps"] == 300
    assert record["holdout"] == [1] and record["exit_code"] == 0 and record["view"] == str(env["view"])


def test_train_failure_exit_code_fails_the_step(env):
    stats_path(env).parent.mkdir(parents=True)
    stats_path(env).write_text("{}")
    runner = (
        base_runner().on("container inspect", returncode=1).on("opic-train", stdout="id\n")
        .on("{{.State.Running}}", stdout="false\n").on("{{.State.ExitCode}}", stdout="1\n").on("git -C", stdout="abc\n")
    )
    with pytest.raises(StepFailed, match="exited 1"):
        train.run(train_params(env), RecordingLog(), runner=runner)


def test_cancelling_stops_the_container(env):
    stats_path(env).parent.mkdir(parents=True)
    stats_path(env).write_text("{}")
    runner = (
        base_runner().on("container inspect", returncode=1).on("opic-train", stdout="id\n")
        .on("{{.State.Running}}", stdout="true\n").on("git -C", stdout="abc\n")
    )

    def cancel(_seconds):
        raise JobCancelled()

    with pytest.raises(JobCancelled):
        train.run(train_params(env), RecordingLog(), runner=runner, sleep=cancel)
    assert runner.commands("docker stop")


def test_attach_follows_an_existing_container_without_starting_one(env):
    log_path = env["docker_data"] / "wandb/e1.log"
    log_path.write_text(LOG)
    (env["docker_data"] / "checkpoints/pi05_x/e1").mkdir(parents=True)
    runner = (
        base_runner().on("{{.State.Running}}", stdout="false\n").on("{{.State.ExitCode}}", stdout="0\n")
        .on("container inspect", returncode=0).on("git -C", stdout="abc\n")
    )
    result = train.run(train_params(env, attach=True), RecordingLog(), runner=runner)
    assert result["last_step"] == 200 and runner.commands("opic-train") == []


def test_parse_metrics():
    rows = train.parse_metrics(LOG + "noise\n")
    assert rows[0] == {"step": 0, "grad_norm": 0.2538, "loss": 0.0836821, "param_norm": 1801.99, "learning_rate": 4.99494e-08}
    assert len(rows) == 3


def test_bad_experiment_names_are_refused(env):
    with pytest.raises(StepFailed, match="exp"):
        train.run(train_params(env, exp="a b;rm"), RecordingLog(), runner=base_runner())


def test_paths_do_not_leak():
    assert Path(train.__file__).name == "train.py"
```

- [ ] **Step 2: Run to see it fail**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_norm_train.py -p no:cacheprovider`
Expected: FAIL — `ImportError: cannot import name 'norm'`.

- [ ] **Step 3: Implement**

`steps/norm.py`:

```python
"""Normalization stats for an openpi config + its training view (`opic-norm`), unless they already exist."""

from __future__ import annotations

import shlex
from pathlib import Path

from ..config import load_config
from ..jobs import StepFailed
from ..openpi import Compose, check_holdout, config_info, norm_stats_path, require_view
from ..runner import Runner, compact


def run(params: dict, log, runner: Runner | None = None) -> dict:
    runner = runner or Runner()
    config = load_config(params.get("config"))
    view = Path(params["view"]).expanduser().resolve()
    name = params["config_name"]
    summary = require_view(view)
    compose = Compose(config.openpi, view)
    info = config_info(runner, compose, name)
    check_holdout(info, summary)
    if not view.name.startswith(info.repo_id.split("/")[-1]):
        log(f"note: config {name} names its data {info.repo_id}; mounting {view.name}")
    path = norm_stats_path(config.openpi, info)
    if path.exists() and not params.get("force"):
        log(f"norm stats exist: {path}")
        return {"norm_stats": str(path), "computed": False}
    argv = compose.run(f"opic-norm --config-name {shlex.quote(name)}")
    log("$ " + shlex.join(argv))
    if params.get("dry_run"):
        return {"norm_stats": str(path), "computed": False, "dry_run": True, "command": argv}
    last = []
    code = runner.stream(argv, lambda line: last.append(compact(line)), env=compose.env())
    for line in last[-5:]:
        log(line)
    if code or not path.exists():
        raise StepFailed(f"opic-norm exited {code} and {path} is {'there' if path.exists() else 'missing'}")
    log(f"norm stats written: {path}")
    return {"norm_stats": str(path), "computed": True}
```

`steps/train.py`:

```python
"""Start an openpi training run in its own detached container and follow it to the end.

Container `<project>-train-<exp>` (docker compose run -d on the openpi repo's compose files + the console overlay),
log in openpi-docker-data/wandb/<exp>.log as before. GPUs held by someone else are refused; norm stats are computed
first when missing. Cancelling the job stops the container. `attach` follows a container that is already running
(after the job process itself was lost).
"""

from __future__ import annotations

import csv
import re
import shlex
import time
from pathlib import Path

from ..config import load_config
from ..jobs import JobCancelled, StepFailed, now, write_json
from ..openpi import (
    Compose,
    busy_gpus,
    check_holdout,
    config_info,
    norm_stats_path,
    parse_gpus,
    repo_commit,
    require_view,
    run_dir,
    train_env,
)
from ..runner import Runner, compact
from . import norm

STEP_LINE = re.compile(r"Step (\d+): (.*?)(?: \(\d+:train\.py:\d+\))?$")
EXP_NAME = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.-]*$")


def container_name(project: str, exp: str) -> str:
    return f"{project}-train-{exp}"


def parse_metrics(text: str) -> list[dict]:
    rows = []
    for line in text.splitlines():
        match = STEP_LINE.search(compact(line))
        if not match:
            continue
        row: dict = {"step": int(match.group(1))}
        for pair in match.group(2).split(", "):
            key, _, value = pair.partition("=")
            try:
                row[key.strip()] = float(value)
            except ValueError:
                pass
        rows.append(row)
    return rows


def _follow(runner: Runner, container: str, log_path: Path, total: int, log, poll: float, sleep) -> int | None:
    offset, pending, last = 0, "", None
    while True:
        running = runner.check(["docker", "inspect", "-f", "{{.State.Running}}", container]).strip() == "true"
        if log_path.exists():
            with log_path.open("rb") as handle:
                handle.seek(offset)
                chunk = handle.read()
            offset += len(chunk)
            pending += chunk.decode(errors="replace")
            *lines, pending = pending.split("\n")
            for raw in lines:
                line = compact(raw)
                match = STEP_LINE.search(line)
                if match:
                    last = int(match.group(1))
                    log.progress(last, total, match.group(2))
                if match or "Traceback" in line or "Error" in line:
                    log(line)
        if not running:
            return last
        sleep(poll)


def run(params: dict, log, runner: Runner | None = None, sleep=time.sleep) -> dict:
    runner = runner or Runner()
    config = load_config(params.get("config"))
    oc = config.openpi
    exp = str(params["exp"])
    if not EXP_NAME.match(exp):
        raise StepFailed(f"exp name {exp!r}: use letters, digits, '_', '-', '.'")
    name = params["config_name"]
    view = Path(params["view"]).expanduser().resolve()
    gpus = parse_gpus(params["gpus"])
    container = container_name(oc.compose_project, exp)
    compose = Compose(oc, view, gpus)
    summary = require_view(view)
    info = config_info(runner, compose, name)
    check_holdout(info, summary)
    folder = run_dir(oc, name, exp)
    host_log = oc.docker_data / "wandb" / f"{exp}.log"
    total = int(params.get("steps") or info.num_train_steps)
    attach = bool(params.get("attach"))
    exists = runner.run(["docker", "container", "inspect", container]).returncode == 0
    record = {
        "config": name,
        "exp": exp,
        "view": str(view),
        "gpus": list(gpus),
        "batch_size": int(params.get("batch") or info.batch_size),
        "num_train_steps": total,
        "holdout": list(info.holdout),
        "weights": oc.weights,
        "container": container,
    }
    if attach:
        if not exists:
            raise StepFailed(f"no container {container} to attach to")
        log(f"attaching to {container}")
    else:
        if folder.exists() and not params.get("resume"):
            raise StepFailed(f"{folder} exists: pass resume to continue it, or pick another exp name")
        if exists:
            raise StepFailed(f"container {container} exists (running or left over); attach, or remove it by hand")
        busy = busy_gpus(runner, gpus, oc.gpu_busy_mib)
        if busy:
            held = " ".join(f"gpu{g}={mib}MiB" for g, mib in sorted(busy.items()))
            raise StepFailed(f"GPUs in use by someone else ({held}); pick free GPUs")
        norm_result = None
        if not norm_stats_path(oc, info).exists():
            log("norm stats missing: computing them first")
            norm_result = norm.run(
                {"config_name": name, "view": str(view), "config": params.get("config"), "dry_run": params.get("dry_run")},
                log,
                runner,
            )
        args = [
            f"--exp-name={exp}",
            f"--num-workers={int(params.get('num_workers') or oc.num_workers)}",
            f"--weight-loader.params-path={oc.weights}",
        ]
        if params.get("batch"):
            args.append(f"--batch-size={int(params['batch'])}")
        if params.get("steps"):
            args.append(f"--num-train-steps={int(params['steps'])}")
        if params.get("resume"):
            args.append("--resume")
        command = f"opic-train {shlex.quote(name)} {shlex.join(args)} > /workspace/wandb/{exp}.log 2>&1"
        argv = compose.run(command, env=train_env(gpus), name=container)
        log("$ " + shlex.join(argv))
        if params.get("dry_run"):
            return {"dry_run": True, "command": argv, "container": container, "norm": norm_result}
        record["openpi_commit"] = repo_commit(runner, oc.repo)
        record["started"] = now()
        runner.check(argv, env=compose.env())
        log(f"training started in {container}; log {host_log}")
    if "openpi_commit" not in record:
        record["openpi_commit"] = repo_commit(runner, oc.repo)
    try:
        last = _follow(runner, container, host_log, total, log, float(params.get("poll_sec", 15)), sleep)
    except JobCancelled:
        log(f"cancelled: stopping {container}")
        runner.run(["docker", "stop", "-t", "60", container])
        raise
    exit_code = int(runner.check(["docker", "inspect", "-f", "{{.State.ExitCode}}", container]).strip())
    runner.run(["docker", "rm", container])
    metrics = parse_metrics(host_log.read_text(encoding="utf-8", errors="replace")) if host_log.exists() else []
    folder.mkdir(parents=True, exist_ok=True)
    if metrics:
        keys = list(dict.fromkeys(k for row in metrics for k in row))
        with (folder / "metrics.csv").open("w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=keys)
            writer.writeheader()
            writer.writerows(metrics)
    record.update(ended=now(), exit_code=exit_code, last_step=last)
    write_json(folder / "console_train.json", record)
    if exit_code:
        raise StepFailed(f"training exited {exit_code}; see {host_log}")
    log(f"training finished at step {last}: {folder}")
    return {"run_dir": str(folder), "container": container, "last_step": last, "exit_code": exit_code}
```

(When resuming, `console_train.json` is overwritten with the latest attempt; `started` of the original is in the earlier job's status. That is enough for Plan 2.)

- [ ] **Step 4: Run the tests**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_norm_train.py -p no:cacheprovider`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
ruff check --config config/python/ruff.toml src/training
git add src/training/realman_training
git commit -m "feat(training): norm and train steps (detached container, GPU check, metrics, run record)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: `steps/eval.py` — per-task open-loop eval and prompt swap

**Files:**
- Create: `src/training/realman_training/realman_training/openpi_scripts/prompt_swap.py`
- Create: `src/training/realman_training/realman_training/steps/eval.py`
- Test: `src/training/realman_training/test/test_eval.py`

**Interfaces:**
- Consumes: `openpi.Compose/config_info/busy_gpus/parse_gpus/run_dir/require_view/check_holdout/script`, `lerobot_io.read_episodes`.
- Produces: `eval.run(params, log, runner=None) -> dict`; params `config_name`, `exp`, `view`, `gpu`, optional `checkpoints: list[int]` (default: the highest numeric checkpoint dir), `stride` (default `openpi.eval_stride`), `prompt_swap` (default: true when the view has two or more tasks), `dry_run`, `config`. Result `{"run_dir", "results": {step: {task: {"mae", "zero_baseline", "episodes"}, "prompt_swap": {task: {prompt_task: mae}}}}}`. Files: `<run_dir>/eval/<step>_<task>.json` (eval_open_loop output), `<run_dir>/eval/prompt_swap_<step>.json`, `<run_dir>/eval/summary.json` (merged with earlier evals). `eval.holdout_by_task(view, holdout) -> dict[str, dict]` → `{task: {"prompt", "episodes"}}`.

- [ ] **Step 1: Write the failing tests** — `test/test_eval.py`:

```python
from __future__ import annotations

import json
import shlex

import pytest
from fake_runner import FakeRunner, RecordingLog
from lerobot_fixture import build_view

from realman_training.jobs import StepFailed
from realman_training.steps import eval as eval_step

PLACE, PICK = "put it in the bin", "pick it up"
INFO = {"repo_id": "local/v", "asset_id": "local/v", "exclude_episode_indices": [1, 2, 3], "batch_size": 8, "num_train_steps": 10}


@pytest.fixture()
def env(tmp_path):
    view = build_view(
        tmp_path / "v", source="c", prompts={"pick_and_place": PLACE, "pick_only": PICK}, lengths=[10] * 4,
        tasks=["pick_and_place", "pick_and_place", "pick_only", "pick_only"],
    )
    docker_data = tmp_path / "dd"
    run = docker_data / "checkpoints/pi05_x/e1"
    for step in ("1000", "2000", "assets_not_a_step"):
        (run / step).mkdir(parents=True)
    config = tmp_path / "c.yaml"
    config.write_text(f"training_console:\n  openpi:\n    repo: {tmp_path / 'o'}\n    docker_data: {docker_data}\n")
    return {"view": view, "run": run, "config": str(config)}


def fake_eval(env):
    def write_eval(argv, input):
        inner = argv[-1]
        out = shlex.split(inner.split("eval_open_loop.py", 1)[1])
        path = out[out.index("--output") + 1].replace("/workspace/checkpoints/pi05_x/e1", str(env["run"]))
        mae = 0.1 if "1000" in path else 0.09
        open(path, "w").write(json.dumps({"mae": mae, "baseline_zeros": {"mae": 0.19}}))

    def write_swap(argv, input):
        args = shlex.split(argv[-1].split("python - ", 1)[1])
        path = args[2].replace("/workspace/checkpoints/pi05_x/e1", str(env["run"]))
        tasks = json.loads(args[3])
        open(path, "w").write(
            json.dumps({t: {o: {"prompt": tasks[o]["prompt"], "mae": 0.09 if t == o else 0.12} for o in tasks} for t in tasks})
        )

    return (
        FakeRunner()
        .on("eval_open_loop.py", action=write_eval)
        .on("python - pi05_x checkpoints", action=write_swap)
        .on("python -", stdout=json.dumps(INFO))
        .on("nvidia-smi", stdout="2, 4\n")
    )


def test_holdout_by_task_splits_the_configs_holdout(env):
    assert eval_step.holdout_by_task(env["view"], (1, 2, 3)) == {
        "pick_and_place": {"prompt": PLACE, "episodes": [1]},
        "pick_only": {"prompt": PICK, "episodes": [2, 3]},
    }


def test_eval_runs_each_task_then_the_prompt_swap_and_merges_a_summary(env):
    runner = fake_eval(env)
    params = {"config_name": "pi05_x", "exp": "e1", "view": str(env["view"]), "gpu": 2, "config": env["config"]}
    result = eval_step.run(params, RecordingLog(), runner=runner)
    assert result["results"]["2000"]["pick_only"] == {"mae": 0.09, "zero_baseline": 0.19, "episodes": [2, 3]}
    assert result["results"]["2000"]["prompt_swap"]["pick_only"] == {"pick_and_place": 0.12, "pick_only": 0.09}
    evals = runner.commands("eval_open_loop.py")
    assert len(evals) == 2  # latest checkpoint only, one per task
    inner = shlex.split(evals[1][-1].split("eval_open_loop.py", 1)[1])
    assert inner[inner.index("--episodes") + 1 : inner.index("--episodes") + 3] == ["2", "3"]
    assert inner[inner.index("--checkpoint-dir") + 1] == "checkpoints/pi05_x/e1/2000"
    assert runner.inputs[runner.calls.index(runner.commands("python - pi05_x checkpoints")[0])] == eval_step.script("prompt_swap")
    assert runner.envs[-1]["CONSOLE_GPUS"] == "2"
    eval_step.run({**params, "checkpoints": [1000], "prompt_swap": False}, RecordingLog(), runner=fake_eval(env))
    summary = json.loads((env["run"] / "eval/summary.json").read_text())
    assert sorted(summary) == ["1000", "2000"] and summary["1000"]["pick_and_place"]["mae"] == 0.1


def test_eval_refuses_a_busy_gpu_a_missing_checkpoint_and_several_gpus(env):
    params = {"config_name": "pi05_x", "exp": "e1", "view": str(env["view"]), "gpu": 2, "config": env["config"]}
    busy = FakeRunner().on("python -", stdout=json.dumps(INFO)).on("nvidia-smi", stdout="2, 20000\n")
    with pytest.raises(StepFailed, match="gpu2=20000"):
        eval_step.run(params, RecordingLog(), runner=busy)
    with pytest.raises(StepFailed, match="checkpoint 5000"):
        eval_step.run({**params, "checkpoints": [5000]}, RecordingLog(), runner=fake_eval(env))
    with pytest.raises(StepFailed, match="one GPU"):
        eval_step.run({**params, "gpu": "1,2"}, RecordingLog(), runner=fake_eval(env))


def test_eval_dry_run_lists_the_commands_only(env):
    runner = fake_eval(env)
    params = {"config_name": "pi05_x", "exp": "e1", "view": str(env["view"]), "gpu": 2, "config": env["config"], "dry_run": True}
    result = eval_step.run(params, RecordingLog(), runner=runner)
    assert result["dry_run"] is True and len(result["commands"]) == 3
    assert not (env["run"] / "eval" / "summary.json").exists()
```

- [ ] **Step 2: Run to see it fail**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_eval.py -p no:cacheprovider`
Expected: FAIL — `ImportError: cannot import name 'eval'`.

- [ ] **Step 3: Implement**

`openpi_scripts/prompt_swap.py` (generalised from server5090 `openpi-docker-data/wandb/prompt_swap_eval.py`; runs in the container, no `from __future__`):

```python
"""Run inside the openpi container: open-loop MAE of each task's held-out episodes with every task's prompt.

usage: uv run --no-sync python - CONFIG CHECKPOINT_DIR OUTPUT_JSON TASKS_JSON [STRIDE] < prompt_swap.py
TASKS_JSON = {"task": {"prompt": "...", "episodes": [9, 19]}, ...}
"""

import importlib.util
import json
import sys

from openpi.policies import policy_config as _policy_config
from openpi.training import config as _config
from openpi.training import lerobot_v3_dataset as _v3

_spec = importlib.util.spec_from_file_location("eval_open_loop", "/workspace/scripts/eval_open_loop.py")
eol = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(eol)

name, checkpoint, output, tasks_json = sys.argv[1:5]
stride = int(sys.argv[5]) if len(sys.argv) > 5 else 10
tasks = json.loads(tasks_json)
cfg = _config.get_config(name)
data_config = cfg.data.create(cfg.assets_dirs, cfg.model)
policy = _policy_config.create_trained_policy(cfg, checkpoint)
result = {}
for task, held_out in tasks.items():
    for prompt_task, prompt_spec in tasks.items():
        dataset = _v3.LocalLeRobotV3Dataset(
            data_config.dataset_root,
            action_horizon=cfg.model.action_horizon,
            video_keys=data_config.video_keys,
            episode_indices=held_out["episodes"],
            action_padding=data_config.action_padding,
            action_padding_hold_dims=data_config.action_padding_hold_dims,
            prompt_override=prompt_spec["prompt"],
        )
        r = eol.evaluate(policy, dataset, eol.make_repack(data_config), stride=stride)
        result.setdefault(task, {})[prompt_task] = {
            "prompt": prompt_spec["prompt"], "mae": r["mae"], "mae_per_dim": r["mae_per_dim"]
        }
        print(f"{task} with the {prompt_task} prompt: MAE {r['mae']:.4f}", flush=True)
with open(output, "w") as handle:
    json.dump(result, handle, indent=2)
```

`steps/eval.py`:

```python
"""Open-loop evaluation of checkpoints per task on the config's held-out episodes, plus a prompt-swap test for
multi-task runs (every task's held-out frames with every task's prompt). One GPU, refused when someone holds it."""

from __future__ import annotations

import json
import shlex
from pathlib import Path

from ..config import load_config
from ..jobs import StepFailed, write_json
from ..lerobot_io import read_episodes
from ..openpi import (
    Compose,
    busy_gpus,
    check_holdout,
    config_info,
    parse_gpus,
    require_view,
    run_dir,
    script,
)
from ..runner import Runner, compact

ENV = {"XLA_PYTHON_CLIENT_PREALLOCATE": "false"}


def holdout_by_task(view: str | Path, holdout: tuple[int, ...]) -> dict[str, dict]:
    view = Path(view)
    contract = json.loads((view / "contract.json").read_text(encoding="utf-8"))
    task_of_prompt = {prompt: task for task, prompt in (contract.get("prompts") or {}).items()}
    tasks: dict[str, dict] = {}
    for episode in read_episodes(view):
        if episode.index in holdout:
            task = task_of_prompt.get(episode.task, episode.task)
            tasks.setdefault(task, {"prompt": episode.task, "episodes": []})["episodes"].append(episode.index)
    return dict(sorted(tasks.items()))


def run(params: dict, log, runner: Runner | None = None) -> dict:
    runner = runner or Runner()
    config = load_config(params.get("config"))
    oc = config.openpi
    name, exp = params["config_name"], str(params["exp"])
    view = Path(params["view"]).expanduser().resolve()
    gpus = parse_gpus(params["gpu"])
    if len(gpus) != 1:
        raise StepFailed("eval uses one GPU")
    folder = run_dir(oc, name, exp)
    if not folder.is_dir():
        raise StepFailed(f"no run directory {folder}")
    available = sorted(int(p.name) for p in folder.iterdir() if p.is_dir() and p.name.isdigit())
    steps = [int(s) for s in params.get("checkpoints") or available[-1:]]
    for step in steps:
        if step not in available:
            raise StepFailed(f"checkpoint {step} not in {folder} (have {available})")
    summary = require_view(view)
    compose = Compose(oc, view, gpus)
    info = config_info(runner, compose, name)
    check_holdout(info, summary)
    busy = busy_gpus(runner, gpus, oc.gpu_busy_mib)
    if busy:
        held = " ".join(f"gpu{g}={mib}MiB" for g, mib in sorted(busy.items()))
        raise StepFailed(f"GPU in use by someone else ({held}); pick a free GPU")
    tasks = holdout_by_task(view, info.holdout)
    if not tasks:
        raise StepFailed(f"config {name} has no held-out episodes in {view.name}")
    stride = int(params.get("stride") or oc.eval_stride)
    swap = params.get("prompt_swap")
    swap = len(tasks) > 1 if swap is None else bool(swap)
    inside = f"/workspace/checkpoints/{name}/{exp}"
    (folder / "eval").mkdir(exist_ok=True) if not params.get("dry_run") else None
    commands, results = [], {}
    total = len(steps) * (len(tasks) + int(swap))
    done = 0
    for step in steps:
        checkpoint = f"checkpoints/{name}/{exp}/{step}"
        for task, held_out in tasks.items():
            args = ["--config-name", name, "--checkpoint-dir", checkpoint, "--episodes", *map(str, held_out["episodes"]),
                    "--stride", str(stride), "--output", f"{inside}/eval/{step}_{task}.json"]
            argv = compose.run("uv run --no-sync scripts/eval_open_loop.py " + shlex.join(args), env=ENV)
            commands.append(argv)
            log(f"checkpoint {step}, task {task}: episodes {held_out['episodes']}")
            if params.get("dry_run"):
                log("$ " + shlex.join(argv))
                continue
            code = runner.stream(argv, lambda line: log(compact(line)) if "MAE" in line or "Error" in line else None,
                                 env=compose.env())
            if code:
                raise StepFailed(f"eval of {step}/{task} exited {code}")
            data = json.loads((folder / "eval" / f"{step}_{task}.json").read_text(encoding="utf-8"))
            results.setdefault(str(step), {})[task] = {
                "mae": data["mae"], "zero_baseline": data["baseline_zeros"]["mae"], "episodes": held_out["episodes"]
            }
            done += 1
            log.progress(done, total, f"{step} {task}: MAE {data['mae']:.4f}")
        if swap:
            args = [name, checkpoint, f"{inside}/eval/prompt_swap_{step}.json", json.dumps(tasks), str(stride)]
            argv = compose.run("uv run --no-sync python - " + shlex.join(args), env=ENV)
            commands.append(argv)
            if params.get("dry_run"):
                log("$ " + shlex.join(argv))
                continue
            code = runner.stream(argv, lambda line: log(compact(line)), input=script("prompt_swap"), env=compose.env())
            if code:
                raise StepFailed(f"prompt swap of {step} exited {code}")
            data = json.loads((folder / "eval" / f"prompt_swap_{step}.json").read_text(encoding="utf-8"))
            results[str(step)]["prompt_swap"] = {t: {o: v["mae"] for o, v in row.items()} for t, row in data.items()}
            done += 1
            log.progress(done, total, f"{step} prompt swap")
    if params.get("dry_run"):
        return {"dry_run": True, "commands": commands}
    summary_path = folder / "eval" / "summary.json"
    merged = json.loads(summary_path.read_text(encoding="utf-8")) if summary_path.exists() else {}
    for step, block in results.items():
        merged.setdefault(step, {}).update(block)
    write_json(summary_path, merged)
    return {"run_dir": str(folder), "results": results}
```

Replace the conditional-expression `mkdir` line with a plain `if not params.get("dry_run"): (folder / "eval").mkdir(exist_ok=True)` when implementing (ruff accepts both; the plain `if` reads better).

- [ ] **Step 4: Run the tests**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_eval.py -p no:cacheprovider`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
ruff check --config config/python/ruff.toml src/training
git add src/training/realman_training
git commit -m "feat(training): eval step (per-task open-loop MAE, prompt swap, merged summary)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: `steps/register.py` — model card and registry row

Format follows the hand-written cards of 2026-10-14/16 (`checkpoints/<config>/<exp>/MODEL_CARD.md` + `model_card.json`, registry `checkpoints/MODELS.md`, Chinese).

**Files:**
- Create: `src/training/realman_training/realman_training/steps/register.py`
- Test: `src/training/realman_training/test/test_register.py`

**Interfaces:**
- Consumes: `openpi.run_dir`, `datasets.summarize`, `jobs.write_json/StepFailed/now`, `lerobot_io.read_episodes`.
- Produces: `register.run(params, log, runner=None) -> dict`; params `config_name`, `exp`, optional `status` (default `"已训练，开环评估完成；未部署"`), `method`, `force`, `config`. Result `{"card", "card_json", "registry"}`. `register.MARKER = "<!-- generated by realman-train register -->"`. `register.registry_row(card) -> str`. `register.update_registry(path, row_key, row) -> None`.

- [ ] **Step 1: Write the failing tests** — `test/test_register.py`:

```python
from __future__ import annotations

import json

import pytest
from fake_runner import RecordingLog
from lerobot_fixture import build_view, write_clean_manifest

from realman_training.jobs import StepFailed
from realman_training.steps import register

PLACE, PICK = "put it in the bin", "pick it up"
EXISTING = """# 模型登记表（server5090 openpi checkpoints）

| run | config | 训练时间 (CST) | 数据集 / 任务 | 状态 |
|---|---|---|---|---|
| `pi05_old/a` | pi05_old | 2026-10-14 01:09–06:12 | old | ✅ |

注：手写的说明。
"""


@pytest.fixture()
def env(tmp_path):
    clean = tmp_path / "data" / "x_clean"
    clean.mkdir(parents=True)
    write_clean_manifest(clean, source="/data/raw", removed={3: "starts closed"})
    view = build_view(
        tmp_path / "data" / "x_clean_view", source=str(clean), prompts={"pick_and_place": PLACE, "pick_only": PICK},
        lengths=[10, 10, 10], tasks=["pick_and_place", "pick_and_place", "pick_only"],
    )
    dd = tmp_path / "dd"
    run = dd / "checkpoints/pi05_x/e1"
    (run / "1000").mkdir(parents=True)
    (run / "2000").mkdir()
    (run / "eval").mkdir()
    (run / "console_train.json").write_text(json.dumps({
        "config": "pi05_x", "exp": "e1", "view": str(view), "gpus": [1, 2], "batch_size": 16, "num_train_steps": 2000,
        "holdout": [1, 2], "weights": "/w", "openpi_commit": "abc", "started": "2026-10-21T09:54:38+08:00",
        "ended": "2026-10-21T16:09:40+08:00", "exit_code": 0,
    }))
    (run / "eval/summary.json").write_text(json.dumps({"2000": {
        "pick_and_place": {"mae": 0.0962, "zero_baseline": 0.1941, "episodes": [1]},
        "pick_only": {"mae": 0.092, "zero_baseline": 0.1895, "episodes": [2]},
        "prompt_swap": {"pick_and_place": {"pick_and_place": 0.0962, "pick_only": 0.1121},
                        "pick_only": {"pick_and_place": 0.1164, "pick_only": 0.0923}},
    }}))
    (dd / "checkpoints/MODELS.md").write_text(EXISTING)
    config = tmp_path / "c.yaml"
    config.write_text(f"training_console:\n  openpi:\n    docker_data: {dd}\n")
    return {"run": run, "dd": dd, "config": str(config), "view": view}


def params(env, **extra):
    return {"config_name": "pi05_x", "exp": "e1", "config": env["config"], **extra}


def test_register_writes_the_card_json_markdown_and_a_registry_row(env):
    result = register.run(params(env), RecordingLog())
    card = json.loads((env["run"] / "model_card.json").read_text())
    assert card["exp_name"] == "e1" and card["config"] == "pi05_x" and card["batch_size"] == 16
    assert card["tasks"] == {
        "pick_and_place": {"prompt": PLACE, "episodes": [0, 1], "count": 2},
        "pick_only": {"prompt": PICK, "episodes": [2, 2], "count": 1},
    }
    assert card["holdout_episodes"] == [1, 2] and card["checkpoints"] == [1000, 2000]
    assert card["open_loop_eval"] == {"2000": {"pick_and_place": 0.0962, "pick_only": 0.092},
                                      "zero_baseline": {"pick_and_place": 0.1941, "pick_only": 0.1895}}
    assert card["prompt_swap_2000"] == {"pick_and_place_correct": 0.0962, "pick_and_place_swapped": 0.1121,
                                        "pick_only_correct": 0.0923, "pick_only_swapped": 0.1164}
    assert card["dataset_source"].startswith("/data/raw") and "removed 1" in card["dataset_source"]
    markdown = (env["run"] / "MODEL_CARD.md").read_text()
    assert markdown.startswith("# e1") and register.MARKER in markdown and PLACE in markdown and "0.0962" in markdown
    registry = (env["dd"] / "checkpoints/MODELS.md").read_text()
    assert "| `pi05_old/a` |" in registry and "注：手写的说明。" in registry  # other rows and notes kept
    row = [line for line in registry.splitlines() if line.startswith("| `pi05_x/e1` |")]
    assert len(row) == 1 and "2026-10-21 09:54–16:09" in row[0] and "已训练" in row[0]
    assert registry.index("`pi05_old/a`") < registry.index("`pi05_x/e1`") < registry.index("注：")
    assert result["registry"].endswith("MODELS.md")


def test_registering_again_replaces_the_row_and_keeps_one(env):
    register.run(params(env), RecordingLog())
    register.run(params(env, status="已部署"), RecordingLog())
    registry = (env["dd"] / "checkpoints/MODELS.md").read_text()
    rows = [line for line in registry.splitlines() if line.startswith("| `pi05_x/e1` |")]
    assert len(rows) == 1 and rows[0].rstrip().endswith("已部署 |")


def test_a_hand_written_card_is_not_overwritten_without_force(env):
    (env["run"] / "MODEL_CARD.md").write_text("# hand written\n")
    with pytest.raises(StepFailed, match="hand-written"):
        register.run(params(env), RecordingLog())
    register.run(params(env, force=True), RecordingLog())
    backups = list(env["run"].glob("MODEL_CARD.md.bak-*"))
    assert len(backups) == 1 and backups[0].read_text() == "# hand written\n"


def test_a_run_without_a_train_record_is_refused(env):
    (env["run"] / "console_train.json").unlink()
    with pytest.raises(StepFailed, match="console_train.json"):
        register.run(params(env), RecordingLog())


def test_a_missing_registry_is_created(env):
    (env["dd"] / "checkpoints/MODELS.md").unlink()
    register.run(params(env), RecordingLog())
    text = (env["dd"] / "checkpoints/MODELS.md").read_text()
    assert text.startswith("# 模型登记表") and "| `pi05_x/e1` |" in text
```

- [ ] **Step 2: Run to see it fail**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_register.py -p no:cacheprovider`
Expected: FAIL — `ImportError: cannot import name 'register'`.

- [ ] **Step 3: Implement `steps/register.py`**

```python
"""Model card (model_card.json + MODEL_CARD.md) for a finished run and its row in checkpoints/MODELS.md.

Inputs: the run's console_train.json (written by the train step), eval/summary.json (eval step), the training view
and its cleaned source. Hand-written cards (no MARKER) are only replaced with force, after a backup.
"""

from __future__ import annotations

import datetime
import json
from pathlib import Path

from ..config import load_config
from ..datasets import summarize
from ..jobs import StepFailed, now, write_json
from ..lerobot_io import read_episodes
from ..openpi import run_dir

MARKER = "<!-- generated by realman-train register -->"
DEFAULT_STATUS = "已训练，开环评估完成；未部署"
DEFAULT_METHOD = "pi0.5 fine-tune from pi05_base (recipe in the openpi config)"
REGISTRY_HEADER = """# 模型登记表（server5090 openpi checkpoints）

每个训练 run 目录里有 `MODEL_CARD.md` + `model_card.json`，记录方法、时间与数据集。

| run | config | 训练时间 (CST) | 数据集 / 任务 | 状态 |
|---|---|---|---|---|
"""


def _span(start: str | None, end: str | None) -> str:
    if not start:
        return "-"
    a = datetime.datetime.fromisoformat(start)
    if not end:
        return f"{a:%Y-%m-%d %H:%M}–"
    b = datetime.datetime.fromisoformat(end)
    return f"{a:%Y-%m-%d %H:%M}–{b:%H:%M}" if a.date() == b.date() else f"{a:%Y-%m-%d %H:%M}–{b:%Y-%m-%d %H:%M}"


def _tasks(view: Path) -> dict[str, dict]:
    contract = json.loads((view / "contract.json").read_text(encoding="utf-8"))
    task_of_prompt = {prompt: task for task, prompt in (contract.get("prompts") or {}).items()}
    tasks: dict[str, dict] = {}
    for episode in read_episodes(view):
        task = task_of_prompt.get(episode.task, episode.task)
        entry = tasks.setdefault(task, {"prompt": episode.task, "episodes": [episode.index, episode.index], "count": 0})
        entry["episodes"] = [min(entry["episodes"][0], episode.index), max(entry["episodes"][1], episode.index)]
        entry["count"] += 1
    return tasks


def _source(view: Path) -> str:
    contract = json.loads((view / "contract.json").read_text(encoding="utf-8"))
    source = contract.get("source")
    if not source:
        return "-"
    manifest = Path(f"{source}.clean_manifest.json")
    if manifest.is_file():
        data = json.loads(manifest.read_text(encoding="utf-8"))
        origin = data.get("origin") or data.get("source")
        return f"{origin} -> {source} (removed {len(data.get('removed') or {})})"
    return str(source)


def registry_row(card: dict) -> str:
    tasks = "，".join(f"{t} {v['count']} 条（\"{v['prompt']}\"）" for t, v in card["tasks"].items())
    view = Path(card["dataset_dir"]).name
    return (
        f"| `{card['config']}/{card['exp_name']}` | {card['config']} | {_span(card['trained_start'], card['trained_end'])}"
        f" | `{view}`：{card['episodes']} 条 = {tasks} | {card['status']} |"
    )


def update_registry(path: Path, row_key: str, row: str) -> None:
    lines = path.read_text(encoding="utf-8").splitlines() if path.exists() else REGISTRY_HEADER.rstrip("\n").splitlines()
    for i, line in enumerate(lines):
        if line.startswith(row_key):
            lines[i] = row
            break
    else:
        table = [i for i, line in enumerate(lines) if line.startswith("|")]
        lines.insert(table[-1] + 1 if table else len(lines), row)
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def _markdown(card: dict) -> str:
    rows = [
        ("训练时间", _span(card["trained_start"], card["trained_end"])),
        ("训练方法", f"openpi `{card['config']}`：{card['method']}"),
        ("超参", f"batch {card['batch_size']}，{card['num_train_steps']} steps"),
        ("硬件", card["gpus"]),
        ("代码", f"openpi @ {card['openpi_commit']}"),
        ("数据集", f"`{card['dataset_dir']}`（{card['episodes']} 条 / {card['frames']} 帧，arm={card['arm']}，相机 {' + '.join(card['cameras'])}）"),
        ("数据来源", card["dataset_source"]),
        ("任务 / prompt", "<br>".join(
            f"{t}（{v['count']} 条，ep {v['episodes'][0]}–{v['episodes'][1]}）：`{v['prompt']}`" for t, v in card["tasks"].items()
        )),
        ("留出", ", ".join(map(str, card["holdout_episodes"]))),
        ("checkpoint", "、".join(f"`{s}`" for s in card["checkpoints"])),
    ]
    lines = [f"# {card['exp_name']} — {card['config']}", "", MARKER, "", "| 项目 | 内容 |", "|---|---|"]
    lines += [f"| {k} | {v} |" for k, v in rows]
    evals = {k: v for k, v in card["open_loop_eval"].items() if k != "zero_baseline"}
    if evals:
        tasks = list(card["tasks"])
        baseline = card["open_loop_eval"].get("zero_baseline", {})
        lines += ["", "## 开环评估（留出集）", "", "| checkpoint | " + " | ".join(
            f"{t} MAE（全零基线 {baseline.get(t, float('nan')):.3f}）" for t in tasks
        ) + " |", "|---|" + "---|" * len(tasks)]
        for step, block in sorted(evals.items(), key=lambda item: int(item[0])):
            lines.append(f"| {step} | " + " | ".join(f"{block.get(t, float('nan')):.4f}" for t in tasks) + " |")
    for key, swap in card.items():
        if key.startswith("prompt_swap_"):
            step = key.removeprefix("prompt_swap_")
            parts = [f"{t} {swap[f'{t}_correct']:.4f}（正确）→ {swap[f'{t}_swapped']:.4f}（换 prompt）" for t in card["tasks"]
                     if f"{t}_correct" in swap]
            lines += ["", f"prompt 交换测试（`{step}`）：" + "；".join(parts) + "。"]
    lines += ["", "## 标记", "", f"- 状态：{card['status']}", f"- 本文件由 realman-train register 于 {card['card_written']} 写。", ""]
    return "\n".join(lines)


def run(params: dict, log, runner=None) -> dict:
    config = load_config(params.get("config"))
    name, exp = params["config_name"], str(params["exp"])
    folder = run_dir(config.openpi, name, exp)
    record_path = folder / "console_train.json"
    if not record_path.is_file():
        raise StepFailed(f"{record_path} missing: register needs a run started by `realman-train train`")
    record = json.loads(record_path.read_text(encoding="utf-8"))
    view = Path(record["view"])
    summary = summarize(view)
    evals_path = folder / "eval" / "summary.json"
    evals = json.loads(evals_path.read_text(encoding="utf-8")) if evals_path.exists() else {}
    open_loop: dict = {}
    swaps: dict = {}
    for step, block in evals.items():
        for task, result in block.items():
            if task == "prompt_swap":
                swaps[f"prompt_swap_{step}"] = {
                    **{f"{t}_correct": row[t] for t, row in result.items()},
                    **{f"{t}_swapped": sum(v for o, v in row.items() if o != t) / max(1, len(row) - 1)
                       for t, row in result.items()},
                }
                continue
            open_loop.setdefault(step, {})[task] = result["mae"]
            open_loop.setdefault("zero_baseline", {})[task] = result["zero_baseline"]
    contract = json.loads((view / "contract.json").read_text(encoding="utf-8"))
    card = {
        "exp_name": exp,
        "config": name,
        "method": params.get("method") or DEFAULT_METHOD,
        "trained_start": record.get("started"),
        "trained_end": record.get("ended"),
        "batch_size": record.get("batch_size"),
        "num_train_steps": record.get("num_train_steps"),
        "gpus": f"{len(record.get('gpus', []))}x GPU (server5090 GPU {','.join(map(str, record.get('gpus', [])))})",
        "openpi_commit": record.get("openpi_commit"),
        "dataset_dir": str(view),
        "dataset_source": _source(view),
        "tasks": _tasks(view),
        "episodes": summary.episodes,
        "frames": summary.frames,
        "holdout_episodes": record.get("holdout", []),
        "cameras": [c.key for c in summary.cameras],
        "arm": contract.get("arm"),
        "checkpoints": sorted(int(p.name) for p in folder.iterdir() if p.is_dir() and p.name.isdigit()),
        "open_loop_eval": open_loop,
        **swaps,
        "status": params.get("status") or DEFAULT_STATUS,
        "card_written": now(),
    }
    markdown_path = folder / "MODEL_CARD.md"
    if markdown_path.exists() and MARKER not in markdown_path.read_text(encoding="utf-8"):
        if not params.get("force"):
            raise StepFailed(f"{markdown_path} is hand-written; pass force to replace it (a backup is kept)")
        backup = folder / f"MODEL_CARD.md.bak-{datetime.datetime.now():%Y%m%d_%H%M%S}"
        markdown_path.rename(backup)
        log(f"kept the hand-written card as {backup.name}")
    write_json(folder / "model_card.json", card)
    markdown_path.write_text(_markdown(card), encoding="utf-8")
    registry = config.openpi.docker_data / "checkpoints" / "MODELS.md"
    update_registry(registry, f"| `{name}/{exp}` |", registry_row(card))
    log(f"card {markdown_path}; registry {registry}")
    return {"card": str(markdown_path), "card_json": str(folder / "model_card.json"), "registry": str(registry)}
```

- [ ] **Step 4: Run the tests**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_register.py -p no:cacheprovider`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
ruff check --config config/python/ruff.toml src/training
git add src/training/realman_training
git commit -m "feat(training): register step writes the model card and the registry row

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: CLI subcommands

**Files:**
- Modify: `src/training/realman_training/realman_training/cli.py`
- Test: `src/training/realman_training/test/test_cli.py` (append)

**Interfaces:**
- Consumes: `JobStore`, `STEPS`, `clean.default_dst`, `pull.default_target`, `view.default_dst`, `quality.inspect_dataset/suggested_drops`.
- Produces:
  - `parse_episodes(text) -> list[int]` ("1,2,5-7" → [1, 2, 5, 6, 7]).
  - `build_params(args, config) -> tuple[str, dict]` (kind, params) for every step subcommand; params always carry `"config": str(config.source)`.
  - Subcommands (all step commands take `--background`, `--json`):
    - `pull [--dataset NAME] [--name DIR]`
    - `clean SRC (--drop LIST | --keep LIST | --suggested) [--reasons FILE] [--dst DIR]`
    - `view SRC [--dst DIR] [--task-prompt TASK=PROMPT ...] [--arm r] [--dry-run]`
    - `norm CONFIG_NAME VIEW [--force] [--dry-run]`
    - `train CONFIG_NAME VIEW --exp NAME --gpus LIST [--batch N] [--steps N] [--resume] [--attach] [--dry-run] [--yes]` (refuses without `--yes` unless `--dry-run` or `--attach`)
    - `eval CONFIG_NAME EXP --view VIEW --gpu N [--checkpoints LIST] [--stride N] [--no-prompt-swap] [--dry-run]`
    - `register CONFIG_NAME EXP [--status TEXT] [--method TEXT] [--force]`
    - `jobs [--kind K] [--limit N] [--json]`, `job ID [--log]`, `cancel ID`
  - Foreground = start the job, stream its log, Ctrl-C cancels it; exit 0 on `succeeded`, 1 otherwise; `--background` prints the job id and returns 0.

- [ ] **Step 1: Write the failing tests** — append to `test/test_cli.py`:

```python
from realman_training.cli import build_params, parse_episodes
from realman_training.config import load_config
from realman_training.jobs import JobStore


def test_parse_episodes():
    assert parse_episodes("1,2,5-7") == [1, 2, 5, 6, 7]
    assert parse_episodes(" 3 ") == [3]
    with pytest.raises(ValueError):
        parse_episodes("7-5")


def cli_args(argv):
    from realman_training.cli import make_parser

    return make_parser().parse_args(argv)


def test_build_params_for_each_step(setup, tmp_path):
    raw, view, config_path = setup
    config = load_config(config_path)
    kind, params = build_params(cli_args(["pull"]), config)
    assert kind == "pull" and params["target"].startswith(str(tmp_path / "data" / "raw_realman_ts_"))
    assert params["config"] == str(config_path.resolve())
    kind, params = build_params(cli_args(["clean", str(raw), "--drop", "1"]), config)
    assert (kind, params["drop"]) == ("clean", [1]) and "_clean_" in params["dst"]
    _, params = build_params(cli_args(["clean", str(raw), "--suggested"]), config)
    assert params["drop"] == [1] and "closed plateau" in params["reasons"]["1"]
    kind, params = build_params(cli_args(["view", str(raw), "--task-prompt", "pick_only=hold it", "--dry-run"]), config)
    assert params["task_prompts"] == {"pick_only": "hold it"} and params["dry_run"] is True
    assert params["dst"].endswith("realman__pi05-three-arm_view")
    kind, params = build_params(cli_args(["train", "pi05_x", str(view), "--exp", "e1", "--gpus", "1,2", "--batch", "16", "--yes"]), config)
    assert (kind, params["gpus"], params["batch"], params["exp"]) == ("train", "1,2", 16, "e1")
    kind, params = build_params(cli_args(["eval", "pi05_x", "e1", "--view", str(view), "--gpu", "2", "--checkpoints", "1000,2000", "--no-prompt-swap"]), config)
    assert params["checkpoints"] == [1000, 2000] and params["prompt_swap"] is False
    kind, params = build_params(cli_args(["register", "pi05_x", "e1", "--status", "已部署"]), config)
    assert (kind, params["status"]) == ("register", "已部署")


def test_train_without_yes_is_refused_and_starts_nothing(setup, capsys):
    _, view, config_path = setup
    code = main(["--config", str(config_path), "train", "pi05_x", str(view), "--exp", "e1", "--gpus", "1"])
    assert code == 2 and "--yes" in capsys.readouterr().err
    assert JobStore(load_config(config_path).console_dir).list() == []


def test_clean_runs_as_a_job_in_the_foreground_and_shows_up_in_jobs(setup, tmp_path, capsys):
    raw, _, config_path = setup
    dst = tmp_path / "data" / "cleaned"
    assert main(["--config", str(config_path), "clean", str(raw), "--drop", "1", "--dst", str(dst)]) == 0
    assert dst.is_dir()
    capsys.readouterr()
    assert main(["--config", str(config_path), "jobs", "--json"]) == 0
    jobs = json.loads(capsys.readouterr().out)
    assert jobs[0]["kind"] == "clean" and jobs[0]["state"] == "succeeded"
    assert main(["--config", str(config_path), "job", jobs[0]["id"], "--log"]) == 0
    assert "built" in capsys.readouterr().out


def test_a_failed_step_exits_1_with_the_reason(setup, tmp_path, capsys):
    raw, _, config_path = setup
    (tmp_path / "data" / "exists").mkdir()
    code = main(["--config", str(config_path), "clean", str(raw), "--drop", "1", "--dst", str(tmp_path / "data" / "exists")])
    assert code == 1 and "exists" in capsys.readouterr().err


def test_background_returns_the_job_id(setup, tmp_path, capsys):
    raw, _, config_path = setup
    code = main(["--config", str(config_path), "clean", str(raw), "--drop", "1", "--dst", str(tmp_path / "data" / "bg"), "--background"])
    assert code == 0
    job_id = capsys.readouterr().out.strip()
    store = JobStore(load_config(config_path).console_dir)
    assert store.wait(job_id, lambda line: None)["state"] == "succeeded"
```

- [ ] **Step 2: Run to see it fail**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_cli.py -p no:cacheprovider`
Expected: FAIL — `ImportError: cannot import name 'build_params'`.

- [ ] **Step 3: Implement**

Restructure `cli.py`: keep `_size`, `_summary_text`, `_cmd_list`, `_cmd_inspect` unchanged. Move parser construction into `make_parser()` and add:

```python
import time

from .jobs import JobConflict, JobStore
from .steps import clean as clean_step
from .steps import pull as pull_step
from .steps import view as view_step

STEP_COMMANDS = ("pull", "clean", "view", "norm", "train", "eval", "register")


def parse_episodes(text: str) -> list[int]:
    episodes: list[int] = []
    for part in str(text).split(","):
        part = part.strip()
        if not part:
            continue
        if "-" in part:
            low, high = (int(x) for x in part.split("-", 1))
            if high < low:
                raise ValueError(f"bad range {part!r}")
            episodes.extend(range(low, high + 1))
        else:
            episodes.append(int(part))
    return episodes


def _task_prompts(pairs: list[str] | None) -> dict[str, str]:
    prompts = {}
    for pair in pairs or []:
        if "=" not in pair:
            raise ValueError(f"--task-prompt wants task=prompt, got {pair!r}")
        task, prompt = pair.split("=", 1)
        prompts[task.strip()] = prompt.strip()
    return prompts


def build_params(args, config) -> tuple[str, dict]:
    base = {"config": str(config.source)}
    command = args.command
    if command == "pull":
        target = config.data_root / args.name if args.name else pull_step.default_target(config.data_root)
        return "pull", {**base, "target": str(target), **({"dataset": args.dataset} if args.dataset else {})}
    if command == "clean":
        src = Path(args.src).expanduser().resolve()
        params = {**base, "src": str(src), "dst": str(Path(args.dst).expanduser() if args.dst else clean_step.default_dst(config.data_root, src))}
        if args.reasons:
            params["reasons"] = json.loads(Path(args.reasons).read_text(encoding="utf-8"))
        if args.suggested:
            quality = inspect_dataset(src, config.quality)
            params["drop"] = suggested_drops(quality)
            params["reasons"] = {
                str(q.episode): "; ".join(f.message for f in q.findings if f.severity == "drop")
                for q in quality if q.verdict == "suggest_drop"
            } | params.get("reasons", {})
        elif args.keep is not None:
            params["keep"] = parse_episodes(args.keep)
        else:
            params["drop"] = parse_episodes(args.drop)
        return "clean", params
    if command == "view":
        src = Path(args.src).expanduser().resolve()
        dst = Path(args.dst).expanduser() if args.dst else view_step.default_dst(config.data_root, src)
        return "view", {**base, "src": str(src), "dst": str(dst), "task_prompts": _task_prompts(args.task_prompt),
                        "dry_run": args.dry_run, **({"arm": args.arm} if args.arm else {})}
    if command == "norm":
        return "norm", {**base, "config_name": args.config_name, "view": str(Path(args.view).expanduser().resolve()),
                        "force": args.force, "dry_run": args.dry_run}
    if command == "train":
        return "train", {**base, "config_name": args.config_name, "view": str(Path(args.view).expanduser().resolve()),
                         "exp": args.exp, "gpus": args.gpus, "batch": args.batch, "steps": args.steps,
                         "resume": args.resume, "attach": args.attach, "dry_run": args.dry_run}
    if command == "eval":
        return "eval", {**base, "config_name": args.config_name, "exp": args.exp,
                        "view": str(Path(args.view).expanduser().resolve()), "gpu": args.gpu,
                        "checkpoints": parse_episodes(args.checkpoints) if args.checkpoints else None,
                        "stride": args.stride, "prompt_swap": False if args.no_prompt_swap else None,
                        "dry_run": args.dry_run}
    if command == "register":
        return "register", {**base, "config_name": args.config_name, "exp": args.exp, "status": args.status,
                            "method": args.method, "force": args.force}
    raise ValueError(f"not a step: {command}")


def _run_step(args, config) -> int:
    if args.command == "train" and not (args.yes or args.dry_run or args.attach):
        print("error: training occupies GPUs for hours; check the command with --dry-run, then add --yes", file=sys.stderr)
        return 2
    kind, params = build_params(args, config)
    store = JobStore(config.console_dir)
    store.recover()
    try:
        job = store.start(kind, params)
    except JobConflict as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
    if args.background:
        print(job.id)
        return 0
    print(f"job {job.id}: log {job.dir / 'log.txt'}", file=sys.stderr)
    try:
        status = store.wait(job.id, lambda line: print(line, flush=True))
    except KeyboardInterrupt:
        print("cancelling…", file=sys.stderr)
        store.cancel(job.id)
        status = store.wait(job.id, lambda line: print(line, flush=True))
    if status["state"] != "succeeded":
        print(f"{kind} {status['state']}: {status.get('error')}", file=sys.stderr)
        return 1
    if args.json:
        print(json.dumps(status.get("result"), ensure_ascii=False, indent=2))
    return 0


def _job_row(job) -> dict:
    status = job.status()
    return {k: status.get(k) for k in ("id", "kind", "state", "created", "started", "ended", "error", "progress")}


def _cmd_jobs(args, config) -> int:
    store = JobStore(config.console_dir)
    store.recover()
    if args.command == "cancel":
        print("cancel sent" if store.cancel(args.id) else "not running")
        return 0
    if args.command == "job":
        job = store.get(args.id)
        print(job.log_text() if args.log else json.dumps(job.status(), ensure_ascii=False, indent=2))
        return 0
    rows = [_job_row(job) for job in store.list(kind=args.kind, limit=args.limit)]
    if args.json:
        print(json.dumps(rows, ensure_ascii=False, indent=2))
        return 0
    for row in rows:
        progress = row["progress"] or {}
        extra = progress.get("text") or row["error"] or ""
        print(f"{row['id']:34} {row['kind']:9} {row['state']:12} {extra}")
    return 0
```

`make_parser()`:

```python
def make_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="realman-train", description=__doc__)
    parser.add_argument("--config", help="console config (default: config/training/training_console.yaml)")
    sub = parser.add_subparsers(dest="command", required=True)
    listing = sub.add_parser("list", help="list the datasets under data_root")
    listing.add_argument("--root", help="search here instead of data_root")
    listing.add_argument("--json", action="store_true")
    inspecting = sub.add_parser("inspect", help="summary and per-episode quality of one dataset")
    inspecting.add_argument("path")
    inspecting.add_argument("--json", action="store_true")
    inspecting.add_argument("--no-quality", action="store_true", help="summary only")

    def step(name: str, help_text: str) -> argparse.ArgumentParser:
        p = sub.add_parser(name, help=help_text)
        p.add_argument("--background", action="store_true", help="start the job and return its id")
        p.add_argument("--json", action="store_true", help="print the result as JSON")
        return p

    p = step("pull", "copy the recording from realman_ts into a new raw_realman_ts_<datetime> directory")
    p.add_argument("--dataset", help="recording name (default: remote.dataset)")
    p.add_argument("--name", help="target directory name under data_root")
    p = step("clean", "write a new dataset without the given episodes")
    p.add_argument("src")
    group = p.add_mutually_exclusive_group(required=True)
    group.add_argument("--drop", help="episodes to drop, e.g. 13,28,40-44")
    group.add_argument("--keep", help="episodes to keep (a subset)")
    group.add_argument("--suggested", action="store_true", help="drop what the quality rules suggest")
    p.add_argument("--reasons", help="JSON file {episode: reason}")
    p.add_argument("--dst")
    p = step("view", "build a training view (openpi make_realman_view.py) and check its gripper labels")
    p.add_argument("src")
    p.add_argument("--dst")
    p.add_argument("--task-prompt", nargs="+", metavar="TASK=PROMPT")
    p.add_argument("--arm")
    p.add_argument("--dry-run", action="store_true")
    p = step("norm", "compute openpi norm stats for a config and its view")
    p.add_argument("config_name")
    p.add_argument("view")
    p.add_argument("--force", action="store_true")
    p.add_argument("--dry-run", action="store_true")
    p = step("train", "start an openpi training run (needs --yes)")
    p.add_argument("config_name")
    p.add_argument("view")
    p.add_argument("--exp", required=True)
    p.add_argument("--gpus", required=True, help="host GPU indices, e.g. 1,2")
    p.add_argument("--batch", type=int)
    p.add_argument("--steps", type=int)
    p.add_argument("--resume", action="store_true")
    p.add_argument("--attach", action="store_true", help="follow an already running training container")
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--yes", action="store_true")
    p = step("eval", "open-loop eval per task (+ prompt swap)")
    p.add_argument("config_name")
    p.add_argument("exp")
    p.add_argument("--view", required=True)
    p.add_argument("--gpu", required=True)
    p.add_argument("--checkpoints", help="e.g. 10000,29999 (default: the latest)")
    p.add_argument("--stride", type=int)
    p.add_argument("--no-prompt-swap", action="store_true")
    p.add_argument("--dry-run", action="store_true")
    p = step("register", "write the model card and the registry row")
    p.add_argument("config_name")
    p.add_argument("exp")
    p.add_argument("--status")
    p.add_argument("--method")
    p.add_argument("--force", action="store_true", help="replace a hand-written card (kept as a backup)")
    jobs = sub.add_parser("jobs", help="list jobs")
    jobs.add_argument("--kind")
    jobs.add_argument("--limit", type=int, default=20)
    jobs.add_argument("--json", action="store_true")
    job = sub.add_parser("job", help="one job's status (or --log)")
    job.add_argument("id")
    job.add_argument("--log", action="store_true")
    cancel = sub.add_parser("cancel", help="cancel a running job")
    cancel.add_argument("id")
    return parser
```

`main()`:

```python
def main(argv: list[str] | None = None) -> int:
    argv = sys.argv[1:] if argv is None else argv
    if argv[:1] == ["_job-run"]:
        from .jobs import run_job

        return run_job(argv[1])
    args = make_parser().parse_args(argv)
    try:
        config = load_config(args.config)
        if args.command == "list":
            return _cmd_list(args, config)
        if args.command == "inspect":
            return _cmd_inspect(args, config)
        if args.command in STEP_COMMANDS:
            return _run_step(args, config)
        return _cmd_jobs(args, config)
    except (NotALeRobotDataset, FileNotFoundError, OSError, ValueError, KeyError, yaml.YAMLError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
```

- [ ] **Step 4: Run the whole suite**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test -p no:cacheprovider`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
ruff check --config config/python/ruff.toml src/training
git add src/training/realman_training
git commit -m "feat(training): realman-train pull/clean/view/norm/train/eval/register and job commands

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Docs

**Files:**
- Modify: `website/docs/development/training-console.md`
- Modify: `config/website/vitepress.config.mts:118` (sidebar text)

**Interfaces:** none (docs only).

- [ ] **Step 1: Update the page**

Change the frontmatter title/description and H1 to `训练控制平台（命令行）` / "realman-train 命令行：数据检查、拉取、清洗、训练视图、norm、训练、评估、登记，全部作为后台任务运行。" and the sidebar entry in `vitepress.config.mts` to `训练控制平台（命令行）`. Keep the existing 用法/质检规则 sections (add the `empty` row: `| empty | 剔除 | 这一条没有帧 |`). Add these sections after 用法:

````markdown
## 流水线

每一步都是 `realman_training.steps` 里的一个函数，命令行把它作为后台任务启动并在前台跟随日志（Ctrl-C 取消任务）；加 `--background` 只返回任务 id。在 server5090 上：

```bash
cd src/training/realman_training
PYTHONPATH=. python -m realman_training pull                                   # realman_ts → ~/data/realman/raw_realman_ts_<时间>/
PYTHONPATH=. python -m realman_training clean <原始目录> --suggested           # 按质检建议剔除 → <名称>_clean_<时间>
PYTHONPATH=. python -m realman_training clean <原始目录> --drop 13,28 --reasons reasons.json
PYTHONPATH=. python -m realman_training view <清洗版目录>                      # → <清洗版>_view，并检查夹爪标签
PYTHONPATH=. python -m realman_training norm <openpi 配置名> <视图目录>
PYTHONPATH=. python -m realman_training train <openpi 配置名> <视图目录> --exp <实验名> --gpus 1,2 --batch 16 --dry-run
PYTHONPATH=. python -m realman_training eval <openpi 配置名> <实验名> --view <视图目录> --gpu 2
PYTHONPATH=. python -m realman_training register <openpi 配置名> <实验名>
```

| 步骤 | 做什么 | 写到哪里 |
|---|---|---|
| `pull` | 经 `ssh realman_local` 在录制容器里 `tar`：先在录制锁（`.<数据集>.lock`，`flock -s`）下拷 `meta`、`data`，再拷视频；拷完校验每条的视频都在 | 新目录 `raw_realman_ts_<时间>/<数据集>/` + `pull.json`（来源、条数、字节数）；目标已存在就拒绝 |
| `clean` | 剔除条目、重新编号、视频硬链接、按 LeRobot 方法重算 `stats.json`；没写原因的条目用质检结论当原因 | 新目录 + `<目录>.clean_manifest.json`（剔除清单、原因、旧→新编号） |
| `view` | 在 `openpi:dev` 镜像里跑 `make_realman_view.py --task-prompt`（prompt 取配置 `prompts` 段，可用 `--task-prompt task=prompt` 覆盖），再检查夹爪目标：`pick_and_place` 必须 开→闭→开，`pick_only` 开→闭 | `<清洗版>_view/` + `label_check.json`；有问题的条目让任务失败并列出 |
| `norm` | `opic-norm`（norm stats 已存在就跳过，`--force` 重算） | `openpi-docker-data/assets/<配置>/<repo_id>/norm_stats.json` |
| `train` | 检查 GPU（被别人占用超过 2000 MiB 就拒绝）、缺 norm 就先算、在独立容器 `openpi-console-train-<实验名>` 里训练，多卡自动加 NCCL/XLA 环境；跟随 `Step N:` 日志显示进度；取消任务会停容器；`--attach` 重新跟随仍在跑的容器。必须加 `--yes`（先用 `--dry-run` 看命令） | `openpi-docker-data/wandb/<实验名>.log`、`checkpoints/<配置>/<实验名>/metrics.csv`、`console_train.json` |
| `eval` | 把配置的留出集按任务拆开，逐个 checkpoint 跑 `eval_open_loop.py`；多任务时再做 prompt 交换测试 | `checkpoints/<配置>/<实验名>/eval/`（每项结果 + `summary.json`） |
| `register` | 写模型卡和登记表一行（同一 run 再登记会替换那一行）；手写的模型卡要 `--force` 才替换，并留备份 | `MODEL_CARD.md`、`model_card.json`、`checkpoints/MODELS.md` |

openpi 的 norm 和评估脚本只接受配置名，所以仍然是"每个训练视图一个 openpi 配置"：命令里给配置名和视图目录，视图挂载到容器的 `/datasets/lerobot_realman`，配置的 `repo_id`、留出集、batch、步数在容器里读出来；配置的留出集不在视图里时拒绝（视图选错了）。

## 后台任务

任务目录在 `<data_root>/_console/jobs/<任务 id>/`（`params.json`、`status.json`、`log.txt`）。同一种任务同一时间只能有一个（每种任务一把文件锁，任务进程活多久就持有多久，进程崩了锁自动释放）。命令行或网页重启后：任务进程还活着的继续显示为运行中，已经死掉的标记为"中断"。

```bash
PYTHONPATH=. python -m realman_training jobs            # 最近的任务
PYTHONPATH=. python -m realman_training job <id> --log  # 某个任务的日志
PYTHONPATH=. python -m realman_training cancel <id>
```

## 安全规则

- 拉取、清洗、视图都写新目录，目标已存在就拒绝；只会删除本任务自己没写完的 `<目标>.partial`。
- 只读录制容器（`docker exec … tar/du/cat`），不碰 bringup、web、录制容器的启停和行为树。
- 训练和评估拒绝被别人占用的 GPU；容器用 `runtime: nvidia` + `NVIDIA_VISIBLE_DEVICES`（服务器上的 CDI 规格过期，`gpus:` 会失败）。
- 配置在 `config/training/training_console.yaml`（`remote`、`openpi`、`prompts` 段）和 `config/training/openpi-console.compose.yaml`；主机只写 ssh 别名。
````

- [ ] **Step 2: Build the site**

Run: `cd website && npm ci && npm run build`
Expected: build succeeds (the route `development/training-console` already exists in `website/tests/site.spec.ts`).

- [ ] **Step 3: Commit**

```bash
git add website/docs/development/training-console.md config/website/vitepress.config.mts
git commit -m "docs(training): pipeline steps, background jobs and safety rules of realman-train

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Real dry pass on server5090 (controller, not a subagent)

Runs the branch on server5090 against the real recording. Allowed: pull, clean, view, every `--dry-run`, register into a scratch copy. Not allowed without the user's OK: a real `train`, a real GPU `eval`, anything touching `openpi-serve`.

**Files:** none in the repo (results go to the PR description and the memory note).

- [ ] **Step 1: Ship the branch (server5090 cannot reach GitHub)**

```bash
git bundle create /tmp/tc2.bundle feat/training-console-jobs
scp /tmp/tc2.bundle server5090:~/scratch/
ssh server5090 'cd ~/scratch && rm -rf tc2 && git clone -q -b feat/training-console-jobs tc2.bundle tc2 && cd tc2 && git log --oneline -1'
ssh server5090 'cd ~/scratch/tc2/src/training/realman_training && ~/scratch/rt-venv/bin/python -m pytest -q test -p no:cacheprovider 2>&1 | tail -3'
```

Expected: the suite passes there too, including the opt-in real-data test.

- [ ] **Step 2: Pull (full recording, ~4 GB, ~20 min at ~3 MB/s; run in the background)**

```bash
ssh server5090 'cd ~/scratch/tc2/src/training/realman_training && PYTHONPATH=. ~/scratch/rt-venv/bin/python -m realman_training pull --background'
ssh server5090 'cd ~/scratch/tc2/src/training/realman_training && PYTHONPATH=. ~/scratch/rt-venv/bin/python -m realman_training jobs'
```

Expected: a `pull` job reaches `succeeded`; `~/data/realman/raw_realman_ts_<datetime>/realman__pi05-three-arm` + `pull.json`; `realman-train inspect` on it shows the current episode count and the episode/frame numbers match the remote `info.json`. Also check `ls ~/data/realman/raw_realman_ts_*/realman__pi05-three-arm/videos/*/chunk-000 | wc -l` against episodes × cameras.

- [ ] **Step 3: Clean a small subset, then view it**

Outputs go under `~/data/realman/_drypass_20261020/` (the `_` prefix keeps them out of `list`; same filesystem, so hard links work). Pick 3 `pick_and_place` and 3 `pick_only` episodes that the rules call `ok` (from `inspect --json`), e.g. `--keep 0,1,2,122,123,124` adjusted to ok ones.

```bash
ssh server5090 'cd ~/scratch/tc2/src/training/realman_training && R=$(ls -d ~/data/realman/raw_realman_ts_2026*/realman__pi05-three-arm | tail -1) && mkdir -p ~/data/realman/_drypass_20261020 && PYTHONPATH=. ~/scratch/rt-venv/bin/python -m realman_training clean "$R" --keep <ok episodes> --dst ~/data/realman/_drypass_20261020/subset_clean'
ssh server5090 'cd ~/scratch/tc2/src/training/realman_training && PYTHONPATH=. ~/scratch/rt-venv/bin/python -m realman_training view ~/data/realman/_drypass_20261020/subset_clean --dst ~/data/realman/_drypass_20261020/subset_view'
```

Expected: clean succeeds (6 episodes, renumbered 0–5, manifest present, `stat -c %h` of a video ≥ 2); view succeeds with `label_check.json` failures `[]`; `contract.json` prompts equal the two prompts; `inspect` of the view shows kind `view`. If the docker run fails (uid/HOME/venv), fix `view_command` with a test and re-run.

- [ ] **Step 4: Dry runs of norm/train/eval and a scratch register**

```bash
ssh server5090 'cd ~/scratch/tc2/src/training/realman_training && PYTHONPATH=. ~/scratch/rt-venv/bin/python -m realman_training train pi05_realman_multitask_action_only ~/data/realman/realman_right_arm_multitask_view --exp drypass_check --gpus 1,2 --batch 16 --dry-run --json'
ssh server5090 'cd ~/scratch/tc2/src/training/realman_training && PYTHONPATH=. ~/scratch/rt-venv/bin/python -m realman_training eval pi05_realman_multitask_action_only m_multitask_b16_2gpu --view ~/data/realman/realman_right_arm_multitask_view --gpu 3 --dry-run --json'
```

Expected: `config_info` runs a throwaway `docker compose run --rm` (no GPU, `CONSOLE_GPUS=none`) and returns `local/realman_right_arm_multitask` with 21 holdout episodes; the train dry run prints the full command with the NCCL env and `--weight-loader.params-path`, reports existing norm stats (or the norm dry-run), and creates no container (`docker ps -a | grep openpi-console` empty); the eval dry run lists 2 tasks × 1 checkpoint + 1 prompt swap. GPU busy refusals are fine and also worth noting. For register, copy only the small files of `m_multitask_b16_2gpu` into a scratch docker_data (`~/scratch/tc2_dd/checkpoints/pi05_realman_multitask_action_only/m_multitask_b16_2gpu` with empty step dirs, a hand-made `console_train.json` from the existing `model_card.json`, an `eval/summary.json` built from `wandb/eval_multitask_*_*.json` and `prompt_swap_29999.json`), point a scratch config's `openpi.docker_data` at it, run `register`, and compare the generated card with the hand-written one.

- [ ] **Step 5: Record**

Write what ran, numbers and any fixes into the PR description (Task 14) and update the memory note `training-console-project.md` (Plan 2 status, dry-pass results, where the dry-pass outputs are). Do not delete the dry-pass directories; tell the user where they are.

---

### Task 14: PR

- [ ] **Step 1: Verify**

```bash
cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test -p no:cacheprovider
cd ../../.. && ruff check --config config/python/ruff.toml src tools scripts docker
git log --format='%h %s%n%(trailers:key=Co-Authored-By)' origin/feat/training-console..HEAD
```

Expected: tests green, ruff clean, every commit carries exactly `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

- [ ] **Step 2: Push and open the PR against `feat/training-console` (PR #50 is not merged yet; retarget to `main` once it is)**

```bash
git push -u origin feat/training-console-jobs
gh pr create --base feat/training-console --title "feat(training): background jobs and pipeline steps (training console plan 2)" --body-file <prepared body>
```

The body lists the steps, the job model, the openpi "config per view" finding, the server5090 dry-pass results, what was deliberately not run (training, GPU eval, openpi-serve), and ends with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
