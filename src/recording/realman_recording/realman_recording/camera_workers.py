"""Independent camera recording and degraded-preview worker contracts.

The normal path consumes ROS image topics.  A ROS callback only offers the raw
``sensor_msgs/Image`` object to a bounded queue; JPEG encoding and file I/O happen
on this module's worker thread.
"""
from __future__ import annotations

import queue
import threading
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, Sequence

from .json_io import atomic_json_write


@dataclass(frozen=True)
class CameraSource:
    camera_id: str
    image_topic: str


@dataclass(frozen=True)
class PreviewFrame:
    camera_id: str
    capture_monotonic_ns: int
    capture_wall_ns: int
    jpeg: bytes


def load_camera_sources(node: Any) -> tuple[CameraSource, ...]:
    """Read camera ids and ROS image topics into validated sources.

    The recorder and the Web bridge both need the same id↔topic pairing with equal
    length; this helper keeps the two nodes from re-implementing the check (and from
    disagreeing on its error type).
    """
    ids = [str(item) for item in node.get_parameter("camera_ids").value if str(item)]
    topics = [str(item) for item in node.get_parameter("camera_image_topics").value if str(item)]
    if len(ids) != len(topics):
        raise ValueError("camera_ids and camera_image_topics must have equal length")
    if any(not topic.startswith("/") for topic in topics):
        raise ValueError("camera_image_topics must contain absolute ROS topic names")
    return tuple(CameraSource(camera_id, topic) for camera_id, topic in zip(ids, topics))


