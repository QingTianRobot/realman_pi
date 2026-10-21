# Training console Plan 4: web API, job triggers and the server5090 container

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `realman-train web` serves the training console's JSON API on :8780 (datasets with a cached summary + per-episode quality, jobs, runs/metrics/eval, models, GPU holders, serve status and settings, link-check history), token-gated job triggers and a job-log WebSocket, packaged as the compose service `realman_training` for server5090.

**Architecture:** One aiohttp app (`web_server.py`, class `Console`) on top of the Plans 1-3 package. Reads come from small pure modules: `summary_cache.py` (dataset summary + quality cached in `<dataset>/.console/summary.json`, keyed by a fingerprint of the data files), `catalog.py` (runs, models, link-check history, serve settings), `gpus.py` (nvidia-smi + `/proc` → who holds each GPU). Every write is either `POST /api/jobs` (params built by the whitelist in `job_params.py`, then `JobStore.start`) or `PUT /api/serve/settings`, both behind `X-Training-Token`. Blocking work runs in the default executor. The UI (Plan 5) is served from `realman_training/static/`.

**Tech Stack:** Python 3.10+, aiohttp ≥ 3.9, numpy, pyarrow, pyyaml, pytest (aiohttp `TestClient` driven by `asyncio.run`, as in `src/driver/realman_web_control/test/test_web_server.py`), Docker Compose, ruff.

This is the first of two plans for spec delivery steps 5-7 (`docs/superpowers/specs/2026-10-20-training-console-design.md`). Plan 5 (`2026-10-21-training-console-5-web-ui-deploy.md`) builds the five pages, the Playwright e2e, the docs page and the deployment. Both run on branch `feat/training-console-web`, one PR.

## Global Constraints

- All writes need `REALMAN_TRAINING_TOKEN` (header `X-Training-Token`); empty token = read-only console (every write answers 403). The token lives only in the repo-root `.env`.
- No route deletes data. Cleaned sets and views go to new directories; an existing target is refused.
- Only one job per kind (the `jobs.py` flock); training's GPU check and serve's behaviour-tree check stay in the steps — the web layer never bypasses a step.
- Never call `./rm65 up/down/build`; never touch bringup, web_control, recording or the behaviour tree. Nothing here makes an arm move.
- No private IPs or tokens in config, docs, logs or API answers (hosts by ssh alias; serve/linkcheck results are already redacted by Plan 3).
- Config only under `config/` (`config/training/training_console.yaml`, `config/docker/`); `.env` holds only Docker candidate values and the token.
- Containers use `runtime: nvidia` + `NVIDIA_VISIBLE_DEVICES`, never `gpus:` (stale CDI spec on server5090).
- Paths handed to the host's docker daemon or to ssh are mounted at the same absolute path inside the console container.
- Every commit ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (check it: implementer subagents have written their own model name before).
- Ruff: `ruff check --config config/python/ruff.toml src` must stay clean.

## Test environment

```bash
# once, in the session scratchpad (homebrew python cannot find pyarrow wheels)
uv venv --python 3.10 "$SCRATCH/venv" && VIRTUAL_ENV="$SCRATCH/venv" uv pip install pytest numpy pyarrow pyyaml aiohttp ruff
# every run, from src/training/realman_training
PYTHONPATH=. "$SCRATCH/venv/bin/python" -m pytest -q test -p no:cacheprovider
```

`$SCRATCH` is the session scratchpad directory. Baseline before Task 1: 262 passed, 2 skipped.

## API contract (Plan 5 codes against this)

All answers are JSON. Errors are `{"error": "<message>"}` with 400 (bad input), 401 (missing/wrong token), 403 (read-only console), 404 (unknown dataset/job/run), 409 (a job of that kind is running), 503 (UI not built).

| Route | Answer |
|---|---|
| `GET /api/health` | `{ok, read_only, data_root, console_dir, time}` |
| `GET /api/datasets` | `{root, datasets: [DatasetRow]}`; `DatasetRow = {path, name, kind, episodes, frames, duration_sec, fps, first_file_time, last_file_time, disk_bytes, tasks, source, removed_episodes, prompts, quality_counts: {ok, suggest_drop, warn} \| null}` or `{path, name, kind: "error", error}` |
| `GET /api/dataset?path=<rel>` | `{path, built, summary, quality: [EpisodeQuality] \| null, quality_unavailable, suggested_drops, quality_counts, traces: {"<episode>": [0..1 floats]}}` |
| `GET /api/jobs?kind=&limit=` | `{jobs: [JobRow]}`; `JobRow = {id, kind, state, created, started, ended, error, progress, params, result}` (`params` without `config`) |
| `GET /api/jobs/{id}` | `{job: JobRow, log: "<last web.log_tail_lines lines>"}` |
| `GET /api/jobs/{id}/log` (WebSocket) | messages `{type: "lines", lines: [..]}`, `{type: "status", job: JobRow}`, then `{type: "end"}` |
| `POST /api/jobs` | body `{kind, params, confirm: true}` → 201 `{job: JobRow}` |
| `POST /api/jobs/{id}/cancel` | `{cancelled: bool}` |
| `GET /api/runs` | `{runs: [RunRow]}`; `RunRow = {name, config, exp, checkpoints, view, gpus, batch_size, num_train_steps, last_step, started, ended, exit_code, registered, status, last_loss, eval_latest: {step, tasks: {task: mae}} \| null}` |
| `GET /api/runs/{config}/{exp}` | `RunRow + {record, metrics: {step: [], <name>: []}, eval, card, card_markdown, job: JobRow \| null}` |
| `GET /api/models` | `{models: [ModelRow], registry_markdown}`; `ModelRow = {name, config, exp, method, trained_start, trained_end, dataset, dataset_dir, tasks: {task: {prompt, ...}}, episodes, holdout_episodes, checkpoints, open_loop: {step, tasks: {task: mae}, zero_baseline: {task: mae}} \| null, status, serving}` |
| `GET /api/gpus` | `{available, busy_mib, gpus: [{index, name, used_mib, total_mib, util_pct, busy, users: [{pid, who, container, user, command, used_mib}]}], error?}` |
| `GET /api/serve?refresh=1` | `serving.status()` (`{serve, gpu, bridge, bt_mode, record}`) or `{error}` + `{at, job: JobRow \| null}` |
| `GET /api/serve/settings` | `{defaults, saved, effective, models: [{name, checkpoints, prompts}]}` with settings keys `model, checkpoint, gpu, port, task` |
| `PUT /api/serve/settings` | body = settings → same as GET |
| `GET /api/linkcheck` | `{latest, history: [{at, ok, checks}], job: JobRow \| null}` |
| `GET /api/options` | `{prompts, arms, default_arm, views, sources, configs, linkcheck_items, read_only}` (`views`/`sources` = dataset rel paths of kind view / raw+clean) |
| `GET /`, `/assets/*` | the built UI from `realman_training/static/` |

`POST /api/jobs` params per kind (unknown keys → 400; dataset paths are relative to `data_root`; names match `^[A-Za-z0-9][A-Za-z0-9_.-]*$`):

| kind | params |
|---|---|
| `pull` | `dataset?` (remote recording name), `name?` (new directory under data_root) |
| `clean` | `src` (dataset), `drop` (non-empty int list), `reasons?` (`{"<ep>": text}`), `dst?` (name) |
| `view` | `src` (raw/clean dataset), `task_prompts?` (`{task: prompt}`), `arm?`, `dst?` (name), `dry_run?` |
| `norm` | `config_name`, `view` (view dataset), `force?`, `dry_run?` |
| `train` | `config_name`, `view`, `exp`, `gpus` ("1,2"), `batch?`, `steps?`, `resume?`, `dry_run?` |
| `eval` | `config_name`, `exp`, `view`, `gpu` (int), `checkpoints?` (int list), `stride?`, `prompt_swap?` (bool, default true), `dry_run?` |
| `register` | `config_name`, `exp`, `status?`, `method?`, `force?` |
| `serve` | `action` (`start`/`stop`), start only: `model?`, `checkpoint?`, `gpu?`, `port?`, `task?` (missing keys come from the saved settings), `dry_run?` |
| `linkcheck` | `only?` (subset of `pika, link, inference, bridge`) |

## File structure

