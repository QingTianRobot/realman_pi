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
    ownership_already_acquired: bool = False,
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
        if ownership_already_acquired:
            acquired = True
        else:
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
        if not ownership_already_acquired:
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
            ownership_already_acquired=ownership_already_acquired,
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
    ownership_already_acquired: bool = False,
) -> CoordinateOperationResult:
    """Verify after connect and reconcile any safe coordinate mismatch.

    The configured profile is authoritative for motion. A successful readback
    that differs from the profile is reconciled immediately by writing and
    selecting the configured tool/work frames, regardless of the legacy
    ``policy.on_start`` value. Read failures remain fail-closed and are never
    followed by blind writes.
    """
    verification = run_coordinate_operation(
        manager,
        adapter,
        ownership,
        arm,
        CoordinateOperation.VERIFY,
        publish_result=publish_result,
        ownership_already_acquired=ownership_already_acquired,
    )
    if verification.api2_status != 0 or verification.matched:
        return verification
    return run_coordinate_operation(
        manager,
        adapter,
        ownership,
        arm,
        CoordinateOperation.APPLY,
        publish_result=publish_result,
        ownership_already_acquired=ownership_already_acquired,
    )


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
