# Training Console — Plan 1: openpi commit, dataset summary, quality checks, `realman-train inspect`

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Commit the uncommitted openpi changes, and ship a Python package `realman_training` with a `realman-train` CLI that lists LeRobot datasets and, for one dataset, prints the summary (episodes, frames, duration, file times, format, task mix, features, cameras, disk) and per-episode quality verdicts with suggested drops.

**Architecture:** A non-ROS Python package under `src/training/realman_training/` (ignored by colcon) with three layers: `lerobot_io.py` reads a LeRobot v3 directory with pyarrow only; `datasets.py` turns that into a `DatasetSummary`; `quality.py` applies the gripper rules from the 2026-10-13 and 2026-10-16 manual cleanings. `cli.py` prints both as text or JSON. Thresholds live in `config/training/training_console.yaml`. Later plans (jobs/steps, serving/linkcheck, web UI) build on these functions.

**Tech Stack:** Python 3.10, numpy, pyarrow, PyYAML, pytest, argparse. No ROS, no lerobot.

Spec: `docs/superpowers/specs/2026-10-20-training-console-design.md`. This plan covers spec delivery steps 1–2 (openpi PR; `datasets.py`, `quality.py`, `realman-train inspect`, real-data check). Plans 2–4 cover jobs/steps, serving/linkcheck, and the web console. Deliberately left for Plan 2: the `.console/summary.json` cache (only the web console needs it) and moving the `drop_episodes.py` logic into `steps/clean.py`.

## Global Constraints

- Python 3.10 (ROS 2 Humble image and CI use 3.10); `from __future__ import annotations` in every module.
- Lint: `ruff check --config config/python/ruff.toml src tools scripts docker` must pass (CI).
- Config lives under repo-root `config/`; no config in the package. `.env` holds only Docker candidate values.
- Never write private IPs, tokens or host secrets into code, config or docs; refer to hosts by their ssh alias (`realman_ts`, `server5090`, `realman_local`).
- Datasets are read-only for this plan: nothing here writes into a dataset directory.
- Right gripper raw readings: open 50, fully closed 8500 (`config/ros/gripper.yaml`); right arm is index 2 of `observation.gripper_position` and joints 12–17 (radians) of `observation.joint_position`.
- Training start pose of the right arm, degrees: `[-9.89, 18.04, 79.08, 15.51, 79.60, -6.20]`.
- Closed-on-nothing threshold for recorded data is **8300** (no torque signal in recordings; 10-16 kept held plateaus up to 7904, dropped empty grasps at 8414–8550). The BT's 7800 uses torque and does not apply here.
- Acceptance: on the 2026-10-16 raw copy, the suggested-drop set must equal `{13, 28, 44, 61, 69, 78, 120, 121, 130, 181, 189, 209, 216}`.
- Docs are part of the feature (CLAUDE.md): a new page under `website/docs/development/` plus its route in `website/tests/site.spec.ts`.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/training/COLCON_IGNORE` | Keeps colcon (ROS image builds) from treating this as a ROS package |
| `src/training/realman_training/setup.py` | Package metadata and the `realman-train` console script |
| `src/training/realman_training/realman_training/__init__.py` | Package marker, version |
| `src/training/realman_training/realman_training/__main__.py` | `python -m realman_training` |
| `src/training/realman_training/realman_training/config.py` | `QualityConfig`, `ConsoleConfig`, `load_config()` |
| `src/training/realman_training/realman_training/lerobot_io.py` | Read `meta/info.json`, tasks, episode rows, episode columns |
| `src/training/realman_training/realman_training/datasets.py` | `DatasetSummary`, `summarize()`, `discover()` |
| `src/training/realman_training/realman_training/quality.py` | `Finding`, `EpisodeQuality`, `check_episode()`, `inspect()` |
| `src/training/realman_training/realman_training/cli.py` | `realman-train list|inspect` |
| `src/training/realman_training/test/lerobot_fixture.py` | Builds small raw/clean/view datasets for tests |
| `src/training/realman_training/test/test_*.py` | Unit tests per module, plus an opt-in real-data test |
| `config/training/training_console.yaml` | `data_root` and the quality thresholds |
| `.github/workflows/ci.yml` | Run the new suite, install pyarrow |
| `website/docs/development/training-console.md` | Developer page for the CLI and the rules |

---

### Task 1: Commit the openpi changes on server5090 and open a PR

The openpi working tree on server5090 (`~/organization/openpi`, branch `fix/realman-config-cli`, no commits ahead of `c783c41`) holds the multi-task view support and training config used for `m_multitask_b16_2gpu`. They must land in QingTianRobot/openpi.

**Files (in the openpi repo on server5090):**
- Modify: `scripts/make_realman_view.py`, `scripts/make_realman_view_test.py`, `src/openpi/training/config.py`, `src/openpi/training/lerobot_v3_dataset_test.py`

**Interfaces:**
- Produces: openpi branch `feat/realman-multitask-view` with `make_realman_view.py --task-prompt "task=prompt" "task2=prompt2"` and config `pi05_realman_multitask_action_only`. Plan 2's `steps/view.py` and `steps/train.py` call these.

- [ ] **Step 1: Review the diff before committing**

Run:
```bash
ssh server5090 'cd ~/organization/openpi && git status --short && git diff --stat && git diff src/openpi/training/lerobot_v3_dataset_test.py'
```
Expected: exactly the four files above. The config diff adds `REALMAN_MULTITASK_HOLDOUT_EPISODES = tuple(range(9, 217, 10))` and the `pi05_realman_multitask_action_only` TrainConfig, and changes `Sequence[int]` fields of `LeRobotRealmanDataConfig` to `tuple[int, ...]`. If any other file is modified, stop and report it instead of committing it.

- [ ] **Step 2: Run the openpi tests that cover these files**

Run:
```bash
ssh server5090 'cd ~/organization/openpi && docker run --rm --runtime=nvidia -e NVIDIA_VISIBLE_DEVICES=none -v $PWD:/workspace -w /workspace --entrypoint zsh openpi:dev -lc "uv run --no-sync pytest -q scripts/make_realman_view_test.py src/openpi/training/lerobot_v3_dataset_test.py 2>&1 | tail -5"'
```
Expected: all pass (2026-10-16: `make_realman_view_test.py` 15 passed).

- [ ] **Step 3: Commit on a new branch**

```bash
ssh server5090 'cd ~/organization/openpi && git switch -c feat/realman-multitask-view && git add scripts/make_realman_view.py scripts/make_realman_view_test.py src/openpi/training/config.py src/openpi/training/lerobot_v3_dataset_test.py && git commit -q -F - <<EOF
feat(realman): multi-task training views and the multitask action-only config

make_realman_view.py takes --task-prompt "recording-task=prompt" (one flag,
several values) and writes one task per prompt, so one view can hold the
pick_and_place and pick_only recordings with their own prompts.
config.py adds REALMAN_MULTITASK_HOLDOUT_EPISODES and
pi05_realman_multitask_action_only (trained 2026-10-16 as
m_multitask_b16_2gpu), and makes the episode index fields tuples so tyro
can parse them.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
git log --oneline -1'
```
Expected: one new commit on `feat/realman-multitask-view`.

- [ ] **Step 4: Push**

```bash
ssh server5090 'cd ~/organization/openpi && git push -u origin feat/realman-multitask-view 2>&1 | tail -3'
```
Expected: `* [new branch]`. If authentication fails on server5090, push from the Mac instead:
```bash
S=/private/tmp/claude-501/-Users-miakho-Organizations-realman-pi/89897497-6739-439f-a8a7-091f0eeeab6c/scratchpad
test -d $S/openpi || git clone -q https://github.com/QingTianRobot/openpi.git $S/openpi
ssh server5090 'cd ~/organization/openpi && git bundle create /tmp/openpi-multitask.bundle feat/realman-multitask-view ^c783c41'
scp server5090:/tmp/openpi-multitask.bundle $S/
git -C $S/openpi fetch $S/openpi-multitask.bundle feat/realman-multitask-view:feat/realman-multitask-view
git -C $S/openpi push -u origin feat/realman-multitask-view
```

- [ ] **Step 5: Open the PR**

```bash
gh pr create --repo QingTianRobot/openpi --base main --head feat/realman-multitask-view --title "feat(realman): multi-task training views and the multitask action-only config" --body "Adds --task-prompt to make_realman_view.py (one task per prompt in a view) and the pi05_realman_multitask_action_only config used for m_multitask_b16_2gpu (2026-10-16). Tests: make_realman_view_test.py and lerobot_v3_dataset_test.py pass in openpi:dev.

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```
Expected: a PR URL. Report it.

---

### Task 2: Package scaffold, configuration and CI wiring

**Files:**
- Create: `src/training/COLCON_IGNORE` (empty)
- Create: `src/training/realman_training/setup.py`
- Create: `src/training/realman_training/realman_training/__init__.py`
- Create: `src/training/realman_training/realman_training/config.py`
- Create: `config/training/training_console.yaml`
- Create: `src/training/realman_training/test/test_config.py`
- Modify: `.github/workflows/ci.yml` (python-tests job)

**Interfaces:**
- Produces: `realman_training.config.QualityConfig` (frozen dataclass, fields below), `ConsoleConfig(data_root: Path, quality: QualityConfig)`, `load_config(path: str | Path | None = None) -> ConsoleConfig` (raises `ValueError` naming the file and key), constants `REPO_ROOT`, `DEFAULT_CONFIG`, `ENV_CONFIG = "REALMAN_TRAINING_CONFIG"`, `ARMS = ("l", "m", "r")`.

- [ ] **Step 1: Write the failing test**

`src/training/realman_training/test/test_config.py`:
```python
from __future__ import annotations

