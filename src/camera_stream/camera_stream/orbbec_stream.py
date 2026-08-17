"""手眼相机 Orbbec Gemini 305 推流进程。

SDK 直读彩色 + 深度 → 彩色推 RTSP(H.264)，深度走 TCP 通道。不经过 ROS2/DDS。

多台相机按 side 名选择（配置里的 cameras.<side>），用法:
    python -m camera_stream.orbbec_stream config/orbbec.yaml --side left
    python -m camera_stream.orbbec_stream config/orbbec.yaml --side right

注: pyorbbecsdk 各版本 API 略有差异，若启动报属性不存在，按报错微调本文件的 SDK 调用即可。
"""
from __future__ import annotations

import argparse
import logging
import signal
import sys
import time

import cv2
import numpy as np

from camera_stream.common.config import load
from camera_stream.common.depth_server import DepthServer
from camera_stream.common.rtsp_pusher import RtspPusher

log = logging.getLogger("orbbec_stream")

_running = True


def _sig_handler(signum, frame):  # noqa: ARG001
    global _running
    _running = False


def _preload_orbbec_sdk() -> None:
    """预加载 pyorbbecsdk 自带的 libOrbbecSDK(2.9.3)，防止被 ROS2 的 2.8.6 顶掉。

    ROS2 source 后 LD_LIBRARY_PATH 含 /opt/ros/humble/lib，会优先于 wheel 的
    $ORIGIN RUNPATH，导致加载到旧版 2.8.6 而缺 ob_application_config_set_struct 符号。
    """
    import ctypes
    import glob
    import os
    import site

    for base in [site.getusersitepackages()] + list(site.getsitepackages()):
        for lib in sorted(glob.glob(os.path.join(base, "pyorbbecsdk", "libOrbbecSDK.so.2"))):
            try:
                ctypes.CDLL(lib, mode=ctypes.RTLD_GLOBAL)
                log.info("预加载 Orbbec SDK 库: %s", lib)
                return
            except OSError as e:  # noqa: BLE001
                log.warning("预加载 %s 失败: %s", lib, e)


def _pick_device(pipeline_cls, serial: str):
    """按串号选择设备；串号为空或未找到时返回 None（不静默抢别的相机）。"""
    if not serial:
        return None
    try:
        from pyorbbecsdk import Context

        ctx = Context()  # 必须保持引用，否则 deviceMgr 被回收导致 NULL 指针
        dl = ctx.query_devices()
        dev = dl.get_device_by_serial_number(serial)
        if dev is not None:
            log.info("选中设备 serial=%s", serial)
            return pipeline_cls(dev)
        log.error("未找到 serial=%s 的设备", serial)
    except Exception as e:  # noqa: BLE001
        log.error("按串号选设备失败: %s", e)
    return None


