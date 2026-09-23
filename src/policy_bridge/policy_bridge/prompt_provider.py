"""Current prompt text, updatable at runtime from a topic or service."""

from __future__ import annotations

import threading

from .config_loader import PromptConfig


class PromptProvider:
    def __init__(self, node, prompt_cfg: PromptConfig, on_change=None) -> None:
        self._initial = prompt_cfg.initial
        self._current = prompt_cfg.initial
        self._on_change = on_change
        self._lock = threading.Lock()
        self._subscription = None
        if node is not None and prompt_cfg.topic and hasattr(node, "create_subscription"):
            from std_msgs.msg import String

            self._subscription = node.create_subscription(
                String, prompt_cfg.topic, self._on_msg, 10
            )

    def _on_msg(self, msg) -> None:
        self.set(msg.data)

    def current(self) -> str:
        with self._lock:
            return self._current

    def set(self, text: str) -> bool:
        """Update the prompt. Return True if the value actually changed."""
        with self._lock:
            if text == self._current:
                return False
            self._current = text
        if self._on_change is not None:
            self._on_change(text)
        return True

    def reset(self) -> None:
        with self._lock:
            self._current = self._initial
