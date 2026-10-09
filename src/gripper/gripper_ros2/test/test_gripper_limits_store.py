from pathlib import Path
import tempfile
import unittest

from gripper_ros2 import gripper_driver as gd
from gripper_ros2.gripper_limits import LimitsStore, load_overrides


RANGES = {"gripper_right": (0, 8500), "gripper_left": (0, 900)}


class LimitsStoreTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.path = Path(self.tmp.name) / "gripper_overrides.yaml"
        self.manager = gd.GripperManager()
        self.manager.add_bus("/bus")
        self.manager.add_gripper(
            "/bus", 1, name="gripper_right", open_position=4000, close_position=8500,
            min_position=0, max_position=8500,
        )
        self.manager.add_gripper(
            "/bus", 2, name="gripper_left", open_position=400, close_position=900,
            min_position=0, max_position=900,
        )
        self.store = LimitsStore(self.manager, self.path)

    def endpoints(self, name):
        device = self.manager.get(name)
        return device.open_position, device.close_position

    def test_valid_change_is_saved_and_applied(self):
        ok, message = self.store.set_limits("gripper_right", 50, 8400, now=100.0)
        self.assertTrue(ok, message)
        self.assertEqual(self.endpoints("gripper_right"), (50, 8400))
        accepted, errors = load_overrides(self.path, RANGES)
        self.assertEqual(errors, [])
        self.assertEqual(accepted["gripper_right"], {"open_position": 50, "close_position": 8400})

    def test_overrides_of_other_grippers_are_preserved(self):
        self.assertTrue(self.store.set_limits("gripper_right", 50, 8400, now=100.0)[0])
        self.assertTrue(self.store.set_limits("gripper_left", 20, 880, now=100.0)[0])
        accepted, _ = load_overrides(self.path, RANGES)
        self.assertEqual(set(accepted), {"gripper_right", "gripper_left"})

    def test_invalid_change_touches_nothing(self):
        ok, message = self.store.set_limits("gripper_right", 8500, 50, now=100.0)
        self.assertFalse(ok)
        self.assertIn("smaller", message)
        self.assertEqual(self.endpoints("gripper_right"), (4000, 8500))
        self.assertFalse(self.path.exists())

    def test_busy_gripper_is_rejected(self):
        self.manager.get_bus("/bus").request_move(1, 5000)
        ok, message = self.store.set_limits("gripper_right", 50, 8400, now=100.0)
        self.assertFalse(ok)
        self.assertIn("busy", message)
        self.assertEqual(self.endpoints("gripper_right"), (4000, 8500))
        self.assertFalse(self.path.exists())

    def test_save_failure_keeps_live_values(self):
        store = LimitsStore(self.manager, Path(self.tmp.name) / "missing" / "o.yaml")
        ok, message = store.set_limits("gripper_right", 50, 8400, now=100.0)
        self.assertFalse(ok)
        self.assertIn("Cannot save", message)
        self.assertEqual(self.endpoints("gripper_right"), (4000, 8500))
        self.assertEqual(store.overrides, {})

    def test_current_reports_endpoints_and_travel(self):
        self.assertEqual(
            self.store.current("gripper_right"),
            {"open_position": 4000, "close_position": 8500, "min_position": 0, "max_position": 8500},
        )


if __name__ == "__main__":
    unittest.main()
