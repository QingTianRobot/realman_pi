# Training Console on SJD, Compute on EI — Implementation Plan (spec phase ③)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The `realman_training` console (`:8780`) runs on SJDrealman. Its clean/view/norm/train/eval/register jobs execute on the campus GPU server EI over ssh, with openpi in a uv venv and no docker. The web pages read a metadata mirror on SJD.

**Architecture:**
- A new `compute.py` turns a local job of a remote kind into `ssh EI python -m realman_training _remote-step <kind>`. The remote side runs the unchanged step function with EI's own config.
- Paths cross the wire as `@data_root/…` / `@docker_data/…`. Log lines, progress and the result come back as marked lines.
- After each step, rsync refreshes SJD's data_root/docker_data without videos and weights.
- `openpi.py` gains a `UvOpenpi` backend with the same lifecycle interface as the docker `Compose` (exists/running/stop/exit_code/remove/started_at), so `train`/`norm`/`eval`/`view` keep their logic.
- One yaml serves server5090, SJD and EI: host-specific values come from `${VAR}` / `${VAR-default}` expansion.

**Tech Stack:**
- Python 3.10+ (console) and 3.11 (EI venv); pytest with the package's `FakeRunner`.
- ssh/rsync, bash `setsid`, openpi (QingTianRobot/openpi fork), aiohttp web (unchanged).

**Spec:** `docs/superpowers/specs/2026-11-18-sjd-integrated-platform-design.md`. This plan covers phase ③ (architecture §1–§3, EI scripting, steps 1–4 of the implementation order). Phase ④ (serving on the 4080) and ⑤ (shared nav) get their own plans.

## Global Constraints

- **EI rules:**
  - Work only inside the EI work directory (from `.env`, never written into the repo).
  - No sudo, no system config changes, never take all 8 GPUs, don't disturb other users.
  - Connect only with `ssh -F <repo>/Traning_area/.ssh/config EI`. The private key under `Traning_area/.ssh/` is untracked and must never be committed or copied elsewhere.
- **No secrets in the repo:** no IPs, account names, private paths or tokens in tracked files. Host values go in the untracked `.env` / env files.
- **Configuration lives under `config/`**, grouped by subsystem (`project-config-layout` skill).
- **Docs are part of the feature:** `website/docs/development/training-console.md` must describe the compute host before the work counts as done.
- **server5090 behaviour must not change** when the new env vars are unset: every existing test in `src/training/realman_training/test` stays green.
- **Commits:** Conventional Commits, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Work on a branch `feat/training-compute-host` cut from `origin/main`, never on `main`.
- **Rollback and destructive commands** in docs or messages never go in runnable ```bash blocks. Use ```text.

**Test command (from the repo root):**
```bash
cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test -p no:cacheprovider
```

## File Structure

| File | Responsibility |
|---|---|
| `config/training/training_console.yaml` (modify) | `${VAR-default}` placeholders for host values; new `compute` section; `openpi.backend/env_file/default_share_gpus` |
| `realman_training/config.py` (modify) | `ComputeConfig`, env expansion, bool-from-string, new openpi fields, validation |
| `realman_training/openpi.py` (modify) | lifecycle methods on `Compose`, new `UvOpenpi`, `make_backend`, `normalize_docker_time` |
| `realman_training/steps/{train,norm,eval,view}.py` (modify) | use the backend instead of raw `docker …` argv; default share mode |
| `realman_training/openpi_scripts/prompt_swap.py` (modify) | cwd-relative path to `scripts/eval_open_loop.py` (works in the container and the uv venv) |
| `realman_training/compute.py` (create) | ssh/rsync argv, wire paths, `run_remote`, `_remote-step` / `_remote-cancel` entry points, mirror, push after pull, routing, remote GPU query, code sync |
| `realman_training/jobs.py` (modify) | `run_job` routes a step through `compute.route` |
| `realman_training/steps/pull.py` (modify) | `remote()` runs `docker exec` locally when `remote.ssh_host` is empty |
| `realman_training/cli.py` (modify) | hidden `_remote-step`, `_remote-cancel`, `_gpus`; `compute setup|sync` |
| `realman_training/web_server.py` (modify) | GPU panel asks the compute host when one is configured |
| `realman_training/remote_scripts/setup_uv_host.sh` (create) | idempotent EI environment setup (phase ② work, scripted) |
| `setup.py` (modify) | ship `remote_scripts/*.sh` |
| `config/docker/training-console.Dockerfile`, `config/docker/compose.yaml` (modify) | rsync in the image; pass the new env vars |
| `test/test_compute.py` (create), `test/test_config.py`, `test/test_openpi.py`, `test/test_pull.py`, `test/test_jobs.py` (modify) | tests |
| `website/docs/development/training-console.md` (modify) | compute host section |
| QingTianRobot/openpi `src/openpi/training/config.py` (separate repo) | `dataset_root` default from `OPENPI_REALMAN_DATASET_DIR` |

---

### Task 0: Branch

- [ ] **Step 1: Create the work branch in a worktree**

```bash
git fetch origin && git worktree add -b feat/training-compute-host ../realman_pi-compute origin/main
```

All paths below are relative to that worktree. `realman_training/…` means `src/training/realman_training/realman_training/…`, and `test/…` means `src/training/realman_training/test/…`.

- [ ] **Step 2: Baseline test run**

Run the test command from Global Constraints. Expected: all pass. Write down the count; it must not drop in later tasks.

---

### Task 1: openpi fork — dataset root from the environment

