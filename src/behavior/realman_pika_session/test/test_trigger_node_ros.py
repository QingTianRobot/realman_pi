"""Isolated-graph test: fake recorder service and fake MoveJ servers drive one full episode."""
import itertools
import json
import os
import time

import pytest

rclpy = pytest.importorskip("rclpy")

from rclpy.action import ActionServer, get_action_server_names_and_types_by_node  # noqa: E402
from rclpy.executors import SingleThreadedExecutor  # noqa: E402
from rclpy.node import Node  # noqa: E402
from rclpy.qos import DurabilityPolicy, QoSProfile, ReliabilityPolicy  # noqa: E402
from rclpy.task import Future  # noqa: E402
from std_msgs.msg import Bool, String  # noqa: E402
from std_srvs.srv import Trigger  # noqa: E402

from realman_msgs.action import ExecuteMotion  # noqa: E402
from realman_msgs.msg import InputModeState  # noqa: E402
from realman_recording_msgs.msg import RecordingStatus  # noqa: E402
from realman_recording_msgs.srv import ManageRecording  # noqa: E402

from realman_pika_session.config_loader import EpisodeConfig  # noqa: E402
from realman_pika_session.episode_machine import Action  # noqa: E402
from realman_pika_session.trigger_node import TriggerNode  # noqa: E402

LATCHED = QoSProfile(depth=1, reliability=ReliabilityPolicy.RELIABLE, durability=DurabilityPolicy.TRANSIENT_LOCAL)
CONFIG = EpisodeConfig(
    enabled=True, task="pick cable", profile="teleop_v1", record_cameras=True,
    keyboard_topic="/foot_pedal/enabled", required_mode="pikavelocity",
    keyboard_stale_sec=3.0, release_timeout_sec=0.5, home_velocity_percent=30, home_timeout_sec=5.0,
    # gripper_right answers failure (an offline bus) and m is not homed: neither may block the homing.
    home_open_grippers={"l": "gripper_left", "r": "gripper_right", "m": "gripper_middle"},
)
HOME = {"l": (1.0, 2.0, 3.0, 4.0, 5.0, 6.0), "r": (6.0, 5.0, 4.0, 3.0, 2.0, 1.0)}
# The previous test's world can linger in the next test's graph for a moment after rclpy.shutdown(), so
# name-agnostic checks such as ActionClient.server_is_ready() pass on its entities and turn false again when
# they leave. Every test therefore gets its own domain and world name, and readiness is checked per node.
TEST_SEQUENCE = itertools.count()


def isolated_domain() -> str:
    """A domain no earlier test of this process used (60..99; within the ROS 2 limit of 101)."""
    return str(60 + (os.getpid() + next(TEST_SEQUENCE)) % 40)


class FakeWorld(Node):
    def __init__(self):
        super().__init__(f"fake_world_{os.getpid()}_{os.environ['ROS_DOMAIN_ID']}")
        self.requests = []
        self.goals = {}
        self.states = []
        self.gripper_opens = []
        self.create_service(ManageRecording, "/recording/manage", self._manage)
        for name, ok in (("gripper_left", True), ("gripper_right", False), ("gripper_middle", True)):
            self.create_service(Trigger, f"/{name}/open", self._make_open(name, ok))
        for arm in ("l", "r", "m"):
            ActionServer(self, ExecuteMotion, f"/{arm}/execute_motion", self._make_execute(arm))
        self.keyboard = self.create_publisher(Bool, "/foot_pedal/enabled", 10)
        self.mode = self.create_publisher(InputModeState, "/realman_bt_executor/input_mode_state", LATCHED)
        self.status = self.create_publisher(RecordingStatus, "/recording/status", 10)
        self.create_subscription(String, "/pika_episode/state", lambda m: self.states.append(json.loads(m.data)), LATCHED)

    def _manage(self, request, response):
        self.requests.append((request.command, request.task, request.profile, request.session_id))
        response.success = True
        response.session_id = "sess-1"
        response.state = "RECORDING" if request.command == ManageRecording.Request.START else "READY"
        return response

    def _make_open(self, name, ok):
        def handle(request, response):
            self.gripper_opens.append(name)
            response.success = ok
            response.message = "open: reached" if ok else "Not connected to gripper"
            return response
        return handle

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

    def stop_mode_publisher(self):
        """The BT executor stopped or crashed: its latched publisher disappears without a final message."""
        self.destroy_publisher(self.mode)

    def publish_status(self, session_id, state):
        self.status.publish(RecordingStatus(session_id=session_id, state=state))


