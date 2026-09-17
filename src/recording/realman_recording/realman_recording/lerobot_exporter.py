"""Explicit asynchronous LeRobot export boundary.

LeRobot conversion is deliberately last in the platform implementation order.  This
module validates the raw-session contract and fails truthfully until the exporter is
implemented against the selected LeRobot runtime, so adoption can never be reported as
a generated training dataset merely because a placeholder file was written.
"""
from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path

from .json_io import atomic_json_write
from .lerobot_align import AlignmentPolicy


STREAM_POLICIES = {
    "image": None,
    "arm_state": AlignmentPolicy.LINEAR,
    "arm_action": AlignmentPolicy.LINEAR,
    "gripper": AlignmentPolicy.FORWARD_FILL,
}


@dataclass(frozen=True)
class ExportRequest:
    session_dir: Path
    output_dir: Path
    target_fps: float


class LeRobotExporter:
    """Validate a finalized session before the isolated export worker runs."""

    def export(self, request: ExportRequest) -> Path:
        manifest = self._load_final_manifest(request.session_dir)
        if request.target_fps <= 0:
            raise ValueError("target_fps must be positive")
        request.output_dir.mkdir(mode=0o750, parents=True, exist_ok=True)
        metadata_path = request.output_dir / "export-not-implemented.json"
        atomic_json_write(
            metadata_path,
            {
                "source_session_id": manifest["session_id"],
                "status": "NOT_IMPLEMENTED",
                "target_fps": request.target_fps,
            },
        )
        raise RuntimeError(
            "LeRobot export is not implemented yet; session remains raw and export is marked FAILED"
        )

    @staticmethod
    def _load_final_manifest(session_dir: Path) -> dict:
        manifest_path = session_dir / "manifest.json"
        if not manifest_path.is_file():
            raise ValueError("session must have finalized manifest.json before export")
        payload = json.loads(manifest_path.read_text(encoding="utf-8"))
        if not isinstance(payload, dict) or payload.get("state") != "READY":
            raise ValueError("only READY sessions can be exported")
        if not isinstance(payload.get("session_id"), str):
            raise ValueError("manifest has no valid session_id")
        return payload


def main(args: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Export one finalized recording session to LeRobot")
    parser.add_argument("session_dir")
    parser.add_argument("--output-dir", default="")
    parser.add_argument("--target-fps", type=float, default=10.0)
    parsed = parser.parse_args(args)
    session_dir = Path(parsed.session_dir).expanduser().resolve()
    output_dir = Path(parsed.output_dir).expanduser().resolve() if parsed.output_dir else session_dir / "export" / "lerobot"
    result = LeRobotExporter().export(ExportRequest(session_dir, output_dir, parsed.target_fps))
    print(result)
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
