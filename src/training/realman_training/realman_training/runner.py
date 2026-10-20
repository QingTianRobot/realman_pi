"""The one place that starts host commands (ssh, docker, nvidia-smi, git), so tests can fake them."""

from __future__ import annotations

import dataclasses
import os
import shlex
import subprocess
from typing import Callable, Sequence

_STREAM_TERMINATE_TIMEOUT = 10  # seconds; tests may patch this


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
                prod.kill()
                prod.wait()
                raise CommandFailed(consumer, cons_code, cons.stderr.read().decode(errors="replace"))
            prod_code = prod.wait()
            if prod_code:
                raise CommandFailed(producer, prod_code, prod.stderr.read().decode(errors="replace"))
            return total
        finally:
            for proc in (prod, cons):
                if proc.poll() is None:
                    proc.kill()
                    proc.wait()
