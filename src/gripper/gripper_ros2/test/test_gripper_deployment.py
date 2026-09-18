from pathlib import Path
import unittest

import yaml

from gripper_ros2.gripper_config import load_gripper_config


ROOT = Path(__file__).resolve().parents[4]
MANAGER_NODE = ROOT / "src/gripper/gripper_ros2/gripper_ros2/gripper_manager_node.py"


class GripperDeploymentTest(unittest.TestCase):
    def test_manager_exposes_nonblocking_percentage_command_topic(self):
        source = MANAGER_NODE.read_text(encoding="utf-8")
        self.assertIn("std_msgs.msg.Float32", source)
        self.assertIn('f"{prefix}/percentage/command"', source)
        self.assertIn("percentage_to_position(", source)
        start = source.index("    def _percentage_command(")
        end = source.index("    def _calibrate(", start)
        command_callback = source[start:end]
        self.assertIn("self.manager.request_move(name, target)", command_callback)
        self.assertNotIn("wait_until_pos_or_torque", command_callback)

    def test_root_config_uses_three_stable_gripper_aliases(self):
        config = load_gripper_config(ROOT / "config/ros/gripper.yaml")
        ports = {bus["port"] for bus in config["buses"]}
        self.assertEqual(
            ports,
            {
                "/dev/realman/gripper_right",
                "/dev/realman/gripper_left",
                "/dev/realman/gripper_mid",
            },
        )

    def test_remote_bringup_maps_aliases_into_container(self):
        compose = yaml.safe_load((ROOT / "config/docker/compose.yaml").read_text())
        devices = compose["services"]["realman_bringup_remote"]["devices"]
        self.assertIn(
            "${REALMAN_GRIPPER_RIGHT_DEVICE:-/dev/realman/gripper_right}:/dev/realman/gripper_right",
            devices,
        )
        self.assertIn(
            "${REALMAN_GRIPPER_LEFT_DEVICE:-/dev/realman/gripper_left}:/dev/realman/gripper_left",
            devices,
        )
        self.assertIn(
            "${REALMAN_GRIPPER_MID_DEVICE:-/dev/realman/gripper_mid}:/dev/realman/gripper_mid",
            devices,
        )


if __name__ == "__main__":
    unittest.main()
