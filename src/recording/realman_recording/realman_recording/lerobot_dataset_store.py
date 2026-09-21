"""Process-safe access to the one append-only local LeRobot v3 dataset."""
from __future__ import annotations

from contextlib import contextmanager
from pathlib import Path
from typing import Iterator


@contextmanager
def dataset_lock(root: Path) -> Iterator[None]:
    """Serialize SDK create/resume/add/save/finalize across recorder processes.

    LeRobot v3 updates parquet/video metadata together; two adopted sessions must
    never append concurrently.  The lock intentionally lives next to the dataset,
    so it also protects a manually started conversion process on the same machine.
    """
    try:
        import fcntl
    except ImportError as error:  # pragma: no cover - recorder runs on Linux/ROS 2
        raise RuntimeError("LeRobot dataset append locking requires POSIX fcntl") from error
    root.parent.mkdir(parents=True, exist_ok=True)
    with (root.parent / f".{root.name}.lock").open("a+", encoding="utf-8") as handle:
        fcntl.flock(handle.fileno(), fcntl.LOCK_EX)
        try:
            yield
        finally:
            fcntl.flock(handle.fileno(), fcntl.LOCK_UN)
