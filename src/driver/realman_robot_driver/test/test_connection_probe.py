import sys
from types import ModuleType, SimpleNamespace

import pytest

from realman_robot_driver.connection_probe import (
    RealManProbeError,
    minimal_connection_test,
)


class FakeThreadMode:
    def __call__(self, value):
        return value


class FakeRobot:
    instances = []
    handle_id = 17

    def __init__(self, mode):
        self.mode = mode
        self.deleted = False
        self.destroyed = False
        self.create_args = None
        type(self).instances.append(self)

    def rm_create_robot_arm(self, ip, port, level):
        self.create_args = (ip, port, level)
        return SimpleNamespace(id=type(self).handle_id)

    def rm_get_joint_degree(self):
        return 0, [1.0, 2.0, 3.0, 4.0, 5.0, 6.0]

    def rm_delete_robot_arm(self):
        self.deleted = True
        return 0

    def rm_destroy(self):
        self.destroyed = True
        return 0


def _install_fake_sdk(monkeypatch):
    sdk = ModuleType("Robotic_Arm.rm_robot_interface")
    sdk.RoboticArm = FakeRobot
    sdk.rm_thread_mode_e = FakeThreadMode()
    package = ModuleType("Robotic_Arm")
    package.rm_robot_interface = sdk
    monkeypatch.setitem(sys.modules, "Robotic_Arm", package)
    monkeypatch.setitem(sys.modules, "Robotic_Arm.rm_robot_interface", sdk)


def test_minimal_connection_test_reads_samples_and_releases(monkeypatch):
    FakeRobot.instances = []
    FakeRobot.handle_id = 17
    _install_fake_sdk(monkeypatch)

    result = minimal_connection_test(
        "192.0.2.123",
        robot_port=8080,
        connect_level=3,
        thread_mode=2,
        refresh_interval=0.0,
        print_every_n=0,
        sample_count=2,
    )

    robot = FakeRobot.instances[-1]
    assert result.handle_id == 17
    assert len(result.joint_samples) == 2
    assert robot.mode == 2
    assert robot.create_args == ("192.0.2.123", 8080, 3)
    assert robot.deleted
    assert robot.destroyed


def test_minimal_connection_test_reports_invalid_handle(monkeypatch):
    FakeRobot.instances = []
    FakeRobot.handle_id = -1
    _install_fake_sdk(monkeypatch)

    with pytest.raises(RealManProbeError, match="invalid handle") as error:
        minimal_connection_test(
            "192.0.2.123",
            refresh_interval=0.0,
            print_every_n=0,
            sample_count=1,
        )

    assert error.value.status == -1
    robot = FakeRobot.instances[-1]
    assert robot.deleted
    assert robot.destroyed
