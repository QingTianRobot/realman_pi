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
import os
import shutil
import subprocess
from hashlib import sha256
from bisect import bisect_left, bisect_right
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
        stats.  The old private writer methods remain below temporarily only to keep
        their small parsing helpers available; this entry point never invokes them.
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
        self._write_v3_receipt(request.session_dir, request.output_dir, manifest, schema, episode_index, anchors, urdf_path)
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
    def _write_v3_receipt(session_dir: Path, root: Path, manifest: dict[str, Any], schema: LeRobotV3Schema, episode_index: int, anchors: Sequence[int], urdf_path: Path) -> None:
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
                       "calibration": manifest.get("metadata", {}).get("canonical", {}).get(
                           "calibration", {"state": "UNKNOWN"}
                       ),
                       "urdf_path": str(urdf_path),
                       "urdf_sha256": sha256(urdf_path.read_bytes()).hexdigest(),
                       "units": {"joint_position": "rad", "joint_velocity": "rad/s", "ee_position": "m", "ee_angular_velocity": "rad/s"},
                       "generator_versions": {"joint_velocity": "finite_difference_v1", "ee_fk": "urdf_fk_v1", "ee_velocity": "quaternion_shortest_arc_v1"},
                   }}
        (session_dir / "export" / "lerobot-v3.json").write_text(json.dumps(receipt, indent=2), encoding="utf-8")

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
    def _topic_groups(manifest: dict[str, Any]) -> tuple[list[str], list[str], list[str]]:
        """Return the ordered (joint, gripper, action) topic triples for one export.

        The same deterministic ordering feeds state assembly, the replay index and the
        LeRobot ``features`` contract, so every consumer agrees on the state/action layout:
        three six-axis arms followed by left/middle/right gripper positions.
        """
        topic_types = manifest.get("metadata", {}).get("topic_types", {})
        arm_topics = sorted(t for t in topic_types if "/joint_states" in t)
        gripper_topics = sorted(t for t in topic_types if t.startswith("/gripper_") and t.endswith("/position"))
        action_topics = sorted(t for t in topic_types if "/cartesian_velocity/command" in t)
        return arm_topics, gripper_topics, action_topics

    @staticmethod
    def _assemble_action(values: dict[str, Any], action_topics: list[str]) -> list[float]:
        """Concatenate velocity topics, padding absent streams with a six-value zero vector.

        Cartesian velocity is only published while the arm moves, so a static recording has
        no velocity samples. The action must stay fixed-dimensional (3 arms x 6 velocity
        components), so a missing stream contributes ``[0.0] * 6`` rather than shrinking.
        """
        out: list[float] = []
        for topic in action_topics:
            value = values.get(topic)
            if isinstance(value, (list, tuple)):
                out.extend(float(x) for x in value)
            else:
                out.extend([0.0] * 6)
        return out

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

    # ---- stream assembly ---------------------------------------------------

    def _state_action_streams(
        self, streams: dict[str, list[TimedSample]], manifest: dict[str, Any]
    ) -> list[tuple[str, list[TimedSample], AlignmentPolicy]]:
        """Map recorded topics onto the state/action streams, in a fixed arm order."""
        arm_topics, gripper_topics, action_topics = self._topic_groups(manifest)

        result: list[tuple[str, list[TimedSample], AlignmentPolicy]] = []
        for topic in arm_topics:
            if topic in streams:
                result.append((topic, streams[topic], AlignmentPolicy.LINEAR))
        for topic in gripper_topics:
            if topic in streams:
                result.append((topic, streams[topic], AlignmentPolicy.FORWARD_FILL))
        for topic in action_topics:
            if topic in streams:
                result.append((topic, streams[topic], AlignmentPolicy.LINEAR))
        return result

    @staticmethod
    def _trim_to_overlap(
        anchors_ns: Sequence[int],
        state_action: Sequence[tuple[str, Sequence[TimedSample], AlignmentPolicy]],
    ) -> list[int]:
        """Drop camera anchors no stream can bracket.

        A forward-fill stream (grippers) has no sample at or before an anchor earlier than
        its first receipt, so those anchors can never be labelled. Anchors after a stream's
        last sample would only ever hold a stale value, so both ends are trimmed to the
        widest window every stream actually covers.
        """
        if not state_action:
            return list(anchors_ns)
        first = max(samples[0].timestamp_ns for _, samples, _ in state_action)
        last = min(samples[-1].timestamp_ns for _, samples, _ in state_action)
        return [anchor for anchor in anchors_ns if first <= anchor <= last]

    def _assemble_frames(
        self,
        aligned: Sequence[Any],
        manifest: dict[str, Any],
        camera_frames: dict[str, list[tuple[int, Path]]],
        output_dir: Path,
        request: ExportRequest,
    ) -> list[dict[str, Any]]:
        """Assemble the per-frame state/action dicts and write the parquet."""
        import pyarrow as pa  # type: ignore[import-not-found]
        import pyarrow.parquet as pq  # type: ignore[import-not-found]

        arm_topics, gripper_topics, action_topics = self._topic_groups(manifest)
        camera_ids = sorted(camera_frames)
        first_ns = aligned[0].timestamp_ns if aligned else 0

        rows: list[dict[str, Any]] = []
        for index, frame in enumerate(aligned):
            row: dict[str, Any] = {
                # LeRobot uses seconds since the episode start, not an epoch timestamp.
                "timestamp": (frame.timestamp_ns - first_ns) / 1e9,
                "frame_index": index,
                "episode_index": 0,
                "index": index,
                "observation.state": [float(x) for x in self._concat(frame.values, arm_topics + gripper_topics)],
                "action": self._assemble_action(frame.values, action_topics),
            }
            for camera_id in camera_ids:
                row[f"observation.images.{camera_id}"] = f"videos/chunk-000/observation.images.{camera_id}/episode_000000.mp4"
            rows.append(row)
            self._report(request, 5 + round((index + 1) / len(aligned) * 20), 100)

        data_dir = output_dir / "data" / "chunk-000"
        data_dir.mkdir(parents=True, exist_ok=True)
        pq.write_table(pa.Table.from_pylist(rows), data_dir / "episode_000000.parquet")
        return rows

    @staticmethod
    def _concat(values: dict[str, Any], topics: list[str]) -> list[float]:
        out: list[float] = []
        for topic in topics:
            value = values.get(topic)
            if isinstance(value, (list, tuple)):
                out.extend(float(x) for x in value)
            elif value is not None:
                out.append(float(value))
        return out

    @staticmethod
    def _camera_path_at(session_dir: Path, frames: list[tuple[int, Path]], timestamp_ns: int) -> str | None:
        """Return the newest causal JPEG path for one image-anchored replay frame."""
        times = [item[0] for item in frames]
        index = bisect_right(times, timestamp_ns) - 1
        if index < 0:
            return None
        path = frames[index][1].resolve()
        root = session_dir.resolve()
        if root not in path.parents:
            raise ValueError("camera frame path escapes recording session")
        return path.relative_to(root).as_posix()

    @staticmethod
    def _link_replay_jpeg(session_dir: Path, output_dir: Path, relative: str) -> None:
        """Expose one source JPEG under the LeRobot root for the read-only browser.

        ``replay.json`` lives inside ``output_dir`` and its camera paths are resolved
        against ``lerobot_root``, so each referenced JPEG is symlinked into ``output_dir``
        at the same relative location instead of duplicating the raw archive. The symlink
        is relative so the whole tree stays relocatable across machines.
        """
        target = output_dir / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.is_symlink() and not target.exists():
            target.symlink_to(os.path.relpath(session_dir / relative, target.parent))

    def _write_replay_index(
        self,
        output_dir: Path,
        session_dir: Path,
        manifest: dict[str, Any],
        aligned: Sequence[Any],
        camera_frames: dict[str, list[tuple[int, Path]]],
    ) -> None:
        """Write the exact JPEG/state mapping used by the read-only browser timeline."""
        arm_topics, gripper_topics, action_topics = self._topic_groups(manifest)
        frames = []
        for index, frame in enumerate(aligned):
            cameras: dict[str, str] = {}
            for camera_id, entries in camera_frames.items():
                relative = self._camera_path_at(session_dir, entries, frame.timestamp_ns)
                if relative is None:
                    continue
                self._link_replay_jpeg(session_dir, output_dir, relative)
                cameras[camera_id] = relative
            frames.append(
                {
                    "frame_index": index,
                    "timestamp_ns": int(frame.timestamp_ns),
                    "state": [float(x) for x in self._concat(frame.values, arm_topics + gripper_topics)],
                    "action": self._assemble_action(frame.values, action_topics),
                    "cameras": cameras,
                }
            )
        payload = {
            "schema_version": 1,
            "session_id": manifest.get("session_id", output_dir.name),
            "base_poses": manifest.get("metadata", {}).get("base_poses", []),
            "frames": frames,
        }
        (output_dir / "replay.json").write_text(json.dumps(payload, separators=(",", ":")), encoding="utf-8")

    # ---- dataset output ----------------------------------------------------

    def _write_videos(
        self,
        anchors_ns: Sequence[int],
        camera_frames: dict[str, list[tuple[int, Path]]],
        output_dir: Path,
        fps: float,
        request: ExportRequest,
    ) -> None:
        total_cameras = len(camera_frames)
        for index, (camera_id, frames) in enumerate(camera_frames.items()):
            video_dir = output_dir / "videos" / "chunk-000" / f"observation.images.{camera_id}"
            video_dir.mkdir(parents=True, exist_ok=True)
            resampled = self._resample_camera_frames(frames, anchors_ns)
            self._jpeg_frames_to_mp4(resampled, video_dir / "episode_000000.mp4", fps)
            self._report(request, 25 + round((index + 1) / total_cameras * 65), 100)

    @staticmethod
    def _resample_camera_frames(
        frames: Sequence[tuple[int, Path]], anchors_ns: Sequence[int]
    ) -> list[tuple[int, Path]]:
        """Pick one frame per anchor so every camera video has exactly ``len(anchors)`` frames.

        Uses the latest frame at-or-before each anchor (forward-fill). An anchor earlier
        than a camera's first frame clamps to that first frame, which keeps the frame count
        identical across cameras even when one camera started a beat later than another.
        """
        if not frames:
            return []
        timestamps = [ts for ts, _ in frames]
        return [frames[max(0, bisect_right(timestamps, anchor) - 1)] for anchor in anchors_ns]

    def _jpeg_frames_to_mp4(self, frames: list[tuple[int, Path]], video_path: Path, fps: float) -> None:
        if not frames:
            return
        staging = video_path.parent / ".staging"
        staging.mkdir(parents=True, exist_ok=True)
        try:
            for index, (_, path) in enumerate(frames):
                (staging / f"frame_{index:06d}.jpg").symlink_to(path)
            subprocess.run(
                [
                    "ffmpeg", "-y", "-loglevel", "error",
                    "-framerate", str(fps),
                    "-i", str(staging / "frame_%06d.jpg"),
                    "-c:v", "libx264", "-pix_fmt", "yuv420p",
                    str(video_path),
                ],
                check=True,
                capture_output=True,
            )
        finally:
            shutil.rmtree(staging, ignore_errors=True)

    def _write_meta(
        self,
        output_dir: Path,
        manifest: dict[str, Any],
        frames: list[dict[str, Any]],
        camera_frames: dict[str, list[tuple[int, Path]]],
        target_fps: float,
    ) -> None:
        """Write LeRobot v2 metadata: ``info.json`` + ``episodes/tasks/stats``."""
        meta_dir = output_dir / "meta"
        meta_dir.mkdir(parents=True, exist_ok=True)

        states = np.asarray([row["observation.state"] for row in frames], dtype=float)
        actions = np.asarray([row["action"] for row in frames], dtype=float)

        features: dict[str, dict[str, Any]] = {
            "observation.state": {"dtype": "float32", "shape": [states.shape[1]]},
            "action": {"dtype": "float32", "shape": [actions.shape[1]]},
        }
        for camera_id, entries in sorted(camera_frames.items()):
            shape = [3, 240, 320]
            if entries:
                dims = self._jpeg_dimensions(entries[0][1])
                if dims:
                    shape = [3, dims[1], dims[0]]
            features[f"observation.images.{camera_id}"] = {
                "dtype": "video",
                "shape": shape,
                "names": ["channels", "height", "width"],
                "fps": float(target_fps),
                "codec": "h264",
                "pix_fmt": "yuv420p",
            }

        info = {
            "codebase_version": "v2.0",
            "robot_type": "realman_rm65",
            "total_episodes": 1,
            "total_frames": len(frames),
            "total_tasks": 1,
            "chunks_size": 1000,
            "data_path": "data/chunk-000",
            "video_path": "videos/chunk-000",
            "fps": float(target_fps),
            "features": features,
        }
        (meta_dir / "info.json").write_text(json.dumps(info, indent=2), encoding="utf-8")

        task = manifest.get("metadata", {}).get("task", "recording")
        episodes = [{"episode_index": 0, "length": len(frames), "tasks": [task]}]
        (meta_dir / "episodes.jsonl").write_text("\n".join(json.dumps(e) for e in episodes), encoding="utf-8")

        tasks = [{"task_index": 0, "task": task}]
        (meta_dir / "tasks.jsonl").write_text("\n".join(json.dumps(t) for t in tasks), encoding="utf-8")

        def feature_stats(values: np.ndarray) -> dict[str, Any]:
            if not len(values):
                return {"min": [], "max": [], "mean": [], "std": [], "count": 0, "p01": [], "p999": []}
            return {
                "min": values.min(axis=0).tolist(),
                "max": values.max(axis=0).tolist(),
                "mean": values.mean(axis=0).tolist(),
                "std": values.std(axis=0).tolist(),
                "count": int(len(values)),
                "p01": np.percentile(values, 0.1, axis=0).tolist(),
                "p999": np.percentile(values, 99.9, axis=0).tolist(),
            }

        stats = {
            "observation.state": feature_stats(states),
            "action": feature_stats(actions),
        }
        (meta_dir / "stats.json").write_text(json.dumps(stats, indent=2), encoding="utf-8")

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
