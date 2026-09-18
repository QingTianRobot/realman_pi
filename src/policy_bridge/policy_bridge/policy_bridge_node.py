"""policy_bridge_node -- VLA policy service <-> ROS 2 protocol bridge.

This node is a *pure conversion layer*. Uplink: it samples configured topics,
assembles an observation (7-dim state + images + prompt) and hands it to the
rolling-horizon :class:`InferenceScheduler`. Downlink: validated action chunks
are buffered, then a fixed-rate timer pops one step, splits ``action[0:6]`` to
the :class:`Dispatcher` and ``action[6]`` to the :class:`GripperPublisher`.

Safety contract (see design spec):
* The node never reads arm state for closed-loop control, never integrates, and
  never opens/closes a ``cartesian_velocity`` Action session.
* When inactive / queue-empty / estopped it publishes *nothing* (never a zero
  command) so the driver's 100 ms velocity watchdog takes over.
* Only ``ModeWatcher`` (bound to ``InputModeState``) decides the internal mode.
"""

from __future__ import annotations

import threading

import rclpy
from rclpy.executors import MultiThreadedExecutor
from rclpy.node import Node

from . import config_loader
from .action.chunk_buffer import ActionChunkBuffer
from .action.dispatcher import Dispatcher, sides_for
from .gripper.gripper_publisher import GripperPublisher
from .inference.scheduler import InferenceScheduler
from .inference.ws_client import WsClient
from .lifecycle.services import LifecycleServices
from .mode.mode_watcher import ModeWatcher
from .observation.image_aggregator import ImageAggregator
from .observation.observation_builder import ObservationBuilder
from .observation.state_composer import StateComposer
from .prompt_provider import PromptProvider
from .stats import Stats

_DEFAULT_CONFIG = "/opt/rm65_ws/config/ros/policy_bridge.yaml"


