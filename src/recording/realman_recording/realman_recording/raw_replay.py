"""Inline replay for a not-yet-converted (待转换) recording session.

The :8770 replay workspace plays converted LeRobot episodes from parquet + mp4.
A pending session has neither: it only has ``state.mcap`` and per-camera JPEG
frames named ``<walltime_ns>.jpg``.  This module turns those raw files into the
same frame shape the browser already plays (``frames[].features`` + ``state`` +
per-camera frame names), so pending data is reviewed in the same workspace with
every camera and the action/state curves in sync, instead of in a popup.

Sampling is sample-and-hold on a fixed grid: each grid tick takes the latest
sample at or before it.  Before a stream's first sample the value is ``None``
(shown as a gap), never a guessed zero.  This is a review aid, not the export
alignment: the LeRobot exporter remains the only source of training data.

``build_raw_replay`` is pure and unit-tested; ``read_state_streams`` needs ROS
(rosbag2_py + message packages) and only runs inside the recording container.
"""
from __future__ import annotations

import bisect
import json
from pathlib import Path
from typing import Any, Iterable, Sequence

DEFAULT_JOINT_NAMES = tuple(f"joint_{index}" for index in range(1, 7))
DEFAULT_FPS = 15.0
MAX_FRAMES = 20_000

Sample = tuple[int, list[float]]


def _entity(topic: str) -> str:
    """Return the namespace that names a device: ``/gripper_left/position`` -> ``gripper_left``."""
    parts = [part for part in topic.split("/") if part]
    return parts[-2] if len(parts) > 1 else (parts[-1] if parts else topic)


def replay_topics(manifest: dict[str, Any]) -> dict[str, Any]:
    """Return the topic layout recorded with the session (falls back to l/m/r defaults)."""
    metadata = manifest.get("metadata") or {}
    config = metadata.get("canonical_config") or {}
    canonical = metadata.get("canonical") or {}
    arms = [str(arm) for arm in config.get("arms") or ["l", "m", "r"]]
    joint_names = [str(name) for name in canonical.get("joint_names") or DEFAULT_JOINT_NAMES]
    return {
        "arms": arms,
        "joint_names": joint_names,
        "joint_topics": [f"/{arm}/joint_states" for arm in arms],
        "arm_action_topics": [str(topic) for topic in config.get("arm_action_topics") or []],
        "arm_velocity_topics": [str(topic) for topic in config.get("arm_velocity_topics") or []],
        "gripper_position_topics": [str(topic) for topic in config.get("gripper_position_topics") or []],
        "gripper_action_topics": [str(topic) for topic in config.get("gripper_action_topics") or []],
    }


def camera_frames(session_dir: Path) -> dict[str, list[tuple[int, str]]]:
    """Return ``{camera_id: [(walltime_ns, filename), ...]}`` sorted by time.

    ``media-index.json`` is authoritative when present (written at STOP); a session
    that crashed before STOP still has ``<walltime_ns>.jpg`` names to fall back on.
    """
    videos = session_dir / "videos"
    result: dict[str, list[tuple[int, str]]] = {}
    index_path = videos / "media-index.json"
    if index_path.is_file():
        try:
            index = json.loads(index_path.read_text(encoding="utf-8"))
            for segment in index.get("segments", []):
                camera_id = str(segment["camera_id"])
                for entry in segment.get("frames", []):
                    result.setdefault(camera_id, []).append(
                        (int(entry["walltime_ns"]), Path(str(entry["path"])).name)
                    )
        except (ValueError, KeyError, TypeError):
            result = {}
    if not result and videos.is_dir():
        for camera_dir in sorted(videos.iterdir()):
            if not camera_dir.is_dir() or camera_dir.name.startswith("."):
                continue
            for path in camera_dir.glob("*.jpg"):
                try:
                    result.setdefault(camera_dir.name, []).append((int(path.stem), path.name))
                except ValueError:
                    continue
    for frames in result.values():
        frames.sort(key=lambda item: item[0])
    return {camera_id: frames for camera_id, frames in sorted(result.items()) if frames}


class _Holder:
    """Sample-and-hold lookup over one time-sorted stream."""

    def __init__(self, samples: Sequence[Sample]):
        self._times = [stamp for stamp, _ in samples]
        self._values = [value for _, value in samples]

    def at(self, stamp_ns: int) -> list[float] | None:
        position = bisect.bisect_right(self._times, stamp_ns) - 1
        return self._values[position] if position >= 0 else None


