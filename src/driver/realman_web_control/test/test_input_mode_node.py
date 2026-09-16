"""Exercise real Web dispatch/Action ownership with generated Humble messages.

Only external service/Action transport is controlled here; the controller,
protocol, goal conversion, callback handling and effects remain production code.
"""

from concurrent.futures import Future, ThreadPoolExecutor
import json
import queue
import threading
import time
from pathlib import Path
from types import SimpleNamespace

import pytest

pytest.importorskip("rclpy")
from rclpy.node import Node
from rclpy.callback_groups import ReentrantCallbackGroup
import rclpy
from realman_msgs.msg import InputModeState
from realman_msgs.srv import ListInputModes, SelectInputMode

from realman_web_control.action_bridge import ActionRecord
from realman_web_control.input_mode_bridge import InputModeBridge, InputModeOption, InputModeSnapshot
from realman_web_control.protocol import parse_message
from realman_web_control.web_control_node import WebControlNode


CATALOG = (InputModeOption("web", "Web", False), InputModeOption("policy", "Policy", True))


class Events:
    def __init__(self):
        self.events = []

    def send_event(self, event, client_id=None):
        self.events.append((event, client_id))


class Service:
    def __init__(self, log):
        self.ready = True
        self.calls = []
        self.log = log
        self.removed = []

    def service_is_ready(self):
        return self.ready

    def call_async(self, request):
        future = Future()
        self.calls.append((request, future))
        self.log.append(("service", getattr(request, "mode_id", "list")))
        return future

    def remove_pending_request(self, future):
        self.removed.append(future)


class ActionTransport:
    def __init__(self):
        self.goals = []

    def server_is_ready(self):
        return True

    def send_goal_async(self, goal, *, feedback_callback):
        future = Future()
        self.goals.append((goal, future))
        return future


class GoalHandle:
    accepted = True

    def __init__(self, log, name, *, broken_result=False, broken_cancel=False):
        self.log, self.name = log, name
        self.broken_result, self.broken_cancel = broken_result, broken_cancel
        self.result_future = Future()

    def cancel_goal_async(self):
        self.log.append(("cancel", self.name))
        if self.broken_cancel:
            raise RuntimeError("cancel transport failed")
        return Future()

    def get_result_async(self):
        if self.broken_result:
            raise RuntimeError("result transport failed")
        return self.result_future


@pytest.fixture
def node():
    rclpy.init()
    value = WebControlNode.__new__(WebControlNode)
    Node.__init__(value, "web_mode_boundary_test")
    value._control_lock = threading.RLock()
    value._callback_group = ReentrantCallbackGroup()
    value._commands = queue.Queue()
    value._server = Events()
    value._actions = {}
    value._coordinate_state = {}
    value._input_modes = InputModeBridge(web_override_timeout_sec=5.0)
    value._mode_discovery_period = 0.25
    value._mode_list_future = None
    value._mode_state_subscription = None
    value._mode_select_futures = {}
    value.log = []
    value._mode_list_client = Service(value.log)
    value._mode_select_client = Service(value.log)
    value._robots = {arm: {
        "joints": [{"name": f"joint_{index}", "lower_deg": -180.0, "upper_deg": 180.0} for index in range(6)],
        "frames": {"base": {"type": 0, "name": "base", "frame_id": f"{arm}/base_link"}},
        "motion": {"velocity_control_period_ms": 20, "velocity_watchdog_ms": 100,
                   "max_linear_accel_mps2": 0.1, "max_angular_accel_radps2": 0.5},
    } for arm in ("l", "m", "r")}
    value._motion_clients = {arm: ActionTransport() for arm in ("l", "m", "r")}
    value._trajectory_clients = {arm: ActionTransport() for arm in ("l", "m", "r")}
    value._velocity_clients = {arm: ActionTransport() for arm in ("l", "m", "r")}
    yield value
    Node.destroy_node(value)
    rclpy.shutdown()


