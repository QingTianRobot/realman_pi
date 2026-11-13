"""In-process reconnect after the arm link drops or was never up.

The vendor SDK's rm_destroy() is process-global ("close all arm connections,
destroy all threads") and RoboticArm(mode) re-runs rm_init(). After that pair
rm_create_robot_arm() keeps returning id -1 until the process restarts, which is
what left /m and /r stuck on 2026-11-13. These tests use a fake SDK module that
models that behaviour and check the adapter recovers by recreating only the
arm's own handle.
"""

from __future__ import annotations

import sys
from types import ModuleType, SimpleNamespace

import pytest

from realman_robot_driver.realman_sdk_adapter import RealManSdkAdapter


class FakeSdk:
    """Process-global fake of the RealMan C SDK state."""

    def __init__(self, invalid_creates: int) -> None:
        self.invalid_creates = invalid_creates
        self.init_calls = 0
        self.destroyed = False
        self.instances: list[FakeRoboticArm] = []
        self.next_id = 1
        self.calls: list[tuple] = []

    def install(self, monkeypatch: pytest.MonkeyPatch) -> None:
        sdk = self

        class RoboticArm(FakeRoboticArm):
            def __init__(self, mode=None):
                super().__init__(sdk, mode)

        module = ModuleType("Robotic_Arm.rm_robot_interface")
        module.RoboticArm = RoboticArm
        module.rm_thread_mode_e = SimpleNamespace(RM_TRIPLE_MODE_E=object())
        package = ModuleType("Robotic_Arm")
        package.rm_robot_interface = module
        monkeypatch.setitem(sys.modules, "Robotic_Arm", package)
        monkeypatch.setitem(sys.modules, "Robotic_Arm.rm_robot_interface", module)


class FakeRoboticArm:
    def __init__(self, sdk: FakeSdk, mode) -> None:
        self.sdk = sdk
        self.handle = None
        sdk.instances.append(self)
        if mode is not None:
            sdk.init_calls += 1
            sdk.calls.append(("rm_init",))

    def rm_create_robot_arm(self, ip, port):
        sdk = self.sdk
        sdk.calls.append(("rm_create_robot_arm", ip, port))
        # Real SDK: after rm_destroy() a re-init does not bring creates back.
        if sdk.destroyed or sdk.invalid_creates > 0:
            sdk.invalid_creates = max(0, sdk.invalid_creates - 1)
            self.handle = SimpleNamespace(id=-1)
        else:
            self.handle = SimpleNamespace(id=sdk.next_id)
            sdk.next_id += 1
        return self.handle

    def rm_delete_robot_arm(self):
        self.sdk.calls.append(("rm_delete_robot_arm", self.handle.id))
        return 0

    def rm_destroy(self):
        self.sdk.calls.append(("rm_destroy",))
        self.sdk.destroyed = True
        return 0

    def rm_get_joint_degree(self):
        self.sdk.calls.append(("rm_get_joint_degree",))
        return self.sdk.joint_result


def _adapter(**kwargs) -> RealManSdkAdapter:
    return RealManSdkAdapter(
        ip="192.0.2.125",
        port=8080,
        thread_mode="RM_TRIPLE_MODE_E",
        robot_model="RM65-B",
        mock_mode=False,
        **kwargs,
    )


def _names(calls):
    return [call[0] for call in calls]


@pytest.mark.parametrize("invalid_creates", [1, 3, 12])
def test_cold_connect_recovers_after_invalid_handles_without_restart(
    monkeypatch, invalid_creates
):
    """Arm powered on late: every retry fails until it answers, then connects."""
    sdk = FakeSdk(invalid_creates)
    sdk.install(monkeypatch)
    adapter = _adapter()

    for _ in range(invalid_creates):
        assert adapter.connect() == -1
        assert adapter.connected is False
        assert adapter.last_error_message == "SDK returned an invalid robot handle"

    assert adapter.connect() == 0
    assert adapter.connected is True
    assert adapter.last_error == 0
    assert adapter._handle.id == 1
    # rm_init ran once; the SDK was never torn down between retries.
    assert sdk.init_calls == 1
    assert len(sdk.instances) == 1
    assert "rm_destroy" not in _names(sdk.calls)
    assert _names(sdk.calls).count("rm_create_robot_arm") == invalid_creates + 1