from pathlib import Path

import pytest

from realman_training.config import DEFAULT_CONFIG, ENV_CONFIG, QualityConfig, load_config


def _write(tmp_path: Path, body: str) -> Path:
    path = tmp_path / "console.yaml"
    path.write_text(body, encoding="utf-8")
    return path


def test_the_shipped_file_equals_the_reviewed_defaults():
    config = load_config(DEFAULT_CONFIG)
    assert config.quality == QualityConfig()
    assert config.data_root == Path("~/data/realman").expanduser()


def test_the_reviewed_defaults():
    q = QualityConfig()
    assert q.arm == "r"
    assert (q.gripper_open_raw, q.closed_threshold_raw, q.gripper_close_raw) == (50.0, 4275.0, 8500.0)
    # Recordings carry no torque: held plateaus reached 7904 on 2026-10-16, empty grasps 8414-8550.
    assert q.empty_position_min == 8300.0
    assert q.release_tasks == ("pick_and_place",)
    assert q.start_pose_deg == (-9.89, 18.04, 79.08, 15.51, 79.60, -6.20)


def test_values_from_the_file_override_the_defaults(tmp_path):
    path = _write(tmp_path, "training_console:\n  data_root: /data/x\n  quality:\n    empty_position_min: 8000\n    release_tasks: [place]\n")
    config = load_config(path)
    assert config.data_root == Path("/data/x")
    assert config.quality.empty_position_min == 8000.0
    assert config.quality.release_tasks == ("place",)
    assert config.quality.glitch_max_frames == 2  # untouched keys keep their default


def test_the_environment_variable_picks_the_file(tmp_path, monkeypatch):
    path = _write(tmp_path, "training_console:\n  data_root: /from/env\n")
    monkeypatch.setenv(ENV_CONFIG, str(path))
    assert load_config().data_root == Path("/from/env")


@pytest.mark.parametrize(
    "body, fragment",
    [
        ("other: {}\n", "training_console"),
        ("training_console:\n  quality:\n    empty_position: 1\n", "empty_position"),
        ("training_console:\n  quality:\n    arm: x\n", "arm"),
        ("training_console:\n  quality:\n    closed_threshold_raw: 9000\n", "closed_threshold_raw"),
        ("training_console:\n  quality:\n    start_pose_deg: [1, 2]\n", "start_pose_deg"),
        ("training_console:\n  quality:\n    glitch_max_frames: 0\n", "glitch_max_frames"),
    ],
)
def test_bad_values_name_the_key(tmp_path, body, fragment):
    with pytest.raises(ValueError, match=fragment):
        load_config(_write(tmp_path, body))
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_config.py -p no:cacheprovider`
Expected: FAIL with `ModuleNotFoundError: No module named 'realman_training'`.

- [ ] **Step 3: Write the package and config**

`src/training/COLCON_IGNORE`: empty file.

`src/training/realman_training/setup.py`:
```python
from setuptools import find_packages, setup

# Not a ROS package: src/training/COLCON_IGNORE keeps colcon from building it.
setup(
    name="realman_training",
    version="0.1.0",
    packages=find_packages(exclude=["test"]),
    python_requires=">=3.10",
    install_requires=["numpy", "pyarrow", "pyyaml"],
    entry_points={"console_scripts": ["realman-train = realman_training.cli:main"]},
)
```

`src/training/realman_training/realman_training/__init__.py`:
```python
"""Training pipeline and console for the RealMan pi0.5 policies (see docs/superpowers/specs/2026-10-20-training-console-design.md)."""

__version__ = "0.1.0"
```

`src/training/realman_training/realman_training/config.py`:
```python
"""Console configuration: config/training/training_console.yaml on top of built-in defaults."""

from __future__ import annotations

import dataclasses
import os
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).resolve().parents[4]
DEFAULT_CONFIG = REPO_ROOT / "config" / "training" / "training_console.yaml"
ENV_CONFIG = "REALMAN_TRAINING_CONFIG"
ARMS = ("l", "m", "r")


@dataclasses.dataclass(frozen=True)
class QualityConfig:
    """Per-episode rules; the numbers come from the 2026-10-13 and 2026-10-16 manual cleanings."""

    arm: str = "r"
    gripper_open_raw: float = 50.0
    gripper_close_raw: float = 8500.0
    closed_threshold_raw: float = 4275.0  # halfway between open and closed
    start_closed_sec: float = 1.0
    glitch_max_frames: int = 2
    plateau_window_sec: float = 3.0
    empty_position_min: float = 8300.0
    start_partial_raw: float = 300.0
    release_tasks: tuple[str, ...] = ("pick_and_place",)
    start_pose_deg: tuple[float, ...] = (-9.89, 18.04, 79.08, 15.51, 79.60, -6.20)
    start_pose_tol_deg: float = 2.0


@dataclasses.dataclass(frozen=True)
class ConsoleConfig:
    data_root: Path = dataclasses.field(default_factory=lambda: Path("~/data/realman").expanduser())
    quality: QualityConfig = dataclasses.field(default_factory=QualityConfig)


def load_config(path: str | Path | None = None) -> ConsoleConfig:
    source = Path(path or os.environ.get(ENV_CONFIG) or DEFAULT_CONFIG)
    document = yaml.safe_load(source.read_text(encoding="utf-8")) or {}
    section = document.get("training_console") if isinstance(document, dict) else None
    if not isinstance(section, dict):
        raise ValueError(f"{source}: missing the training_console section")
    quality = _quality(section.get("quality") or {}, source)
    data_root = Path(str(section.get("data_root", "~/data/realman"))).expanduser()
    return ConsoleConfig(data_root=data_root, quality=quality)


def _quality(raw: dict, source: Path) -> QualityConfig:
    defaults = QualityConfig()
    fields = {field.name: field for field in dataclasses.fields(QualityConfig)}
    unknown = sorted(set(raw) - set(fields))
    if unknown:
        raise ValueError(f"{source}: unknown quality keys {unknown}")
    values = {}
    for name, value in raw.items():
        default = getattr(defaults, name)
        try:
            if isinstance(default, tuple):
                values[name] = tuple(type(default[0])(item) if default else item for item in value)
            elif isinstance(default, int):
                values[name] = int(value)
            elif isinstance(default, float):
                values[name] = float(value)
            else:
                values[name] = str(value)
        except (TypeError, ValueError) as error:
            raise ValueError(f"{source}: quality.{name}: {error}") from None
    quality = dataclasses.replace(defaults, **values)
    _validate(quality, source)
    return quality


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

`config/training/training_console.yaml`:
```yaml
# Training console (src/training/realman_training, design docs/superpowers/specs/2026-10-20-training-console-design.md).
# Every key is optional; a missing key keeps the default in realman_training/config.py.
training_console:
  # Where the pulled recordings, cleaned sets and training views live on server5090.
  data_root: ~/data/realman

  # Per-episode quality rules. The numbers reproduce the 2026-10-13 and 2026-10-16 manual cleanings.
  quality:
    arm: r                        # whose gripper and joints are judged (l, m, r)
    gripper_open_raw: 50          # right gripper reading fully open (config/ros/gripper.yaml)
    gripper_close_raw: 8500       # fully closed
    closed_threshold_raw: 4275    # above = closed; halfway between open and closed
    start_closed_sec: 1.0         # closed anywhere in this first span = "starts closed"
    glitch_max_frames: 2          # an open run this short inside a closed run = reading glitch
    plateau_window_sec: 3.0       # end of the last closed run that is judged for "closed on nothing"
    # Recordings have no torque signal: held plateaus reached 7904 on 2026-10-16 (kept), empty grasps
    # 8414-8550 (dropped). The behaviour tree's 7800 relies on torque and does not apply here.
    empty_position_min: 8300
    start_partial_raw: 300        # first reading above this but not closed = warning only
    release_tasks: [pick_and_place]   # tasks that must end with the gripper open again
    start_pose_deg: [-9.89, 18.04, 79.08, 15.51, 79.60, -6.20]  # right arm training start pose
    start_pose_tol_deg: 2.0       # first frame further than this from the start pose = warning only
```