def motion(kind="execute_motion", arm="l"):
    point = {"command": 0, "joint_degrees": [0.0] * 6, "pose_position_m": [0.0] * 3,
             "pose_quaternion_wxyz": [1.0, 0.0, 0.0, 0.0], "velocity_percent": 10, "blend_radius_percent": 0}
    goal = {"reference_type": 0, "reference_name": "base", "timeout_sec": 5.0, **point}
    if kind == "execute_trajectory":
        goal = {"reference_type": 0, "reference_name": "base", "timeout_sec": 5.0, "waypoints": [point, point]}
    elif kind == "start_cartesian_velocity":
        goal = {"reference_type": 0, "reference_name": "base", "control_period_ms": 20, "watchdog_ms": 100,
                "max_linear_accel_mps2": 0.1, "max_angular_accel_radps2": 0.5,
                "follow": False, "trajectory_mode": 0, "radio": 0}
    return parse_message(json.dumps({"type": kind, "arm": arm, "request_id": "move-1", "goal": goal}))


def state(request_id=41):
    return InputModeState(requested_mode="web", selected_mode="web", active_mode="web",
                          phase=InputModeState.ACTIVE, request_id=request_id, epoch=2)


def sent(node):
    return [goal for clients in (node._motion_clients, node._trajectory_clients, node._velocity_clients)
            for client in clients.values() for goal, _ in client.goals]


@pytest.mark.parametrize("kind,goal_type", [
    ("execute_motion", "ExecuteMotion_Goal"), ("execute_trajectory", "ExecuteTrajectory_Goal"),
    ("start_cartesian_velocity", "CartesianVelocity_Goal"),
])
def test_dispatch_sends_generated_goal_only_after_matching_state(node, kind, goal_type):
    node._input_modes.update_catalog(CATALOG)
    node._dispatch("browser-a", motion(kind))
    assert sent(node) == []
    request, future = node._mode_select_client.calls[0]
    assert request.mode_id == "web"
    assert request.requester_id.startswith("web:")
    future.set_result(SelectInputMode.Response(accepted=True, request_id=41, message="accepted"))
    assert sent(node) == []
    node._input_mode_state(state())
    node._input_mode_state(state())
    assert len(sent(node)) == 1
    assert type(sent(node)[0]).__name__ == goal_type


def test_direct_dispatch_is_preserved_without_catalog(node):
    node._mode_list_client.ready = False
    node._mode_select_client.ready = False
    node._dispatch("browser-a", motion())
    assert len(sent(node)) == 1
    assert node._mode_select_client.calls == []


@pytest.mark.parametrize("failure", ["timeout", "late_response", "malformed", "transport"])
def test_unhealthy_ready_catalog_service_never_enables_direct_motion(node, failure):
    node._input_modes.update_catalog(CATALOG)
    node._input_modes.update_state(InputModeSnapshot("policy", "policy", "policy", "ACTIVE", 40, 1))
    node._probe_input_modes()
    future = node._mode_list_client.calls[-1][1]
    if failure in {"timeout", "late_response"}:
        node._mode_list_deadline = time.monotonic() - 1.0
    if failure == "timeout":
        node._probe_input_modes()
    elif failure == "late_response":
        future.set_result(ListInputModes.Response(success=True, mode_ids=["web"], labels=["Web"], selectable=[False]))
    elif failure == "malformed":
        future.set_result(ListInputModes.Response(success=True, mode_ids=["web"], labels=[], selectable=[False]))
    else:
        future.set_exception(RuntimeError("discovery transport failed"))
    node._dispatch("browser", motion())
    assert sent(node) == []
    assert any(event.get("request_id") == "move-1" and event["type"] == "error"
               for event, _ in node._server.events)


@pytest.mark.parametrize("select_ready", [False, True])
def test_initial_partial_or_pending_service_discovery_blocks_direct_motion(node, select_ready):
    node._mode_select_client.ready = select_ready
    node._probe_input_modes()
    node._dispatch("browser", motion())
    assert sent(node) == []


def test_failed_state_before_selection_response_never_sends_goal(node):
    node._input_modes.update_catalog(CATALOG)
    node._dispatch("browser", motion())
    failed = state()
    failed.phase = InputModeState.FAILED
    failed.detail = "branch failed"
    node._input_mode_state(failed)
    node._input_mode_state(state())
    node._mode_select_client.calls[-1][1].set_result(SelectInputMode.Response(accepted=True, request_id=41))
    assert sent(node) == []
    assert any(event.get("code") == "input_mode_failed" for event, _ in node._server.events)


