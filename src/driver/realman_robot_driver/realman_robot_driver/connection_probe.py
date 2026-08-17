"""Minimal, read-only RealMan SDK connection probe.

The probe intentionally stays below ROS 2 so network, SDK, handle creation,
joint-state reads, and cleanup can be checked independently of bringup and RViz.
It never sends motion, stop, IO, or configuration commands.
"""

from __future__ import annotations

import argparse
import os
import sys
import time
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class ProbeResult:
    """Successful read-only probe result."""

    robot_ip: str
    robot_port: int
    connect_level: int
    thread_mode: int
    handle_id: int
    joint_samples: tuple[tuple[float, ...], ...]


class RealManProbeError(RuntimeError):
    """A connection or read operation returned an unusable SDK result."""

    def __init__(self, message: str, status: int | None = None) -> None:
        super().__init__(message)
        self.status = status


def minimal_connection_test(
    robot_ip: str,
    robot_port: int = 8080,
    connect_level: int = 3,
    thread_mode: int = 2,
    refresh_interval: float = 0.05,
    print_every_n: int = 4,
    sample_count: int = 8,
) -> ProbeResult:
    """Connect to one controller, read joint angles, and release the handle.

    ``thread_mode=2`` is the SDK's ``RM_TRIPLE_MODE_E`` value. The SDK returns
    joint angles in degrees. No motion or other state-changing API is called.
    """

    _validate_arguments(
        robot_ip,
        robot_port,
        connect_level,
        thread_mode,
        refresh_interval,
        print_every_n,
        sample_count,
    )

    try:
        from Robotic_Arm.rm_robot_interface import RoboticArm, rm_thread_mode_e
    except ImportError as error:
        raise RealManProbeError(
            "Robotic_Arm Python SDK is not installed"
        ) from error

    try:
        sdk_mode = rm_thread_mode_e(thread_mode)
    except (TypeError, ValueError) as error:
        raise RealManProbeError(
            f"unsupported SDK thread mode value {thread_mode}; expected 0, 1, or 2"
        ) from error

    robot: Any | None = None
    handle: Any | None = None
    samples: list[tuple[float, ...]] = []
    try:
        robot = RoboticArm(sdk_mode)
        handle = robot.rm_create_robot_arm(robot_ip, robot_port, connect_level)
        handle_id = getattr(handle, "id", -1)
        if (
            handle is None
            or not isinstance(handle_id, int)
            or handle_id < 0
        ):
            raise RealManProbeError(
                f"rm_create_robot_arm returned invalid handle for {robot_ip}:{robot_port}",
                status=-1,
            )

        for sample_index in range(sample_count):
            status, data = _unpack_result(robot.rm_get_joint_degree())
            if status != 0:
                raise RealManProbeError(
                    f"rm_get_joint_degree failed with API2 status {status}",
                    status=status,
                )
            if not isinstance(data, (list, tuple)) or not data:
                raise RealManProbeError(
                    "rm_get_joint_degree returned an invalid joint list",
                    status=-1,
                )

            try:
                samples.append(tuple(float(value) for value in data))
            except (TypeError, ValueError) as error:
                raise RealManProbeError(
                    "rm_get_joint_degree returned a non-numeric joint value",
                    status=-1,
                ) from error

            if sample_index + 1 < sample_count:
                time.sleep(refresh_interval)

        result = ProbeResult(
            robot_ip=robot_ip,
            robot_port=robot_port,
            connect_level=connect_level,
            thread_mode=thread_mode,
            handle_id=handle_id,
            joint_samples=tuple(samples),
        )
        if print_every_n > 0:
            _print_samples(result, print_every_n)
        return result
    finally:
        if robot is not None:
            if handle is not None:
                robot.rm_delete_robot_arm()
            robot.rm_destroy()


def _validate_arguments(
    robot_ip: str,
    robot_port: int,
    connect_level: int,
    thread_mode: int,
    refresh_interval: float,
    print_every_n: int,
    sample_count: int,
) -> None:
    if not robot_ip:
        raise ValueError("robot_ip must not be empty")
    if not 1 <= robot_port <= 65535:
        raise ValueError("robot_port must be between 1 and 65535")
    if connect_level < 0:
        raise ValueError("connect_level must not be negative")
    if thread_mode not in (0, 1, 2):
        raise ValueError("thread_mode must be 0, 1, or 2")
    if refresh_interval < 0.0:
        raise ValueError("refresh_interval must not be negative")
    if print_every_n < 0:
        raise ValueError("print_every_n must not be negative")
    if sample_count < 1:
        raise ValueError("sample_count must be positive")


def _unpack_result(result: Any) -> tuple[int, Any]:
    if isinstance(result, (tuple, list)) and len(result) >= 2:
        return int(result[0]), result[1]
    if isinstance(result, int):
        return result, None
    return -1, None


def _print_samples(result: ProbeResult, print_every_n: int) -> None:
    for index, joints in enumerate(result.joint_samples, start=1):
        if index % print_every_n == 0 or index == len(result.joint_samples):
            print(f"sample={index} joint_degrees={list(joints)}")


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--robot-ip",
        default=os.environ.get("REALMAN_ROBOT_IP", ""),
        help="controller IPv4 address; defaults to REALMAN_ROBOT_IP",
    )
    parser.add_argument("--robot-port", type=int, default=8080)
    parser.add_argument("--connect-level", type=int, default=3)
    parser.add_argument(
        "--thread-mode",
        type=int,
        default=2,
        help="SDK enum value: 0=single, 1=dual, 2=triple",
    )
    parser.add_argument("--refresh-interval", type=float, default=0.05)
    parser.add_argument("--print-every", type=int, default=4, dest="print_every_n")
    parser.add_argument("--samples", type=int, default=8, dest="sample_count")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)
    if not args.robot_ip:
        print("--robot-ip or REALMAN_ROBOT_IP is required", file=sys.stderr)
        return 2

    try:
        result = minimal_connection_test(
            robot_ip=args.robot_ip,
            robot_port=args.robot_port,
            connect_level=args.connect_level,
            thread_mode=args.thread_mode,
            refresh_interval=args.refresh_interval,
            print_every_n=args.print_every_n,
            sample_count=args.sample_count,
        )
    except (RealManProbeError, ValueError) as error:
        status = ""
        if isinstance(error, RealManProbeError) and error.status is not None:
            status = f" status={error.status}"
        print(f"probe failed:{status} {error}", file=sys.stderr)
        return 1

    print(
        f"connected ip={result.robot_ip} port={result.robot_port} "
        f"level={result.connect_level} thread_mode={result.thread_mode} "
        f"handle_id={result.handle_id} samples={len(result.joint_samples)}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
