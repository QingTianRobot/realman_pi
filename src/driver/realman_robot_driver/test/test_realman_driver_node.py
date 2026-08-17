import ast
import importlib
import importlib.util
import math
from pathlib import Path
from types import SimpleNamespace

import pytest

from realman_robot_driver.coordinate_manager import CoordinateManager, CoordinatePolicy


NODE_PATH = (
    Path(__file__).resolve().parents[1]
    / "realman_robot_driver"
    / "realman_driver_node.py"
)
PACKAGE_ROOT = NODE_PATH.parents[1]
REPOSITORY_ROOT = NODE_PATH.parents[4]
SINGLE_LAUNCH_PATH = PACKAGE_ROOT / "launch" / "realman_driver.launch.py"
THREE_LAUNCH_PATH = PACKAGE_ROOT / "launch" / "three_realman_drivers.launch.py"
SYSTEM_LAUNCH_PATH = REPOSITORY_ROOT / "src" / "realman_bringup" / "launch" / "system.launch.py"
COORDINATES_CONFIG_PATH = REPOSITORY_ROOT / "config" / "ros" / "realman_coordinates.yaml"


def _has_module(name: str) -> bool:
    try:
        return importlib.util.find_spec(name) is not None
    except (ImportError, ModuleNotFoundError, ValueError):
        return False


def _coordinate_services_module():
    try:
        return importlib.import_module("realman_robot_driver.coordinate_services")
    except ModuleNotFoundError:
        pytest.fail("coordinate service handler module is not implemented")


class FakeCoordinateAdapter:
    def __init__(self) -> None:
        self.arm_id = "l"
        self._tool = _controller_tool("other")
        self._work = _controller_work("other")
        self.calls: list[tuple[object, ...]] = []

    @property
    def tool(self):
        return self._tool

    @tool.setter
    def tool(self, value):
        self._tool = _controller_tool(value) if isinstance(value, str) else value

    @property
    def work(self):
        return self._work

    @work.setter
    def work(self, value):
        self._work = _controller_work(value) if isinstance(value, str) else value

    def current_tool_frame(self):
        self.calls.append(("current_tool_frame",))
        return 0, self._tool

    def current_work_frame(self):
        self.calls.append(("current_work_frame",))
        return 0, self._work

    def set_tool_frame(self, frame):
        self.calls.append(("set_tool_frame", frame))
        self._tool = frame
        return 0

    def set_work_frame(self, frame):
        self.calls.append(("set_work_frame", frame))
        self._work = frame
        return 0

    def change_tool_frame(self, name):
        self.calls.append(("change_tool_frame", name))
        self._tool = _controller_tool(name)
        return 0

    def change_work_frame(self, name):
        self.calls.append(("change_work_frame", name))
        self._work = _controller_work(name)
        return 0


def _controller_tool(name: str):
    if name == "tcpgrip":
        return SimpleNamespace(
            controller_name=name,
            xyz_m=(0.0, 0.0, 0.120),
            quaternion_wxyz=(1.0, 0.0, 0.0, 0.0),
            payload_kg=0.80,
            center_of_mass_m=(0.0, 0.0, 0.060),
        )
    return SimpleNamespace(
        controller_name=name,
        xyz_m=(0.0, 0.0, 0.0),
        quaternion_wxyz=(1.0, 0.0, 0.0, 0.0),
        payload_kg=0.0,
        center_of_mass_m=(0.0, 0.0, 0.0),
    )


def _controller_work(name: str):
    return SimpleNamespace(
        controller_name=name,
        xyz_m=(0.0, 0.0, 0.0),
        quaternion_wxyz=(1.0, 0.0, 0.0, 0.0),
        payload_kg=None,
        center_of_mass_m=None,
    )


class FakeArmOwnership:
    def __init__(self) -> None:
        self.owner: str | None = None

    def is_busy(self, arm: str) -> bool:
        assert arm == "l"
        return self.owner is not None

    def acquire(self, arm: str) -> bool:
        assert arm == "l"
        if self.owner is not None:
            return False
        self.owner = "coordinate"
        return True

    def release(self, arm: str) -> None:
        assert arm == "l"
        assert self.owner is not None
        self.owner = None


