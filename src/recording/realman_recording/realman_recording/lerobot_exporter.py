"""LeRobot dataset export from a finalized recording session.

The exporter reads the raw ``state.mcap`` (joint/gripper/action streams) and the
per-camera JPEG archive, aligns every stream onto the camera image wall-time anchors
(the recording contract records both in the same ROS 2 SYSTEM_TIME nanosecond domain),
and writes a LeRobot-compatible dataset: ``meta/`` + ``data/*.parquet`` + ``videos/*.mp4``.

Progress is reported through an optional callback ``(done_frames, total_frames)`` so the
recorder can relay it to the web dashboard without importing any visualization stack.
"""
from __future__ import annotations

import json
from hashlib import sha256
from bisect import bisect_left
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, Sequence

import numpy as np

from .lerobot_align import AlignmentPolicy, TimedSample, align_streams
from .canonical_features import materialize_canonical_frames, validate_command_frame
from .joint_state import ordered_joint_position
from .kinematics import UrdfKinematics
from .lerobot_schema import LeRobotV3Schema, schema_from_parameters
from .lerobot_dataset_store import dataset_lock
from .provenance import verify_optional_snapshot


@dataclass(frozen=True)
class ExportRequest:
    """One finalized session's conversion parameters."""

    session_dir: Path
    output_dir: Path
    target_fps: float
    max_gap_sec: float
    schema: LeRobotV3Schema | None = None
    # The recorder snapshots this into the raw session before the MCAP writer opens.
    # An explicit path is useful for deterministic offline re-export tooling.
    urdf_path: Path | None = None
    progress_callback: Callable[[int, int], None] | None = None


