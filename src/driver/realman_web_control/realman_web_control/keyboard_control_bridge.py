"""Single-browser lease and sequence validation for keyboard control."""

from __future__ import annotations

from typing import Any

from .keyboard_control import KeyboardArmCommand, KeyboardControlConfig
from .protocol import ProtocolError


class KeyboardControlBridge:
    def __init__(self, config: KeyboardControlConfig) -> None:
        self._config = config
        self._owner: str | None = None
        self._sequences = {"l": -1, "r": -1}

    @property
    def owner(self) -> str | None:
        return self._owner

    def activate(self, client_id: str) -> None:
        self._owner = client_id
        self._sequences = {"l": -1, "r": -1}

    def deactivate(self) -> None:
        self._owner = None
        self._sequences = {"l": -1, "r": -1}

    def command(
        self, client_id: str, message: dict[str, Any]
    ) -> KeyboardArmCommand:
        if client_id != self._owner:
            raise ProtocolError(
                "keyboard_lease", "client does not own keyboard control lease"
            )
        arm = message["arm"]
        sequence = int(message["sequence"])
        if sequence <= self._sequences[arm]:
            raise ProtocolError("keyboard_sequence", "keyboard sequence is stale")
        try:
            command = self._config.command(arm, frozenset(message["keys"]))
        except ValueError as error:
            raise ProtocolError("keyboard_key_unknown", str(error)) from error
        self._sequences[arm] = sequence
        return command