class RaisingArmOwnership(FakeArmOwnership):
    def __init__(self, failure: str) -> None:
        super().__init__()
        self.failure = failure

    def acquire(self, arm: str) -> bool:
        if self.failure == "acquire":
            raise RuntimeError("forced acquire failure")
        return super().acquire(arm)

    def release(self, arm: str) -> None:
        super().release(arm)
        if self.failure == "release":
            raise RuntimeError("forced release failure")


def _coordinate_context():
    adapter = FakeCoordinateAdapter()
    ownership = FakeArmOwnership()
    manager = CoordinateManager.from_yaml(
        COORDINATES_CONFIG_PATH,
        is_arm_busy=ownership.is_busy,
        acquire_arm=ownership.acquire,
        release_arm=ownership.release,
    )
    return manager, adapter, ownership


def _launch_calls(path: Path, function_name: str) -> list[ast.Call]:
    tree = ast.parse(path.read_text(encoding="utf-8"))
    function = next(
        node
        for node in tree.body
        if isinstance(node, ast.FunctionDef) and node.name == function_name
    )
    return [node for node in ast.walk(function) if isinstance(node, ast.Call)]


def _declared_launch_arguments(path: Path) -> set[str]:
    return {
        call.args[0].value
        for call in _launch_calls(path, "generate_launch_description")
        if isinstance(call.func, ast.Name)
        and call.func.id == "DeclareLaunchArgument"
        and call.args
        and isinstance(call.args[0], ast.Constant)
        and isinstance(call.args[0].value, str)
    }


def _dict_keys_in_calls(path: Path, function_name: str, call_name: str) -> list[set[str]]:
    result = []
    for call in _launch_calls(path, function_name):
        if not isinstance(call.func, ast.Name) or call.func.id != call_name:
            continue
        keys: set[str] = set()
        for node in ast.walk(call):
            if isinstance(node, ast.Dict):
                keys.update(
                    key.value
                    for key in node.keys
                    if isinstance(key, ast.Constant) and isinstance(key.value, str)
                )
        result.append(keys)
    return result


ROS_ACTION_RUNTIME_AVAILABLE = all(
    _has_module(name)
    for name in (
        "rclpy",
        "sensor_msgs.msg",
        "realman_msgs.action",
        "realman_msgs.srv",
    )
)

if ROS_ACTION_RUNTIME_AVAILABLE:
    import rclpy

    from rclpy.callback_groups import ReentrantCallbackGroup
    from realman_msgs.srv import SelectFrame, VerifyCoordinates
    from realman_robot_driver.realman_driver_node import RealManDriverNode
    from realman_robot_driver.realman_sdk_adapter import RobotState
    from sensor_msgs.msg import JointState
else:
    rclpy = None
    ReentrantCallbackGroup = None
    RealManDriverNode = None
    RobotState = None
    JointState = None
    SelectFrame = None
    VerifyCoordinates = None


requires_ros_action_runtime = pytest.mark.skipif(
    not ROS_ACTION_RUNTIME_AVAILABLE,
    reason="generated realman_msgs and the ROS 2 Python runtime are required",
)


def test_coordinates_verify_reports_mismatch_without_writes():
    module = _coordinate_services_module()
    manager, adapter, ownership = _coordinate_context()

    result = module.run_coordinate_operation(
        manager, adapter, ownership, "l", "verify"
    )

    assert result.success is True
    assert result.matched is False
    assert result.api2_status == 0
    assert adapter.calls == [("current_tool_frame",), ("current_work_frame",)]