| File | Responsibility |
|---|---|
| `src/training/realman_training/realman_training/config.py` (modify) | `WebConfig` + `web` section |
| `config/training/training_console.yaml` (modify) | `web` section |
| `src/training/realman_training/setup.py` (modify) | `aiohttp` dependency, `static/` package data |
| `src/training/realman_training/realman_training/gpus.py` (create) | GPU memory + holders |
| `src/training/realman_training/realman_training/quality.py` (modify) | optional per-episode gripper traces |
| `src/training/realman_training/realman_training/summary_cache.py` (create) | `.console/summary.json` cache |
| `src/training/realman_training/realman_training/catalog.py` (create) | datasets list, runs, models, link-check history, serve settings |
| `src/training/realman_training/realman_training/job_params.py` (create) | whitelist + validation for `POST /api/jobs` and settings |
| `src/training/realman_training/realman_training/web_server.py` (create) | aiohttp `Console` app |
| `src/training/realman_training/realman_training/cli.py` (modify) | `realman-train web` |
| `src/training/realman_training/test/console_fixture.py` (create) | a whole console world on disk (also used by Plan 5's fake backend) |
| `src/training/realman_training/test/test_gpus.py`, `test_summary_cache.py`, `test_catalog.py`, `test_job_params.py`, `test_web_server.py`, `test_container.py` (create) | tests |
| `config/docker/training-console.Dockerfile` (create) | image |
| `config/docker/compose.yaml` (modify) | service `realman_training` (profile `training`) |

---

### Task 0: Branch

- [ ] **Step 1: Create the branch from Plan 3's head**

```bash
cd /Users/miakho/Organizations/realman_pi/.claude/worktrees/angry-lewin-c2309a
git fetch -q origin
git switch -c feat/training-console-web   # from a80fdab (= origin/feat/training-console-serving, PR #54)
git log --oneline -1
```

Expected: `a80fdab fix(training): redact addresses in every stored link check`. Once PR #54 merges, rebase onto `origin/main` (`git rebase origin/main`; the #54 commits drop out).

---

### Task 1: `web` config section and package metadata

**Files:**
- Modify: `src/training/realman_training/realman_training/config.py`
- Modify: `config/training/training_console.yaml`
- Modify: `src/training/realman_training/setup.py`
- Test: `src/training/realman_training/test/test_config.py`

**Interfaces:**
- Produces: `config.WebConfig(host="0.0.0.0", port=8780, serve_status_ttl_sec=20.0, gpu_ttl_sec=3.0, log_tail_lines=200, history_limit=20, passwd_file="/etc/passwd")`, `ConsoleConfig.web: WebConfig`.

- [ ] **Step 1: Write the failing tests** (append to `test/test_config.py`; add `WebConfig` to its import line from `realman_training.config`)

```python
def test_the_shipped_web_section_equals_the_defaults():
    assert load_config(DEFAULT_CONFIG).web == WebConfig()
    assert WebConfig().port == 8780


def test_the_web_section_is_validated(tmp_path):
    with pytest.raises(ValueError, match="web.port"):
        load_config(_write(tmp_path, "training_console:\n  web:\n    port: 70000\n"))
    with pytest.raises(ValueError, match="web.gpu_ttl_sec"):
        load_config(_write(tmp_path, "training_console:\n  web:\n    gpu_ttl_sec: 0\n"))
    with pytest.raises(ValueError, match="unknown web keys"):
        load_config(_write(tmp_path, "training_console:\n  web:\n    colour: blue\n"))
```

- [ ] **Step 2: Run them to see them fail**

Run: `PYTHONPATH=. "$SCRATCH/venv/bin/python" -m pytest -q test/test_config.py -p no:cacheprovider`
Expected: FAIL (`ImportError: cannot import name 'WebConfig'`).

- [ ] **Step 3: Implement**

In `config.py`, after `LinkcheckConfig`:

```python
@dataclasses.dataclass(frozen=True)
class WebConfig:
    """The web console (realman-train web): bind address and how long cached answers stay fresh."""

    host: str = "0.0.0.0"
    port: int = 8780
    serve_status_ttl_sec: float = 20.0  # serve status = docker inspect + ssh + a ROS probe on realman_ts (~5 s)
    gpu_ttl_sec: float = 3.0
    log_tail_lines: int = 200
    history_limit: int = 20  # link-check runs listed on the 服务 page
    passwd_file: str = "/etc/passwd"  # uid -> name of GPU holders; the container mounts the host's
```

In `ConsoleConfig` add the field after `linkcheck`:

```python
    web: WebConfig = dataclasses.field(default_factory=WebConfig)
```

Change `_ALLOWED_TOP_KEYS` to include `"web"`:

```python
_ALLOWED_TOP_KEYS = {"data_root", "state_dir", "quality", "remote", "openpi", "serving", "linkcheck", "web", "prompts"}
```

In `load_config`, after `_validate_serving(serving, linkcheck, source)`:

```python
    web = _parse(WebConfig, section.get("web") or {}, source, "web")
    _validate_web(web, source)
```

and pass `web=web,` in the `ConsoleConfig(...)` call (after `linkcheck=linkcheck,`). Add at the end of the file:

```python
def _validate_web(w: WebConfig, source: Path) -> None:
    if not 1 <= w.port <= 65535:
        raise ValueError(f"{source}: web.port must be in 1..65535")
    for key in ("serve_status_ttl_sec", "gpu_ttl_sec"):
        if getattr(w, key) <= 0:
            raise ValueError(f"{source}: web.{key} must be positive")
    for key in ("log_tail_lines", "history_limit"):
        if getattr(w, key) < 1:
            raise ValueError(f"{source}: web.{key} must be at least 1")
```

In `config/training/training_console.yaml`, append inside `training_console:` (after the `linkcheck` block, same indentation):

```yaml

  # The web console (realman-train web; compose service realman_training on server5090, port 8780).
  # Writes need REALMAN_TRAINING_TOKEN from the repo-root .env; an empty token makes the console read-only.
  web:
    host: 0.0.0.0
    port: 8780
    serve_status_ttl_sec: 20      # serve status = docker inspect + ssh + a ROS probe on realman_ts (~5 s)
    gpu_ttl_sec: 3
    log_tail_lines: 200
    history_limit: 20             # link-check runs listed on the 服务 page
    passwd_file: /etc/passwd      # uid -> name of GPU holders; the container mounts the host's
```

In `setup.py`:

```python
    install_requires=["aiohttp>=3.9", "numpy", "pyarrow", "pyyaml"],
    entry_points={"console_scripts": ["realman-train = realman_training.cli:main"]},
    package_data={"realman_training": ["openpi_scripts/*.py", "remote_scripts/*.py", "static/*", "static/assets/*"]},
```

- [ ] **Step 4: Run the config tests, then the whole suite**

Run: `PYTHONPATH=. "$SCRATCH/venv/bin/python" -m pytest -q test -p no:cacheprovider`
Expected: all pass (264 passed, 2 skipped).

- [ ] **Step 5: Commit**

```bash
git add src/training/realman_training config/training/training_console.yaml
git commit -m "feat(training): web section of the console config

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: GPU memory and who holds it (`gpus.py`)

**Files:**
- Create: `src/training/realman_training/realman_training/gpus.py`
- Test: `src/training/realman_training/test/test_gpus.py`

**Interfaces:**
- Consumes: `runner.Runner` (`run(argv) -> Completed(returncode, stdout, stderr)`).
- Produces: `gpus.query(runner, *, busy_mib: int, passwd: Path = Path("/etc/passwd"), proc: Path = Path("/proc")) -> dict` with the `GET /api/gpus` shape.

- [ ] **Step 1: Write the failing tests**

```python
from __future__ import annotations

from fake_runner import FakeRunner

from realman_training import gpus

CID = "5da9e66ad003bd07a061671d95bcec04e6d89e6162a8d30a0a00c4e536905f56"
GPU_CSV = (
    "0, GPU-a, NVIDIA GeForce RTX 5090, 15627, 32607, 97\n"
    "1, GPU-b, NVIDIA GeForce RTX 5090, 3, 32607, 0\n"
    "2, GPU-c, NVIDIA GeForce RTX 5090, [N/A], 32607, [N/A]\n"
)
APPS_CSV = "GPU-a, 4242, 15571 MiB\nGPU-a, 4343, 50\nGPU-x, 1, 5\n"


def _proc(tmp_path):
    proc = tmp_path / "proc"
    (proc / "4242").mkdir(parents=True)
    (proc / "4242" / "cgroup").write_text(f"0::/system.slice/docker-{CID}.scope\n")
    (proc / "4242" / "status").write_text("Name:\tpython3\nUid:\t1000\t1000\t1000\t1000\n")
    (proc / "4242" / "comm").write_text("python3\n")
    (proc / "4343").mkdir()
    (proc / "4343" / "cgroup").write_text("0::/user.slice/user-1001.slice/session-1.scope\n")
    (proc / "4343" / "status").write_text("Uid:\t1001\t1001\t1001\t1001\n")
    (proc / "4343" / "comm").write_text("python\n")
    passwd = tmp_path / "passwd"
    passwd.write_text("root:x:0:0::/root:/bin/sh\nserver5090:x:1000:1000::/home/server5090:/bin/bash\nalice:x:1001:1001::/home/alice:/bin/bash\n")
    return proc, passwd


def test_each_gpu_lists_its_holders_by_container_or_user(tmp_path):
    proc, passwd = _proc(tmp_path)
    runner = (FakeRunner().on("--query-gpu", stdout=GPU_CSV).on("--query-compute-apps", stdout=APPS_CSV)
              .on("docker ps", stdout=f"{CID} openpi-serve-openpi-1\n"))
    data = gpus.query(runner, busy_mib=2000, passwd=passwd, proc=proc)
    assert data["available"] is True and data["busy_mib"] == 2000
    first, second, third = data["gpus"]
    assert (first["index"], first["used_mib"], first["total_mib"], first["util_pct"], first["busy"]) == (0, 15627, 32607, 97, True)
    assert [u["who"] for u in first["users"]] == ["openpi-serve-openpi-1", "alice python"]
    assert first["users"][0]["container"] == "openpi-serve-openpi-1" and first["users"][0]["used_mib"] == 15571
    assert first["users"][1] == {"pid": 4343, "who": "alice python", "container": None, "user": "alice",
                                 "command": "python", "used_mib": 50}
    assert second["busy"] is False and second["users"] == []
    assert third["used_mib"] is None and third["busy"] is False
    assert "uuid" not in first


def test_an_invisible_process_is_named_by_pid(tmp_path):
    runner = (FakeRunner().on("--query-gpu", stdout="0, GPU-a, X, 9000, 32607, 5\n")
              .on("--query-compute-apps", stdout="GPU-a, 77, 9000\n"))
    data = gpus.query(runner, busy_mib=2000, passwd=tmp_path / "none", proc=tmp_path / "noproc")
    assert data["gpus"][0]["users"][0]["who"] == "pid 77"


def test_no_nvidia_smi_is_reported_not_raised(tmp_path):
    runner = FakeRunner().on("--query-gpu", stdout="NVIDIA-SMI has failed", returncode=9)
    data = gpus.query(runner, busy_mib=2000, passwd=tmp_path / "p", proc=tmp_path)
    assert data == {"available": False, "busy_mib": 2000, "gpus": [], "error": "NVIDIA-SMI has failed"}


def test_a_missing_binary_is_reported_not_raised(tmp_path):
    class Missing(FakeRunner):
        def run(self, argv, **kwargs):
            raise FileNotFoundError("nvidia-smi")

    data = gpus.query(Missing(), busy_mib=1, passwd=tmp_path / "p", proc=tmp_path)
    assert data["available"] is False and "nvidia-smi" in data["error"]
```

- [ ] **Step 2: Run to see them fail**

Run: `PYTHONPATH=. "$SCRATCH/venv/bin/python" -m pytest -q test/test_gpus.py -p no:cacheprovider`
Expected: FAIL (`ImportError: cannot import name 'gpus'`).

- [ ] **Step 3: Implement `realman_training/gpus.py`**

```python
"""GPU memory and who holds it: nvidia-smi, then /proc for each compute process (the console container runs with
pid: host, so host processes are visible). A process inside a docker container is named by the container, any other
by `<user> <command>`; one that /proc does not show is named by its pid."""

from __future__ import annotations

import re
from pathlib import Path

from .runner import Runner

GPU_QUERY = ["nvidia-smi", "--query-gpu=index,uuid,name,memory.used,memory.total,utilization.gpu",
             "--format=csv,noheader,nounits"]
APP_QUERY = ["nvidia-smi", "--query-compute-apps=gpu_uuid,pid,used_memory", "--format=csv,noheader,nounits"]
_DOCKER_ID = re.compile(r"(?:docker-|/docker/)([0-9a-f]{64})")


def _int(text: str) -> int | None:
    try:
        return int(text.strip().split()[0])
    except (ValueError, IndexError):
        return None  # [N/A]


def _users(passwd: Path) -> dict[int, str]:
    try:
        lines = passwd.read_text(encoding="utf-8").splitlines()
    except OSError:
        return {}
    users = {}
    for line in lines:
        parts = line.split(":")
        if len(parts) > 2 and parts[2].isdigit():
            users[int(parts[2])] = parts[0]
    return users


def _containers(runner: Runner) -> dict[str, str]:
    try:
        done = runner.run(["docker", "ps", "--no-trunc", "--format", "{{.ID}} {{.Names}}"])
    except OSError:
        return {}
    if done.returncode:
        return {}
    return dict(line.split(" ", 1) for line in done.stdout.splitlines() if " " in line)


def _owner(pid: int, proc: Path, users: dict[int, str], containers: dict[str, str]) -> dict:
    base = proc / str(pid)
    try:
        cgroup = (base / "cgroup").read_text(encoding="utf-8")
    except OSError:
        return {"pid": pid, "who": f"pid {pid}", "container": None, "user": None, "command": None}
    match = _DOCKER_ID.search(cgroup)
    container = containers.get(match.group(1)) if match else None
    uid = None
    try:
        for line in (base / "status").read_text(encoding="utf-8").splitlines():
            if line.startswith("Uid:"):
                uid = int(line.split()[1])
                break
    except (OSError, ValueError, IndexError):
        pass
    try:
        command = (base / "comm").read_text(encoding="utf-8").strip()
    except OSError:
        command = ""
    user = users.get(uid, str(uid)) if uid is not None else None
    who = container or " ".join(part for part in (user, command) if part) or f"pid {pid}"
    return {"pid": pid, "who": who, "container": container, "user": user, "command": command or None}


def query(runner: Runner, *, busy_mib: int, passwd: Path = Path("/etc/passwd"), proc: Path = Path("/proc")) -> dict:
    try:
        done = runner.run(GPU_QUERY)
    except OSError as error:
        return {"available": False, "busy_mib": busy_mib, "gpus": [], "error": str(error)}
    if done.returncode:
        message = (done.stderr or done.stdout).strip()[-300:] or "nvidia-smi failed"
        return {"available": False, "busy_mib": busy_mib, "gpus": [], "error": message}
    gpus, by_uuid = [], {}
    for line in done.stdout.splitlines():
        parts = [part.strip() for part in line.split(",")]
        if len(parts) < 6:
            continue
        used = _int(parts[3])
        gpu = {"index": _int(parts[0]), "name": parts[2], "used_mib": used, "total_mib": _int(parts[4]),
               "util_pct": _int(parts[5]), "busy": (used or 0) > busy_mib, "users": []}
        gpus.append(gpu)
        by_uuid[parts[1]] = gpu
    try:
        apps = runner.run(APP_QUERY)
    except OSError:
        apps = None
    if apps is not None and apps.returncode == 0 and apps.stdout.strip():
        users, containers = _users(Path(passwd)), _containers(runner)
        for line in apps.stdout.splitlines():
            parts = [part.strip() for part in line.split(",")]
            if len(parts) < 3 or parts[0] not in by_uuid:
                continue
            pid = _int(parts[1])
            if pid is None:
                continue
            by_uuid[parts[0]]["users"].append({**_owner(pid, Path(proc), users, containers), "used_mib": _int(parts[2])})
    return {"available": True, "busy_mib": busy_mib, "gpus": gpus}
```

- [ ] **Step 4: Run the tests**

Run: `PYTHONPATH=. "$SCRATCH/venv/bin/python" -m pytest -q test/test_gpus.py -p no:cacheprovider`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add src/training/realman_training/realman_training/gpus.py src/training/realman_training/test/test_gpus.py
git commit -m "feat(training): GPU memory and holders for the console

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Dataset summary cache with gripper traces (`summary_cache.py`)

**Files:**
- Modify: `src/training/realman_training/realman_training/quality.py` (`inspect_dataset` gains `traces`)
- Create: `src/training/realman_training/realman_training/summary_cache.py`
- Test: `src/training/realman_training/test/test_summary_cache.py`

**Interfaces:**
- Consumes: `datasets.summarize(root) -> DatasetSummary`, `quality.inspect_dataset`, `quality.suggested_drops`, `jobs.write_json`, `jobs.now`.
- Produces:
  - `quality.inspect_dataset(root, config, *, traces: dict[int, list[float]] | None = None, trace_points: int = 60)` (fills `traces` when given; values 0 = open, 1 = closed).
  - `summary_cache.CACHE_VERSION = 1`, `summary_cache.TRACE_POINTS = 60`
  - `summary_cache.fingerprint(root: Path, quality: QualityConfig) -> str`
  - `summary_cache.build(root: Path, quality: QualityConfig) -> dict` → `{version, built, summary, quality, quality_unavailable, suggested_drops, quality_counts, traces}`
  - `summary_cache.SummaryCache(quality).get(root) -> dict` (same dict + `fingerprint`), file at `<root>/.console/summary.json`.

- [ ] **Step 1: Write the failing tests** (`test/test_summary_cache.py`)

```python
from __future__ import annotations

import json
import os

from lerobot_fixture import Episode, build_dataset, build_view, gripper

from realman_training import summary_cache
from realman_training.config import QualityConfig

Q = QualityConfig()


def _raw(tmp_path):
    return build_dataset(tmp_path / "raw", [
        Episode("pick_and_place", gripper((50, 60), (5700, 150), (50, 60))),
        Episode("pick_only", gripper((50, 60), (8450, 100))),
    ])


def test_build_has_summary_quality_drops_and_traces(tmp_path):
    data = summary_cache.build(_raw(tmp_path), Q)
    assert data["version"] == summary_cache.CACHE_VERSION
    assert data["summary"]["episodes"] == 2
    assert [q["verdict"] for q in data["quality"]] == ["ok", "suggest_drop"]
    assert data["suggested_drops"] == [1]
    assert data["quality_counts"] == {"ok": 1, "suggest_drop": 1, "warn": 0}
    trace = data["traces"]["0"]
    assert len(trace) == summary_cache.TRACE_POINTS
    assert trace[0] == 0.0 and max(trace) > 0.6 and all(0.0 <= v <= 1.0 for v in trace)


def test_a_view_has_no_quality_but_a_reason(tmp_path):
    view = build_view(tmp_path / "v", source="x", prompts={"a": "do a"}, lengths=[10])
    data = summary_cache.build(view, Q)
    assert data["quality"] is None and data["quality_counts"] is None and data["traces"] == {}
    assert "training view" in data["quality_unavailable"]


def test_the_cache_file_is_reused_until_a_data_file_changes(tmp_path, monkeypatch):
    raw = _raw(tmp_path)
    calls = []
    real = summary_cache.build
    monkeypatch.setattr(summary_cache, "build", lambda root, q: calls.append(root) or real(root, q))
    cache = summary_cache.SummaryCache(Q)
    first = cache.get(raw)
    assert (raw / ".console" / "summary.json").is_file()
    assert summary_cache.SummaryCache(Q).get(raw)["fingerprint"] == first["fingerprint"]  # new process: from file
    assert len(calls) == 1
    data_file = next((raw / "data").rglob("*.parquet"))
    stat = data_file.stat()
    os.utime(data_file, ns=(stat.st_atime_ns, stat.st_mtime_ns + 1_000_000_000))
    assert cache.get(raw)["fingerprint"] != first["fingerprint"]
    assert len(calls) == 2


def test_changed_quality_thresholds_rebuild(tmp_path):
    raw = _raw(tmp_path)
    assert summary_cache.fingerprint(raw, Q) != summary_cache.fingerprint(raw, QualityConfig(empty_position_min=8400))


def test_a_stale_or_broken_file_is_rebuilt(tmp_path):
    raw = _raw(tmp_path)
    (raw / ".console").mkdir()
    (raw / ".console" / "summary.json").write_text("{not json")
    data = summary_cache.SummaryCache(Q).get(raw)
    assert data["summary"]["episodes"] == 2
    assert json.loads((raw / ".console" / "summary.json").read_text())["fingerprint"] == data["fingerprint"]


def test_a_read_only_dataset_is_cached_in_memory(tmp_path, monkeypatch):
    raw = _raw(tmp_path)

    def refuse(path, data):
        raise PermissionError("read-only")

    monkeypatch.setattr(summary_cache, "write_json", refuse)
    cache = summary_cache.SummaryCache(Q)
    assert cache.get(raw)["summary"]["episodes"] == 2
    assert not (raw / ".console" / "summary.json").exists()
    calls = []
    monkeypatch.setattr(summary_cache, "build", lambda root, q: calls.append(root))
    assert cache.get(raw)["summary"]["episodes"] == 2 and calls == []
```

- [ ] **Step 2: Run to see them fail**

Run: `PYTHONPATH=. "$SCRATCH/venv/bin/python" -m pytest -q test/test_summary_cache.py -p no:cacheprovider`
Expected: FAIL (`ImportError: cannot import name 'summary_cache'`).

- [ ] **Step 3: Add traces to `quality.inspect_dataset`**

Replace the signature and the loop of `inspect_dataset` in `quality.py`:

```python
def gripper_trace(gripper: np.ndarray, config: QualityConfig, points: int) -> list[float]:
    """Downsampled gripper readings for the console's thumbnail: 0 = fully open, 1 = fully closed."""
    if not len(gripper):
        return []
    picks = np.linspace(0, len(gripper) - 1, num=min(points, len(gripper))).round().astype(int)
    span = config.gripper_close_raw - config.gripper_open_raw
    values = np.clip((gripper[picks] - config.gripper_open_raw) / span, 0.0, 1.0)
    return [round(float(v), 3) for v in values]


def inspect_dataset(
    root: str | Path, config: QualityConfig, *, traces: dict[int, list[float]] | None = None, trace_points: int = 60
) -> list[EpisodeQuality]:
```

(the body up to `results = []` stays), and inside the `for episode in read_episodes(root):` loop, right after `findings = check_episode(...)`:

```python
        if traces is not None:
            traces[episode.index] = gripper_trace(gripper, config, trace_points)
```

- [ ] **Step 4: Implement `realman_training/summary_cache.py`**

```python
"""Dataset summary + per-episode quality for the console, cached in <dataset>/.console/summary.json.

The cache is keyed by a fingerprint of every file under meta/ and data/ (path, size, mtime), the provenance files
(contract.json, clean manifests) and the quality thresholds, so it is rebuilt only when the data or the rules change.
A dataset the console cannot write to is cached in memory only.
"""

from __future__ import annotations

import dataclasses
import hashlib
import json
import threading
from pathlib import Path

from .config import QualityConfig
from .datasets import summarize
from .jobs import now, write_json
from .quality import QualityUnavailable, inspect_dataset, suggested_drops

CACHE_VERSION = 1
TRACE_POINTS = 60
CACHE_DIR = ".console"


def _stamp(digest, root: Path, path: Path) -> None:
    stat = path.stat()
    digest.update(f"{path.relative_to(root) if path.is_relative_to(root) else path}:{stat.st_size}:{stat.st_mtime_ns}\n".encode())


def fingerprint(root: Path, quality: QualityConfig) -> str:
    root = Path(root).resolve()
    digest = hashlib.sha256(json.dumps(dataclasses.asdict(quality), sort_keys=True).encode())
    for folder in ("meta", "data"):
        base = root / folder
        if base.is_dir():
            for path in sorted(base.rglob("*")):
                if path.is_file():
                    _stamp(digest, root, path)
    for path in (root / "contract.json", root / "clean_manifest.json", Path(f"{root}.clean_manifest.json")):
        if path.is_file():
            _stamp(digest, root, path)
    return digest.hexdigest()


def build(root: Path, quality: QualityConfig) -> dict:
    summary = summarize(root)
    traces: dict[int, list[float]] = {}
    results, unavailable = None, None
    try:
        results = inspect_dataset(root, quality, traces=traces, trace_points=TRACE_POINTS)
    except QualityUnavailable as error:
        unavailable = str(error)
    counts = None
    if results is not None:
        counts = {verdict: sum(q.verdict == verdict for q in results) for verdict in ("ok", "suggest_drop", "warn")}
    return {
        "version": CACHE_VERSION,
        "built": now(),
        "summary": summary.to_dict(),
        "quality": None if results is None else [q.to_dict() for q in results],
        "quality_unavailable": unavailable,
        "suggested_drops": suggested_drops(results) if results is not None else [],
        "quality_counts": counts,
        "traces": {str(episode): values for episode, values in traces.items()},
    }


class SummaryCache:
    def __init__(self, quality: QualityConfig):
        self._quality = quality
        self._memory: dict[Path, dict] = {}
        self._locks: dict[Path, threading.Lock] = {}
        self._guard = threading.Lock()

    def _lock(self, root: Path) -> threading.Lock:
        with self._guard:
            return self._locks.setdefault(root, threading.Lock())

    def get(self, root: str | Path) -> dict:
        root = Path(root).resolve()
        with self._lock(root):
            key = fingerprint(root, self._quality)
            hit = self._memory.get(root)
            if hit is not None and hit["fingerprint"] == key:
                return hit
            path = root / CACHE_DIR / "summary.json"
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
                if data.get("version") == CACHE_VERSION and data.get("fingerprint") == key:
                    self._memory[root] = data
                    return data
            except (OSError, ValueError):
                pass
            data = {**build(root, self._quality), "fingerprint": key}
            try:
                path.parent.mkdir(exist_ok=True)
                write_json(path, data)
            except OSError:
                pass  # read-only dataset: keep it in memory only
            self._memory[root] = data
            return data
```

Note: `fingerprint` ignores `.console/` because it only walks `meta/` and `data/`.

- [ ] **Step 5: Run the new tests and the quality tests**

Run: `PYTHONPATH=. "$SCRATCH/venv/bin/python" -m pytest -q test/test_summary_cache.py test/test_quality.py test/test_real_data.py -p no:cacheprovider`
Expected: all pass (real-data tests skip on the Mac).

- [ ] **Step 6: Commit**

```bash
git add src/training/realman_training/realman_training/quality.py src/training/realman_training/realman_training/summary_cache.py src/training/realman_training/test/test_summary_cache.py
git commit -m "feat(training): cached dataset summary and gripper traces for the console

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: A console world fixture and the read-side catalog (`catalog.py`)

**Files:**
- Create: `src/training/realman_training/test/console_fixture.py`
- Create: `src/training/realman_training/realman_training/catalog.py`
- Test: `src/training/realman_training/test/test_catalog.py`

**Interfaces:**
- Consumes: `summary_cache.SummaryCache`, `datasets.discover`, `openpi.run_dir`, `openpi.check_name`, `serving.model_prompts`, `serving_state.load`, `steps.train.parse_metrics`, `jobs.write_json`, `jobs.Job`.
- Produces (`catalog`):
  - `class NotFound(LookupError)`, `class BadRequest(ValueError)`
  - `relative(config, path: Path) -> str`, `resolve_dataset(config, rel: str) -> Path` (BadRequest for absolute/`..`/outside, NotFound for no dataset)
  - `list_datasets(config, cache) -> list[dict]` (DatasetRow)
  - `dataset_detail(config, cache, rel) -> dict`
  - `job_row(job) -> dict` (JobRow)
  - `list_runs(config) -> list[dict]`, `run_detail(config, config_name, exp, max_points=1000) -> dict`
  - `list_models(config) -> dict` (`{models, registry_markdown}`)
  - `linkcheck_history(config, limit) -> list[dict]`
  - `SETTINGS_KEYS = ("model", "checkpoint", "gpu", "port", "task")`, `serve_defaults(config) -> dict`, `load_settings(config) -> dict`, `save_settings(config, data) -> None`, `effective_settings(config) -> dict`, `serve_models(config) -> list[dict]`
- Produces (`console_fixture`): `build_world(root: Path) -> dict[str, Path]` with keys `root, data, raw, clean, view, docker_data, run, training_run, console, config`; constants `PLACE, PICK, CONFIG_NAME, EXP, MODEL`.

- [ ] **Step 1: Write the fixture `test/console_fixture.py`**

```python
"""A whole console world on disk for the catalog/web tests and Plan 5's e2e fake backend: raw, cleaned and view
datasets, a registered run with metrics/eval/card, a run still training, link-check history and serving.json."""

from __future__ import annotations

import json
import math
from pathlib import Path

from lerobot_fixture import Episode, build_dataset, build_view, gripper, write_clean_manifest

PLACE = "pick up the power adapter and put it in the blue bin"
PICK = "pick up the power adapter"
CONFIG_NAME = "pi05_realman_multitask_action_only"
EXP = "m_multitask_b16_2gpu"
MODEL = f"{CONFIG_NAME}/{EXP}"
TRAINING = ("pi05_realman_action_only", "a_new_run")


def _json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def build_world(root: Path) -> dict[str, Path]:
    root = Path(root)
    data = root / "data"
    raw = build_dataset(data / "raw_realman_ts_20261016" / "realman__pi05-three-arm", [
        Episode("pick_and_place", gripper((50, 60), (5700, 150), (50, 60))),                    # 0 ok
        Episode("pick_only", gripper((50, 60), (8450, 100))),                                    # 1 closed on nothing
        Episode("pick_and_place", gripper((50, 60), (5700, 80), (50, 10), (5700, 80), (50, 40))),  # 2 re-grasp
        Episode("pick_only", gripper((50, 60), (5600, 120))),                                    # 3 ok
        Episode("pick_only", gripper((800, 60), (5600, 120))),                                   # 4 starts half closed (warn)
    ])
    clean = build_dataset(data / "realman__multitask_clean", [
        Episode("pick_and_place", gripper((50, 60), (5700, 150), (50, 60))),
        Episode("pick_only", gripper((50, 60), (5600, 120))),
        Episode("pick_only", gripper((800, 60), (5600, 120))),
    ])
    write_clean_manifest(clean, source=str(raw), removed={1: "closed on nothing", 2: "re-grasp"})
    view = build_view(data / "realman_right_arm_multitask_view", source=str(clean),
                      prompts={"pick_and_place": PLACE, "pick_only": PICK}, lengths=[30, 30, 30],
                      tasks=["pick_and_place", "pick_only", "pick_only"])

    docker_data = root / "openpi-docker-data"
    run = docker_data / "checkpoints" / CONFIG_NAME / EXP
    for step in (10000, 29999):
        (run / str(step)).mkdir(parents=True)
    rows = ["step,grad_norm,loss,param_norm"]
    for step in range(0, 30000, 100):
        rows.append(f"{step},{0.3 * math.exp(-step / 12000) + 0.05:.5f},{0.5 * math.exp(-step / 8000) + 0.02:.5f},1800.0")
    (run / "metrics.csv").write_text("\n".join(rows) + "\n", encoding="utf-8")
    record = {"config": CONFIG_NAME, "exp": EXP, "view": str(view), "gpus": [1, 2], "batch_size": 16,
              "num_train_steps": 30000, "holdout": [1], "weights": "/w", "container": f"openpi-console-train-{EXP}",
              "openpi_commit": "abc123", "started": "2026-10-16T09:54:38+08:00", "ended": "2026-10-16T16:09:40+08:00",
              "exit_code": 0, "last_step": 29999}
    _json(run / "console_train.json", record)
    evals = {
        "10000": {"pick_and_place": {"mae": 0.121, "zero_baseline": 0.41, "episodes": [1]},
                  "pick_only": {"mae": 0.118, "zero_baseline": 0.39, "episodes": [1]}},
        "29999": {"pick_and_place": {"mae": 0.096, "zero_baseline": 0.41, "episodes": [1]},
                  "pick_only": {"mae": 0.092, "zero_baseline": 0.39, "episodes": [1]},
                  "prompt_swap": {"pick_and_place": {"pick_and_place": 0.096, "pick_only": 0.211},
                                  "pick_only": {"pick_only": 0.092, "pick_and_place": 0.187}}},
    }
    _json(run / "eval" / "summary.json", evals)
    card = {"generated_by": "realman-train register", "exp_name": EXP, "config": CONFIG_NAME,
            "method": "pi0.5 action-only fine-tune", "trained_start": record["started"], "trained_end": record["ended"],
            "batch_size": 16, "num_train_steps": 30000, "gpus": "2x GPU (server5090 GPU 1,2)", "openpi_commit": "abc123",
            "dataset_dir": str(view), "dataset_source": str(clean),
            "tasks": {"pick_and_place": {"prompt": PLACE, "episodes": 1}, "pick_only": {"prompt": PICK, "episodes": 2}},
            "episodes": 3, "frames": 90, "holdout_episodes": [1], "cameras": ["d435", "orbbec_right"], "arm": "r",
            "checkpoints": [10000, 29999],
            "open_loop_eval": {"10000": {"pick_and_place": 0.121, "pick_only": 0.118},
                               "29999": {"pick_and_place": 0.096, "pick_only": 0.092},
                               "zero_baseline": {"pick_and_place": 0.41, "pick_only": 0.39}},
            "status": "serving since 2026-10-16 17:02", "card_written": "2026-10-16T17:00:00+08:00"}
    _json(run / "model_card.json", card)
    (run / "MODEL_CARD.md").write_text(f"# {EXP}\n\n<!-- generated by realman-train register -->\n\npi0.5 action-only.\n",
                                       encoding="utf-8")
    (docker_data / "checkpoints" / "MODELS.md").write_text(
        "# 模型登记表（server5090 openpi checkpoints）\n\n| run | config |\n|---|---|\n"
        f"| `{MODEL}` | {CONFIG_NAME} |\n", encoding="utf-8")

    training_run = docker_data / "checkpoints" / TRAINING[0] / TRAINING[1]
    (training_run / "1000").mkdir(parents=True)
    _json(training_run / "console_train.json", {"config": TRAINING[0], "exp": TRAINING[1], "view": str(view),
                                                 "gpus": [3], "batch_size": 8, "num_train_steps": 5000,
                                                 "started": "2026-10-21T08:00:00+08:00"})
    (docker_data / "wandb").mkdir(parents=True)
    (docker_data / "wandb" / f"{TRAINING[1]}.log").write_text(
        "".join(f"Step {s}: grad_norm={0.4 - s / 20000:.4f}, loss={0.6 - s / 10000:.4f}\n" for s in range(0, 1500, 100)),
        encoding="utf-8")

    console = data / "_console"
    for stamp, ok, rate in (("20261020-234052-000001", True, "7.91"), ("20261021-091500-000001", False, "1.20")):
        _json(console / "linkcheck" / f"{stamp}.json", {
            "at": f"{stamp[:4]}-{stamp[4:6]}-{stamp[6:8]}T{stamp[9:11]}:{stamp[11:13]}:{stamp[13:15]}+08:00", "ok": ok,
            "checks": [
                {"item": "pika", "name": "pika_nodes", "ok": True, "value": "0", "threshold": "0", "detail": ""},
                {"item": "link", "name": "bulk_throughput", "ok": ok, "value": f"{rate} MB/s", "threshold": ">= 2 MB/s",
                 "detail": ""},
            ]})
    _json(console / "serving.json", {"model": MODEL, "config": CONFIG_NAME, "exp": EXP, "step": 29999,
                                     "checkpoint": f"checkpoints/{MODEL}/29999", "gpu": 2, "port": 18000,
                                     "task": "pick_and_place", "prompt": PLACE, "started": "2026-10-16T17:02:00+08:00",
                                     "warmup_ms": [26000.0, 95.0]})

    config = root / "console.yaml"
    config.write_text(
        "training_console:\n"
        f"  data_root: {data}\n"
        "  openpi:\n"
        f"    repo: {root / 'openpi'}\n"
        f"    docker_data: {docker_data}\n"
        "  serving:\n"
        f"    model: {MODEL}\n",
        encoding="utf-8",
    )
    return {"root": root, "data": data, "raw": raw, "clean": clean, "view": view, "docker_data": docker_data,
            "run": run, "training_run": training_run, "console": console, "config": config}
```

- [ ] **Step 2: Write the failing tests** (`test/test_catalog.py`)

```python
from __future__ import annotations

import pytest
from console_fixture import CONFIG_NAME, EXP, MODEL, PICK, PLACE, TRAINING, build_world

from realman_training import catalog
from realman_training.config import load_config
from realman_training.jobs import JobStore
from realman_training.summary_cache import SummaryCache


@pytest.fixture()
def world(tmp_path):
    paths = build_world(tmp_path)
    config = load_config(paths["config"])
    return paths, config, SummaryCache(config.quality)


def test_datasets_are_listed_with_kind_counts_and_quality(world):
    paths, config, cache = world
    rows = {row["path"]: row for row in catalog.list_datasets(config, cache)}
    assert set(rows) == {"raw_realman_ts_20261016/realman__pi05-three-arm", "realman__multitask_clean",
                         "realman_right_arm_multitask_view"}
    raw = rows["raw_realman_ts_20261016/realman__pi05-three-arm"]
    assert (raw["kind"], raw["episodes"], raw["name"]) == ("raw", 5, "realman__pi05-three-arm")
    assert raw["quality_counts"] == {"ok": 2, "suggest_drop": 2, "warn": 1}
    assert rows["realman__multitask_clean"]["kind"] == "clean"
    assert rows["realman__multitask_clean"]["removed_episodes"] == 2
    view = rows["realman_right_arm_multitask_view"]
    assert view["kind"] == "view" and view["quality_counts"] is None
    assert view["prompts"] == {"pick_and_place": PLACE, "pick_only": PICK}


def test_a_broken_dataset_is_a_row_not_a_crash(world):
    paths, config, cache = world
    broken = paths["data"] / "broken"
    (broken / "meta").mkdir(parents=True)
    (broken / "meta" / "info.json").write_text('{"codebase_version": "v2.1"}')
    rows = {row["path"]: row for row in catalog.list_datasets(config, cache)}
    assert rows["broken"]["kind"] == "error" and "v2.1" in rows["broken"]["error"]


def test_dataset_detail_and_path_rules(world):
    paths, config, cache = world
    detail = catalog.dataset_detail(config, cache, "raw_realman_ts_20261016/realman__pi05-three-arm")
    assert detail["path"] == "raw_realman_ts_20261016/realman__pi05-three-arm"
    assert detail["suggested_drops"] == [1, 2]
    assert set(detail["traces"]) == {"0", "1", "2", "3", "4"}
    assert "fingerprint" not in detail
    for bad in ("/etc", "../x", "raw_realman_ts_20261016/../../x", ""):
        with pytest.raises(catalog.BadRequest):
            catalog.resolve_dataset(config, bad)
    with pytest.raises(catalog.NotFound):
        catalog.resolve_dataset(config, "raw_realman_ts_20261016")  # a folder, not a dataset


def test_runs_list_both_runs_with_their_state(world):
    _, config, _ = world
    runs = {row["name"]: row for row in catalog.list_runs(config)}
    done = runs[MODEL]
    assert done["checkpoints"] == [10000, 29999] and done["registered"] is True
    assert done["last_loss"] == pytest.approx(0.5 * 2.718281828 ** (-29900 / 8000) + 0.02, abs=1e-4)
    assert done["eval_latest"] == {"step": 29999, "tasks": {"pick_and_place": 0.096, "pick_only": 0.092}}
    assert done["view"] == "realman_right_arm_multitask_view"
    training = runs["/".join(TRAINING)]
    assert training["registered"] is False and training["ended"] is None and training["last_loss"] == pytest.approx(0.46)


def test_run_detail_has_metrics_eval_and_card(world):
    _, config, _ = world
    detail = catalog.run_detail(config, CONFIG_NAME, EXP, max_points=50)
    assert len(detail["metrics"]["step"]) <= 50 and detail["metrics"]["step"][-1] == 29900
    assert set(detail["metrics"]) == {"step", "grad_norm", "loss", "param_norm"}
    assert detail["eval"]["29999"]["prompt_swap"]["pick_only"]["pick_and_place"] == 0.187
    assert detail["card"]["method"] == "pi0.5 action-only fine-tune"
    assert "generated by" in detail["card_markdown"]
    live = catalog.run_detail(config, *TRAINING)
    assert live["metrics"]["step"][:2] == [0, 100] and live["metrics"]["loss"][0] == pytest.approx(0.6)
    with pytest.raises(catalog.NotFound):
        catalog.run_detail(config, CONFIG_NAME, "nope")
    with pytest.raises(catalog.BadRequest):
        catalog.run_detail(config, "../x", EXP)


def test_models_are_the_registered_runs(world):
    _, config, _ = world
    data = catalog.list_models(config)
    assert [m["name"] for m in data["models"]] == [MODEL]
    model = data["models"][0]
    assert model["serving"] is True and model["dataset"] == "realman_right_arm_multitask_view"
    assert model["open_loop"] == {"step": 29999, "tasks": {"pick_and_place": 0.096, "pick_only": 0.092},
                                  "zero_baseline": {"pick_and_place": 0.41, "pick_only": 0.39}}
    assert model["tasks"]["pick_only"]["prompt"] == PICK
    assert "模型登记表" in data["registry_markdown"]


def test_linkcheck_history_is_newest_first(world):
    _, config, _ = world
    history = catalog.linkcheck_history(config, limit=10)
    assert [h["ok"] for h in history] == [False, True]
    assert catalog.linkcheck_history(config, limit=1)[0]["at"].startswith("2026-10-21")


def test_serve_settings_overlay_the_defaults(world):
    _, config, _ = world
    assert catalog.serve_defaults(config) == {"model": MODEL, "checkpoint": "", "gpu": 2, "port": 18000, "task": None}
    assert catalog.load_settings(config) == {}
    catalog.save_settings(config, {"gpu": 3, "task": "pick_only"})
    assert catalog.effective_settings(config) == {"model": MODEL, "checkpoint": "", "gpu": 3, "port": 18000,
                                                  "task": "pick_only"}
    models = catalog.serve_models(config)
    assert models == [{"name": MODEL, "checkpoints": [10000, 29999],
                       "prompts": {"pick_and_place": PLACE, "pick_only": PICK}}]


def test_job_row_drops_the_config_path(tmp_path):
    store = JobStore(tmp_path / "c")
    folder = tmp_path / "c" / "jobs" / "20261021-100000-clean-abcd"
    folder.mkdir(parents=True)
    (folder / "params.json").write_text('{"kind": "clean", "target": "x:y", "params": {"config": "/c.yaml", "src": "/d/a"}}')
    (folder / "status.json").write_text('{"id": "20261021-100000-clean-abcd", "kind": "clean", "state": "succeeded", "result": {"dst": "/d/b"}}')
    row = catalog.job_row(store.get("20261021-100000-clean-abcd"))
    assert row["params"] == {"src": "/d/a"} and row["result"] == {"dst": "/d/b"} and row["state"] == "succeeded"
```

- [ ] **Step 3: Run to see them fail**

Run: `PYTHONPATH=. "$SCRATCH/venv/bin/python" -m pytest -q test/test_catalog.py -p no:cacheprovider`
Expected: FAIL (`ImportError: cannot import name 'catalog'`).

- [ ] **Step 4: Implement `realman_training/catalog.py`**

```python
"""What the console shows, read from disk: datasets (through the summary cache), jobs, training runs, registered
models, link-check history and the serve settings the web page saved. Nothing here writes data except the settings
file in the console state directory."""

from __future__ import annotations

import csv
import json
from pathlib import Path

import pyarrow

from . import serving_state
from .config import ConsoleConfig
from .datasets import discover
from .jobs import Job, StepFailed, write_json
from .lerobot_io import NotALeRobotDataset, is_dataset
from .openpi import check_name, run_dir
from .serving import model_prompts
from .steps.train import parse_metrics
from .summary_cache import SummaryCache

SETTINGS_KEYS = ("model", "checkpoint", "gpu", "port", "task")
_ROW_KEYS = ("name", "kind", "episodes", "frames", "duration_sec", "fps", "first_file_time", "last_file_time",
             "disk_bytes", "tasks", "source", "removed_episodes", "prompts")


class NotFound(LookupError):
    pass


class BadRequest(ValueError):
    pass


def _read_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None


def relative(config: ConsoleConfig, path: str | Path) -> str:
    path, root = Path(path).resolve(), config.data_root.resolve()
    return str(path.relative_to(root)) if path.is_relative_to(root) else str(path)


def resolve_dataset(config: ConsoleConfig, rel: str) -> Path:
    if not rel or Path(rel).is_absolute() or ".." in Path(rel).parts:
        raise BadRequest(f"dataset path {rel!r}: give a path relative to data_root, without ..")
    root = config.data_root.resolve()
    path = (root / rel).resolve()
    if not path.is_relative_to(root):
        raise BadRequest(f"dataset path {rel!r} leaves data_root")
    if not is_dataset(path):
        raise NotFound(f"no dataset at {rel}")
    return path


def list_datasets(config: ConsoleConfig, cache: SummaryCache) -> list[dict]:
    rows = []
    for path in discover(config.data_root):
        rel = relative(config, path)
        try:
            entry = cache.get(path)
        except (NotALeRobotDataset, OSError, ValueError, KeyError, pyarrow.ArrowInvalid) as error:
            rows.append({"path": rel, "name": path.name, "kind": "error", "error": str(error)})
            continue
        summary = entry["summary"]
        rows.append({"path": rel, **{k: summary[k] for k in _ROW_KEYS}, "quality_counts": entry["quality_counts"]})
    return rows


def dataset_detail(config: ConsoleConfig, cache: SummaryCache, rel: str) -> dict:
    entry = cache.get(resolve_dataset(config, rel))
    return {"path": rel, **{k: v for k, v in entry.items() if k not in ("fingerprint", "version")}}


def job_row(job: Job) -> dict:
    status = job.status()
    try:
        params = dict(job.params().get("params") or {})
    except (OSError, ValueError):
        params = {}
    params.pop("config", None)
    row = {k: status.get(k) for k in ("id", "kind", "state", "created", "started", "ended", "error", "progress", "result")}
    return {**row, "params": params}


def _metrics(folder: Path, exp: str, docker_data: Path) -> list[dict]:
    path = folder / "metrics.csv"
    if path.is_file():
        rows = []
        with path.open(newline="", encoding="utf-8") as handle:
            for raw in csv.DictReader(handle):
                row = {}
                for key, value in raw.items():
                    try:
                        row[key] = int(value) if key == "step" else float(value)
                    except (TypeError, ValueError):
                        pass
                rows.append(row)
        return rows
    log = docker_data / "wandb" / f"{exp}.log"
    return parse_metrics(log.read_text(encoding="utf-8", errors="replace")) if log.is_file() else []


def _eval_latest(evals: dict | None) -> dict | None:
    steps = sorted((int(s) for s in (evals or {}) if s.isdigit()), reverse=True)
    for step in steps:
        tasks = {t: r["mae"] for t, r in evals[str(step)].items() if t != "prompt_swap" and isinstance(r, dict) and "mae" in r}
        if tasks:
            return {"step": step, "tasks": tasks}
    return None


def _checkpoints(folder: Path) -> list[int]:
    return sorted(int(p.name) for p in folder.iterdir() if p.is_dir() and p.name.isdigit())


def _run_row(config: ConsoleConfig, folder: Path, metrics: list[dict]) -> dict:
    record = _read_json(folder / "console_train.json") or {}
    card = _read_json(folder / "model_card.json")
    losses = [row["loss"] for row in metrics if "loss" in row]
    view = record.get("view")
    return {
        "name": f"{folder.parent.name}/{folder.name}",
        "config": folder.parent.name,
        "exp": folder.name,
        "checkpoints": _checkpoints(folder),
        "view": relative(config, view) if view else None,
        "gpus": record.get("gpus"),
        "batch_size": record.get("batch_size"),
        "num_train_steps": record.get("num_train_steps"),
        "last_step": record.get("last_step") or (metrics[-1]["step"] if metrics else None),
        "started": record.get("started"),
        "ended": record.get("ended"),
        "exit_code": record.get("exit_code"),
        "registered": card is not None,
        "status": (card or {}).get("status"),
        "last_loss": losses[-1] if losses else None,
        "eval_latest": _eval_latest(_read_json(folder / "eval" / "summary.json")),
    }


def _run_folders(config: ConsoleConfig) -> list[Path]:
    base = config.openpi.docker_data / "checkpoints"
    if not base.is_dir():
        return []
    folders = []
    for config_dir in sorted(p for p in base.iterdir() if p.is_dir()):
        for folder in sorted(p for p in config_dir.iterdir() if p.is_dir()):
            if (folder / "console_train.json").is_file() or (folder / "model_card.json").is_file() or _checkpoints(folder):
                folders.append(folder)
    return folders


def list_runs(config: ConsoleConfig) -> list[dict]:
    rows = [_run_row(config, f, _metrics(f, f.name, config.openpi.docker_data)) for f in _run_folders(config)]
    return sorted(rows, key=lambda row: row["started"] or "", reverse=True)


def _downsample(rows: list[dict], max_points: int) -> list[dict]:
    if len(rows) <= max_points:
        return rows
    stride = -(-len(rows) // max_points)
    picked = rows[::stride]
    return picked if picked[-1] is rows[-1] else [*picked[:-1], rows[-1]]


def _run_folder(config: ConsoleConfig, config_name: str, exp: str) -> Path:
    try:
        check_name("config_name", config_name)
        check_name("exp", exp)
    except StepFailed as error:
        raise BadRequest(str(error)) from None
    folder = run_dir(config.openpi, config_name, exp)
    if not folder.is_dir():
        raise NotFound(f"no run {config_name}/{exp}")
    return folder


def run_detail(config: ConsoleConfig, config_name: str, exp: str, max_points: int = 1000) -> dict:
    folder = _run_folder(config, config_name, exp)
    metrics = _metrics(folder, exp, config.openpi.docker_data)
    picked = _downsample(metrics, max_points)
    keys = list(dict.fromkeys(k for row in picked for k in row))
    series = {key: [row.get(key) for row in picked] for key in keys} if picked else {"step": []}
    markdown = folder / "MODEL_CARD.md"
    return {
        **_run_row(config, folder, metrics),
        "record": _read_json(folder / "console_train.json"),
        "metrics": series,
        "eval": _read_json(folder / "eval" / "summary.json"),
        "card": _read_json(folder / "model_card.json"),
        "card_markdown": markdown.read_text(encoding="utf-8") if markdown.is_file() else None,
    }


def list_models(config: ConsoleConfig) -> dict:
    record = serving_state.load(config)
    serving_name = record.get("model") if record and not record.get("stopped") else None
    models = []
    for folder in _run_folders(config):
        card = _read_json(folder / "model_card.json")
        if card is None:
            continue
        name = f"{folder.parent.name}/{folder.name}"
        loops = card.get("open_loop_eval") or {}
        steps = sorted((int(s) for s in loops if str(s).isdigit()), reverse=True)
        open_loop = None
        if steps:
            open_loop = {"step": steps[0], "tasks": loops[str(steps[0])], "zero_baseline": loops.get("zero_baseline") or {}}
        dataset_dir = card.get("dataset_dir")
        models.append({
            "name": name, "config": folder.parent.name, "exp": folder.name,
            "method": card.get("method"), "trained_start": card.get("trained_start"), "trained_end": card.get("trained_end"),
            "dataset": relative(config, dataset_dir) if dataset_dir else None, "dataset_dir": dataset_dir,
            "tasks": card.get("tasks") or {}, "episodes": card.get("episodes"),
            "holdout_episodes": card.get("holdout_episodes") or [], "checkpoints": _checkpoints(folder),
            "open_loop": open_loop, "status": card.get("status"), "serving": name == serving_name,
        })
    models.sort(key=lambda m: m["trained_end"] or "", reverse=True)
    registry = config.openpi.docker_data / "checkpoints" / "MODELS.md"
    return {"models": models, "registry_markdown": registry.read_text(encoding="utf-8") if registry.is_file() else None}


def linkcheck_history(config: ConsoleConfig, limit: int) -> list[dict]:
    folder = config.console_dir / "linkcheck"
    if not folder.is_dir():
        return []
    entries = []
    for path in sorted(folder.glob("*.json"), reverse=True)[:limit]:
        data = _read_json(path)
        if isinstance(data, dict):
            entries.append(data)
    return entries


def _settings_path(config: ConsoleConfig) -> Path:
    return config.console_dir / "serve_settings.json"


def serve_defaults(config: ConsoleConfig) -> dict:
    sc = config.serving
    return {"model": sc.model, "checkpoint": sc.checkpoint, "gpu": sc.gpu, "port": sc.port, "task": None}


def load_settings(config: ConsoleConfig) -> dict:
    data = _read_json(_settings_path(config))
    return {k: data[k] for k in SETTINGS_KEYS if k in data} if isinstance(data, dict) else {}


def save_settings(config: ConsoleConfig, data: dict) -> None:
    _settings_path(config).parent.mkdir(parents=True, exist_ok=True)
    write_json(_settings_path(config), {k: data[k] for k in SETTINGS_KEYS if k in data})


def effective_settings(config: ConsoleConfig) -> dict:
    return {**serve_defaults(config), **load_settings(config)}


def serve_models(config: ConsoleConfig) -> list[dict]:
    models = []
    for folder in _run_folders(config):
        steps = _checkpoints(folder)
        prompts = model_prompts(folder)
        if steps and prompts:
            models.append({"name": f"{folder.parent.name}/{folder.name}", "checkpoints": steps, "prompts": prompts})
    return models
```

- [ ] **Step 5: Run the tests**

Run: `PYTHONPATH=. "$SCRATCH/venv/bin/python" -m pytest -q test/test_catalog.py -p no:cacheprovider`
Expected: 9 passed. If `test_datasets_are_listed_with_kind_counts_and_quality` shows a different `quality_counts` for the raw set, print `catalog.dataset_detail(...)["quality"]` and fix the fixture episode (not the rules) so that 1 and 2 are drops and 4 is a warning.

- [ ] **Step 6: Commit**

```bash
git add src/training/realman_training/realman_training/catalog.py src/training/realman_training/test/console_fixture.py src/training/realman_training/test/test_catalog.py
git commit -m "feat(training): catalog of datasets, runs, models and history for the console

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: The job-parameter whitelist (`job_params.py`)

**Files:**
- Create: `src/training/realman_training/realman_training/job_params.py`
- Test: `src/training/realman_training/test/test_job_params.py`

**Interfaces:**
- Consumes: `catalog.resolve_dataset`, `catalog.BadRequest`, `catalog.effective_settings`, `config.ARMS`, `openpi.SAFE_NAME`, `openpi.parse_gpus`, `serving.resolve_model`, `jobs.STEPS`, `linkcheck.ITEMS`, `steps.pull.default_target`, `steps.clean.default_dst`, `steps.view.default_dst`, `datasets.summarize`.
- Produces: `job_params.build(kind: str, raw: dict, config: ConsoleConfig, settings: dict | None = None) -> dict` (params for `JobStore.start`, always with `"config": str(config.source)`), `job_params.validate_settings(raw: dict, config) -> dict` (clean settings), errors as `catalog.BadRequest`.

- [ ] **Step 1: Write the failing tests** (`test/test_job_params.py`)

```python
from __future__ import annotations

import pytest
from console_fixture import CONFIG_NAME, EXP, MODEL, build_world

from realman_training import job_params
from realman_training.catalog import BadRequest
from realman_training.config import load_config

RAW = "raw_realman_ts_20261016/realman__pi05-three-arm"
VIEW = "realman_right_arm_multitask_view"


@pytest.fixture()
def world(tmp_path):
    paths = build_world(tmp_path)
    return paths, load_config(paths["config"])


def test_clean_resolves_paths_and_keeps_reasons_for_dropped_episodes_only(world):
    paths, config = world
    params = job_params.build("clean", {"src": RAW, "drop": [2, 1, 2], "reasons": {"1": "empty", "2": "re-grasp"},
                                        "dst": "my_clean"}, config)
    assert params == {"config": str(config.source), "src": str(paths["raw"]), "drop": [1, 2],
                      "reasons": {"1": "empty", "2": "re-grasp"}, "dst": str(paths["data"] / "my_clean")}
    default = job_params.build("clean", {"src": RAW, "drop": [1]}, config)
    assert default["dst"].startswith(str(paths["data"])) and "_clean_" in default["dst"]


@pytest.mark.parametrize("raw, fragment", [
    ({"src": RAW, "drop": []}, "nothing to drop"),
    ({"src": RAW, "drop": [-1]}, "episode"),
    ({"src": RAW, "drop": ["1"]}, "episode"),
    ({"src": RAW, "drop": [1], "reasons": {"3": "x"}}, "not dropped"),
    ({"src": RAW, "drop": [1], "dst": "../evil"}, "name"),
    ({"src": RAW, "drop": [1], "dst": "realman__multitask_clean"}, "exists"),
    ({"src": "/etc", "drop": [1]}, "relative"),
    ({"src": RAW, "drop": [1], "rm": True}, "unknown"),
])
def test_clean_refuses_bad_input(world, raw, fragment):
    _, config = world
    with pytest.raises(BadRequest, match=fragment):
        job_params.build("clean", raw, config)


def test_view_norm_train_eval_register(world):
    paths, config = world
    view = job_params.build("view", {"src": "realman__multitask_clean", "task_prompts": {"pick_only": "pick it"},
                                     "arm": "r", "dry_run": True}, config)
    assert view["src"] == str(paths["clean"]) and view["task_prompts"] == {"pick_only": "pick it"}
    assert view["arm"] == "r" and view["dry_run"] is True and view["dst"].endswith("_view")
    with pytest.raises(BadRequest, match="training view"):
        job_params.build("view", {"src": VIEW}, config)
    norm = job_params.build("norm", {"config_name": CONFIG_NAME, "view": VIEW}, config)
    assert norm == {"config": str(config.source), "config_name": CONFIG_NAME, "view": str(paths["view"]),
                    "force": False, "dry_run": False}
    with pytest.raises(BadRequest, match="not a training view"):
        job_params.build("norm", {"config_name": CONFIG_NAME, "view": RAW}, config)
    train = job_params.build("train", {"config_name": CONFIG_NAME, "view": VIEW, "exp": "e2", "gpus": "1, 2",
                                       "batch": 16, "steps": 30000}, config)
    assert (train["gpus"], train["batch"], train["steps"], train["resume"], train["attach"]) == ("1,2", 16, 30000, False, False)
    with pytest.raises(BadRequest, match="gpus"):
        job_params.build("train", {"config_name": CONFIG_NAME, "view": VIEW, "exp": "e2", "gpus": "x"}, config)
    with pytest.raises(BadRequest, match="batch"):
        job_params.build("train", {"config_name": CONFIG_NAME, "view": VIEW, "exp": "e2", "gpus": "1", "batch": 0}, config)
    evaluation = job_params.build("eval", {"config_name": CONFIG_NAME, "exp": EXP, "view": VIEW, "gpu": 3,
                                           "checkpoints": [29999]}, config)
    assert (evaluation["gpu"], evaluation["checkpoints"], evaluation["prompt_swap"]) == ("3", [29999], None)
    no_swap = job_params.build("eval", {"config_name": CONFIG_NAME, "exp": EXP, "view": VIEW, "gpu": 3,
                                        "prompt_swap": False}, config)
    assert no_swap["prompt_swap"] is False and no_swap["checkpoints"] is None
    register = job_params.build("register", {"config_name": CONFIG_NAME, "exp": EXP, "status": "ok"}, config)
    assert register == {"config": str(config.source), "config_name": CONFIG_NAME, "exp": EXP, "status": "ok",
                        "method": None, "force": False}


def test_pull_and_linkcheck(world):
    paths, config = world
    pull = job_params.build("pull", {"name": "raw_x"}, config)
    assert pull == {"config": str(config.source), "target": str(paths["data"] / "raw_x")}
    with pytest.raises(BadRequest, match="exists"):
        job_params.build("pull", {"name": "realman__multitask_clean"}, config)
    assert job_params.build("linkcheck", {"only": ["link", "pika"]}, config)["only"] == ["link", "pika"]
    assert job_params.build("linkcheck", {}, config)["only"] is None
    with pytest.raises(BadRequest, match="only"):
        job_params.build("linkcheck", {"only": ["wifi"]}, config)


def test_serve_start_fills_from_the_settings_and_checks_the_model(world):
    _, config = world
    params = job_params.build("serve", {"action": "start", "gpu": 3}, config,
                              settings={"model": MODEL, "checkpoint": "", "gpu": 2, "port": 18000, "task": "pick_only"})
    assert params == {"config": str(config.source), "action": "start", "model": MODEL, "checkpoint": None, "gpu": 3,
                      "port": 18000, "task": "pick_only", "dry_run": False}
    with pytest.raises(BadRequest, match="no run"):
        job_params.build("serve", {"action": "start", "model": "pi05_x/none"}, config, settings={})
    with pytest.raises(BadRequest, match="task"):
        job_params.build("serve", {"action": "start", "task": "dance"}, config, settings={"model": MODEL})
    assert job_params.build("serve", {"action": "stop"}, config) == {"config": str(config.source), "action": "stop",
                                                                     "dry_run": False}
    with pytest.raises(BadRequest, match="action"):
        job_params.build("serve", {"action": "restart"}, config)


def test_settings_are_validated(world):
    _, config = world
    assert job_params.validate_settings({"model": MODEL, "checkpoint": 29999, "gpu": 1, "port": 18000,
                                         "task": "pick_and_place"}, config) == {
        "model": MODEL, "checkpoint": "29999", "gpu": 1, "port": 18000, "task": "pick_and_place"}
    with pytest.raises(BadRequest, match="checkpoint"):
        job_params.validate_settings({"model": MODEL, "checkpoint": 5}, config)
    with pytest.raises(BadRequest, match="port"):
        job_params.validate_settings({"port": 0}, config)
    with pytest.raises(BadRequest, match="unknown"):
        job_params.validate_settings({"colour": "x"}, config)


def test_unknown_kind(world):
    _, config = world
    with pytest.raises(BadRequest, match="kind"):
        job_params.build("delete", {}, config)
```

- [ ] **Step 2: Run to see them fail**

Run: `PYTHONPATH=. "$SCRATCH/venv/bin/python" -m pytest -q test/test_job_params.py -p no:cacheprovider`
Expected: FAIL (`ImportError: cannot import name 'job_params'`).

- [ ] **Step 3: Implement `realman_training/job_params.py`**

```python
"""The only way the web console builds step parameters: one whitelist per job kind.

Unknown keys are refused, dataset paths must be relative to data_root, new directories are names under data_root
that must not exist yet, and model/task/GPU/port values are checked before a job starts. The steps still do their
own checks (busy GPUs, behaviour-tree mode, refused targets) when they run.
"""

from __future__ import annotations

from pathlib import Path

from . import linkcheck
from .catalog import BadRequest, NotFound, resolve_dataset
from .config import ARMS, ConsoleConfig
from .datasets import summarize
from .jobs import STEPS, StepFailed
from .openpi import SAFE_NAME, parse_gpus
from .serving import resolve_model
from .steps import clean as clean_step
from .steps import pull as pull_step
from .steps import view as view_step

ALLOWED = {
    "pull": {"dataset", "name"},
    "clean": {"src", "drop", "reasons", "dst"},
    "view": {"src", "task_prompts", "arm", "dst", "dry_run"},
    "norm": {"config_name", "view", "force", "dry_run"},
    "train": {"config_name", "view", "exp", "gpus", "batch", "steps", "resume", "dry_run"},
    "eval": {"config_name", "exp", "view", "gpu", "checkpoints", "stride", "prompt_swap", "dry_run"},
    "register": {"config_name", "exp", "status", "method", "force"},
    "serve": {"action", "model", "checkpoint", "gpu", "port", "task", "dry_run"},
    "linkcheck": {"only"},
}
SETTINGS = {"model", "checkpoint", "gpu", "port", "task"}
_TEXT_MAX = 500


def _bool(raw: dict, key: str) -> bool:
    value = raw.get(key, False)
    if not isinstance(value, bool):
        raise BadRequest(f"{key} must be true or false")
    return value


def _int(raw: dict, key: str, low: int, high: int) -> int | None:
    value = raw.get(key)
    if value is None or value == "":
        return None
    if isinstance(value, bool) or not isinstance(value, int) or not low <= value <= high:
        raise BadRequest(f"{key} must be an integer in {low}..{high}")
    return value


def _text(raw: dict, key: str) -> str | None:
    value = raw.get(key)
    if value is None:
        return None
    if not isinstance(value, str) or len(value) > _TEXT_MAX:
        raise BadRequest(f"{key} must be text of at most {_TEXT_MAX} characters")
    return value.strip() or None


def _name(value, key: str) -> str:
    if not isinstance(value, str) or not SAFE_NAME.match(value):
        raise BadRequest(f"{key} {value!r}: use a plain name (letters, digits, _ . -)")
    return value


def _dataset(config: ConsoleConfig, raw: dict, key: str) -> Path:
    if not isinstance(raw.get(key), str):
        raise BadRequest(f"{key} is required: a dataset path relative to data_root")
    try:
        return resolve_dataset(config, raw[key])
    except NotFound as error:
        raise BadRequest(str(error)) from None


def _new_dir(config: ConsoleConfig, raw: dict, key: str, default: Path) -> str:
    target = config.data_root / _name(raw[key], key) if raw.get(key) else Path(default)
    if target.exists():
        raise BadRequest(f"{key} {target.name} exists under data_root: pick another name (nothing is overwritten)")
    return str(target)


def _view(config: ConsoleConfig, raw: dict) -> str:
    path = _dataset(config, raw, "view")
    if summarize(path).kind != "view":
        raise BadRequest(f"{raw['view']} is not a training view (no contract.json)")
    return str(path)


def _episodes(value, key: str) -> list[int]:
    if not isinstance(value, list) or any(isinstance(v, bool) or not isinstance(v, int) or v < 0 for v in value):
        raise BadRequest(f"{key} must be a list of episode numbers")
    return sorted(set(value))


def _check_keys(raw: dict, allowed: set[str], what: str) -> None:
    if not isinstance(raw, dict):
        raise BadRequest(f"{what} must be an object")
    unknown = sorted(set(raw) - allowed)
    if unknown:
        raise BadRequest(f"unknown {what} keys {unknown}; allowed: {sorted(allowed)}")


def _model_checks(config: ConsoleConfig, model: str | None, checkpoint, task: str | None):
    try:
        resolved = resolve_model(config, model, checkpoint)
    except (StepFailed, ValueError) as error:
        raise BadRequest(str(error)) from None
    if task is not None and task not in resolved.prompts:
        raise BadRequest(f"task {task!r} is not one of {resolved.name}'s tasks: {', '.join(resolved.prompts)}")
    return resolved


def validate_settings(raw: dict, config: ConsoleConfig) -> dict:
    _check_keys(raw, SETTINGS, "settings")
    clean: dict = {}
    if raw.get("model") is not None:
        clean["model"] = _text(raw, "model")
    if "checkpoint" in raw:
        value = raw["checkpoint"]
        if value in (None, ""):
            clean["checkpoint"] = ""
        elif isinstance(value, bool) or not isinstance(value, (int, str)) or not str(value).isdigit():
            raise BadRequest("checkpoint must be a step number or empty (= the latest)")
        else:
            clean["checkpoint"] = str(int(value))
    for key, low, high in (("gpu", 0, 15), ("port", 1, 65535)):
        value = _int(raw, key, low, high)
        if value is not None:
            clean[key] = value
    if "task" in raw:
        clean["task"] = _text(raw, "task")
    effective = {**{"model": config.serving.model, "checkpoint": config.serving.checkpoint}, **clean}
    _model_checks(config, effective["model"], effective["checkpoint"], effective.get("task"))
    return clean


def build(kind: str, raw: dict, config: ConsoleConfig, settings: dict | None = None) -> dict:
    if kind not in ALLOWED or kind not in STEPS:
        raise BadRequest(f"unknown job kind {kind!r}; one of {sorted(ALLOWED)}")
    raw = raw or {}
    _check_keys(raw, ALLOWED[kind], f"{kind} params")
    params: dict = {"config": str(config.source)}
    if kind == "pull":
        if raw.get("dataset") is not None:
            params["dataset"] = _name(raw["dataset"], "dataset")
        params["target"] = _new_dir(config, raw, "name", pull_step.default_target(config.data_root))
        return {"config": params["config"], "target": params["target"], **({"dataset": params["dataset"]} if "dataset" in params else {})}
    if kind == "clean":
        src = _dataset(config, raw, "src")
        drop = _episodes(raw.get("drop"), "drop")
        if not drop:
            raise BadRequest("nothing to drop: tick at least one episode")
        reasons = raw.get("reasons") or {}
        if not isinstance(reasons, dict) or any(not isinstance(v, str) or len(v) > _TEXT_MAX for v in reasons.values()):
            raise BadRequest("reasons must map dropped episode numbers to text")
        stray = sorted(set(reasons) - {str(e) for e in drop})
        if stray:
            raise BadRequest(f"reasons for episodes that are not dropped: {stray}")
        params.update(src=str(src), drop=drop)
        if reasons:
            params["reasons"] = dict(reasons)
        params["dst"] = _new_dir(config, raw, "dst", clean_step.default_dst(config.data_root, src))
        return params
    if kind == "view":
        src = _dataset(config, raw, "src")
        if summarize(src).kind == "view":
            raise BadRequest(f"{raw['src']} is already a training view: build a view from a raw or cleaned set")
        prompts = raw.get("task_prompts") or {}
        if not isinstance(prompts, dict) or any(not isinstance(k, str) or not isinstance(v, str) or not v.strip()
                                                or len(v) > _TEXT_MAX for k, v in prompts.items()):
            raise BadRequest("task_prompts must map task names to non-empty prompts")
        arm = raw.get("arm")
        if arm is not None and arm not in ARMS:
            raise BadRequest(f"arm must be one of {ARMS}")
        params.update(src=str(src), dst=_new_dir(config, raw, "dst", view_step.default_dst(config.data_root, src)),
                      task_prompts={k: v.strip() for k, v in prompts.items()}, dry_run=_bool(raw, "dry_run"))
        if arm is not None:
            params["arm"] = arm
        return params
    if kind in ("norm", "train", "eval", "register"):
        params["config_name"] = _name(raw.get("config_name"), "config_name")
    if kind == "norm":
        return {**params, "view": _view(config, raw), "force": _bool(raw, "force"), "dry_run": _bool(raw, "dry_run")}
    if kind == "train":
        try:
            gpus = ",".join(map(str, parse_gpus(str(raw.get("gpus", "")))))
        except ValueError as error:
            raise BadRequest(f"gpus: {error}") from None
        return {**params, "view": _view(config, raw), "exp": _name(raw.get("exp"), "exp"), "gpus": gpus,
                "batch": _int(raw, "batch", 1, 1024), "steps": _int(raw, "steps", 1, 10_000_000),
                "resume": _bool(raw, "resume"), "attach": False, "dry_run": _bool(raw, "dry_run")}
    if kind == "eval":
        gpu = _int(raw, "gpu", 0, 15)
        if gpu is None:
            raise BadRequest("gpu is required")
        checkpoints = raw.get("checkpoints")
        swap = raw.get("prompt_swap", True)
        if not isinstance(swap, bool):
            raise BadRequest("prompt_swap must be true or false")
        return {**params, "exp": _name(raw.get("exp"), "exp"), "view": _view(config, raw), "gpu": str(gpu),
                "checkpoints": _episodes(checkpoints, "checkpoints") if checkpoints else None,
                "stride": _int(raw, "stride", 1, 1000), "prompt_swap": None if swap else False,
                "dry_run": _bool(raw, "dry_run")}
    if kind == "register":
        return {**params, "exp": _name(raw.get("exp"), "exp"), "status": _text(raw, "status"),
                "method": _text(raw, "method"), "force": _bool(raw, "force")}
    if kind == "serve":
        action = raw.get("action")
        if action not in ("start", "stop"):
            raise BadRequest("action must be start or stop")
        if action == "stop":
            extra = sorted(set(raw) - {"action", "dry_run"})
            if extra:
                raise BadRequest(f"stop takes no {extra}")
            return {**params, "action": "stop", "dry_run": _bool(raw, "dry_run")}
        merged = {**(settings or {}), **{k: v for k, v in raw.items() if k in SETTINGS}}
        clean = validate_settings({k: v for k, v in merged.items() if k in SETTINGS}, config)
        effective = {"model": config.serving.model, "checkpoint": "", "gpu": config.serving.gpu,
                     "port": config.serving.port, "task": None, **clean}
        return {**params, "action": "start", "model": effective["model"],
                "checkpoint": int(effective["checkpoint"]) if effective["checkpoint"] else None,
                "gpu": effective["gpu"], "port": effective["port"], "task": effective["task"],
                "dry_run": _bool(raw, "dry_run")}
    only = raw.get("only")
    if only is not None and (not isinstance(only, list) or not only or set(only) - set(linkcheck.ITEMS)):
        raise BadRequest(f"only must be a non-empty subset of {list(linkcheck.ITEMS)}")
    return {**params, "only": list(only) if only else None}
```

Checks while implementing:
- `openpi.parse_gpus("1, 2")` gives `(1, 2)` and raises `ValueError` for `"x"` or an empty string.
- The `pull` branch returns a fresh dict so `name` never reaches the step.

- [ ] **Step 4: Run the tests**

Run: `PYTHONPATH=. "$SCRATCH/venv/bin/python" -m pytest -q test/test_job_params.py -p no:cacheprovider`
Expected: 16 passed.

- [ ] **Step 5: Ruff and commit**

```bash
cd /Users/miakho/Organizations/realman_pi/.claude/worktrees/angry-lewin-c2309a
"$SCRATCH/venv/bin/ruff" check --config config/python/ruff.toml src/training
git add src/training/realman_training/realman_training/job_params.py src/training/realman_training/test/test_job_params.py
git commit -m "feat(training): whitelist of job parameters for the web console

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: The aiohttp app — read routes, static UI, `realman-train web`

**Files:**
- Create: `src/training/realman_training/realman_training/web_server.py`
- Modify: `src/training/realman_training/realman_training/cli.py` (subcommand `web`)
- Test: `src/training/realman_training/test/test_web_server.py`

**Interfaces:**
- Consumes: everything from Tasks 2-5, `serving.status`, `jobs.JobStore`, `linkcheck.ITEMS`.
- Produces:
  - `web_server.TOKEN_ENV = "REALMAN_TRAINING_TOKEN"`, `TOKEN_HEADER = "X-Training-Token"`, `STATIC_ROOT`
  - `class TtlCache(ttl: float, clock=time.monotonic)` with `async get(compute, force=False) -> dict` (adds `at`)
  - `class Console(config, *, token="", store=None, targets=None, runner=None, serve_status=None, gpu_query=None, static_root=STATIC_ROOT, clock=time.monotonic)` with `.app() -> web.Application`, `.read_only`
  - `web_server.serve(config, host, port, token) -> None` (blocking `web.run_app`)
  - CLI: `realman-train web [--host H] [--port P]`

- [ ] **Step 1: Write the failing tests** (`test/test_web_server.py`; Task 7 appends write/WS tests to the same file)

```python
from __future__ import annotations

import asyncio
import json
from pathlib import Path

import pytest
from console_fixture import CONFIG_NAME, EXP, MODEL, build_world

from realman_training.config import load_config
from realman_training.jobs import JobStore
from realman_training.web_server import TOKEN_HEADER, Console, TtlCache

TEST_DIR = Path(__file__).resolve().parent
TOKEN = "t0k-for-tests"
RAW = "raw_realman_ts_20261016/realman__pi05-three-arm"
GPUS = {"available": True, "busy_mib": 2000, "gpus": [
    {"index": i, "name": "RTX 5090", "used_mib": 100 * i, "total_mib": 32607, "util_pct": 0, "busy": False, "users": []}
    for i in range(4)]}


class Clock:
    def __init__(self):
        self.t = 0.0

    def __call__(self):
        return self.t


@pytest.fixture()
def world(tmp_path):
    paths = build_world(tmp_path)
    config = load_config(paths["config"])
    static = tmp_path / "static"
    (static / "assets").mkdir(parents=True)
    (static / "index.html").write_text("<!doctype html><title>Training Console</title>")
    (static / "assets" / "app.js").write_text("console.log(1)")
    calls = {"serve": 0, "gpus": 0}

    def serve_status():
        calls["serve"] += 1
        return {"serve": {"running": True}, "gpu": {"index": 2}, "bridge": {"running": False}, "bt_mode": None,
                "record": {"model": MODEL}}

    def gpu_query():
        calls["gpus"] += 1
        return GPUS

    clock = Clock()

    def make(token=TOKEN, **kwargs):
        store = JobStore(config.console_dir, env={"PYTHONPATH": str(TEST_DIR)})
        targets = {kind: "fake_steps:ok" for kind in
                   ("pull", "clean", "view", "norm", "train", "eval", "register", "serve", "linkcheck")}
        return Console(config, token=token, store=store, targets=kwargs.pop("targets", targets),
                       serve_status=serve_status, gpu_query=gpu_query, static_root=kwargs.pop("static_root", static),
                       clock=clock, **kwargs)

    return {"paths": paths, "config": config, "make": make, "calls": calls, "clock": clock}


def call(console: Console, scenario):
    """Run `scenario(client)` against the app; returns what it returns."""
    from aiohttp.test_utils import TestClient, TestServer

    async def run():
        client = TestClient(TestServer(console.app()))
        await client.start_server()
        try:
            return await scenario(client)
        finally:
            await client.close()

    return asyncio.run(run())


async def get_json(client, url, status=200):
    response = await client.get(url)
    assert response.status == status, await response.text()
    return await response.json()


def test_health_says_whether_writes_are_possible(world):
    async def scenario(client):
        return await get_json(client, "/api/health")

    assert call(world["make"](), scenario)["read_only"] is False
    data = call(world["make"](token=""), scenario)
    assert data["read_only"] is True and data["ok"] is True
    assert data["data_root"] == str(world["paths"]["data"])


def test_datasets_and_one_dataset(world):
    async def scenario(client):
        listing = await get_json(client, "/api/datasets")
        detail = await get_json(client, f"/api/dataset?path={RAW}")
        bad = await get_json(client, "/api/dataset?path=../etc", status=400)
        missing = await get_json(client, "/api/dataset?path=nope", status=404)
        return listing, detail, bad, missing

    listing, detail, bad, missing = call(world["make"](), scenario)
    assert listing["root"] == str(world["paths"]["data"])
    assert {row["path"] for row in listing["datasets"]} >= {RAW, "realman_right_arm_multitask_view"}
    assert detail["suggested_drops"] == [1, 2] and detail["summary"]["episodes"] == 5
    assert "leaves data_root" in bad["error"] or "without .." in bad["error"]
    assert "no dataset" in missing["error"]


def test_runs_models_linkcheck_options(world):
    async def scenario(client):
        return (await get_json(client, "/api/runs"), await get_json(client, f"/api/runs/{CONFIG_NAME}/{EXP}"),
                await get_json(client, f"/api/runs/{CONFIG_NAME}/nope", status=404),
                await get_json(client, "/api/models"), await get_json(client, "/api/linkcheck"),
                await get_json(client, "/api/options"))

    runs, run, missing, models, history, options = call(world["make"](), scenario)
    assert MODEL in {r["name"] for r in runs["runs"]}
    assert run["metrics"]["loss"] and run["eval"]["29999"]["pick_only"]["mae"] == 0.092 and run["job"] is None
    assert "no run" in missing["error"]
    assert models["models"][0]["serving"] is True
    assert history["latest"]["ok"] is False and len(history["history"]) == 2 and history["job"] is None
    assert options["views"] == ["realman_right_arm_multitask_view"]
    assert set(options["sources"]) == {RAW, "realman__multitask_clean"}
    assert options["arms"] == ["l", "m", "r"] and options["linkcheck_items"] == ["pika", "link", "inference", "bridge"]
    assert options["configs"] == ["pi05_realman_action_only", CONFIG_NAME]


def test_serve_status_and_gpus_are_cached(world):
    console = world["make"]()

    async def scenario(client):
        first = await get_json(client, "/api/serve")
        await get_json(client, "/api/serve")
        world["clock"].t += 25
        await get_json(client, "/api/serve")
        await get_json(client, "/api/serve?refresh=1")
        gpus = await get_json(client, "/api/gpus")
        await get_json(client, "/api/gpus")
        return first, gpus

    first, gpus = call(console, scenario)
    assert first["serve"]["running"] is True and first["job"] is None and "at" in first
    assert world["calls"]["serve"] == 3 and world["calls"]["gpus"] == 1
    assert [g["index"] for g in gpus["gpus"]] == [0, 1, 2, 3]


def test_a_failing_status_provider_becomes_an_error_field(world):
    def boom():
        raise RuntimeError("docker socket missing")

    console = world["make"]()
    console._serve_status = boom

    async def scenario(client):
        return await get_json(client, "/api/serve")

    assert "docker socket missing" in call(console, scenario)["error"]


def test_serve_settings_read(world):
    async def scenario(client):
        return await get_json(client, "/api/serve/settings")

    data = call(world["make"](), scenario)
    assert data["defaults"]["model"] == MODEL and data["saved"] == {} and data["effective"]["port"] == 18000
    assert data["models"][0]["name"] == MODEL


def test_the_ui_is_served_and_a_missing_build_says_so(world, tmp_path):
    async def scenario(client):
        index = await client.get("/")
        asset = await client.get("/assets/app.js")
        escape = await client.get("/assets/../../console.yaml")
        missing_asset = await client.get("/assets/nope.js")
        return index.status, await index.text(), asset.status, await escape.text(), missing_asset.status

    status, text, asset, escape, missing_asset = call(world["make"](), scenario)
    assert (status, asset, missing_asset) == (200, 200, 404) and "Training Console" in text
    assert escape.startswith("<!doctype html>") and "training_console" not in escape

    async def missing(client):
        response = await client.get("/")
        return response.status

    assert call(world["make"](static_root=tmp_path / "nothing"), missing) == 503


def test_ttl_cache_adds_a_timestamp():
    clock = Clock()
    cache = TtlCache(5, clock)
    values = iter([{"n": 1}, {"n": 2}])

    async def scenario():
        a = await cache.get(lambda: next(values))
        b = await cache.get(lambda: next(values))
        return a, b

    a, b = asyncio.run(scenario())
    assert a["n"] == b["n"] == 1 and "at" in a
```

- [ ] **Step 2: Run to see them fail**

Run: `PYTHONPATH=. "$SCRATCH/venv/bin/python" -m pytest -q test/test_web_server.py -p no:cacheprovider`
Expected: FAIL (`ImportError: cannot import name 'web_server'`).

- [ ] **Step 3: Implement `realman_training/web_server.py`**

```python
"""The training console's HTTP server (aiohttp): read APIs, token-gated job triggers and a job-log WebSocket.

Every write is POST /api/jobs (parameters built by job_params, started through jobs.JobStore) or PUT
/api/serve/settings, and needs REALMAN_TRAINING_TOKEN in the X-Training-Token header; an empty token makes the
console read-only. Blocking work (dataset scans, nvidia-smi, ssh) runs in the default executor. The UI is the Vite
build in realman_training/static/ (website: npm run build:training).
"""

from __future__ import annotations

import asyncio
import hmac
import json
import time
from pathlib import Path
from typing import Callable

from aiohttp import web

from . import catalog, gpus as gpu_mod, job_params, linkcheck, serving
from .catalog import BadRequest, NotFound
from .config import ARMS, ConsoleConfig
from .jobs import ACTIVE, JobConflict, JobStore, now
from .runner import Runner
from .summary_cache import SummaryCache

STATIC_ROOT = Path(__file__).resolve().parent / "static"
TOKEN_ENV = "REALMAN_TRAINING_TOKEN"
TOKEN_HEADER = "X-Training-Token"
_LOG_START_BYTES = 256 * 1024  # a WebSocket starts at most this far from the end of a long log
_POLL_SEC = 0.5


class TtlCache:
    def __init__(self, ttl: float, clock: Callable[[], float] = time.monotonic):
        self._ttl, self._clock = ttl, clock
        self._value: dict | None = None
        self._at = 0.0
        self._lock = asyncio.Lock()

    async def get(self, compute: Callable[[], dict], force: bool = False) -> dict:
        async with self._lock:
            if not force and self._value is not None and self._clock() - self._at < self._ttl:
                return self._value
            value = await asyncio.get_running_loop().run_in_executor(None, compute)
            self._value, self._at = {**value, "at": now()}, self._clock()
            return self._value


def _error(status: int, message: str) -> web.Response:
    return web.json_response({"error": message}, status=status)


@web.middleware
async def _errors(request, handler):
    try:
        return await handler(request)
    except web.HTTPException:
        raise
    except BadRequest as error:
        return _error(400, str(error))
    except NotFound as error:
        return _error(404, str(error))
    except JobConflict as error:
        return _error(409, str(error))


class Console:
    def __init__(self, config: ConsoleConfig, *, token: str = "", store: JobStore | None = None,
                 targets: dict[str, str] | None = None, runner: Runner | None = None,
                 serve_status: Callable[[], dict] | None = None, gpu_query: Callable[[], dict] | None = None,
                 static_root: str | Path = STATIC_ROOT, clock: Callable[[], float] = time.monotonic):
        self.config = config
        self.token = token or ""
        self.store = store or JobStore(config.console_dir)
        self.targets = targets or {}
        runner = runner or Runner()
        self._serve_status = serve_status or (lambda: serving.status(config, runner))
        self._gpu_query = gpu_query or (lambda: gpu_mod.query(runner, busy_mib=config.openpi.gpu_busy_mib,
                                                              passwd=Path(config.web.passwd_file)))
        self.summaries = SummaryCache(config.quality)
        self.serve_cache = TtlCache(config.web.serve_status_ttl_sec, clock)
        self.gpu_cache = TtlCache(config.web.gpu_ttl_sec, clock)
        self.static_root = Path(static_root).resolve()

    @property
    def read_only(self) -> bool:
        return not self.token

    # ---- plumbing -------------------------------------------------------------------------------------------
    async def _blocking(self, function, *args):
        return await asyncio.get_running_loop().run_in_executor(None, function, *args)

    def _require_token(self, request) -> None:
        if self.read_only:
            raise web.HTTPForbidden(text=json.dumps({"error": f"read-only console: {TOKEN_ENV} is not set"}),
                                    content_type="application/json")
        given = request.headers.get(TOKEN_HEADER, "")
        if not hmac.compare_digest(given.encode(), self.token.encode()):
            raise web.HTTPUnauthorized(text=json.dumps({"error": "wrong or missing token"}),
                                       content_type="application/json")

    async def _body(self, request) -> dict:
        try:
            body = await request.json()
        except (ValueError, UnicodeDecodeError):
            raise BadRequest("the body must be JSON") from None
        if not isinstance(body, dict):
            raise BadRequest("the body must be a JSON object")
        return body

    def _running(self, kind: str, match: Callable[[dict], bool] = lambda params: True) -> dict | None:
        for job in self.store.list(kind=kind, limit=20):
            row = catalog.job_row(job)
            if row["state"] in ACTIVE and match(row["params"]):
                return row
        return None

    def app(self) -> web.Application:
        app = web.Application(client_max_size=1 << 20, middlewares=[_errors])
        r = app.router
        r.add_get("/api/health", self.health)
        r.add_get("/api/datasets", self.datasets)
        r.add_get("/api/dataset", self.dataset)
        r.add_get("/api/jobs", self.jobs)
        r.add_post("/api/jobs", self.start_job)
        r.add_get("/api/jobs/{id}", self.job)
        r.add_get("/api/jobs/{id}/log", self.job_log)
        r.add_post("/api/jobs/{id}/cancel", self.cancel_job)
        r.add_get("/api/runs", self.runs)
        r.add_get("/api/runs/{config}/{exp}", self.run)
        r.add_get("/api/models", self.models)
        r.add_get("/api/gpus", self.gpus)
        r.add_get("/api/serve", self.serve)
        r.add_get("/api/serve/settings", self.settings)
        r.add_put("/api/serve/settings", self.save_settings)
        r.add_get("/api/linkcheck", self.linkcheck)
        r.add_get("/api/options", self.options)
        r.add_get("/{path:.*}", self.static)
        return app

    # ---- reads ----------------------------------------------------------------------------------------------
    async def health(self, request):
        return web.json_response({"ok": True, "read_only": self.read_only, "data_root": str(self.config.data_root),
                                  "console_dir": str(self.config.console_dir), "time": now()})

    async def datasets(self, request):
        rows = await self._blocking(catalog.list_datasets, self.config, self.summaries)
        return web.json_response({"root": str(self.config.data_root), "datasets": rows})

    async def dataset(self, request):
        rel = request.query.get("path", "")
        return web.json_response(await self._blocking(catalog.dataset_detail, self.config, self.summaries, rel))

    async def jobs(self, request):
        kind = request.query.get("kind") or None
        try:
            limit = max(1, min(200, int(request.query.get("limit", "30"))))
        except ValueError:
            raise BadRequest("limit must be a number") from None

        def rows():
            self.store.recover()
            return [catalog.job_row(job) for job in self.store.list(kind=kind, limit=limit)]

        return web.json_response({"jobs": await self._blocking(rows)})

    def _job(self, request):
        try:
            return self.store.get(request.match_info["id"])
        except KeyError:
            raise NotFound(f"no job {request.match_info['id']}") from None

    async def job(self, request):
        job = self._job(request)
        return web.json_response({"job": catalog.job_row(job), "log": job.log_text(self.config.web.log_tail_lines)})

    async def runs(self, request):
        return web.json_response({"runs": await self._blocking(catalog.list_runs, self.config)})

    async def run(self, request):
        config_name, exp = request.match_info["config"], request.match_info["exp"]
        detail = await self._blocking(catalog.run_detail, self.config, config_name, exp)
        detail["job"] = self._running("train", lambda p: p.get("exp") == exp and p.get("config_name") == config_name)
        return web.json_response(detail)

    async def models(self, request):
        return web.json_response(await self._blocking(catalog.list_models, self.config))

    async def gpus(self, request):
        return web.json_response(await self.gpu_cache.get(self._gpu_query, force=request.query.get("refresh") == "1"))

    def _safe_serve_status(self) -> dict:
        try:
            return self._serve_status()
        except Exception as error:  # noqa: BLE001 - the page shows why the status is unknown
            return {"error": f"{type(error).__name__}: {error}"}

    async def serve(self, request):
        data = await self.serve_cache.get(self._safe_serve_status, force=request.query.get("refresh") == "1")
        return web.json_response({**data, "job": self._running("serve")})

    def _settings_payload(self) -> dict:
        return {"defaults": catalog.serve_defaults(self.config), "saved": catalog.load_settings(self.config),
                "effective": catalog.effective_settings(self.config), "models": catalog.serve_models(self.config)}

    async def settings(self, request):
        return web.json_response(await self._blocking(self._settings_payload))

    async def linkcheck(self, request):
        history = await self._blocking(catalog.linkcheck_history, self.config, self.config.web.history_limit)
        return web.json_response({"latest": history[0] if history else None, "history": history,
                                  "job": self._running("linkcheck")})

    def _options(self) -> dict:
        rows = catalog.list_datasets(self.config, self.summaries)
        base = self.config.openpi.docker_data / "checkpoints"
        configs = sorted(p.name for p in base.iterdir() if p.is_dir()) if base.is_dir() else []
        return {"prompts": self.config.prompts, "arms": list(ARMS), "default_arm": self.config.quality.arm,
                "views": [r["path"] for r in rows if r["kind"] == "view"],
                "sources": [r["path"] for r in rows if r["kind"] in ("raw", "clean")],
                "configs": configs, "linkcheck_items": list(linkcheck.ITEMS), "read_only": self.read_only}

    async def options(self, request):
        return web.json_response(await self._blocking(self._options))

    async def static(self, request):
        if request.match_info["path"].startswith("api/"):
            return _error(404, f"no route {request.path}")
        index = self.static_root / "index.html"
        if not index.is_file():
            return web.Response(status=503, text="the console UI is not built (website: npm run build:training)")
        rel = request.match_info["path"] or "index.html"
        candidate = (self.static_root / rel).resolve()
        if not candidate.is_relative_to(self.static_root):
            return _error(404, "not found")
        if candidate.is_file():
            return web.FileResponse(candidate)
        if rel.startswith("assets/"):
            return _error(404, "not found")
        return web.FileResponse(index)

    # ---- writes (Task 7) ------------------------------------------------------------------------------------
    async def start_job(self, request):
        raise web.HTTPNotImplemented()

    async def cancel_job(self, request):
        raise web.HTTPNotImplemented()

    async def save_settings(self, request):
        raise web.HTTPNotImplemented()

    async def job_log(self, request):
        raise web.HTTPNotImplemented()


def serve(config: ConsoleConfig, host: str, port: int, token: str) -> None:
    console = Console(config, token=token)
    interrupted = console.store.recover()
    mode = "read-only (no token)" if console.read_only else f"writes need the {TOKEN_HEADER} header"
    print(f"training console on http://{host}:{port} · data {config.data_root} · {mode}"
          + (f" · marked interrupted: {', '.join(interrupted)}" if interrupted else ""), flush=True)
    web.run_app(console.app(), host=host, port=port, print=None, access_log=None)
```


The client normalises `/assets/../../console.yaml` to `/console.yaml`, which is not in `static/`, so the answer is the index page; the test checks it never returns a file outside `static/`. The resolve-under-`static_root` check guards encoded traversals that reach the handler.

- [ ] **Step 4: Add `realman-train web` to `cli.py`**

In `make_parser()`, before `jobs = sub.add_parser("jobs", ...)`:

```python
    web_cmd = sub.add_parser("web", help="the web console on web.host:web.port (writes need $REALMAN_TRAINING_TOKEN)")
    web_cmd.add_argument("--host")
    web_cmd.add_argument("--port", type=int)
```

In `main()`, after `if args.command == "linkcheck": ...`:

```python
        if args.command == "web":
            import os

            from . import web_server

            web_server.serve(config, args.host or config.web.host, args.port or config.web.port,
                             os.environ.get(web_server.TOKEN_ENV, ""))
            return 0
```

Add to `test/test_cli.py`:

```python
def test_web_is_a_subcommand():
    from realman_training.cli import make_parser

    args = make_parser().parse_args(["web", "--port", "9999"])
    assert (args.command, args.port, args.host) == ("web", 9999, None)
```

- [ ] **Step 5: Run the tests**

Run: `PYTHONPATH=. "$SCRATCH/venv/bin/python" -m pytest -q test/test_web_server.py test/test_cli.py -p no:cacheprovider`
Expected: all pass.

- [ ] **Step 6: Ruff and commit**

```bash
cd /Users/miakho/Organizations/realman_pi/.claude/worktrees/angry-lewin-c2309a
"$SCRATCH/venv/bin/ruff" check --config config/python/ruff.toml src/training
git add src/training/realman_training
git commit -m "feat(training): web console read API and realman-train web

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Token-gated writes and the job-log WebSocket

**Files:**
- Modify: `src/training/realman_training/realman_training/web_server.py`
- Test: `src/training/realman_training/test/test_web_server.py` (append)

**Interfaces:**
- Consumes: `job_params.build`, `job_params.validate_settings`, `catalog.save_settings`, `JobStore.start(kind, params, target=)`, `JobStore.cancel(id)`.
- Produces: the write routes and WebSocket of the API contract.

- [ ] **Step 1: Write the failing tests** (append to `test/test_web_server.py`)

```python
def _job_body(kind="clean", **params):
    params = params or {"src": RAW, "drop": [1, 2], "reasons": {"1": "closed on nothing"}}
    return {"kind": kind, "params": params, "confirm": True}


def test_writes_need_the_token(world):
    async def scenario(client):
        none = await client.post("/api/jobs", json=_job_body())
        wrong = await client.post("/api/jobs", json=_job_body(), headers={TOKEN_HEADER: "nope"})
        settings = await client.put("/api/serve/settings", json={"gpu": 1})
        cancel = await client.post("/api/jobs/x/cancel")
        return none.status, (await none.json())["error"], wrong.status, settings.status, cancel.status

    assert call(world["make"](), scenario) == (401, "wrong or missing token", 401, 401, 401)

    async def read_only(client):
        response = await client.post("/api/jobs", json=_job_body(), headers={TOKEN_HEADER: TOKEN})
        return response.status, (await response.json())["error"]

    status, message = call(world["make"](token=""), read_only)
    assert status == 403 and "read-only" in message


def test_a_confirmed_job_starts_and_finishes(world):
    headers = {TOKEN_HEADER: TOKEN}

    async def scenario(client):
        unconfirmed = await client.post("/api/jobs", json={**_job_body(), "confirm": False}, headers=headers)
        bad = await client.post("/api/jobs", json=_job_body(src=RAW, drop=[1], rm=True), headers=headers)
        created = await client.post("/api/jobs", json=_job_body(), headers=headers)
        job = (await created.json())["job"]
        for _ in range(100):
            detail = await get_json(client, f"/api/jobs/{job['id']}")
            if detail["job"]["state"] in ("succeeded", "failed"):
                break
            await asyncio.sleep(0.1)
        listing = await get_json(client, "/api/jobs?kind=clean")
        return unconfirmed.status, bad.status, (await bad.json())["error"], created.status, job, detail, listing

    unconfirmed, bad, message, created, job, detail, listing = call(world["make"](), scenario)
    assert unconfirmed == 400 and bad == 400 and "unknown" in message
    assert created == 201 and job["kind"] == "clean"
    assert detail["job"]["state"] == "succeeded" and "hello" in detail["log"]
    assert detail["job"]["params"]["drop"] == [1, 2] and "config" not in detail["job"]["params"]
    assert detail["job"]["result"]["echo"]["src"] == str(world["paths"]["raw"])
    assert [j["id"] for j in listing["jobs"]] == [job["id"]]


def test_a_second_job_of_the_same_kind_is_refused_and_can_be_cancelled(world, tmp_path, monkeypatch):
    import realman_training.job_params as jp

    flag = tmp_path / "started"
    real = jp.build
    # fake_steps.sleep needs params["flag"], which the real whitelist refuses: add it after the whitelist.
    monkeypatch.setattr(jp, "build", lambda kind, raw, config, settings=None: {**real(kind, raw, config, settings),
                                                                               "flag": str(flag)})
    console = world["make"](targets={"pull": "fake_steps:sleep"})
    headers = {TOKEN_HEADER: TOKEN}

    async def scenario(client):
        first = await client.post("/api/jobs", json={"kind": "pull", "params": {"name": "raw_a"}, "confirm": True},
                                  headers=headers)
        job = (await first.json())["job"]
        second = await client.post("/api/jobs", json={"kind": "pull", "params": {"name": "raw_b"}, "confirm": True},
                                   headers=headers)
        cancel = await client.post(f"/api/jobs/{job['id']}/cancel", headers=headers)
        for _ in range(100):
            state = (await get_json(client, f"/api/jobs/{job['id']}"))["job"]["state"]
            if state not in ("starting", "running"):
                break
            await asyncio.sleep(0.1)
        return first.status, second.status, (await second.json())["error"], await cancel.json(), state

    first, second, message, cancel, state = call(console, scenario)
    assert first == 201 and second == 409 and "already running" in message
    assert cancel == {"cancelled": True} and state == "cancelled"


def test_serve_jobs_take_the_saved_settings(world):
    headers = {TOKEN_HEADER: TOKEN}

    async def scenario(client):
        bad = await client.put("/api/serve/settings", json={"model": "pi05_x/none"}, headers=headers)
        saved = await client.put("/api/serve/settings", json={"gpu": 3, "task": "pick_only"}, headers=headers)
        created = await client.post("/api/jobs", json={"kind": "serve", "params": {"action": "start", "dry_run": True},
                                                       "confirm": True}, headers=headers)
        return bad.status, await saved.json(), (await created.json())["job"]

    bad, saved, job = call(world["make"](), scenario)
    assert bad == 400
    assert saved["saved"] == {"gpu": 3, "task": "pick_only"} and saved["effective"]["gpu"] == 3
    assert job["params"] == {"action": "start", "model": MODEL, "checkpoint": None, "gpu": 3, "port": 18000,
                             "task": "pick_only", "dry_run": True}
    assert json.loads((world["config"].console_dir / "serve_settings.json").read_text()) == {"gpu": 3, "task": "pick_only"}


def test_the_log_websocket_streams_lines_status_and_end(world):
    headers = {TOKEN_HEADER: TOKEN}

    async def scenario(client):
        created = await client.post("/api/jobs", json=_job_body(), headers=headers)
        job = (await created.json())["job"]
        messages = []
        async with client.ws_connect(f"/api/jobs/{job['id']}/log") as ws:
            async for message in ws:
                data = json.loads(message.data)
                messages.append(data)
                if data["type"] == "end":
                    break
        missing = await client.get("/api/jobs/nope/log")
        return messages, missing.status

    messages, missing = call(world["make"](), scenario)
    lines = [line for m in messages if m["type"] == "lines" for line in m["lines"]]
    assert any("hello" in line for line in lines)
    states = [m["job"]["state"] for m in messages if m["type"] == "status"]
    assert states[-1] == "succeeded"
    assert messages[-1] == {"type": "end"}
    assert missing == 404
```

- [ ] **Step 2: Run to see them fail**

Run: `PYTHONPATH=. "$SCRATCH/venv/bin/python" -m pytest -q test/test_web_server.py -p no:cacheprovider`
Expected: the five new tests FAIL (501 Not Implemented).

- [ ] **Step 3: Implement the writes** — replace the four Task 6 stubs in `web_server.py`, add `import contextlib` after `import asyncio`, and import `FINAL` too: `from .jobs import ACTIVE, FINAL, JobConflict, JobStore, now`.

```python
    # ---- writes ---------------------------------------------------------------------------------------------
    async def start_job(self, request):
        self._require_token(request)
        body = await self._body(request)
        if body.get("confirm") is not True:
            raise BadRequest("confirm must be true: the page asks before it starts a job")
        extra = sorted(set(body) - {"kind", "params", "confirm"})
        if extra:
            raise BadRequest(f"unknown keys {extra}")
        kind = body.get("kind")
        settings = catalog.load_settings(self.config) if kind == "serve" else None
        params = await self._blocking(job_params.build, kind, body.get("params") or {}, self.config, settings)
        job = await self._blocking(lambda: self.store.start(kind, params, target=self.targets.get(kind)))
        return web.json_response({"job": catalog.job_row(job)}, status=201)

    async def cancel_job(self, request):
        self._require_token(request)
        job = self._job(request)
        return web.json_response({"cancelled": await self._blocking(self.store.cancel, job.id)})

    async def save_settings(self, request):
        self._require_token(request)
        body = await self._body(request)
        clean = await self._blocking(job_params.validate_settings, body, self.config)
        await self._blocking(catalog.save_settings, self.config, {**catalog.load_settings(self.config), **clean})
        return web.json_response(await self._blocking(self._settings_payload))

    async def job_log(self, request):
        job = self._job(request)  # 404 before the upgrade
        ws = web.WebSocketResponse(heartbeat=20)
        await ws.prepare(request)
        pump = asyncio.create_task(self._pump_log(ws, job))
        try:
            async for _ in ws:  # nothing to receive; ends when the client closes
                pass
        finally:
            pump.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await pump
        return ws

    async def _pump_log(self, ws, job) -> None:
        path = job.dir / "log.txt"
        offset = max(0, path.stat().st_size - _LOG_START_BYTES) if path.exists() else 0
        pending = b""
        last_state = None
        polls = 0
        while not ws.closed:
            if path.exists():
                with path.open("rb") as handle:
                    handle.seek(offset)
                    chunk = handle.read()
                offset += len(chunk)
                pending += chunk
                *complete, pending = pending.split(b"\n")
                if complete:
                    await ws.send_json({"type": "lines", "lines": [line.decode(errors="replace") for line in complete]})
            row = catalog.job_row(job)
            if row["state"] != last_state:
                last_state = row["state"]
                await ws.send_json({"type": "status", "job": row})
            if row["state"] in FINAL:
                if pending:
                    await ws.send_json({"type": "lines", "lines": [pending.decode(errors="replace")]})
                await ws.send_json({"type": "end"})
                await ws.close()
                return
            polls += 1
            if polls % 10 == 0:
                await self._blocking(self.store.recover)  # a dead child becomes "interrupted"
            await asyncio.sleep(_POLL_SEC)
```

`web_server` must call `job_params.build` through the module (never `from .job_params import build`): `test_a_second_job_of_the_same_kind_is_refused_and_can_be_cancelled` patches the module attribute.

- [ ] **Step 4: Run the whole suite**

Run: `PYTHONPATH=. "$SCRATCH/venv/bin/python" -m pytest -q test -p no:cacheprovider`
Expected: all pass.

- [ ] **Step 5: Ruff and commit**

```bash
cd /Users/miakho/Organizations/realman_pi/.claude/worktrees/angry-lewin-c2309a
"$SCRATCH/venv/bin/ruff" check --config config/python/ruff.toml src/training
git add src/training/realman_training
git commit -m "feat(training): token-gated job triggers, serve settings and the job-log WebSocket

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Container image and the `realman_training` compose service

**Files:**
- Create: `config/docker/training-console.Dockerfile`
- Modify: `config/docker/compose.yaml` (new service at the end of `services:`)
- Test: `src/training/realman_training/test/test_container.py`

**Interfaces:**
- Consumes: `realman-train web` (Task 6), `REALMAN_TRAINING_TOKEN`, `REALMAN_TRAINING_CONFIG`.
- Produces: image `realman-training-console:local`, container `realman_pi-realman_training-1` on :8780, started on server5090 with `docker compose --profile training up -d realman_training` from the repo checkout.

The console hands host paths to the host's docker daemon (openpi compose files, bind mounts, the console overlay) and to ssh, so every such path is mounted at the same absolute path, and the container runs as the host user with the same `HOME`.

- [ ] **Step 1: Write the failing test** (`test/test_container.py`)

```python
"""The realman_training compose service: server5090-only, same-path mounts, nvidia runtime without gpus:."""

from __future__ import annotations

from pathlib import Path

import re

import yaml

REPO = Path(__file__).resolve().parents[4]
COMPOSE = REPO / "config" / "docker" / "compose.yaml"
DOCKERFILE = REPO / "config" / "docker" / "training-console.Dockerfile"


def _service() -> dict:
    return yaml.safe_load(COMPOSE.read_text(encoding="utf-8"))["services"]["realman_training"]


def test_the_service_is_opt_in_and_uses_the_nvidia_runtime():
    service = _service()
    assert service["profiles"] == ["training"]
    assert service["runtime"] == "nvidia" and "gpus" not in service and "deploy" not in service
    assert service["pid"] == "host"
    assert service["environment"]["NVIDIA_DRIVER_CAPABILITIES"] == "utility"
    assert service["build"]["dockerfile"] == "config/docker/training-console.Dockerfile"
    assert any(str(port).endswith(":8780:8780") for port in service["ports"])


def test_host_paths_are_mounted_at_the_same_path():
    volumes = _service()["volumes"]
    assert "/var/run/docker.sock:/var/run/docker.sock" in volumes
    same = [v for v in volumes if "${TRAINING_HOME" in v or "${TRAINING_REPO" in v]
    assert len(same) >= 5
    for volume in same:
        parts = re.findall(r"\$\{[^}]*\}[^:]*|[^:]+", volume)  # ${VAR:-default} holds a colon
        assert parts[0] == parts[1], volume


def test_the_token_comes_from_the_environment_only():
    env = _service()["environment"]
    assert env["REALMAN_TRAINING_TOKEN"] == "${REALMAN_TRAINING_TOKEN:-}"
    assert env["REALMAN_TRAINING_CONFIG"].endswith("/config/training/training_console.yaml")


def test_the_image_keeps_the_repo_layout_for_config_lookup():
    text = DOCKERFILE.read_text(encoding="utf-8")
    assert "COPY src/training/realman_training /opt/realman_pi/src/training/realman_training" in text
    assert 'CMD ["python", "-m", "realman_training", "web"]' in text
```

- [ ] **Step 2: Run to see it fail**

Run: `PYTHONPATH=. "$SCRATCH/venv/bin/python" -m pytest -q test/test_container.py -p no:cacheprovider`
Expected: FAIL (`KeyError: 'realman_training'`).

- [ ] **Step 3: Write `config/docker/training-console.Dockerfile`**

```dockerfile
# Training console (src/training/realman_training) for server5090: aiohttp web UI on :8780 + the realman-train jobs.
# The docker CLI and compose plugin are bind-mounted from the host (compose service realman_training) so they match
# the daemon; nvidia-smi comes from the NVIDIA runtime. The package keeps its repo-relative path because
# realman_training.config locates the repo root from its own file.
FROM python:3.12-slim

ARG PIP_INDEX_URL=https://pypi.org/simple
ARG APT_MIRROR=
RUN if [ -n "$APT_MIRROR" ]; then sed -i "s|deb.debian.org|$APT_MIRROR|g" /etc/apt/sources.list.d/debian.sources; fi \
 && apt-get update \
 && apt-get install -y --no-install-recommends openssh-client git ca-certificates \
 && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir --index-url "$PIP_INDEX_URL" "aiohttp>=3.9" numpy pyarrow pyyaml

COPY src/training/realman_training /opt/realman_pi/src/training/realman_training
ENV PYTHONPATH=/opt/realman_pi/src/training/realman_training \
    PYTHONUNBUFFERED=1
WORKDIR /opt/realman_pi

EXPOSE 8780
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8780/api/health', timeout=4)"
CMD ["python", "-m", "realman_training", "web"]
```

The `test/` directory is copied too (small, harmless).

- [ ] **Step 4: Add the service to `config/docker/compose.yaml`** (append at the end of `services:`, after `policy_bridge`)

```yaml

  # Training console (server5090 only, never on the robot): web UI + realman-train jobs on :8780,
  # see website/docs/development/training-console-web.md. Opt-in profile, so no robot command builds or
  # starts it: `docker compose --profile training up -d realman_training`. The console hands host paths to
  # the host's docker daemon (openpi containers) and to ssh (realman_local), so they are mounted at the same
  # absolute path and the container runs as the host user with the host's HOME. Values come from .env.
  realman_training:
    profiles: [training]
    build:
      context: ../..
      dockerfile: config/docker/training-console.Dockerfile
      args:
        PIP_INDEX_URL: ${TRAINING_PIP_INDEX_URL:-https://pypi.org/simple}
        APT_MIRROR: ${TRAINING_APT_MIRROR:-}
    image: realman-training-console:local
    runtime: nvidia
    pid: host
    restart: unless-stopped
    user: "${TRAINING_UID:-1000}:${TRAINING_GID:-1000}"
    group_add: ["${TRAINING_DOCKER_GID:-984}"]
    environment:
      HOME: ${TRAINING_HOME:-/home/server5090}
      REALMAN_TRAINING_TOKEN: ${REALMAN_TRAINING_TOKEN:-}
      REALMAN_TRAINING_CONFIG: ${TRAINING_REPO:-/home/server5090/organization/realman_pi}/config/training/training_console.yaml
      NVIDIA_VISIBLE_DEVICES: all
      NVIDIA_DRIVER_CAPABILITIES: utility
    ports:
      - "${TRAINING_BIND:-0.0.0.0}:8780:8780"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /usr/bin/docker:/usr/bin/docker:ro
      - /usr/libexec/docker/cli-plugins:/usr/libexec/docker/cli-plugins:ro
      - /etc/passwd:/etc/passwd:ro
      - /etc/group:/etc/group:ro
      - ${TRAINING_HOME:-/home/server5090}/.ssh:${TRAINING_HOME:-/home/server5090}/.ssh:ro
      - ${TRAINING_HOME:-/home/server5090}/data/realman:${TRAINING_HOME:-/home/server5090}/data/realman
      - ${TRAINING_HOME:-/home/server5090}/organization/openpi:${TRAINING_HOME:-/home/server5090}/organization/openpi:ro
      - ${TRAINING_HOME:-/home/server5090}/organization/openpi-docker-data:${TRAINING_HOME:-/home/server5090}/organization/openpi-docker-data
      - ${TRAINING_REPO:-/home/server5090/organization/realman_pi}:${TRAINING_REPO:-/home/server5090/organization/realman_pi}:ro
```

- [ ] **Step 5: Check the compose file still parses for the robot services**

```bash
cd /Users/miakho/Organizations/realman_pi/.claude/worktrees/angry-lewin-c2309a
docker compose config --services 2>/dev/null | sort | head -30 || echo "no docker on this Mac: rely on the pytest"
docker compose --profile training config realman_training 2>/dev/null | head -40 || true
```

Expected (where docker exists): `realman_training` is listed only with `--profile training`; the robot services list is unchanged.

- [ ] **Step 6: Run the test**

Run: `PYTHONPATH=. "$SCRATCH/venv/bin/python" -m pytest -q test/test_container.py -p no:cacheprovider`
Expected: 4 passed.

- [ ] **Step 7: Commit**

```bash
git add config/docker/training-console.Dockerfile config/docker/compose.yaml src/training/realman_training/test/test_container.py
git commit -m "feat(training): realman_training container for server5090

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Plan-level check

- [ ] **Step 1: Whole suite, ruff, trailers**

```bash
cd /Users/miakho/Organizations/realman_pi/.claude/worktrees/angry-lewin-c2309a/src/training/realman_training
PYTHONPATH=. "$SCRATCH/venv/bin/python" -m pytest -q test -p no:cacheprovider
cd ../../..
"$SCRATCH/venv/bin/ruff" check --config config/python/ruff.toml src tools scripts docker
git log --format='%h %s%n%(trailers:key=Co-Authored-By)' a80fdab..HEAD
```

Expected: all tests pass; ruff clean; every commit shows `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` and no other model name. Fix a wrong trailer on the unpushed branch with `git rebase -x 'git commit --amend --no-edit --trailer ...'` only after checking with the controller.

- [ ] **Step 2: Smoke-run the server against the fixture world (no UI yet)**

```bash
cd /Users/miakho/Organizations/realman_pi/.claude/worktrees/angry-lewin-c2309a/src/training/realman_training
PYTHONPATH=.:test "$SCRATCH/venv/bin/python" - <<'EOF'
import asyncio, tempfile
from pathlib import Path
from aiohttp.test_utils import TestClient, TestServer
from console_fixture import build_world
from realman_training.config import load_config
from realman_training.web_server import Console
paths = build_world(Path(tempfile.mkdtemp()))
console = Console(load_config(paths["config"]), token="x", serve_status=lambda: {"serve": {}}, gpu_query=lambda: {"gpus": []})
async def main():
    client = TestClient(TestServer(console.app())); await client.start_server()
    for url in ("/api/health", "/api/datasets", "/api/runs", "/api/models", "/api/linkcheck", "/api/options", "/"):
        r = await client.get(url); print(url, r.status)
    await client.close()
asyncio.run(main())
EOF
```

Expected: every `/api/*` answers 200 and `/` answers 503 (UI not built yet — Plan 5).