def test_select_marks_every_arm_action_before_service_and_cancels_delayed_acceptance(node):
    node._input_modes.update_catalog(CATALOG)
    node._input_modes.update_state(InputModeSnapshot("web", "web", "web", "ACTIVE", 40, 1))
    pending = []
    for arm in ("l", "m", "r"):
        for kind in ("execute_motion", "execute_trajectory", "cartesian_velocity"):
            record = ActionRecord(arm, kind, f"owner-{arm}", f"request-{kind}")
            node._actions[(arm, kind)] = record
            if arm == "m":
                pending.append(record)
            else:
                record.goal_handle = GoalHandle(node.log, f"{arm}/{kind}")
    node._dispatch("new-browser", {"type": "select_input_mode", "request_id": "pick-1", "mode_id": "policy"})
    assert all(record.cancel_requested for record in node._actions.values())
    assert node.log == [
        ("cancel", "l/execute_motion"), ("cancel", "l/execute_trajectory"), ("cancel", "l/cartesian_velocity"),
        ("cancel", "r/execute_motion"), ("cancel", "r/execute_trajectory"), ("cancel", "r/cartesian_velocity"),
        ("service", "policy"),
    ]
    for record in pending:
        response = Future()
        response.set_result(GoalHandle(node.log, f"{record.arm}/{record.action}"))
        node._goal_response(record, response)
    assert node.log[-3:] == [("cancel", "m/execute_motion"), ("cancel", "m/execute_trajectory"), ("cancel", "m/cartesian_velocity")]


def test_delayed_acceptance_is_cancelled_even_if_result_listener_setup_fails(node):
    record = ActionRecord("l", "execute_motion", "owner", "request", cancel_requested=True)
    node._actions[("l", "execute_motion")] = record
    response = Future()
    response.set_result(GoalHandle(node.log, "late", broken_result=True))
    node._goal_response(record, response)
    assert node.log == [("cancel", "late")]
    assert ("l", "execute_motion") not in node._actions


@pytest.mark.parametrize("arm", ["l", "m", "r"])
@pytest.mark.parametrize("kind", ["execute_motion", "execute_trajectory", "cartesian_velocity"])
def test_delayed_acceptance_cancel_submission_retries_until_success(node, arm, kind):
    node._input_modes.update_catalog(CATALOG)
    node._input_modes.update_state(InputModeSnapshot("web", "web", "web", "ACTIVE", 40, 1))
    record = ActionRecord(arm, kind, "owner", "old-motion")
    node._actions[(arm, kind)] = record
    node._dispatch("browser", {"type": "select_input_mode", "request_id": "pick-1", "mode_id": "policy"})
    assert node.log == [("service", "policy")]
    handle = GoalHandle(node.log, "late", broken_cancel=True)
    accepted = Future()
    accepted.set_result(handle)
    node._goal_response(record, accepted)
    assert node._actions[(arm, kind)] is record
    assert node.log == [("service", "policy"), ("cancel", "late")]
    handle.broken_cancel = False
    node._drain_commands()
    assert node.log == [("service", "policy"), ("cancel", "late"), ("cancel", "late")]
    with ThreadPoolExecutor(max_workers=4) as executor:
        list(executor.map(lambda _: node._drain_commands(), range(20)))
    assert node.log.count(("cancel", "late")) == 2


def test_concurrent_cancel_requests_do_not_duplicate_successful_submission(node):
    record = ActionRecord("l", "execute_motion", "owner", "request", cancel_requested=True)
    record.goal_handle = GoalHandle(node.log, "goal")
    node._actions[("l", "execute_motion")] = record
    with ThreadPoolExecutor(max_workers=4) as executor:
        list(executor.map(lambda _: node._request_cancel(record), range(20)))
    assert node.log == [("cancel", "goal")]


def test_terminal_action_releases_failed_cancellation_retry(node):
    record = ActionRecord("l", "execute_motion", "owner", "request", cancel_requested=True)
    record.goal_handle = GoalHandle(node.log, "goal", broken_cancel=True)
    node._actions[("l", "execute_motion")] = record
    node._drain_commands()
    assert node.log == [("cancel", "goal")]
    result = Future()
    result.set_result(SimpleNamespace(status=4, result=None))
    node._action_result(record, result)
    node._drain_commands()
    assert ("l", "execute_motion") not in node._actions
    assert node.log == [("cancel", "goal")]


