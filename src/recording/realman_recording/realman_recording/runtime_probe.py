"""Read-only ROS runtime probe for recording preflight and sensor-rate diagnosis."""
from __future__ import annotations

import argparse
import json
import time
from dataclasses import dataclass
from typing import Any, Iterable


@dataclass
class RateCounter:
    """Monotonic receipt counter used by the probe and pure tests."""

    count: int = 0
    first_ns: int | None = None
    last_ns: int | None = None

    def add(self, timestamp_ns: int) -> None:
        if self.first_ns is None:
            self.first_ns = timestamp_ns
        self.last_ns = timestamp_ns
        self.count += 1

    @property
    def rate_hz(self) -> float:
        if self.count < 2 or self.first_ns is None or self.last_ns is None:
            return 0.0
        elapsed = (self.last_ns - self.first_ns) / 1e9
        return (self.count - 1) / elapsed if elapsed > 0 else 0.0


def _unique(values: Iterable[str]) -> tuple[str, ...]:
    return tuple(dict.fromkeys(str(value) for value in values if str(value)))


def _device_status_snapshot(message: Any) -> dict[str, Any]:
    """Extract the portable health fields from an Orbbec ``DeviceStatus`` message."""
    return {
        "device_online": bool(message.device_online),
        "connection_type": str(message.connection_type),
        "color_frame_rate_cur": float(message.color_frame_rate_cur),
    }


class RuntimeProbeNode:
    """ROS node that observes configured inputs without invoking lifecycle services."""

    def __init__(
        self,
        *,
        image_topics: Iterable[str],
        arm_topics: Iterable[str],
        gripper_topics: Iterable[str],
        device_status_topics: Iterable[str] = (),
    ) -> None:
        import rclpy
        from sensor_msgs.msg import Image, JointState
        from std_msgs.msg import Float64
        from realman_recording_msgs.msg import RecordingStatus
        from realman_recording_msgs.srv import ManageRecording

        self.node = rclpy.create_node("recording_runtime_probe")
        self._counters = {topic: RateCounter() for topic in _unique((*image_topics, *arm_topics, *gripper_topics))}
        self._status: Any | None = None
        self._device_status: dict[str, dict[str, Any]] = {}
        self._subscriptions = []
        for topic in _unique(image_topics):
            self._subscriptions.append(self.node.create_subscription(Image, topic, lambda _msg, t=topic: self._tick(t), 10))
        for topic in _unique(arm_topics):
            self._subscriptions.append(self.node.create_subscription(JointState, topic, lambda _msg, t=topic: self._tick(t), 10))
        for topic in _unique(gripper_topics):
            self._subscriptions.append(self.node.create_subscription(Float64, topic, lambda _msg, t=topic: self._tick(t), 10))
        status_topics = _unique(device_status_topics)
        if status_topics:
            from orbbec_camera_msgs.msg import DeviceStatus

            for topic in status_topics:
                self._subscriptions.append(
                    self.node.create_subscription(
                        DeviceStatus,
                        topic,
                        lambda message, t=topic: self._record_device_status(t, message),
                        10,
                    )
                )
        self._subscriptions.append(self.node.create_subscription(RecordingStatus, "/recording/status", self._record_status, 10))
        self.service_client = self.node.create_client(ManageRecording, "/recording/manage")

    def _tick(self, topic: str) -> None:
        self._counters[topic].add(time.monotonic_ns())

    def _record_status(self, message: Any) -> None:
        self._status = message

    def _record_device_status(self, topic: str, message: Any) -> None:
        self._device_status[topic] = _device_status_snapshot(message)

    def report(self, *, service_available: bool) -> dict[str, Any]:
        status = None
        if self._status is not None:
            status = {
                "session_id": self._status.session_id,
                "state": int(self._status.state),
                "detail": self._status.detail,
                "accepted_samples": int(self._status.accepted_samples),
                "dropped_samples": int(self._status.dropped_samples),
            }
        return {
            "service_available": service_available,
            "status": status,
            "rates_hz": {topic: round(counter.rate_hz, 3) for topic, counter in self._counters.items()},
            "samples": {topic: counter.count for topic, counter in self._counters.items()},
            "device_status": dict(self._device_status),
        }

    def close(self) -> None:
        self.node.destroy_node()


def main(args: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Read-only recording ROS graph and sensor-rate probe")
    parser.add_argument("--duration-sec", type=float, default=5.0)
    parser.add_argument("--image-topic", action="append", default=[])
    parser.add_argument("--arm-topic", action="append", default=[])
    parser.add_argument("--gripper-topic", action="append", default=[])
    parser.add_argument(
        "--device-status-topic",
        action="append",
        default=[],
        help="Orbbec DeviceStatus topic (repeatable; optional)",
    )
    parsed = parser.parse_args(args)
    if parsed.duration_sec <= 0:
        parser.error("--duration-sec must be positive")

    import rclpy

    rclpy.init()
    probe = RuntimeProbeNode(
        image_topics=parsed.image_topic,
        arm_topics=parsed.arm_topic,
        gripper_topics=parsed.gripper_topic,
        device_status_topics=parsed.device_status_topic,
    )
    try:
        # A short bounded probe avoids delaying the actual rate window when the
        # recorder is not installed. The probe is diagnostic only and never sends
        # a request through this client.
        service_available = probe.service_client.wait_for_service(timeout_sec=min(1.0, parsed.duration_sec))
        deadline = time.monotonic() + parsed.duration_sec
        while rclpy.ok() and time.monotonic() < deadline:
            rclpy.spin_once(probe.node, timeout_sec=min(0.2, max(0.0, deadline - time.monotonic())))
        print(json.dumps(probe.report(service_available=service_available), ensure_ascii=False, indent=2))
    finally:
        probe.close()
        rclpy.shutdown()
    return 0 if service_available else 2


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
