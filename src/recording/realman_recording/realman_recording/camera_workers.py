"""Independent camera recording and degraded-preview worker contracts.

The normal path consumes ROS image topics.  A ROS callback only offers an already
compressed JPEG to a bounded queue; file I/O happens on this module's worker thread.
The older RTSP workers remain as migration helpers, but are not used by the recorder.
"""
from __future__ import annotations

import queue
import subprocess
import threading
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, Sequence

from .json_io import atomic_json_write


@dataclass(frozen=True)
class CameraSource:
    camera_id: str
    rtsp_url: str = ""
    image_topic: str = ""


@dataclass
class _ActiveSegment:
    camera_id: str
    path: Path
    started_wall_ns: int
    started_monotonic_ns: int
    process: Any


@dataclass(frozen=True)
class PreviewFrame:
    camera_id: str
    capture_monotonic_ns: int
    capture_wall_ns: int
    jpeg: bytes


_FFMPEG_COMMON_FLAGS = ["-hide_banner", "-loglevel", "warning", "-rtsp_transport", "tcp"]


def load_camera_sources(node: Any) -> tuple[CameraSource, ...]:
    """Read camera ids and ROS image topics into validated sources.

    The recorder and the Web bridge both need the same id↔url pairing with equal
    length; this helper keeps the two nodes from re-implementing the check (and from
    disagreeing on its error type).
    """
    ids = [str(item) for item in node.get_parameter("camera_ids").value if str(item)]
    topics = [str(item) for item in node.get_parameter("camera_image_topics").value if str(item)]
    # Kept solely so an older deployment can still parse its parameter file.  Recording
    # nodes require image topics and never silently fall back to delayed RTSP capture.
    # The [""] type placeholder (empty-list defaults are parsed as byte arrays) is
    # dropped here so an absent RTSP list stays empty.
    urls = [str(item) for item in node.get_parameter("camera_rtsp_urls").value if str(item)]
    if len(ids) != len(topics):
        raise ValueError("camera_ids and camera_image_topics must have equal length")
    if urls and len(ids) != len(urls):
        raise ValueError("camera_rtsp_urls must be empty or match camera_ids")
    if any(not topic.startswith("/") for topic in topics):
        raise ValueError("camera_image_topics must contain absolute ROS topic names")
    return tuple(
        CameraSource(camera_id, urls[index] if urls else "", topic)
        for index, (camera_id, topic) in enumerate(zip(ids, topics))
    )


def extract_jpeg_frames(buffer: bytes) -> tuple[list[bytes], bytes]:
    """Split complete JPEGs from an ffmpeg image2pipe buffer without retaining old bytes."""
    frames: list[bytes] = []
    while True:
        start = buffer.find(b"\xff\xd8")
        if start < 0:
            return frames, buffer[-1:]
        end = buffer.find(b"\xff\xd9", start + 2)
        if end < 0:
            return frames, buffer[start:]
        frames.append(buffer[start : end + 2])
        buffer = buffer[end + 2 :]


