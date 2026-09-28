"""``python3 -m velocity_follow`` — keyboard-driven velocity following test.

Standard library only, apart from the RealMan SDK itself, which is needed only
when actually driving a robot. ``--mock`` runs the whole tool offline.

Safety: motion is opt-in. Without ``--execute`` the tool connects, samples the
arm and records the command stream it *would* have sent, and the arm never
moves. The loop also sends zeros and a slow stop on every exit path, including
Ctrl-C and an unhandled error.
"""

from __future__ import annotations

import argparse
from datetime import datetime
import json
import math
from pathlib import Path
import sys
from typing import Sequence

from .arm import ArmError, FRAME_TYPES, open_arm
from .key_bindings import describe_bindings, load_key_bindings
from .metrics import analyze_run, displacement_check, press_release_responses
from .profiles import ProfileRunner, parse_profile
from .report import edge_verdict, format_run, run_summary, segment_verdict
from .runner import (
    PoseVelocitySampler,
    RunSettings,
    VelocityFollowRun,
    measure_noise_floor,
)
from .samples import CsvRecorder, load_samples
from .terminal_keyboard import KeyHoldTracker, RawTerminalReader


REPO_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_LAYOUT_FILE = REPO_ROOT / "config" / "ros" / "keyboard_control.yaml"
DEFAULT_OUTPUT_DIR = REPO_ROOT / "logs" / "velocity-follow"

# Matches config/ros/realman_driver.yaml. The l/m/r mapping is the physical
# left-to-right layout of the three-arm cell.
ARM_ADDRESSES = {
    "l": "192.168.30.123",
    "m": "192.168.30.125",
    "r": "192.168.30.124",
}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="python3 -m velocity_follow",
        description=(
            "Hold a key, move the arm, and measure whether it kept up with the "
            "Cartesian velocity that was commanded."
        ),
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    connection = parser.add_argument_group("connection")
    connection.add_argument(
        "--arm",
        choices=sorted(ARM_ADDRESSES),
        default="l",
        help="Which arm of the cell to drive; also picks the default IP and key set.",
    )
    connection.add_argument("--ip", default="", help="Controller IP; overrides --arm's default.")
    connection.add_argument("--port", type=int, default=8080, help="RealMan API2 control port.")
    connection.add_argument(
        "--thread-mode",
        default="RM_TRIPLE_MODE_E",
        help="SDK rm_thread_mode_e member used when creating the handle.",
    )
    connection.add_argument(
        "--mock",
        action="store_true",
        help="Run against a simulated arm instead of hardware; needs no SDK.",
    )

    motion = parser.add_argument_group("motion")
    motion.add_argument(
        "--execute",
        action="store_true",
        help="Actually move the arm. Without it nothing is sent to the controller.",
    )
    motion.add_argument(
        "--frame",
        choices=sorted(FRAME_TYPES),
        default="work",
        help="Frame the velocity is expressed in; the SDK offers tool or work.",
    )
    motion.add_argument(
        "--work-frame",
        default="",
        help="Select this controller work frame before streaming; empty keeps the current one.",
    )
    motion.add_argument(
        "--period-ms",
        type=int,
        default=10,
        help=(
            "Command period. The default matches the l/r velocity_control_period_ms "
            "in realman_motion.yaml so a run measures production behaviour."
        ),
    )
    motion.add_argument(
        "--velocity-window-ms",
        type=float,
        default=100.0,
        help=(
            "Sliding window the measured velocity is least-squares fitted over. "
            "Smaller follows faster changes; larger rejects encoder quantisation "
            "and read-latency jitter. Below ~3 controller round trips it is noise."
        ),
    )
    motion.add_argument(
        "--baseline-sec",
        type=float,
        default=1.0,
        help=(
            "Watch the stationary arm this long before starting, to measure how "
            "much apparent velocity is just pose-differencing noise. 0 skips it."
        ),
    )
    motion.add_argument(
        "--sample-hz",
        type=float,
        default=100.0,
        help="Pose sampling rate; sets the resolution of lag and rise time.",
    )
    motion.add_argument(
        "--follow",
        action="store_true",
        help="Use the SDK high-follow mode instead of the low-follow default.",
    )
    motion.add_argument("--trajectory-mode", type=int, default=0, help="SDK trajectory mode.")
    motion.add_argument("--radio", type=int, default=0, help="SDK trajectory smoothing radio.")
    motion.add_argument(
        "--avoid-singularity",
        type=int,
        default=1,
        help="rm_set_movev_canfd_init singularity-avoidance flag.",
    )

    limits = parser.add_argument_group("limits (mirror config/ros/realman_motion.yaml)")
    limits.add_argument("--max-linear-speed", type=float, default=0.05, help="m/s ceiling.")
    limits.add_argument("--max-angular-speed", type=float, default=0.25, help="rad/s ceiling.")
    limits.add_argument("--max-linear-accel", type=float, default=0.10, help="m/s^2 ramp limit.")
    limits.add_argument("--max-angular-accel", type=float, default=0.50, help="rad/s^2 ramp limit.")

    keyboard = parser.add_argument_group("keyboard")
    keyboard.add_argument(
        "--key-linear-speed",
        type=float,
        default=0.02,
        help="Speed one linear key commands; the Web keyboard page also uses 0.02 m/s.",
    )
    keyboard.add_argument(
        "--key-angular-speed", type=float, default=0.10, help="Speed one rotation key commands."
    )
    keyboard.add_argument(
        "--key-hold-ms",
        type=int,
        default=250,
        help="A terminal reports no key release; an axis stops this long after the last repeat.",
    )
    keyboard.add_argument(
        "--layout",
        default=str(DEFAULT_LAYOUT_FILE),
        help="keyboard_control.yaml to read the key map from; falls back to a built-in copy.",
    )

    scripted = parser.add_argument_group("scripted alternative to the keyboard")
    scripted.add_argument(
        "--profile",
        action="append",
        default=None,
        metavar="axis|waveform|amp|dur[|freq[|settle[|label]]]",
        help=(
            "Run a repeatable waveform instead of reading keys. Repeatable. "
            "Waveforms: hold, step, ramp, square, sine, chirp."
        ),
    )
    scripted.add_argument(
        "--settle-sec",
        type=float,
        default=2.0,
        help="Zero-command tail appended to a profile segment that does not set its own.",
    )

    output = parser.add_argument_group("output")
    output.add_argument("--output-dir", default=str(DEFAULT_OUTPUT_DIR), help="Where runs land.")
    output.add_argument("--run-name", default="", help="Run identifier; empty uses a timestamp.")
    output.add_argument(
        "--max-run-sec", type=float, default=300.0, help="Hard ceiling on one run."
    )
    output.add_argument("--quiet", action="store_true", help="Suppress the live status line.")
    return parser