class PolicyBridgeNode(Node):
    def __init__(self, config_file: str | None = None) -> None:
        super().__init__("policy_bridge_node")
        self.declare_parameter("config_file", config_file or _DEFAULT_CONFIG)
        self.declare_parameter("active_side", "left")
        path = self.get_parameter("config_file").value
        self._cfg = config_loader.load(path)
        self._active_side = self.get_parameter("active_side").value
        if self._active_side not in sides_for(self._cfg.arm_names):
            raise config_loader.ConfigError(
                f"active_side '{self._active_side}' not in {list(sides_for(self._cfg.arm_names))}"
            )

        self._lock = threading.Lock()
        self._allow_publish = False

        # --- subsystems -------------------------------------------------
        self._buffer = ActionChunkBuffer(maxlen=self._cfg.action.action_horizon)
        self._images = ImageAggregator(self, self._cfg.observation)
        self._state = StateComposer(self, self._cfg.observation.state)
        self._prompt = PromptProvider(self, self._cfg.prompt, on_change=self._on_prompt_change)
        self._obs = ObservationBuilder(self._images, self._state, self._prompt)
        self._dispatcher = Dispatcher(self, self._cfg.downlink, self._cfg.arm_names)
        self._gripper = GripperPublisher(self, self._cfg.downlink.gripper)
        self._stats = Stats(self, self._cfg.stats)
        self._ws = WsClient(self._cfg.network)
        self._scheduler = InferenceScheduler(
            self._cfg.action,
            self._buffer,
            self._obs,
            self._on_chunk,
            self._ws,
            node=self,
            failure_pause_threshold=self._cfg.stats.failure_pause_threshold,
            inference_threads=self._cfg.network.inference_threads,
        )
        self._mode = ModeWatcher(self, self._cfg.mode, self._on_mode_change)
        self._lifecycle = LifecycleServices(
            self,
            self._cfg.lifecycle,
            on_activate=lambda data: self.activate() if data else self.deactivate(),
            on_deactivate=lambda data: self.deactivate() if data else self.activate(),
            on_emergency_stop=self.emergency_stop,
            on_force_infer=self.force_infer,
        )

        self._register_gauges()
        period = 1.0 / self._cfg.downlink.publish_rate_hz
        self._publish_timer = self.create_timer(period, self._publish_loop)
        self.get_logger().info(
            f"policy_bridge ready (config={path}, active_side={self._active_side}, "
            f"rate={self._cfg.downlink.publish_rate_hz}Hz)"
        )

    # --- stats gauges ---------------------------------------------------
    def _register_gauges(self) -> None:
        self._stats.gauge("queue_remaining", lambda: float(self._buffer.remaining))
        self._stats.gauge("paused", lambda: 1.0 if self._scheduler.paused else 0.0)
        self._stats.gauge("mode_active", lambda: 1.0 if self._mode.internal_mode != "inactive" else 0.0)
        self._stats.gauge("allow_publish", lambda: 1.0 if self._allow_publish else 0.0)

    # --- callbacks ------------------------------------------------------
    def _on_chunk(self, steps) -> None:
        with self._lock:
            self._buffer.extend(steps)

    def _on_mode_change(self, internal_mode: str) -> None:
        # Any transition drops stale actions so a new session never inherits them.
        with self._lock:
            self._buffer.clear(f"mode_switch:{internal_mode}")
        self._gripper.reset_cache()
        self._stats.bump("mode_switch")

    def _on_prompt_change(self, text: str) -> None:
        if self._cfg.prompt.on_change_clear_queue:
            with self._lock:
                self._buffer.clear("prompt_change")
        self._stats.bump("prompt_change")

    # --- publish loop ---------------------------------------------------
    def _publish_loop(self) -> None:
        mode = self._mode.internal_mode
        # Rolling-horizon trigger only while actively publishing.
        if self._allow_publish and mode != "inactive":
            self._scheduler.maybe_trigger(self._active_side)
        if not self._allow_publish or mode == "inactive":
            return
        with self._lock:
            step = self._buffer.popleft()
        if step is None:
            # Queue empty -> stop publishing; the driver watchdog takes over.
            self._stats.bump("queue_empty")
            return
        stamp = self.get_clock().now().to_msg()
        if self._dispatcher.publish_arm(mode, self._active_side, step[0:6], stamp):
            self._gripper.publish(self._active_side, float(step[6]))
            self._stats.bump("published")

    # --- lifecycle actions ---------------------------------------------
    def activate(self) -> bool:
        with self._lock:
            self._buffer.clear("activate")
        self._gripper.reset_cache()
        self._scheduler.resume()
        self._allow_publish = True
        self.get_logger().info("activated: publishing enabled")
        return True

    def deactivate(self) -> bool:
        self._allow_publish = False
        self.get_logger().info("deactivated: publishing stopped (observation continues)")
        return True

    def emergency_stop(self) -> bool:
        with self._lock:
            self._buffer.clear("emergency_stop")
        self._gripper.reset_cache()
        self._allow_publish = False
        self._stats.bump("emergency_stop")
        self.get_logger().warn("EMERGENCY STOP: queue cleared, publishing stopped")
        return True

    def force_infer(self) -> bool:
        triggered = self._scheduler.maybe_trigger(self._active_side, force=True)
        self._stats.bump("force_infer")
        return bool(triggered)

    # --- teardown -------------------------------------------------------
    def destroy_node(self) -> bool:  # noqa: D102 - rclpy override
        self._scheduler.shutdown()
        self._ws.close()
        return super().destroy_node()


def main(args=None) -> None:
    rclpy.init(args=args)
    node = PolicyBridgeNode()
    executor = MultiThreadedExecutor()
    executor.add_node(node)
    try:
        executor.spin()
    except KeyboardInterrupt:
        pass
    finally:
        executor.shutdown()
        node.destroy_node()
        rclpy.try_shutdown()


if __name__ == "__main__":
    main()
