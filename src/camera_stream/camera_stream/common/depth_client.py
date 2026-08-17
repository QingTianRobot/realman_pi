"""深度 TCP 通道的消费端参考实现。

用法（作为库）:
    from camera_stream.common.depth_client import DepthClient
    cli = DepthClient("192.168.5.80", 8100)
    depth, seq, ts_us = cli.recv()   # depth 为 uint16 HxW ndarray

或作为脚本自测:
    python -m camera_stream.common.depth_client HOST PORT
"""
from __future__ import annotations

import socket
import struct
import time

import numpy as np

try:
    import lz4.frame

    HAS_LZ4 = True
except ImportError:  # pragma: no cover
    HAS_LZ4 = False

MAGIC = b"DPTH"
HEADER = struct.Struct(">4sHHIBQI")
FLAG_LZ4 = 0x01


def _recv_exact(sock: socket.socket, n: int) -> bytes:
    buf = b""
    while len(buf) < n:
        chunk = sock.recv(n - len(buf))
        if not chunk:
            raise EOFError("对端关闭连接")
        buf += chunk
    return buf


class DepthClient:
    def __init__(self, host: str, port: int, timeout: float = 5.0):
        self.sock = socket.create_connection((host, port), timeout=timeout)
        self.sock.settimeout(timeout)

    def recv(self):
        """返回 (depth uint16 HxW ndarray, seq, ts_us)。"""
        total = struct.unpack(">I", _recv_exact(self.sock, 4))[0]
        data = _recv_exact(self.sock, total)
        magic, w, h, seq, flags, ts_us, payload_len = HEADER.unpack_from(data, 0)
        if magic != MAGIC:
            raise ValueError(f"非法魔数: {magic!r}")
        payload = data[HEADER.size: HEADER.size + payload_len]
        if flags & FLAG_LZ4:
            if not HAS_LZ4:
                raise RuntimeError("收到 lz4 压缩帧但未安装 lz4 包")
            payload = lz4.frame.decompress(payload)
        depth = np.frombuffer(payload, dtype=np.uint16).reshape(h, w)
        return depth, seq, ts_us

    def close(self) -> None:
        self.sock.close()


def main() -> None:
    import sys

    if len(sys.argv) < 3:
        print("用法: python -m camera_stream.common.depth_client HOST PORT")
        sys.exit(1)
    host, port = sys.argv[1], int(sys.argv[2])
    cli = DepthClient(host, port)
    print(f"已连接 {host}:{port}，等待深度帧...")
    t0 = time.time()
    n = 0
    try:
        while True:
            depth, seq, ts_us = cli.recv()
            n += 1
            if n % 30 == 0:
                dt = time.time() - t0
                print(
                    f"[{seq}] {depth.shape} dtype={depth.dtype} "
                    f"min={depth.min()} max={depth.max()} mean={depth.mean():.1f} "
                    f"fps={n / dt:.1f}"
                )
    except KeyboardInterrupt:
        pass
    finally:
        cli.close()


if __name__ == "__main__":
    main()
