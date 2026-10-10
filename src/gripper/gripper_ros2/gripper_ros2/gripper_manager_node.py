"""ROS 2 service façade for the multi-bus Changingtek driver."""

from __future__ import annotations

import math
from pathlib import Path

import std_msgs.msg
from rclpy.qos import QoSDurabilityPolicy, QoSProfile, QoSReliabilityPolicy
from std_srvs.srv import SetBool, Trigger
from gripper_ros2_msgs.msg import GripperLimits
from gripper_ros2_msgs.srv import GripperPercentage, MoveGripperRaw, SetGripperLimits

from .gripper_config import load_gripper_config, percentage_to_position
from .gripper_driver import GripperManager
from .gripper_limits import (
    LimitsStore,
    apply_overrides,
    check_raw_position,
    load_overrides,
    overrides_path,
    position_ranges,
)


class GripperManagerNode:
    """Expose one compatible service/topic namespace for every configured device."""

    def __init__(self, node, config_file: str, overrides_file: str = ""):
        self.node = node
        self.config = load_gripper_config(config_file)
        path = overrides_path(config_file, overrides_file)
        overrides, problems = load_overrides(path, position_ranges(self.config))
        for problem in problems:
            node.get_logger().error(f"Ignoring gripper override: {problem}")
        apply_overrides(self.config, overrides)
        self.manager = GripperManager.from_config(self.config)
        self.limits = LimitsStore(self.manager, path, overrides)
        self._services = []
        self._subscriptions = []
        self._publishers = {}
        self._limits_publishers = {}
        for name in self.manager.device_names:
            self._create_device_interfaces(name)
        for name in self.manager.device_names:
            self._publish_limits(name)
        result = self.manager.connect_all()
        for port, connected in result.items():
            level = node.get_logger().info if connected else node.get_logger().warning
            level(f"Changingtek bus {port}: {'connected' if connected else 'offline; reconnect enabled'}")
        self.manager.start_all()
        self._timer = node.create_timer(0.05, self._publish_feedback)

    def _create_device_interfaces(self, name: str):
        prefix = f"/{name}"
        self._services.extend([
            self.node.create_service(Trigger, f"{prefix}/open", lambda req, res, n=name: self._move(n, True, res)),
            self.node.create_service(Trigger, f"{prefix}/close", lambda req, res, n=name: self._move(n, False, res)),
            self.node.create_service(Trigger, f"{prefix}/reset", lambda req, res, n=name: self._reset(n, res)),
            self.node.create_service(SetBool, f"{prefix}/enable", lambda req, res, n=name: self._enable(n, req, res)),
            self.node.create_service(Trigger, f"{prefix}/grasp_check", lambda req, res, n=name: self._grasp(n, res)),
            self.node.create_service(GripperPercentage, f"{prefix}/percentage", lambda req, res, n=name: self._percentage(n, req, res)),
            self.node.create_service(Trigger, f"{prefix}/calibrate", lambda req, res, n=name: self._calibrate(n, res)),
            self.node.create_service(SetGripperLimits, f"{prefix}/set_limits", lambda req, res, n=name: self._set_limits(n, req, res)),
            self.node.create_service(MoveGripperRaw, f"{prefix}/move_raw", lambda req, res, n=name: self._move_raw(n, req, res)),
        ])
        self._subscriptions.append(
            self.node.create_subscription(
                std_msgs.msg.Float32,
                f"{prefix}/percentage/command",
                lambda message, n=name: self._percentage_command(n, message),
                10,
            )
        )
        self._publishers[name] = {
            suffix: self.node.create_publisher(message_type, f"{prefix}/{suffix}", 10)
            for suffix, message_type in {
                "position": std_msgs.msg.Float64,
                "speed": std_msgs.msg.Int32,
                "current": std_msgs.msg.Int32,
                "torque_reached": std_msgs.msg.Bool,
                "alarm": std_msgs.msg.Int32,
                "connected": std_msgs.msg.Bool,
            }.items()
        }
        self._limits_publishers[name] = self.node.create_publisher(
            GripperLimits,
            f"{prefix}/limits",
            QoSProfile(
                depth=1,
                reliability=QoSReliabilityPolicy.RELIABLE,
                durability=QoSDurabilityPolicy.TRANSIENT_LOCAL,
            ),
        )

    @staticmethod
    def _response(response, success: bool, message: str):
        response.success = bool(success)
        response.message = str(message)
        return response

    def _ready(self, name):
        device = self.manager.get(name)
        if not device.bus.connected:
            return None, "Not connected to gripper"
        try:
            if not device._enabled:
                device.enable(True)
        except Exception as error:
            return None, f"Enable failed: {error}"
        return device, None

    def _move(self, name, opening, response):
        device, error = self._ready(name)
        if error:
            return self._response(response, False, error)
        target = device.open_position if opening else device.close_position
        label = "open" if opening else "close"
        try:
            device.move_to(target)
            result = device.bus.transaction(
                device.slave_id,
                lambda sdk: sdk.wait_until_pos_or_torque(20.0),
            )
            feedback = device.read_feedback()
            return self._response(
                response,
                result != "timeout",
                f"{label}: {result} (pos_fb={feedback['position']})",
            )
        except Exception as error:
            return self._response(response, False, f"{label} error: {error}")

    def _reset(self, name, response):
        device, error = self._ready(name)
        if error:
            return self._response(response, False, error)
        try:
            device.bus.transaction(device.slave_id, lambda sdk: sdk.griger_reset())
            return self._response(response, True, "Gripper reset OK")
        except Exception as error:
            return self._response(response, False, f"Reset error: {error}")

    def _enable(self, name, request, response):
        device = self.manager.get(name)
        if not device.bus.connected:
            return self._response(response, False, "Not connected")
        try:
            device.enable(request.data)
            return self._response(response, True, f"Enable set to {request.data}")
        except Exception as error:
            return self._response(response, False, f"Enable error: {error}")

    def _grasp(self, name, response):
        device, error = self._ready(name)
        if error:
            return self._response(response, False, error)
        try:
            feedback = device.read_feedback()
            return self._response(
                response,
                feedback["torque_reached"],
                f"{'Grasped' if feedback['torque_reached'] else 'Not grasped'} (pos={feedback['position']})",
            )
        except Exception as error:
            return self._response(response, False, f"Grasp check error: {error}")

    def _percentage(self, name, request, response):
        device, error = self._ready(name)
        if error:
            return self._response(response, False, error)
        try:
            target = percentage_to_position(
                request.percentage,
                open_position=device.open_position,
                close_position=device.close_position,
            )
            device.move_to(target)
            result = device.bus.transaction(
                device.slave_id,
                lambda sdk: sdk.wait_until_pos_or_torque(20.0),
            )
            feedback = device.read_feedback()
            return self._response(
                response,
                result != "timeout",
                f"pct={float(request.percentage):.3f} -> pos={target} ({result}, pos_fb={feedback['position']})",
            )
        except Exception as error:
            return self._response(response, False, f"Percentage error: {error}")

    def _percentage_command(self, name, message):
        value = float(message.data)
        if not math.isfinite(value) or not 0.0 <= value <= 1.0:
            self.node.get_logger().warning(
                f"Ignoring invalid continuous percentage for {name}: {value!r}"
            )
            return
        device, error = self._ready(name)
        if error:
            self.node.get_logger().warning(
                f"Ignoring continuous percentage for {name}: {error}"
            )
            return
        target = percentage_to_position(
            value,
            open_position=device.open_position,
            close_position=device.close_position,
        )
        self.manager.request_move(name, target)

    def _calibrate(self, name, response):
        return self._response(
            response,
            False,
            "Calibration is disabled by default; configure safe open/close positions",
        )

    def _publish_limits(self, name):
        self._limits_publishers[name].publish(GripperLimits(**self.limits.current(name)))

    def _set_limits(self, name, request, response):
        success, message = self.limits.set_limits(
            name, int(request.open_position), int(request.close_position),
        )
        if success:
            self._publish_limits(name)
        current = self.limits.current(name)
        response.open_position = current["open_position"]
        response.close_position = current["close_position"]
        return self._response(response, success, message)

    def _move_raw(self, name, request, response):
        device = self.manager.get(name)
        problem = check_raw_position(request.position, device.min_position, device.max_position)
        if problem:
            return self._response(response, False, problem)
        device, error = self._ready(name)
        if error:
            return self._response(response, False, error)
        position = int(request.position)
        try:
            device.move_to(position)
            result = device.bus.transaction(
                device.slave_id,
                lambda sdk: sdk.wait_until_pos_or_torque(20.0),
            )
            feedback = device.read_feedback()
            return self._response(
                response,
                result != "timeout",
                f"raw -> pos={position} ({result}, pos_fb={feedback['position']})",
            )
        except Exception as error:
            return self._response(response, False, f"Move error: {error}")

    def _publish_feedback(self):
        for name in self.manager.device_names:
            device = self.manager.get(name)
            feedback, publishers = device.feedback, self._publishers[name]
            publishers["position"].publish(std_msgs.msg.Float64(data=float(feedback["position"])))
            publishers["speed"].publish(std_msgs.msg.Int32(data=int(feedback["speed"])))
            publishers["current"].publish(std_msgs.msg.Int32(data=int(feedback["current"])))
            publishers["torque_reached"].publish(std_msgs.msg.Bool(data=bool(feedback["torque_reached"])))
            publishers["alarm"].publish(std_msgs.msg.Int32(data=int(feedback["alarm"])))
            publishers["connected"].publish(std_msgs.msg.Bool(data=bool(device.bus.connected)))

    def destroy(self):
        self.manager.stop_all()
        for device in self.manager._devices.values():
            try:
                if device._enabled:
                    device.disable()
            except Exception:
                pass
        self.manager.disconnect_all()


def main(args=None):
    import rclpy
    from rclpy.node import Node

    rclpy.init(args=args)
    node = Node("gripper_manager")
    node.declare_parameter("config_file", "")
    node.declare_parameter("overrides_file", "")
    config_file = node.get_parameter("config_file").value
    if not config_file:
        node.get_logger().error("config_file parameter is required")
        node.destroy_node()
        rclpy.shutdown()
        return
    adapter = GripperManagerNode(
        node, str(Path(config_file)), node.get_parameter("overrides_file").value,
    )
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        adapter.destroy()
        node.destroy_node()
        if rclpy.ok():
            rclpy.shutdown()