def test_result_transport_failure_does_not_drop_unsent_cancellation(node):
    record = ActionRecord("l", "execute_motion", "owner", "request", cancel_requested=True)
    node._actions[("l", "execute_motion")] = record
    handle = GoalHandle(node.log, "goal", broken_cancel=True)
    accepted = Future()
    accepted.set_result(handle)
    node._goal_response(record, accepted)
    handle.result_future.set_exception(RuntimeError("result transport failed"))
    assert node._actions[("l", "execute_motion")] is record
    handle.broken_cancel = False
    node._drain_commands()
    assert node.log == [("cancel", "goal"), ("cancel", "goal")]
    assert ("l", "execute_motion") not in node._actions


def test_cancel_failure_marks_and_attempts_remaining_goals_but_does_not_select(node):
    node._input_modes.update_catalog(CATALOG)
    node._input_modes.update_state(InputModeSnapshot("web", "web", "web", "ACTIVE", 40, 1))
    for arm in ("l", "m", "r"):
        record = ActionRecord(arm, "execute_motion", "owner", arm)
        record.goal_handle = GoalHandle(node.log, arm, broken_cancel=(arm == "l"))
        node._actions[(arm, "execute_motion")] = record
    node._dispatch("browser", {"type": "select_input_mode", "request_id": "pick-1", "mode_id": "policy"})
    assert all(record.cancel_requested for record in node._actions.values())
    assert node.log == [("cancel", "l"), ("cancel", "m"), ("cancel", "r")]
    assert any(event["type"] == "error" for event, _ in node._server.events)


@pytest.mark.parametrize("kind,handler", [
    ("software_stop", "_software_stop"), ("gripper_command", "_gripper_command"),
    ("recover_motion", "_recover_motion"), ("velocity_command", "_velocity_command"),
    ("cancel_action", "_cancel_action"), ("capture_calibration_sample", "_capture_calibration_sample"),
    ("solve_calibration", "_solve_calibration"), ("solve_ik", "_solve_ik"),
    ("get_current_pose", "_get_current_pose"), ("list_joint_records", "_list_joint_records"),
    ("save_joint_record", "_save_joint_record"), ("delete_joint_record", "_delete_joint_record"),
    ("apply_joint_record", "_apply_joint_record"),
])
def test_neutral_messages_bypass_mode_controller(node, monkeypatch, kind, handler):
    calls = []
    monkeypatch.setattr(node, handler, lambda *args: calls.append(args))
    monkeypatch.setattr(node._input_modes, "intercept_motion", lambda *args: pytest.fail("entered mode gate"))
    node._dispatch("browser-a", {"type": kind, "arm": "l", "action": "execute_motion"})
    assert len(calls) == 1
    assert node._mode_select_client.calls == []


def test_catalog_discovery_is_bounded_and_ignores_response_after_disappearance(node):
    node._probe_input_modes()
    assert len(node._mode_list_client.calls) == 1
    node._probe_input_modes()
    assert len(node._mode_list_client.calls) == 1
    _, stale = node._mode_list_client.calls[0]
    node._mode_select_client.ready = False
    node._probe_input_modes()
    assert node._mode_list_client.removed == [stale]
    stale.set_result(ListInputModes.Response(success=True, mode_ids=["web"], labels=["Web"], selectable=[False]))
    assert not node._input_modes.available


def test_discovery_converts_catalog_without_truncating_malformed_parallel_arrays(node):
    node._probe_input_modes()
    node._mode_list_client.calls[-1][1].set_result(ListInputModes.Response(
        success=True, mode_ids=["custom", "web"], labels=["Custom", "Web"], selectable=[True, False]))
    assert node._server.events[-1][0] == {
        "type": "input_mode_list", "available": True,
        "modes": [{"id": "custom", "label": "Custom", "selectable": True},
                  {"id": "web", "label": "Web", "selectable": False}],
    }
    node._probe_input_modes()
    node._mode_list_client.calls[-1][1].set_result(ListInputModes.Response(
        success=True, mode_ids=["web", "custom"], labels=["Web"], selectable=[False]))
    assert node._server.events[-1][0] == {"type": "input_mode_list", "available": False, "modes": []}


