"""The one place that starts host commands (ssh, docker, nvidia-smi, git), so tests can fake them."""

from __future__ import annotations

import dataclasses
import os
import shlex
import subprocess
import threading
from typing import Callable, Sequence

_STREAM_TERMINATE_TIMEOUT = 10  # seconds; tests may patch this
_PROD_WAIT_AFTER_CONS_FAIL = 5.0  # seconds to wait for producer when consumer fails
_STDERR_BUF_BYTES = 65536  # bounded stderr capture for the producer


@dataclasses.dataclass(frozen=True)
class Completed:
    returncode: int
    stdout: str
    stderr: str


class CommandFailed(RuntimeError):
    def __init__(self, argv: Sequence[str], returncode: int, output: str):
        tail = "\n".join(output.strip().splitlines()[-15:])
        super().__init__(f"{shlex.join(list(argv))[:300]} exited {returncode}: {tail}")
        self.argv, self.returncode, self.output = list(argv), returncode, output


def compact(line: str) -> str:
    """tqdm redraws with \\r: keep the last state only."""
    return line.rsplit("\r", 1)[-1]


def _env(extra: dict[str, str] | None) -> dict[str, str] | None:
    return None if not extra else {**os.environ, **extra}


class Runner:
    def run(self, argv, *, input: str | None = None, env=None, timeout: float | None = None) -> Completed:
        done = subprocess.run(
            list(argv), input=input, capture_output=True, text=True, env=_env(env), timeout=timeout,
            stdin=None if input is not None else subprocess.DEVNULL,
        )
        return Completed(done.returncode, done.stdout, done.stderr)

    def check(self, argv, **kwargs) -> str:
        done = self.run(argv, **kwargs)
        if done.returncode:
            raise CommandFailed(argv, done.returncode, done.stderr or done.stdout)
        return done.stdout

    def stream(self, argv, on_line: Callable[[str], None], *, input: str | None = None, env=None) -> int:
        proc = subprocess.Popen(
            list(argv),
            stdin=subprocess.PIPE if input is not None else subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            errors="replace",
            env=_env(env),
        )
        try:
            if input is not None:
                proc.stdin.write(input)
                proc.stdin.close()
            for line in proc.stdout:
                on_line(line.rstrip("\n"))
            return proc.wait()
        finally:
            if proc.poll() is None:
                proc.terminate()
                try:
                    proc.wait(_STREAM_TERMINATE_TIMEOUT)
                except subprocess.TimeoutExpired:
                    proc.kill()
                    proc.wait()

    def pipe(self, producer, consumer, on_bytes: Callable[[int], None], *, chunk_size: int = 1 << 20) -> int:
        """producer | consumer through this process, so the bytes in flight can be counted."""
        prod = subprocess.Popen(list(producer), stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        cons = subprocess.Popen(list(consumer), stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

        # Drain producer stderr in a background thread so a chatty producer cannot fill the pipe and block.
        prod_stderr_chunks: list[bytes] = []
        prod_stderr_total = 0

        def _drain_stderr() -> None:
            nonlocal prod_stderr_total
            while True:
                chunk = prod.stderr.read(4096)
                if not chunk:
                    break
                remaining = _STDERR_BUF_BYTES - prod_stderr_total
                if remaining > 0:
                    prod_stderr_chunks.append(chunk[:remaining])
                    prod_stderr_total += len(prod_stderr_chunks[-1])

        stderr_thread = threading.Thread(target=_drain_stderr, daemon=True)
        stderr_thread.start()

        total = 0
        try:
            while chunk := prod.stdout.read(chunk_size):
                try:
                    cons.stdin.write(chunk)
                except BrokenPipeError:
                    break
                total += len(chunk)
                on_bytes(total)
            try:
                cons.stdin.close()
            except BrokenPipeError:
                pass
            cons_code = cons.wait()
            if cons_code:
                # Close producer stdout so it can exit if it blocked on a full pipe.
                prod.stdout.close()
                try:
                    prod.wait(timeout=_PROD_WAIT_AFTER_CONS_FAIL)
                except subprocess.TimeoutExpired:
                    prod.kill()
                    prod.wait()
                stderr_thread.join(timeout=2.0)
                prod_stderr = b"".join(prod_stderr_chunks).decode(errors="replace")
                cons_stderr = cons.stderr.read().decode(errors="replace")
                prod_code = prod.returncode
                if prod_code and prod_code != 255:
                    # Producer is the root cause (255 = SSH error, consumer likely lost the stream).
                    extra = f"; consumer: {cons_stderr.strip()[:200]}" if cons_stderr.strip() else ""
                    raise CommandFailed(producer, prod_code, prod_stderr + extra)
                # Consumer is the root cause (or SSH dropped: prod_code 0 or 255).
                suffix = f" (producer exited {prod_code}: {prod_stderr.strip()[:200]})" if prod_code else ""
                raise CommandFailed(consumer, cons_code, cons_stderr + suffix)
            prod_code = prod.wait()
            if prod_code:
                stderr_thread.join(timeout=2.0)
                raise CommandFailed(producer, prod_code, b"".join(prod_stderr_chunks).decode(errors="replace"))
            return total
        finally:
            for proc in (prod, cons):
                if proc.poll() is None:
                    proc.kill()
                    proc.wait()