`.github/workflows/ci.yml`, python-tests job — change the install line and add the suite:
```yaml
      - name: Install test dependencies
        run: python -m pip install pytest pyyaml numpy aiohttp pyarrow
```
and in the `for suite in \` list add, after `tools/velocity_follow:tests; do` is reached, a new line before it:
```yaml
            src/training/realman_training:test \
            tools/velocity_follow:tests; do
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_config.py -p no:cacheprovider`
Expected: 10 passed. (Needs `pip install pyyaml numpy pyarrow pytest` in a scratch venv on the Mac if missing.)

- [ ] **Step 5: Lint and commit**

```bash
ruff check --config config/python/ruff.toml src tools scripts docker
git add src/training config/training .github/workflows/ci.yml
git commit -m "feat(training): realman_training package skeleton and console config"
```

---

### Task 3: LeRobot v3 reader and the test dataset builder

**Files:**
- Create: `src/training/realman_training/realman_training/lerobot_io.py`
- Create: `src/training/realman_training/test/lerobot_fixture.py`
- Create: `src/training/realman_training/test/test_lerobot_io.py`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - `class NotALeRobotDataset(ValueError)`
  - `is_dataset(path) -> bool`
  - `read_info(root) -> dict` (raises `NotALeRobotDataset` if `meta/info.json` is missing or `codebase_version != "v3.0"`)
  - `read_task_names(root) -> dict[int, str]` (accepts a `task` column or the pandas index `__index_level_0__`)
  - `@dataclass(frozen=True) EpisodeRow(index: int, task: str, length: int, data_file: Path, from_index: int, to_index: int)`
  - `read_episodes(root) -> list[EpisodeRow]` sorted by index
  - `read_episode_columns(episode: EpisodeRow, columns: list[str]) -> dict[str, np.ndarray]` (float64; list columns become 2-D `(length, n)`)
  - Test helpers in `lerobot_fixture.py`: `FPS = 30`, `HOME_DEG`, `CAMERAS = ("d435", "orbbec-right")`, `gripper(*segments: tuple[float, int]) -> list[float]`, `@dataclass Episode(task: str, gripper: list[float], start_deg: tuple = HOME_DEG)`, `build_dataset(root: Path, episodes: list[Episode], *, task_column: str = "__index_level_0__") -> Path`, `build_view(root: Path, *, source: str, prompts: dict[str, str], lengths: list[int]) -> Path`, `write_clean_manifest(root: Path, *, source: str, removed: dict[int, str]) -> Path`.

- [ ] **Step 1: Write the fixture builder**

`src/training/realman_training/test/lerobot_fixture.py`:
```python
"""Small LeRobot v3 datasets on disk, shaped like the RealMan recordings, for the tests."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pyarrow as pa
import pyarrow.parquet as pq

FPS = 30
HOME_DEG = (-9.89, 18.04, 79.08, 15.51, 79.60, -6.20)
CAMERAS = ("d435", "orbbec-right")
VIDEO_BYTES = 1024
_VIDEO_FEATURE = {
    "dtype": "video",
    "shape": [480, 640, 3],
    "names": ["height", "width", "channels"],
    "info": {"video.codec": "av1", "video.fps": FPS},
}
_INDEX_FEATURES = {key: {"dtype": "int64", "shape": [1]} for key in ("episode_index", "frame_index", "index", "task_index")}


def gripper(*segments: tuple[float, int]) -> list[float]:
    """Piecewise-constant right gripper readings: gripper((50, 60), (5700, 120)) = 60 open frames then 120 closed."""
    values: list[float] = []
    for value, frames in segments:
        values.extend([float(value)] * frames)
    return values


@dataclass
class Episode:
    task: str
    gripper: list[float]
    start_deg: tuple[float, ...] = HOME_DEG


def _info(features: dict, episodes: int, frames: int, tasks: int) -> dict:
    return {
        "codebase_version": "v3.0",
        "robot_type": "realman-rm65-b-three-arm-v1",
        "fps": FPS,
        "total_episodes": episodes,
        "total_frames": frames,
        "total_tasks": tasks,
        "data_path": "data/chunk-{chunk_index:03d}/file-{file_index:03d}.parquet",
        "video_path": "videos/{video_key}/chunk-{chunk_index:03d}/file-{file_index:03d}.mp4",
        "features": features,
    }


def _write_videos(root: Path, episode: int, row: dict) -> None:
    for camera in CAMERAS:
        folder = root / "videos" / f"observation.images.{camera}" / "chunk-000"
        folder.mkdir(parents=True, exist_ok=True)
        (folder / f"file-{episode:03d}.mp4").write_bytes(b"\0" * VIDEO_BYTES)
        row[f"videos/observation.images.{camera}/chunk_index"] = 0
        row[f"videos/observation.images.{camera}/file_index"] = episode


def _list_column(values: np.ndarray) -> pa.Array:
    return pa.array(values.astype(np.float32).tolist(), pa.list_(pa.float32()))


def build_dataset(root: Path, episodes: list[Episode], *, task_column: str = "__index_level_0__") -> Path:
    """A raw three-arm recording: right gripper in column 2, right arm joints 12-17 (radians)."""
    task_index = {task: i for i, task in enumerate(dict.fromkeys(e.task for e in episodes))}
    (root / "meta" / "episodes" / "chunk-000").mkdir(parents=True)
    (root / "data" / "chunk-000").mkdir(parents=True)
    features = {
        "observation.gripper_position": {"dtype": "float32", "shape": [3]},
        "observation.joint_position": {"dtype": "float32", "shape": [18]},
        "action.command_action": {"dtype": "float32", "shape": [18]},
        **{f"observation.images.{camera}": _VIDEO_FEATURE for camera in CAMERAS},
        **_INDEX_FEATURES,
        "timestamp": {"dtype": "float32", "shape": [1]},
    }
    frames = sum(len(e.gripper) for e in episodes)
    (root / "meta" / "info.json").write_text(json.dumps(_info(features, len(episodes), frames, len(task_index))))
    pq.write_table(
        pa.table({"task_index": list(task_index.values()), task_column: list(task_index)}),
        root / "meta" / "tasks.parquet",
    )
    start = 0
    for i, episode in enumerate(episodes):
        n = len(episode.gripper)
        grip = np.zeros((n, 3))
        grip[:, 2] = episode.gripper
        joints = np.zeros((n, 18))
        joints[:, 12:18] = np.radians(episode.start_deg)
        pq.write_table(
            pa.table(
                {
                    "observation.gripper_position": _list_column(grip),
                    "observation.joint_position": _list_column(joints),
                    "episode_index": pa.array(np.full(n, i, np.int64)),
                    "index": pa.array(np.arange(start, start + n, dtype=np.int64)),
                    "frame_index": pa.array(np.arange(n, dtype=np.int64)),
                    "task_index": pa.array(np.full(n, task_index[episode.task], np.int64)),
                    "timestamp": pa.array((np.arange(n) / FPS).astype(np.float32)),
                }
            ),
            root / "data" / "chunk-000" / f"file-{i:03d}.parquet",
        )
        row = {
            "episode_index": i,
            "tasks": [episode.task],
            "length": n,
            "data/chunk_index": 0,
            "data/file_index": i,
            "dataset_from_index": start,
            "dataset_to_index": start + n,
        }
        _write_videos(root, i, row)
        pq.write_table(pa.Table.from_pylist([row]), root / "meta" / "episodes" / "chunk-000" / f"file-{i:03d}.parquet")
        start += n
    return root


def build_view(root: Path, *, source: str, prompts: dict[str, str], lengths: list[int]) -> Path:
    """A training view as make_realman_view.py writes it: 7-dim state/action, prompts as tasks, contract.json."""
    names = list(prompts.values())
    (root / "meta" / "episodes" / "chunk-000").mkdir(parents=True)
    (root / "data" / "chunk-000").mkdir(parents=True)
    features = {
        "observation.state": {"dtype": "float32", "shape": [7]},
        "action": {"dtype": "float32", "shape": [7]},
        **{f"observation.images.{camera}": _VIDEO_FEATURE for camera in CAMERAS},
        **_INDEX_FEATURES,
        "timestamp": {"dtype": "float32", "shape": [1]},
    }
    (root / "meta" / "info.json").write_text(json.dumps(_info(features, len(lengths), sum(lengths), len(names))))
    pq.write_table(pa.table({"task_index": list(range(len(names))), "task": names}), root / "meta" / "tasks.parquet")
    start = 0
    for i, n in enumerate(lengths):
        task = i % len(names)
        pq.write_table(
            pa.table(
                {
                    "observation.state": _list_column(np.zeros((n, 7))),
                    "action": _list_column(np.zeros((n, 7))),
                    "episode_index": pa.array(np.full(n, i, np.int64)),
                    "index": pa.array(np.arange(start, start + n, dtype=np.int64)),
                    "frame_index": pa.array(np.arange(n, dtype=np.int64)),
                    "task_index": pa.array(np.full(n, task, np.int64)),
                    "timestamp": pa.array((np.arange(n) / FPS).astype(np.float32)),
                }
            ),
            root / "data" / "chunk-000" / f"file-{i:03d}.parquet",
        )
        row = {
            "episode_index": i,
            "tasks": [names[task]],
            "length": n,
            "data/chunk_index": 0,
            "data/file_index": i,
            "dataset_from_index": start,
            "dataset_to_index": start + n,
        }
        _write_videos(root, i, row)
        pq.write_table(pa.Table.from_pylist([row]), root / "meta" / "episodes" / "chunk-000" / f"file-{i:03d}.parquet")
        start += n
    (root / "contract.json").write_text(json.dumps({"source": source, "prompts": prompts, "arm": "r"}))
    return root


def write_clean_manifest(root: Path, *, source: str, removed: dict[int, str]) -> Path:
    """The manifest drop_episodes.py writes next to the cleaned directory (<dir>.clean_manifest.json)."""
    path = Path(f"{root}.clean_manifest.json")
    path.write_text(
        json.dumps({"source": source, "removed": {str(e): {"frames": 1, "reason": r} for e, r in removed.items()}})
    )
    return path
```

- [ ] **Step 2: Write the failing reader tests**

`src/training/realman_training/test/test_lerobot_io.py`:
```python
from __future__ import annotations

import json

import numpy as np
import pytest
from lerobot_fixture import HOME_DEG, Episode, build_dataset, build_view, gripper

from realman_training.lerobot_io import (
    NotALeRobotDataset,
    is_dataset,
    read_episode_columns,
    read_episodes,
    read_info,
    read_task_names,
)


@pytest.fixture()
def raw(tmp_path):
    return build_dataset(
        tmp_path / "raw",
        [
            Episode("pick_and_place", gripper((50, 30), (5700, 60), (50, 30))),
            Episode("pick_only", gripper((50, 20), (5700, 40))),
        ],
    )


def test_info_and_detection(raw, tmp_path):
    assert is_dataset(raw)
    assert not is_dataset(tmp_path)
    assert read_info(raw)["fps"] == 30


def test_a_directory_without_info_is_rejected(tmp_path):
    with pytest.raises(NotALeRobotDataset, match="meta/info.json"):
        read_info(tmp_path)


def test_another_codebase_version_is_rejected(raw):
    info = json.loads((raw / "meta" / "info.json").read_text())
    info["codebase_version"] = "v2.1"
    (raw / "meta" / "info.json").write_text(json.dumps(info))
    with pytest.raises(NotALeRobotDataset, match="v2.1"):
        read_info(raw)


def test_task_names_from_the_pandas_index_and_from_a_task_column(raw, tmp_path):
    assert read_task_names(raw) == {0: "pick_and_place", 1: "pick_only"}
    view = build_view(tmp_path / "view", source="x", prompts={"a": "do a", "b": "do b"}, lengths=[10, 10])
    assert read_task_names(view) == {0: "do a", 1: "do b"}


def test_episode_rows(raw):
    rows = read_episodes(raw)
    assert [(r.index, r.task, r.length) for r in rows] == [(0, "pick_and_place", 120), (1, "pick_only", 60)]
    assert rows[1].data_file == raw / "data" / "chunk-000" / "file-001.parquet"
    assert (rows[1].from_index, rows[1].to_index) == (120, 180)


def test_episode_columns_are_float_arrays_of_the_episode_only(raw):
    episode = read_episodes(raw)[1]
    columns = read_episode_columns(episode, ["observation.gripper_position", "observation.joint_position"])
    assert columns["observation.gripper_position"].shape == (60, 3)
    assert columns["observation.gripper_position"][25, 2] == pytest.approx(5700.0)
    np.testing.assert_allclose(np.degrees(columns["observation.joint_position"][0, 12:18]), HOME_DEG, atol=1e-4)
```

- [ ] **Step 3: Run them to verify they fail**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_lerobot_io.py -p no:cacheprovider`
Expected: FAIL with `ModuleNotFoundError: No module named 'realman_training.lerobot_io'`.

- [ ] **Step 4: Write the reader**

`src/training/realman_training/realman_training/lerobot_io.py`:
```python
"""Read-only access to a LeRobot v3 dataset directory (meta/, data/, videos/) with pyarrow only."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pyarrow.compute as pc
import pyarrow.parquet as pq

