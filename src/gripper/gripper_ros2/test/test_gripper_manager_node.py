from pathlib import Path
import tempfile
import unittest

try:
    from gripper_ros2 import gripper_driver as gd
    from gripper_ros2 import gripper_manager_node as gmn
    from gripper_ros2_msgs.srv import MoveGripperRaw, SetGripperLimits
    HAVE_ROS = True
except ImportError:  # no ROS 2 environment (e.g. a developer laptop)
    HAVE_ROS = False


CONFIG = """buses:
  - port: /dev/fake_right
    grippers:
      - {name: gripper_right, slave_id: 1, open_position: 4000, close_position: 8500, min_position: 0, max_position: 8500}
"""


class FakeInstrument:
    def __init__(self, address):
        self.address = address


class FakeSDK:
    def __init__(self, port, slave_id=1, baudrate=115200, timeout=0.3):
        self.port = port
        self.instrument = FakeInstrument(slave_id)
        self.calls = []

    def connect(self):
        return True

    def disconnect(self):
        pass

    def enable(self, value=True):
        self.calls.append(("enable", value))

    def temp_move(self, position_mm, speed_pct, force_pct, accel, decel, trigger=True):
        self.calls.append(("temp_move", position_mm))

    def set_temp_position_mm(self, position):
        self.calls.append(("set_pos", position))

    def trigger_temp_move(self):
        self.calls.append(("trigger",))

    def set_cmd_update_mode(self, mode):
        pass

    def wait_until_pos_or_torque(self, timeout=5.0, poll=0.02):
        return "position"

    def _r(self, address, count=1):
        if address == gd.REG_SPEED_FB:
            return [0, 0, 0, 4000][:count]
        if address == gd.REG_TORQUE_REACHED:
            return [0, 1, 0, 1][:count]
        return [0] * count


class StubLogger:
    def __init__(self):
        self.warnings, self.errors = [], []

    def info(self, message):
        pass

    def warning(self, message):
        self.warnings.append(message)

    def error(self, message):
        self.errors.append(message)


class StubPublisher:
    def __init__(self):
        self.messages = []

    def publish(self, message):
        self.messages.append(message)


class StubNode:
    def __init__(self):
        self.logger = StubLogger()
        self.services = {}
        self.publishers = {}

    def get_logger(self):
        return self.logger

    def create_service(self, _type, name, callback):
        self.services[name] = callback
        return object()

    def create_subscription(self, *args, **kwargs):
        return object()

    def create_publisher(self, _type, name, _qos):
        self.publishers[name] = StubPublisher()
        return self.publishers[name]

    def create_timer(self, *args, **kwargs):
        return object()


@unittest.skipUnless(HAVE_ROS, "needs a ROS 2 environment with gripper_ros2_msgs built")
class ManagerNodeTest(unittest.TestCase):
    def setUp(self):
        self.original = gd.Changingtek_rtu_psdk
        gd.Changingtek_rtu_psdk = FakeSDK
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.config = Path(self.tmp.name) / "gripper.yaml"
        self.config.write_text(CONFIG, encoding="utf-8")
        self.overrides = Path(self.tmp.name) / "gripper_overrides.yaml"
        self.node = StubNode()
        self.adapter = None
        self.addCleanup(self._cleanup)

    def _cleanup(self):
        if self.adapter is not None:
            self.adapter.destroy()
        gd.Changingtek_rtu_psdk = self.original

    def start(self):
        self.adapter = gmn.GripperManagerNode(self.node, str(self.config))
        return self.adapter

    def call(self, suffix, request, response):
        return self.node.services[f"/gripper_right/{suffix}"](request, response)

    def device(self):
        return self.adapter.manager.get("gripper_right")

    def sdk_calls(self):
        return self.adapter.manager.get_bus("/dev/fake_right")._sdk.calls

    def test_initial_limits_are_published(self):
        self.start()
        messages = self.node.publishers["/gripper_right/limits"].messages
        self.assertEqual(len(messages), 1)
        self.assertEqual(
            (messages[0].open_position, messages[0].close_position,
             messages[0].min_position, messages[0].max_position),
            (4000, 8500, 0, 8500),
        )

    def test_set_limits_updates_device_file_and_topic(self):
        self.start()
        response = self.call(
            "set_limits",
            SetGripperLimits.Request(open_position=50, close_position=8400),
            SetGripperLimits.Response(),
        )
        self.assertTrue(response.success, response.message)
        self.assertEqual((response.open_position, response.close_position), (50, 8400))
        self.assertEqual((self.device().open_position, self.device().close_position), (50, 8400))
        self.assertTrue(self.overrides.is_file())
        messages = self.node.publishers["/gripper_right/limits"].messages
        self.assertEqual((messages[-1].open_position, messages[-1].close_position), (50, 8400))

    def test_set_limits_rejects_invalid_values_without_side_effects(self):
        self.start()
        response = self.call(
            "set_limits",
            SetGripperLimits.Request(open_position=8500, close_position=50),
            SetGripperLimits.Response(),
        )
        self.assertFalse(response.success)
        self.assertEqual((response.open_position, response.close_position), (4000, 8500))
        self.assertFalse(self.overrides.exists())
        self.assertEqual(len(self.node.publishers["/gripper_right/limits"].messages), 1)

    def test_overrides_are_applied_at_startup(self):
        self.overrides.write_text(
            "grippers:\n  gripper_right: {open_position: 100, close_position: 8000}\n",
            encoding="utf-8",
        )
        self.start()
        self.assertEqual((self.device().open_position, self.device().close_position), (100, 8000))
        message = self.node.publishers["/gripper_right/limits"].messages[0]
        self.assertEqual((message.open_position, message.close_position), (100, 8000))

    def test_invalid_override_is_ignored_and_logged(self):
        self.overrides.write_text(
            "grippers:\n  gripper_right: {open_position: 9000, close_position: 8500}\n",
            encoding="utf-8",
        )
        self.start()
        self.assertEqual((self.device().open_position, self.device().close_position), (4000, 8500))
        self.assertTrue(self.node.logger.errors)

    def test_move_raw_rejects_out_of_range_before_touching_the_gripper(self):
        self.start()
        response = self.call("move_raw", MoveGripperRaw.Request(position=9000), MoveGripperRaw.Response())
        self.assertFalse(response.success)
        self.assertIn("outside 0..8500", response.message)
        self.assertEqual([call for call in self.sdk_calls() if call[0] in ("enable", "temp_move")], [])

    def test_move_raw_moves_to_the_requested_position(self):
        self.start()
        response = self.call("move_raw", MoveGripperRaw.Request(position=3000), MoveGripperRaw.Response())
        self.assertTrue(response.success, response.message)
        self.assertIn(("temp_move", 3000), self.sdk_calls())


if __name__ == "__main__":
    unittest.main()
