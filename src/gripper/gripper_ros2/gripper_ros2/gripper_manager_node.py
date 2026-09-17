"""ROS 2 service façade for the multi-bus Changingtek driver."""

from __future__ import annotations

from pathlib import Path

import std_msgs.msg
from std_srvs.srv import SetBool, Trigger
from gripper_ros2_msgs.srv import GripperPercentage

from .gripper_config import load_gripper_config, percentage_to_position
from .gripper_driver import GripperManager


class GripperManagerNode:
    """Expose one compatible service/topic namespace for every configured device."""

    def __init__(self, node, config_file: str):
        self.node = node
        self.config = load_gripper_config(config_file)
        self.manager = GripperManager.from_config(self.config)
        self._services = []
        self._publishers = {}
        for name in self.manager.device_names:
            self._create_device_interfaces(name)
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
        ])
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

    def _calibrate(self, name, response):
        return self._response(
            response,
            False,
            "Calibration is disabled by default; configure safe open/close positions",
        )

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
    config_file = node.get_parameter("config_file").value
    if not config_file:
        node.get_logger().error("config_file parameter is required")
        node.destroy_node()
        rclpy.shutdown()
        return
    adapter = GripperManagerNode(node, str(Path(config_file)))
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        adapter.destroy()
        node.destroy_node()
        if rclpy.ok():
            rclpy.shutdown()