def test_service_disappearance_before_active_state_discards_waiting_goal(node):
    node._input_modes.update_catalog(CATALOG)
    node._dispatch("browser", motion())
    node._mode_select_client.calls[-1][1].set_result(SelectInputMode.Response(accepted=True, request_id=41))
    node._mode_select_client.ready = False
    node._input_mode_state(state())
    assert sent(node) == []
    assert not node._input_modes.available


def test_concurrent_duplicate_state_callbacks_forward_only_once(node):
    node._input_modes.update_catalog(CATALOG)
    node._dispatch("browser", motion())
    node._mode_select_client.calls[-1][1].set_result(SelectInputMode.Response(accepted=True, request_id=41))
    with ThreadPoolExecutor(max_workers=4) as executor:
        list(executor.map(lambda _: node._input_mode_state(state()), range(20)))
    assert len(sent(node)) == 1


def test_late_catalog_response_is_rejected_even_before_probe_timer_runs(node):
    node._probe_input_modes()
    node._mode_list_deadline = time.monotonic() - 1.0
    node._mode_list_client.calls[-1][1].set_result(ListInputModes.Response(
        success=True, mode_ids=["web"], labels=["Web"], selectable=[False]))
    assert not node._input_modes.available


def test_state_arriving_while_unavailable_does_not_repopulate_history(node):
    node._mode_list_client.ready = False
    node._input_mode_state(state())
    node._probe_input_modes()
    node._mode_list_client.ready = True
    node._probe_input_modes()
    node._mode_list_client.calls[-1][1].set_result(ListInputModes.Response(
        success=True, mode_ids=["web"], labels=["Web"], selectable=[False]))
    assert not any(event.get("active_mode") == "web" for event, _ in node._server.events)
    startup = InputModeState(requested_mode="none", selected_mode="none", active_mode="none",
                            phase=InputModeState.ACTIVE, request_id=0, epoch=0)
    node._input_mode_state(startup)
    assert node._server.events[-1][0]["active_mode"] == "none"


def test_restart_accepts_new_state_and_ignores_old_subscription_callback(node):
    node._input_modes.update_catalog(CATALOG)
    old_generation = node._input_modes.generation
    node._input_mode_state(state(), generation=old_generation)
    node._mode_list_client.ready = node._mode_select_client.ready = False
    node._probe_input_modes()
    node._input_mode_state(state(), generation=old_generation)
    node._mode_list_client.ready = node._mode_select_client.ready = True
    node._probe_input_modes()
    node._mode_list_client.calls[-1][1].set_result(ListInputModes.Response(
        success=True, mode_ids=["web", "policy"], labels=["Web", "Policy"], selectable=[False, True]))
    node._input_mode_state(state(), generation=old_generation)
    startup = InputModeState(requested_mode="none", selected_mode="none", active_mode="none",
                            phase=InputModeState.ACTIVE, request_id=0, epoch=0)
    node._input_mode_state(startup, generation=node._input_modes.generation)
    node._dispatch("browser", motion())
    node._mode_select_client.calls[-1][1].set_result(SelectInputMode.Response(accepted=True, request_id=1))
    current = state(1)
    current.epoch = 1
    node._input_mode_state(current, generation=node._input_modes.generation)
    assert len(sent(node)) == 1


def test_expiry_removes_outstanding_selection_transport_and_late_response_is_harmless(node):
    clock = [0.0]
    node._input_modes = InputModeBridge(web_override_timeout_sec=5.0, clock=lambda: clock[0])
    node._input_modes.update_catalog(CATALOG)
    node._dispatch("browser", motion())
    future = node._mode_select_client.calls[-1][1]
    clock[0] = 5.0
    node._drain_commands()
    assert node._mode_select_client.removed == [future]
    future.set_result(SelectInputMode.Response(accepted=True, request_id=41))
    node._input_mode_state(state())
    assert sent(node) == []


