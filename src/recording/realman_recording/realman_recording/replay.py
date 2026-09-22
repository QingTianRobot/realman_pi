"""Offline Rerun replay of a finalized recording session.

Reads only a successfully exported LeRobot dataset and re-emits its observations on a
Rerun timeline. Raw ``state.mcap`` and ``videos/`` are exporter inputs/audit artifacts,
never a formal replay source. This tool never opens a ROS graph or touches any recorder
in-memory object, so it can run long after the recorder has shut down.

LeRobot and the Rerun SDK are imported lazily inside ``run`` so the pure lifecycle and
canonical-frame emission helpers remain importable and testable without either runtime.
"""
from __future__ import annotations

import argparse
import json
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Sequence


@dataclass(frozen=True)
class ReplayOptions:
    """Bound, validated CLI inputs for one replay run."""

    session_dir: Path
    start_ns: int | None = None
    end_ns: int | None = None
    speed: float = 1.0
    cameras: tuple[str, ...] = ()
    spawn_viewer: bool = True

    def __post_init__(self) -> None:
        if self.speed <= 0:
            raise ValueError("speed must be positive")
        if self.start_ns is not None and self.end_ns is not None and self.start_ns > self.end_ns:
            raise ValueError("start_ns must not exceed end_ns")


def validate_session(session_dir: Path) -> dict:
    """Return the finalized manifest iff the session is replayable.

    A replayable session is adopted and has a successful LeRobot export. Anything else
    is rejected rather than falling back to raw MCAP/JPEG artifacts.
    """
    manifest_path = session_dir / "manifest.json"
    if not manifest_path.is_file():
        raise ValueError("session has no finalized manifest.json")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if not isinstance(manifest, dict) or manifest.get("state") != "READY":
        raise ValueError("only READY sessions can be replayed")
    if manifest.get("decision") != "ADOPTED":
        raise ValueError("only ADOPTED sessions can be replayed")
    export = manifest.get("export")
    if not isinstance(export, dict) or export.get("state") != "SUCCEEDED":
        raise ValueError("session has no successful LeRobot export")
    result = export.get("result")
    dataset_root = Path(result).expanduser() if isinstance(result, str) and result else session_dir / "export" / "lerobot"
    if not dataset_root.is_dir():
        raise ValueError("successful LeRobot export directory is missing")
    return manifest


