"""Pure, side-effect-free admission checks for recording sessions.

The recorder collects receipt times and device observations in ROS callbacks, then
passes immutable snapshots here.  Keeping policy outside the node makes a failed
preflight incapable of creating a session, opening MCAP, or touching a camera writer.
All timestamps are ROS 2 SYSTEM_TIME nanoseconds.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Mapping


def configured_required_topics(values: tuple[str, ...], fallback: tuple[str, ...]) -> tuple[str, ...]:
    """Drop ROS string-array placeholder values before selecting the fallback.

    ``rclpy`` needs ``[""]`` as the declaration default to infer a string array.
    That sentinel is not a topic and must not reach ``PreflightRequirements``.
    """
    configured = tuple(str(value) for value in values if str(value))
    return configured or tuple(str(value) for value in fallback if str(value))


@dataclass(frozen=True)
class PreflightRequirements:
    """Inputs that must be healthy before a recording session can start."""

    required_topics: tuple[str, ...]
    required_arms: tuple[str, ...]
    required_cameras: tuple[str, ...]
    max_age_ns: int
    min_free_space_bytes: int
    alignment_trigger_ns: int = 0

    def __post_init__(self) -> None:
        if self.max_age_ns < 0:
            raise ValueError("max_age_ns must be non-negative")
        if self.alignment_trigger_ns < 0:
            raise ValueError("alignment_trigger_ns must be non-negative")
        if self.min_free_space_bytes < 0:
            raise ValueError("min_free_space_bytes must be non-negative")
        for label, values in {
            "required_topics": self.required_topics,
            "required_arms": self.required_arms,
            "required_cameras": self.required_cameras,
        }.items():
            if any(not value for value in values) or len(set(values)) != len(values):
                raise ValueError(f"{label} must contain unique non-empty values")


@dataclass(frozen=True)
class PreflightDiagnostic:
    """One browser- and service-safe result from an admission check."""

    code: str
    subject: str
    ok: bool
    detail: str


@dataclass(frozen=True)
class PreflightResult:
    """Aggregated preflight result; all diagnostics are retained for operators."""

    checked_wall_ns: int
    diagnostics: tuple[PreflightDiagnostic, ...]

    @property
    def ready(self) -> bool:
        return all(diagnostic.ok for diagnostic in self.diagnostics)

    @property
    def summary(self) -> str:
        failures = [f"{item.code}:{item.subject}" for item in self.diagnostics if not item.ok]
        if failures:
            return ", ".join(failures)
        return "ready; alignment_required" if self.alignment_required else "ready"

    @property
    def alignment_required(self) -> bool:
        """Whether fresh sensor data exceeded the optional post-record alignment trigger."""
        return any(item.code == "alignment_required" for item in self.diagnostics)


class PreflightChecker:
    """Evaluate a captured health snapshot without ROS, filesystem, or subprocess I/O."""

    def __init__(self, requirements: PreflightRequirements) -> None:
        self._requirements = requirements

    def evaluate(
        self,
        *,
        now_wall_ns: int,
        last_receipt_wall_ns: Mapping[str, int],
        arm_connected: Mapping[str, bool],
        free_space_bytes: int,
        mcap_available: bool,
        camera_available: Mapping[str, bool],
    ) -> PreflightResult:
        if now_wall_ns < 0:
            raise ValueError("now_wall_ns must be non-negative")
        diagnostics: list[PreflightDiagnostic] = []
        for topic in self._requirements.required_topics:
            receipt = last_receipt_wall_ns.get(topic)
            fresh = isinstance(receipt, int) and 0 <= receipt <= now_wall_ns and (
                now_wall_ns - receipt <= self._requirements.max_age_ns
            )
            diagnostics.append(
                PreflightDiagnostic(
                    code="topic_fresh" if fresh else "topic_stale",
                    subject=topic,
                    ok=fresh,
                    detail="receipt is within freshness window" if fresh else "no recent receipt",
                )
            )
        sensor_receipts = [last_receipt_wall_ns.get(topic) for topic in self._requirements.required_topics]
        valid_receipts = [receipt for receipt in sensor_receipts if isinstance(receipt, int)]
        if len(valid_receipts) == len(self._requirements.required_topics) and valid_receipts:
            skew_ns = max(valid_receipts) - min(valid_receipts)
            if skew_ns > self._requirements.alignment_trigger_ns:
                diagnostics.append(PreflightDiagnostic(
                    code="alignment_required", subject="required_sensor_set", ok=True,
                    detail=f"receipt skew {skew_ns} ns exceeds alignment trigger {self._requirements.alignment_trigger_ns} ns",
                ))
        for arm in self._requirements.required_arms:
            connected = arm_connected.get(arm) is True
            diagnostics.append(
                PreflightDiagnostic(
                    code="arm_connected" if connected else "arm_disconnected",
                    subject=arm,
                    ok=connected,
                    detail="driver reports connected" if connected else "driver is disconnected or has not reported",
                )
            )
        storage_ok = free_space_bytes >= self._requirements.min_free_space_bytes
        diagnostics.append(
            PreflightDiagnostic(
                code="storage_ready" if storage_ok else "storage_low",
                subject="recording_root",
                ok=storage_ok,
                detail=f"{free_space_bytes} bytes available",
            )
        )
        diagnostics.append(
            PreflightDiagnostic(
                code="mcap_ready" if mcap_available else "mcap_unavailable",
                subject="rosbag2_mcap",
                ok=mcap_available,
                detail="MCAP backend available" if mcap_available else "MCAP backend cannot be opened",
            )
        )
        for camera in self._requirements.required_cameras:
            available = camera_available.get(camera) is True
            diagnostics.append(
                PreflightDiagnostic(
                    code="camera_ready" if available else "camera_unavailable",
                    subject=camera,
                    ok=available,
                    detail="probe produced a frame" if available else "probe did not produce a frame",
                )
            )
        return PreflightResult(checked_wall_ns=now_wall_ns, diagnostics=tuple(diagnostics))
