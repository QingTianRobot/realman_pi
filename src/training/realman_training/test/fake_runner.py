"""A Runner that records commands and answers from rules, and a log that records lines and progress."""

from __future__ import annotations

from realman_training.runner import Completed, Runner


class FakeRunner(Runner):
    def __init__(self):
        self.calls: list[list[str]] = []
        self.inputs: list[str | None] = []
        self.envs: list[dict | None] = []
        self._rules: list[tuple] = []
        self.pipe_impl = None

    def on(self, match: str, *, stdout: str = "", returncode: int = 0, lines=(), action=None) -> FakeRunner:
        """First rule whose `match` is a substring of the joined argv answers; action(argv, input) runs first.
        stdout may be a callable (argv, input) -> str and returncode one (argv, input) -> int, for answers that change
        between calls."""
        self._rules.append((match, stdout, returncode, tuple(lines), action))
        return self

    def _answer(self, argv, input, env):
        argv = [str(a) for a in argv]
        self.calls.append(argv)
        self.inputs.append(input)
        self.envs.append(env)
        text = " ".join(argv)
        for match, stdout, returncode, lines, action in self._rules:
            if match in text:
                if action is not None:
                    action(argv, input)
                if callable(stdout):
                    stdout = stdout(argv, input)
                if callable(returncode):
                    returncode = returncode(argv, input)
                return stdout, returncode, lines
        return "", 0, ()

    def run(self, argv, *, input=None, env=None, timeout=None) -> Completed:
        stdout, returncode, _ = self._answer(argv, input, env)
        return Completed(returncode, stdout, "" if returncode == 0 else stdout)

    def stream(self, argv, on_line, *, input=None, env=None) -> int:
        stdout, returncode, lines = self._answer(argv, input, env)
        for line in lines or stdout.splitlines():
            on_line(line)
        return returncode

    def pipe(self, producer, consumer, on_bytes, *, chunk_size=1 << 20) -> int:
        self.calls.append(["PIPE", *map(str, producer), "|", *map(str, consumer)])
        return self.pipe_impl([str(a) for a in producer], [str(a) for a in consumer], on_bytes)

    def commands(self, needle: str) -> list[list[str]]:
        return [call for call in self.calls if needle in " ".join(call)]


class RecordingLog:
    def __init__(self):
        self.lines: list[str] = []
        self.progress_calls: list[tuple] = []

    def __call__(self, message: str) -> None:
        self.lines.append(message)

    def progress(self, done: float, total: float | None = None, text: str = "") -> None:
        self.progress_calls.append((done, total, text))

    def text(self) -> str:
        return "\n".join(self.lines)


class UvRuns:
    """The compute host's console_run/<name>.pid files as a set, for FakeRunner rules on a uv backend: a start
    records its name, `rm -f <pid> <exit>` forgets it, `test -e <pid>` answers from the set."""

    def __init__(self):
        self.names: set[str] = set()

    @staticmethod
    def _name(path: str) -> str:
        return path.rsplit("/", 1)[-1].removesuffix(".pid")

    def start(self, name: str):
        def action(argv, input):
            self.names.add(name)
        return action

    def exists(self, argv, input) -> int:
        return 0 if self._name(argv[-1]) in self.names else 1

    def remove(self, argv, input) -> None:
        if argv[:2] == ["rm", "-f"]:
            for path in argv[2:]:
                self.names.discard(self._name(path))

    def on(self, runner: FakeRunner) -> FakeRunner:
        """The test -e and rm -f rules; add them after the start rules (a uv start command also holds `rm -f`)."""
        return runner.on("test -e", returncode=self.exists).on("rm -f", action=self.remove)
