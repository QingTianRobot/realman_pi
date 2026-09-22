"""Offline Rerun replay of a finalized recording session.

Reads only a successfully exported LeRobot dataset and re-emits its observations on a
Rerun timeline. Raw ``state.mcap`` and ``videos/`` are exporter inputs/audit artifacts,
never a formal replay source. This tool never opens a ROS graph or touches any recorder
in-memory object, so it can run long after the recorder has shut down.

ROS (``rosbag2_py``/``rclpy``) and the Rerun SDK are imported lazily inside ``run`` so
the pure helpers — session validation, media-index parsing, range/camera selection and
topic classification — remain importable and testable without either dependency.
"""
from __future__ import annotations

import argparse
import json
import math
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Sequence


@dataclass(frozen=True)
class ReplayOptions:
    """Bound, validated CLI inputs for one replay run."""

    session_dir: Path
    start_ns: int | None = None
    end_ns: int | None = None
    speed: float = 1.0
    cameras: tuple[str, ...] = ()
    spawn_viewer: bool = True

    def __post_init__(self) -> None:
        if self.speed <= 0:
            raise ValueError("speed must be positive")
        if self.start_ns is not None and self.end_ns is not None and self.start_ns > self.end_ns:
            raise ValueError("start_ns must not exceed end_ns")


@dataclass(frozen=True)
class MediaSegment:
    """One video segment parsed from ``videos/media-index.json``."""

    camera_id: str
    path: str
    started_wall_ns: int
    ended_wall_ns: int
    format: str = "video"
    frames: tuple[tuple[str, int], ...] = ()

    def __post_init__(self) -> None:
        if not self.camera_id or not self.path:
            raise ValueError("media segment requires camera_id and path")
        if self.started_wall_ns < 0 or self.ended_wall_ns < self.started_wall_ns:
            raise ValueError("media segment has an invalid wall-time range")
        if Path(self.path).is_absolute() or ".." in Path(self.path).parts:
            raise ValueError("media segment path must be relative to session/videos")
        if self.format not in {"video", "jpeg_frames"}:
            raise ValueError("unsupported media segment format")


def validate_session(session_dir: Path) -> dict:
    """Return the finalized manifest iff the session is replayable.

    A replayable session is adopted and has a successful LeRobot export. Anything else
    is rejected rather than falling back to raw MCAP/JPEG artifacts.
    """
    manifest_path = session_dir / "manifest.json"
    if not manifest_path.is_file():
        raise ValueError("session has no finalized manifest.json")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if not isinstance(manifest, dict) or manifest.get("state") != "READY":
        raise ValueError("only READY sessions can be replayed")
    if manifest.get("decision") != "ADOPTED":
        raise ValueError("only ADOPTED sessions can be replayed")
    export = manifest.get("export")
    if not isinstance(export, dict) or export.get("state") != "SUCCEEDED":
        raise ValueError("session has no successful LeRobot export")
    result = export.get("result")
    dataset_root = Path(result).expanduser() if isinstance(result, str) and result else session_dir / "export" / "lerobot"
    if not dataset_root.is_dir():
        raise ValueError("successful LeRobot export directory is missing")
    return manifest


def parse_media_index(session_dir: Path) -> list[MediaSegment]:
    """Parse the session's media index; an absent index means a camera-less session."""
    index_path = session_dir / "videos" / "media-index.json"
    if not index_path.is_file():
        return []
    payload = json.loads(index_path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict) or not isinstance(payload.get("segments"), list):
        raise ValueError("media-index.json must be an object with a segments list")
    segments: list[MediaSegment] = []
    for item in payload["segments"]:
        if not isinstance(item, dict):
            raise ValueError("media segment must be an object")
        frame_entries = item.get("frames", [])
        if not isinstance(frame_entries, list):
            raise ValueError("media segment frames must be a list")
        segments.append(
            MediaSegment(
                camera_id=str(item["camera_id"]),
                path=str(item["path"]),
                started_wall_ns=int(item["started_wall_ns"]),
                ended_wall_ns=int(item["ended_wall_ns"]),
                format=str(item.get("format", "video")),
                frames=tuple((str(frame["path"]), int(frame["walltime_ns"])) for frame in frame_entries),
            )
        )
    return segments