class RosImageArchive:
    """Bounded JPEG-file archive fed by ROS image subscriptions.

    ``offer`` is intentionally the only method called from a ROS callback.  It makes
    no codec, subprocess, or filesystem calls.  Frames are stored as individual JPEGs
    so their receipt ``SYSTEM_TIME`` is exact and replay does not depend on a video
    container's frame-rate metadata.
    """

    def __init__(self, sources: Sequence[CameraSource], *, queue_size: int = 64) -> None:
        if queue_size <= 0:
            raise ValueError("camera image queue_size must be positive")
        if not sources or any(not source.camera_id or not source.image_topic for source in sources):
            raise ValueError("ROS image archive requires non-empty camera ids and image topics")
        if len({source.camera_id for source in sources}) != len(sources):
            raise ValueError("camera_ids must be unique")
        self._sources = tuple(sources)
        self._queue: queue.Queue[tuple[str, int, Any, bool]] = queue.Queue(maxsize=queue_size)
        self._root: Path | None = None
        self._thread: threading.Thread | None = None
        self._running = threading.Event()
        self._stats = {source.camera_id: {"accepted": 0, "dropped": 0, "errors": 0} for source in sources}
        self._frames: dict[str, list[dict[str, Any]]] = {source.camera_id: [] for source in sources}
        self._lock = threading.Lock()

    def start(self, video_root: Path) -> None:
        video_root.mkdir(mode=0o750, parents=True, exist_ok=True)
        self._root = video_root
        self._running.set()
        self._thread = threading.Thread(target=self._write_loop, name="recording-image-archive", daemon=True)
        self._thread.start()

    def offer(self, camera_id: str, receipt_wall_ns: int, jpeg: bytes) -> bool:
        """Queue one JPEG without blocking; return false when overload drops it."""
        return self._offer(camera_id, receipt_wall_ns, jpeg, encode=False)

    def offer_image(self, camera_id: str, receipt_wall_ns: int, image: Any) -> bool:
        """Queue one native ROS Image; JPEG conversion runs only on the archive worker."""
        return self._offer(camera_id, receipt_wall_ns, image, encode=True)

    def _offer(self, camera_id: str, receipt_wall_ns: int, payload: Any, *, encode: bool) -> bool:
        """Admit a raw image or encoded JPEG without doing CPU or filesystem work."""
        if not self._running.is_set() or camera_id not in self._stats or receipt_wall_ns < 0:
            return False
        try:
            if not payload:
                return False
            self._queue.put_nowait((camera_id, receipt_wall_ns, payload, encode))
        except queue.Full:
            with self._lock:
                self._stats[camera_id]["dropped"] += 1
            return False
        with self._lock:
            self._stats[camera_id]["accepted"] += 1
        return True

    def stop(self) -> dict[str, dict[str, str]]:
        """Close admission and drain the sole JPEG writer before sealing its index.

        This intentionally waits without a timeout, just like ``McapStateArchive``:
        returning a finalized session while its image worker can still append frames
        would make ``media-index.json`` non-authoritative.  STOP can therefore take
        as long as the outstanding bounded image queue and filesystem require, but
        no ROS subscription callback waits on that work.
        """
        self._running.clear()
        if self._thread is not None:
            self._thread.join()
        if self._root is not None:
            with self._lock:
                segments = [
                    {
                        "camera_id": camera_id,
                        "path": f"{camera_id}/",
                        "format": "jpeg_frames",
                        "started_wall_ns": frames[0]["walltime_ns"] if frames else 0,
                        "ended_wall_ns": frames[-1]["walltime_ns"] if frames else 0,
                        "frames": frames,
                    }
                    for camera_id, frames in self._frames.items()
                ]
                stats = {camera_id: dict(values) for camera_id, values in self._stats.items()}
                errors = {camera_id: str(values["errors"]) for camera_id, values in self._stats.items() if values["errors"]}
            atomic_json_write(
                self._root / "media-index.json",
                {"segments": segments, "stats": stats, "errors": errors},
            )
        return self.health_summary(stopped=True)

    @property
    def healthy(self) -> bool:
        with self._lock:
            return self._running.is_set() and all(values["errors"] == 0 for values in self._stats.values())

    def health_summary(self, *, stopped: bool = False) -> dict[str, dict[str, str]]:
        with self._lock:
            return {
                camera_id: {
                    "state": "error" if values["errors"] else ("stopped" if stopped else "recording"),
                    "error": "" if not values["errors"] else f"{values['errors']} JPEG write errors",
                }
                for camera_id, values in self._stats.items()
            }

    def _write_loop(self) -> None:
        while self._running.is_set() or not self._queue.empty():
            try:
                camera_id, wall_ns, payload, encode = self._queue.get(timeout=0.1)
            except queue.Empty:
                continue
            try:
                assert self._root is not None
                jpeg = image_to_jpeg(payload) if encode else payload
                relative = Path(camera_id) / f"{wall_ns}.jpg"
                target = self._root / relative
                target.parent.mkdir(mode=0o750, parents=True, exist_ok=True)
                target.write_bytes(jpeg)
                with self._lock:
                    self._frames[camera_id].append({"path": str(relative), "walltime_ns": wall_ns})
            except Exception:
                with self._lock:
                    self._stats[camera_id]["errors"] += 1
            finally:
                self._queue.task_done()


class LatestFramePreview:
    """A single-slot lossy bridge from a decoder to browser clients."""

    def __init__(
        self,
        on_frame: Callable[[PreviewFrame], None],
        *,
        transform: Callable[[PreviewFrame], PreviewFrame] | None = None,
    ) -> None:
        self._queue: queue.Queue[PreviewFrame] = queue.Queue(maxsize=1)
        self._on_frame = on_frame
        self._transform = transform
        self._running = False
        self._thread: threading.Thread | None = None
        self.dropped_frames = 0

    def start(self) -> None:
        if self._running:
            return
        self._running = True
        self._thread = threading.Thread(target=self._deliver_loop, name="recording-preview", daemon=True)
        self._thread.start()

    def offer(self, frame: PreviewFrame) -> None:
        """Drop stale preview bytes instead of allowing a slow browser to accumulate RAM."""
        if not self._running:
            return
        try:
            self._queue.put_nowait(frame)
        except queue.Full:
            try:
                self._queue.get_nowait()
            except queue.Empty:
                pass
            self.dropped_frames += 1
            try:
                self._queue.put_nowait(frame)
            except queue.Full:
                self.dropped_frames += 1

    def stop(self) -> None:
        self._running = False
        if self._thread is not None:
            self._thread.join(timeout=2.0)
        self._thread = None

    def _deliver_loop(self) -> None:
        while self._running:
            try:
                frame = self._queue.get(timeout=0.2)
            except queue.Empty:
                continue
            try:
                self._on_frame(self._transform(frame) if self._transform is not None else frame)
            except Exception:
                # Preview delivery errors intentionally drop only this lossy frame. The
                # last successful receipt remains the health signal shown by Web; adding
                # a synchronous error event here would couple preview to the bridge.
                pass