def test_coordinates_apply_writes_then_reads_back():
    module = _coordinate_services_module()
    manager, adapter, ownership = _coordinate_context()

    result = module.run_coordinate_operation(
        manager, adapter, ownership, "l", "apply"
    )

    assert result.success is True
    assert result.matched is True
    assert result.api2_status == 0
    assert [call[0] for call in adapter.calls] == [
        "set_tool_frame",
        "set_work_frame",
        "change_tool_frame",
        "change_work_frame",
        "current_tool_frame",
        "current_work_frame",
    ]


def test_coordinates_select_tool_selects_configured_frame():
    module = _coordinate_services_module()
    manager, adapter, ownership = _coordinate_context()
    adapter.work = "cell"

    result = module.run_coordinate_operation(
        manager, adapter, ownership, "l", "select_tool", "tcpgrip"
    )

    assert result.success is True
    assert result.matched is True
    assert result.active_name == "tcpgrip"
    assert ("change_tool_frame", "tcpgrip") in adapter.calls


def test_coordinates_verify_preserves_api2_read_status():
    module = _coordinate_services_module()
    manager, adapter, ownership = _coordinate_context()

    def failed_tool_read():
        adapter.calls.append(("current_tool_frame",))
        return 37, None

    adapter.current_tool_frame = failed_tool_read

    result = module.run_coordinate_operation(
        manager, adapter, ownership, "l", "verify"
    )

    assert result.success is False
    assert result.matched is False
    assert result.api2_status == 37


@pytest.mark.parametrize(
    ("operation", "name"),
    [
        ("verify", ""),
        ("apply", ""),
        ("select_tool", "tcpgrip"),
        ("select_work", "cell"),
    ],
)
def test_coordinates_operations_reject_busy_arm_without_adapter_calls(
    operation: str, name: str
):
    module = _coordinate_services_module()
    manager, adapter, ownership = _coordinate_context()
    assert ownership.acquire("l") is True

    result = module.run_coordinate_operation(
        manager, adapter, ownership, "l", operation, name
    )

    assert result.success is False
    assert result.matched is False
    assert result.api2_status != 0
    assert "busy" in result.message
    assert adapter.calls == []


@pytest.mark.parametrize(
    ("operation", "name"),
    [
        ("verify", ""),
        ("apply", ""),
        ("select_tool", "tcpgrip"),
        ("select_work", "cell"),
    ],
)
def test_coordinates_publish_active_references_before_releasing_ownership(
    operation: str, name: str
):
    module = _coordinate_services_module()
    manager, adapter, ownership = _coordinate_context()
    adapter.tool = "tcpgrip"
    adapter.work = "cell"
    published = []

    def publish(result):
        assert ownership.acquire("l") is False
        published.append(result)

    result = module.run_coordinate_operation(
        manager,
        adapter,
        ownership,
        "l",
        operation,
        name,
        publish_result=publish,
    )

    assert result.success is True
    assert published == [result]
    assert ownership.owner is None


def test_coordinates_publisher_exception_fails_closed_and_releases_ownership():
    module = _coordinate_services_module()
    manager, adapter, ownership = _coordinate_context()

    def fail_publication(_result):
        raise RuntimeError("forced publication failure")

    result = module.run_coordinate_operation(
        manager,
        adapter,
        ownership,
        "l",
        "apply",
        publish_result=fail_publication,
    )

    assert result.success is False
    assert result.api2_status == -1
    assert "publication" in result.message
    assert manager.motion_allowed("l") is False
    assert ownership.owner is None


@pytest.mark.parametrize("failure", ["acquire", "release"])
def test_coordinates_ownership_exceptions_are_structured_failures(failure: str):
    module = _coordinate_services_module()
    adapter = FakeCoordinateAdapter()
    ownership = RaisingArmOwnership(failure)
    manager = CoordinateManager.from_yaml(
        COORDINATES_CONFIG_PATH,
        acquire_arm=ownership.acquire,
        release_arm=ownership.release,
    )

    result = module.run_coordinate_operation(
        manager, adapter, ownership, "l", "verify"
    )

    assert result.success is False
    assert result.api2_status == -1
    assert failure in result.message
    assert manager.motion_allowed("l") is False
    assert ownership.owner is None