_EPISODE_COLUMNS = [
    "episode_index",
    "tasks",
    "length",
    "data/chunk_index",
    "data/file_index",
    "dataset_from_index",
    "dataset_to_index",
]


class NotALeRobotDataset(ValueError):
    """The directory is not a LeRobot v3 dataset, or its files contradict each other."""


@dataclass(frozen=True)
class EpisodeRow:
    index: int
    task: str
    length: int
    data_file: Path
    from_index: int
    to_index: int


def is_dataset(path: str | Path) -> bool:
    return (Path(path) / "meta" / "info.json").is_file()


def read_info(root: str | Path) -> dict:
    path = Path(root) / "meta" / "info.json"
    if not path.is_file():
        raise NotALeRobotDataset(f"{root}: no meta/info.json")
    info = json.loads(path.read_text(encoding="utf-8"))
    if info.get("codebase_version") != "v3.0":
        raise NotALeRobotDataset(f"{root}: codebase_version {info.get('codebase_version')!r}, expected 'v3.0'")
    return info


def read_task_names(root: str | Path) -> dict[int, str]:
    table = pq.read_table(Path(root) / "meta" / "tasks.parquet")
    # make_realman_view.py writes a task column; the recorder stores the name as the pandas index.
    column = "task" if "task" in table.column_names else "__index_level_0__"
    if column not in table.column_names:
        raise NotALeRobotDataset(f"{root}: meta/tasks.parquet has no task names ({table.column_names})")
    return dict(zip(table.column("task_index").to_pylist(), map(str, table.column(column).to_pylist())))


def read_episodes(root: str | Path) -> list[EpisodeRow]:
    root = Path(root)
    data_path = read_info(root)["data_path"]
    rows: list[EpisodeRow] = []
    for path in sorted((root / "meta" / "episodes").glob("chunk-*/file-*.parquet")):
        for row in pq.read_table(path, columns=_EPISODE_COLUMNS).to_pylist():
            tasks = row["tasks"] or [""]
            rows.append(
                EpisodeRow(
                    index=int(row["episode_index"]),
                    task=str(tasks[0]),
                    length=int(row["length"]),
                    data_file=root
                    / data_path.format(chunk_index=row["data/chunk_index"], file_index=row["data/file_index"]),
                    from_index=int(row["dataset_from_index"]),
                    to_index=int(row["dataset_to_index"]),
                )
            )
    rows.sort(key=lambda row: row.index)
    return rows


def read_episode_columns(episode: EpisodeRow, columns: list[str]) -> dict[str, np.ndarray]:
    table = pq.read_table(episode.data_file, columns=[*columns, "episode_index"])
    table = table.filter(pc.equal(table["episode_index"], episode.index))
    if table.num_rows != episode.length:
        raise NotALeRobotDataset(
            f"{episode.data_file}: episode {episode.index} has {table.num_rows} rows, metadata says {episode.length}"
        )
    return {name: np.asarray(table.column(name).to_pylist(), dtype=np.float64) for name in columns}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_lerobot_io.py -p no:cacheprovider`
Expected: 6 passed.

- [ ] **Step 6: Lint and commit**

```bash
ruff check --config config/python/ruff.toml src tools scripts docker
git add src/training/realman_training/realman_training/lerobot_io.py src/training/realman_training/test/lerobot_fixture.py src/training/realman_training/test/test_lerobot_io.py
git commit -m "feat(training): read LeRobot v3 metadata and episode columns with pyarrow"
```

---

### Task 4: Dataset summary and discovery

**Files:**
- Create: `src/training/realman_training/realman_training/datasets.py`
- Create: `src/training/realman_training/test/test_datasets.py`

**Interfaces:**
- Consumes: `read_info`, `read_episodes`, `is_dataset`, `NotALeRobotDataset` from Task 3; fixture helpers from Task 3.
- Produces:
  - `@dataclass(frozen=True) Camera(key: str, codec: str | None, height: int | None, width: int | None)`
  - `@dataclass(frozen=True) DatasetSummary(path: str, name: str, kind: str, codebase_version: str, robot_type: str, fps: float, episodes: int, frames: int, duration_sec: float, tasks: dict[str, int], task_frames: dict[str, int], features: dict[str, dict], cameras: tuple[Camera, ...], disk_bytes: int, first_file_time: str | None, last_file_time: str | None, source: str | None, removed_episodes: int | None, prompts: dict[str, str])` with `to_dict() -> dict`
  - `kind` is `"view"` (has `contract.json`), `"clean"` (has `<dir>.clean_manifest.json` next to it or `clean_manifest.json` inside), else `"raw"`.
  - `summarize(root: str | Path) -> DatasetSummary`
  - `discover(data_root: str | Path, max_depth: int = 2) -> list[Path]`

- [ ] **Step 1: Write the failing tests**

`src/training/realman_training/test/test_datasets.py`:
```python
from __future__ import annotations

import pytest
from lerobot_fixture import VIDEO_BYTES, Episode, build_dataset, build_view, gripper, write_clean_manifest

from realman_training.datasets import discover, summarize
from realman_training.lerobot_io import NotALeRobotDataset


def _raw(root, task_column="__index_level_0__"):
    return build_dataset(
        root,
        [
            Episode("pick_and_place", gripper((50, 30), (5700, 60), (50, 30))),
            Episode("pick_and_place", gripper((50, 30), (5700, 60), (50, 60))),
            Episode("pick_only", gripper((50, 30), (5700, 60))),
        ],
        task_column=task_column,
    )


def test_a_raw_recording_is_summarized(tmp_path):
    summary = summarize(_raw(tmp_path / "raw_realman_ts_20261016" / "realman__pi05-three-arm"))
    assert summary.kind == "raw"
    assert summary.name == "realman__pi05-three-arm"
    assert (summary.episodes, summary.frames, summary.fps) == (3, 360, 30)
    assert summary.duration_sec == pytest.approx(12.0)
    assert summary.tasks == {"pick_and_place": 2, "pick_only": 1}
    assert summary.task_frames == {"pick_and_place": 270, "pick_only": 90}
    assert summary.codebase_version == "v3.0"
    assert summary.robot_type == "realman-rm65-b-three-arm-v1"
    assert summary.features["observation.gripper_position"] == {"dtype": "float32", "shape": [3]}
    assert "observation.images.d435" not in summary.features  # cameras are listed separately
    assert [(c.key, c.codec, c.height, c.width) for c in summary.cameras] == [
        ("d435", "av1", 480, 640),
        ("orbbec-right", "av1", 480, 640),
    ]
    assert summary.disk_bytes > 3 * 2 * VIDEO_BYTES
    assert summary.first_file_time is not None and summary.first_file_time <= summary.last_file_time
    assert (summary.source, summary.removed_episodes, summary.prompts) == (None, None, {})


def test_a_task_column_works_like_the_pandas_index(tmp_path):
    assert summarize(_raw(tmp_path / "d", task_column="task")).tasks == {"pick_and_place": 2, "pick_only": 1}