def _validate(parser: argparse.ArgumentParser, arguments: argparse.Namespace) -> None:
    if arguments.period_ms <= 0:
        parser.error("--period-ms must be positive")
    if arguments.sample_hz <= 0.0:
        parser.error("--sample-hz must be positive")
    if arguments.max_run_sec <= 0.0:
        parser.error("--max-run-sec must be positive")
    if arguments.baseline_sec < 0.0:
        parser.error("--baseline-sec must not be negative")
    if arguments.velocity_window_ms <= 0.0:
        parser.error("--velocity-window-ms must be positive")
    if arguments.key_hold_ms <= 0:
        parser.error("--key-hold-ms must be positive")
    for name in (
        "max_linear_speed",
        "max_angular_speed",
        "max_linear_accel",
        "max_angular_accel",
        "key_linear_speed",
        "key_angular_speed",
    ):
        value = getattr(arguments, name)
        if not math.isfinite(value) or value <= 0.0:
            parser.error(f"--{name.replace('_', '-')} must be positive and finite")
    if arguments.key_linear_speed > arguments.max_linear_speed:
        parser.error(
            "--key-linear-speed exceeds --max-linear-speed, so every key press would be "
            "clipped and the run would show a gain shortfall that is really a config error"
        )
    if arguments.key_angular_speed > arguments.max_angular_speed:
        parser.error("--key-angular-speed exceeds --max-angular-speed")


