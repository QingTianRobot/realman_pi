"""How the console drives openpi on server5090: `docker compose run` on the openpi repo's compose files,
the config facts read from inside the container, and the GPUs.

openpi's norm and eval scripts take a config NAME only, so each training view keeps its own openpi config;
the view is mounted at /datasets/lerobot_realman (compose.realman.yaml).
"""

from __future__ import annotations

import dataclasses
import datetime
import json
import re
import shlex
from pathlib import Path

from .config import OpenpiConfig
from .datasets import DatasetSummary, summarize
from .jobs import StepFailed
from .runner import Completed, Runner

SAFE_NAME = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.-]*\Z")


def check_name(label: str, value: str) -> str:
    if not SAFE_NAME.match(value):
        raise StepFailed(f"{label} {value!r}: use letters, digits, '_', '-', '.'")
    return value

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

    def run(self, command: str, *, env: dict[str, str] | None = None, name: str | None = None, detach: bool = False) -> list[str]:
        argv = [*self.base(), "run", "-T", "--no-deps"]
        if detach:
            argv += ["-d"]
        if name:
            argv += ["--name", name]
        if not detach:
            argv += ["--rm"]
        for key, value in (env or {}).items():
            argv += ["-e", f"{key}={value}"]
        return [*argv, "openpi", "zsh", "-lc", CONTAINER_PREFIX + command]

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
        return runner.run(["bash", "-c", (
            f"p=$(cat {pid}) || exit 1; kill -TERM -- -$p 2>/dev/null || exit 0; "
            f"for i in $(seq {int(timeout_sec)}); do kill -0 -- -$p 2>/dev/null || exit 0; sleep 1; done; "
            f"kill -KILL -- -$p"
        )])

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


Backend = Compose | UvOpenpi


def make_backend(config: OpenpiConfig, dataset_dir: Path, gpus: tuple[int, ...] = ()) -> Backend:
    return UvOpenpi(config, dataset_dir, gpus) if config.backend == "uv" else Compose(config, dataset_dir, gpus)


@dataclasses.dataclass(frozen=True)
class ConfigInfo:
    name: str
    repo_id: str
    asset_id: str
    holdout: tuple[int, ...]
    batch_size: int
    num_train_steps: int


def config_info(runner: Runner, compose: Backend, name: str) -> ConfigInfo:
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


def short_gpus(runner: Runner, gpus: tuple[int, ...], need_mib: int) -> dict[int, int]:
    """GPUs with less than need_mib free, as {index: free MiB} (for training next to another process)."""
    out = runner.check(
        ["nvidia-smi", "-i", ",".join(map(str, gpus)), "--query-gpu=index,memory.used,memory.total",
         "--format=csv,noheader,nounits"]
    )
    short = {}
    for line in out.splitlines():
        if line.strip():
            index, used, total = (int(x) for x in line.split(","))
            if total - used < need_mib:
                short[index] = total - used
    return short


def init_weights(config: OpenpiConfig, init_from: str) -> str:
    """`<config>/<exp>/<step>` of an earlier run -> the container path of its params (checked on the host)."""
    parts = init_from.strip("/").split("/")
    if len(parts) != 3 or not parts[2].isdigit():
        raise StepFailed(f"init_from wants <config>/<exp>/<step>, got {init_from!r}")
    name, exp, step = check_name("config_name", parts[0]), check_name("exp name", parts[1]), parts[2]
    params = run_dir(config, name, exp) / step / "params"
    if not params.is_dir():
        raise StepFailed(f"no checkpoint params at {params}")
    return f"/workspace/checkpoints/{name}/{exp}/{step}/params"


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
