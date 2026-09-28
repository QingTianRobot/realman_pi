"""Unit tests for velocity_follow.cli."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from velocity_follow.cli import ARM_ADDRESSES, build_parser, main

# The report's own section header. The noise-floor note also mentions the
# displacement check in prose, so a bare phrase match would be ambiguous.
DISPLACEMENT_HEADER = "displacement check (independent"


def _base(tmp_path, *extra):
    return [
        "--mock",
        "--quiet",
        "--output-dir",
        str(tmp_path),
        "--run-name",
        "t",
        *extra,
    ]


def test_arm_addresses_cover_the_three_cell_arms():
    assert sorted(ARM_ADDRESSES) == ["l", "m", "r"]
    assert all(address.startswith("192.168.30.") for address in ARM_ADDRESSES.values())


def test_motion_is_opt_in():
    arguments = build_parser().parse_args([])
    # Connecting and recording are safe; moving a shared-cell arm is not.
    assert arguments.execute is False
    assert arguments.mock is False
    # Matches the l/r velocity_control_period_ms in config/ros/realman_motion.yaml.
    assert arguments.period_ms == 10
    assert arguments.frame == "work"
    assert arguments.follow is False


@pytest.mark.parametrize(
    "extra",
    [
        ["--period-ms", "0"],
        ["--sample-hz", "0"],
        ["--max-run-sec", "0"],
        ["--key-hold-ms", "0"],
        ["--max-linear-speed", "0"],
        ["--max-angular-accel", "-1"],
    ],
)
def test_non_positive_settings_are_rejected(tmp_path, extra):
    with pytest.raises(SystemExit):
        main(_base(tmp_path, *extra))


def test_a_key_speed_above_the_ceiling_is_rejected_up_front(tmp_path):
    # Otherwise every press is clipped and the report shows a gain shortfall
    # that is really a configuration mistake.
    with pytest.raises(SystemExit):
        main(_base(tmp_path, "--key-linear-speed", "0.2", "--max-linear-speed", "0.05"))
    with pytest.raises(SystemExit):
        main(_base(tmp_path, "--key-angular-speed", "1.0", "--max-angular-speed", "0.25"))


def test_keyboard_input_without_a_terminal_fails_with_advice(tmp_path, capsys):
    # pytest captures stdin, so there is no TTY here: the same situation as a
    # systemd unit or a plain `ssh host cmd` without -t.
    with pytest.raises(SystemExit):
        main(_base(tmp_path))
    assert "interactive terminal" in capsys.readouterr().err


def test_a_mock_profile_run_writes_a_csv_a_summary_and_a_report(tmp_path, capsys):
    code = main(
        _base(
            tmp_path,
            "--execute",
            "--period-ms",
            "10",
            "--sample-hz",
            "200",
            "--profile",
            "vx|hold|0.02|0.4|0|0.1|held",
        )
    )
    assert code in (0, 1)
    output = capsys.readouterr().out
    assert "DRY RUN" not in output
    assert "THE ARM WILL MOVE" in output
    assert DISPLACEMENT_HEADER in output

    csv_path = tmp_path / "l_t.csv"
    json_path = tmp_path / "l_t.json"
    assert csv_path.is_file()
    summary = json.loads(json_path.read_text())
    assert summary["mock"] is True
    assert summary["executed"] is True
    assert summary["control_period_ms"] == 10
    assert summary["stop_reason"] == "profile completed"
    assert summary["displacement"]["commanded_distance_m"] > 0.0


def test_a_dry_mock_run_says_so_and_reports_nothing_to_measure(tmp_path, capsys):
    code = main(_base(tmp_path, "--profile", "vx|hold|0.02|0.2|0|0.05|held"))
    output = capsys.readouterr().out
    assert "DRY RUN" in output
    # Nothing was commanded to the arm, so there is no following to judge.
    assert code == 2
    assert "nothing to measure" in output
    assert DISPLACEMENT_HEADER not in output


def test_the_report_warns_about_the_work_frame_assumption(tmp_path, capsys):
    main(_base(tmp_path, "--execute", "--profile", "vx|hold|0.02|0.3|0|0.05|held"))
    assert "identity" in capsys.readouterr().out


def test_pinning_a_work_frame_drops_the_assumption_warning(tmp_path, capsys):
    main(
        _base(
            tmp_path,
            "--execute",
            "--work-frame",
            "cell",
            "--profile",
            "vx|hold|0.02|0.3|0|0.05|held",
        )
    )
    output = capsys.readouterr().out
    assert DISPLACEMENT_HEADER in output
    assert "identity" not in output


def test_an_unreachable_controller_exits_without_a_traceback(tmp_path, capsys):
    code = main(
        [
            "--ip",
            "203.0.113.1",
            "--quiet",
            "--output-dir",
            str(tmp_path),
            "--profile",
            "vx|hold|0.02|0.2",
        ]
    )
    assert code == 2
    assert "error:" in capsys.readouterr().err
