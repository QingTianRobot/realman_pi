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
class ServingConfig:
    """openpi-serve on server5090 and policy_bridge on realman_ts: the two ends of the inference chain."""

    project: str = "openpi-serve"
    service: str = "openpi"  # container <project>-<service>-1
    compose_files: tuple[str, ...] = ("~/organization/openpi/compose.yaml", "~/data/realman/compose.serve.yaml")
    model: str = "pi05_realman_multitask_action_only/m_multitask_b16_2gpu"  # <openpi config>/<exp>
    checkpoint: str = ""  # "" = the latest numbered checkpoint of the run
    gpu: int = 2
    port: int = 18000  # must equal network.server_port of the robot's policy_bridge.yaml
    container_port: int = 8000  # serve_policy listens on 0.0.0.0:8000 inside; OPENPI_POLICY_PORT maps the host port
    start_timeout_sec: int = 600  # loading the checkpoint before the port listens
    warmup_rounds: int = 2  # the first inference after a restart JIT-compiles ~26 s
    warmup_timeout_sec: int = 180
    robot_repo: str = "~/realman_pi"  # on realman_ts
    bridge_service: str = "policy_bridge"
    bridge_container: str = "realman_pi-policy_bridge-1"
    bridge_config: str = "config/ros/policy_bridge.yaml"  # relative to robot_repo
    bridge_start_timeout_sec: int = 90
    ros_container: str = "realman_pi-realman_bringup_remote-1"  # any running ROS container on the robot's domain
    ros_setup: str = "source /opt/ros/humble/setup.bash && source /opt/rm65_ws/install/setup.bash"
    server_host: str = ""  # address the bridge uses for server5090; "" = what realman_ts sees in $SSH_CLIENT
    mode_wait_sec: float = 10.0  # input_mode_state is not published at a fixed high rate
    policy_modes: tuple[str, ...] = ("policy",)


@dataclasses.dataclass(frozen=True)
class LinkcheckConfig:
    """Data-path checks; thresholds from the 2026-10-14..10-19 live runs."""

    pika_node_prefix: str = "pika_"
    wifi_interface: str = ""  # "" = the first wl* interface of realman_ts
    wifi_window_sec: float = 5.0
    wifi_max_kb_per_sec: float = 600.0  # the Pika locator flood measured ~2600
    bulk_bytes: int = 16 << 20
    bulk_min_mb_per_sec: float = 2.0
    ping_count: int = 10
    ping_size: int = 1400  # small pings pass even when bulk TCP has collapsed
    ping_max_avg_ms: float = 50.0
    ping_max_loss_pct: float = 5.0
    infer_rounds: int = 5  # timed rounds after one untimed connect-and-warm round
    infer_max_ms: float = 200.0  # median round trip from realman_ts
    stats_timeout_sec: float = 5.0


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


@dataclasses.dataclass(frozen=True)
class ConsoleConfig:
    data_root: Path = dataclasses.field(default_factory=lambda: Path("~/data/realman").expanduser())
    state_dir: Path | None = None
    quality: QualityConfig = dataclasses.field(default_factory=QualityConfig)
    remote: RemoteConfig = dataclasses.field(default_factory=RemoteConfig)
    openpi: OpenpiConfig = dataclasses.field(default_factory=OpenpiConfig)
    serving: ServingConfig = dataclasses.field(default_factory=ServingConfig)
    linkcheck: LinkcheckConfig = dataclasses.field(default_factory=LinkcheckConfig)
    web: WebConfig = dataclasses.field(default_factory=WebConfig)
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


_ALLOWED_TOP_KEYS = {"data_root", "state_dir", "quality", "remote", "openpi", "serving", "linkcheck", "web", "prompts"}


def load_config(path: str | Path | None = None) -> ConsoleConfig:
    source = (Path(path) if path else default_config_path()).resolve()
    document = yaml.safe_load(source.read_text(encoding="utf-8")) or {}
    section = document.get("training_console") if isinstance(document, dict) else None
    if not isinstance(section, dict):
        raise ValueError(f"{source}: missing the training_console section")
    unknown = sorted(set(section) - _ALLOWED_TOP_KEYS)
    if unknown:
        raise ValueError(f"{source}: unknown training_console keys {unknown}; allowed: {sorted(_ALLOWED_TOP_KEYS)}")
    quality = _parse(QualityConfig, section.get("quality") or {}, source, "quality")
    _validate(quality, source)
    remote = _parse(RemoteConfig, section.get("remote") or {}, source, "remote")
    openpi = _parse(OpenpiConfig, section.get("openpi") or {}, source, "openpi")
    overlay = openpi.compose_overlay or Path("openpi-console.compose.yaml")
    openpi = dataclasses.replace(openpi, compose_overlay=overlay if overlay.is_absolute() else source.parent / overlay)
    serving = _parse(ServingConfig, section.get("serving") or {}, source, "serving")
    linkcheck = _parse(LinkcheckConfig, section.get("linkcheck") or {}, source, "linkcheck")
    _validate_serving(serving, linkcheck, source)
    web = _parse(WebConfig, section.get("web") or {}, source, "web")
    _validate_web(web, source)
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
        serving=serving,
        linkcheck=linkcheck,
        web=web,
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


def _validate_serving(s: ServingConfig, lc: LinkcheckConfig, source: Path) -> None:
    def fail(key: str, why: str) -> None:
        raise ValueError(f"{source}: {key} {why}")

    if not 1 <= s.port <= 65535:
        fail("serving.port", "must be in 1..65535")
    if not 0 <= s.container_port <= 65535:
        fail("serving.container_port", "must be in 0..65535 (0 = same as port)")
    if s.gpu < 0:
        fail("serving.gpu", "must be a GPU index >= 0")
    if s.warmup_rounds < 1:
        fail("serving.warmup_rounds", "must be at least 1")
    if s.model.count("/") != 1:
        fail("serving.model", "must be <openpi config>/<exp>")
    if not s.compose_files:
        fail("serving.compose_files", "must list at least one compose file")
    for key in ("wifi_window_sec", "wifi_max_kb_per_sec", "bulk_min_mb_per_sec", "infer_max_ms", "stats_timeout_sec"):
        if getattr(lc, key) <= 0:
            fail(f"linkcheck.{key}", "must be positive")
    for key in ("bulk_bytes", "ping_count", "infer_rounds"):
        if getattr(lc, key) < 1:
            fail(f"linkcheck.{key}", "must be at least 1")


def _validate_web(w: WebConfig, source: Path) -> None:
    if not 1 <= w.port <= 65535:
        raise ValueError(f"{source}: web.port must be in 1..65535")
    for key in ("serve_status_ttl_sec", "gpu_ttl_sec"):
        if getattr(w, key) <= 0:
            raise ValueError(f"{source}: web.{key} must be positive")
    for key in ("log_tail_lines", "history_limit"):
        if getattr(w, key) < 1:
            raise ValueError(f"{source}: web.{key} must be at least 1")