@pytest.fixture
def graph():
    os.environ["ROS_DOMAIN_ID"] = isolated_domain()
    rclpy.init()
    world = FakeWorld()
    node = TriggerNode(CONFIG, HOME)
    executor = SingleThreadedExecutor()
    executor.add_node(world)
    executor.add_node(node)
    # Discovery takes a moment; a key press before it would be a START failure, not the case under test.
    assert spin_until(executor, lambda: world_discovered(node, world.get_name()))
    yield world, node, executor
    executor.shutdown()
    node.destroy_node()
    world.destroy_node()
    rclpy.shutdown()


def world_discovered(node, world_name):
    """True once the node sees THIS world's recorder service and MoveJ servers, not a previous test's."""
    try:
        servers = {name for name, _ in get_action_server_names_and_types_by_node(node, world_name, "/")}
        services = {name for name, _ in node.get_service_names_and_types_by_node(world_name, "/")}
        grippers = {"/gripper_left/open", "/gripper_right/open"}
        publishers = {name for name, _ in node.get_publisher_names_and_types_by_node(world_name, "/")}
    except Exception:  # noqa: BLE001 - the world node itself is not discovered yet
        return False
    actions = [f"/{arm}/execute_motion" for arm in HOME]
    # server_is_ready() also needs each action's feedback and status publishers, so wait for this world's.
    topics = {f"{action}/_action/{topic}" for action in actions for topic in ("feedback", "status")}
    return (set(actions) <= servers and "/recording/manage" in services and topics <= publishers
            and grippers <= services and node.interfaces_ready()
            and all(client.service_is_ready() for client in node._gripper_open.values()))


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


def ready_for_keys(world, node, executor, mode):
    """Wait until the node really holds `mode` and hears the keyboard (the latched idle publish is not enough)."""
    world.publish_mode(mode)
    assert spin_until(executor, lambda: node._machine._mode == mode)
    assert spin_until(executor, lambda: world.keyboard.get_subscription_count() > 0)


def status_seen(world, node, executor, session_id, state):
    """Publish /recording/status until the node holds it (the subscription may still be matching)."""
    def seen():
        world.publish_status(session_id, state)
        return node._recorder_status == (session_id, state)
    assert spin_until(executor, seen)


def start_recording(world, node, executor):
    ready_for_keys(world, node, executor, "pikavelocity")
    press(world, executor, False)
    press(world, executor, True)
    assert spin_until(executor, lambda: last_state(world) == "recording")


def test_one_key_episode_records_and_homes(graph):
    world, node, executor = graph
    ready_for_keys(world, node, executor, "pikavelocity")
    press(world, executor, False)
    press(world, executor, True)
    assert spin_until(executor, lambda: last_state(world) == "recording")
    assert world.requests[0][:3] == (ManageRecording.Request.START, "pick cable", "teleop_v1")
    # The recorder reports our session active, so the STOP is ours to send.
    status_seen(world, node, executor, "sess-1", RecordingStatus.RECORDING)
    press(world, executor, False)
    assert spin_until(executor, lambda: last_state(world) == "idle" and len(world.goals) == 2)
    assert world.requests[1] == (ManageRecording.Request.STOP, "", "", "sess-1")
    assert sorted(world.goals) == ["l", "r"]  # m is not in HOME
    goal = world.goals["l"]
    assert goal.command == ExecuteMotion.Goal.MOVEJ
    assert goal.reference_type == ExecuteMotion.Goal.BASE
    assert goal.reference_name == "base"  # the driver rejects an empty reference_name
    assert list(goal.joint_degrees) == list(HOME["l"])
    assert goal.velocity_percent == 30
    assert goal.connect is False
    # Homing also releases the grippers of the homed arms; m is not homed, so its gripper is left alone.
    assert spin_until(executor, lambda: len(world.gripper_opens) == 2)
    assert sorted(world.gripper_opens) == ["gripper_left", "gripper_right"]
    assert last_state(world) == "idle"  # gripper_right's failure does not fail the episode


