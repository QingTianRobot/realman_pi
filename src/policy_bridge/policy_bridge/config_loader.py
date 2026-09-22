"""Configuration loading and startup validation for policy_bridge_node.

The bridge is a pure protocol converter: every ROS topic name it reads or
publishes comes from this configuration. The loader expands ``${ENV:-default}``
placeholders, builds typed dataclasses, and enforces the startup rules from the
design spec. Topic *existence* is intentionally NOT validated here so the bridge
can start before drivers are up (a missing producer just yields "not ready").
"""

from __future__ import annotations

from dataclasses import dataclass, field
import os
from pathlib import Path
import re
from typing import Any

import yaml


_ENV_RE = re.compile(r"\$\{([A-Za-z_][A-Za-z0-9_]*)(?::-([^}]*))?\}")

_VALID_POSE_FORMATS = ("xyz_euler", "xyz_quat_xyzw")
_VALID_POSITION_UNITS = ("m", "mm")
_VALID_ANGLE_UNITS = ("rad", "deg")
_VALID_SYNC_MODES = ("approximate", "latest", "exact")
_VALID_INTERNAL_STATES = ("velocity", "position", "inactive")


class ConfigError(RuntimeError):
    """Raised when the configuration is missing, malformed, or inconsistent."""


def _expand_env(node: Any) -> Any:
    """Recursively replace ``${VAR}`` / ``${VAR:-default}`` in strings."""
    if isinstance(node, dict):
        return {key: _expand_env(value) for key, value in node.items()}
    if isinstance(node, list):
        return [_expand_env(value) for value in node]
    if isinstance(node, str):
        return _ENV_RE.sub(
            lambda m: os.environ.get(m.group(1), m.group(2) or ""), node
        )
    return node


def _require(mapping: dict, key: str, context: str) -> Any:
    if not isinstance(mapping, dict) or key not in mapping:
        raise ConfigError(f"{context}: missing required field '{key}'")
    return mapping[key]