def test_lost_connection_recovers_after_invalid_handles_without_restart(monkeypatch):
    """Controller error cleared on the pendant: link drops, comes back later."""
    sdk = FakeSdk(0)
    sdk.install(monkeypatch)
    adapter = _adapter()
    assert adapter.connect() == 0
    first_handle = adapter._handle

    # The state read reports a communication error, which marks the arm lost.
    sdk.joint_result = (-2, [])
    assert adapter.get_state().connected is False
    assert adapter.connected is False

    sdk.invalid_creates = 5
    for _ in range(5):
        assert adapter.connect() == -1
    assert adapter.connect() == 0

    assert adapter.connected is True
    assert adapter._handle is not first_handle
    assert adapter._handle.id == 2
    # The lost handle was released exactly once; failed id -1 handles are not
    # handed back to the SDK.
    assert sdk.calls.count(("rm_delete_robot_arm", first_handle.id)) == 1
    assert ("rm_delete_robot_arm", -1) not in sdk.calls
    assert "rm_destroy" not in _names(sdk.calls)
    assert sdk.init_calls == 1

    sdk.joint_result = (0, [0.0, 1.0, 2.0, 3.0, 4.0, 5.0])
    state = adapter.get_state()
    assert state.connected is True
    assert state.joint_degrees[-1] == 5.0


def test_disconnect_releases_only_the_handle_so_the_next_connect_succeeds(monkeypatch):
    """The node's error paths call disconnect(); that must stay recoverable."""
    sdk = FakeSdk(0)
    sdk.install(monkeypatch)
    adapter = _adapter()
    assert adapter.connect() == 0

    assert adapter.disconnect() == 0
    assert adapter.connected is False
    assert adapter._handle is None
    assert ("rm_delete_robot_arm", 1) in sdk.calls
    assert "rm_destroy" not in _names(sdk.calls)

    sdk.invalid_creates = 2
    assert adapter.connect() == -1
    assert adapter.connect() == -1
    assert adapter.connect() == 0
    assert adapter._handle.id == 2
    assert sdk.init_calls == 1


def test_event_recovery_reconnect_failure_keeps_the_sdk_for_the_next_retry(monkeypatch):
    sdk = FakeSdk(0)
    sdk.install(monkeypatch)
    adapter = _adapter()
    assert adapter.connect() == 0

    sdk.invalid_creates = 1
    assert adapter.reconnect() == -1
    assert adapter.connected is False
    assert adapter.connect() == 0
    assert adapter._handle.id == 2
    assert "rm_destroy" not in _names(sdk.calls)
    assert len(sdk.instances) == 1


def test_create_exception_is_retried_on_the_same_sdk_object(monkeypatch):
    sdk = FakeSdk(0)
    sdk.install(monkeypatch)
    adapter = _adapter()
    original_create = FakeRoboticArm.rm_create_robot_arm
    failures = [OSError("socket connect err")]

    def flaky_create(self, ip, port):
        if failures:
            raise failures.pop()
        return original_create(self, ip, port)

    monkeypatch.setattr(FakeRoboticArm, "rm_create_robot_arm", flaky_create)

    assert adapter.connect() == -1
    assert adapter.last_error_message == "socket connect err"
    assert adapter.connect() == 0
    assert len(sdk.instances) == 1
    assert "rm_destroy" not in _names(sdk.calls)


def test_shutdown_is_the_only_path_that_destroys_the_sdk(monkeypatch):
    sdk = FakeSdk(0)
    sdk.install(monkeypatch)
    adapter = _adapter()
    assert adapter.connect() == 0

    assert adapter.shutdown() == 0

    assert _names(sdk.calls)[-2:] == ["rm_delete_robot_arm", "rm_destroy"]
    assert adapter._robot is None
    assert adapter.connected is False


def test_each_arm_adapter_reconnects_without_touching_another_arms_handle(monkeypatch):
    sdk = FakeSdk(0)
    sdk.install(monkeypatch)
    left = _adapter()
    left.ip = "192.0.2.123"
    right = _adapter()
    right.ip = "192.0.2.124"
    assert left.connect() == 0
    assert right.connect() == 0
    left_handle = left._handle

    sdk.joint_result = (-2, [])
    assert right.get_state().connected is False
    sdk.invalid_creates = 2
    assert right.connect() == -1
    assert right.connect() == -1
    assert right.connect() == 0

    assert left.connected is True
    assert left._handle is left_handle
    deleted = [call[1] for call in sdk.calls if call[0] == "rm_delete_robot_arm"]
    assert left_handle.id not in deleted
    assert "rm_destroy" not in _names(sdk.calls)