def select_segments(
    segments: Sequence[MediaSegment],
    *,
    start_ns: int | None = None,
    end_ns: int | None = None,
    cameras: Sequence[str] = (),
) -> list[MediaSegment]:
    """Keep segments overlapping the wall-time range and the requested camera ids."""
    chosen = set(cameras)
    out: list[MediaSegment] = []
    for segment in segments:
        if chosen and segment.camera_id not in chosen:
            continue
        if start_ns is not None and segment.ended_wall_ns < start_ns:
            continue
        if end_ns is not None and segment.started_wall_ns > end_ns:
            continue
        out.append(segment)
    return out


def classify_topic(topic: str, type_name: str) -> tuple[str, str] | None:
    """Return ``(kind, subject)`` for a recorded topic, or ``None`` to skip it.

    ``kind`` is one of ``joint``, ``connection``, ``coordinates``, ``gripper_position``,
    ``gripper_torque``, ``gripper_alarm``, ``arm_action`` or ``tf``.  ``subject`` is the
    arm name for per-arm topics and the full topic string for free-form gripper/action
    topics.  Unknown topics are skipped rather than erroring, so a bag that records an
    extra input never breaks replay.
    """
    parts = topic.split("/")
    if not parts or parts[0] != "":
        return None  # recording topics are always absolute
    if len(parts) == 3:
        arm, leaf = parts[1], parts[2]
        if leaf == "joint_states":
            return ("joint", arm)
        if leaf == "connected":
            return ("connection", arm)
    if len(parts) == 4 and parts[2] == "coordinates" and parts[3] == "state":
        return ("coordinates", parts[1])
    if topic == "/tf":
        return ("tf", "")
    if type_name == "geometry_msgs/msg/TwistStamped":
        return ("arm_action", topic)
    if type_name == "std_msgs/msg/Float64":
        return ("gripper_position", topic)
    if type_name == "std_msgs/msg/Int32":
        return ("gripper_alarm", topic)
    if type_name == "std_msgs/msg/Bool":
        return ("gripper_torque", topic)
    return None