Docker mounts the view at `/datasets/lerobot_realman`. Without docker, every openpi entry point (train, `compute_norm_stats.py`, `eval_open_loop.py`, the console's `python -` scripts) must find the view elsewhere. The console already sets `OPENPI_REALMAN_DATASET_DIR` for compose; make openpi read it.

**Files (repo QingTianRobot/openpi):**
- Modify: `src/openpi/training/config.py` (class `LeRobotRealmanDataConfig`, the `dataset_root` field, around line 460)
- Test: `src/openpi/training/realman_dataset_root_test.py` (create)

**Interfaces:**
- Produces: `LeRobotRealmanDataConfig().dataset_root == os.environ.get("OPENPI_REALMAN_DATASET_DIR", "/datasets/lerobot_realman")`, read when the dataclass instance is created (at config import).

- [ ] **Step 1: Clone the fork next to the realman_pi checkout and branch**

```bash
git clone https://github.com/QingTianRobot/openpi.git ../openpi-fork && cd ../openpi-fork && git checkout -b feat/realman-dataset-root-env
```

- [ ] **Step 2: Write the failing test** `src/openpi/training/realman_dataset_root_test.py`

```python
import openpi.training.config as _config


def test_dataset_root_defaults_to_the_container_mount(monkeypatch):
    monkeypatch.delenv("OPENPI_REALMAN_DATASET_DIR", raising=False)
    assert _config.LeRobotRealmanDataConfig().dataset_root == "/datasets/lerobot_realman"


def test_dataset_root_follows_the_environment(monkeypatch, tmp_path):
    monkeypatch.setenv("OPENPI_REALMAN_DATASET_DIR", str(tmp_path))
    assert _config.LeRobotRealmanDataConfig().dataset_root == str(tmp_path)
```

- [ ] **Step 3: Run it on EI and watch it fail.** The fork's deps are heavy (JAX), so run it in the EI venv: push the branch first, then fetch it in `$W/src/openpi` with `git fetch origin feat/realman-dataset-root-env && git checkout FETCH_HEAD`.

Run (on EI, with `env.sh` sourced): `cd $W/src/openpi && .venv/bin/python -m pytest -q src/openpi/training/realman_dataset_root_test.py`
Expected: `test_dataset_root_follows_the_environment` FAILS (`'/datasets/lerobot_realman' != '/tmp/...'`).

- [ ] **Step 4: Implement.** In `src/openpi/training/config.py` replace

```python
    dataset_root: str = "/datasets/lerobot_realman"
```

with

```python
    # The docker compose overlay mounts the view here; without docker (uv venv on a shared GPU host) the training
    # console sets OPENPI_REALMAN_DATASET_DIR to the view itself.
    dataset_root: str = dataclasses.field(
        default_factory=lambda: os.environ.get("OPENPI_REALMAN_DATASET_DIR", "/datasets/lerobot_realman")
    )
```

Add `import os` at the top if it is not imported yet (`grep -n "^import os" src/openpi/training/config.py`).

- [ ] **Step 5: Run the test again.** Expected: 2 passed. Also run `.venv/bin/python -c "import openpi.training.config as c; print(c.get_config('pi05_realman_action_only').data.dataset_root)"` with and without the variable set; it prints the variable's value, or `/datasets/lerobot_realman` when unset.

- [ ] **Step 6: Commit, push, open a PR on QingTianRobot/openpi, and merge after review.**

```bash
git add src/openpi/training/config.py src/openpi/training/realman_dataset_root_test.py
git commit -m "feat(realman): read the dataset root from OPENPI_REALMAN_DATASET_DIR

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push -u origin feat/realman-dataset-root-env
gh pr create --repo QingTianRobot/openpi --fill
```

---

### Task 2: Config — env expansion, `compute` section, new openpi fields

**Files:**
- Modify: `realman_training/config.py`
- Modify: `config/training/training_console.yaml`
- Test: `test/test_config.py`

**Interfaces:**
- Produces:
  - `ComputeConfig(ssh_host: str = "", ssh_config: str = "", workdir: str = "", connect_timeout_sec: int = 10, mirror_sync_sec: float = 120.0)`, exposed as `ConsoleConfig.compute`.
  - `OpenpiConfig.backend: str = "docker"` (one of `docker`, `uv`), `OpenpiConfig.env_file: str = ""`, `OpenpiConfig.default_share_gpus: bool = False`.
  - `config.expand_env(text: str, environ: Mapping[str, str] | None = None) -> str`, which supports `${VAR}`, `${VAR-default}` (default when unset) and `${VAR:-default}` (default when unset or empty).

- [ ] **Step 1: Write the failing tests** (append to `test/test_config.py`)

```python
from realman_training.config import ComputeConfig, expand_env, load_config


def test_expand_env_forms():
    env = {"A": "x", "E": ""}
    assert expand_env("${A}/y", env) == "x/y"
    assert expand_env("${B-d}", env) == "d"
    assert expand_env("${E-d}", env) == ""          # set but empty: keep empty
    assert expand_env("${E:-d}", env) == "d"        # set but empty: default
    assert expand_env("${B}", env) == "${B}"        # unset, no default: left as is (validation names it)
    assert expand_env("plain", env) == "plain"


def write(tmp_path, body: str):
    path = tmp_path / "c.yaml"
    path.write_text("training_console:\n" + body, encoding="utf-8")
    return path


def test_compute_defaults_to_local(tmp_path):
    config = load_config(write(tmp_path, "  data_root: /d\n"))
    assert config.compute == ComputeConfig()
    assert config.openpi.backend == "docker" and config.openpi.default_share_gpus is False


def test_values_come_from_the_environment(tmp_path, monkeypatch):
    monkeypatch.setenv("RT_HOST", "EI")
    monkeypatch.setenv("RT_W", "/work/x")
    monkeypatch.setenv("RT_SHARE", "true")
    config = load_config(write(tmp_path, (
        "  data_root: ${RT_W}/data/realman\n"
        "  compute:\n    ssh_host: ${RT_HOST-}\n    workdir: ${RT_W-}\n"
        "  openpi:\n    backend: uv\n    repo: ${RT_W}/src/openpi\n    default_share_gpus: ${RT_SHARE-false}\n"
    )))
    assert str(config.data_root) == "/work/x/data/realman"
    assert config.compute.ssh_host == "EI" and config.compute.workdir == "/work/x"
    assert config.openpi.backend == "uv" and str(config.openpi.repo) == "/work/x/src/openpi"
    assert config.openpi.default_share_gpus is True


def test_bool_strings(tmp_path):
    config = load_config(write(tmp_path, "  openpi:\n    default_share_gpus: 'false'\n"))
    assert config.openpi.default_share_gpus is False


def test_compute_needs_an_absolute_workdir(tmp_path):
    with pytest.raises(ValueError, match="compute.workdir"):
        load_config(write(tmp_path, "  compute:\n    ssh_host: EI\n    workdir: relative\n"))


def test_unexpanded_variable_is_refused(tmp_path, monkeypatch):
    monkeypatch.delenv("RT_NOPE", raising=False)
    with pytest.raises(ValueError, match=r"RT_NOPE"):
        load_config(write(tmp_path, "  compute:\n    ssh_host: ${RT_NOPE}\n    workdir: /w\n"))


def test_unknown_backend_is_refused(tmp_path):
    with pytest.raises(ValueError, match="openpi.backend"):
        load_config(write(tmp_path, "  openpi:\n    backend: podman\n"))
```

Check that `test/test_config.py` already imports `pytest`; add `import pytest` if not.

- [ ] **Step 2: Run them.** Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_config.py -p no:cacheprovider`. Expected: FAIL with `ImportError: cannot import name 'ComputeConfig'`.

- [ ] **Step 3: Implement in `realman_training/config.py`**

Add `import re` and `from typing import Mapping` to the imports.

After `RemoteConfig`, add:

```python
@dataclasses.dataclass(frozen=True)
class ComputeConfig:
    """The GPU host that runs clean/view/norm/train/eval/register for this console (ssh only); "" = run them here.

    workdir is the remote root laid out by remote_scripts/setup_uv_host.sh: env.sh, src/openpi (+ .venv),
    src/realman_pi (this package), data/realman. Host values come from the environment (.env), never the repo."""

    ssh_host: str = ""
    ssh_config: str = ""  # "" = ssh's default; relative = to the repo root
    workdir: str = ""
    connect_timeout_sec: int = 10
    mirror_sync_sec: float = 120.0  # refresh the metadata mirror at most this often while a step reports progress
```

In `OpenpiConfig`, after `eval_stride`, add:

```python
    backend: str = "docker"  # docker = `docker compose run` on the openpi repo; uv = the repo's .venv on this host
    env_file: str = ""  # uv backend: sourced before every openpi command (uv cache, jemalloc fix, data home)
    default_share_gpus: bool = False  # True on a shared GPU host: check free memory instead of refusing busy GPUs
```

In `ConsoleConfig`, after `remote`, add `compute: ComputeConfig = dataclasses.field(default_factory=ComputeConfig)`.

Add `"compute"` to `_ALLOWED_TOP_KEYS`.

Add, above `load_config`:

```python
_ENV_REF = re.compile(r"\$\{([A-Za-z_][A-Za-z0-9_]*)(?:(:?-)([^}]*))?\}")


def expand_env(text: str, environ: Mapping[str, str] | None = None) -> str:
    """${VAR}, ${VAR-default} (default when unset) and ${VAR:-default} (default when unset or empty).
    An unset ${VAR} without a default stays as written, so validation can name it."""
    env = os.environ if environ is None else environ

    def replace(match: re.Match) -> str:
        name, op, default = match.group(1), match.group(2), match.group(3)
        value = env.get(name)
        if op == ":-":
            return value if value else default
        if op == "-":
            return default if value is None else value
        return match.group(0) if value is None else value

    return _ENV_REF.sub(replace, text)


def _expand_tree(value):
    if isinstance(value, str):
        return expand_env(value)
    if isinstance(value, dict):
        return {k: _expand_tree(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_expand_tree(v) for v in value]
    return value
```

In `load_config`, right after the `section` mapping check (before the unknown-keys check), add `section = _expand_tree(section)`.

After the `openpi` overlay line, parse and validate compute:

```python
    compute = _parse(ComputeConfig, section.get("compute") or {}, source, "compute")
    _validate_compute(compute, openpi, source)
```

Pass `compute=compute,` in the `ConsoleConfig(...)` call.

In `_parse`, change the bool branch so strings are read as words:

```python
            elif isinstance(default, bool):
                values[name] = value.strip().lower() in ("1", "true", "yes", "on") if isinstance(value, str) else bool(value)
```

Add the validator:

```python
def _validate_compute(c: ComputeConfig, o: OpenpiConfig, source: Path) -> None:
    def fail(key: str, why: str) -> None:
        raise ValueError(f"{source}: {key} {why}")

    for key, value in (("compute.ssh_host", c.ssh_host), ("compute.ssh_config", c.ssh_config),
                       ("compute.workdir", c.workdir), ("openpi.env_file", o.env_file)):
        unset = _ENV_REF.search(value)
        if unset:
            fail(key, f"uses ${{{unset.group(1)}}}, which is not set (put it in the env file)")
    if c.ssh_host and not c.workdir.startswith("/"):
        fail("compute.workdir", "must be an absolute path on the compute host")
    if c.connect_timeout_sec < 1 or c.mirror_sync_sec <= 0:
        fail("compute.connect_timeout_sec/mirror_sync_sec", "must be positive")
    if o.backend not in ("docker", "uv"):
        fail("openpi.backend", "must be docker or uv")
```

- [ ] **Step 4: Run the tests.** Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_config.py -p no:cacheprovider`. Expected: PASS.

- [ ] **Step 5: Update `config/training/training_console.yaml`.** Replace `data_root: ~/data/realman` with:

```yaml
  # Host values come from the environment (the untracked env file); unset = the server5090 layout below.
  data_root: ${REALMAN_TRAINING_DATA_ROOT-~/data/realman}
```

In `remote:`, replace `ssh_host: realman_local` with:

```yaml
    ssh_host: ${REALMAN_RECORDING_SSH_HOST-realman_local}   # "" = the recording container runs on this host (SJD)
```

Insert a new section between `remote:` and `openpi:`:

```yaml
  # The GPU host that runs clean/view/norm/train/eval/register (ssh only). "" = run them here (server5090).
  # On SJDrealman the env file sets these to the campus server; its rules (work dir only, no sudo, never all GPUs)
  # are in Traning_area/SSH连接说明.md on SJD.
  compute:
    ssh_host: ${REALMAN_COMPUTE_SSH_HOST-}
    ssh_config: ${REALMAN_COMPUTE_SSH_CONFIG-}     # relative = to the repo root
    workdir: ${REALMAN_COMPUTE_WORKDIR-}           # absolute, on the compute host
    connect_timeout_sec: 10
    mirror_sync_sec: 120
```

In `openpi:`, replace `repo`, `docker_data` and `weights` with the lines below, and add the three new keys:

```yaml
    backend: ${REALMAN_OPENPI_BACKEND-docker}      # uv on a host without docker (EI)
    env_file: ${REALMAN_OPENPI_ENV_FILE-}
    default_share_gpus: ${REALMAN_OPENPI_SHARE_GPUS-false}
    repo: ${REALMAN_OPENPI_REPO-~/organization/openpi}
    docker_data: ${REALMAN_OPENPI_DATA-~/organization/openpi-docker-data}
    weights: ${REALMAN_OPENPI_WEIGHTS-/home/openpi/.cache/openpi/openpi-assets/checkpoints/pi05_base_from_mac/params}
```

- [ ] **Step 6: Check the real yaml still loads unchanged with no env vars set**

Run:
```bash
cd src/training/realman_training && env -u REALMAN_COMPUTE_SSH_HOST PYTHONPATH=. python -c "from realman_training.config import load_config as l; c=l('../../../config/training/training_console.yaml'); print(c.data_root, c.remote.ssh_host, c.compute, c.openpi.backend, c.openpi.repo)"
```
Expected: `/Users/…/data/realman realman_local ComputeConfig(ssh_host='', ssh_config='', workdir='', connect_timeout_sec=10, mirror_sync_sec=120.0) docker /Users/…/organization/openpi`

Then run the full suite. Expected: the baseline count plus the 7 new tests, all passing.

- [ ] **Step 7: Commit**

```bash
git add src/training/realman_training/realman_training/config.py src/training/realman_training/test/test_config.py config/training/training_console.yaml
git commit -m "feat(training): compute host config and env-expanded host values

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: openpi backends — lifecycle on `Compose`, new `UvOpenpi`

**Files:**
- Modify: `realman_training/openpi.py`
- Modify: `realman_training/openpi_scripts/prompt_swap.py:13`
- Test: `test/test_openpi.py`

**Interfaces:**
- Consumes: `OpenpiConfig.backend`, `.env_file`, `.repo`, `.docker_data` (Task 2).
- Produces:
  - `normalize_docker_time(raw: str) -> str`, moved here from `steps/train.py`.
  - `RUN_DIR_NAME = "console_run"`.
  - Both `Compose` and `UvOpenpi` provide:
    - `env() -> dict[str, str]`
    - `run(command: str, *, env=None, name=None, detach=False) -> list[str]`
    - `exists(runner, name) -> bool`, `running(runner, name) -> bool`
    - `stop(runner, name, timeout_sec: int) -> Completed`
    - `exit_code(runner, name) -> int`, `remove(runner, name) -> None`
    - `started_at(runner, name) -> str`
  - `make_backend(config: OpenpiConfig, dataset_dir: Path, gpus: tuple[int, ...] = ()) -> Compose | UvOpenpi`.

- [ ] **Step 1: Write the failing tests** (append to `test/test_openpi.py`)

```python
import dataclasses
from pathlib import Path

import pytest
from fake_runner import FakeRunner

from realman_training.config import OpenpiConfig
from realman_training.jobs import StepFailed
from realman_training.openpi import Compose, UvOpenpi, make_backend, normalize_docker_time


def uv_config(tmp_path) -> OpenpiConfig:
    repo = tmp_path / "openpi"
    return dataclasses.replace(OpenpiConfig(), backend="uv", repo=repo, docker_data=repo, env_file="/w/env.sh")


def test_make_backend_picks_by_config(tmp_path):
    assert isinstance(make_backend(OpenpiConfig(), tmp_path), Compose)
    assert isinstance(make_backend(uv_config(tmp_path), tmp_path), UvOpenpi)


def test_uv_env_points_openpi_at_the_view_and_the_gpus(tmp_path):
    backend = UvOpenpi(uv_config(tmp_path), tmp_path / "v_view", (2, 5))
    assert backend.env() == {"OPENPI_REALMAN_DATASET_DIR": str(tmp_path / "v_view"), "CUDA_VISIBLE_DEVICES": "2,5"}
    cpu = UvOpenpi(uv_config(tmp_path), tmp_path / "v_view")
    assert cpu.env()["CUDA_VISIBLE_DEVICES"] == "" and cpu.env()["JAX_PLATFORMS"] == "cpu"


def test_uv_run_without_name_is_a_plain_bash(tmp_path):
    config = uv_config(tmp_path)
    argv = UvOpenpi(config, tmp_path).run("uv run --no-sync python - x", env={"A": "1"})
    assert argv[:3] == ["env", "A=1", "bash"] and argv[3] == "-c"
    assert argv[4].startswith(f"source /w/env.sh && cd {config.repo} && ")
    assert argv[4].endswith("uv run --no-sync python - x")


def test_uv_run_maps_workspace_and_records_pid_and_exit(tmp_path):
    config = uv_config(tmp_path)
    argv = UvOpenpi(config, tmp_path).run("opic-train c >> /workspace/wandb/e.log 2>&1", name="t-e", detach=True)
    assert argv[:4] == ["env", "setsid", "-f", "bash"]
    script = argv[-1]
    run = config.docker_data / "console_run"
    assert f"echo $$ > {run}/t-e.pid" in script
    assert f">> {config.repo}/wandb/e.log" in script and "/workspace" not in script
    assert "exec </dev/null >/dev/null 2>&1" in script
    assert f"echo $c > {run}/t-e.exit" in script
    assert "opic-train() {" in script


def test_uv_run_attached_waits(tmp_path):
    argv = UvOpenpi(uv_config(tmp_path), tmp_path).run("opic-norm --config-name c", name="n-c")
    assert argv[1:4] == ["setsid", "-w", "bash"] and "exec </dev/null" not in argv[-1]


def test_uv_detached_needs_a_name(tmp_path):
    with pytest.raises(ValueError):
        UvOpenpi(uv_config(tmp_path), tmp_path).run("x", detach=True)


def test_uv_lifecycle_commands(tmp_path):
    config = uv_config(tmp_path)
    backend = UvOpenpi(config, tmp_path)
    pid = config.docker_data / "console_run" / "t.pid"
    runner = FakeRunner().on("test -e", returncode=0).on("kill -0", returncode=1).on("cat", stdout="3\n")
    assert backend.exists(runner, "t") is True
    assert runner.calls[-1] == ["test", "-e", str(pid)]
    assert backend.running(runner, "t") is False
    assert backend.exit_code(runner, "t") == 3
    backend.stop(runner, "t", 60)
    assert "kill -TERM -- -$p" in runner.calls[-1][-1] and "seq 60" in runner.calls[-1][-1]
    backend.remove(runner, "t")
    assert runner.calls[-1][:2] == ["rm", "-f"]


def test_uv_missing_exit_file_is_a_failure(tmp_path):
    runner = FakeRunner().on("cat", returncode=1)
    with pytest.raises(StepFailed, match="without writing"):
        UvOpenpi(uv_config(tmp_path), tmp_path).exit_code(runner, "t")


def test_compose_lifecycle_keeps_the_docker_commands(tmp_path):
    compose = Compose(OpenpiConfig(), tmp_path)
    runner = (FakeRunner().on("container inspect", returncode=1).on("{{.State.Running}}", stdout="true\n")
              .on("{{.State.ExitCode}}", stdout="0\n").on("{{.State.StartedAt}}", stdout="2026-10-20T08:12:34.5Z\n"))
    assert compose.exists(runner, "c") is False
    assert compose.running(runner, "c") is True
    assert compose.exit_code(runner, "c") == 0
    compose.stop(runner, "c", 30)
    assert runner.calls[-1] == ["docker", "stop", "-t", "30", "c"]
    compose.remove(runner, "c")
    assert runner.calls[-1] == ["docker", "rm", "c"]
    assert compose.started_at(runner, "c") == normalize_docker_time("2026-10-20T08:12:34.5Z")
```

- [ ] **Step 2: Run them.** Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_openpi.py -p no:cacheprovider`. Expected: FAIL with `ImportError: cannot import name 'UvOpenpi'`.

- [ ] **Step 3: Implement in `realman_training/openpi.py`**

Add `import datetime` and `from typing import Union` to the imports, and change `from .runner import Runner` to `from .runner import Completed, Runner`.

Move `_normalize_docker_time` out of `steps/train.py` into `openpi.py` as a public function, body unchanged:

```python
def normalize_docker_time(raw: str) -> str:
    """Docker's nanosecond Z timestamp (2026-10-20T08:12:34.123456789Z) as a local isoformat string; the raw text on
    any parse error (Python 3.10's fromisoformat takes neither nanoseconds nor a bare Z)."""
    try:
        s = raw.rstrip("Z")
        if "." in s:
            s = s[:s.index(".")]
        parsed = datetime.datetime.fromisoformat(s).replace(tzinfo=datetime.timezone.utc)
        return parsed.astimezone().isoformat(timespec="seconds")
    except (ValueError, OverflowError):
        return raw
```

Add these methods to the `Compose` dataclass, after `run`:

```python
    # Lifecycle of the named containers the steps start (same commands the steps used before).
    def exists(self, runner: Runner, name: str) -> bool:
        return runner.run(["docker", "container", "inspect", name]).returncode == 0

    def running(self, runner: Runner, name: str) -> bool:
        return runner.check(["docker", "inspect", "-f", "{{.State.Running}}", name]).strip() == "true"

    def stop(self, runner: Runner, name: str, timeout_sec: int) -> Completed:
        return runner.run(["docker", "stop", "-t", str(timeout_sec), name])

    def exit_code(self, runner: Runner, name: str) -> int:
        return int(runner.check(["docker", "inspect", "-f", "{{.State.ExitCode}}", name]).strip())

    def remove(self, runner: Runner, name: str) -> None:
        runner.run(["docker", "rm", name])

    def started_at(self, runner: Runner, name: str) -> str:
        return normalize_docker_time(runner.check(["docker", "inspect", "-f", "{{.State.StartedAt}}", name]).strip())
```

After `Compose`, add:

```python
RUN_DIR_NAME = "console_run"  # under docker_data: <name>.pid (process group) and <name>.exit of uv runs
# The container's helpers (scripts/docker/container-functions.zsh in openpi), for the uv venv.
UV_FUNCTIONS = (
    'opic-train() { XLA_PYTHON_CLIENT_MEM_FRACTION="${XLA_PYTHON_CLIENT_MEM_FRACTION:-0.9}" '
    'uv run --no-sync scripts/train.py "$@"; }; '
    'opic-norm() { uv run --no-sync scripts/compute_norm_stats.py "$@"; }; '
)


@dataclasses.dataclass(frozen=True)
class UvOpenpi:
    """openpi in the repo's own .venv on this host (a shared GPU server without docker).

    Same interface as Compose. With docker_data == repo, the container paths /workspace/{checkpoints,assets,wandb}
    are the host paths repo/{…} once /workspace is replaced by the repo. Named runs start under `setsid` as their own
    process group; <run>/<name>.pid holds its id and <run>/<name>.exit its exit code, so a run outlives the ssh
    session that started it and can be followed, stopped and attached to like a container."""

    config: OpenpiConfig
    dataset_dir: Path
    gpus: tuple[int, ...] = ()

    def env(self) -> dict[str, str]:
        env = {"OPENPI_REALMAN_DATASET_DIR": str(self.dataset_dir), "CUDA_VISIBLE_DEVICES": ",".join(map(str, self.gpus))}
        if not self.gpus:
            env["JAX_PLATFORMS"] = "cpu"  # no GPU visible: without this JAX's CUDA plugin aborts at start
        return env

    def _files(self, name: str) -> tuple[Path, Path]:
        run = self.config.docker_data / RUN_DIR_NAME
        return run / f"{name}.pid", run / f"{name}.exit"

    def _body(self, command: str) -> str:
        source = f"source {shlex.quote(self.config.env_file)} && " if self.config.env_file else ""
        return (f"{source}cd {shlex.quote(str(self.config.repo))} && {UV_FUNCTIONS}"
                + command.replace("/workspace", str(self.config.repo)))

    def run(self, command: str, *, env: dict[str, str] | None = None, name: str | None = None,
            detach: bool = False) -> list[str]:
        assigns = [f"{key}={value}" for key, value in (env or {}).items()]
        if name is None:
            if detach:
                raise ValueError("a detached run needs a name")
            return ["env", *assigns, "bash", "-c", self._body(command)]
        pid, exit_file = (shlex.quote(str(p)) for p in self._files(name))
        script = (
            f"mkdir -p {shlex.quote(str(self.config.docker_data / RUN_DIR_NAME))} && echo $$ > {pid} && rm -f {exit_file}; "
            + ("exec </dev/null >/dev/null 2>&1; " if detach else "")
            + f"( {self._body(command)} ); c=$?; echo $c > {exit_file}; exit $c"
        )
        return ["env", *assigns, "setsid", "-f" if detach else "-w", "bash", "-c", script]

    def exists(self, runner: Runner, name: str) -> bool:
        return runner.run(["test", "-e", str(self._files(name)[0])]).returncode == 0

    def running(self, runner: Runner, name: str) -> bool:
        pid = shlex.quote(str(self._files(name)[0]))
        return runner.run(["bash", "-c", f"kill -0 -- -$(cat {pid}) 2>/dev/null"]).returncode == 0

    def stop(self, runner: Runner, name: str, timeout_sec: int) -> Completed:
        pid = shlex.quote(str(self._files(name)[0]))
        return runner.run(["bash", "-c",
                           f"p=$(cat {pid}) || exit 1; kill -TERM -- -$p 2>/dev/null || exit 0; "
                           f"for i in $(seq {int(timeout_sec)}); do kill -0 -- -$p 2>/dev/null || exit 0; sleep 1; done; "
                           f"kill -KILL -- -$p"])

    def exit_code(self, runner: Runner, name: str) -> int:
        exit_file = self._files(name)[1]
        done = runner.run(["cat", str(exit_file)])
        if done.returncode or not done.stdout.strip():
            raise StepFailed(f"{name} ended without writing {exit_file} (killed from outside?)")
        return int(done.stdout.strip())

    def remove(self, runner: Runner, name: str) -> None:
        runner.run(["rm", "-f", *map(str, self._files(name))])

    def started_at(self, runner: Runner, name: str) -> str:
        return runner.check(["date", "-r", str(self._files(name)[0]), "+%Y-%m-%dT%H:%M:%S%:z"]).strip()


Backend = Union[Compose, UvOpenpi]


def make_backend(config: OpenpiConfig, dataset_dir: Path, gpus: tuple[int, ...] = ()) -> Backend:
    return UvOpenpi(config, dataset_dir, gpus) if config.backend == "uv" else Compose(config, dataset_dir, gpus)
```

Change the annotation in `config_info(runner: Runner, compose: Compose, name: str)` to `compose: Backend`.

- [ ] **Step 4: Fix `prompt_swap.py` so it works in both runtimes.** In `realman_training/openpi_scripts/prompt_swap.py`, line 13, replace

```python
_spec = importlib.util.spec_from_file_location("eval_open_loop", "/workspace/scripts/eval_open_loop.py")
```

with

```python
# Both runtimes start this script from the openpi repo (/workspace in the container, the checkout in a uv venv).
_spec = importlib.util.spec_from_file_location("eval_open_loop", "scripts/eval_open_loop.py")
```

- [ ] **Step 5: Run the tests.** Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_openpi.py -p no:cacheprovider`. Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/training/realman_training/realman_training/openpi.py src/training/realman_training/realman_training/openpi_scripts/prompt_swap.py src/training/realman_training/test/test_openpi.py
git commit -m "feat(training): uv openpi backend with a container-like lifecycle

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Steps use the backend; shared GPUs by default where configured

**Files:**
- Modify: `realman_training/steps/train.py`, `realman_training/steps/norm.py`, `realman_training/steps/eval.py`, `realman_training/steps/view.py`
- Test: `test/test_norm_train.py`, `test/test_view.py` (add uv cases; the existing docker cases must stay green unchanged)

**Interfaces:**
- Consumes: `make_backend`, `normalize_docker_time` and the lifecycle methods (Task 3); `OpenpiConfig.default_share_gpus` (Task 2).
- Produces: `view.view_command(openpi, src, dst, arm, prompts, quality)`, which returns a `bash -c` argv when `openpi.backend == "uv"`.

- [ ] **Step 1: Write the failing tests.** Append to `test/test_norm_train.py`. Reuse that file's `env` fixture and `INFO`. The uv config uses `docker_data == repo`.

```python
def uv_env(env, tmp_path, share="false"):
    repo = env["docker_data"]
    config = tmp_path / "uv.yaml"
    config.write_text(
        "training_console:\n"
        f"  data_root: {env['view'].parent}\n"
        f"  openpi:\n    backend: uv\n    env_file: /w/env.sh\n    repo: {repo}\n    docker_data: {repo}\n"
        f"    default_share_gpus: {share}\n"
    )
    return str(config)


def test_train_on_uv_starts_a_setsid_group_and_follows_it(env, tmp_path):
    stats = env["docker_data"] / "assets/pi05_x/local/v/norm_stats.json"
    stats.parent.mkdir(parents=True)
    stats.write_text("{}")
    alive = iter([0, 1])  # `kill -0` on the process group: running once, then gone
    # Rule order matters: FakeRunner answers with the first substring match, and the `kill -0` script also
    # contains "cat ", so its rule comes before the `cat <exit file>` rule.
    runner = (FakeRunner().on("python -", stdout=json.dumps(INFO))
              .on("test -e", returncode=1)
              .on("nvidia-smi", stdout="1, 9000, 49140\n")
              .on("opic-train", stdout="")
              .on("kill -0", returncode=lambda argv, input: next(alive, 1))
              .on("cat ", stdout="0\n")
              .on("git -C", stdout="abc\n"))
    params = {"config_name": "pi05_x", "view": str(env["view"]), "exp": "e1", "gpus": "1",
              "config": uv_env(env, tmp_path, share="true"), "poll_sec": 0}
    result = train.run(params, RecordingLog(), runner=runner, sleep=lambda s: None)
    start = runner.commands("opic-train")[0]
    assert start[:3] == ["env", "XLA_PYTHON_CLIENT_PREALLOCATE=false", "setsid"] and start[3] == "-f"
    assert runner.envs[runner.calls.index(start)]["CUDA_VISIBLE_DEVICES"] == "1"
    assert result["exit_code"] == 0
    assert runner.calls[-1][:2] == ["rm", "-f"]  # pid/exit files removed, like `docker rm`
    assert not runner.commands("docker ")


def test_train_on_a_shared_host_checks_free_memory_not_busy(env, tmp_path):
    runner = (FakeRunner().on("python -", stdout=json.dumps(INFO)).on("test -e", returncode=1)
              .on("nvidia-smi", stdout="1, 40000, 49140\n"))
    params = {"config_name": "pi05_x", "view": str(env["view"]), "exp": "e1", "gpus": "1",
              "config": uv_env(env, tmp_path, share="true")}
    with pytest.raises(StepFailed, match="not enough free memory"):
        train.run(params, RecordingLog(), runner=runner)


def test_norm_on_uv_runs_cpu_only(env, tmp_path):
    stats = env["docker_data"] / "assets/pi05_x/local/v/norm_stats.json"

    def write_stats(argv, input):
        stats.parent.mkdir(parents=True)
        stats.write_text("{}")

    runner = (FakeRunner().on("python -", stdout=json.dumps(INFO)).on("test -e", returncode=1)
              .on("opic-norm", action=write_stats, lines=["ok"]))
    out = norm.run({"config_name": "pi05_x", "view": str(env["view"]), "config": uv_env(env, tmp_path)},
                   RecordingLog(), runner=runner)
    assert out["computed"] is True
    call = runner.commands("opic-norm")[0]
    assert call[:3] == ["env", "JAX_PLATFORMS=cpu", "setsid"]
```

The first test needs `FakeRunner` to accept a callable `returncode` `(argv, input) -> int`. Patch `test/fake_runner.py` once: in `_answer`, right after `stdout = stdout(argv, input)`, add

```python
                if callable(returncode):
                    returncode = returncode(argv, input)
```

Append to `test/test_view.py`:

```python
import dataclasses

from realman_training.config import OpenpiConfig, QualityConfig
from realman_training.steps.view import view_command


def test_view_command_on_uv_runs_the_script_from_the_repo(tmp_path):
    openpi = dataclasses.replace(OpenpiConfig(), backend="uv", repo=tmp_path / "openpi", env_file="/w/env.sh")
    argv = view_command(openpi, tmp_path / "src", tmp_path / "dst", "r", {"a": "do a"}, QualityConfig())
    assert argv[:2] == ["bash", "-c"]
    assert argv[2].startswith(f"source /w/env.sh && cd {tmp_path / 'openpi'} && ")
    assert "uv run --no-sync scripts/make_realman_view.py --src" in argv[2]
    assert "docker" not in " ".join(argv)
```

- [ ] **Step 2: Run them.** Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_norm_train.py test/test_view.py -p no:cacheprovider`. Expected: the new tests FAIL. The uv tests call `docker container inspect` / `docker run`, and the share test raises "GPUs in use by someone else".

- [ ] **Step 3: Implement in `steps/train.py`**
  - Imports: replace `Compose,` with `make_backend,` in the `from ..openpi import (…)` list, and add `normalize_docker_time`.
  - Delete the local `_normalize_docker_time` function. Keep a module alias for anything that imported it: `_normalize_docker_time = normalize_docker_time`.
  - Change `_follow` to take a predicate instead of runner+container:

```python
def _follow(running, log_path: Path, total: int, log, poll: float, sleep, offset: int = 0) -> int | None:
    pending, last = "", None
    while True:
        alive = running()
        # … the rest of the body unchanged, with `running` replaced by `alive` in `if not alive: return last`
```

  - In `run`:
    - `compose = Compose(oc, view, gpus)` becomes `compose = make_backend(oc, view, gpus)`.
    - `exists = runner.run(["docker", "container", "inspect", container]).returncode == 0` becomes `exists = compose.exists(runner, container)`.
    - In the attach branch, replace the `started_raw` try-block body with `record["started"] = compose.started_at(runner, container)`. Keep the `except Exception: pass`.
    - Replace `if params.get("share_gpus"):` with:

```python
        share = params.get("share_gpus")
        if share is None:
            share = oc.default_share_gpus
        if share:
```

    - The `_follow(...)` call becomes `_follow(lambda: compose.running(runner, container), host_log, total, log, float(params.get("poll_sec", 15)), sleep, log_offset)`.
    - On cancel, `result = runner.run(["docker", "stop", "-t", "60", container])` becomes `result = compose.stop(runner, container, 60)`.
    - Replace the `exit_code = int(runner.check([... ExitCode ...]))` and `runner.run(["docker", "rm", container])` lines with:

```python
    exit_code = compose.exit_code(runner, container)
    compose.remove(runner, container)
```

- [ ] **Step 4: Implement in `steps/norm.py`**
  - Import `make_backend` instead of `Compose`; `compose = make_backend(config.openpi, view)`.
  - `exists = runner.run(["docker", "container", "inspect", cname]).returncode == 0` becomes `exists = compose.exists(runner, cname)`.
  - The cancel-path `docker stop` becomes `result = compose.stop(runner, cname, 30)`.
  - After the stream returns, add `compose.remove(runner, cname)` for uv. Docker uses `--rm`, so its `docker rm` would fail harmlessly. Guard it with `if config.openpi.backend == "uv": compose.remove(runner, cname)`.

- [ ] **Step 5: Implement in `steps/eval.py`**
  - Same import change; `compose = make_backend(oc, view, gpus)`.
  - Apply the same `share` default as train (`share = params.get("share_gpus")`, defaulting to `oc.default_share_gpus`).
  - In `_run_container`:
    - `exists = runner.run([... "container", "inspect", cname]).returncode == 0` becomes `exists = compose.exists(runner, cname)`.
    - The cancel `docker stop` becomes `compose.stop(runner, cname, 30)`.
    - After `code = runner.stream(...)`, add `if oc.backend == "uv": compose.remove(runner, cname)`.

- [ ] **Step 6: Implement in `steps/view.py`.** At the top of `view_command`, after `args` is built and before the docker `return`, insert:

```python
    if openpi.backend == "uv":
        source = f"source {shlex.quote(openpi.env_file)} && " if openpi.env_file else ""
        return ["bash", "-c", f"{source}cd {shlex.quote(str(openpi.repo))} && "
                              "uv run --no-sync scripts/make_realman_view.py " + shlex.join(args)]
```

The `shared` common-path computation stays above it. It is only used by the docker argv.

- [ ] **Step 7: Run the whole suite.** Expected: everything passes, including the untouched docker tests (`test_norm_train.py`, `test_eval.py`, `test_view.py`). If a docker test fails, the refactor changed a docker argv. Compare against Task 3's `Compose` lifecycle, which must emit exactly the old commands.

- [ ] **Step 8: Commit**

```bash
git add src/training/realman_training/realman_training/steps src/training/realman_training/test
git commit -m "feat(training): steps run openpi through the configured backend

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: `compute.py` — remote steps, wire paths, metadata mirror

**Files:**
- Create: `realman_training/compute.py`
- Modify: `realman_training/cli.py` (hidden `_remote-step`, `_remote-cancel`)
- Test: `test/test_compute.py` (create)

**Interfaces:**
- Consumes:
  - `ConsoleConfig.compute`, `.data_root`, `.openpi.docker_data`, `.openpi.repo` (Task 2).
  - `jobs.STEPS`, `jobs.StepLog`, `jobs.StepFailed`, `jobs.JobCancelled`.
  - `runner.Runner.stream/run/check`, `config.REPO_ROOT`.
- Produces (used by Tasks 6–8):
  - Constants and layout:
    - `REMOTE_KINDS = ("clean", "view", "norm", "train", "eval", "register")`.
    - `MIRROR_EXCLUDES`.
    - `REMOTE_DATA_ROOT = "data/realman"`, `REMOTE_OPENPI = "src/openpi"`, `REMOTE_REPO = "src/realman_pi"`.
  - ssh and paths:
    - `enabled(config) -> bool`.
    - `ssh_base(config) -> list[str]`, `ssh_argv(config, command: str) -> list[str]`.
    - `remote_path(config, sub: str) -> str`.
    - `remote_python(config, args: list[str]) -> str`, a shell command string for ssh.
  - Wire format:
    - `to_wire(value, config)` / `from_wire(value, config)`.
  - Running steps:
    - `run_remote(kind: str, params: dict, log, runner: Runner | None = None, clock=time.monotonic) -> dict`.
    - `remote_step_main(kind: str, token: str) -> int` / `remote_cancel_main(token: str) -> int`.
  - Mirror:
    - `rsync_from(config, remote: str, local: Path, excludes=MIRROR_EXCLUDES) -> list[str]`.
    - `sync_mirror(config, runner, log) -> bool`.

- [ ] **Step 1: Write the failing tests** `test/test_compute.py`

```python
from __future__ import annotations

import json
from pathlib import Path

import pytest
from fake_runner import FakeRunner, RecordingLog

from realman_training import compute
from realman_training.config import load_config
from realman_training.jobs import JobCancelled, StepFailed


@pytest.fixture()
def config(tmp_path):
    path = tmp_path / "c.yaml"
    path.write_text(
        "training_console:\n"
        f"  data_root: {tmp_path / 'data'}\n"
        f"  openpi:\n    repo: {tmp_path / 'mirror/openpi'}\n    docker_data: {tmp_path / 'mirror/openpi'}\n"
        "  compute:\n    ssh_host: EI\n    ssh_config: Traning_area/.ssh/config\n    workdir: /w\n    mirror_sync_sec: 60\n",
        encoding="utf-8",
    )
    return load_config(path)


def test_enabled_only_with_a_host(config):
    assert compute.enabled(config)


def test_ssh_argv_uses_the_repo_relative_config(config):
    argv = compute.ssh_argv(config, "true")
    assert argv[0] == "ssh" and argv[1] == "-F" and argv[2].endswith("Traning_area/.ssh/config")
    assert "BatchMode=yes" in argv and argv[-2:] == ["EI", "true"]


def test_remote_python_runs_the_package_in_the_openpi_venv(config):
    command = compute.remote_python(config, ["_remote-step", "train", "ab12"])
    assert command.startswith("bash -c ")
    assert "source /w/env.sh" in command and "cd /w/src/realman_pi" in command
    assert "PYTHONPATH=/w/src/realman_pi/src/training/realman_training" in command
    assert "/w/src/openpi/.venv/bin/python -m realman_training _remote-step train ab12" in command


def test_wire_round_trip(config):
    local = {"view": str(config.data_root / "v_view"), "init": str(config.openpi.docker_data / "checkpoints/c/e/1"),
             "list": [str(config.data_root)], "other": "/etc/x", "n": 3}
    wire = compute.to_wire(local, config)
    assert wire["view"] == "@data_root/v_view" and wire["init"] == "@docker_data/checkpoints/c/e/1"
    assert wire["list"] == ["@data_root"] and wire["other"] == "/etc/x" and wire["n"] == 3
    assert compute.from_wire(wire, config) == local


def test_run_remote_streams_log_progress_and_result(config):
    lines = ["hello", '@@progress {"done": 1, "total": 2, "text": "half"}',
             '@@result {"dst": "@data_root/v_view", "episodes": 3}']
    runner = FakeRunner().on("_remote-step", lines=lines)
    log = RecordingLog()
    result = compute.run_remote("view", {"src": str(config.data_root / "c"), "config": "/local.yaml"}, log,
                                runner=runner, load=lambda _: config)
    assert result == {"dst": str(config.data_root / "v_view"), "episodes": 3}
    sent = json.loads(runner.inputs[0])
    assert sent == {"src": "@data_root/c"}  # the local config path stays local
    assert "hello" in log.lines and log.progress_calls[0][:2] == (1, 2)
    assert runner.commands("rsync")  # mirror refreshed after the step


def test_run_remote_failure_and_lost_connection(config):
    failing = FakeRunner().on("_remote-step", lines=["@@failed GPUs in use"], returncode=1)
    with pytest.raises(StepFailed, match="GPUs in use"):
        compute.run_remote("train", {}, RecordingLog(), runner=failing, load=lambda _: config)
    lost = FakeRunner().on("_remote-step", lines=["Step 5: loss=1"], returncode=255)
    with pytest.raises(StepFailed, match="lost the connection.*attach"):
        compute.run_remote("train", {}, RecordingLog(), runner=lost, load=lambda _: config)


def test_run_remote_cancel_stops_the_remote_step(config):
    def cancel(argv, input):
        raise JobCancelled()

    runner = FakeRunner().on("_remote-step", action=cancel)
    with pytest.raises(JobCancelled):
        compute.run_remote("norm", {}, RecordingLog(), runner=runner, load=lambda _: config)
    assert runner.commands("_remote-cancel")


def test_mirror_excludes_videos_and_weights(config):
    runner = FakeRunner()
    assert compute.sync_mirror(config, runner, RecordingLog()) is True
    data = [c for c in runner.commands("rsync") if c[-1] == f"{config.data_root}/"][0]
    assert "--exclude=videos/" in data and "--exclude=params/" in data and "--exclude=train_state/" in data
    assert data[-2] == "EI:/w/data/realman/"
    targets = {c[-1] for c in runner.commands("rsync")}
    assert f"{config.openpi.docker_data / 'checkpoints'}/" in targets
    assert f"{config.openpi.docker_data / 'wandb'}/" in targets


def test_remote_step_main_reports_result_and_failure(monkeypatch, capsys, tmp_path, config):
    monkeypatch.setattr(compute, "load_config", lambda path=None: config)
    monkeypatch.setattr(compute, "_step", lambda kind: (lambda params, log: (log("working"), {"dst": params["dst"]})[1]))
    monkeypatch.setattr("sys.stdin", __import__("io").StringIO(json.dumps({"dst": "@data_root/x"})))
    assert compute.remote_step_main("view", "t1") == 0
    out = capsys.readouterr().out.splitlines()
    assert out[0] == "working" and out[-1] == '@@result {"dst": "@data_root/x"}'

    def fail(params, log):
        raise StepFailed("nope")

    monkeypatch.setattr(compute, "_step", lambda kind: fail)
    monkeypatch.setattr("sys.stdin", __import__("io").StringIO("{}"))
    assert compute.remote_step_main("view", "t2") == 1
    assert capsys.readouterr().out.splitlines()[-1] == "@@failed nope"


def test_remote_step_refuses_local_kinds(config):
    assert compute.remote_step_main("pull", "t") == 2
```

`run_remote` takes an injectable `load` (default `load_config`). This keeps tests off the repo yaml.

- [ ] **Step 2: Run them.** Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_compute.py -p no:cacheprovider`. Expected: FAIL with `ImportError: cannot import name 'compute'`.

- [ ] **Step 3: Create `realman_training/compute.py`**

```python
"""The GPU host (compute.ssh_host) that runs clean/view/norm/train/eval/register for a console on another machine.

The console keeps its jobs; each such step runs on the compute host as
`python -m realman_training _remote-step <kind> <token>` with the same step code and that host's own config (the same
yaml, its own environment from env.sh). Paths cross as @data_root/… and @docker_data/… so each side expands them
under its own roots. Plain lines are the step's log; @@progress/@@result/@@failed/@@cancelled lines carry the rest.
After a step the console's data_root and docker_data are refreshed with rsync, without videos and checkpoint weights:
a metadata mirror that the web pages read as before.
"""

from __future__ import annotations

import functools
import importlib
import json
import os
import secrets
import shlex
import signal
import sys
import time
import traceback
from pathlib import Path

from .config import REPO_ROOT, ConsoleConfig, load_config
from .jobs import STEPS, JobCancelled, StepFailed, StepLog
from .runner import Runner

REMOTE_KINDS = ("clean", "view", "norm", "train", "eval", "register")
REMOTE_DATA_ROOT = "data/realman"
REMOTE_OPENPI = "src/openpi"
REMOTE_REPO = "src/realman_pi"
PACKAGE = "src/training/realman_training"
MIRROR_EXCLUDES = ("videos/", "*.mp4", "params/", "train_state/", "_console/", "*.partial/", "console_run/")
PROGRESS, RESULT, FAILED, CANCELLED = "@@progress ", "@@result ", "@@failed ", "@@cancelled"
SSH_LOST = 255


def enabled(config: ConsoleConfig) -> bool:
    return bool(config.compute.ssh_host)


def ssh_base(config: ConsoleConfig) -> list[str]:
    c = config.compute
    argv = ["ssh"]
    if c.ssh_config:
        path = Path(c.ssh_config).expanduser()
        argv += ["-F", str(path if path.is_absolute() else REPO_ROOT / path)]
    return argv + ["-o", "BatchMode=yes", "-o", f"ConnectTimeout={c.connect_timeout_sec}",
                   "-o", "ServerAliveInterval=30", "-o", "ServerAliveCountMax=4"]


def ssh_argv(config: ConsoleConfig, command: str) -> list[str]:
    return [*ssh_base(config), config.compute.ssh_host, command]


def remote_path(config: ConsoleConfig, sub: str) -> str:
    return f"{config.compute.workdir.rstrip('/')}/{sub}"


def remote_python(config: ConsoleConfig, args: list[str]) -> str:
    q = shlex.quote
    script = (f"source {q(remote_path(config, 'env.sh'))} && cd {q(remote_path(config, REMOTE_REPO))} && "
              f"PYTHONPATH={q(remote_path(config, REMOTE_REPO + '/' + PACKAGE))} "
              f"exec {q(remote_path(config, REMOTE_OPENPI + '/.venv/bin/python'))} -m realman_training "
              + shlex.join(args))
    return shlex.join(["bash", "-c", script])


def _roots(config: ConsoleConfig) -> list[tuple[str, str]]:
    roots = [("@data_root", str(config.data_root)), ("@docker_data", str(config.openpi.docker_data))]
    return sorted(roots, key=lambda pair: -len(pair[1]))  # a root nested in the other is matched first


def _convert(value, swap):
    if isinstance(value, str):
        return swap(value)
    if isinstance(value, dict):
        return {key: _convert(item, swap) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [_convert(item, swap) for item in value]
    return value


def to_wire(value, config: ConsoleConfig):
    roots = _roots(config)

    def swap(text: str) -> str:
        for tag, root in roots:
            if text == root or text.startswith(root + "/"):
                return tag + text[len(root):]
        return text

    return _convert(value, swap)


def from_wire(value, config: ConsoleConfig):
    roots = _roots(config)

    def swap(text: str) -> str:
        for tag, root in roots:
            if text == tag or text.startswith(tag + "/"):
                return root + text[len(tag):]
        return text

    return _convert(value, swap)


def rsync_from(config: ConsoleConfig, remote: str, local: Path, excludes=MIRROR_EXCLUDES) -> list[str]:
    return ["rsync", "-a", "--partial", "-e", shlex.join(ssh_base(config)), *[f"--exclude={e}" for e in excludes],
            f"{config.compute.ssh_host}:{remote.rstrip('/')}/", f"{local}/"]


def sync_mirror(config: ConsoleConfig, runner: Runner, log) -> bool:
    """Refresh data_root and docker_data/{checkpoints,wandb} from the compute host, metadata only."""
    pairs = [
        (remote_path(config, REMOTE_DATA_ROOT), config.data_root),
        (remote_path(config, REMOTE_OPENPI + "/checkpoints"), config.openpi.docker_data / "checkpoints"),
        (remote_path(config, REMOTE_OPENPI + "/wandb"), config.openpi.docker_data / "wandb"),
    ]
    ok = True
    for remote, local in pairs:
        local.mkdir(parents=True, exist_ok=True)
        done = runner.run(rsync_from(config, remote, local))
        if done.returncode:
            ok = False
            log(f"mirror: {remote} not refreshed ({(done.stderr or done.stdout).strip()[-200:]})")
    # The web lists the RealMan configs found in the openpi checkout (catalog.openpi_configs).
    training = config.openpi.repo / "src" / "openpi" / "training"
    training.mkdir(parents=True, exist_ok=True)
    source = f"{config.compute.ssh_host}:{remote_path(config, REMOTE_OPENPI + '/src/openpi/training/config.py')}"
    if runner.run(["rsync", "-a", "-e", shlex.join(ssh_base(config)), source, f"{training}/"]).returncode:
        ok = False
    return ok


def run_remote(kind: str, params: dict, log, runner: Runner | None = None, clock=time.monotonic,
               load=load_config) -> dict:
    runner = runner or Runner()
    config = load(params.get("config"))
    host = config.compute.ssh_host
    token = secrets.token_hex(4)
    wire = to_wire({key: value for key, value in params.items() if key != "config"}, config)
    state = {"result": None, "failed": None, "cancelled": False, "synced": clock()}

    def on_line(line: str) -> None:
        if line.startswith(PROGRESS):
            data = json.loads(line[len(PROGRESS):])
            log.progress(data["done"], data.get("total"), data.get("text", ""))
            if clock() - state["synced"] >= config.compute.mirror_sync_sec:
                state["synced"] = clock()
                sync_mirror(config, runner, log)
        elif line.startswith(RESULT):
            state["result"] = json.loads(line[len(RESULT):])
        elif line.startswith(FAILED):
            state["failed"] = line[len(FAILED):]
        elif line == CANCELLED:
            state["cancelled"] = True
        else:
            log(line)

    log(f"{kind} runs on {host}")
    try:
        code = runner.stream(ssh_argv(config, remote_python(config, ["_remote-step", kind, token])), on_line,
                             input=json.dumps(wire))
    except JobCancelled:
        log(f"cancelled: stopping {kind} on {host}")
        stop = runner.run(ssh_argv(config, remote_python(config, ["_remote-cancel", token])))
        if stop.returncode:
            log(f"could not stop it on {host}: {(stop.stderr or stop.stdout).strip()[-300:]}")
        raise
    sync_mirror(config, runner, log)
    if state["failed"] is not None:
        raise StepFailed(state["failed"])
    if state["cancelled"]:
        raise StepFailed(f"{kind} was cancelled on {host}")
    if state["result"] is None:
        if code == SSH_LOST:
            hint = "; training goes on there: start train again with attach" if kind == "train" else ""
            raise StepFailed(f"lost the connection to {host}{hint}")
        raise StepFailed(f"{kind} on {host} exited {code} without a result")
    return from_wire(state["result"], config)


def _step(kind: str):
    module, function = STEPS[kind].split(":")
    return getattr(importlib.import_module(module), function)


def _pid_file(config: ConsoleConfig, token: str) -> Path:
    return config.openpi.docker_data / "console_run" / f"step-{token}.pid"


def remote_step_main(kind: str, token: str) -> int:
    """On the compute host: params (wire JSON) on stdin, the step's log on stdout, last line the outcome."""
    if kind not in REMOTE_KINDS:
        print(f"usage: realman-train _remote-step {{{','.join(REMOTE_KINDS)}}} <token>", file=sys.stderr)
        return 2
    config = load_config()
    params = from_wire(json.loads(sys.stdin.read() or "{}"), config)
    pid_file = _pid_file(config, token)
    pid_file.parent.mkdir(parents=True, exist_ok=True)
    pid_file.write_text(str(os.getpid()), encoding="utf-8")

    def emit(text: str) -> None:
        try:
            print(text, flush=True)
        except OSError:
            pass  # the ssh session is gone: keep going (train keeps following its run)

    def on_signal(signum, frame):
        signal.signal(signal.SIGTERM, signal.SIG_IGN)
        signal.signal(signal.SIGINT, signal.SIG_IGN)
        raise JobCancelled()

    signal.signal(signal.SIGTERM, on_signal)
    signal.signal(signal.SIGINT, on_signal)
    signal.signal(signal.SIGHUP, signal.SIG_IGN)

    def progress(done, total, text) -> None:
        emit(PROGRESS + json.dumps({"done": done, "total": total, "text": text}, ensure_ascii=False))

    try:
        result = _step(kind)(params, StepLog(emit, progress))
        emit(RESULT + json.dumps(to_wire(result, config), ensure_ascii=False))
        return 0
    except JobCancelled:
        emit(CANCELLED)
        return 1
    except StepFailed as error:
        emit(FAILED + str(error))
        return 1
    except Exception as error:  # noqa: BLE001 - every crash ends as a failed step
        for line in traceback.format_exc().splitlines():
            emit(line)
        emit(FAILED + f"{type(error).__name__}: {error}")
        return 1
    finally:
        pid_file.unlink(missing_ok=True)


def remote_cancel_main(token: str) -> int:
    pid_file = _pid_file(load_config(), token)
    try:
        os.kill(int(pid_file.read_text(encoding="utf-8")), signal.SIGTERM)
    except (OSError, ValueError) as error:
        print(f"no running step {token}: {error}", file=sys.stderr)
        return 1
    return 0
```

The test `test_remote_step_main_reports_result_and_failure` writes the pid file under `config.openpi.docker_data`, which is inside `tmp_path`. That is fine.

- [ ] **Step 4: Wire the hidden CLI entries.** In `realman_training/cli.py` `main`, right after the `_job-run` block, add:

```python
    if argv[:1] == ["_remote-step"]:
        from .compute import remote_step_main

        return remote_step_main(argv[1], argv[2]) if len(argv) == 3 else 2
    if argv[:1] == ["_remote-cancel"]:
        from .compute import remote_cancel_main

        return remote_cancel_main(argv[1]) if len(argv) == 2 else 2
```

- [ ] **Step 5: Run the tests.** Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_compute.py -p no:cacheprovider`. Expected: PASS. Then run the full suite: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/training/realman_training/realman_training/compute.py src/training/realman_training/realman_training/cli.py src/training/realman_training/test/test_compute.py
git commit -m "feat(training): run steps on a compute host over ssh with a metadata mirror

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Route jobs to the compute host; pull on SJD, then push to EI

**Files:**
- Modify: `realman_training/compute.py` (add `route`, `push_dataset`, `pull_and_push`)
- Modify: `realman_training/jobs.py` (`run_job`)
- Modify: `realman_training/steps/pull.py` (`remote()`)
- Test: `test/test_compute.py`, `test/test_pull.py`, `test/test_jobs.py`

**Interfaces:**
- Consumes: `run_remote`, `sync_mirror`, `ssh_argv`, `ssh_base`, `remote_path` (Task 5); `steps.pull.run`.
- Produces:
  - `compute.route(kind: str, target: str, step, params: dict)`: returns the callable `run_job` should call.
  - `compute.push_dataset(config, runner, log, target: Path) -> str`: returns the remote path.
  - `compute.pull_and_push(params, log, runner=None) -> dict`.

- [ ] **Step 1: Write the failing tests**

Append to `test/test_compute.py`:

```python
from realman_training.jobs import STEPS


def test_route_keeps_local_steps_and_fakes(config, monkeypatch):
    monkeypatch.setattr(compute, "load_config", lambda path=None: config)
    real = object()
    assert compute.route("serve", STEPS["serve"], real, {}) is real          # not a remote kind
    assert compute.route("train", "tests.fake:run", real, {}) is real        # a fake target is never rerouted
    routed = compute.route("train", STEPS["train"], real, {})
    assert routed.func is compute.run_remote and routed.args == ("train",)
    assert compute.route("pull", STEPS["pull"], real, {}) is compute.pull_and_push


def test_route_is_a_no_op_without_a_compute_host(tmp_path, monkeypatch):
    path = tmp_path / "c.yaml"
    path.write_text(f"training_console:\n  data_root: {tmp_path}\n", encoding="utf-8")
    monkeypatch.setattr(compute, "load_config", lambda p=None: load_config(path))
    real = object()
    assert compute.route("train", STEPS["train"], real, {}) is real


def test_push_dataset_copies_then_drops_local_videos(config):
    target = config.data_root / "raw_x"
    (target / "ds" / "videos").mkdir(parents=True)
    (target / "ds" / "meta").mkdir()
    runner = FakeRunner().on("test ! -e", returncode=0)
    remote = compute.push_dataset(config, runner, RecordingLog(), target)
    assert remote == "/w/data/realman/raw_x"
    rsync = runner.commands("rsync")[0]
    assert rsync[-2] == f"{target}/" and rsync[-1] == "EI:/w/data/realman/raw_x.partial/"
    assert runner.commands("mv /w/data/realman/raw_x.partial /w/data/realman/raw_x")
    assert not (target / "ds" / "videos").exists() and (target / "ds" / "meta").exists()


def test_push_dataset_refuses_an_existing_remote(config):
    target = config.data_root / "raw_x"
    target.mkdir(parents=True)
    with pytest.raises(StepFailed, match="exists on EI"):
        compute.push_dataset(config, FakeRunner().on("test ! -e", returncode=1), RecordingLog(), target)
```

Append to `test/test_pull.py`. Use that file's existing imports; add `import dataclasses` and `from realman_training.config import RemoteConfig` if missing.

```python
def test_remote_runs_docker_exec_here_when_no_ssh_host():
    from realman_training.steps.pull import remote

    local = dataclasses.replace(RemoteConfig(), ssh_host="")
    assert remote(local, ["du", "-sb", "/x"]) == ["docker", "exec", local.recording_container, "du", "-sb", "/x"]
    assert remote(RemoteConfig(), ["true"])[0] == "ssh"
```

Append to `test/test_jobs.py` a test that `run_job` consults `compute.route`:

```python
def test_run_job_routes_through_compute(tmp_path, monkeypatch):
    from realman_training import compute, jobs

    seen = {}

    def fake_route(kind, target, step, params):
        seen["args"] = (kind, target, params)
        return lambda params, log: {"routed": True}

    monkeypatch.setattr(compute, "route", fake_route)
    folder = tmp_path / "job"
    folder.mkdir()
    jobs.write_json(folder / "params.json", {"kind": "clean", "target": jobs.STEPS["clean"], "params": {"a": 1}})
    jobs.write_json(folder / "status.json", {"id": "job", "kind": "clean", "state": "starting"})
    assert jobs.run_job(folder) == 0
    assert seen["args"] == ("clean", jobs.STEPS["clean"], {"a": 1})
    assert jobs._read_json(folder / "status.json")["result"] == {"routed": True}
```

- [ ] **Step 2: Run them.** Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_compute.py test/test_pull.py test/test_jobs.py -p no:cacheprovider`. Expected: FAIL. `compute.route` does not exist, and `remote()` always builds `ssh`.

- [ ] **Step 3: Implement `remote()` local mode** in `realman_training/steps/pull.py`. Add the early return as the first statement of `remote`:

```python
    if not config.ssh_host:  # the recording container runs on this host (the console on SJDrealman)
        return ["docker", "exec", config.recording_container, *argv]
```

- [ ] **Step 4: Add routing and push to `compute.py`** (append)

```python
def push_dataset(config: ConsoleConfig, runner: Runner, log, target: Path) -> str:
    """Copy a pulled dataset to the compute host (rsync to <name>.partial, then rename), then drop the local videos:
    the console keeps meta and parquet only, like the rest of its mirror."""
    rel = Path(target).relative_to(config.data_root).as_posix()
    remote = remote_path(config, f"{REMOTE_DATA_ROOT}/{rel}")
    host = config.compute.ssh_host
    q = shlex.quote
    if runner.run(ssh_argv(config, f"test ! -e {q(remote)}")).returncode:
        raise StepFailed(f"{remote} exists on {host}: pick another name (nothing is overwritten)")
    log(f"copying {target.name} to {host}")
    runner.check(["rsync", "-a", "--partial", "-e", shlex.join(ssh_base(config)), f"{target}/",
                  f"{host}:{remote}.partial/"])
    runner.check(ssh_argv(config, f"mv {q(remote + '.partial')} {q(remote)}"))
    for videos in Path(target).glob("*/videos"):
        shutil.rmtree(videos)
    log(f"on {host}: {remote}")
    return remote


def pull_and_push(params: dict, log, runner: Runner | None = None) -> dict:
    from .steps import pull

    runner = runner or Runner()
    config = load_config(params.get("config"))
    result = pull.run(params, log, runner)
    remote = push_dataset(config, runner, log, Path(result["target"]))
    sync_mirror(config, runner, log)
    return {**result, "compute_path": remote}


def route(kind: str, target: str, step, params: dict):
    """The callable run_job runs: the step itself, or its remote form when this console has a compute host.
    Only the real step targets are rerouted (tests and fakes pass their own)."""
    if target != STEPS.get(kind) or (kind not in REMOTE_KINDS and kind != "pull"):
        return step
    if not enabled(load_config(params.get("config"))):
        return step
    return pull_and_push if kind == "pull" else functools.partial(run_remote, kind)
```

Add `import shutil` to the imports of `compute.py`.

- [ ] **Step 5: Call `route` from `run_job`** in `realman_training/jobs.py`. Replace

```python
        step = getattr(importlib.import_module(module), function)
```

with

```python
        step = getattr(importlib.import_module(module), function)
        from . import compute  # imports jobs: import here to avoid a cycle

        step = compute.route(spec["kind"], spec["target"], step, spec["params"])
```

- [ ] **Step 6: Run the full suite.** Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/training/realman_training
git commit -m "feat(training): route jobs to the compute host and push pulls there

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: GPU panel from the compute host; `compute setup|sync` commands

**Files:**
- Modify: `realman_training/compute.py` (add `gpu_query`, `sync_code`, `setup_host`)
- Modify: `realman_training/cli.py` (`_gpus`, `compute` subcommand)
- Modify: `realman_training/web_server.py:106` (default `gpu_query`) and the `gpu_cache` TTL
- Create: `realman_training/remote_scripts/setup_uv_host.sh`
- Modify: `src/training/realman_training/setup.py` (`package_data` gets `remote_scripts/*.sh`)
- Test: `test/test_compute.py`, `test/test_cli.py`

**Interfaces:**
- Consumes: `gpus.query`, `ssh_argv`, `remote_python`, `remote_path`, `ssh_base`.
- Produces:
  - `compute.gpu_query(config, runner) -> dict`, the same shape as `gpus.query`.
  - `compute.sync_code(config, runner, log) -> None`, which rsyncs `src/training/realman_training` and `config/training` to `<workdir>/src/realman_pi/`.
  - `compute.setup_host(config, runner, log, openpi_ref: str = "main") -> None`.
  - CLI: `realman-train compute sync` and `realman-train compute setup [--openpi-ref REF]`.

- [ ] **Step 1: Write the failing tests** (append to `test/test_compute.py`)

```python
def test_gpu_query_asks_the_compute_host(config):
    answer = {"available": True, "busy_mib": 2000, "gpus": [{"index": 0}]}
    runner = FakeRunner().on("_gpus", stdout=json.dumps(answer) + "\n")
    assert compute.gpu_query(config, runner) == answer


def test_gpu_query_failure_is_reported_not_raised(config):
    runner = FakeRunner().on("_gpus", returncode=255, stdout="timeout")
    data = compute.gpu_query(config, runner)
    assert data["available"] is False and "EI" in data["error"]


def test_sync_code_sends_the_package_and_the_training_config(config):
    runner = FakeRunner()
    compute.sync_code(config, runner, RecordingLog())
    sent = runner.commands("rsync")
    assert any(c[-1] == "EI:/w/src/realman_pi/src/training/realman_training/" for c in sent)
    assert any(c[-1] == "EI:/w/src/realman_pi/config/training/" for c in sent)
    assert all("--exclude=test/" in c for c in sent if "realman_training/" in c[-1])


def test_setup_host_streams_the_script_over_ssh(config):
    runner = FakeRunner().on("bash -s", lines=["ok"])
    compute.setup_host(config, runner, RecordingLog(), openpi_ref="abc123")
    call = runner.commands("bash -s")[0]
    assert call[-1] == "bash -s -- /w abc123"
    assert runner.inputs[-1].startswith("#!/usr/bin/env bash")  # the script itself goes over stdin
```

- [ ] **Step 2: Run them.** Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_compute.py -p no:cacheprovider`. Expected: the 4 new tests FAIL with `AttributeError`.

- [ ] **Step 3: Implement in `compute.py`** (append)

```python
SETUP_SCRIPT = Path(__file__).resolve().parent / "remote_scripts" / "setup_uv_host.sh"


def gpu_query(config: ConsoleConfig, runner: Runner) -> dict:
    """The compute host's GPUs for the web panel (same shape as gpus.query, run there by `_gpus`)."""
    done = runner.run(ssh_argv(config, remote_python(config, ["_gpus"])), timeout=30)
    if done.returncode:
        message = (done.stderr or done.stdout).strip()[-300:] or f"exit {done.returncode}"
        return {"available": False, "busy_mib": config.openpi.gpu_busy_mib, "gpus": [],
                "error": f"{config.compute.ssh_host}: {message}"}
    return json.loads(done.stdout.strip().splitlines()[-1])


def sync_code(config: ConsoleConfig, runner: Runner, log) -> None:
    """This package and config/training to <workdir>/src/realman_pi (the remote side of _remote-step)."""
    ssh = shlex.join(ssh_base(config))
    host = config.compute.ssh_host
    base = remote_path(config, REMOTE_REPO)
    runner.check(ssh_argv(config, f"mkdir -p {shlex.quote(base + '/' + PACKAGE)} {shlex.quote(base + '/config/training')}"))
    runner.check(["rsync", "-a", "--delete", "-e", ssh, "--exclude=test/", "--exclude=web/", "--exclude=__pycache__/",
                  "--exclude=static/", f"{REPO_ROOT / PACKAGE}/", f"{host}:{base}/{PACKAGE}/"])
    runner.check(["rsync", "-a", "-e", ssh, f"{REPO_ROOT / 'config' / 'training'}/", f"{host}:{base}/config/training/"])
    log(f"code synced to {host}:{base}")


def setup_host(config: ConsoleConfig, runner: Runner, log, openpi_ref: str = "main") -> None:
    argv = ssh_argv(config, shlex.join(["bash", "-s", "--", config.compute.workdir, openpi_ref]))
    code = runner.stream(argv, log, input=SETUP_SCRIPT.read_text(encoding="utf-8"))
    if code:
        raise StepFailed(f"setup on {config.compute.ssh_host} exited {code}")
```

The test checks `call[-1] == "bash -s -- /w abc123"`; `shlex.join` produces exactly that.

- [ ] **Step 4: Create `realman_training/remote_scripts/setup_uv_host.sh`**

```bash
#!/usr/bin/env bash
# Lay out a shared GPU host (no docker, no sudo) for the training console: env.sh, openpi in a uv venv, run dirs.
# usage (from the console host): realman-train compute setup [--openpi-ref REF]
#   == ssh <host> bash -s -- <workdir> <openpi-ref> < setup_uv_host.sh
# Idempotent. Everything stays under <workdir>. Steps learned on the campus server, 2026-11-18:
#  - uv's git clone of lerobot dies mid-pack; the codeload tarball + `uv pip install --no-deps` works.
#  - pyarrow's bundled jemalloc background thread segfaults on that host: JE_ARROW_MALLOC_CONF.
set -euo pipefail
W=${1:?workdir}
REF=${2:-main}
OPENPI_URL=https://github.com/QingTianRobot/openpi.git
mkdir -p "$W"/{cache/uv,cache/python,cache/xdg,data/openpi,data/lerobot,data/realman,src,logs}

cat > "$W/env.sh" <<EOF
export REALMAN_COMPUTE_WORKDIR=$W
export UV_CACHE_DIR=$W/cache/uv
export UV_PYTHON_INSTALL_DIR=$W/cache/python
export XDG_CACHE_HOME=$W/cache/xdg
export OPENPI_DATA_HOME=$W/data/openpi
export HF_HOME=$W/cache/xdg/huggingface
export HF_LEROBOT_HOME=$W/data/lerobot
export GIT_LFS_SKIP_SMUDGE=1
export UV_LINK_MODE=copy
export JE_ARROW_MALLOC_CONF=background_thread:false
# realman_training on this host (config/training/training_console.yaml reads these)
export REALMAN_TRAINING_DATA_ROOT=$W/data/realman
export REALMAN_OPENPI_BACKEND=uv
export REALMAN_OPENPI_ENV_FILE=$W/env.sh
export REALMAN_OPENPI_REPO=$W/src/openpi
export REALMAN_OPENPI_DATA=$W/src/openpi
export REALMAN_OPENPI_SHARE_GPUS=true
export REALMAN_OPENPI_WEIGHTS=$W/data/openpi/openpi-assets/checkpoints/pi05_base/params
EOF
source "$W/env.sh"

if [ ! -d "$W/src/openpi/.git" ]; then
  git clone "$OPENPI_URL" "$W/src/openpi"
fi
cd "$W/src/openpi"
git fetch origin "$REF" && git checkout --detach FETCH_HEAD
mkdir -p checkpoints assets wandb console_run

for try in 1 2 3; do
  uv sync --frozen --no-install-package lerobot && break
  echo "uv sync failed (try $try)"; sleep 10
  [ "$try" = 3 ] && exit 1
done
REV=$(grep -o 'github.com/huggingface/lerobot[^"]*#[0-9a-f]\{40\}' uv.lock | head -1 | sed 's/.*#//')
L="$W/src/lerobot-$REV"
if [ ! -d "$L" ]; then
  curl -fsSL --retry 5 -o "$W/cache/lerobot-$REV.tar.gz" "https://codeload.github.com/huggingface/lerobot/tar.gz/$REV"
  tar -C "$W/src" -xzf "$W/cache/lerobot-$REV.tar.gz"
fi
uv pip install --no-deps "$L"
.venv/bin/python -c "import openpi, lerobot, pyarrow; print('openpi env ok')"
echo "pi05_base: $( [ -d "$W/data/openpi/openpi-assets/checkpoints/pi05_base/params" ] && echo present || echo MISSING — fetch it with gcs_chunked_get.py )"
```

The pi05_base download stays manual (phase ②'s `$W/tools/gcs_chunked_get.py`). It runs for hours on that link and must not block setup.

- [ ] **Step 5: CLI.** In `realman_training/cli.py`:

In `main`, after the `_remote-cancel` block:

```python
    if argv[:1] == ["_gpus"]:
        import json as _json

        from . import gpus as gpu_mod
        from .runner import Runner

        config = load_config()
        print(_json.dumps(gpu_mod.query(Runner(), busy_mib=config.openpi.gpu_busy_mib,
                                        passwd=Path(config.web.passwd_file))))
        return 0
```

Check that `Path` is already imported in cli.py (`grep -n "^from pathlib" cli.py`) and import it if not.

In `make_parser`, next to the `linkcheck` parser:

```python
    comp = sub.add_parser("compute", help="the compute host (compute.ssh_host): set it up, or send this code to it")
    comp_sub = comp.add_subparsers(dest="compute_action", required=True)
    p = comp_sub.add_parser("setup", help="env.sh + openpi uv venv under compute.workdir (idempotent)")
    p.add_argument("--openpi-ref", default="main")
    comp_sub.add_parser("sync", help="rsync this package and config/training to the compute host")
```

In `main`, before `if args.command in STEP_COMMANDS:`:

```python
        if args.command == "compute":
            from . import compute
            from .runner import Runner

            if not compute.enabled(config):
                print("error: compute.ssh_host is not set (REALMAN_COMPUTE_SSH_HOST)", file=sys.stderr)
                return 2
            if args.compute_action == "setup":
                compute.setup_host(config, Runner(), print, args.openpi_ref)
            else:
                compute.sync_code(config, Runner(), print)
            return 0
```

Add a CLI test to `test/test_cli.py`:

```python
def test_compute_refuses_without_a_host(tmp_path, capsys):
    from realman_training.cli import main

    path = tmp_path / "c.yaml"
    path.write_text(f"training_console:\n  data_root: {tmp_path}\n", encoding="utf-8")
    assert main(["--config", str(path), "compute", "sync"]) == 2
    assert "compute.ssh_host" in capsys.readouterr().err
```

Check how existing CLI tests pass `--config` (`grep -n '"--config"' test/test_cli.py`) and match that position: global flag before the subcommand, or per-subcommand.

- [ ] **Step 6: Web GPU panel.** In `realman_training/web_server.py` `__init__`, replace the `self._gpu_query = …` statement with:

```python
        from . import compute

        if gpu_query is None and compute.enabled(config):
            gpu_query = lambda: compute.gpu_query(config, runner)  # noqa: E731
        self._gpu_query = gpu_query or (lambda: gpu_mod.query(runner, busy_mib=config.openpi.gpu_busy_mib,
                                                              passwd=Path(config.web.passwd_file)))
```

Then replace `self.gpu_cache = TtlCache(config.web.gpu_ttl_sec, clock)` with

```python
        # Over ssh a query takes ~1 s and holds a connection: not every 3 s.
        ttl = max(config.web.gpu_ttl_sec, 15.0) if compute.enabled(config) else config.web.gpu_ttl_sec
        self.gpu_cache = TtlCache(ttl, clock)
```

- [ ] **Step 7: Ship the script.** In `src/training/realman_training/setup.py`, change `"remote_scripts/*.py"` to `"remote_scripts/*.py", "remote_scripts/*.sh"`.

- [ ] **Step 8: Run the full suite.** Expected: all pass. Also run `bash -n src/training/realman_training/realman_training/remote_scripts/setup_uv_host.sh`. Expected: no output.

- [ ] **Step 9: Commit**

```bash
git add src/training/realman_training
git commit -m "feat(training): compute host GPU panel, setup and code sync commands

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Console image and compose for SJD; docs

**Files:**
- Modify: `config/docker/training-console.Dockerfile` (add `rsync` to the apt line)
- Modify: `config/docker/compose.yaml`, service `realman_training` `environment:`
- Modify: `website/docs/development/training-console.md` (new section)
- Test: `test/test_container.py` (it already checks the Dockerfile/compose; extend it)

- [ ] **Step 1: Look at what `test/test_container.py` asserts today**

Run: `sed -n 1,80p src/training/realman_training/test/test_container.py`. Find the test that parses `compose.yaml`'s `realman_training.environment`, and add assertions in the same style:

```python
    for key in ("REALMAN_COMPUTE_SSH_HOST", "REALMAN_COMPUTE_SSH_CONFIG", "REALMAN_COMPUTE_WORKDIR",
                "REALMAN_RECORDING_SSH_HOST", "REALMAN_TRAINING_DATA_ROOT"):
        assert key in environment
```

and, for the Dockerfile test, `assert "rsync" in dockerfile_text`. Use the variable names that test file already uses.

- [ ] **Step 2: Run it.** Run: `cd src/training/realman_training && PYTHONPATH=. python -m pytest -q test/test_container.py -p no:cacheprovider`. Expected: FAIL.

- [ ] **Step 3: Implement**
  - Dockerfile: `openssh-client git ca-certificates` becomes `openssh-client rsync git ca-certificates`.
  - compose `realman_training.environment`: add the lines below. `-` (not `:-`) keeps an explicitly empty value, which SJD uses for `REALMAN_RECORDING_SSH_HOST`.

```yaml
      # Compute host (EI) and the console's own layout on SJDrealman; unset = the server5090 layout.
      REALMAN_COMPUTE_SSH_HOST: ${REALMAN_COMPUTE_SSH_HOST-}
      REALMAN_COMPUTE_SSH_CONFIG: ${REALMAN_COMPUTE_SSH_CONFIG-}
      REALMAN_COMPUTE_WORKDIR: ${REALMAN_COMPUTE_WORKDIR-}
      REALMAN_RECORDING_SSH_HOST: ${REALMAN_RECORDING_SSH_HOST-realman_local}
      REALMAN_TRAINING_DATA_ROOT: ${REALMAN_TRAINING_DATA_ROOT-}
```

`REALMAN_TRAINING_DATA_ROOT` set to an empty string makes `data_root` empty. To prevent that, change the yaml from Task 2 to the `:-` form for that one key only: `data_root: ${REALMAN_TRAINING_DATA_ROOT:-~/data/realman}`. Do the same in the `realman_training` yaml for `REALMAN_OPENPI_REPO`/`REALMAN_OPENPI_DATA`/`REALMAN_OPENPI_WEIGHTS`, which are path keys where empty is never meant. Re-run Task 2's tests after the change.

- [ ] **Step 4: Docs.** Add a section `## 计算主机（训练在另一台机器上）` to `website/docs/development/training-console.md`, covering:
  - **What runs where:** the console and pull run on SJD; clean/view/norm/train/eval/register run on the compute host. The web reads a metadata mirror without videos and weights.
  - **Env vars and an example env file**, with placeholders only (`<compute-alias>`, `<workdir>`), no real host or path:

```text
REALMAN_COMPUTE_SSH_HOST=<compute-alias>
REALMAN_COMPUTE_SSH_CONFIG=Traning_area/.ssh/config
REALMAN_COMPUTE_WORKDIR=<absolute workdir on the compute host>
REALMAN_RECORDING_SSH_HOST=
TRAINING_HOME=/home/<user>
TRAINING_REPO=<repo checkout on SJD>
```

  - **First-time setup:** `realman-train compute setup`, then `realman-train compute sync`, then the manual pi05_base download.
  - **What `attach` means after a lost connection**, and that a cancel stops the remote run.
  - **Limits:**
    - `tags refresh` acts on the mirror only.
    - Pulls need free disk on SJD equal to the recording size until the push finishes.
    - The compute host is shared: train/eval check free memory (`default_share_gpus`).

Then check the page builds: `cd website && npm ci && npm run build`. Expected: build succeeds with no dead-link errors.

- [ ] **Step 5: Run the full Python suite again.** Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add config/docker src/training/realman_training/test/test_container.py website/docs/development/training-console.md config/training/training_console.yaml
git commit -m "feat(training): console image and compose for a compute host; docs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 7: Push and open the PR**

```bash
git push -u origin feat/training-compute-host
gh pr create --repo QingTianRobot/realman_pi --base main --title "feat(training): run training steps on a compute host over ssh" --body "Spec docs/superpowers/specs/2026-11-18-sjd-integrated-platform-design.md, plan docs/superpowers/plans/2026-11-18-sjd-compute-on-ei.md (phase ③).

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

Merge by hand once CI is green; auto-merge is disabled in this repo.

---

### Task 9: Bring up EI and SJD, then run the smoke chain end to end

Ops task: no code. Every command runs from the SJD checkout (`ssh SJDrealman`, `cd ~/code/jiexiebiall/realman_pi`) unless marked otherwise. Before every SJD change, record the current state (branch, image ids, `docker ps`) in `~/deploy-backups/`. Another person deploys on SJD too, so never touch other containers or images.

- [ ] **Step 1: Preconditions**
  - Task 1's openpi PR is merged.
  - The realman_pi PR (Tasks 2–8) is merged, or its branch is checked out on SJD as `deploy/compute-host-<date>`.
  - SJD has at least 5 GB free for the console image build. Check with `df -h /`. If it does not, stop and ask the user which disk cleanup to do; the spec's open decision covers this.
  - The pi05_base download on EI has finished (`tail -2 $W/logs/chain_smoke.log` shows `pi05_base ready`).

- [ ] **Step 2: SJD env file.** Write `~/realman-training.env`, untracked and outside the repo, with mode 600. Set the variables from the docs section, plus `TRAINING_HOME=/home/robot`, `TRAINING_REPO=$HOME/code/jiexiebiall/realman_pi`, `TRAINING_UID`/`TRAINING_GID`/`TRAINING_DOCKER_GID` from `id`, and `REALMAN_TRAINING_TOKEN` (ask the user for it, or generate one and tell them where it is). Create the mirror dirs: `mkdir -p ~/data/realman ~/organization/openpi ~/organization/openpi-docker-data`.

- [ ] **Step 3: EI setup from SJD, with the package run locally from the checkout**

```bash
cd ~/code/jiexiebiall/realman_pi/src/training/realman_training && set -a && . ~/realman-training.env && set +a
PYTHONPATH=. python3 -m realman_training compute setup --openpi-ref main
PYTHONPATH=. python3 -m realman_training compute sync
```

Expected: `openpi env ok`, `pi05_base: present`, `code synced to …`. If SJD's python3 lacks pyyaml, run these two from inside the console container after Step 5 instead.

Also move the phase-② smoke norm stats so the uv layout finds them:
- move `$W/assets/pi05_realman_action_only` into `$W/src/openpi/assets/`;
- leave `$W/checkpoints/smoke_sjd` where it is (it was only a smoke run).

- [ ] **Step 4: Remote step check, without the web**

```bash
PYTHONPATH=. python3 -m realman_training inspect --help >/dev/null && ssh -F ../../../Traning_area/.ssh/config EI 'source <workdir>/env.sh && cd <workdir>/src/realman_pi && PYTHONPATH=src/training/realman_training <workdir>/src/openpi/.venv/bin/python -m realman_training _gpus' | head -c 300
```

Expected: JSON with 8 GPUs.

- [ ] **Step 5: Build and start the console on SJD**

```bash
docker compose --env-file ~/realman-training.env --profile training build realman_training
docker compose --env-file ~/realman-training.env --profile training up -d realman_training
docker exec realman_pi-realman_training-1 ssh -F "$TRAINING_REPO/Traning_area/.ssh/config" -o BatchMode=yes EI true && echo ssh-ok
```

Expected: `ssh-ok`. If ssh fails inside the container because the config's `IdentityFile` is relative, do not edit the tracked area. Copy the config to `~/.ssh/ei_config` with an absolute `IdentityFile` (chmod 600), set `REALMAN_COMPUTE_SSH_CONFIG=/home/robot/.ssh/ei_config`, and `up -d` again. If `runtime: nvidia` is refused on SJD (`docker info | grep -i runtime`), stop and report it. Phase ④ needs the GPU runtime anyway, so the user decides.

- [ ] **Step 6: End-to-end smoke through the web API.** Use the 3-episode recording that already exists. The web flow is 数据 → pull → view → 训练 (20 steps, 1 GPU) → eval → register. Through the API:

```bash
T=<token>; U=http://127.0.0.1:8780
curl -s -X POST -H "Authorization: Bearer $T" -H 'Content-Type: application/json' $U/api/jobs -d '{"kind":"pull","params":{"name":"raw_sjd_smoke"}}'
```

Check the job's params with `GET /api/jobs/<id>`, then follow its log with `?log=1`, until it succeeds. Then start view (`src=raw_sjd_smoke/realman__pi05-three-arm`), train (`config_name=pi05_realman_action_only, exp=smoke_console, gpus=<freest GPU from /api/gpus>, steps=20, batch=8`), eval (`gpu=` the same, `checkpoints=[19]`) and register. Check the exact param keys in `job_params.py` (`ALLOWED`) before each call.

Expected:
- each job ends `succeeded`;
- `GET /api/runs` lists `pi05_realman_action_only/smoke_console` with metrics;
- `~/data/realman` on SJD holds no `videos/` and `~/organization/openpi-docker-data/checkpoints/…/19/` holds no `params/`.

- [ ] **Step 7: Cancel check.** Start a 200-step train, cancel it from the web after the first `Step` line, and confirm on EI that its process group is gone (`pgrep -u $USER -f "scripts/train.py"` prints nothing) within 60 s.

- [ ] **Step 8: Record the outcome.**
  - Update memory `sjd-integrated-platform-20261118.md` with: the branch, image id and env file location; the `ssh_config` decision; the smoke results; and anything that deviated from this plan.
  - Report to the user, stating which parts are verified and which are not, as three states: source synced / service deployed / verified on the real hosts.

---

## Self-review against the spec

- **Covered by this plan:**
  - Spec §1 → Tasks 2, 5, 6, 7 (remote steps, wire paths, mirror, GPU panel).
  - §2 → Tasks 1, 3, 4 (uv backend; dataset root via the env var in the openpi fork instead of wrapper scripts, which is simpler and covers norm/eval/view/train alike).
  - §3 → Task 6 (pull).
  - "EI 环境脚本化" → Task 7 (`setup_uv_host.sh`, `compute setup|sync`).
  - "错误处理" → Task 5 (lost connection → attach hint; cancel → remote SIGTERM), Task 3 (missing exit file → failed).
  - "测试" → unit tests in each task; EI/SJD checks in Task 9.
- **Not in this plan:** §4 (serve on the 4080) and §5 (shared nav) get their own plans.
- **Deviations from the spec:**
  - The GPU choice stays manual: the web panel shows EI's GPUs and train checks free memory. No automatic choice.
  - `realman-train compute setup` doesn't download pi05_base (hours on that link).
  - `tags refresh` stays on the mirror.

These are noted in the docs (Task 8).