def test_keys_do_nothing_outside_pikavelocity(graph):
    world, node, executor = graph
    ready_for_keys(world, node, executor, "none")
    press(world, executor, False)
    press(world, executor, True)
    spin_until(executor, lambda: False, timeout=0.5)
    assert world.requests == []
    assert world.states[-1]["detail"] == "ignored: mode is none"


def test_first_press_records_once_the_switch_reaches_pikavelocity(graph):
    """The :8765 switch selects pikavelocity only after the press has made Pika publish."""
    world, node, executor = graph
    ready_for_keys(world, node, executor, "none")
    press(world, executor, False)
    press(world, executor, True)
    world.publish_mode("pikavelocity")
    assert spin_until(executor, lambda: last_state(world) == "recording")
    assert world.requests[0][0] == ManageRecording.Request.START


def test_bt_stopped_during_recording_stops_and_never_homes(graph):
    world, node, executor = graph
    start_recording(world, node, executor)
    world.stop_mode_publisher()
    assert spin_until(executor, lambda: last_state(world) == "failed", timeout=2.5)  # before keyboard_stale_sec
    assert [r[0] for r in world.requests] == [ManageRecording.Request.START, ManageRecording.Request.STOP]
    assert world.states[-1]["detail"] == "abnormal stop: mode changed to unknown"
    spin_until(executor, lambda: False, timeout=0.5)
    assert world.goals == {}


def test_bt_back_after_a_stop_restores_the_mode(graph):
    world, node, executor = graph
    ready_for_keys(world, node, executor, "pikavelocity")
    world.stop_mode_publisher()
    assert spin_until(executor, lambda: node._machine._mode == "")
    world.mode = world.create_publisher(InputModeState, "/realman_bt_executor/input_mode_state", LATCHED)
    world.publish_mode("pikavelocity")
    assert spin_until(executor, lambda: node._machine._mode == "pikavelocity")


def test_stop_skipped_when_another_session_is_active(graph):
    world, node, executor = graph
    start_recording(world, node, executor)
    status_seen(world, node, executor, "other-9", RecordingStatus.RECORDING)  # ours ended, someone else records
    press(world, executor, False)
    assert spin_until(executor, lambda: last_state(world) == "failed" and len(world.goals) == 2)
    assert [r[0] for r in world.requests] == [ManageRecording.Request.START]  # no STOP: it would hit other-9
    assert world.states[-1]["detail"] == "stop failed: session already ended externally"


# ---- stubbed-client tests: futures have no executor, so their done callbacks run synchronously ----
class StubRecordingClient:
    def __init__(self):
        self.calls = []  # (request, future)

    def service_is_ready(self):
        return True

    def call_async(self, request):
        future = Future()
        self.calls.append((request, future))
        return future


class StubMoveJClient:
    def __init__(self):
        self.goals = []

    def server_is_ready(self):
        return True

    def send_goal_async(self, goal):
        self.goals.append(goal)
        return Future()  # never answers; the test delivers results itself


@pytest.fixture
def lone_node():
    os.environ["ROS_DOMAIN_ID"] = isolated_domain()
    rclpy.init()
    node = TriggerNode(CONFIG, HOME, service_timeout_sec=0.05)
    yield node
    node.destroy_node()
    rclpy.shutdown()


def recording_response(success, session_id):
    response = ManageRecording.Response()
    response.success = success
    response.session_id = session_id
    return response


def test_late_start_success_after_timeout_stops_the_orphan_session(lone_node):
    node = lone_node
    stub = StubRecordingClient()
    node._recording = stub
    node._on_mode(InputModeState(active_mode="pikavelocity", phase=InputModeState.ACTIVE))
    node._on_keyboard(Bool(data=False))
    node._on_keyboard(Bool(data=True))
    assert len(stub.calls) == 1 and stub.calls[0][0].command == ManageRecording.Request.START
    time.sleep(0.1)
    node._on_timer()  # START times out
    assert node._machine.snapshot()["state"] == "idle"
    stub.calls[0][1].set_result(recording_response(True, "sess-late"))  # the recorder did start
    assert len(stub.calls) == 2
    stop = stub.calls[1][0]
    assert stop.command == ManageRecording.Request.STOP
    assert stop.session_id == "sess-late"
    stub.calls[1][1].set_result(recording_response(True, "sess-late"))
    assert node._machine.snapshot()["state"] == "idle"
    assert node._machine.snapshot()["session_id"] == ""


