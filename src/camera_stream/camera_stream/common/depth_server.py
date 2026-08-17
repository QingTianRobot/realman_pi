"""深度 16bit 帧的 TCP 发送服务。

协议（TCP 字节流，长度前缀帧）：
    [4B total_len][header][payload]
    header = magic(4B "DPTH") + width(2B) + height(2B) + seq(4B)
             + flags(1B) + ts_us(8B) + payload_len(4B)
    payload = uint16 原始数据(HxW) 或 lz4 压缩后字节（flags bit0 置位）
"""
from __future__ import annotations

import logging
import socket
import struct
import threading

import numpy as np

try:
    import lz4.frame

    HAS_LZ4 = True
except ImportError:  # pragma: no cover
    HAS_LZ4 = False

log = logging.getLogger(__name__)

MAGIC = b"DPTH"
HEADER = struct.Struct(">4sHHIBQI")  # magic, w, h, seq, flags, ts_us, payload_len
FLAG_LZ4 = 0x01


class DepthServer:
    """监听端口，把 uint16 深度帧推给已接入的客户端（仅一个，新连接顶替旧连接）。"""

    def __init__(self, port: int, bind: str = "0.0.0.0", lz4_compress: bool = False):
        self.port = port
        self.bind = bind
        self.lz4_compress = bool(lz4_compress) and HAS_LZ4
        self._seq = 0
        self._conn = None
        self._running = True
        self._lock = threading.Lock()

        self._sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self._sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self._sock.bind((bind, port))
        self._sock.listen(1)
        self._sock.settimeout(1.0)
        self._accept_thread = threading.Thread(target=self._accept_loop, daemon=True)
        self._accept_thread.start()
        log.info("深度通道监听 %s:%d (lz4=%s)", bind, port, self.lz4_compress)

    def _accept_loop(self) -> None:
        while self._running:
            try:
                conn, addr = self._sock.accept()
            except socket.timeout:
                continue
            except OSError:
                break
            conn.settimeout(5.0)
            with self._lock:
                old = self._conn
                self._conn = conn
                if old is not None:
                    try:
                        old.close()
                    except OSError:  # noqa: BLE001
                        pass
            log.info("深度客户端接入 %s:%d", addr[0], addr[1])

    def send(self, depth: np.ndarray, ts_us: int = 0) -> None:
        if depth.dtype != np.uint16:
            depth = depth.astype(np.uint16)
        depth = np.ascontiguousarray(depth)
        h, w = depth.shape
        raw = depth.tobytes()

        with self._lock:
            conn = self._conn
            if conn is None:
                return
            flags = 0
            payload = raw
            if self.lz4_compress:
                payload = lz4.frame.compress(raw)
                flags |= FLAG_LZ4
            header = HEADER.pack(MAGIC, w, h, self._seq, flags, ts_us, len(payload))
            self._seq += 1
            total = struct.pack(">I", HEADER.size + len(payload))
            try:
                conn.sendall(total + header + payload)
            except OSError as e:  # noqa: BLE001
                log.warning("深度发送失败(客户端可能断开): %s", e)
                with self._lock:
                    if self._conn is conn:
                        self._conn = None
                try:
                    conn.close()
                except OSError:  # noqa: BLE001
                    pass

    def close(self) -> None:
        self._running = False
        with self._lock:
            conn = self._conn
            self._conn = None
        if conn is not None:
            try:
                conn.close()
            except OSError:  # noqa: BLE001
                pass
        self._sock.close()
        log.info("深度通道已关闭 :%d", self.port)
