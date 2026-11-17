"""Isolated-graph test: fake recorder service and fake MoveJ servers drive one full episode."""
import json
import os
import time

import pytest

rclpy = pytest.importorskip("rclpy")

from rclpy.action import ActionServer  # noqa: E402
from rclpy.executors import SingleThreadedExecutor  # noqa: E402
from rclpy.node import Node  # noqa: E402
from rclpy.qos import DurabilityPolicy, QoSProfile, ReliabilityPolicy  # noqa: E402
from std_msgs.msg import Bool, String  # noqa: E402

from realman_msgs.action import ExecuteMotion  # noqa: E402
from realman_msgs.msg import InputModeState  # noqa: E402
from realman_recording_msgs.srv import ManageRecording  # noqa: E402

from realman_pika_session.config_loader import EpisodeConfig  # noqa: E402
from realman_pika_session.trigger_node import TriggerNode  # noqa: E402

LATCHED = QoSProfile(depth=1, reliability=ReliabilityPolicy.RELIABLE, durability=DurabilityPolicy.TRANSIENT_LOCAL)
CONFIG = EpisodeConfig(
    enabled=True, task="pick cable", profile="teleop_v1", record_cameras=True,
    keyboard_topic="/foot_pedal/enabled", required_mode="pikavelocity",
    keyboard_stale_sec=3.0, release_timeout_sec=0.5, home_velocity_percent=30, home_timeout_sec=5.0,
)
HOME = {"l": (1.0, 2.0, 3.0, 4.0, 5.0, 6.0), "r": (6.0, 5.0, 4.0, 3.0, 2.0, 1.0)}


class FakeWorld(Node):
    def __init__(self):
        super().__init__("fake_world")
        self.requests = []
        self.goals = {}
        self.states = []
        self.create_service(ManageRecording, "/recording/manage", self._manage)
        for arm in ("l", "r", "m"):
            ActionServer(self, ExecuteMotion, f"/{arm}/execute_motion", self._make_execute(arm))
        self.keyboard = self.create_publisher(Bool, "/foot_pedal/enabled", 10)
        self.mode = self.create_publisher(InputModeState, "/realman_bt_executor/input_mode_state", LATCHED)
        self.create_subscription(String, "/pika_episode/state", lambda m: self.states.append(json.loads(m.data)), LATCHED)

    def _manage(self, request, response):
        self.requests.append((request.command, request.task, request.profile, request.session_id))
        response.success = True
        response.session_id = "sess-1"
        response.state = "RECORDING" if request.command == ManageRecording.Request.START else "READY"
        return response

    def _make_execute(self, arm):
        def execute(goal_handle):
            self.goals[arm] = goal_handle.request
            goal_handle.succeed()
            result = ExecuteMotion.Result()
            result.success = True
            return result
        return execute

    def publish_mode(self, mode):
        message = InputModeState()
        message.active_mode = mode
        message.selected_mode = mode
        message.phase = InputModeState.ACTIVE
        self.mode.publish(message)


@pytest.fixture
def graph():
    os.environ["ROS_DOMAIN_ID"] = str(150 + os.getpid() % 50)
    rclpy.init()
    world = FakeWorld()
    node = TriggerNode(CONFIG, HOME)
    executor = SingleThreadedExecutor()
    executor.add_node(world)
    executor.add_node(node)
    # Discovery takes a moment; a key press before it would be a START failure, not the case under test.
    assert spin_until(executor, node.interfaces_ready)
    yield world, executor
    executor.shutdown()
    node.destroy_node()
    world.destroy_node()
    rclpy.shutdown()


def spin_until(executor, predicate, timeout=10.0):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        executor.spin_once(timeout_sec=0.05)
        if predicate():
            return True
    return False


def press(world, executor, value, repeat=10):
    for _ in range(repeat):
        world.keyboard.publish(Bool(data=value))
        executor.spin_once(timeout_sec=0.05)


def last_state(world):
    return world.states[-1]["state"] if world.states else None


def test_one_key_episode_records_and_homes(graph):
    world, executor = graph
    world.publish_mode("pikavelocity")
    assert spin_until(executor, lambda: last_state(world) == "idle")
    press(world, executor, False)
    press(world, executor, True)
    assert spin_until(executor, lambda: last_state(world) == "recording")
    assert world.requests[0][:3] == (ManageRecording.Request.START, "pick cable", "teleop_v1")
    press(world, executor, False)
    assert spin_until(executor, lambda: last_state(world) == "idle" and len(world.goals) == 2)
    assert world.requests[1] == (ManageRecording.Request.STOP, "", "", "sess-1")
    assert sorted(world.goals) == ["l", "r"]  # m is not in HOME
    goal = world.goals["l"]
    assert goal.command == ExecuteMotion.Goal.MOVEJ
    assert goal.reference_type == ExecuteMotion.Goal.BASE
    assert list(goal.joint_degrees) == list(HOME["l"])
    assert goal.velocity_percent == 30
    assert goal.connect is False


def test_keys_do_nothing_outside_pikavelocity(graph):
    world, executor = graph
    world.publish_mode("none")
    assert spin_until(executor, lambda: last_state(world) == "idle")
    press(world, executor, False)
    press(world, executor, True)
    spin_until(executor, lambda: False, timeout=0.5)
    assert world.requests == []
    assert world.states[-1]["detail"] == "ignored: mode is none"


@pytest.fixture
def lone_node():
    os.environ["ROS_DOMAIN_ID"] = str(150 + os.getpid() % 50)
    rclpy.init()
    node = TriggerNode(CONFIG, HOME)
    yield node
    node.destroy_node()
    rclpy.shutdown()


def test_late_movej_result_from_an_older_episode_is_ignored(lone_node):
    node = lone_node
    machine = node._machine
    machine.on_mode("pikavelocity", 0.0)
    machine.on_keyboard(False, 0.0)
    machine.on_keyboard(True, 1.0)
    machine.on_start_result(True, "sess-2", "", 1.0)
    machine.on_keyboard(False, 2.0)
    assert machine.on_stop_result(True, "", 2.0)[0].kind == "home"
    # Episode 2 is homing; episode 1's MoveJ goals are still out there.
    far = time.monotonic() + 100.0
    node._home_episode = 2
    node._home_deadlines = {"l": (2, far), "r": (2, far)}
    node._finish_home("l", 1, True, "")
    assert node._home_deadlines["l"] == (2, far)
    node._finish_home("l", 2, True, "")
    assert "l" not in node._home_deadlines
    assert machine.snapshot()["state"] == "homing"  # r is still pending
    node._finish_home("r", 1, True, "")
    assert machine.snapshot()["state"] == "homing"
    node._finish_home("r", 2, True, "")
    assert machine.snapshot()["state"] == "idle"