class ReplayPlayer:
    """Re-emit one finalized session's observations onto a Rerun timeline."""

    def __init__(self, options: ReplayOptions, *, rerun_module: Any | None = None) -> None:
        self._options = options
        self._manifest = validate_session(options.session_dir)
        export = self._manifest["export"]
        result = export.get("result")
        self._dataset_root = Path(result).expanduser() if isinstance(result, str) and result else options.session_dir / "export" / "lerobot"
        self._segments = select_segments(
            parse_media_index(options.session_dir),
            start_ns=options.start_ns,
            end_ns=options.end_ns,
            cameras=options.cameras,
        )
        # Injectable for tests; resolved from the installed rerun-sdk in run().
        self._rerun = rerun_module

    def run(self) -> None:
        rerun = self._resolve_rerun()
        rerun.init("realman_recording_replay", spawn=self._options.spawn_viewer)
        try:
            self._replay_lerobot_dataset(rerun)
        finally:
            disconnect = getattr(rerun, "disconnect", None)
            if callable(disconnect):
                disconnect()

    def _replay_lerobot_dataset(self, rerun: Any) -> None:
        """Replay canonical fields through the same fixed LeRobot SDK used to write them."""
        try:
            from lerobot.datasets import LeRobotDataset
        except ImportError as error:
            raise RuntimeError("lerobot==0.6.1 is required for offline replay") from error
        receipt_path = self._options.session_dir / "export" / "lerobot-v3.json"
        if not receipt_path.is_file():
            raise ValueError("session is missing its canonical LeRobot export receipt")
        receipt = json.loads(receipt_path.read_text(encoding="utf-8"))
        try:
            repo_id = str(receipt["repo_id"])
            first_walltime_ns = int(receipt["first_walltime_ns"])
            episode_index = int(receipt["episode_index"])
        except (KeyError, TypeError, ValueError) as error:
            raise ValueError("LeRobot export receipt has no valid timeline provenance") from error
        dataset = LeRobotDataset(repo_id=repo_id, root=self._dataset_root, episodes=[episode_index])
        self._emit_summary(rerun)
        previous_walltime: int | None = None
        for index in range(len(dataset)):
            frame = dataset[index]
            walltime_ns = first_walltime_ns + round(index * 1_000_000_000 / dataset.fps)
            if self._options.start_ns is not None and walltime_ns < self._options.start_ns:
                continue
            if self._options.end_ns is not None and walltime_ns > self._options.end_ns:
                break
            self._pace(walltime_ns, previous_walltime)
            previous_walltime = walltime_ns
            rerun.set_time_nanos("wall_time", walltime_ns)
            self._emit_canonical_frame(rerun, frame)

    def _emit_canonical_frame(self, rerun: Any, frame: dict[str, Any]) -> None:
        """Log one LeRobot frame without assuming a model-specific state/action vector."""
        scalar_features = (
            "observation.joint_position", "observation.joint_velocity",
            "observation.ee_pose_base", "observation.ee_velocity_base",
            "observation.gripper_position", "action.command.cartesian_velocity",
            "action.command.gripper", "quality.sync_error_ns",
        )
        for feature in scalar_features:
            if feature in frame:
                rerun.log(f"recording/canonical/{feature.replace('.', '/')}", rerun.Scalars(self._as_list(frame[feature])))
        if "quality.valid" in frame:
            rerun.log("recording/canonical/quality/valid", rerun.Scalars(self._as_list(frame["quality.valid"])))
        for key, value in frame.items():
            if not key.startswith("observation.images."):
                continue
            camera = key.removeprefix("observation.images.")
            if self._options.cameras and camera not in self._options.cameras:
                continue
            image = getattr(rerun, "Image", None)
            if callable(image):
                rerun.log(f"recording/cameras/{camera}/image", image(self._as_image(value)))

    @staticmethod
    def _as_list(value: Any) -> list[float | int | bool]:
        """Convert tensor/ndarray/list feature values without importing a tensor stack."""
        for name in ("detach", "cpu"):
            method = getattr(value, name, None)
            if callable(method):
                value = method()
        method = getattr(value, "tolist", None)
        value = method() if callable(method) else value
        if not isinstance(value, list):
            value = [value]
        # Feature vectors are 1-D by contract; preserve booleans for quality.valid.
        return [item for item in value if isinstance(item, (float, int, bool))]

    @staticmethod
    def _as_image(value: Any) -> Any:
        """Convert torch CHW outputs to image HWC only when an array API is available."""
        for name in ("detach", "cpu", "numpy"):
            method = getattr(value, name, None)
            if callable(method):
                value = method()
        shape = getattr(value, "shape", ())
        if len(shape) == 3 and shape[0] in {1, 3, 4}:
            try:
                return value.transpose(1, 2, 0)
            except TypeError:
                return value
        return value

    def _emit_summary(self, rerun: Any) -> None:
        """Emit one-time session drop/error counters from the finalized manifest.

        These counters live only in the manifest summary (the recorder never archived
        its own status), so replay surfaces them once at the session's start anchor
        rather than re-deriving them from the bag.
        """
        summary = self._manifest.get("summary", {})
        if not isinstance(summary, dict):
            return
        started_ns = int(self._manifest.get("started_realtime_ns", 0) or 0)
        rerun.set_time_nanos("wall_time", started_ns)
        for name in ("enqueued_samples", "accepted_samples", "dropped_samples", "write_errors"):
            value = summary.get(name)
            if isinstance(value, (int, float)) and not isinstance(value, bool):
                rerun.log(f"recording/status/{name}", rerun.Scalars([value]))

    def _resolve_rerun(self) -> Any:
        if self._rerun is not None:
            return self._rerun
        try:
            import rerun  # type: ignore[import-not-found]
        except ImportError as error:
            raise RuntimeError("rerun-sdk is required for offline replay") from error
        return rerun

    def _replay_state(self, rerun: Any) -> None:
        """Read and deserialize state.mcap, emitting each observation on wall_time."""
        from rosbag2_py import ConverterOptions, SequentialReader, StorageOptions  # type: ignore[import-not-found]
        from rclpy.serialization import deserialize_message  # type: ignore[import-not-found]
        from .topic_catalog import TYPE_REGISTRY

        mcap_path = self._options.session_dir / "state.mcap"
        if not mcap_path.is_file():
            raise ValueError("session has no state.mcap")

        reader = SequentialReader()
        reader.open(
            StorageOptions(uri=str(mcap_path), storage_id="mcap"),
            ConverterOptions(
                input_serialization_format="cdr",
                output_serialization_format="cdr",
            ),
        )
        topic_types = {item.name: item.type for item in reader.get_all_topics_and_types()}

        prev_timestamp_ns: int | None = None
        while reader.has_next():
            topic, data, receipt_ns = reader.read_next()
            if self._options.start_ns is not None and receipt_ns < self._options.start_ns:
                continue
            if self._options.end_ns is not None and receipt_ns > self._options.end_ns:
                continue
            kind = classify_topic(topic, topic_types.get(topic, ""))
            if kind is None:
                continue
            message_class = TYPE_REGISTRY.get(topic_types.get(topic, ""))
            if message_class is None:
                continue
            message = deserialize_message(data, message_class)
            self._pace(receipt_ns, prev_timestamp_ns)
            prev_timestamp_ns = receipt_ns
            rerun.set_time_nanos("wall_time", receipt_ns)
            self._emit_state(rerun, kind[0], kind[1], message)

    def _emit_state(self, rerun: Any, kind: str, subject: str, message: Any) -> None:
        """Log one deserialized sample according to its topic kind.

        Only the numeric curves named in the README (joints, connection, gripper) are
        emitted.  ``coordinates`` (raw driver JSON), ``arm_action`` and ``tf`` are
        recorded for export alignment, not replay display, so they are skipped here.
        """
        if kind == "joint":
            positions = dict(zip(message.name, message.position))
            expected = [f"joint_{index}" for index in range(1, 7)]
            if all(name in positions for name in expected):
                rerun.log(
                    f"recording/arms/{subject}/joints_rad",
                    rerun.Scalars([float(positions[name]) for name in expected]),
                )
        elif kind == "connection":
            rerun.log(f"recording/arms/{subject}/connected", rerun.Scalars([int(message.data)]))
        elif kind == "gripper_position":
            rerun.log(f"recording/grippers/{_label(subject)}/position", rerun.Scalars([float(message.data)]))
        elif kind == "gripper_torque":
            rerun.log(f"recording/grippers/{_label(subject)}/torque_reached", rerun.Scalars([int(message.data)]))
        elif kind == "gripper_alarm":
            rerun.log(f"recording/grippers/{_label(subject)}/alarm", rerun.Scalars([int(message.data)]))

    def _replay_video(self, rerun: Any) -> None:
        """Log each selected video segment; a corrupt track degrades only that camera."""
        for segment in self._segments:
            try:
                self._log_segment(rerun, segment)
            except Exception:  # noqa: BLE001 - per-camera decode failure is isolated
                continue

    def _log_segment(self, rerun: Any, segment: MediaSegment) -> None:
        """Decode a segment frame-by-frame and emit compressed JPEG images.

        OpenCV is imported lazily because replay's manifest/index helpers must remain
        usable on machines without a decoder. A broken segment raises to the caller,
        where ``_replay_video`` isolates the failure to this camera track.
        """
        if segment.format == "jpeg_frames":
            self._log_jpeg_frames(rerun, segment)
            return
        import cv2  # type: ignore[import-not-found]

        path = self._media_path(segment)
        capture = cv2.VideoCapture(str(path))
        if not capture.isOpened():
            raise RuntimeError(f"unable to open video segment: {path}")
        try:
            fps = float(capture.get(cv2.CAP_PROP_FPS) or 0.0)
            if not math.isfinite(fps) or fps <= 0.0:
                raise RuntimeError(f"video segment has no valid FPS: {path}")
            frame_index = 0
            while True:
                ok, frame = capture.read()
                if not ok:
                    break
                timestamp_ns = segment.started_wall_ns + int(frame_index * 1e9 / fps)
                frame_index += 1
                if timestamp_ns > segment.ended_wall_ns:
                    break
                if timestamp_ns < (self._options.start_ns or 0):
                    continue
                if self._options.end_ns is not None and timestamp_ns > self._options.end_ns:
                    break
                encoded_ok, encoded = cv2.imencode(
                    ".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80]
                )
                if not encoded_ok:
                    continue
                rerun.set_time_nanos("wall_time", timestamp_ns)
                image = getattr(rerun, "EncodedImage", None)
                if callable(image):
                    rerun.log(
                        f"recording/cameras/{segment.camera_id}/image",
                        image(contents=encoded.tobytes(), media_type="image/jpeg"),
                    )
                else:
                    # Older SDKs can still display the decoded ndarray if EncodedImage
                    # is unavailable. This fallback is optional and never affects MCAP.
                    rerun.log(f"recording/cameras/{segment.camera_id}/image", frame)
        finally:
            capture.release()

    def _log_jpeg_frames(self, rerun: Any, segment: MediaSegment) -> None:
        """Replay exact receipt-timestamp JPEG files written by the ROS image archive."""
        for relative, timestamp_ns in segment.frames:
            if timestamp_ns < (self._options.start_ns or 0):
                continue
            if self._options.end_ns is not None and timestamp_ns > self._options.end_ns:
                break
            frame_segment = MediaSegment(segment.camera_id, relative, timestamp_ns, timestamp_ns)
            jpeg = self._media_path(frame_segment).read_bytes()
            rerun.set_time_nanos("wall_time", timestamp_ns)
            encoded_image = getattr(rerun, "EncodedImage", None)
            if callable(encoded_image):
                rerun.log(
                    f"recording/cameras/{segment.camera_id}/image",
                    encoded_image(contents=jpeg, media_type="image/jpeg"),
                )

    def _media_path(self, segment: MediaSegment) -> Path:
        """Resolve one media index path and enforce that it stays under videos/."""
        videos_root = (self._options.session_dir / "videos").resolve()
        candidate = (videos_root / segment.path).resolve()
        if candidate.parent == videos_root or videos_root in candidate.parents:
            return candidate
        raise ValueError("media segment path escapes session/videos")

    def _pace(self, receipt_ns: int, prev_timestamp_ns: int | None) -> None:
        """Sleep to honour ``--speed`` without distorting the wall_time timeline."""
        if self._options.speed == float("inf") or prev_timestamp_ns is None:
            return
        if self._options.speed <= 0 or receipt_ns <= prev_timestamp_ns:
            return
        delay = (receipt_ns - prev_timestamp_ns) / self._options.speed
        time.sleep(min(delay / 1e9, 1.0))