def downscale_jpeg(frame: PreviewFrame, *, width: int, height: int, quality: int = 65) -> PreviewFrame:
    """Downscale on the preview thread; fall back to source JPEG when OpenCV is absent."""
    if width < 1 or height < 1 or not 1 <= quality <= 100:
        raise ValueError("preview dimensions and JPEG quality are invalid")
    try:
        import cv2  # type: ignore[import-not-found]
        import numpy as np  # type: ignore[import-not-found]
        decoded = cv2.imdecode(np.frombuffer(frame.jpeg, dtype=np.uint8), cv2.IMREAD_COLOR)
        if decoded is None:
            return frame
        ratio = min(width / decoded.shape[1], height / decoded.shape[0], 1.0)
        resized = cv2.resize(decoded, (max(1, int(decoded.shape[1] * ratio)), max(1, int(decoded.shape[0] * ratio))))
        ok, encoded = cv2.imencode(".jpg", resized, [cv2.IMWRITE_JPEG_QUALITY, quality])
        if ok:
            return PreviewFrame(frame.camera_id, frame.capture_monotonic_ns, frame.capture_wall_ns, encoded.tobytes())
    except Exception:
        pass
    return frame


def image_to_jpeg(image: Any, *, quality: int = 90, width: int | None = None, height: int | None = None) -> bytes:
    """Encode a raw ``sensor_msgs/Image`` frame to JPEG bytes.

    The recorder subscribes to the driver's native ``Image`` topics, so frames must be
    JPEG-encoded before the archive/preview consumers (which are JPEG-only). Handles the
    row-stride padding some camera drivers add; raises ``ValueError`` for an unsupported
    encoding so a malformed frame is dropped rather than written as a corrupt JPEG.

    When ``width``/``height`` are given, the frame is downscaled before encoding so the
    preview path avoids the encode → decode → resize → re-encode round-trip.
    """
    import cv2  # type: ignore[import-not-found]
    import numpy as np  # type: ignore[import-not-found]

    n_channels = {"rgb8": 3, "bgr8": 3, "mono8": 1}.get(image.encoding)
    if n_channels is None:
        raise ValueError(f"unsupported image encoding for JPEG archive: {image.encoding!r}")
    raw = np.frombuffer(bytes(image.data), dtype=np.uint8)
    stride = image.step or (image.width * n_channels)
    if stride != image.width * n_channels:
        raw = raw.reshape(image.height, stride)[:, : image.width * n_channels]
    array = raw.reshape(image.height, image.width, n_channels)
    if image.encoding == "rgb8":
        array = cv2.cvtColor(array, cv2.COLOR_RGB2BGR)
    elif image.encoding == "mono8":
        array = cv2.cvtColor(array, cv2.COLOR_GRAY2BGR)
    if width and height:
        ratio = min(width / array.shape[1], height / array.shape[0], 1.0)
        if ratio < 1.0:
            array = cv2.resize(
                array,
                (max(1, int(array.shape[1] * ratio)), max(1, int(array.shape[0] * ratio))),
                interpolation=cv2.INTER_AREA,
            )
    ok, encoded = cv2.imencode(".jpg", array, [cv2.IMWRITE_JPEG_QUALITY, quality])
    if not ok:
        raise ValueError("JPEG encode failed for raw image frame")
    return encoded.tobytes()