def test_late_start_failure_after_timeout_sends_nothing(lone_node):
    node = lone_node
    stub = StubRecordingClient()
    node._recording = stub
    node._on_mode(InputModeState(active_mode="pikavelocity", phase=InputModeState.ACTIVE))
    node._on_keyboard(Bool(data=False))
    node._on_keyboard(Bool(data=True))
    time.sleep(0.1)
    node._on_timer()
    stub.calls[0][1].set_result(recording_response(False, ""))
    assert len(stub.calls) == 1
    assert node._machine.snapshot()["state"] == "idle"


def test_late_movej_result_from_an_older_episode_is_ignored(lone_node):
    node = lone_node
    node._movej = {arm: StubMoveJClient() for arm in HOME}
    machine = node._machine
    machine.on_mode("pikavelocity", 0.0)
    machine.on_keyboard(False, 0.0)
    machine.on_keyboard(True, 1.0)
    machine.on_start_result(True, "sess-2", "", 1.0)
    machine.on_keyboard(False, 2.0)
    home = machine.on_stop_result(True, "", 2.0)
    assert home == [Action("home", ("l", "r"))]
    node._apply(home)  # episode 1: goals stay pending
    node._apply(home)  # episode 2 (e.g. after a retry) while episode 1's goals are still out
    assert {arm: entry[0] for arm, entry in node._home_deadlines.items()} == {"l": 2, "r": 2}
    assert [len(client.goals) for client in node._movej.values()] == [2, 2]
    node._finish_home("l", 1, True, "")  # late result of episode 1
    assert node._home_deadlines["l"][0] == 2
    assert machine.snapshot()["state"] == "homing"
    node._finish_home("l", 2, True, "")
    assert "l" not in node._home_deadlines
    assert machine.snapshot()["state"] == "homing"  # r is still pending
    node._finish_home("r", 1, True, "")
    assert machine.snapshot()["state"] == "homing"
    node._finish_home("r", 2, True, "")
    assert machine.snapshot()["state"] == "idle"


class StubGoalHandle:
    def __init__(self, accepted):
        self.accepted = accepted
        self.result_future = Future()

    def get_result_async(self):
        return self.result_future


def answer_goal(client, index, accepted):
    """Deliver the goal response of the `index`-th goal sent to `client`; returns the goal handle."""
    handle = StubGoalHandle(accepted)
    client.futures[index].set_result(handle)
    return handle


class AnsweringMoveJClient(StubMoveJClient):
    def __init__(self):
        super().__init__()
        self.futures = []

    def send_goal_async(self, goal):
        self.goals.append(goal)
        future = Future()
        self.futures.append(future)
        return future


def homing_node(node):
    """Put `node` into HOMING with answerable MoveJ stubs; returns the stubs."""
    clients = {arm: AnsweringMoveJClient() for arm in HOME}
    node._movej = clients
    machine = node._machine
    machine.on_mode("pikavelocity", 0.0)
    machine.on_keyboard(False, 0.0)
    machine.on_keyboard(True, 1.0)
    machine.on_start_result(True, "sess-5", "", 1.0)
    machine.on_keyboard(False, 2.0)
    node._apply(machine.on_stop_result(True, "", 2.0))
    assert machine.snapshot()["state"] == "homing"
    return clients


def finish_ok(handle):
    response = ExecuteMotion.Impl.GetResultService.Response()
    response.result.success = True
    response.result.message = "motion completed"
    handle.result_future.set_result(response)


def test_home_goal_rejected_while_velocity_session_releases_is_retried(lone_node):
    """The driver can still hold the arm a few ms after /<arm>/cartesian_velocity/state says inactive."""
    node = lone_node
    clients = homing_node(node)
    answer_goal(clients["r"], 0, accepted=False)  # "arm r is busy"
    assert node._machine.snapshot()["state"] == "homing"  # not failed yet
    assert len(clients["r"].goals) == 1
    time.sleep(0.25)
    node._on_timer()
    assert len(clients["r"].goals) == 2  # resent after the retry interval
    assert list(clients["r"].goals[1].joint_degrees) == list(HOME["r"])
    finish_ok(answer_goal(clients["r"], 1, accepted=True))
    finish_ok(answer_goal(clients["l"], 0, accepted=True))
    assert node._machine.snapshot()["state"] == "idle"
    assert len(clients["l"].goals) == 1  # an accepted arm is never resent