def _as_float(value: Any, context: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ConfigError(f"{context}: expected a number, got {value!r}")
    return float(value)


def _positive_float(value: Any, context: str) -> float:
    number = _as_float(value, context)
    if number <= 0.0:
        raise ConfigError(f"{context}: must be strictly positive, got {number}")
    return number


@dataclass(frozen=True)
class ReconnectBackoff:
    initial_s: float
    max_s: float
    factor: float


@dataclass(frozen=True)
class NetworkConfig:
    server_host: str
    server_port: int
    connect_timeout_s: float
    infer_timeout_s: float
    reconnect_backoff: ReconnectBackoff
    inference_threads: int

    @property
    def url(self) -> str:
        return f"ws://{self.server_host}:{self.server_port}"


@dataclass(frozen=True)
class ImageTopic:
    name: str
    topic: str
    encoding: str
    resize: tuple[int, int] | None
    enabled: bool


@dataclass(frozen=True)
class ImageSyncConfig:
    mode: str
    slop_s: float


@dataclass(frozen=True)
class StateConfig:
    joint_state_topics: dict[str, str]
    gripper_position_topics: dict[str, str]
    gripper_config: str
    expected_dim: int


@dataclass(frozen=True)
class ObservationConfig:
    image_topics: tuple[ImageTopic, ...]
    image_sync: ImageSyncConfig
    state: StateConfig


@dataclass(frozen=True)
class PromptConfig:
    initial: str
    topic: str
    on_change_clear_queue: bool


@dataclass(frozen=True)
class ActionConfig:
    action_horizon: int
    action_dim: int
    steps_per_inference: int
    inference_lead_steps: int
    action_clip: tuple[float, float]


@dataclass(frozen=True)
class TwistScale:
    linear: float
    angular: float


@dataclass(frozen=True)
class VelocityDownlink:
    twist_scale: TwistScale
    frame_ids: dict[str, str]


@dataclass(frozen=True)
class PositionDownlink:
    pose_format: str
    position_unit: str
    angle_unit: str
    frame_ids: dict[str, str]


@dataclass(frozen=True)
class GripperDownlink:
    topic_left: str
    topic_right: str
    clamp: tuple[float, float]
    smoothing_alpha: float


@dataclass(frozen=True)
class DownlinkConfig:
    command_namespace: str
    publish_rate_hz: float
    smoothing_alpha: float
    velocity: VelocityDownlink
    position: PositionDownlink
    gripper: GripperDownlink


@dataclass(frozen=True)
class ModeMapping:
    velocity_modes: frozenset[str]
    position_modes: frozenset[str]
    inactive_modes: frozenset[str]


@dataclass(frozen=True)
class ModeConfig:
    topic: str
    mapping: ModeMapping
    default_when_unknown: str


@dataclass(frozen=True)
class LifecycleConfig:
    activate: str
    deactivate: str
    emergency_stop: str
    set_prompt: str
    force_infer: str


@dataclass(frozen=True)
class StatsConfig:
    topic: str
    publish_period_s: float
    failure_pause_threshold: int


@dataclass(frozen=True)
class PolicyBridgeConfig:
    arm_names: tuple[str, ...]
    network: NetworkConfig
    observation: ObservationConfig
    prompt: PromptConfig
    action: ActionConfig
    downlink: DownlinkConfig
    mode: ModeConfig
    lifecycle: LifecycleConfig
    stats: StatsConfig
    source_path: str = field(default="")


def _parse_pair(value: Any, context: str) -> tuple[float, float]:
    if not isinstance(value, (list, tuple)) or len(value) != 2:
        raise ConfigError(f"{context}: expected a 2-element [min, max] list")
    low = _as_float(value[0], f"{context}[0]")
    high = _as_float(value[1], f"{context}[1]")
    if low > high:
        raise ConfigError(f"{context}: min ({low}) must be <= max ({high})")
    return (low, high)


def _parse_frame_ids(raw: Any, context: str, arm_names: tuple[str, ...]) -> dict[str, str]:
    if not isinstance(raw, dict):
        raise ConfigError(f"{context}: frame_ids must be a mapping")
    frames: dict[str, str] = {}
    for side in ("left", "right"):
        value = raw.get(side)
        if not isinstance(value, str) or not value:
            raise ConfigError(f"{context}: frame_ids.{side} must be a non-empty string")
        frames[side] = value
    return frames


def _parse_network(raw: dict) -> NetworkConfig:
    ctx = "network"
    backoff_raw = _require(raw, "reconnect_backoff", ctx)
    backoff = ReconnectBackoff(
        initial_s=_positive_float(_require(backoff_raw, "initial_s", f"{ctx}.reconnect_backoff"), f"{ctx}.reconnect_backoff.initial_s"),
        max_s=_positive_float(_require(backoff_raw, "max_s", f"{ctx}.reconnect_backoff"), f"{ctx}.reconnect_backoff.max_s"),
        factor=_positive_float(_require(backoff_raw, "factor", f"{ctx}.reconnect_backoff"), f"{ctx}.reconnect_backoff.factor"),
    )
    if backoff.max_s < backoff.initial_s:
        raise ConfigError(f"{ctx}.reconnect_backoff: max_s must be >= initial_s")
    port = _require(raw, "server_port", ctx)
    if isinstance(port, bool) or not isinstance(port, int) or not 1 <= port <= 65535:
        raise ConfigError(f"{ctx}.server_port must be an integer in 1..65535")
    threads = raw.get("inference_threads", 1)
    if isinstance(threads, bool) or not isinstance(threads, int) or threads < 1:
        raise ConfigError(f"{ctx}.inference_threads must be an integer >= 1")
    host = _require(raw, "server_host", ctx)
    if not isinstance(host, str) or not host:
        raise ConfigError(f"{ctx}.server_host must be a non-empty string")
    return NetworkConfig(
        server_host=host,
        server_port=port,
        connect_timeout_s=_positive_float(_require(raw, "connect_timeout_s", ctx), f"{ctx}.connect_timeout_s"),
        infer_timeout_s=_positive_float(_require(raw, "infer_timeout_s", ctx), f"{ctx}.infer_timeout_s"),
        reconnect_backoff=backoff,
        inference_threads=threads,
    )


def _parse_observation(raw: dict) -> ObservationConfig:
    ctx = "observation"
    images_raw = _require(raw, "image_topics", ctx)
    if not isinstance(images_raw, list) or not images_raw:
        raise ConfigError(f"{ctx}.image_topics must be a non-empty list")
    images: list[ImageTopic] = []
    names: set[str] = set()
    for index, item in enumerate(images_raw):
        item_ctx = f"{ctx}.image_topics[{index}]"
        name = _require(item, "name", item_ctx)
        topic = _require(item, "topic", item_ctx)
        if not isinstance(name, str) or not name:
            raise ConfigError(f"{item_ctx}.name must be a non-empty string")
        if name in names:
            raise ConfigError(f"{item_ctx}.name duplicated: {name!r}")
        names.add(name)
        if not isinstance(topic, str) or not topic:
            raise ConfigError(f"{item_ctx}.topic must be a non-empty string")
        resize_raw = item.get("resize")
        resize: tuple[int, int] | None = None
        if resize_raw not in (None, [], ()):
            if not isinstance(resize_raw, (list, tuple)) or len(resize_raw) != 2:
                raise ConfigError(f"{item_ctx}.resize must be a 2-element [H, W] list or empty")
            resize = (int(resize_raw[0]), int(resize_raw[1]))
        images.append(
            ImageTopic(
                name=name,
                topic=topic,
                encoding=str(item.get("encoding", "rgb8")),
                resize=resize,
                enabled=bool(item.get("enabled", False)),
            )
        )
    if not any(image.enabled for image in images):
        raise ConfigError(f"{ctx}.image_topics: at least one entry must have enabled=true")

    sync_raw = raw.get("image_sync", {}) or {}
    sync_mode = str(sync_raw.get("mode", "approximate"))
    if sync_mode not in _VALID_SYNC_MODES:
        raise ConfigError(f"{ctx}.image_sync.mode must be one of {_VALID_SYNC_MODES}")
    sync = ImageSyncConfig(
        mode=sync_mode,
        slop_s=_positive_float(sync_raw.get("slop_s", 0.05), f"{ctx}.image_sync.slop_s"),
    )

    state_raw = _require(raw, "state", ctx)
    joints = state_raw.get("joint_state_topics", {})
    gripper_topics = state_raw.get("gripper_position_topics", {})
    if not isinstance(joints, dict) or not joints:
        raise ConfigError(f"{ctx}.state.joint_state_topics must be a non-empty mapping")
    if not isinstance(gripper_topics, dict) or not gripper_topics:
        raise ConfigError(f"{ctx}.state.gripper_position_topics must be a non-empty mapping")
    gripper_config = state_raw.get("gripper_config", "")
    if not isinstance(gripper_config, str) or not gripper_config:
        raise ConfigError(f"{ctx}.state.gripper_config must be a non-empty path")
    expected_dim = _require(raw, "state_expected_dim", ctx)
    if isinstance(expected_dim, bool) or not isinstance(expected_dim, int) or expected_dim != 7:
        raise ConfigError(f"{ctx}.state_expected_dim must be the integer 7 (6 cartesian/joint + 1 gripper)")
    state = StateConfig(
        joint_state_topics={str(k): str(v) for k, v in joints.items()},
        gripper_position_topics={str(k): str(v) for k, v in gripper_topics.items()},
        gripper_config=gripper_config,
        expected_dim=expected_dim,
    )
    return ObservationConfig(image_topics=tuple(images), image_sync=sync, state=state)


def _parse_prompt(raw: dict) -> PromptConfig:
    ctx = "prompt"
    topic = raw.get("topic", "")
    if topic and (not isinstance(topic, str)):
        raise ConfigError(f"{ctx}.topic must be a string")
    return PromptConfig(
        initial=str(raw.get("initial", "")),
        topic=str(topic),
        on_change_clear_queue=bool(raw.get("on_change_clear_queue", True)),
    )


def _parse_action(raw: dict) -> ActionConfig:
    ctx = "action"

    def _pos_int(key: str) -> int:
        value = _require(raw, key, ctx)
        if isinstance(value, bool) or not isinstance(value, int) or value < 1:
            raise ConfigError(f"{ctx}.{key} must be an integer >= 1")
        return value

    horizon = _pos_int("action_horizon")
    dim = _pos_int("action_dim")
    if dim != 7:
        raise ConfigError(f"{ctx}.action_dim must be 7 (6 cartesian + 1 gripper) in phase 1")
    steps = _pos_int("steps_per_inference")
    if steps > horizon:
        raise ConfigError(f"{ctx}.steps_per_inference must be <= action_horizon")
    lead = raw.get("inference_lead_steps", 0)
    if isinstance(lead, bool) or not isinstance(lead, int) or lead < 0:
        raise ConfigError(f"{ctx}.inference_lead_steps must be an integer >= 0")
    clip = _parse_pair(_require(raw, "action_clip", ctx), f"{ctx}.action_clip")
    return ActionConfig(
        action_horizon=horizon,
        action_dim=dim,
        steps_per_inference=steps,
        inference_lead_steps=lead,
        action_clip=clip,
    )


def _parse_downlink(raw: dict, arm_names: tuple[str, ...]) -> DownlinkConfig:
    ctx = "downlink"
    namespace = _require(raw, "command_namespace", ctx)
    if not isinstance(namespace, str) or not namespace.startswith("/"):
        raise ConfigError(f"{ctx}.command_namespace must be a string starting with '/'")
    rate = _positive_float(_require(raw, "publish_rate_hz", ctx), f"{ctx}.publish_rate_hz")
    alpha = _as_float(_require(raw, "smoothing_alpha", ctx), f"{ctx}.smoothing_alpha")
    if not 0.0 < alpha <= 1.0:
        raise ConfigError(f"{ctx}.smoothing_alpha must be in (0, 1], got {alpha}")

    vel_raw = _require(raw, "velocity", ctx)
    scale_raw = _require(vel_raw, "twist_scale", f"{ctx}.velocity")
    velocity = VelocityDownlink(
        twist_scale=TwistScale(
            linear=_positive_float(_require(scale_raw, "linear", f"{ctx}.velocity.twist_scale"), f"{ctx}.velocity.twist_scale.linear"),
            angular=_positive_float(_require(scale_raw, "angular", f"{ctx}.velocity.twist_scale"), f"{ctx}.velocity.twist_scale.angular"),
        ),
        frame_ids=_parse_frame_ids(_require(vel_raw, "frame_ids", f"{ctx}.velocity"), f"{ctx}.velocity", arm_names),
    )

    pos_raw = raw.get("position", {}) or {}
    pose_format = str(pos_raw.get("pose_format", "xyz_euler"))
    if pose_format not in _VALID_POSE_FORMATS:
        raise ConfigError(f"{ctx}.position.pose_format must be one of {_VALID_POSE_FORMATS}")
    position_unit = str(pos_raw.get("position_unit", "m"))
    if position_unit not in _VALID_POSITION_UNITS:
        raise ConfigError(f"{ctx}.position.position_unit must be one of {_VALID_POSITION_UNITS}")
    angle_unit = str(pos_raw.get("angle_unit", "rad"))
    if angle_unit not in _VALID_ANGLE_UNITS:
        raise ConfigError(f"{ctx}.position.angle_unit must be one of {_VALID_ANGLE_UNITS}")
    position = PositionDownlink(
        pose_format=pose_format,
        position_unit=position_unit,
        angle_unit=angle_unit,
        frame_ids=_parse_frame_ids(_require(pos_raw, "frame_ids", f"{ctx}.position"), f"{ctx}.position", arm_names),
    )

    grip_raw = _require(raw, "gripper", ctx)
    grip_alpha = _as_float(grip_raw.get("smoothing_alpha", alpha), f"{ctx}.gripper.smoothing_alpha")
    if not 0.0 < grip_alpha <= 1.0:
        raise ConfigError(f"{ctx}.gripper.smoothing_alpha must be in (0, 1], got {grip_alpha}")
    gripper = GripperDownlink(
        topic_left=str(_require(grip_raw, "topic_left", f"{ctx}.gripper")),
        topic_right=str(_require(grip_raw, "topic_right", f"{ctx}.gripper")),
        clamp=_parse_pair(grip_raw.get("clamp", [0.0, 1.0]), f"{ctx}.gripper.clamp"),
        smoothing_alpha=grip_alpha,
    )
    return DownlinkConfig(
        command_namespace=namespace,
        publish_rate_hz=rate,
        smoothing_alpha=alpha,
        velocity=velocity,
        position=position,
        gripper=gripper,
    )


def _parse_mode(raw: dict) -> ModeConfig:
    ctx = "mode"
    topic = _require(raw, "topic", ctx)
    if not isinstance(topic, str) or not topic:
        raise ConfigError(f"{ctx}.topic must be a non-empty string")
    mapping_raw = _require(raw, "mapping", ctx)

    def _mode_set(key: str) -> frozenset[str]:
        value = mapping_raw.get(key, [])
        if not isinstance(value, list):
            raise ConfigError(f"{ctx}.mapping.{key} must be a list of mode strings")
        for item in value:
            if not isinstance(item, str) or not item:
                raise ConfigError(f"{ctx}.mapping.{key} entries must be non-empty strings")
        return frozenset(value)

    velocity = _mode_set("velocity_modes")
    position = _mode_set("position_modes")
    inactive = _mode_set("inactive_modes")
    overlaps = (velocity & position) | (velocity & inactive) | (position & inactive)
    if overlaps:
        raise ConfigError(f"{ctx}.mapping: mode sets must not overlap, overlapping={sorted(overlaps)}")
    default = str(mapping_raw.get("default_when_unknown", raw.get("default_when_unknown", "inactive")))
    if default not in _VALID_INTERNAL_STATES:
        raise ConfigError(f"{ctx}.default_when_unknown must be one of {_VALID_INTERNAL_STATES}")
    return ModeConfig(
        topic=topic,
        mapping=ModeMapping(velocity_modes=velocity, position_modes=position, inactive_modes=inactive),
        default_when_unknown=default,
    )


def _parse_lifecycle(raw: dict) -> LifecycleConfig:
    ctx = "lifecycle.services"
    services = _require(raw, "services", "lifecycle")
    return LifecycleConfig(
        activate=str(_require(services, "activate", ctx)),
        deactivate=str(_require(services, "deactivate", ctx)),
        emergency_stop=str(_require(services, "emergency_stop", ctx)),
        set_prompt=str(_require(services, "set_prompt", ctx)),
        force_infer=str(_require(services, "force_infer", ctx)),
    )


def _parse_stats(raw: dict) -> StatsConfig:
    ctx = "stats"
    raw = raw or {}
    threshold = raw.get("failure_pause_threshold", 5)
    if isinstance(threshold, bool) or not isinstance(threshold, int) or threshold < 1:
        raise ConfigError(f"{ctx}.failure_pause_threshold must be an integer >= 1")
    return StatsConfig(
        topic=str(raw.get("topic", "/policy/stats")),
        publish_period_s=_positive_float(raw.get("publish_period_s", 1.0), f"{ctx}.publish_period_s"),
        failure_pause_threshold=threshold,
    )


def parse_config(document: dict, source_path: str = "") -> PolicyBridgeConfig:
    """Build a validated :class:`PolicyBridgeConfig` from an expanded mapping."""
    if not isinstance(document, dict):
        raise ConfigError("configuration root must be a mapping")
    arm_names_raw = document.get("arm_names", ["l", "r"])
    if not isinstance(arm_names_raw, list) or not arm_names_raw:
        raise ConfigError("arm_names must be a non-empty list")
    arm_names = tuple(str(name) for name in arm_names_raw)
    for name in arm_names:
        if not re.fullmatch(r"[A-Za-z][A-Za-z0-9_]*", name):
            raise ConfigError(f"arm_names entry invalid: {name!r}")

    return PolicyBridgeConfig(
        arm_names=arm_names,
        network=_parse_network(_require(document, "network", "root")),
        observation=_parse_observation(_require(document, "observation", "root")),
        prompt=_parse_prompt(document.get("prompt", {}) or {}),
        action=_parse_action(_require(document, "action", "root")),
        downlink=_parse_downlink(_require(document, "downlink", "root"), arm_names),
        mode=_parse_mode(_require(document, "mode", "root")),
        lifecycle=_parse_lifecycle(_require(document, "lifecycle", "root")),
        stats=_parse_stats(document.get("stats", {}) or {}),
        source_path=source_path,
    )


def load(path: str | Path) -> PolicyBridgeConfig:
    """Load, expand, and validate the authoritative YAML configuration."""
    path = Path(path)
    if not path.is_file():
        raise ConfigError(f"configuration file not found: {path}")
    try:
        document = yaml.safe_load(path.read_text(encoding="utf-8"))
    except yaml.YAMLError as error:  # pragma: no cover - parse errors surface verbatim
        raise ConfigError(f"invalid YAML in {path}: {error}") from error
    if document is None:
        raise ConfigError(f"configuration file is empty: {path}")
    return parse_config(_expand_env(document), source_path=str(path))
