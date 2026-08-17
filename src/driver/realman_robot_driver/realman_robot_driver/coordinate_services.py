"""ROS-neutral coordinate operation boundary shared by service callbacks."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .coordinate_manager import CoordinateManager, CoordinateVerification


@dataclass(frozen=True)
class CoordinateOperationResult:
    success: bool
    matched: bool
    api2_status: int
    active_name: str
    current_tool: str | None
    current_work: str | None
    message: str


def run_coordinate_operation(
    manager: CoordinateManager,
    adapter: Any,
    ownership: Any,
    arm: str,
    operation: str,
    name: str = "",
) -> CoordinateOperationResult:
    """Run one coordinate operation without allowing controller access while busy."""
    if operation not in {"verify", "apply", "select_tool", "select_work"}:
        raise ValueError(f"unknown coordinate operation: {operation}")
    if ownership.is_busy(arm):
        return _busy_result(arm)

    if operation == "verify":
        if not ownership.acquire(arm):
            return _busy_result(arm)
        try:
            verification = manager.verify(adapter, arm)
        finally:
            ownership.release(arm)
    elif operation == "apply":
        verification = manager.apply(adapter, arm)
    elif operation == "select_tool":
        verification = manager.select_tool(adapter, arm, name)
    else:
        verification = manager.select_work(adapter, arm, name)

    return _operation_result(operation, verification)


def run_startup_coordinate_policy(
    manager: CoordinateManager,
    adapter: Any,
    ownership: Any,
    arm: str,
) -> CoordinateOperationResult:
    """Always verify after connect, then apply only under explicit config policy."""
    verification = _operation_result(
        "verify", manager.verify(adapter, arm)
    )
    if manager.policy.on_start == "apply":
        return run_coordinate_operation(manager, adapter, ownership, arm, "apply")
    return verification


def _operation_result(
    operation: str, verification: CoordinateVerification
) -> CoordinateOperationResult:
    if operation == "verify":
        success = verification.status == 0
        active_name = ""
    elif operation == "select_tool":
        success = verification.status == 0 and verification.tool_matched
        active_name = verification.current_tool or ""
    elif operation == "select_work":
        success = verification.status == 0 and verification.work_matched
        active_name = verification.current_work or ""
    else:
        success = verification.status == 0 and verification.matched
        active_name = ""
    return CoordinateOperationResult(
        success=success,
        matched=verification.matched,
        api2_status=verification.status,
        active_name=active_name,
        current_tool=verification.current_tool,
        current_work=verification.current_work,
        message=verification.message,
    )


def _busy_result(arm: str) -> CoordinateOperationResult:
    return CoordinateOperationResult(
        success=False,
        matched=False,
        api2_status=-1,
        active_name="",
        current_tool=None,
        current_work=None,
        message=f"arm {arm} is busy; coordinate operation refused",
    )
