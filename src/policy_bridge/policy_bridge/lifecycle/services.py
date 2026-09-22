"""Lifecycle service wiring for the policy bridge.

Five services are exposed (names come from ``LifecycleConfig``):

* ``activate``       ``SetBool``  -- clear queue, reset failure latch, allow publish
* ``deactivate``     ``SetBool``  -- stop publishing (observation continues)
* ``emergency_stop`` ``Trigger``  -- clear queue, stop publishing immediately
* ``set_prompt``     ``SetBool``  -- phase-1 placeholder (prompt flows via topic)
* ``force_infer``    ``Trigger``  -- run one inference cycle now

The handlers are injected as callbacks so this module stays free of node
internals and is trivially testable.
"""

from __future__ import annotations

from std_srvs.srv import SetBool, Trigger

from ..config_loader import LifecycleConfig


class LifecycleServices:
    def __init__(
        self,
        node,
        lifecycle_cfg: LifecycleConfig,
        *,
        on_activate,
        on_deactivate,
        on_emergency_stop,
        on_force_infer,
        on_set_prompt=None,
    ) -> None:
        self._cfg = lifecycle_cfg
        self._services = []
        if node is None or not hasattr(node, "create_service"):
            return

        self._services.append(
            node.create_service(
                SetBool, lifecycle_cfg.activate, self._set_bool(on_activate, "activate")
            )
        )
        self._services.append(
            node.create_service(
                SetBool, lifecycle_cfg.deactivate, self._set_bool(on_deactivate, "deactivate")
            )
        )
        self._services.append(
            node.create_service(
                Trigger, lifecycle_cfg.emergency_stop, self._trigger(on_emergency_stop, "emergency_stop")
            )
        )
        self._services.append(
            node.create_service(
                Trigger, lifecycle_cfg.force_infer, self._trigger(on_force_infer, "force_infer")
            )
        )
        prompt_handler = on_set_prompt if on_set_prompt is not None else (lambda: True)
        self._services.append(
            node.create_service(
                SetBool, lifecycle_cfg.set_prompt, self._set_bool(prompt_handler, "set_prompt")
            )
        )

    @staticmethod
    def _set_bool(callback, label):
        def handler(request, response):
            try:
                result = callback(bool(request.data))
                response.success = True if result is None else bool(result)
                response.message = f"{label}: ok"
            except Exception as error:  # noqa: BLE001 - surfaced to the caller
                response.success = False
                response.message = f"{label} failed: {error}"
            return response

        return handler

    @staticmethod
    def _trigger(callback, label):
        def handler(request, response):
            try:
                result = callback()
                response.success = True if result is None else bool(result)
                response.message = f"{label}: ok"
            except Exception as error:  # noqa: BLE001 - surfaced to the caller
                response.success = False
                response.message = f"{label} failed: {error}"
            return response

        return handler
