"""Rolling-horizon inference scheduling.

The scheduler triggers inference when the action queue runs low, runs it on a
thread pool so the publish timer never blocks, guards against re-entrancy, and
pauses after too many consecutive failures (recovery requires an explicit
activate). Results are validated before being handed to ``on_chunk``; the caller
enqueues only the first ``steps_per_inference`` rows.

The WebSocket callback thread must never publish directly. This module only
produces validated chunks via ``on_chunk``; the node consumes them from the
publish timer thread.
"""

from __future__ import annotations

import threading
from concurrent.futures import ThreadPoolExecutor

from ..config_loader import ActionConfig
from . import validators


class _InlineExecutor:
    """Test double / fallback that runs submissions synchronously."""

    def submit(self, fn, *args, **kwargs):
        fn(*args, **kwargs)

    def shutdown(self, wait: bool = True) -> None:  # pragma: no cover - trivial
        return None


class InferenceScheduler:
    def __init__(
        self,
        action_cfg: ActionConfig,
        buffer,
        obs_builder,
        on_chunk,
        ws_client,
        *,
        node=None,
        failure_pause_threshold: int = 5,
        executor=None,
        inference_threads: int = 1,
    ) -> None:
        self._action_cfg = action_cfg
        self._buffer = buffer
        self._obs = obs_builder
        self._on_chunk = on_chunk
        self._ws = ws_client
        self._node = node
        self._threshold = max(1, int(failure_pause_threshold))
        if executor is None:
            executor = ThreadPoolExecutor(max_workers=max(1, inference_threads))
        self._executor = executor
        self._lock = threading.Lock()
        self._inflight = False
        self._paused = False
        self._consecutive_failures = 0
        self.request_count = 0
        self.success_count = 0
        self.timeout_count = 0
        self.reject_count = 0

    @property
    def paused(self) -> bool:
        return self._paused

    @property
    def consecutive_failures(self) -> int:
        return self._consecutive_failures

    def _log(self, level: str, message: str) -> None:
        logger = getattr(self._node, "get_logger", lambda: None)() if self._node else None
        if logger is not None:
            getattr(logger, level, logger.warn)(message)

    def should_trigger(self, remaining: int, force: bool = False) -> bool:
        if force:
            return True
        if remaining <= 0:
            return True
        return remaining <= self._action_cfg.inference_lead_steps

    def maybe_trigger(self, side: str, force: bool = False) -> bool:
        """Attempt to start one inference. Return True if a task was submitted."""
        with self._lock:
            if self._paused:
                return False
            if self._inflight:
                return False  # re-entrancy guard: ignore while a request is running
            if not self.should_trigger(self._buffer.remaining, force):
                return False
            self._inflight = True
        self._executor.submit(self._run, side)
        return True

    def _run(self, side: str) -> None:
        try:
            obs = self._obs.build(side)
            if obs is None:
                return  # observation not ready: skip cycle, not a failure
            self.request_count += 1
            try:
                response = self._ws.infer(obs)
            except Exception as error:  # noqa: BLE001 - counted as a failure
                self._register_failure(f"inference error: {error}")
                return
            chunk = response.get("actions") if isinstance(response, dict) else None
            validated = validators.check(chunk, self._action_cfg)
            if validated is None:
                self.reject_count += 1
                self._register_failure("response failed validation (shape/NaN)")
                return
            self.success_count += 1
            self._consecutive_failures = 0
            self._on_chunk(validated[: self._action_cfg.steps_per_inference])
        finally:
            with self._lock:
                self._inflight = False

    def _register_failure(self, reason: str) -> None:
        self._consecutive_failures += 1
        self._log("warn", f"{reason} (consecutive={self._consecutive_failures})")
        if self._consecutive_failures >= self._threshold and not self._paused:
            self._paused = True
            self._log(
                "error",
                f"paused after {self._consecutive_failures} consecutive failures; "
                "call /policy/activate to resume",
            )

    def resume(self) -> None:
        """Clear the pause latch (called by activate)."""
        with self._lock:
            self._paused = False
            self._consecutive_failures = 0

    def shutdown(self) -> None:
        shutdown = getattr(self._executor, "shutdown", None)
        if callable(shutdown):
            shutdown(wait=False)
