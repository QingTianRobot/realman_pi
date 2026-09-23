"""Read-only LeRobot v3 access for the recording dashboard.

This module is deliberately separate from the recorder and the Rerun adapter.  It
only opens a finalized LeRobot dataset after a session receipt has marked its export
as successful.  No ROS graph, MCAP reader, or recorder memory is touched.  The web
server uses it for frame metadata and on-demand JPEG decoding while the browser is in
the LeRobot replay tab.
"""
from __future__ import annotations

import io
import json
import threading
from collections import OrderedDict
from contextlib import contextmanager
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable

_REPLAY_IMAGE_SIZE = (640, 360)
_REPLAY_JPEG_QUALITY = 65


@dataclass(frozen=True)
class ReplayDatasetRef:
    """Stable public identity for one exported recording episode."""

    session_id: str
    dataset_root: Path
    repo_id: str
    episode_index: int
    first_walltime_ns: int
    fps: float
    task: str = ""
    schema_fingerprint: str = ""
    sync_source_ids: tuple[str, ...] | None = None


@dataclass
class _CachedDataset:
    """One SDK handle plus its read lock and active-reader pin count."""

    dataset: Any
    lock: Any
    active_readers: int = 0


class LeRobotReplayCatalog:
    """Discover adopted sessions and lazily cache their LeRobot dataset handles."""

    def __init__(
        self,
        recording_root: str | Path,
        export_root: str | Path,
        *,
        max_frames: int = 20_000,
        max_cached_datasets: int = 4,
        dataset_factory: Callable[[ReplayDatasetRef], Any] | None = None,
    ) -> None:
        self._recording_root = Path(recording_root).expanduser().resolve()
        self._export_root = Path(export_root).expanduser().resolve()
        if max_frames < 1:
            raise ValueError("max_frames must be positive")
        if max_cached_datasets < 1:
            raise ValueError("max_cached_datasets must be positive")
        self._max_frames = max_frames
        self._max_cached_datasets = max_cached_datasets
        self._dataset_factory = dataset_factory or self._open_dataset
        self._datasets: OrderedDict[str, _CachedDataset] = OrderedDict()
        self._datasets_lock = threading.Lock()

    def list_datasets(self) -> list[dict[str, Any]]:
        """Return only sessions with a valid ADOPTED/SUCCEEDED receipt."""
        result: list[dict[str, Any]] = []
        if not self._recording_root.is_dir():
            return result
        for directory in sorted(self._recording_root.iterdir()):
            if not directory.is_dir() or directory.name.startswith("."):
                continue
            try:
                reference = self._reference(directory.name)
                with self._dataset(reference) as dataset:
                    frame_count = len(dataset)
                    quality = self._summary(reference, dataset)["quality"]
            except (OSError, ValueError, TypeError, RuntimeError):
                # A partially written/removed session must not break the dashboard
                # list.  It remains available from the filesystem for audit.
                continue
            result.append(
                {
                    "session_id": reference.session_id,
                    "repo_id": reference.repo_id,
                    "episode_index": reference.episode_index,
                    "frames": frame_count,
                    "fps": reference.fps,
                    "task": reference.task,
                    "quality": quality,
                }
            )
        return result

    def summary(self, session_id: str) -> dict[str, Any]:
        """Return schema/provenance/quality metadata without decoding video frames."""
        reference = self._reference(session_id)
        with self._dataset(reference) as dataset:
            return self._summary(reference, dataset)

    def _summary(self, reference: ReplayDatasetRef, dataset: Any) -> dict[str, Any]:
        features: dict[str, Any] = {}
        for name, feature in getattr(dataset, "features", {}).items():
            if not isinstance(feature, dict):
                feature = {}
            features[str(name)] = {
                key: self._jsonable(feature.get(key))
                for key in ("dtype", "shape", "names")
                if feature.get(key) is not None
            }
        quality = {"valid_frames": len(dataset), "invalid_frames": 0, "max_sync_error_ns": 0}
        rows = getattr(dataset, "hf_dataset", None)
        if rows is not None:
            if hasattr(rows, "column_names"):
                valid_values = rows["quality.valid"] if "quality.valid" in rows.column_names else []
                sync_values = rows["quality.sync_error_ns"] if "quality.sync_error_ns" in rows.column_names else []
            else:
                valid_values = [row.get("quality.valid") for row in rows] if any(
                    "quality.valid" in row for row in rows
                ) else []
                sync_values = [row.get("quality.sync_error_ns") for row in rows] if any(
                    "quality.sync_error_ns" in row for row in rows
                ) else []
            valid_flags = list(valid_values)
            quality["invalid_frames"] = sum(1 for value in valid_flags if not bool(value))
            quality["valid_frames"] = len(valid_flags) - quality["invalid_frames"]
            for value in sync_values:
                values = self._numbers(value)
                if values:
                    quality["max_sync_error_ns"] = max(
                        quality["max_sync_error_ns"], max(abs(int(item)) for item in values)
                    )
        receipt_payload = json.loads(
            (self._recording_root / reference.session_id / "export" / "lerobot-v3.json").read_text(encoding="utf-8")
        )
        raw_canonical = receipt_payload.get("canonical", {}) if isinstance(receipt_payload, dict) else {}
        canonical = {
            key: raw_canonical.get(key)
            for key in (
                "embodiment_id", "joint_names", "base_frames", "ee_links", "cartesian_command",
                "units", "generator_versions", "quality_sync_source_ids",
            )
            if raw_canonical.get(key) is not None
        }
        return {
            "session_id": reference.session_id,
            "repo_id": reference.repo_id,
            "episode_index": reference.episode_index,
            "fps": reference.fps,
            "frames": len(dataset),
            "task": reference.task,
            "schema_fingerprint": reference.schema_fingerprint,
            "features": features,
            "quality": quality,
            "canonical": canonical,
        }

    def frames(self, session_id: str) -> list[dict[str, Any]]:
        """Return numeric canonical frame metadata; images stay on the JPEG endpoint."""
        reference = self._reference(session_id)
        with self._dataset(reference) as dataset:
            count = len(dataset)
            if count > self._max_frames:
                raise ValueError(f"dataset has {count} frames; replay limit is {self._max_frames}")
            row_source = getattr(dataset, "hf_dataset", None)
            camera_ids = sorted(
                str(name).removeprefix("observation.images.")
                for name in getattr(dataset, "features", {})
                if str(name).startswith("observation.images.")
            )
            scalar_feature_names = [
                str(name)
                for name in getattr(dataset, "features", {})
                if not str(name).startswith("observation.images.")
            ]
            result: list[dict[str, Any]] = []
            for index in range(count):
                row = row_source[index] if row_source is not None else dataset[index]
                frame_index = int(row.get("frame_index", index))
                state = self._numbers(row.get("observation.joint_position", []))
                state.extend(self._numbers(row.get("observation.gripper_position", [])))
                features = {
                    name: value
                    for name in scalar_feature_names
                    if (value := self._feature_value(row.get(name))) is not None
                }
                result.append(
                    {
                        "frame_index": frame_index,
                        # Reconstruct the exact integer policy grid used by the
                        # exporter. LeRobot's float timestamp can lose nanosecond
                        # precision, especially after conversion to float32.
                        "timestamp_ns": reference.first_walltime_ns
                        + frame_index * round(1_000_000_000 / reference.fps),
                        "state": state,
                        "action": self._numbers(row.get("action.command.cartesian_velocity", [])),
                        "features": features,
                        "source_timestamps_ns": self._source_timestamps_ns(
                            row, reference, frame_index
                        ),
                        "cameras": {camera_id: True for camera_id in camera_ids},
                    }
                )
            return result

    def image(self, session_id: str, frame_index: int, camera_id: str) -> bytes:
        """Decode one LeRobot video frame and return browser-ready JPEG bytes."""
        if frame_index < 0:
            raise ValueError("frame_index must be non-negative")
        reference = self._reference(session_id)
        with self._dataset(reference) as dataset:
            if frame_index >= len(dataset):
                raise ValueError("frame_index is outside the selected episode")
            key = f"observation.images.{camera_id}"
            if key not in getattr(dataset, "features", {}):
                raise ValueError("camera is not present in the selected episode")
            frame = dataset[frame_index].get(key)
        if frame is None:
            raise ValueError("camera frame is unavailable")
        return self._jpeg(frame)

    def _reference(self, session_id: str) -> ReplayDatasetRef:
        if not session_id or Path(session_id).name != session_id:
            raise ValueError("invalid session id")
        directory = (self._recording_root / session_id).resolve()
        if directory.parent != self._recording_root or not directory.is_dir():
            raise ValueError("session does not exist")
        manifest_path = directory / "manifest.json"
        receipt_path = directory / "export" / "lerobot-v3.json"
        if not manifest_path.is_file() or not receipt_path.is_file():
            raise ValueError("session has no completed LeRobot export")
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        receipt = json.loads(receipt_path.read_text(encoding="utf-8"))
        if not isinstance(manifest, dict) or manifest.get("decision") != "ADOPTED":
            raise ValueError("session is not adopted")
        export = manifest.get("export")
        if not isinstance(export, dict) or export.get("state") != "SUCCEEDED":
            raise ValueError("session export is not successful")
        root_value = receipt.get("dataset_root") or export.get("result")
        root = Path(str(root_value)).expanduser().resolve() if root_value else None
        if root is None or (root != self._export_root and self._export_root not in root.parents):
            raise ValueError("dataset root is outside configured export directory")
        try:
            episode_index = int(receipt["episode_index"])
            first_walltime_ns = int(receipt["first_walltime_ns"])
            fps = float(
                receipt.get("fps")
                or manifest.get("metadata", {}).get("canonical_config", {}).get("fps", 15.0)
            )
            if episode_index < 0 or first_walltime_ns < 0 or fps <= 0:
                raise ValueError
        except (KeyError, TypeError, ValueError) as error:
            raise ValueError("LeRobot receipt timeline is invalid") from error
        metadata = manifest.get("metadata", {})
        task = str(metadata.get("task", "")) if isinstance(metadata, dict) else ""
        canonical = receipt.get("canonical", {})
        raw_source_ids = canonical.get("quality_sync_source_ids") if isinstance(canonical, dict) else None
        source_ids: tuple[str, ...] | None = None
        if raw_source_ids is not None:
            if (
                not isinstance(raw_source_ids, list)
                or any(not isinstance(source, str) or not source for source in raw_source_ids)
                or len(set(raw_source_ids)) != len(raw_source_ids)
            ):
                raise ValueError("LeRobot receipt sync source ids are invalid")
            source_ids = tuple(raw_source_ids)
        return ReplayDatasetRef(
            session_id=session_id,
            dataset_root=root,
            repo_id=str(receipt.get("repo_id", "")),
            episode_index=episode_index,
            first_walltime_ns=first_walltime_ns,
            fps=fps,
            task=task,
            schema_fingerprint=str(receipt.get("schema_fingerprint", "")),
            sync_source_ids=source_ids,
        )

    @classmethod
    def _source_timestamps_ns(
        cls, row: dict[str, Any], reference: ReplayDatasetRef, frame_index: int
    ) -> dict[str, str]:
        """Recover exact raw source walltimes from policy-grid time and signed skew."""
        if reference.sync_source_ids is None:
            return {}
        offsets = cls._numbers(row.get("quality.sync_error_ns", []))
        if len(offsets) != len(reference.sync_source_ids):
            raise ValueError("sync error source ids do not match feature width")
        anchor_ns = reference.first_walltime_ns + frame_index * round(1_000_000_000 / reference.fps)
        result: dict[str, str] = {}
        for source_id, offset in zip(reference.sync_source_ids, offsets, strict=True):
            if isinstance(offset, bool) or not isinstance(offset, (int, float)) or int(offset) != offset:
                raise ValueError("sync errors must be integer nanoseconds")
            # JSON numbers cannot represent Unix epoch nanoseconds exactly in JS;
            # use decimal strings to keep all source timestamp bits intact.
            result[source_id] = str(anchor_ns + int(offset))
        return result

    @contextmanager
    def _dataset(self, reference: ReplayDatasetRef):
        """Pin a cached SDK handle and serialize access until the read finishes.

        Idle entries are kept in an LRU bounded by ``max_cached_datasets``.
        An entry in use cannot be evicted; under concurrent requests the cache
        may temporarily exceed the limit until those reads finish.
        """
        with self._datasets_lock:
            cached = self._datasets.get(reference.session_id)
            if cached is not None:
                self._datasets.move_to_end(reference.session_id)
            else:
                cached = _CachedDataset(self._dataset_factory(reference), threading.RLock())
                self._datasets[reference.session_id] = cached
            cached.active_readers += 1
            self._evict_idle_datasets_locked()
        try:
            with cached.lock:
                yield cached.dataset
        finally:
            with self._datasets_lock:
                cached.active_readers -= 1
                self._evict_idle_datasets_locked()

    def _evict_idle_datasets_locked(self) -> None:
        """Evict least-recently-used idle handles while over the configured cap."""
        while len(self._datasets) > self._max_cached_datasets:
            idle_session = next(
                (session_id for session_id, entry in self._datasets.items() if entry.active_readers == 0),
                None,
            )
            if idle_session is None:
                return
            del self._datasets[idle_session]

    @staticmethod
    def _open_dataset(reference: ReplayDatasetRef) -> Any:
        try:
            from lerobot.datasets import LeRobotDataset  # type: ignore[import-not-found]
        except ImportError:
            try:
                from lerobot.datasets.lerobot_dataset import LeRobotDataset  # type: ignore[import-not-found]
            except ImportError as error:
                raise RuntimeError("lerobot==0.4.4 is required for Web LeRobot replay") from error
        kwargs = {
            "repo_id": reference.repo_id,
            "root": reference.dataset_root,
            "episodes": [reference.episode_index],
            "video_backend": "pyav",
        }
        try:
            return LeRobotDataset(**kwargs)
        except TypeError:
            kwargs.pop("video_backend")
            return LeRobotDataset(**kwargs)

    @staticmethod
    def _numbers(value: Any) -> list[float | int | bool]:
        method = getattr(value, "tolist", None)
        value = method() if callable(method) else value
        if not isinstance(value, (list, tuple)):
            value = [value]
        return [item for item in value if isinstance(item, (float, int, bool))]

    @staticmethod
    def _feature_value(value: Any) -> Any:
        """Convert declared scalar/vector features to JSON-compatible values."""
        method = getattr(value, "tolist", None)
        value = method() if callable(method) else value
        if isinstance(value, bool):
            return value
        if isinstance(value, (int, float)):
            return value
        if isinstance(value, (list, tuple)):
            return [
                item
                for child in value
                if (item := LeRobotReplayCatalog._feature_value(child)) is not None
            ]
        return None

    @staticmethod
    def _jsonable(value: Any) -> Any:
        method = getattr(value, "tolist", None)
        if callable(method):
            value = method()
        if isinstance(value, tuple):
            return [LeRobotReplayCatalog._jsonable(item) for item in value]
        if isinstance(value, list):
            return [LeRobotReplayCatalog._jsonable(item) for item in value]
        return value

    @staticmethod
    def _jpeg(value: Any) -> bytes:
        try:
            import numpy as np
            from PIL import Image
        except ImportError as error:
            raise RuntimeError("numpy and Pillow are required for Web LeRobot replay") from error
        for name in ("detach", "cpu", "numpy"):
            method = getattr(value, name, None)
            if callable(method):
                value = method()
        array = np.asarray(value)
        if array.ndim == 3 and array.shape[0] in {1, 3, 4}:
            array = np.transpose(array, (1, 2, 0))
        if array.dtype.kind == "f":
            array = np.clip(array * 255.0, 0, 255).astype(np.uint8)
        else:
            array = np.clip(array, 0, 255).astype(np.uint8)
        if array.ndim == 3 and array.shape[2] == 1:
            array = array[:, :, 0]
        output = io.BytesIO()
        preview = Image.fromarray(array)
        resampling = getattr(Image, "Resampling", Image)
        preview.thumbnail(_REPLAY_IMAGE_SIZE, resampling.BILINEAR)
        preview.save(output, format="JPEG", quality=_REPLAY_JPEG_QUALITY, optimize=True)
        return output.getvalue()
