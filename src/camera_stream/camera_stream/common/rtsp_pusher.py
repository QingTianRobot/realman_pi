"""基于 PyAV 的彩色流 RTSP 推流封装。

把 SDK 读到的 BGR 帧用 H.264 硬件编码(NVENC，失败回退 libx264)推到 mediamtx。
消费端用 cv2.VideoCapture("rtsp://<ip>:8554/<path>") 拉流。
"""
from __future__ import annotations

import logging
import threading
import time

import av
import numpy as np

log = logging.getLogger(__name__)

# 优先 NVENC，其次软件编码。顺序可被配置覆盖。
_ENCODER_PRIORITY = ["h264_nvenc", "libx264"]

_NVENC_OPTS = {"preset": "p4", "tune": "ull", "rc": "cbr", "g": "60", "bf": "0"}
_X264_OPTS = {"preset": "veryfast", "tune": "zerolatency", "g": "60"}


class RtspPusher:
    """把 BGR ndarray 帧编码并推送到 RTSP 服务。"""

    def __init__(
        self,
        url: str,
        width: int,
        height: int,
        fps: int,
        encoder: str | None = None,
        bitrate_kbps: int = 8000,
    ):
        self.url = url
        self.width = width
        self.height = height
        self.fps = fps
        self._lock = threading.Lock()
        self._closed = False
        self._last_err_ts = 0.0

        candidates = [encoder] + _ENCODER_PRIORITY if encoder else _ENCODER_PRIORITY
        # 去重且保序
        seen = set()
        candidates = [c for c in candidates if c and not (c in seen or seen.add(c))]

        self.container = None
        self.stream = None
        self.encoder_name = None

        last_err = None
        for name in candidates:
            try:
                self._open(name, bitrate_kbps)
                self.encoder_name = name
                break
            except Exception as e:  # noqa: BLE001
                last_err = e
                log.warning("RTSP 编码器 %s 不可用: %s", name, e)
                self._close_container()
        if self.stream is None:
            raise RuntimeError(f"无可用 H.264 编码器，RTSP 推流初始化失败: {last_err}")

        log.info(
            "RTSP 推流就绪 url=%s %dx%d@%d 编码器=%s",
            url, width, height, fps, self.encoder_name,
        )

    def _open(self, encoder_name: str, bitrate_kbps: int) -> None:
        opts = {"rtsp_transport": "tcp"}
        try:
            self.container = av.open(self.url, mode="w", format="rtsp", options=opts)
        except Exception:
            self.container = av.open(self.url, mode="w", format="rtsp")

        codec = av.codec.Codec(encoder_name, "w")
        self.stream = self.container.add_stream(codec, rate=self.fps)
        self.stream.width = self.width
        self.stream.height = self.height
        self.stream.pix_fmt = "yuv420p"
        self.stream.bit_rate = bitrate_kbps * 1000
        enc_opts = _NVENC_OPTS if encoder_name == "h264_nvenc" else _X264_OPTS
        for k, v in enc_opts.items():
            try:
                self.stream.options[k] = v
            except Exception:  # noqa: BLE001
                pass

    def _close_container(self) -> None:
        try:
            if self.container is not None:
                self.container.close()
        except Exception:  # noqa: BLE001
            pass
        self.container = None
        self.stream = None

    def send(self, frame_bgr: np.ndarray) -> None:
        """推送一帧 BGR(shape HxWx3, uint8)。非阻塞失败只记日志，不抛异常。"""
        if self._closed or self.stream is None:
            return
        with self._lock:
            try:
                video = av.VideoFrame.from_ndarray(frame_bgr, format="bgr24")
                video = video.reformat(format="yuv420p")
                for packet in self.stream.encode(video):
                    self.container.mux(packet)
            except Exception as e:  # noqa: BLE001
                now = time.monotonic()
                if now - self._last_err_ts > 5.0:  # 错误限流，避免刷屏
                    log.error("RTSP 编码/推流失败: %s", e)
                    self._last_err_ts = now

    def close(self) -> None:
        with self._lock:
            if self._closed:
                return
            self._closed = True
            try:
                if self.stream is not None:
                    for packet in self.stream.encode(None):
                        self.container.mux(packet)
            except Exception:  # noqa: BLE001
                pass
            self._close_container()
            log.info("RTSP 推流已关闭 url=%s", self.url)
