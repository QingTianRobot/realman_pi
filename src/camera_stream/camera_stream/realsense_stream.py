"""全局相机 RealSense D435 推流进程。

SDK 直读彩色 + 深度 → 彩色推 RTSP(H.264)，深度走 TCP 通道。不经过 ROS2/DDS。

用法:
    python -m camera_stream.realsense_stream [config.yaml]
"""
from __future__ import annotations

import argparse
import logging
import signal
import sys
import time

import numpy as np

from camera_stream.common.config import load
from camera_stream.common.depth_server import DepthServer
from camera_stream.common.rtsp_pusher import RtspPusher

log = logging.getLogger("realsense_stream")

_running = True


def _sig_handler(signum, frame):  # noqa: ARG001
    global _running
    _running = False


def main() -> int:
    parser = argparse.ArgumentParser(description="RealSense 推流")
    parser.add_argument(
        "config", nargs="?", default="config/realsense.yaml",
        help="配置文件路径",
    )
    parser.add_argument("--no-color", action="store_true", help="关闭彩色 RTSP")
    parser.add_argument("--no-depth", action="store_true", help="关闭深度通道")
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(name)s] %(levelname)s %(message)s",
    )

    import pyrealsense2 as rs  # 延迟导入，便于缺失时给出清晰报错

    cfg = load(args.config)
    cam = cfg.camera

    # ---- 配置 SDK 流 ----
    pipeline = rs.pipeline()
    config = rs.config()
    if cam.serial:
        config.enable_device(cam.serial)
    if not args.no_color:
        config.enable_stream(
            rs.stream.color, cfg.color.width, cfg.color.height, rs.format.bgr8, cfg.color.fps,
        )
    if not args.no_depth and cfg.depth.enable:
        config.enable_stream(
            rs.stream.depth, cfg.depth.width, cfg.depth.height, rs.format.z16, cfg.depth.fps,
        )
    try:
        pipeline.start(config)
    except RuntimeError as e:
        if "busy" in str(e).lower() or "resource" in str(e).lower():
            log.error(
                "RealSense 设备被占用：可能有残留的 realsense_stream 或 realsense2_camera_node "
                "进程。先执行 ./scripts/stop_streaming.sh 或 pkill 停掉它们再启动。原始错误: %s", e,
            )
        else:
            log.error("RealSense 启动失败: %s", e)
        return 1
    log.info("RealSense 已启动 serial=%s", cam.serial or "(第一台)")

    # ---- 推流对象 ----
    pusher = None
    depth_srv = None
    if not args.no_color:
        pusher = RtspPusher(
            cam.rtsp_url, cfg.color.width, cfg.color.height, cfg.color.fps,
            encoder=cfg.color.encoder, bitrate_kbps=cfg.color.bitrate_kbps,
        )
    if not args.no_depth and cfg.depth.enable:
        depth_srv = DepthServer(
            cfg.depth.port, bind=cfg.depth.bind, lz4_compress=cfg.depth.lz4_compress,
        )

    signal.signal(signal.SIGINT, _sig_handler)
    signal.signal(signal.SIGTERM, _sig_handler)

    log.info("开始推流，Ctrl-C 退出")
    try:
        while _running:
            try:
                frames = pipeline.wait_for_frames(timeout_ms=5000)
            except RuntimeError as exc:
                log.error(
                    "RealSense 读取帧失败: %s。请检查 USB3 线/端口、设备占用和相机固件；"
                    "当前 USB2 总线可能无法同时承载多台相机。",
                    exc,
                )
                return 1
            if not frames:
                continue
            ts_us = time.time_ns() // 1000
            if pusher is not None:
                color = frames.get_color_frame()
                if color is not None:
                    pusher.send(np.asanyarray(color.get_data()))
            if depth_srv is not None:
                depth = frames.get_depth_frame()
                if depth is not None:
                    depth_srv.send(np.asanyarray(depth.get_data()), ts_us)
    finally:
        log.info("正在停止...")
        if pusher is not None:
            pusher.close()
        if depth_srv is not None:
            depth_srv.close()
        pipeline.stop()
    return 0


if __name__ == "__main__":
    sys.exit(main())