def test_delayed_motion_revalidates_limits_and_returns_correlated_error(node):
    node._input_modes.update_catalog(CATALOG)
    node._dispatch("browser", motion())
    node._mode_select_client.calls[-1][1].set_result(SelectInputMode.Response(accepted=True, request_id=41))
    node._robots["l"]["joints"][0]["lower_deg"] = 1.0
    node._input_mode_state(state())
    assert sent(node) == []
    assert any(event.get("code") == "joint_limit" and event.get("request_id") == "move-1"
               and owner == "browser" for event, owner in node._server.events)


def test_selection_transport_exception_discards_motion(node):
    node._input_modes.update_catalog(CATALOG)
    node._dispatch("browser", motion())
    node._mode_select_client.calls[-1][1].set_exception(RuntimeError("service transport failed"))
    node._input_mode_state(state())
    assert sent(node) == []
    assert any(event.get("code") == "input_mode_rejected" for event, _ in node._server.events)


def test_real_node_discovers_services_and_transient_state_using_loaded_timing(monkeypatch, tmp_path):
    import yaml
    from rclpy.executors import SingleThreadedExecutor
    from rclpy.qos import DurabilityPolicy, QoSProfile, ReliabilityPolicy
    import realman_web_control.web_control_node as module

    class Server(Events):
        def __init__(self, **kwargs):
            super().__init__()

        def start(self):
            pass

        def stop(self):
            pass

    monkeypatch.setattr(module, "WebControlServer", Server)
    config_path = Path(__file__).resolve().parents[4] / "config/ros/realman_web_control.yaml"
    monkeypatch.setenv("REALMAN_CONFIG_ROOT", str(config_path.parents[1]))
    config = yaml.safe_load(config_path.read_text())
    config["input_mode"] = {"discovery_period_sec": 0.125, "web_override_timeout_sec": 2.75}
    path = tmp_path / "web.yaml"
    path.write_text(yaml.safe_dump(config))
    rclpy.init(args=["--ros-args", "-p", f"web_control_config_file:={path}"])
    router = Node("mode_test_router")
    received = []

    def list_modes(request, response):
        response.success = True
        response.mode_ids, response.labels, response.selectable = ["web", "policy"], ["Web", "Policy label"], [False, True]
        return response

    publisher = router.create_publisher(InputModeState, "/realman_bt_executor/input_mode_state", QoSProfile(
        depth=1, reliability=ReliabilityPolicy.RELIABLE, durability=DurabilityPolicy.TRANSIENT_LOCAL))
    router.create_service(ListInputModes, "/realman_bt_executor/list_input_modes", list_modes)

    def select_mode(request, response):
        received.append(request.mode_id)
        response.accepted, response.request_id = True, 51
        publisher.publish(InputModeState(requested_mode=request.mode_id, selected_mode=request.mode_id,
            active_mode=request.mode_id, phase=InputModeState.ACTIVE, request_id=51, epoch=3))
        return response

    router.create_service(SelectInputMode, "/realman_bt_executor/select_input_mode", select_mode)
    # Publish before subscription: only compatible transient-local QoS receives it.
    publisher.publish(state(40))
    web_node = None
    executor = SingleThreadedExecutor()
    try:
        web_node = WebControlNode()
        executor.add_node(router)
        executor.add_node(web_node)
        deadline = time.monotonic() + 4.0
        while time.monotonic() < deadline and not any(
            event["type"] == "input_mode_state" for event, _ in web_node._server.events
        ):
            executor.spin_once(timeout_sec=0.02)
        assert web_node._mode_discovery_timer.timer_period_ns == 125_000_000
        assert web_node._input_modes.available
        assert any(event.get("active_mode") == "web" for event, _ in web_node._server.events)
        web_node._dispatch("browser", {"type": "select_input_mode", "request_id": "pick-51", "mode_id": "policy"})
        while time.monotonic() < deadline and not any(
            event["type"] == "input_mode_result" for event, _ in web_node._server.events
        ):
            executor.spin_once(timeout_sec=0.02)
        assert received == ["policy"]
        assert any(event.get("executor_request_id") == 51 for event, _ in web_node._server.events)
    finally:
        executor.shutdown()
        if web_node is not None:
            web_node.destroy_node()
        router.destroy_node()
        rclpy.shutdown()