def _label(subject: str) -> str:
    """Compact label for a gripper topic: its own name segment, e.g. ``gripper_left``.

    Gripper topics look like ``/gripper_left/position``; the metric (``position``,
    ``torque_reached``, ``alarm``) is already carried by the topic ``kind``, so the
    label keeps only the gripper identifier to match the live adapter's entity paths.
    """
    parts = [part for part in subject.split("/") if part]
    return parts[-2] if len(parts) >= 2 else (parts[-1] if parts else subject)


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Replay one finalized recording session to Rerun")
    parser.add_argument("session_dir", help="path to a finalized recording session")
    parser.add_argument("--start-ns", type=int, default=None, help="wall-time lower bound (ns)")
    parser.add_argument("--end-ns", type=int, default=None, help="wall-time upper bound (ns)")
    parser.add_argument("--speed", type=float, default=1.0, help="playback speed multiplier")
    parser.add_argument("--camera", action="append", default=[], help="camera id to replay (repeatable)")
    parser.add_argument("--no-spawn", action="store_true", help="do not spawn the Rerun viewer")
    return parser


def main(args: Sequence[str] | None = None) -> int:
    parsed = build_arg_parser().parse_args(args)
    session_dir = Path(parsed.session_dir).expanduser().resolve()
    options = ReplayOptions(
        session_dir=session_dir,
        start_ns=parsed.start_ns,
        end_ns=parsed.end_ns,
        speed=parsed.speed,
        cameras=tuple(parsed.camera),
        spawn_viewer=not parsed.no_spawn,
    )
    ReplayPlayer(options).run()
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
