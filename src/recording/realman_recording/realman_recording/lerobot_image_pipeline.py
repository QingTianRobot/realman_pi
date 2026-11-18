"""Parallel image staging for the LeRobot v3 exporter.

The exporter's per-episode cost is dominated by image work, not by alignment:
every exported frame decodes one archived JPEG per camera, and ``add_frame`` then
re-encodes it as a temporary PNG that LeRobot later feeds to the video encoder.
Run serially that is ~30 ms per frame for three 640x480 cameras.

Pillow releases the GIL while it decodes and encodes, so plain threads give real
parallelism here without pickling multi-megabyte frames between processes:

* :func:`iter_decoded_frames` decodes JPEGs ahead of the writer on a thread pool,
  in frame order, with a bounded look-ahead so memory stays flat;
* :func:`managed_image_writer` turns on LeRobot's own ``AsyncImageWriter`` (thread
  mode) for the duration of one episode, so PNG writes run in parallel;
* :func:`wait_for_writer_capacity` applies backpressure, because the SDK queue is
  unbounded and a long episode would otherwise pile decoded frames into RAM;
* :func:`verify_episode_images` checks every staged PNG landed, because the SDK's
  ``write_image`` only prints on failure and the encoder would silently drop frames.

LeRobot's ``streaming_encoding`` mode would skip the PNG round trip entirely, but in
lerobot 0.4.4 it dropped a frame from one camera in a 1200-frame benchmark, so it is
deliberately not used.
"""
from __future__ import annotations

import time
from collections import deque
from concurrent.futures import Future, ThreadPoolExecutor
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Callable, Iterator, Mapping, Sequence, TypeVar

T = TypeVar("T")

# Frames decoded ahead of the consumer per worker thread.  Two keeps every worker
# busy while the consumer hands the previous frame to the SDK.
_LOOKAHEAD_PER_WORKER = 2


def iter_decoded_frames(
    images: Mapping[str, Sequence[Path]],
    frame_count: int,
    load: Callable[[Path], T],
    *,
    workers: int,
) -> Iterator[dict[str, T]]:
    """Yield ``{camera: load(path)}`` for frames ``0..frame_count-1`` in order.

    ``workers == 0`` decodes inline (the original serial behaviour).  Otherwise at
    most ``workers`` decodes run concurrently and at most ``2 * workers`` frames are
    decoded ahead of the consumer.  A decode error is raised when its frame is
    reached, after every earlier frame has been yielded.
    """
    if workers < 0:
        raise ValueError("image workers must be zero or positive")
    for camera, paths in images.items():
        if len(paths) < frame_count:
            raise ValueError(f"camera {camera} has {len(paths)} images for {frame_count} frames")
    cameras = list(images)
    if workers == 0:
        for index in range(frame_count):
            yield {camera: load(images[camera][index]) for camera in cameras}
        return

    lookahead = max(1, workers * _LOOKAHEAD_PER_WORKER)
    pending: deque[list[Future[T]]] = deque()
    with ThreadPoolExecutor(max_workers=workers, thread_name_prefix="lerobot-jpeg") as pool:
        next_index = 0
        try:
            while next_index < frame_count and len(pending) < lookahead:
                pending.append([pool.submit(load, images[camera][next_index]) for camera in cameras])
                next_index += 1
            while pending:
                futures = pending.popleft()
                frame = {camera: future.result() for camera, future in zip(cameras, futures)}
                if next_index < frame_count:
                    pending.append([pool.submit(load, images[camera][next_index]) for camera in cameras])
                    next_index += 1
                yield frame
        finally:
            # On error or an abandoned iterator, do not decode the rest of the episode.
            for futures in pending:
                for future in futures:
                    future.cancel()


@contextmanager
def managed_image_writer(dataset: Any, *, workers: int) -> Iterator[None]:
    """Run LeRobot's thread-mode ``AsyncImageWriter`` for one episode.

    ``workers == 0`` (or an SDK without the writer API) keeps the synchronous
    ``add_frame`` PNG write.  The writer is always stopped on exit; ``stop`` drains
    the queue first, so no queued PNG is lost on the success path.
    """
    start = getattr(dataset, "start_image_writer", None)
    stop = getattr(dataset, "stop_image_writer", None)
    if workers <= 0 or not callable(start) or not callable(stop):
        yield
        return
    start(num_processes=0, num_threads=workers)
    try:
        yield
    finally:
        stop()


def wait_for_writer_capacity(dataset: Any, *, max_pending: int, poll_sec: float = 0.002) -> None:
    """Block while the async PNG writer has more than ``max_pending`` frames queued."""
    queue = getattr(getattr(dataset, "image_writer", None), "queue", None)
    if queue is None or not hasattr(queue, "qsize"):
        return
    while queue.qsize() > max_pending:
        time.sleep(poll_sec)


def verify_episode_images(dataset: Any, image_keys: Sequence[str]) -> None:
    """Raise unless every staged PNG of the pending episode exists and is non-empty."""
    writer = getattr(dataset, "image_writer", None)
    wait = getattr(writer, "wait_until_done", None)
    if callable(wait):
        wait()
    buffer = getattr(dataset, "episode_buffer", None) or {}
    for key in image_keys:
        paths = [path for path in buffer.get(key, []) if path is not None]
        bad = 0
        for path in paths:
            try:
                if Path(path).stat().st_size <= 0:
                    bad += 1
            except OSError:
                bad += 1
        if bad:
            raise RuntimeError(f"{key}: {bad} of {len(paths)} staged PNG frames are missing or empty")