class CameraRecordingWorker:
    """Own a source-quality, best-effort RTSP-to-file worker for one session."""

    def __init__(
        self,
        sources: tuple[CameraSource, ...],
        *,
        popen: Callable[..., Any] = subprocess.Popen,
        wall_clock_ns: Callable[[], int] = time.time_ns,
        monotonic_clock_ns: Callable[[], int] = time.monotonic_ns,
    ) -> None:
        if len({source.camera_id for source in sources}) != len(sources):
            raise ValueError("camera_ids must be unique")
        if any(not source.camera_id or not source.rtsp_url for source in sources):
            raise ValueError("camera source requires non-empty id and RTSP URL")
        self._sources = sources
        self._popen = popen
        self._wall_clock_ns = wall_clock_ns
        self._monotonic_clock_ns = monotonic_clock_ns
        self._active: dict[str, _ActiveSegment] = {}
        self._segments: list[dict[str, Any]] = []
        self._errors: dict[str, str] = {}
        self._video_root: Path | None = None
        self._next_segment = 0
        self._lock = threading.RLock()

    def start(self, video_root: Path) -> None:
        """Start one isolated source-copy MKV segment per camera.

        ffmpeg remains a child of this worker, not a ROS callback. Stderr inherits the
        node process so standard ROS launch logging owns it; no hidden log files are
        created. A camera that fails to start is recorded in the index but does not
        abort state recording or other camera workers.
        """
        video_root.mkdir(mode=0o750, parents=True, exist_ok=True)
        self._video_root = video_root
        for source in self._sources:
            if source.camera_id in self._active:
                continue
            self._start_source(source)

    def pause(self) -> None:
        """Close each active segment so a pause remains an explicit media gap."""
        self._stop_active("paused")

    def resume(self, video_root: Path) -> None:
        """Start subsequent segments after pause without inventing continuity."""
        self.start(video_root)

    def stop(self) -> dict[str, Any]:
        """Stop only camera worker processes and report health; never raise into the writer."""
        self._collect_exited_processes()
        self._stop_active("stopped")
        if self._video_root is not None:
            atomic_json_write(
                self._video_root / "media-index.json",
                {"segments": self._segments, "errors": self._errors},
            )
        return self.health_summary(stopped=True)

    @property
    def healthy(self) -> bool:
        """True only while every configured source has an active recording process."""
        self._collect_exited_processes()
        with self._lock:
            return bool(self._sources) and not self._errors and len(self._active) == len(self._sources)

    def health_summary(self, *, stopped: bool = False) -> dict[str, dict[str, str]]:
        """Return current camera health, polling children without blocking ROS callbacks."""
        self._collect_exited_processes()
        with self._lock:
            return {
                source.camera_id: {
                    "state": "error" if source.camera_id in self._errors else (
                        "stopped" if stopped else "recording"
                    ),
                    "error": self._errors.get(source.camera_id, ""),
                }
                for source in self._sources
            }

    @staticmethod
    def probe_sources(
        sources: Sequence[CameraSource], *, timeout_sec: float, run: Callable[..., Any] = subprocess.run
    ) -> dict[str, bool]:
        """Require ffprobe to identify a video stream before recording is armed."""
        if timeout_sec <= 0:
            raise ValueError("camera probe timeout must be positive")
        results: dict[str, bool] = {}
        for source in sources:
            try:
                completed = run(
                    [
                        "ffprobe", "-v", "error", "-rtsp_transport", "tcp",
                        "-select_streams", "v:0", "-show_entries", "stream=codec_type",
                        "-of", "default=noprint_wrappers=1:nokey=1", source.rtsp_url,
                    ],
                    stdin=subprocess.DEVNULL,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    timeout=timeout_sec,
                    check=False,
                )
                results[source.camera_id] = completed.returncode == 0 and "video" in completed.stdout
            except (OSError, subprocess.TimeoutExpired):
                results[source.camera_id] = False
        return results

    def _start_source(self, source: CameraSource) -> None:
        assert self._video_root is not None
        directory = self._video_root / source.camera_id
        directory.mkdir(mode=0o750, parents=True, exist_ok=True)
        path = directory / f"segment-{self._next_segment:06d}.mkv"
        self._next_segment += 1
        command = [
            "ffmpeg", *_FFMPEG_COMMON_FLAGS,
            "-i", source.rtsp_url, "-map", "0:v:0", "-c", "copy", "-f", "matroska", str(path),
        ]
        started_wall_ns = self._wall_clock_ns()
        started_monotonic_ns = self._monotonic_clock_ns()
        try:
            process = self._popen(command, stdin=subprocess.DEVNULL)
            if process.poll() is not None:
                self._errors[source.camera_id] = "ffmpeg exited during startup"
                return
        except OSError as error:
            self._errors[source.camera_id] = str(error)
            return
        self._active[source.camera_id] = _ActiveSegment(
            source.camera_id, path, started_wall_ns, started_monotonic_ns, process
        )

    def _stop_active(self, reason: str) -> None:
        for camera_id, active in list(self._active.items()):
            ended_wall_ns = self._wall_clock_ns()
            ended_monotonic_ns = self._monotonic_clock_ns()
            process = active.process
            try:
                process.terminate()
                exit_code = process.wait(timeout=5.0)
            except Exception as error:  # noqa: BLE001 - child failure is isolated per source
                self._errors[camera_id] = str(error)
                kill = getattr(process, "kill", None)
                if callable(kill):
                    try:
                        kill()
                    except Exception:
                        pass
                exit_code = None
            self._segments.append(
                {
                    "camera_id": camera_id,
                    "path": str(active.path.relative_to(self._video_root)) if self._video_root else str(active.path),
                    "started_wall_ns": active.started_wall_ns,
                    "ended_wall_ns": ended_wall_ns,
                    "started_monotonic_ns": active.started_monotonic_ns,
                    "ended_monotonic_ns": ended_monotonic_ns,
                    "reason": reason,
                    "exit_code": exit_code,
                }
            )
            del self._active[camera_id]

    def _collect_exited_processes(self) -> None:
        """Move unexpectedly exited children into the media index exactly once."""
        with self._lock:
            exited = [
                (camera_id, active, active.process.poll())
                for camera_id, active in self._active.items()
                if active.process.poll() is not None
            ]
            for camera_id, active, exit_code in exited:
                self._errors[camera_id] = f"ffmpeg exited unexpectedly with code {exit_code}"
                self._segments.append(
                    {
                        "camera_id": camera_id,
                        "path": str(active.path.relative_to(self._video_root)) if self._video_root else str(active.path),
                        "started_wall_ns": active.started_wall_ns,
                        "ended_wall_ns": self._wall_clock_ns(),
                        "started_monotonic_ns": active.started_monotonic_ns,
                        "ended_monotonic_ns": self._monotonic_clock_ns(),
                        "reason": "ffmpeg exited unexpectedly",
                        "exit_code": exit_code,
                    }
                )
                del self._active[camera_id]


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
        self._running.clear()
        if self._thread is not None:
            self._thread.join(timeout=10.0)
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
                errors = {camera_id: str(values["errors"]) for camera_id, values in self._stats.items() if values["errors"]}
            atomic_json_write(self._root / "media-index.json", {"segments": segments, "errors": errors})
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


