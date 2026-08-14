"""ROS 2 joint-state driver for one namespaced RealMan arm."""

from __future__ import annotations

import math
import time
from typing import Any

import rclpy
from rclpy.executors import ExternalShutdownException
from rclpy.node import Node
from sensor_msgs.msg import JointState
from std_msgs.msg import Bool
from std_srvs.srv import Trigger

from .realman_sdk_adapter import RealManSdkAdapter, RobotState


class RealManDriverNode(Node):
    """Expose a small, safe ROS contract while SDK features are added."""

    def __init__(self, **kwargs: Any) -> None:
        super().__init__("realman_driver", **kwargs)
        self.robot_model = self.declare_parameter("robot_model", "RM65-B").value
        self.robot_ip = self.declare_parameter("robot_ip", "").value
        self.robot_port = int(self.declare_parameter("robot_port", 8080).value)
        self.thread_mode = self.declare_parameter("thread_mode", "RM_TRIPLE_MODE_E").value
        self.mock_mode = bool(self.declare_parameter("mock_mode", False).value)
        self.auto_connect = bool(self.declare_parameter("auto_connect", True).value)
        self.reconnect_interval = float(
            self.declare_parameter("reconnect_interval", 5.0).value
        )
        self.state_publish_rate = float(self.declare_parameter("state_publish_rate", 10.0).value)
        self.joint_names = list(
            self.declare_parameter(
                "joint_names",
                [f"joint_{index}" for index in range(1, 7)],
            ).value
        )
        if not self.robot_ip:
            raise ValueError("robot_ip must be supplied by the root config/ros YAML")
        if self.robot_port < 1 or self.robot_port > 65535:
            raise ValueError("robot_port must be between 1 and 65535")
        if self.thread_mode not in {"RM_SINGLE_MODE_E", "RM_DUAL_MODE_E", "RM_TRIPLE_MODE_E"}:
            raise ValueError("thread_mode must be a documented rm_thread_mode_e name")
        if self.state_publish_rate <= 0.0:
            raise ValueError("state_publish_rate must be positive")
        if self.reconnect_interval < 0.0:
            raise ValueError("reconnect_interval must not be negative")
        if not self.joint_names or any(not isinstance(name, str) or not name for name in self.joint_names):
            raise ValueError("joint_names must be a non-empty list of non-empty strings")

        self.adapter = RealManSdkAdapter(
            ip=self.robot_ip,
            port=self.robot_port,
            thread_mode=self.thread_mode,
            robot_model=self.robot_model,
            mock_mode=self.mock_mode,
        )
        self.joint_state_publisher = self.create_publisher(JointState, "joint_states", 10)
        self.connected_publisher = self.create_publisher(Bool, "connected", 10)
        self._services = [
            self.create_service(Trigger, "connect", self._connect),
            self.create_service(Trigger, "disconnect", self._disconnect),
            self.create_service(Trigger, "stop", self._stop),
            self.create_service(Trigger, "status", self._status),
        ]
        period = 1.0 / self.state_publish_rate
        self.state_timer = self.create_timer(period, self._publish_state)
        self._last_state_error = 0
        self._last_joint_count_error = 0
        self._last_connect_attempt = 0.0

        self.get_logger().info(
            f"RealMan joint-state driver ready: model={self.robot_model} ip={self.robot_ip} "
            f"port={self.robot_port} thread_mode={self.thread_mode} mock_mode={self.mock_mode}"
        )
        if self.mock_mode:
            self.get_logger().warn(
                "mock_mode is enabled; no physical controller connection or motion will occur"
            )
        if self.auto_connect:
            self._connect_to_robot()

    def _connect(self, _request: Trigger.Request, response: Trigger.Response) -> Trigger.Response:
        code = self._connect_to_robot()
        response.success = code == 0
        response.message = "connected" if code == 0 else f"connect failed with API2 status {code}"
        return response

    def _disconnect(
        self, _request: Trigger.Request, response: Trigger.Response
    ) -> Trigger.Response:
        code = self.adapter.disconnect()
        response.success = code == 0
        response.message = "disconnected" if code == 0 else f"disconnect failed with status {code}"
        return response

    def _stop(self, _request: Trigger.Request, response: Trigger.Response) -> Trigger.Response:
        code = self.adapter.stop()
        response.success = code == 0
        response.message = "stop requested" if code == 0 else f"stop failed with status {code}"
        if code != 0:
            self.get_logger().error(f"RealMan stop request failed with status {code}")
        return response

    def _status(self, _request: Trigger.Request, response: Trigger.Response) -> Trigger.Response:
        response.success = self.adapter.connected
        response.message = (
            f"connected={self.adapter.connected} mock_mode={self.mock_mode} "
            f"last_error={self.adapter.last_error}"
        )
        if self.adapter.last_error_message:
            response.message += f" detail={self.adapter.last_error_message}"
        return response

    def _connect_to_robot(self) -> int:
        self._last_connect_attempt = time.monotonic()
        code = self.adapter.connect()
        if code == 0:
            self.get_logger().info("RealMan connection ready")
        else:
            detail = self.adapter.last_error_message or "no SDK detail"
            self.get_logger().error(
                f"RealMan connection failed with API2 status {code}: {detail}"
            )
        return code

    def _publish_state(self) -> None:
        if (
            not self.adapter.connected
            and self.auto_connect
            and self.reconnect_interval > 0.0
            and time.monotonic() - self._last_connect_attempt >= self.reconnect_interval
        ):
            self._connect_to_robot()

        state = self.adapter.get_state()
        connected = Bool()
        connected.data = state.connected
        self.connected_publisher.publish(connected)
        if not state.connected or state.error_code != 0 or not state.joint_degrees:
            self._report_state_error(state)
            return

        message = JointState()
        message.header.stamp = self.get_clock().now().to_msg()
        if len(state.joint_degrees) != len(self.joint_names):
            joint_count = len(state.joint_degrees)
            if joint_count != self._last_joint_count_error:
                self._last_joint_count_error = joint_count
                self.get_logger().warn(
                    f"Ignoring joint state with {joint_count} joints; "
                    f"configuration expects {len(self.joint_names)}"
                )
            return
        self._last_joint_count_error = 0
        message.name = self.joint_names
        # The vendor API reports degrees; sensor_msgs/JointState requires radians.
        message.position = [math.radians(float(value)) for value in state.joint_degrees]
        self.joint_state_publisher.publish(message)
        self._report_state_error(state)

    def _report_state_error(self, state: RobotState) -> None:
        if state.error_code == self._last_state_error:
            return
        self._last_state_error = state.error_code
        if state.error_code != 0:
            self.get_logger().warn(
                f"RealMan state unavailable or returned status {state.error_code}"
            )
        else:
            self.get_logger().info("RealMan state stream recovered")

    def destroy_node(self) -> bool:
        self.adapter.disconnect()
        return super().destroy_node()


def main(args: Any = None) -> None:
    rclpy.init(args=args)
    node = RealManDriverNode()
    try:
        rclpy.spin(node)
    except (KeyboardInterrupt, ExternalShutdownException):
        if rclpy.ok():
            node.get_logger().info("RealMan driver shutdown requested")
    finally:
        try:
            node.destroy_node()
        except (KeyboardInterrupt, ExternalShutdownException):
            pass
        if rclpy.ok():
            rclpy.shutdown()


if __name__ == "__main__":
    main()