def test_a_cleaned_set_reports_its_source_and_how_many_were_removed(tmp_path):
    root = _raw(tmp_path / "realman__multitask_clean")
    write_clean_manifest(root, source="raw_realman_ts_20261016", removed={13: "starts closed", 28: "re-grasp"})
    summary = summarize(root)
    assert (summary.kind, summary.source, summary.removed_episodes) == ("clean", "raw_realman_ts_20261016", 2)


def test_a_training_view_reports_its_prompts(tmp_path):
    prompts = {"pick_and_place": "pick up the power adapter and put it in the blue bin", "pick_only": "pick up the power adapter"}
    view = build_view(tmp_path / "realman_right_arm_multitask_view", source="clean", prompts=prompts, lengths=[30, 30, 30])
    summary = summarize(view)
    assert (summary.kind, summary.source, summary.prompts) == ("view", "clean", prompts)
    assert summary.tasks == {prompts["pick_and_place"]: 2, prompts["pick_only"]: 1}
    assert summary.features["action"] == {"dtype": "float32", "shape": [7]}


def test_to_dict_is_plain_json_data(tmp_path):
    data = summarize(_raw(tmp_path / "d")).to_dict()
    assert data["cameras"][0] == {"key": "d435", "codec": "av1", "height": 480, "width": 640}
    assert data["tasks"] == {"pick_and_place": 2, "pick_only": 1}


def test_discover_finds_nested_datasets_and_skips_everything_else(tmp_path):
    raw = _raw(tmp_path / "raw_realman_ts_20261016" / "realman__pi05-three-arm")
    clean = _raw(tmp_path / "realman__multitask_clean")
    (tmp_path / "_a0").mkdir()
    (tmp_path / ".hidden" / "x" / "meta").mkdir(parents=True)
    (tmp_path / "notes.txt").write_text("not a dataset")
    assert discover(tmp_path) == sorted([raw, clean])


def test_a_non_dataset_is_rejected(tmp_path):
    with pytest.raises(NotALeRobotDataset):
        summarize(tmp_path)
```

- [ ] **Step 2: Run them to verify they fail**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_datasets.py -p no:cacheprovider`
Expected: FAIL with `ModuleNotFoundError: No module named 'realman_training.datasets'`.

- [ ] **Step 3: Write the summary**

`src/training/realman_training/realman_training/datasets.py`:
```python
"""What a LeRobot v3 dataset contains: counts, time span, format, tasks, cameras, size, provenance."""

from __future__ import annotations

import dataclasses
import json
import os
from collections import Counter
from datetime import datetime
from pathlib import Path

from .lerobot_io import read_episodes, read_info, is_dataset

_VIDEO_PREFIX = "observation.images."


@dataclasses.dataclass(frozen=True)
class Camera:
    key: str
    codec: str | None
    height: int | None
    width: int | None


@dataclasses.dataclass(frozen=True)
class DatasetSummary:
    path: str
    name: str
    kind: str  # raw | clean | view
    codebase_version: str
    robot_type: str
    fps: float
    episodes: int
    frames: int
    duration_sec: float
    tasks: dict[str, int]  # episodes per task
    task_frames: dict[str, int]
    features: dict[str, dict]  # non-video features: name -> {"dtype", "shape"}
    cameras: tuple[Camera, ...]
    disk_bytes: int
    first_file_time: str | None  # oldest / newest episode data file, local time, ISO 8601
    last_file_time: str | None
    source: str | None
    removed_episodes: int | None
    prompts: dict[str, str]

    def to_dict(self) -> dict:
        return dataclasses.asdict(self)


def _manifest(root: Path) -> dict | None:
    for path in (Path(f"{root}.clean_manifest.json"), root / "clean_manifest.json"):
        if path.is_file():
            return json.loads(path.read_text(encoding="utf-8"))
    return None


def _disk_bytes(root: Path) -> int:
    total = 0
    for folder, _, files in os.walk(root):
        for name in files:
            path = Path(folder) / name
            if not path.is_symlink():
                total += path.stat().st_size
    return total


def _iso(timestamp: float) -> str:
    return datetime.fromtimestamp(timestamp).isoformat(timespec="seconds")


def summarize(root: str | Path) -> DatasetSummary:
    root = Path(root)
    info = read_info(root)
    episodes = read_episodes(root)
    fps = float(info.get("fps", 0) or 0)
    frames = sum(e.length for e in episodes)
    tasks = Counter(e.task for e in episodes)
    task_frames: Counter[str] = Counter()
    for episode in episodes:
        task_frames[episode.task] += episode.length

    features, cameras = {}, []
    for name, feature in info.get("features", {}).items():
        if feature.get("dtype") == "video":
            shape = feature.get("shape") or [None, None]
            cameras.append(
                Camera(
                    key=name.removeprefix(_VIDEO_PREFIX),
                    codec=(feature.get("info") or {}).get("video.codec"),
                    height=shape[0],
                    width=shape[1],
                )
            )
        else:
            features[name] = {"dtype": feature.get("dtype"), "shape": feature.get("shape")}

    times = [e.data_file.stat().st_mtime for e in episodes if e.data_file.is_file()]
    contract_path = root / "contract.json"
    contract = json.loads(contract_path.read_text(encoding="utf-8")) if contract_path.is_file() else None
    manifest = None if contract else _manifest(root)
    if contract is not None:
        kind, source = "view", contract.get("source")
        prompts = contract.get("prompts") or ({"*": contract["prompt"]} if contract.get("prompt") else {})
    elif manifest is not None:
        kind, source, prompts = "clean", manifest.get("source"), {}
    else:
        kind, source, prompts = "raw", None, {}

    return DatasetSummary(
        path=str(root),
        name=root.name,
        kind=kind,
        codebase_version=str(info["codebase_version"]),
        robot_type=str(info.get("robot_type", "")),
        fps=fps,
        episodes=len(episodes),
        frames=frames,
        duration_sec=frames / fps if fps else 0.0,
        tasks=dict(sorted(tasks.items())),
        task_frames=dict(sorted(task_frames.items())),
        features=features,
        cameras=tuple(cameras),
        disk_bytes=_disk_bytes(root),
        first_file_time=_iso(min(times)) if times else None,
        last_file_time=_iso(max(times)) if times else None,
        source=None if source is None else str(source),
        removed_episodes=len(manifest.get("removed") or {}) if manifest is not None else None,
        prompts={str(k): str(v) for k, v in prompts.items()},
    )


def discover(data_root: str | Path, max_depth: int = 2) -> list[Path]:
    """Dataset directories under data_root (a dataset's own subdirectories are not searched)."""
    found: list[Path] = []

    def walk(folder: Path, depth: int) -> None:
        if is_dataset(folder):
            found.append(folder)
            return
        if depth == max_depth:
            return
        for child in sorted(folder.iterdir()):
            if child.is_dir() and not child.name.startswith((".", "_")):
                walk(child, depth + 1)

    walk(Path(data_root), 0)
    return sorted(found)
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_datasets.py -p no:cacheprovider`
Expected: 7 passed.

- [ ] **Step 5: Lint and commit**

```bash
ruff check --config config/python/ruff.toml src tools scripts docker
git add src/training/realman_training/realman_training/datasets.py src/training/realman_training/test/test_datasets.py
git commit -m "feat(training): dataset summary (counts, file times, format, tasks, cameras, provenance) and discovery"
```

---

### Task 5: Per-episode quality rules

**Files:**
- Create: `src/training/realman_training/realman_training/quality.py`
- Create: `src/training/realman_training/test/test_quality.py`

**Interfaces:**
- Consumes: `QualityConfig` (Task 2); `read_info`, `read_episodes`, `read_episode_columns` (Task 3); fixture helpers (Task 3).
- Produces:
  - `GRIPPER_COLUMN = "observation.gripper_position"`, `JOINT_COLUMN = "observation.joint_position"`, `ARM_INDEX = {"l": 0, "m": 1, "r": 2}`
  - Finding codes: `start_closed`, `never_closed`, `regrasp`, `glitch`, `closed_on_nothing`, `no_release` (severity `"drop"`); `start_partial`, `start_pose` (severity `"warn"`)
  - `@dataclass(frozen=True) Finding(code: str, severity: str, message: str)`
  - `@dataclass(frozen=True) EpisodeQuality(episode: int, task: str, frames: int, verdict: str, findings: tuple[Finding, ...])` with `to_dict()`; `verdict` is `"suggest_drop"`, `"warn"` or `"ok"`
  - `class QualityUnavailable(ValueError)` (the dataset has no raw gripper readings, e.g. a training view)
  - `check_episode(task: str, gripper: np.ndarray, joints_deg: np.ndarray, fps: float, config: QualityConfig) -> tuple[Finding, ...]`
  - `inspect(root: str | Path, config: QualityConfig) -> list[EpisodeQuality]`
  - `suggested_drops(results: list[EpisodeQuality]) -> list[int]`

- [ ] **Step 1: Write the failing tests**

