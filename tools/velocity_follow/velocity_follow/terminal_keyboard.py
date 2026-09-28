"""Hold-to-run keyboard input over a plain terminal, for SSH sessions.

A terminal reports key presses but never key releases, so a held key arrives as
the operating system's auto-repeat stream. Each press therefore refreshes a
per-axis deadline and the axis falls back to zero once the repeats stop. This
reproduces the Web page's hold-to-run contract, including the fact that the
command stream is only as regular as the input device that feeds it.
"""

from __future__ import annotations

from dataclasses import dataclass
import os
import select
import sys
from typing import Mapping

from .axes import ZERO_COMMAND, axis_index
from .key_bindings import KeyBinding


# Ctrl-C and Escape end a run. No letter does: every letter is a motion key on
# one arm or the other (q is the left arm's +wx), and a quit key that shadows a
# motion key silently ends the run the first time the operator rotates.
QUIT_CHARACTERS = frozenset({"\x03", "\x1b"})


@dataclass
class _HeldKey:
    binding: KeyBinding
    expires_at: float


class KeyHoldTracker:
    """Turn a stream of key presses into a six-axis velocity command."""

    def __init__(
        self,
        bindings: Mapping[str, KeyBinding],
        *,
        hold_timeout_sec: float,
        linear_speed_mps: float,
        angular_speed_radps: float,
    ) -> None:
        if hold_timeout_sec <= 0.0:
            raise ValueError("hold_timeout_sec must be positive")
        if linear_speed_mps <= 0.0 or angular_speed_radps <= 0.0:
            raise ValueError("key speeds must be positive")
        self.bindings = dict(bindings)
        self.hold_timeout_sec = float(hold_timeout_sec)
        self.linear_speed_mps = float(linear_speed_mps)
        self.angular_speed_radps = float(angular_speed_radps)
        self._held: dict[str, _HeldKey] = {}
        self._press_count = 0
        self._ignored_count = 0

    @property
    def press_count(self) -> int:
        """Presses that matched a binding; a proxy for the operator's key rate."""
        return self._press_count

    @property
    def ignored_count(self) -> int:
        return self._ignored_count

    def press(self, character: str, now: float) -> bool:
        """Record one key press. Returns False for an unbound character."""
        binding = self.bindings.get(character)
        if binding is None:
            self._ignored_count += 1
            return False
        self._press_count += 1
        # One axis carries one direction at a time: a new press on the same axis
        # replaces the opposite key instead of cancelling it out to zero.
        self._held[binding.axis] = _HeldKey(binding, now + self.hold_timeout_sec)
        return True

    def release_all(self) -> None:
        self._held.clear()

    def command_at(self, now: float) -> tuple[float, ...]:
        """Expire stale holds and return the current command vector."""
        expired = [axis for axis, held in self._held.items() if held.expires_at <= now]
        for axis in expired:
            del self._held[axis]
        if not self._held:
            return ZERO_COMMAND
        command = list(ZERO_COMMAND)
        for axis, held in self._held.items():
            index = axis_index(axis)
            speed = self.linear_speed_mps if index < 3 else self.angular_speed_radps
            command[index] = held.binding.sign * speed
        return tuple(command)

    @property
    def active_axes(self) -> tuple[str, ...]:
        return tuple(sorted(self._held))


class RawTerminalReader:
    """Context manager that puts stdin in cbreak mode and polls for characters.

    ``supported`` stays False on a non-TTY stdin (a launch file, a service unit
    or a CI run), which lets the node fall back to the scripted profile instead
    of blocking on input that can never arrive.
    """

    def __init__(self, stream=None) -> None:
        self._stream = stream if stream is not None else sys.stdin
        self._descriptor: int | None = None
        self._saved_attributes = None

    @property
    def supported(self) -> bool:
        try:
            return bool(self._stream) and os.isatty(self._stream.fileno())
        except (AttributeError, OSError, ValueError):
            return False

    def __enter__(self) -> "RawTerminalReader":
        if not self.supported:
            return self
        import termios
        import tty

        self._descriptor = self._stream.fileno()
        self._saved_attributes = termios.tcgetattr(self._descriptor)
        # cbreak leaves output processing alone so ROS log lines stay readable.
        tty.setcbreak(self._descriptor)
        return self

    def __exit__(self, *_exception) -> bool:
        if self._descriptor is not None and self._saved_attributes is not None:
            import termios

            termios.tcsetattr(self._descriptor, termios.TCSADRAIN, self._saved_attributes)
        self._descriptor = None
        self._saved_attributes = None
        return False

    def read_pending(self) -> list[str]:
        """Drain every character buffered since the last call, without blocking."""
        if self._descriptor is None:
            return []
        characters: list[str] = []
        while True:
            readable, _, _ = select.select([self._descriptor], [], [], 0.0)
            if not readable:
                return characters
            chunk = os.read(self._descriptor, 64)
            if not chunk:
                return characters
            characters.extend(chunk.decode("utf-8", errors="ignore"))


def is_quit(character: str) -> bool:
    return character in QUIT_CHARACTERS


__all__ = ["KeyHoldTracker", "QUIT_CHARACTERS", "RawTerminalReader", "is_quit"]