def main(argv: Sequence[str] | None = None) -> int:
    parser = build_parser()
    arguments = parser.parse_args(argv)
    _validate(parser, arguments)

    settings = RunSettings(
        control_period_ms=arguments.period_ms,
        sample_hz=arguments.sample_hz,
        max_linear_speed_mps=arguments.max_linear_speed,
        max_angular_speed_radps=arguments.max_angular_speed,
        max_linear_accel_mps2=arguments.max_linear_accel,
        max_angular_accel_radps2=arguments.max_angular_accel,
        follow=arguments.follow,
        trajectory_mode=arguments.trajectory_mode,
        radio=arguments.radio,
        frame_type=FRAME_TYPES[arguments.frame],
        work_frame=arguments.work_frame,
        avoid_singularity=arguments.avoid_singularity,
        max_run_sec=arguments.max_run_sec,
        execute=arguments.execute,
        status_line=not arguments.quiet,
    )

    profile = None
    keys = None
    reader = None
    if arguments.profile:
        profile = ProfileRunner(
            parse_profile(arguments.profile, default_settle_sec=arguments.settle_sec)
        )
        source = "scripted profile"
    else:
        bindings, source = load_key_bindings(arguments.layout, arguments.arm)
        keys = KeyHoldTracker(
            bindings,
            hold_timeout_sec=arguments.key_hold_ms / 1000.0,
            linear_speed_mps=arguments.key_linear_speed,
            angular_speed_radps=arguments.key_angular_speed,
        )
        reader = RawTerminalReader()
        if not reader.supported:
            parser.error(
                "keyboard control needs an interactive terminal. Run it from a shell "
                "(ssh -t for a remote host), or pass --profile to run a scripted waveform."
            )

    name = arguments.run_name or datetime.now().strftime("%Y%m%d_%H%M%S")
    directory = Path(arguments.output_dir)
    csv_path = directory / f"{arguments.arm}_{name}.csv"
    json_path = directory / f"{arguments.arm}_{name}.json"

    ip = arguments.ip or ARM_ADDRESSES[arguments.arm]
    print(f"arm            : {arguments.arm} at {ip}:{arguments.port}"
          + ("  [MOCK]" if arguments.mock else ""))
    print(
        f"command period : {arguments.period_ms} ms   pose sampling: "
        f"{arguments.sample_hz:.0f} Hz   velocity window: {arguments.velocity_window_ms:.0f} ms"
    )
    print(f"frame          : {arguments.frame}"
          + (f" ({arguments.work_frame})" if arguments.work_frame else ""))
    print(f"follow mode    : {'high-follow' if arguments.follow else 'low-follow'}")
    print(f"recording to   : {csv_path}")
    if keys is not None:
        print(f"key layout     : {source}")
        print(describe_bindings(keys.bindings))
        print("hold a key to move, release to stop, press Esc or Ctrl-C to finish")
    else:
        print(f"input          : {source}")
    if not arguments.execute:
        print(
            "\nDRY RUN: the arm will not move. Commands are shaped and recorded, and\n"
            "         pose sampling still runs. Add --execute to drive the arm.\n"
        )
    else:
        print("\n*** --execute is set: THE ARM WILL MOVE. Ctrl-C stops it. ***\n")

    try:
        arm = open_arm(ip, arguments.port, thread_mode=arguments.thread_mode, mock=arguments.mock)
    except ArmError as error:
        print(f"error: {error}", file=sys.stderr)
        return 2

    sampler = PoseVelocitySampler(
        arm,
        rate_hz=arguments.sample_hz,
        window_sec=arguments.velocity_window_ms / 1000.0,
    )
    recorder = CsvRecorder(csv_path)
    status = (lambda line: print(f"\r{line}", end="", flush=True)) if settings.status_line else None
    try:
        if arguments.execute:
            if arguments.work_frame:
                arm.change_work_frame(arguments.work_frame)
            arm.start_velocity(
                frame_type=settings.frame_type,
                period_ms=settings.control_period_ms,
                avoid_singularity=settings.avoid_singularity,
            )
        sampler.start()
        noise = None
        if arguments.baseline_sec > 0.0:
            print(
                f"measuring the noise floor for {arguments.baseline_sec:.1f} s "
                "(keep the arm still)..."
            )
            noise = measure_noise_floor(sampler, arguments.baseline_sec)
            if noise is None:
                print("  no usable samples; continuing without a noise floor")
            else:
                print(
                    f"  {noise.linear_stdev_mps * 1000:.2f} mm/s and "
                    f"{noise.angular_stdev_radps * 1000:.2f} mrad/s (1 sigma, "
                    f"{noise.samples} samples)"
                )
        run = VelocityFollowRun(
            arm, recorder, settings, keys=keys, reader=reader, profile=profile, on_status=status
        )
        if reader is not None:
            with reader:
                outcome = run.execute(sampler)
        else:
            outcome = run.execute(sampler)
    except ArmError as error:
        print(f"\nerror: {error}", file=sys.stderr)
        return 2
    finally:
        sampler.stop()
        recorder.close()
        arm.disconnect()
        if settings.status_line:
            print()

    return _report(arguments, settings, outcome, csv_path, json_path, noise)