class LowQualityPreviewWorker:
    """Lossy RTSP decoder that owns no recording state or raw-media files."""

    def __init__(
        self,
        sources: tuple[CameraSource, ...],
        on_frame: Callable[[PreviewFrame], None],
        *,
        width: int,
        height: int,
        fps: float,
        popen: Callable[..., Any] = subprocess.Popen,
        wall_clock_ns: Callable[[], int] = time.time_ns,
        monotonic_clock_ns: Callable[[], int] = time.monotonic_ns,
    ) -> None:
        if width < 1 or height < 1 or fps <= 0:
            raise ValueError("preview width, height and fps must be positive")
        self._sources = sources
        self._on_frame = on_frame
        self._width, self._height, self._fps = width, height, fps
        self._popen = popen
        self._wall_clock_ns = wall_clock_ns
        self._monotonic_clock_ns = monotonic_clock_ns
        self._running = threading.Event()
        self._processes: dict[str, Any] = {}
        self._threads: list[threading.Thread] = []

    def start(self) -> None:
        if self._running.is_set():
            return
        self._running.set()
        for source in self._sources:
            thread = threading.Thread(
                target=self._decode_source,
                args=(source,),
                name=f"recording-preview-{source.camera_id}",
                daemon=True,
            )
            self._threads.append(thread)
            thread.start()

    def stop(self) -> None:
        self._running.clear()
        for process in list(self._processes.values()):
            try:
                process.terminate()
            except Exception:
                pass
        for thread in self._threads:
            thread.join(timeout=2.0)
        self._threads.clear()
        self._processes.clear()

    def _decode_source(self, source: CameraSource) -> None:
        command = [
            "ffmpeg", *_FFMPEG_COMMON_FLAGS, "-i", source.rtsp_url,
            "-vf", f"fps={self._fps},scale={self._width}:{self._height}:force_original_aspect_ratio=decrease",
            "-q:v", "8", "-f", "image2pipe", "-vcodec", "mjpeg", "pipe:1",
        ]
        try:
            process = self._popen(command, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE)
        except OSError:
            return
        self._processes[source.camera_id] = process
        try:
            stream = process.stdout
            if stream is None:
                return
            buffer = b""
            while self._running.is_set():
                chunk = stream.read(65_536)
                if not chunk:
                    return
                frames, buffer = extract_jpeg_frames(buffer + chunk)
                for jpeg in frames:
                    if not self._running.is_set():
                        return
                    self._on_frame(
                        PreviewFrame(
                            camera_id=source.camera_id,
                            capture_monotonic_ns=self._monotonic_clock_ns(),
                            capture_wall_ns=self._wall_clock_ns(),
                            jpeg=jpeg,
                        )
                    )
        finally:
            self._processes.pop(source.camera_id, None)