class LeRobotExporter:
    """Convert a finalized session into a single-episode LeRobot dataset."""

    JOINTS_PER_ARM = 6

    # topic → (message class, value extractor). Extractor returns None to skip a topic.
    def export(self, request: ExportRequest) -> Path:
        """Write exactly one adopted raw session as one official LeRobot v3 episode.

        ``LeRobotDataset`` owns all v3 paths, parquet shards, video encoding and
        statistics.  This module deliberately has no parallel v2 writer: all exports
        use the canonical v3 schema before a model adapter derives its input fields.
        """
        if request.schema is None:
            raise ValueError("LeRobot v3 export requires an explicit schema")
        return self._export_v3(request, request.schema)

    def _export_v3(self, request: ExportRequest, schema: LeRobotV3Schema) -> Path:
        manifest = self._load_final_manifest(request.session_dir)
        verify_optional_snapshot(
            request.session_dir,
            manifest.get("metadata", {}).get("canonical", {}).get(
                "calibration", {"state": "UNAVAILABLE"}
            ),
        )
        camera_archive_quality = self._camera_archive_quality(request.session_dir)
        streams = self._read_mcap_streams(request.session_dir, schema)
        _unused_anchors, camera_frames = self._read_camera_anchors(request.session_dir)
        required = self._v3_streams(streams, schema)
        anchors = self._v3_anchors(required, camera_frames, schema, request.max_gap_sec)
        aligned = align_streams(
            anchors, {name: (samples, policy) for name, samples, policy in required},
            max_gap_ns=self._gap_ns(request.max_gap_sec),
        )
        images = self._v3_images(anchors, camera_frames, schema, self._gap_ns(request.max_gap_sec))
        image_shapes = {camera: self._jpeg_shape(frames[0][1]) for camera, frames in images.items()}
        urdf_path = self._resolve_urdf_path(request, schema)
        solvers = tuple(
            UrdfKinematics(urdf_path, schema.urdf_base_link, ee_link, schema.joint_names)
            for ee_link in schema.ee_links
        )
        canonical = materialize_canonical_frames(
            aligned, schema, solvers,
            {camera: [timestamp for timestamp, _ in frames] for camera, frames in images.items()},
        )
        with dataset_lock(request.output_dir):
            dataset = self._open_v3_dataset(request.output_dir, schema, image_shapes)
            try:
                task = str(manifest.get("metadata", {}).get("task") or "recording")
                for index, frame in enumerate(canonical):
                    payload = {
                        "observation.joint_position": np.asarray(frame.joint_position, dtype=np.float32),
                        "observation.joint_velocity": np.asarray(frame.joint_velocity, dtype=np.float32),
                        "observation.ee_pose_base": np.asarray(frame.ee_pose_base, dtype=np.float32),
                        "observation.ee_velocity_base": np.asarray(frame.ee_velocity_base, dtype=np.float32),
                        "observation.gripper_position": np.asarray(frame.gripper_position, dtype=np.float32),
                        "action.command.cartesian_velocity": np.asarray(frame.command_cartesian_velocity, dtype=np.float32),
                        "quality.valid": np.asarray([frame.valid], dtype=np.bool_),
                        "quality.sync_error_ns": np.asarray(frame.sync_error_ns, dtype=np.int64),
                        "task": task,
                    }
                    if frame.command_gripper is not None:
                        payload["action.command.gripper"] = np.asarray(frame.command_gripper, dtype=np.float32)
                    for camera_id, selected in images.items():
                        payload[f"observation.images.{camera_id}"] = self._load_rgb(selected[index][1])
                    dataset.add_frame(payload)
                    self._report(request, index + 1, len(aligned))
                episode_index = int(dataset.meta.total_episodes)
                dataset.save_episode(parallel_encoding=True)
            except BaseException:
                if dataset.has_pending_frames():
                    dataset.clear_episode_buffer()
                raise
            finally:
                # Required by the SDK: flushes metadata/parquet footers before another
                # adopted session calls resume().
                dataset.finalize()
        self._write_v3_receipt(
            request.session_dir,
            request.output_dir,
            manifest,
            schema,
            episode_index,
            anchors,
            urdf_path,
            camera_archive_quality,
        )
        self._report(request, 100, 100)
        return request.output_dir

    @staticmethod
    def _gap_ns(max_gap_sec: float) -> int:
        if max_gap_sec <= 0:
            raise ValueError("LeRobot v3 export max_gap_sec must be positive")
        return int(max_gap_sec * 1e9)

    @staticmethod
    def _v3_streams(streams: dict[str, list[TimedSample]], schema: LeRobotV3Schema) -> list[tuple[str, list[TimedSample], AlignmentPolicy]]:
        declared = ((schema.arm_joint_topics, AlignmentPolicy.LINEAR),
                    (schema.gripper_position_topics, AlignmentPolicy.FORWARD_FILL),
                    (schema.arm_action_topics, AlignmentPolicy.LINEAR),
                    (schema.gripper_action_topics, AlignmentPolicy.FORWARD_FILL))
        result = []
        for topics, policy in declared:
            for topic in topics:
                if not streams.get(topic):
                    raise ValueError(f"required LeRobot v3 stream has no samples: {topic}")
                result.append((topic, streams[topic], policy))
        return result

    @staticmethod
    def _v3_anchors(required: Sequence[tuple[str, Sequence[TimedSample], AlignmentPolicy]], camera_frames: dict[str, list[tuple[int, Path]]], schema: LeRobotV3Schema, max_gap_sec: float) -> list[int]:
        if set(camera_frames) != set(schema.camera_ids):
            raise ValueError("recorded cameras do not match the configured LeRobot v3 schema")
        if any(not camera_frames[camera] for camera in schema.camera_ids):
            raise ValueError("a required camera has no recorded JPEG frames")
        gap = int(max_gap_sec * 1e9)
        # The interval must be valid for linear / causal stream policies and have a
        # nearby image for every camera.  This produces one fixed FPS timeline, not a
        # union of the four camera timelines.
        start = max([samples[0].timestamp_ns for _, samples, _ in required] + [frames[0][0] - gap for frames in camera_frames.values()])
        end = min([samples[-1].timestamp_ns for _, samples, _ in required] + [frames[-1][0] + gap for frames in camera_frames.values()])
        step = round(1_000_000_000 / schema.fps)
        first = ((start + step - 1) // step) * step
        anchors = list(range(first, end + 1, step))
        if not anchors:
            raise ValueError("no common fixed-FPS interval for required LeRobot streams")
        return anchors

    @staticmethod
    def _v3_images(anchors: Sequence[int], camera_frames: dict[str, list[tuple[int, Path]]], schema: LeRobotV3Schema, max_gap_ns: int) -> dict[str, list[tuple[int, Path]]]:
        selected: dict[str, list[tuple[int, Path]]] = {}
        for camera in schema.camera_ids:
            frames = camera_frames[camera]
            timestamps = [timestamp for timestamp, _ in frames]
            picks: list[tuple[int, Path]] = []
            for anchor in anchors:
                right = bisect_left(timestamps, anchor)
                candidates = [candidate for candidate in (right - 1, right) if 0 <= candidate < len(frames)]
                index = min(candidates, key=lambda candidate: (abs(timestamps[candidate] - anchor), candidate))
                if abs(timestamps[index] - anchor) > max_gap_ns:
                    raise ValueError(f"camera {camera} exceeds max image skew at {anchor}")
                picks.append(frames[index])
            selected[camera] = picks
        return selected

    @staticmethod
    def _jpeg_shape(path: Path) -> tuple[int, int, int]:
        dimensions = LeRobotExporter._jpeg_dimensions(path)
        if dimensions is None:
            raise ValueError(f"unable to read JPEG dimensions: {path}")
        width, height = dimensions
        return height, width, 3

    @staticmethod
    def _load_rgb(path: Path) -> np.ndarray:
        try:
            from PIL import Image
        except ImportError as error:
            raise RuntimeError("Pillow is required for LeRobot v3 image export") from error
        with Image.open(path) as image:
            return np.asarray(image.convert("RGB"), dtype=np.uint8)

    @staticmethod
    def _open_v3_dataset(root: Path, schema: LeRobotV3Schema, image_shapes: dict[str, tuple[int, int, int]]) -> Any:
        try:
            from lerobot.datasets import LeRobotDataset
        except ImportError as error:
            raise RuntimeError("lerobot==0.6.1 is required for LeRobot v3 export") from error
        if (root / "meta" / "info.json").is_file():
            return LeRobotDataset.resume(repo_id=schema.repo_id, root=root, batch_encoding_size=1)
        root.parent.mkdir(parents=True, exist_ok=True)
        return LeRobotDataset.create(
            repo_id=schema.repo_id, root=root, fps=schema.fps,
            features=schema.features(image_shapes), robot_type=schema.embodiment_id,
            use_videos=True, batch_encoding_size=1,
        )

    @staticmethod
    def _write_v3_receipt(
        session_dir: Path,
        root: Path,
        manifest: dict[str, Any],
        schema: LeRobotV3Schema,
        episode_index: int,
        anchors: Sequence[int],
        urdf_path: Path,
        camera_archive_quality: dict[str, Any],
    ) -> None:
        receipt = {"dataset_root": str(root), "repo_id": schema.repo_id, "episode_index": episode_index,
                   "schema_fingerprint": schema.fingerprint, "frame_count": len(anchors),
                   "first_walltime_ns": anchors[0], "last_walltime_ns": anchors[-1],
                   "source_session_id": manifest.get("session_id", session_dir.name),
                   "canonical": {
                       "embodiment_id": schema.embodiment_id,
                       "joint_names": schema.joint_names,
                       "joint_limits": manifest.get("metadata", {}).get("canonical", {}).get("joint_limits", []),
                       "base_frames": schema.base_frames,
                       "ee_links": schema.ee_links,
                       "cartesian_command": {
                           "representation": schema.cartesian_command_representation,
                           "frames": schema.cartesian_command_frames,
                       },
                       "quality_sync_source_ids": schema.sync_source_ids,
                       "camera_archive_quality": camera_archive_quality,
                       "calibration": manifest.get("metadata", {}).get("canonical", {}).get(
                           "calibration", {"state": "UNKNOWN"}
                       ),
                       "urdf_path": str(urdf_path),
                       "urdf_sha256": sha256(urdf_path.read_bytes()).hexdigest(),
                       "units": {"joint_position": "rad", "joint_velocity": "rad/s", "ee_position": "m", "ee_angular_velocity": "rad/s"},
                       "generator_versions": {"joint_velocity": "finite_difference_v1", "ee_fk": "urdf_fk_v1", "ee_velocity": "quaternion_shortest_arc_v1"},
                   }}
        (session_dir / "export" / "lerobot-v3.json").write_text(json.dumps(receipt, indent=2), encoding="utf-8")

    @staticmethod
    def _camera_archive_quality(session_dir: Path) -> dict[str, Any]:
        """Read persisted JPEG queue counters for receipt provenance only.

        Older sessions lack these counters and remain exportable with an explicit
        ``UNAVAILABLE`` result. A present malformed counter is rejected so offline
        quality analysis never accepts ambiguous values.
        """
        index_path = session_dir / "videos" / "media-index.json"
        if not index_path.is_file():
            return {"state": "UNAVAILABLE"}
        index = json.loads(index_path.read_text(encoding="utf-8"))
        stats = index.get("stats") if isinstance(index, dict) else None
        if stats is None:
            return {"state": "UNAVAILABLE"}
        if not isinstance(stats, dict):
            raise ValueError("media-index stats must be an object")
        normalized: dict[str, dict[str, int]] = {}
        for camera_id, values in stats.items():
            if not isinstance(camera_id, str) or not camera_id or not isinstance(values, dict):
                raise ValueError("media-index stats contain an invalid camera entry")
            normalized_values: dict[str, int] = {}
            for name in ("accepted", "dropped", "errors"):
                value = values.get(name)
                if not isinstance(value, int) or isinstance(value, bool) or value < 0:
                    raise ValueError(f"media-index {camera_id} {name} must be a non-negative integer")
                normalized_values[name] = value
            normalized[camera_id] = normalized_values
        return {"state": "AVAILABLE", "stats": normalized}

    # ---- loading -----------------------------------------------------------

    def _load_final_manifest(self, session_dir: Path) -> dict[str, Any]:
        manifest_path = session_dir / "manifest.json"
        if not manifest_path.is_file():
            raise ValueError("session must have finalized manifest.json before export")
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        if manifest.get("state") != "READY":
            raise ValueError("only READY sessions can be exported")
        return manifest

    def _read_mcap_streams(self, session_dir: Path, schema: LeRobotV3Schema) -> dict[str, list[TimedSample]]:
        """Read every recorded topic into ``{topic: [TimedSample]}` ordered by time."""
        from rosbag2_py import ConverterOptions, SequentialReader, StorageOptions  # type: ignore[import-not-found]
        from rclpy.serialization import deserialize_message  # type: ignore[import-not-found]
        from geometry_msgs.msg import TwistStamped  # type: ignore[import-not-found]
        from sensor_msgs.msg import JointState  # type: ignore[import-not-found]
        from std_msgs.msg import Float64  # type: ignore[import-not-found]

        bag_uri = str(session_dir / "state.mcap")
        reader = SequentialReader()
        reader.open(
            StorageOptions(uri=bag_uri, storage_id="mcap"),
            ConverterOptions(
                input_serialization_format="cdr",
                output_serialization_format="cdr",
            ),
        )
        type_to_class = {
            "sensor_msgs/msg/JointState": JointState,
            "std_msgs/msg/Float64": Float64,
            "geometry_msgs/msg/TwistStamped": TwistStamped,
        }
        topic_types = {meta.name: meta.type for meta in reader.get_all_topics_and_types()}

        streams: dict[str, list[TimedSample]] = {}
        while reader.has_next():
            topic, data, record_ns = reader.read_next()
            message_class = type_to_class.get(topic_types.get(topic))
            if message_class is None:
                continue
            message = deserialize_message(data, message_class)
            validate_command_frame(
                topic, str(getattr(getattr(message, "header", None), "frame_id", "")),
                schema.arm_action_topics, schema.cartesian_command_frames,
            )
            value = self._extract_value(topic, message, schema.joint_names)
            if value is not None:
                streams.setdefault(topic, []).append(TimedSample(timestamp_ns=record_ns, value=value))
        return streams

    @staticmethod
    def _extract_value(topic: str, message: Any, joint_names: Sequence[str] = ()) -> Any:
        """Pull the export-relevant value out of a deserialized message, or None to skip."""
        if topic.endswith("/joint_states"):
            if not joint_names:
                raise ValueError("JointState extraction requires configured joint_names")
            return ordered_joint_position(message.name, message.position, joint_names)
        if "/cartesian_velocity/command" in topic:
            twist = message.twist
            return [twist.linear.x, twist.linear.y, twist.linear.z, twist.angular.x, twist.angular.y, twist.angular.z]
        if topic.startswith("/gripper_") and (topic.endswith("/position") or topic.endswith("/command")):
            return float(message.data)
        return None

    @staticmethod
    def _resolve_urdf_path(request: ExportRequest, schema: LeRobotV3Schema) -> Path:
        """Use the session's immutable URDF snapshot, never a mutable live model."""
        candidates = [request.urdf_path, request.session_dir / "metadata" / "robot.urdf"]
        for candidate in candidates:
            if candidate is not None and candidate.is_file():
                resolved = candidate.resolve()
                manifest = json.loads((request.session_dir / "manifest.json").read_text(encoding="utf-8"))
                expected = manifest.get("metadata", {}).get("canonical", {}).get("urdf_sha256")
                if expected:
                    actual = sha256(resolved.read_bytes()).hexdigest()
                    if actual != expected:
                        raise ValueError("recording URDF snapshot hash does not match manifest provenance")
                return resolved
        raise ValueError(
            "recording session has no URDF snapshot; re-record after canonical provenance is enabled"
        )

    @staticmethod
    def _jpeg_dimensions(path: Path) -> tuple[int, int] | None:
        """Return ``(width, height)`` from a JPEG SOF marker without decoding pixels."""
        try:
            data = path.read_bytes()[:65536]
        except OSError:
            return None
        index = 2
        while index + 9 < len(data):
            if data[index] != 0xFF:
                index += 1
                continue
            marker = data[index + 1]
            if marker in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
                height = int.from_bytes(data[index + 5 : index + 7], "big")
                width = int.from_bytes(data[index + 7 : index + 9], "big")
                return width, height
            index += 2 + int.from_bytes(data[index + 2 : index + 4], "big")
        return None

    def _read_camera_anchors(self, session_dir: Path) -> tuple[list[int], dict[str, list[tuple[int, Path]]]]:
        """Return the merged image anchor timeline and per-camera ``(wall_ns, path)`` frames."""
        index_path = session_dir / "videos" / "media-index.json"
        if not index_path.is_file():
            raise ValueError("session is missing videos/media-index.json")
        index = json.loads(index_path.read_text(encoding="utf-8"))
        anchors: list[int] = []
        camera_frames: dict[str, list[tuple[int, Path]]] = {}
        for segment in index.get("segments", []):
            camera_id = segment["camera_id"]
            frames: list[tuple[int, Path]] = []
            for entry in segment.get("frames", []):
                wall_ns = int(entry["walltime_ns"])
                frames.append((wall_ns, session_dir / "videos" / entry["path"]))
                anchors.append(wall_ns)
            camera_frames.setdefault(camera_id, []).extend(frames)
        for frames in camera_frames.values():
            frames.sort(key=lambda item: item[0])
        return sorted(set(anchors)), camera_frames

    def _report(self, request: ExportRequest, done: int, total: int) -> None:
        if request.progress_callback is not None:
            request.progress_callback(done, total)


def main(args: list[str] | None = None) -> int:
    import argparse

    parser = argparse.ArgumentParser(description="Export one finalized recording session to LeRobot")
    parser.add_argument("session_dir", type=Path)
    parser.add_argument("--output-dir", type=Path, default=None)
    parser.add_argument("--target-fps", type=float, default=10.0)
    parser.add_argument("--max-gap-sec", type=float, default=2.0)
    parsed = parser.parse_args(args)

    session_dir = parsed.session_dir.expanduser().resolve()
    output_dir = (parsed.output_dir or session_dir / "export" / "lerobot").expanduser().resolve()
    manifest = json.loads((session_dir / "manifest.json").read_text(encoding="utf-8"))
    metadata = manifest.get("metadata", {})
    config = metadata.get("canonical_config", {})
    canonical = metadata.get("canonical", {})
    schema = schema_from_parameters(
        repo_id=str(config.get("repo_id", "realman/pi05-three-arm")), fps=parsed.target_fps,
        arms=config.get("arms", ["l", "m", "r"]),
        arm_action_topics=config.get("arm_action_topics", []),
        gripper_position_topics=config.get("gripper_position_topics", []),
        gripper_action_topics=config.get("gripper_action_topics", []),
        camera_ids=config.get("camera_ids", []),
        joint_names=canonical.get("joint_names", [f"joint_{index}" for index in range(1, 7)]),
        embodiment_id=canonical.get("embodiment_id", "realman-rm65-b-three-arm-v1"),
        urdf_package=canonical.get("urdf_package", "rm65_description"),
        urdf_relative_path=canonical.get("urdf_relative_path", "urdf/RM65-B.urdf"),
        urdf_base_link=canonical.get("urdf_base_link", "base_link"),
        base_frames=canonical.get("base_frames", ["l/base_link", "m/base_link", "r/base_link"]),
        ee_links=canonical.get("ee_links", ["link_6", "link_6", "link_6"]),
        cartesian_command_representation=canonical.get("cartesian_command_representation", "velocity"),
        cartesian_command_frames=canonical.get("cartesian_command_frames", ["l/base_link", "m/base_link", "r/base_link"]),
    )
    LeRobotExporter().export(
        ExportRequest(
            session_dir=session_dir,
            output_dir=output_dir,
            target_fps=parsed.target_fps,
            max_gap_sec=parsed.max_gap_sec,
            schema=schema,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