def test_verify_only_startup_reads_without_controller_writes():
    module = _coordinate_services_module()
    manager, adapter, ownership = _coordinate_context()

    module.run_startup_coordinate_policy(manager, adapter, ownership, "l")

    assert adapter.calls == [("current_tool_frame",), ("current_work_frame",)]


def test_explicit_apply_startup_verifies_before_writing_and_reading_back():
    module = _coordinate_services_module()
    manager, adapter, ownership = _coordinate_context()
    manager.policy = CoordinatePolicy("apply", "block_motion")

    result = module.run_startup_coordinate_policy(manager, adapter, ownership, "l")

    assert result.success is True
    assert [call[0] for call in adapter.calls] == [
        "current_tool_frame",
        "current_work_frame",
        "set_tool_frame",
        "set_work_frame",
        "change_tool_frame",
        "change_work_frame",
        "current_tool_frame",
        "current_work_frame",
    ]


def test_explicit_apply_startup_does_not_write_when_verify_already_matches():
    module = _coordinate_services_module()
    manager, adapter, ownership = _coordinate_context()
    manager.policy = CoordinatePolicy("apply", "block_motion")
    adapter.tool = "tcpgrip"
    adapter.work = "cell"

    result = module.run_startup_coordinate_policy(manager, adapter, ownership, "l")

    assert result.success is True
    assert result.matched is True
    assert adapter.calls == [("current_tool_frame",), ("current_work_frame",)]


def test_startup_rejects_busy_arm_without_adapter_calls():
    module = _coordinate_services_module()
    manager, adapter, ownership = _coordinate_context()
    assert ownership.acquire("l") is True

    result = module.run_startup_coordinate_policy(manager, adapter, ownership, "l")

    assert result.success is False
    assert result.api2_status == -1
    assert "busy" in result.message
    assert adapter.calls == []


def test_launches_declare_coordinate_and_motion_config_paths():
    expected = {"coordinates_config_file", "motion_config_file"}

    assert expected <= _declared_launch_arguments(SINGLE_LAUNCH_PATH)
    assert expected <= _declared_launch_arguments(THREE_LAUNCH_PATH)
    assert expected <= _declared_launch_arguments(SYSTEM_LAUNCH_PATH)


def test_driver_launches_pass_coordinate_and_motion_parameters_to_nodes():
    expected = {"coordinates_config_file", "motion_config_file"}

    assert any(
        expected <= keys
        for keys in _dict_keys_in_calls(SINGLE_LAUNCH_PATH, "_launch_node", "Node")
    )
    assert any(
        expected <= keys
        for keys in _dict_keys_in_calls(THREE_LAUNCH_PATH, "_launch_nodes", "Node")
    )


def test_system_launch_forwards_coordinate_and_motion_config_paths():
    expected = {"coordinates_config_file", "motion_config_file"}

    assert any(
        expected <= keys
        for keys in _dict_keys_in_calls(
            SYSTEM_LAUNCH_PATH,
            "generate_launch_description",
            "IncludeLaunchDescription",
        )
    )


def test_launch_config_defaults_follow_root_config_override():
    for path in (SINGLE_LAUNCH_PATH, THREE_LAUNCH_PATH, SYSTEM_LAUNCH_PATH):
        tree = ast.parse(path.read_text(encoding="utf-8"))
        generate = next(
            node
            for node in tree.body
            if isinstance(node, ast.FunctionDef)
            and node.name == "generate_launch_description"
        )
        assignments = {
            target.id: value
            for node in generate.body
            if isinstance(node, ast.Assign)
            for target in node.targets
            if isinstance(target, ast.Name)
            for value in (node.value,)
        }

        for default_name in ("default_coordinates_config", "default_motion_config"):
            default = assignments[default_name]
            referenced_names = {
                node.id for node in ast.walk(default) if isinstance(node, ast.Name)
            }
            assert any(
                name in assignments
                and "REALMAN_CONFIG_ROOT" in ast.unparse(assignments[name])
                for name in referenced_names
            )


