"""How the console drives openpi on server5090: `docker compose run` on the openpi repo's compose files,
the config facts read from inside the container, and the GPUs.

openpi's norm and eval scripts take a config NAME only, so each training view keeps its own openpi config;
the view is mounted at /datasets/lerobot_realman (compose.realman.yaml).
"""

from __future__ import annotations

import dataclasses
import json
import re
import shlex
from pathlib import Path

from .config import OpenpiConfig
from .datasets import DatasetSummary, summarize
from .jobs import StepFailed
from .runner import Runner

SAFE_NAME = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.-]*$")


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
