from __future__ import annotations

import sys

import pytest

from realman_training.runner import CommandFailed, Runner, compact

PY = sys.executable


def test_run_and_check_capture_output():
    runner = Runner()
    done = runner.run([PY, "-c", "import sys; print('out'); print('err', file=sys.stderr); sys.exit(3)"])
    assert (done.returncode, done.stdout.strip(), done.stderr.strip()) == (3, "out", "err")
    assert runner.check([PY, "-c", "print('ok')"]).strip() == "ok"
    with pytest.raises(CommandFailed, match="exited 3.*err"):
        runner.check([PY, "-c", "import sys; print('err', file=sys.stderr); sys.exit(3)"])


def test_env_is_added_to_the_inherited_environment():
    out = Runner().check([PY, "-c", "import os; print(os.environ['RT_X'], 'PATH' in os.environ)"], env={"RT_X": "1"})
    assert out.split() == ["1", "True"]


def test_stream_merges_stderr_and_feeds_stdin():
    lines = []
    code = Runner().stream(
        [PY, "-c", "import sys; print(sys.stdin.read().upper()); print('e', file=sys.stderr)"], lines.append, input="hi"
    )
    assert code == 0 and sorted(lines) == ["HI", "e"]


def test_pipe_counts_bytes_and_reports_the_failing_side(tmp_path):
    seen = []
    target = tmp_path / "copy"
    n = Runner().pipe([PY, "-c", "print('x' * 9999)"], [PY, "-c", f"import sys; open({str(target)!r}, 'w').write(sys.stdin.read())"], seen.append, chunk_size=1000)
    assert n == 10000 and seen[-1] == 10000 and len(seen) >= 10
    assert target.read_text() == "x" * 9999 + "\n"
    with pytest.raises(CommandFailed, match="exited 2"):
        Runner().pipe([PY, "-c", "import sys; sys.exit(2)"], [PY, "-c", "import sys; sys.stdin.read()"], seen.append)
    with pytest.raises(CommandFailed, match="exited 4"):
        Runner().pipe([PY, "-c", "print('x')"], [PY, "-c", "import sys; sys.exit(4)"], seen.append)


def test_compact_keeps_the_last_progress_segment():
    assert compact("a 1%\rb 50%\rc 100%") == "c 100%"
    assert compact("plain") == "plain"