def test_main_uses_multithreaded_executor_instead_of_rclpy_spin():
    tree = ast.parse(NODE_PATH.read_text(encoding="utf-8"))
    imported_names = {
        alias.name
        for node in ast.walk(tree)
        if isinstance(node, (ast.Import, ast.ImportFrom))
        for alias in node.names
    }
    calls = [node.func for node in ast.walk(tree) if isinstance(node, ast.Call)]

    assert "MultiThreadedExecutor" in imported_names
    assert any(
        isinstance(function, ast.Name) and function.id == "MultiThreadedExecutor"
        for function in calls
    )
    assert not any(
        isinstance(function, ast.Attribute)
        and isinstance(function.value, ast.Name)
        and function.value.id == "rclpy"
        and function.attr == "spin"
        for function in calls
    )


def test_node_source_registers_execute_motion_action_with_all_lifecycle_callbacks():
    source = NODE_PATH.read_text(encoding="utf-8")

    assert "ActionServer(" in source
    assert '"execute_motion"' in source
    assert "execute_callback=self.motion_coordinator.execute" in source
    assert "goal_callback=self.motion_coordinator.goal_callback" in source
    assert "cancel_callback=self.motion_coordinator.cancel_callback" in source
    assert "handle_accepted_callback=self.motion_coordinator.accepted_callback" in source
    assert "callback_group=self.motion_callback_group" in source


def test_node_source_registers_cartesian_velocity_action_and_command_topic():
    source = NODE_PATH.read_text(encoding="utf-8")

    assert "from realman_msgs.action import CartesianVelocity" in source
    assert "from geometry_msgs.msg import TwistStamped" in source
    assert '"cartesian_velocity"' in source
    assert "execute_callback=self.velocity_session.execute" in source
    assert "goal_callback=self.velocity_session.goal_callback" in source
    assert "cancel_callback=self.velocity_session.cancel_callback" in source
    assert "handle_accepted_callback=self.velocity_session.accepted_callback" in source
    assert '"cartesian_velocity/command"' in source
    assert "self.velocity_session.accept_command" in source


def test_node_shutdown_stops_velocity_before_disconnect():
    source = NODE_PATH.read_text(encoding="utf-8")
    destroy_source = source[source.index("    def destroy_node"):]
    assert destroy_source.index("self.velocity_session.shutdown()") < destroy_source.index(
        "self.adapter.disconnect()"
    )


def test_node_source_stops_coordinator_before_adapter_disconnect():
    tree = ast.parse(NODE_PATH.read_text(encoding="utf-8"))
    destroy = next(
        node
        for node in ast.walk(tree)
        if isinstance(node, ast.FunctionDef) and node.name == "destroy_node"
    )
    calls = [
        ast.unparse(node.func)
        for node in ast.walk(destroy)
        if isinstance(node, ast.Call)
    ]

    assert calls.index("self.motion_coordinator.shutdown") < calls.index(
        "self.adapter.disconnect"
    )


def test_node_source_clears_motion_lockout_only_after_successful_disconnect():
    source = NODE_PATH.read_text(encoding="utf-8")

    assert "if code == 0:\n            self.motion_coordinator.clear_lockout_after_disconnect()" in source
    assert "if self.adapter.disconnect() == 0:\n            self.motion_coordinator.clear_lockout_after_disconnect()" in source


def test_disconnect_service_exposes_shutdown_failure_even_when_sdk_disconnect_succeeds():
    source = NODE_PATH.read_text(encoding="utf-8")

    assert "shutdown_status = self.motion_coordinator.shutdown()" in source
    assert "response.success = shutdown_status == 0 and code == 0" in source
    assert "shutdown_status" in source


def test_connect_reconciles_physical_lockout_with_read_only_trajectory_state():
    source = NODE_PATH.read_text(encoding="utf-8")

    assert "was_connected = self.adapter.connected" in source
    assert "connection_reset=not was_connected" in source