def _concat(holders: Iterable[_Holder | None], stamp_ns: int, widths: Sequence[int]) -> list[float | None] | None:
    """Concatenate per-device values; a device without data yet contributes ``None`` slots."""
    values: list[float | None] = []
    any_data = False
    for holder, width in zip(holders, widths):
        sample = holder.at(stamp_ns) if holder is not None else None
        if sample is None or len(sample) != width:
            values.extend([None] * width)
        else:
            any_data = True
            values.extend(float(item) for item in sample)
    return values if any_data else None


def build_raw_replay(
    manifest: dict[str, Any],
    streams: dict[str, list[Sample]],
    cameras: dict[str, list[tuple[int, str]]],
    *,
    fps: float = DEFAULT_FPS,
) -> dict[str, Any]:
    """Build the browser replay payload for one raw session.

    Returns ``{"fps", "frames", "cameras", "summary"}`` where each frame carries
    ``timestamp_ns`` (relative to the first tick), ``walltime_ns`` (as a string),
    ``state`` (joints then grippers, ``None`` where unknown), ``features`` and
    ``camera_frames`` (``{camera_id: filename}`` of the latest JPEG at that tick).
    """
    if not (fps > 0):
        raise ValueError("fps must be positive")
    layout = replay_topics(manifest)
    arms: list[str] = layout["arms"]
    joint_names: list[str] = layout["joint_names"]
    joint_width = len(joint_names)

    stamps = [stamp for samples in streams.values() for stamp, _ in samples[:1] + samples[-1:]]
    stamps += [stamp for frames in cameras.values() for stamp, _ in frames[:1] + frames[-1:]]
    started = manifest.get("started_realtime_ns")
    ended = manifest.get("ended_realtime_ns")
    start = int(started) if isinstance(started, int) else (min(stamps) if stamps else 0)
    end = int(ended) if isinstance(ended, int) and ended >= start else (max(stamps) if stamps else start)
    if stamps:
        # Never cut off data that was recorded slightly outside the manifest window.
        start = min(start, min(stamps))
        end = max(end, max(stamps))
    period_ns = int(round(1e9 / fps))
    count = min(MAX_FRAMES, (end - start) // period_ns + 1) if end >= start else 0
    if count == MAX_FRAMES:
        period_ns = max(period_ns, (end - start) // (MAX_FRAMES - 1) or 1)

    def holders(topics: Sequence[str]) -> list[_Holder | None]:
        return [_Holder(streams[topic]) if streams.get(topic) else None for topic in topics]

    groups: list[tuple[str, list[_Holder | None], list[int], list[str]]] = []
    joint_labels = [f"{arm}.{joint}" for arm in arms for joint in joint_names]
    groups.append(("observation.joint_position", holders(layout["joint_topics"]), [joint_width] * len(arms), joint_labels))
    gripper_ids = [_entity(topic) for topic in layout["gripper_position_topics"]]
    if gripper_ids:
        groups.append(("observation.gripper_position", holders(layout["gripper_position_topics"]), [1] * len(gripper_ids), gripper_ids))
    twist_axes = ("vx", "vy", "vz", "wx", "wy", "wz")
    if layout["arm_action_topics"]:
        labels = [f"{topic.strip('/').split('/')[0]}.{axis}" for topic in layout["arm_action_topics"] for axis in twist_axes]
        groups.append(("action.command_action", holders(layout["arm_action_topics"]), [6] * len(layout["arm_action_topics"]), labels))
    if layout["arm_velocity_topics"]:
        labels = [f"{topic.strip('/').split('/')[0]}.{axis}" for topic in layout["arm_velocity_topics"] for axis in twist_axes]
        groups.append(("action.executed_action", holders(layout["arm_velocity_topics"]), [6] * len(layout["arm_velocity_topics"]), labels))
    if layout["gripper_action_topics"]:
        labels = [_entity(topic) for topic in layout["gripper_action_topics"]]
        groups.append(("action.command.gripper", holders(layout["gripper_action_topics"]), [1] * len(labels), labels))

    camera_times = {camera_id: [stamp for stamp, _ in frames] for camera_id, frames in cameras.items()}
    frames_out: list[dict[str, Any]] = []
    for index in range(count):
        stamp = start + index * period_ns
        features: dict[str, Any] = {}
        for name, group_holders, widths, _labels in groups:
            features[name] = _concat(group_holders, stamp, widths)
        joints = features.get("observation.joint_position") or [None] * (joint_width * len(arms))
        grippers = features.get("observation.gripper_position") or [None] * len(gripper_ids)
        shown: dict[str, str | None] = {}
        for camera_id, times in camera_times.items():
            position = bisect.bisect_right(times, stamp) - 1
            # Before a camera's first frame show its first frame rather than nothing:
            # cameras start a few ms apart and a blank tile at t=0 reads as broken.
            shown[camera_id] = cameras[camera_id][max(0, position)][1]
        frames_out.append({
            "frame_index": index,
            "timestamp_ns": stamp - start,
            "walltime_ns": str(stamp),
            "state": list(joints) + list(grippers),
            "action": features.get("action.command_action") or [],
            "features": features,
            "camera_frames": shown,
        })

    summary_features = {
        name: {"dtype": "float32", "shape": [len(labels)], "names": labels}
        for name, _holders, _widths, labels in groups
    }
    present = sorted(topic for topic, samples in streams.items() if samples)
    return {
        "fps": 1e9 / period_ns,
        "frames": frames_out,
        "cameras": list(cameras),
        "camera_frame_counts": {camera_id: len(frames) for camera_id, frames in cameras.items()},
        "summary": {"features": summary_features, "canonical": {"joint_names": joint_names}},
        "topics_present": present,
        "duration_s": (end - start) / 1e9 if count else 0.0,
    }


def read_state_streams(session_dir: Path, manifest: dict[str, Any]) -> dict[str, list[Sample]]:
    """Read the replay-relevant topics from ``state.mcap`` (ROS environment only)."""
    from rclpy.serialization import deserialize_message  # type: ignore[import-not-found]
    from rosbag2_py import ConverterOptions, SequentialReader, StorageOptions  # type: ignore[import-not-found]

    from .joint_state import ordered_joint_position

    bag = session_dir / "state.mcap"
    if not bag.is_file():
        return {}
    layout = replay_topics(manifest)
    wanted = set(layout["joint_topics"]) | set(layout["arm_action_topics"]) | set(layout["arm_velocity_topics"])
    wanted |= set(layout["gripper_position_topics"]) | set(layout["gripper_action_topics"])

    classes: dict[str, Any] = {}

    def message_class(type_name: str) -> Any:
        if type_name not in classes:
            package, _, name = type_name.replace("/msg/", "/").partition("/")
            module = __import__(f"{package}.msg", fromlist=[name])
            classes[type_name] = getattr(module, name)
        return classes[type_name]

    reader = SequentialReader()
    reader.open(
        StorageOptions(uri=str(bag), storage_id="mcap"),
        ConverterOptions(input_serialization_format="cdr", output_serialization_format="cdr"),
    )
    topic_types = {meta.name: meta.type for meta in reader.get_all_topics_and_types()}
    streams: dict[str, list[Sample]] = {}
    joint_names = layout["joint_names"]
    while reader.has_next():
        topic, data, record_ns = reader.read_next()
        if topic not in wanted or topic not in topic_types:
            continue
        try:
            message = deserialize_message(data, message_class(topic_types[topic]))
            value = _extract(topic, message, joint_names, ordered_joint_position)
        except Exception:  # noqa: BLE001 - one bad sample must not hide the whole session
            continue
        if value is not None:
            streams.setdefault(topic, []).append((int(record_ns), value))
    for samples in streams.values():
        samples.sort(key=lambda item: item[0])
    return streams


def _extract(topic: str, message: Any, joint_names: Sequence[str], ordered_joint_position: Any) -> list[float] | None:
    if topic.endswith("/joint_states"):
        return list(ordered_joint_position(message.name, message.position, joint_names))
    if hasattr(message, "twist"):
        twist = message.twist
        return [twist.linear.x, twist.linear.y, twist.linear.z, twist.angular.x, twist.angular.y, twist.angular.z]
    if hasattr(message, "measured_linear_velocity_mps"):
        if not message.measured_valid:
            return None
        return [float(x) for x in message.measured_linear_velocity_mps] + [
            float(x) for x in message.measured_angular_velocity_radps
        ]
    if hasattr(message, "data"):
        return [float(message.data)]
    return None
