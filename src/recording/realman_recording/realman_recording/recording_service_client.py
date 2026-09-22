"""Operator-facing client for the read-only recording lifecycle service.

    ``/recording/manage`` is the single service that owns recording lifecycle. This
    module wraps the connect → send → receive cycle so callers do not hand-type
    ``ros2 service call`` and can drive START/STOP/ADOPT/DISCARD/PREPARE from Python.
    STOP only finalizes the raw session; ADOPT is the explicit conversion decision.

Usage (inside the ROS workspace environment)::

    python3 -m realman_recording.recording_service_client start
    python3 -m realman_recording.recording_service_client stop --session-id <id>
"""
from __future__ import annotations

import argparse
import sys

import rclpy
from rclpy.node import Node

from realman_recording_msgs.srv import ManageRecording


class RecordingServiceClient(Node):
    """One ROS node with a single synchronous client for ``/recording/manage``."""

    def __init__(self, *, timeout_sec: float = 30.0) -> None:
        super().__init__("recording_service_client")
        self._timeout_sec = timeout_sec
        self._client = self.create_client(ManageRecording, "/recording/manage")

    def call(self, request: ManageRecording.Request) -> ManageRecording.Response:
        """Send one request and block until the recorder answers (or timeout)."""
        if not self._client.wait_for_service(timeout_sec=self._timeout_sec):
            raise RuntimeError("/recording/manage service is not available")
        future = self._client.call_async(request)
        rclpy.spin_until_future_complete(self, future, timeout_sec=self._timeout_sec)
        if not future.done():
            raise RuntimeError("service call timed out")
        return future.result()

    def start(
        self,
        *,
        duration_sec: int = 0,
        record_cameras: bool = True,
        task: str = "",
        profile: str = "",
    ) -> ManageRecording.Response:
        request = ManageRecording.Request()
        request.command = ManageRecording.Request.START
        request.duration_sec = duration_sec
        request.record_cameras = record_cameras
        request.task = task
        request.profile = profile
        return self.call(request)

    def stop(self, session_id: str) -> ManageRecording.Response:
        request = ManageRecording.Request()
        request.command = ManageRecording.Request.STOP
        request.session_id = session_id
        return self.call(request)

    def adopt(self, session_id: str) -> ManageRecording.Response:
        request = ManageRecording.Request()
        request.command = ManageRecording.Request.ADOPT
        request.session_id = session_id
        return self.call(request)

    def discard(self, session_id: str) -> ManageRecording.Response:
        request = ManageRecording.Request()
        request.command = ManageRecording.Request.DISCARD
        request.session_id = session_id
        return self.call(request)

    def prepare(self) -> ManageRecording.Response:
        request = ManageRecording.Request()
        request.command = ManageRecording.Request.PREPARE
        return self.call(request)


def _print(response: ManageRecording.Response) -> None:
    print(
        f"success={response.success} "
        f"session_id={response.session_id!r} "
        f"state={response.state!r} "
        f"message={response.message!r}"
    )


def main(args: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Drive the recording lifecycle service")
    sub = parser.add_subparsers(dest="command", required=True)

    start = sub.add_parser("start", help="start recording (runs preflight first)")
    start.add_argument("--duration", type=int, default=0, help="seconds; 0 = record until STOP")
    start.add_argument("--no-cameras", action="store_true", help="record state without cameras")
    start.add_argument("--task", default="", help="task label stored in the session manifest")
    start.add_argument("--profile", default="", help="profile label")

    stop = sub.add_parser("stop", help="stop and finalize the raw session; ADOPT queues conversion")
    stop.add_argument("--session-id", required=True, help="session id returned by start")

    adopt = sub.add_parser("adopt", help="adopt a finalized session and queue conversion")
    adopt.add_argument("--session-id", required=True)

    discard = sub.add_parser("discard", help="discard a finalized session (keeps raw data)")
    discard.add_argument("--session-id", required=True)

    sub.add_parser("prepare", help="run preflight only")

    parsed = parser.parse_args(args)

    rclpy.init()
    client = RecordingServiceClient()
    try:
        if parsed.command == "start":
            response = client.start(
                duration_sec=parsed.duration,
                record_cameras=not parsed.no_cameras,
                task=parsed.task,
                profile=parsed.profile,
            )
        elif parsed.command == "stop":
            response = client.stop(parsed.session_id)
        elif parsed.command == "adopt":
            response = client.adopt(parsed.session_id)
        elif parsed.command == "discard":
            response = client.discard(parsed.session_id)
        else:
            response = client.prepare()
    except Exception as error:  # noqa: BLE001 - surface a stable CLI error
        print(f"error: {error}", file=sys.stderr)
        return 1
    finally:
        client.destroy_node()
        rclpy.shutdown()

    _print(response)
    return 0 if response.success else 1


if __name__ == "__main__":
    raise SystemExit(main())