`src/training/realman_training/test/test_quality.py`:
```python
from __future__ import annotations

import numpy as np
import pytest
from lerobot_fixture import FPS, HOME_DEG, Episode, build_dataset, build_view, gripper

from realman_training.config import QualityConfig
from realman_training.quality import QualityUnavailable, check_episode, inspect, suggested_drops

CONFIG = QualityConfig()


def codes(task, readings, start_deg=HOME_DEG):
    joints = np.tile(np.asarray(start_deg, dtype=float), (len(readings), 1))
    return {f.code for f in check_episode(task, np.asarray(readings, dtype=float), joints, FPS, CONFIG)}


def test_a_clean_pick_and_place_has_no_findings():
    assert codes("pick_and_place", gripper((50, 60), (5700, 150), (50, 60))) == set()


def test_a_clean_pick_only_ends_closed_without_findings():
    assert codes("pick_only", gripper((50, 60), (5700, 120))) == set()


def test_a_thin_held_object_is_not_closed_on_nothing():
    # 2026-10-16 kept pick_only episodes whose plateau reached 7904.
    assert codes("pick_only", gripper((50, 60), (7904, 120))) == set()


def test_starting_closed():
    # e.g. raw #13: closed for the first 17 frames.
    assert "start_closed" in codes("pick_and_place", gripper((6000, 17), (50, 60), (5700, 100), (50, 40)))


def test_closing_twice_is_a_regrasp():
    # e.g. raw #130: two closing events.
    found = codes("pick_and_place", gripper((50, 60), (5700, 60), (50, 30), (5700, 60), (50, 30)))
    assert "regrasp" in found and "glitch" not in found


def test_never_closing():
    # raw #216: maximum reading 3931, below the closed threshold.
    assert codes("pick_only", gripper((50, 60), (3931, 100))) == {"never_closed"}


def test_closing_on_nothing():
    # raw #181/#189/#209: plateaus 8414-8550.
    assert codes("pick_only", gripper((50, 60), (8450, 100))) == {"closed_on_nothing"}


def test_closing_on_nothing_is_judged_on_the_last_closed_run_before_the_release():
    assert "closed_on_nothing" in codes("pick_and_place", gripper((50, 60), (8450, 100), (50, 60)))


def test_a_place_task_that_never_releases():
    # raw #78/#121: pick_and_place ending with the adapter still held.
    assert codes("pick_and_place", gripper((50, 60), (5700, 100))) == {"no_release"}


def test_a_short_open_reading_inside_a_grasp_is_a_glitch():
    # raw #69: one open frame splits one grasp into two.
    found = codes("pick_and_place", gripper((50, 60), (5700, 50), (50, 1), (5700, 50), (50, 30)))
    assert {"glitch", "regrasp"} <= found


def test_a_slightly_closed_first_reading_is_only_a_warning():
    findings = check_episode(
        "pick_only",
        np.asarray(gripper((560, 5), (50, 55), (5700, 100)), dtype=float),
        np.tile(np.asarray(HOME_DEG), (160, 1)),
        FPS,
        CONFIG,
    )
    assert [(f.code, f.severity) for f in findings] == [("start_partial", "warn")]


def test_a_start_away_from_the_training_pose_is_only_a_warning():
    off = (HOME_DEG[0] + 5.0, *HOME_DEG[1:])
    assert codes("pick_only", gripper((50, 60), (5700, 120)), start_deg=off) == {"start_pose"}


def test_messages_carry_the_numbers():
    findings = check_episode(
        "pick_only",
        np.asarray(gripper((50, 60), (8450, 100)), dtype=float),
        np.tile(np.asarray(HOME_DEG), (160, 1)),
        FPS,
        CONFIG,
    )
    assert "8450" in findings[0].message and "8300" in findings[0].message


def test_inspect_gives_one_verdict_per_episode_and_the_drop_list(tmp_path):
    root = build_dataset(
        tmp_path / "raw",
        [
            Episode("pick_and_place", gripper((50, 60), (5700, 150), (50, 60))),
            Episode("pick_only", gripper((50, 60), (8450, 100))),
            Episode("pick_only", gripper((560, 5), (50, 55), (5700, 100))),
            Episode("pick_and_place", gripper((50, 60), (5700, 100))),
        ],
    )
    results = inspect(root, CONFIG)
    assert [(r.episode, r.task, r.verdict) for r in results] == [
        (0, "pick_and_place", "ok"),
        (1, "pick_only", "suggest_drop"),
        (2, "pick_only", "warn"),
        (3, "pick_and_place", "suggest_drop"),
    ]
    assert suggested_drops(results) == [1, 3]
    assert results[1].to_dict()["findings"][0]["code"] == "closed_on_nothing"
    assert results[0].frames == 270


def test_a_training_view_has_no_raw_gripper_readings(tmp_path):
    view = build_view(tmp_path / "view", source="x", prompts={"a": "do a"}, lengths=[30])
    with pytest.raises(QualityUnavailable, match="observation.gripper_position"):
        inspect(view, CONFIG)
```

- [ ] **Step 2: Run them to verify they fail**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_quality.py -p no:cacheprovider`
Expected: FAIL with `ModuleNotFoundError: No module named 'realman_training.quality'`.

- [ ] **Step 3: Write the rules**

`src/training/realman_training/realman_training/quality.py`:
```python
"""Per-episode quality verdicts for raw or cleaned RealMan recordings.

The rules reproduce the 2026-10-13 and 2026-10-16 manual cleanings. Drop-severity findings are suggestions:
the console pre-checks them and a person confirms before anything is removed.
"""

from __future__ import annotations

import dataclasses
from pathlib import Path

import numpy as np

from .config import QualityConfig
from .lerobot_io import read_episode_columns, read_episodes, read_info

GRIPPER_COLUMN = "observation.gripper_position"
JOINT_COLUMN = "observation.joint_position"
ARM_INDEX = {"l": 0, "m": 1, "r": 2}


@dataclasses.dataclass(frozen=True)
class Finding:
    code: str
    severity: str  # drop | warn
    message: str


@dataclasses.dataclass(frozen=True)
class EpisodeQuality:
    episode: int
    task: str
    frames: int
    verdict: str  # suggest_drop | warn | ok
    findings: tuple[Finding, ...]

    def to_dict(self) -> dict:
        return dataclasses.asdict(self)


class QualityUnavailable(ValueError):
    """The dataset has no raw gripper readings to judge (a training view, or another robot)."""


def _runs(mask: np.ndarray) -> list[tuple[bool, int, int]]:
    """(value, start, end) for each run of equal values; end is exclusive."""
    runs, start = [], 0
    for i in range(1, len(mask) + 1):
        if i == len(mask) or mask[i] != mask[start]:
            runs.append((bool(mask[start]), start, i))
            start = i
    return runs


def check_episode(
    task: str, gripper: np.ndarray, joints_deg: np.ndarray, fps: float, config: QualityConfig
) -> tuple[Finding, ...]:
    findings: list[Finding] = []

    def drop(code: str, message: str) -> None:
        findings.append(Finding(code, "drop", message))

    def warn(code: str, message: str) -> None:
        findings.append(Finding(code, "warn", message))

    threshold = config.closed_threshold_raw
    closed = gripper > threshold
    start_frames = max(1, int(round(config.start_closed_sec * fps)))
    starts_closed = bool(closed[:start_frames].any())
    if starts_closed:
        drop(
            "start_closed",
            f"gripper closed in the first {config.start_closed_sec:g} s (max reading {gripper[:start_frames].max():.0f})",
        )
    if not closed.any():
        drop("never_closed", f"never closed: max reading {gripper.max():.0f} <= {threshold:.0f}")
    else:
        rising = int(np.count_nonzero(closed[1:] & ~closed[:-1]))
        if rising >= 2:
            drop("regrasp", f"{rising} closing events (re-grasp)")
        runs = _runs(closed)
        gaps = [
            (start, end)
            for k, (value, start, end) in enumerate(runs)
            if not value and 0 < k < len(runs) - 1 and end - start <= config.glitch_max_frames
        ]
        if gaps:
            start, end = gaps[0]
            drop("glitch", f"closed reading interrupted for {end - start} frame(s) at frame {start}")
        _, run_start, run_end = [run for run in runs if run[0]][-1]
        window = max(1, int(round(config.plateau_window_sec * fps)))
        plateau = float(np.median(gripper[max(run_start, run_end - window) : run_end]))
        if plateau >= config.empty_position_min:
            drop(
                "closed_on_nothing",
                f"closed plateau {plateau:.0f} >= {config.empty_position_min:.0f}: the jaws met on nothing",
            )
        if task in config.release_tasks and closed[-1]:
            drop("no_release", f"task {task} ends with the gripper still closed (no release)")
    if not starts_closed and gripper[0] > config.start_partial_raw:
        warn("start_partial", f"first reading {gripper[0]:.0f} is above {config.start_partial_raw:.0f} (not fully open)")
    if config.start_pose_deg and len(joints_deg):
        deviation = np.abs(joints_deg[0] - np.asarray(config.start_pose_deg))
        if deviation.max() > config.start_pose_tol_deg:
            joint = int(deviation.argmax()) + 1
            warn("start_pose", f"first frame is {deviation.max():.1f} deg from the start pose (J{joint})")
    return tuple(findings)


def _verdict(findings: tuple[Finding, ...]) -> str:
    if any(f.severity == "drop" for f in findings):
        return "suggest_drop"
    return "warn" if findings else "ok"


def inspect(root: str | Path, config: QualityConfig) -> list[EpisodeQuality]:
    info = read_info(root)
    for column in (GRIPPER_COLUMN, JOINT_COLUMN):
        if column not in info.get("features", {}):
            raise QualityUnavailable(
                f"{root}: no {column}; a training view has no raw gripper readings, inspect its cleaned source"
            )
    fps = float(info["fps"])
    arm = ARM_INDEX[config.arm]
    results = []
    for episode in read_episodes(root):
        columns = read_episode_columns(episode, [GRIPPER_COLUMN, JOINT_COLUMN])
        gripper = columns[GRIPPER_COLUMN][:, arm]
        joints = np.degrees(columns[JOINT_COLUMN][:, arm * 6 : arm * 6 + 6])
        findings = check_episode(episode.task, gripper, joints, fps, config)
        results.append(EpisodeQuality(episode.index, episode.task, episode.length, _verdict(findings), findings))
    return results