def test_connect_returns_coordinate_api_failure_instead_of_ready_status():
    tree = ast.parse(NODE_PATH.read_text(encoding="utf-8"))
    connect = next(
        node
        for node in ast.walk(tree)
        if isinstance(node, ast.FunctionDef) and node.name == "_connect_to_robot"
    )
    returns = [
        ast.unparse(node.value)
        for node in ast.walk(connect)
        if isinstance(node, ast.Return) and node.value is not None
    ]

    assert "verification.api2_status" in returns


def test_mock_coordinate_profile_is_configured_before_auto_connect():
    source = NODE_PATH.read_text(encoding="utf-8")

    configure_index = source.index(
        "self.adapter.configure_mock_coordinate_profile(profile)"
    )
    auto_connect_index = source.index("if self.auto_connect:")

    assert configure_index < auto_connect_index


def test_stop_service_delegates_fast_stop_to_coordinator():
    tree = ast.parse(NODE_PATH.read_text(encoding="utf-8"))
    stop = next(
        node
        for node in ast.walk(tree)
        if isinstance(node, ast.FunctionDef) and node.name == "_stop"
    )
    calls = [ast.unparse(node.func) for node in ast.walk(stop) if isinstance(node, ast.Call)]

    assert "self.motion_coordinator.fast_stop" in calls
    assert "self.adapter.stop" not in calls


def test_node_source_passes_motion_completion_and_stop_safety_limits():
    source = NODE_PATH.read_text(encoding="utf-8")

    assert "stop_timeout_sec=self.motion_settings.stop_timeout_sec" in source
    assert (
        "joint_goal_tolerance_deg=self.motion_settings.joint_goal_tolerance_deg"
        in source
    )


@requires_ros_action_runtime
def test_mock_node_constructs_and_exposes_services():
    rclpy.init()
    node = None
    try:
        node = RealManDriverNode(
            namespace="l",
            parameter_overrides=[
                rclpy.parameter.Parameter("robot_ip", value="127.0.0.1"),
                rclpy.parameter.Parameter("mock_mode", value=True),
                rclpy.parameter.Parameter("auto_connect", value=False),
            ]
        )
        service_names = {service.srv_name for service in node.services}

        assert node.get_name() == "realman_driver"
        assert {
            "connect",
            "disconnect",
            "stop",
            "status",
            "coordinates/verify",
            "coordinates/apply",
            "coordinates/select_tool",
            "coordinates/select_work",
        } <= service_names
        assert node.adapter.arm_id == "l"
        assert isinstance(node.motion_callback_group, ReentrantCallbackGroup)
        assert ("/l/execute_motion", ["realman_msgs/action/ExecuteMotion"]) in (
            node.get_action_names_and_types()
        )
    finally:
        if node is not None:
            node.destroy_node()
        rclpy.shutdown()


@requires_ros_action_runtime
def test_coordinate_callbacks_fill_generated_service_responses():
    rclpy.init()
    node = None
    try:
        node = RealManDriverNode(
            namespace="l",
            parameter_overrides=[
                rclpy.parameter.Parameter("robot_ip", value="127.0.0.1"),
                rclpy.parameter.Parameter("mock_mode", value=True),
                rclpy.parameter.Parameter("auto_connect", value=False),
            ],
        )
        adapter = FakeCoordinateAdapter()
        adapter.work = "cell"
        node.adapter = adapter

        verify = node._verify_coordinates(
            VerifyCoordinates.Request(), VerifyCoordinates.Response()
        )
        select_request = SelectFrame.Request()
        select_request.name = "tcpgrip"
        selected = node._select_tool_frame(select_request, SelectFrame.Response())

        assert verify.success is True
        assert verify.matched is False
        assert verify.api2_status == 0
        assert selected.success is True
        assert selected.api2_status == 0
        assert selected.active_name == "tcpgrip"
        assert selected.message

        adapter.calls.clear()
        assert node.arm_ownership.acquire("l") is True
        busy = node._apply_coordinates(
            VerifyCoordinates.Request(), VerifyCoordinates.Response()
        )
        node.arm_ownership.release("l")

        assert busy.success is False
        assert busy.matched is False
        assert busy.api2_status != 0
        assert "busy" in busy.message
        assert adapter.calls == []
    finally:
        if node is not None:
            node.destroy_node()
        rclpy.shutdown()

