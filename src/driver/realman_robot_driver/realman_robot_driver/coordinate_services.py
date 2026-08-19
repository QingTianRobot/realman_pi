"""ROS-neutral coordinate operation boundary shared by service callbacks."""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Any, Callable

from .coordinate_manager import CoordinateManager, CoordinateVerification


@dataclass(frozen=True)
class CoordinateOperationResult:
    success: bool
    matched: bool
    tool_matched: bool
    work_matched: bool
    api2_status: int
    active_name: str
    expected_tool: str
    current_tool: str | None
    expected_work: str
    current_work: str | None
    message: str


class CoordinateOperation(str, Enum):
    VERIFY = "verify"
    APPLY = "apply"
    SELECT_TOOL = "select_tool"
    SELECT_WORK = "select_work"


def run_coordinate_operation(
    manager: CoordinateManager,
    adapter: Any,
    ownership: Any,
    arm: str,
    operation: CoordinateOperation | str,
    name: str = "",
    *,
    publish_result: Callable[[CoordinateOperationResult], None] | None = None,
) -> CoordinateOperationResult:
    """Run one coordinate operation without allowing controller access while busy."""
    try:
        selected_operation = CoordinateOperation(operation)
    except ValueError as error:
        raise ValueError(f"unknown coordinate operation: {operation}") from error

    def publish_verification(verification: CoordinateVerification) -> None:
        if publish_result is not None:
            publish_result(_operation_result(selected_operation, verification))

    if selected_operation is CoordinateOperation.VERIFY:
        try:
            acquired = ownership.acquire(arm)
        except Exception as error:
            return _operation_result(
                selected_operation,
                manager.fail_closed(arm, f"arm {arm} ownership acquire failed: {error}"),
            )
        if not acquired:
            return _operation_result(
                selected_operation,
                manager.fail_closed(arm, f"arm {arm} is busy; coordinate operation refused"),
            )
        try:
            verification = manager.verify(
                adapter,
                arm,
                verified_result_callback=publish_verification,
            )
        except Exception as error:
            verification = manager.fail_closed(
                arm, f"coordinate verification failed: {error}"
            )
        try:
            ownership.release(arm)
        except Exception as error:
            verification = manager.fail_closed(
                arm, f"arm {arm} ownership release failed: {error}"
            )
    elif selected_operation is CoordinateOperation.APPLY:
        verification = manager.apply(
            adapter,
            arm,
            verified_result_callback=publish_verification,
        )
    elif selected_operation is CoordinateOperation.SELECT_TOOL:
        verification = manager.select_tool(
            adapter,
            arm,
            name,
            verified_result_callback=publish_verification,
        )
    else:
        verification = manager.select_work(
            adapter,
            arm,
            name,
            verified_result_callback=publish_verification,
        )

    return _operation_result(selected_operation, verification)


def run_startup_coordinate_policy(
    manager: CoordinateManager,
    adapter: Any,
    ownership: Any,
    arm: str,
    *,
    publish_result: Callable[[CoordinateOperationResult], None] | None = None,
) -> CoordinateOperationResult:
    """Always verify after connect, then apply only under explicit config policy."""
    verification = run_coordinate_operation(
        manager,
        adapter,
        ownership,
        arm,
        CoordinateOperation.VERIFY,
        publish_result=publish_result,
    )
    if verification.api2_status != 0 or verification.matched:
        return verification
    if manager.policy.on_start == "apply":
        return run_coordinate_operation(
            manager,
            adapter,
            ownership,
            arm,
            CoordinateOperation.APPLY,
            publish_result=publish_result,
        )
    return verification


def _operation_result(
    operation: CoordinateOperation, verification: CoordinateVerification
) -> CoordinateOperationResult:
    if operation is CoordinateOperation.VERIFY:
        success = verification.status == 0
        active_name = ""
    elif operation is CoordinateOperation.SELECT_TOOL:
        success = verification.status == 0 and verification.tool_matched
        active_name = verification.current_tool or ""
    elif operation is CoordinateOperation.SELECT_WORK:
        success = verification.status == 0 and verification.work_matched
        active_name = verification.current_work or ""
    else:
        success = verification.status == 0 and verification.matched
        active_name = ""
    return CoordinateOperationResult(
        success=success,
        matched=verification.matched,
        tool_matched=verification.tool_matched,
        work_matched=verification.work_matched,
        api2_status=verification.status,
        active_name=active_name,
        expected_tool=verification.expected_tool,
        current_tool=verification.current_tool,
        expected_work=verification.expected_work,
        current_work=verification.current_work,
        message=verification.message,
    )
