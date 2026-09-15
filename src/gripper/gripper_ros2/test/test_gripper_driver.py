import unittest

from gripper_ros2 import gripper_driver as gd


class FakeInstrument:
    def __init__(self, address):
        self.address = address


class FakeSDK:
    fail_ports = set()

    def __init__(self, port, slave_id=1, baudrate=115200, timeout=0.3):
        if port in self.fail_ports:
            raise OSError(f"could not open {port}")
        self.port = port
        self.instrument = FakeInstrument(slave_id)
        self.calls = []

    def connect(self):
        self.calls.append(("connect",))
        return True

    def disconnect(self):
        self.calls.append(("disconnect",))

    def enable(self, value=True):
        self.calls.append(("enable", value))

    def temp_move(self, position_mm, speed_pct, force_pct, accel, decel, trigger=True):
        self.calls.append(("temp_move", position_mm, speed_pct, force_pct))

    def set_temp_position_mm(self, position):
        self.calls.append(("set_pos", position))

    def trigger_temp_move(self):
        self.calls.append(("trigger",))

    def _r(self, address, count=1):
        if address == gd.REG_SPEED_FB:
            return [100, 20, 0, 4500][:count]
        if address == gd.REG_TORQUE_REACHED:
            return [1, 0, 0, 1][:count]
        if address == gd.REG_ALARM:
            return [2][:count]
        return [0] * count


class DriverTest(unittest.TestCase):
    def setUp(self):
        self.original = gd.Changingtek_rtu_psdk
        gd.Changingtek_rtu_psdk = FakeSDK

    def tearDown(self):
        gd.Changingtek_rtu_psdk = self.original
        FakeSDK.fail_ports = set()

    def manager(self):
        manager = gd.GripperManager()
        manager.add_bus("/bus")
        manager.add_gripper("/bus", 4, name="left", max_position=9000)
        manager.add_gripper("/bus", 5, name="right", max_position=8000)
        manager.connect_all()
        return manager

    def test_one_sdk_is_shared_and_address_switches(self):
        manager = self.manager()
        left, right = manager.get("left"), manager.get("right")
        left.read_feedback()
        self.assertEqual(left.bus._sdk.instrument.address, 4)
        right.read_feedback()
        self.assertEqual(right.bus._sdk.instrument.address, 5)
        self.assertIs(left.bus._sdk, right.bus._sdk)

    def test_feedback_is_batch_parsed(self):
        device = self.manager().get("left")
        feedback = device.read_feedback()
        self.assertEqual(feedback["position"], 4500)
        self.assertEqual(feedback["position_mm"], 45.0)
        self.assertTrue(feedback["torque_reached"])
        self.assertEqual(feedback["alarm"], 2)

    def test_unchanged_parameters_use_short_write(self):
        device = self.manager().get("left")
        device.move_to(1000)
        device.bus._sdk.calls.clear()
        device.move_to(2000)
        kinds = [call[0] for call in device.bus._sdk.calls]
        self.assertEqual(kinds, ["set_pos", "trigger"])

    def test_missing_port_can_reconnect(self):
        FakeSDK.fail_ports = {"/bad"}
        manager = gd.GripperManager()
        manager.add_bus("/bad")
        manager.add_gripper("/bad", 1, name="g")
        self.assertFalse(manager.connect_all()["/bad"])
        FakeSDK.fail_ports.clear()
        self.assertTrue(manager.get_bus("/bad").connect())


if __name__ == "__main__":
    unittest.main()