def test_home_goal_rejected_past_the_retry_window_fails(lone_node):
    node = lone_node
    node._home_retry_sec = 0.3
    clients = homing_node(node)
    answer_goal(clients["r"], 0, accepted=False)
    deadline = time.monotonic() + 2.0
    while node._machine.snapshot()["state"] == "homing" and time.monotonic() < deadline:
        time.sleep(0.05)
        node._on_timer()
        latest = clients["r"].futures[-1]
        if not latest.done():  # every resend is rejected too
            answer_goal(clients["r"], len(clients["r"].futures) - 1, accepted=False)
    snapshot = node._machine.snapshot()
    assert snapshot["state"] == "failed"
    assert "MoveJ goal rejected" in snapshot["detail"]
    assert 2 <= len(clients["r"].goals) <= 4  # retried, then gave up


def test_home_retry_of_an_older_episode_is_dropped(lone_node):
    node = lone_node
    clients = homing_node(node)
    answer_goal(clients["r"], 0, accepted=False)  # episode 1 schedules a retry
    node._apply([Action("home", ("l", "r"))])  # episode 2 resends both arms
    assert len(clients["r"].goals) == 2
    time.sleep(0.25)
    node._on_timer()
    assert len(clients["r"].goals) == 2  # episode 1's retry is not sent on top of episode 2


def test_late_start_orphan_not_stopped_when_another_session_is_active(lone_node):
    node = lone_node
    stub = StubRecordingClient()
    node._recording = stub
    node._on_mode(InputModeState(active_mode="pikavelocity", phase=InputModeState.ACTIVE))
    node._on_keyboard(Bool(data=False))
    node._on_keyboard(Bool(data=True))
    time.sleep(0.1)
    node._on_timer()  # START times out
    node._on_recording_status(RecordingStatus(session_id="policy-3", state=RecordingStatus.RECORDING))
    stub.calls[0][1].set_result(recording_response(True, "sess-late"))
    assert len(stub.calls) == 1  # a STOP now would stop policy-3, not the orphan


def test_late_start_orphan_stopped_when_status_shows_it_active(lone_node):
    node = lone_node
    stub = StubRecordingClient()
    node._recording = stub
    node._on_mode(InputModeState(active_mode="pikavelocity", phase=InputModeState.ACTIVE))
    node._on_keyboard(Bool(data=False))
    node._on_keyboard(Bool(data=True))
    time.sleep(0.1)
    node._on_timer()
    node._on_recording_status(RecordingStatus(session_id="sess-late", state=RecordingStatus.COUNTDOWN))
    stub.calls[0][1].set_result(recording_response(True, "sess-late"))
    assert len(stub.calls) == 2 and stub.calls[1][0].session_id == "sess-late"


def test_scheduled_session_counts_as_recording_busy(lone_node):
    node = lone_node
    node._on_mode(InputModeState(active_mode="pikavelocity", phase=InputModeState.ACTIVE))
    node._on_recording_status(RecordingStatus(session_id="policy-4", state=RecordingStatus.SCHEDULED))
    node._on_keyboard(Bool(data=False))
    node._on_keyboard(Bool(data=True))
    assert node._machine.snapshot()["detail"] == "ignored: recording busy (policy-4)"


def test_outcome_logs_switch_severity_without_raising(lone_node):
    """rclpy raises when one call site logs at two severities; ok and failed outcomes must both log."""
    node = lone_node
    node._service_result("start", True, "s", "accepted")
    node._service_result("start", False, "", "preflight failed")
    for success in (True, False, True):
        node._home_deadlines["l"] = (7, time.monotonic() + 60.0)
        node._finish_home("l", 7, success, "")
        future = Future()
        future.set_result(recording_response(success, "s"))
        node._on_orphan_stop_done("s", future)