class ReplayPlayer:
    """Re-emit one finalized session's observations onto a Rerun timeline."""

    def __init__(self, options: ReplayOptions, *, rerun_module: Any | None = None) -> None:
        self._options = options
        self._manifest = validate_session(options.session_dir)
        export = self._manifest["export"]
        result = export.get("result")
        self._dataset_root = Path(result).expanduser() if isinstance(result, str) and result else options.session_dir / "export" / "lerobot"
        # Injectable for tests; resolved from the installed rerun-sdk in run().
        self._rerun = rerun_module

    def run(self) -> None:
        rerun = self._resolve_rerun()
        rerun.init("realman_recording_replay", spawn=self._options.spawn_viewer)
        try:
            self._replay_lerobot_dataset(rerun)
        finally:
            disconnect = getattr(rerun, "disconnect", None)
            if callable(disconnect):
                disconnect()

    def _replay_lerobot_dataset(self, rerun: Any) -> None:
        """Replay canonical fields through the same fixed LeRobot SDK used to write them."""
        try:
            from lerobot.datasets import LeRobotDataset
        except ImportError as error:
            raise RuntimeError("lerobot==0.6.1 is required for offline replay") from error
        receipt_path = self._options.session_dir / "export" / "lerobot-v3.json"
        if not receipt_path.is_file():
            raise ValueError("session is missing its canonical LeRobot export receipt")
        receipt = json.loads(receipt_path.read_text(encoding="utf-8"))
        try:
            repo_id = str(receipt["repo_id"])
            first_walltime_ns = int(receipt["first_walltime_ns"])
            episode_index = int(receipt["episode_index"])
        except (KeyError, TypeError, ValueError) as error:
            raise ValueError("LeRobot export receipt has no valid timeline provenance") from error
        dataset = LeRobotDataset(repo_id=repo_id, root=self._dataset_root, episodes=[episode_index])
        self._emit_summary(rerun)
        previous_walltime: int | None = None
        for index in range(len(dataset)):
            frame = dataset[index]
            walltime_ns = first_walltime_ns + round(index * 1_000_000_000 / dataset.fps)
            if self._options.start_ns is not None and walltime_ns < self._options.start_ns:
                continue
            if self._options.end_ns is not None and walltime_ns > self._options.end_ns:
                break
            self._pace(walltime_ns, previous_walltime)
            previous_walltime = walltime_ns
            rerun.set_time_nanos("wall_time", walltime_ns)
            self._emit_canonical_frame(rerun, frame)

    def _emit_canonical_frame(self, rerun: Any, frame: dict[str, Any]) -> None:
        """Log one LeRobot frame without assuming a model-specific state/action vector."""
        scalar_features = (
            "observation.joint_position", "observation.joint_velocity",
            "observation.ee_pose_base", "observation.ee_velocity_base",
            "observation.gripper_position", "action.command.cartesian_velocity",
            "action.command.gripper", "quality.sync_error_ns",
        )
        for feature in scalar_features:
            if feature in frame:
                rerun.log(f"recording/canonical/{feature.replace('.', '/')}", rerun.Scalars(self._as_list(frame[feature])))
        if "quality.valid" in frame:
            rerun.log("recording/canonical/quality/valid", rerun.Scalars(self._as_list(frame["quality.valid"])))
        for key, value in frame.items():
            if not key.startswith("observation.images."):
                continue
            camera = key.removeprefix("observation.images.")
            if self._options.cameras and camera not in self._options.cameras:
                continue
            image = getattr(rerun, "Image", None)
            if callable(image):
                rerun.log(f"recording/cameras/{camera}/image", image(self._as_image(value)))

    @staticmethod
    def _as_list(value: Any) -> list[float | int | bool]:
        """Convert tensor/ndarray/list feature values without importing a tensor stack."""
        for name in ("detach", "cpu"):
            method = getattr(value, name, None)
            if callable(method):
                value = method()
        method = getattr(value, "tolist", None)
        value = method() if callable(method) else value
        if isinstance(value, tuple):
            value = list(value)
        elif not isinstance(value, list):
            value = [value]
        # Feature vectors are 1-D by contract; preserve booleans for quality.valid.
        return [item for item in value if isinstance(item, (float, int, bool))]

    @staticmethod
    def _as_image(value: Any) -> Any:
        """Convert torch CHW outputs to image HWC only when an array API is available."""
        for name in ("detach", "cpu", "numpy"):
            method = getattr(value, name, None)
            if callable(method):
                value = method()
        shape = getattr(value, "shape", ())
        if len(shape) == 3 and shape[0] in {1, 3, 4}:
            try:
                return value.transpose(1, 2, 0)
            except TypeError:
                return value
        return value

    def _emit_summary(self, rerun: Any) -> None:
        """Emit one-time session drop/error counters from the finalized manifest.

        These counters live only in the manifest summary (the recorder never archived
        its own status), so replay surfaces them once at the session's start anchor
        rather than re-deriving them from the bag.
        """
        summary = self._manifest.get("summary", {})
        if not isinstance(summary, dict):
            return
        started_ns = int(self._manifest.get("started_realtime_ns", 0) or 0)
        rerun.set_time_nanos("wall_time", started_ns)
        for name in ("enqueued_samples", "accepted_samples", "dropped_samples", "write_errors"):
            value = summary.get(name)
            if isinstance(value, (int, float)) and not isinstance(value, bool):
                rerun.log(f"recording/status/{name}", rerun.Scalars([value]))

    def _resolve_rerun(self) -> Any:
        if self._rerun is not None:
            return self._rerun
        try:
            import rerun  # type: ignore[import-not-found]
        except ImportError as error:
            raise RuntimeError("rerun-sdk is required for offline replay") from error
        return rerun

    def _pace(self, receipt_ns: int, prev_timestamp_ns: int | None) -> None:
        """Sleep to honour ``--speed`` without distorting the wall_time timeline."""
        if self._options.speed == float("inf") or prev_timestamp_ns is None:
            return
        if self._options.speed <= 0 or receipt_ns <= prev_timestamp_ns:
            return
        delay = (receipt_ns - prev_timestamp_ns) / self._options.speed
        time.sleep(min(delay / 1e9, 1.0))
def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Replay one finalized recording session to Rerun")
    parser.add_argument("session_dir", help="path to a finalized recording session")
    parser.add_argument("--start-ns", type=int, default=None, help="wall-time lower bound (ns)")
    parser.add_argument("--end-ns", type=int, default=None, help="wall-time upper bound (ns)")
    parser.add_argument("--speed", type=float, default=1.0, help="playback speed multiplier")
    parser.add_argument("--camera", action="append", default=[], help="camera id to replay (repeatable)")
    parser.add_argument("--no-spawn", action="store_true", help="do not spawn the Rerun viewer")
    return parser


def main(args: Sequence[str] | None = None) -> int:
    parsed = build_arg_parser().parse_args(args)
    session_dir = Path(parsed.session_dir).expanduser().resolve()
    options = ReplayOptions(
        session_dir=session_dir,
        start_ns=parsed.start_ns,
        end_ns=parsed.end_ns,
        speed=parsed.speed,
        cameras=tuple(parsed.camera),
        spawn_viewer=not parsed.no_spawn,
    )
    ReplayPlayer(options).run()
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
