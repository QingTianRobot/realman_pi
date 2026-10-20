from __future__ import annotations

import sys
from unittest import mock

import pytest

import realman_training.runner as runner_mod
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


def test_pipe_reports_producer_when_it_fails_while_consumer_also_fails(tmp_path):
    """When the consumer fails and the producer also exited non-zero, the error should name the producer."""
    seen = []
    with pytest.raises(CommandFailed) as exc_info:
        Runner().pipe(
            [PY, "-c", "import sys; print('hello'); sys.stderr.write('prod err\\n'); sys.stderr.flush(); sys.exit(3)"],
            [PY, "-c", "import sys; sys.stdin.read(); sys.exit(4)"],
            seen.append,
        )
    err = exc_info.value
    # The producer exited 3; it should be reported as the root cause
    assert err.returncode == 3
    assert "prod err" in err.output or "exited 3" in str(err)


def test_stream_finally_kills_sigterm_ignorer_and_preserves_original_exception():
    """A child that ignores SIGTERM must be killed; the caller's exception must propagate."""

    def raise_after_first(line: str) -> None:
        raise ValueError("caller error")

    # Use a tiny timeout so the test is fast
    with mock.patch.object(runner_mod, "_STREAM_TERMINATE_TIMEOUT", 0.1):
        with pytest.raises(ValueError, match="caller error"):
            Runner().stream(
                [PY, "-c",
                 "import signal, time; signal.signal(signal.SIGTERM, signal.SIG_IGN); print('x'); time.sleep(30)"],
                raise_after_first,
            )
    # Verify the child is actually dead (no zombie; we don't have a pid handle, but we can at
    # least confirm stream returned — which means proc.wait() completed after kill).
