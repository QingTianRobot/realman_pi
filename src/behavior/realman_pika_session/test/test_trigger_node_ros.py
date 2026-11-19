"""Isolated-graph test: a fake recorder service and a fake BT executor mode service drive one full episode."""
import itertools
import json
import os
import time

import pytest

rclpy = pytest.importorskip("rclpy")

from rclpy.executors import SingleThreadedExecutor  # noqa: E402
from rclpy.node import Node  # noqa: E402
from rclpy.qos import DurabilityPolicy, QoSProfile, ReliabilityPolicy  # noqa: E402
from rclpy.task import Future  # noqa: E402
from std_msgs.msg import Bool, String  # noqa: E402
from std_srvs.srv import Trigger  # noqa: E402

from realman_msgs.msg import InputModeState  # noqa: E402
from realman_msgs.srv import SelectInputMode  # noqa: E402
from realman_recording_msgs.msg import RecordingStatus  # noqa: E402
from realman_recording_msgs.srv import ManageRecording  # noqa: E402

from realman_pika_session.config_loader import EpisodeConfig  # noqa: E402
from realman_pika_session.branch_restart import Effect  # noqa: E402
from realman_pika_session.trigger_node import TriggerNode  # noqa: E402

LATCHED = QoSProfile(depth=1, reliability=ReliabilityPolicy.RELIABLE, durability=DurabilityPolicy.TRANSIENT_LOCAL)
CONFIG = EpisodeConfig(
    enabled=True, task="pick cable", profile="teleop_v1", record_cameras=True,
    keyboard_topic="/foot_pedal/enabled", required_mode="pikavelocity",
    keyboard_stale_sec=3.0,
    # gripper_right answers failure (an offline bus) and m is not homed: neither may block the homing.
    home_open_grippers={"l": "gripper_left", "r": "gripper_right", "m": "gripper_middle"},
    restart_off_mode="none", restart_off_timeout_sec=2.0, restart_timeout_sec=5.0,
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
        self.selections = []  # (mode_id, requester_id)
        self.next_request_id = 100
        self.states = []
        self.gripper_opens = []
        self.create_service(ManageRecording, "/recording/manage", self._manage)
        for name, ok in (("gripper_left", True), ("gripper_right", False), ("gripper_middle", True)):
            self.create_service(Trigger, f"/{name}/open", self._make_open(name, ok))
        self.create_service(SelectInputMode, "/realman_bt_executor/select_input_mode", self._select)
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

    def _select(self, request, response):
        """Like the executor: a new request id, the mode active at once (the entry MoveJ is instant here)."""
        self.selections.append((request.mode_id, request.requester_id))
        self.next_request_id += 1
        response.accepted = True
        response.request_id = self.next_request_id
        response.message = "accepted"
        self.publish_mode(request.mode_id, self.next_request_id)
        return response

    def publish_mode(self, mode, request_id=None):
        message = InputModeState()
        message.requested_mode = mode
        message.active_mode = mode
        message.selected_mode = mode
        message.phase = InputModeState.ACTIVE
        message.request_id = self.next_request_id if request_id is None else request_id
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
    """True once the node sees THIS world's recorder and mode services, not a previous test's."""
    try:
        services = {name for name, _ in node.get_service_names_and_types_by_node(world_name, "/")}
    except Exception:  # noqa: BLE001 - the world node itself is not discovered yet
        return False
    wanted = {"/recording/manage", "/realman_bt_executor/select_input_mode", "/gripper_left/open", "/gripper_right/open"}
    return (wanted <= services and node.interfaces_ready()
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


def test_one_key_episode_records_and_restarts_the_branch(graph):
    world, node, executor = graph
    ready_for_keys(world, node, executor, "pikavelocity")
    press(world, executor, False)
    press(world, executor, True)
    assert spin_until(executor, lambda: last_state(world) == "recording")
    assert world.requests[0][:3] == (ManageRecording.Request.START, "pick cable", "teleop_v1")
    # The recorder reports our session active, so the STOP is ours to send.
    status_seen(world, node, executor, "sess-1", RecordingStatus.RECORDING)
    press(world, executor, False)
    assert spin_until(executor, lambda: last_state(world) == "idle" and len(world.selections) == 2)
    assert world.requests[1] == (ManageRecording.Request.STOP, "", "", "sess-1")
    # Off first (the router cancels the velocity sessions), then back on (the entry MoveJ homes the arms).
    assert world.selections == [("none", "pika_episode"), ("pikavelocity", "pika_episode")]
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
    assert world.selections == []


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
    assert spin_until(executor, lambda: last_state(world) == "failed" and len(world.selections) == 2)
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
        node._run_restart([Effect("done", success=success, message="")])
        future = Future()
        future.set_result(recording_response(success, "s"))
        node._on_orphan_stop_done("s", future)


def test_unavailable_mode_service_fails_the_restart(lone_node):
    node = lone_node
    stub = StubRecordingClient()
    node._recording = stub
    node._on_mode(InputModeState(requested_mode="pikavelocity", active_mode="pikavelocity",
                                 phase=InputModeState.ACTIVE, request_id=3))
    node._on_keyboard(Bool(data=False))
    node._on_keyboard(Bool(data=True))
    stub.calls[0][1].set_result(recording_response(True, "sess-9"))
    node._on_keyboard(Bool(data=False))  # stop press: STOP + restart; nothing serves select_input_mode
    assert node._machine.snapshot()["state"] == "stopping"
    stub.calls[1][1].set_result(recording_response(True, "sess-9"))
    snapshot = node._machine.snapshot()
    assert snapshot["state"] == "failed"
    assert snapshot["detail"] == "restart failed: none refused: /realman_bt_executor/select_input_mode is not available"