def main() -> int:
    parser = argparse.ArgumentParser(description="Orbbec 推流")
    parser.add_argument("config", nargs="?", default="config/orbbec.yaml")
    parser.add_argument("--side", default="left", help="相机侧别，对应配置里的 cameras.<side>")
    parser.add_argument("--no-color", action="store_true")
    parser.add_argument("--no-depth", action="store_true")
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(name)s] %(levelname)s %(message)s",
    )

    _preload_orbbec_sdk()
    from pyorbbecsdk import Config, OBSensorType, OBFormat, Pipeline  # noqa: E402

    cfg = load(args.config)
    cameras = getattr(cfg, "cameras", None)
    if cameras is None or not hasattr(cameras, args.side):
        avail = list(vars(cameras)) if cameras is not None else []
        log.error("未找到 side=%s，可用: %s", args.side, avail or "(无)")
        return 1
    cam = getattr(cameras, args.side)
    stream = cfg.stream
    # 彩色格式：MJPG(压缩,省 USB2.0 带宽) 或 BGR(无损,需 USB3.0)
    color_fmt = OBFormat.MJPG if getattr(stream.color, "format", "MJPG").upper() == "MJPG" else OBFormat.BGR

    if not cam.serial:
        log.info("side=%s 未配置 serial（相机未接入），跳过", args.side)
        return 0

    rtsp_host = getattr(cfg, "rtsp_host", "127.0.0.1")
    rtsp_port = getattr(cfg, "rtsp_port", 8554)
    rtsp_url = f"rtsp://{rtsp_host}:{rtsp_port}{cam.rtsp_path}"

    pipeline = _pick_device(Pipeline, cam.serial)
    if pipeline is None:
        return 1

    def _enable(config, cw, ch, cf, dw, dh, df):
        if not args.no_color:
            config.enable_video_stream(OBSensorType.COLOR_SENSOR, cw, ch, cf, color_fmt)
        if not args.no_depth and stream.depth.enable:
            config.enable_video_stream(OBSensorType.DEPTH_SENSOR, dw, dh, df, OBFormat.Y16)

    # 解析实际用到的分辨率（配置请求的；失败时回退设备默认）
    cw, ch, cf = stream.color.width, stream.color.height, stream.color.fps
    dw, dh, df = stream.depth.width, stream.depth.height, stream.depth.fps

    config = Config()
    _enable(config, cw, ch, cf, dw, dh, df)
    try:
        pipeline.start(config)
    except Exception as e:
        log.warning("按配置启动失败(%s)，回退设备默认 profile", e)
        try:
            pipeline.stop()
        except Exception:  # noqa: BLE001
            pass
        if not args.no_color:
            dp = pipeline.get_stream_profile_list(OBSensorType.COLOR_SENSOR).get_default_video_stream_profile()
            cw, ch, cf = dp.get_width(), dp.get_height(), dp.get_fps()
            log.info("默认 COLOR profile: %dx%d@%d", cw, ch, cf)
        if not args.no_depth and stream.depth.enable:
            dp = pipeline.get_stream_profile_list(OBSensorType.DEPTH_SENSOR).get_default_video_stream_profile()
            dw, dh, df = dp.get_width(), dp.get_height(), dp.get_fps()
            log.info("默认 DEPTH profile: %dx%d@%d", dw, dh, df)
        config = Config()
        _enable(config, cw, ch, cf, dw, dh, df)
        pipeline.start(config)
    log.info("Orbbec[%s] 已启动 serial=%s", args.side, cam.serial)

    pusher = None
    depth_srv = None
    if not args.no_color:
        pusher = RtspPusher(
            rtsp_url, cw, ch, cf,
            encoder=stream.color.encoder, bitrate_kbps=stream.color.bitrate_kbps,
        )
    if not args.no_depth and stream.depth.enable:
        depth_srv = DepthServer(
            cam.depth_port, bind=cam.bind, lz4_compress=stream.depth.lz4_compress,
        )

    signal.signal(signal.SIGINT, _sig_handler)
    signal.signal(signal.SIGTERM, _sig_handler)

    log.info("开始推流，Ctrl-C 退出")
    try:
        while _running:
            frames = pipeline.wait_for_frames(1000)
            if frames is None:
                continue
            ts_us = time.time_ns() // 1000
            if pusher is not None:
                color = frames.get_color_frame()
                if color is not None:
                    data = color.get_data()
                    if color_fmt == OBFormat.MJPG:
                        arr = cv2.imdecode(np.frombuffer(data, dtype=np.uint8), cv2.IMREAD_COLOR)
                    else:
                        w, h = color.get_width(), color.get_height()
                        arr = np.frombuffer(data, dtype=np.uint8).reshape(h, w, 3)
                    if arr is not None:
                        pusher.send(arr)
            if depth_srv is not None:
                depth = frames.get_depth_frame()
                if depth is not None:
                    w, h = depth.get_width(), depth.get_height()
                    arr = np.frombuffer(depth.get_data(), dtype=np.uint16).reshape(h, w)
                    depth_srv.send(arr, ts_us)
    finally:
        log.info("正在停止...")
        if pusher is not None:
            pusher.close()
        if depth_srv is not None:
            depth_srv.close()
        try:
            pipeline.stop()
        except Exception:  # noqa: BLE001
            pass
    return 0


if __name__ == "__main__":
    sys.exit(main())
