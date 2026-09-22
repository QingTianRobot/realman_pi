from pathlib import Path
import unittest

from gripper_ros2.gripper_config import (
    interface_names,
    load_gripper_config,
    percentage_to_position,
)


ROOT = Path(__file__).resolve().parents[4]


class GripperConfigTest(unittest.TestCase):
    def test_root_config_defines_compatible_device_names(self):
        config = load_gripper_config(ROOT / "config/ros/gripper.yaml")
        names = {
            item["name"]
            for bus in config["buses"]
            for item in bus["grippers"]
        }
        self.assertEqual(names, {"gripper_left", "gripper_mid", "gripper_right"})

    def test_interfaces_preserve_existing_service_paths(self):
        names = interface_names("gripper_left")
        self.assertEqual(names["percentage"], "/gripper_left/percentage")
        self.assertEqual(names["percentage_command"], "/gripper_left/percentage/command")
        self.assertEqual(names["position"], "/gripper_left/position")

    def test_percentage_maps_closed_zero_and_open_one(self):
        self.assertEqual(percentage_to_position(0.0, open_position=400, close_position=949), 949)
        self.assertEqual(percentage_to_position(1.0, open_position=400, close_position=949), 400)
        self.assertEqual(percentage_to_position(0.5, open_position=400, close_position=1000), 700)

    def test_percentage_rejects_out_of_range_values(self):
        with self.assertRaises(ValueError):
            percentage_to_position(1.1, open_position=0, close_position=9000)


if __name__ == "__main__":
    unittest.main()