def suggested_drops(results: list[EpisodeQuality]) -> list[int]:
    return [r.episode for r in results if r.verdict == "suggest_drop"]
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_quality.py -p no:cacheprovider`
Expected: 15 passed.

- [ ] **Step 5: Lint and commit**

```bash
ruff check --config config/python/ruff.toml src tools scripts docker
git add src/training/realman_training/realman_training/quality.py src/training/realman_training/test/test_quality.py
git commit -m "feat(training): per-episode quality rules from the 10-13 and 10-16 manual cleanings"
```

---

### Task 6: `realman-train list | inspect`

**Files:**
- Create: `src/training/realman_training/realman_training/cli.py`
- Create: `src/training/realman_training/realman_training/__main__.py`
- Create: `src/training/realman_training/test/test_cli.py`

**Interfaces:**
- Consumes: `load_config` (Task 2); `summarize`, `discover`, `DatasetSummary` (Task 4); `inspect`, `suggested_drops`, `QualityUnavailable` (Task 5); `NotALeRobotDataset` (Task 3).
- Produces: `main(argv: list[str] | None = None) -> int` (0 ok, 2 on a bad dataset path). `inspect --json` prints `{"summary": {...}, "quality": [...] | null, "quality_unavailable": str | null, "suggested_drops": [...]}`; `list --json` prints a list of summaries.

- [ ] **Step 1: Write the failing tests**

`src/training/realman_training/test/test_cli.py`:
```python
from __future__ import annotations

import json

import pytest
from lerobot_fixture import Episode, build_dataset, build_view, gripper

from realman_training.cli import main


@pytest.fixture()
def setup(tmp_path):
    raw = build_dataset(
        tmp_path / "data" / "raw_realman_ts_20261016" / "realman__pi05-three-arm",
        [
            Episode("pick_and_place", gripper((50, 60), (5700, 150), (50, 60))),
            Episode("pick_only", gripper((50, 60), (8450, 100))),
        ],
    )
    view = build_view(tmp_path / "data" / "right_arm_view", source="clean", prompts={"a": "do a"}, lengths=[30])
    config = tmp_path / "console.yaml"
    config.write_text(f"training_console:\n  data_root: {tmp_path / 'data'}\n")
    return raw, view, config


def test_inspect_json_has_the_summary_the_verdicts_and_the_drops(setup, capsys):
    raw, _, config = setup
    assert main(["--config", str(config), "inspect", str(raw), "--json"]) == 0
    data = json.loads(capsys.readouterr().out)
    assert data["summary"]["episodes"] == 2 and data["summary"]["kind"] == "raw"
    assert [q["verdict"] for q in data["quality"]] == ["ok", "suggest_drop"]
    assert data["suggested_drops"] == [1]
    assert data["quality_unavailable"] is None


def test_inspect_text_is_readable(setup, capsys):
    raw, _, config = setup
    assert main(["--config", str(config), "inspect", str(raw)]) == 0
    out = capsys.readouterr().out
    assert "realman__pi05-three-arm  [raw]" in out
    assert "episodes 2" in out and "LeRobot v3.0" in out
    assert "pick_and_place 1" in out and "pick_only 1" in out
    assert "d435 av1 480x640" in out
    assert "quality: 1 ok, 1 suggest drop, 0 warn" in out
    # severity padded to 5, a space, then the episode right-aligned in 3: "drop " + " " + "  1"
    assert "drop    1  pick_only  closed_on_nothing" in out


def test_inspect_of_a_view_explains_why_there_is_no_quality(setup, capsys):
    _, view, config = setup
    assert main(["--config", str(config), "inspect", str(view), "--json"]) == 0
    data = json.loads(capsys.readouterr().out)
    assert data["quality"] is None and "observation.gripper_position" in data["quality_unavailable"]
    assert data["summary"]["prompts"] == {"a": "do a"}


def test_inspect_can_skip_quality(setup, capsys):
    raw, _, config = setup
    assert main(["--config", str(config), "inspect", str(raw), "--json", "--no-quality"]) == 0
    data = json.loads(capsys.readouterr().out)
    assert data["quality"] is None and data["quality_unavailable"] == "skipped"


def test_list_uses_data_root_from_the_config(setup, capsys):
    raw, view, config = setup
    assert main(["--config", str(config), "list", "--json"]) == 0
    assert [s["path"] for s in json.loads(capsys.readouterr().out)] == sorted([str(raw), str(view)])
    assert main(["--config", str(config), "list"]) == 0
    out = capsys.readouterr().out
    assert "realman__pi05-three-arm" in out and "right_arm_view" in out and "view" in out


def test_a_bad_path_is_an_error_not_a_traceback(setup, capsys, tmp_path):
    _, _, config = setup
    assert main(["--config", str(config), "inspect", str(tmp_path / "missing")]) == 2
    assert "error:" in capsys.readouterr().err
```

- [ ] **Step 2: Run them to verify they fail**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_cli.py -p no:cacheprovider`
Expected: FAIL with `ModuleNotFoundError: No module named 'realman_training.cli'`.

- [ ] **Step 3: Write the CLI**

`src/training/realman_training/realman_training/cli.py`:
```python
"""realman-train: list the datasets and inspect one (summary + per-episode quality)."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from .config import load_config
from .datasets import DatasetSummary, discover, summarize
from .lerobot_io import NotALeRobotDataset
from .quality import QualityUnavailable, inspect, suggested_drops


def _size(n: int) -> str:
    for unit, scale in (("GB", 1 << 30), ("MB", 1 << 20), ("KB", 1 << 10)):
        if n >= scale:
            return f"{n / scale:.1f} {unit}"
    return f"{n} B"


def _summary_text(s: DatasetSummary) -> list[str]:
    lines = [
        f"{s.path}  [{s.kind}]",
        f"  episodes {s.episodes} · frames {s.frames} · {s.duration_sec / 60:.1f} min @ {s.fps:g} fps"
        f" · LeRobot {s.codebase_version} · {s.robot_type}",
        f"  files {s.first_file_time or '-'} -> {s.last_file_time or '-'} · disk {_size(s.disk_bytes)}",
        "  tasks: " + ", ".join(f"{task} {count} ({s.task_frames[task]} frames)" for task, count in s.tasks.items()),
        "  cameras: " + ", ".join(f"{c.key} {c.codec} {c.height}x{c.width}" for c in s.cameras),
    ]
    if s.source:
        lines.append(f"  source: {s.source}" + (f" · removed {s.removed_episodes}" if s.removed_episodes else ""))
    for task, prompt in s.prompts.items():
        lines.append(f"  prompt {task}: {prompt}")
    return lines


def _cmd_list(args, config) -> int:
    root = Path(args.root).expanduser() if args.root else config.data_root
    summaries = [summarize(path) for path in discover(root)]
    if args.json:
        print(json.dumps([s.to_dict() for s in summaries], ensure_ascii=False, indent=2))
        return 0
    print(f"{'dataset':60} {'kind':5} {'episodes':>8} {'frames':>8}  updated")
    for s in summaries:
        name = str(Path(s.path).relative_to(root)) if Path(s.path).is_relative_to(root) else s.path
        print(f"{name:60} {s.kind:5} {s.episodes:>8} {s.frames:>8}  {s.last_file_time or '-'}")
    return 0


def _cmd_inspect(args, config) -> int:
    summary = summarize(Path(args.path).expanduser())
    quality, unavailable = None, None
    if args.no_quality:
        unavailable = "skipped"
    else:
        try:
            quality = inspect(summary.path, config.quality)
        except QualityUnavailable as error:
            unavailable = str(error)
    drops = suggested_drops(quality) if quality is not None else []
    if args.json:
        print(
            json.dumps(
                {
                    "summary": summary.to_dict(),
                    "quality": None if quality is None else [q.to_dict() for q in quality],
                    "quality_unavailable": unavailable,
                    "suggested_drops": drops,
                },
                ensure_ascii=False,
                indent=2,
            )
        )
        return 0
    print("\n".join(_summary_text(summary)))
    if quality is None:
        print(f"  quality: {unavailable}")
        return 0
    counts = {v: sum(q.verdict == v for q in quality) for v in ("ok", "suggest_drop", "warn")}
    print(f"  quality: {counts['ok']} ok, {counts['suggest_drop']} suggest drop, {counts['warn']} warn")
    for q in quality:
        for finding in q.findings:
            print(f"    {finding.severity:5} {q.episode:>3}  {q.task}  {finding.code}: {finding.message}")
    if drops:
        print("  suggested drops: " + ",".join(map(str, drops)))
    return 0


def main(argv: list[str] | None = None) -> int:
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
    args = parser.parse_args(argv)
    config = load_config(args.config)
    try:
        return _cmd_list(args, config) if args.command == "list" else _cmd_inspect(args, config)
    except (NotALeRobotDataset, FileNotFoundError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 2
```

`src/training/realman_training/realman_training/__main__.py`:
```python
from __future__ import annotations

import sys

from .cli import main

sys.exit(main())
```

