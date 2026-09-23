"""Opt-in real ENOSPC test, restricted to a private tmpfs inside a test container."""
from __future__ import annotations

import base64
import os
import shutil
import tempfile
import time
from pathlib import Path

import pytest

from realman_recording.state_archive import McapStateArchive


def _is_tmpfs(path: Path) -> bool:
    """Return true only when the mount backing ``path`` is explicitly tmpfs."""
    target = str(path.resolve())
    longest_mount = ""
    filesystem = ""
    with open("/proc/mounts", encoding="utf-8") as mounts:
        for line in mounts:
            fields = line.split()
            if len(fields) < 3:
                continue
            mount_point = fields[1].replace("\\040", " ")
            if target == mount_point or target.startswith(mount_point.rstrip("/") + "/"):
                if len(mount_point) > len(longest_mount):
                    longest_mount = mount_point
                    filesystem = fields[2]
    return filesystem == "tmpfs"


def test_real_tmpfs_enospc_is_counted_as_archive_write_error():
    if os.environ.get("REALMAN_RECORDING_TEST_ENOSPC") != "1":
        pytest.skip("requires explicit opt-in and an isolated --shm-size test container")

    pytest.importorskip("rosbag2_py")
    pytest.importorskip("rclpy")
    from std_msgs.msg import String

    tmpfs_root = Path("/dev/shm")
    if not tmpfs_root.is_dir() or not _is_tmpfs(tmpfs_root):
        pytest.skip("/dev/shm is not a tmpfs; refusing to consume persistent disk space")

    with tempfile.TemporaryDirectory(prefix="recording-enospc-", dir=tmpfs_root) as directory:
        isolated_root = Path(directory)
        archive = McapStateArchive(max_queue=2)
        archive.start(isolated_root / "state.mcap", {"/qa/status": "std_msgs/msg/String"})
        try:
            reserve_bytes = 512 * 1024
            free_bytes = shutil.disk_usage(isolated_root).free
            if free_bytes < 4 * 1024 * 1024:
                pytest.skip("isolated tmpfs needs at least 4 MiB free for the ENOSPC fixture")

            fill_bytes = free_bytes - reserve_bytes
            with (isolated_root / "fill.bin").open("wb") as filler:
                chunk = b"x" * (64 * 1024)
                while fill_bytes > 0:
                    size = min(fill_bytes, len(chunk))
                    filler.write(chunk[:size])
                    fill_bytes -= size
                filler.flush()
                os.fsync(filler.fileno())
            assert shutil.disk_usage(isolated_root).free < 1024 * 1024, "tmpfs fixture did not consume its quota"

            for index in range(12):
                previous_writes = archive.stats.accepted + archive.stats.write_errors
                archive.enqueue(
                    "/qa/status",
                    String(data=base64.b64encode(os.urandom(1024 * 1024)).decode("ascii")),
                    1_700_000_000_000_000_000 + index,
                )
                deadline = time.monotonic() + 5.0
                while archive.stats.accepted + archive.stats.write_errors <= previous_writes:
                    if time.monotonic() >= deadline:
                        pytest.fail("MCAP writer did not process an admitted test sample")
                    time.sleep(0.01)
                if archive.stats.write_errors:
                    break
            stats = archive.stop()
        finally:
            # If an assertion or fixture setup fails, close the writer before the
            # TemporaryDirectory removes files and frees the bounded tmpfs blocks.
            if archive._thread is not None or archive._writer is not None:
                archive.stop()

        written_files = [
            (path.relative_to(isolated_root).as_posix(), path.stat().st_size)
            for path in isolated_root.rglob("*")
            if path.is_file()
        ]
        assert stats.write_errors >= 1, (
            f"writer did not surface ENOSPC: stats={stats}, "
            f"written_files={written_files}, "
            f"tmpfs_free={shutil.disk_usage(isolated_root).free}"
        )