def _report(
    arguments: argparse.Namespace,
    settings: RunSettings,
    outcome,
    csv_path: Path,
    json_path: Path,
    noise=None,
) -> int:
    print(f"\nrun stopped: {outcome.stop_reason}")
    if outcome.mean_read_ms > 0.0:
        print(
            f"controller round trip: {outcome.mean_read_ms:.1f} ms per pose read "
            f"(velocity window {arguments.velocity_window_ms:.0f} ms covers "
            f"{arguments.velocity_window_ms / outcome.mean_read_ms:.1f} of them)"
        )
    if outcome.send_failures:
        print(f"warning: {outcome.send_failures} velocity commands were rejected by the controller")
    if outcome.read_failures:
        print(f"warning: {outcome.read_failures} pose reads failed")

    samples = load_samples(csv_path)
    metrics = analyze_run(samples, period_sec=settings.period_sec)
    edges = press_release_responses(samples, noise=noise)
    text = format_run(
        metrics,
        period_sec=settings.period_sec,
        title=f"Run report: {csv_path.name}",
        noise=noise,
        edges=edges,
    )
    summary = run_summary(metrics, noise, edges)
    summary.update(
        {
            "arm": arguments.arm,
            "mock": arguments.mock,
            "executed": outcome.executed,
            "frame": arguments.frame,
            "work_frame": arguments.work_frame,
            "follow": arguments.follow,
            "control_period_ms": settings.control_period_ms,
            "sample_hz": arguments.sample_hz,
            "velocity_window_ms": arguments.velocity_window_ms,
            "mean_read_ms": outcome.mean_read_ms,
            "stop_reason": outcome.stop_reason,
            "send_failures": outcome.send_failures,
            "read_failures": outcome.read_failures,
            "csv": str(csv_path),
        }
    )

    if outcome.executed and outcome.actual_displacement is not None:
        check = displacement_check(outcome.commanded_integral, outcome.actual_displacement)
        summary["displacement"] = {
            "commanded_m": list(check.commanded_m),
            "actual_m": list(check.actual_m),
            "commanded_distance_m": check.commanded_distance_m,
            "actual_distance_m": check.actual_distance_m,
            "follow_ratio": check.follow_ratio,
            "direction_error_deg": check.direction_error_deg,
            "shortfall_m": check.shortfall_m,
        }
        ratio = "n/a" if check.follow_ratio is None else f"{check.follow_ratio:.3f}"
        angle = (
            "n/a"
            if check.direction_error_deg is None
            else f"{check.direction_error_deg:.1f} deg"
        )
        text += (
            "\n\ndisplacement check (independent of the sampling rate; whole run,\n"
            "  so start lag and post-release coast can cancel out - see above)\n"
            f"  commanded travel : {check.commanded_distance_m * 1000:.2f} mm "
            f"{tuple(round(v * 1000, 2) for v in check.commanded_m)}\n"
            f"  actual travel    : {check.actual_distance_m * 1000:.2f} mm "
            f"{tuple(round(v * 1000, 2) for v in check.actual_m)}\n"
            f"  follow ratio     : {ratio}\n"
            f"  direction error  : {angle}\n"
            f"  shortfall        : {check.shortfall_m * 1000:.2f} mm"
        )
        if arguments.frame == "work" and not arguments.work_frame:
            text += (
                "\n  note: the command was expressed in the controller's current work "
                "frame while\n        the measurement is the base-frame FK pose. These "
                "agree only while that\n        work frame is the identity; pass "
                "--work-frame to pin a known one."
            )

    json_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(summary, indent=2, sort_keys=True, default=str), encoding="utf-8")
    print()
    print(text)
    print(f"\ncsv     : {csv_path}")
    print(f"summary : {json_path}")

    if not metrics.segments:
        return 2
    steady = all(segment_verdict(segment, noise)[0] for segment in metrics.segments)
    # For keyboard control the transients are what "keeping up" means, so a
    # correct steady speed with a slow start or a long coast still fails.
    transient = all(edge_verdict(edge)[0] for edge in edges)
    return 0 if steady and transient else 1


if __name__ == "__main__":
    sys.exit(main())