- [ ] **Step 4: Run all tests of the package**

Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test -p no:cacheprovider`
Expected: 44 passed (config 10, io 6, datasets 7, quality 15, cli 6).

- [ ] **Step 5: Lint and commit**

```bash
ruff check --config config/python/ruff.toml src tools scripts docker
git add src/training/realman_training/realman_training/cli.py src/training/realman_training/realman_training/__main__.py src/training/realman_training/test/test_cli.py
git commit -m "feat(training): realman-train list and inspect"
```

---

### Task 7: Real-data acceptance on server5090

**Files:**
- Create: `src/training/realman_training/test/test_real_data.py`

**Interfaces:**
- Consumes: `inspect`, `suggested_drops` (Task 5), `QualityConfig` (Task 2), `summarize` (Task 4).
- Produces: an opt-in test (skipped unless `REALMAN_TRAINING_RAW_20261016` points at the 10-16 raw copy) that pins the rules to the manual result.

- [ ] **Step 1: Write the test**

`src/training/realman_training/test/test_real_data.py`:
```python
"""Opt-in: the rules must reproduce the 2026-10-16 manual cleaning on the real raw copy (server5090).

REALMAN_TRAINING_RAW_20261016=~/data/realman/raw_realman_ts_20261016/realman__pi05-three-arm
"""

from __future__ import annotations

import os
from pathlib import Path

import pytest

from realman_training.config import QualityConfig
from realman_training.datasets import summarize
from realman_training.quality import inspect, suggested_drops

RAW = os.environ.get("REALMAN_TRAINING_RAW_20261016")
MANUAL_DROPS_20261016 = [13, 28, 44, 61, 69, 78, 120, 121, 130, 181, 189, 209, 216]

pytestmark = pytest.mark.skipif(not RAW, reason="set REALMAN_TRAINING_RAW_20261016 to the 10-16 raw copy")


def test_the_summary_matches_the_copy():
    summary = summarize(Path(RAW).expanduser())
    assert (summary.episodes, summary.frames) == (230, 105439)
    assert summary.tasks == {"pick_and_place": 122, "pick_only": 108}


def test_the_rules_suggest_exactly_the_manual_drops():
    results = inspect(Path(RAW).expanduser(), QualityConfig())
    assert suggested_drops(results) == MANUAL_DROPS_20261016
```

- [ ] **Step 2: Copy the package to server5090 and run it there**

```bash
rsync -rlc --delete --exclude __pycache__ src/training/realman_training/ server5090:scratch/realman_training/
rsync -rlc config/training/ server5090:scratch/realman_training_config/
ssh server5090 'test -x ~/scratch/rt-venv/bin/python || (python3 -m venv ~/scratch/rt-venv && ~/scratch/rt-venv/bin/pip install -q pytest pyyaml numpy pyarrow); cd ~/scratch/realman_training && REALMAN_TRAINING_CONFIG=~/scratch/realman_training_config/training_console.yaml REALMAN_TRAINING_RAW_20261016=~/data/realman/raw_realman_ts_20261016/realman__pi05-three-arm PYTHONPATH=. ~/scratch/rt-venv/bin/python -m pytest -q test/test_real_data.py -p no:cacheprovider 2>&1 | tail -15'
```
Expected: 2 passed.

- [ ] **Step 3: If the drop set differs, find out why before changing anything**

Run:
```bash
ssh server5090 'cd ~/scratch/realman_training && REALMAN_TRAINING_CONFIG=~/scratch/realman_training_config/training_console.yaml PYTHONPATH=. ~/scratch/rt-venv/bin/python -m realman_training inspect ~/data/realman/raw_realman_ts_20261016/realman__pi05-three-arm | grep -E "^    (drop|warn)"'
```
For each extra or missing episode, read its findings and its raw gripper series. Change a threshold in `config/training/training_console.yaml` (and the matching default in `config.py` and `test_config.py`) only with a one-line comment giving the episode numbers that justify it; never special-case an episode index in code. Re-run Step 2 until it passes.

- [ ] **Step 4: Print the full report for the record**

```bash
ssh server5090 'cd ~/scratch/realman_training && REALMAN_TRAINING_CONFIG=~/scratch/realman_training_config/training_console.yaml PYTHONPATH=. ~/scratch/rt-venv/bin/python -m realman_training list --root ~/data/realman && PYTHONPATH=. REALMAN_TRAINING_CONFIG=~/scratch/realman_training_config/training_console.yaml ~/scratch/rt-venv/bin/python -m realman_training inspect ~/data/realman/raw_realman_ts_20261016/realman__pi05-three-arm | head -12'
```
Expected: every dataset under `~/data/realman` listed with kind and counts; the inspect header shows 230 episodes, 105439 frames, LeRobot v3.0, tasks pick_and_place 122 / pick_only 108, cameras d435/orbbec-left/orbbec-right av1 480x640.

- [ ] **Step 5: Commit**

```bash
git add src/training/realman_training/test/test_real_data.py
git commit -m "test(training): pin the quality rules to the 2026-10-16 manual cleaning"
```

---

### Task 8: Developer page

**Files:**
- Create: `website/docs/development/training-console.md`
- Modify: `config/website/vitepress.config.mts` (sidebar group "末端、感知与策略")
- Modify: `website/tests/site.spec.ts` (the "documentation routes render" list)

**Interfaces:**
- Consumes: the CLI and rules from Tasks 2–7.

- [ ] **Step 1: Add the route to the route test (fails until the page exists)**

In `website/tests/site.spec.ts`, inside the `documentation routes render` list, after `"development/policy-task",` add:
```ts
    "development/training-console",
```

- [ ] **Step 2: Write the page**

`website/docs/development/training-console.md`:
```markdown
---
title: 训练控制平台（数据检查）
description: realman-train 命令行：列出训练数据集，查看条数、帧数、时长、文件时间、格式、任务分布、相机与磁盘占用，并按规则逐条质检、给出建议剔除。
---

# 训练控制平台（数据检查）

训练流程（拉取 → 检查 → 清洗 → 训练视图 → norm → 训练 → 评估 → 登记 → 部署）正在做成 `realman_training` 包和网页控制平台，设计见 [`2026-10-20-training-console-design.md`](https://github.com/QingTianRobot/realman_pi/blob/main/docs/superpowers/specs/2026-10-20-training-console-design.md)。第一部分已可用：命令行 `realman-train` 列出数据集、查看概况、逐条质检。

## 用法

在 server5090 上（数据在 `~/data/realman`）：

```bash
cd src/training/realman_training && PYTHONPATH=. python -m realman_training list
PYTHONPATH=. python -m realman_training inspect ~/data/realman/raw_realman_ts_20261016/realman__pi05-three-arm
PYTHONPATH=. python -m realman_training inspect <数据集目录> --json
```

`list` 列出 `data_root` 下所有 LeRobot v3 数据集及类型：`raw`（从 realman_ts 拉来的原始录制）、`clean`（剔除过坏条目，旁边有 `<目录>.clean_manifest.json`）、`view`（训练视图，带 `contract.json` 和 prompt）。

`inspect` 显示：条数、帧数、时长、fps、格式版本、机器人类型、数据文件的最早/最新时间、磁盘占用、每个任务的条数和帧数、相机及编码、来源和已剔除条数、训练视图的 prompt，以及逐条质检结果和建议剔除列表。训练视图没有原始夹爪读数，质检要看它的清洗版来源。

## 质检规则

阈值在 `config/training/training_console.yaml` 的 `quality` 段，数值来自 2026-10-13 和 10-16 两次人工清洗。"剔除"只是建议，平台上由人确认后才会生成清洗版。

| 代码 | 级别 | 判断 |
|---|---|---|
| `start_closed` | 剔除 | 开头 1 s 内夹爪处于闭合 |
| `never_closed` | 剔除 | 读数从未超过闭合阈值 4275 |
| `regrasp` | 剔除 | 闭合事件 ≥ 2 |
| `glitch` | 剔除 | 闭合中间夹着 ≤ 2 帧的张开读数 |
| `closed_on_nothing` | 剔除 | 最后一段闭合的平台（末 3 s 中位数）≥ 8300：两爪合拢，没夹住东西 |
| `no_release` | 剔除 | `pick_and_place` 结尾仍闭合（没在蓝箱上方松开） |
| `start_partial` | 警告 | 首帧读数高于 300 但未闭合 |
| `start_pose` | 警告 | 首帧右臂关节离训练起始位姿超过 2° |

录制数据里没有力矩信号，所以"夹空"阈值用 8300，而不是行为树判定用的 7800（行为树还要求力矩）：10-16 保留的夹住平台最高到 7904，剔除的夹空在 8414–8550。

在 10-16 的原始数据上，规则建议剔除的正好是当时人工剔除的 13 条（13、28、44、61、69、78、120、121、130、181、189、209、216），由 `test_real_data.py` 固定。
```

- [ ] **Step 3: Add the sidebar entry**

In `config/website/vitepress.config.mts`, in the "末端、感知与策略" group, after the `{ text: "独立数据录制平台", link: "/development/recording-platform" },` line add:
```ts
          { text: "训练控制平台（数据检查）", link: "/development/training-console" },
```

- [ ] **Step 4: Build and run the route test**

```bash
cd website && npm ci && npm run build && npm run test:e2e -- -g "documentation routes render"
```
Expected: build succeeds; the route test passes for desktop and mobile (`test:e2e` uses the Playwright config in `config/website/`).

- [ ] **Step 5: Commit**

```bash
git add website/docs/development/training-console.md config/website/vitepress.config.mts website/tests/site.spec.ts
git commit -m "docs(training): realman-train data inspection page"
```
