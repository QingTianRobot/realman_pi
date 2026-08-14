from realman_robot_driver.realman_sdk_adapter import RealManSdkAdapter


class FakeRobot:
    def __init__(self):
        self.joint_result = (7, [])

    def rm_get_joint_degree(self):
        return self.joint_result


def test_mock_adapter_is_safe_and_deterministic():
    adapter = RealManSdkAdapter(
        ip="192.0.2.123",
        port=8080,
        thread_mode="RM_TRIPLE_MODE_E",
        robot_model="RM65-B",
        mock_mode=True,
    )

    assert adapter.get_state().connected is False
    assert adapter.stop() == -1
    assert adapter.connect() == 0
    assert adapter.connect() == 0
    state = adapter.get_state()
    assert state.connected is True
    assert state.robot_model == "RM65-B"
    assert state.joint_degrees == (0.0,) * 6
    assert adapter.stop() == 0
    assert adapter.disconnect() == 0
    assert adapter.get_state().connected is False


def test_missing_sdk_reports_a_distinct_status(monkeypatch):
    import builtins

    original_import = builtins.__import__

    def reject_sdk(name, *args, **kwargs):
        if name == "Robotic_Arm.rm_robot_interface":
            raise ImportError("test SDK unavailable")
        return original_import(name, *args, **kwargs)

    monkeypatch.setattr(builtins, "__import__", reject_sdk)
    adapter = RealManSdkAdapter(
        ip="192.0.2.123",
        port=8080,
        thread_mode="RM_TRIPLE_MODE_E",
        robot_model="RM65-B",
        mock_mode=False,
    )

    assert adapter.connect() == -100
    assert adapter.get_state().error_code == -100
    assert adapter.disconnect() == 0
    assert adapter.last_error == 0


def test_state_error_is_retained_until_a_successful_read():
    adapter = RealManSdkAdapter(
        ip="192.0.2.123",
        port=8080,
        thread_mode="RM_TRIPLE_MODE_E",
        robot_model="RM65-B",
        mock_mode=False,
    )
    robot = FakeRobot()
    adapter._robot = robot
    adapter._connected = True

    failed_state = adapter.get_state()

    assert failed_state.error_code == 7
    assert failed_state.joint_degrees == ()
    assert adapter.last_error == 7
    assert adapter.last_error_message == "SDK joint state request failed"

    robot.joint_result = (0, [0.0, 10.0, 20.0, 30.0, 40.0, 50.0])
    recovered_state = adapter.get_state()

    assert recovered_state.error_code == 0
    assert recovered_state.joint_degrees[-1] == 50.0
    assert adapter.last_error == 0
    assert adapter.last_error_message == ""


def test_communication_error_marks_connection_for_retry():
    adapter = RealManSdkAdapter(
        ip="192.0.2.123",
        port=8080,
        thread_mode="RM_TRIPLE_MODE_E",
        robot_model="RM65-B",
        mock_mode=False,
    )
    robot = FakeRobot()
    robot.joint_result = (-2, [])
    adapter._robot = robot
    adapter._connected = True

    state = adapter.get_state()

    assert state.connected is False
    assert state.error_code == -2
    assert adapter.connected is False