@requires_ros_action_runtime
def test_vendor_degrees_are_published_as_ros_radians():
    rclpy.init()
    node = None
    listener = None
    try:
        node = RealManDriverNode(
            namespace="l",
            parameter_overrides=[
                rclpy.parameter.Parameter("robot_ip", value="192.0.2.123"),
                rclpy.parameter.Parameter("mock_mode", value=True),
                rclpy.parameter.Parameter("auto_connect", value=False),
            ]
        )
        listener = rclpy.create_node("joint_state_test_listener")
        received = []
        listener.create_subscription(
            JointState,
            "/joint_states",
            received.append,
            10,
        )
        node.adapter.get_state = lambda: RobotState(
            (0.0, 90.0, -90.0, 180.0, 45.0, -45.0),
            True,
            "RM65-B",
            0,
        )

        node._publish_state()
        for _ in range(10):
            rclpy.spin_once(listener, timeout_sec=0.1)
            if received:
                break

        assert received
        assert received[0].name == [f"joint_{index}" for index in range(1, 7)]
        assert received[0].position == pytest.approx(
            [0.0, math.pi / 2, -math.pi / 2, math.pi, math.pi / 4, -math.pi / 4]
        )
    finally:
        if listener is not None:
            listener.destroy_node()
        if node is not None:
            node.destroy_node()
        rclpy.shutdown()

@requires_ros_action_runtime
def test_auto_connect_mock_mode_publishes_zero_state():
    rclpy.init()
    node = None
    listener = None
    try:
        node = RealManDriverNode(
            namespace="l",
            parameter_overrides=[
                rclpy.parameter.Parameter("robot_ip", value="192.0.2.123"),
                rclpy.parameter.Parameter("mock_mode", value=True),
                rclpy.parameter.Parameter("auto_connect", value=True),
            ]
        )
        listener = rclpy.create_node("mock_joint_state_test_listener")
        received = []
        listener.create_subscription(
            JointState,
            "/joint_states",
            received.append,
            10,
        )

        node._publish_state()
        for _ in range(10):
            rclpy.spin_once(listener, timeout_sec=0.1)
            if received:
                break

        assert node.adapter.connected
        assert node.adapter._event_callback == node.motion_coordinator.handle_event
        assert received
        assert received[0].position == pytest.approx([0.0] * 6)
    finally:
        if listener is not None:
            listener.destroy_node()
        if node is not None:
            node.destroy_node()
        rclpy.shutdown()


@requires_ros_action_runtime
def test_node_fails_closed_for_unknown_namespace_and_nontriple_thread_mode():
    rclpy.init()
    nodes = []
    try:
        with pytest.raises(ValueError, match="namespace"):
            nodes.append(
                RealManDriverNode(
                    namespace="unknown",
                    parameter_overrides=[
                        rclpy.parameter.Parameter("robot_ip", value="192.0.2.123"),
                        rclpy.parameter.Parameter("mock_mode", value=True),
                        rclpy.parameter.Parameter("auto_connect", value=False),
                    ],
                )
            )
        with pytest.raises(ValueError, match="RM_TRIPLE_MODE_E"):
            nodes.append(
                RealManDriverNode(
                    namespace="l",
                    parameter_overrides=[
                        rclpy.parameter.Parameter("robot_ip", value="192.0.2.123"),
                        rclpy.parameter.Parameter("thread_mode", value="RM_DUAL_MODE_E"),
                        rclpy.parameter.Parameter("mock_mode", value=True),
                        rclpy.parameter.Parameter("auto_connect", value=False),
                    ],
                )
            )
    finally:
        for node in nodes:
            node.destroy_node()
        rclpy.shutdown()
